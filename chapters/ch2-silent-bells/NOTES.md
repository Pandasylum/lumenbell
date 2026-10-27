# Chapitre II · Silent Bells (notes du dossier)

- **État** : importé tel quel, version du 25 octobre (`legacy/silent-bells.source.html`, page complète autonome, 2 110 lignes, un seul `<script>`). Tag `ch2-import`.
- **Cahier des charges** : `docs/CH2-SPEC.md` (décisions de Kevin du 27 octobre 2026). Lore : `docs/LORE.md`.
- **Étapes** : 1) import propre (build + test, aucun changement de jeu) ✔ ; 2) moteur et héros communs ; 3) harmonisation avec Ember Bridge selon le cahier des charges.
- **Pièges connus** : `_(fr, en)` à l'envers par rapport au Chapitre I ; clés de sauvegarde `pn-` / `db-` ; numéros de phase internes ≠ numéros affichés (voir plus bas).

## Build (`python3 build/build_ch2.py`)
- Entrée : `legacy/silent-bells.source.html` (ne pas la modifier : c'est la référence de l'import).
- Sorties : `dist/index.html` (suivi dans git, doit rester identique : la CI fait `git diff --exit-code`) et `build/out/silent-bells-itch.zip` (non suivi ; `index.html` à la racine, date fixe 1980-01-01 donc zip identique d'un build à l'autre).
- Chaque remplacement exige une occurrence unique dans la source : si la source change, le build échoue au lieu de produire un fichier faux.

### Écarts entre `dist/index.html` et la source (les seuls)
1. Retrait de `<meta name="claude:viewport-fit-sides" content="cover">` (propre à l'hébergeur d'artefacts, sans effet ailleurs ; même choix qu'au Chapitre I).
2. Retrait des trois `<link>` Google Fonts (2 `preconnect` + la feuille `css2?family=Big+Shoulders+Display:wght@700;800&family=DM+Sans:wght@400;500;700`).
3. Contenu de `build/fonts.css` (le même qu'au Chapitre I) inséré au début du `<style>` du jeu (celui qui suit `<title>`). Big Shoulders Display 700–800 et DM Sans 400–700 sont des polices variables : la graisse 500 de DM Sans demandée par la source est couverte.

Tout le reste est octet pour octet la source (`diff legacy/silent-bells.source.html dist/index.html` le montre). Comparaison en image au 27 octobre (horloge simulée, source avec Google Fonts en ligne contre dist hors ligne) : menu, prologue et carte de phase I identiques en texte, mise en page et polices ; les seuls pixels qui diffèrent sont dans le canevas et les animations CSS du menu, qui ne suivent pas l'horloge simulée. Restent donc :
- l'enveloppe de l'hébergeur d'artefacts en ligne 1 (`<!doctype html><html><head><meta charset=utf8>`, viewport, style de base `:root{color-scheme:light;…padding safe-area…}body{margin:0;…}[hidden]…`, puis `</head><body>`). Elle est gardée car elle fait partie du rendu actuel (marges, zones sûres, règle `[hidden]`). Conséquence : `<title>` et le `<style>` du jeu sont dans `<body>` ; les navigateurs l'acceptent. À ranger dans `<head>` lors de l'harmonisation, avec une vérification visuelle.
- l'absence de saut de ligne final et de `lang` sur `<html>` ;
- le lien cliquable `#mLink` vers l'artefact Claude du Chapitre I (`https://claude.ai/code/artifact/…`) : ce n'est pas un appel réseau automatique (seulement au clic), mais il mène hors du jeu. À remplacer par le menu commun (point 4 de `docs/CH2-SPEC.md`).

## À faire lors de l'harmonisation (pas dans l'import)
1. **En-tête de l'hébergeur d'artefacts (ligne 1)** : le retirer proprement (`<!doctype html><html><head><meta charset=utf8>`, viewport, style de base `:root{…}body{…}[hidden]…`, `</head><body>`). Remettre `<title>` et le `<style>` du jeu dans un vrai `<head>` (doctype, `lang`, `meta charset="utf-8"`, viewport), comme le `dist` du Chapitre I. Reprendre dans les styles du jeu ce qui compte pour le rendu (zones sûres, `body{margin:0}`, règle `[hidden]`), puis comparer en image avant / après (horloge simulée).
2. **Lien du menu vers l'artefact du Chapitre I** (`#mLink`, `https://claude.ai/code/artifact/…`, texte « ‹ Ember Bridge · Chapitre I ») : le remplacer par le menu commun (point 4 de `docs/CH2-SPEC.md`).

## Test (`node tests/ch2-smoke.js`)
- Sur `dist/index.html` directement (pas de version de test : la source n'a pas de crochets). Contexte hors ligne ; toute requête autre que `file:`/`data:`/`blob:` est une erreur.
- Vérifie d'abord la syntaxe du `<script>` final (`new Function`), puis : `db-unl=3` posé avant le chargement, Normal, prologue passé (Entrée), phase I → II → III via la frise `#phases` (cinématique passée, carte, Commencer, ~6 s de jeu en appuyant sur Espace). Relève `pageerror`, `console.error`, requêtes échouées ou externes. Sortie attendue : `errs []`.
- Numéros de phase : interne `S.phase` 2 = Phase I (la Voix Creuse), 1 = Phase II (le Roi de Rouille), 3 = Phase III (le Phare Noyé) ; `ORDER=[2,1,3]`. Le test lit `document.body.dataset.ph` (interne) et `#hdEye` (affiché).
- Lancement local si Playwright ne trouve pas son Chromium : `PW_CHROMIUM=/opt/pw-browsers/chromium node tests/ch2-smoke.js` (voir `NOTES.md` racine).
