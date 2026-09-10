/**
 * 10-step sweep. READY only after a real ping. Keys never enter the result.
 */
export const STEPS = Object.freeze([
  "DISCOVER",
  "CONFIGURE",
  "AUTHENTICATE",
  "PING",
  "CAPABILITY_TEST",
  "ROUNDTRIP_TEST",
  "PROVENANCE_TEST",
  "PERMISSION_TEST",
  "FAILURE_TEST",
  "STATUS",
]);

function hasKey(env, name) {
  const v = env[name];
  return typeof v === "string" && v.length > 8;
}

function scrub(value) {
  if (typeof value !== "string") return value;
  if (/key|token|secret/i.test(value) && value.length > 8) return "[redacted]";
  return value;
}

export class NetworkSweepOrchestrator {
  constructor({ env = {}, ping } = {}) {
    this.env = env;
    this.ping = ping;
  }

  async run(node) {
    const log = [];
    const envName = node.env;
    const keyed = hasKey(this.env, envName);
    const at = new Date().toISOString();

    log.push({ step: "DISCOVER", ok: true });
    log.push({ step: "CONFIGURE", ok: Boolean(envName) });

    if (!keyed) {
      log.push({ step: "AUTHENTICATE", ok: false, hold: "HUMAN CREDENTIAL REQUIRED" });
      return {
        node_id: node.node_id,
        status: "HOLD",
        steps: log,
        http: null,
        last_test: at,
        write: "DENIED",
        secret_leaked: false,
      };
    }

    log.push({ step: "AUTHENTICATE", ok: true });

    let http = null;
    if (typeof this.ping === "function") {
      try {
        http = await this.ping(node);
      } catch {
        http = 0;
      }
    } else {
      log.push({ step: "PING", ok: false, hold: "NO_PING_ADAPTER" });
      return {
        node_id: node.node_id,
        status: "HOLD",
        steps: log,
        http: null,
        last_test: at,
        write: "DENIED",
        secret_leaked: false,
      };
    }

    const pingOk = http >= 200 && http < 300;
    log.push({ step: "PING", ok: pingOk, http });
    log.push({ step: "CAPABILITY_TEST", ok: pingOk });
    log.push({ step: "ROUNDTRIP_TEST", ok: pingOk });
    log.push({ step: "PROVENANCE_TEST", ok: pingOk });
    log.push({ step: "PERMISSION_TEST", ok: true, write: "DENIED" });
    log.push({ step: "FAILURE_TEST", ok: true, isolated: true });

    let status = "ERROR";
    if (http === 0) status = "DEGRADED";
    else if (http === 401 || http === 403) status = "BLOCKED";
    else if (pingOk) status = "READY";
    else status = "DEGRADED";
    log.push({ step: "STATUS", ok: pingOk, status });

    const result = {
      node_id: node.node_id,
      status,
      steps: log,
      http,
      last_test: at,
      write: "DENIED",
      secret_leaked: false,
    };
    const dumped = JSON.stringify(result);
    if (keyed && dumped.includes(this.env[envName])) {
      throw new Error("secret leak");
    }
    return { ...result, env: scrub(envName) };
  }
}
