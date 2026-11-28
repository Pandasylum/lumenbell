function box(x,y,w,h,f,s){ctx.fillStyle=f;ctx.fillRect(x,y,w,h);if(s){ctx.strokeStyle=s;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h)}}
function poly(pts,f,s){
  ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();
  ctx.fillStyle=f;ctx.fill();if(s){ctx.strokeStyle=s;ctx.lineWidth=2;ctx.stroke()}
}
function drawEmbers(from,to,am){
  for(let i=from;i<to;i++){
    const e=G.embers[i],a=am*(.35+.35*Math.sin(G.time*2+e.ph));
    ctx.fillStyle='rgba(255,'+(140+(i%5)*18)+',60,'+a+')';
    ctx.beginPath();ctx.arc(e.x,e.y,e.s*.8,0,6.283);ctx.fill();
  }
}

function pose(){
  const b=G.boss,t=b.t,sw=Math.sin(G.time*3);
  let hand,tip,sag=40,heat=.25;
  switch(b.s){
    case 'idle':
      hand=[IDLE_HAND[0],IDLE_HAND[1]+sw*3];tip=[hand[0]-34+sw*9,hand[1]+104];sag=46;break;
    case 'windup':{
      const k=eo(clamp01(t/.35));
      hand=lerp2(IDLE_HAND,UP_HAND,k);hand[0]+=Math.sin(G.time*55)*1.6*(t/T.windup);
      const rest=[hand[0]-34,hand[1]+104];
      tip=lerp2(rest,TIP_BACK,k);tip[0]+=Math.sin(G.time*8)*5;
      sag=48;heat=.3+.7*(t/T.windup);break;}
    case 'strike':{
      const p=clamp01(t/(b.sk||T.strike));
      hand=lerp2(UP_HAND,FWD_HAND,eo(clamp01(t/.14)));
      tip=lerp2(TIP_BACK,BAR,ei(p));tip[1]-=140*Math.sin(Math.PI*p)*(1-.55*p);
      sag=-80*(1-p)+8;heat=1;break;}
    case 'rewind':{
      const k=eo(clamp01(t/.18));
      hand=lerp2(FWD_HAND,UP_HAND,k);tip=lerp2(BAR,TIP_BACK,k);tip[1]-=60*Math.sin(Math.PI*k);
      sag=-30;heat=1;break;}
    case 'rebound':{
      hand=FWD_HAND;
      const e=es(clamp01(t/T.rebound));
      tip=lerp2(BAR,HEAD,e);tip[1]-=100*Math.sin(Math.PI*e);
      sag=-40;heat=1;break;}
    case 'stagger':{
      const k=eo(clamp01(t/.5));
      hand=lerp2(FWD_HAND,IDLE_HAND,k);
      tip=lerp2(HEAD,[hand[0]-24,hand[1]+110],eo(clamp01(t/.45)));
      sag=50;break;}
    case 'release':{
      /* la boule a frappé : elle finit sa course sur le Veilleur, chaîne tendue (0,08 s), puis rebondit et revient au poing en s'enroulant */
      const hit=clamp01(t/.08),k=eo(clamp01((t-.12)/.48)),ch=[CHEST[0],CHEST[1]+10];
      hand=lerp2(FWD_HAND,IDLE_HAND,k);
      tip=lerp2(lerp2(BAR,ch,hit),[hand[0]-34,hand[1]+104],k);tip[1]-=70*Math.sin(Math.PI*clamp01((t-.1)/.4))*(1-k);
      sag=t<.12?-70:50*k-30*(1-k);heat=1-.6*k;break;}
    case 'dead':
      hand=[BX-120,342];tip=[hand[0]-70,DECK-6];sag=24;break;
    default:
      hand=[IDLE_HAND[0],IDLE_HAND[1]+sw*3];tip=[hand[0]-34+sw*9,hand[1]+104];sag=46;
  }
  return {hand,tip,sag,heat};
}

