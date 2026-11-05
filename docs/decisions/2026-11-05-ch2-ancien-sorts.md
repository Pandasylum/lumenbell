# 2026-11-05 · Chapitre II, phase II : refonte des sorts de l'Ancien de Rouille (`ch2/ancien-sorts`)

Décision de Kevin (5 nov.). Vocabulaire : bloquer (jamais « parer »). Aucun texte affiché nouveau (lecteur d'écran seulement, FR+EN). Durées nouvelles dans `SP`, **provisoires**. PV, difficultés et autres phases : inchangés.

- **Harpon** : lancé, traverse le Veilleur (1 blocage), se plante dans le bois derrière ; 1 s après, l'Ancien le rappelle en arrachant une planche de bois de navire en diagonale : 2 blocages rapprochés (haut puis bas, un seul bouton). Contre : rayon électrique le long de la chaîne jusqu'à la main.
- **Balayage** : ancre géante, 2 coups (Facile), 3 (Normal), 4 (Difficile), timings par difficulté ; le 4e coup déclenche une vague d'eau comptée dans la série. Contre (série complète) : coup de clochette, l'onde fait vibrer l'ancre et rebondit sur l'Ancien.
- **Vague** : il lève le pied, choc au sol, vague ; une planche tombe sur le Veilleur (2 blocages). Contre : sceptre planté, rayon au sol qui fend la vague jusqu'au pied de l'Ancien.
- **Rage 1 · Nuage de rouille** : il frappe la coque, la rouille couvre la zone (visibilité réduite, l'Ancien peu visible). Le nuage dure jusqu'à l'effondrement (fin de phase) et s'ajoute à tous les sorts suivants : simple gêne, jamais le signal de blocage. Puis un balayage. Contre : sceptre levé, lumière accrue autour du Veilleur seulement, onde d'écho de la clochette vers l'Ancien.
- **Rage 2 (Difficile) · Double vague** : pied 1 → vague + planche ; pied 2 → vague + planche ; puis un harpon. Contre : rayon au sol en deux traits ; le harpon final n'a pas de contre propre mais compte dans la série.
- **Rage finale · Glas** (remplace le dernier assaut) : la cloche de tête sonne, des échos viennent vers le Veilleur ; chaque écho bloqué renvoie un écho sur l'Ancien (visuel, sans dégâts). Entre deux glas, un décor tombe : planche (2 blocages) ou chaîne (1 blocage), sans contre. Finish après 3 (Facile), 4 (Normal), 5 (Difficile) glas contrés : compteur total, pas une série.
- **Finish** (remplace la riposte finale) : sceptre levé, la clochette chargée de Lumen entre en résonance avec la cloche de l'Ancien, qui sonne de plus en plus fort ; au dernier coup il s'écroule, puis cinématique existante. Aucune pulsation turquoise ajoutée.
- Code : table `SP` (`harpoon`, `sweep`, `wave`, `dwave`, `rust`, `glas`, `finish`), séquences de `P1`, menaces `hpOut`/`plank` (harpon), `sweep`/`wave`/`rafter` (balayage, vague), `toll` à `gid` (échos du Glas), `dchain` (chaîne du décor ; la planche du décor est `rafter`), contres par `S.cnt.spell` (`R_CNT` inchangé). Noms de code inchangés (`slam`, `rafter`, `rust`…).

## À valider (choix les plus simples)
1. Rage 1 : le nuage est posé à la rage 1 et reste jusqu'au KO (`S.rust.end` infini) ; il retombe à la défaite/reprise de phase.
2. Un glas = 2 échos (`SP.glas.n`) ; un glas est « contré » quand ses deux échos sont bloqués. Une riposte à dégâts n'existe plus en rage finale : seul le Finish termine.
3. Décor entre deux glas : planche ou chaîne tirée au hasard ; planche = menace `rafter` (2 blocages), chaîne = `dchain` (1 blocage).
4. Le contre d'une série mêlée suit le dernier sort lancé de la série.
5. Balayage à 4 coups : le 4e coup écrase le sol ; vague d'eau = menace `wave` simple, sans planche, bloquée 0,5 s après l'écrasement.

## Balayage en combo (Kevin, 5 nov., après revue)
Un seul mouvement lié, sans retour au repos entre les coups : l'ancre se lève puis retombe. Écarts entre impacts (`SP.sweep.d`, provisoires, après 0,72 s) : Facile 0,85 ; Normal 0,60 puis 0,95 ; Difficile 0,55, 0,90 puis 0,75. Un écart ≥ 0,7 est un délai : l'ancre reste levée en tremblant avant de tomber. Difficile : le 4ᵉ coup écrase le sol (vague). Points 1 à 6 ci-dessus validés par Kevin.

## Retouches du 5 nov. (soir)
- Rage 1 : le nuage couvre tout, le Veilleur compris (voile léger dessiné après lui) ; plus aucun éclaircissement permanent près de lui. Il ne se dégage qu'au contre (sceptre levé), puis le nuage revient.
- Contre du harpon : la foudre part de la lanterne, frappe le harpon et monte le long de la chaîne jusqu'à la main. Contre plus lent (`R_CNT.harpoon` 1,6 s, impact 0,65 s) et rappel du harpon plus lent (`SP.harpoon.back` 0,9) pour la voir monter. Provisoire.

## Séries (Kevin, 5 nov.) : un contre par série
Les combos de sorts dans une même série donnent un seul contre, à la fin. Choix : Facile = un seul sort par série ; Normal = 3 séries simples sur 6 et 3 combos sur 6, avant et après la rage ; Difficile = toujours un combo (deux sorts, trois sorts après la rage). Constaté (non modifié, hors périmètre) : la Voix Creuse a 1 série mixte sur 6 puis 5 sur 8 après la rage ; le Phare Noyé 4 sur 9 puis 8 sur 9. Le Chapitre I n'enchaîne pas ainsi : choix de Kevin de le garder.
