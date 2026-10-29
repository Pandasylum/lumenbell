Lumenbell · Changements à faire (chapitres I et II)

Version du 29 octobre 2026 · Kevin

À l'attention de Claude. Ce document liste les modifications validées à appliquer au jeu existant. Lire d'abord BIBLE.md et le document `docs/LORE.md`. Ne rien appliquer qui ne soit pas ici : les questions encore ouvertes sont dans Lumenbell · À valider et ne doivent pas être implémentées. En cas de doute : ne pas deviner, proposer.

Suivi

Ce document évolue à chaque mise à jour du lore. Chaque section ci-dessous a un statut. Claude met à jour le statut après avoir appliqué une section (date et lien de la PR). Une section entièrement appliquée et fusionnée est déplacée en bas du document, dans « Appliqué », pour le garder court. Une nouvelle décision qui touche l'existant devient une nouvelle section (lettre suivante, avec la date).

Section	Sujet	Statut	Date	PR
A	Chapitre II · Textes et titre de la forme II	À faire	28 octobre 2026 (mis à jour le 29)	
B	Boss de la phase II : l'Ancien de Rouille	À faire	28 octobre 2026	
C	Chapitre II · Lumière du boss et de la Sans-Fond	À faire	28 octobre 2026 (mis à jour le 29)	
D	Chapitre I · « Drowned Lighthouse » et genou de fin de phase I	À faire	28 octobre 2026 (mis à jour le 29)	
E	Veilleur · Couleur de la lanterne et des tirs	À faire (validation à l'écran d'abord)	28 octobre 2026	
F	Documents à mettre à jour	À faire	28 octobre 2026 (mis à jour le 29)	
G	Chapitre I · Lanterne du Colosse de braise	À faire	29 octobre 2026	
H	Chapitre II · Rémanence (évaporation du Lumen)	À faire	29 octobre 2026	
I	Chapitre II · Pleurs avant la Voix	À tenter	29 octobre 2026	

Statuts possibles : À faire, En cours, Fait (PR fusionnée), Annulé (avec la raison).

0. Règles d'application
Tout texte existe en anglais et en français, via _('anglais','français'). Aucun mot d'annonce à l'écran ; seuls les onomatopées et les titres de phase s'affichent ; les phrases descriptives servent au lecteur d'écran.
Ne pas toucher aux valeurs d'équilibrage, aux timings, ni à la silhouette du Colosse (validée).
Les noms de code (variables, fonctions, clés) peuvent rester ; seuls les textes affichés et les noms de boss affichés changent.
Les traductions anglaises ont été validées par Kevin (29 octobre), sauf le nom anglais de la Sans-Fond, encore à choisir (voir Lumenbell · À valider, Q15).
Après modification : régénérer TEXTES.md, lancer tests/ch2-texts.js et les autres tests du chapitre, vérifier visuellement les cartons (durées de lecture : 6 à 7 s pour l'intro, environ 4 s pour l'outro).
Faire une branche et une PR par ensemble cohérent (textes, lumière, couleur du Veilleur, documents).
Après chaque section appliquée : mettre à jour le tableau « Suivi », puis ajouter une ligne dans DECISIONS.md si une décision a été prise en cours de route.
A. Chapitre II · Textes

Remplacer les textes suivants (français validé par Kevin ; « Phare » prend sa majuscule partout ; « le navire » est masculin).

Où	Ancien texte	Nouveau texte FR	Nouveau texte EN
Phase I, entrée	« Au pied du Phare, l'eau est un miroir. Une voix y répond au Veilleur. »	« Une étrange pesanteur enveloppe le pied du Phare. Des sonorités cristallines résonnent dans l'immensité. Parmi ces échos suspendus, une voix flotte dans l'air, empreinte d'une profonde tristesse. »	"A strange heaviness settles over the foot of the Lighthouse. Crystalline sounds ring out across the vastness. Among these suspended echoes, a voice drifts through the air, steeped in deep sorrow."
Phase I, fin	« L'espace d'un instant, la lanterne du Veilleur faiblit. »	« La Voix s'éteint dans un dernier murmure, familier au Veilleur. »	"The Voice fades in a last murmur, familiar to the Watcher."
Phase II, entrée	« Sous le Phare, la coque d'un navire échoué. Elle sent le fer et le sel. »	« Sous le Phare, la coque d'un navire échoué. Le fer rongé par le sel semble reposer ici depuis des siècles. »	"Beneath the Lighthouse, the hull of a stranded ship. The iron, eaten away by salt, seems to have lain here for centuries."
Phase II, fin	« La coque s'effondre autour du Roi. Pour la première fois, la lune se reflète sur son corps de métal. »	« Le navire s'effondre autour de l'Ancien. La lune se reflète sur son armure, mais rien ne répond à sa lumière. »	"The ship collapses around the Elder. The moon gleams on his armor, but nothing answers his light."
Phase III, entrée	« La mer s'est retirée. Les navires qu'elle a pris dorment sur le récif. »	« La mer s'est retirée. Les navires qu'elle a pris dorment sur le récif, leurs carcasses livrées à une présence qui ne connaît ni repos ni oubli. »	"The sea has drawn back. The ships it took sleep on the reef, their wrecks given over to a presence that knows neither rest nor forgetting."
Phase III, fin	« Dans les décombres, la cloche du Phare, fêlée et muette. »	« Dans les décombres gît la cloche du Phare, fêlée et muette. »	"In the wreckage lies the Lighthouse's bell, cracked and silent."

