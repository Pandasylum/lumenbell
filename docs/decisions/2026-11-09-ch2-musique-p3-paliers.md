# 2026-11-09 · Chapitre II : musique de la phase III, forme II, en deux paliers

Branche `ch2/musique-p3-paliers`. Validé à l'écoute (page d'écoute `tools/ecoute-musique-p3.html`, branche `ch2/ecoute-paliers-p3`, hors jeu) : variante A « marche de guerre », base revue.

- **Mécanisme** : palier local 0 à 2 dans `60-music.js` (`MUSIC.tier(n)`), remis à 0 par `play` et `stop`. Aucun changement de `shared/` ni du Chapitre I.
- **Base revue dès le palier 0** (décision de Kevin, 9 novembre : cœur battant dès le départ) : cœur battant, grondement A / Si♭, arpège grave, cloche sourde ; elle remplace le thème 3 d'origine pour toute la phase III, forme I comprise. **Palier 1** : naissance de la forme II ; en plus tambours et cuivres graves. **Palier 2** : fin de la rage 1 de la forme II ; en plus grosse caisse, roulements, accords serrés, montée de tension.
- **Valeurs provisoires** (table `TIERS3` de `60-music.js`) : bpm [104, 118, 122] ; gain du palier 2 : 1,1 (× 0,5 du bus musique) ; couches par palier dans `TIERS3.lay`.
- **Déclencheurs, comme au Chapitre I** (`64-audio-music.js` : niveau lu dans l'état à chaque pas de musique, avec un cri de montée à chaque hausse) : `72-flow.js` enregistre une seule lecture d'état, `MUSIC.tierSrc` ; forme II = palier 1 ; palier 2 une fois la rage 1 finie (contre réussi : `rageN >= 1` et `rageHp0` effacé, équivalent de `R.u5`). Sans appel d'événement : le retry de la forme II repart au palier 1, le palier 2 revient avec la rage 1, la reprise après pause retrouve le bon palier.
- **Montée** : à chaque hausse de palier après la première lecture, un balayage grave montant, deux grosses caisses et un souffle de bruit (`p3swell`), sur le modèle du cri du Chapitre I.
- **À valider** : bpm et gain à l'oreille en jeu, accord sur le balayage de montée (`p3swell`), valeurs à entendre en jeu.
