# 2026-10-28 – Chapitre II, troisième passe de retouches (`ch2/retouches-3`)

Demande de Kevin (points 1 à 4 ; le point 5, « retours du test », était vide : ignoré). Périmètre : `chapters/ch2-silent-bells/` seulement.

## 1. Entrée de la phase III
- Le Veilleur est posé dans la coque dès la première image (`S.heroDY = 0`) ; plus de chute, plus de son `whooshDown` / `land` ni de poussière à l'atterrissage.
- La caméra révèle le lieu : elle part serrée sur le Veilleur et recule (`CINE_P3.reveal` 3,2 s, `revealZ` 1,7, point `revealX`/`revealY`), ce qui découvre la lune, les côtes brisées et la tour qui naît du corps du Roi. Valeurs dans `CINE_P3`.

## 2. Décor de la phase III (table `HULL`, `hullRuin()`, `floatDebris()`)
- Côtes de la coque en arche à gauche et à droite, brisées en haut (extrémité éclatée) ; mât brisé penché au milieu avec un lambeau de voile déchirée ; ponts de planches au sol avec des pointes de récif entre elles ; planches et tonneau à flot sur la mer ; lune (inchangée).
- Le bâton à moitié caché à gauche reste comme il est (`STAFF` inchangé). Ces éléments sont du fond : ils ne touchent ni aux hitboxes ni aux menaces.
- Lecture raisonnable : le mât est au milieu du décor (x 470), derrière le combat, à gauche de la tour (x 760).

## 3. Onomatopées
- `CLANG` (`ONO.block`) au blocage du Veilleur en phase II **et** en phase III (la garde). Phase I : aucun mot (cris de la Voix, au son). Phase II : aucun mot pour les attaques du Roi. Phase III : aucun mot ajouté ; `KRAKOOM` au coup final. `KRAAAK` (poutre) inchangé. Pas de mot par type d'attaque.

## 4. Chocs d'impact par forme (`SHOCK.form`)
- Forme I (la tour, faite du Roi) : métal et cloche rouillée : son `thud` + cloche (`bellHit`), étincelles blanches puis ambre et orangées qui retombent.
- Forme II (la méduse) : matière molle et gélatineuse : son sourd et mouillé (`sfx.squelch`, `MUSIC.fx('jellyHit')`, plus de `creature`), éclaboussures translucides (couleurs `rgba`) plus lentes, qui retombent davantage.
- Les valeurs communes (arrêt sur image, secousse, flash, recul) restent celles de `SHOCK`. Les phases I et II gardent leurs chocs.

## Test
`tests/ch2-retouches3.js` (ajouté à la CI) : plus de chute, table `HULL`, mots affichés par phase, sons et particules différents par forme.
