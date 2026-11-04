# Mort en Difficile — La Voix (Chapitre II) — 2026-11-04

Classe analyse, doc seule. Aucun code du jeu modifié. Source : `tests/ch2-bot.js` (copie de test), un lancement, Difficile, `phase:1` (la Voix ; `phase:2` mène au Roi de rouille, premier lancement écarté), 20 parties « standard » (erreur de timing 0,07 s, ignore les illusions) + 20 parties `sloppy` (demandé en complément). Journal local temporaire hors dépôt : à chaque PV perdu, menace fautive, rage, délais, projectiles en vol.

## Résultat brut
- 40 parties sur 40 : mort (0 victoire), 3 coups reçus à chaque fois, mort entre 5 s et 49 s. Boss restant à la mort : 5 à 14 PV (sur 14).
- 80 coups reçus (40 par mode). Aucune touche par orbe illusoire (le bot standard ne les joue pas ; le `sloppy` non plus ne les a pas fait toucher).

## Causes des coups reçus (standard, 40 touches)
| Projectile | Rage | Touches | Dont mort | Écart à l'impact réel précédent | Remarque |
|---|---|---|---|---|---|
| Orbe réelle (Voix) | 0 | 18 | 4 | 0,37 s (10 touches < 0,5 s) | volées, 2 à 3 orbes en vol à chaque touche |
| Orbe réelle (Voix) | 1 | 4 | 2 | 0,68 à 2,7 s | 4/4 avec ≥ 2 sorts qui se recouvrent |
| Éclat (pluie) | 0 / 1 / 2 | 5 / 2 / 1 | 2 / 4 / 1 | 0,6 à 2,4 s | jamais simultané, mais cadence rapide |
| Éclat de reflet brisé (rage) | 1 / 2 | 3 / 1 | 5 (r1) | 0,35 s | suit un écho, 3/4 avec impact < 0,5 s du précédent |
| Onde de Plainte | 0 | 4 | 1 | 2,8 à 3,3 s | l'onde suit une volée ; 2/4 avec ≥ 2 projectiles en vol |
| Écho (orbe de reflet réelle) | 1 | 2 | 1 | 4,7 à 5,5 s | 3 orbes en 0,3 s, une seule réelle |

Mode `sloppy` (40 touches) : orbes réelles 28 (rage 0), éclats pluie 5, ondes 5, éclats de reflet 2. Morts : orbe 10, onde 5, pluie 4, écho 1. Même profil, plus concentré sur la rage 0.

## Chevauchements et fenêtres < 0,5 s
- Intervalle entre deux impacts réels consécutifs : 0,34 à 0,37 s dans 92 cas sur 306 (30 %) en standard. 100 % des orbes réelles qui touchent ont ≥ 2 projectiles en vol.
- Valeurs types : 0,37 s (volée d'orbes), 0,34–0,35 s (éclat de reflet brisé après écho), 0,59 s (onde puis volée, ou pluie).
- Cas de 3 sorts imbriqués (lancé au plus tard à l'impact) : 7 touches orbes en rage 0 et 4 en rage 1.
- Le bot n'a qu'un bouton : si action + récupération dépasse ~0,37 s en Difficile, la 2e orbe d'une volée est inesquivable après avoir paré la 1re. **Non vérifié** : la durée d'action/récupération en Difficile n'a pas été lue (périmètre de lecture).

## Complément : sensibilité à la précision (2e lancement, 20 parties par ligne, Difficile, m = 0,6)
| Erreur de timing du bot | Morts | Coups reçus (moy.) | Temps moyen |
|---|---|---|---|
| 0,03 s | 1 / 20 | 0,6 | 74,5 s (19 parties vont au bout du délai de 400 s, le bot n'attaquant pas le boss) |
| 0,07 s (1er lancement) | 20 / 20 | 3 | 5 à 49 s |
| 0,10 s | 20 / 20 | 3 | 19,1 s |

Lecture : avec 0,03 s d'erreur le bot survit presque toujours ; à 0,07 s il meurt à chaque partie. La mort vient donc de la précision demandée (visée à 0,075 s avant l'impact, milieu de la fenêtre), pas d'une séquence impossible. Combiné aux écarts de 0,35–0,37 s ci-dessus, une erreur de 70 ms sur une orbe décale aussi la suivante, d'où les 3 coups rapides. Cela renforce les hypothèses 1 et 2 ; les ondes et la pluie ne sont pas prioritaires. La largeur de la fenêtre n'est pas lue dans le code, seulement déduite du `m` = 0,6 et de la visée.

## Hypothèses de correction (à valider, pas de code)
1. Écart minimal entre deux impacts réels ≥ action + récupération + marge dans `P2` (volées : `.44*f`) en Difficile, via la table de timing existante (`SP`, `RAIN`, `DG`), pas en dur.
2. Écho et éclats de reflet brisé : espacer `E.break1/break2` pour passer de 0,35 s à ≥ 0,5 s.
3. Séquences `{wail(); volley(...)}` et `{echoR(); wail()}` : ajouter une pause entre le dernier impact et le suivant (0,59 s observé).
4. Pluie d'éclats (`RAIN.hard`) : 8 touches, donc cadence à vérifier avant d'y toucher.

## Limites
- Un seul lancement, graines fixes ; le bot est un joueur à un bouton sans lecture des illusions : la mort « en 3 coups » est plus sévère que pour un joueur réel.
- Le nom du sort n'est pas journalisé : il est déduit du type de projectile et des écarts (volée, écho, onde, pluie).
- Décisions à valider : lesquelles des hypothèses 1 à 4 retenir, et si un test avec un bot plus humain est utile.
