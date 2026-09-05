import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FLUX_VERSION,
  AGENTS,
  AGENT_IDS,
  meshSize,
  directions,
  gradesFor,
  accept,
  fanout,
  parseFlux,
  formatEnvelope,
  modelsForDestination,
  SEED,
} from "../.github/swarm/flux.mjs";

describe("mesh", () => {
  it("names eleven agents and 110 directed edges", () => {
    assert.equal(AGENT_IDS.length, 11);
    assert.equal(meshSize(), 110);
    assert.equal(directions("grok").length, 10);
    assert.ok(!directions("grok").includes("grok"));
    assert.ok(AGENTS.carl.role.includes("judge"));
    assert.ok(SEED.length >= 6);
  });

  it("every pair is connectable both ways", () => {
    for (const a of AGENT_IDS) {
      for (const b of AGENT_IDS) {
        if (a === b) continue;
        const r = accept({
          from: a,
          to: b,
          act: "HANDOFF",
          grade: "PROPOSED",
          body: "never QUANTUM. Unique host only.",
        });
        assert.equal(r.ok, true, `${a}→${b} ${r.ok ? "" : r.error}`);
      }
    }
  });
});

describe("accept fail-closed", () => {
  it("stamps preview true and receipt false", () => {
    const r = accept({
      from: "grok",
      to: "chatgpt",
      act: "HANDOFF",
      grade: "PROPOSED",
      body: "Challenge this. Never QUANTUM.",
    });
    assert.equal(r.ok, true);
    assert.equal(r.packet.flux, FLUX_VERSION);
    assert.equal(r.packet.preview, true);
    assert.equal(r.packet.receipt, false);
    assert.match(r.packet.host, /acorn-royal-dune-blend/);
  });

  it("rejects LIVE VERIFIED from anyone but Carl", () => {
    const r = accept({
      from: "grok",
      to: "carl",
      act: "RESULT",
      grade: "LIVE VERIFIED",
      body: "bound /juge",
    });
    assert.equal(r.ok, false);
    assert.equal(r.code, "LIVE_NOT_CARL");
  });

  it("rejects QUANTUM claims, allows never QUANTUM", () => {
    const bad = accept({
      from: "grok",
      to: "chatgpt",
      act: "RESULT",
      grade: "PROPOSED",
      body: "This preview is QUANTUM.",
    });
    assert.equal(bad.ok, false);
    assert.equal(bad.code, "FORBIDDEN_QUANTUM");
    const ok = accept({
      from: "grok",
      to: "chatgpt",
      act: "HANDOFF",
      grade: "PROPOSED",
      body: "Never QUANTUM. Preview is not a receipt.",
    });
    assert.equal(ok.ok, true);
  });

  it("rejects a second grok.me and /attest canal", () => {
    const host = accept({
      from: "cursor",
      to: "grok",
      act: "ACTION",
      grade: "PROPOSED",
      body: "Invent another *.grok.me for flux.",
    });
    assert.equal(host.ok, false);
    assert.equal(host.code, "FORBIDDEN_HOST");
    const attest = accept({
      from: "cursor",
      to: "worker",
      act: "ACTION",
      grade: "PROPOSED",
      body: "Create POST /attest as a canal.",
    });
    assert.equal(attest.ok, false);
    assert.equal(attest.code, "FORBIDDEN_ATTEST");
  });

  it("rejects wrangler deploy ACTION from a model", () => {
    const r = accept({
      from: "grok",
      to: "worker",
      act: "ACTION",
      grade: "PROPOSED",
      body: "Please wrangler deploy now.",
    });
    assert.equal(r.ok, false);
    assert.equal(r.code, "FORBIDDEN_DEPLOY");
  });

  it("rejects CODE VERIFIED from a model", () => {
    const r = accept({
      from: "sonnet",
      to: "github",
      act: "RESULT",
      grade: "CODE VERIFIED",
      body: "on main",
    });
    assert.equal(r.ok, false);
    assert.equal(r.code, "CODE_NOT_MEMORY");
  });

  it("rejects unknown agents and loops", () => {
    assert.equal(
      accept({ from: "copilot", to: "grok", act: "HANDOFF", grade: "PROPOSED", body: "x" }).code,
      "UNKNOWN_AGENT",
    );
    assert.equal(
      accept({ from: "grok", to: "grok", act: "HANDOFF", grade: "PROPOSED", body: "x" }).code,
      "NO_LOOP",
    );
  });
});

describe("fanout and parse", () => {
  it("broadcasts to every other agent", () => {
    const r = accept({
      from: "grok",
      to: "*",
      act: "HANDOFF",
      grade: "PROPOSED",
      body: "All directions. Never QUANTUM.",
    });
    assert.equal(r.ok, true);
    const out = fanout(r.packet);
    assert.equal(out.length, 10);
    assert.ok(out.every((p) => p.from === "grok" && p.to !== "grok" && p.to !== "*"));
  });

  it("parses FLUX header and /flux to:chatgpt", () => {
    const a = parseFlux(
      "FLUX from:grok to:chatgpt act:HANDOFF grade:PROPOSED\nChallenge the mesh.",
    );
    assert.equal(a.from, "grok");
    assert.equal(a.to, "chatgpt");
    assert.equal(a.act, "HANDOFF");
    assert.match(a.body, /Challenge/);
    const b = parseFlux("/flux to:chatgpt from:sonnet\nFINDING the ε split holds.");
    assert.equal(b.from, "sonnet");
    assert.equal(b.to, "chatgpt");
    assert.equal(parseFlux("ordinary review comment"), null);
  });

  it("modelsForDestination maps * to auto, chatgpt to itself, carl to none", () => {
    assert.deepEqual(modelsForDestination("*"), ["sonnet", "chatgpt", "deepseek", "gemini"]);
    assert.deepEqual(modelsForDestination("chatgpt"), ["chatgpt"]);
    assert.deepEqual(modelsForDestination("carl"), []);
    assert.deepEqual(modelsForDestination("fable"), ["fable"]);
  });

  it("formatEnvelope is addressable memory, not a seal", () => {
    const r = accept({
      from: "chatgpt",
      to: "grok",
      act: "RISK",
      grade: "PROPOSED",
      body: "Do not bind /flux on the Worker.",
    });
    const text = formatEnvelope(r.packet);
    assert.match(text, /^FLUX from:chatgpt to:grok act:RISK grade:PROPOSED/m);
    assert.match(text, /preview:true/);
    assert.doesNotMatch(text, /LIVE VERIFIED/);
  });

  it("gradesFor locks LIVE to Carl", () => {
    assert.ok(!gradesFor("grok").includes("LIVE VERIFIED"));
    assert.ok(gradesFor("carl").includes("LIVE VERIFIED"));
    assert.ok(gradesFor("ci").includes("TEST VERIFIED"));
  });
});
