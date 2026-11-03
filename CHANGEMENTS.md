Lumenbell · Changements à faire (chapitres I et II)

Version du 30 octobre 2026 · Kevin

À l'attention de Claude. Ce document liste les modifications validées à faire dans le jeu existant. Lire d'abord BIBLE.md et le document `docs/LORE.md`. Ne rien appliquer qui ne soit pas ici : les questions encore ouvertes sont dans Lumenbell · À valider et ne doivent pas être implémentées. En cas de doute : ne pas deviner, proposer.

Suivi

Ce document évolue à chaque mise à jour du lore. Chaque section ci-dessous a un statut. Claude met à jour le statut après avoir appliqué une section (date et lien de la PR). Une section entièrement appliquée et fusionnée est déplacée en bas du document, dans « Appliqué », pour le garder court. Une nouvelle décision qui touche l'existant devient une nouvelle section (lettre suivante, avec la date).

Section	Sujet	Statut	Date	PR
D	Chapitre I · « Drowned Lighthouse » et genou de fin de phase I	Fait (PR fusionnée)	28 octobre 2026 (mis à jour le 29)	https://github.com/Pandasylum/lumenbell/pull/31
F	Documents à mettre à jour	En cours (CH2-SPEC et COMMUN faits ; BIBLE, DECISIONS, LORE restent)	30 octobre 2026	https://github.com/Pandasylum/lumenbell/pull/19
G	Chapitre I · Lanterne du Colosse de braise	Fait (PR fusionnée)	29 octobre 2026	https://github.com/Pandasylum/lumenbell/pull/31
I	Chapitre II · Pleurs avant la Voix	À tenter	29 octobre 2026	
J	Chapitre II · Validations du 30 octobre (bouton « Bloquer », illusions, carte de défaite)	En cours : (a) et (b) fusionnés ; (c) en attente des textes	30 octobre 2026	branche `ch2/lore-changements` (a et b fusionnés)

K	Chapitre I · Phase II au fond de la Fonderie (plus de chute)	Fait (PR fusionnée)	1er novembre 2026	https://github.com/Pandasylum/lumenbell/pull/31
L	Chapitre I · Fausse fin de Facile supprimée	Fait (PR fusionnée)	1er novembre 2026	https://github.com/Pandasylum/lumenbell/pull/31

M	Chapitre II · Phare Noyé : tour d'avant C1	À faire (validation à l'écran d'abord)	1er novembre 2026	
N	Chapitre I · Phase II : esquive en pas de côté, contres au sol	Fait (PR fusionnée)	1er novembre 2026	https://github.com/Pandasylum/lumenbell/pull/36

Statuts possibles : À faire, En cours, Fait (PR fusionnée), Annulé (avec la raison).

0. Règles d'application
Tout texte existe en anglais et en français, via _('anglais','français'). Aucun mot d'annonce à l'écran ; seuls les onomatopées et les titres de phase s'affichent ; les phrases descriptives servent au lecteur d'écran.
Ne pas toucher aux valeurs d'équilibrage, aux timings, ni à la silhouette du Colosse (validée).
Les noms de code (variables, fonctions, clés) peuvent rester ; seuls les textes affichés et les noms de boss affichés changent.
Les traductions anglaises ont été validées par Kevin (29 octobre).
Après modification : régénérer TEXTES.md, lancer tests/ch2-texts.js et les autres tests du chapitre, vérifier visuellement les cartons (durées de lecture : 6 à 7 s pour l'intro, environ 4 s pour l'outro).
Faire une branche et une PR par ensemble cohérent (textes, lumière, couleur du Veilleur, documents).
Après chaque section appliquée : mettre à jour le tableau « Suivi », puis ajouter une ligne dans DECISIONS.md si une décision a été prise en cours de route.
D. Chapitre I · « Drowned Lighthouse » et genou de fin de phase I

Le nom anglais du Phare Noyé est toujours « the Drowned Lighthouse », jamais « Beacon » : beacon désigne déjà le fanal du Clocher au Chapitre I.

Corriger les deux lignes du Chapitre I (numéros de ligne d'après l'extrait TEXTES-CH1.md, à vérifier dans le code) :

