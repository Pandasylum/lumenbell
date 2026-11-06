/* ---------- LB.BOSS_DIFF : PV et seuils de rage des boss, communs aux deux chapitres (session shared/boss-diff) ----------
   Référence : le Chapitre I. Par difficulté (easy, normal, hard) : hp = PV du boss en phases I-II ; hp3 = PV en phase III (défaut : hp) ;
   rages = PV du boss où part chaque rage en phases I-II ; rages3 = idem en phase III (défaut : rages). Le chapitre garde ses attaques, ses
   rythmes et ses textes ; l'Épreuve prend la table de sa difficulté de base (Normal ou Difficile). Ne pas confondre avec LB.HERO_DIFF (PV du Veilleur).
   Écart propre à un chapitre ou à un boss : seulement dans LB.BOSS_OVERRIDE[chapitre][boss ou '*'][difficulté] = {hp, hp3, rages, rages3}
   (partiel), et seulement s'il est listé dans docs/decisions. Vide aujourd'hui : les smokes des deux chapitres échouent s'il ne l'est plus. */
LB.BOSS_DIFF={
  easy:{hp:8,rages:[4],rages3:[4]},
  normal:{hp:10,rages:[5],rages3:[5]},
  hard:{hp:14,hp3:12,rages:[10,5],rages3:[8,5]}
};
LB.BOSS_OVERRIDE={};
/* table résolue d'un boss : {hp, hp3, rages, rages3} (hp3 et rages3 remplis par défaut) ; name = easy, normal ou hard, chap = id du chapitre,
   boss = id du boss (l'entrée '*' vaut pour tout le chapitre) */
LB.bossDiff=(name,chap,boss)=>{
  const O=LB.BOSS_OVERRIDE[chap]||{},o=Object.assign({},LB.BOSS_DIFF[name],(O['*']||{})[name],boss?(O[boss]||{})[name]:null);
  return{hp:o.hp,hp3:o.hp3!=null?o.hp3:o.hp,rages:o.rages.slice(),rages3:(o.rages3||o.rages).slice()}};
/* PV du boss où part chaque rage, pour la table résolue b et la phase (1 à 3) : repères de sa jauge et déclenchement des rages */
LB.rageHp=(b,phase)=>phase===3?b.rages3:b.rages;
