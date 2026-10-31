# Archive de docs/COMMUN.md (audit des éléments communs)

Texte déplacé tel quel depuis `docs/COMMUN.md` le 31 octobre 2026, sans réécriture : en-tête « Fichiers lus » et sous-sections §1.3, 1.4, 1.9, 1.11, 1.12, 1.13 et 1.15 de l'inventaire (faites ou sans session moteur en attente). `docs/COMMUN.md` garde §1.1, 1.2, 1.5 à 1.8, 1.10 et 1.14.

<a id="fichiers-lus"></a>
## Fichiers lus
- Racine : `CLAUDE.md`, `BIBLE.md`, `NOTES.md`, `DECISIONS.md`, `DEMANDES.md`, `ROADMAP.md`, `README.md`, `CHANGELOG.md`.
- Docs : `docs/CH2-SPEC.md` (vocabulaire du 28 octobre, l. 98 ; consignes techniques, l. 134).
- Chapitre I : `chapters/ch1-ember-bridge/NOTES.md`, `src/parts.txt`, `src/page/head.html`, `src/page/body.html`, `src/page/style.css`, `src/js/00-core.js`, `04-audio-sfx.js`, `08-state.js`, `12-effects.js`, `16-p1-bridge-logic.js`, `24-hero-draw.js`, `32-p1-bridge-render.js`, `36-p2-foundry-logic.js`, `40-p2-foundry-render.js`, `44-p3-belfry-logic.js`, `48-p3-belfry-poses.js`, `56-p3-belfry-render.js`, `60-ui-menu.js`, `64-audio-music.js`, `68-texts-ui.js`, `72-boot.js`, `76-cine-intro.js`, `80-cine-outro.js`, `84-loop.js` (lus en entier ou aux sections citées).
- Chapitre II : `chapters/ch2-silent-bells/NOTES.md`, `src/silent-bells.html` (en-tête, CSS, HTML, sections constantes, états, héros, aide, cartes et cinématiques, prologue, flux, épilogue, langue, événements, boucle).
- Build et tests : `build/build_test.py`, `.github/workflows/tests.yml`, en-têtes de tous les `tests/*.js`, `tests/bot.js` en entier.

<a id="s1-3"></a>
### 1.3 Difficultés et PV

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| PV du Veilleur | 6 / 4 / 3 | Clé `php` (ch1:`00-core.js:16-18`) ↔ `hp` (ch2:`307-309`) | **C** : `HERO_DIFF = {easy:{hp:6,m:2,rm:1}, normal:{hp:4,m:1,rm:1}, hard:{hp:3,m:.6,rm:1.2}}` |
| Multiplicateurs | `m` 2 / 1 / 0,6 ; `rm` 1 / 1 / 1,2 | Ch. I : `fm` (souffle) en plus ; appliqués par `applyDiff` (ch1:`60-ui-menu.js:85-94`) ; Ch. II : `PT()` (ch2:`398-401`) | **C** (Veilleur) ; `fm`, `sp`, `t`, `waitMin`… restent au chapitre |
| PV des boss | — | 8 / 10 / 14 (12 en phase III Difficile) ↔ 6 / 8 / 10 | Propre au chapitre (table du chapitre) |
| Épreuve : PV | — | Ch. I : `RUN.max = php` → **4 en Normal, 3 en Difficile** (ch1:`60-ui-menu.js:87`, menu « 3 vies », `body.html:81`) ; **+1 PV entre les phases** (`36-p2-foundry-logic.js:35`, `44-p3-belfry-logic.js:49`, texte `68-texts-ui.js:15`). Ch. II : 4 PV dans les deux, aucun soin (ch2:`310-311`, `2043`). `BIBLE.md:42` : « 4 PV pour tout le parcours, PV conservés » | **T** : la bible donne raison au Ch. II ; le Ch. I diffère sur deux points |
| Épreuve : accès | — | Ch. I : verrouillée tant que la vraie fin n'a pas été vue (`60-ui-menu.js:99`, `84-loop.js:2-10`). Ch. II : toujours ouverte | **T** (lié au déblocage progressif commun) |
| Épreuve : nom | — | « Épreuve du feu » / « Challenge ultime » ↔ « Épreuve » / « Sans soin » (ch1:`body.html:77`, ch2:`254`) | Nom par chapitre dans la table du chapitre ; sous-titre commun |
| Libellés des difficultés | « Normal / Le vrai combat » | « Respire » ↔ « Respirer » ; « Le Colosse déchaîné » ↔ « Sans pitié » (ch1:`68-texts-ui.js:7-9`, ch2:`2042`) | Sous-titres Facile et Normal communs ; Difficile par chapitre (**T**) |
| Abandon en Épreuve | — | Ch. I : « Abandonner ? » avec confirmation (ch1:`60-ui-menu.js:39-47`) ; Ch. II : relance directe (ch2:`2069`, `2079`) | **C1** |
| Records | — | Ch. I : Épreuve seulement, `eb-best-tn/th` ; Ch. II : tout parcours complet, `lb-ch2-best-<mode>` | **C2** (`lb-chN-best-<mode>`) |

