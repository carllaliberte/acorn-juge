# AI_SWARM — acorn-juge

Factual coordination memory. Not a seal. Not LIVE VERIFIED.

## Roles

| Agent | Role |
| --- | --- |
| Carl Laliberté | Owner / final judge. Merge. Wrangler bind. Secrets. |
| Grok | Chief / orchestrator |
| Claude Sonnet 5 | PR review + test/docs notes (`claude-sonnet-5`). Auto if `ANTHROPIC_API_KEY`. |
| Claude Fable 5 | Hard review, on-demand (`claude-fable-5`). `/fable` or label `fable`. Same Anthropic key. |
| ChatGPT | Adversarial reviewer (`gpt-5.6-terra`). Auto if `OPENAI_API_KEY`. |
| DeepSeek | Independent review (`deepseek-v4-flash`). Auto if `DEEPSEEK_API_KEY`. |
| Gemini | Independent review (`gemini-3.8-flash`). Auto if `GEMINI_API_KEY`. |
| Cursor | Implementation on rails |
| CI (`juge.yml`) | `npm test` on push/PR — the lock |
| CI (`swarm.yml`) | Complementary comments. `continue-on-error`. Does not replace tests. |
| Flux (`acorn.v0`) | Mesh addressing. GitHub memory. Not a Worker canal. PROPOSED. |

None of the models merge, deploy, or declare LIVE.

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
- GET `/` proxy allowlists `accept` + `accept-language` only.
- Flux is not a Worker route. Do not add `/flux` to `worker.js`. Do not invent a second host.

## Format

FINDING / EVIDENCE / RISK / ACTION / TEST / RESULT / HANDOFF

## Swarm wiring

Architecture: GitHub Action `.github/workflows/swarm.yml` → `.github/swarm/review.mjs` → Anthropic / OpenAI / DeepSeek / Gemini. Prompt: `.github/swarm/prompt.md`. Comments only.

Comments on a PR: `/swarm` `/sonnet` `/fable` `/fabre` `/chatgpt` `/deepseek` `/gemini`

Commands are **slash tokens** at the start of a word (`/fable`), not path fragments (`.github/swarm/prompt.md` is not `/swarm`). `labeled` only runs Fable when the added label is `fable` / `fabre`. An `issue_comment` without a token does not default to auto.

Carl secrets (Actions, never in git):

| Secret | Models |
| --- | --- |
| `ANTHROPIC_API_KEY` | Sonnet 5 (auto) + Fable 5 (on-demand) |
| `OPENAI_API_KEY` | ChatGPT |
| `DEEPSEEK_API_KEY` | DeepSeek |
| `GEMINI_API_KEY` | Gemini |

Missing secret → skip that model (fail-closed). Job is `continue-on-error`. Fork PRs have no secrets.

Fable 5 adaptive thinking is always on; the caller uses `max_tokens: 8192` so text is not eaten by thinking.

## State (2026-09-05)

- `main` HEAD `0ae36bc` — merge PR #10 (swarm reviewers)
- CODE VERIFIED on `main` (calendar day + header allowlist + swarm wiring)
- TEST VERIFIED on HEAD: `npm test` **45/45** before this flux PR (32 Worker + 13 swarm)
- LIVE: **NOT LIVE VERIFIED**. `GET …/juge` still HTML 404. `*.workers.dev` NXDOMAIN
- Flux: **PROPOSED**. Mesh 11 × 10 = 110 directed canals. Envelope in `.github/swarm/flux.mjs`. Not a Worker canal. Not LIVE.

## Open decisions (Carl)

- Add the four Actions secrets (or a subset)
- When to `wrangler deploy` and bind `/juge` on the cited host
- Whether Worker missing-ε 400 and famille sdk classique should ever collapse (default: **no**)
- Pin Fable 5 (`claude-fable-5`, this PR, as requested) vs Fable 5.1 (`claude-fable-5-1`). Not auto-upgraded.
- No bot deploys. No second `*.grok.me`.
