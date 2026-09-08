/**
 * Static pages for GET /privacy, GET /legal, GET /porte.
 * Substance stays aligned with PRIVACY.md, LICENSE, COPYRIGHT.md.
 * Not a receipt, not a seal, not QUANTUM. Not a Loi 25 / PIPEDA / GDPR claim.
 * This Worker is not the Acorn product.
 */

const STYLE =
  "body{font-family:system-ui,sans-serif;max-width:42rem;margin:2rem auto;padding:0 1rem;line-height:1.45}" +
  "h1{font-size:1.4rem}h2{font-size:1.1rem;margin-top:1.6rem}" +
  "table{border-collapse:collapse;width:100%;font-size:.95rem}" +
  "th,td{border:1px solid #555;padding:.3rem .45rem;text-align:left}" +
  ".lamp{display:inline-block;width:.7rem;height:.7rem;border-radius:50%;margin-right:.35rem;vertical-align:middle}" +
  ".vert{background:#1a7f37}.ambre{background:#c47d00}.rouge{background:#b42318}" +
  "nav{margin:1rem 0}";

function wrapHtml(lang, title, inner) {
  return (
    "<!DOCTYPE html>\n<html lang=\"" +
    lang +
    "\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>" +
    title +
    "</title>\n<style>" +
    STYLE +
    "</style>\n</head>\n<body>\n" +
    inner +
    "\n</body>\n</html>\n"
  );
}

const CONTACT =
  '<a href="mailto:Laliberte22@gmail.com">Laliberte22@gmail.com</a>';

const NAV =
  '<nav><a href="/porte">/porte</a> · <a href="/privacy">/privacy</a> · <a href="/legal">/legal</a></nav>';

export function porteDocument() {
  return wrapHtml(
    "fr",
    "Acorn — porte",
    [
      NAV,
      "<h1>Acorn</h1>",
      "<p><strong>Les certitudes ont une date de fin.</strong></p>",
      "<p lang=\"en\">Certainties expire.</p>",
      "<p>Œuvre Acorn. Carte = FAMILLE. Ce canal n’est pas le produit. Preview ≠ quittance.</p>",
      "<h2>Juge</h2>",
      "<p>Le juge est humain. <strong>Carl</strong> décide. Aucune IA n’est juge.</p>",
      "<p>La <code>phrase</code> de <code>GET /juge</code> est un aperçu JSON. Pas un VERT fichier↔carte (unforge-check). Pas un sceau.</p>",
      "<p>Un 200 sur <code>GET /juge</code> est <strong>APERÇU / CLASSIQUE</strong>. Pas un reçu. Pas QUANTUM.</p>",
      "<h2>État live (honnête)</h2>",
      "<p>Canal JSON : <code>*.workers.dev/juge</code>.</p>",
      "<p>Vitrine <code>acorn-royal-dune-blend.grok.me/juge</code> : <strong>404 HOLD</strong> jusqu’au bind Carl. Pas un 2e slug.</p>",
      "<p>Date : sur la carte, jour calendrier. Périmé = à refaire, pas « faux ».</p>",
    ].join("\n"),
  );
}

