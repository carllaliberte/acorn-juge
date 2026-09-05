/**
 * acorn flux v0 — interoperability bus.
 * Mesh: every named agent may address every other, including broadcast.
 * Not a Worker canal. Not a receipt. Not LIVE. Not QUANTUM.
 *
 * Memory = GitHub comments (source of truth).
 * This module is the envelope: validate, fan-out, parse, format.
 */

export const FLUX_VERSION = "acorn.v0";

export const AGENTS = Object.freeze({
  grok: { id: "grok", name: "Grok", role: "orchestrates" },
  chatgpt: { id: "chatgpt", name: "ChatGPT", role: "challenges" },
  sonnet: { id: "sonnet", name: "Claude Sonnet 5", role: "reviews" },
  fable: { id: "fable", name: "Claude Fable 5", role: "hard review" },
  deepseek: { id: "deepseek", name: "DeepSeek", role: "independent" },
  gemini: { id: "gemini", name: "Gemini", role: "independent" },
  cursor: { id: "cursor", name: "Cursor", role: "builds" },
  ci: { id: "ci", name: "CI", role: "verifies" },
  github: { id: "github", name: "GitHub", role: "remembers" },
  worker: { id: "worker", name: "GET /juge", role: "preview canal" },
  carl: { id: "carl", name: "Carl", role: "judges" },
});

export const AGENT_IDS = Object.freeze(Object.keys(AGENTS));

export const ACTS = Object.freeze([
  "FINDING",
  "EVIDENCE",
  "RISK",
  "ACTION",
  "TEST",
  "RESULT",
  "HANDOFF",
]);

export const GRADES = Object.freeze([
  "PROPOSED",
  "CODE VERIFIED",
  "TEST VERIFIED",
  "NOT LIVE VERIFIED",
  "LIVE VERIFIED",
]);

export const HOST = "https://acorn-royal-dune-blend.grok.me";

const MODEL_IDS = new Set(["sonnet", "fable", "chatgpt", "deepseek", "gemini"]);

export function isAgent(id) {
  return Object.prototype.hasOwnProperty.call(AGENTS, String(id || ""));
}

export function isModel(id) {
  return MODEL_IDS.has(String(id || ""));
}

export function directions(from) {
  if (!isAgent(from)) return [];
  return AGENT_IDS.filter((id) => id !== from);
}

export function meshSize() {
  return AGENT_IDS.length * (AGENT_IDS.length - 1);
}

export function gradesFor(from) {
  const out = ["PROPOSED", "NOT LIVE VERIFIED"];
  if (from === "ci" || from === "carl") out.push("TEST VERIFIED");
  if (from === "github" || from === "carl") out.push("CODE VERIFIED");
  if (from === "carl") out.push("LIVE VERIFIED");
  return out;
}

function claimsQuantum(text) {
  const t = String(text || "");
  if (!/\bQUANTUM\b/.test(t)) return false;
  if (/\b(never|not|jamais|forbid|forbids|interdit|licensed)\b[\s\S]{0,80}\bQUANTUM\b/i.test(t)) {
    return false;
  }
  if (/\bQUANTUM\b[\s\S]{0,80}\b(never|not|jamais|interdit|not licensed|is not licensed)/i.test(t)) {
    return false;
  }
  return true;
}

function claimsNewHost(text) {
  return /second\s+\*\.grok\.me|new\s+\*\.grok\.me|invent(?:s|ing)?\s+another\s+\*\.grok\.me/i.test(
    String(text || ""),
  );
}

function claimsAttestCanal(text) {
  return /create(?:s|ing)?\s+(?:a\s+)?(?:POST\s+)?\/attest\b/i.test(String(text || ""));
}

function claimsDeploy(text, act) {
  if (act !== "ACTION" && act !== "RESULT") return false;
  return /wrangler\s+deploy/i.test(String(text || ""));
}

function fail(code, error) {
  return { ok: false, code, error };
}

