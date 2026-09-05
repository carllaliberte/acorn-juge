# FLUX — acorn.v0

Interoperability bus. Mesh, not a pipeline. **PROPOSED.** Not a Worker canal. Not LIVE VERIFIED.

Every named agent may address every other, including broadcast `to:*`.
GitHub comments are memory. GET `/juge` stays GET `/juge`.

Unique host: `https://acorn-royal-dune-blend.grok.me`

## Agents (11)

| id | name | role |
| --- | --- | --- |
| grok | Grok | orchestrates |
| chatgpt | ChatGPT | challenges |
| sonnet | Claude Sonnet 5 | reviews |
| fable | Claude Fable 5 | hard review (on-demand) |
| deepseek | DeepSeek | independent |
| gemini | Gemini | independent |
| cursor | Cursor | builds |
| ci | CI | verifies (`juge.yml`) |
| github | GitHub | remembers |
| worker | GET `/juge` | preview canal |
| carl | Carl | judges |

Directed canals: **110** (11 × 10). All directions.

## Envelope

```
FLUX from:grok to:chatgpt act:HANDOFF grade:PROPOSED

body…

_flux acorn.v0 · preview:true · receipt:false · not LIVE_VERIFIED_
```

JSON (same fields): `flux`, `id`, `ts`, `from`, `to` (`*` = broadcast), `act`, `grade`, `body`, `replyTo`.

Acts: FINDING / EVIDENCE / RISK / ACTION / TEST / RESULT / HANDOFF

## Grades (locked to speaker)

| grade | who may claim |
| --- | --- |
| PROPOSED | anyone |
| NOT LIVE VERIFIED | anyone |
| TEST VERIFIED | `ci`, `carl` |
| CODE VERIFIED | `github`, `carl` |
| LIVE VERIFIED | `carl` only — and only after wrangler bind with JSON proof on the cited host. This module never makes the vitrine live. |

## Fail-closed

- `QUANTUM` as a claim → refuse (`FORBIDDEN_QUANTUM`). “Never QUANTUM” is allowed.
- Second `*.grok.me` → refuse.
- Creating POST `/attest` as a canal → refuse.
- `wrangler deploy` as ACTION from anyone but Carl → refuse.
- LIVE VERIFIED from a model → refuse.
- Missing body, unknown agent, from=to → refuse.
- Always `preview: true`, `receipt: false`.

## GitHub wiring

`.github/swarm/flux.mjs` validates. `review.mjs` routes:

- `/flux to:chatgpt` → ChatGPT only, reply addressed back to `from`
- `/flux to:*` → auto models (not Fable)
- `/flux to:carl` → store envelope, no provider call
- Fable still `/fable` or label `fable` (cost)

Slash tokens, not path fragments. Missing secret → skip.

## Not this

- Not a Worker route. Do not add `/flux` to `worker.js`.
- Not a second grok.me.
- Not `/attest`.
- Not a seal. CODE ≠ TEST ≠ LIVE.

## Handoff

Carl: merge this protocol if you want addressing on PR comments. Secrets still yours. Wrangler still yours.

ChatGPT: refute whether 110 edges is theatre without GitHub memory, and whether wrapping swarm comments in FLUX envelopes hides a failed review.
