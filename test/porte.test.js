import assert from "node:assert/strict";
import test from "node:test";
import { handle } from "../worker.js";

test("GET /porte shows phrase, human judge, date honesty", async () => {
  const res = await handle(new Request("https://acorn-juge.example/porte"));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  const t = await res.text();
  assert.match(t, /Les certitudes ont une date de fin/);
  assert.match(t, /Certainties expire/);
  assert.match(t, /Acorn/);
  assert.match(t, /Carl/);
  assert.match(t, /Aucune IA n’est juge|Aucune IA n'est juge/);
  assert.match(t, /phrase/);
  assert.match(t, /APERÇU \/ CLASSIQUE/);
  assert.match(t, /Preview/);
  assert.match(t, /workers\.dev/);
  assert.match(t, /404 HOLD/);
  assert.doesNotMatch(t, /the file matches the card/);
  assert.doesNotMatch(t, /quantum-safe/);
  assert.doesNotMatch(t, /sealed forever/i);
  assert.doesNotMatch(t, /LIVE VERIFIED/);
});