function clipBody(body) {
  return String(body ?? "").slice(0, 8000);
}

function newId() {
  return `flux_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Accept one envelope. Fail-closed. Never mint LIVE on the vitrine.
 * @param {unknown} input
 */
export function accept(input) {
  const raw = input && typeof input === "object" ? input : {};
  const version = raw.flux == null || raw.flux === "" ? FLUX_VERSION : String(raw.flux);
  if (version !== FLUX_VERSION) {
    return fail("FLUX_VERSION", `flux must be ${FLUX_VERSION}`);
  }
  const from = String(raw.from || "").toLowerCase();
  const to = String(raw.to || "").toLowerCase();
  const act = String(raw.act || "").toUpperCase();
  const grade = String(raw.grade || "PROPOSED").toUpperCase();
  const body = clipBody(raw.body);
  if (!isAgent(from)) return fail("UNKNOWN_AGENT", `unknown from: ${from || "(empty)"}`);
  if (to !== "*" && !isAgent(to)) return fail("UNKNOWN_AGENT", `unknown to: ${to || "(empty)"}`);
  if (!ACTS.includes(act)) return fail("UNKNOWN_ACT", `unknown act: ${act || "(empty)"}`);
  if (!GRADES.includes(grade)) return fail("UNKNOWN_GRADE", `unknown grade: ${grade}`);
  if (!body.trim()) return fail("BODY_MISSING", "body is required");
  if (grade === "LIVE VERIFIED" && from !== "carl") {
    return fail("LIVE_NOT_CARL", "LIVE VERIFIED is Carl only. No model declares LIVE.");
  }
  if (grade === "CODE VERIFIED" && from !== "github" && from !== "carl") {
    return fail("CODE_NOT_MEMORY", "CODE VERIFIED is GitHub (on main) or Carl.");
  }
  if (grade === "TEST VERIFIED" && from !== "ci" && from !== "carl") {
    return fail("TEST_NOT_CI", "TEST VERIFIED is CI or Carl.");
  }
  if (from === to && to !== "*") {
    return fail("NO_LOOP", "from and to must differ (use to:* to broadcast)");
  }
  if (claimsQuantum(body)) {
    return fail("FORBIDDEN_QUANTUM", "QUANTUM is not licensed here. Preview ≠ receipt.");
  }
  if (claimsNewHost(body)) {
    return fail("FORBIDDEN_HOST", "Unique host only: acorn-royal-dune-blend.grok.me");
  }
  if (claimsAttestCanal(body)) {
    return fail("FORBIDDEN_ATTEST", "POST /attest is not this canal.");
  }
  if (claimsDeploy(body, act) && from !== "carl") {
    return fail("FORBIDDEN_DEPLOY", "wrangler deploy is Carl only. Flux does not deploy.");
  }
  const allowed = gradesFor(from);
  if (!allowed.includes(grade)) {
    return fail("GRADE_NOT_FOR_AGENT", `${from} cannot claim ${grade}`);
  }

  const packet = {
    flux: FLUX_VERSION,
    id: String(raw.id || newId()),
    ts: String(raw.ts || new Date().toISOString()),
    from,
    to,
    act,
    grade,
    body: body.trim(),
    replyTo: raw.replyTo ? String(raw.replyTo) : null,
    preview: true,
    receipt: false,
    host: HOST,
  };
  return { ok: true, packet };
}

export function fanout(packet) {
  if (!packet || packet.to !== "*") return [packet];
  return directions(packet.from).map((to) => ({
    ...packet,
    id: `${packet.id}_${to}`,
    to,
  }));
}

/**
 * Parse a GitHub comment into a flux draft (not yet accept()).
 * Accepts:
 *   FLUX from:grok to:chatgpt act:HANDOFF grade:PROPOSED
 *   /flux to:chatgpt from:sonnet
 *   /flux to:*
 */
export function parseFlux(text = "") {
  const src = String(text || "");
  const header = src.match(
    /(?:^|\n)\s*FLUX\s+from:(\w+)\s+to:(\w+|\*)\s+act:(\w+)\s+grade:([^\n]+)/i,
  );
  const hasCmd = /(?:^|\s)\/flux(?=[\s,;:!?.)]|$)/i.test(src);
  if (!header && !hasCmd) return null;

  const fromMatch = src.match(/(?:from:|from\s+)(\w+)/i);
  const toMatch = src.match(/(?:to:|to\s+)(\w+|\*)/i);
  const actMatch = src.match(/(?:act:|act\s+)(\w+)/i);
  const gradeMatch = src.match(/(?:grade:\s*)([^\n]+)/i);

  const from = (header ? header[1] : fromMatch?.[1] || "github").toLowerCase();
  const to = (header ? header[2] : toMatch?.[1] || "*").toLowerCase();
  const act = (header ? header[3] : actMatch?.[1] || "HANDOFF").toUpperCase();
  const grade = (header ? header[4] : gradeMatch?.[1] || "PROPOSED").trim().toUpperCase();

  const stripped = src
    .replace(/^\s*FLUX\s+from:\w+\s+to:(?:\w+|\*)\s+act:\w+\s+grade:[^\n]+\n?/im, "")
    .replace(/(?:^|\s)\/flux(?:\s+(?:from|to|act|grade):[^\s]+)*/gi, "")
    .trim();

  return {
    flux: FLUX_VERSION,
    from,
    to,
    act,
    grade,
    body: stripped || src.trim(),
  };
}

export function formatEnvelope(packet) {
  const p = packet && typeof packet === "object" ? packet : {};
  const lines = [
    `FLUX from:${p.from} to:${p.to} act:${p.act} grade:${p.grade}`,
    "",
    String(p.body || "").trim(),
    "",
    `_flux ${FLUX_VERSION} · preview:true · receipt:false · not LIVE_VERIFIED_`,
  ];
  return lines.join("\n");
}

export function modelsForDestination(to) {
  if (to === "*" || to == null || to === "") {
    return ["sonnet", "chatgpt", "deepseek", "gemini"];
  }
  if (isModel(to)) return [to];
  return [];
}

export const SEED = Object.freeze([
  {
    from: "grok",
    to: "chatgpt",
    act: "HANDOFF",
    grade: "PROPOSED",
    body: "Challenge the flux mesh. Every agent is addressable in both directions. Worker stays GET /juge. Unique host only.",
  },
  {
    from: "chatgpt",
    to: "grok",
    act: "RISK",
    grade: "PROPOSED",
    body: "A mesh that is not on GitHub is theatre. Keep envelopes in comments. Do not bind /flux on the Worker. Do not declare LIVE.",
  },
  {
    from: "sonnet",
    to: "fable",
    act: "FINDING",
    grade: "PROPOSED",
    body: "Swarm today is Action → models → GitHub. Flux adds from/to so a review can answer another review. Fable stays on-demand.",
  },
  {
    from: "cursor",
    to: "ci",
    act: "ACTION",
    grade: "PROPOSED",
    body: "Add test/flux.test.js. Do not replace juge.yml. npm test remains the lock.",
  },
  {
    from: "ci",
    to: "github",
    act: "RESULT",
    grade: "NOT LIVE VERIFIED",
    body: "Tests speak for a SHA. They do not bind /juge on the vitrine. HTML 404 on GET /juge remains.",
  },
  {
    from: "github",
    to: "carl",
    act: "HANDOFF",
    grade: "NOT LIVE VERIFIED",
    body: "Memory holds PRs #6 #7 #8 #10. Flux is PROPOSED. Merge and wrangler stay yours. No model deploys.",
  },
  {
    from: "worker",
    to: "grok",
    act: "EVIDENCE",
    grade: "PROPOSED",
    body: "GET /juge physics unchanged: preview true, receipt false, ε split named, calendar day, never QUANTUM.",
  },
]);
