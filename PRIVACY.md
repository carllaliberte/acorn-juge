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

Ce n’est **pas** un reçu. Ce n’est **pas** un sceau. Ce n’est **pas** QUANTUM.
Un 200 ici est **APERÇU / CLASSIQUE**. Preview ≠ receipt.

Hôte unique (vitrine nominative grok.me, pas un domaine FAMILLE) :
https://acorn-royal-dune-blend.grok.me

## Hébergement (tiers)

- **Cloudflare Worker** — exécution du script de ce dépôt.
- **Vitrine nominative grok.me** — hébergement tiers, slug nominatif, pas un
  domaine FAMILLE, pas un sceau.

Des journaux peuvent exister chez l’hébergeur (Cloudflare et/ou grok.me).
**Ce dépôt ne promet pas zéro journal.** Il ne contrôle pas les journaux
d’infrastructure du tiers.

## Ce que ce code ne fait pas

Dans `worker.js` de **ce** dépôt :

- Le proxy GET `/` n’envoie qu’une allowlist (`accept`, `accept-language`).
  **Cookie** et **Authorization** ne sont pas transférés.
- CORS JSON n’est pas `*`.
- Il n’y a **pas** de `localStorage`, **pas** d’AES, **pas** de coffre local
  dans ce dépôt. Ne pas l’affirmer ici.

Les paramètres de requête sont fournis par l’appelant. Ce canal n’est pas
conçu pour collecter des données sensibles. Carl décide de tout élargissement.

## Responsable

Carl Laliberté, Québec.

**TODO (Carl) :** remplir un canal de contact (courriel ou autre). Ne pas
inventer d’adresse ici.

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
params (`quelle`, `temoin`, `epsilon`, `horizon`; `transcript` when `temoin=di`).
Not a receipt, not a seal, not QUANTUM. Hosted on Cloudflare and a nominative
grok.me vitrine (third-party). Host-level logs may exist — this repo does not
promise zero logs. `Cookie` / `Authorization` are not forwarded. This repo has
no `localStorage` / AES. Responsible person: Carl Laliberté, Québec —
**TODO (Carl): fill a contact channel.** Not directed at children; no sensitive
collection intended; Carl decides. Loi 25 / RLRQ c. P-39.1 is the Québec frame
Carl reads. **This repo does not claim compliance.**
