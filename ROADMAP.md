# Feuille de route

## Fait
- Chapitre I – Ember Bridge v1.0 (itch.io + APK/AAB).

## Prochaines étapes
1. ~~Découpage de la source du Chapitre I en fichiers~~ (fait).
2. ~~Import de Silent Bells, build et test dédiés~~ (fait, tag `ch2-import`).
3. Chapitre II, harmonisation avec Ember Bridge (`docs/CH2-SPEC.md`), trois sessions, une PR chacune :
   - A · technique (`ch2/tech`) : fait.
   - B · gameplay et textes (`ch2/texts`) : mots d'annonce, difficultés, phase III sans contre-attaque, textes FR/EN, nom Lumenbell.
   - C · visuels (`ch2/visuals`) : décors, Roi et tour, lanterne turquoise, gravure, outro, code couleur.
4. Test sur téléphone (ressenti, lisibilité, fluidité).
5. D · optimisation et découpage du Chapitre II (`ch2/perf`) : mesure des images par seconde, poids, minification, source en plusieurs fichiers, build identique à chaque étape, comme pour le Chapitre I.
6. Moteur commun (`engine/`, `shared/`) : boucle, entrées, audio, langues, sauvegarde, difficultés, Veilleur ; migration des clés `eb-…` du Chapitre I vers `lb-…`.
7. Menu : écran titre commun, choix du chapitre (la Couronne : six points autour d'un septième), progression, APK avec les deux chapitres.
8. Plus tard : modules ES, Google Play, iOS ; chapitre III (Racines).

## Idées notées pour plus tard
- **Déblocage progressif** (phases, difficultés) : à étendre à toute la série avec un écran commun ; désactivé pour les tests (constante de réglage dans le Chapitre II).
- **Revue complète des sorts, des fenêtres de contre et des effets des boss**, chapitre par chapitre : un tableau par chapitre (attaque, préparation, fenêtre, contre, effet, durée), puis équilibrage Facile / Normal / Difficile. À faire après les visuels et le test sur téléphone (session d'équilibrage).
- **Contre-attaque à jauge de fatigue** (chaque attaque du boss la fait monter, point faible dévoilé, contre-attaque automatique) : mécanique réservée à un chapitre suivant.
- **Écriture ancienne** (signes anguleux de la cloche) : à définir, pour « Couronne », « Lié », « cloche ».

## Avant une sortie publique
- Vérifier les noms (TMview, INPI) et l'origine de l'icône.
- Keystore sauvegardé en deux endroits ; Play App Signing activé.
- Tester sur téléphone : musique en arrière-plan, pause/reprise, APK minifié.
