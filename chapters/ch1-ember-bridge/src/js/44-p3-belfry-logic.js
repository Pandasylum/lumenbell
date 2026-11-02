/* ================= PHASE III : le Clocher ================= */
let R=null;
const GUARD=[PX+116,DECK-76];
/* Phase III : down = étourdissement d'un coup, min = plancher quand un autre coup suit, lasso = étourdissement du crochet, stun = étourdissement du Colosse (s). Durées de l'action, de la récupération et de la grâce : LB.HERO_T.block. */
const R_T={down:.55,min:.22,lasso:1.1,stun:.55};
const RATK={
  greatsword:{hits:[{k:'gs',at:.75},{k:'gs',at:1.4},{k:'gs',at:2.05}],cn:'plant',get name(){return _('War hammer','Marteau de guerre')}},
  avalanche:{hits:[{k:'ice',at:.9},{k:'ice',at:1.2},{k:'ice',at:1.5},{k:'ice',at:1.8},{k:'ice',at:2.1}],cn:'bat',get name(){return _('Ember hail','Grêle de braise')}},
  charge:{hits:[{k:'ram',at:1.0},{k:'stomp',at:1.75},{k:'geyser',at:2.5}],cn:'bell',get name(){return _('Charge, stomp and geyser','Charge, piétinement et geyser')}},
  whip:{hits:[{k:'whip',at:.75}],cn:'plant',get name(){return _('The hook','Le crochet')}},
  sword2:{hits:[{k:'gs',at:.75},{k:'gs',at:1.4}],cn:'plant',get name(){return _("Hammer combo","Combo de marteau")}},
  breath:{get hits(){return[{k:'breath',at:DIFF.easy?1.0:.9}]},get hq(){return !DIFF.easy},cn:'bat',get name(){return _('Flame breath','Souffle de flamme')}},
  claws:{hits:[{k:'claw',at:.8},{k:'claw',at:1.3}],cn:'bell',get name(){return _('Claws','Griffes')}},
  rocks:{hits:[{k:'rock',at:1.0},{k:'rock',at:1.7}],cn:'bat',get name(){return _('Falling stones','Chute de pierres')}},
  waves:{hits:[{k:'wave',at:1.0},{k:'wave',at:1.5},{k:'wave',at:2.0}],cn:'bat',get name(){return _("Wing waves","Ondes d'ailes")}},
  roar:{hits:[{k:'fall',at:1.0}],cn:'bell',get name(){return _('Roar: the tower shakes','Cri : le Clocher tremble')}}
};
/* Difficile : variantes des 3 attaques de base (première vie, puis aussi en seconde vie). */
const XB=PX-170,RAM2=3.25; /* XB : où le Colosse s'arrête derrière le Veilleur */
const RATKH={
  greatsword:{h:true,hits:[{k:'stab',at:.85},{k:'gs',at:1.95},{k:'gs',at:2.45},{k:'gs',at:2.95},{k:'blast',at:3.9}],cn:'plant',get name(){return _('Ram, combo and blast','Coup de bélier, combo et explosion')}},
  avalanche:{h:true,hits:[{k:'bomb',at:3.3},{k:'bomb',at:4.0},{k:'bomb',at:4.35},{k:'bomb',at:5.05},{k:'bomb',at:5.4}],cn:'bat',get name(){return _('Ember bombs','Bombes de braise')}},
  charge:{h:true,hits:[{k:'ram',at:1.0},{k:'stomp',at:2.05},{k:'ram',at:RAM2},{k:'geyser',at:4.6}],cn:'bell',get name(){return _('Charge, stomp, recharge and geyser','Charge, piétinement, recharge et geyser')}}
};
const BASE=['greatsword','avalanche','charge'],ALLK=BASE.concat(['whip','sword2','breath','claws','rocks','waves']),ALLKH=BASE.concat(['whip','sword2','breath','claws','rocks','waves','roar']);
function allPool(){return DIFF.hard?ALLKH:ALLK}
const ULT={
  rale:{get name(){return _("Death rattle","Râle d'agonie")},off:1.9,pre:[{k:'blast',at:1.1,pre:true}]},
  fureur:{get name(){return _('Fury','Fureur')},off:4.6,pre:[{k:'blast',at:1.1,pre:true},{k:'blast',at:2.0},{k:'blast',at:2.9},{k:'blast',at:3.8}]},
  embrasement:{get name(){return _('Blaze','Embrasement')},off:3.2,pre:[{k:'blast',at:1.1,pre:true},{k:'wave',at:1.9},{k:'wave',at:2.5}]}
};
/* Difficile, seconde vie : une rage unique par palier (10, 5 et 1 PV) */
Object.assign(ULT,{
  brasier:{get name(){return _('Ember fury','Fureur de braise')},off:4.4,pre:[{k:'blast',at:1.1,pre:true},{k:'blast',at:2.2},{k:'blast',at:2.9},{k:'blast',at:3.4}]},
  danse:{get name(){return _('Chain dance','Danse des chaînes')},off:1.9,pre:[{k:'blast',at:1.1,pre:true}]},
  dernier:{get name(){return _('Final blaze','Embrasement final')},off:1.9,pre:[{k:'blast',at:1.1,pre:true}]}
});
const FIN={raise:.5,bell1:1.35,fling:1.55,leap:[1.7,2.1],cut:[2.3,3.0],charge:3.5,strike:4.4,exp:4.6,gap:.42,collapse:6.9,bell:8.4,hero:9.9,fade:12.2,space:13.3};
const SPSTARS=Array.from({length:230},()=>({x:rand(0,W),y:rand(0,H),r:rand(.4,2),p:rand(0,6.28)}));
const STARS=Array.from({length:80},()=>({x:rand(0,W),y:rand(0,250),r:rand(.5,1.6),p:rand(0,6.28)}));
const FLAKES=Array.from({length:160},()=>({x:rand(0,W),y:rand(0,H),v:rand(60,170),s:rand(1,3),ph:rand(0,6.28)}));
function rNew(){
  return{mode:'intro',t:0,time:0,php:startHP(),bhp:DIFF.rbhp,blocks:0,taken:0,
    pl:LB.hero.create(),boss:{s:'idle',t:0,wait:.9},atk:null,cn:null,last:'',n:0,
    sparks:[],floats:[],rings:[],exps:[],fbs:[],melts:[],steam:[],
    shake:0,flash:0,hurt:0,hitstop:0,recoil:0,endIn:0,bx:BX,
    rage:0,u5:false,u55:false,u1:false,healed:false,cycle:1,stacked:0,cut:0,fall:[],fin:null,st:0,ibn:-1,introHx:-20,iclash:false,roared:false};
}
function beginP3(noLore){
  if(RUN.on&&Q&&Q.mode==='lake'){RUN.cur=Math.min(RUN.max,Q.php+DIFF.heal);RUN.st[2]={p:Q.dodges,h:Q.taken}}
  Q=null;R=rNew();el.ov.classList.remove('clear');setPhaseUI(3);lastP=-1;lastB=-1;
  el.ov.hidden=true;if(!noLore)showLore(3);
  say(_('Phase III. The Bell Tower. The button raises your guard to block.','Phase III. Le Clocher. Le bouton lève ta garde pour bloquer.'));
  hud();
}
function rPress(){
  if(R.mode!=='play')return;
  ensureAudio();
  if(LB.hero.press(R.pl,'block'))tone(520,.14,'triangle',.05,320)
}
function rPickFrom(pool){
  let k=pool[Math.floor(Math.random()*pool.length)];
  if(k===R.last&&R.n>=2){const o=pool.filter(x=>x!==k);k=o[Math.floor(Math.random()*o.length)]}
  R.n=(k===R.last)?R.n+1:1;R.last=k;
  return k;
}
/* Difficile, seconde vie : attaques reprises des phases I et II Difficile (mêmes rythmes). */
Object.assign(RATKH,{
  whip:{cn:'plant',gen(opts){
    const four=opts&&opts.n===4,hits=four?[{k:'whip',at:.92},{k:'whip',at:1.52},{k:'whip',at:2.32},{k:'whip',at:2.92}]:[{k:'whip',at:.92},{k:'whip',at:1.52}];
    dblTell(); /* alerte sonore comme en P1 (+ « !! » à l'écran) */
    return{hits,dbl:true,tn:hits.length,name:four?_('Four hooks','Quatre crochets'):_('Double hook','Double crochet')};
  }},
  sword2:{cn:'plant',gen(){
    const hits=[{k:'gs',at:1.01},{k:'gs',at:1.64},{k:'gs',at:2.51}];
    return{hits,hard3:true,name:_('Hammer combo','Combo de marteau')};
  }},
  breath:{cn:'bat',gen(){return{hits:[{k:'breath',at:.75}],hq:true}},get name(){return _('Flame breath','Souffle de flamme')}},
  claws:{hits:[{k:'claw',at:.8},{k:'claw',at:1.15},{k:'claw',at:1.95},{k:'claw',at:2.3}],cn:'bell',get name(){return _('Claw flurry','Rafale de griffes')}},
  waves:{hits:[{k:'wave',at:.95},{k:'wave',at:1.5},{k:'wave',at:1.85},{k:'wave',at:2.6},{k:'wave',at:2.95}],cn:'bat',get name(){return _('Wing barrage','Barrage d\'ailes')}},
  rocks:{hits:[{k:'rock',at:.95},{k:'rock',at:1.6},{k:'fire',at:2.2}],cn:'bat',get name(){return _('Stones and fireball','Pierres et boule de feu')}},
  roar:{cn:'bell',gen(opts){
    const hits=[];
    if(opts&&opts.fixed){[1.0,1.7,2.4].forEach(t=>hits.push({k:'fall',at:t}))}
    else{let tt=.95+rand(0,.15);for(let i=0;i<5;i++){hits.push({k:'fall',at:tt});tt+=rand(.55,.9)}}
    return{hits,roar:true,name:_('Roar: the tower shakes','Cri : le Clocher tremble')};
  }}
});
/* temps de pose recalé : le coup actif tombe à « canon », la préparation est comprimée si le coup arrive plus tôt */
function aq(a,kind,canon){
  const off=a.off||0,pt=a.pt,hs=a.hits.filter(h=>h.k===kind);
  let prev=(kind==='breath'&&a.cf!=null)?a.cf:0,hit=null;
  for(let i=0;i<hs.length;i++){
    const base=hs[i].at-off;
    if(pt<base+.25||i===hs.length-1){hit=base;break}
    prev=base;
  }
  if(hit==null)return pt;
  const lead=Math.max(.3,hit-prev);
  return pt>=hit?canon+(pt-hit):canon-(hit-pt)*canon/lead;
}
function swq(a){ /* marteau en 3 coups (P1 Difficile) : coups recalés sur l'animation de base */
  const off=a.off||0,pt=a.pt,B=a.hits.filter(h=>h.k==='gs').map(h=>h.at-off),C=[.75,1.4,2.05];
  let pb=0,pc=0;
  for(let i=0;i<B.length;i++){if(pt<B[i])return pc+(pt-pb)*(C[i]-pc)/(B[i]-pb);pb=B[i];pc=C[i]}
  return pc+(pt-pb);
}
function rPick(){
  if(R.last===''){R.last='greatsword';R.n=1;return 'greatsword'}
  return rPickFrom(R.healed?allPool():BASE);
}
function rUlt(lv){
  if(DIFF.hard&&R.healed){ /* rages uniques de la seconde vie */
    R.rage=lv===5?2:3;
    if(lv===5){ /* rage ratée : on refait exactement la même (même attaque) */
      if(!R.rk5)R.rk5=rPickFrom(allPool());
      return rLaunch(R.rk5,{ult:'brasier',lv:5});
    }
    if(lv===55)return rLaunch('whip',{ult:'danse',lv:55,n:4});
    return rLaunch('waves',{ult:'dernier',lv:1,chain:['roar','charge'],fixed:true});
  }
  const u=(R.healed?['rale','fureur','embrasement']:['rale'])[R.healed?Math.floor(Math.random()*3):0];
  if(lv===55)R.rage=Math.min(R.healed?3:2,Math.max(1,R.rage)+1); /* rage à 5 PV (Difficile) : un coup de queue de plus */
  else if(lv===5&&u==='rale'&&R.stacked!==R.cycle){R.stacked=R.cycle;R.rage=Math.min(2,R.rage+1)}
  else if(!R.rage)R.rage=1;
  rLaunch(rPickFrom(R.healed?allPool():BASE),{ult:u,lv});
}
function rNext(){
  if(R.bhp<=1&&!R.u1)return rUlt(1);
  if(R.bhp<=DIFF.ru&&!R.u5)return rUlt(5);
  if(DIFF.u2&&R.u5&&!R.u55&&R.bhp<=DIFF.u2)return rUlt(55);
  rLaunch(rPick());
}
function rLaunch(kind,opts){
  let d=(DIFF.hard&&RATKH[kind])||RATK[kind];if(d.gen)d=Object.assign({},d,d.gen(opts));
  const b=R.boss,u=opts&&opts.ult?ULT[opts.ult]:null,off=u?u.off:0,hits=[];
  if(u)u.pre.forEach(h=>hits.push({k:h.k,at:h.at,pre:!!h.pre,ok:null,done:false}));
  /* Facile : grêle de braise réduite à 3 blocs, la charge ne finit pas par un geyser */
  const src=DIFF.easy?(kind==='avalanche'?d.hits.slice(0,3):kind==='charge'?d.hits.slice(0,2):d.hits):d.hits;
  src.forEach(h=>hits.push({k:h.k,at:h.at+off,ok:null,done:false}));
  const more=!!(opts&&opts.chain&&opts.chain.length);
  if(R.rage>0&&!more){let t=hits[hits.length-1].at;for(let i=0;i<R.rage;i++){t+=.65;hits.push({k:'blast',at:t,flap:true,ok:null,done:false})}}
  R.atk={kind,h:!!d.h,t:0,pt:-off,off,hits,end:hits[hits.length-1].at+.5,miss:(opts&&opts.carry?opts.carry.miss:0),chain:more?opts.chain:null,fixed:!!(opts&&opts.fixed),ult:u?opts.ult:(opts&&opts.carry?opts.carry.ult:null),lv:u?opts.lv:(opts&&opts.carry?opts.carry.lv:0),tn:d.tn||0,cf:d.cf!=null?d.cf:null,hq:!!d.hq,dbl:!!d.dbl,hard3:!!d.hard3,roar:!!d.roar};
  b.s='atk';b.t=0;
  tone(110,.6,'sawtooth',.04,80);
  say((u?u.name+'. ':'')+d.name+'.');
}
function rMelt(x){
  R.melts.push({x,t:0});

}
const HTXT={fire:_('BURNED!','BRÛLÉ !'),fall:_('CRUSHED!','ÉCRASÉ !'),stab:_('RAMMED!','PERCUTÉ !'),bomb:_('EXPLOSION!','EXPLOSION !'),ram:_('CRUSHED!','ÉCRASÉ !'),stomp:_('CRUSHED!','ÉCRASÉ !'),rock:_('CRUSHED!','ÉCRASÉ !'),geyser:_('BURNED!','BRÛLÉ !'),breath:_('BURNED!','BRÛLÉ !'),wave:_('BURNED!','BRÛLÉ !'),blast:_('EXPLOSION!','EXPLOSION !'),whip:_('HOOKED!','ACCROCHÉ !'),claw:_('CLAWED!','GRIFFÉ !')};
function rResolve(h){
  const p=R.pl,a=R.atk;
  const ok=LB.hero.stops(p,h.k==='breath'?{win:BRW}:null); /* fenêtre courte du souffle : réglage de l'attaque */
  h.ok=ok;
  const gx=heroFlip()?PX-116:GUARD[0];
  const bi=h.k==='bomb'?a.hits.filter(x=>x.k==='bomb').indexOf(h):0;
  const px=h.k==='ice'?PX+110:h.k==='geyser'?PX+20:h.k==='bomb'?bombPos(bi)[0]:gx;
  if(h.k==='gs'||h.k==='stab'){anvil();forgeSparks(R,ok?gx:PX+20,ok?GUARD[1]:DECK-70,ok?16:10)}
  if(h.k==='bomb'){const P=bombPos(bi);qBurst(P[0],P[1]-10,22,['#ffffff','#ffc15a','#ff7a2b']);R.shake=reduce?0:Math.max(R.shake,8);boom(.4,.1)}
  if(ok){
    R.blocks++;R.hitstop=(h.k==='gs'||h.k==='stab')?.04:.08;R.flash=.3;R.shake=Math.max(R.shake,reduce?0:5);thud(.4);
    qRing(gx,GUARD[1]);qBurst(gx,GUARD[1],26,['#bfeaff','#6fd3ff','#ffffff','#ffc15a']);
    qFloat('CLANG',gx-30,GUARD[1]-110,'#bfeaff');
    tone(880,.28,'square',.05,-260);tone(1400,.2,'sine',.04);
    LB.hero.stopped(p);
    rMelt(px);
    for(let i=0;i<8;i++)R.steam.push({x:px+rand(-24,24),y:DECK-4,vx:rand(-20,20),vy:-rand(40,110),life:rand(.6,1.1),max:1.1,s:rand(8,20)});
  }else{
    a.miss++;
    R.php=Math.max(0,R.php-1);R.taken++;R.shake=reduce?0:15;R.hurt=.35;R.hitstop=.07;thud(1.1);
    qBurst(PX+20,DECK-70,26,['#ff8a4a','#ffc15a','#ff5252']);
    qFloat(HTXT[h.k]||_('HIT!','TOUCHÉ !'),PX-30,DECK-190,'#ff8a6b');
    tone(90,.3,'sawtooth',.1,-40);
    rMelt(px);
    /* enchaînement : l'étourdissement s'arrête assez tôt pour pouvoir bloquer le coup suivant */
    const nx=a.hits.find(x=>!x.done&&x!==h),gap=nx?nx.at-a.t:99;
    LB.hero.hurt(p,gap,{dur:h.k==='whip'?R_T.lasso:R_T.down,min:R_T.min});p.lasso=h.k==='whip';
    if(R.php<=0){p.s='down';R.mode='lost';R.endIn=1.3;say(_('Struck down atop the tower. Defeat.','Terrassé au sommet du Clocher. Défaite.'))}
    else say(_('Hit.','Touché.'));
  }
}
function rAtkEnd(){
  const a=R.atk,b=R.boss;R.atk=null;
  if(a.chain&&a.chain.length&&R.mode==='play'){rLaunch(a.chain[0],{chain:a.chain.slice(1),fixed:a.fixed,carry:{miss:a.miss,ult:a.ult,lv:a.lv}});return}
  if(a.miss===0){
    R.cn={k:a.ult?'bolt':RATK[a.kind].cn,t:0,hit:false,lv:a.lv||0};b.s='cn';b.t=0;R.pl.s='counter';R.pl.t=0;
    tone(300,.4,'triangle',.05,300);say(a.ult?_('Combo blocked. The Watcher rings the great bell!','Combo bloqué. Le Veilleur fait sonner la grande cloche !'):_('Perfect block. Riposte!','Blocage parfait. Riposte !'));
  }else{b.s='fail';b.t=0}
}
function startFinale(){
  R.mode='finale';R.fin={t:0};R.cn=null;R.atk=null;R.boss.s='final';R.pl.s='ready';R.pl.t=0;R.cut=0;R.fall=[];R.fmace=null;R.fbeam=[];
  say(_('The bell calls down the lightning. The Colossus raises his weapon to crush the Watcher.','La cloche appelle la foudre. Le Colosse lève son arme pour écraser le Veilleur.'));
}
function rDamage(k,c){
  if(k==='bolt'){
    const tg=[R.bx-20,DECK-230];
    R.recoil=1;R.shake=reduce?0:16;R.hitstop=.12;R.flash=.5;thud(1.6);
    qBurst(tg[0],tg[1],40,['#ffffff','#fff0b0','#ffd966','#ffc15a']);
    qFlameBurst(tg[0],tg[1],1.5,true);R.shake=reduce?0:20;
    tone(90,.6,'sawtooth',.14,-40);tone(1200,.3,'sine',.07,-600);
    if(R.healed&&R.hornAt==null){R.hornAt=R.time;R.hornX=R.bx;noise(.3,.22,5000,900);tone(900,.25,'square',.06,-600);qBurst(R.bx+105,DECK-340,16,['#ffc15a','#ff7a2b','#ffffff'])}
    if(R.bhp<=1){
      if(!R.healed&&!DIFF.easy){ /* Facile : pas de seconde vie, la vraie fin suit directement (la fausse fin est supprimée, 1er novembre) */
        R.healed=true;R.wdAt=R.time;R.cycle=2;R.u5=false;
        qBurst(R.bx-110,DECK-300,24,['#ffc15a','#ff7a2b','#ffffff']);qBurst(R.bx+110,DECK-300,24,['#ffc15a','#ff7a2b','#ffffff']);noise(.6,.16,3200,500);R.u55=false;R.u1=false;R.rk5=null;R.cn=null;R.pl.s='ready';R.pl.t=0;
        R.boss.s='heal';R.boss.t=0;say(_("Final death cry: the Colossus recovers all his health.","Ultime cri d'agonie : le Colosse récupère toute sa vie."));
      }else{R.u1=true;R.bhp=0;startFinale()}
      return;
    }
    R.bhp=Math.max(1,R.bhp-1);
    if(c&&c.lv===5)R.u5=true;
    if(c&&c.lv===55)R.u55=true;
    say(_('The bell calls down the lightning on the Colossus.','La cloche appelle la foudre sur le Colosse.'));
    return;
  }
  R.bhp=Math.max(0,R.bhp-1);R.recoil=1;R.shake=reduce?0:13;R.hitstop=.11;R.flash=.4;thud(1.2);
  if(k==='bell')R.dizzy=R.time+1.3;
  const tg=k==='slide'?[R.bx-62,DECK-58]:k==='plant'?[R.bx-60,DECK-26]:[R.bx-30,DECK-170];
  qBurst(tg[0],tg[1],32,['#ffffff','#fff0b0','#ffc15a']);qRing(tg[0],tg[1]);
  /* Pas de mot : l'effet se voit et s'entend, propre à chaque contre (cloche, éclats, rayon au sol). */
  R.flash=.6;qRing(tg[0],tg[1]);
  if(k==='bell'){ringBell(.55);tone(70,.9,'sine',.12,-20)}
  else if(k==='bat'){tone(1700,.3,'triangle',.07,-1000);tone(2400,.2,'sine',.05,-1200);noise(.18,.12,6000,1500)}
  else{tone(220,.5,'sawtooth',.09,700);noise(.25,.14,900,4000)}
  tone(170,.25,'square',.08,-110);tone(900,.2,'sine',.05);
  qFlameBurst(tg[0],tg[1],1.2);
  if(R.bhp<=0){
    R.boss.s='dead';R.boss.t=0;R.mode='won';R.endIn=3.2;R.cn=null;
    say(_('The Colossus collapses. Victory.','Le Colosse s\'effondre. Victoire.'));
  }else say(_('Riposte landed.','Riposte réussie.'));
}
function rCnStep(dt){
  const c=R.cn,b=R.boss,p=R.pl;c.t+=dt;
  const sp={plant:{hit:.85,end:1.5},bat:{hit:.67,end:1.35},bell:{hit:.85,end:1.45},slide:{hit:.35,end:1.2},bolt:{hit:1.0,end:1.9}}[c.k];
  if(c.k==='bell'){
    if(!c.d1&&c.t>=.1){c.d1=true;tone(1568,.5,'triangle',.06,0);tone(2093,.35,'sine',.035,0);tone(2637,.25,'sine',.02,0)}
    if(!c.d2&&c.t>=.5){c.d2=true;ringBell(.55);R.flash=.2}
  }
  if(c.k==='plant'&&!c.pl&&c.t>=.3){c.pl=true;qRing(PX+105,DECK-14);qBurst(PX+105,DECK-14,22,['#ffffff','#bfeaff','#6fd3ff']);tone(160,.4,'sine',.1,-60);R.flash=.2}
  if(c.k==='bolt'&&!c.rz&&c.t>=.25){c.rz=true;tone(220,.8,'sawtooth',.05,900);R.flash=.2;qRing(PX+72,DECK-154)}
  if(c.k==='bolt'&&!c.rb&&c.t>=.55){c.rb=true;ringBell(.32)}
  if(c.k==='bolt'&&!c.rm&&c.t>=.6){c.rm=true;tone(55,.9,'sawtooth',.08,-15)}  if(c.k==='slide'&&c.t<.4&&Math.random()<.7){
    const x=heroX3();R.sparks.push({x:x-10,y:DECK-3,vx:rand(-120,-20),vy:-rand(20,100),g:260,life:.5,max:.5,col:'#ffffff',sz:rand(2,4)});
  }
  if(!c.hit&&c.t>=sp.hit){c.hit=true;rDamage(c.k,c);if(R.mode!=='play'||R.cn!==c)return}
  if(c.t>=sp.end){R.cn=null;p.s='ready';p.t=0;b.s='hurt';b.t=0}
}
function rBoss(dt){
  const b=R.boss;b.t+=dt;
  switch(b.s){
    case 'idle':if(b.t>=b.wait)rNext();break;
    case 'atk':{
      const a=R.atk;a.t+=dt;a.pt=a.t-a.off;
      for(const h of a.hits){if(!h.done&&a.t>=h.at){h.done=true;rResolve(h);if(R.mode!=='play')return}}
      if(a.t>=a.end)rAtkEnd();
      break;}
    case 'cn':rCnStep(dt);break;
    case 'heal':{
      const t=b.t;
      if(t>=.5&&!b.ro){b.ro=true;roar();R.shake=reduce?0:12;R.flash=.5}
      if(t>=.5&&t<2.9&&Math.random()<.35)R.fbs.push({x:R.bx+rand(-90,60),y:DECK-rand(60,320),t:0,big:rand(.9,1.5)});
      if(t>=.9){
        const n=Math.min(DIFF.rbhp-1,Math.floor((t-.9)/.2)+1);
        while(R.bhp<1+n){R.bhp++;tone(260+R.bhp*55,.18,'triangle',.05,120)}
      }
      if(t>=3.4){b.s='idle';b.t=0;b.wait=1.1;say(_('The Colossus is back, fiercer than ever.','Le Colosse est de retour, plus féroce encore.'))}
      break;}
    case 'fail':if(b.t>=.9){b.s='idle';b.t=0;b.wait=rand(.8,1.4)}break;
    case 'hurt':if(b.t>=R_T.stun){b.s='idle';b.t=0;b.wait=rand(.8,1.4)}break;
  }
}
function fmtT(t){const m=Math.floor(t/60),r=t-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1)}
function runTable(){
  const tot=RUN.t,key=LB.key('best-'+RUN.name);let best=parseFloat(LB.store.get(key,'0'))||0,rec=false;
  if(!best||tot<best){rec=true;best=tot;LB.store.set(key,String(tot))}
  const a=RUN.st[1]||{p:0,h:0},b=RUN.st[2]||{p:0,h:0};
  const C=[[_('Total time','Temps total'),fmtT(tot)],[_('Hits taken','Coups subis'),a.h+b.h+R.taken],[_('Attempts','Essais'),RUN.n],
    [_('Phase I','Phase I'),fmtT(RUN.pt[0])],[_('Phase II','Phase II'),fmtT(RUN.pt[1])],[_('Phase III','Phase III'),fmtT(RUN.pt[2])],
    [_('Blocks','Blocages'),a.p+R.blocks],[_('Dodges','Esquives'),b.p],[rec?_('New record!','Nouveau record !'):_('Best time','Meilleur temps'),fmtT(best),rec]];
  return C;   /* lignes [libellé, valeur, record] : LB.card */
}
function rEnd(){
  const sp=R.mode==='space',win=R.mode==='won'||sp;
  if(sp){LB.store.set(LB.key('end'),'1');LB.menu.update()}
  const o={onGo:start,onMenu:sp?null:toMenu,clear:sp,eye:sp?_('End of Chapter I · Next: Silent Bells','Fin du chapitre I · À suivre : Silent Bells'):win?_('Victory · Phase III','Victoire · Phase III'):_('Defeat · Phase III','Défaite · Phase III'),
  title:sp?_(`The fire has gone out.`,`Le feu s'est éteint.`):win?_(`The Colossus collapses.`,`Le Colosse s'effondre.`):_('Struck down atop the tower.','Terrassé au sommet du Clocher.'),
  stats:_('Blocks ','Blocages ')+R.blocks+_(' · Hits taken ',' · Coups subis ')+R.taken+trStr(3),
  desc:sp?_(`The Colossus is frozen in black stone, facing the bell. In his open hand lies a chain ring engraved with an erased name. In the beacon's light, the Watcher gazes at him for a long while.`,`Le Colosse est figé dans la pierre noire, face à la cloche. Dans sa main ouverte, un anneau de chaîne gravé d'un nom effacé. Sous la lumière du fanal, le Veilleur le contemple longtemps.`):win?_(`The Colossus collapses in the snow. On the Bell Tower, the Watcher's lantern still keeps watch.`,`Le Colosse s'effondre dans la neige. Sur le Clocher, la lanterne du Veilleur veille encore.`):_(`Snow covers the Watcher. Atop the Bell Tower, the Colossus rules alone, and his fire will never die again.`,`La neige recouvre le Veilleur. Sur le Clocher, le Colosse règne seul, et son feu ne s'éteindra plus.`),
  go:sp?_('Back to menu','Retour au menu'):win?_('Replay from Phase I','Rejouer depuis la phase I'):_('Retry Phase III','Réessayer la phase III')};
  if(sp&&RUN.on){o.eye=_('Trial by Fire · Complete','Épreuve du feu · Terminée');o.stats='';o.table=runTable()}
  LB.card.show(win?o:deathCard(o));
}
function chargeX(t){
  if(t<.35)return BX-5*Math.sin(t*50);
  if(t<1.0){const u=(t-.35)/.65;return BX+(PX+215-BX)*u*u}
  const e=es(clamp01((t-1.0)/.5));
  return PX+215+(BX-110-PX-215)*e;
}
function chargeXH(t){
  if(t<.35)return BX-5*Math.sin(t*50);
  if(t<1.0){const u=(t-.35)/.65;return BX+(PX+215-BX)*u*u}
  if(t<1.45){const u=(t-1.0)/.45;return PX+215+(XB-PX-215)*(1-Math.pow(1-u,1.5))}
  if(t<2.6)return XB;
  if(t<2.95)return XB-5*Math.sin(t*50);
  if(t<3.6){const u=(t-2.95)/.65;return XB+(BX-XB)*u*u}
  return BX;
}
function heroFlip(){const a=R&&R.atk;if(!a||!a.h||a.kind!=='charge')return false;const q=a.t-(a.off||0);return q>=1.3&&q<3.45}
function bombPos(i){return[PX+86+i*26,DECK-26]}
function bombL(i){return .95+[0,.7,1.05,1.75,2.1][i]} /* rythme « 1 - 1 1 - 1 1 » (temps = .35 s), identique à la chute et à l'explosion */
function rStep(dt){
  R.time+=dt;R.t+=dt;
  for(const f of FLAKES){f.y+=f.v*dt;f.x-=(40+f.v*.25)*dt+Math.sin(R.time+f.ph)*6*dt;if(f.y>H+6){f.y=-6;f.x=rand(0,W+80)}if(f.x<-8)f.x=W+8}
  for(let i=R.sparks.length-1;i>=0;i--){const s=R.sparks[i];s.life-=dt;if(s.life<=0){R.sparks.splice(i,1);continue}s.vy+=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt}
  for(let i=R.steam.length-1;i>=0;i--){const s=R.steam[i];s.life-=dt;if(s.life<=0){R.steam.splice(i,1);continue}s.x+=s.vx*dt;s.y+=s.vy*dt;s.s+=14*dt}
  for(let i=R.rings.length-1;i>=0;i--){R.rings[i].life-=dt;if(R.rings[i].life<=0)R.rings.splice(i,1)}
  for(let i=R.floats.length-1;i>=0;i--){R.floats[i].life-=dt;if(R.floats[i].life<=0)R.floats.splice(i,1)}
  for(let i=R.fbs.length-1;i>=0;i--){R.fbs[i].t+=dt;if(R.fbs[i].t>.7)R.fbs.splice(i,1)}
  for(const m of R.melts)m.t+=dt;
  for(let i=R.exps.length-1;i>=0;i--){R.exps[i].t+=dt;if(R.exps[i].t>.9)R.exps.splice(i,1)}
  R.shake=Math.max(0,R.shake-dt*45);R.flash=Math.max(0,R.flash-dt*2.2);R.hurt=Math.max(0,R.hurt-dt*1.6);R.recoil=Math.max(0,R.recoil-dt*3.5);
  if(R.endIn>0){R.endIn-=dt;if(R.endIn<=0)rEnd()}
  if(R.atk&&R.atk.kind==='charge')R.bx=(R.atk.h?chargeXH:chargeX)(Math.max(0,R.atk.pt));
  else if(!R.cn||R.cn.k!=='slide')R.bx+=(BX-R.bx)*Math.min(1,dt*3);
  if(R.hitstop>0){R.hitstop-=dt;hud();return}
  if(R.mode==='finale'){rFinale(dt);hud();return}
  if(R.mode==='space'){R.st+=dt;
    if(R.st>4.6&&!R.cardShown&&!R.outro){R.cardShown=true;rEnd()}hud();return}
  const p=R.pl;LB.hero.step(p,dt,{gesture:'block'});
  if(R.mode==='intro'){
    /* Entrée : le Veilleur arrive par la cheminée, lanterne en main ; le Colosse se pose en vol au sommet du Clocher */
    const T=R.t;
    R.introHx=-20+(PX+20)*es(clamp01(T/1.7));R.bx=BX+300*(1-es(clamp01(T/1.1)));
    if(T<1.7){const h=Math.floor(T/.32);if(h!==R.ih){R.ih=h;footfall(false)}}
    if(T>=.02&&!R.i0){R.i0=true;whoosh(.9,.06,true)}
    if(T<1.1){const fb=Math.floor(T*9/Math.PI);if(fb!==R.ifb){R.ifb=fb;whoosh(.35,.05,false)}}
    if(T>=.55&&!R.ibell){R.ibell=true;ringBell(.22,.45)} /* la cloche sonne avant l'impact : elle réagit au Colosse, pas au choc */
    if(T>=1.1&&!R.iclash){R.iclash=true;R.shake=reduce?0:18;R.flash=.5;boom(.8,.18);footfall(true);
      for(let i=0;i<46;i++){const L=rand(.5,1.1);R.sparks.push({x:BX+rand(-150,150),y:DECK-4,vx:rand(-260,260),vy:-rand(80,380),g:520,life:L,max:L,col:i%3?'#f2f6ff':'#bfeaff',sz:rand(3,7)})}
      qRing(BX,DECK);qRing(BX-120,DECK);qRing(BX+120,DECK)}
    if(!R.roared&&T>=2.9){R.roared=true;R.shake=reduce?0:10;R.flash=.3;tone(70,.9,'sawtooth',.09,60);qFloat(_('PHASE III','PHASE III'),W/2-110,120,'#ffc15a',54,1.8);roar()}
    if(T>=3.8){R.mode='play';R.boss.wait=.7;R.bx=BX}
    hud();return;
  }
  if(R.mode==='play'||R.mode==='won')rBoss(dt);
  hud();
}

