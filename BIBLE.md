# Bible du jeu – Lumenbell

Référence : si une conversation la contredit, c'est la conversation qui se trompe. Gérée par la session « 00 · Direction ». Lore détaillé : `docs/LORE.md`.

## Pitch et identité
- **Série** : *Lumenbell* est le nom du jeu et de la série. À la fin de l'intro il s'affiche en grand ; « Chapitre I – Ember Bridge » marque seulement le début du premier chapitre.
- **Chapitre I** : Ember Bridge, le Veilleur contre le Colosse de braise (*Ember Colossus*), en trois décors : le pont de pierre, la Fonderie, puis le Clocher.
- **Chapitre II** : Silent Bells (à fusionner). Dans le menu : badge verrouillé « À venir ».
- **Format** : HTML5 canvas 960 × 540, itch.io puis Android (Capacitor, `com.emberbridge.game`, nom d'app *Lumenbell*), peut-être Google Play et iOS.
- **Langues** : anglais et français, chaque texte dans les deux via `_('anglais','français')`.

## Univers et ton
- Ouverture du chapitre : « Le Colosse a atteint le pont. Derrière le Veilleur, il n'y a plus que la route des vallées. Une seule règle : ne pas reculer d'un pas. »
- Ton grave et sobre, pas d'humour. **Aucun mot d'annonce à l'écran** : seulement les onomatopées des coups et cris (BAM, CLANG, KRAAAK, GRAAAH…) et les titres de phase. Les phrases descriptives ne servent qu'au lecteur d'écran.
- Le Veilleur ne parle pas. Le Colosse rugit, il ne s'explique pas.
- **Propriété intellectuelle** : aucun nom, citation, plan fidèle, musique ou icône tirés d'une œuvre existante.
- **Épuré** : ce qui se déduit du combat doit rester déduit ; pas de texte qui explique ce que l'image montre.

## Lore de fond (validé le 26 octobre 2026)
- **Le secret** : les Veilleurs croient garder la lumière du monde ; ils gardent le monde fermé. Les tours forment la *Couronne d'ancrage* : six en cercle, une au centre.
- **Les Scellés** : sous chaque tour, un ancien Veilleur enchaîné pour tenir l'*Umbryn* fermée, puis corrompu par elle. Les Veilleurs disent « les Scellés » ; leur vrai nom, « les Liés » (*The Bound*), n'apparaît que dans des textes écrits. Le Colosse de braise est le premier.
- **Vocabulaire** : tour/flèche (*The Bound Spires*, « Flèches liées »), Scellé, Couronne d'ancrage, *Lumen* (flamme du Veilleur), cloche (le verrou).
- **La vérité n'est jamais dite** : le joueur la reconstitue par fragments (objets, lieux, détails). Un fragment par chapitre, davantage dans le premier. Aucun texte ne formule « les Scellés étaient des Veilleurs ».
- **Arc** : sept chapitres en trois actes ; seuls I et II existent. Fin choisie par la famille du dernier contre : verrouiller (cloche), briser (rayon), porter (éclats).
- **À ne pas employer** : « Gloamfall », « Mournhold », « Watchlight » comme terme.
- Noms à vérifier (TMview/INPI) avant sortie publique : Lumenbell, Ember Bridge, Umbryn, Anchor Crown, Bound Spires, Lumen.

## Le Veilleur et ses règles
- **Un seul bouton** : Espace, flèche haut, Z ou W, ou toucher l'écran. P pause, R recommencer.
- Le même bouton bloque ou esquive selon le moment : jeu de timing.
- **Le sceptre-lanterne** est son seul outil ; tous ses contres viennent de lui.
- Après un combo bloqué, orbe de lumière ; après un souffle bloqué, il fonce sur le Colosse.

## Difficultés
| Mode | PV Veilleur | PV Colosse | Fenêtres de blocage | Particularités |
|---|---|---|---|---|
| Facile | 6 | 8 | × 2 | Aides actives, jets de feu réduits |
| Normal | 4 | 10 | × 1 | Référence de l'équilibrage |
| Difficile | 3 | 14 (12 en phase III) | × 0,6 | Pas d'aide, attaques de base modifiées, rages en deux temps, souffles enchaînés |

**Épreuve du feu** : les trois phases d'affilée, 4 PV pour tout le parcours, PV conservés, une mort ramène à la phase I. Normal et Difficile.

## Le Colosse de braise
- **Silhouette** : dessinée une seule fois dans `demonBody`, partagée par les trois phases. **Validée : on ne la change pas.**
- **Équipement** : bandoulière de chaîne, épaulettes en enclume, masse à pointes rangée dans le dos, queue, crochet à chaîne à la hanche gauche.
- **Indice du crochet** : la chaîne du torse se déroule jusqu'à sa main au rythme de l'attaque (phases I et III).
- **Seconde vie (phase III)** : après la première foudre, ailes rongées et tombées, trous brûlés, fissures de braise ; à la première foudre de la seconde vie, sa corne droite se brise.
- **Rages** : Râle d'agonie, Fureur, Embrasement ; en Difficile : Fureur de braise, Danse des chaînes, Embrasement final.

## Les trois phases
| Phase | Décor | Fin de phase |
|---|---|---|
| I | Le pont de pierre | Il plonge par la brèche dans la fonderie cachée sous l'arche ; le Veilleur saute à sa poursuite |
| II | La Fonderie (puits, chaînes, lac de lave) | Le Veilleur se rattrape à une passerelle ; ravivé, le Colosse s'envole par la cheminée |
| III | Le sommet du Clocher | Scène de fin |

Textes exacts : `docs/TEXTES-CH1.md`.

## Les contres de la phase III
**Le physique se contre à la cloche, la distance avec des éclats, l'arme et le crochet avec le rayon au sol.**

| Famille | Contre du Veilleur | Attaques concernées |
|---|---|---|
| Physique | La cloche répond en écho et étourdit (1,3 s) | Griffes ; charge, piétinement, geyser ; cri (Difficile) |
| Distance | Volée d'éclats de lumière (cinq comètes) | Grêle de braise, chute de pierres, souffle de flamme, ondes d'ailes |
| Arme et crochet | Le sceptre planté : laser au sol | Marteau de guerre, combo, crochet |

Les noms affichés « marteau » alors que l'arme est une masse sont à corriger. Le nom affiché d'une attaque doit toujours correspondre à l'arme et au contre réellement utilisés.

## La scène de fin
1. Le Colosse lève sa masse. 2. La grande cloche répond et le désarme. 3. Un tir de lanterne dans chaque aile. 4. Coup final, effondrement, cloche, fondu, invitation à appuyer sur Espace. Puis l'outro (cartons) : le Colosse est une statue de pierre noire face à la cloche, les Flèches répondent, le Phare Noyé reste muet, le Veilleur part vers la côte. La musique suit la séquence.

## Direction artistique et son
- **Tout est dessiné par le code** (canvas) : pas d'image de décor ni de sprite.
- **Tout le son est synthétisé**, y compris la berceuse du chapitre III (chant formantique, vocalises sans paroles intelligibles, paroles écrites à l’écran). Seule exception : la voix du Roi Spectral (chapitre VI), un enregistrement court embarqué en base64, toujours sous-titré, modulé en jeu par LB.audio (hauteur, filtre, réverbération). Format lisible partout, iOS compris (mp3 ou m4a), fichier source suivi dans le dépôt. L’audio se met en pause en arrière-plan.
- Palette : braise chaude contre pierre sombre ; la lanterne est la seule couleur claire.
- Polices Big Shoulders Display et DM Sans (licence libre), intégrées : aucun appel à Google Fonts en version publiée.

## Réglages sensibles (ne pas toucher sans validation)
- Fenêtre de blocage du souffle de flamme : 0,2 s ; préparation du souffle phase III Normal : 0,9 s ; phase I inchangée en Normal.
- Garde en phase III : 0,333 s avec 0,06 s de grâce.
