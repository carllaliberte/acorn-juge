#!/usr/bin/env node
/**
 * Swarm review for acorn-juge. Complementary, not a judge.
 * Fail-closed: missing keys skip. Never merge. Never wrangler.
 * Gemini auto ($0). Grok-2 (xAI) on-demand. Per-model timeout/retry. 503 = dated skip.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  accept as acceptFlux,
  formatEnvelope,
  modelsForDestination,
  parseFlux,
} from "./flux.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = join(HERE, "prompt.md");

export const OPENROUTER_ROUTES = Object.freeze({
  gemini: "google/gemini-2.5-flash",
});

export const XAI_FALLBACK = Object.freeze(["grok-2", "grok-2-mini"]);

export const MODELS = Object.freeze({
  sonnet: {
    id: "sonnet",
    label: "Claude Sonnet 5",
    model: "claude-sonnet-5",
    provider: "anthropic",
    secret: "ANTHROPIC_API_KEY",
    auto: false,
    maxTokens: 2048,
    timeoutMs: 8000,
    retries: 1,
  },
  fable: {
    id: "fable",
    label: "Claude Fable 5",
    model: "claude-fable-5",
    provider: "anthropic",
    secret: "ANTHROPIC_API_KEY",
    auto: false,
    maxTokens: 8192,
    timeoutMs: 12000,
    retries: 0,
  },
  chatgpt: {
    id: "chatgpt",
    label: "ChatGPT",
    model: "gpt-5.6-terra",
    provider: "openai",
    secret: "OPENAI_API_KEY",
    auto: false,
    timeoutMs: 8000,
    retries: 1,
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    model: "deepseek-v4-flash",
    provider: "deepseek",
    secret: "DEEPSEEK_API_KEY",
    auto: false,
    timeoutMs: 8000,
    retries: 1,
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    model: "gemini-3.8-flash",
    provider: "gemini",
    secret: "GEMINI_API_KEY",
    auto: true,
    timeoutMs: 8000,
    retries: 1,
  },
  xai: {
    id: "xai",
    label: "xAI Grok-2",
    model: "grok-2",
    provider: "xai",
    secret: "XAI_API_KEY",
    auto: false,
    maxTokens: 2048,
    timeoutMs: 8000,
    retries: 1,
  },
});

const TRIGGERS = {
  "/swarm": ["gemini"],
  "/sonnet": ["sonnet"],
  "/fable": ["fable"],
  "/fabre": ["fable"],
  "/chatgpt": ["chatgpt"],
  "/deepseek": ["deepseek"],
  "/gemini": ["gemini"],
  "/xai": ["xai"],
};

function autoIds() {
  return Object.values(MODELS)
    .filter((m) => m.auto)
    .map((m) => m.id);
}

/** Slash commands as tokens, not path fragments (`.github/swarm/...` is not `/swarm`). */
export function commandsIn(text = "") {
  const wanted = [];
  const seen = new Set();
  const src = String(text || "");
  for (const [cmd, ids] of Object.entries(TRIGGERS)) {
    const escaped = cmd.replace("/", "\\/");
    const re = new RegExp(`(?:^|\\s)${escaped}(?=[\\s,;:!?.)]|$)`, "i");
    if (re.test(src)) {
      for (const id of ids) {
        if (!seen.has(id)) {
          seen.add(id);
          wanted.push(id);
        }
      }
    }
  }
  return wanted;
}

export function parseTrigger(
  commentBody = "",
  labels = [],
  event = "pull_request",
  action = "",
  addedLabel = "",
) {
  const wanted = new Set(commandsIn(commentBody));
  const labelNames = (labels || []).map((l) =>
    String(typeof l === "string" ? l : l.name || "").toLowerCase(),
  );
  const extra = String(addedLabel || "").toLowerCase();
  if (
    labelNames.includes("fable") ||
    labelNames.includes("fabre") ||
    extra === "fable" ||
    extra === "fabre"
  ) {
    wanted.add("fable");
  }
  if (wanted.size > 0) return [...wanted];
  if (action === "labeled") return [];
  if (event === "issue_comment") return [];
  return autoIds();
}

