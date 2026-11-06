# Audit d'optimisation (lecture seule)

Session doc seule : aucun code touché, aucun build, aucun test, aucun profilage. Sources : `git ls-files`, `grep`, `wc`, courts extraits.
**Mesuré** = compté sur le dépôt (tailles, occurrences). **Estimé** = déduit de la lecture ; aucun chiffre de FPS n'a été relevé. Les lignes sont approximatives.
Cible : téléphone d'entrée de gamme (canvas 2D). Tout gain « fort » ci-dessous est donc à confirmer sur téléphone.

## Axe 1 · Performance à l'exécution

| Chemin | Constat | Gain | Risque | Action proposée |
|---|---|---|---|---|
| `chapters/ch2-silent-bells/src/js/92-events.js:3` | `fitMain` : `d=Math.min(devicePixelRatio,2)`, sans plafond tactile. Le Ch. I plafonne à 1,25 sur tactile (`ch1/00-core.js:55`). Un téléphone à dpr 3 donne un canvas Ch. II à 2× en côté, soit 1,6× plus de pixels que le Ch. I (2/1,25) ; sur écran dpr 2 : idem. *Estimé* | fort (téléphone) | moyen | Reprendre `COARSE?1.25:2` (mesure `pointer:coarse` déjà utilisée par le Ch. I et `24-cine.js:36`). Change le rendu net sur tactile : à valider à l'œil |
| `ch2/src/js/` (tout le rendu) vs `ch1/00-core.js:58-69` | Le Ch. I a une qualité adaptative (`SBQ`, `perfWatch`) qui divise puis coupe `shadowBlur` ; le Ch. II n'a rien d'équivalent (`grep perfWatch\|SBQ` : 0 résultat dans ch2). *Mesuré* : seulement 3 `shadowBlur` dans ch2 (`56-form2-render.js:202`, `76-epilogue.js:62`) | faible | faible | Rien à faire pour les lueurs. Le vrai coût du Ch. II est ailleurs (lignes suivantes) |
| `ch2/src/js/24-backgrounds.js` | 20 `createLinearGradient/RadialGradient` dans le fichier, tous dans les fonctions de fond appelées à chaque `draw()`. Aucun cache de fond (`grep cache\|offscreen\|OFF` : 0). Le Ch. I, lui, pré-rend `bgFar`, `bgBridge`, `vig` (`ch1/20-p1-bridge-decor.js:2-32`). Fréquence : 60 Hz × plusieurs dégradés. *Mesuré (comptage) / estimé (coût)* | fort | moyen | Pré-rendre les fonds statiques (ciel, mer, dégradés de sol) dans des canvas hors écran, comme au Ch. I. Garder en direct ce qui bouge |
| `ch2/src/js/24-backgrounds.js:180` | Boucle `3×6` : **18** `createRadialGradient` par frame pour les nuages, alors que `x` ne dépend que de `rt`. Extrait : `for(let b=0;b<3;b++)for(let i=0;i<6;i++){…const cg=ctx.createRadialGradient(x,y,10,x,y,170);` | moyen | faible | Un seul sprite de nuage par `b` (3 canvas), puis `drawImage` à `x,y`. Ou un dégradé translaté (`translate` + dégradé constant) |
| `ch2/src/js/16-update.js:33` | `S.parts=S.parts.filter(…)` : nouveau tableau à chaque frame (60 Hz), même quand rien ne change | faible | faible | Compactage en place (`for` + indice d'écriture), comme `splice` à rebours du Ch. I (`ch1/16-p1-bridge-logic.js:337`) |
| `ch2/src/js/44-counters-help-frame.js:99` ↔ `64-prologue.js:93` | `lerpC` construit une chaîne `rgb(${a.map(…).join(',')})` **par particule et par frame** quand `p.c2` existe (un `map`, un tableau, une chaîne). *Mesuré : extrait ci-contre* | moyen | faible | Boucle numérique sans `map`/`join`, ou précalcul de la couleur par paliers de `k` (ex. 8 paliers) |
| `ch2/src/js/96-loop.js:7` | `['play','ko',…].includes(S.mode)` : tableau littéral recréé à chaque frame | faible | faible | Sortir en constante (`Set` ou tableau au niveau du module) |
| `ch1/src/js/84-loop.js:7-10` | La boucle appelle `render()`/`renderR()`/`renderQ()` **même quand le menu est ouvert** (aucun test sur `menuEl.hidden` pour le rendu ; seule la mise à jour est suspendue par `paused`). Le Ch. II, lui, fait `if(!$('menu').hidden)return` avant `draw()` (`96-loop.js:8`). *Mesuré (lecture)* | moyen | moyen | Ne pas redessiner tant que le menu ou la pause couvre la scène, en gardant un dernier rendu à l'écran. Vérifier que le menu n'est pas translucide sur la scène (dans ce cas l'image figée suffit) |
| `ch1/src/js/56-p3-belfry-render.js:511` | `main.filter='grayscale(k) brightness(…)'` + `drawImage(OFF)` pleine surface pour la pétrification. Fonctionne pendant la séquence seulement. *Estimé* : le filtre CSS sur canvas est lent sur mobile (CPU) | moyen | moyen | Limiter à la durée de la séquence (déjà le cas ?) ; sinon remplacer par un voile `globalCompositeOperation='saturation'` ou `luminosity`. À vérifier sur téléphone |
| `ch1/src/js/56-p3-belfry-render.js` (21 `shadowBlur`), `32-p1-bridge-render.js` (11), `28-boss-body.js` (7), `76-cine-intro.js` (6), `40-p2-foundry-render.js` (6) ; total 69 dans le dépôt, 16 `save()` dans le seul fichier Belfry | Déjà amorti par `SBQ=0.5` sur tactile et `perfWatch`. Les 69 occurrences sont *mesurées* ; le coût réel de chacune est *estimé* | faible | faible | Rien. Le garde-fou existe. À ne pas retoucher sans mesure |
| `ch2/src/js/32-boss-rust-king.js:57`, `36-boss-hollow-voice.js:34`, `40-boss-drowned-beacon.js:184` | `ctx.filter='brightness(…)'` sur le boss entier pendant le flash de touche (`gt-S.bossFlash<.15`, soit ~9 frames par coup). Protégé par `hasFilter` | moyen | moyen | Remplacer par un calque `lighter` en blanc translucide sur la silhouette. À vérifier sur téléphone ; certains Android n'accélèrent pas `filter` |
| `ch1/src/js/64-audio-music.js:206` | `setInterval(musTick,90)` jamais arrêté ni suspendu (aucun `clearInterval` ; ~11 appels/s même onglet masqué ou son coupé). *Mesuré* | faible | faible | Sortie rapide si `!LB.audio.ctx` / son coupé / `document.hidden` en tête de `musTick` (à vérifier : il commence par `musKind()`) |
| `ch2/src/js/60-music.js:162-168` | `setInterval` à 100 ms (musique) et 200 ms (lit sonore) ; `clearInterval` présents dans `bedStop`, `stop`, `fadeStop`. Pas de fuite constatée. *Mesuré* | — | — | Rien |
| `ch1/src/js/12-effects.js:2-3`, `ch2/src/js/08-effects.js:5-6` | `burst`/`dust`/`evaporate` poussent des objets sans plafond (n fixé par appel, 18 pour `dust`). Aucun `if(sparks.length>N)`. *Mesuré* : `grep length>` : 0. Pic réel *non mesuré* | moyen | faible | Plafond global (ex. 300 particules vivantes), ou réduction de `n` si le plafond est atteint. Table de réglage (règle 9) |
| `shared/js/12-audio.js:34-47` | Chaque `tone`/`noise` crée oscillateur + gain (+ biquad) ; arrêt par `stop` programmé, nœuds ramassés après la fin. Le tampon de bruit est mis en cache (`nb`). OK. Mais `ch1/64-audio-music.js:33` et `ch2/60-music.js:9` refont chacun **leur** tampon de bruit (1 s et 2 s) | faible | faible | Réutiliser `nb` de `LB.audio` (voir axe 2) |
| `ch2/src/js/60-music.js:7` | Réverbération : `3,8 s × sampleRate × 2 canaux`, remplie par `Math.random` à l'initialisation (≈ 340 000 échantillons à 44,1 kHz, une fois). *Estimé* ; coût de départ unique, plus l'convolution continue | faible | moyen | Réduire à ~2 s ou `ConvolverNode` mono si le CPU audio pose problème. À vérifier sur téléphone (craquements) |
| Écouteurs | 67 `addEventListener` dans `shared/`, `ch*/`, `site/src` ; 0 `removeEventListener`. Tous posés une fois au chargement (clavier, `resize`, `visibilitychange`) : pas de fuite dynamique constatée | — | — | Rien. Surveiller pour le C3 si des écrans montent/démontent des écouteurs |
| `shared/js/20-watcher.js:38-65` | Les poses du Veilleur (`staffIdle()`, `staffUp(k)`, `Object.assign(…)`) renvoient de nouveaux objets/tableaux à chaque appel, donc à chaque frame de dessin. *Estimé* : quelques objets par frame ; petit | faible | moyen | Ne pas toucher : le Veilleur est partagé et son tracé doit rester identique |
| `site/src/js/10-hub.js:181-182` | `requestAnimationFrame` pendant le maintien du bouton seulement, arrêté (`stop`) à la fin. OK | — | — | Rien |

## Axe 2 · Doublons à mutualiser dans `shared/`

Base : `docs/AUDIT-NETTOYAGE.md` §2 (déjà fait, non répété). Ajouts mesurés ici.

| Chemin | Constat | Effort | Risque | Action proposée |
|---|---|---|---|---|
| `ch1/00-core.js` ↔ `ch2/02-core.js` : `$`, `_`, `DIFFS`, `TRIAL_OPEN`, `endSeen`, `applyLang` | Identiques en tête (audit §2). `CHAPTER` diverge (`{n:1,id:'ch1',…}` / `{n:2,id:'ch2',…}`) mais ses champs de structure sont communs | faible | faible | Lot (c) : `LB.core` (`$`, `_`, `endSeen`, `trialOpen`) ; `CHAPTER` reste local |
| `ch1/04-audio-sfx.js` ↔ `ch2/04-audio-sfx.js` : `ensureAudio`, `tone` | Fines enveloppes de `LB.audio` | faible | faible | Lot (c) : exposer `LB.audio.tone/ensure` tels quels ; supprimer les enveloppes |
| `ch1/64-audio-music.js:33` ↔ `ch2/60-music.js:9` ↔ `shared/12-audio.js:45` | **3** tampons de bruit blanc (1 s, 2 s, 1 s) | faible | faible | `LB.audio.noiseBuf()` ; économise de la mémoire (~0,35 Mo de Float32 par tampon à 44,1 kHz) |
| `ch1/64-audio-music.js:11-34` ↔ `ch2/60-music.js:19-23` | Enveloppes d'oscillateur/bruit (`osc`, `nz`, `lfo`) écrites deux fois avec des signatures différentes | moyen | moyen | Ne pas fusionner : timbres propres à chaque chapitre. Seulement extraire `env(g,t,a,p,d)` (attaque/palier/relâche) s'il y a une vraie ressemblance |
| `ch1/60-ui-menu.js` ↔ `ch2/72-flow.js` : `showMenu` (identique), `hideMenu`, `setPause`, `retryPhase`, `deathCard` | `showMenu` identique ; autres divergents | moyen | moyen | `showMenu` seulement (lot c). Le reste dépend du rythme propre au chapitre |
| `ch1/12-effects.js` ↔ `ch2/08-effects.js` : `burst`, `ONO` | Noms identiques, corps différents (coordonnées/formats de particule) | moyen | moyen | Si un plafond est ajouté (axe 1), le faire dans un helper partagé `LB.fx.cap(arr,N)` plutôt que de fusionner `burst` |
| `site/src/js/10-hub.js` ↔ `shared/28-ui.js` : panneau de réglages | `SETTINGS_T` et `hset…` dupliqués (demande du 2 novembre déjà ouverte) | moyen | moyen | Voir `DEMANDES.md` ; rien à ajouter |
| `ch1/src/js/00-core.js:54` (`COARSE`) ↔ `shared/24-cine.js:36` (`coarse`) ↔ à créer en ch2 | La détection `pointer:coarse` est écrite 2 fois, et manque au Ch. II | faible | faible | `LB.coarse` dans `00-lb.js` (1 ligne), utilisé par les trois |

## Axe 3 · Poids des builds

*Mesuré* par `wc -c` et un comptage Python des blocs `<style>`/`<script>` (sans exécuter aucun build).

| Chemin | Constat | Gain | Risque | Action proposée |
|---|---|---|---|---|
| `chapters/ch1-ember-bridge/dist/index.html` | 473 869 o (202 402 o en gzip). Style 106 421, script 361 069 dont 52 145 o de commentaires `/* */` | moyen | moyen | Voir ligne « commentaires » |
| `chapters/ch2-silent-bells/dist/index.html` | 478 181 o. Style 106 285, script 363 440 dont 65 612 o de commentaires `/* */` + 10 679 o de lignes `//` | moyen | moyen | idem |
| `site/index.html` (hub) | 238 570 o. Style 110 731, script 124 550 dont 35 241 o de commentaires | moyen | moyen | idem |
| `site/ch1/index.html`, `site/ch2/index.html` | Même taille que les deux `dist/` (473 869 et 478 181 o) : copies, soit 952 050 o | faible | élevé | Déjà évalué par `AUDIT-NETTOYAGE.md` : hors périmètre (touche `build_site.py`, `android.yml`, tests) |
| `build/fonts.css` → 3 builds | **96 508 o** de polices `base64` (2 `@font-face`) répétés dans chaque build : 289 524 o au total, ≈ 20 % de chaque chapitre. *Mesuré* | fort (poids) | moyen | Option A : sous-ensemble des glyphes réellement utilisés (latin + accents FR), à regénérer hors dépôt. Option B : `woff2` s'il est encore en `woff`/`ttf` (non vérifié ici). Change `fonts.css` donc les 3 builds |
| `dist/*.html` | Commentaires de code conservés tels quels (≈ 11 % du JS du Ch. I, 18 % du Ch. II avec `//`, 28 % du hub). Aucun `console.log/warn/error`, aucun `debugger`, `TODO`, `FIXME` : *mesuré, 0* | moyen | moyen | Retirer les commentaires `/* */` à l'assemblage (`assemble.py`) ou en sortie. Attention : un `/*` dans une chaîne ou une regex casserait le jeu ; il faut un vrai découpeur, pas une regex. Gain estimé : ≈ 50 Ko de plus par chapitre avant gzip, ≈ 15 Ko après |
| `apk/assets/icon-only.png` 473 525 o, `icon-background.png` 374 247, `icon-foreground.png` 150 083 | Gros PNG, seuls assets non texte du dépôt avec `shared/svg/watcher-menu.svg` (493 o). Ils servent à l'APK, pas aux pages | faible | faible | Passer par un optimiseur PNG sans perte. N'affecte pas le jeu web |
| `chapters/ch2-silent-bells/legacy/silent-bells.source.html` | 2 110 lignes figées, importées « telles quelles » (`build_ch2.py`). Non livré | — | — | Rien (hors build) |

## Axe 4 · Préparation du Chapitre III

*Mesuré* : `build/build.py` (30 l.), `build/build_ch2.py` (45 l.), `build/assemble.py` (142 l.).

| Chemin | Constat | Gain | Risque | Action proposée |
|---|---|---|---|---|
| `build.py` ↔ `build_ch2.py` (avant S3) | Deux scripts de 30 et 45 lignes presque jumeaux (`diff` après normalisation `ch1/ch2` : 73 lignes), avec `cut(...)` à occurrence unique qui coupe des morceaux propres à la source Ch. II (meta, polices Google). Un C3 devrait copier l'un des deux | moyen | moyen | Un `build/build_chapter.py <id>` paramétré par `chapters/<id>/chapter.json` (titre, `dist`, zip). (Fait en S3 ; alias retirés en S3b) |
| `build/assemble.py` (constantes `CH1`, `CH2`) | Les chapitres sont des constantes en dur dans `assemble.py`. Ajouter un C3 = éditer ce fichier | faible | faible | Découvrir les chapitres par `chapters/*/src/parts.txt` |
| `chapters/*/src/js/00-core.js` / `02-core.js` | Chaque chapitre redéfinit `$`, `_`, `DIFFS`, `endSeen`, `applyLang`, `CHAPTER`, la détection tactile (axe 2). Un C3 les recopierait | moyen | faible | Mutualiser (lot c, axe 2) ; le C3 n'écrit alors que `CHAPTER` et ses tables |
| Boucle de jeu : `ch1/84-loop.js`, `ch2/96-loop.js` | Deux boucles `requestAnimationFrame` avec le même contrat (`dt` plafonné à 0,05, pause, menu). Pas de boucle commune ; seule `LB.cine` (`shared/24-cine.js`) en a une propre | moyen | moyen | `LB.loop.start({update,draw,paused,menuOpen})` avec plafond `dt` et mesure de cadence ; le Ch. I et le Ch. II l'adopteraient plus tard. À faire pour le C3 seul, sans réécrire I et II |
| Qualité adaptative | Uniquement au Ch. I (`SBQ`, `perfWatch` dans `00-core.js`), liée à `shadowBlur` global par surcharge de `ctx` | fort (C3) | moyen | Sortir `perfWatch` et la surcharge dans `shared/` (`LB.quality`) pour que le C3 l'ait d'office |
| Fond mis en cache | Le Ch. I a ses canvas `bgFar`/`bgBridge`/`vig` ; le Ch. II recalcule tout | moyen | faible | Helper `LB.cacheLayer(w,h,draw)` (dpr compris) à utiliser dans le C3 |
| Test de fumée | `tests/ch2-smoke.js` coche `d.sp` pour `RHY` (règle de CLAUDE.md) ; les tests par chapitre sont copiés (`tests/ch2-*.js`) | faible | faible | Un `tests/chapter-smoke.js <id>` à paramètres, après stabilisation de la structure |

## Classement en lots

**(a) Sûr et mécanique** — aucun changement de rendu attendu.
- `96-loop.js` : constante au lieu du tableau `includes` ; `16-update.js:33` : filtre en place ; `lerpC` sans `map/join` ; plafond de particules (valeur dans une table).
- `musTick` : sortie rapide quand le son est coupé ou la page masquée.
- Compression des PNG de l'APK.
- Tests : `smoke` du chapitre touché + test ciblé (règle 10). Si seul du Ch. II : `build_chapter.py <id>` puis `build_site.py`, puis commit des fichiers générés (règle 18). Aucun test lourd par défaut.

**(b) Logique d'un chapitre**
- Ch. II : plafond de dpr tactile, cache des fonds, nuages en sprites, flash de boss sans `ctx.filter`.
- Ch. I : ne plus redessiner sous le menu, `filter` de pétrification.
- Tests : `smoke` + test ciblé du chapitre. Le Ch. II demande la CI manuelle `ch2-bot` / `visual-shots` seulement pour juger le rendu (règle 19, lancement manuel). **À vérifier sur téléphone** : dpr, cache de fonds, `filter`, `shadowBlur`.

**(c) `shared/`**
- `LB.coarse`, `LB.audio.noiseBuf`, `LB.quality` (qualité adaptative), `LB.cacheLayer`, enveloppes `tone/ensure` ; retrait des polices doublées dans `fonts.css` (sous-ensemble) ; retrait des commentaires à l'assemblage ; `build_chapter.py` paramétré.
- Tests : les deux chapitres + `keys` + `audio` (règle 10). Avant tout tag ou itch.io : CI « Tests » manuelle sur `main`. **À vérifier sur téléphone** : tout ce qui change la cadence ou le son.

## Décisions à valider
1. Plafonner le dpr du Ch. II sur tactile (lot b) : net moins fin, mais ~1,6× moins de pixels (estimé).
2. Retirer les commentaires des builds ou garder des builds lisibles ? (touche la sortie des 3 builds.)
3. Faire de `LB.quality` un module de `shared/` avant le C3 (lot c).

*Rien n'a été mesuré en FPS : tout gain de cette liste est à confirmer sur téléphone.*

## S1 faite · Chapitre II, rendu et mise à jour (axe 1)
**Fait** (`chapters/ch2-silent-bells/src/js/`, builds régénérés, `ch2-smoke` : `errs []`)
- dpr (`92-events.js`) : plafond tactile 1,25 (même détection `pointer:coarse` que le Ch. I), 2 sur ordinateur.
- Fonds (`24-backgrounds.js`) : couches statiques pré-rendues hors écran (`bgLayer`), recréées seulement quand l'échelle change (redimensionnement). Phase I (salle) : ciel, pierres, fonds des arches, contours, sol. Phase II (cale) : ciel, planches, membrures, poutres, sol. Phase III (récifs) : ciel, lune, mer, rochers, sol. L'ordre de peinture est conservé ; les éléments animés restent dessinés par-dessus. 18 dégradés radiaux des nuages : 3 sprites (un par bande) + `drawImage`. Gain annexe : dégradé des éclats de miroir, de la cloche rouillée et du bronze du bâton mis en cache.
- Repli : si l'image est zoomée (cinématiques de la phase III), les couches ne servent pas, le dessin direct d'avant s'exécute (identique à l'ancien).
- Particules : compactage en place (`16-update.js`) ; `lerpC` sans tableau ni chaîne par appel (table `Map` indexée par les trois valeurs arrondies, sortie strictement identique) ; plafond `PARTS_MAX=1500` (`08-effects.js`, helper `addPart`).
- Plafond 1500 : le pire cas réel est de l'ordre de 300-400 (deux grosses salves de 70 + 40 plus poussières, vie ≤ 3,8 s). 1500 ne sert qu'à éviter un empilement. Les tirages aléatoires sont faits avant le test : la suite ne change pas.

**Laissé, et pourquoi**
- Portholes, éclat de lumière de la trappe, brume des arches, lueurs : dégradés dont les couleurs ou positions changent à chaque frame ; les mettre en cache changerait le rendu.
- `includes` de `96-loop.js` : hors consigne de cette session.
- Pendant un tremblement, les couches sont lues avec un décalage fractionnaire : léger lissage du fond (invisible sur ce fond sombre), à confirmer à l'œil.
- `shared/` : rien touché.

## S2 faite · Chapitre I, rendu, boucle et audio (axe 1)
**Fait** (`chapters/ch1-ember-bridge/src/js/`, builds régénérés, `smoke` ch1 : `errs []`)
- Menu ouvert (`84-loop.js`) : le menu est un voile translucide (.74) mais la scène dessous est en pause (`paused`) et son rendu ne dépend que de l'état, pas de l'horloge : elle est donc figée, sauf le tremblement aléatoire. On dessine une seule image à l'ouverture, puis plus rien tant que le menu reste ouvert (au démarrage, la scène s'affiche une fois derrière le voile).
- `musTick` (`64-audio-music.js`) : sortie rapide quand il n'y a pas de contexte audio, ou quand la page est masquée / le son coupé **et** que la musique est déjà au silence. La bascule vers le silence (fondu des bus, `MUS.cur=null`) passe une fois par le chemin normal, donc au retour `MUS.t`, `MUS.s` repartent de zéro comme avant.
- Particules (`12-effects.js`, `36-p2-foundry-logic.js`) : table `FX.sparksMax=1500` et helper `addSpark` pour `burst`, `dust` et `qBurst`. Les tirages sont faits avant le test, la suite aléatoire ne change pas. Valeur choisie par cohérence avec le Ch. II (`PARTS_MAX=1500`) : les plus grosses salves font ~50-70 étincelles de vie ≤ 1,1 s, très loin du plafond. `evaporate` n'existe pas au Ch. I (Ch. II seulement).