src/js/80-cine-outro.js (ligne 12, carton 4 de l'outro) : « Every bell answered. Every one but one. Far out at sea, the Drowned Beacon stayed silent… » → remplacer « Drowned Beacon » par « Drowned Lighthouse ».
src/js/44-p3-belfry-logic.js (ligne 468, scène de fin) : « Far out at sea, the Drowned Beacon stays silent. End of Chapter I. » → idem.

Chercher aussi toute autre occurrence de « Drowned Beacon » dans le dépôt (texte affiché, lecteur d'écran, TEXTES.md). Ne pas toucher aux « beacon » qui désignent le fanal du Clocher.

Genou à terre : garder l'outro (carton 1 : le Colosse s'incline de lui-même face à la cloche avant d'être figé). Retirer en revanche « à genoux » et « plie un genou » des textes de fin de phase I (lecteur d'écran ; ancienne carte, 08-state.js ligne 84) : le genou est réservé à l'outro. Reprendre la formulation de la carte actuelle de fin de phase I (08-state.js, ligne 87) ; en cas de doute, proposer. Interprétation de la réponse « garder celui de l'outro » : à confirmer en relisant la PR.

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
DECISIONS.md : ajouter l'entrée ci-dessous. **Couvert** : renvoi au journal du lore, décision du 30 octobre (`docs/decisions/2026-10-30-decisions-lore-renvoi.md`) ; les entrées 28-29 octobre restent dans `docs/LORE.md` §15.
Le renommage « Roi Sombre » en « Roi Spectral » dans docs/CH2-SPEC.md (tableau des tours : « La brèche (Roi Sombre) ») et dans DECISIONS.md. La section B (« Ne pas toucher au Roi Sombre ») devient « Roi Spectral ».
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
## 2026-10-30 – Lore : chapitre VI, Doyens, héros (Kevin)
- Le Doyen de la phase I du chapitre VI est Vharos avant sa transformation (un seul personnage).
- Chapitre VI : sceller = scellé de force, tour gardée par le sceau seul, au prix d’un Lumen et d’une lanterne ; sacrifier = Lumen sauvé, tour perdue, tour centrale ébranlée (rendu de la fin seulement).
- Le héros devient le Lié principal du centre, à la place du Premier Lié : il reste sept Liés.
- Héros : Lumen affaibli, blanc teinté de jaune ; clochette : catalyseur de la lumière.
- Noms anglais : The Priors, The Spectral King.
G. Chapitre I · Lanterne du Colosse de braise (validé le 29 octobre)
Ajouter une petite lanterne de Veilleur dans le décor de la Fonderie, à côté des chaînes, visible pendant tout le combat de la phase II.
Lueur orange (code couleur de la braise), faible, avec une pulsation lente : le Lumen vivant pulse. Elle est allumée : le Colosse n'est pas totalement consumé.
Elle n'apparaît pas dans l'outro. Ce sont de simples indices : pas de texte, pas de bruitage, pas de zoom.
Emplacement exact et forme : à choisir (près des équerres et des chaînes, lisible sur la cinématique) et à signaler dans la PR.
Ne pas toucher à la silhouette du Colosse (validée) : la lanterne est un élément de décor, pas de son équipement.
I. Chapitre II · Pleurs avant la Voix (à tenter)
Avant l'apparition de la Voix Creuse (phase I), ajouter un pleur étouffé dans le son. Tout le son est synthétisé : pas de fichier audio.
Sobre et bref, sans texte : il porte la « profonde tristesse » que le texte d'entrée annonce sans la répéter à l'écran.
À essayer : proposer deux variantes si possible ; Kevin choisit à l'écoute. Si l'essai ne convainc pas, le retirer.
J. Chapitre II · Validations de Kevin du 30 octobre (voir docs/decisions/2026-10-30-ch2-validations.md)
Entrées À faire, non appliquées. Elles partent plus tard, dans la session unique du chapitre.
(a) Bouton de la phase III : « Garde » / « Guard » devient « Bloquer » / « Block » (le geste reste le blocage tenu). Libellé initial et libellés changés en cours de phase dans le code du chapitre ; lecteur d'écran : « Ta garde est brisée » / "Your guard is broken." est conservé volontairement (tranché le 30 octobre, GLOSSAIRE n° 2) : ne pas le changer. Test d'annonce : relire tests/ch2-announce.js (liste BAN, qui contient « garde brisée » / « guard broken » et ne doit pas matcher « Bloquer » / « Block »), puis régénérer TEXTES.md (node tests/ch2-texts.js --write) et relire le diff.
(b) Règle de série sur les illusions : esquiver une illusion n'est pas une faute de série. La faute n'existe que si le joueur reçoit le coup de retour, donc un dégât. Mettre à jour fooled() et la partie 4 de tests/ch2-input.js (aujourd'hui : l'illusion esquivée casse la série, même si le retour est esquivé). Ne pas toucher à DG.backTurn ni à DG.backWin (valeurs provisoires).
(c) Carte de défaite du Chapitre II : un simple texte, sur le modèle du Chapitre I. Certaines versions cachent un conseil, par exemple contre la Voix : « Le Veilleur n'a pas su distinguer les illusions… » (exemple d'intention, pas un texte validé). Textes à fournir (projet Lore) : ne rien rédiger ni coder avant de les recevoir.
Non concernés : valeurs provisoires (SP, DG.backWin, HULL, SHOCK.form), Difficile du Chapitre II, onomatopées CLANG / KRAKOOM / KRAAAK (validées, rien à changer).
K. Chapitre I · Phase II au fond de la Fonderie (plus de chute) (décision de Kevin du 1er novembre 2026, `docs/decisions/2026-11-01-ch1-foundry-floor.md`)