<a id="s1-4"></a>
### 1.4 Rages (déclenchement et barre de vie)

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Affichage | Aucun nom à l'écran, nom au lecteur d'écran | Ch. I : `say` (ch1:`44-p3-belfry-logic.js:147`) ; Ch. II : `banner` = `say` + sting (ch2:`1634`) | **C** : `LB.rage(name)` = `say` + sting |
| Déclenchement | — | Ch. I : seuils en PV fixes par difficulté (`u`, `fury`, `rages`, `ru`, `u2`, ch1:`00-core.js:15-22` ; `16:55`, `36:73-76`, `44:131-132`). Ch. II : moitié des PV (ch2:`1635-1640`) et dernier assaut à 2 PV (`FINAL_AT`, `1641-1648`) | **C1** : seuils déclarés dans la table du chapitre (`rages:[…]` par phase et difficulté), comme le demande `docs/CH2-SPEC.md:134` |
| Repères sur la barre du boss | — | Ch. I : `pips(box,n,max,marks)` + `.pips span.mark` (ch1:`16-p1-bridge-logic.js:324-330`, `style.css:49`, repères `mk1/mk/mkR`). Ch. II : aucun repère (ch2:`1622`, CSS `50-53`) | **C1**, repères **calculés depuis les seuils de rage** (plus de `mk` recopiés à la main) |

<a id="s1-9"></a>
### 1.9 Pause

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Écran | `#pause`, « Combat en pause », Reprendre / Menu | Ch. II : boutons dans `.brow` (ch2:`182-191`) ; Ch. I sans (ch1:`body.html:93-100`) | **C** |
| Déclencheurs | P, Échap, bouton Pause, onglet caché | Ch. II : aussi à la perte du focus de la fenêtre (ch2:`2072`) ; Ch. I : pas pendant une carte (`60-ui-menu.js:33`) ; Ch. II : seulement en `play` (`1934`) | **C2** (focus perdu) |
| Musique en pause | — | Ch. I : contexte audio suspendu en arrière-plan (`04-audio-sfx.js:3`, `:18`) ; Ch. II : `MUSIC.stop()` en pause, le contexte des bruitages reste actif (ch2:`1934`, `2073`) | **C1** (`bgAudio`) |
| Réessayer (R) | — | Ch. I : hors carte et hors menu (`60-ui-menu.js:112`) ; Ch. II : aussi après la défaite (ch2:`2069`) | **C2** |

<a id="s1-11"></a>
### 1.11 Son

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Contexte audio | Tout synthétisé | Ch. I : un seul `AudioContext` `AC` pour bruitages et musique (ch1:`04-audio-sfx.js:4-18`, `64-audio-music.js:163-165`). Ch. II : deux contextes, `AC` (bruitages, ch2:`332`) et `MUSIC.ac` (ch2:`1402-1405`) | **C1** (un seul contexte) |
| `tone`, `noise` | Même nom | Signatures différentes : `tone(f,d,type,v,slide)` ↔ `tone(f,dur,type,vol,dest,when,f2)` (ch1:`04:21`, ch2:`334`) ; `noise` idem (`04:37`, ch2:`336`) | **C2** (signature la plus riche) |
| Options | Cases Son, Musique | Ch. I : `prefs` non mémorisées (ch1:`00-core.js:56`, `60-ui-menu.js:28-29`) ; Ch. II : mémorisées `lb-snd`, `lb-mus`, volumes `applyVol` (ch2:`333`, `2086-2090`) | **C2** |
| Cris, stings | — | Propres au boss | Restent au chapitre |

