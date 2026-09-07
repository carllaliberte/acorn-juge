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
|---|---|
| `quelle` | Where did the bits come from? | `os` · `qrng` · `qkd` |
| `temoin` | With what force? | `aucun` · `stat` · `fabricant` · `di` |
| `epsilon` | What error margin? | a number **> 0** |
| `horizon` | Until which calendar day? | `YYYY-MM-DD` |

`os` is phone entropy. That is classique. Correct.
`ε = 0` is a lie. `UFHY1` is a suite name, not a date.
A 200 here is **APERÇU / CLASSIQUE**. Never QUANTUM. Never a quittance.

AI agents call this Worker the same way: query the four keys, read JSON.
They are not the judge. Judgment = Carl.

CORS on JSON `/juge` and OPTIONS is allowlisted (vitrine + this Worker’s own `*.workers.dev` host), not `*`.

When this Worker is in front of the host, `GET /privacy` and `GET /legal`
are served here (human-readable HTML; same substance as [PRIVACY.md](PRIVACY.md)
and the MIT / copyright facts in [LICENSE](LICENSE) / [COPYRIGHT.md](COPYRIGHT.md)).
They do not proxy to the nominative grok.me origin. Hitting that origin
without the Worker in front may still 404. A Carl bind limited to `/juge*`
does not deliver those paths. This PR does not patch the origin host.

## Missing ε — FLAG, not a seal

| Consumer | missing `epsilon` | `epsilon: 0` / `none` / `iid` |
|---|---|---|
| This Worker `GET /juge` | HTTP **400** `EPSILON_MISSING` | HTTP **400** `lie` |
| famille `sdk/peut-dire.js` (`d55799e`) | MODE **classique** (`manques`) | refus `lie` |
| [GARDE](https://github.com/carllaliberte/garde) | deny `EPSILON_MISSING` | deny `EPSILON_ZERO` |

## HOLD — 2026-09-05

`worker.js` already returns 400 JSON + `Error margin zero is a lie` when `ε=0`.
Do not patch that again.

The vitrine slug still serves Famille HTML 404 for `/juge`.
No second `.grok.me`.

## Jalon 4 — validation matrix

GET `/juge` unit tests lock these cases. A 200 is preview, not a receipt.
Live HTML 404 on the grok.me vitrine is not a Worker receipt.

| Case | Example | HTTP | `error` |
|---|---|---|---|
| ε = 0 | `epsilon=0` | 400 | `lie` |
| ε missing | no `epsilon` / empty | 400 | `EPSILON_MISSING` |
| unknown `quelle` or `temoin` | `quelle=webcam` · `temoin=webcam` | 400 | `cards` |
| horizon not a calendar day | `2027-02-31` · `UFHY1` · `not-a-date` | 400 | `horizon` |
| `temoin=di` without transcript | no `transcript` | 400 | `transcript` |

Deploy remains **workflow_dispatch**, Carl-only (phone-capable). This PR does
not run wrangler. grok.me bind / 404 Soft FLAG stays Carl.

## Deploy (cell)

1. Repo secret `CLOUDFLARE_API_TOKEN` = one line, no `Bearer`.
2. Repo secret `CLOUDFLARE_ACCOUNT_ID` = `d4ae98c6c3e0af6ab508b4b941d96199`.
3. Actions → workflow **deploy** → Run workflow.

After a green run: bind route `acorn-royal-dune-blend.grok.me/juge*` on the Worker. Carl only.

MIT License — this repository's code and documentation only. See [LICENSE](LICENSE) and [COPYRIGHT.md](COPYRIGHT.md).
Privacy / incidents (this Worker only): [PRIVACY.md](PRIVACY.md) · [INCIDENT.md](INCIDENT.md) · live `GET /privacy` and `GET /legal` when this Worker is in front.
This project is not formally verified.
QUANTUM is not licensed here. Preview ≠ receipt.
