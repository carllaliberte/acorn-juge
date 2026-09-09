/**
 * COLLECTIVE_COGNITION on acorn-juge.
 * Same mesh (flux.mjs / acorn.v0). Not a second mesh. Not a judge.
 * Default project: acorn-juge. Cross-project share is explicit only.
 * Declared ≠ connected. LIVE VERIFIED is Carl only.
 */
import {
  accept,
  connectAgent,
  gradesFor,
  lookup,
  roster,
} from "./flux.mjs";

export const MODE = "COLLECTIVE_COGNITION";
export const COGNITION_VERSION = "cognition.v0";
export const DEFAULT_PROJECT = "acorn-juge";

export const PRINCIPLES = Object.freeze([
  "human_vision",
  "collective_cognition",
  "disagreement_is_data",
  "writing_is_capability",
  "consensus_is_not_truth",
]);

const PROJECT_RE = /^[a-z][a-z0-9-]{1,24}$/;
const MEMORY = [];

export function memory() {
  return MEMORY.slice();
}

export function resetCognition() {
  MEMORY.length = 0;
}

function fail(code, error) {
  return { ok: false, code, error };
}

function clip(text, n) {
  return String(text || "").trim().slice(0, n);
}

function isoTs(value) {
  const s = String(value || "");
  return /^\d{4}-\d{2}-\d{2}T/.test(s) ? s : new Date().toISOString();
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function plusDays(ts, n) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString();
}

function normalizePosition(text) {
  const s = String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  const tagged = s.match(/position:\s*([a-z0-9_-]+)/);
  if (tagged) return tagged[1];
  return s.slice(0, 96);
}

export function parseProject(raw) {
  const id = String(raw || DEFAULT_PROJECT).toLowerCase();
  if (!PROJECT_RE.test(id)) return fail("BAD_PROJECT", "project id must match mesh from/to");
  return { ok: true, id };
}

/** Thinkers: chef / consult / model / guest. Carl (judge) and canal seats do not cogitate. */
export function canThink(agent) {
  if (!agent) return false;
  if (gradesFor(agent.id).includes("LIVE VERIFIED")) return false;
  if (agent.kind === "seat") return false;
  return agent.kind === "chef" || agent.kind === "consult" || agent.kind === "model" || agent.kind === "guest";
}

export function canWrite(agent) {
  if (!agent) return false;
  return (agent.capabilities || []).includes("write");
}

export function thinkers() {
  return roster().filter(canThink);
}

export function presenceOf(agent, opts = {}) {
  if (!agent) return fail("UNKNOWN_AGENT", "no agent");
  const canal = opts.canal === true;
  const secret = opts.secret === true || (opts.secrets && opts.secrets[agent.id] === true);
  const deposited = opts.deposited === true;
  const error = clip(opts.error, 120);
  const claim = String(opts.claim || "").toUpperCase().replace(/ /g, "_");
  if (claim === "LIVE_VERIFIED" || claim === "LIVE") {
    return fail("LIVE_NOT_CARL", "LIVE VERIFIED is Carl only");
  }
  if ((claim === "CONNECTED" || claim === "ACTIVE") && !canal && !secret) {
    return fail("CLAIMED_CHANNEL", "CONNECTED and ACTIVE require a real canal");
  }
  let presence = "DECLARED";
  let reason = "roster row only";
  if (error) {
    presence = "ERROR";
    reason = error;
  } else if (deposited && (canal || secret)) {
    presence = "ACTIVE";
    reason = "deposited with a real canal";
  } else if (secret && canal) {
    presence = "CONNECTED";
    reason = "secret attested by caller, not by the roster";
  } else if (agent.kind === "model" && !secret) {
    presence = "BLOCKED";
    reason = "API CREDENTIAL REQUIRED";
  } else if (canThink(agent)) {
    presence = "CHANNEL_NOT_PRESENT";
    reason = "DECLARED — CHANNEL NOT PRESENT";
  }
  return {
    ok: true,
    id: agent.id,
    declared: true,
    connected: presence === "CONNECTED" || presence === "ACTIVE",
    active: presence === "ACTIVE",
    blocked: presence === "BLOCKED",
    live: false,
    presence,
    reason,
    mode: MODE,
  };
}

