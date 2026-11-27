# 2026-11-27 · Colosse A9 au Chapitre I, phase I : torse qui pivote et se penche

**Décision.** Au pont (phase I), le Colosse prend le dessin de la référence validée `colosse-a9.js` (direction A9) et ses quatre poses de masse.

- **Quatre poses** : repos, armement (le torse se tourne et se cambre), frappe (il pivote et se couche sur le coup), arrachement (il se redresse en tirant). Table `COL_P` (`chapters/ch1-ember-bridge/src/js/32-p1-bridge-render.js`) : penché, descente, pivot, décalage des épaules, main lointaine.
- **Le buste se penche et pivote autour de la taille** ; les jambes restent plantées. Les poses s'enchaînent au rythme des états existants (`windup`, `strike`, `rewind`, `rebound`, `stagger`, `lift`, `hold`, `slam`, `release`) : durées, impacts et logique inchangés.
- **Aucun bras étiré** : bras et avant-bras de longueur fixe (L1 = 68, L2 = 66 en coordonnées de pose), coude toujours du même côté. Une main demandée hors de portée est ramenée à la portée.
- **Masse du bras proche (combo au marteau)** : le buste suit la main, de l'élan en arrière au bout du coup ; la tête du marteau vise le même point qu'avant et le manche glisse dans le poing.
- **Cohérence** : le souffle part de la gueule du nouveau corps ; la chaîne lointaine porte la boule de la référence ; la bandoulière et son crochet restent sur le torse.
- **Conservés** : ailes, masse accrochée dans le dos, couronne de flammes, aura de rage, éclat de blessure, yeux blancs au coup, gueule qui s'ouvre.
- **Téléphone** : chaque pièce rigide est peinte une fois dans un calque en cache (ombres, flous, liserés) ; à chaque image on ne fait que poser les calques.
- `demonBody` (phases II et III) n'est pas modifié.

**À valider** : la masse reste au poing en permanence (la chaîne ne se déroule plus du torse) ; le bras au marteau (poses déduites, non validées en planche) ; le liseré des bras est cuit dans le repère du segment (approximation).
