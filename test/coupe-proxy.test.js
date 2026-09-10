import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handle, ORIGIN } from "../worker.js";

const TODAY = "2026-09-03";
const HOST = "https://acorn-juge.example";

function req(path, init = {}) {
  return new Request(HOST + path, init);
}

async function call(path, init = {}) {
  return handle(req(path, init), { today: TODAY });
}

describe("coupe-proxy — no vitrine fetch", () => {
  it("GET / is 404 JSON not_this_canal and does not fetch ORIGIN", async () => {
    let fetched = 0;
    const res = await handle(req("/"), {
      today: TODAY,
      fetchImpl: async () => {
        fetched += 1;
        return new Response("face", { status: 200 });
      },
    });
    const j = await res.json();
    assert.equal(fetched, 0);
    assert.equal(res.status, 404);
    assert.equal(j.error, "not_this_canal");
    assert.equal(j.preview, true);
    assert.match(res.headers.get("content-type"), /application\/json/);
  });

  it("POST / is 404 JSON, not proxied HTML", async () => {
    const res = await call("/", { method: "POST" });
    const j = await res.json();
    assert.equal(res.status, 404);
    assert.equal(j.error, "not_this_canal");
  });

  it("GET /juge/ is 308 to /juge", async () => {
    const res = await call("/juge/?quelle=os");
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("location"), "/juge?quelle=os");
  });

  it("qkd + temoin=aucun stays CLASSIQUE", async () => {
    const res = await call(
      "/juge?quelle=qkd&temoin=aucun&epsilon=1e-6&horizon=2027-12-31",
    );
    const j = await res.json();
    assert.equal(res.status, 200);
    assert.equal(j.status, "CLASSIQUE");
    assert.equal(j.receipt, false);
    assert.ok(!JSON.stringify(j).includes("QUANTUM"));
  });

  it("transcript bell-ok is refused", async () => {
    const res = await call(
      "/juge?quelle=qkd&temoin=di&epsilon=1e-6&horizon=2027-12-31&transcript=bell-ok",
    );
    const j = await res.json();
    assert.equal(res.status, 400);
    assert.equal(j.error, "transcript");
  });

  it("ORIGIN remains the vitrine slug only", () => {
    assert.equal(ORIGIN, "https://acorn-royal-dune-blend.grok.me");
  });
});
