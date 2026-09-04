# Deploy — Carl only

Preview, not a receipt. Not a second grok.me.

```bash
cd acorn-juge
npm test
npx wrangler deploy
```

Bind the Worker route on the cited host:

`https://acorn-royal-dune-blend.grok.me/juge`

Prove:

```bash
curl -sS "https://acorn-royal-dune-blend.grok.me/juge?quelle=os&temoin=aucun&epsilon=1e-6&horizon=2027-12-31"
# expect JSON: preview true, receipt false

curl -sS -o /dev/null -w "%{http_code}\n" "https://acorn-royal-dune-blend.grok.me/juge?quelle=os&temoin=aucun&epsilon=0&horizon=2027-12-31"
# expect 400
```

Bots cannot hold the Cloudflare token. Stop here until Carl runs wrangler.