**Laissé, et pourquoi**
- Pétrification (`56-p3-belfry-render.js:511`) : la ligne Ch. I de l'audit propose un voile `saturation`/`luminosity`, pas un calque `lighter` (celui-là vise les flashs de boss du Ch. II). Le gris + assombrissement (`grayscale`, `brightness .6`) ne se reproduit pas fidèlement par un voile blanc translucide. Laissé tel quel (le filtre ne tourne que pendant la séquence de finale).
- Autres sparks poussés directement (`08-state`, `16`, `44`, `48`, `56`) : hors fonctions d'effet, laissés.
- Pause simple (`pauseEl`) : non figée, hors consigne.
- `shared/` et Ch. II : rien touché.

## S3 faite · Chaîne de build (axes 3 et 4, lot c)
**Fait** (`build/`, `chapters/*/chapter.json`, builds régénérés ; aucun changement de jeu, `chapters/*/src` et `shared/` non touchés)
- Commentaires retirés des sorties (`build/strip.py`, appelé par `build_chapter.py` et `build_site.py`) : balayage à états, pas une regex. JS : lignes entières `//` et blocs `/* */` hors chaînes, regex et gabarits ; **les `//` en fin de ligne sont laissés**. CSS : blocs `/* */` hors chaînes. HTML : `<!-- -->` hors script/style. Aucun test ne lit de commentaire dans les builds (greps sur `tests/` : marqueurs et regex portent sur du code).
- Preuve : suite de jetons de chaque `<script>` comparée avant/après avec l'analyseur TypeScript (hors dépôt) : identique pour Ch. I (127 508 jetons), Ch. II (123 706) et hub (80 + 29 791), 0 erreur d'analyse. Reconstruire donne les mêmes octets (empreinte du site stable).
- `build/build_chapter.py <id>` paramétré par `chapters/<id>/chapter.json` (`id`, `title`, `dist`, `zip`) ; `build.py` et `build_ch2.py` en étaient les alias (supprimés en S3b). Les deux zips itch.io ont désormais une date fixe (celui du Ch. I n'en avait pas).
- `assemble.py` : `CH1`/`CH2` supprimés ; `chapters()` découvre `chapters/*/src/parts.txt` ; `source()` sans argument = premier chapitre (ordre et sorties inchangés). Un Chapitre III = un dossier avec `src/parts.txt` et `chapter.json`, plus une ligne dans `CHAPTERS` de `build_site.py`.

| Build | Avant (o) | Après (o) | gzip avant → après |
|---|---|---|---|
| Ch. I `dist` (= `site/ch1`) | 474 666 | 419 251 (−11,7 %) | 202 513 → 178 519 |
| Ch. II `dist` (= `site/ch2`) | 482 272 | 402 261 (−16,6 %) | 210 197 → 177 015 |
| Hub `site/index.html` | 238 570 | 199 777 (−16,3 %) | 124 000 → 108 140 |

**Laissé, et pourquoi**
- Polices (`build/fonts.css`) : 2 `@font-face` seulement (Big Shoulders Display 700-800, DM Sans 400-700, polices variables), aucun doublon ni graisse inutilisée prouvés. Pas de sous-ensemble (outil externe interdit ici) : rien changé. Le gain possible reste le sous-ensemble latin + accents FR, à faire hors dépôt.
- Commentaires `//` en fin de ligne : conservés (non prouvables sans analyseur complet dans le build).
- `site/ch1`, `site/ch2` : toujours des copies (hors périmètre).
- Tests lancés : `smoke` ch1 (`errs []`), `ch2-smoke` (`errs []`), `fonts-offline` (polices chargées).

## S4 faite · Mutualisation dans `shared/` (axe 2, lot c)
**Fait** (`shared/`, les deux chapitres, builds régénérés ; aucun changement de jeu attendu). Tests : `smoke` ch1, `ch2-smoke`, `keys`, `audio` : `errs []` chacun, une fois.
- `LB.coarse` (`shared/js/00-lb.js`) : une seule détection `pointer:coarse`, lue au chargement. Utilisée par `fitMain` du Ch. II (1,25 / 2), par `24-cine.js` (formule inchangée) et par `LB.dpr` (= `min(coarse?1.25:2, devicePixelRatio)`, le `dpr` du Ch. I). Le Ch. I n'a plus de `COARSE` local.
- `LB.audio.noiseBuf(durée)` : tampon de bruit blanc mono en cache par durée, vidé si le contexte est recréé. `noise()` de `shared` (1 s), `mNoise` du Ch. I (1 s) et `nbuf` du Ch. II (2 s) l'utilisent : les durées sont inchangées, trois tampons privés en moins (le 1 s est maintenant partagé entre `noise()` et la musique du Ch. I).
- `LB.cacheLayer(w, h, draw, {k, y0, round})` : canvas hors écran avec `dpr`. `bgFar`, `bgBridge`, `vig` (Ch. I) et `bgLayer`/`cloudSprite` (Ch. II) l'utilisent. Mêmes tailles de canvas qu'avant : `round:Math.floor` au Ch. I (taille tronquée comme `c.width=W*dpr`), `Math.ceil` au Ch. II ; `y0` garde les calques en bande du Ch. II.
- `LB.quality` (`shared/js/14-quality.js`, table `LB.QUALITY_T`) : surcharge de `shadowBlur`/`shadowColor` (`attach(ctx)`) et `perfWatch` (`watch(ms, paused)`), mêmes seuils (2 s, moyenne 23 ms, saccade 34 ms ×5, départ 0,5 sur tactile, 0,25 puis 0). Rien n'est installé tant qu'on n'appelle pas `attach` : le Ch. I seul l'appelle ; le Ch. II et le hub ne l'adoptent pas ; prêt pour le Chapitre III. `perfWatch` reste un alias local du Ch. I (`84-loop.js` inchangé).
- Noyau : `$` (`LB.$`) et `endSeen` (`LB.endSeen`) étaient strictement identiques : mutualisés. `ensureAudio` (Ch. I) et `ensureAudio`/`tone`/`noise` (Ch. II) n'étaient que des enveloppes de `LB.audio` : remplacés par des alias directs.

**Laissé, et pourquoi**
- `_` : déjà `const _=LB._` dans les deux chapitres, rien à gagner.
- `DIFFS`, `CHAPTER`, `TRIAL_OPEN` : tables et réglages propres à chaque chapitre (les valeurs et la forme diffèrent). `trialOpen` : une fonction au Ch. I, une ligne de `CHAPTER` au Ch. II, pas identiques. `applyLang` : le corps est propre à chaque chapitre.
- `tone`/`noise` du Ch. I : enveloppes propres (`E_TONE`, attaque de `noise`), laissés pour ne pas changer les sons.
- `cine` : garde `min(2, coarse?1.25:dpr)` (donne 1,25 même à dpr 1) ≠ `LB.dpr` ; non mutualisé pour rester identique.
- Fonds du Ch. II : les calques en bande gardent leur taille de bande grâce à `y0` ; les dégradés mis en cache en S1 (éclats de miroir, cloche, bronze) sont des objets de dégradé, pas des canvas : laissés.
- `LB.coarse`/`LB.dpr` sont lus au chargement de la page (le cine les lisait au premier montage) : sans effet hors émulation d'appareil changée en cours de page.

## S3b faite · Alias de build supprimés (axe 3, lot c)
**Fait** (CI / outillage ; aucun changement de jeu, `src/` et `shared/` non touchés, sorties de build inchangées)
- `build/build.py` et `build/build_ch2.py` supprimés : tous les appels passent par `python3 build/build_chapter.py <id>` (`ch1-ember-bridge`, `ch2-silent-bells`) dans `tests.yml`, `android.yml`, `CLAUDE.md` (règles 11 et 18), `NOTES.md`, `README.md`, `shared/NOTES.md`, `site/NOTES.md` et les `NOTES.md` des chapitres. `build_site.py` inchangé.
- `tests.yml` : le contrôle « les builds sont à jour » (smoke) boucle sur `chapters/*/chapter.json` (build, `git diff --exit-code` sur `chapters/<id>/dist/`, arbre propre) ; le job `tests` reconstruit aussi en boucle. Un nouveau chapitre est donc contrôlé sans toucher au workflow. Jobs de test par chapitre, `timeout-minutes`, déclencheurs, `paths-ignore` et tests lourds manuels inchangés.
- `android.yml` : seuls les deux appels de build changent (tag `v*` ou lancement manuel).
- Les mentions de `build.py` / `build_ch2.py` qui restent dans ce fichier sont historiques (état avant S3).
