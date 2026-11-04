# 2026-11-04 · Écran de démarrage : une seule source CSS (`refactor/gate-css-source`)

**Décision** : les règles de l'écran de démarrage (`#gate`) et du voile de premier rendu n'existent plus qu'à un endroit : `shared/css/gate.css`. Aucun changement visible, sortie identique à l'octet.

**Où** : `shared/css/gate.css`, en blocs nommés (`/*@veil*/`, `/*@scene*/`, `/*@gate*/`, `/*@gatebtn*/`, `/*@btnbig*/`, `/*@glow*/`…). `@RGB@` = couleur du halo du bouton, `@GLOW@` = le halo.

**Comment les builds l'utilisent** (`gate_expand` dans `build/assemble.py`, appelée par `parts()` pour les chapitres et par `build_site.py` pour le hub) :
- `style.css` des chapitres et du hub : une ligne `@gate <blocs>` est remplacée par les règles ;
- `LB.UI_CSS` (`shared/js/28-ui.js`) : une ligne `@gate-js <blocs>` est remplacée par les mêmes règles en chaînes JS ;
- couleur du chapitre : `rgb` de la table `CHAPTER` (vérifiée contre `color`, le build échoue sinon) ; hub : le halo lit `--lanternRgb`, posée depuis `LB.WATCHER_T.lantern.idle` (inchangé).

**Garde-fou** : chaque règle de `gate.css` ne doit apparaître qu'autant de fois qu'elle est injectée ; une copie recopiée à la main (même identique) fait échouer `build.py`, `build_ch2.py`, `build_site.py` et `build_test.py` avec un message qui nomme la règle. Exception : `.btn.big` du hub est une autre règle (même sélecteur), seule une copie identique est refusée.

**Une seule règle à modifier** : pour changer l'écran de démarrage ou le voile, éditer `shared/css/gate.css`, puis lancer les trois builds (cf. règle 18).

**Vérification** : sha256 des trois dist (Chapitre I, Chapitre II, hub) identiques avant/après ; `smoke` (C1) et `ch2-smoke` : `errs []`.
