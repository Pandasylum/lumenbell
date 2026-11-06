# Lumenbell – consignes pour Claude Code

Jeu canvas HTML5, série de combats de boss. Lis d'abord `BIBLE.md`, `NOTES.md` et `DECISIONS.md`, puis le `NOTES.md` du dossier où tu travailles.

## Règles non négociables
1. Le lore officiel est dans `docs/LORE.md` : référence unique, ne le modifie jamais sans demande explicite. Lis aussi `docs/GLOSSAIRE.md` et `CHANGEMENTS.md`.
2. Si `CHANGEMENTS.md` contient des entrées au statut « À faire » pour ton périmètre, applique-les, puis passe leur statut à « Fait (PR fusionnée) » (statuts de `CHANGEMENTS.md` : À faire, En cours, Fait, Annulé). N'invente aucune modification de texte.
3. Fin de session : ajoute 1 à 3 lignes « ce que le joueur verra » à `DEVLOG-NOTES.md`.
4. Rapport final en 15 lignes maximum : fait / pas fait / décisions à valider. Pas de recopie de code ni de diff.
5. **Le dépôt est la seule référence.** Pars toujours de la dernière version de la branche, jamais d'une copie ancienne.
6. **Un périmètre par session.** Ne modifie que le dossier qui t'est attribué. Tout besoin touchant le moteur ou le héros s'écrit dans `DEMANDES.md`.
7. **Tout texte en deux langues** : `_('anglais','français')` ou `{d,en,fr}`. Aucun mot d'annonce à l'écran (« Parade ! », « Touché ! »…). Ce qui se déduit du combat reste déduit (lore non explicite).
8. **Texte, lore ou design : proposer avant de modifier** quand l'utilisateur dit « on discute / ne modifie pas ». L'utilisateur est perfectionniste et itère beaucoup : c'est normal.
9. **Réglages de timing dans des tables** (`T`, `R_T`, `DG`, `DIFFS`…), jamais en dur. Ne touche pas à une phase non demandée.
10. **Rien n'est publié sans test** : `smoke` sur chaque PR non brouillon ; avant un tag `v*` ou un envoi sur itch.io, lancement manuel de la CI « Tests » (périmètres `shared ch2 hub`) sur `main`. Pour la doc, le texte et le visuel, ne rien lancer en local (la CI tient lieu de test). Logique d'un chapitre : `smoke` + le test ciblé. `shared/` : les deux chapitres + `keys` et `audio`. Jamais par défaut : `visual-shots.js`, bots (`bot.js`, `ch2-bot.js`), `trial-*`. Lire TOUTE la sortie d'un test (`errs []` attendu) et relancer UNIQUEMENT le test en échec. Une chaîne FR avec apostrophe dans une chaîne JS entre apostrophes casse tout le jeu : utiliser des guillemets doubles.
11. **Le build doit rester reproductible** : `python3 build/build_chapter.py ch1-ember-bridge` doit redonner exactement `chapters/ch1-ember-bridge/dist/index.html` tant qu'on n'a pas voulu le changer.
12. **Jamais de clés** (`*.jks`, mots de passe, base64 du keystore) dans le dépôt, les logs ou les messages.
13. Le feu de l'élément s'écrit « braise » (minuscule) ; « Braise » désigne l'élément, pas un nom propre.
14. Commits en français ou anglais, courts ; une branche par sujet (`engine/…`, `ch1/…`, `ch2/…`, `menu/…`), fusion vers `main` par pull request après les tests.
15. Ne pas lire `archives/`, et ne rien lire au-delà des fichiers nommés par le prompt, sauf si le sujet l'exige.
16. Session documentation seule : ne lire que les fichiers cités, aucun build, aucun test.
17. Ne surveille jamais la CI et ne fais aucun polling (`gh run watch`, relectures en boucle) : termine après le push.
18. Après tout changement de source du Chapitre II : lance `python3 build/build_chapter.py <id>` (id du chapitre, ex. `ch2-silent-bells`) puis `build_site.py` et commite les fichiers générés, sinon la CI échoue (build reproductible).
19. **Tests lourds et CI** : `ch2-bot`, `visual-shots`, `trial-*` et les périmètres `shared/`, Chapitre II, hub ne tournent que par lancement manuel de la CI (`workflow_dispatch`), jamais par défaut. Android : tag `v*` ou lancement manuel uniquement. Chaque job a un `timeout-minutes`.

## Fin de session
Tests passés, `NOTES.md` et `DECISIONS.md` à jour, fichiers déposés sur la branche, résumé des changements.

## Difficulté et chapitres
Le Chapitre I est la référence. La difficulté ne multiplie **jamais** le rythme interne des attaques (écarts entre coups, préparatifs, enchaînements) : ces durées sont celles du Normal, en secondes réelles, pour Facile, Normal et Difficile. Elle passe uniquement par : fenêtres et PV du Veilleur (tables partagées), PV et seuils du boss, nombre de rages, pause entre attaques, plancher d'écart entre impacts, nombre d'éléments par sort (volées, pluies, écho de rage), écho permanent en Difficile. Tout nouveau chapitre calque le Chapitre I (PV, seuils, rage relancée tant que le boss n'est pas touché, fenêtres, rythme interne, planchers). Aucune accélération par difficulté ni par rage. Un accélérateur de rage par boss existe (défaut 1) ; toute valeur différente doit figurer dans docs/decisions. Chapitre II : `RHY` (`64-prologue.js`) ; `ch2-smoke` échoue si `d.sp` y réapparaît.
**PV et seuils des boss** viennent de `LB.BOSS_DIFF` (`shared/js/18-boss-diff.js`) ; tout écart (`LB.BOSS_OVERRIDE`) doit être listé dans docs/decisions ; les smokes des deux chapitres échouent si un chapitre les redéfinit.
**Rages communes** : `finalHp` (1), la durée du rugissement (`rageDur`, `rageDur2`), la relance de rage (`LB.rageState`) et le plafonnement du soin (`LB.healFor`) viennent de `LB.BOSS_RULES` (`shared/js/18-boss-diff.js`) ; ne pas les recoder dans un chapitre (`tests/boss-diff-static.js`). La logique de rage du Chapitre I (`Q.rn`, `qRage`, `R.u5`, `R.u55`, `R.rk5`) reste la référence.
