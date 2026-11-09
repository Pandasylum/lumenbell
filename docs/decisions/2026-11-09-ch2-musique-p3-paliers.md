# 2026-11-09 · Chapitre II : musique de la phase III, forme II, en deux paliers

Branche `ch2/musique-p3-paliers`. Validé à l'écoute (page d'écoute `tools/ecoute-musique-p3.html`, branche `ch2/ecoute-paliers-p3`, hors jeu) : variante A « marche de guerre », base revue.

- **Mécanisme** : palier local 0 à 2 dans `60-music.js` (`MUSIC.tier(n)`), remis à 0 par `play` et `stop`. Aucun changement de `shared/` ni du Chapitre I.
- **Palier 0** : le thème 3 actuel (forme I). **Palier 1** : naissance de la forme II ; base revue (cœur battant, grondement A / Si♭, arpège grave, cloche sourde) + tambours et cuivres graves. **Palier 2** : fin de la rage 1 de la forme II ; en plus grosse caisse, roulements, accords serrés, montée de tension.
- **Valeurs provisoires** (table `TIERS3` de `60-music.js`) : bpm [104, 118, 122] ; gain du palier 2 : 1,1 (× 0,5 du bus musique) ; couches par palier dans `TIERS3.lay`.
- **Déclencheurs** : `setTheme` (`72-flow.js`) pose le palier 1 quand la forme II démarre (ce qui couvre aussi le retry de la forme II) et le palier 2 si la rage 1 est déjà passée (reprise après pause) ; `spawn` (`64-prologue.js`) pose le palier 2 à la première attaque normale après la rage 1 (rage contrée). Un retry repart donc au palier 1 ; le palier 2 revient avec la rage 1.
- **À valider** : bpm et gain à l'oreille en jeu, moment exact du palier 2 (dès la première attaque normale suivant la rage contrée).
