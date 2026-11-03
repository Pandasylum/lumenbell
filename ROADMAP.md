# Feuille de route

## Fait
- Chapitre I – Ember Bridge v1.0 (itch.io + APK/AAB).
- Découpage de la source du Chapitre I en fichiers.
- Import de Silent Bells, build et test dédiés (tag `ch2-import`).
- Chapitre II : harmonisation avec Ember Bridge (A technique, B gameplay et textes, C visuels), nouveaux sorts codés.
- Audit des éléments communs (`docs/COMMUN.md`), vocabulaire unique bloquer / esquiver (`docs/GLOSSAIRE.md`).
- Code commun `shared/` (langue, clés `lb-…` avec migration depuis `eb-…`, audio) et source du Chapitre II en morceaux.
- Moteur commun fusionné : états du Veilleur (`engine/hero-states`), Veilleur unique (`engine/watcher`), couleur de la lanterne et des tirs (`engine/lantern-color`), intro et outro communes (`engine/cine`), menu commun (`menu/common`).
- Hub « La Couronne » (`site/`, `build/build_site.py`) : roue de réglages (hub, menus, jeu), pause Menu / Chapitres avec confirmation, page verrouillée contre le défilement, fond sonore du hub (variante c).
- Package `com.lumenbell.game` : `site/` entier dans l'APK, zip itch.io unique.
- Règles communes : couleur du titre (`LB.BRAND`), carte de défaite, lien suivant et carton « à suivre ».
- Chapitre I : phase II au fond de la Fonderie, esquive en pas de côté, lanterne du Colosse, fausse fin de Facile supprimée (`ch1/foundry-floor`, `ch1/dodge-side`).
- Chapitre II : cartes « à suivre » communes, intros et outros communes (`ch2/cinematics`).

## Prochaines étapes
1. Test sur téléphone (ressenti, lisibilité, fluidité), dont l'APK du hub (`apk/hub-package`).
2. Moteur commun, tests (`engine/tests`) : suite des tests du moteur. Plan en sessions : `docs/COMMUN.md` §4.
3. ch2/perf : optimisation du Chapitre II, après la fusion des deux jeux : mesure des images par seconde, poids, minification ; build identique à chaque étape, comme pour le Chapitre I.
4. **Renommage LumenBell** : règle d'écriture du titre tranchée. Menu en majuscules « LUMENBELL » (fait) ; dans les titres, « LUMEN » en couleur du chapitre et « BELL » en crème ; au hub, « LUMEN » en jaune lanterne (#ffe066). Reste « LumenBell » dans les textes affichés, le titre de page, le nom d'app Android et les documents.
5. Plus tard : modules ES, Google Play, iOS ; chapitre III (Racines).

## Idées notées pour plus tard
- **Session « sorts et équilibrage »** (après C1) : régler fenêtres et durées des nouveaux sorts du Chapitre II (codés, voir `docs/CH2-SPEC.md`). En tête : la phase III en Difficile (84 / 9 / 0 victoires du bot à 40 / 70 / 100 ms), le Difficile en général, la pénalité du reflet (0,6 s).
- **Déblocage progressif** (phases, difficultés) : à étendre à toute la série avec un écran commun ; désactivé pour les tests (constante de réglage dans le Chapitre II).
- **Revue complète des sorts, des fenêtres de contre et des effets des boss**, chapitre par chapitre : un tableau par chapitre (attaque, préparation, fenêtre, contre, effet, durée), puis équilibrage Facile / Normal / Difficile. À faire après les visuels et le test sur téléphone (session d'équilibrage).
- **Contre-attaque à jauge de fatigue** (chaque attaque du boss la fait monter, point faible dévoilé, contre-attaque automatique) : mécanique réservée à un chapitre suivant.
- **Écriture ancienne** (signes anguleux de la cloche) : à définir, pour « Couronne », « Lié », « cloche ».

## Avant une sortie publique
- Vérifier les noms (TMview, INPI) et l'origine de l'icône.
- Keystore sauvegardé en deux endroits ; Play App Signing activé.
- Tester sur téléphone : musique en arrière-plan, pause/reprise, APK minifié.
