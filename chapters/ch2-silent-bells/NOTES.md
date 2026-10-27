# Chapitre II · Silent Bells (notes du dossier)

- **État** : import du 25 octobre (`legacy/silent-bells.source.html`, tag `ch2-import`), puis écarts techniques traités le 27 octobre (branche `ch2/tech`) : `_(en, fr)`, clés `lb-…`, `<head>` propre, lien vers l'artefact du Chapitre I retiré, contrôle réseau. Jeu, textes et rendu inchangés (sauf le menu sans le lien).
- **Cahier des charges** : `docs/CH2-SPEC.md` (décisions de Kevin du 27 octobre 2026). Lore : `docs/LORE.md`.
- **Étapes** : 1) import propre ✔ ; 2) écarts techniques (étape A) ✔ ; 3) moteur et héros communs ; 4) harmonisation avec Ember Bridge selon le cahier des charges (textes, mécaniques, décors, outro, menu commun).
- **Pièges connus** : numéros de phase internes ≠ numéros affichés (voir plus bas) ; le Chapitre I garde ses clés `eb-…` tant que la demande de `DEMANDES.md` n'est pas traitée.

## Fichiers
- `src/silent-bells.html` : **la source à modifier** (page complète, un seul `<script>`). Créée le 27 octobre depuis `legacy/` par `build/ch2_swap_args.py`, puis éditée.
- `legacy/silent-bells.source.html` : import d'origine, **ne pas modifier** (référence de `tests/ch2-texts.js`).
- `dist/index.html` : généré, suivi dans git ; à committer avec sa source.

## Build (`python3 build/build_ch2.py`)
- Entrée : `src/silent-bells.html`. Sorties : `dist/index.html` (la CI fait `git diff --exit-code`) et `build/out/silent-bells-itch.zip` (non suivi ; `index.html` à la racine, date fixe 1980-01-01, zip identique d'un build à l'autre).
- Chaque remplacement exige une occurrence unique : si la source change à cet endroit, le build échoue au lieu de produire un fichier faux.
- Écarts entre `dist/index.html` et `src/` (les seuls), comme au Chapitre I :
  1. retrait de `<meta name="claude:viewport-fit-sides" content="cover">` (propre à l'hébergeur d'artefacts) ;
  2. retrait des trois `<link>` Google Fonts ;
  3. contenu de `build/fonts.css` inséré au début du `<style>` du jeu (Big Shoulders Display 700–800 et DM Sans 400–700, polices variables).
- La source garde la meta et les liens Google pour rester affichable telle quelle dans un aperçu en ligne.

## Texte : `_(en, fr)`
- Même ordre qu'au Chapitre I : `const _=(en,fr)=>LANG==='fr'?fr:en;`. Langue par défaut : français.
- L'inversion a été faite par script (150 appels, appels imbriqués et `_(m[1],m[2])` compris). `tests/ch2-texts.js` extrait les couples (fr, en) de `legacy/` et du `dist` avec un extracteur indépendant : liste identique, même ordre, au caractère près, sauf les couples listés dans `RETIRES` (pour l'instant : le texte du lien vers le Chapitre I).
- **Pour la session textes** : toute modification de texte fera échouer ce test ; ajouter le couple d'origine à `RETIRES` ne suffit que pour une suppression. Quand les textes changent vraiment, remplacer la référence `legacy/` du test par une liste validée (par exemple un `docs/TEXTES-CH2.md`) plutôt que de désactiver le test.

