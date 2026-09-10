import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NetworkSweepOrchestrator } from "../src/network-sweep.mjs";

describe("network sweep — no fake READY, no leaked keys", () => {
  it("HOLDs without a key and never READY on a named secret", async () => {
    const orch = new NetworkSweepOrchestrator({
      env: {},
      ping: async () => 200,
    });
    const hold = await orch.run({ node_id: "openai", env: "OPENAI_API_KEY" });
    assert.equal(hold.status, "HOLD");
    const key = "sk-test-not-real-aaaaaaaa";
    const live = new NetworkSweepOrchestrator({
      env: { XAI_API_KEY: key },
      ping: async () => 200,
    });
    const ready = await live.run({ node_id: "xai", env: "XAI_API_KEY" });
    assert.equal(ready.status, "READY");
    assert.equal(JSON.stringify(ready).includes(key), false);
    const fail = new NetworkSweepOrchestrator({
      env: { XAI_API_KEY: key },
      ping: async () => {
        throw new Error("down");
      },
    });
    const down = await fail.run({ node_id: "xai", env: "XAI_API_KEY" });
    assert.equal(down.status, "DEGRADED");
    assert.notEqual(down.status, "READY");
  });
});
