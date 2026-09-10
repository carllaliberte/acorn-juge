# Deploy — Carl only

Preview, not a receipt. Not a second grok.me.
Bots cannot hold the Cloudflare token. Stop here until Carl runs wrangler.

## Canal (chemin A — 2026-09-10)

JSON GET `/juge` : `https://acorn-juge.laliberte22.workers.dev/juge`
Vitrine HTML : `https://acorn-royal-dune-blend.grok.me` (Vercel). `GET /juge` là = 404 HTML. Attendable.
Pas de bind Worker sur grok.me. Pas une zone Cloudflare. Pas un 2e slug.

Laptop (redeploy Worker seulement) :

```bash
cd acorn-juge
npm test
npx wrangler login
npx wrangler deploy
```

Phone (no OAuth localhost): create an API token (Workers Scripts:Edit, Account:Read).
GitHub → Settings → Secrets → `CLOUDFLARE_API_TOKEN`.
Then Actions → Deploy Worker → Run workflow.
That button is Carl. Not a model. `wrangler.toml` is at the repo root.

## Checklist curls (canal = workers.dev)

`preview: true`, `receipt: false`. Never QUANTUM.
CORS: never `Access-Control-Allow-Origin: *`.

```bash
HOST=https://acorn-juge.laliberte22.workers.dev
```

### 1. ε missing → 400 `EPSILON_MISSING` (not the lie)

```bash
curl -sS -D - \
  "$HOST/juge?quelle=os&temoin=aucun&horizon=2027-12-31"
# expect: HTTP 400, content-type application/json
# body: "error":"EPSILON_MISSING", "preview":true
# not error=lie
```

### 2. ε=0 → 400 `lie`

```bash
curl -sS -D - \
  "$HOST/juge?quelle=os&temoin=aucun&epsilon=0&horizon=2027-12-31"
# expect: HTTP 400 JSON
# "error":"lie"
# phrase: "Error margin zero is a lie"
```

### 3. 2027-02-31 → 400 `horizon` (syntax-valid, not a calendar day)

```bash
curl -sS -D - \
  "$HOST/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2027-02-31"
# expect: HTTP 400 JSON, "error":"horizon"
```

### 4. preview os → 200 CLASSIQUE

```bash
curl -sS -D - \
  "$HOST/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2027-12-31"
# expect: HTTP 200 JSON
# "preview":true, "receipt":false, "status":"CLASSIQUE"
# never QUANTUM
# Access-Control-Allow-Origin is not *
```

### 5. leap 2028-02-29 → 200

```bash
curl -sS -D - \
  "$HOST/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2028-02-29"
# expect: HTTP 200 JSON, "horizon":"2028-02-29", "preview":true, "receipt":false
```