/** Flux addressing takes precedence. /flux to:chatgpt runs ChatGPT only. */
export function idsForComment(
  commentBody = "",
  labels = [],
  event = "pull_request",
  action = "",
  addedLabel = "",
) {
  const flux = parseFlux(commentBody);
  if (flux) return { flux, ids: modelsForDestination(flux.to) };
  return {
    flux: null,
    ids: parseTrigger(commentBody, labels, event, action, addedLabel),
  };
}

export function addressResult(result, to = "github") {
  if (!result || result.skipped || result.error || !result.text) return result;
  const from = result.id;
  const mode = from === "grok" || to === "grok" ? "CHALLENGE" : "ECHANGE";
  const r = acceptFlux({
    from,
    to,
    act: "FINDING",
    mode,
    grade: "PROPOSED",
    body: result.text,
  });
  if (!r.ok) return { ...result, text: sanitizeReview(result.text) };
  return { ...result, text: formatEnvelope(r.packet) };
}

export function keyedModels(ids, env = process.env) {
  const run = [];
  const skip = [];
  const orKey = String(env.OPENROUTER_API_KEY || "").trim();
  for (const id of ids) {
    const spec = MODELS[id];
    if (!spec) continue;
    const native = String(env[spec.secret] || "").trim();
    if (native) {
      run.push(spec);
      continue;
    }
    if (orKey && OPENROUTER_ROUTES[id]) {
      run.push({ ...spec, via: "openrouter", model: OPENROUTER_ROUTES[id] });
      continue;
    }
    skip.push({ id, reason: `missing ${spec.secret}` });
  }
  return { run, skip };
}

export function isQuotaOrMissing(err) {
  const m = String(err && err.message ? err.message : err);
  return /\b(400|402|403|404|429|503)\b/.test(m);
}

export function withTimeout(promise, ms, label) {
  const n = Number(ms) > 0 ? Number(ms) : 8000;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timeout ${n}ms`)), n);
    }),
  ]);
}

export function loadPrompt() {
  return readFileSync(PROMPT_PATH, "utf8");
}

export function buildUserMessage({ title, body, diff, files }) {
  const fileList = (files || []).map((f) => `- ${f}`).join("\n") || "(none)";
  const clipped = String(diff || "").slice(0, 80_000);
  return [
    `PR title: ${title || "(untitled)"}`,
    "",
    "PR body:",
    body || "(empty)",
    "",
    "Changed files:",
    fileList,
    "",
    "Diff:",
    "```",
    clipped || "(empty diff)",
    "```",
  ].join("\n");
}

const FORBIDDEN = /\bQUANTUM\b|\bLIVE VERIFIED\b|wrangler deploy|second \*\.grok\.me/i;

export function sanitizeReview(text) {
  const raw = String(text || "").trim() || "(empty review)";
  if (!FORBIDDEN.test(raw)) return raw;
  return (
    raw +
    "\n\n_Swarm note: this canal forbids QUANTUM, LIVE VERIFIED, wrangler deploy, and a second grok.me. Carl judges._"
  );
}

async function postJson(url, { headers, body }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json, text };
}

async function callAnthropic(spec, system, user, key) {
  const { ok, status, json } = await postJson(
    "https://api.anthropic.com/v1/messages",
    {
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: {
        model: spec.model,
        max_tokens: spec.maxTokens || 2048,
        system,
        messages: [{ role: "user", content: user }],
      },
    },
  );
  if (!ok) throw new Error(`anthropic ${status}: ${JSON.stringify(json).slice(0, 400)}`);
  const block = (json.content || []).find((c) => c.type === "text");
  return block?.text || "";
}

async function callOpenAI(spec, system, user, key) {
  const { ok, status, json } = await postJson(
    "https://api.openai.com/v1/chat/completions",
    {
      headers: { authorization: `Bearer ${key}` },
      body: {
        model: spec.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      },
    },
  );
  if (!ok) throw new Error(`openai ${status}: ${JSON.stringify(json).slice(0, 400)}`);
  return json.choices?.[0]?.message?.content || "";
}

async function callDeepSeek(spec, system, user, key) {
  const { ok, status, json } = await postJson(
    "https://api.deepseek.com/chat/completions",
    {
      headers: { authorization: `Bearer ${key}` },
      body: {
        model: spec.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      },
    },
  );
  if (!ok) throw new Error(`deepseek ${status}: ${JSON.stringify(json).slice(0, 400)}`);
  return json.choices?.[0]?.message?.content || "";
}

