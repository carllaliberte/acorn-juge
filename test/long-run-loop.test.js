import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LongRunLoopEngine } from "../src/long-run-loop.mjs";

describe("long-run loop — one tick, never blocks", () => {
  it("returns immediately and does not invent work", () => {
    const loop = new LongRunLoopEngine();
    const a = loop.tick([]);
    const b = loop.tick([]);
    assert.notEqual(a.phase, b.phase);
    assert.equal(a.write, "DENIED");
    assert.equal(a.auto_merge, false);
    assert.match(a.next, /HOLD/);
    const useful = loop.detectUsefulWork({ missingKeys: ["OPENAI_API_KEY"] });
    assert.ok(useful.some((x) => /HOLD/.test(x)));
  });
});
