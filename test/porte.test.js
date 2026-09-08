import assert from "node:assert/strict";
import test from "node:test";
import { handle } from "../worker.js";

test("GET /porte shows phrase, lamps, date honesty", async () => {
  const res = await handle(new Request("https://acorn-juge.example/porte"));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  const t = await res.text();
  assert.match(t, /Les certitudes ont une date de fin/);
  assert.match(t, /Certainties expire/);
  assert.match(t, /Acorn/);
  assert.match(t, /VERT/);
  assert.match(t, /AMBRE/);
  assert.match(t, /ROUGE/);
  assert.match(t, /Preview/);
  assert.match(t, /workers\.dev/);
  assert.match(t, /404 HOLD/);
  assert.doesNotMatch(t, /quantum-safe/);
  assert.doesNotMatch(t, /sealed forever/i);
});
