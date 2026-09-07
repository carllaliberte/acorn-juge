/**
 * acorn-juge — GET /juge preview canal.
 * GET /privacy and GET /legal are served here (not origin proxy).
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

import { legalDocument, privacyDocument } from "./pages.js";

const ORIGIN = "https://acorn-royal-dune-blend.grok.me";
const QUELLE = ["os", "qrng", "qkd"];
const TEMOIN = ["aucun", "stat", "fabricant", "di"];
const PREVIEW_ID = "preview00001";

/**
 * CORS allowlist for JSON / OPTIONS. Carl can widen later.
 * Start here only — do not invent extra domains:
 *   - ORIGIN (vitrine)
 *   - this Worker's own *.workers.dev host when deployed (from req.url)
 * Never send Access-Control-Allow-Origin: *.
 */
function parseOrigin(value) {
  if (value == null || String(value).trim() === "") return null;
  try {
    const u = new URL(String(value).trim());
    if (u.origin === "null" || u.username || u.password) return null;
    return u.origin;
  } catch {
    return null;
  }
}

function workerDevOrigin(req) {
  const self = parseOrigin(new URL(req.url).origin);
  if (!self) return null;
  const host = new URL(self).hostname;
  if (host.endsWith(".workers.dev")) return self;
  return null;
}

function isAllowlistedOrigin(origin, req) {
  const incoming = parseOrigin(origin);
  if (!incoming) return false;
  if (incoming === ORIGIN) return true;
  const selfDev = workerDevOrigin(req);
  return selfDev != null && incoming === selfDev;
}

function reflectAllowlistedOrigin(req) {
  const incoming = req.headers.get("Origin");
  if (incoming == null || String(incoming).trim() === "") {
    // no Origin: same-origin / non-browser — advertise the vitrine, never *
    return ORIGIN;
  }
  if (isAllowlistedOrigin(incoming, req)) return parseOrigin(incoming);
  return null;
}

function corsHeaders(req) {
  const headers = { vary: "Origin" };
  const allowed = reflectAllowlistedOrigin(req);
  if (allowed) headers["access-control-allow-origin"] = allowed;
  return headers;
}

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

function json(req, status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(req),
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

function corsPreflight(req) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(req),
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type, accept",
      "access-control-max-age": "86400",
      "cache-control": "no-store",
    },
  });
}

function html(req, document) {
  return new Response(document, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...corsHeaders(req),
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

/**
 * Real Gregorian calendar day, not YYYY-MM-DD syntax.
 * Date.UTC rollover (Feb 31 → Mar) fails the round-trip.
 */
function isCalendarDay(value) {
  if (value == null) return false;
  const s = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(5, 7));
  const d = Number(s.slice(8, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function todayUTC(now) {
  return (now || new Date()).toISOString().slice(0, 10);
}

/**
 * Hop-by-hop and credential headers stay here.
 * GET / forwards an allowlist only — never Cookie, Authorization, or *.
 */
const PROXY_REQUEST_HEADERS = ["accept", "accept-language"];

function proxyRequestHeaders(req) {
  const out = new Headers();
  for (const name of PROXY_REQUEST_HEADERS) {
    const v = req.headers.get(name);
    if (v != null && String(v).trim() !== "") out.set(name, v);
  }
  return out;
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

  if (req.method === "OPTIONS") return corsPreflight(req);

  if (url.pathname === "/attest") {
    return json(req, 404, {
      error: "not_this_canal",
      preview: true,
      phrase: PHRASE.attest,
      juge: "/juge",
    });
  }

  if (url.pathname === "/juge") {
    if (req.method !== "GET") {
      return json(
        req,
        405,
        { error: "method", phrase: PHRASE.method, preview: true },
        { allow: "GET, OPTIONS" },
      );
    }
    return jugeGet(req, url.searchParams, today);
  }

  if (url.pathname === "/privacy" || url.pathname === "/legal") {
    if (req.method !== "GET") {
      return json(req, 405, { error: "method", preview: true }, { allow: "GET, OPTIONS" });
    }
    return html(
      req,
      url.pathname === "/privacy" ? privacyDocument() : legalDocument(),
    );
  }

  const u = new URL(url.pathname + url.search, ORIGIN);
  return doFetch(u.toString(), {
    method: req.method,
    headers: proxyRequestHeaders(req),
  });
}

function jugeGet(req, p, today) {
  const quelle = p.get("quelle") || "os";
  const temoin =
    !p.get("temoin") || p.get("temoin") === "none" ? "aucun" : p.get("temoin");
  const horizon = p.get("horizon");
  const transcript = p.get("transcript");

  if (!QUELLE.includes(quelle) || !TEMOIN.includes(temoin)) {
    return json(req, 400, {
      error: "cards",
      phrase: PHRASE.cards,
      preview: true,
    });
  }

  const eps = lireEpsilon(p.get("epsilon"));
  if (eps.kind === "missing") {
    return json(req, 400, {
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
    return json(req, 400, {
      error: "lie",
      phrase: PHRASE.lie,
      preview: true,
    });
  }

  if (!isCalendarDay(horizon) || horizon < today) {
    return json(req, 400, {
      error: "horizon",
      phrase: PHRASE.horizon,
      preview: true,
    });
  }

  if (temoin === "di" && !transcript) {
    return json(req, 400, {
      error: "transcript",
      phrase: PHRASE.transcript,
      preview: true,
    });
  }

  const status = quelle === "os" ? "CLASSIQUE" : "APERÇU";
  return json(req, 200, {
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

export { ORIGIN, PHRASE, lireEpsilon, isCalendarDay, proxyRequestHeaders, PROXY_REQUEST_HEADERS };

export default {
  async fetch(req) {
    return handle(req);
  },
};
