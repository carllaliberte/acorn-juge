# acorn-juge

**GET `/juge` — preview canal, not a receipt.**

Cloudflare Worker for the Acorn juge path. Same four keys as
[famille/schema/juge.v0.json](https://github.com/carllaliberte/famille/blob/main/schema/juge.v0.json).
It displays a preview. It does not sign. It does not mint a seal.

**Vitrine (nominative grok.me slug, not a FAMILLE-owned domain, not a seal):**
https://acorn-royal-dune-blend.grok.me

Doctrine: https://github.com/carllaliberte/famille — commit `d55799e` is the typed map.
Do not unwind it from this canal.

## Door

```
quelle + temoin + epsilon + horizon  →  GET /juge  →  JSON preview
```

| Field | Question | Honest values |
|---|---|---|
| `quelle` | Where did the bits come from? | `os` · `qrng` · `qkd` |
| `temoin` | With what force? | `aucun` · `stat` · `fabricant` · `di` |
| `epsilon` | What error margin? | a number **> 0** |
| `horizon` | Until which real calendar day? | Gregorian day that exists (`YYYY-MM-DD`). Syntax is not enough: `2027-02-31` → 400. Leap `2028-02-29` is a day. |

Worker `isCalendarDay` is **stricter** than famille [`juge.v0.json`](https://github.com/carllaliberte/famille/blob/main/schema/juge.v0.json) `horizon.pattern` (regex `YYYY-MM-DD` only). Écart documented, not hidden. Do not unwind the schema from this canal.

`os` is phone entropy. That is classique. Correct.
`ε = 0` is a lie. `UFHY1` is a suite name, not a date.
A 200 here is **APERÇU / CLASSIQUE**. Never QUANTUM. Never a quittance.

AI agents call this Worker the same way: query the four keys, read JSON.
They are not the judge. Judgment = Carl.

## Swarm (complementary, not a judge)

GitHub Action `.github/workflows/swarm.yml` comments on pull requests.
It does **not** replace `npm test`. It does not merge. It does not wrangler.

Architecture: Action → `.github/swarm/review.mjs` → Anthropic / OpenAI / DeepSeek / Gemini. Missing secret skips.

| Model | API id | When |
|---|---|---|
| Claude Sonnet 5 | `claude-sonnet-5` | every PR if `ANTHROPIC_API_KEY` |
| Claude Fable 5 | `claude-fable-5` | `/fable` or label `fable` (same Anthropic key; cost) |
| ChatGPT | `gpt-5.6-terra` | every PR if `OPENAI_API_KEY` |
| DeepSeek | `deepseek-v4-flash` | every PR if `DEEPSEEK_API_KEY` |
| Gemini | `gemini-3.8-flash` | every PR if `GEMINI_API_KEY` |

Commands are slash tokens (`/fable`), not path fragments. Carl adds those secrets under repo Settings → Secrets → Actions.
No secret → that model skips (fail-closed). Prompt: `.github/swarm/prompt.md`.

## Flux (PROPOSED — not a Worker canal)

Grok is chef. GitHub first. Four modes always, for every connected AI.
Heavy and Build always consult. Grok decides specialties, then writes under `flux/{mode}/{from}-to-{to}.md`.

Modes: Proposition, Consultation, Échanges, Challenge.
Future AIs connect as guests (max 8). Core seats stay locked.
Mesh of 13 core agents (Grok + Heavy + Build + 10), 156 directed canals, plus guests.

See [GROK.md](GROK.md) for the operating cycle.

```
/flux to:chatgpt from:grok mode:CONSULTATION
FLUX from:chatgpt to:grok act:RISK mode:CHALLENGE grade:PROPOSED
```

Code: `.github/swarm/flux.mjs`. Spec: [FLUX.md](FLUX.md). Directories: [flux/](flux/).
Do **not** bind `/flux` on the Worker. Unique host unchanged. Not LIVE VERIFIED.

CORS on JSON `/juge` and OPTIONS is allowlisted (vitrine + this Worker’s own `*.workers.dev` host), not `*`. Carl can widen later.

## Missing ε — FLAG, not a seal

Three consumers, one lie, one split. This repo does **not** collapse the
split into the SDK rule. GARDE fail-closes until they agree.

| Consumer | missing `epsilon` | `epsilon: 0` / `none` / `iid` |
|---|---|---|
| This Worker `GET /juge` | HTTP **400** `EPSILON_MISSING` | HTTP **400** `lie` |
| famille `sdk/peut-dire.js` (`d55799e`) | MODE **classique** (`manques`) | refus `lie` |
| [GARDE](https://github.com/carllaliberte/garde) | deny `EPSILON_MISSING` (fail closed) | deny `EPSILON_ZERO` |

Missing ε is not zero ε. Zero is a lie on every path.
Missing is **not aligned**. This canal keeps 400 and names the FLAG.

```bash
# FLAG — missing ε (no epsilon=)
curl -sS -w '\n%{http_code}\n' \
  'https://acorn-juge.<compte>.workers.dev/juge?quelle=os&temoin=aucun&horizon=2027-12-31'

# lie — ε = 0
curl -sS -w '\n%{http_code}\n' \
  'https://acorn-juge.<compte>.workers.dev/juge?quelle=os&temoin=aucun&epsilon=0&horizon=2027-12-31'

# preview — classique (phone entropy)
curl -sS \
  'https://acorn-juge.<compte>.workers.dev/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2027-12-31'
```

400 + `EPSILON_MISSING` = FLAG named.
400 + `Error margin zero is a lie` = canal open, zero refused.
200 + `"preview": true` + `"status": "CLASSIQUE"` = aperçu, not a receipt.

## What lives where

```
GET  /juge     this Worker — JSON preview
POST /attest   not this canal — JSON 404 (host is HTML 404)
GET  /         vitrine face — proxied to the grok.me slug
```

This is not a second `*.grok.me`. Deploy on `workers.dev`.
Do not paste another Grok Build slug as a live carte.

Juge cards stay juge cards. This door does not print UNFORGE-PREUVE cards.

## Verified (2026-09-03)

| Probe | Result |
|---|---|
| `GET https://acorn-royal-dune-blend.grok.me/` | **200** `text/html` — Famille vitrine |
| `GET …/juge` (with and without query) | **404** `text/html` — not JSON |
| `POST …/attest` | **404** `text/html` — not JSON |
| `GET …/c/preview00001` | **404** `text/html` |
| `https://acorn-juge.workers.dev` / `acorn-juge.carllaliberte.workers.dev` | **NXDOMAIN** — Worker not deployed yet |

## Assumed (non-binding)

- Carl deploys this Worker (`npx wrangler deploy`) before Heavy measures it.
- famille `d55799e` stays the SDK rule for missing ε → classique.
- GARDE keeps `EPSILON_MISSING` fail-closed until Worker and SDK share one rule.
- `qrng` / `qkd` on this canal may return `APERÇU` at type level. That is not a photon and not QUANTUM.

## Deploy

```bash
git clone https://github.com/carllaliberte/acorn-juge.git
cd acorn-juge
npm test
npx wrangler login
npx wrangler deploy
```

MIT License — this repository's code and documentation only. See [LICENSE](LICENSE) and [COPYRIGHT.md](COPYRIGHT.md).
This project is not formally verified.
QUANTUM is not licensed here. Preview ≠ receipt.
