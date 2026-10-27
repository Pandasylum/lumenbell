# Chapitre II · Silent Bells : cahier des charges de l'harmonisation

Décisions de Kevin, 27 octobre 2026. Elles priment sur le contenu actuel de `chapters/ch2-silent-bells/legacy/silent-bells.source.html` (version du 25 octobre, page complète autonome). Lore de référence : `docs/LORE.md` + ce fichier. En cas de doute : **ne pas deviner, proposer.**

## Règles qui s'appliquent (identiques au Chapitre I)
- Tout texte existe en FR et EN. **Aucun mot d'annonce à l'écran** (« Parfait ! », « Paré », « Esquivé », « Touché », « Contré », « Un reflet ! », « Trop tard », « FRAPPE ! », « TIENS ! », « Coup de grâce »…). Seules les onomatopées et les titres de phase s'affichent. Les phrases descriptives servent au lecteur d'écran.
- Ce qui se déduit du combat reste déduit : pas de texte qui explique l'image.
- Nom de la série : **Lumenbell**. « Ember Bridge · Chapitre II » disparaît ; le menu dit « Chapitre II · Silent Bells ».
- Le Veilleur ne parle pas ; sa lanterne s'appelle « sceptre-lanterne » / « lanterne », jamais « bâton ».
- Féminin de Veilleur : **Veilleure**.

## Histoire du chapitre
Le Veilleur gagne tous les combats et perd quand même la tour : la mer garde ce qu'elle prend.
- Intro : la tour est muette ; on dit que sa gardienne veille encore.
- Phase I (la Voix Creuse) : la gardienne est tombée avant lui, corrompue ; il n'en reste qu'un reflet. Quand le miroir qui lui tient lieu de visage explose, **une lanterne de Veilleur tombe dans l'eau, flamme turquoise, et coule en pulsant**.
- Phase II (le Roi de Rouille) : le Lié de la tour, jamais rescellé. Il porte sur la tête la cloche du Phare. **Une ancre géante est dans la cale avant son arrivée ; il la saisit pour combattre.**
- Phase III (le Phare Noyé, deux formes) : un parasite de l'Umbryn, la Sans-Fond, bâtit la tour avec le corps du Roi. Forme I : la tour ; forme II : la méduse à découvert (la tour éclate). À la fin, la cloche gît dans les décombres.
- La lueur turquoise est le reste de Lumen de la gardienne, teinté par la mer ; jamais expliqué.

## Pièces du Roi → pièces de la tour (phase III)
Le Roi peut être redessiné pour être plus esthétique, mais chaque pièce doit servir à la tour.

| Pièce du Roi (phase II) | Rôle dans la tour (phase III) |
|---|---|
| Cloche de tête | Lanterne du sommet, la méduse brille dedans ; elle tombe quand la tour éclate |
| Cloches du torse | Étages de la tour |
| Épaules | Balcons |
| Bras | Arcs-boutants |
| Ancre | Plantée au pied de la tour, elle l'amarre |
| Chaînes | Amarres vers les récifs |

## La cloche
La cloche de tête du Roi est la cloche du Phare. Signes anguleux sur le bord (écriture ancienne inventée, dessinée une seule fois et réutilisée) ; le mot **Couronne** (EN : **Crown**) est gravé en clair au centre, visible en gros plan dans l'outro. Le joueur peut croire que c'est lié à la tête du Roi : fausse piste voulue.

## Mécaniques
- Phase I : esquiver sans mordre aux faux reflets. Phase II : parer. Phase III : rester appuyé pour faire barrage, toucher pour la foudre et les pics.
- La riposte vient d'une **série réussie** (règle du Chapitre I), sans fenêtre « FRAPPE ! ». La contre-attaque avec jauge de fatigue (chaque attaque du boss la fait monter, point faible dévoilé, contre-attaque automatique) est **réservée à un chapitre suivant** : à ne pas implémenter, à ne pas supprimer des idées.
- Difficultés : mêmes valeurs que le Chapitre I pour le Veilleur (PV 6/4/3, Épreuve 4 PV, fenêtres de parade ×2 / ×1 / ×0,6). PV des boss à ajuster après tests.