async function callGemini(spec, system, user, key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${spec.model}:generateContent?key=${encodeURIComponent(key)}`;
  const { ok, status, json } = await postJson(url, {
    body: {
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
    },
  });
  if (!ok) throw new Error(`gemini ${status}: ${JSON.stringify(json).slice(0, 400)}`);
  const parts = json.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("\n");
}

async function callOpenRouter(spec, system, user, key) {
  const { ok, status, json } = await postJson("https://openrouter.ai/api/v1/chat/completions", {
    headers: {
      authorization: `Bearer ${key}`,
      "http-referer": "https://github.com/carllaliberte/acorn-juge",
    },
    body: {
      model: spec.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    },
  });
  if (!ok) throw new Error(`openrouter ${spec.id} ${status}: ${JSON.stringify(json).slice(0, 400)}`);
  return json.choices?.[0]?.message?.content || "";
}

async function callXai(spec, system, user, key) {
  let last = null;
  for (const slug of XAI_FALLBACK) {
    try {
      const { ok, status, json } = await postJson("https://api.x.ai/v1/chat/completions", {
        headers: { authorization: `Bearer ${key}` },
        body: {
          model: slug,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        },
      });
      if (ok) return json.choices?.[0]?.message?.content || "";
      last = new Error(`xai ${status}: ${JSON.stringify(json).slice(0, 400)}`);
      if (!isQuotaOrMissing(last)) throw last;
    } catch (err) {
      last = err;
      if (!isQuotaOrMissing(err)) throw err;
    }
  }
  throw last || new Error("xai unavailable");
}

const CALLERS = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  deepseek: callDeepSeek,
  gemini: callGemini,
  xai: callXai,
};

export async function reviewOne(spec, system, user, env = process.env) {
  const native = String(env[spec.secret] || "").trim();
  const orKey = String(env.OPENROUTER_API_KEY || "").trim();
  const viaOpenRouter = spec.via === "openrouter" || (!native && orKey && OPENROUTER_ROUTES[spec.id]);
  const key = viaOpenRouter ? orKey : native;
  if (!key) return { id: spec.id, skipped: true, reason: `missing ${spec.secret}` };
  const fn = viaOpenRouter ? callOpenRouter : CALLERS[spec.provider];
  const retries = Number(spec.retries) >= 0 ? Number(spec.retries) : 1;
  const timeoutMs = Number(spec.timeoutMs) > 0 ? Number(spec.timeoutMs) : 8000;
  let lastErr = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const text = sanitizeReview(
        await withTimeout(fn(spec, system, user, key), timeoutMs, spec.id),
      );
      return { id: spec.id, label: spec.label, model: spec.model, text };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (isQuotaOrMissing(lastErr)) break;
    }
  }
  const message = lastErr ? lastErr.message : "unknown error";
  if (isQuotaOrMissing(lastErr)) {
    return {
      id: spec.id,
      label: spec.label,
      model: spec.model,
      skipped: true,
      reason: `dated skip ${new Date().toISOString()} — ${message.slice(0, 180)}`,
    };
  }
  return {
    id: spec.id,
    label: spec.label,
    model: spec.model,
    error: message,
  };
}

export function formatComment({ run, skip, results }) {
  const lines = [
    "## Swarm review — complementary, not a judgment",
    "",
    "Carl judges. These models do not merge, deploy, or bind `/juge`.",
    "CODE VERIFIED ≠ TEST VERIFIED ≠ LIVE VERIFIED.",
    "",
  ];
  for (const r of results) {
    lines.push(`### ${r.label || r.id} (\`${r.model || r.id}\`)`);
    if (r.skipped) lines.push(`Skipped — ${r.reason}`);
    else if (r.error) lines.push(`Provider error — \`${r.error.slice(0, 300)}\``);
    else lines.push(r.text);
    lines.push("");
  }
  if (skip.length) {
    lines.push("### Skipped (fail-closed)");
    for (const s of skip) lines.push(`- \`${s.id}\`: ${s.reason}`);
    lines.push("");
  }
  if (!run.length && skip.length) {
    lines.push(
      "No provider keys in Actions secrets. Carl adds `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `GEMINI_API_KEY` (Fable uses the Anthropic key, on `/fable` only).",
    );
  }
  lines.push("_Prompt: `.github/swarm/prompt.md`. Workflow does not replace `npm test`._");
  return lines.join("\n");
}

