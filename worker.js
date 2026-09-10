/**
 * acorn-juge — GET /juge preview canal.
 * GET /privacy, GET /legal and GET /porte are served here (not origin proxy).
 * Preview, not a receipt, not a seal, not QUANTUM.
 * Unknown paths do NOT proxy the vitrine (audit 2026-09-10).
 */

import { legalDocument, privacyDocument, porteDocument } from "./pages.js";

const ORIGIN = "https://acorn-royal-dune-blend.grok.me";
const QUELLE = ["os", "qrng", "qkd"];
const TEMOIN = ["aucun", "stat", "fabricant", "di"];
const TRANSCRIPT_OK = /^[A-Za-z0-9._:-]{16,128}$/;
const TRANSCRIPT_DENY = new Set(["bell-ok", "fake", "simule", "simulated", "true", "ok", "pass"]);

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
    "This canal is GET /juge. POST /attest is not served here. The grok.me vitrine returns HTML 404 for /attest.",
  notThis: "Unknown path. This Worker does not proxy the vitrine.",
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

function isCalendarDay(value) {
  if (value == null) return false;
  const s = String(value);
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(s)) return false;
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

function transcriptOk(raw) {
  if (raw == null) return false;
  const s = String(raw).trim();
  if (!s) return false;
  if (TRANSCRIPT_DENY.has(s.toLowerCase())) return false;
  return TRANSCRIPT_OK.test(s);
}

function appareilNomme(raw) {
  if (raw == null) return false;
  const s = String(raw).trim();
  return s.length >= 3 && s.length <= 64 && !TRANSCRIPT_DENY.has(s.toLowerCase());
}

const PROXY_REQUEST_HEADERS = ["accept", "accept-language"];

function proxyRequestHeaders(req) {
  const out = new Headers();
  for (const name of PROXY_REQUEST_HEADERS) {
    const v = req.headers.get(name);
    if (v != null && String(v).trim() !== "") out.set(name, v);
  }
  return out;
}

export async function handle(req, opts = {}) {
  const url = new URL(req.url);
  const today = opts.today || todayUTC();

  if (req.method === "OPTIONS") return corsPreflight(req);

  if (url.pathname === "/juge/") {
    return new Response(null, {
      status: 308,
      headers: {
        location: "/juge" + url.search,
        ...corsHeaders(req),
        "cache-control": "no-store",
      },
    });
  }

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

  if (url.pathname === "/privacy" || url.pathname === "/legal" || url.pathname === "/porte") {
    if (req.method !== "GET") {
      return json(req, 405, { error: "method", preview: true }, { allow: "GET, OPTIONS" });
    }
    const doc =
      url.pathname === "/privacy"
        ? privacyDocument()
        : url.pathname === "/legal"
          ? legalDocument()
          : porteDocument();
    return html(req, doc);
  }

  return json(req, 404, {
    error: "not_this_canal",
    preview: true,
    phrase: PHRASE.notThis,
    juge: "/juge",
  });
}

function jugeGet(req, p, today) {
  const quelle = p.get("quelle") || "os";
  const temoin =
    !p.get("temoin") || p.get("temoin") === "none" ? "aucun" : p.get("temoin");
  const horizon = p.get("horizon");
  const transcript = p.get("transcript");
  const appareil = p.get("appareil");

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

  if (temoin === "di" && !transcriptOk(transcript)) {
    return json(req, 400, {
      error: "transcript",
      phrase: PHRASE.transcript,
      preview: true,
    });
  }

  const temoinTient =
    quelle === "qkd"
      ? temoin === "di" && transcriptOk(transcript) && appareilNomme(appareil)
      : quelle === "qrng"
        ? (temoin === "stat" || temoin === "fabricant") && appareilNomme(appareil)
        : false;

  const status = quelle === "os" || !temoinTient ? "CLASSIQUE" : "APERÇU";
  return json(req, 200, {
    id: "preview-" + today,
    status,
    preview: true,
    receipt: false,
    quelle,
    temoin,
    epsilon: eps.value,
    horizon,
    as_of: today,
    phrase: status === "CLASSIQUE" ? PHRASE.classique : PHRASE.apercu,
  });
}

export {
  ORIGIN,
  PHRASE,
  lireEpsilon,
  isCalendarDay,
  proxyRequestHeaders,
  PROXY_REQUEST_HEADERS,
  transcriptOk,
  appareilNomme,
};

export default {
  async fetch(req) {
    return handle(req);
  },
};
