import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handle, lireEpsilon, isCalendarDay, ORIGIN, PHRASE } from "../worker.js";

const TODAY = "2026-09-03";
const HOST = "https://acorn-juge.example";

function req(path, init = {}) {
  return new Request(HOST + path, init);
}

async function call(path, init = {}) {
  return handle(req(path, init), { today: TODAY });
}

async function body(res) {
  return res.json();
}

describe("isCalendarDay", () => {
  it("rejects syntax-valid impossible days", () => {
    assert.equal(isCalendarDay("2027-02-31"), false);
    assert.equal(isCalendarDay("2026-11-31"), false);
    assert.equal(isCalendarDay("2027-02-29"), false);
    assert.equal(isCalendarDay("2026-13-01"), false);
    assert.equal(isCalendarDay("2027-00-10"), false);
    assert.equal(isCalendarDay("2027-01-32"), false);
    assert.equal(isCalendarDay("UFHY1"), false);
  });

  it("accepts real days including leap 2028-02-29", () => {
    assert.equal(isCalendarDay("2027-12-31"), true);
    assert.equal(isCalendarDay("2028-02-29"), true);
    assert.equal(isCalendarDay("2026-09-03"), true);
  });
});

describe("lireEpsilon", () => {
  it("names missing and empty as missing, not lie", () => {
    assert.equal(lireEpsilon(null).kind, "missing");
    assert.equal(lireEpsilon("").kind, "missing");
    assert.equal(lireEpsilon("  ").kind, "missing");
  });

  it("treats 0 / none / iid / non-finite as lie", () => {
    assert.equal(lireEpsilon("0").kind, "lie");
    assert.equal(lireEpsilon("none").kind, "lie");
    assert.equal(lireEpsilon("iid").kind, "lie");
    assert.equal(lireEpsilon("-1").kind, "lie");
    assert.equal(lireEpsilon("abc").kind, "lie");
  });

  it("accepts a finite margin > 0", () => {
    assert.deepEqual(lireEpsilon("1e-6"), { kind: "ok", value: 1e-6 });
    assert.deepEqual(lireEpsilon("0.01"), { kind: "ok", value: 0.01 });
  });
});

describe("GET /juge — missing-ε FLAG", () => {
  it("400 EPSILON_MISSING when epsilon is absent", async () => {
    const res = await call("/juge?quelle=os&temoin=aucun&horizon=2027-12-31");
    const j = await body(res);
    assert.equal(res.status, 400);
    assert.equal(j.error, "EPSILON_MISSING");
    assert.equal(j.preview, true);
    assert.equal(j.consumers["acorn-juge"], "400");
    assert.equal(j.consumers["famille-sdk"], "classique");
    assert.equal(j.consumers.garde, "EPSILON_MISSING");
    assert.match(j.phrase, /d55799e/);
    assert.notEqual(j.error, "lie");
  });

  it("400 EPSILON_MISSING when epsilon is empty", async () => {
    const res = await call(
      "/juge?quelle=os&temoin=aucun&epsilon=&horizon=2027-12-31",
    );
    const j = await body(res);
    assert.equal(res.status, 400);
    assert.equal(j.error, "EPSILON_MISSING");
  });

  it("400 lie when epsilon is 0 — not the FLAG", async () => {
    const res = await call(
      "/juge?quelle=os&temoin=aucun&epsilon=0&horizon=2027-12-31",
    );
    const j = await body(res);
    assert.equal(res.status, 400);
    assert.equal(j.error, "lie");
    assert.equal(j.phrase, PHRASE.lie);
    assert.equal(j.preview, true);
  });

  it("400 lie for none and iid", async () => {
    for (const epsilon of ["none", "iid"]) {
      const res = await call(
        `/juge?quelle=os&temoin=aucun&epsilon=${epsilon}&horizon=2027-12-31`,
      );
      const j = await body(res);
      assert.equal(res.status, 400);
      assert.equal(j.error, "lie", epsilon);
    }
  });
});

