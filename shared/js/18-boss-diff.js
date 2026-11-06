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
/* LB.BOSS_RULES : valeurs communes des rages (référence : le Chapitre I). finalHp = PV du boss où part le dernier assaut ;
   rageDur / rageDur2 = durée du rugissement de la première rage / des suivantes (s). */
LB.BOSS_RULES={finalHp:1,rageDur:1.6,rageDur2:.8};
/* LB.rageState : relance de rage (état dans S : rageN, rageHp0, rageNext, finalDone). Une rage dont le contre a échoué (PV du boss pas plus bas
   qu'au début du rugissement) repart à chaque attaque ; dès que le boss est touché, les attaques normales reprennent jusqu'au seuil suivant.
   Un seuil déjà passé ne repart jamais ; le dernier assaut repart tant que le boss n'est pas tombé.
   fresh() : champs à remettre à zéro ; check(S, seuils, avecFinal) : renvoie le n° de la rage qui part maintenant (0 sinon), appel à chaque tour du boss ;
   isFinal(S, avecFinal) : le dernier assaut est dû ; dur(n) : durée du rugissement de la rage n. */
LB.rageState={
  fresh:()=>({rageN:0,rageHp0:null,rageNext:0,finalDone:false}),
  isFinal:(S,withFinal)=>withFinal&&S.bossHp<=LB.BOSS_RULES.finalHp,
  dur:n=>n>1?LB.BOSS_RULES.rageDur2:LB.BOSS_RULES.rageDur,
  check:(S,thr,withFinal)=>{
    const n=thr.filter(x=>S.bossHp<=x).length;
    if(!S.rageNext){
      if(S.rageHp0!=null){if(S.bossHp>=S.rageHp0&&S.rageN>0)S.rageN--;S.rageHp0=null}
      if(S.finalDone&&S.bossHp>0)S.finalDone=false}
    if(n>S.rageN&&!LB.rageState.isFinal(S,withFinal)){S.rageN=n;S.rageHp0=S.bossHp;S.rageNext=n;return n}
    return 0}
};
/* PV après soin : heal true = tous les PV de départ, un nombre = ce nombre de PV, dans la limite des PV de départ (startHp) ; autre valeur = aucun soin */
LB.healFor=(heal,startHp,hp)=>heal===true?startHp:heal?Math.min(startHp,hp+heal):hp;
