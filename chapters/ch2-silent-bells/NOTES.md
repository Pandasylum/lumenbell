# Chapitre II · Silent Bells (notes du dossier)

- **État** : import du 25 octobre (`legacy/silent-bells.source.html`, tag `ch2-import`), puis écarts techniques traités le 27 octobre (branche `ch2/tech`) : `_(en, fr)`, clés `lb-…`, `<head>` propre, lien vers l'artefact du Chapitre I retiré, contrôle réseau. Puis étape B « gameplay et textes » (branche `ch2/texts`) : mots d'annonce retirés, difficultés du Chapitre I, phase III sans contre-attaque à frapper, textes du cahier des charges. Puis étape C1 « décors et personnages » (branche `ch2/visuals-fights`, voir plus bas) ; puis nouveaux sorts (`ch2/spells`) et scènes d'intro et d'outro (`ch2/visuals-cinematics`).
- **Cahier des charges** : `docs/CH2-SPEC.md` (décisions de Kevin du 27 octobre 2026). Lore : `docs/LORE.md`.
- **Étapes** : 1) import propre ✔ ; 2) écarts techniques (étape A) ✔ ; 3) gameplay et textes (étape B) ✔ ; 4) visuels (étape C1 : décors et personnages ✔, sorts, scènes d'intro et d'outro) ; 5) moteur et héros communs, menu commun.
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

