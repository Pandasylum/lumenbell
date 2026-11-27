# 2026-11-27 · Phase II : un univers vivant (rendu seulement)

Timings, dégâts, positions et logique inchangés (`40-p2-foundry-render.js` ; `Q.t`, `Q.lt`, `Q.splash`, `Q.erupt` sont lus, jamais écrits).

- **Contres propres à chaque attaque** : griffes = la lumière frappe la main, les griffes éclatent et volent ; ailes = croissant de lumière, souffle qui rabat les ailes et gerbes de flammes aux pointes ; débris = la lumière monte vers la voûte puis trois colonnes tombent d'en haut sur le Colosse (plus d'éclats dans un rayon).
- **Coup ultime, plus de sensation de dégât** : le Colosse tremble, clignote, ses ailes claquent, des plaques d'armure sont arrachées, des flammes sortent des fissures, arc de lumière à l'impact, secousse d'écran en plus (rendu seulement ; l'arrêt sur image et les dégâts viennent du moteur, inchangés).
- **Il vole en combat** : ailes qui battent doucement, corps qui oscille, jambes pendantes qui balancent (`fdLegs`).
- **Colosse vivant** : respiration, tête qui tourne, mains et griffes qui bougent, ailes qui battent doucement, flammes qui vacillent.
- **Entrée** : il descend en battant des ailes avec une traînée de feu ; chaque battement soulève des braises (les lames de vent ont été retirées) ; ailes ouvertes dès le début ; éclair à l'arrivée de ses ailes ; le Veilleur atterrit sur son bloc dans la poussière.
- **Chute** : il plonge légèrement penché, ailes restées ouvertes qui se lèvent et frémissent dans l'air ; elles ne se replient qu'au contact de la lave. Pas de traînée de flammes.
- **Pose** : il se pose doucement dans la lave, genoux fléchis, une seule couronne douce de gouttes.
- **Sortie** : il se redresse, déploie les ailes ; une colonne de feu sous lui, la lave ruisselle de son corps, quelques flammes dans son sillage, un peu de fumée à la cheminée, puis il s'envole.
- Mouvement réduit : pas d'éclats ; horloge figée.

À valider : intensité et durée de chaque animation sur l'aperçu ; un « Colosse vivant » en phases I et III reste à décider.

## Corrections après essai
- Plantage au coup ultime : une fonction (`fdPlates`) avait été renommée par erreur lors d'un remplacement de texte ; corrigé. Clignotement du coup ultime adouci.
- Creuset : il reste devant le Colosse pendant toute la riposte de fin de rage et il est dessiné après le voile de chaleur, donc sa couleur ne pâlit plus quand il repasse derrière.
- Fin sobre (retour de jeu : « trop le bazar ») : colonnes de lave, grandes étoiles et gerbes de flammes retirées ; pendant la fin, une étincelle sur trois est dessinée, la secousse d'écran est réduite à 35 % et l'éclair blanc à 50 % (rendu seulement ; le moteur lance toujours ses effets).
