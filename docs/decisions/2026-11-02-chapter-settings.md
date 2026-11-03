### 2026-11-02 — menu/chapter-settings : roue de réglages et pause

Décision de Kevin (2 novembre). Périmètre : `shared/js/28-ui.js` et les menus des deux chapitres. Aucun timing ni gameplay ne change.

**Roue de réglages (menu des chapitres).** Même panneau et même style que le hub (classes `hset`, `hsbox`, `hsrow`, mesures `LB.SET_T`), aux couleurs du chapitre. Lignes dans `LB.SETTINGS_T` (même format que `SETTINGS_T` du hub) : Musique (`lb-mus`), Bruitages (`lb-snd`), Aide visuelle (`lb-help`). Pas de « Réinitialiser » ni de mouvement réduit (hub seulement). Elle remplace les cases Son, Musique et Aide du menu. Règles de l'aide inchangées : activable en Facile, Normal et Difficile ; désactivée et affichée Off en Épreuve sans toucher à `lb-help` ; proposée à la 3ᵉ défaite en Facile (`LB.help`).

**Pause.** La carte garde Reprendre et Menu. « Menu » ouvre deux choix sous Reprendre : « Menu du chapitre » et « Chapitres » (seulement si `LB.fromHub`, via `LB.toHub`). Chaque choix demande une confirmation (la même en Épreuve) : le combat en pause est perdu, y compris vers le menu du chapitre (ouvert sans « Reprendre »). Échap, P, Entrée et Espace comme avant (Échap / P = Reprendre, ou Rester sur la confirmation) ; un seul bouton est focalisé à la fois (Rester par défaut sur la confirmation).

**Textes (FR / EN)**
- Réglages : Musique / Music ; Bruitages / Sound effects ; Aide visuelle / Visual help (titre et fermeture du panneau, repris du hub : Réglages / Settings, Fermer / Close).
- Choix : Menu du chapitre / Chapter menu ; Chapitres / Chapters.
- Confirmation : « Quitter le combat ? » / "Leave the fight?" ; « Le combat en cours sera perdu. » / "The current fight will be lost." ; boutons Quitter / Leave, Rester / Stay.
- Aucun mot d'annonce à l'écran.
- **Roue aussi en jeu (2 novembre 2026)** : la même roue et le même panneau, dans les deux chapitres (une seule implémentation, `LB.settings.attach`). Portrait : en haut à droite, à droite de MENU, mêmes bords haut et bas ; paysage bas : à droite de Pause et Réessayer, même ligne. L'ouvrir met la partie en pause (comme la touche P, sans effet déjà en pause) ; la fermer ne reprend pas : la carte de pause reste. Placement dans `LB.MENU_T.gameGear`. L'aide reste verrouillée en Épreuve.
