# AI_SWARM — acorn-juge

Factual coordination memory. Not a seal. Not LIVE VERIFIED.

## Roles

| Agent | Role |
| --- | --- |
| Carl Laliberté | Owner / final judge. Merge. Wrangler bind. |
| Grok | Chief / orchestrator |
| ChatGPT | Adversarial reviewer (off-Git unless pasted) |
| Cursor | Implementation on rails |
| CI (`juge.yml`) | `npm test` on push/PR |

## Invariants

- Host vitrine only: `https://acorn-royal-dune-blend.grok.me`
- GET `/juge` is preview: `preview: true`, `receipt: false`
- Never QUANTUM from `os` / `qrng` / `qkd` / JSON
- `ε=0` / `none` / `iid` → 400 `lie` (“Error margin zero is a lie”)
- Missing `ε` → 400 `EPSILON_MISSING` (not the lie)
- CORS never `Access-Control-Allow-Origin: *`
- POST `/attest` is not this canal (JSON 404)
- CODE VERIFIED ≠ TEST VERIFIED ≠ LIVE VERIFIED

## Format

FINDING / EVIDENCE / RISK / ACTION / TEST / RESULT / HANDOFF

## State (2026-09-04)

- `main` at `7bd3c20` before horizon-calendar work
- Worker not bound to the vitrine. GET `https://acorn-royal-dune-blend.grok.me/juge` → HTML 404
- workers.dev deploy: not LIVE VERIFIED (issue #3: NXDOMAIN / not bound)
- Known P1: `horizon` was syntax `YYYY-MM-DD` only; impossible dates after today were accepted

## Open decisions (Carl)

- When to `wrangler deploy` and bind `/juge` on the cited host
- Whether Worker missing-ε 400 and famille sdk classique should ever collapse