/* Signal du souffle enchaîné : halo blanc-bleu pulsant sur la tête et grand « ! » à gauche du Colosse (le souffle normal n'a que les flammes orange). */
function drawChainTell(x,y,t){
  const k=.85+.15*Math.sin(t*38);
  ctx.save();
  const g=ctx.createRadialGradient(x,y,4,x,y,70);
  g.addColorStop(0,'rgba(220,245,255,'+(.55*k)+')');g.addColorStop(1,'rgba(120,200,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,70,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(235,250,255,'+(.95*k)+')';ctx.shadowColor='#9fdcff';ctx.shadowBlur=18;
  ctx.font='900 78px '+DISPLAY;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('!',x-150,y-50);
  ctx.restore();
}
/* Signal du double crochet : « !! » orange à gauche du Colosse, plus discret que celui du souffle enchaîné. */
function drawDblTell(t){
  const k=.85+.15*Math.sin(t*30);
  ctx.save();
  ctx.fillStyle='rgba(255,176,74,'+k+')';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=14;
  ctx.font='900 54px '+DISPLAY;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('!!',BX-168,DECK-288);
  ctx.restore();
}
/* Chaîne du Colosse : « hk » va de 0 (elle est enroulée sur son torse) à 1 (déroulée dans sa main) ; le même nombre règle les maillons du torse et la longueur dans la main */
function hookStep(o,target,t){
  const dt=Math.min(.05,Math.max(0,t-(o.hl==null?t:o.hl)));o.hl=t;
  const cur=o.hv||0,sp=(target>cur?1/.45:1/.4)*dt;
  o.hv=Math.abs(target-cur)<=sp?target:cur+Math.sign(target-cur)*sp;
  return o.hv;
}
/* Colosse A9 : les 4 poses de la boule à la chaîne validées (repos, armement, frappe, arrachement).
   Colonnes : penché (rad), descente, pivot (largeur du buste), décalage épaule lointaine / proche, main lointaine depuis l'épaule (x, y).
   Le buste passe d'une pose à l'autre au rythme des états du jeu (mêmes durées, mêmes impacts). */
const COL_S=1.1; /* unités de pose (maquette x0.8) -> monde ; à 1.1 la pointe du marteau atteint le Veilleur sans étirer les bras */
const COL_P={repos:[0,0,1,0,0,-62,92],arme:[.3,0,.88,10,-24,-62,-62],frappe:[-.4,16,1.06,-16,20,-88,66],arrache:[.07,6,.95,8,-8,-84,16]};
/* Marteau à deux mains : images clés validées (colosse-marteau.js). P main proche, a angle du manche (degrés), g tête -> main proche,
   wN / wF mains sur le manche, s boule en bandoulière, ff main lointaine depuis l'épaule, r : P et a suivent le buste (rangé dans le dos). */
const MK=(()=>{const K0={lean:0,drop:0,sx:1,dF:0,dN:0,P:[94,-256],a:-62,g:50,wN:0,wF:0,s:0,ff:[-62,92],r:1};
  const K1={...K0,lean:-.04,s:1,ff:[8,104]},K2={...K1,lean:.06,dN:-10,wN:1,ff:[-30,86]};
  /* armement : manche baissé derrière le dos (référence : P [0,-300], a -15) pour que la tête reste entière à l'écran, téléphone compris */
  const K3={lean:.22,drop:0,sx:.92,dF:16,dN:-40,P:[-5,-285],a:50,g:205,wN:1,wF:1,s:1,ff:[-30,86],r:0};
  const K4={...K3,lean:-.45,drop:22,sx:1.04,dN:-60,P:[-135,-126],a:-201},K5={...K3,lean:-.12,drop:8,sx:.96,dN:-56,P:[-110,-146],a:-192};
  return {K0,K1,K2,K3,K4,K5,Pfin:[-100,-196]}})();
/* Gestes de l'attaque au marteau, en fractions de la durée de chaque état (durées du jeu inchangées) : sortie dans sw1w, rangement dans swrec / orb */
const MK_SEQ={sortie:[['K1',.28],['K2',.5],['K3',.86]],gap:[['K5',.4],['K3',1]],range:[['K5',.18],['K3',.42],['K2',.66],['K1',.83],['K0',1]],finSortie:[['K2',.35],['K3',1]]};
/* points d'impact de la tête du marteau (depuis PX, DECK) : hauteur du coup bas (1er et 3e) et du coup haut (2e) ;
   touché : centre de la tête à x, la pointe atteint le Veilleur ; bloqué : la pointe (46 unités de pose) s'arrête sur la barrière (bar) */
const MK_HIT={x:90,bas:-70,haut:-165,bar:116,pointe:46};
let colMouthW=[MOUTH[0],MOUTH[1]]; /* gueule du Colosse dans le monde (le souffle en part) */
function cpMix(A,B,k){return A.map((v,i)=>v+(B[i]-v)*k)}
function mkMix(p,q,u){const o={};for(const k in p)o[k]=Array.isArray(p[k])?p[k].map((v,i)=>v+(q[k][i]-v)*u):p[k]+(q[k]-p[k])*u;return o}
/* image d'impact : la tête du marteau sur le point visé (la main reste à portée, le manche s'oriente) */
function mkHit(Tp,P){const dx=Tp[0]-P[0],dy=Tp[1]-P[1];let a=Math.atan2(dy,dx)/Math.PI*180;if(a>-90)a-=360;return {...MK.K4,P:P.slice(),a,g:Math.min(232,Math.hypot(dx,dy))}}
function mkSeq(from,seq,u){const io=x=>x*x*(3-2*x);let prev=from,u0=0;
  for(const [k,u1] of seq){const K=typeof k==='string'?MK[k]:k;if(u<=u1)return mkMix(prev,K,io(clamp01((u-u0)/(u1-u0))));prev=K;u0=u1}
  return prev}
/* clé du marteau selon l'état du jeu (toP : monde -> pose) */
function hamKey(toP){
  const b=G.boss,t=b.t,tm=G.time,inQ=x=>x*x*x;
  /* coup i : bloqué (parade réussie, ou barrière levée pendant le coup) -> sur la barrière ; sinon -> sur le Veilleur */
  const par=[G.sw.p1,G.sw.p2,G.sw.p3];
  const hit=(i,live)=>{const blk=par[i]||(live&&G.pl.s==='act'),x=blk?MK_HIT.bar+MK_HIT.pointe*COL_S:MK_HIT.x;return mkHit(toP([PX+x,DECK+(i===1?MK_HIT.haut:MK_HIT.bas)]),MK.K4.P)};
  const last=DIFF.hard?hit(2,false):hit(1,false);let k=null;
  switch(b.s){
    case 'sw1w':k=mkSeq(MK.K0,MK_SEQ.sortie,clamp01(t/T.sw1w));k.P=[k.P[0],k.P[1]+Math.sin(tm*50)*1.5*(t/T.sw1w)];break;
    case 'sw1':k=mkMix(MK.K3,hit(0,true),inQ(clamp01(t/T.sw1)));break;
    case 'swgap':k=mkSeq(hit(0,false),MK_SEQ.gap,clamp01(t/T.swgap));if(!G.sw.p1)k.P=[k.P[0]-90/COL_S*Math.sin(Math.PI*clamp01(t/.24)),k.P[1]];break;
    case 'sw2w':k={...MK.K3,P:[MK.K3.P[0]+Math.sin(tm*50)*1.5,MK.K3.P[1]]};break;
    case 'sw2':k=mkMix(MK.K3,hit(1,true),inQ(clamp01(t/T.sw2)));break;
    case 'sw3g':k=mkSeq(hit(1,false),MK_SEQ.gap,clamp01(t/T.sw3g));if(!G.sw.p2)k.P=[k.P[0]-60/COL_S*Math.sin(Math.PI*clamp01(t/.24)),k.P[1]];break;
    case 'sw3w':k={...MK.K3,P:[MK.K3.P[0],MK.K3.P[1]+Math.sin(tm*50)*1.5]};break;
    case 'sw3':k=mkMix(MK.K3,hit(2,true),inQ(clamp01(t/T.sw3)));break;
    case 'swrec':k=mkSeq(last,MK_SEQ.range,clamp01(t/T.swrec));
      if(!(DIFF.hard?G.sw.p3:G.sw.p2)){const q=Math.sin(Math.PI*clamp01(t/.24));k.P=[k.P[0]-60/COL_S*q,k.P[1]+60/COL_S*q]}break;
    case 'orb':k=mkSeq(last,MK_SEQ.range,clamp01(t/.6));break;
    case 'fin':{if(t<1.5)break;
      const HF=mkHit(toP([HOLE_X,DECK-232+SW_LEN]),MK.Pfin);
      k=t<1.85?mkSeq(MK.K0,MK_SEQ.finSortie,clamp01((t-1.5)/.35)):t<2.0?mkMix(MK.K3,HF,inQ(clamp01((t-1.85)/.15))):HF;break;}
  }
  if(k&&G.kick&&(b.s==='swgap'||b.s==='sw3g'||b.s==='swrec'||b.s==='orb'))k.P=[k.P[0]+G.kick*30/COL_S,k.P[1]];
  return k;
}
function colBody(toP){
  const b=G.boss,t=b.t,P=COL_P,R=P.repos,A=P.arme,F=P.frappe,X=P.arrache;let p;
  switch(b.s){
    case 'windup':p=cpMix(R,A,eo(clamp01(t/.35)));p[5]+=Math.sin(G.time*55)*1.6*(t/T.windup);break;
    case 'strike':p=cpMix(A,F,es(clamp01(t/(b.sk||T.strike)*1.35)));break;
    case 'rewind':p=cpMix(F,A,eo(clamp01(t/.18)));break;
    case 'rebound':p=cpMix(F,X,es(clamp01(t/T.rebound)));break;
    case 'stagger':p=cpMix(X,R,eo(clamp01(t/.5)));break;
    case 'release':p=cpMix(cpMix(F,X,eo(clamp01(t/.28))),R,eo(clamp01((t-.28)/.32)));break; /* il se couche sur le coup, se redresse en tirant la chaîne, puis revient au repos */
    case 'dead':p=cpMix(R,F,.55);break;
    default:p=R.slice();p[6]+=Math.sin(G.time*3)*3;
  }
  /* marteau : le buste suit les images clés */
  const ham=hamKey(toP);
  if(ham)p=[ham.lean,ham.drop,ham.sx,ham.dF,ham.dN,ham.ff[0],ham.ff[1]];
  /* souffle : il se cambre pour inspirer, se jette en avant pour cracher ; rugissement : buste rejeté en arrière ; touché : il recule */
  if(b.s==='fl_in')p[0]+=.12*es(clamp01(t/Math.min(T.fli,b.fli||T.fli)));
  else if(b.s==='fl_out')p[0]+=.12-.28*eo(clamp01(t/.2));
  else if(b.s==='fl_stab')p[0]-=.16;
  else if(b.s==='fl_rec')p[0]-=.16*(1-eo(clamp01(t/.4)));
  else if(b.s==='hurt')p[0]+=.1*clamp01((b.hurtT-t)/.4);
  if(b.s==='fin'&&t<1.5)p[0]+=.22*finRecoil(t)/55;
  if(b.s!=='dead')p[1]+=Math.sin(G.time*2.2)*1.6;
  return {p,ham};
}
/* Présence du Colosse au pont (visuel seul, logique inchangée) : décalage sur le pont (ox, il laisse de l'air au bord droit du cadre),
   pas lourds entre deux attaques (foulée, durée d'un pas, levée du pied ; instants depuis le début du repos : pied lointain puis proche en avant,
   proche puis lointain en arrière), secousse et poussière à chaque pied posé ; penché menaçant au repos ; lissages (s). */
const COL_V={ox:-40,foulee:26,pas:.42,lever:13,av:[.3,.75],ar:[2.6,3.0],secousse:2.5,menace:[-.07,3,.015],lisse:.25,regard:[-.22,.16,.6]};
const CW={G:null,fF:0,fN:0,mv:null,m0:0,lt:null,lix:null,menace:0,eyes:0,look:0,dust:[],pose:0};
/* pieds posés au sol (repère du pont, entrée G.ix comprise) : un pied à la fois se lève et rattrape sa place, le corps est porté par les pieds */
function colWalk(){
  const b=G.boss,V=COL_V,tm=G.time,ix=G.ix||0;
  /* nouvelle partie (nouvel état, ou horloge revenue en arrière) : pieds remis sous le corps */
  if(CW.G!==G||(CW.lt!=null&&tm<CW.lt-.2)){Object.assign(CW,{G,fF:ix,fN:ix,mv:null,lt:null,lix:ix,menace:0,eyes:0,look:0,dust:[],pose:-1})}
  const dt=CW.lt==null?0:Math.max(0,Math.min(.05,tm-CW.lt));CW.lt=tm;
  const vix=dt>0?(ix-CW.lix)/dt:0;CW.lix=ix;
  const idle=b.s==='idle'&&G.mode==='play',S=V.foulee,t=b.t,lead=Math.max(-40,Math.min(40,vix*.18));
  const tg={f:ix+lead+(idle&&t>V.av[0]&&t<V.ar[1]?-S:0),n:ix+lead+(idle&&t>V.av[1]&&t<V.ar[0]?-S:0)};
  const lift={f:0,n:0},K={f:'fF',n:'fN'};
  if(!CW.mv){const df=Math.abs(tg.f-CW.fF),dn=Math.abs(tg.n-CW.fN);if(Math.max(df,dn)>.5){CW.mv=df>=dn?'f':'n';CW.m0=CW[K[CW.mv]]}}
  if(CW.mv){const k=CW.mv,key=K[k],d=tg[k]-CW[key],sp=Math.max(S/V.pas,Math.abs(vix)*2.2)*dt;
    if(Math.abs(d)<=sp){CW[key]=tg[k];CW.mv=null;CW.pose=tm;
      CW.dust.push({x:BX+V.ox+CW[key]+(k==='f'?-44:46),t:tm});if(!reduce)G.shake=Math.max(G.shake||0,V.secousse)}
    else{CW[key]+=Math.sign(d)*sp;const a=Math.abs(CW[key]-CW.m0),r=Math.abs(tg[k]-CW[key]);lift[k]=V.lever*Math.sin(Math.PI*clamp01(a/(a+r||1)))}}
  CW.dust=CW.dust.filter(q=>tm-q.t<.6);
  /* menace au repos, yeux qui s'embrasent avant l'attaque */
  const ease=x=>1-Math.exp(-dt/V.lisse*x);
  CW.menace+=((idle?1:0)-CW.menace)*ease(1);
  const tell=['windup','sw1w','sw2w','sw3w','fl_in','fy_roar','fy_t','rk_t'].includes(b.s);
  CW.eyes+=((tell?1:0)-CW.eyes)*ease(1.6);
  /* corps porté par les pieds (il suit l'entrée avec un léger retard) */
  const wx=Math.max(-1.3*S,Math.min(1.3*S,(CW.fF+CW.fN)/2-ix));
  const dip=CW.pose>0?3.5*Math.max(0,1-(tm-CW.pose)/.25):0,walking=CW.mv?1:0;
  return {lift,wx,dip,walking,leg:k=>CW[K[k]]-ix-wx};
}
function drawDust(){
  const ix=G.ix||0;
  for(const q of CW.dust){const u=(G.time-q.t)/.6,a=(1-u)*.5,x=q.x-ix;
    ctx.fillStyle='rgba(150,110,130,'+a+')';
    for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(x+i*(10+u*16),DECK-2-Math.abs(i)*u*5,7+u*12,3+u*4,0,0,6.283);ctx.fill()}
    ctx.fillStyle='rgba(255,170,80,'+(1-u)+')';for(let i=0;i<5;i++)ctx.fillRect(x-18+i*9,DECK-4-u*(18+i%3*9),2,2)}
}
/* ===== Ripostes de la phase I (référence ripostes-reference.js, 27/11) : visuel seul — durées, impacts, dégâts et logique inchangés =====
   Réactions de dégâts du Colosse (arrêt sur image = G.hitstop du jeu, éclair à moitié transparent sur sa silhouette, éclats, secousse = G.shake du jeu),
   rage (fissures dans chaque pièce, flammes découpées ; l'ancienne aura de flammes disparaît), fin de rage (il ploie sur ses jambes), crochet bloqué,
   gestes de lumière du Veilleur (orbe, élan, bague, halo de LB.drawWatcher). Les dessins réutilisables sont dans COLFX (28-boss-body.js). */