export function privacyDocument() {
  return wrapHtml(
    "fr",
    "Vie privée — acorn-juge",
    [
      NAV,
      "<h1>Vie privée — acorn-juge</h1>",
      "<p><strong>Pas un avis juridique.</strong> Ce texte décrit ce dépôt. Il n’est pas un conseil, ni un sceau, ni une quittance. Carl décide.</p>",
      "<p>Ce Worker n’est <strong>pas</strong> le produit Acorn. Ce dépôt ne prétend pas qu’un dépôt produit Acorn public existe. Ne pas en inventer un.</p>",
      "<h2>Portée (ce dépôt seulement)</h2>",
      "<p><code>acorn-juge</code> est un canal Cloudflare <strong>GET /juge</strong>. Il renvoie un JSON d’aperçu (<code>preview: true</code>, <code>receipt: false</code>) à partir des paramètres de requête :</p>",
      "<table><thead><tr><th>Paramètre</th><th>Rôle</th></tr></thead><tbody>",
      "<tr><td><code>quelle</code></td><td>source des bits (<code>os</code> · <code>qrng</code> · <code>qkd</code>)</td></tr>",
      "<tr><td><code>temoin</code></td><td>force du témoin (<code>aucun</code> · <code>stat</code> · <code>fabricant</code> · <code>di</code>)</td></tr>",
      "<tr><td><code>epsilon</code></td><td>marge d’erreur (nombre <strong>> 0</strong>)</td></tr>",
      "<tr><td><code>horizon</code></td><td>jour calendaire <code>YYYY-MM-DD</code></td></tr>",
      "<tr><td><code>transcript</code></td><td>exigé seulement si <code>temoin=di</code></td></tr>",
      "</tbody></table>",
      "<p>Ce n’est <strong>pas</strong> un reçu. Ce n’est <strong>pas</strong> un sceau. Ce n’est <strong>pas</strong> QUANTUM. Un 200 ici est <strong>APERÇU / CLASSIQUE</strong>. Preview ≠ receipt.</p>",
      "<p>Hôte unique (vitrine nominative grok.me, pas un domaine FAMILLE) : https://acorn-royal-dune-blend.grok.me</p>",
      "<h2>Routes Worker (déclaratif ↔ architectural)</h2>",
      "<p>Quand <strong>ce Worker</strong> est devant l’hôte, <code>GET /privacy</code>, <code>GET /legal</code> et <code>GET /porte</code> sont servis ici (HTML 200). Ils ne passent pas par le proxy vers l’origine nominative grok.me.</p>",
      "<p><code>GET /porte</code> est du HTML statique : pas de formulaire, pas de nouveaux paramètres de requête, pas une collecte.</p>",
      "<p>Frapper l’origine grok.me <strong>sans</strong> ce Worker devant peut encore 404. Ce fichier ne prétend pas que le slug origine a été corrigé. Un bind Carl limité à <code>/juge*</code> ne livre pas ces chemins. Ce n’est pas un reçu.</p>",
      "<h2>Hébergement (tiers)</h2>",
      "<ul>",
      "<li><strong>Cloudflare Worker</strong> — exécution du script de ce dépôt.</li>",
      "<li><strong>Vitrine nominative grok.me</strong> — hébergement tiers, slug nominatif, pas un domaine FAMILLE, pas un sceau.</li>",
      "</ul>",
      "<p>Des journaux peuvent exister chez l’hébergeur (Cloudflare et/ou grok.me). <strong>Ce dépôt ne promet pas zéro journal.</strong> Il ne contrôle pas les journaux d’infrastructure du tiers.</p>",
      "<h2>Ce que ce code ne fait pas</h2>",
      "<p>Dans <code>worker.js</code> de <strong>ce</strong> dépôt :</p>",
      "<ul>",
      "<li>Le proxy GET <code>/</code> n’envoie qu’une allowlist (<code>accept</code>, <code>accept-language</code>). <strong>Cookie</strong> et <strong>Authorization</strong> ne sont pas transférés.</li>",
      "<li>CORS JSON n’est pas <code>*</code>.</li>",
      "<li>Il n’y a <strong>pas</strong> de <code>localStorage</code>, <strong>pas</strong> d’AES, <strong>pas</strong> de coffre local dans ce dépôt. Ne pas l’affirmer ici.</li>",
      "</ul>",
      "<p>Les paramètres de requête sont fournis par l’appelant. Ce canal n’est pas conçu pour collecter des données sensibles. Carl décide de tout élargissement.</p>",
      "<h2>Responsable</h2>",
      "<p>Carl Laliberté, Québec. Contact pour avis de vie privée ou d’incident.</p>",
      "<p>Canal : " + CONTACT + ". Pas d’autre canal publié ici.</p>",
      "<h2>Âge et consentement</h2>",
      "<p>Ce canal n’est <strong>pas</strong> destiné aux enfants. Aucune collecte sensible n’est visée. Carl décide. Ce n’est pas une déclaration de conformité.</p>",
      "<h2>Cadre que Carl lit (pas une conformité)</h2>",
      "<p>Carl lit la <em>Loi modernisant des dispositions législatives en matière de protection des renseignements personnels</em> (<strong>Loi 25</strong>) et la <em>Loi sur la protection des renseignements personnels dans le secteur privé</em>, <strong>RLRQ c. P-39.1</strong>.</p>",
      "<p><strong>Ce dépôt ne se déclare pas conforme.</strong> Citer le cadre n’est pas une attestation. Les drapeaux ne sont pas des conseils. Carl décide.</p>",
      "<h2>Privacy (short)</h2>",
      "<p>Not legal advice. This Worker is a GET <code>/juge</code> preview canal: JSON from query params (<code>quelle</code>, <code>temoin</code>, <code>epsilon</code>, <code>horizon</code>; <code>transcript</code> when <code>temoin=di</code>). Not a receipt, not a seal, not QUANTUM. Hosted on Cloudflare and a nominative grok.me vitrine (third-party). Host-level logs may exist — this repo does not promise zero logs. <code>Cookie</code> / <code>Authorization</code> are not forwarded. This repo has no <code>localStorage</code> / AES. Responsible person: Carl Laliberté, Québec — contact for privacy / incident notices: " +
        CONTACT +
        ". Not directed at children; no sensitive collection intended; Carl decides. Loi 25 / RLRQ c. P-39.1 is the Québec frame Carl reads. <strong>This repo does not claim compliance.</strong> Live Worker routes <code>GET /privacy</code>, <code>GET /legal</code> and <code>GET /porte</code> are served by this Worker when it is in front of the host. <code>GET /porte</code> is static HTML: no form, no new query params, not a collection. The nominative grok.me origin itself may still 404 if hit without the Worker.</p>",
    ].join("\n"),
  );
}

