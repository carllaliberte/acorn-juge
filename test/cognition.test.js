import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  PRINCIPLES,
  adapterOf,
  callAdapter,
  canWrite,
  isolateAgent,
  join,
  mayJudge,
  memoryFor,
  openSession,
  presenceOf,
  resetCognition,
  revise,
  runCycle,
  runIndependent,
  share,
  shareAcrossProjects,
  thinkers,
  visibleTo,
} from "../.github/swarm/cognition.mjs";
import { lookup, resetGuests } from "../.github/swarm/flux.mjs";

afterEach(() => {
  resetCognition();
  resetGuests();
});

describe("acorn-juge COLLECTIVE_COGNITION + multi-project", () => {
  it("reuses acorn.v0 — not a second mesh, not a judge", () => {
    const cycle = runCycle({ topic: "Does GET /juge stay preview?", project: "acorn-juge" });
    assert.equal(cycle.ok, true, cycle.error);
    assert.equal(cycle.session.flux, "acorn.v0");
    assert.equal(cycle.session.project, "acorn-juge");
    assert.ok(new Set(cycle.filed.map((c) => c.from)).size >= 2);
    assert.equal(mayJudge("gemini").ok, false);
    assert.equal(mayJudge("carl").ok, true);
    assert.equal(join({ id: "oracle-model", name: "Oracle" }).code, "NO_JUGE");
    assert.deepEqual(PRINCIPLES.length, 5);
  });

  it("independent filings are isolated until SHARE, then redistributed", () => {
    const opened = openSession({ topic: "isolate", project: "acorn-juge" });
    const first = runIndependent(opened.session);
    assert.ok(first.filed.every((c) => c.isolated && c.replyTo === null));
    assert.equal(visibleTo("independent", first.filed[0].from, first.filed).length, 1);
    share(opened.session);
    assert.equal(visibleTo("share", first.filed[0].from, first.filed).length, first.filed.length);
  });

  it("IAs contradict, revise, keep provenance and dated memory", () => {
    const cycle = runCycle({
      topic: "contradict then revise",
      project: "acorn-juge",
      ts: "2026-09-09T02:00:00.000Z",
    });
    assert.ok(cycle.session.relations.some((r) => r.reply === "DISAGREE"));
    const from = cycle.filed[0].from;
    const rev = revise(cycle.session, {
      from,
      body: "Revision. Position: changed. Previous kept. Never LIVE.",
    });
    assert.equal(rev.ok, true, rev.error);
    assert.equal(rev.previous.tour, "independent");
    assert.equal(cycle.synthesis.truth, false);
    assert.ok(cycle.lesson.ts.startsWith("2026-09-09"));
    assert.ok(cycle.filed.every((c) => c.agent_id && c.message_id && c.timestamp));
  });

  it("two projects stay isolated; leak requires explicit share", () => {
    runCycle({ topic: "alpha question", project: "acorn-juge" });
    const b = runCycle({ topic: "beta question", project: "other-project" });
    assert.equal(b.ok, true, b.error);
    const aMem = memoryFor("acorn-juge");
    const bMem = memoryFor("other-project");
    assert.ok(aMem.length >= 1 && bMem.length >= 1);
    assert.ok(aMem.every((e) => e.project === "acorn-juge"));
    assert.ok(bMem.every((e) => e.project === "other-project"));
    assert.equal(shareAcrossProjects(b.lesson, "acorn-juge").code, "IMPLICIT_LEAK");
    const copied = shareAcrossProjects(b.lesson, "acorn-juge", { explicit: true });
    assert.equal(copied.ok, true);
    assert.ok(copied.entry.sources.includes("project:other-project"));
  });

  it("no fake CONNECTED; one error does not kill the session; write not required", () => {
    const gemini = lookup("gemini");
    const p = presenceOf(gemini);
    assert.equal(p.presence, "BLOCKED");
    assert.equal(p.connected, false);
    const called = callAdapter(gemini, { body: "hi" });
    assert.equal(called.ok, false);
    assert.ok(["CHANNEL_NOT_PRESENT", "BLOCKED", "UNAVAILABLE", "ERROR"].includes(called.presence));
    assert.equal(adapterOf(gemini).connected, false);
    const boom = isolateAgent(() => {
      throw new Error("provider down");
    });
    assert.equal(boom.code, "AGENT_ERROR");
    const cycle = runCycle({ topic: "no write", project: "acorn-juge" });
    assert.equal(cycle.ok, true);
    assert.ok(thinkers().some((a) => canWrite(a) === false));
    assert.ok(cycle.filed.every((c) => c.write === false));
  });
});