/* Réaction à un coup reçu, par type de coup : d / hold = retour et tenue (s, courbe COLFX.choc), le reste = amplitude à l'impact (rad, unités de pose) :
   lean penché, dx recul, tete tête, plie jambes, dN épaule proche, ff main lointaine, nn main proche, eteint ; fis fissure (fd, fh : sa courbe, keep : reste ensuite),
   fl éclair (0,07 s), ec éclats [nombre, couleurs, vitesse, graine], st étoile d'impact [rayon, durée], pt point d'impact */
const COL_H={
  tete:{wob:.05,pt:'gueule',d:.7,hold:.15,lean:.17,dx:18,tete:.2,ff:[14,-2],nn:[12,-22],fis:.3,fd:.8,fh:.25,fl:.45,ec:[16,['#ffe9a0','#ff9a35','#6a3a50'],260,5],st:[70,.2]},
  orb:{wob:.09,pt:'coeur',d:.8,hold:.25,lean:.3,dx:34,tete:.28,dN:14,ff:[34,-4],nn:[26,-46],fis:1,fd:1,fh:.4,fl:.45,ec:[26,['#ffe58a','#6a3a50','#ff9a35','#2c1534'],300,9],st:[110,.22]},
  jambe:{wob:.07,pt:'jambe',d:.8,hold:.2,lean:.2,dx:30,tete:.55,ff:[20,-14],nn:[20,-30],fis:.5,fd:.8,fh:.2,fl:.4,ec:[20,['#ff9a35','#6a3a50','#ffe58a'],270,13],st:[80,.2]},
  bague:{pt:'coeur',d:.7,hold:.9,lean:-.3,tete:-.22,plie:1,ff:[16,4],nn:[-10,6],eteint:1,fl:.45,ec:[24,['#ffe58a','#6a3a50','#2c1534'],260,31],st:[80,.2]},
  fin:{wob:.12,pt:'coeur',d:.7,hold:.35,lean:.34,tete:.36,plie:.35,fis:1,fd:1.2,fh:.6,keep:.35,fl:.6,ec:[40,['#ffe58a','#6a3a50','#ff9a35','#2c1534','#fffbea'],380,41],st:[120,.4]}
};
/* Rage : cri (roulement : il se ramasse, puis se redresse en rugissant, tout dans les 1,0 s de fy_roar), flammes (montée, puis tenue à « reste »),
   fissures (montée / descente en s), extinction des flammes à la fin de la rage, voile sombre pendant le cri */
const COL_R={cri0:.35,cri:.12,tenue:.8,fin:.2,plie:.5,sombre:.35,montee:.45,descente:.35,eteint:.15,flamme:{mont:.25,dec0:.9,dec:.6,reste:.55}};
/* Gestes de lumière du Veilleur : état du jeu -> pose de LB.drawWatcher ; le temps du jeu est replié sur les repères du geste (LB.WATCHER_T.moves : instant d'effet T,
   durée dur). Décalages (s) entre un repère et T : départ du jet de l'orbe, élan avant l'estoc, retour, retour au repos. */
