# FLUX — acorn.v0

Chef mesh. **Grok is chef.** GitHub is memory. **Four modes always**, for every connected AI. **PROPOSED.** Not a Worker canal. Not LIVE VERIFIED.

When Carl uses Grok, Grok reads this repository, runs the four modes, then answers. See [GROK.md](GROK.md).

Unique host: `https://acorn-royal-dune-blend.grok.me`

## Cycle (always)

The four modes cannot be turned off. There is no one-mode path. `MODES_ALWAYS = true`.

1. GitHub first (this repo).
2. **PROPOSITION** — Grok chef to all connected AIs.
3. **CONSULTATION** — always Grok Heavy and Grok Build; others by specialty; Grok decides.
4. **ECHANGE** — connected AIs exchange.
5. **CHALLENGE** — an AI challenges Grok.
6. Grok writes under `flux/{mode}/`. Then answers.

## Modes

| mode | who speaks | who is addressed |
| --- | --- | --- |
| **PROPOSITION** | Grok chef only | one AI, or `*` all connected |
| **CONSULTATION** | Grok chef only | one AI (not `*`). Heavy and Build always. |
| **ECHANGE** | any connected AI | any other, including `*` |
| **CHALLENGE** | an AI or Grok | must include Grok |

## Directories — Grok writes here

```
flux/{mode}/{from}-to-{to}.md
```

Broadcast `to:*` becomes `flux/{mode}/{from}-to-all.md`, then one copy per destination.

Path is memory, not a seal. Later packets on the same canal append.

## Agents

Core seats are locked. Future AIs connect as **guests** (max 8). Guests cannot declare LIVE. They have no Worker canal. They enter the four-mode cycle.

| id | name | kind | specialty |
| --- | --- | --- | --- |
| grok | Grok | chef | decides · writes |
| heavy | Grok Heavy | consult | reason — **always consult** |
| build | Grok Build | consult | implement — **always consult** |
| chatgpt | ChatGPT | model | challenge |
| sonnet | Claude Sonnet 5 | model | review |
| fable | Claude Fable 5 | model | hard review (on-demand) |
| deepseek | DeepSeek | model | independent |
| gemini | Gemini | model | independent |
| cursor | Cursor | seat | builds |
| ci | CI | seat | verifies (`juge.yml`) |
| github | GitHub | seat | remembers |
| worker | GET `/juge` | seat | preview canal |
| carl | Carl | seat | judges |

Suggested guests (not connected until asked): copilot, llama, mistral, qwen, opus.

Directed canals: **156** core (13 × 12), plus guests. All directions, with mode locks above.

Protocol: `cycle()`, `consultIds()`, `ALWAYS_CONSULT` in `.github/swarm/flux.mjs`.

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
- Not a pipeline of equals. Grok is chef. Heavy and Build always consult. Grok decides.

## Handoff

Carl: merge this if you want four modes always-on (`MODES_ALWAYS`) on `main`. Secrets still yours. Wrangler still yours. Do not merge unless you want the lock.

ChatGPT: challenge whether a cycle that always consults Heavy and Build, then writes files, is real interoperability — or theatre until those consults actually call a model.
