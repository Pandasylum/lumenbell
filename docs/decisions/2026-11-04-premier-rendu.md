# 2026-11-04 · Premier rendu : seul l'écran « Commencer » est visible (Chapitres I et II, hub)

Branche `fix/first-paint`. Suite de `2026-11-04-ecran-demarrage.md`, qui n'avait pas été mesuré.

## Mesure (page ouverte, jeu retardé de ~1 s, CPU ralenti ×4, fenêtre 1000×700)
- **Chapitres I et II** : au premier rendu on voyait la scène (en-tête, barres, arène vide) ; l'écran « Commencer » n'existait pas encore dans le HTML (créé par `LB.gate.mount`). Au retour du JS : barres 23 → 35 px (les pastilles de vie se remplissent), arène décalée de 6 px, puis le voile du « Commencer » apparaît.
- **Hub** : le « Commencer » était dans le HTML mais le titre, la figure et la roue étaient en pleine mise en page avant le JS (titre 66×14 px au lieu de 968×61, figure et roue absentes), et le bouton changeait de taille (152 → 156 px : bordure et lueur dépendaient de variables CSS posées par le JS). Les polices sont intégrées (base64) : elles ne sont pas en cause.

## Décision
- Les deux chapitres reçoivent l'écran « Commencer » (avec EN/FR) dans le HTML, au même endroit qu'avant (dans l'arène, avant le menu). `LB.gate.mount` l'adopte au lieu de le créer.
- Règle CSS en tête de `style.css` de chacune des trois pages : tant que `<html>` n'a pas la classe `lb-go`, tout est masqué sauf `#gate`. Le JS (`shared/js/28-ui.js`) pose `lb-go` quand `#gate` se masque (Commencer, ouverture depuis le hub, retour du hub, copie de test `ch2-lib`) ou s'il n'existe pas. Un `MutationObserver` suffit : aucun site d'appel modifié.
- Les règles de l'écran de démarrage (`.gate`, `.langs`, `.btn.big`) sont recopiées dans les `style.css` des chapitres, à l'identique de `LB.UI_CSS` ; hub : la couleur de la lanterne du bouton est posée sur `#gate .btn` (même valeur que `LB.BRAND.lantern`). À garder alignées.
- Un petit script inline (langue : `lb-lang` ou langue du navigateur) met « Commencer » et le bouton EN/FR actif dès le premier rendu. Les gardes « un seul `<script>` » de `build_ch2.py`, `build_site.py` et `tests/ch2-smoke.js` passent donc à deux.
- Hub : le hub reste masqué jusqu'à « Commencer » (il apparaît au moment de l'arrivée, il n'est plus entrevu flou derrière l'écran de démarrage). À valider.
- Ouvert depuis le hub, un chapitre montre l'écran de démarrage le temps du chargement du JS, puis le masque (inchangé après).

## Résultat (même script, après)
Trois pages, EN et FR : premier rendu = `#gate` et `#gateBtn` seulement ; position et taille du bouton identiques avant/après le JS. Smoke (C1) et ch2-smoke : `errs []`.