Notes :

Phase I, fin : seule la phrase change. L'animation de la lanterne du Veilleur qui faiblit (CINE_P1.dim) et la lanterne turquoise qui coule restent telles quelles : c'est montré, ce n'est plus écrit. La phrase est volontairement ouverte : le passé du héros reste inconnu.
Phase II, fin : « l'Ancien » (FR) et « the Elder » (EN) sont les noms courts du boss de la phase II (voir B). Le sens de « rien ne répond à sa lumière » est volontairement ambigu (la lune, la lueur turquoise, la cloche) : il dit qu'il n'y a plus de présence vivante dans l'armure. Ne pas le préciser.
Phase III, fin : le verbe « gît » sous-entend que tout le monde a perdu à cet endroit. Ne pas le remplacer.
Phase III, forme II : supprimer le carton. Le Chapitre I n'a aucun carton quand le Colosse récupère sa vie en phase III ; le Chapitre II doit être cohérent. Retirer du changement de forme tout texte affiché, y compris « La tour éclate. Au milieu des débris, la méduse, à découvert. ». La cinématique de changement de forme et les effets restent inchangés. Le titre de la forme II devient « La Sans-Fond » (il remplace « L'Éclaté » / « The Shattered ») ; EN proposé : « The Bottomless » (nom anglais à confirmer, voir « À valider », Q15). Si une phrase de lecteur d'écran existe déjà pour ce moment, la garder telle quelle (elle ne doit rien ajouter à l'écran).
Ne pas ajouter de texte pour dire que la créature « emprunte une forme » : cela se déduit (voir C).
Intro et outro du Chapitre II : aucun changement de texte.
B. Chapitre II · Le boss de la phase II devient l'Ancien de Rouille

« Roi de Rouille » (The Rust King) est renommé « l'Ancien de Rouille ». « Sonneur de Rouille » n'a jamais été employé : ne pas l'introduire. « Ancien » est un indice : il nomme un ancien Veilleur.

Nom du boss affiché (carte d'entrée de phase II, titre de phase, lecteur d'écran, frise, TEXTES.md) : FR « L'Ancien de Rouille ». EN : « The Rust Elder ».
Dans tout texte affiché ou lu qui dit « le Roi » / « the King » à propos de ce boss : « l'Ancien » / « the Elder ».
Mettre à jour les tests qui lisent ces textes (tests/ch2-texts.js, tests/ch2-announce.js) et docs/CH2-SPEC.md.
Ne pas toucher au Roi Sombre (chapitre VI, pas encore dans le jeu).
C. Chapitre II · Lumière du boss et de la Sans-Fond

Principe (validé) : la lumière vivante pulse, la lumière copiée ne pulse pas. La Sans-Fond a mangé le Lumen de la lanterne de l'Ancien et en porte la couleur turquoise ; cette lueur est une copie : fixe, sans pulsation. Le joueur le lit sans texte.

Cœur de l'Ancien de Rouille : lueur turquoise fixe, sans pulsation, dès le début de la phase II, visible aussi par les jointures de l'armure. Ce n'est pas la lumière de l'ancien Veilleur : c'est la Sans-Fond qui l'habite. Remplacer toute lueur ambre-rouge du cœur par cette lueur turquoise fixe. Ne pas changer la lumière de la cloche de tête sans nouvelle consigne.
Fin de la phase II : le sol tient, le navire s'effondre, le plafond s'ouvre, la lune éclaire l'armure, l'Ancien s'agenouille sous le cône de lumière. La lueur turquoise du cœur reste visible, fixe. Rien ne répond.
Phase III : toutes les lueurs turquoises de la Sans-Fond (lanterne du sommet de la tour, méduse de la forme II) sont fixes, sans pulsation. Seule la lanterne de la gardienne (phase I) pulse. Si une lueur turquoise de la Sans-Fond pulse aujourd'hui, la rendre fixe.
Phase I : ne rien changer à la lanterne de la gardienne (elle pulse en coulant) ni au halo dans le miroir.
D. Chapitre I · « Drowned Lighthouse » et genou de fin de phase I

