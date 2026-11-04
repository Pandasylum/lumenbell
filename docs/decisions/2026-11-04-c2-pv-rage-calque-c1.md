# Chapitre II : PV et rages calqués sur le Chapitre I, rage : voir la décision de relance

Date : 2026-11-04 · Branche : `fix/ch2-rage-pv` · Périmètre : `chapters/ch2-silent-bells`

## Décision (Kevin) : uniforme entre chapitres
- PV du boss, phases I et II : 8 / 10 / 14 (Facile / Normal / Difficile). Phase III (formes I et II) : 8 / 10 / 12 ; forme II : PV remis à neuf.
- Seuils de rage, phases I et II : [4] / [5] / [10, 5]. Phase III : [4] / [5] / [8, 5]. Les repères de la jauge suivent les seuils.
- Inchangés : dernier assaut à PV ≤ 1, nombre de rages (1 / 1 / 2), sorts de rage, vitesse d'attaque, PV du Veilleur, soin entre phases.
- Tables : `DIFFS` (`boss`, `boss3`, `u`, `u3`) ; les épreuves reprennent Normal / Difficile.

## Rage : règle remplacée
La section « Bug corrigé » (une seule rage par seuil) est remplacée par `2026-11-04-c2-rage-relance-c1.md` : la rage se relance comme au Chapitre I.

## À valider
Le dernier assaut (PV ≤ 1) est rejoué tant que le boss n'est pas tombé (comportement conservé, comme au Chapitre I) : il n'est pas limité à un seul déclenchement.
