# 2026-11-04 · `fix/ui-pause-gate-help` : plus de flash de la scène avant « Commencer »

Aucun nouveau texte.

## Règle
1. Chapitre ouvert directement : l'écran de démarrage est le premier visuel ; la scène du menu (SVG `.mscene`) n'apparaît pas avant « Commencer ».
2. Correctif en CSS, en tête de `page/style.css` des deux chapitres (donc dès le premier rendu, avant tout JS) : `#menu .mscene` masquée, révélée par `#gate[hidden] ~ #menu .mscene`. L'écran de démarrage (`LB.gate`) précède le menu dans la scène, d'où le sélecteur frère.
3. La scène se révèle comme avant : après « Commencer », à l'ouverture depuis le hub (écran masqué par `LB.menu`), et dans la copie de test (ch2-lib « écran masqué »).
