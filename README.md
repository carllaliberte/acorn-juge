# acorn-juge

Canal GET `/juge` pour Acorn. Preview — not a receipt.

Vitrine (pas le juge) : https://acorn-royal-dune-blend.grok.me  
Doctrine : https://github.com/carllaliberte/famille

Grok.me sert encore du HTML 404 sur `/juge`. Ce Worker est le canal.
Ce n’est pas un second `*.grok.me`.

## Déployer

```bash
git clone https://github.com/carllaliberte/acorn-juge.git
cd acorn-juge
npx wrangler login
npx wrangler deploy
```

Mesure :

```bash
curl -sS -w '%{http_code}\n' \
  'https://acorn-juge.<compte>.workers.dev/juge?quelle=os&temoin=aucun&epsilon=0&horizon=2027-12-31'
```

400 + `Error margin zero is a lie` = canal ouvert.
