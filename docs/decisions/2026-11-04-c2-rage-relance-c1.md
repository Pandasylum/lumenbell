# Chapitre II : la rage se relance comme au Chapitre I

Date : 2026-11-04 · branche `c2/voix-sorts` · remplace la section « Bug corrigé » de `2026-11-04-c2-pv-rage-calque-c1.md`

- Après un seuil franchi, la rage se relance à chaque attaque tant que le boss n'a pas perdu de PV depuis le début de la rage ; dès qu'il est touché, les attaques normales reprennent jusqu'au seuil suivant.
- Les seuils déjà passés ne relancent plus (`rageN`). Remise à zéro par phase et au chapitre (`resetPhaseState`). Dernier assaut inchangé (rejoué tant que le boss n'est pas tombé).
- Cause : la limitation à un départ par seuil (commit 2b4afdc) avait supprimé le test `rageHp0` qui, au Chapitre I, rejoue la rage tant que le coup n'est pas passé. Aucune autre cause trouvée : la rage « répétée » décrite était la règle voulue ; seul ce test est rétabli.
