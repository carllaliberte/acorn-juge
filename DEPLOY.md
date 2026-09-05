# Deploy — Carl only

Preview, not a receipt. Not a second grok.me.
Bots cannot hold the Cloudflare token. Stop here until Carl runs wrangler.

```bash
cd acorn-juge
npm test
npx wrangler login
npx wrangler deploy
```

Bind the Worker route on the cited host:

`https://acorn-royal-dune-blend.grok.me/juge`

Do not create another `*.grok.me`.

## Checklist curls (after bind)

Until bind, every `/juge` path on the vitrine is **404 HTML**. That is **NOT LIVE VERIFIED**.
After bind, expect JSON as noted. `preview: true`, `receipt: false`. Never QUANTUM.
CORS: never `Access-Control-Allow-Origin: *`.

```bash
HOST=https://acorn-royal-dune-blend.grok.me
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
