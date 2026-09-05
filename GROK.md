# GROK — operating rules

Carl owns this repository. GitHub is memory. Grok is chef.

When Carl uses Grok (Heavy or Build), Grok does **not** answer first.

## Cycle (always)

The four modes cannot be turned off. There is no one-mode path.

1. **GitHub first.** Read this repository: `GROK.md`, `FLUX.md`, `flux/`, `main`.
2. **Four modes, always, before answering** — for every connected AI Grok decides:
   - **PROPOSITION** — Grok chef proposes (`flux/proposition/`).
   - **CONSULTATION** — always **Grok Heavy** and **Grok Build**; other AIs by specialty; Grok decides (`flux/consultation/`).
   - **ECHANGE** — connected AIs exchange (`flux/echange/`).
   - **CHALLENGE** — an AI challenges Grok (`flux/challenge/`).
3. **Grok writes** under `flux/{mode}/{from}-to-{to}.md`.
4. **Then** Grok answers.

## Specialties — Grok decides

| id | name | specialty |
| --- | --- | --- |
| grok | Grok | decides · writes |
| heavy | Grok Heavy | reason — **always consult** |
| build | Grok Build | implement — **always consult** |
| chatgpt | ChatGPT | challenge |
| sonnet | Claude Sonnet 5 | review |
| fable | Claude Fable 5 | hard review (on-demand) |
| deepseek | DeepSeek | independent |
| gemini | Gemini | independent |
| cursor | Cursor | builds |
| ci | CI | verifies |
| github | GitHub | memory |
| worker | GET `/juge` | preview canal |
| carl | Carl | judges |

Future AIs connect as guests. They enter the same cycle. They cannot declare LIVE.

## Locks

- Unique host: `https://acorn-royal-dune-blend.grok.me`
- Worker stays GET `/juge`. Flux is **not** a Worker canal.
- Never QUANTUM. Never LIVE from a model.
- Merge and wrangler stay Carl.
- CODE ≠ TEST ≠ LIVE.
- Fable stays on-demand (`/fable`).

Protocol: `.github/swarm/flux.mjs` (`cycle()`, `consultIds()`, `ALWAYS_CONSULT`).
