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

## 2026-10-27 – Découpage de la source du Chapitre I (branche `ch1/split`)
- `legacy/ember-bridge.source.html` est remplacé par `chapters/ch1-ember-bridge/src/` : `page/` (head, style, body, end) et 22 morceaux `js/NN-nom.js`, numérotés de 4 en 4 pour pouvoir en intercaler.
- Assemblage par simple concaténation (`build/assemble.py`, ordre dans `src/parts.txt`), **sans modules JS ni en-tête ajouté** : le build reste octet pour octet identique à `dist/index.html` v1.0. Les étapes intermédiaires ont toutes été vérifiées ainsi.
- Découpage par tranches contiguës du fichier d'origine (aucun déplacement de code) : décor, Veilleur, corps du Colosse, logique et rendu de chaque phase, interface, musique, textes d'interface, cinématiques, boucle. Les textes `_()` restent là où ils sont utilisés ; `docs/TEXTES-CH1.md` donne leur `fichier:ligne`.
- Le passage éventuel aux modules ES reste une étape ultérieure séparée (elle changera le build).
