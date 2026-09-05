/**
 * acorn flux v0 — chef mesh.
 * Grok is chef. Grok writes in flux/ directories.
 * Other AIs connect for the future. Not a Worker canal. Not LIVE. Not QUANTUM.
 */

export const FLUX_VERSION = "acorn.v0";
export const CHEF = "grok";
export const HOST = "https://acorn-royal-dune-blend.grok.me";
export const GUEST_CAP = 8;

export const AGENTS = Object.freeze({
  grok: { id: "grok", name: "Grok", role: "chef", kind: "chef" },
  chatgpt: { id: "chatgpt", name: "ChatGPT", role: "challenges", kind: "model" },
  sonnet: { id: "sonnet", name: "Claude Sonnet 5", role: "reviews", kind: "model" },
  fable: { id: "fable", name: "Claude Fable 5", role: "hard review", kind: "model" },
  deepseek: { id: "deepseek", name: "DeepSeek", role: "independent", kind: "model" },
  gemini: { id: "gemini", name: "Gemini", role: "independent", kind: "model" },
  cursor: { id: "cursor", name: "Cursor", role: "builds", kind: "seat" },
  ci: { id: "ci", name: "CI", role: "verifies", kind: "seat" },
  github: { id: "github", name: "GitHub", role: "remembers", kind: "seat" },
  worker: { id: "worker", name: "GET /juge", role: "preview canal", kind: "seat" },
  carl: { id: "carl", name: "Carl", role: "judges", kind: "seat" },
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

export const MODES = Object.freeze([
  "PROPOSITION",
  "CONSULTATION",
  "ECHANGE",
  "CHALLENGE",
]);

export const GRADES = Object.freeze([
  "PROPOSED",
  "CODE VERIFIED",
  "TEST VERIFIED",
  "NOT LIVE VERIFIED",
  "LIVE VERIFIED",
]);

/** Future AIs. Not core. Connect when Carl wants them on the mesh. */
export const SUGGESTED_GUESTS = Object.freeze([
  { id: "copilot", name: "GitHub Copilot", role: "guest review" },
  { id: "llama", name: "Llama", role: "open guest" },
  { id: "mistral", name: "Mistral", role: "open guest" },
  { id: "qwen", name: "Qwen", role: "open guest" },
  { id: "opus", name: "Claude Opus", role: "guest review" },
]);

const MODEL_IDS = new Set(["sonnet", "fable", "chatgpt", "deepseek", "gemini"]);
const RESERVED = new Set([
  "attest",
  "quantum",
  "live",
  "wrangler",
  "admin",
  "root",
  "chef",
  "*",
]);
const ID_RE = /^[a-z][a-z0-9-]{1,24}$/;

/** @type {Map<string, { id: string, name: string, role: string, kind: "guest" }>} */
const GUESTS = new Map();

export function resetGuests() {
  GUESTS.clear();
}

export function roster() {
  return [...Object.values(AGENTS), ...GUESTS.values()];
}

export function rosterIds() {
  return roster().map((a) => a.id);
}

export function lookup(id) {
  const key = String(id || "").toLowerCase();
  return AGENTS[key] || GUESTS.get(key) || null;
}

export function isAgent(id) {
  return lookup(id) != null;
}

export function isModel(id) {
  const row = lookup(id);
  if (!row) return false;
  if (row.kind === "guest") return true;
  return MODEL_IDS.has(row.id);
}

export function isChef(id) {
  return String(id || "").toLowerCase() === CHEF;
}

export function directions(from) {
  if (!isAgent(from)) return [];
  return rosterIds().filter((id) => id !== from);
}

export function meshSize() {
  const n = rosterIds().length;
  return n * (n - 1);
}

export function gradesFor(from) {
  const out = ["PROPOSED", "NOT LIVE VERIFIED"];
  if (from === "ci" || from === "carl") out.push("TEST VERIFIED");
  if (from === "github" || from === "carl") out.push("CODE VERIFIED");
  if (from === "carl") out.push("LIVE VERIFIED");
  return out;
}

export function pathFor(packet) {
  const mode = String(packet?.mode || "ECHANGE").toLowerCase();
  const from = String(packet?.from || "grok").toLowerCase();
  const to = packet?.to === "*" ? "all" : String(packet?.to || "github").toLowerCase();
  return `flux/${mode}/${from}-to-${to}.md`;
}

function fail(code, error) {
  return { ok: false, code, error };
}

export function connectAgent(spec) {
  const raw = spec && typeof spec === "object" ? spec : {};
  const id = String(raw.id || "").toLowerCase().trim();
  if (!ID_RE.test(id)) return fail("BAD_ID", "id must be [a-z][a-z0-9-]{1,24}");
  if (RESERVED.has(id)) return fail("RESERVED_ID", `${id} is reserved`);
  if (AGENTS[id]) return fail("CORE_LOCKED", `${id} is a core seat`);
  if (GUESTS.has(id)) return fail("ALREADY", `${id} is already connected`);
  if (GUESTS.size >= GUEST_CAP) return fail("ROSTER_FULL", `at most ${GUEST_CAP} guest AIs`);
  const name = String(raw.name || id).slice(0, 40);
  const role = String(raw.role || "guest").slice(0, 40);
  const row = { id, name, role, kind: "guest" };
  GUESTS.set(id, row);
  return { ok: true, agent: row };
}

export function disconnectAgent(id) {
  const key = String(id || "").toLowerCase();
  if (AGENTS[key]) return fail("CORE_LOCKED", `${key} cannot leave`);
  if (!GUESTS.has(key)) return fail("UNKNOWN_AGENT", `unknown ${key}`);
  GUESTS.delete(key);
  return { ok: true, id: key };
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

function clipBody(body) {
  return String(body ?? "").slice(0, 8000);
}

function newId() {
  return `flux_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function modeOk(mode, from, to) {
  if (mode === "PROPOSITION" && from !== CHEF) {
    return fail("MODE_CHEF", "PROPOSITION is Grok chef only");
  }
  if (mode === "CONSULTATION") {
    if (from !== CHEF) return fail("MODE_CHEF", "CONSULTATION is Grok chef only");
    if (to === "*") return fail("MODE_ONE", "CONSULTATION addresses one AI");
  }
  if (mode === "CHALLENGE" && from !== CHEF && to !== CHEF) {
    return fail("MODE_GROK", "CHALLENGE must include Grok");
  }
  return { ok: true };
}

/**
 * Accept one envelope. Fail-closed. Chef files it under flux/.
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
  const mode = String(raw.mode || "ECHANGE").toUpperCase();
  const grade = String(raw.grade || "PROPOSED").toUpperCase();
  const body = clipBody(raw.body);
  if (!isAgent(from)) return fail("UNKNOWN_AGENT", `unknown from: ${from || "(empty)"}`);
  if (to !== "*" && !isAgent(to)) return fail("UNKNOWN_AGENT", `unknown to: ${to || "(empty)"}`);
  if (!ACTS.includes(act)) return fail("UNKNOWN_ACT", `unknown act: ${act || "(empty)"}`);
  if (!MODES.includes(mode)) return fail("UNKNOWN_MODE", `unknown mode: ${mode}`);
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
  const locked = modeOk(mode, from, to);
  if (!locked.ok) return locked;

  const packet = {
    flux: FLUX_VERSION,
    id: String(raw.id || newId()),
    ts: String(raw.ts || new Date().toISOString()),
    chef: CHEF,
    from,
    to,
    act,
    mode,
    grade,
    body: body.trim(),
    replyTo: raw.replyTo ? String(raw.replyTo) : null,
    path: "",
    preview: true,
    receipt: false,
    host: HOST,
  };
  packet.path = pathFor(packet);
  return { ok: true, packet };
}

export function fanout(packet) {
  if (!packet || packet.to !== "*") return [packet];
  return directions(packet.from).map((to) => {
    const row = { ...packet, id: `${packet.id}_${to}`, to };
    row.path = pathFor(row);
    return row;
  });
}

/** Chef files the broadcast itself, then each directed copy. */
export function filePackets(packet) {
  if (!packet) return [];
  if (packet.to !== "*") return [packet];
  return [packet, ...fanout(packet)];
}

export function fileTree(packets = []) {
  const tree = { proposition: [], consultation: [], echange: [], challenge: [] };
  for (const p of packets) {
    const key = String(p.mode || "ECHANGE").toLowerCase();
    if (!tree[key]) tree[key] = [];
    tree[key].push({
      path: p.path || pathFor(p),
      from: p.from,
      to: p.to,
      act: p.act,
    });
  }
  return tree;
}

/**
 * Chef memory: one markdown file per canal. Later packets on the same path append.
 * @param {Array<{ path?: string, mode?: string, from?: string, to?: string, act?: string, grade?: string, body?: string }>} packets
 */
export function materialize(packets = []) {
  /** @type {Record<string, string>} */
  const files = {};
  for (const p of packets) {
    const path = p.path || pathFor(p);
    const block = formatEnvelope(p);
    files[path] = files[path] ? `${files[path]}\n\n---\n\n${block}` : block;
  }
  return files;
}

/**
 * Parse a GitHub comment into a flux draft (not yet accept()).
 */
export function parseFlux(text = "") {
  const src = String(text || "");
  const hasHeader = /(?:^|\n)\s*FLUX\b/i.test(src);
  const hasCmd = /(?:^|\s)\/flux(?=[\s,;:!?.)]|$)/i.test(src);
  if (!hasHeader && !hasCmd) return null;

  const kv = {};
  const re = /(\w+):([^\s]+)/g;
  let m;
  while ((m = re.exec(src))) kv[m[1].toLowerCase()] = m[2];

  const from = String(kv.from || "github").toLowerCase();
  const to = String(kv.to || "*").toLowerCase();
  const act = String(kv.act || "HANDOFF").toUpperCase();
  const mode = String(kv.mode || "ECHANGE").toUpperCase();
  const grade = String(kv.grade || "PROPOSED").replace(/_/g, " ").toUpperCase();

  const stripped = src
    .replace(/^\s*FLUX\b[^\n]*\n?/im, "")
    .replace(/(?:^|\s)\/flux(?:\s+\S+)*/gi, "")
    .replace(/^\s*path:\s*\S+\s*$/gim, "")
    .replace(/^\s*chef:\s*\S+\s*$/gim, "")
    .trim();

  return {
    flux: FLUX_VERSION,
    from,
    to,
    act,
    mode,
    grade,
    body: stripped || src.trim(),
  };
}

export function formatEnvelope(packet) {
  const p = packet && typeof packet === "object" ? packet : {};
  const path = p.path || pathFor(p);
  return [
    `FLUX from:${p.from} to:${p.to} act:${p.act} mode:${p.mode || "ECHANGE"} grade:${p.grade}`,
    `path: ${path}`,
    `chef: ${CHEF}`,
    "",
    String(p.body || "").trim(),
    "",
    `_flux ${FLUX_VERSION} · chef:${CHEF} · preview:true · receipt:false · not LIVE_VERIFIED_`,
  ].join("\n");
}

export function modelsForDestination(to) {
  if (to === "*" || to == null || to === "") {
    return ["sonnet", "chatgpt", "deepseek", "gemini"];
  }
  if (isModel(to) && lookup(to)?.kind !== "guest") return [to];
  if (lookup(to)?.kind === "guest") return [];
  return [];
}

export const SEED = Object.freeze([
  {
    from: "grok",
    to: "*",
    act: "HANDOFF",
    mode: "PROPOSITION",
    grade: "PROPOSED",
    body: "Grok chef proposes the mesh. Every connected AI may answer. Worker stays GET /juge. Never QUANTUM.",
  },
  {
    from: "grok",
    to: "chatgpt",
    act: "FINDING",
    mode: "CONSULTATION",
    grade: "PROPOSED",
    body: "Consult: is GitHub memory enough, or must chef write flux/ files in the repo? Unique host only.",
  },
  {
    from: "chatgpt",
    to: "grok",
    act: "RISK",
    mode: "CHALLENGE",
    grade: "PROPOSED",
    body: "Challenge: a sandbox mesh is not LIVE. Do not bind /flux on the Worker. Do not wrangler from this packet.",
  },
  {
    from: "sonnet",
    to: "grok",
    act: "HANDOFF",
    mode: "ECHANGE",
    grade: "PROPOSED",
    body: "Exchange: Fable stays on-demand. Future AIs connect as guests. Core seats stay locked.",
  },
  {
    from: "cursor",
    to: "ci",
    act: "ACTION",
    mode: "ECHANGE",
    grade: "PROPOSED",
    body: "Add flux guest + mode tests. Do not replace juge.yml. npm test remains the lock.",
  },
  {
    from: "github",
    to: "carl",
    act: "HANDOFF",
    mode: "ECHANGE",
    grade: "NOT LIVE VERIFIED",
    body: "Chef writes under flux/. Merge and wrangler stay yours. No model deploys.",
  },
]);
