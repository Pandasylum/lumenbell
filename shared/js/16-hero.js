/* ---------- LB.hero : la machine à états du Veilleur, commune aux deux chapitres (session engine/hero-states) ----------
   ready -> act -> recover -> ready. Un appui n'agit qu'en ready ; pendant l'action ou la récupération il ne lance rien et ne fait que
   poser deny (la lanterne du Veilleur passe au rouge, dessin du chapitre). Chaque attaque est jugée à son impact : elle est arrêtée
   si le Veilleur est en action à cet instant, ou dans la grâce (grace) de sa récupération ; une attaque arrêtée le renvoie à ready
   (LB.hero.stopped), de sorte qu'une série s'enchaîne. Un coup reçu (hurt) étourdit le Veilleur, raccourci pour qu'il puisse arrêter
   l'attaque suivante : min(base, max(min, écart − marge)).
   Gestes : block (bloquer, tapoter), dodge (esquiver), hold (bloquer tenu : la garde dure tant que le bouton est tenu, avec une
   endurance drain / regen par seconde ; épuisée, récupération broken). L'action dure act × m, la récupération rec × rm (m, rm :
   difficulté, LB.diff.cur) ; un arrêt appuyé moins de perf × m avant l'impact est parfait.
   Réglages propres à une attaque (fenêtre courte du souffle, marge de plus en Difficile) : jamais ici, le chapitre les passe à
   LB.hero.stops(p, {win, grace, graceAdd}) et LB.hero.hurt(p, écart, {dur, min}). Noms d'état gardés (p.s, p.t, p.rd, p.rk, p.deny,
   p.at) : lus par le dessin et par les tests. Durées en secondes, reprises telles quelles des deux chapitres. */
LB.HERO_T={
  block:{act:.333,rec:.7,grace:.06,perf:.08},
  dodge:{act:.333,rec:.7,grace:.05,perf:.08},
  hold:{act:.333,rec:.7,grace:.06,perf:.08,drain:.36,regen:.38,broken:.9},
  deny:.25,                                         /* appui refusé : durée du retour rouge */
  hurt:{base:{block:.38,dodge:.38,hold:.55},min:.14,margin:.2}
};
/* Difficulté du Veilleur : PV (hp), multiplicateurs de l'action (m) et de la récupération (rm). trial : Épreuve, 4 PV pour tout le
   parcours, aucun soin entre les phases (heal) ; elle s'ajoute à la difficulté de base (m et rm de Normal ou de Difficile). */
