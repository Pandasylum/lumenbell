# Audit de nettoyage avant le Chapitre III – 5 novembre 2026

Classe doc seule. **Aucun fichier de code ou de ressource modifié, déplacé ni supprimé** ; seuls ce rapport et `docs/DEVLOG-NOTES.md` sont écrits. Aucun build, aucun test lancé.

**Méthode** : `git ls-files`, `grep` / `git grep`, `wc`, `cmp`, `du -b`. Lus en entier : `CLAUDE.md`, `DECISIONS.md`. Tailles en octets (`du -b`), tableaux triés du plus lourd au plus léger. Dépôt : 234 fichiers versionnés, 11,65 Mo.

**Limites de la preuve** (ce qui n'a pas été analysé) : seules les déclarations de premier niveau (`function`, `const`, `let`, `var`), les `LB.x =` de `shared/js/` et les sélecteurs de classes et d'identifiants des `style.css` ont été comptés. Les membres d'objets (tables `T`, `DG`, `SP`…), les clés de texte et les accès par chaîne (`LB[nom]`) ne l'ont pas été. « Mort » veut dire : 0 référence dans `shared/`, `chapters/*/src`, `site/src`, `tests/`, `build/` hors la définition elle-même. Le dépôt ne contient aucun son, aucune police binaire ni aucune vidéo (sons synthétisés, polices inlinées via `build/fonts.css`) : les seuls assets sont des PNG, des JPEG et un SVG.

**Dossier d'archive** : `archives/` existe déjà (6 fichiers, 55 454 o, ignoré par la CI via `paths-ignore`, et CLAUDE.md règle 15 dit de ne pas le lire). Je propose de **réutiliser `archives/`** plutôt que de créer un `archive/` voisin, qui serait confondu avec lui et dont les changements déclencheraient la CI. À valider.

---

## B1 faite

Lot (a), déplacement seul (`git mv`, aucune suppression, aucun contenu modifié) :

- `docs/rapports/2026-11-04-mort-difficile-voix.md` → `archives/docs/rapports/2026-11-04-mort-difficile-voix.md`

Suppressions (`git rm`, matériel de promo itch.io récupéré et sauvegardé ailleurs par Kevin) :

- `store/` entier : `cover-itch.png`, `ember-bridge-cover.png`, `screenshot-1-pont.png`, `screenshot-2-gouffre.png`, `screenshot-3-epee.png`, `screenshot-4-sommet.png`, `icon-sources/{bg.html,fg.svg,fgp.html,full.html,r.js}`
- `build/promo.js` et `build/promo-check.py` (ne génèrent rien dans `store/` : sorties dans `build/out/promo/`)

Référence restante signalée, non modifiée : `README.md:46` (tableau des dossiers, ligne `store/`) et `docs/decisions/2026-11-05-chapitres-sans-commencer.md:3` (mention de `build/promo.js`). Aucun workflow, test, build, `package.json` ni `apk/` ne référence `store/` ou `promo`.

Vérifié par `git grep` : aucune autre référence que cet audit. Non déplacés, faute de 0 référence prouvée : `build/ch2_swap_args.py` (cité par `archives/DECISIONS-2026-10-27-28.md`), `chapters/ch2-silent-bells/legacy/silent-bells.source.html` (commentaire de `build/build_ch2.py`), `chapters/ch2-silent-bells/shots/` (`ch2/NOTES.md:105`), `docs/AUDIT-2026-10-30.md` (`README.md`, `DEVLOG-NOTES.md`), `store/` et `tests/trial-*` (exclus), `docs/CH2-SPEC.md` (lu par les tests).

---

## B2 faite

Classe moteur partagé. Builds régénérés (`build.py`, `build_ch2.py`, `build_site.py`). Tests : `smoke` (ch1 puis ch2), `keys`, `audio` : `errs []` partout (`keys.js` n'a pas été intermittent). Pas de bots, de `visual-shots` ni de `trial-*`.

**Supprimé** (0 référence reprouvée par `git grep -w`, accès par chaîne `LB[…]` compris, tests compris) :
- `LB.chRgb`, `LB.chHover` (`shared/js/24-cine.js`) ; `startCine`, `drawEclIdle`, `TF_LEN` (Chapitre II) ; `qlimb` (Chapitre I).
- Reliquats « Commencer » : sélecteurs `#gateLangs` et branche `gateBtn` de `28-ui.js` ; boucle `fpLang` sur tableau vide (`site/src/page/body.html`) ; restes de `tests/menu-layout.js` (`gate`, `gEn`, `gFr`, `R.gate`) et de `tests/ch2-lib.js` (masquage de `#gate`) ; clics `#gateBtn` de `tests/visual-shots.js` sur les chapitres (non lancé) ; mentions de `LB.gate` dans `NOTES.md`, `shared/NOTES.md`, notes des deux chapitres et commentaire de `60-ui-menu.js`.
- Bloc CSS `.btn.big` (`shared/css/gate.css`, ligne `@gate-js btnbig` et règle en media query de `28-ui.js`) et son cas particulier dans `build/assemble.py` (plus d'élément de chapitre ne porte la classe ; vérifié par grep : la carte d'ouverture de phase n'a pas `big`).
- Ligne `store/` du tableau de `README.md`.

**Déplacé** (`git mv`, sous-chemin gardé) vers `archives/` : `docs/AUDIT-2026-10-30.md`, `build/ch2_swap_args.py`, `chapters/ch2-silent-bells/shots/`. Renvois mis à jour : `README.md`, `docs/DEVLOG-NOTES.md`, `archives/DECISIONS-2026-10-27-28.md`, `ch2/NOTES.md`.

**Laissé, et pourquoi** : le bouton de la carte d'ouverture de phase (vivant) ; le `#gate`, `#gateBtn` et la règle `.btn.big` propre du hub (vivants) ; `tests/cine.js:173` (garde inoffensive) ; `build/promo.js` (supprimé en B1) ; `legacy/silent-bells.source.html`, `docs/CH2-SPEC.md`, `CHANGEMENTS.md` (consigne) ; `docs/COMMUN.md` et `docs/decisions/*` (textes historiques ou hors lot : mentions de `LB.gate` conservées) ; `DECISIONS.md` (index) ; `build/promo-check.py`.

---

## 1. Code mort et assets non référencés

### 1.1 Code (0 référence prouvée)

| Chemin | Constat | Preuve | Risque | Action proposée |
|---|---|---|---|---|
| `shared/js/24-cine.js:124` | `LB.chRgb` définie, jamais appelée | `git grep -w chRgb` : 1 ligne de code (la définition) ; le nom n'apparaît ailleurs que dans `docs/decisions/2026-11-02-menu-common-ui.md` | faible | Retirer la ligne (lot c). Vérifier avant l'absence d'accès par chaîne `LB['chRgb']` |
| `shared/js/24-cine.js:125` | `LB.chHover` définie, jamais appelée | idem, `git grep -w chHover` | faible | Retirer la ligne (lot c) |
| `chapters/ch2-silent-bells/src/js/52-cine-phases.js:15` | `startCine` jamais appelée (sa copie figée vit dans `legacy/`) | `git grep -w startCine` : définition en `src/` et en `legacy/` seulement ; 1 occurrence dans chaque `dist/` et `site/ch2/` (code généré) | faible | Retirer la fonction, régénérer les builds (lot b) |
| `chapters/ch2-silent-bells/src/js/56-form2-render.js:49` | `drawEclIdle` jamais appelée | `git grep -w drawEclIdle` : définition seule (+ `legacy/`) | faible | Retirer la fonction (lot b) |
| `chapters/ch2-silent-bells/src/js/40-boss-drowned-beacon.js:197` | constante `TF_LEN=10` jamais lue | `git grep -w TF_LEN` : déclaration seule (+ `legacy/`) | faible | Retirer la constante (lot b) |
| `chapters/ch1-ember-bridge/src/js/40-p2-foundry-render.js:7` | `qlimb` jamais appelée | `git grep -w qlimb` : définition seule | faible | Retirer la fonction (lot b) |

CSS : aucun sélecteur orphelin trouvé par la méthode, hors le cas `.btn.big` (§ 3), que l'heuristique manque parce que `big` apparaît ailleurs comme propriété JS.

### 1.2 Images et ressources non référencées par le code (poids décroissant)

| Chemin | Constat | Preuve | Risque | Action proposée |
|---|---|---|---|---|
| `store/ember-bridge-cover.png` (847 817) | Visuel de page de store du Chapitre I, nom d'avant « LumenBell » | 0 référence au nom dans tout le dépôt, workflows compris | moyen | Probable dépôt manuel sur itch.io : **demander à Kevin** avant tout déplacement |
| `store/screenshot-2-gouffre.png` (754 626) | Capture de store | 0 référence | moyen | Idem |
| `store/screenshot-4-sommet.png` (712 890) | Capture de store | 0 référence | moyen | Idem |
| `store/cover-itch.png` (693 515) | Couverture itch.io | 0 référence | moyen | Idem |
| `store/screenshot-3-epee.png` (682 683) | Capture de store | 0 référence | moyen | Idem |
| `store/screenshot-1-pont.png` (636 287) | Capture de store | 0 référence | moyen | Idem |
| `store/icon-sources/fg.svg` | Source d'icône | 0 référence au nom ; ses voisins `bg.html`, `fgp.html`, `full.html` sont lus par `store/icon-sources/r.js` | faible | Garder (source d'icône) ou archiver si `fgp.html` l'a remplacé ; à valider |
| `chapters/ch2-silent-bells/legacy/silent-bells.source.html` (193 288) | Import d'origine figé du Chapitre II | Cité seulement dans un commentaire de `build/build_ch2.py:4` et dans la docstring de `build/ch2_swap_args.py` ; aucun build ni test ne le lit | faible | `git mv` vers `archives/` (lot a). Risque de traçabilité de l'import seulement |

Assets **référencés** (à garder) : `apk/assets/icon-only.png` (473 525), `icon-background.png` (374 247), `icon-foreground.png` (150 083) lus par `.github/workflows/android.yml` et `store/icon-sources/r.js` ; `shared/svg/watcher-menu.svg` lu par `shared/js/20-watcher.js` et les deux `body.html`.

### 1.3 Versionné alors que régénérable (à signaler, pas à nettoyer)

Total ≈ 2 146 814 o de builds, plus deux fichiers de texte générés. Ils doivent rester commités : la CI compare par `git diff --exit-code` (règle 11).

| Chemin | Constat | Preuve | Risque | Action proposée |
|---|---|---|---|---|
| `site/ch2/index.html` (479 137) | Copie octet pour octet de `chapters/ch2-silent-bells/dist/index.html` | `cmp` identique | fort | Ne pas toucher à la main ; régénérer par `build_site.py` |
| `chapters/ch2-silent-bells/dist/index.html` (479 137) | Build généré par `build_ch2.py` | `build_ch2.py` + `tests.yml` | fort | Idem (`build_ch2.py`) |
| `site/ch1/index.html` (474 632) | Copie octet pour octet de `chapters/ch1-ember-bridge/dist/index.html` | `cmp` identique | fort | Idem (`build_site.py`) |
| `chapters/ch1-ember-bridge/dist/index.html` (474 632) | Build généré par `build.py` | CLAUDE.md règle 11 | fort | Idem (`build.py`) |
| `site/index.html` (239 276) | Hub généré par `build_site.py` | `tests.yml` | fort | Idem |
| `docs/TEXTES-CH1.md` (29 146) | Généré par `build/extract_texts.py` | en-tête du script | moyen | Ne pas éditer à la main |
| `chapters/ch2-silent-bells/TEXTES.md` (8 319) | Généré par `node tests/ch2-texts.js --write` | en-tête du test | moyen | Idem |

Les doubles `dist/` → `site/ch1|ch2/` coûtent 953 769 o de doublon exact. Les dédoublonner demanderait de changer `build_site.py`, `android.yml` et les tests : hors périmètre, aucune refonte proposée.

---

## 2. Doublons ch1 / ch2 / hub qui pourraient vivre dans `shared/`

Peu de copie textuelle : seulement 2 lignes de plus de 120 caractères sont communes à `00-core.js` et `02-core.js` (≈ 170 caractères). Les doublons sont de nom et de rôle, avec des corps souvent proches ou identiques sur leurs 120 premiers caractères.

| Chemin | Constat | Preuve | Risque | Action proposée |
|---|---|---|---|---|
| `chapters/ch1-ember-bridge/src/js/64-audio-music.js` (14 916) et `chapters/ch2-silent-bells/src/js/60-music.js` (19 801) | Deux moteurs de musique ; `musTick` de corps identique (120 premiers caractères), `MUS` de même nom | comparaison des déclarations de premier niveau | moyen | Noter seulement ; la partition reste propre à chaque chapitre |
| `chapters/ch1-ember-bridge/src/js/12-effects.js` (5 382) et `chapters/ch2-silent-bells/src/js/08-effects.js` (1 546) | `burst`, `ONO` de même nom, corps divergents | idem | moyen | Noter |
| `chapters/ch1-ember-bridge/src/js/60-ui-menu.js` (5 588) et `chapters/ch2-silent-bells/src/js/72-flow.js` (9 322) | `showMenu` (identique), `hideMenu`, `setPause`, `retryPhase`, `deathCard` (corps divergents) | idem | moyen | Noter |
| `chapters/ch1-ember-bridge/src/js/00-core.js` (9 305) et `chapters/ch2-silent-bells/src/js/02-core.js` (4 636) | `$`, `_`, `DIFFS`, `TRIAL_OPEN`, `endSeen`, `applyLang` identiques en tête ; `W`, `CHAPTER` divergents | idem | faible | Noter |
| `chapters/*/src/js/04-audio-sfx.js` (3 568 et 2 703) | Fines enveloppes `ensureAudio` / `tone` autour de `LB.audio` dans chaque chapitre | `04-audio-sfx.js:2-5` (ch1 et ch2) | faible | Noter |
| `chapters/*/src/js/{12-hero-states,36-p2-foundry-logic}.js` | `DG` de même nom dans les deux chapitres, corps différents | idem | moyen | Noter (table de réglages, ne pas fusionner sans équilibrage) |
| `site/src/js/10-hub.js` (28 799) et `shared/js/28-ui.js` (50 941) | `SETTINGS_T` et panneau de réglages `hset…` du hub répètent `LB.SETTINGS_T` et le panneau commun | `DEMANDES.md` entrée du 2 novembre, « à faire » | moyen | Déjà demandé ; rien à ajouter |
| `site/src/js/10-hub.js`, `chapters/*/src/js/*-core.js` | Même helper `$` de 1 ligne | comparaison des déclarations | faible | Négligeable |
| `build/fonts.css` (97 153) | Source unique des polices, déjà partagée par les trois builds | `build.py`, `build_ch2.py`, `build_site.py` | faible | Rien : pas un doublon |

Ordre de grandeur : les chapitres pèsent 266 376 o (ch1) et 268 226 o (ch2) de JS source, le hub 28 820 o, `shared/js` 97 170 o.

---

## 3. Reliquats du retrait des écrans « Commencer » (chapitres I et II)

La décision `docs/decisions/2026-11-05-chapitres-sans-commencer.md` signale elle-même ses orphelins comme « non nettoyés ». Le hub **garde** son `#gate` et son bouton (`site/src/page/body.html:34`, `site/src/js/10-hub.js`) : ce n'est pas un reliquat.

### 3.1 Code et CSS

| Chemin | Constat | Preuve | Risque | Action proposée |
|---|---|---|---|---|
| `shared/js/28-ui.js:106` (`@gate-js btnbig`), `:115` (règle `.btn.big` en media query) ; `shared/css/gate.css:14-15` ; `build/assemble.py:113-122` | Règle `.btn.big` encore injectée dans le CSS de chaque chapitre, sans élément qui la porte | `class="btn big"` n'existe que dans `site/src/page/body.html:34` ; les `body.html` des chapitres ne contiennent ni `gate` ni `fpLang` | moyen | Retirer le bloc `btnbig` et le cas particulier d'`assemble.py` ; **change la sortie des builds** (lot c) |
| `shared/js/28-ui.js:313, 341, 342` | Sélecteurs `#gateLangs` | Aucun `id="gateLangs"` dans le dépôt (`git grep gateLangs` : `28-ui.js` et `tests/menu-layout.js:18` seulement) | faible | Retirer les trois sélecteurs (lot c) |
| `shared/js/28-ui.js:331` | `const gb=$('gateBtn');if(gb)…` : branche sans effet dans les chapitres ; le hub fixe son texte lui-même (`10-hub.js:197`) | pas de `#gateBtn` dans les chapitres | faible | Retirer après avoir confirmé que le hub n'appelle pas `LB.menu.lang` (lot c) |
| `site/src/page/body.html:35` | Script `fpLang` : `var b=[]` suivi d'une boucle sur ce tableau vide (reste de `#gateLangs`) | lecture de la ligne | faible | Retirer la boucle ; le hub est régénéré par `build_site.py` (lot b ou « hub ») |
| `chapters/ch1-ember-bridge/src/js/60-ui-menu.js:54` | Commentaire « écran de démarrage (LB.gate) » | `LB.gate` n'est plus défini nulle part dans le code | faible | Corriger le commentaire (lot b) |

### 3.2 Tests et outils

| Chemin | Constat | Preuve | Risque | Action proposée |
|---|---|---|---|---|
| `tests/menu-layout.js:18, 27` | Sélecteurs `gate`, `gEn`, `gFr` et `R.gate={}` ; `R.gate` n'est jamais rempli | lecture des lignes 16-31 | faible | Retirer (lot c, `tests/` déclenche tous les périmètres) |
| `tests/ch2-lib.js:25` | Le crochet masque `#gate` « comme la copie de test » | Chapitres sans `#gate` | faible | Retirer l'instruction ; conserver le reste du crochet (lot c) |
| `tests/cine.js:173` | Clic sur `#gateBtn` seulement s'il existe | garde `if(g&&…)` | faible | Rien, inoffensif |
| `tests/visual-shots.js:47, 81, 91, 209` | Clics sur `#gateBtn` ; `:79` et `:205` utilisent des `click` qui lèvent une exception si l'élément manque (`:205`) ou plantent (`:79`) | lecture des lignes ; le test n'a pas été lancé | moyen | À vérifier lors d'un prochain lancement manuel : si ces pages sont des chapitres, le test échoue. Jamais lancé par défaut |
| `build/promo.js:204` | Clic sur `#gateBtn` | Contexte : fonction `hub()` (page du hub) | faible | Légitime, ne pas toucher |

### 3.3 Textes et documents

| Chemin | Constat | Preuve | Risque | Action proposée |
|---|---|---|---|---|
| `shared/NOTES.md:18, 80, 82` | Décrit encore `LB.gate` (« Commencer + langues », clic qui ferme l'écran et appelle `onStart`) et la source unique de l'écran de démarrage des chapitres | `LB.gate` absent du code | faible | Réécrire (lot a, doc seule) |
| `docs/COMMUN.md:82, 164, 181, 196` | Mêmes références à `#gate` et `LB.gate` | lecture des lignes | faible | Marquer comme historique ou corriger (lot a) |
| `DECISIONS.md` | La décision `docs/decisions/2026-11-05-chapitres-sans-commencer.md` **n'est pas dans l'index** (0 occurrence de `sans-commencer`) ; la ligne du 4 novembre « premier rendu = seul l'écran Commencer » (index, ligne 125) est dépassée pour les chapitres | `grep -c sans-commencer DECISIONS.md` = 0 | moyen | Ajouter la ligne d'index (lot a). **Décision à valider** |

À ne pas confondre : `chapters/ch1-ember-bridge/src/js/60-ui-menu.js:4` (`get go(){_('Start','Commencer')}`) et `chapters/ch2-silent-bells/src/js/72-flow.js:38` (`introCard`) sont le bouton de la **carte d'ouverture de phase**, vivant et utilisé (`60-ui-menu.js:10`) : ce n'est pas l'écran retiré.

---

## 4. Fichiers à archiver (`git mv` vers `archives/`, jamais de suppression)

| Chemin | Constat | Preuve | Risque | Action proposée |
|---|---|---|---|---|
| `chapters/ch2-silent-bells/shots/` (17 JPEG, 2 216 002 o) | Planches avant / après des PR de l'étape C1, « pièces de revue » | `chapters/ch2-silent-bells/NOTES.md:105` ; aucun build ni test ne les lit ; l'audit du 30 octobre en proposait déjà l'archivage. Poids : `c1-1-combats/phase3.jpg` 230 714, `c1-4-retouches/2-lore.jpg` 210 733, `c1-2-sorts/phase3.jpg` 207 805, `c1-2-sorts/phase2.jpg` 196 883, `c1-4-retouches/1-textes-intro-outro.jpg` 185 965, `c1-1-combats/phase2.jpg` 183 838, `c1-3-cinematiques/outro.jpg` 146 668, `c1-1-combats/phase1.jpg` 144 940, `c1-5-retouches-2/1-visuels.jpg` 131 775, `2-riposte.jpg` 111 436, `c1-3-cinematiques/intro.jpg` 109 087, `c1-2-sorts/phase1.jpg` 77 579, `c1-4-retouches/3-gameplay.jpg` 74 845, `c1-5-retouches-2/3-illusions.jpg` 73 116, `4-gros-plans.jpg` 51 578, `c1-4-retouches/3-jauge-rages.jpg` 43 620, `c1-1-combats/menu.jpg` 35 420 | faible | `git mv` vers `archives/ch2-shots/` ; mettre à jour `ch2/NOTES.md:105`. Un changement sous `chapters/ch2-silent-bells/` déclenche le périmètre ch2 de la CI |
| `docs/AUDIT-2026-10-30.md` (28 337) | Audit ponctuel, propositions déjà appliquées (`archives/` existe) | Cité par `README.md` et `docs/DEVLOG-NOTES.md` seulement | faible | Archiver et corriger le lien du `README.md` |
| `docs/rapports/2026-11-04-mort-difficile-voix.md` | Rapport d'analyse ponctuel | 0 référence au nom dans le dépôt | faible | Archiver (hors `paths-ignore` : la CI lance `smoke`) |
| `chapters/ch2-silent-bells/legacy/silent-bells.source.html` (193 288) | Voir § 1.2 | idem | faible | `git mv` vers `archives/` ; adapter le commentaire de `build_ch2.py:4` |
| `build/ch2_swap_args.py` (81 lignes) | Outil de migration à passe unique (27 octobre), déjà appliqué | Cité par `archives/DECISIONS-2026-10-27-28.md` seulement ; aucun workflow ne l'appelle | faible | `git mv` ; sous `build/`, la CI lance **tous** les périmètres |
| `CHANGEMENTS.md` (24 517) | Sections au statut Fait : D, G, K, L, N (Fait, PR fusionnée) | tableau lignes 11-24 | moyen | Déplacer le corps de ces sections dans `archives/CHANGEMENTS-faits.md`, garder la ligne du tableau. Des décisions citent « `CHANGEMENTS.md` C / J » : garder des renvois |
| `CHANGEMENTS.md` (incohérences, pas d'archivage) | Statuts à réconcilier : K, L, N sont Fait dans le tableau mais le corps de leurs sections dit encore « en cours … PR à ouvrir » (lignes 128, 150, 183) ; I « À tenter » alors que `DECISIONS.md` (5 novembre) livre les pleurs de la Voix ; M « À faire » alors que `ch2/phare-refonte` (3 novembre) est livré | lecture des lignes citées | moyen | **À faire par Kevin ou en session dédiée** : je n'invente aucun statut |
| `DEMANDES.md` (19 lignes) | 4 demandes sur 5 déjà fermées, chacune déjà résumée dans `archives/DEMANDES-fermees.md` | 4 titres « fermée le … » | faible | Déplacer les 4 en-têtes vers `archives/DEMANDES-fermees.md` ; garder la demande du 2 novembre (à faire) |
| `ROADMAP.md` | Section « Fait » (9 puces) | `ROADMAP.md:3-12` | faible | Archiver la section ; garder « à faire » |
| `CHANGELOG.md` (8 lignes) | Obsolète, pas archivable : cite le package `com.emberbridge.game` (devenu `com.lumenbell.game`) et « Non publié » ne reflète plus le hub | lecture | faible | Mettre à jour, pas archiver |
| `tests/trial-end.js` (12 lignes), `tests/trial-play.js` (19 lignes) | Scripts de captures de l'Épreuve du feu, absents de `tests.yml` | listés seulement dans `NOTES.md:19` ; `trial.js` est dans la CI | moyen | À valider : outils manuels documentés, peut-être remplacés par `trial.js`. Ne pas déplacer sans accord |
| `build/promo.js` (26 792), `build/promo-check.py` (11 805) | Génération et contrôle des visuels de promotion ; appelés l'un par l'autre | cités par `docs/decisions/2026-11-05-chapitres-sans-commencer.md` seulement ; absents de `NOTES.md`, `README.md`, des workflows | moyen | Les **documenter** dans `NOTES.md`, ne pas archiver |
| `NOTES.md` (66 lignes) | Rien de prouvé comme traité (aucun mot « résolu / obsolète ») ; la règle 15 ne permet pas de lire plus | `grep` | — | Rien proposé |

---

## 5. Points qui ne doivent pas être touchés

| Chemin | Constat | Preuve | Risque | Action proposée |
|---|---|---|---|---|
| `docs/LORE.md` | Référence unique du lore | CLAUDE.md règle 1 | fort | Ne jamais modifier sans demande explicite |
| `chapters/ch1-ember-bridge/dist/index.html`, `chapters/ch2-silent-bells/dist/index.html`, `site/index.html`, `site/ch1/index.html`, `site/ch2/index.html` | Fichiers générés | `build.py`, `build_ch2.py`, `build_site.py`, règles 11 et 18 | fort | Régénérer, ne jamais éditer |
| `docs/TEXTES-CH1.md`, `chapters/ch2-silent-bells/TEXTES.md` | Générés (`extract_texts.py`, `ch2-texts.js --write`) | en-têtes ; `TEXTES.md` lu par `tests.yml` | moyen | Idem |
| `docs/CH2-SPEC.md` | **Lu par les tests** (`tests/ch2-lib.js:37`, `ch2-texts.js`, `ch2-announce.js`) ; l'audit du 30 octobre suggérait de l'archiver | `tests/ch2-lib.js:37` | fort | Ne pas déplacer |
| `docs/GLOSSAIRE.md`, `docs/COMMUN.md`, `docs/BALANCE.md`, `BIBLE.md`, `DECISIONS.md`, `docs/decisions/*` | Références vivantes ; les chemins `docs/COMMUN.md`, `docs/GLOSSAIRE.md`, `docs/decisions/**` sont dans `paths-ignore` de la CI | `tests.yml` lignes 8-21 | moyen | Ne pas renommer ; les archives de `DECISIONS.md` restent dans `archives/` |
| `build/build.py`, `build_ch2.py`, `build_site.py`, `build_test.py`, `assemble.py`, `fonts.css` | Chaîne de build, appelée par `tests.yml` et `android.yml` | `tests.yml:90-103`, `android.yml:31-33` | fort | Ne pas toucher |
| `.github/workflows/tests.yml`, `android.yml` | Référencent `build/`, `site/` entier, `apk/`, `tests/package-lock.json` | lecture des workflows | fort | Ne pas toucher |
| `apk/assets/*.png`, `apk/capacitor.config.json`, `apk/package.json` | Lus par `android.yml` | `android.yml` | fort | Ne pas toucher |
| `tests/launch.js`, `ch2-lib.js`, `ch2-bot.js`, `ch1-bot.js`, `lockscroll.js` | Modules requis par d'autres tests (`require('./…')`) ; `ch1-bot.js` par `input.js`, `ch2-bot.js` par `ch2-input.js`, `ch2-trial.js`, `ch2-retouches3.js`, `ch2-announce.js` | `grep require` | fort | Ne pas déplacer |
| Tests listés dans `tests.yml` (`smoke`, `fonts-offline`, `keys`, `audio`, `trial`, `input`, `inputs`, `help`, `announce`, `cine`, `menu-layout`, `menu-title`, `ch2-*`, `hub`, `hub-site`) | Lancés par la CI | `tests.yml:121-218` | fort | Ne pas toucher sans règle de périmètre |
| `shared/css/gate.css` | Contient encore les règles du `#gate` du hub et le voile de premier rendu | `site/src/page/style.css:2,110` | fort | Garder tout sauf le bloc `btnbig` (§ 3) |
| `archives/` | Déjà en `paths-ignore` | `tests.yml:20` | faible | Destination de tous les déplacements |

---

## Classement en trois lots

### (a) Sûr : doc seule ou fichier non référencé

- Doc : `shared/NOTES.md` (gate), `docs/COMMUN.md` (gate), index de `DECISIONS.md` (ajout de la décision « sans Commencer »), `CHANGELOG.md`, `ROADMAP.md` (section Fait), `DEMANDES.md` (4 en-têtes fermés), corps des sections Fait de `CHANGEMENTS.md` (réconcilier les statuts à part).
- Déplacements vers `archives/` : `docs/AUDIT-2026-10-30.md`, `docs/rapports/2026-11-04-mort-difficile-voix.md`, `chapters/ch2-silent-bells/legacy/silent-bells.source.html`, `build/ch2_swap_args.py`, `chapters/ch2-silent-bells/shots/`, éventuellement `store/icon-sources/fg.svg`.
- **Tests** (règles 10 et 16) : aucun test local pour la documentation seule. `smoke` tourne automatiquement sur la PR non brouillon, sauf si seuls des `.md` en `paths-ignore` changent. Hors `paths-ignore` : `docs/rapports/**`, `docs/CH2-SPEC.md`, `docs/BALANCE.md` déclenchent `smoke`. Déplacer `shots/` ou `legacy/` sous `chapters/ch2-silent-bells/` déclenche le périmètre ch2 ; déplacer `build/ch2_swap_args.py` déclenche tous les périmètres : à grouper en une seule PR pour ne payer la CI qu'une fois.

### (b) Logique d'un chapitre

- Chapitre I : `qlimb` (`40-p2-foundry-render.js:7`), commentaire `60-ui-menu.js:54`.
- Chapitre II : `startCine`, `drawEclIdle`, `TF_LEN`.
- Hub : `fpLang` de `site/src/page/body.html:35`.
- **Tests** : `smoke` + le test ciblé du chapitre. Chapitre II : `build.py`, `build_ch2.py` puis `build_site.py` et commit des fichiers générés (règle 18), puis `ch2-smoke` et `ch2-texts`. Chapitre I : `build.py` et, par déduction (copie octet pour octet), `build_site.py`, pour que `dist/` et `site/ch1/` restent identiques. Hub : `build_site.py`, `hub.js`, `hub-site.js` (manuel). Jamais par défaut : `visual-shots`, bots, `trial-*`.

### (c) `shared/` (et outillage touchant tous les périmètres)

- `LB.chRgb` et `LB.chHover` (`24-cine.js`), sélecteurs `#gateLangs` et `gateBtn` de `28-ui.js`, bloc `btnbig` (`28-ui.js`, `gate.css`, `assemble.py`), restes de `tests/menu-layout.js` et `tests/ch2-lib.js`.
- **Tests** : les deux chapitres + `keys` et `audio` ; `build.py`, `build_ch2.py` et `build_site.py` avec commit des sorties (le bloc `btnbig` modifie les trois builds) ; avant un tag `v*` ou un envoi itch.io, lancement manuel de la CI « Tests » (périmètres `shared ch2 hub`) sur `main`. Lire toute la sortie (`errs []` attendu) et relancer uniquement le test en échec.

---

## Décisions à valider

1. Réutiliser `archives/` plutôt que créer `archive/`.
2. Futur de `store/` (4,3 Mo, 0 référence) : à confirmer avec Kevin avant tout déplacement.
3. Ajout de la décision « sans Commencer » à l'index de `DECISIONS.md` et mise à jour de la ligne du 4 novembre.
4. Réconciliation des statuts de `CHANGEMENTS.md` (I, K, L, M, N).
5. Sort de `tests/trial-end.js` et `tests/trial-play.js` ; documentation de `build/promo*.js`.
6. Bloc `btnbig` : retirer maintenant ou garder jusqu'à une session `shared/` dédiée.
