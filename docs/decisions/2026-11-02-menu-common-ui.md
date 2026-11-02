# 2026-11-02 · `menu/common-ui` : lien « chapitre suivant » et carte de défaite / de fin communs

**Décision** : un seul rendu, défini dans `shared/js/28-ui.js`, pour tous les chapitres présents et futurs.

- Lien du menu (`#mNext`) : toujours « CHAPITRE N · NOM » (nom du chapitre suivant, FR / EN) dans `LB.CH_COL[N]`, suivi du badge « À VENIR » ; plus de cadenas. Le chapitre ne donne que `{n, title, open?}` dans `CHAPTER.next` ; couleur, rgb et survol sont dérivés de `LB.CH_COL` (`LB.chRgb`, `LB.chHover`). `LB.CH_COL[1]='#ff7a2b'` ajouté (lu par `LB.title` du Chapitre I).
- Carte `LB.card` : « Réessayer » (`go`) puis « Menu » à droite, ajouté pour toute carte qui reçoit `onMenu` ; l'offre d'aide (`go2`) passe sur une ligne dessous ; couleurs / style communs via `--chc`, `--chc2`, `--chr` (couleur du chapitre, posées par `LB.UI_CSS`) ; `stats`, `desc`, `how` vides = masqués. Chapitre II : plus de `go2` « Menu ». Chapitre I : `onMenu` sur les cartes de défaite et de phase terminée (pas sur la carte de fin, dont `go` est déjà « Retour au menu »).
- Entrée / Espace sur un bouton de la carte l'active lui-même (`LB.input`).
- Aucun texte ajouté ni modifié. Sous-texte (tag) et mode d'emploi (how) du Chapitre II : toujours à fournir, emplacements masqués.
- Garde : `tests/cine.js` § 6 (statique : rien redéfini hors de `shared/` ; dynamique : mêmes boutons, même lien suivant dans les deux chapitres).