## Clés de sauvegarde
| Clé | Contenu | Ancienne(s) clé(s) lue(s) si absente |
|---|---|---|
| `lb-lang` | `fr` / `en` | `pn-lang`, puis `eb-lang` (Chapitre I) |
| `lb-snd` | son `1`/`0` | `db-optSnd` |
| `lb-mus` | musique `1`/`0` | `db-optMus` |
| `lb-help` | aide visuelle `1`/`0` | `db-optHelp` |
| `lb-ch2-unl` | phases débloquées (1 à 3) | `db-unl` |
| `lb-ch2-best-<mode>` | record en secondes (parcours complet) | `db-best-<mode>` |
- Code : `OLD_KEYS`, `oldKeys`, `store` en tête du script. `store.get` lit la nouvelle clé, sinon l'ancienne, et la recopie dans la nouvelle ; au démarrage, toutes les clés connues (et chaque `db-best-*` présent) passent par là. Les anciennes clés ne sont jamais effacées ni écrites.
- Pas de drapeau « intro vue » dans ce chapitre (le prologue se passe par Entrée). S'il en faut un : `lb-ch2-intro`.

## `<head>`
- Doctype, `<html lang="fr">`, `meta charset="utf-8"`, viewport (`viewport-fit=cover`), `<title>`, styles du jeu : tout dans `<head>`. L'enveloppe de l'hébergeur d'artefacts (ligne 1) est retirée.
- Repris dans les styles du jeu : `html{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}` (zones sûres, utiles sur téléphone avec `viewport-fit=cover`). Le reste de l'enveloppe (`color-scheme:light`, `box-sizing`, police et fond du `body`, `[hidden]`, `img`) était écrasé par les styles du jeu ; `scroll-padding-top` ne servait pas (pas d'ancres).

## Tests
- `node tests/ch2-texts.js` : voir plus haut. Sans navigateur.
- `node tests/ch2-keys.js` : migration (anciennes clés seules, nouvelles prioritaires, `eb-lang`, `pn-lang` avant `eb-lang`, aucune clé) et écriture dans les seules clés `lb-…`.
- `node tests/ch2-smoke.js` : sur `dist/index.html`. Syntaxe (`new Function`), puis **réseau** : contrôle statique (aucune URL `http(s)://` ni `//hôte`, aucun `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, `serviceWorker`, `import()`, `window.open`, aucune ressource liée par `href`/`src`) ; en jeu, contexte hors ligne, `context.route` intercepte et refuse toute requête autre que `file:`/`data:`/`blob:`, les API réseau sont espionnées, les WebSocket, workers externes, popups et pages non `file:` sont relevés. Puis `db-unl=3` (ancienne clé, donc migration) posé avant le chargement, Normal, prologue passé (Entrée), phase I → II → III via la frise `#phases`. Sortie attendue : `errs []`.
- Numéros de phase : interne `S.phase` 2 = Phase I (la Voix Creuse), 1 = Phase II (le Roi de Rouille), 3 = Phase III (le Phare Noyé) ; `ORDER=[2,1,3]`. Le test lit `document.body.dataset.ph` (interne) et `#hdEye` (affiché).
- Lancement local si Playwright ne trouve pas son Chromium : `PW_CHROMIUM=/opt/pw-browsers/chromium node tests/ch2-smoke.js` (voir `NOTES.md` racine).

## Comparaison en image (méthode du 27 octobre)
- 48 captures : menu, menu Épreuve, prologue, carte et trois instants de jeu pour chaque phase, pause ; en FR et EN à 1100 × 760, et en FR à 390 × 844 (téléphone). Plus quatre captures pleine page du menu (390 × 844, 844 × 390, 640 × 360, 1920 × 1080).
- Déterminisme : `requestAnimationFrame`, `performance.now` et `Date.now` remplacés par un pas fixe de 1/60 s avancé par le test (`page.clock` laisse un décalage de 1 à 2 ms entre exécutions), `Math.random` à graine fixe, `AudioContext` coupé, `animations:'disabled'`, souris ramenée en (0, 0) avant chaque capture. Deux exécutions du même fichier : 48/48 identiques au pixel.
- Résultat contre le `dist` de `main` : identique au pixel après chaque étape (inversion, clés, `<head>`) ; après le retrait du lien, seuls les six écrans de menu diffèrent (le lien disparaît, le bloc du menu se recentre verticalement).
- Le script n'est pas dans `tests/` (outil ponctuel) ; le refaire au besoin à partir de cette description.