describe("GET /juge — preview, not a seal", () => {
  it("200 CLASSIQUE for os + ε>0 + future horizon", async () => {
    const res = await call(
      "/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2027-12-31",
    );
    const j = await body(res);
    assert.equal(res.status, 200);
    assert.equal(j.status, "CLASSIQUE");
    assert.equal(j.preview, true);
    assert.equal(j.receipt, false);
    assert.equal(j.quelle, "os");
    assert.equal(j.epsilon, 1e-6);
    assert.equal(j.horizon, "2027-12-31");
    assert.equal(j.phrase, PHRASE.classique);
    assert.equal(j.url, undefined);
    assert.ok(!JSON.stringify(j).includes("QUANTUM"));
  });

  it("200 APERÇU for qrng at type level — still preview", async () => {
    const res = await call(
      "/juge?quelle=qrng&temoin=stat&epsilon=0.01&horizon=2027-12-31",
    );
    const j = await body(res);
    assert.equal(res.status, 200);
    assert.equal(j.status, "APERÇU");
    assert.equal(j.preview, true);
    assert.equal(j.receipt, false);
    assert.equal(j.phrase, PHRASE.apercu);
    assert.ok(!JSON.stringify(j).includes("QUANTUM"));
  });

  it("400 cards on unknown quelle", async () => {
    const res = await call(
      "/juge?quelle=webcam&temoin=aucun&epsilon=1e-6&horizon=2027-12-31",
    );
    const j = await body(res);
    assert.equal(res.status, 400);
    assert.equal(j.error, "cards");
  });

  it("400 horizon on a past date", async () => {
    const res = await call(
      "/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2020-01-01",
    );
    const j = await body(res);
    assert.equal(res.status, 400);
    assert.equal(j.error, "horizon");
  });

  it("400 horizon on impossible calendar days that match YYYY-MM-DD", async () => {
    for (const horizon of [
      "2027-02-31",
      "2026-11-31",
      "2027-04-31",
      "2027-02-29",
      "2026-13-01",
      "2027-00-10",
      "2027-01-00",
    ]) {
      const res = await call(
        `/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=${horizon}`,
      );
      const j = await body(res);
      assert.equal(res.status, 400, horizon);
      assert.equal(j.error, "horizon", horizon);
      assert.equal(j.preview, true, horizon);
    }
  });

  it("200 on a real leap day after today", async () => {
    const res = await call(
      "/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2028-02-29",
    );
    const j = await body(res);
    assert.equal(res.status, 200);
    assert.equal(j.horizon, "2028-02-29");
    assert.equal(j.preview, true);
    assert.equal(j.receipt, false);
  });

  it("400 transcript when di has no transcript", async () => {
    const res = await call(
      "/juge?quelle=qkd&temoin=di&epsilon=1e-6&horizon=2027-12-31",
    );
    const j = await body(res);
    assert.equal(res.status, 400);
    assert.equal(j.error, "transcript");
  });

  it("JSON CORS and no-store on /juge", async () => {
    const res = await call(
      "/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2027-12-31",
    );
    assert.notEqual(res.headers.get("access-control-allow-origin"), "*");
    assert.equal(res.headers.get("access-control-allow-origin"), ORIGIN);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.match(res.headers.get("content-type"), /application\/json/);
  });

  it("405 JSON on POST /juge — not a proxied HTML page", async () => {
    const res = await call("/juge?quelle=os", { method: "POST" });
    const j = await body(res);
    assert.equal(res.status, 405);
    assert.equal(j.error, "method");
    assert.equal(j.preview, true);
  });
});