export function adapterOf(agent, opts = {}) {
  if (!agent) return fail("UNKNOWN_AGENT", "no agent");
  const canal = presenceOf(agent, opts);
  return {
    ok: true,
    id: agent.id,
    identity: agent.id,
    kind: agent.kind,
    think: canThink(agent),
    write: canWrite(agent),
    timeoutMs: Number(opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : 8000,
    retries: Number(opts.retries) >= 0 ? Number(opts.retries) : 0,
    canal: canal.ok ? canal.presence : "ERROR",
    connected: canal.ok ? canal.connected : false,
    note: "adapter is configuration, not authority. write is not identity.",
  };
}

export function callAdapter(agent, payload = {}, opts = {}) {
  const adapter = adapterOf(agent, opts);
  if (!adapter.ok) return adapter;
  const presence = presenceOf(agent, opts);
  if (!presence.ok) {
    return { ok: false, code: presence.code, error: presence.error, presence: "ERROR" };
  }
  if (presence.presence !== "CONNECTED" && presence.presence !== "ACTIVE") {
    return {
      ok: false,
      code: "CHANNEL_ABSENT",
      error: presence.reason,
      presence: presence.presence,
    };
  }
  return {
    ok: true,
    presence: presence.presence,
    structured: {
      agent_id: agent.id,
      message_id: newId("msg"),
      timestamp: isoTs(opts.ts),
      source: agent.id,
      claim: payload.claim || "proposal",
      body: clip(payload.body, 8000),
    },
  };
}

export function isolateAgent(fn) {
  try {
    return fn();
  } catch (err) {
    return {
      ok: false,
      code: "AGENT_ERROR",
      error: String(err && err.message ? err.message : err),
      presence: "ERROR",
    };
  }
}

export function asTruth() {
  return fail("CONSENSUS_NOT_TRUTH", "LE CONSENSUS N'EST PAS LA VÉRITÉ");
}

export function mayJudge(from) {
  const id = String(from || "").toLowerCase();
  if (id === "carl") return { ok: true, from: id, live: true };
  return fail("NO_JUGE", "AUCUNE IA N'EST LE JUGE");
}

export function join(spec) {
  const id = String(spec && spec.id ? spec.id : "").toLowerCase().replace(/_/g, "-");
  if (["judge-model", "master-model", "truth-model", "final-ai", "oracle-ai", "oracle-model"].includes(id)) {
    return fail("NO_JUGE", "AUCUNE IA N'EST LE JUGE");
  }
  return connectAgent(spec);
}

export function memoryFor(project) {
  const parsed = parseProject(project);
  if (!parsed.ok) return [];
  return MEMORY.filter((e) => e.project === parsed.id);
}

export function remember(input) {
  const raw = input && typeof input === "object" ? input : {};
  const statement = clip(raw.statement || raw.body, 2000);
  if (!statement) return fail("BODY_MISSING", "memory needs a statement");
  if (String(raw.status || "").toLowerCase() === "truth") return asTruth();
  const project = parseProject(raw.project);
  if (!project.ok) return project;
  const ts = isoTs(raw.ts);
  const entry = Object.freeze({
    id: String(raw.id || newId("m")),
    mode: MODE,
    project: project.id,
    sessionId: raw.sessionId || null,
    statement,
    status: raw.status === "consensus" || raw.status === "disputed" ? raw.status : "unresolved",
    truth: false,
    from: String(raw.from || "").toLowerCase() || null,
    sources: Object.freeze([...(raw.sources || [])].map((s) => String(s))),
    disagreement: Object.freeze([...(raw.disagreement || [])]),
    ts,
    validAt: ts,
    reviewAfter: plusDays(ts, 30),
    context: clip(raw.context, 2000),
  });
  MEMORY.push(entry);
  return { ok: true, entry };
}

export function shareAcrossProjects(entry, toProject, opts = {}) {
  if (!entry || !entry.id) return fail("UNKNOWN_MEMORY", "share needs a dated entry");
  if (opts.explicit !== true) {
    return fail("IMPLICIT_LEAK", "inter-project share must be explicit and voluntary");
  }
  const dest = parseProject(toProject);
  if (!dest.ok) return dest;
  if (entry.project === dest.id) return fail("SAME_PROJECT", "shareAcrossProjects is for a different project");
  return remember({
    from: opts.from || entry.from,
    statement: entry.statement,
    status: "unresolved",
    sources: [...(entry.sources || []), `project:${entry.project}`, entry.id],
    disagreement: entry.disagreement,
    context: `from-project:${entry.project}`,
    project: dest.id,
    sessionId: opts.sessionId || null,
    ts: opts.ts,
  });
}

export function visibleTo(step, from, contributions = []) {
  if (step === "independent" || step === "question") {
    return contributions.filter((c) => c.from === from);
  }
  return contributions.slice();
}

export function openSession(input) {
  const raw = input && typeof input === "object" ? input : { topic: input };
  const topic = clip(raw.topic || raw.body, 400);
  if (!topic) return fail("BODY_MISSING", "session needs a question");
  const project = parseProject(raw.project);
  if (!project.ok) return project;
  const ts = isoTs(raw.ts);
  const id = String(raw.id || newId("q"));
  const session = {
    mode: MODE,
    cognition: COGNITION_VERSION,
    flux: "acorn.v0",
    project: project.id,
    id,
    session_id: id,
    topic,
    ts,
    tour: "independent",
    independentOpen: true,
    contributions: [],
    relations: [],
    syntheses: [],
    lessons: [],
  };
  return { ok: true, session };
}

function thinkOne(session, agent, body, actor, ts) {
  if (!canThink(agent)) return fail("NOT_THINKER", `${agent.id} is not a thinking identity`);
  if (session.contributions.some((c) => c.tour === "independent" && c.from === agent.id)) {
    return fail("ALREADY_THOUGHT", `${agent.id} already filed an independent analysis`);
  }
  const text = clip(body, 8000);
  if (!text) return fail("BODY_MISSING", "independent analysis needs a body");
  const accepted = accept({
    from: agent.id,
    to: "*",
    act: "FINDING",
    mode: "ECHANGE",
    grade: "PROPOSED",
    body: text,
    actor,
    ts,
  });
  if (!accepted.ok) return accepted;
  const contribution = Object.freeze({
    id: accepted.packet.id,
    sessionId: session.id,
    project: session.project,
    agent_id: agent.id,
    message_id: accepted.packet.id,
    timestamp: accepted.packet.ts,
    source: agent.id,
    claim: "proposal",
    tour: "independent",
    isolated: true,
    from: agent.id,
    write: canWrite(agent),
    replyTo: null,
    previousId: null,
    position: normalizePosition(text),
    packet: Object.freeze({ ...accepted.packet }),
  });
  session.contributions.push(contribution);
  return { ok: true, contribution };
}

export function runIndependent(session, opts = {}) {
  if (!session || session.cognition !== COGNITION_VERSION) {
    return fail("NO_SESSION", "openSession() a question first");
  }
  if (!session.independentOpen) return fail("INDEPENDENT_CLOSED", "independent tour is closed");
  const filed = [];
  const errors = [];
  const skipped = [];
  const bodyOf =
    typeof opts.bodyOf === "function"
      ? opts.bodyOf
      : (agent) =>
          (opts.bodies && opts.bodies[agent.id]) ||
          `Independent. ${agent.id} (${agent.specialty || agent.kind}). Position: ${agent.kind}. Topic: ${clip(session.topic, 200)}. Isolated. Declared is not connected. Never LIVE.`;
  for (const agent of thinkers()) {
    const body = bodyOf(agent);
    if (!body) {
      skipped.push(agent.id);
      continue;
    }
    const r = isolateAgent(() => thinkOne(session, agent, body, opts.actor, opts.ts));
    if (!r.ok) errors.push({ id: agent.id, code: r.code, error: r.error });
    else filed.push(r.contribution);
  }
  return { ok: true, session, filed, errors, skipped };
}

export function share(session) {
  if (!session || session.cognition !== COGNITION_VERSION) {
    return fail("NO_SESSION", "openSession() a question first");
  }
  session.independentOpen = false;
  session.tour = "confrontation";
  return { ok: true, session };
}

export function reply(session, input) {
  if (!session || session.cognition !== COGNITION_VERSION) {
    return fail("NO_SESSION", "openSession() a question first");
  }
  if (session.independentOpen) return fail("INDEPENDENT_OPEN", "share() before confrontation");
  const raw = input && typeof input === "object" ? input : {};
  const from = String(raw.from || "").toLowerCase();
  const agent = lookup(from);
  if (!canThink(agent)) return fail("NOT_THINKER", `${from} is not a thinking identity`);
  const tag = String(raw.reply || "DISAGREE").toUpperCase();
  const target = session.contributions.find((c) => c.id === raw.targetId || c.from === raw.target);
  if (!target) return fail("UNKNOWN_TARGET", "reply needs an existing contribution");
  if (target.from === from) return fail("NO_LOOP", "cannot reply to yourself");
  const body = clip(raw.body, 8000);
  if (!body) return fail("BODY_MISSING", "reply needs a body");
  const accepted = accept({
    from,
    to: target.from,
    act: tag === "DISAGREE" ? "RISK" : "FINDING",
    mode: "ECHANGE",
    grade: "PROPOSED",
    body,
    actor: raw.actor,
    ts: raw.ts,
    replyTo: target.id,
  });
  if (!accepted.ok) return accepted;
  const contribution = Object.freeze({
    id: accepted.packet.id,
    sessionId: session.id,
    project: session.project,
    tour: "confrontation",
    isolated: false,
    from,
    reply: tag,
    replyTo: target.id,
    packet: Object.freeze({ ...accepted.packet }),
  });
  session.contributions.push(contribution);
  session.relations.push(Object.freeze({ from, to: target.from, reply: tag, targetId: target.id }));
  return { ok: true, session, contribution };
}

export function revise(session, input) {
  if (!session || session.cognition !== COGNITION_VERSION) {
    return fail("NO_SESSION", "openSession() a question first");
  }
  if (session.independentOpen) return fail("INDEPENDENT_OPEN", "share() before revision");
  const raw = input && typeof input === "object" ? input : {};
  const from = String(raw.from || "").toLowerCase();
  const agent = lookup(from);
  if (!canThink(agent)) return fail("NOT_THINKER", `${from} is not a thinking identity`);
  const previous =
    session.contributions.find((c) => c.id === raw.previousId) ||
    session.contributions.filter((c) => c.from === from && c.tour === "independent").at(-1);
  if (!previous) return fail("UNKNOWN_TARGET", "revision needs a previous independent filing");
  const body = clip(raw.body, 8000);
  if (!body) return fail("BODY_MISSING", "revision needs a body");
  session.tour = "revision";
  const accepted = accept({
    from,
    to: "*",
    act: "FINDING",
    mode: "ECHANGE",
    grade: "PROPOSED",
    body,
    actor: raw.actor,
    ts: raw.ts,
    replyTo: previous.id,
  });
  if (!accepted.ok) return accepted;
  const contribution = Object.freeze({
    id: accepted.packet.id,
    sessionId: session.id,
    project: session.project,
    tour: "revision",
    from,
    previousId: previous.id,
    previousPosition: previous.position,
    position: normalizePosition(body) || previous.position,
    packet: Object.freeze({ ...accepted.packet }),
  });
  session.contributions.push(contribution);
  return { ok: true, session, contribution, previous };
}

export function synthesize(session, input = {}) {
  if (!session || session.cognition !== COGNITION_VERSION) {
    return fail("NO_SESSION", "openSession() a question first");
  }
  if (session.independentOpen) return fail("INDEPENDENT_OPEN", "share() before synthesis");
  const raw = input && typeof input === "object" ? input : {};
  if (String(raw.status || "").toLowerCase() === "truth") return asTruth();
  const independents = session.contributions.filter((c) => c.tour === "independent");
  const map = new Map();
  for (const c of independents) {
    const key = c.position || "unscored";
    const row = map.get(key) || { position: key, count: 0, contributors: [] };
    row.count += 1;
    row.contributors.push(c.from);
    map.set(key, row);
  }
  const rows = [...map.values()].sort((a, b) => b.count - a.count);
  const status = rows.length <= 1 ? "consensus" : "disputed";
  const from = String(raw.from || thinkers()[0]?.id || "grok").toLowerCase();
  if (!canThink(lookup(from))) return fail("NOT_THINKER", `${from} is not a thinking identity`);
  const ts = isoTs(raw.ts);
  const body = clip(
    raw.body || `Synthesis. Status: ${status}. Majority count is not proof. Never LIVE.`,
    8000,
  );
  const accepted = accept({
    from,
    to: "*",
    act: "FINDING",
    mode: "ECHANGE",
    grade: "PROPOSED",
    body,
    actor: raw.actor,
    ts,
  });
  if (!accepted.ok) return accepted;
  const synthesis = Object.freeze({
    id: accepted.packet.id,
    sessionId: session.id,
    project: session.project,
    ts,
    from,
    status,
    truth: false,
    majority: rows[0] || null,
    minority: rows.slice(1),
    disagreement: rows.slice(1),
    packet: Object.freeze({ ...accepted.packet }),
  });
  session.syntheses.push(synthesis);
  session.tour = "synthesis";
  const stored = remember({
    from,
    sessionId: session.id,
    project: session.project,
    statement: body,
    status,
    disagreement: rows.slice(1).map((m) => m.position),
    sources: independents.map((c) => c.id),
    ts,
  });
  if (stored.ok) session.lessons.push(stored.entry);
  return { ok: true, session, synthesis, lesson: stored.ok ? stored.entry : null };
}

export function runCycle(input = {}) {
  const opened = openSession(input);
  if (!opened.ok) return opened;
  const session = opened.session;
  const first = runIndependent(session, { actor: input.actor, ts: input.ts });
  if (!first.ok) return first;
  share(session);
  const ids = first.filed.map((c) => c.from);
  if (ids.length >= 2) {
    reply(session, {
      from: ids[1],
      targetId: first.filed[0].id,
      reply: "DISAGREE",
      body: "Counter-analysis. Position: challenge-the-frame. Isolated thought was not copied. Majority is not proof.",
      actor: input.actor,
      ts: input.ts,
    });
  }
  if (ids[0]) {
    revise(session, {
      from: ids[0],
      previousId: first.filed[0].id,
      body: `Revision. Position: ${first.filed[0].position}. Previous kept. Never LIVE.`,
      actor: input.actor,
      ts: input.ts,
    });
  }
  const syn = synthesize(session, { from: ids[0] || "grok", actor: input.actor, ts: input.ts });
  if (!syn.ok) return syn;
  return {
    ok: true,
    session,
    filed: first.filed,
    errors: first.errors,
    skipped: first.skipped,
    synthesis: syn.synthesis,
    lesson: syn.lesson,
    project: session.project,
  };
}