const MV_S={cast:'orb',dash:'lunge',stab:'lunge',back:'lunge',ring:'ring',final:'halo'};
const MV_O={orb:{lance:.15},lunge:{elan:.23,retour:.47,repos:1.02},ring:{repos:1.15},halo:{halo0:1.1,halo1:2.9,repos:1.7}};
function mvKeys(n){
  const Tm=LB.WATCHER_T.moves[n].T,o=MV_O[n];
  if(n==='orb')return [[0,0],[T.cast,Tm-o.lance],[T.cast+T.orb,Tm]];
  if(n==='lunge')return [[0,0],[T.dash,Tm-o.elan],[T.dash+.1,Tm],[T.dash+.3,Tm+o.retour],[T.dash+.3+T.back,Tm+o.repos]];
  if(n==='ring')return [[0,0],[T.ringAt,Tm],[T.ringAt+.55,Tm+o.repos]];
  return [[0,0],[o.halo0,Tm],[o.halo1,Tm+o.repos]];
}
/* temps du geste (s depuis son début, horloge RP.clk) -> temps de la pose ; au-delà du dernier repère, le geste s'achève en temps réel */
function mvK(n,gt){
  const K=mvKeys(n),dur=LB.WATCHER_T.moves[n].dur;
  if(!(gt>0))return 0;
  for(let i=1;i<K.length;i++)if(gt<=K[i][0])return Math.min(dur,K[i-1][1]+(K[i][1]-K[i-1][1])*(gt-K[i-1][0])/(K[i][0]-K[i-1][0]));
  const L=K[K.length-1];return Math.min(dur,L[1]+gt-L[0]);
}
const RP={G:null};
function rpReset(){Object.assign(RP,{G,clk:0,pk:0,lt:null,pb:'',ps:'',prec:0,hit:null,ev:[],fyOn:false,fy0:0,fyEnd:-9,f:0,fV:0,rage:0,fin:false,rugi:false,sombre:0,mvn:'',mv0:0,orbO:null})}
let WL=null; /* centre de la lanterne du Veilleur, dans le monde (renvoyé par LB.drawWatcher) */
function rpHit(kind){RP.hit={k:kind,t0:RP.clk};RP.ev.push({k:'hit',kind,t0:RP.clk,p:null})}
/* une fois par image, avant le dessin du Colosse */
function rpStep(){
  const b=G.boss,p=G.pl,tm=G.time;
  if(RP.G!==G||(RP.lt!=null&&tm<RP.lt-.2))rpReset();
  const dt=RP.lt==null?0:Math.max(0,Math.min(.05,tm-RP.lt));RP.lt=tm;
  RP.pk=RP.clk;if(!(G.hitstop>0))RP.clk+=dt;
  const k=RP.clk,dc=k-RP.pk;
  /* coup reçu : l'état du Colosse juste avant dit lequel (tête rebondie, orbe, estoc, halo de la bague) */
  if(G.recoil>RP.prec+.05)rpHit({rebound:'tete',orb:'orb',fl_stab:'jambe',fy_cast:'bague'}[RP.pb]||'orb');
  RP.prec=G.recoil;
  if(b.s==='fin'&&b.t>=1.1&&!RP.fin){RP.fin=true;rpHit('fin')}
  /* crochet bloqué : la boule rebondit sur la barrière */
  if(RP.pb==='strike'&&(b.s==='rebound'||b.s==='rewind'||b.s==='fl_in'))RP.ev.push({k:'crochet',t0:k,p:null});
  /* cri de rage */
  if(b.s==='fy_roar'&&b.t>=COL_R.cri0&&!RP.rugi){RP.rugi=true;RP.ev.push({k:'rugi',t0:k,p:null})}
  if(b.s!=='fy_roar')RP.rugi=false;
  /* rage : fissures (RP.rage) et flammes (RP.f) tant que la fureur dure ; les flammes s'éteignent d'un coup quand elle finit */
  const fy=b.fury>0&&b.s!=='dead',F=COL_R.flamme;
  if(fy&&!RP.fyOn){RP.fyOn=true;RP.fy0=k}
  else if(!fy&&RP.fyOn){RP.fyOn=false;RP.fyEnd=k;RP.fV=RP.f}
  const u=k-RP.fy0;
  RP.f=fy?es(clamp01((u-COL_R.cri0)/F.mont))*(1-(1-F.reste)*es(clamp01((u-F.dec0)/F.dec))):RP.fV*(1-es(clamp01((k-RP.fyEnd)/COL_R.eteint)));
  RP.rage+=(fy?Math.min(1-RP.rage,dc/COL_R.montee):-Math.min(RP.rage,dc/COL_R.descente));
  /* geste de lumière : il commence avec le premier état du geste ; il s'achève au repos (états « ready ») sans que le jeu y touche */
  const mn=MV_S[p.s];
  if(mn&&(RP.mvn!==mn||!MV_S[RP.ps])){RP.mvn=mn;RP.mv0=k}
  else if(!mn&&!(p.s==='ready'&&RP.mvn&&k-RP.mv0<LB.WATCHER_T.moves[RP.mvn].dur))RP.mvn='';
  RP.ps=p.s;RP.pb=b.s;
}
/* réaction du Colosse au dernier coup reçu (amplitudes ajoutées à sa pose) */
function colReact(){
  const o={lean:0,dx:0,tete:0,plie:0,dN:0,ff:[0,0],nn:[0,0],fissure:0,flash:0,eteint:0},h=RP.hit;
  if(!h)return o;
  const R=COL_H[h.k],u=RP.clk-h.t0,C=COLFX.choc;
  if(u<0)return o;
  const c=C(u,0,R.d,R.hold);
  o.lean=(R.lean||0)*c;o.dx=(R.dx||0)*c;o.tete=(R.tete||0)*c;o.plie=(R.plie||0)*c;o.dN=(R.dN||0)*c;o.eteint=(R.eteint||0)*c;
  if(R.ff)o.ff=[R.ff[0]*c,R.ff[1]*c];
  if(R.nn)o.nn=[R.nn[0]*c,R.nn[1]*c];
  o.fissure=Math.max((R.fis||0)*C(u,0,R.fd||1,R.fh||.4),R.keep||0);
  o.flash=u<.07?R.fl:0;
  /* il est vivant : après l'impact, le buste, la tête et le recul oscillent trois fois en s'amortissant (amplitude propre à chaque coup, R.wob) */
  const wb=R.wob||0,os=u>.05?Math.exp(-3.4*(u-.05))*Math.sin((u-.05)*17):0;
  o.lean+=wb*os*1.6;o.tete+=wb*os*2.2;o.dx+=wb*os*60;
  return o;
}
/* le cri : il se ramasse, se redresse en rugissant, puis revient (tout dans fy_roar) */
function rugir(){
  const b=G.boss,R=COL_R,o={lean:0,sx:0,tete:0,plie:0,dF:0,dN:0,ff:[0,0],nn:[0,0]};
  RP.sombre=0;
  if(b.s!=='fy_roar')return o;
  const t=b.t,e=1-es(clamp01((t-R.tenue)/R.fin)),mont=es(clamp01(t/R.cri0))*e,cri=es(clamp01((t-R.cri0)/R.cri))*e;
  o.plie=R.plie*mont*(1-es(clamp01((t-R.cri0+.05)/.1)));
  o.lean=-.16*mont*(1-cri)+.17*cri;o.tete=-.2*mont*(1-cri)+.3*cri;o.sx=.08*cri;o.dF=-10*cri;o.dN=14*cri;
  o.ff=[-30*cri,-52*cri];o.nn=[34*cri,-56*cri];
  RP.sombre=R.sombre*mont;
  return o;
}
/* effets d'impact (flat, sans flou) : étoile et éclats à l'impact, gerbe de flammes du cri ; X0, Y0, s = repère du Colosse */
function drawRpEvents(rig,toW,X0,Y0,s){
  const k=RP.clk,ix=G.ix||0,sc=s/1.25;
  RP.ev=RP.ev.filter(e=>k-e.t0<1.3);
  for(const e of RP.ev){
    const u=k-e.t0;
    if(e.k==='crochet'){
      const x=BAR[0]-ix,y=BAR[1];
      if(u<.18){COLFX.etoile(ctx,x,y,52*(1-u/.3)*sc,8,.3,'#ffe9a0');COLFX.etoile(ctx,x,y,26*sc,8,.7,'#fffbea')}
      if(!reduce)COLFX.eclats(ctx,x,y,u,18,['#ffe9a0','#dcae5c','#fff6d8'],230,5,DECK+4);
    }else if(e.k==='hit'){
      const R=COL_H[e.kind];
      if(!e.p)e.p=R.pt==='coeur'?toW(rig.coeur):R.pt==='gueule'?toW(rig.gueule):toW([-20,-53]);
      const x=e.p[0],y=e.p[1];
      if(u<R.st[1]){const v=u/R.st[1];COLFX.etoile(ctx,x,y,R.st[0]*sc*(.5+v*.5)*(1-v*.6),10,.2,'#ffd66a',.4);COLFX.etoile(ctx,x,y,R.st[0]*.55*sc*(1-v),10,.5,'#fffbea')}
      if(!reduce)COLFX.eclats(ctx,x,y,u,R.ec[0],R.ec[1],R.ec[2],R.ec[3],DECK+4);
    }else if(e.k==='rugi'){
      /* enragement : une gerbe de flammes jaillit autour de lui, sur le sol et le long du corps. Plus d'anneau qui s'étend (COLFX.ondes) : il ressemblait à une attaque à parer. */
      const env=es(clamp01(u/.22))*(1-es(clamp01((u-.75)/.45))),tm=reduce?0:u;
      if(env>.01){ctx.save();ctx.translate(X0,Y0);ctx.scale(s,s);
        [[-250,0,26,150,-14],[-205,0,30,190,-18],[-150,0,26,150,-10],[-96,0,22,110,-6],[96,0,22,110,6],[150,0,26,160,10],[205,0,30,200,18],[250,0,26,150,14],[-170,-170,20,110,-16],[170,-170,20,120,16],[-130,-290,18,90,-12],[140,-300,18,90,12]]
          .forEach(([x,y,w,h,l],i)=>COLFX.flamme(ctx,x,y,w,h*env*(.85+.15*Math.sin(tm*18+i*1.7)),l,tm*14+i*1.9));
        ctx.restore()}
      if(!reduce)COLFX.eclats(ctx,X0,Y0-4,u,34,['#ff9a35','#6a3a50','#d4501f'],380*sc,21,DECK+4);
    }
  }
}
function drawSombre(){const a=RP.G===G?RP.sombre:0;if(a>.01){ctx.fillStyle='rgba(40,4,14,'+a+')';ctx.fillRect(0,0,W,H)}}
function drawBoss(){
  const b=G.boss,pz=pose(),t=G.time;
  rpStep();
  const R=colReact(),RU=rugir();
  let dx=0,dy=0;
  if(b.s==='stagger'||b.s==='orb'||b.s==='hurt'||b.s==='fy_roar')dx=Math.sin(t*38)*3*clamp01(1-b.t/.6);
  if(b.s==='hurt')dy=Math.min(12,b.t*60)*clamp01((b.hurtT-b.t)/.4);
  if(b.s==='fin'){const T=b.t;dx=finRecoil(T)+(T<1.1?Math.sin(t*50)*3:T<1.5?Math.sin(t*44)*4:0);dy=T>=1.1&&T<1.5?-10*Math.sin(Math.PI*(T-1.1)/.4):0;
    if(T>=2.25){const u=clamp01((T-2.25)/.45);dx=finRecoil(T)+(HOLE_X-BX-finRecoil(T))*es(u);dy=-90*Math.sin(Math.PI*Math.min(u,1)*.75);if(T>=2.55){const fq=T-2.55;dy+=fq*fq*700+fq*80}}}
  if(b.s==='dead')dy=Math.min(56,b.t*150);
  dx+=R.dx*COL_S; /* recul au coup reçu */
  const warm=(b.s==='windup'||b.s==='strike'||b.s.startsWith('sw')||b.s.startsWith('fl_'))?1.25:(b.fury?1.7:1);
  /* état de la chaîne conservé (hookStep) : la masse reste au poing, la bandoulière reste sur le torse */
  const hkT=(b.s==='windup'||b.s==='strike'||b.s==='rebound'||b.s==='rewind'||b.s==='lift'||b.s==='hold'||b.s==='slam'||b.s==='release')?1:0;hookStep(b,hkT,t);
  const jaw=(G.mode==='intro'&&G.it>3.0&&G.it<3.9)?14:b.s==='fl_in'?14*clamp01(b.t/Math.min(T.fli,b.fli||T.fli)):(b.s==='fl_out'||b.s==='fy_roar')?14:0;
  const wk=colWalk(),wx=wk.wx;
  const X0=BX+COL_V.ox+wx+dx,Y0=DECK+dy,s=COL_S,toP=q=>[(q[0]-X0)/s,(q[1]-Y0)/s],toW=q=>[X0+q[0]*s,Y0+q[1]*s];
  const cb=colBody(toP),p=cb.p,tip=[pz.tip[0]+dx,pz.tip[1]+dy],MN=COL_V.menace,m=CW.menace;
  p[0]+=R.lean+RU.lean;p[2]+=RU.sx;p[3]+=RU.dF;p[4]+=R.dN+RU.dN;p[5]+=R.ff[0]+RU.ff[0];p[6]+=R.ff[1]+RU.ff[1];
  p[0]+=MN[0]*m;p[1]+=MN[1]*m+Math.sin(t*2.2)*1.4*m-(wk.lift.f+wk.lift.n)*.3/s+wk.dip/s;p[0]-=.035*wk.walking*Math.sign(-(G.ix||0)||1);p[2]+=MN[2]*m*Math.sin(t*2.2);
  /* regard : la tête se tourne vers le Veilleur (il le suit quand il est soulevé) */
  {const R=COL_V.regard,hx=X0-40*s,hy=Y0-236*s,vx=G.pl.x,vy=DECK-liftAmt()-90,d=Math.hypot(vx-hx,vy-hy)||1;
   const tg=Math.max(R[0],Math.min(R[1],-Math.asin((vy-hy)/d)*R[2]))*(b.s==='dead'?0:1);CW.look+=(tg-CW.look)*.12}
  const lg=k=>Math.max(-45,Math.min(45,wk.leg(k)/s));
  const legs={f:[lg('f'),wk.lift.f/s,-wk.lift.f*.004],n:[lg('n'),wk.lift.n/s,-wk.lift.n*.004]};
  const trail=b.s==='sw1'||b.s==='sw2';if(!trail)G.swTrail.length=0;
  /* flammes de rage découpées, derrière lui (l'ancienne aura disparaît) */
  if(RP.f>.01){ctx.save();ctx.translate(X0,Y0);ctx.scale(s,s);COLFX.rageDerriere(ctx,reduce?0:t,RP.f);ctx.restore()}
  if(Math.abs(dy)<60)COLOSSE.ombres(ctx,{fx:legs.f[0],fl:legs.f[1],fa:legs.f[2],nx:legs.n[0],nl:legs.n[1],na:legs.n[2],plie:R.plie+RU.plie},X0,DECK,s,1-Math.min(1,Math.abs(dy)/60));   /* ombres de contact : ses deux pieds pèsent sur le pont */
  ctx.save();ctx.translate(X0,Y0);ctx.scale(s,s);
  const rig=COLOSSE.draw(ctx,{lean:p[0],drop:p[1],sx:p[2],dF:p[3],dN:p[4],off:[p[5],p[6]],ham:cb.ham,legs,look:CW.look,eyes:CW.eyes,breath:t,smoke:.8+.6*CW.menace,
    plie:R.plie+RU.plie,tete:R.tete+RU.tete,nn:[R.nn[0]+RU.nn[0],R.nn[1]+RU.nn[1]],fissure:R.fissure,rage:RP.rage,eteint:R.eteint,flash:R.flash,
    tip:toP(tip),sag:pz.sag/s,heat:pz.heat,t,warm,jaw,hurt:G.recoil>.3,wound:G.wound,
    back:applyM=>{
      /* ailes dans le dos : celles de la phase III (maquette colosse-clocher.js, calques cuits à la première image), attachées au buste */
      COLOSSE.ailes(ctx,{lean:p[0],drop:p[1],sx:p[2],plie:R.plie+RU.plie},{bat:reduce?0:Math.sin(t*1.8)*.03});
      /* traînée du marteau (main proche -> tête), dans le repère du monde */
      ctx.save();ctx.scale(1/s,1/s);ctx.translate(-X0,-Y0);
      for(let i=1;i<G.swTrail.length;i++){
        const A=G.swTrail[i-1],B=G.swTrail[i];
        ctx.fillStyle='rgba(255,170,70,'+(i/G.swTrail.length*.4)+')';
        ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(A[2],A[3]);ctx.lineTo(B[2],B[3]);ctx.lineTo(B[0],B[1]);ctx.closePath();ctx.fill();
      }
      ctx.restore();
    },
    front:rig=>{if(trail){const a=toW(rig.P),h=toW(rig.head);G.swTrail.push([a[0],a[1],h[0],h[1]]);if(G.swTrail.length>7)G.swTrail.shift()}}});
  ctx.restore();
  if(RP.f>.01){ctx.save();ctx.translate(X0,Y0);ctx.scale(s,s);COLFX.rageSol(ctx,reduce?0:t,RP.f);ctx.restore()}
  drawDust();
  drawRpEvents(rig,toW,X0,Y0,s);
  const mw=toW(rig.mouth);colMouthW=[mw[0]+(G.ix||0),mw[1]];
  if(b.s==='fl_in'||b.s==='fl_out')faceFire(mw[0]-4,mw[1]-2,b.s==='fl_in'?es(clamp01(b.t/Math.min(T.fli,b.fli||T.fli))):1-es(clamp01(b.t/.5)),b.s==='fl_in'?b.t:1);
  /* chaleur au poing lointain pendant l'attaque de la masse */
  const h=toW(rig.fa.W);
  if(pz.heat>.5){
    const rg=ctx.createRadialGradient(h[0],h[1],2,h[0],h[1],34);
    rg.addColorStop(0,'rgba(255,190,90,'+(.55*pz.heat)+')');rg.addColorStop(1,'rgba(255,120,40,0)');
    ctx.fillStyle=rg;ctx.beginPath();ctx.arc(h[0],h[1],34,0,6.283);ctx.fill();
  }
  if(b.s==='strike'||b.s==='rebound'||b.s==='rewind'){
    G.trail.push([tip[0],tip[1]]);if(G.trail.length>7)G.trail.shift();
  }else G.trail.length=0;
  G.trail.forEach((q,i)=>{
    ctx.fillStyle='rgba(255,170,70,'+(i/G.trail.length*.45)+')';
    ctx.beginPath();ctx.arc(q[0],q[1],3+i*.9,0,6.283);ctx.fill();
  });
}