function finExplode(i){
  const P=[[-20,-200],[-60,-250],[30,-150],[-30,-300],[0,-190]][i];
  const x=R.bx+P[0],y=DECK+P[1];
  R.exps.push({x,y,t:0,s:.5+.22*i});
  R.fbs.push({x,y,t:0,big:1+.45*i});
  if(i>=3)R.fbs.push({x:x+rand(-60,60),y:y+rand(-50,50),t:0,big:1.4+.3*i});
  R.flash=.35+.12*i;R.shake=reduce?0:8+3*i;
  tone(150-i*12,.55,'sawtooth',.1+.02*i,-90);boom(.6+.1*i,.12+.03*i);
  if(i===1||i===4)roar();
  qBurst(x,y,24+8*i,['#ffffff','#ffc15a','#ff7a2b','#bfeaff']);
}
function finSlash(sd){
  const x=R.bx+sd*60,y=DECK-205;(R.fbeam=R.fbeam||[]).push({sd,t:0});
  qBurst(x,y,30,['#ffffff','#bfeaff','#6fd3ff','#ffc15a']);qRing(x,y);R.exps.push({x,y,t:0,s:.5});
  R.flash=.5;R.shake=reduce?0:12;thud(1);tone(880,.4,'sine',.07,-200);tone(120,.5,'square',.09,-60);noise(.2,.12,2500,600);roar();
  qFloat(_('WING SHATTERED!','AILE BRISÉE !'),x-90,y-110,'#bfeaff',34,1.1);
}
function rFinale(dt){
  const f=R.fin;f.t+=dt;const t=f.t;
  if(!f.s0){f.s0=1;noise(.6,.22,6000,500);tone(1600,.3,'sine',.07,-1300);boom(.9,.16)}
  if(t>=.5&&!f.lp){f.lp=1;whoosh(.7,.1,false)}
  for(const w of R.fall)w.t+=dt;
  for(const b of (R.fbeam||[]))b.t+=dt;
  /* la grande cloche répond au Veilleur : son écho désarme le Colosse, la masse lui échappe des mains */
  if(t>=FIN.raise&&!f.rs){f.rs=1;whoosh(.5,.1,true);tone(90,.6,'sawtooth',.06,120)}
  if(t>=FIN.bell1&&!f.b1){f.b1=1;ringBell(.55);R.flash=.25;say(_('The Watcher raises his lantern: the great bell answers.','Le Veilleur lève sa lanterne : la grande cloche répond.'))}
  if(t>=FIN.fling&&!f.fl){f.fl=1;
    R.fmace={x:R.bx-60,y:DECK-210,a:-2.1,vx:-240,vy:-330,w:-7,b:0,land:0,t:0};
    R.shake=reduce?0:14;R.flash=.4;painCry(.7,.12);anvil();thud(1.3);
    qBurst(R.bx-60,DECK-210,36,['#ffffff','#bfeaff','#6fd3ff','#ffc15a']);qRing(R.bx-60,DECK-210);
    qFloat(_('DISARMED!','DÉSARMÉ !'),R.bx-150,DECK-330,'#bfeaff',36,1.2);
    say(_('The echo tears the mace from the Colossus\'s hands.','L\'écho arrache la masse des mains du Colosse.'));
  }
  if(R.fmace){const m=R.fmace;m.t+=dt;
    if(!m.land){
      m.vy+=1500*dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.a+=m.w*dt;
      if(m.y>=DECK-30){m.y=DECK-30;
        if(!m.b){m.b=1;m.vy=-m.vy*.32;m.vx*=.5;m.w*=.4;R.shake=reduce?0:Math.max(R.shake,10);boom(.5,.14);tone(120,.3,'square',.07,-60);
          for(let i=0;i<14;i++)R.sparks.push({x:m.x+rand(-30,30),y:DECK-4,vx:rand(-140,140),vy:-rand(20,120),g:260,life:.6,max:.6,col:'#9a8a9e',sz:rand(3,6)})}
        else{m.land=1;m.vx=0;m.vy=0;m.a=3.2;boom(.3,.08);tone(180,.2,'square',.04,-60)}
      }
    }
  }
  if(t>=FIN.cut[0]&&!f.c1){f.c1=1;R.cut=1;R.fall.push({sd:-1,t:0});finSlash(-1)}
  if(t>=FIN.cut[1]&&!f.c2){f.c2=1;R.cut=2;R.fall.push({sd:1,t:0});finSlash(1)}
  if(t>=FIN.charge&&!f.ch){f.ch=1;tone(200,1,'sawtooth',.06,600)}
  if(t>=FIN.strike&&!f.st){
    f.st=1;R.bhp=0;R.flash=1;R.shake=reduce?0:18;R.hitstop=.12;thud(1.8);
    qBurst(R.bx-20,DECK-200,50,['#ffffff','#ffc15a','#ff7a2b','#bfeaff']);qRing(R.bx-20,DECK-200);
    tone(110,.7,'square',.12,-70);painCry(2.0,.2);qFloat(_('FINAL BLOW!','COUP ULTIME !'),W/2-150,110,'#ffc15a',48,1.6);
  }
  for(let i=0;i<5;i++)if(t>=FIN.exp+i*FIN.gap&&!f['e'+i]){f['e'+i]=1;finExplode(i)}
  if(t>=FIN.collapse&&!f.cl){f.cl=1;boom(1.1,.12);whoosh(1,.07,false);say(_('The Colossus crashes down beneath the great bell.','Le Colosse s\'écrase sous la grande cloche.'))}
  if(t>=FIN.collapse+1.1&&!f.imp){
    f.imp=1;R.shake=reduce?0:20;R.flash=.4;tone(55,.9,'sine',.22,-20);boom(1.2,.22);
    for(let i=0;i<20;i++)R.steam.push({x:R.bx-200+rand(-120,120),y:DECK-4,vx:rand(-90,90),vy:-rand(20,100),life:rand(.8,1.4),max:1.4,s:rand(12,26)});
  }
  if(t>=FIN.bell&&!f.bl){f.bl=1;ringBell(.55);painCry(2.6,.12);R.flash=.35;R.shake=reduce?0:8;say(_('The Watcher raises his lantern: the great bell rings and the Colossus turns to stone.','Le Veilleur lève sa lanterne : la grande cloche sonne et le Colosse se change en pierre.'))}
  if(t>=FIN.bell+.4)for(let i=0;i<20;i++)if(R.fin.t<FIN.bell+.45&&Math.random()<.2)R.steam.push({x:R.bx-200+rand(-120,160),y:DECK-rand(20,160),vx:rand(-30,30),vy:-rand(20,60),life:rand(.8,1.4),max:1.4,s:rand(10,20)});
  if(t>=FIN.hero-.6&&!f.fn){f.fn=1;R.fanalAt=R.time;tone(520,.8,'sine',.05,200);noise(.4,.08,1200,400);say(_("The Watcher lights the Bell Tower's beacon.","Le Veilleur allume le fanal du Clocher."))}
  if(t>=FIN.hero&&!f.hs){f.hs=1;R.towerAt=[];[0,3,2,1].forEach((k,j)=>R.towerAt[k]=R.time+j*.55);tone(330,1.6,'sine',.05,0);say(_("One by one, the Spires answer.","Une à une, les Flèches répondent."))}
  if(t>=FIN.hero+.55&&!f.hs2){f.hs2=1;tone(294,1.6,'sine',.05,0)}
  if(t>=FIN.hero+1.1&&!f.hs3){f.hs3=1;tone(262,1.6,'sine',.05,0)}
  if(t>=FIN.hero+1.65&&!f.hs4){f.hs4=1;tone(349,1.6,'sine',.05,0)}
  if(t>=FIN.hero+2.2&&!f.hs5){f.hs5=1;say(_('All but one.','Toutes, sauf une.'))}
  if(t>=FIN.space){R.mode='space';R.st=0;R.outro=true;say(_('Far out at sea, the Drowned Lighthouse stays silent. End of Chapter I.','Au large, le Phare Noyé reste muet. Fin du chapitre I.'));
    OUTRO.play(()=>{if(!R)return;R.outro=false;if(R.mode==='space'&&!R.cardShown){R.cardShown=true;rEnd()}})}
}

