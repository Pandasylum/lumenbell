# Chapitre II · Silent Bells (notes du dossier)

- **État** : import du 25 octobre (`legacy/silent-bells.source.html`, tag `ch2-import`), puis écarts techniques traités le 27 octobre (branche `ch2/tech`) : `_(en, fr)`, clés `lb-…`, `<head>` propre, lien vers l'artefact du Chapitre I retiré, contrôle réseau. Puis étape B « gameplay et textes » (branche `ch2/texts`) : mots d'annonce retirés, difficultés du Chapitre I, phase III sans contre-attaque à frapper, textes du cahier des charges. **Décors, personnages et scènes inchangés** (étape C) : l'intro et l'outro gardent leurs anciennes scènes comme remplaçants provisoires sous les nouveaux cartons.
- **Cahier des charges** : `docs/CH2-SPEC.md` (décisions de Kevin du 27 octobre 2026). Lore : `docs/LORE.md`.
- **Étapes** : 1) import propre ✔ ; 2) écarts techniques (étape A) ✔ ; 3) gameplay et textes (étape B) ✔ ; 4) visuels : décors, personnages, scènes d'intro et d'outro (étape C) ; 5) moteur et héros communs, menu commun.
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
- **Difficultés** (`DIFFS`, `WIN`) : Veilleur 6 / 4 / 3 PV, Épreuve 4 PV pour tout le parcours (Normal et Difficile), PV conservés, une chute renvoie à la phase I. Fenêtres : `WIN` (0,2 s de fenêtre, 0,08 s de parfait) × `m` (2 / 1 / 0,6). PV des boss inchangés (6 / 8 / 10, à régler après essais). `sp` (vitesse des attaques) inchangé.
- **Riposte** (`closePat`, table `R_CNT`) : dans les trois phases, une série sans faute déclenche la riposte automatique (2 dégâts si toutes les parades sont parfaites et la série compte au moins deux attaques à toucher). Phase III : foudre renvoyée vers la lanterne (forme I) ou la méduse (forme II). La contre-attaque « quand la lanterne faiblit, touche pour frapper » (menace `strike`) et la fenêtre de l'orbite de la forme II sont **supprimées** ; l'orbite tourne sans s'arrêter. Le barrage (rester appuyé) reste la mécanique de la phase. La contre-attaque à jauge de fatigue n'existait pas dans le code : rien à garder ni à retirer (réservée à un chapitre suivant).
- **Écrit à l'écran** : seulement les titres (cinématiques), les noms de boss, les cartons d'intro et d'outro, et trois onomatopées (`ONO` : `CLANG` parade de la phase II, `BAM` coup porté au boss, `KRAKOOM` coup final). Les rages et derniers assauts ne s'affichent plus : sting + `say()` (lecteur d'écran). Aide visuelle des faisceaux : un demi-cercle (pointillé : se préparer ; plein : tenir) au lieu de « TIENS ! ».
- Les définitions mortes (`P1`, `P2`, `P3`, `spawn`, `fooled`, `anim1`, `drawOrbs` déclarées deux fois, la seconde l'emportait) ont été retirées ; seules restent celles du bas du script.

## Textes (étape B)
- Source : `docs/CH2-SPEC.md`. Cartes : sourcil = titre de phase, titre = nom du boss, texte = panneau d'entrée (`PH[id].desc`) ou de fin (`PH[id].end`), forme II (`PH[3].form2`). Fin de phase III : carte « Phase III terminée » entre la cinématique de fin et l'outro ; victoire : « Chapitre II · Silent Bells » + records.
- Intro (`PCAPF`, `PRO_TITLE`) et outro (`ECAPF`, `EPI_TITLE`) : tables [début, fin, texte] en secondes. Titre de l'intro : « Lumenbell » en petit, « Chapitre II · Silent Bells » en grand. Carton 6 de l'outro : « Chapitre III. À suivre. » teinté `CH_COL[3]`. Les scènes dessinées sont encore celles de l'import (étoiles, marais, village) : à refaire à l'étape C, avec les durées des cartons.
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
- `node tests/ch2-bot.js [parties] [--check]` : bot à un bouton (appui à l'impact avec une erreur de timing gaussienne `sigma`, ignore les reflets, reste appuyé pendant les faisceaux). Mesure la phase III (formes I et II, lancée depuis la frise). `--check` (CI, 20 parties) : au moins 90 % de victoires en Normal à 40 et 70 ms.
- `node tests/ch2-announce.js` : aucun mot d'annonce (liste `BAN`) dans les appels `pop`/`fillText`/`caption`/`title`/`bossBar`, puis en jeu (FR et EN, Normal et Difficile) : parcours complet avec un bon bot (prologue → outro → victoire) et chaque phase avec un bot maladroit (blessures, reflets, garde brisée, défaite) ; tout texte dessiné sur le canvas est relevé et doit être un texte du cahier des charges, « Lumenbell » ou une onomatopée. ~3 min.
- `node tests/ch2-trial.js` : PV et fenêtres par difficulté ; en Épreuve, PV conservés de la phase I à la phase II et une chute renvoie à la phase I avec 4 PV ; en Normal, PV rendus entre les phases.
- `node tests/ch2-keys.js` : migration (anciennes clés seules, nouvelles prioritaires, `eb-lang`, `pn-lang` avant `eb-lang`, aucune clé) et écriture dans les seules clés `lb-…`.
- `node tests/ch2-smoke.js` : sur `dist/index.html`. Syntaxe (`new Function`), puis **réseau** : contrôle statique (aucune URL `http(s)://` ni `//hôte`, aucun `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, `serviceWorker`, `import()`, `window.open`, aucune ressource liée par `href`/`src`) ; en jeu, contexte hors ligne, `context.route` intercepte et refuse toute requête autre que `file:`/`data:`/`blob:`, les API réseau sont espionnées, les WebSocket, workers externes, popups et pages non `file:` sont relevés. Puis `db-unl=3` (ancienne clé, donc migration) posé avant le chargement, Normal puis Difficile (retour au menu entre les deux), prologue passé (Entrée), phase I → II → III via la frise `#phases`, PV max affichés (4 puis 3). Sortie attendue : `errs []`.
- Numéros de phase : interne `S.phase` 2 = Phase I (la Voix Creuse), 1 = Phase II (le Roi de Rouille), 3 = Phase III (le Phare Noyé) ; `ORDER=[2,1,3]`. Le test lit `document.body.dataset.ph` (interne) et `#hdEye` (affiché).
- Lancement local si Playwright ne trouve pas son Chromium : `PW_CHROMIUM=/opt/pw-browsers/chromium node tests/ch2-smoke.js` (voir `NOTES.md` racine).

## Comparaison en image (méthode du 27 octobre)
- 48 captures : menu, menu Épreuve, prologue, carte et trois instants de jeu pour chaque phase, pause ; en FR et EN à 1100 × 760, et en FR à 390 × 844 (téléphone). Plus quatre captures pleine page du menu (390 × 844, 844 × 390, 640 × 360, 1920 × 1080).
- Déterminisme : `requestAnimationFrame`, `performance.now` et `Date.now` remplacés par un pas fixe de 1/60 s avancé par le test (`page.clock` laisse un décalage de 1 à 2 ms entre exécutions), `Math.random` à graine fixe, `AudioContext` coupé, `animations:'disabled'`, souris ramenée en (0, 0) avant chaque capture. Deux exécutions du même fichier : 48/48 identiques au pixel.
- Résultat contre le `dist` de `main` : identique au pixel après chaque étape (inversion, clés, `<head>`) ; après le retrait du lien, seuls les six écrans de menu diffèrent (le lien disparaît, le bloc du menu se recentre verticalement).
- Le script n'est pas dans `tests/` (outil ponctuel) ; le refaire au besoin à partir de cette description.

## Mesures de la phase III sans contre-attaque (27 octobre, `node tests/ch2-bot.js 100`)
Victoires sur 100 parties (formes I et II), temps moyen d'une victoire, coups reçus en moyenne :

| Erreur de timing (σ) | Normal (4 PV, fenêtre 0,2 s) | Difficile (3 PV, fenêtre 0,12 s) |
|---|---|---|
| 40 ms | 100/100, 55,6 s, 0,0 | 99/100, 69,9 s, 0,0 |
| 70 ms | 99/100, 63,6 s, 0,3 | 39/100, 80,5 s, 1,3 |
| 100 ms | 81/100, 69,7 s, 1,4 | 2/100, 84,0 s, 2,0 |

Avant l'étape B (main : 6 / 5 PV, fenêtres 0,2 / 0,155 s, contre-attaque à frapper, que le bot touchait aussi), 30 parties : Normal 30/30 à 40, 70 et 100 ms (45,7 / 50,0 / 57,6 s) ; Difficile 30/30, 30/30, 28/30. La phase reste gagnable ; elle est plus longue (riposte à 1 dégât quand la série ne compte que des faisceaux) et Difficile est nettement plus dur (3 PV, fenêtre ×0,6) : à régler avec les PV des boss après les essais sur téléphone.