Le combat de la phase II se joue au fond de la Fonderie : le Veilleur suit le Colosse par la brèche et combat sur une plateforme au bord de la lave ; le Colosse vole au-dessus de la lave. Plus de chute, plus de scène de passerelle. Fin de phase II : le grand four engloutit le Colosse, qui s'envole par la cheminée. Toutes les mécaniques restent, esquive comprise. Aucun impact sur le lore.
Textes lecteur d'écran uniquement (jamais affichés), en anglais et en français.

Entrée : textes d'origine (`36-p2-foundry-logic.js`, ligne 32, 38, 133, 238, et carte de défaite).
- Avant (EN, ligne 32) : "Arena: … fall down the Foundry shaft"
- Avant (FR, ligne 32) : « …tombent dans le puits de la Fonderie »
- Avant (EN, ligne 38) : "Phase II. The Watcher and the Colossus fall into the Foundry…"
- Avant (FR, ligne 38) : « Phase II. Le Veilleur et le Colosse tombent dans la Fonderie… »
- Avant (EN, ligne 133) : "You are swept away by the fall. Defeat."
- Avant (FR, ligne 133) : « Tu es emporté par la chute. Défaite. »
- Avant (EN, ligne 238, passerelle) : "The Watcher catches himself on a catwalk, above the molten metal."
- Avant (FR, ligne 238, passerelle) : « Le Veilleur se rattrape sur une passerelle, au-dessus du métal en fusion. »
- Avant (EN, carte de défaite) : "Swept away by the fall." / "Nothing holds the Watcher anymore. He vanishes into the depths of the Foundry, and his light goes out with him."
- Avant (FR, carte de défaite) : « Emporté par la chute. » / « Rien ne retient plus le Veilleur. Il disparaît dans les profondeurs de la Fonderie, et sa lumière s'éteint avec lui. »

Après :
- Carte de défaite, titre : "Struck down at the bottom of the Foundry." / « Terrassé au fond de la Fonderie. »
- Carte de défaite, corps : "The Watcher collapses at the bottom of the Foundry, and his light goes out with him." / « Le Veilleur s'effondre au fond de la Fonderie, et sa lumière s'éteint avec lui. »
- Ligne 32 : "Arena: the Watcher and the winged Ember Colossus face each other at the bottom of the Foundry" / « Arène du combat : le Veilleur et le Colosse de braise ailé s'affrontent au fond de la Fonderie »
- Ligne 38 : "Phase II. The Foundry. The button now dodges." / « Phase II. La Fonderie. Le bouton sert maintenant à esquiver. »
- Ligne 133 : "Struck down at the bottom of the Foundry. Defeat." / « Terrassé au fond de la Fonderie. Défaite. »
- Ligne 238 (passerelle) : supprimée.
- Ne pas toucher : carte d'entrée (`00-core.js:57`), `36-p2:300` (transition), `36-p2:211`, `16-p1:319`.

