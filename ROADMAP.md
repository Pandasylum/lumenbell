# Feuille de route

## Fait
- Chapitre I – Ember Bridge v1.0 (itch.io + APK/AAB).
- Découpage de la source du Chapitre I en fichiers.
- Import de Silent Bells, build et test dédiés (tag `ch2-import`).
- Chapitre II : harmonisation avec Ember Bridge (A technique, B gameplay et textes, C visuels), nouveaux sorts codés.
- Audit des éléments communs (`docs/COMMUN.md`), vocabulaire unique bloquer / esquiver (`docs/GLOSSAIRE.md`).
- Code commun `shared/` (langue, clés `lb-…` avec migration depuis `eb-…`, audio) et source du Chapitre II en morceaux.
- Moteur commun fusionné : états du Veilleur (`engine/hero-states`), Veilleur unique (`engine/watcher`), couleur de la lanterne et des tirs (`engine/lantern-color`), intro et outro communes (`engine/cine`), menu commun (`menu/common`).

## Prochaines étapes
1. Test sur téléphone (ressenti, lisibilité, fluidité).
2. Moteur commun, tests (`engine/tests`) : suite des tests du moteur. Plan en sessions : `docs/COMMUN.md` §4.
3. **ch1/foundry-floor** et **ch1/dodge-side** (pas encore fusionnés) : Chapitre I, phase II au fond de la Fonderie (`CHANGEMENTS.md` K), fausse fin de Facile supprimée (`CHANGEMENTS.md` L), lanterne du Colosse (G), textes (D), esquive en pas de côté (N, `docs/decisions/2026-11-01-idees-validees.md` c).
4. **ch2/cinematics** (en cours, à fusionner) : carte « à suivre » commune `LB.nextCard` faite (Chapitre I teinté, Chapitre II « Hollow Roots ») ; reste à faire : cinématiques de phase du Chapitre II (trappe, descente, fin de phase II, transformation, fin de phase III) par `LB.cine`, si le passage est simple (`docs/decisions/2026-11-01-cinematiques-et-a-suivre.md`).
5. **menu/crown** : A fait (hub `site/`, progression, bourdon et cloches, « Retour » dans les chapitres, `build/build_site.py` : `docs/decisions/2026-11-02-hub-site.md`) ; **B reste** : APK avec `site/` entier, workflow Android, package `com.lumenbell.game` (voir docs/decisions/2026-11-02-apk-hub-package.md).
6. **ch2/perf** : optimisation du Chapitre II, après la fusion des deux jeux : mesure des images par seconde, poids, minification ; build identique à chaque étape, comme pour le Chapitre I.
7. **Renommage LumenBell** : après `ch1/foundry-floor`. Titre de menu en majuscules « LUMENBELL », partout ailleurs « LumenBell » (textes affichés, documents, titre de page, nom d'app Android, titre de fin d'intro). Reste à cadrer : écriture visuelle du titre. package : com.lumenbell.game (tranché, appliqué en session menu/crown).
8. Plus tard : modules ES, Google Play, iOS ; chapitre III (Racines).

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
