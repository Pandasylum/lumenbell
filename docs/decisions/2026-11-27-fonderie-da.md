# 2026-11-27 · Phase II (Fonderie), direction artistique : rendu seulement

Source : maquette `fonderie-reference.js` (colosseF, FS, DEC, ambiance, recul, devantScene, rebord, tornade). On reprend son dessin, pas son rythme.

## Fait (fichier `40-p2-foundry-render.js`)
- **Décor** : fonderie au fond de la montagne, tout dessiné une fois dans trois calques en cache (fond, rebord, avant-plan) ; roche, galeries, haut fourneau et cheminée, rail et palan, creuset et coulée, roue fixée au pilier, voûte, mur avec chaîne rompue, anneau cédé et petite lanterne orange qui pulse. Animés par image (tracés seulement) : roue, creuset, coulée, brumes, lave, braises, chaîne, lanterne. Voile de chaleur et lueur du four derrière le Colosse.
- **Calage** : le monde de la maquette (1230 x 692) est posé sur l'écran 960 x 540 (échelle 0,78) ; le rebord tombe sur `QFLOOR`, la lave sur `QLAKE`, le bord sur `QEDGE`, le bloc du Veilleur sur `QH`. Aucune position de jeu ne change.
- **Colosse** : le même qu'en phase I (`COLOSSE.draw`, lot 2, et `COLFX`), avec ailes (`drawWing`), boule en bandoulière, masse dans le dos, griffes aux deux mains. Queue : même courbe et même forme qu'en phase I ; seul son bout suit `tailTip()`. `COLOSSE.draw` accepte désormais un `o.qP` facultatif (28-boss-body.js, une ligne) ; sans lui, la phase I est inchangée.
- **Attaques** : griffes (il fond sur le bloc, trois entailles), ailes (tornades de feu qui roulent sur le sol), débris (bloc brandi, lancé, fracassé), boule de feu (Difficile, aplats découpés), cri et ses chutes, queue, rage (voile sombre, fissures, flammes, tornades aux ailes).
- **Ripostes** (dans les durées actuelles : 1,15 s / 1,45 s / 1,65 s / coup ultime) : griffes = éclat à bout portant ; ailes = aile déchirée par le rayon (trous brûlés de `drawWing`) ; débris = bloc cueilli au bâton et renvoyé  ; coup ultime = lumière par les fissures, puis plongeon existant.
- **Fin de phase et défaite** : même déroulé (plongée, jaillissement, envol par la cheminée) ; la lave passe devant le Colosse.
- **Performance** : aucun canvas créé par image, aucun `filter`, aucun `shadowBlur` par image (retirés des coups, de `qrock`). Mouvement réduit : horloge figée, éclats coupés.

## Après revue
- La riposte dépend de l'attaque initiale (griffes, ailes, débris), jamais de la queue qui la termine : plus de « queue clouée et éteinte ». Pour les ailes, le rayon et l'éclat de dégât arrivent au même point, l'aile déchirée (`qDamage` prend sa cible dans `qBeamTarget` ; dégâts et timings inchangés). La riposte qui termine la 1re rage est laissée telle quelle, à décider à part.

## À valider
- Le jeu n'a pas de riposte après le cri (`qAtkEnd`, `roar` → `qIdle`) : la riposte « rayon dans la gueule » n'est donc pas visible ; aucune demande moteur n'est ouverte.
- Pas de revue visuelle locale (consigne : CI seule).