Raison : plus de chute ; aucun impact sur le lore ; texte lecteur d'écran uniquement.
Statut : en cours, branche `ch1/foundry-floor` (PR à ouvrir). Lanterne visible pendant tout le combat de la phase II : voir section G.

L. Chapitre I · Fausse fin de Facile supprimée (décision de Kevin du 1er novembre 2026, `docs/decisions/2026-11-01-idees-validees.md` § b)

Décision : la fausse fin disparaît. La vraie fin s'affiche dans toutes les difficultés, Facile compris. Raison : Facile ne doit pas bloquer la suite (la vraie fin déverrouille l'Épreuve du feu et le Chapitre II).

Entrée : fin de partie en mode `fake` (`R.mode`), code dans `src/js/44-p3-belfry-logic.js` lignes 318 à 321. Textes repérés dans `docs/TEXTES-CH1.md` lignes 191 à 193.
- Avant (EN, ligne 320, titre d'œil) : "The End?"
- Avant (FR, ligne 320, titre d'œil) : « Fin ? »
- Avant (EN, ligne 320, titre) : "He has fled."
- Avant (FR, ligne 320, titre) : « Il s'est enfui. »
- Avant (EN, ligne 321, corps) : "The great bell rings alone in the night. Far out at sea, nothing answers. Somewhere, the Colossus's fire still burns. Replay the whole fight in Normal to discover the true ending."
- Avant (FR, ligne 321, corps) : « La grande cloche sonne seule dans la nuit. Au large, rien ne répond. Quelque part, le feu du Colosse brûle encore. Refais tout le combat en Normal pour connaître la vraie fin. »

Après :
- Ces six textes sont supprimés. Aucun texte de remplacement.
- La vraie fin s'affiche dans toutes les difficultés.

À vérifier pendant l'application (non tranché ici) :
- Le libellé « Retour au menu » / "Back to menu" (ligne 322) ne doit rester que s'il sert encore à la vraie fin.
- La logique `R.mode === 'fake'` (`44-p3-belfry-logic.js` lignes 212 et 375, `08-state.js` ligne 24, `48-p3-belfry-poses.js` lignes 122 et 356, `56-p3-belfry-render.js` ligne 540) est à retirer ou à adapter pour que la vraie fin s'affiche dans toutes les difficultés. Le comportement de chaque ligne est à relire avant le codage.

Statut : en cours, branche `ch1/foundry-floor` (PR à ouvrir). Sans effet sur les autres textes.

M. Chapitre II · Phare Noyé : sommet d'avant C1 (décision de Kevin du 1er novembre 2026, `docs/decisions/2026-11-01-idees-validees.md` § e)

Décision : le sommet de la tour (formes I et II) retrouve les deux blocs sombres encadrant la méduse, tels que dans le commit `2b75101` (27 octobre, avant C1). Ces blocs ont été supprimés par `0bad679` (PR #5).

Périmètre : sommet seulement. Le reste de la tour (pièces de l'Ancien → tour, étages, balcons, amarres) reste celui de C1.

Cible : `chapters/ch2-silent-bells/src/js/40-boss-drowned-beacon.js` (`drawBeacon`, `TOWER`, `PDRAW`).

À faire :
- Étape 1, comparaison en images (actuel / avant C1) : déjà faite par Kevin.
- Ne rien changer au-delà du sommet.

Conservés tels quels : lueurs turquoise fixes sans pulsation (section C), textes (section A), Rémanence (section H), titre de la forme II « La Sans-Fond ».
Ne pas toucher aux timings.

À ne pas faire : modifier la silhouette du Colosse, ou toucher au Chapitre I.

Statut : en cours, branche `ch2/phare-v1` (1er novembre). Comparaison faite par Kevin : les « 2 lampes en haut » sont les deux blocs sombres qui encadrent la méduse dans `2b75101`, supprimés par `0bad679`. Seul ce sommet est restauré (formes I et II) ; planche avant / après : `build/out/phare-v1/comparaison-phase3.png` (non suivie). Écart tranché par Kevin le 1er novembre : les deux blocs sont des lanternes latérales propres à la tour (phrase ajoutée sous le tableau de `docs/CH2-SPEC.md`). 2e passe : les lumières de la tour (faisceau, foudre, crépitement de charge, anneaux de la tempête) partent des deux lanternes, en formes I et II ; les deux pièces attendent sur la plage, au centre et séparées, à l'entrée du combat et servent à la construction. Planche : `build/out/phare-v2/comparaison-tirs.png` (non suivie). Détails : `chapters/ch2-silent-bells/NOTES.md`, « Lanternes latérales ».

N. Chapitre I · Phase II : esquive en pas de côté, contres au sol (décision de Kevin du 1er novembre 2026, `docs/decisions/2026-11-01-ch1-esquive-pas-de-cote.md`)

Décisions :
- L'esquive de la phase II devient le pas de côté du Chapitre II (pose `dodgeSide`, 0,38 s, image rémanente) à la place de la plongée `dodgeDown` ; le Veilleur reste sur son bloc, sans toucher le vide ni la lave.
- Contre sur la tête du Colosse : le Veilleur reste au sol ; seul le rayon s'oriente vers la tête.
- Finish (COUP ULTIME) : le Veilleur reste au sol ; seul le rayon vise.
- Estoc (contre `stab`) : déplacement dessiné raccourci (60 → 28 px, comme le Finish) pour que le Veilleur reste sur son bloc ; ni timing, ni dégâts, ni cible ne changent.

Rendu seulement : aucun timing ni réglage d'équilibrage ne change. `DG.drop` reste (rebord, défaite) ; la pose `dodgeDown` reste dans le module commun. Aucun texte affiché ne change ; aucun texte de lecteur d'écran ne décrivait un plongeon.

Referme le point « Plongée d'esquive » de `docs/decisions/2026-11-01-ch1-foundry-floor-application.md`.

Statut : en cours, branche `ch1/dodge-side` (PR à ouvrir).

Vérifications
Chercher dans tout le dépôt les textes affichés qui disent « Roi de Rouille », « Rust King », « le Roi », « the King » à propos du boss de la phase II.
Chercher « Drowned Beacon ».
Vérifier qu'aucun mot d'annonce n'a été ajouté (tests/ch2-announce.js).
Vérifier visuellement : cœur turquoise fixe visible par les jointures (phase II), lanterne orange du Colosse près des chaînes (chapitre I, pendant la phase II), absence de pulsation sur les lueurs de la Sans-Fond, absence de carton à la forme II, durées de lecture des nouveaux cartons.
À ne pas faire
Ne pas ajouter d'indice de parasite au chapitre I : la lanterne du Colosse (section G) suffit.
Ne pas implémenter le choix du chapitre VI, ni les chapitres III à VII.
Ne pas introduire « Sonneur » comme nom de boss.
Ne pas changer les timings, valeurs d'équilibrage ou la silhouette du Colosse.
Appliqué

- **A** · Chapitre II · Textes et titre de la forme II : Fait (PR fusionnée), 30 octobre 2026 (mis à jour le 29), branche `ch2/lore-changements`. Nouveaux textes d'entrée et de fin des trois phases ; plus de carton à la forme II (titre « La Sans-Fond »).
- **B** · Boss de la phase II : l'Ancien de Rouille : Fait (PR fusionnée), 28 octobre 2026, branche `ch2/lore-changements`. « Roi de Rouille » devient « l'Ancien de Rouille » (EN « The Rust Elder »).
- **C** · Chapitre II · Lumière du boss et de la Sans-Fond : Fait (PR fusionnée), 28 octobre 2026 (mis à jour le 29), branche `ch2/lore-changements`. Cœur turquoise fixe ; lueurs de la Sans-Fond sans pulsation.
- **H** · Chapitre II · Rémanence : Fait (PR fusionnée), 30 octobre 2026, branche `ch2/lore-changements`. Évaporation du Lumen à la mort de la Sans-Fond, sans texte ni bruitage.
- **E** · Veilleur · Couleur de la lanterne et des tirs : Fait (PR fusionnée), 1er novembre 2026, branche `engine/lantern-color`. Lanterne jaune neutre, tirs jaune-blanc dans les deux chapitres.

Quand une section est faite et fusionnée, la déplacer ici avec sa date et sa PR.