async function gh(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`github ${res.status} ${path}: ${JSON.stringify(json).slice(0, 400)}`);
  return json;
}

function prNumberFromEvent(env = process.env) {
  if (env.PR_NUMBER) return String(env.PR_NUMBER);
  try {
    const ev = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8"));
    return String(
      ev.pull_request?.number ||
        (ev.issue?.pull_request ? ev.issue.number : "") ||
        "",
    );
  } catch {
    return "";
  }
}

export function eventMeta(env = process.env) {
  const fallback = {
    event: env.GITHUB_EVENT_NAME || "pull_request",
    action: "",
    comment: env.SWARM_COMMENT || "",
    labels: [],
    label: "",
  };
  try {
    const ev = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8"));
    return {
      event: env.GITHUB_EVENT_NAME || fallback.event,
      action: String(ev.action || ""),
      comment: ev.comment?.body || fallback.comment,
      labels: ev.pull_request?.labels || ev.issue?.labels || [],
      label: ev.label?.name || "",
    };
  } catch {
    return fallback;
  }
}

export async function main(env = process.env) {
  const token = env.GITHUB_TOKEN;
  const repo = env.GITHUB_REPOSITORY; // owner/name
  const pr = prNumberFromEvent(env);
  const meta = eventMeta(env);
  const routed = idsForComment(
    meta.comment,
    meta.labels,
    meta.event,
    meta.action,
    meta.label,
  );
  const ids = routed.ids;
  if (!ids.length) {
    if (routed.flux) {
      const accepted = acceptFlux(routed.flux);
      const body = accepted.ok
        ? formatEnvelope(accepted.packet)
        : `FLUX refused: ${accepted.code} — ${accepted.error}`;
      if (token && repo && pr) {
        const [owner, name] = repo.split("/");
        await gh(`/repos/${owner}/${name}/issues/${pr}/comments`, {
          method: "POST",
          token,
          body: { body },
        });
      } else {
        console.log(body);
      }
      console.log("flux stored (no model destination)");
      return 0;
    }
    console.log("swarm skip (no trigger)");
    return 0;
  }
  const { run, skip } = keyedModels(ids, env);

  if (!run.length) {
    console.log("swarm skip (no keys)");
    return 0;
  }

  let title = env.PR_TITLE || "";
  let body = env.PR_BODY || "";
  let files = [];
  let diff = env.PR_DIFF || "";

  if (token && repo && pr) {
    const [owner, name] = repo.split("/");
    const pull = await gh(`/repos/${owner}/${name}/pulls/${pr}`, { token });
    title = pull.title || title;
    body = pull.body || body;
    const fileRows = await gh(`/repos/${owner}/${name}/pulls/${pr}/files?per_page=100`, {
      token,
    });
    files = (fileRows || []).map((f) => f.filename);
    diff = (fileRows || [])
      .map((f) => `--- ${f.filename}\n${f.patch || ""}`)
      .join("\n\n");
  }

  const system = loadPrompt();
  let user = buildUserMessage({ title, body, diff, files });
  if (routed.flux) {
    user =
      `You are addressed on the flux mesh as ${routed.flux.to} by ${routed.flux.from} (${routed.flux.act}, ${routed.flux.grade}). Reply in FINDING / EVIDENCE / RISK / ACTION / TEST / RESULT / HANDOFF. You may address any named agent. Do not declare LIVE. Do not say QUANTUM. Do not wrangler deploy. Flux is not a Worker canal.\n\n` +
      user;
  }
  const dest = routed.flux?.from || "github";
  const results = await Promise.all(
    run.map(async (spec) => {
      const one = await reviewOne(spec, system, user, env);
      return routed.flux ? addressResult(one, dest) : one;
    }),
  );
  const useful = results.filter((r) => r && !r.skipped && !r.error && r.text);
  if (!useful.length) {
    console.log("swarm skip (quota or empty)");
    return 0;
  }
  const text = formatComment({ run, skip, results });
  if (token && repo && pr) {
    const [owner, name] = repo.split("/");
    await gh(`/repos/${owner}/${name}/issues/${pr}/comments`, {
      method: "POST",
      token,
      body: { body: text },
    });
  } else {
    console.log(text);
  }
  return 0;
}

const isMain =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error(err);
      process.exit(0);
    },
  );
}
