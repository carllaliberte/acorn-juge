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
`wrangler.toml` has no route. `*.workers.dev` was NXDOMAIN on 2026-09-03.

Next human gesture: `npx wrangler deploy` (Carl). No second `.grok.me`.
Until then: preview ≠ live. Accord ≠ vrai.

## Verified (2026-09-05)

| Probe | Result |
|---|---|
| `GET https://acorn-royal-dune-blend.grok.me/juge?quelle=os&temoin=aucun&epsilon=0&horizon=2027-12-31` | **404** `text/html` Famille — phrase absente |
| Worker code `lireEpsilon(0)` | **400** JSON `phrase: Error margin zero is a lie` |

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