## Textes validés (français ; l'anglais est à écrire dans le même esprit)
**Intro** : 1. « Sur la côte, la brume ne se lève plus. » 2. « Au large, le Phare Noyé se dresse, éteint. Aucune cloche ne lui répond. » 3. « Les navires ne reviennent plus. Les pêcheurs disent que la mer garde ce qu'elle prend. » 4. « On dit que sa gardienne veille encore là-haut. » 5. Titre : « Chapitre II · Silent Bells ».

**Phase I · La salle des reflets** (boss : la Voix Creuse) : entrée « Au pied du Phare, l'eau est un miroir. Une voix y répond au Veilleur. » ; fin « Le miroir vole en éclats. Sous la salle, une trappe s'ouvre sur la cale d'une épave. »

**Phase II · La cale** (boss : le Roi de Rouille) : entrée « Des cloches rouillées pendent aux poutres de la cale. Une ancre traîne, trop lourde pour une main d'homme. » ; fin « Le Roi sombre sous les vagues. De son corps monte une lueur turquoise, vers le Phare. »

**Phase III · Les récifs** (boss : le Phare Noyé ; forme II : l'Éclaté) : entrée « Du corps du Roi, la lueur a bâti une tour. Le Phare Noyé se rallume d'une flamme qui n'est pas la sienne. » ; forme II « La tour éclate. Au milieu des débris, la méduse, à découvert. » ; fin « Dans les décombres, la cloche du Phare, fêlée et muette. »

**Outro** (6 cartons, même construction que celui du Chapitre I : `SC` avec durées + dessins) :
1. « Au matin, le Phare Noyé se dresse encore, muet. Sa cloche ne résonnera plus. »
2. Gros plan de la cloche : « Sur celle-ci, un seul mot est gravé : Couronne. »
3. « Et cette fois, la terre n'a pas cessé de trembler. » Image : la vallée et les tours du Chapitre I, fissures, une tour éteinte, les autres vacillent.
4. « Sous les vagues, une lueur turquoise pulse encore, faiblement. » Image : la mer, la base du phare, la lueur sous la surface.
5. « Loin au nord, sur la glace, une lumière pâle vacille. » (indice de la tour suivante)
6. « Chapitre III. À suivre. », titre teinté de la couleur du chapitre suivant.

À supprimer de l'ancienne version : « Le Roi n'est plus le Roi », « Fais taire le glas », « Ne crois pas ce que tu vois », « Éteins le phare », les modes d'emploi dans les cartes de phase, l'intro « étoiles / bâton », « marais des Cloches », « lac gelé », la fonderie, « les villages avaient fondu leurs cloches ».

## Code couleur par chapitre
Chapitre I : braise, orange chaud. Chapitre II : marée, turquoise. Chapitre III : givre, bleu-blanc pâle (distinct du turquoise). Le titre « à suivre » et le point de la Couronne dans le menu suivent ce code.

## La Couronne et les tours (ordre définitif)
Six tours en cercle, une au centre (la clé, le dénouement). Chaque lumière perdue fragilise le sceau et l'ancre que la Couronne représente. Trois pertes sur six. **Les pertes ne dépendent jamais de la performance** (les chapitres se rejouent à volonté).

| Ch. | Tour | Sort |
|---|---|---|
| I | Montagne | Gardée |
| II | Phare Noyé | Perdue |
| III | Givre | Perdue (carnets de la Forge) |
| IV | Racines | Au choix (le village ou la tour ; le choix se rejoue à chaque passage, le dernier fait foi) |
| V | Tour vide | Perdue |
| VI | La brèche (le Roi Sombre) | Gardée |
| VII | Le cœur | Dénouement |

La fin : les lumières ne changent que le rendu (image, ton), jamais le choix de l'issue (cloche, rayon, éclats). Idée de menu : la Couronne (six points autour d'un septième, allumés / éteints / fragiles).

## Écarts techniques constatés à l'audit (à traiter dans cet ordre)
1. `_(fr, en)` à l'envers par rapport à Ember Bridge `_(en, fr)` : **inverser avant toute fusion**.
2. Clés de sauvegarde `pn-…` et `db-…` : à passer en `lb-…` communes (langue, son, musique, intro vue, progression, records), avec migration des anciennes clés.
3. Polices Google Fonts en ligne : les intégrer comme au Chapitre I (`build/fonts.css`), supprimer les `<link>` Google.
4. Menu propre avec lien vers l'ancien artefact du Chapitre I : à remplacer par le futur menu commun.
5. Pas de crochets de test : prévoir un test de fumée (déblocage via `localStorage` `db-unl`).
