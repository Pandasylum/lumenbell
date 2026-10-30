# Feuille de route

## Fait
- Chapitre I – Ember Bridge v1.0 (itch.io + APK/AAB).

## Prochaines étapes
1. Fait : découpage de la source du Chapitre I en fichiers.
2. Fait : import de Silent Bells, build et test dédiés (tag `ch2-import`).
3. Fait : Chapitre II, harmonisation avec Ember Bridge (`docs/CH2-SPEC.md`) : A technique, B gameplay et textes, C visuels.
4. Test sur téléphone (ressenti, lisibilité, fluidité).
5. D · optimisation et découpage du Chapitre II (`ch2/perf`) : mesure des images par seconde, poids, minification, source en plusieurs fichiers, build identique à chaque étape, comme pour le Chapitre I.
6. Moteur commun (`engine/`, `shared/`) : boucle, entrées, audio, langues, sauvegarde, difficultés, **un seul Veilleur dessiné et animé pour tous les chapitres** (poses de garde, pas de côté, coup reçu, victoire ; demande à écrire dans `DEMANDES.md` par la session C1) ; migration des clés `eb-…` du Chapitre I vers `lb-…`.
7. Fait : audit des éléments communs (`docs/COMMUN.md`). Vocabulaire unique : bloquer / esquiver.
8. Menu : **une seule fonction de menu pour les 7 chapitres** (boutons au même endroit, mêmes polices, même position des textes — nom du jeu en grand, nom du chapitre en dessous en petit —, mêmes durées), alimentée par une table par chapitre (nom, couleur, sous-titre) ; écran titre commun, choix du chapitre (la Couronne : six points autour d'un septième), progression, APK avec les deux chapitres.
9. Plus tard : modules ES, Google Play, iOS ; chapitre III (Racines).

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