describe("POST /attest — honest miss, not HTML 404", () => {
  it("returns JSON 404 and does not fetch the vitrine", async () => {
    let fetched = 0;
    const res = await handle(req("/attest", { method: "POST" }), {
      today: TODAY,
      fetchImpl: async () => {
        fetched += 1;
        return new Response("<html>404</html>", {
          status: 404,
          headers: { "content-type": "text/html" },
        });
      },
    });
    const j = await body(res);
    assert.equal(fetched, 0);
    assert.equal(res.status, 404);
    assert.match(res.headers.get("content-type"), /application\/json/);
    assert.equal(j.error, "not_this_canal");
    assert.equal(j.juge, "/juge");
    assert.equal(j.preview, true);
  });
});

const PREVIEW =
  "/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2027-12-31";

function acao(res) {
  return res.headers.get("access-control-allow-origin");
}

describe("CORS allowlist — never *", () => {
  it("does not send Access-Control-Allow-Origin: * on JSON", async () => {
    const res = await call(PREVIEW);
    assert.notEqual(acao(res), "*");
  });

  it("does not send Access-Control-Allow-Origin: * on OPTIONS", async () => {
    const res = await call(PREVIEW, { method: "OPTIONS" });
    assert.equal(res.status, 204);
    assert.notEqual(acao(res), "*");
  });

  it("echoes the allowlisted vitrine Origin", async () => {
    const res = await call(PREVIEW, { headers: { origin: ORIGIN } });
    assert.equal(acao(res), ORIGIN);
    assert.notEqual(acao(res), "*");
  });

  it("echoes this Worker's own workers.dev Origin", async () => {
    const worker = "https://acorn-juge.example.workers.dev";
    const res = await handle(new Request(worker + PREVIEW, {
      headers: { origin: worker },
    }), { today: TODAY });
    assert.equal(acao(res), worker);
    assert.notEqual(acao(res), "*");
  });

  it("omits ACAO for an unknown Origin — does not send *", async () => {
    const res = await call(PREVIEW, {
      headers: { origin: "https://evil.example" },
    });
    assert.equal(acao(res), null);
    assert.notEqual(acao(res), "*");
    assert.notEqual(acao(res), "https://evil.example");
  });

  it("does not treat a foreign workers.dev Origin as allowlisted", async () => {
    const res = await call(PREVIEW, {
      headers: { origin: "https://other.workers.dev" },
    });
    assert.equal(acao(res), null);
    assert.notEqual(acao(res), "*");
  });

  it("OPTIONS echoes allowlisted Origin and never *", async () => {
    const res = await call("/juge", {
      method: "OPTIONS",
      headers: { origin: ORIGIN },
    });
    assert.equal(res.status, 204);
    assert.equal(acao(res), ORIGIN);
    assert.notEqual(acao(res), "*");
    assert.match(res.headers.get("access-control-allow-methods"), /GET/);
  });

  it("OPTIONS omits ACAO for an unknown Origin", async () => {
    const res = await call("/juge", {
      method: "OPTIONS",
      headers: { origin: "https://evil.example" },
    });
    assert.equal(res.status, 204);
    assert.equal(acao(res), null);
    assert.notEqual(acao(res), "*");
  });

  it("EPSILON_MISSING JSON still never sends *", async () => {
    const res = await call("/juge?quelle=os&temoin=aucun&horizon=2027-12-31", {
      headers: { origin: "https://evil.example" },
    });
    assert.equal(res.status, 400);
    const j = await body(res);
    assert.equal(j.error, "EPSILON_MISSING");
    assert.notEqual(acao(res), "*");
    assert.equal(acao(res), null);
  });
});

describe("vitrine proxy", () => {
  it("cites only the frozen acorn host", () => {
    assert.equal(ORIGIN, "https://acorn-royal-dune-blend.grok.me");
  });

  it("proxies GET / to the vitrine host", async () => {
    let seen = "";
    const res = await handle(req("/"), {
      today: TODAY,
      fetchImpl: async (u) => {
        seen = String(u);
        return new Response("face", {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      },
    });
    assert.equal(seen, ORIGIN + "/");
    assert.equal(res.status, 200);
    assert.equal(await res.text(), "face");
  });
});