## Gameplay (étape B, 27 octobre)
- **Difficultés** (`DIFFS`) : Veilleur 6 / 4 / 3 PV, Épreuve 4 PV pour tout le parcours (Normal et Difficile), PV conservés, une chute renvoie à la phase I. Comme `applyDiff()` au Chapitre I : durée de l'action × `m` (2 / 1 / 0,6), de la récupération × `rm` (1 / 1 / 1,2). PV des boss inchangés (6 / 8 / 10, à régler après essais). `sp` (vitesse des attaques) inchangé.
- **Riposte** (`closePat`, table `R_CNT`) : dans les trois phases, une série sans faute déclenche la riposte automatique (2 dégâts si tous les blocages sont parfaits et la série compte au moins deux attaques à toucher). Phase III : foudre renvoyée vers la lanterne (forme I) ou la méduse (forme II). La contre-attaque « quand la lanterne faiblit, touche pour frapper » (menace `strike`) et la fenêtre de l'orbite de la forme II sont **supprimées** ; l'orbite tourne sans s'arrêter. Le barrage (rester appuyé) reste la mécanique de la phase. La contre-attaque à jauge de fatigue n'existait pas dans le code : rien à garder ni à retirer (réservée à un chapitre suivant).
- **Écrit à l'écran** : seulement les titres (cinématiques), les noms de boss, les cartons d'intro et d'outro, et quatre onomatopées (`ONO` : `CLANG` blocage de la phase II, `BAM` coup porté au boss, `KRAKOOM` coup final de la forme II, `KRAAAK` Veilleur écrasé par un débris qui tombe dans la cale, phase II). Les rages et derniers assauts ne s'affichent plus : sting + `say()` (lecteur d'écran). Aide visuelle des faisceaux : un demi-cercle (pointillé : se préparer ; plein : tenir) au lieu de « TIENS ! ».
- **États du Veilleur** (comme au Chapitre I ; `S.pl`, `down()`, `plStep()`, `PT()`, tables `T`, `DG`, `R_T`) : `ready` → `act` → `recover` → `ready`. L'action est le blocage en phase II (`T.barrier` 0,333 s puis `T.recovery` 0,7 s), le pas de côté en phase I (`DG.act` 0,333 s puis `DG.rec` 0,7 s), la garde en phase III (`R_T.guard` 0,333 s, prolongée tant que le bouton est tenu, contre les faisceaux, avec l'endurance `drain` / `regen` ; `R_T.broken` 0,9 s de récupération si elle s'épuise ; puis `R_T.rec` 0,7 s). Un appui n'agit qu'en `ready` ; pendant l'action ou la récupération il ne relance rien et met seulement `deny` = 0,25 s (barre de récupération rouge sous le Veilleur, bleue sinon).
- **Résolution à l'impact** : une attaque est arrêtée si le Veilleur est dans son action à l'impact (ou dans les `grace` premières secondes de sa récupération) ; un faisceau, s'il est en garde pendant tout son passage. Une attaque arrêtée le renvoie à `ready` (on enchaîne une série). Coup reçu : état `hurt` de `min(hurt, max(0,14, écart jusqu'à l'attaque suivante − 0,2))` s (règle du Chapitre I) : l'étourdissement s'arrête assez tôt pour arrêter l'attaque suivante, d'où un seul coup par erreur. Reflet esquivé (appui visant le reflet plutôt qu'une vraie attaque) : récupération rallongée de `DG.fool` = 0,6 s. Parfait : action lancée au plus `perf` (0,08 s × m) avant l'impact.
- **Animation** : pas de côté (`S.dodgeT`) et blocage (`S.guardT`) datés au seul passage de `ready` à l'action ; un appui refusé ne les touche pas. Le dôme de la phase III suit l'état (`S.holding` = garde en cours).
- **Déblocage** : `UNLOCK_ALL = true` (en tête du script) ouvre les trois phases de la frise dès le départ ; `false` rétablit le déblocage progressif par `lb-ch2-unl` (fonction `unlocked()`). Difficultés et Épreuve : toujours ouvertes ; la frise est fermée en Épreuve.
- Les définitions mortes (`P1`, `P2`, `P3`, `spawn`, `fooled`, `anim1`, `drawOrbs` déclarées deux fois, la seconde l'emportait) ont été retirées ; seules restent celles du bas du script.

## Textes (étape B)
- Source : `docs/CH2-SPEC.md`. Cartes : sourcil = titre de phase, titre = nom du boss, texte = panneau d'entrée (`PH[id].desc`) ou de fin (`PH[id].end`), forme II (`PH[3].form2`). Fin de phase III : carte « Phase III terminée » entre la cinématique de fin et l'outro ; victoire : « Chapitre II · Silent Bells » + records.
- Intro (`PCAPF`, `PRO_TITLE`) et outro (`ECAPF`, `EPI_TITLE`) : tables [début, fin, texte] en secondes. Titre de l'intro (`seriesTitle`, table `SERIES_T`) : « Lumenbell » en grand, « Chapitre II · Silent Bells » en dessous, en petit et en turquoise ; la ligne du dessous est placée d'après la boîte mesurée du grand titre (aucun chevauchement, vérifié par `tests/ch2-title.js` de 360 px au bureau). Carton 6 de l'outro : « Chapitre III. À suivre. » teinté `CH_COL[3]`. Les scènes dessinées sont encore celles de l'import (étoiles, marais, village) : à refaire à l'étape C, avec les durées des cartons.
- `caption()` coupe en deux lignes une légende trop large (espace le plus proche du milieu).
- Menu : « Chapitre II · Silent Bells » au-dessus de « Lumenbell » ; sous-titre, accroche et mode d'emploi retirés. Titre de page : « Lumenbell · Silent Bells » (le build coupe sur cette ligne).
- **Liste de référence** : `TEXTES.md` (dans ce dossier), régénérée par `node tests/ch2-texts.js --write`. Toute modification de texte doit la mettre à jour dans le même commit (relire le diff).
- Phrases pour le lecteur d'écran seulement (`say`, `aria`) : descriptives, hors cahier des charges, à relire si besoin (lignes 1 à 12 et 44 à 55 de `TEXTES.md`).

## Texte : `_(en, fr)`
- Même ordre qu'au Chapitre I : `const _=(en,fr)=>LANG==='fr'?fr:en;`. Langue par défaut : français.
- L'inversion a été faite par script (150 appels, appels imbriqués et `_(m[1],m[2])` compris). Le contrôle de cette inversion par rapport à `legacy/` a servi jusqu'à l'étape A ; depuis l'étape B, `tests/ch2-texts.js` compare à `TEXTES.md` (voir plus haut).

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
- `node tests/ch2-texts.js` : sans navigateur. Définition `_(en, fr)` ; tous les couples égaux à `TEXTES.md` ; FR et EN de même structure (vide, nombre de phrases, de « · » et de « … », ponctuation finale) ; chaque texte validé du cahier des charges présent mot pour mot (lu dans `docs/CH2-SPEC.md` : « » côté français, " " côté anglais ; titres et noms recopiés dans `tests/ch2-lib.js`) ; textes « À supprimer » et anciens noms absents.
- `tests/ch2-lib.js` : extracteur commun, lecture du cahier des charges, et **copie de test à crochets** `build/out/ch2-test.html` (dist + `window.__t`, sans boucle `requestAnimationFrame` : le test avance le temps par pas de 1/60 s). Le `dist` publié n'a aucun crochet.
- `node tests/ch2-bot.js [parties] [--check]` : bot à un bouton (appui visant le milieu de la fenêtre d'arrêt, 0,14 s avant l'impact en Normal, avec une erreur de timing gaussienne `sigma`, ignore les reflets, reste appuyé pendant les faisceaux). Mesure la phase III (formes I et II, lancée depuis la frise). `--check` (CI, 20 parties) : au moins 90 % de victoires en Normal à 40 et 70 ms.
- `node tests/ch2-announce.js` : aucun mot d'annonce (liste `BAN`) dans les appels `pop`/`fillText`/`caption`/`title`/`bossBar`, puis en jeu (FR et EN, Normal et Difficile) : parcours complet avec un joueur parfait (prologue → outro → victoire) et chaque phase avec un bot maladroit (blessures, reflets, garde brisée, défaite) ; tout texte dessiné sur le canvas est relevé et doit être un texte du cahier des charges, « Lumenbell » ou une onomatopée. ~3 min.
- `node tests/ch2-input.js` : règles des états dans les trois phases (appui en `ready` → action et date d'animation ; appui pendant l'action ou la récupération → rien d'autre que `deny` = 0,25 s, date d'animation inchangée ; 0,333 s puis 0,7 s puis `ready` ; garde tenue puis relâchée en phase III ; reflet → récupération de 1,3 s ; coup reçu → `hurt` raccourci) ; spam à l'aveugle toutes les 0,25 / 0,5 / 0,75 / 1 s → le Veilleur meurt, Normal et Difficile, phases I à III ; un seul appui 0,05 / 0,1 / 0,2 s avant l'ouverture de l'action (Normal, 8 attaques par phase) → jamais plus d'un coup ; joueur parfait → 0 coup. ~30 s.
- `node tests/ch2-title.js` : titre de fin d'intro, FR et EN, à 360×740, 390×844, 412×915, 844×390, 768×1024, 1100×760 et 1920×1080 : boîtes mesurées des textes dessinés (aucun chevauchement, tout dans le canvas, au moins 8 unités entre les deux lignes, bloc au-dessus du sceptre-lanterne), « Lumenbell » plus grand, chapitre en turquoise, pas de débordement horizontal de la page. Captures dans `tests/shots/`.
- `node tests/ch2-trial.js` : PV, `m` et `rm` par difficulté ; en Épreuve, PV conservés de la phase I à la phase II et une chute renvoie à la phase I avec 4 PV ; en Normal, PV rendus entre les phases.
- `node tests/ch2-keys.js` : migration (anciennes clés seules, nouvelles prioritaires, `eb-lang`, `pn-lang` avant `eb-lang`, aucune clé) et écriture dans les seules clés `lb-…` ; frise ouverte (`UNLOCK_ALL`), et déblocage progressif vérifié sur une copie `UNLOCK_ALL = false` (`build/out/ch2-unlock-off.html`).
- `node tests/ch2-smoke.js` : sur `dist/index.html`. Syntaxe (`new Function`), puis **réseau** : contrôle statique (aucune URL `http(s)://` ni `//hôte`, aucun `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, `serviceWorker`, `import()`, `window.open`, aucune ressource liée par `href`/`src`) ; en jeu, contexte hors ligne, `context.route` intercepte et refuse toute requête autre que `file:`/`data:`/`blob:`, les API réseau sont espionnées, les WebSocket, workers externes, popups et pages non `file:` sont relevés. Puis `db-unl=3` (ancienne clé, donc migration) posé avant le chargement, Normal puis Difficile (retour au menu entre les deux), prologue passé (Entrée), phase I → II → III via la frise `#phases`, PV max affichés (4 puis 3). Puis sans aucune clé : depuis le menu (Normal, Difficile, Facile) puis la frise, phases III et II lancées directement ; Épreuve lancée depuis le menu (phase I, 4 PV, frise fermée). Sortie attendue : `errs []`.
- Numéros de phase : interne `S.phase` 2 = Phase I (la Voix Creuse), 1 = Phase II (le Roi de Rouille), 3 = Phase III (le Phare Noyé) ; `ORDER=[2,1,3]`. Le test lit `document.body.dataset.ph` (interne) et `#hdEye` (affiché).
- Lancement local si Playwright ne trouve pas son Chromium : `PW_CHROMIUM=/opt/pw-browsers/chromium node tests/ch2-smoke.js` (voir `NOTES.md` racine).

## Comparaison en image (méthode du 27 octobre)
- 48 captures : menu, menu Épreuve, prologue, carte et trois instants de jeu pour chaque phase, pause ; en FR et EN à 1100 × 760, et en FR à 390 × 844 (téléphone). Plus quatre captures pleine page du menu (390 × 844, 844 × 390, 640 × 360, 1920 × 1080).
- Déterminisme : `requestAnimationFrame`, `performance.now` et `Date.now` remplacés par un pas fixe de 1/60 s avancé par le test (`page.clock` laisse un décalage de 1 à 2 ms entre exécutions), `Math.random` à graine fixe, `AudioContext` coupé, `animations:'disabled'`, souris ramenée en (0, 0) avant chaque capture. Deux exécutions du même fichier : 48/48 identiques au pixel.
- Résultat contre le `dist` de `main` : identique au pixel après chaque étape (inversion, clés, `<head>`) ; après le retrait du lien, seuls les six écrans de menu diffèrent (le lien disparaît, le bloc du menu se recentre verticalement).
- Le script n'est pas dans `tests/` (outil ponctuel) ; le refaire au besoin à partir de cette description.

## Mesures des états du Veilleur (27 octobre, `node tests/ch2-input.js`)
| Cas | Résultat |
|---|---|
| Spam à l'aveugle toutes les 0,25 / 0,5 / 0,75 / 1 s, Normal, phases I / II / III | mort dans les 12 cas, en 7 à 15 s, boss à 8/8 (7/8 une fois) |
| Idem en Difficile | mort dans les 12 cas, en 5 à 10 s, boss à 10/10 (9/10 une fois) |
| Un appui trop tôt (0,05 / 0,1 / 0,2 s avant l'ouverture de l'action), Normal, 72 cas | 1 coup : 58 ; 0 coup : 14 (tous à 0,05 s trop tôt en phases II et III : l'attaque tombe dans les 0,06 s de grâce de la récupération ; en phase I la grâce est de 0,05 s) ; jamais 2 |
| Joueur parfait, Normal et Difficile, 3 phases | 0 coup |
| Spam toutes les 0,25 s pendant 4 s en phase I (16 appuis) | 5 pas de côté seulement (les autres appuis : barre rouge) |

Mesures précédentes (table `INPUT`, remplacée) : appuis toutes les 0,25 s → mort ; un appui trop tôt → 1 coup dans 72 cas sur 72. Avant toute correction (blocage de 0,25 s, rien en phase III) : marteler en phase III en tenant la garde battait le boss sans coup reçu.

## Mesures de la phase III sans contre-attaque (27 octobre, `node tests/ch2-bot.js 100`)
Victoires sur 100 parties (formes I et II), temps moyen d'une victoire, coups reçus en moyenne :

| Erreur de timing (σ) | Normal (4 PV, fenêtre 0,2 s) | Difficile (3 PV, fenêtre 0,12 s) |
|---|---|---|
| 40 ms | 100/100, 55,6 s, 0,0 | 99/100, 69,9 s, 0,0 |
| 70 ms | 99/100, 63,6 s, 0,3 | 39/100, 80,5 s, 1,3 |
| 100 ms | 81/100, 69,7 s, 1,4 | 2/100, 84,0 s, 2,0 |

Avec la table `INPUT` (remplacée) : Normal 100/100, 99/100, 86/100 ; Difficile 100/100, 52/100, 2/100.

Avec les états du Veilleur (bot visant le milieu de la fenêtre d'arrêt : 0,14 s avant l'impact en Normal, 0,075 s en Difficile ; 100 parties) : Normal 100/100 (73,6 s), 98/100, 60/100 ; Difficile 84/100, 9/100, 0/100. La fenêtre n'est plus symétrique : il faut avoir lancé l'action avant l'impact (0,333 s × m), seules 0,05 à 0,06 s de grâce sont accordées après ; un appui en retard est un coup reçu. Difficile (action 0,2 s, récupération 0,84 s) est nettement plus dur : timings à régler dans la session d'équilibrage.

Avant l'étape B (main : 6 / 5 PV, fenêtres 0,2 / 0,155 s, contre-attaque à frapper, que le bot touchait aussi), 30 parties : Normal 30/30 à 40, 70 et 100 ms (45,7 / 50,0 / 57,6 s) ; Difficile 30/30, 30/30, 28/30. La phase reste gagnable ; elle est plus longue (riposte à 1 dégât quand la série ne compte que des faisceaux) et Difficile est nettement plus dur (3 PV, fenêtre ×0,6) : à régler avec les PV des boss après les essais sur téléphone.

## Visuels des combats (étape C1, 27 octobre, `ch2/visuals-fights`)
- **Couleur** : turquoise `#4fe0cc` (`CH_COL[2]`, `--acc` dans les trois phases). Plus de braise : la lumière du Roi est un ambre pâle, le parasite reste cyan.
- **Décors** (`bg1` cale, `bg2` salle des reflets, `bg3` récifs) : plus de forge, de neige, de lac gelé ni d'aurore. `bg2` dessine l'eau ; le reflet est posé par `mirrorFloor()` après le Veilleur et le boss (copie du haut de l'image, retournée et écrasée ; table `MIRROR`) ; la trappe (`HATCH`, `drawHatch(k)`) est fermée sous l'eau pendant le combat et s'ouvre à la fin de la phase I. Embruns : `SPRAY` ; rochers : `reefRock()`.
- **Pièces du Roi = pièces de la tour** (`PDRAW`, `TOWER`) : `tb0`, `tb1` (avec la cage du cœur), `tb2` (les trois cloches du torse), `ring` ×6 (jambes), `sbell` ×2 (épaules), `seg` ×4 (bras), `head` (cloche de tête), `fist` (main droite), `harp` (harpon de la main gauche). Le Roi (`drawBoss1`) dessine son torse, ses épaules et ses jambes avec ces fonctions : une retouche d'une pièce change le Roi et la tour. `FIXED(k)` : pièces qui restent sur le récif quand la tour éclate (cloches du torse, poing, harpon) ; `STUMP` : leur empilement en forme II. Sommet de la tour : `LY = GY-333`.
- **Harpon** : `harpoon(x, y, angle, longueur)` (pointe en (x, y), renvoie l'anneau pour la chaîne) ; `pHarp` le dessine tenu. Attaques `chain` (trois lancers) et `hpOut`/`hpBack` (aller, puis retour) : main gauche, mêmes temps qu'avant.
- **Cloche** : `pHead(heat, o)` ; signes anguleux (`RUNES`, `runes()`) toujours ; `o.word` (mot gravé, `_('Crown','Couronne')`) et `o.crack` après le dernier coup (`bellMarks()`). Repos final : `BELL_REST`.
- **Cinématiques** : temps des nouveaux moments dans `CINE_P1` (lanterne : chute, enfoncement ; trappe), `CINE_P2` (ancre tirée du sol puis mise dans le dos ; lueur qui monte de l'épave), `CINE_P3` (zoom sur la cloche). Lanterne : `lanternPos()`, `keeperLantern()`, `sinkGlow()` (pulsation et trappe, posées après le reflet). Ancre au sol : `ANCHOR_FLOOR`.
- **Pics de récif** : `spikeTell()` (annonce) et `reefSpikes()` (coup reçu), mêmes temps qu'avant.
- **Menu** : le SVG garde sa construction ; aurore → brume, montagnes → mer et récifs, neige (`.msn`) → embruns qui montent.
- **Captures avant/après** : outil hors dépôt (méthode du 27 octobre : horloge à pas fixe, `Math.random` à graine, dessin à chaque pas pour que les effets « une fois » se déclenchent à leur instant) ; scènes : intro, entrées, combat (attaques forcées), fins de phase, forme II, outro, menu.
- **Planches avant/après** des PR de l'étape C1 : `shots/` (JPEG, avant à gauche = `main`, après à droite). Pièces de revue, à supprimer une fois les visuels validés.

## Vocabulaire : bloquer, plus de parade (28 octobre)
- Le Veilleur n'a plus d'épée : **bloquer** (EN *block*) en phase II et en phase III (blocage tenu, le barrage), **esquiver** en phase I. Bouton de la phase II : « Bloquer » / « Block » ; lecteur d'écran : « Série bloquée » ; son `sfx.block`, onomatopée `ONO.block` (`CLANG`). Les états restent ceux du Chapitre I (`ready` → action → `recover`).
- Clés de tables gardées : `T.barrier` (durée du blocage), `R_T.guard` (blocage tenu de la phase III), `S.guardT` (date d'animation du blocage).
- Bouton de la phase III : « Garde » / « Guard » gardé (à valider). Les mots d'annonce « Paré », « Parade »… restent interdits à l'écran (`tests/ch2-announce.js`), comme « Bloqué ».

## Nouveaux sorts (étape C1, partie 2, 28 octobre, `ch2/spells`)
- **Table `SP`** (à côté de `FINAL_AT`) : toutes les durées des nouveaux sorts, × `f` comme les autres séries ; valeurs **provisoires** reprises des sorts voisins (le commentaire de la table dit d'où vient chacune).
- **Phase II** (`P1`) : `wave(big)` (menace `wave` : `tl` pied posé, `ti` blocage), `rafter(ti)` (menaces `rafter` n = 1 et 2), `surge()` = vague + poutre (remplace `stomp` et `rock`), `dwave()` (rage), `rust()` (rage : `S.rust` = nuage, puis une menace `slam` avec `ls` et `rust`). Dessin : `drawWave()`, `drawRafter()` (table `RAFTER`), `drawRust()` (`RUSTP`, `S.kingHead`).
- **Phase III, forme I** (`P3`) : `kwave()` (menace `kwave`, maintien comme `beam`), `tide()` (rage : vague puis deux `spike` avec `tide`). Dessin dans `drawBeacon()`.
- **Phase III, forme II** (`P3b`) : `storm()` (rage : menaces `sring` puis `trap` avec `hold`, `ta`, `tb`). La cloche-piège sait maintenant appuyer (maintien) en plus de tomber (tap).
- **Phase I** (`P2`) : `echoR()` (rage : l'écho, puis deux `shard` avec `from` = reflet 1 ou 2 qui se brise). `drawBoss2()` cache le reflet brisé ; `drawOrbs()` fait partir l'éclat de son visage.
- **Captures** : scènes forcées (un tirage fixe de `pick`) pour chaque nouveau sort ; planches dans `shots/c1-2-sorts/`.
- **Contrôle du 28 octobre** : joueur parfait (bot à erreur nulle) sur chaque nouveau sort forcé, Normal et Difficile : 0 coup reçu dans les 14 cas. Bot de la phase III (20 parties) : Normal 20/20, 20/20, 11/20 à 40 / 70 / 100 ms ; Difficile 17/20, 2/20, 1/20 (avant les nouveaux sorts : 20/20, 19/20, 11/20 ; 20/20, 0/20, 0/20).

## Intro et outro (étape C1, partie 3, 28 octobre, `ch2/visuals-cinematics`)
- `drawPrologue(t)` : plans `PRO_SHOTS` (côte et village, Phare au large, plage, haut du Phare + Veilleur + titre) ; cartons `PCAPF`, titre `PRO_TITLE` (inchangés) ; sons `PSFX`. `drawEpilogue(t)` : plans `EPI_SHOTS` (matin, gros plan de la cloche, vallée du Chapitre I, sous les vagues, forêt + titre) ; cartons `ECAPF`, titre `EPI_TITLE` (inchangés) ; sons `EFXL` ; tours de la vallée `VTOW`, tour qui s'éteint `TOWER_OUT` à `EPI_DARK`, fissures `VCRACKS`.
- Décors partagés : `lighthouse(x, y, échelle, lueur)` (le Phare de pierre), `village()`, `boat()`, `seaBand()`, `mist()`, `skyGrad()`. Le gros plan de la cloche réutilise `pHead()` avec `bellMarks()`.
- Retirés : `PSTARS`, `proMarsh`, `hangBell` (étoiles, marais, cloche suspendue de l'ancienne version). `proHero()` est gardé (dessin du Veilleur des cinématiques, inchangé).

## Retouches du 28 octobre (`ch2/retouches`)
- **Intro** : `PRO_T` (durées des cartons comme au Chapitre I, fondus), `PRO_SHOTS` calculé (débuts des plans A à E), `PRO_TITLE`, `PRO_LEN` ; textes dans `PCAP_TXT`, temps des cartons dans `PCAPF`. **Outro** : 4 plans + titre, `SPIRE` (Flèche de la forêt).
- **Fonds fixes des cartons de fin** : `S.still` (id interne de la phase, posé par `clearedCard`, remis à 0 par `resetPhaseState`) ; `drawStill(id)` est dessiné à la place de la scène tant que la carte est ouverte.
- **Trappe** : `HATCH` (position, marche, `toll` = intervalle du tintement), `hatchTop()`, `drawHatch(k)` (dessinée avec la salle, donc reflétée), `S.hatchSnap` (chaîne rompue), `hatchRing()` (ondes du tintement, `S.hatchRing`), son `bellMuffled`. Vue d'en dessous dans `bg1`. Descente de caméra : `S.camDY` (entrée de la phase II).
- **Fin de phase II** : `hullSky(k)` (trou dans le pont, ciel, `MOON`), `hullDebris()` (`DEBRIS`), `moonCone()`, `kingKneel()`, `moonOnKing()` ; temps dans `CINE_P2` ; fond fixe `kingEndStill()`.
- **Restes de Veilleur** sur le Roi : cape et anneau dans `drawBoss1`, cage `deadLantern()`. Phase III : `WRECKS`/`wreck()`, membrures, bâton sans lanterne, lune, dans `bg3`.
- **Rages** : `DIFFS[..].u` (seuils), `RAGE` (cri, dernier assaut), `rageMarks()` (cases soulignées de la jauge, classe `mark`), `S.rageN` / `S.rageNext` / `S.roarT` ; `spawn()` lance le cri puis le sort de rage (`gen(stage, f, b, false, rage)` : `rage` = numéro de la rage). `angerCheck()` est remplacé (le nom va au lecteur d'écran par `rageBanner()`).
- **Pluie de bris** : `RAIN` (espacement aléatoire, marge et étourdissement du Difficile, valeurs du Chapitre I) ; `stops(th)` reçoit la menace pour la marge.
- **Orbes illusoires** : pleines, contour en pointillé (`drawOrbs`).

## Deuxième passe de retouches (28 octobre, `ch2/retouches`)
- Onomatopées : `ONO` = `block` (`CLANG`), `final` (`KRAKOOM`), `crush` (`KRAAAK`) ; plus de `hit`.
- Lueur du miroir : `MIRROR_GLOW`, `mirrorLight()` (dans `drawVoice`, visage de la vraie Voix seulement).
- Bâton sans lanterne : `STAFF` (dans `bg3`). Plus de `bossBar` (transformation de la phase III).
- Choc de la riposte : `SHOCK` (valeurs du Chapitre I), `S.hitstop` (dans `update`, le temps du jeu `gt` recule d'autant : arrêt sur image), `S.flashHit`, `S.recoil`, `S.rings`, `S.bossHurtT` ; son `sfx.thud`. Le corps du boss est décalé et incliné dans `draw()` (fonction `body`).
- `retryPhase()` repart toujours de la forme I.
