# Décisions de design

Journal daté. Une décision validée n'est pas remise en question dans une autre session sans accord de Kevin.

## 2026-10-26 / 27 – Refonte du lore et des textes du Chapitre I
- Le secret (les Scellés sont d'anciens Veilleurs) n'est **jamais dit** ; un fragment par chapitre, davantage dans le premier.
- Intro : « membre d'un ordre qui protège les Flèches liées. Sa lanterne vit avec lui. » (ambivalence voulue). Carton 4 : « une chaîne cède » (jamais « brisée »). Carton 5 : « le feu atteindra les villages » (f minuscule : l'élément est la braise).
- Panneaux de phase épurés : ne pas redire ce que le combat montre. Entrée P1/P2/P3 et fins : voir `docs/TEXTES-CH1.md`.
- « Clocher des Veilleurs » ; le Colosse n'est **pas** dit « à genoux » dans les textes (le dessin le montre, statue agenouillée dans l'outro).
- La cloche sonne seule un peu avant l'impact d'entrée en P3 (le joueur s'interroge sur la raison du « dong »). Texte : « Un écho du passé résonne. »
- P2 : décor à base de mur de briques et terre ; support de chaîne avec chaîne d'homme rompue, second support vide (suggère la chaîne que porte le Colosse). Anneau de fer sur la corniche **visuel seulement**.
- L'anneau n'est mentionné qu'une fois en texte : panneau de fin P3, « un anneau de chaîne gravé d'un nom effacé ».
- Outro : durées augmentées pour les longs cartons (≤ 1 s), carton villages raccourci ; carton 4 sans mention de la lumière froide.
- Aucun mot d'annonce à l'écran ; textes toujours bilingues.

## 2026-10-27 – Organisation GitHub
- Dépôt privé unique `lumenbell`. Découpage d'abord en fichiers assemblés par script (pas de modules JS), puis éventuellement ES modules.
- Workflows : `tests.yml` (build reproductible + smoke) et `android.yml` (APK/AAB signés via Secrets).