export function legalDocument() {
  return wrapHtml(
    "fr",
    "Mentions — acorn-juge",
    [
      NAV,
      "<h1>Mentions — acorn-juge</h1>",
      "<p><strong>Pas un avis juridique.</strong> Pas un sceau. Pas un reçu. Pas QUANTUM. Carl décide.</p>",
      "<h2>Portée</h2>",
      "<p>Ce Worker (dépôt <code>acorn-juge</code>) est un canal Cloudflare <strong>GET /juge</strong>. Aperçu JSON (<code>preview: true</code>, <code>receipt: false</code>). Ce Worker n’est <strong>pas</strong> le produit Acorn. Ne pas inventer un dépôt produit Acorn.</p>",
      "<p>Hôte vitrine nominative : https://acorn-royal-dune-blend.grok.me</p>",
      "<h2>Vie privée</h2>",
      "<p>Voir <a href=\"/privacy\">GET /privacy</a> (même substance que <code>PRIVACY.md</code>). Contact : Carl Laliberté, Québec — " +
        CONTACT +
        ".</p>",
      "<h2>Licence</h2>",
      "<p>Copyright (c) 2026 Carl Laliberté, Québec. Auteur unique. Pas de co-auteurs.</p>",
      "<p>MIT — code et documentation de <strong>ce</strong> dépôt seulement. Voir <code>LICENSE</code> et <code>COPYRIGHT.md</code> dans le dépôt. QUANTUM n’est pas licencié ici. Acorn l’œuvre (autre dépôt / produit) reste All Rights Reserved et n’est pas licenciée ici.</p>",
      "<h2>Legal (short)</h2>",
      "<p>Not legal advice. This Worker is the GET <code>/juge</code> preview canal only — not the Acorn product, not a receipt, not a seal, not QUANTUM. Privacy: <a href=\"/privacy\">/privacy</a>. MIT as in <code>LICENSE</code> / <code>COPYRIGHT.md</code> (this repository only; Copyright (c) 2026 Carl Laliberté, Québec). Contact: " +
        CONTACT +
        ". No Loi 25 / PIPEDA / GDPR compliance claim. Flags ≠ advice.</p>",
    ].join("\n"),
  );
}