<a id="s1-12"></a>
### 1.12 Polices

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Familles | Big Shoulders Display 700-800, DM Sans 400-700, `build/fonts.css` inliné au build, liens Google retirés (ch1:`page/head.html:4-6`, ch2:`8-10`) | — | **C** |
| Variables CSS | `--font-display`, `--font-body` mot pour mot (ch1:`style.css:13-14`, ch2:`18-19`) | — | **C** |
| Canvas | — | Ch. I : constante `DISPLAY` (ch1:`00-core.js:33`) ; Ch. II : chaînes recopiées (ch2:`1087`, `1106-1107`, `1114`, `1117`, `1119`) | **C1** : `LB.FONT.display`, `LB.FONT.body` |

<a id="s1-13"></a>
### 1.13 Clés de sauvegarde `lb-…`

| Clé | Ch. I | Ch. II | Reco |
|---|---|---|---|
| Langue | `eb-lang` (ch1:`00-core.js:6`, `68-texts-ui.js:37`) | `lb-lang`, migre `pn-lang`, `eb-lang` (ch2:`284-297`) | `lb-lang` partout ; demande ouverte `DEMANDES.md` |
| Son, musique, aide | non mémorisés | `lb-snd`, `lb-mus`, `lb-help` (ch2:`291`, `2086-2089`) | **C2** |
| Intro vue | `eb-intro` (`76-cine-intro.js:24`, `:122`) | aucune | `lb-chN-intro` |
| Vraie fin vue | `eb-end` (`44-p3-belfry-logic.js:330`, `84-loop.js:2`) | aucune | `lb-chN-end` |
| Records | `eb-best-tn/th` (`44:310-312`, `84-loop.js:4`) | `lb-ch2-best-<mode>` (ch2:`1905-1906`) | `lb-chN-best-<mode>` |
| Déblocage | — | `lb-ch2-unl`, `UNLOCK_ALL` (ch2:`295-296`, `1895`) | `lb-chN-unl` |
| Lecture | `localStorage` direct, `try` à chaque appel | `store.get/set` avec migration (ch2:`284-290`) | **C2** : `LB.store` avec `OLD_KEYS` fournie par le chapitre |

<a id="s1-15"></a>
### 1.15 Tests et bot

| Élément | Ch. I | Ch. II | Reco |
|---|---|---|---|
| Crochets | `window.__t` ajouté par `build/build_test.py:15-16` (temps réel) | `window.__t` par `tests/ch2-lib.js:25`, temps à pas fixe de 1/60 s | **C2** : forme commune de `__t` (`S`, `gt`, `down`, `up`, `startRun`, `jumpPhase`…) |
| Fumée | `tests/smoke.js` (CI) | `tests/ch2-smoke.js` (CI, réseau) | Un `smoke` paramétré par chapitre |
| États du Veilleur | aucun | `tests/ch2-input.js` (CI) | Généraliser (exigé avant de toucher aux états du Ch. I) |
| Clés | aucun | `tests/ch2-keys.js` (CI) | Généraliser |
| Titre | `tests/menu-title.js` (hors CI) | `tests/ch2-title.js` (CI) | Généraliser (menu + titre d'intro) |
| Mots d'annonce | aucun | `tests/ch2-announce.js` (CI) | Généraliser |
| Épreuve | `trial-play.js`, `trial-end.js` (hors CI) | `ch2-trial.js` (CI) | Généraliser |
| Bot | `tests/bot.js` : phase III seulement, temps réel `setInterval`, sans statistique, hors CI | `tests/ch2-bot.js` : pas fixe, erreur gaussienne, taux de victoire, `--check` en CI | **C2** |
| Polices hors ligne | `fonts-offline.js` (CI) | dans `ch2-smoke.js` | Généraliser |
