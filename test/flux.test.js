import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  FLUX_VERSION,
  CHEF,
  AGENTS,
  AGENT_IDS,
  MODES,
  MODES_ALWAYS,
  GUEST_CAP,
  ALWAYS_CONSULT,
  SUGGESTED_GUESTS,
  meshSize,
  directions,
  gradesFor,
  accept,
  fanout,
  parseFlux,
  formatEnvelope,
  modelsForDestination,
  SEED,
  connectAgent,
  disconnectAgent,
  resetGuests,
  rosterIds,
  pathFor,
  fileTree,
  filePackets,
  materialize,
  isChef,
  isAlwaysConsult,
  specialtyOf,
  consultIds,
  cycle,
} from "../.github/swarm/flux.mjs";

beforeEach(() => resetGuests());

describe("mesh", () => {
  it("names thirteen core agents, Grok chef, Heavy and Build always consult", () => {
    assert.equal(AGENT_IDS.length, 13);
    assert.equal(CHEF, "grok");
    assert.equal(isChef("grok"), true);
    assert.equal(AGENTS.grok.kind, "chef");
    assert.deepEqual([...ALWAYS_CONSULT], ["heavy", "build"]);
    assert.equal(isAlwaysConsult("heavy"), true);
    assert.equal(isAlwaysConsult("build"), true);
    assert.equal(AGENTS.heavy.kind, "consult");
    assert.equal(AGENTS.build.kind, "consult");
    assert.equal(meshSize(), 13 * 12);
    assert.equal(directions("grok").length, 12);
    assert.ok(!directions("grok").includes("grok"));
    assert.ok(AGENTS.carl.role.includes("judge"));
    assert.ok(SEED.length >= 6);
    assert.equal(GUEST_CAP, 8);
    assert.ok(SUGGESTED_GUESTS.some((g) => g.id === "copilot"));
    assert.equal(specialtyOf("chatgpt"), "challenge");
    assert.deepEqual([...MODES], [
      "PROPOSITION",
      "CONSULTATION",
      "ECHANGE",
      "CHALLENGE",
    ]);
    assert.equal(MODES_ALWAYS, true);
  });

  it("every core pair is connectable both ways", () => {
    for (const a of AGENT_IDS) {
      for (const b of AGENT_IDS) {
        if (a === b) continue;
        const r = accept({
          from: a,
          to: b,
          act: "HANDOFF",
          mode: a === "grok" || b === "grok" ? "CHALLENGE" : "ECHANGE",
          grade: "PROPOSED",
          body: "never QUANTUM. Unique host only.",
        });
        assert.equal(r.ok, true, `${a}→${b} ${r.ok ? "" : r.error}`);
      }
    }
  });
});

