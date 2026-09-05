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
- Missing `ε` → 400 `EPSILON_MISSING` (not the lie). Do not collapse into famille sdk `classique`.
- CORS never `Access-Control-Allow-Origin: *`
- POST `/attest` is not this canal (JSON 404)
- CODE VERIFIED ≠ TEST VERIFIED ≠ LIVE VERIFIED
- Worker horizon ⊃ famille schema: `isCalendarDay` (real Gregorian day). `juge.v0.json` `horizon.pattern` is regex `YYYY-MM-DD` only. Document the écart; do not hide it; do not unwind the schema from this canal.

## Format

FINDING / EVIDENCE / RISK / ACTION / TEST / RESULT / HANDOFF

## State (2026-09-05)

- `main` HEAD `c77a97e` — merge [PR #6](https://github.com/carllaliberte/acorn-juge/pull/6) (`canal: horizon must be a real calendar day`)
- CODE VERIFIED on `main`
- TEST VERIFIED on HEAD: `npm test` **30/30** (local, 2026-09-04 evening EDT). CI `preview` on PR #6: success.
- LIVE: **NOT LIVE VERIFIED**. Re-probe 2026-09-05T00:09Z:
  - `GET https://acorn-royal-dune-blend.grok.me/` → 200 `text/html` Famille vitrine
  - `GET …/juge` (bare and with query) → 404 `text/html` (not JSON)
  - `POST …/attest` → 404 `text/html`
  - `acorn-juge.workers.dev` / `acorn-juge.carllaliberte.workers.dev` → NXDOMAIN
- Known écart: Worker `isCalendarDay` rejects `2027-02-31`; famille `juge.v0.json` regex would accept the string. ε split named (`EPSILON_MISSING` ≠ `lie`).
- P2 (if P1 lands): GET `/` proxy currently forwards `req.headers` wholesale to the vitrine.

## Open decisions (Carl)

- When to `wrangler deploy` and bind `/juge` on the cited host
- Whether Worker missing-ε 400 and famille sdk classique should ever collapse (default: **no**)
- Merge of docs / P2 PRs. No bot deploys. No second `*.grok.me`.