function drawPlayer(){
  const p=G.pl,lift=liftAmt(),up=p.s==='act'||p.s==='cast'||p.s==='ring'||p.s==='final';
  let r=up?clamp01(p.t/.08):0;
  ctx.fillStyle='rgba(0,0,0,.38)';
  ctx.beginPath();ctx.ellipse(p.x,DECK+1,30*(1-lift/400),5,0,0,6.283);ctx.fill();

  /* le Veilleur commun (LB.drawWatcher) ; la phase donne sa géométrie : bâton planté, garde. Les ripostes (orbe, élan, bague, dernier coup) passent par les poses
     de lumière orb / lunge / ring / halo : le temps du jeu est replié sur les repères du geste (mvK), les états et les durées du jeu ne changent pas. */
  const mvn=RP.G===G?RP.mvn:'',mvk=mvn?mvK(mvn,RP.clk-RP.mv0):0;
  const dashing=p.s==='dash'||p.s==='stab'||p.s==='back',low=p.s==='down'||p.s==='hurt';
  /* garde commune (LB.WATCHER_REST) : géométrie de la pose partagée « block » (garde levée, r = levée) ; les poses de lumière portent la leur */
  const Q=LB.WATCHER_POSES.block(r),hand=Q.hand,sb=Q.staff[0],st=Q.staff[1];
  const pose=mvn||(up?(p.s==='act'?'block':'cast'):dashing?'counter':low?(p.s==='down'?'down':'hurt'):'idle');
  const b=G.boss,ring=(b.s==='lift'&&b.t>=.12)||b.s==='hold'||b.s==='slam';
  const wo=LB.drawWatcher(ctx,p.x,DECK-lift-(G.ib||0),pose,G.time,{
    k:mvn?mvk:undefined,
    dx:0,dy:0,sx:G.mode==='intro'?G.sx:1,
    rot:lift>0||p.s==='grabbed'?.42*lift/LIFT_MAX+(p.s==='grabbed'?Math.sin(G.time*22)*.03:0):0,
    rot2:low?.12:0,sy:low?.82:1,
    breath:pose==='idle'&&G.mode!=='intro'&&lift<=0&&p.s!=='grabbed',
    hand:mvn?undefined:hand,staff:mvn?undefined:[sb,st],glow:mvn?undefined:up?1:.25,
    lanternCol:mvn?undefined:LB.watcherLanternCol(p,up),
    fx:mvn==='lunge'||mvn==='halo', /* l'orbe et l'onde de la bague sont dessinées par la phase (drawOrb, drawRing), à leurs vraies cibles */
    anim:mvn==='lunge'?{x:0}:undefined, /* l'estoc déplace déjà le Veilleur (p.x) : la pose ne le déplace pas une seconde fois */
    inFrame:()=>{
      if(ring){
        ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=10;
        ctx.strokeStyle='#ff9a3c';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-58,27,7,0,0,6.283);ctx.stroke();
        ctx.restore();
      }
    }
  });
  WL=wo&&wo.lx!=null?[wo.lx,wo.ly]:null;
}

function drawBarrier(){
  const p=G.pl;if(p.s!=='act')return;
  LB.drawBlock(ctx,PX,DECK,p.t,HD('block').act);
}

/* Repère d'aide commun (LB.cue, shared/js/28-ui.js) : barre au-dessus du Veilleur en Normal et en Difficile (orange tant que le
   blocage n'est pas ouvert, bleue pendant la fenêtre), cercle qui se resserre en Facile. Approche affichée : LB.CUE_T.lead. */
function drawHints(){
  if(G.mode!=='play'||!LB.help.on())return;
  const b=G.boss,p=G.pl;
  /* repère de timing : barre au-dessus de la tête, ou en Facile un cercle qui se resserre autour du Veilleur (bleu = fenêtre de blocage) */
  const cue=(k,blue)=>{
    if(DIFF.easy){LB.cue.ring(ctx,PX+10,DECK-100,blue?40+22*clamp01(k):110-48*clamp01(k),blue);return}
    LB.cue.bar(ctx,PX,DECK-206,k,blue);
  };
  if(['sw1w','sw1','swgap','sw2w','sw2','sw3g','sw3w','sw3'].includes(b.s)){
    const hit=+b.s.charAt(2),wait=[T.sw1w,T.sw2w,T.sw3w][hit-1],strike=[T.sw1,T.sw2,T.sw3][hit-1];
    if(b.s!=='swgap'&&b.s!=='sw3g'){
      const tl=wait+strike;
      const ela=b.s.endsWith('w')?b.t:wait+b.t;
      const rem=Math.max(0,tl-ela),inWin=rem<=HD('block').act;
      const k=inWin?rem/HD('block').act:ela/(tl-HD('block').act);
      cue(k,inWin);
    }
    const nsw=DIFF.hard?3:2;
    for(let i=0;i<nsw;i++){
      const ok=[G.sw.p1,G.sw.p2,G.sw.p3][i],x=PX+(i-(nsw-1)/2)*18,y=DECK-220;
      ctx.beginPath();ctx.arc(x,y,5,0,6.283);
      if(ok){ctx.fillStyle='#6fd3ff';ctx.fill()}
      else{ctx.strokeStyle='rgba(240,232,223,.6)';ctx.lineWidth=2;ctx.stroke()}
    }
  }
  if(b.s==='fl_in'||b.s==='fl_out'){
    const fli=b.fli||T.fli,tl=fli+T.flo,ela=b.s==='fl_in'?b.t:fli+b.t;
    const rem=Math.max(0,tl-ela),inWin=rem<=T.flwin;
    const k=inWin?rem/T.flwin:ela/(tl-T.flwin);
    cue(k,inWin);
  }
  if(G.fy&&(['fy_roar','fy_t','fy_j','fy_gap','rk_t','rk_j'].includes(b.s)||b.fyb)){
    const F=G.fy,n=F.seq.length;
    if(b.s==='fy_t'||b.s==='fy_j'||b.s==='rk_t'||b.s==='rk_j'){
      const rk=b.s==='rk_t'||b.s==='rk_j',t1=rk?.5:T.fyt,tl=t1+(rk?.55:.3);
      const ela=(b.s==='fy_t'||b.s==='rk_t')?b.t:t1+b.t;
      const rem=Math.max(0,tl-ela),inWin=rem<=HD('block').act;
      const k=inWin?rem/HD('block').act:ela/(tl-HD('block').act);
      cue(k,inWin);
    }
    for(let i=0;i<n;i++){
      const x=PX+(i-(n-1)/2)*18,y=DECK-220;
      ctx.beginPath();ctx.arc(x,y,5,0,6.283);
      if(i<F.i&&F.ok[i]){ctx.fillStyle='#6fd3ff';ctx.fill()}
      else if(i<F.i){ctx.fillStyle='#ff5252';ctx.fill()}
      else{ctx.strokeStyle='rgba(240,232,223,.6)';ctx.lineWidth=2;ctx.stroke()}
    }
  }
  if(b.s==='windup'||b.s==='strike'){
    const k=b.s==='windup'?b.t/T.windup:1-b.t/(b.sk||T.strike);
    const col=b.s==='windup'?'rgba(255,122,43,.85)':'#6fd3ff';
    cue(k,b.s==='strike');
  }
  LB.drawRecoveryBar(ctx,PX,DECK,p); /* barre de récupération : repère d'aide, jamais rouge (la lanterne l'est) */
}

