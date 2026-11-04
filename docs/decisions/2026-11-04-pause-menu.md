# 2026-11-04 · `fix/ui-pause-gate-help` : pause, « Menu » direct

Remplace, dans le point « Pause » du 2 novembre, le sous-choix « Menu du chapitre » / « Chapitres ». Aucun nouveau texte (« Quitter le combat ? », « Le combat en cours sera perdu. », Quitter / Rester existaient déjà).

## Règle
1. Carte de pause inchangée : Reprendre / Menu.
2. « Menu » ouvre directement la confirmation « Quitter le combat ? » (Quitter / Rester, Rester focalisé). Plus d'écran intermédiaire.
3. « Quitter » : menu du chapitre (sans « Reprendre »). « Rester » : retour à la carte de pause.
4. Échap / P = Reprendre, ou Rester sur la confirmation ; Entrée / Espace comme avant.
5. Supprimés : boutons « Menu du chapitre » et « Chapitres » de la pause, vue `choices`. `LB.toHub` et `LB.fromHub` restent (menu du chapitre, carte de fin).

## Mise en œuvre
`LB.pause` (`shared/js/28-ui.js`) : vues `main` et `confirm`.