Le nom anglais du Phare Noyé est toujours « the Drowned Lighthouse », jamais « Beacon » : beacon désigne déjà le fanal du Clocher au Chapitre I.

Corriger les deux lignes du Chapitre I (numéros de ligne d'après l'extrait TEXTES-CH1.md, à vérifier dans le code) :

src/js/80-cine-outro.js (ligne 12, carton 4 de l'outro) : « Every bell answered. Every one but one. Far out at sea, the Drowned Beacon stayed silent… » → remplacer « Drowned Beacon » par « Drowned Lighthouse ».
src/js/44-p3-belfry-logic.js (ligne 468, scène de fin) : « Far out at sea, the Drowned Beacon stays silent. End of Chapter I. » → idem.

Chercher aussi toute autre occurrence de « Drowned Beacon » dans le dépôt (texte affiché, lecteur d'écran, TEXTES.md). Ne pas toucher aux « beacon » qui désignent le fanal du Clocher.

Genou à terre : garder l'outro (carton 1 : le Colosse s'incline de lui-même face à la cloche avant d'être figé). Retirer en revanche « à genoux » et « plie un genou » des textes de fin de phase I (lecteur d'écran ; ancienne carte, 08-state.js ligne 84) : le genou est réservé à l'outro. Reprendre la formulation de la carte actuelle de fin de phase I (08-state.js, ligne 87) ; en cas de doute, proposer. Interprétation de la réponse « garder celui de l'outro » : à confirmer en relisant la PR.

E. Le Veilleur (commun) · Couleur de la lanterne et des tirs

Décision : le Veilleur a un jaune neutre ; quand il tire, le jaune vire vers le jaune-blanc (et non plus vers le bleu-blanc, pour ne pas confondre avec le givre du chapitre IV). Le rendu est à valider à l'écran (le jaune-blanc est plus cohérent mais peut être moins beau).

À faire :

Relever la couleur actuelle de la lanterne et des tirs (éclats, rayon, foudre contre le Colosse) dans les deux chapitres.
Produire une comparaison en images (avant / jaune neutre + tirs jaune-blanc), sur une scène de chaque chapitre, et la joindre à la PR.
Ne pas changer sans cette validation visuelle. Les valeurs de jeu ne bougent pas.
Rester dans l'esprit de la bible : la lanterne est la seule couleur claire de l'écran ; le Veilleur dessiné une seule fois, partagé.
F. Documents à mettre à jour
docs/LORE.md : remplacer par l'export Markdown du document Lumenbell · Lore définitif.
docs/CH2-SPEC.md :
Histoire du chapitre, pièces, mécaniques, sorts : « Roi de Rouille » → « Ancien de Rouille » ; « Pièces du Roi » → « Pièces de l'Ancien ».
Histoire, phase II : le cœur de l'Ancien brille d'une lueur turquoise fixe dès la phase II, visible aussi par les jointures (c'est la Sans-Fond) ; cette lueur est une copie (fixe) ; la lanterne de la gardienne est le Lumen vivant (elle pulse). Garder la phrase sur la lanterne turquoise de la gardienne. Phase III : forme II titrée « La Sans-Fond » (remplace « L'Éclaté »).
Textes validés (FR et EN) : remplacer par le § A ; supprimer le texte de la forme II ; remplacer le texte de fin de phase III.
« La Couronne et les tours » : remplacer le tableau par l'ordre et les sorts du document Lore définitif § 8 (III Racines gardée ; IV Givre perdue ; V Tour vide perdue ; VI La brèche, choix sceller ou sacrifier ; VII Le cœur). Retirer « Trois pertes sur six » et « au choix (le village ou la tour) » du chapitre III.
« Révisions du 28 octobre » : garder « la lueur turquoise de son cœur se voit » et préciser : dès le début de la phase II, fixe, aussi visible par les jointures.
Code couleur par chapitre : ajouter III vert mousse tirant sur le jaune ; IV bleu-blanc pâle ; V gris argenté ; VI violet profond ; VII blanc ; héros jaune neutre.
Vocabulaire : « Phase II : parer » → « bloquer » (déjà acté le 28 octobre), au passage.
BIBLE.md (gérée par la session « 00 · Direction » : proposer ces lignes plutôt que les écrire sans validation) :
Ajouter le principe directeur : le jeu se comprend par l'image et la voix, le texte est un renfort.
Remplacer « un fragment par chapitre » par « un fragment principal par chapitre ».
Ajouter : le Lumen est blanc, chaque tour a sa teinte, le héros a un jaune neutre.
Noms : Lumenbell validé ; les autres noms sont des noms communs, risque jugé faible.
Nom anglais du Phare Noyé : Drowned Lighthouse.
DECISIONS.md : ajouter l'entrée ci-dessous.
## 2026-10-28 – Lore : consolidation et changements des chapitres I et II (Kevin)
- Documents de lore : Lore définitif, Changements à faire, À valider.
- Principe directeur : le jeu se comprend par l'image et la voix ; le texte est un renfort ; si ça peut être montré, ça l'est.
- Chapitre II : le boss de la phase II devient l'Ancien de Rouille ; nouveaux textes (phases I, II, III) ; pas de carton au changement de forme (cohérence avec le Chapitre I) ; cœur turquoise fixe (la Sans-Fond) dès la phase II ; seule la lanterne de la gardienne pulse.
- Chapitre I : « Drowned Beacon » → « Drowned Lighthouse » (EN, 2 occurrences).
- Veilleur : jaune neutre, tirs vers le jaune-blanc, à valider à l'écran.
- Ordre des tours : I gardée, II perdue, III gardée, IV perdue, V perdue, VI choix (sceller ou sacrifier), VII dénouement.
## 2026-10-29 – Lore : transformation, Rémanence, lanterne du Colosse (Kevin)
- Transformation = corruption par le murmure de l'Umbryn ; les cloches la repoussent et détruisent les parasites ; le parasite est un intermédiaire physique qui mange le Lumen.
- Chapitre II : cœur turquoise fixe dès la phase II ; forme II titrée « La Sans-Fond » ; Rémanence (évaporation du Lumen) à la fin de la phase III ; pleurs avant la Voix à tenter.
- Chapitre I : lanterne orange faible et pulsante à côté des chaînes en fin de phase II.
- Genou : on garde celui de l'outro ; fin de phase I sans « à genoux ».
- Traductions anglaises du chapitre II validées.
G. Chapitre I · Lanterne du Colosse de braise (validé le 29 octobre)
Ajouter une petite lanterne de Veilleur dans le décor de la Fonderie, à côté des chaînes, visible en fin de phase II.
Lueur orange (code couleur de la braise), faible, avec une pulsation lente : le Lumen vivant pulse. Elle est allumée : le Colosse n'est pas totalement consumé.
Elle n'apparaît pas dans l'outro. Ce sont de simples indices : pas de texte, pas de bruitage, pas de zoom.
Laisser l'image de la cinématique de fin de phase II à peine plus longue (environ 1 s), pour laisser le temps de la comprendre.
Emplacement exact et forme : à choisir (près des équerres et des chaînes, lisible sur la cinématique) et à signaler dans la PR.
Ne pas toucher à la silhouette du Colosse (validée) : la lanterne est un élément de décor, pas de son équipement.
H. Chapitre II · Rémanence : évaporation du Lumen (validé le 29 octobre)
À la mort de la Sans-Fond (animation de fin de la phase III), la lueur turquoise s'évapore : c'est la Rémanence.
Elle ne retourne pas dans une lanterne (la lanterne de l'Ancien reste éteinte).
Destination précise (« état principal ») à définir : voir Lumenbell · À valider, Q23. En attendant : la lueur s'élève lentement et s'efface, sans texte ni bruitage ajouté.
L'évaporation accompagne ou précède l'image de la cloche fêlée (ordre à ajuster).
I. Chapitre II · Pleurs avant la Voix (à tenter)
Avant l'apparition de la Voix Creuse (phase I), ajouter un pleur étouffé dans le son. Tout le son est synthétisé : pas de fichier audio.
Sobre et bref, sans texte : il porte la « profonde tristesse » que le texte d'entrée annonce sans la répéter à l'écran.
À essayer : proposer deux variantes si possible ; Kevin choisit à l'écoute. Si l'essai ne convainc pas, le retirer.
Vérifications
Chercher dans tout le dépôt les textes affichés qui disent « Roi de Rouille », « Rust King », « le Roi », « the King » à propos du boss de la phase II.
Chercher « Drowned Beacon ».
Vérifier qu'aucun mot d'annonce n'a été ajouté (tests/ch2-announce.js).
Vérifier visuellement : cœur turquoise fixe visible par les jointures (phase II), lanterne orange du Colosse près des chaînes (chapitre I, fin de phase II), absence de pulsation sur les lueurs de la Sans-Fond, absence de carton à la forme II, durées de lecture des nouveaux cartons.
À ne pas faire
Ne pas ajouter d'indice de parasite au chapitre I : la lanterne du Colosse (section G) suffit.
Ne pas implémenter le choix du chapitre VI, ni les chapitres III à VII.
Ne pas introduire « Sonneur » comme nom de boss.
Ne pas changer les timings, valeurs d'équilibrage ou la silhouette du Colosse.
Appliqué

Aucune section pour l'instant. Quand une section est faite et fusionnée, la déplacer ici avec sa date et sa PR.
