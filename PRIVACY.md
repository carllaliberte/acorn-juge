# Vie privée — acorn-juge

**Pas un avis juridique.** Ce texte décrit ce dépôt. Il n’est pas un conseil,
ni un sceau, ni une quittance. Carl décide.

Ce Worker n’est **pas** le produit Acorn. Ce dépôt ne prétend pas qu’un dépôt
produit Acorn public existe. Ne pas en inventer un.

---

## Portée (ce dépôt seulement)

`acorn-juge` est un canal Cloudflare **GET `/juge`**. Il renvoie un JSON
d’aperçu (`preview: true`, `receipt: false`) à partir des paramètres de
requête :

| Paramètre | Rôle |
|---|---|
| `quelle` | source des bits (`os` · `qrng` · `qkd`) |
| `temoin` | force du témoin (`aucun` · `stat` · `fabricant` · `di`) |
| `epsilon` | marge d’erreur (nombre **> 0**) |
| `horizon` | jour calendaire `YYYY-MM-DD` |
| `transcript` | exigé seulement si `temoin=di` |
| `appareil` | nom d’appareil (3–64) exigé pour APERÇU qrng/qkd avec témoin valide; non renvoyé dans le JSON; fourni par l’appelant |

Ce n’est **pas** un reçu. Ce n’est **pas** un sceau. Ce n’est **pas** QUANTUM.
Un 200 ici est **APERÇU / CLASSIQUE**. Preview ≠ receipt.

Canal JSON : https://acorn-juge.laliberte22.workers.dev/juge (Cloudflare Workers)

Vitrine HTML : https://acorn-royal-dune-blend.grok.me (Vercel). Pas de bind
Worker. `GET /juge` sur la vitrine = 404 HTML attendable. Pas un 2e slug.
Pas un domaine FAMILLE.

## Routes Worker (déclaratif ↔ architectural)

`GET /privacy`, `GET /legal` et `GET /porte` sont servis sur l’hôte Worker
(`*.workers.dev`), pas sur la vitrine. HTML 200 sur
https://acorn-juge.laliberte22.workers.dev/{privacy,legal,porte}.

`GET /porte` est du HTML statique : pas de formulaire, pas de nouveaux
paramètres de requête, pas une collecte.

La vitrine grok.me n’a pas ce Worker devant. Un 404 HTML là n’est pas un
reçu Worker. Ce n’est pas un reçu.

## Hébergement (tiers)

- **Cloudflare Workers** — canal JSON GET `/juge` sur `*.workers.dev`.
- **Vitrine HTML grok.me (Vercel)** — slug nominatif, pas de bind Worker,
  pas un domaine FAMILLE, pas un sceau. `GET /juge` = 404 HTML attendable.

Des journaux peuvent exister chez l’hébergeur (Cloudflare et/ou grok.me).
**Ce dépôt ne promet pas zéro journal.** Il ne contrôle pas les journaux
d’infrastructure du tiers.

## Hors Worker — CI swarm (Actions)

Hors du chemin Worker GET `/juge`. Quand les secrets GitHub Actions sont
posés, le contenu d’une PR ou d’un commentaire peut être transmis à des
tiers pour une revue complémentaire : Anthropic, OpenAI, DeepSeek,
Google Gemini, **OpenRouter** et/ou **xAI**.

Clé absente → fail-closed (ce modèle est sauté). Ce n’est pas une
déclaration de conformité. Ce n’est pas un avis juridique. Carl décide.

## Ce que ce code ne fait pas

Dans `worker.js` de **ce** dépôt :

- Un chemin inconnu renvoie 404 JSON `not_this_canal`. Ce Worker ne proxie
  pas la vitrine. Le slug ORIGIN reste documentaire seulement.
  `PROXY_REQUEST_HEADERS` est mort sur ce chemin — ce n’est pas une
  allowlist Cookie/Authorization pour un proxy vivant.
- CORS JSON n’est pas `*`.
- Il n’y a **pas** de `localStorage`, **pas** d’AES, **pas** de coffre local
  dans ce dépôt. Ne pas l’affirmer ici.

Les paramètres de requête sont fournis par l’appelant. Ce canal n’est pas
conçu pour collecter des données sensibles. Carl décide de tout élargissement.

## Responsable

Carl Laliberté, Québec. Contact pour avis de vie privée ou d’incident.

Canal : [Laliberte22@gmail.com](mailto:Laliberte22@gmail.com).
Pas d’autre canal publié ici.

## Âge et consentement

Ce canal n’est **pas** destiné aux enfants. Aucune collecte sensible n’est
visée. Carl décide. Ce n’est pas une déclaration de conformité.

## Cadre que Carl lit (pas une conformité)

Carl lit la *Loi modernisant des dispositions législatives en matière de
protection des renseignements personnels* (**Loi 25**) et la *Loi sur la
protection des renseignements personnels dans le secteur privé*,
**RLRQ c. P-39.1**.

**Ce dépôt ne se déclare pas conforme.** Citer le cadre n’est pas une
attestation. Les drapeaux ne sont pas des conseils. Carl décide.

---

## Privacy (short)

Not legal advice. This Worker is a GET `/juge` preview canal: JSON from query
params (`quelle`, `temoin`, `epsilon`, `horizon`; `transcript` when `temoin=di`;
`appareil` — device name 3–64, required for APERÇU qrng/qkd with a valid
temoin; not returned in the JSON; supplied by the caller).
Not a receipt, not a seal, not QUANTUM. Canal JSON:
https://acorn-juge.laliberte22.workers.dev/juge (Cloudflare Workers). Vitrine
HTML: acorn-royal-dune-blend.grok.me (Vercel), no Worker bind; `/juge` 404
expected. Host-level logs may exist — this repo does not promise zero logs.
Unknown paths return 404 JSON `not_this_canal`. This Worker does not proxy the
vitrine. The ORIGIN slug is documentation-only. `PROXY_REQUEST_HEADERS` is dead
on that path — not a live Cookie/Authorization proxy allowlist. This repo has
no `localStorage` / AES. Responsible person: Carl Laliberté, Québec — contact
for privacy / incident notices:
[Laliberte22@gmail.com](mailto:Laliberte22@gmail.com). Not directed at children;
no sensitive collection intended; Carl decides. Loi 25 / RLRQ c. P-39.1 is the
Québec frame Carl reads. **This repo does not claim compliance.**
`GET /privacy`, `GET /legal` and `GET /porte` are served on the Worker host
(`*.workers.dev`), not on the vitrine. `GET /porte` is static HTML: no form,
no new query params, not a collection. Outside GET `/juge`:
when GitHub Actions secrets are set, PR/comment content may go to third
parties for complementary review (Anthropic, OpenAI, DeepSeek, Google
Gemini, **OpenRouter**, and/or **xAI**). Missing key → fail-closed. Not a
compliance claim. Not legal advice. Carl decides.
