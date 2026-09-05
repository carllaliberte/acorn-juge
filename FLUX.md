# FLUX — acorn.v0

Chef mesh. **Grok is chef.** Grok writes under `flux/`. **PROPOSED.** Not a Worker canal. Not LIVE VERIFIED.

Unique host: `https://acorn-royal-dune-blend.grok.me`

## Modes

| mode | who speaks | who is addressed |
| --- | --- | --- |
| **PROPOSITION** | Grok chef only | one AI, or `*` all connected |
| **CONSULTATION** | Grok chef only | one AI (not `*`) |
| **ECHANGE** | any connected AI | any other, including `*` |
| **CHALLENGE** | an AI or Grok | must include Grok |

## Directories — Grok writes here

Every accepted packet is filed:

```
flux/{mode}/{from}-to-{to}.md
```

Broadcast `to:*` becomes `flux/{mode}/{from}-to-all.md`, then one copy per destination.

| path | meaning |
| --- | --- |
| `flux/proposition/` | Grok proposes |
| `flux/consultation/` | Grok asks one AI |
| `flux/echange/` | all directions |
| `flux/challenge/` | an AI with Grok |

Path is memory, not a seal. Later packets on the same canal append.

## Agents

Core seats are locked. Future AIs connect as **guests** (max 8). Guests cannot declare LIVE. They have no Worker canal.

| id | name | kind | role |
| --- | --- | --- | --- |
| grok | Grok | chef | chef — writes in `flux/` |
| chatgpt | ChatGPT | model | challenges |
| sonnet | Claude Sonnet 5 | model | reviews |
| fable | Claude Fable 5 | model | hard review (on-demand) |
| deepseek | DeepSeek | model | independent |
| gemini | Gemini | model | independent |
| cursor | Cursor | seat | builds |
| ci | CI | seat | verifies (`juge.yml`) |
| github | GitHub | seat | remembers |
| worker | GET `/juge` | seat | preview canal |
| carl | Carl | seat | judges |

Suggested guests (not connected until asked): copilot, llama, mistral, qwen, opus.

Directed canals: **110** core (11 × 10), plus guests. All directions, with mode locks above.

## Envelope

```
FLUX from:chatgpt to:grok act:RISK mode:CHALLENGE grade:PROPOSED
path: flux/challenge/chatgpt-to-grok.md
chef: grok

body…

_flux acorn.v0 · chef:grok · preview:true · receipt:false · not LIVE_VERIFIED_
```

JSON: `flux`, `id`, `ts`, `chef`, `from`, `to` (`*` = broadcast), `act`, `mode`, `grade`, `body`, `replyTo`, `path`.

Acts: FINDING / EVIDENCE / RISK / ACTION / TEST / RESULT / HANDOFF

## Grades (locked to speaker)

| grade | who may claim |
| --- | --- |
| PROPOSED | anyone connected |
| NOT LIVE VERIFIED | anyone connected |
| TEST VERIFIED | `ci`, `carl` |
| CODE VERIFIED | `github`, `carl` |
| LIVE VERIFIED | `carl` only — and only after wrangler bind with JSON proof on the cited host. This module never makes the vitrine live. |

## Fail-closed

- `QUANTUM` as a claim → refuse (`FORBIDDEN_QUANTUM`). “Never QUANTUM” is allowed.
- Second `*.grok.me` → refuse.
- Creating POST `/attest` as a canal → refuse.
- `wrangler deploy` as ACTION from anyone but Carl → refuse.
- LIVE VERIFIED from a model → refuse.
- PROPOSITION / CONSULTATION from anyone but Grok → refuse.
- CONSULTATION to `*` → refuse.
- CHALLENGE that does not include Grok → refuse.
- Missing body, unknown agent, from=to → refuse.
- Always `preview: true`, `receipt: false`.
- Reserved guest ids: `attest`, `quantum`, `live`, `wrangler`, `admin`, `root`, `chef`, `*`.

## GitHub wiring

`.github/swarm/flux.mjs` validates. `review.mjs` routes:

- `/flux to:chatgpt` → ChatGPT only, reply addressed back to `from` (CHALLENGE if Grok is in the canal)
- `/flux to:*` → auto models (not Fable)
- `/flux to:carl` → store envelope, no provider call
- Fable still `/fable` or label `fable` (cost)

Slash tokens, not path fragments. Missing secret → skip.

## Not this

- Not a Worker route. Do not add `/flux` to `worker.js`.
- Not a second grok.me.
- Not `/attest`.
- Not a seal. CODE ≠ TEST ≠ LIVE.
- Not a pipeline. Grok is chef, not an equal node.

## Handoff

Carl: merge this protocol if you want chef directories on `main`. Secrets still yours. Wrangler still yours.

ChatGPT: challenge whether writing `flux/` files is real memory, or theatre next to GitHub comments — and whether a guest registry without a provider is a door or a sticker.