function drawFx(){
  for(const s of G.sparks){ctx.globalAlpha=clamp01(s.life/s.max);ctx.fillStyle=s.col;ctx.fillRect(s.x,s.y,s.sz,s.sz)}
  ctx.globalAlpha=1;
  for(const r of G.rings){
    const k=1-r.life/r.max;
    ctx.strokeStyle='rgba(191,234,255,'+(1-k)+')';ctx.lineWidth=4*(1-k)+1;
    ctx.beginPath();ctx.arc(r.x,r.y,10+k*70,0,6.283);ctx.stroke();
  }
  ctx.textAlign='center';ctx.lineJoin='round';
  for(const f of G.floats){
    ctx.globalAlpha=clamp01(f.life/f.max*1.5);
    const u=1-f.life/f.max,y=f.y-u*26;
    ctx.font='800 '+Math.round((f.sz||38)*(1+.45*Math.max(0,1-u*7)))+'px '+DISPLAY; /* le mot « claque » : gros à l'impact, puis se pose */
    ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.7)';ctx.strokeText(f.txt,f.x,y);
    ctx.fillStyle=f.col;ctx.fillText(f.txt,f.x,y);
  }
  ctx.globalAlpha=1;
}

/* jets de flammes (souffle, fureur) : le jet découpé commun (COLFX.jet), aplats nets comme le reste du Colosse */
function flameShape(front,al,wide,M0){COLFX.jet(ctx,M0||colMouthW,front,20+wide*50,reduce?0:G.time,al)}
function drawFlame(){
  const b=G.boss;
  let front=null,al=1,wide=1;
  if(b.s==='fl_out'){const q=clamp01(b.t/T.flo);front=lerp2(colMouthW,BAR,es(q));wide=.4+.6*q}
  else if(b.s==='fl_stab'&&b.t<.25){front=BAR;al=1-b.t/.25}
  else if(b.s==='fl_rec'&&b.t<.45){front=lerp2(BAR,CHEST,eo(clamp01(b.t/.15)));al=1-clamp01((b.t-.15)/.3)}
  if(front)flameShape(front,al,wide);
}
function flameJet(o,front,al,wide){COLFX.jet(ctx,o,front,14+wide*30,reduce?0:G.time,al)}
/* fureur, annonce d'un jet : une fissure de braise s'ouvre dans la pierre du Colosse et aspire les braises (aplats nets, sans dégradé) */
function jetCharge(o,k,t){
  const r=6+22*k;let sd=11;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='miter';
  [[9,'#12040e'],[5,'#e9561b'],[1.8,'#ffe08a']].forEach(([w,col],j)=>{sd=11;ctx.strokeStyle=col;ctx.lineWidth=w*(.5+.5*k);ctx.beginPath();
    for(let i=0;i<5;i++){const an=i*1.2566+rn()*.5,L=r*(1+rn()*.8);ctx.moveTo(o[0],o[1]);ctx.lineTo(o[0]+Math.cos(an+.3)*L*.5,o[1]+Math.sin(an+.3)*L*.5);ctx.lineTo(o[0]+Math.cos(an)*L,o[1]+Math.sin(an)*L)}ctx.stroke()});
  COLFX.etoile(ctx,o[0],o[1],(8+12*k)*(.85+.15*Math.sin(t*30)),8,t*2,'#ff9a35',.45);
  COLFX.etoile(ctx,o[0],o[1],(4+7*k)*(.85+.15*Math.sin(t*30+1)),8,-t*2,'#fff6d8',.45);
  for(let i=0;i<3;i++)COLFX.flamme(ctx,o[0]+(i-1)*9,o[1]+6,5+3*k,(8+26*k)*(.8+.2*Math.sin(t*16+i*2)),(i-1)*6,t*14+i);
  if(!reduce)for(let i=0;i<12;i++){const an=i*2.4,ph=(t*1.8+i*.137)%1,d=(1-ph)*(70+30*k)+8,x=o[0]+Math.cos(an)*d,y=o[1]+Math.sin(an)*d*.8,s=2+3*ph;
    COLFX.poly(ctx,[[x,y-s],[x+s*.7,y],[x,y+s],[x-s*.7,y]],i%3?'#ff9a35':'#ffe08a')}
  ctx.restore();
}
function drawJets(){
  const b=G.boss,F=G.fy,t=reduce?0:G.time;
  if(F&&b.s==='fy_t')jetCharge(JET_O[F.i%4],clamp01(b.t/T.fyt),t);
  if(F&&b.s==='fy_j'){
    const q=clamp01(b.t/.3),o=JET_O[F.i%4];
    flameJet(o,lerp2(o,BAR,es(q)),1,.3+.7*q);
  }
  if(G.jf)flameJet(G.jf.o,BAR,G.jf.t/.22,1);
}
/* météore de la fureur : la nuit se fend d'une faille de braise, puis un bloc de la pierre du Colosse, veiné de feu, tombe en traînant des flammes découpées */
function meteorRock(x,y,rot,sc){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(sc,sc);
  const S=[[-28,-8],[-16,-27],[8,-30],[27,-11],[25,14],[7,29],[-19,23]];
  COLFX.poly(ctx,S.map(p=>[p[0]*1.12,p[1]*1.12]),'#12040e');COLFX.poly(ctx,S,'#2c1534');
  COLFX.poly(ctx,[[-16,-27],[8,-30],[4,-6],[-12,-4]],'#3a1b38');COLFX.poly(ctx,[[-28,-8],[-16,-27],[-12,-4],[-19,23]],'rgba(178,82,92,.45)');
  COLFX.poly(ctx,[[4,-6],[27,-11],[25,14],[7,29]],'rgba(7,0,18,.5)');
  ctx.lineCap='round';ctx.lineJoin='round';
  [[5,'#e9561b'],[1.8,'#ffc27a']].forEach(([w,col])=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(-14,-16);ctx.lineTo(-2,-4);ctx.lineTo(-8,8);ctx.lineTo(4,20);ctx.moveTo(-2,-4);ctx.lineTo(14,-10);ctx.moveTo(-8,8);ctx.lineTo(-20,12);ctx.stroke()});
  ctx.restore();
}
function drawRock(){
  const b=G.boss,t=reduce?0:G.time;
  const S=[RKX[b.rki||0],RK_S[1]];
  if(b.s==='rk_t'){
    const k=clamp01(b.t/.5),x=S[0],w=40+120*k;let sd=23;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
    const P=[];for(let i=0;i<=8;i++)P.push([x-w+2*w*i/8,10+(i%2?14:-2)*k+rn()*6]);
    ctx.save();ctx.lineCap='round';ctx.lineJoin='miter';
    [[16,'#12040e'],[10,'#8e2418'],[5,'#e9561b'],[2,'#ffe08a']].forEach(([lw,col])=>{ctx.strokeStyle=col;ctx.lineWidth=lw*(.4+.6*k);ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke()});
    /* flammes qui pendent de la faille */
    ctx.save();ctx.scale(1,-1);
    for(let i=1;i<8;i+=2)COLFX.flamme(ctx,P[i][0],-P[i][1]+2,7+5*k,(16+40*k)*(.8+.2*Math.sin(t*15+i)),Math.sin(t*3+i)*6,t*13+i);
    ctx.restore();
    for(let i=0;i<9;i++){const ex=x-w*.8+i*w*.2+Math.sin(t*3+i)*6,ey=20+((t*150+i*57)%150),s=2.5+(i%3);
      COLFX.poly(ctx,[[ex,ey-s],[ex+s*.7,ey],[ex,ey+s],[ex-s*.7,ey]],i%2?'#ffe08a':'#ff9a35')}
    ctx.restore();
  }
  if(b.s==='rk_j'){
    const q=clamp01(b.t/.55),pos=lerp2(S,RK,ei(q));
    /* traînée : rubans de flammes découpées qui s'amincissent derrière le bloc */
    const pts=[];for(let i=0;i<=9;i++){const qq=Math.max(0,q-i*.035);pts.push(lerp2(S,RK,ei(qq)))}
    [[30,'#8e2418'],[22,'#d4501f'],[13,'#ff9a35'],[5,'#ffe08a']].forEach(([w,col])=>{const g=[],d=[];
      pts.forEach((p,i)=>{const nx=pts[Math.max(0,i-1)],pv=pts[Math.min(pts.length-1,i+1)],an=Math.atan2(pv[1]-nx[1],pv[0]-nx[0]),ww=w*(1-i/pts.length)*(i%2?1.15:.8);
        g.push([p[0]-Math.sin(an)*ww,p[1]+Math.cos(an)*ww]);d.push([p[0]+Math.sin(an)*ww,p[1]-Math.cos(an)*ww])});
      COLFX.poly(ctx,[...g,...d.reverse()],col)});
    meteorRock(pos[0],pos[1],G.time*5,1);
    for(let i=0;i<3;i++)COLFX.flamme(ctx,pos[0]+(i-1)*14,pos[1]-18,8,(22+10*Math.sin(t*17+i))*(1+q*.3),-14,t*15+i,.9);
  }
}
function drawRing(){
  const R=G.ringFx;if(!R)return;
  /* contre de la 1re rage, en trois temps (1,3 s, aplats nets) :
     1) la bague frappe le sol : étoile et lames de lumière en éventail, fissure lumineuse qui court jusqu'au Colosse, trois croissants décalés qui grandissent ;
     2) à l'arrivée : flash, colonne de lumière, lames dans toutes les directions ;
     3) ses flammes de rage sont arrachées et montent en tourbillonnant, éclats de pierre. */
  const t=R.t,tm=reduce?0:t,x0=G.pl.x+34,xe=BX-80,e=es(clamp01(t/.55)),xf=x0+(xe-x0)*e,fade=1-clamp01((t-.55)/.5);
  if(t<.3){const u=t/.3;COLFX.etoile(ctx,x0,DECK-8,130*(1-u*.6),12,.2,'#ffd66a',.4);COLFX.etoile(ctx,x0,DECK-8,60*(1-u),12,.5,'#fffbea');
    for(let i=0;i<9;i++){const a=-3.14+i*.39+.2,L=(60+40*(i%3))*(1-u*.5);fdEnt(ctx,x0,DECK-4,x0+Math.cos(a)*L,DECK-4+Math.sin(a)*L*.9,7,i%2?'#ffe9a0':'#d9a23c')}}
  /* fissure de lumière dans le tablier */
  if(t<1&&fade>0){ctx.save();ctx.globalAlpha=fade;ctx.lineJoin='round';ctx.lineCap='round';
    for(const [col,w] of [['rgba(255,214,110,.6)',9],['#ffe9a0',5],['#fffbea',2]]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,DECK-2);for(let x=x0+26,i=1;x<xf;x+=26,i++)ctx.lineTo(x,DECK-2+((i*37)%7-3)*1.6);ctx.lineTo(xf,DECK-2);ctx.stroke()}
    ctx.restore()}
  /* trois croissants décalés */
  for(let k=0;k<3;k++){const q=clamp01((t-k*.07)/.55);if(q<=0||q>=1)continue;const x=x0+(xe-x0)*es(q),rad=26+(80+30*k)*q,cy=DECK-rad*.62;
    ctx.save();ctx.globalAlpha=1-q*q*q;fdCroissant(ctx,x,cy,0,rad,'rgba(255,214,110,.55)',.5);fdCroissant(ctx,x,cy,0,rad*.86,'#ffe9a0',.42);fdCroissant(ctx,x,cy,0,rad*.6,'#fffbea',.3);ctx.restore()}
  /* arrivée sur le Colosse */
  if(t>=.55){const u=clamp01((t-.55)/.55),ga=1-u;
    ctx.save();ctx.globalAlpha=.7*ga;COLFX.poly(ctx,[[xe-26*ga,DECK],[xe-8*ga,-10],[xe+8*ga,-10],[xe+26*ga,DECK]],'rgba(255,214,110,.55)');COLFX.poly(ctx,[[xe-10*ga,DECK],[xe-3*ga,-10],[xe+3*ga,-10],[xe+10*ga,DECK]],'#fffbea');ctx.restore();
    if(u<.7){const v=u/.7;COLFX.etoile(ctx,xe,DECK-120,210*(1-v*.7),14,.1,'#ffe58a',.4);COLFX.etoile(ctx,xe,DECK-120,100*(1-v),14,.4,'#fffbea',.4)}
    ctx.save();ctx.globalAlpha=ga;for(let i=0;i<12;i++){const a=i*6.283/12+.2,L=(80+60*(i%3))*es(clamp01(u*2.2));fdEnt(ctx,xe,DECK-120,xe+Math.cos(a)*L,DECK-120+Math.sin(a)*L,9,i%2?'#ffe9a0':'#ff9a35')}ctx.restore();
    /* flammes de rage arrachées : elles montent en tourbillonnant et s'éteignent */
    for(let i=0;i<8;i++){const fx=BX-120+i*30+Math.sin(tm*9+i)*10*u,fy=DECK-30-(i%3)*55-u*(120+40*(i%2)),f=1-u;COLFX.flamme(ctx,fx,fy,12+(i%3)*3,(70+30*(i%3))*f,(i%2?9:-9),tm*14+i*1.9,Math.max(0,f))}
    if(!reduce){COLFX.eclats(ctx,xe,DECK-2,t-.55,26,['#ffe58a','#654055','#ff9a35','#2c1534'],360,17,DECK+2,800*.38);COLFX.eclats(ctx,x0,DECK-2,t,12,['#ffe58a','#654055'],220,19,DECK+2,800*.38)}}
}
const HOLE_X=BX-170; /* le trou s'ouvre devant le Colosse, là où frappe le marteau */
function finRecoil(t){return t<1.1?0:t<1.35?55*eo((t-1.1)/.25):55-25*es(clamp01((t-1.35)/.6))}
/* Brèche de fin de phase I : fissures, blocs de tablier qui basculent, bords de maçonnerie éclairés par dessous, colonne de lumière de la Fonderie.
   Formes fixes (tirées une fois), aucune ombre portée ni filtre ; les durées restent celles de b.t (impact à 2.0, ouverture en .22 s). */
