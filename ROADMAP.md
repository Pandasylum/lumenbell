# Feuille de route

## Fait
- Chapitre I – Ember Bridge v1.0 (itch.io + APK/AAB).

## Prochaines étapes
1. Découpage de la source du Chapitre I en fichiers assemblés par `build/build.py` (sans modules JS), build identique à v1.0, tests verts.
2. Import de Silent Bells dans `chapters/ch2-silent-bells/` (fichier déposé, tag `ch2-import`), build et test dédiés, sans changer le jeu.
3. Harmonisation du Chapitre II selon `docs/CH2-SPEC.md` (textes, lore, intro/outro, décors, sauvegarde, polices).
4. Moteur commun (`engine/`, `shared/`) : boucle, entrées, audio, langues, sauvegarde, difficultés, Veilleur.
5. Menu : écran titre, choix du chapitre, progression.
6. Plus tard : modules ES, Google Play, iOS.

## Avant une sortie publique
- Vérifier les noms (TMview, INPI) et l'origine de l'icône.
- Keystore sauvegardé en deux endroits ; Play App Signing activé.
- Tester sur téléphone : musique en arrière-plan, pause/reprise, APK minifié.
