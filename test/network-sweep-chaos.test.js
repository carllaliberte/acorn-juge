import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NetworkSweepOrchestrator } from "../src/network-sweep.mjs";

const KEY = "sk-test-not-real-bbbbbbbb";

describe("sweep chaos — 500/503/timeout never READY", () => {
  it("maps HTTP failures and isolation", async () => {
    for (const code of [500, 503, 429]) {
      const orch = new NetworkSweepOrchestrator({
        env: { XAI_API_KEY: KEY },
        ping: async () => code,
      });
      const row = await orch.run({ node_id: "xai", env: "XAI_API_KEY" });
      assert.equal(row.status, "DEGRADED", String(code));
      assert.equal(JSON.stringify(row).includes(KEY), false);
    }
    const slow = new NetworkSweepOrchestrator({
      env: { XAI_API_KEY: KEY },
      ping: async () => {
        await new Promise((r) => setTimeout(r, 20));
        throw new Error("timeout");
      },
    });
    const down = await slow.run({ node_id: "xai", env: "XAI_API_KEY" });
    assert.equal(down.status, "DEGRADED");
    const corrupt = new NetworkSweepOrchestrator({
      env: { XAI_API_KEY: KEY },
      ping: async () => {
        throw Object.assign(new Error("bad json"), { body: "{" });
      },
    });
    const bad = await corrupt.run({ node_id: "xai", env: "XAI_API_KEY" });
    assert.notEqual(bad.status, "READY");
  });
});