const BREACH=(()=>{
  const HW=125,ROW=16,NR=Math.ceil((H-DECK)/ROW);
  const rn=s=>()=>(s=(s*16807)%2147483647)/2147483647;
  const r=rn(41);
  const JL=Array.from({length:NR+1},()=>r()*2-1),JR=Array.from({length:NR+1},()=>r()*2-1);
  const BW=Array.from({length:NR},(_,i)=>[12+r()*10,12+r()*10]);
  /* fissures : parties du point de frappe, 4 segments irréguliers chacune */
  const CR=[-2.9,-2.5,-2.1,-1.7,-1.4,-.5,-.1,.25,.65,1.05,1.6].map((an,i)=>{const L=(i%2?110:190)*(.7+r()*.5),pts=[[0,0]];let x=0,y=0;for(let k=1;k<=4;k++){const a2=an+(r()-.5)*.7,l=L/4*(.7+r()*.6);x+=Math.cos(a2)*l;y+=Math.sin(a2)*l*.45;pts.push([x,y])}return pts});
  /* blocs : x relatif à la demi-largeur, largeur, épaisseur, vitesse, rotation, retard, dérive, parapet */
  const BLK=[[-.78,44,30,40,1.2,.02,-26,0],[-.42,52,34,-60,-1.6,.08,-12,1],[-.1,48,30,20,.9,0,8,0],[.2,56,34,-30,-1.1,.06,14,1],[.52,46,30,50,1.5,.03,22,0],[.8,42,34,10,-.8,.1,30,0]];
  const N_EMB=26,N_DUST=18;
  const EMB=Array.from({length:N_EMB},()=>({xo:r()*2-1,ph:r(),sp:.18+r()*.22,w:r()*6.28}));
  const DUS=Array.from({length:N_DUST},()=>({xo:r()*2-1,v:.6+r()*.8,s:1.5+r()*1.8}));
  let sprCol,sprGl;
  function sprites(){
    if(sprCol)return;
    sprCol=LB.cacheLayer(96,256,c=>{c.fillStyle=(g=>{g.addColorStop(0,'rgba(255,150,60,0)');g.addColorStop(.55,'rgba(255,160,70,.5)');g.addColorStop(1,'rgba(255,200,120,.95)');return g})(c.createLinearGradient(0,0,0,256));c.fillRect(0,0,96,256);
      c.globalCompositeOperation='destination-in';const h=c.createLinearGradient(0,0,96,0);h.addColorStop(0,'rgba(0,0,0,0)');h.addColorStop(.5,'rgba(0,0,0,1)');h.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=h;c.fillRect(0,0,96,256)},{k:1});
    sprGl=LB.cacheLayer(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,200,110,1)');g.addColorStop(.35,'rgba(255,130,50,.45)');g.addColorStop(1,'rgba(255,90,30,0)');c.fillStyle=g;c.fillRect(0,0,128,128)},{k:1});
  }
  const edgeX=(i,side,hw)=>HOLE_X+side*hw*(1+(side<0?JL[i]:JR[i])*.07);
  function draw(q){
    sprites();
    const k=es(clamp01(q/.22)),hw=HW*k,x0=HOLE_X-hw,x1=HOLE_X+hw,tt=G.time;
    /* 1. fissures sur le tablier, du point de frappe vers l'extérieur */
    const cg=es(clamp01(q/.18));
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    CR.forEach(pts=>{
      for(let pass=0;pass<2;pass++){
        ctx.strokeStyle=pass?'rgba(255,170,90,.75)':'#1c1026';ctx.lineWidth=pass?1.2:3;
        ctx.beginPath();ctx.moveTo(HOLE_X,DECK+3+pass*.8);
        const n=Math.max(1,Math.ceil(4*cg));for(let i=1;i<=n;i++){const f=i===n?cg*4-(n-1):1,p0=pts[i-1],p1=pts[i];ctx.lineTo(HOLE_X+p0[0]+(p1[0]-p0[0])*Math.min(1,f),DECK+3+pass*.8+p0[1]+(p1[1]-p0[1])*Math.min(1,f))}
        ctx.stroke();
      }
    });
    ctx.restore();
    /* éclair de braise au point de frappe */
    if(q<.3){const u=q/.3,rr=40+260*es(u);ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=1-u;ctx.drawImage(sprGl,HOLE_X-rr,DECK-rr,rr*2,rr*2);ctx.restore()}
    if(hw<2)return;
    /* 2. rien de l'ancien pont au-dessus du vide : le fond lointain recouvre le parapet */
    const sk=bgFar.width/W;
    ctx.drawImage(bgFar,x0*sk,(DECK-52)*sk,(x1-x0)*sk,52*sk,x0,DECK-52,x1-x0,52);
    /* 3. vide : aplat sombre qui devient braise en bas, bords irréguliers par courses de maçonnerie */
    ctx.save();
    const g=ctx.createLinearGradient(0,DECK,0,H);g.addColorStop(0,'#160b14');g.addColorStop(.55,'#3a1418');g.addColorStop(1,'#7a2c12');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(edgeX(0,-1,hw),DECK-1);ctx.lineTo(edgeX(0,1,hw),DECK-1);
    for(let i=0;i<NR;i++){const y=Math.min(H,DECK+(i+1)*ROW),a=edgeX(i,1,hw);ctx.lineTo(a,Math.min(H,DECK+i*ROW));ctx.lineTo(a,y)}
    ctx.lineTo(x1+8,H+2);ctx.lineTo(x0-8,H+2);
    for(let i=NR-1;i>=0;i--){const y=Math.min(H,DECK+(i+1)*ROW),a=edgeX(i,-1,hw);ctx.lineTo(a,y);ctx.lineTo(a,Math.min(H,DECK+i*ROW))}
    ctx.closePath();ctx.fill();ctx.clip();
    /* 4. colonne de lumière de la Fonderie (additive, sprite, respiration douce) */
    const pul=.9+.1*Math.sin(tt*2.1),ch=H-DECK+210;
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.5*pul*k;ctx.drawImage(sprCol,HOLE_X-hw*1.05,H-ch,hw*2.1,ch);
    ctx.globalAlpha=.55*pul*k;ctx.drawImage(sprGl,HOLE_X-hw*1.6,H-hw*1.2,hw*3.2,hw*2.4);ctx.restore();
    /* 5. blocs du tablier qui basculent et tombent (dalle éclairée, maçonnerie, liseré chaud dessous, éclat de parapet) */
    BLK.forEach((b,i)=>{
      if(reduce&&i%2===0)return;
      const qq=Math.max(0,q-b[5]);if(qq<=0&&k<.3)return;
      const cx=HOLE_X+b[0]*hw+b[6]*qq,cy=DECK+b[2]/2+b[3]*qq+720*qq*qq;if(cy>H+70)return;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.min(qq,1.1)*b[4]);
      const w=b[1],th=b[2];
      ctx.fillStyle='#4d3248';ctx.fillRect(-w/2,-th/2,w,th);
      ctx.fillStyle='#654055';ctx.fillRect(-w/2,-th/2,w,12);
      ctx.fillStyle='rgba(255,190,150,.32)';ctx.fillRect(-w/2+3,-th/2+1,w-8,1.5);
      ctx.fillStyle='#392640';ctx.fillRect(-w/2,-th/2+12,w*.45,th-12-6);ctx.fillRect(w*.1,-th/2+18,w*.4,th-18);
      ctx.fillStyle='rgba(255,130,60,.6)';ctx.fillRect(-w/2,th/2-2,w,2);
      if(b[7]){ctx.fillStyle='#2e1f36';ctx.beginPath();ctx.moveTo(-w*.2,-th/2);ctx.lineTo(-w*.16,-th/2-15);ctx.quadraticCurveTo(0,-th/2-22,w*.12,-th/2-13);ctx.lineTo(w*.2,-th/2-12);ctx.lineTo(w*.24,-th/2);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(255,170,100,.3)';ctx.fillRect(w*.12,-th/2-12,w*.12,1.5)}
      ctx.restore();
    });
    /* 6. poussière qui retombe dans le trou, braises qui montent */
    const nd=reduce?7:N_DUST,ne=reduce?10:N_EMB;
    if(q<2.4){const fa=Math.min(1,q*5)*Math.max(0,1-q/2.4);ctx.fillStyle='rgba(190,140,150,'+(.55*fa)+')';
      for(let i=0;i<nd;i++){const d=DUS[i];ctx.fillRect(HOLE_X+d.xo*hw*.9,DECK-60+q*90*d.v,d.s,d.s)}}
    for(let i=0;i<ne;i++){const e=EMB[i],u=(tt*e.sp+e.ph)%1,a=(1-u)*.85*k;ctx.fillStyle=(i%3?'rgba(255,176,90,':'rgba(255,220,150,')+a+')';
      ctx.fillRect(HOLE_X+e.xo*hw*.85+Math.sin(tt*1.4+e.w)*10,H+8-u*(H-DECK+170),2,2)}
    ctx.restore();
    /* 7. bords : épaisseur de la maçonnerie en courses décalées, dalle claire en haut, éclairée par dessous */
    for(let side=-1;side<=1;side+=2){
      for(let i=0;i<NR;i++){
        const y=DECK+i*ROW,h=Math.min(ROW,H-y);if(h<=0)break;
        const ex=edgeX(i,side,hw),bw=BW[i][side<0?0:1],x=side<0?ex:ex-bw;
        ctx.fillStyle=i===0?'#654055':i%2?'#3d2a45':'#4a3250';ctx.fillRect(x,y,bw,h);
        if(i===0){ctx.fillStyle='rgba(255,190,150,.32)';ctx.fillRect(x,y,bw,1.5)}
        ctx.fillStyle='rgba(255,120,50,'+(.1+.4*i/NR)+')';ctx.fillRect(x,y,bw,h);
        ctx.fillStyle='rgba(255,150,70,'+(.45+.3*i/NR)+')';ctx.fillRect(x,y+h-1.5,bw,1.5);
        ctx.fillRect(side<0?ex:ex-1.5,y,1.5,h);
      }
    }
  }
  return{draw};
})();
function drawHole(){
  const b=G.boss;if(b.s!=='fin'||b.t<2.0)return;
  BREACH.draw(b.t-2.0);
}
function drawCracks(){
  /* coup final de la phase I : le rayon de la lanterne file jusqu'au torse du Colosse et y explose (aplats : faisceau, étoiles, éclats) */
  const p=G.pl;if(p.s!=='final'||p.t<.5)return;
  const C=[BX-40+finRecoil(p.t),DECK-200],L=WL||[p.x+48,DECK-166-liftAmt()];
  if(p.t>=1.1&&p.t<2.0){const u=p.t-1.1,a=1-clamp01(u/.4);
    if(a>0){ctx.save();ctx.globalAlpha=a;COLFX.etoile(ctx,C[0],C[1],120*a,12,p.t*3,'#ffe58a',.4);COLFX.etoile(ctx,C[0],C[1],60*a,12,-p.t*2,'#fffbea',.4);ctx.restore()}
    if(!reduce)COLFX.eclats(ctx,C[0],C[1],u,40,['#ffe58a','#6a3a50','#ff9a35','#2c1534','#fffbea'],380,41,DECK+4)}
  if(p.t>1.5)return;
  const u=es(clamp01((p.t-.5)/.6)),al=p.t<1.1?clamp01((p.t-.5)/.1):clamp01(1-(p.t-1.1)/.4),P=lerp2(L,C,u),w=5+25*u;
  ctx.save();ctx.globalAlpha=al;
  COLFX.poly(ctx,[[L[0],L[1]-5],[P[0],P[1]-w],[P[0],P[1]+w],[L[0],L[1]+5]],'#ffe9a0');
  COLFX.poly(ctx,[[L[0],L[1]-2],[P[0],P[1]-w*.37],[P[0],P[1]+w*.37],[L[0],L[1]+2]],'#fffbea');
  ctx.restore();
}
/* orbe de lumière : étoile à six branches, octogone d'or et facettes claires (aplats nets) */
function orbeFlat(x,y,r,rot){
  COLFX.etoile(ctx,x,y,r*1.75,6,rot,'rgba(255,214,110,.55)',.55);
  const pts=[];for(let i=0;i<8;i++){const a=rot*-.7+i*Math.PI/4;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}
  COLFX.poly(ctx,pts,'#f2b640');
  for(let i=0;i<8;i+=2)COLFX.poly(ctx,[[x,y],pts[i],pts[(i+1)%8]],'#ffe58a');
  COLFX.poly(ctx,[[x-r*.5,y-r*.1],[x-r*.1,y-r*.55],[x+r*.2,y-r*.1]],'#fffbea');
}
function drawOrb(){
  const p=G.pl;if(p.s!=='cast')return;
  /* départ : la lanterne du Veilleur au moment du jet (la pose la déplace) ; vol et cible comme avant */
  const charge=p.t<T.cast,cr=charge||!RP.orbO?(WL||[PX+48,DECK-166]):RP.orbO;
  if(charge)RP.orbO=cr;
  let pos,r,q=0;
  if(charge){pos=cr;r=4+20*eo(p.t/T.cast)}
  else{q=clamp01((p.t-T.cast)/T.orb);pos=lerp2(cr,ORB_T,es(q));pos[1]-=70*Math.sin(Math.PI*q);r=24}
  if(charge&&!reduce){ /* la lumière se rassemble sur la lanterne */
    const a=eo(p.t/T.cast);let sd=4;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
    for(let i=0;i<12;i++){const an=rn()*6.283,ph=(p.t*1.6+rn())%1,d=(1-ph)*72;COLFX.etoile(ctx,cr[0]+Math.cos(an)*d,cr[1]+Math.sin(an)*d,3+3*ph,4,an,'rgba(255,230,140,'+(a*ph)+')',.35)}
  }
  if(!charge)for(let i=1;i<=5;i++){
    const qq=Math.max(0,q-i*.05),tp=lerp2(cr,ORB_T,es(qq));tp[1]-=70*Math.sin(Math.PI*qq);
    COLFX.etoile(ctx,tp[0],tp[1],Math.max(1,r*(.9-i*.14)),4,qq*5+i,'rgba(255,224,130,'+(.85-i*.14)+')',.4);
  }
  orbeFlat(pos[0],pos[1],r,G.time*7);
}
function render(){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  if(G.mode==='title'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);return}   /* avant le combat (carte de phase) : fond noir */
  ctx.save();
  if(G.shake>0&&!reduce)ctx.translate(rand(-1,1)*G.shake,rand(-1,1)*G.shake);
  ctx.drawImage(bgFar,0,0,W,H);
  BRD.mist(reduce?0:(G.time*.012)%1);
  drawEmbers(0,70,1);
  ctx.drawImage(bgBridge,0,0,W,H);
  BRD.archGlow(G.time);drawSombre();
  drawHole();ctx.save();ctx.translate(G.ix||0,0);drawBoss();ctx.restore();drawCracks();drawPlayer();drawFlame();drawJets();drawRock();if(G.boss.dbf&&G.boss.s==='fl_in')drawChainTell(colMouthW[0]-4,colMouthW[1]-2,G.boss.t);if(G.boss.dbl&&(G.boss.s==='windup'||G.boss.s==='strike'))drawDblTell(G.boss.t);drawRing();drawBarrier();drawOrb();drawHints();drawFx();
  drawEmbers(0,18,.9);
  ctx.restore();
  ctx.drawImage(vig,0,0,W,H);
  if(G.flash>0){ctx.fillStyle='rgba(255,255,255,'+G.flash*.5+')';ctx.fillRect(0,0,W,H)}
  if(G.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(G.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  if(G.mode==='intro'&&G.it<.7){ctx.fillStyle='rgba(0,0,0,'+(1-G.it/.7)+')';ctx.fillRect(0,0,W,H)}   /* entrée en jeu : la scène sort du noir */
  if(G.p2&&G.pl.s==='final'){const fa=clamp01((G.pl.t-2.9)/.8);if(fa>0){ctx.fillStyle='rgba(0,0,0,'+fa+')';ctx.fillRect(0,0,W,H)}}
}