describe("accept fail-closed", () => {
  it("stamps preview, receipt, chef, path", () => {
    const r = accept({
      from: "grok",
      to: "chatgpt",
      act: "HANDOFF",
      mode: "PROPOSITION",
      grade: "PROPOSED",
      body: "Challenge this. Never QUANTUM.",
    });
    assert.equal(r.ok, true);
    assert.equal(r.packet.flux, FLUX_VERSION);
    assert.equal(r.packet.preview, true);
    assert.equal(r.packet.receipt, false);
    assert.equal(r.packet.chef, "grok");
    assert.equal(r.packet.path, "flux/proposition/grok-to-chatgpt.md");
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

  it("rejects unknown agents and loops until a guest is connected", () => {
    assert.equal(
      accept({ from: "copilot", to: "grok", act: "HANDOFF", grade: "PROPOSED", body: "x" }).code,
      "UNKNOWN_AGENT",
    );
    assert.equal(
      accept({ from: "grok", to: "grok", act: "HANDOFF", grade: "PROPOSED", body: "x" }).code,
      "NO_LOOP",
    );
  });

  it("locks PROPOSITION and CONSULTATION to the chef", () => {
    const p = accept({
      from: "chatgpt",
      to: "grok",
      act: "HANDOFF",
      mode: "PROPOSITION",
      grade: "PROPOSED",
      body: "I propose. Never QUANTUM.",
    });
    assert.equal(p.ok, false);
    assert.equal(p.code, "MODE_CHEF");
    const c = accept({
      from: "chatgpt",
      to: "grok",
      act: "FINDING",
      mode: "CONSULTATION",
      grade: "PROPOSED",
      body: "I consult. Never QUANTUM.",
    });
    assert.equal(c.ok, false);
    assert.equal(c.code, "MODE_CHEF");
  });

  it("CONSULTATION addresses one AI, not all", () => {
    const r = accept({
      from: "grok",
      to: "*",
      act: "FINDING",
      mode: "CONSULTATION",
      grade: "PROPOSED",
      body: "Ask everyone. Never QUANTUM.",
    });
    assert.equal(r.ok, false);
    assert.equal(r.code, "MODE_ONE");
  });

  it("CHALLENGE must include Grok", () => {
    const r = accept({
      from: "sonnet",
      to: "chatgpt",
      act: "RISK",
      mode: "CHALLENGE",
      grade: "PROPOSED",
      body: "side channel. Never QUANTUM.",
    });
    assert.equal(r.ok, false);
    assert.equal(r.code, "MODE_GROK");
  });
});

describe("guests — future AIs", () => {
  it("connects copilot then allows copilot → grok", () => {
    const c = connectAgent({ id: "copilot", name: "Copilot", role: "guest review" });
    assert.equal(c.ok, true);
    assert.ok(rosterIds().includes("copilot"));
    assert.equal(meshSize(), 14 * 13);
    const r = accept({
      from: "copilot",
      to: "grok",
      act: "RISK",
      mode: "CHALLENGE",
      grade: "PROPOSED",
      body: "Guest challenge. Never QUANTUM.",
    });
    assert.equal(r.ok, true);
    assert.equal(r.packet.path, "flux/challenge/copilot-to-grok.md");
  });

  it("connects every suggested guest", () => {
    for (const g of SUGGESTED_GUESTS) {
      const r = connectAgent(g);
      assert.equal(r.ok, true, g.id);
    }
    assert.equal(meshSize(), (13 + SUGGESTED_GUESTS.length) * (12 + SUGGESTED_GUESTS.length));
  });

  it("refuses reserved ids and core seats", () => {
    assert.equal(connectAgent({ id: "attest" }).code, "RESERVED_ID");
    assert.equal(connectAgent({ id: "quantum" }).code, "RESERVED_ID");
    assert.equal(connectAgent({ id: "grok" }).code, "CORE_LOCKED");
    assert.equal(connectAgent({ id: "heavy" }).code, "CORE_LOCKED");
    assert.equal(disconnectAgent("carl").code, "CORE_LOCKED");
  });
});

describe("cycle — four modes always, all AIs", () => {
  it("locks MODES_ALWAYS so the four modes cannot be turned off", () => {
    assert.equal(MODES_ALWAYS, true);
    const r = cycle({ body: "Four modes always on. Never QUANTUM." });
    assert.equal(r.ok, true, r.ok ? "" : r.error);
    const modes = new Set(r.packets.map((p) => p.mode));
    assert.ok(MODES.every((m) => modes.has(m)));
    assert.equal(MODES.length, 4);
  });

  it("always consults Heavy and Build, then specialists", () => {
    const ids = consultIds("optimize the flux mesh");
    assert.ok(ids[0] === "heavy" && ids[1] === "build");
    assert.ok(ids.includes("chatgpt"));
    assert.ok(ids.includes("sonnet"));
    assert.ok(!ids.includes("fable"));
  });

  it("GitHub first, then all four modes, files under flux/", () => {
    const r = cycle({
      body: "Activate four modes for all AIs. Never QUANTUM.",
    });
    assert.equal(r.ok, true, r.ok ? "" : r.error);
    assert.ok(r.consult.includes("heavy"));
    assert.ok(r.consult.includes("build"));
    const modes = new Set(r.packets.map((p) => p.mode));
    assert.ok(MODES.every((m) => modes.has(m)));
    assert.equal(r.packets[0].from, "github");
    assert.equal(r.packets[0].to, "grok");
    assert.ok(r.packets.some((p) => p.path === "flux/consultation/grok-to-heavy.md"));
    assert.ok(r.packets.some((p) => p.path === "flux/consultation/grok-to-build.md"));
    assert.ok(r.packets.some((p) => p.path === "flux/proposition/grok-to-all.md"));
    assert.ok(r.packets.some((p) => p.path === "flux/challenge/chatgpt-to-grok.md"));
    assert.ok(r.packets.some((p) => p.path === "flux/echange/heavy-to-build.md"));
  });

  it("connected guests join the cycle", () => {
    assert.equal(connectAgent({ id: "copilot", name: "Copilot" }).ok, true);
    const r = cycle({ body: "Guest on the mesh. Never QUANTUM." });
    assert.equal(r.ok, true);
    assert.ok(r.consult.includes("copilot"));
    assert.ok(r.packets.some((p) => p.path === "flux/consultation/grok-to-copilot.md"));
  });
});

describe("fanout, parse, files", () => {
  it("broadcasts to every other agent and files each path", () => {
    const r = accept({
      from: "grok",
      to: "*",
      act: "HANDOFF",
      mode: "PROPOSITION",
      grade: "PROPOSED",
      body: "All directions. Never QUANTUM.",
    });
    assert.equal(r.ok, true);
    const out = fanout(r.packet);
    assert.equal(out.length, 12);
    assert.ok(out.every((p) => p.from === "grok" && p.to !== "grok" && p.to !== "*"));
    assert.ok(out.every((p) => p.path.startsWith("flux/proposition/grok-to-")));
    const filed = filePackets(r.packet);
    assert.equal(filed[0].to, "*");
    assert.equal(filed[0].path, "flux/proposition/grok-to-all.md");
    assert.equal(filed.length, 13);
  });

  it("parses FLUX header with mode and /flux to:chatgpt", () => {
    const a = parseFlux(
      "FLUX from:grok to:chatgpt act:HANDOFF mode:PROPOSITION grade:PROPOSED\nChallenge the mesh.",
    );
    assert.equal(a.from, "grok");
    assert.equal(a.to, "chatgpt");
    assert.equal(a.act, "HANDOFF");
    assert.equal(a.mode, "PROPOSITION");
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

  it("formatEnvelope is chef memory, not a seal", () => {
    const r = accept({
      from: "chatgpt",
      to: "grok",
      act: "RISK",
      mode: "CHALLENGE",
      grade: "PROPOSED",
      body: "Do not bind /flux on the Worker.",
    });
    const text = formatEnvelope(r.packet);
    assert.match(text, /^FLUX from:chatgpt to:grok act:RISK mode:CHALLENGE grade:PROPOSED/m);
    assert.match(text, /path: flux\/challenge\/chatgpt-to-grok\.md/);
    assert.match(text, /chef: grok/);
    assert.match(text, /preview:true/);
    assert.doesNotMatch(text, /LIVE VERIFIED/);
  });

  it("gradesFor locks LIVE to Carl", () => {
    assert.ok(!gradesFor("grok").includes("LIVE VERIFIED"));
    assert.ok(gradesFor("carl").includes("LIVE VERIFIED"));
    assert.ok(gradesFor("ci").includes("TEST VERIFIED"));
  });

  it("fileTree groups chef writes by mode", () => {
    const r = accept({
      from: "chatgpt",
      to: "grok",
      act: "RISK",
      mode: "CHALLENGE",
      grade: "PROPOSED",
      body: "Never QUANTUM.",
    });
    const tree = fileTree([r.packet]);
    assert.equal(tree.challenge[0].path, "flux/challenge/chatgpt-to-grok.md");
    assert.equal(pathFor({ from: "grok", to: "*", mode: "PROPOSITION" }), "flux/proposition/grok-to-all.md");
  });

  it("materialize writes markdown under flux/{mode}/", () => {
    const packets = [];
    for (const row of SEED) {
      const r = accept(row);
      assert.equal(r.ok, true, r.ok ? "" : r.error);
      packets.push(r.packet);
    }
    const files = materialize(packets);
    assert.equal(files["flux/proposition/grok-to-all.md"] != null, true);
    assert.equal(files["flux/consultation/grok-to-chatgpt.md"] != null, true);
    assert.equal(files["flux/consultation/grok-to-heavy.md"] != null, true);
    assert.equal(files["flux/consultation/grok-to-build.md"] != null, true);
    assert.equal(files["flux/challenge/chatgpt-to-grok.md"] != null, true);
    assert.equal(files["flux/echange/github-to-grok.md"] != null, true);
    assert.match(files["flux/proposition/grok-to-all.md"], /chef: grok/);
    assert.match(files["flux/proposition/grok-to-all.md"], /Worker stays GET \/juge/);
  });
});
