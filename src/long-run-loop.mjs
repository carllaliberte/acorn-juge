/**
 * One tick at a time. Never while(true). Never blocks the event loop.
 */
export const PHASES = Object.freeze([
  "OBSERVE",
  "AUDIT",
  "CARTOGRAPHIE",
  "IDENTIFIE",
  "TESTE",
  "CONSTRUIT",
  "MESURE",
  "REEVALUE",
  "RECOMMENCE",
]);

export class LongRunLoopEngine {
  constructor() {
    this.i = 0;
    this.running = false;
  }

  tick(findings = []) {
    const phase = PHASES[this.i % PHASES.length];
    this.i += 1;
    const useful = findings.filter(Boolean);
    return {
      phase,
      index: this.i,
      useful_work: useful,
      next: useful[0] || "HOLD human credentials — no invented work",
      blocked: false,
      auto_merge: false,
      write: "DENIED",
    };
  }

  detectUsefulWork({ testsFailed = 0, missingKeys = [], secretsInLogs = false } = {}) {
    const out = [];
    if (testsFailed > 0) out.push("fix failing tests");
    if (missingKeys.length) out.push("HOLD HUMAN CREDENTIAL REQUIRED");
    if (secretsInLogs) out.push("CRITICAL secret leak");
    return out;
  }
}