LB.HERO_DIFF={
  easy:{hp:6,m:2,rm:1},
  normal:{hp:4,m:1,rm:1},
  hard:{hp:3,m:.6,rm:1.2},
  trial:{hp:4,heal:0}
};
LB.diff={
  cur:null,
  /* difficulté du chapitre (ses propres réglages) + celle du Veilleur ; chap.trial ajoute les règles de l'Épreuve */
  apply(name,chap){const out=Object.assign({},chap||{},LB.HERO_DIFF[name]);if(chap&&chap.trial)Object.assign(out,LB.HERO_DIFF.trial);return out},
  /* difficulté en cours (lue par LB.hero pour m et rm) : le chapitre l'appelle à chaque choix de difficulté */
  use(d){return LB.diff.cur=d}
};
LB.diff.cur=LB.diff.apply('normal');
LB.hero={
  create(){return{s:'ready',t:0,deny:0,at:-9,rd:0,rk:'',g:'block',held:false,stam:1}},
  /* durées du geste g pour la difficulté en cours */
  dur(g){const H=LB.HERO_T[g||'block'],d=LB.diff.cur,m=d.m,rm=d.rm||1;
    return{act:H.act*m,rec:H.rec*rm,grace:H.grace,perf:H.perf*m,hurt:LB.HERO_T.hurt.base[g||'block'],broken:H.broken,drain:H.drain,regen:H.regen}},
  /* appui : en ready, lance l'action (renvoie vrai, `now` = date de l'appui pour le parfait) ; sinon deny */
  press(p,g,now){p.held=true;
    if(p.s==='ready'){p.s='act';p.t=0;p.at=now!=null?now:0;p.g=g||'block';return true}
    if(p.s==='act'||p.s==='recover')p.deny=LB.HERO_T.deny;
    return false},
  release(p){p.held=false},
  /* avance d'un pas ; renvoie 'broken' quand la garde tenue vient de s'épuiser, sinon '' */
  step(p,dt,o){o=o||{};const g=o.gesture||p.g||'block',H=LB.HERO_T[g],c=LB.hero.dur(g),hold=g==='hold',held=hold&&(o.held!==undefined?o.held:p.held);let ev='';
    p.t+=dt;p.deny=Math.max(0,p.deny-dt);
    if(p.s==='act'){
      if(held&&p.t>c.act){p.stam-=dt*H.drain;if(p.stam<=0){p.stam=0;p.s='recover';p.t=0;p.rd=c.broken;p.rk='broken';ev='broken'}}
      else if(p.t>=c.act){p.s='recover';p.t=0;p.rd=c.rec;p.rk='act'}
    }else if((p.s==='recover'||p.s==='hurt')&&p.t>=p.rd){p.s='ready';p.t=0}
    if(hold&&!(p.s==='act'&&held))p.stam=Math.min(1,p.stam+dt*H.regen);
    return ev},
  /* l'attaque qui tombe maintenant est-elle arrêtée ? o : nombre = fenêtre propre à l'attaque (s, après le début de l'action) ou
     {win, grace, graceAdd} ; sans o : durée de l'action et grâce du geste */
  stops(p,o){o=typeof o==='number'?{win:o}:(o||{});const c=LB.hero.dur(p.g),win=o.win!=null?o.win:c.act,gr=o.grace!=null?o.grace:c.grace+(o.graceAdd||0);
    return(p.s==='act'&&p.t<=win+.002)||(p.s==='recover'&&p.rk==='act'&&p.t<gr)},
  /* attaque arrêtée : retour à ready */
  stopped(p){p.s='ready';p.t=0},
  /* l'arrêt est-il parfait (appui moins de perf avant l'impact) ? à appeler avant stopped ; now = date courante du chapitre */
  perfect(p,now){return p.s==='act'&&(now!=null?now-p.at:p.t)<=LB.hero.dur(p.g).perf},
  /* coup reçu : étourdissement raccourci pour pouvoir arrêter l'attaque suivante (écart = secondes avant elle, 99 sans suivante) ;
     o : {dur, min, margin} propres à l'attaque ou au chapitre ; renvoie la durée */
  hurt(p,gap,o){o=o||{};const T=LB.HERO_T.hurt,base=o.dur!=null?o.dur:T.base[o.g||p.g||'block'],min=o.min!=null?o.min:T.min,mg=o.margin!=null?o.margin:T.margin;
    p.s='hurt';p.t=0;p.rd=Math.min(base,Math.max(min,(gap==null?99:gap)-mg));p.rk='';return p.rd}
};
/* Barre de récupération sous les pieds du Veilleur (x, y = pieds) : repère d'aide, dessinée seulement si la case « Aide » est cochée
   (le chapitre appelle LB.drawRecoveryBar derrière cette case). Jamais rouge : le seul retour d'un appui refusé est la lanterne. */
LB.drawRecoveryBar=(ctx,x,y,p)=>{
  if(p.s!=='recover'||!(p.rd>0))return;
  const k=Math.max(0,Math.min(1,p.t/p.rd));
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-31,y+8,62,6);ctx.fillStyle='#6fd3ff';ctx.fillRect(x-30,y+9,60*k,4)};
/* Lanterne rouge pendant un appui refusé (couleur de la lanterne du Chapitre I) */
LB.DENY_COL='#ff6b6b';
