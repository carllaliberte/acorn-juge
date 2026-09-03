/**
 * acorn-juge — GET /juge preview canal.
 * Preview, not a receipt, not a seal, not QUANTUM.
 *
 * Face (vitrine, nominative grok.me slug — not a FAMILLE-owned domain):
 *   https://acorn-royal-dune-blend.grok.me
 *
 * Missing ε is a FLAG, not a lie and not an agreement:
 *   this Worker → 400 EPSILON_MISSING
 *   famille sdk (d55799e) → classique / manques
 *   GARDE → fail-closed EPSILON_MISSING until those two agree
 * Do not unwind d55799e. ε = 0 stays a lie.
 */

const ORIGIN = "https://acorn-royal-dune-blend.grok.me";
const QUELLE = ["os", "qrng", "qkd"];
const TEMOIN = ["aucun", "stat", "fabricant", "di"];
const PREVIEW_ID = "preview00001";

const PHRASE = Object.freeze({
  lie: "Error margin zero is a lie",
  missing:
    "Missing ε is not a zero margin. This canal returns 400. famille sdk (d55799e) treats missing ε as classique. GARDE fail-closes until they agree.",
  cards: "Unknown quelle or temoin",
  horizon: "Need a calendar end date",
  transcript: "Device-independent needs a transcript",
  method: "This canal is GET /juge",
  attest:
    "This canal is GET /juge. POST /attest is not served here. The grok.me vitrine returns HTML 404 for /attest (verified 2026-09-03).",
  classique: "Classical — phone entropy is not quantum",
  apercu: "Preview allow — not a receipt",
});

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type, accept",
      "access-control-max-age": "86400",
      "cache-control": "no-store",
    },
  });
}

function lireEpsilon(raw) {
  if (raw == null || String(raw).trim() === "") return { kind: "missing" };
  const v = String(raw).trim();
  if (v === "0" || v === "none" || v === "iid") return { kind: "lie" };
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return { kind: "lie" };
  return { kind: "ok", value: n };
}

function todayUTC(now) {
  return (now || new Date()).toISOString().slice(0, 10);
}

/**
 * Preview decision for one request. Pure enough to test.
 * @param {Request} req
 * @param {{ today?: string, fetchImpl?: typeof fetch }} [opts]
 */
export async function handle(req, opts = {}) {
  const url = new URL(req.url);
  const today = opts.today || todayUTC();
  const doFetch = opts.fetchImpl || fetch;

  if (req.method === "OPTIONS") return corsPreflight();

  if (url.pathname === "/attest") {
    return json(404, {
      error: "not_this_canal",
      preview: true,
      phrase: PHRASE.attest,
      juge: "/juge",
    });
  }

  if (url.pathname === "/juge") {
    if (req.method !== "GET") {
      return json(
        405,
        { error: "method", phrase: PHRASE.method, preview: true },
        { allow: "GET, OPTIONS" },
      );
    }
    return jugeGet(url.searchParams, today);
  }

  const u = new URL(url.pathname + url.search, ORIGIN);
  return doFetch(u.toString(), { method: req.method, headers: req.headers });
}

function jugeGet(p, today) {
  const quelle = p.get("quelle") || "os";
  const temoin =
    !p.get("temoin") || p.get("temoin") === "none" ? "aucun" : p.get("temoin");
  const horizon = p.get("horizon");
  const transcript = p.get("transcript");

  if (!QUELLE.includes(quelle) || !TEMOIN.includes(temoin)) {
    return json(400, {
      error: "cards",
      phrase: PHRASE.cards,
      preview: true,
    });
  }

  const eps = lireEpsilon(p.get("epsilon"));
  if (eps.kind === "missing") {
    return json(400, {
      error: "EPSILON_MISSING",
      preview: true,
      phrase: PHRASE.missing,
      consumers: {
        "acorn-juge": "400",
        "famille-sdk": "classique",
        garde: "EPSILON_MISSING",
      },
    });
  }
  if (eps.kind === "lie") {
    return json(400, {
      error: "lie",
      phrase: PHRASE.lie,
      preview: true,
    });
  }

  if (!horizon || !/^\d{4}-\d{2}-\d{2}$/.test(horizon) || horizon < today) {
    return json(400, {
      error: "horizon",
      phrase: PHRASE.horizon,
      preview: true,
    });
  }

  if (temoin === "di" && !transcript) {
    return json(400, {
      error: "transcript",
      phrase: PHRASE.transcript,
      preview: true,
    });
  }

  const status = quelle === "os" ? "CLASSIQUE" : "APERÇU";
  return json(200, {
    id: PREVIEW_ID,
    status,
    preview: true,
    receipt: false,
    quelle,
    temoin,
    epsilon: eps.value,
    horizon,
    phrase: status === "CLASSIQUE" ? PHRASE.classique : PHRASE.apercu,
  });
}

export { ORIGIN, PHRASE, lireEpsilon };

export default {
  async fetch(req) {
    return handle(req);
  },
};
