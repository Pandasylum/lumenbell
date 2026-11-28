/* Seconde vie : aura de feu permanente autour du Colosse (plus intense à chaque rage) */
function drawAura3(o,t){
  const k=1+(R.u55?.4:R.u5?.2:0);
  ctx.save();
  const g=ctx.createRadialGradient(0,-170,20,0,-170,300*k);
  g.addColorStop(0,'rgba(255,170,70,'+(.32*k)+')');g.addColorStop(.55,'rgba(255,100,30,'+(.16*k)+')');g.addColorStop(1,'rgba(255,70,20,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-170,300*k,0,6.283);ctx.fill();
  const P=[[-110,-20],[-55,-20],[0,-20],[55,-20],[110,-20],[-130,-120],[130,-120],[-125,-230],[125,-230],[-90,-320],[90,-320]];
  P.forEach((p,i)=>{
    const f=.75+.25*Math.sin(t*9+i*1.7),h=(46+(i>6?20:34))*k*f;
    qflame(p[0],p[1],11,h,i,i%2?'rgba(255,196,90,.55)':'rgba(255,100,40,.55)');
  });
  ctx.restore();
  if(R.mode==='play'&&Math.random()<.45*k)R.sparks.push({x:o.x+rand(-120,120),y:DECK+o.dy-rand(20,330),vx:rand(-20,20),vy:-rand(50,130),g:-30,life:.9,max:.9,col:Math.random()<.5?'#ffb04a':'#ff7a2b',sz:rand(2,4)});
}
/* Le Colosse du Clocher : le COLOSSE de la phase I (poses et effets de la maquette, voir 54-p3-belfry-colosse.js) ; bossPose3 reste appelée à chaque image
   (cris, secousses, vapeur) et donne les mains des attaques absentes de la maquette. Les blessures de la seconde vie sont les fissures peintes du COLOSSE. */
function drawBoss3(){
  const ob=bossPose3(),t=R.time,fin=R.mode==='finale';
  const o=col3Pose(ob);
  if(R.mode==='intro')col3Warm(ctx);
  const bx=o.ported?R.bx:ob.x,dy=o.ported?0:(Math.abs(ob.dy)<=2.001?0:ob.dy);
  const fm=(o.face||1)*(o.etr||1);   /* pivot du coup de queue : retourné en miroir (face -1), écrasé en largeur (etr) */
  COL3.f={x0:bx+C3X+o.dx,y0:DECK+dy,bx,flip:!!ob.flip,m:fm};
  const wd=R.healed&&!fin?(R.wdAt==null?1:clamp01((R.time-R.wdAt)/.8)):(R.healed?1:0);
  /* première foudre : la grande enclume de l'épaule cède ; regain de vie : les ailes sont rongées puis retombent ; première foudre de la seconde vie : la grande corne se brise */
  const rT=R.healed?(R.wdAt!=null?R.wdAt:-99):null,ronge=rT!=null&&t>=rT+CN3.ronge,tombe=ronge?k3ez((t-rT-CN3.tombe[0])/CN3.tombe[1]):0;
  const brise=R.hornAt!=null&&t>=R.hornAt+CN3.brise,enclume=COL3.foudre1!=null&&t>=COL3.foudre1+CN3.enclume;
  if(ob.flip){ctx.save();ctx.translate(bx,0);ctx.scale(-1,1);ctx.translate(-bx,0)}
  /* ombres de contact : une sous chaque pied (le pied arrière, dessiné plus haut pour la perspective, a la sienne) et une ombre douce entre les deux */
  if(dy>-60&&!fin)COLOSSE.ombres(ctx,{fx:o.fx,fl:o.fl,fa:o.fa,nx:o.nx,nl:o.nl,na:o.na,plie:o.plie},bx+C3X+o.dx,DECK,C3*fm,1-k3cl(-dy/60));
  if(R.healed&&!fin&&R.boss.s!=='dead'){ctx.save();ctx.translate(bx,DECK+dy);ctx.scale(.92,.92);drawAura3(ob,t);ctx.restore()}
  if(R.atk&&R.atk.dbl&&R.atk.t<R.atk.hits[R.atk.hits.length-1].at+.05){ctx.save();ctx.translate(bx,DECK+dy);ctx.rotate(fin?ob.lean:0);ctx.scale(.92,.92);ctx.fillStyle='rgba(255,176,74,'+(.85+.15*Math.sin(t*30))+')';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=14;ctx.font='900 54px '+DISPLAY;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!'.repeat(R.atk.tn||2),-170,-300);ctx.restore()}
  ctx.save();ctx.translate(bx,DECK+dy);if(fin&&ob.lean)ctx.rotate(ob.lean);ctx.translate(C3X+o.dx,0);ctx.scale(C3*fm,C3);
  const rig=COLOSSE.draw(ctx,{dos:o.dos||0,qD:o.qD,qP:o.qP||undefined,ouvre:o.dos?1-o.plie:0,rage:o.dos?Math.max(Math.min(.34,wd),o.rage||0):(o.rage||0),brise,enclume,flash:o.flash||0,eteint:o.eteint||0,lean:o.lean,drop:o.drop,sx:o.sx,dF:o.dF,dN:o.dN,off:o.off,nn:o.nn,plie:o.plie,kneel:o.kneel,kdk:o.kdk,out:o.out,tete:o.tete,jaw:o.jaw,fissure:fin?1:Math.max(wd,o.fissure||0),
    t:reduce?0:t,warm:o.rage>.5?Math.max(ob.warm,1.5):ob.warm,eyes:o.yeux,breath:reduce?null:t,smoke:1,hurt:R.recoil>.3,legs:{f:[o.fx,o.fl,o.fa],n:[o.nx,o.nl,o.na]},tip:[o.tx,o.ty],heat:o.heat,sag:20,
    ham:{P:o.P,a:o.a,g:o.g,wN:o.wN,wF:o.wF,s:o.s,r:o.r},
    back:()=>{
      /* ailes de la maquette (calques cuits à l'entrée, les mêmes qu'en phase I) : battement (o.wa), envergure (o.ws) ; rongées puis retombées après le regain de vie ;
         le final en coupe une ou deux (R.cut). Flammes de rage derrière lui. */
      COLOSSE.ailes(ctx,o,{bat:o.wa+(reduce?0:Math.sin(t*1.7)*.024*(1-tombe)),env:o.ws,tombe,ronge,cut:R.cut});
      if(o.flm>.01)COLFX.rageDerriere(ctx,reduce?0:t,o.flm);
    },
    front:r=>{if(o.griffe>.02){ctx.save();k3griffes(ctx,r.na.E,r.na.W,o.griffe);k3griffes(ctx,r.fa.E,r.fa.W,o.griffe);ctx.restore()}}});
  if(o.flm>.01)COLFX.rageSol(ctx,reduce?0:t,o.flm);
  if(col3CriA(R.atk)&&!fin)COLFX.ondes(ctx,R.atk.t-CN3.rage.cri);   /* l'éclat du cri : ondes de braise au sol */
  ctx.restore();
  COL3.k={gueule:col3W(rig.gueule),coeur:col3W(rig.coeur),head:col3W(rig.head),poing:col3W(rig.fa.W),Z:o.Z||null,x0:COL3.f.x0,
    tete:col3W(rig.pt(-34,-272)),corne:col3W(rig.pt(36,-300)),torse:col3W(rig.pt(-36,-186)),loin:col3W(rig.fa.W),proche:col3W(rig.na.W),boule:col3W([o.tx,o.ty]),enclume:col3W(rig.pt(136,-232))};COL3.mouth=COL3.k.gueule;
  if(ob.flip)ctx.restore();
}
function faceFire(cx,cy,k,q){
  if(k<=0)return;
  const tm=R?R.time:Q?Q.time:G.time;
  ctx.save();
  const g=ctx.createRadialGradient(cx,cy,6,cx,cy,95);
  g.addColorStop(0,'rgba(255,230,150,'+(.5*k)+')');g.addColorStop(.5,'rgba(255,140,50,'+(.3*k)+')');g.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,95,0,6.283);ctx.fill();
  ctx.shadowColor='#ff7a2b';ctx.shadowBlur=16;
  for(let i=0;i<12;i++){
    const ang=i/12*6.283+tm*1.5,r=64+6*Math.sin(tm*7+i)-10*k*(q<.6?1:0),x=cx+Math.cos(ang)*r*1.05,y=cy+Math.sin(ang)*r*.9;
    ctx.save();ctx.translate(x,y);ctx.rotate(ang+1.5708);
    qflame(0,0,5+3*k,(12+18*k)*(.8+.2*Math.sin(tm*14+i)),i,i%2?'rgba(255,200,90,.9)':'rgba(255,100,40,.9)');
    ctx.restore();
  }
  if(q<.7)for(let i=0;i<9;i++){
    const u=((tm*2.2+i/9)%1),ang=i*2.4+tm,r=130*(1-u),x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r*.8;
    ctx.fillStyle='rgba(255,210,120,'+(.8*u*k)+')';ctx.fillRect(x-2,y-2,4,4);
  }
  ctx.restore();
}
/* bâton complet tenu en main (talon et lanterne) pour un geste donné par la main et l'angle du sceptre : même longueur et même prise que le bâton planté
   de la garde commune (LB.WATCHER_REST : talon à 67 px sous la main, lanterne à 75 px au-dessus), pour que le bâton ne change jamais de forme */
const BATON3=(()=>{const R=LB.WATCHER_REST,h=R.hand,s=R.staff;return {bas:Math.hypot(h[0]-s[0][0],h[1]-s[0][1]),haut:Math.hypot(s[1][0]-h[0],s[1][1]-h[1])}})();
function baton3(hand,sa){const c=Math.cos(sa),n=Math.sin(sa);return [[hand[0]-c*BATON3.bas,hand[1]-n*BATON3.bas],[hand[0]+c*BATON3.haut,hand[1]+n*BATON3.haut]]}
function drawHero3(){
  const p=R.pl,h=heroPose3(),t=R.time;
  const hf=heroFlip();if(hf){ctx.save();ctx.translate(h.x,0);ctx.scale(-1,1);ctx.translate(-h.x,0)}
  if(!h.y)ctx.fillStyle='rgba(0,0,0,.35)',ctx.beginPath(),ctx.ellipse(h.x,DECK+2,30,5,0,0,6.283),ctx.fill();
  /* le Veilleur commun (LB.drawWatcher) ; la phase donne sa géométrie : sceptre en main, garde levée, contres, finale */
  const c3=R.cn;
  const play=R.mode==='play',low=p.s==='down'||p.s==='hurt';
  const pose=R.mode==='intro'?'walk':R.mode==='finale'?'victory':!play?'idle':c3?'cast':p.s==='act'?'block':low?(p.s==='down'?'down':'hurt'):'idle';
  /* hors contres, entrée, final et coup de boule : la posture et la tenue du bâton de la phase I (bâton planté, garde « block » commune) */
  const commun=R.mode!=='intro'&&R.mode!=='finale'&&!c3&&!(low&&p.lasso);
  if(commun){const up=p.s==='act',Q=LB.WATCHER_POSES.block(up?clamp01(p.t/.08):0);
    LB.drawWatcher(ctx,h.x,DECK+(h.y||0),pose,t,{dx:0,dy:0,rot:0,rot2:low?.12:0,sx:1,sy:low?.82:1,
      breath:pose==='idle'&&play,hand:Q.hand,staff:Q.staff,glow:up?1:.25,lanternCol:LB.watcherLanternCol(p,up)})}
  else LB.drawWatcher(ctx,h.x,DECK+(h.y||0),pose,t,{dx:0,dy:0,rot:h.rot,rot2:0,sx:1,sy:h.sy,
    breath:pose==='idle'&&play,hand:h.hand,staff:baton3(h.hand,h.sa),
    glow:p.s==='act'?1:Math.max(.3,h.glow||0),
    lanternCol:LB.watcherLanternCol(p,p.s!=='recover'&&(p.s==='act'||h.glow>0))});
  if(p.s==='act')LB.drawBlock(ctx,PX,DECK,p.t,HD('block').act,{plain:true});
  if(hf)ctx.restore();
}
/* ===== grêle de braise, bombes, chute de pierres et boule de feu, cri (maquette validée clocher-pluie.js, 28/11) =====
   Instants du jeu : coups ice, bomb, rock, fire et fall seulement (h.at - a.off en temps de pose a.pt ; bombes : bombPos et bombL). Aplats nets, ni filtre ni ombre portée,
   aucun calque en combat. Mouvement réduit : flammes, nuée et poussière figées, ni éclats ni gravats, ni secousse. L'état propre au dessin (trou, blocs en main)
   vit sur l'attaque (a.c3) et repart donc à chaque attaque. Le dôme de la garde reste celui du jeu (LB.drawBlock, garde tenue) ; ici, l'éclat sur le dôme d'un coup paré. */
const K3P_PIERRE=['#8d90bc','#5d6092','#37375f','#2b2a4c'],K3P_FEU=['#ffe08a','#ff9a35','#d4501f','#8e2418'];
const k3dome=x=>{const dx=x-PX,r=LB.DOME_FX.r;return [x,DECK+4-Math.sqrt(Math.max(0,r*r-dx*dx))]};   /* point du dôme de la garde au-dessus de x */
const k3eclats=(...v)=>{if(!reduce)k3shards(...v)};
/* bloc de dallage arraché */
function k3bloc(c,x,y,r,rot,seed){const q=k3rnd(seed),p=[];for(let i=0;i<7;i++){const a=i*K3TAU/7,d=r*(.82+q()*.34);p.push([Math.cos(a)*d,Math.sin(a)*d*.86])}
  c.save();c.translate(x,y);c.rotate(rot);k3poly(c,p.map(v=>[v[0]*1.09,v[1]*1.09]),'#120d24');k3poly(c,p,'#4a4974');k3poly(c,[p[3],p[4],p[5],p[6],[0,-r*.12]],'#8d90bc');k3poly(c,[p[0],p[1],p[2],[0,r*.1]],'#2b2a4c');
  k3poly(c,[p[4],p[5],[p[5][0]*.72,p[5][1]*.72],[p[4][0]*.74,p[4][1]*.74]],'#cfd8f2');
  c.strokeStyle='#e9561b';c.lineWidth=2.4;c.beginPath();c.moveTo(-r*.5,r*.1);c.lineTo(-r*.1,-r*.05);c.lineTo(r*.12,r*.34);c.lineTo(r*.5,r*.26);c.stroke();c.restore()}
/* éclat de braise : roche noire, pointe en avant, traînée découpée */
function k3braise(c,x,y,r,ang,t,seed){
  c.save();c.translate(x,y);c.rotate(ang);const s=Math.sin(t*34+seed);
  [[1,'#8e2418',1],[.72,'#d4501f',.82],[.46,'#ff9a35',.62],[.22,'#ffe08a',.42]].forEach(([w,col,l])=>k3poly(c,[[r*.4,0],[-r*.1,-r*w],[-r*(1.2+2.6*l),-r*w*.5+s*3],[-r*(1+1.4*l),-r*w*.1],[-r*(1.6+3.4*l),r*w*.28-s*3],[-r*(.8+l),r*w*.55],[-r*.1,r*w]],col));
  k3poly(c,[[r*1.5,0],[r*.2,-r*.62],[-r*.5,-r*.3],[-r*.35,r*.42],[r*.3,r*.56]],'#1a0820');k3poly(c,[[r*1.5,0],[r*.2,-r*.62],[r*.1,-r*.08]],'#a47c8a');
  c.strokeStyle='#ffc27a';c.lineWidth=2;c.beginPath();c.moveTo(r*.9,r*.1);c.lineTo(r*.15,r*.05);c.lineTo(-r*.2,r*.28);c.stroke();c.restore()}
function k3impact(c,p,u,r,seed,cols){if(u<0)return;if(u<.2){k3star(c,p[0],p[1],r*(1-u*3),8,.3,'#ffe9a0',.4);k3star(c,p[0],p[1],r*.5*(1-u*4),8,.7,'#fffbea',.4)}k3eclats(c,p[0],p[1],u,16,cols,250,seed,DECK+5)}
/* gravats qui rebondissent sur les dalles */
function k3gravats(c,x,u,seed,n){if(reduce||u<0||u>2.2)return;const q=k3rnd(seed);c.save();c.globalAlpha=u<1.5?1:1-(u-1.5)/.7;
  for(let i=0;i<n;i++){const dir=i%2?1:-1,vx=dir*(60+q()*200),vy=-(80+q()*230),y0=DECK-110+q()*40,r=6+q()*9,tm=Math.min(u,(-vy+Math.sqrt(vy*vy+2*900*(DECK+2-y0)))/900),rot=q()*6+tm*8*dir;
    k3bloc(c,x+vx*tm,Math.min(DECK+2-r*.3,y0+vy*tm+450*tm*tm),r,rot,seed+i*7)}c.restore()}
function k3poussiere(c,x,y,u,seed,n,al){if(u<0||u>.9)return;const q=k3rnd(seed);for(let i=0;i<n;i++){const k=(i/(n-1)-.5)*2,px=x+k*(24+u*120)+q()*14,py=y-q()*14-u*36,r=(9+q()*13)*(1+u*1.2),p=[];for(let j=0;j<7;j++){const a=j*.9+i;p.push([px+Math.cos(a)*r*(j%2?.8:1.2),py+Math.sin(a)*r*.6])}k3poly(c,p,'rgba(150,140,186,'+(al||.75)*(1-u/.9)+')')}}
function k3colonne(c,x,u,t){if(u<0||u>.55)return;const f=u<.08?u/.08:1-(u-.08)/.47;
  for(let j=-2;j<=2;j++)k3flame(c,x+j*17,DECK+5,17-Math.abs(j)*2,(155-Math.abs(j)*40)*f,j*13,t*19+j*2)}
/* le coup paré frappe le dôme de la garde : un éclat bleu court sur son bord */
function k3domeTouche(c,p,d,h){if(h.ok!==true||d<=0||d>=.5)return;const an=Math.atan2(p[1]-DECK-4,p[0]-PX);
  c.strokeStyle='rgba(190,232,255,'+(1-d*2)+')';c.lineWidth=7*(1-d*2)+1;c.beginPath();c.arc(PX,DECK+4,LB.DOME_FX.r,an-.3-d,an+.3+d);c.stroke()}
/* ---- 1. grêle de braise : il appelle le feu au ciel, qui retombe en pluie oblique sur la garde ---- */
function k3nuee(c,t,k){if(k<=.02)return;const q=k3rnd(41),cx=PX+150;c.save();c.globalAlpha=k;
  /* nuée de cendre : lourds rouleaux sombres, le dessous éclairé par la braise */
  const rouleau=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,r,r*.52,0,0,K3TAU);c.fill()};
  const N=[];for(let i=0;i<13;i++){const u=i/12;N.push([cx-210+u*420+Math.sin(t*1.8+i*2.1)*8,30+q()*24+Math.sin(u*Math.PI)*10+Math.sin(t*2.6+i)*3,38+q()*26+Math.sin(u*Math.PI)*18])}
  N.forEach(([x,y,r])=>rouleau(x,y+9,r*.96,'#d4501f'));N.forEach(([x,y,r])=>rouleau(x,y+4,r*.97,'#6a2438'));N.forEach(([x,y,r])=>rouleau(x,y-3,r,'#2c1534'));N.forEach(([x,y,r],i)=>{if(i%2)rouleau(x-6,y-16,r*.66,'#46234a')});
  for(let i=0;i<9;i++){const [x,y,r]=N[(i*5+2)%13];if(Math.sin(t*9+i*2.7)>.1)k3flame(c,x,y+r*.52+6,5,-14-(i%3)*5,3,t*13+i)}
  for(let i=0;i<14;i++){const x=cx+(q()-.5)*330,y=76+q()*30+((t*70+i*23)%34);k3poly(c,[[x,y-7],[x+3,y],[x,y+4],[x-3,y]],i%2?'#ffe08a':'#ff9a35')}c.restore()}
function k3grele(c,a,H,q,off,tm){const fin=H[H.length-1].at-off,M=COL3.mouth;
  const jk=k3bump(q,.3,.62,.12);if(jk>.02&&M)COLFX.jet(c,M,[k3l(M[0],PX+250,jk),k3l(M[1],66,jk)],62,tm,1);
  k3nuee(c,tm,k3ez((q-.45)/.3)*(1-k3ez((q-fin-.1)/.4)));
  const X=[34,-30,86,6,56],from=[250,-250];
  H.forEach((h,i)=>{const d=a.t-h.at,p=k3dome(PX+X[i%5]),O=[p[0]+from[0]*.92,p[1]+from[1]*.92];
    /* petits éclats qui l'accompagnent, plantés dans la dalle autour de la garde */
    for(let j=0;j<2;j++){const e=(d+.46-j*.07)/.5,gx=PX+(j?196:-168)+i*13*(j?1:-1);if(e>0&&e<1)k3braise(c,k3l(gx+230,gx,e*e*.4+e*.6),k3l(30,DECK-4,e*e*.4+e*.6),7,2.34,tm,i*3+j);else if(e>=1&&e<2.4){k3flame(c,gx,DECK+4,8,30*(1-(e-1)/1.4),-5,tm*17+i);k3eclats(c,gx,DECK,(e-1)*.5,6,K3P_FEU,150,60+i*3+j,DECK+5)}}
    if(d>=-.55&&d<0){const u=(d+.55)/.55,v=u*u*.5+u*.5;k3braise(c,k3l(O[0],p[0],v),k3l(O[1],p[1],v),17,Math.atan2(p[1]-O[1],p[0]-O[0]),tm,i)}
    k3impact(c,p,d,50,11+i,['#ffe08a','#ff9a35','#2c1534','#fff6d8']);
    k3domeTouche(c,p,d,h);
  });
}
/* ---- 2. bombes de braise (Difficile) : cœurs de braise crachés en cloche, posés, ils clignotent puis éclatent ---- */
function k3coeur(c,x,y,rot,chaud,t,seed){c.save();c.translate(x,y);c.rotate(rot);
  const p=[[-23,-4],[-14,-22],[8,-25],[24,-9],[20,15],[-2,24],[-21,15]];
  k3poly(c,p.map(v=>[v[0]*1.12,v[1]*1.12]),'#12040e');k3poly(c,p,'#2c1534');k3poly(c,[p[0],p[1],p[2],[-2,-6]],'#6a3a50');k3poly(c,[p[3],p[4],p[5],[2,6]],'#1a0820');
  const w=2.6+5*chaud;[[w+3,'#d4501f'],[w,'#ff9a35'],[w*.4,'#fff6d8']].forEach(([lw,col])=>{c.strokeStyle=col;c.lineWidth=lw;c.lineJoin='miter';c.beginPath();c.moveTo(-18,-8);c.lineTo(-5,-1);c.lineTo(-9,12);c.moveTo(-5,-1);c.lineTo(7,-8);c.lineTo(8,-21);c.moveTo(7,-8);c.lineTo(18,8);c.moveTo(-5,-1);c.lineTo(5,18);c.stroke()});
  c.restore();k3flame(c,x-6,y-20,7,16+26*chaud+5*Math.sin(t*14+seed),-6,t*15+seed)}
function k3bombes(c,a,H,q,tm){const M=COL3.mouth||[R.bx-84,DECK-228];
  H.forEach((h,i)=>{const B=bombPos(i),Lt=bombL(i),d=a.t-h.at,u=(q-(Lt-.55))/.55,y=DECK-20;
    if(d>=0){k3impact(c,[B[0],y],d,95,31+i,['#ffe08a','#ff9a35','#d4501f','#2c1534']);k3colonne(c,B[0],d,tm);k3poussiere(c,B[0],DECK,d,70+i,6,.6);return}
    if(u<0)return;
    if(u<1){const x=k3l(M[0],B[0],u),yy=k3l(M[1],y,u)-170*Math.sin(Math.PI*u);
      for(let j=5;j>0;j--){const v=u-j*.05;if(v>0)k3star(c,k3l(M[0],B[0],v),k3l(M[1],y,v)-170*Math.sin(Math.PI*v),16-j*2,5,j+tm*9,'rgba(255,140,50,'+(.8-j*.13)+')',.5)}
      k3coeur(c,x,yy,u*9,.4,tm,i);return}
    /* posée : elle clignote de plus en plus vite (instants de l'ancien clignotement) ; mouvement réduit : lueur fixe */
    const w=d>-.7?1+d/.7:0,pl=reduce?.75:.5+.5*Math.sin(R.time*(30+30*w));
    c.fillStyle='rgba(233,86,27,'+(.2+.35*w)+')';c.beginPath();c.ellipse(B[0],DECK+3,24+16*w,5+3*w,0,0,K3TAU);c.fill();
    if(w>0){k3star(c,B[0],y,28+30*w*(.55+.45*pl),10,tm*2,'rgba(255,154,53,'+(.35+.5*w*pl)+')',.55);if(pl>.6)k3star(c,B[0],y,22+22*w,10,-tm*2,'rgba(255,246,216,'+(.5*w+.2)+')',.55)}
    k3coeur(c,B[0],y+(reduce?0:Math.sin(tm*50+i)*2*w),reduce?0:Math.sin(tm*44)*.08*w,w*pl,tm,i)});
}
/* ---- 3. chute de pierres : il arrache un bloc du dallage, le hisse à deux mains et le lance haut ; le bloc retombe. Difficile : boule de feu crachée ---- */
function k3trou(c,x,u){if(u<0)return;const a=u<2?1:1-k3cl((u-2)/.6);if(a<=0)return;c.save();c.globalAlpha=a;
  k3poly(c,[[x-46,DECK+2],[x-24,DECK-4],[x+6,DECK+1],[x+30,DECK-3],[x+48,DECK+5],[x+22,DECK+13],[x-10,DECK+9],[x-34,DECK+12]],'#12040e');
  c.strokeStyle='#e9561b';c.lineWidth=3;c.beginPath();c.moveTo(x-34,DECK+6);c.lineTo(x-8,DECK+4);c.lineTo(x+14,DECK+8);c.lineTo(x+36,DECK+5);c.moveTo(x-46,DECK+2);c.lineTo(x-74,DECK+9);c.moveTo(x+48,DECK+5);c.lineTo(x+70,DECK-1);c.stroke();
  for(let i=0;i<5;i++)k3poly(c,[[x-62+i*31,DECK+3],[x-52+i*31,DECK-8-(i%3)*5],[x-42+i*31,DECK+3]],i%2?'#5d6092':'#37375f');c.restore()}
function k3pierres(c,a,H,tm){const k=COL3.k,M=COL3.mouth||[R.bx-84,DECK-228],S=a.c3;
  if(S.trou==null)S.trou=R.bx-190;const x0=S.trou;
  let n=0;
  H.forEach(h=>{const d=a.t-h.at;
    if(h.k==='fire'){
      if(d>-.72&&d<-.45)k3star(c,M[0],M[1],46*k3cl((d+.72)/.27),10,tm*7,'#ff9a35',.5);
      if(d>=-.45&&d<0){const u=k3ez((d+.45)/.45),p=k3dome(PX+80),x=k3l(M[0],p[0],u),y=k3l(M[1],p[1],u),an=Math.atan2(p[1]-M[1],p[0]-M[0]);
        k3braise(c,x,y,26,an,tm,9);k3star(c,x,y,40,11,tm*13,'#ff9a35',.6);k3star(c,x,y,24,9,-tm*11,'#ffe08a',.6);k3star(c,x,y,11,8,tm*9,'#fffbea',.6)}
      if(d>=0){const p=k3dome(PX+80);k3impact(c,p,d,96,55,['#ffe08a','#ff9a35','#d4501f','#6a3a50']);k3colonne(c,PX+150,d*1.1,tm);k3colonne(c,PX-132,d*1.3,tm);k3domeTouche(c,p,d,h)}
      return}
    if(h.k!=='rock')return;const i=n++,s=d+.95;if(s<0)return;
    k3trou(c,x0+i*26,s-.18);
    k3poussiere(c,x0+i*26,DECK,s-.18,20+i,8);k3eclats(c,x0+i*26,DECK-4,s-.18,14,K3P_PIERRE,260,80+i,DECK+5);
    const main=k?[(k.loin[0]+k.proche[0])/2-8,(k.loin[1]+k.proche[1])/2-18]:[R.bx-100,DECK-260];
    const B=k3dome(PX+(i?58:22));
    if(d>=-.78&&d<-.4){const v=k3ez((d+.78)/.14);k3bloc(c,k3l(x0+i*26,main[0],v),k3l(DECK-8,main[1],v),34,reduce?0:Math.sin(tm*30)*.04,3+i);S['m'+i]=main;
      if(!reduce)for(let j=0;j<4;j++)k3poly(c,[[main[0]-24+j*15,main[1]+26+((tm*260+j*19)%44)],[main[0]-19+j*15,main[1]+34+((tm*260+j*19)%44)],[main[0]-26+j*15,main[1]+36+((tm*260+j*19)%44)]],'#5d6092')}   /* terre qui s'en égrène */
    if(d>=-.4&&d<0){const u=(d+.4)/.4,p0=S['m'+i]||main,arc=-150-60*i,at=w=>[k3l(p0[0],B[0],w),k3l(p0[1],B[1],w)+arc*Math.sin(Math.PI*w)*(1-.25*w)];
      for(let j=4;j>0;j--){const w=u-j*.07;if(w>0){const p=at(w);k3poly(c,[[p[0]-9+j,p[1]],[p[0],p[1]-9+j],[p[0]+9-j,p[1]],[p[0],p[1]+9-j]],'rgba(150,140,186,'+(.75-j*.14)+')')}}
      const p=at(u);k3bloc(c,p[0],p[1],34,u*7,3+i)}
    if(d>=0){k3impact(c,B,d,78,41+i,['#cfd8f2','#8d90bc','#37375f','#ff9a35']);k3gravats(c,B[0],d,90+i*11,7);k3poussiere(c,B[0],B[1]+20,d,33+i,7,.7);k3domeTouche(c,B,d,h)}
  });
}
/* ---- 4. cri : la voix ébranle le Clocher, la maçonnerie tombe droit sur le Veilleur ---- */
function k3cri(c,a,H,q,off,tm){const fin=H[H.length-1].at-off,M=COL3.mouth||[R.bx-84,DECK-228];
  const k=k3bump(q,.32,fin,.14);
  if(k>.02){const dir=Math.atan2(-.18,-1);c.save();c.lineCap='round';
    for(let i=0;i<5;i++){const v=((q-.32)*1.7+i/5)%1,r=26+v*340;c.strokeStyle='rgba(255,'+(150+i*14)+',80,'+((1-v)*.8*k)+')';c.lineWidth=10*(1-v)+2;c.beginPath();c.arc(M[0],M[1],r,dir-.62,dir+.62);c.stroke();
      c.lineWidth=5*(1-v)+1;c.beginPath();c.arc(M[0],M[1],r*.8,-1.9,-1.25);c.stroke()}c.restore();
    /* poussière et gravats qui ruissellent de la voûte */
    const r=k3rnd(12);for(let i=0;i<46;i++){const x=r()*W,s=3+r()*5,y=((tm*(240+r()*260)+r()*500)%(DECK+30))-30;k3poly(c,[[x,y-s*2.4],[x+s*.6,y],[x,y+s],[x-s*.6,y]],i%3?'rgba(150,140,186,'+.6*k+')':'rgba(207,216,242,'+.8*k+')')}}
  /* le dallage se fend sous lui */
  const fk=k3ez((q-.36)/.3),fa=1-k3ez((q-fin-.8)/.8);if(fk>0&&fa>0)k3fente(c,R.bx-150,PX+150,fk*.9,fa);
  if(q>.36&&q<1)k3poussiere(c,R.bx-90,DECK,q-.36,5,10);
  const many=H.length>1;
  H.forEach((h,i)=>{const d=a.t-h.at,x=PX+(many?[6,38,-26,52,-4][i%5]:14),top=k3dome(x),r=many?30:44;
    if(d>=-.9&&d<0){const w=k3cl((d+.9)/.9);c.fillStyle='rgba(8,4,22,'+(.25+.35*w)+')';c.beginPath();c.ellipse(x,DECK+3,14+r*w,4+3*w,0,0,K3TAU);c.fill();
      if(d<-.6){const v=(d+.9)/.3;for(let j=0;j<6;j++){const px=x-30+j*12,py=v*70+(j*23)%40;k3poly(c,[[px,py],[px+3,py+10],[px-3,py+10]],'#cfd8f2')}}}
    if(d>=-.6&&d<0){const u=(d+.6)/.6,y=k3l(-70,top[1],u*u);
      for(let j=-1;j<=1;j++)k3poly(c,[[x+j*r*.6-3,y-r*.4],[x+j*r*.6+3,y-r*.4],[x+j*r*.6,y-r*.4-(50+70*u)*(j?.6:1)]],'rgba(207,216,242,.55)');
      k3bloc(c,x,y,r,.3+u*(i%2?2.4:-2),60+i);if(!many){k3bloc(c,x-r*1.1,y-r*.7,r*.4,u*5,71);k3bloc(c,x+r*1.05,y-r*1.1,r*.34,-u*6,72)}}
    if(d>=0){k3impact(c,top,d,r*2,61+i,['#cfd8f2','#8d90bc','#37375f','#2b2a4c']);k3gravats(c,x,d,130+i*13,many?5:9);k3poussiere(c,x,top[1]+24,d,43+i,8,.7);k3domeTouche(c,top,d,h)}
  });
}
function drawHits3a(){
  const a=R.atk;if(!col3PluieA(a)||R.mode!=='play')return;
  const H=col3PluieH(a);if(!H.length)return;
  const c=ctx,off=a.off||0,q=a.pt,tm=reduce?0:R.time;if(!a.c3)a.c3={};
  /* secousses de la maquette : à chaque impact, et pendant le cri (rendu seulement ; nulles en mouvement réduit) */
  if(!reduce){H.forEach(h=>{if(!h.c3s&&a.t>=h.at){h.c3s=1;R.shake=Math.max(R.shake,h.k==='bomb'||h.k==='fall'?11:8)}});
    if(a.kind==='roar'&&q>.34&&a.t<H[H.length-1].at)R.shake=Math.max(R.shake,4)}
  c.save();
  if(a.kind==='avalanche'){if(a.h)k3bombes(c,a,H,q,tm);else k3grele(c,a,H,q,off,tm)}
  else if(a.kind==='rocks')k3pierres(c,a,H,tm);
  else k3cri(c,a,H,q,off,tm);
  c.restore();
}
/* débris arraché (corne, bec d'enclume) : il part de p (point du corps au moment du coup), tombe, roule et s'efface ; u = secondes depuis la cassure */
function col3Debris(c,id,u,p,dessin,cols){
  if(u<0){COL3[id]=null;return}if(u>=CN3.sol+.5)return;
  if(!COL3[id])COL3[id]=p.slice();const p0=COL3[id],s=k3cl(u/CN3.chute),x=k3l(p0[0]+8,p0[0]+28,s),sol=DECK+16,y=k3l(p0[1],sol,s*s)-70*Math.sin(s*Math.PI);
  c.save();c.globalAlpha=1-k3cl((u-CN3.sol)/.5);dessin(x,s<1?y:y-12,s<1?(reduce?1.45*s:u*9):1.45);c.restore();
  if(!reduce){k3shards(c,x,sol,u-CN3.chute,12,['#9a9cc8',cols[0],'#ff9a35'],170,13,DECK+6);k3shards(c,p0[0],p0[1],u,20,cols,300,12,DECK+5)}
  k3fumee(c,p0[0],p0[1],u%1.8,6,44)}
/* centre de la lanterne du Veilleur (départ du rayon, des comètes et des tirs du final), au bout du bâton complet (baton3) ; h = heroPose3() */
function lant3(h){h=h||heroPose3();return [h.x+h.hand[0]+Math.cos(h.sa)*BATON3.haut,DECK+(h.y||0)+(h.hand[1]+Math.sin(h.sa)*BATON3.haut)*(h.sy||1)]}
/* contres (maquette colosse-clocher.js, scènes 1 à 9) : armes = garde bleue puis rayon du sceptre ; distance = cinq comètes ;
   cloche = ondes de la grande cloche et KO auditif ; rage = cloche puis foudre (tête et cœur, ou la grande corne à la première foudre de la seconde vie) */
function col3CnFx(){
  const c=ctx,tm=reduce?0:R.time,k=COL3.k;
  /* la grande corne (seconde vie) et le bec de l'enclume (première foudre) tombent, roulent et restent un moment au sol */
  if(k&&R.mode==='play'){
    if(R.hornAt!=null)col3Debris(c,'hp',R.time-R.hornAt-CN3.brise,k.corne,(x,y,r)=>k3corne(c,x,y,r),['#a47c8a','#4a2642','#ff9a35','#ffffff']);
    if(COL3.foudre1!=null)col3Debris(c,'ep',R.time-COL3.foudre1-CN3.enclume,k.enclume,(x,y,r)=>{c.save();c.translate(x,y);c.rotate(r);c.scale(C3*COL3.f.m,C3);COLOSSE.eclatEnclume(c);c.restore()},['#6a4a72','#35223f','#ff9a35','#ffe08a']);
    /* foudre du regain de vie : les ailes perdent des lambeaux en brûlant */
    if(R.healed&&R.wdAt!=null&&!reduce){const u=R.time-R.wdAt-CN3.ronge;k3shards(c,k.x0+130,DECK-230,u,24,['#6a3050','#2c1534','#ff9a35'],200,72,DECK+5);k3shards(c,k.x0-130,DECK-230,u-.1,18,['#6a3050','#2c1534','#ff9a35'],200,73,DECK+5)}
  }
  const S=COL3.cs;if(!S||!k||R.mode!=='play'||R.atk)return;
  const u=R.time-S.t0,T=S.T,s=u-T;
  if(S.k==='plant'){
    if(u>T+.8)return;
    const L=lant3();k3charge(c,L,(u-(T-CN3.charge))/.4,tm);
    if(S.kind==='whip'){const d0=T-CN3.boule-.05;if(u>d0&&u<T+.2)k3rayon(c,L,k.boule,(u-d0)/(T+.25-d0),1.05)}   /* le rayon cueille la boule et la lui renvoie */
    else{k3rayon(c,L,k.head,(u-T+CN3.rayon)/CN3.rayonD,1.05);k3contact(c,k.head,s,120,12,['#fffbea','#ffe58a','#ff9a35','#6a4a72'])}   /* le rayon frappe le marteau qui retombe (faux coup) et le repousse */
    if(S.kind==='whip')k3contact(c,k.coeur,s,150,17,CN3_COUPS);
  }else if(S.k==='bat'){if(u<T+1)k3cometes(c,lant3(),T-CN3.comete,u,k.coeur,tm)}
  else if(S.k==='bell'){k3ondesCloche(c,u-R_CN.bell.ring,k.tete,1);k3acouphene(c,k.tete,COL3.ko||0,tm)}
  else if(S.k==='bolt'){
    k3ondesCloche(c,u-R_CN.bolt.ring,k.tete,1.35);k3acouphene(c,k.tete,COL3.ko||0,tm);
    const pts=[k.tete,k.corne,k.coeur,k.loin,k.proche,k.torse,[k.x0-40,DECK-40],[k.x0+60,DECK-30]];
    if(s<0)k3arcs(c,[k.tete,k.corne,k.corne,k.tete,k.proche,k.torse,pts[6],pts[7]],k3ez((u-(T-.25))/.2),tm);
    else{
      const corne=R.hornAt!=null&&Math.abs(R.hornAt-(S.t0+T))<.1;   /* première foudre de la seconde vie : elle frappe la grande corne */
      k3solFendu(c,k.x0,s,1-k3ez((s-1.9)/1));
      if(corne)k3foudre(c,s,k.corne);else{k3foudre(c,s,k.tete);k3foudre(c,s-CN3.foudre2,k.coeur)}
      k3arcs(c,pts,1-k3ez((s-.5)/1),tm);
      if(!reduce){k3shards(c,k.coeur[0],k.coeur[1],s,36,['#cfd8ff','#6a3050','#2c1534','#ff9a35','#ffffff'],430,71,DECK+5);
}
      [[-110,-200],[110,-210],[0,-120],[150,-90]].forEach(([x,y],i)=>k3fumee(c,k.x0+x,DECK+y,(s-.4-i*.17)%1.6,6,80+i));
    }
  }
}
/* fond : la nuit rougit au cri de rage, l'orage roule pendant le contre de rage (avant le Colosse) */
function col3Ciel(){
  if(R.mode!=='play')return;const a=R.atk,S=COL3.cs,tm=reduce?0:R.time;
  if(col3CriA(a)){const n=.45*k3ez(a.t/.7)*(1-k3ez((a.t-2)/.5));if(n>.01){ctx.fillStyle='rgba(30,4,20,'+n+')';ctx.fillRect(-40,-40,W+80,H+80)}}
  if(S&&S.k==='bolt'&&!a){const u=R.time-S.t0;k3orage(ctx,tm,k3bump(u,R_CN.bolt.ring,S.T+1.1,.3))}
}
function drawHits3(){col3Fx();drawHits3a();drawHitsX()}
/* ===== coup de queue en pivot et onde de flammes (maquette validée colosse-queue-onde.js) : aplats nets, ni flou ni ombre ===== */
/* traînée de feu derrière la pointe de la queue */
function k3sillage(c,pts,al){if(pts.length<3||al<=0)return;c.save();c.globalAlpha=al;
  [[17,'#8e2418'],[11,'#d4501f'],[6,'#ff9a35'],[2,'#ffe08a']].forEach(([w,col])=>{const g=[],d=[];pts.forEach((p,i)=>{const u=i/(pts.length-1),q=pts[Math.min(pts.length-1,i+1)],r=pts[Math.max(0,i-1)],an=Math.atan2(q[1]-r[1],q[0]-r[0]),ww=w*u*(i%2?1.15:.8);
    g.push([p[0]-Math.sin(an)*ww,p[1]+Math.cos(an)*ww]);d.push([p[0]+Math.sin(an)*ww,p[1]-Math.cos(an)*ww])});k3poly(c,[...g,...d.reverse()],col)});c.restore()}
function drawQueueFx(a,h,d,i){
  const k=COL3.k,Z=k&&k.Z;if(!Z)return;
  const c=ctx,t=a.t,H=h.at,haut=i%2===1,a0=H-(haut?.2:.16);
  if(t>a0&&d<.22){const pts=[],fin=Math.min(t,H),deb=Math.max(a0,t-.09);if(fin>deb)for(let j=0;j<=10;j++)pts.push(col3QTip(Z,k3l(deb,fin,j/10),k.x0));k3sillage(c,pts,(d<0?1:1-d/.22)*.8)}
  k3contact(c,[PX+118,DECK-(haut?70:46)],d,haut?110:92,41+i);
  if(!haut)k3pas(c,PX+150,d,1.3,44+i);
  else if(d>0)k3fente(c,PX+120,PX+196,d/.15,1-k3ez((d-.3)/.5));
  if(i===0)k3pas(c,k.x0,t-(Z.P0+.22),1,45);   /* il retombe du pivot */
  if(H===Z.HL)k3pas(c,k.x0,t-(Z.R1-.04),1.6,46);   /* il se retourne et retombe lourdement */
}
/* vague de flammes découpées : de x0 (poings) à x1 (garde) ; u avancée (0 à 1), fin = secondes depuis l'arrivée */
function k3vague(c,x0,x1,u,fin,tm){if(u<0)return;
  const x=k3l(x0,x1,k3cl(u)),al=fin<0?1:1-k3cl(fin/.3),sg=x1<x0?-1:1;
  if(al>0){c.save();c.globalAlpha=al;colGlow(c,x,DECK-50,170,'255,130,50',.5*al);
    for(let i=7;i>=0;i--){const px=x-sg*(i*30+(fin>0?fin*40*i:0));if((x0-px)*sg>60)continue;const h=(214-i*24)*(fin<0?.55+.45*k3cl(u*2.4):1-k3cl(fin/.3))*(1+.13*Math.sin(tm*23+i*2));k3flame(c,px,DECK+8+(i%2)*3,40-i*2.4,h,(-34+i*3)*-sg,tm*14+i*1.7)}
    c.restore()}
  const r=k3rnd(52),span=Math.max(.2,ONDE.vg-ONDE.imp);for(let i=0;i<15;i++){const px=k3l(x0,x1,(i+.5)/15),v=(u*span-(i+.5)/15*span)/.55;if(v<=0||v>=1)continue;
    const y=DECK+4-Math.sin(v*Math.PI)*(26+r()*52),R_=8+r()*9,q=v*6+i;
    k3poly(c,[[px+Math.cos(q)*R_,y+Math.sin(q)*R_*.7],[px+Math.cos(q+1.7)*R_,y+Math.sin(q+1.7)*R_*.7],[px+Math.cos(q+3.1)*R_,y+Math.sin(q+3.1)*R_*.5],[px+Math.cos(q+4.6)*R_,y+Math.sin(q+4.6)*R_*.5]],i%2?'#5d6092':'#8d90bc')}
  if(fin>0&&fin<.55){const v=fin/.55;[[-92,150],[-66,190],[-40,140],[-112,110],[-20,100]].forEach(([deg,L],i)=>{const an=(sg<0?deg:-180-deg)*Math.PI/180,bx=x1-4*sg,by=DECK-40;
    c.save();c.globalAlpha=1-v*v;k3flame(c,bx+Math.cos(an)*L*v*.8,by+Math.sin(an)*L*v*.8,18*(1-v*.5),70*(1-v*.6),(deg+90)*.7*-sg,tm*17+i);c.restore()})}}
/* il aspire le feu : traits de braise qui convergent vers son cœur */
function k3aspire(c,p,m,tm){const k=k3bump(m,.25,1.15,.2);if(k<=0)return;c.save();c.globalAlpha=k;colGlow(c,p[0],p[1],60+50*k3ez((m-.3)/.8),'255,150,60',.7*k);
  for(let i=0;i<16;i++){const v=(tm*1.5+i*.137)%1,an=i*2.4,d=210*(1-v)+14,x=p[0]+Math.cos(an)*d,y=p[1]+Math.sin(an)*d*.8,L=14+34*v,w=3+6*v;
    k3poly(c,[[x-Math.sin(an)*w,y+Math.cos(an)*w*.8],[p[0]+Math.cos(an)*Math.max(8,d-L),p[1]+Math.sin(an)*Math.max(8,d-L)*.8],[x+Math.sin(an)*w,y-Math.cos(an)*w*.8],[x+Math.cos(an)*L*.5,y+Math.sin(an)*L*.4]],i%3?'#ff9a35':'#ffe08a')}
  c.restore()}
function k3ondeSol(c,bx,v,x1,u,fade,seed){
  k3fente(c,bx,x1,u,fade);
  if(v<.5){const w=v/.5;c.strokeStyle='rgba(255,170,90,'+(1-w)+')';c.lineWidth=13*(1-w)+2;c.beginPath();c.ellipse(bx,DECK+4,34+w*260,(34+w*260)*.12,0,0,K3TAU);c.stroke()}
  k3contact(c,[bx,DECK-12],v,120,seed,['#ff9a35','#ffe08a','#fff6d8']);k3pas(c,bx+30,v,1.7,seed+1)}
function drawOnde(a,h,d){
  const k=COL3.k;if(!k)return;const c=ctx,tm=reduce?0:R.time,m=col3OndeM(a,h),x1=PX+122;
  if(m<.2||m>3.4)return;
  k3aspire(c,k.coeur,m,tm);
  if(m>ONDE.imp){
    if(h.bx==null)h.bx=k.poing[0];   /* les poings frappent les dalles ici ; la vague part de là */
    const v=(m-ONDE.imp)*(.45/(ONDE.vg-ONDE.imp)),u=(m-ONDE.imp)/(ONDE.vg-ONDE.imp);
    if(!h.imp){h.imp=1;if(!reduce)R.shake=Math.max(R.shake,8)}
    k3ondeSol(c,h.bx,v,x1,u,1-k3ez((m-2.8)/.6),61);
    k3vague(c,h.bx-6,x1,u,m-ONDE.vg,tm);
  }
  k3contact(c,[PX+118,DECK-62],d,96,63,['#ff9a35','#ffe08a','#fff6d8']);
}
/* Difficile, seconde vie : la frappe du marteau planté, puis une onde courte de la tête du marteau jusqu'à la garde */
function drawMarteauOnde(d){
  const k=COL3.k;if(!k||d<-.15||d>.9)return;const c=ctx,tm=reduce?0:R.time,x0=k.head[0],x1=PX+122,u=(d+.15)/.15;
  k3ondeSol(c,x0,d+.15,x1,u,1-k3ez((d-.4)/.5),71);
  k3vague(c,x0-6,x1,u,d,tm);
  k3contact(c,[PX+118,DECK-62],d,96,73,['#ff9a35','#ffe08a','#fff6d8']);
}
function drawHitsX(){
  const a=R.atk;if(!a)return;
  let fi=0;
  for(const h of a.hits){
    const d=a.t-h.at;
    if(h.k==='blast'){
      const gsh=a.h&&a.kind==='greatsword'&&!h.flap&&!h.pre;
      if(h.flap){if(d>-.22&&!h.sw){h.sw=true;tone(200,.2,'sawtooth',.06,-160)}drawQueueFx(a,h,d,fi++)}   /* coup de queue : sa vraie queue (pose), ici la traînée et l'impact */
      else if(gsh)drawMarteauOnde(d);   /* Difficile : la frappe du marteau reste, l'explosion devient une onde de flammes */
      else drawOnde(a,h,d);
    }
  }
}
function drawCn3(){col3CnFx()}
/* Fin : depuis le Clocher, la mer de nuit. Au large, le Phare Noyé, à demi englouti, ne répond pas. Lien vers Silent Bells. */
function renderSpace(){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const tt=R.time,st=R.st,HZ=318;
  const g=ctx.createLinearGradient(0,0,0,HZ);g.addColorStop(0,'#03050f');g.addColorStop(.7,'#0c1430');g.addColorStop(1,'#1c2a4a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,HZ);
  for(const s of SPSTARS){if(s.y>HZ)continue;ctx.globalAlpha=.3+.6*Math.abs(Math.sin(tt*.7+s.p));ctx.fillStyle='#f2f6ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r*.8,0,6.283);ctx.fill()}
  ctx.globalAlpha=1;
  const mg=ctx.createRadialGradient(200,90,4,200,90,90);mg.addColorStop(0,'rgba(235,240,255,.9)');mg.addColorStop(.25,'rgba(235,240,255,.25)');mg.addColorStop(1,'rgba(235,240,255,0)');
  ctx.fillStyle=mg;ctx.fillRect(110,0,180,180);ctx.fillStyle='#eef2ff';ctx.beginPath();ctx.arc(200,90,18,0,6.283);ctx.fill();
  /* mer */
  const sg=ctx.createLinearGradient(0,HZ,0,H);sg.addColorStop(0,'#16223e');sg.addColorStop(1,'#04070f');
  ctx.fillStyle=sg;ctx.fillRect(0,HZ,W,H-HZ);
  ctx.strokeStyle='rgba(200,215,255,.10)';ctx.lineWidth=1.5;
  for(let i=0;i<14;i++){const y=HZ+8+i*i*1.3,o=(tt*(8+i*2)+i*97)%W;ctx.beginPath();ctx.moveTo(o-200,y);ctx.lineTo(o-200+60+i*8,y);ctx.moveTo(o+180,y);ctx.lineTo(o+180+40+i*6,y);ctx.stroke()}
  ctx.fillStyle='rgba(235,240,255,.08)';for(let i=0;i<8;i++){ctx.fillRect(196-6+Math.sin(tt*2+i)*6,HZ+10+i*14,12+i*2,2)}
  /* le Phare Noyé, au large : tour inclinée, à demi sous l'eau */
  const lx=704,ly=HZ+6;
  ctx.save();ctx.translate(lx,ly);ctx.rotate(.14);ctx.scale(1.7,1.7);
  ctx.fillStyle='#0b1022';ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-7,-62);ctx.lineTo(7,-62);ctx.lineTo(11,0);ctx.closePath();ctx.fill();
  ctx.fillRect(-10,-70,20,8);ctx.beginPath();ctx.moveTo(-9,-70);ctx.lineTo(0,-82);ctx.lineTo(9,-70);ctx.closePath();ctx.fill();
  const on=st>2.2?(Math.sin(tt*2.3)>-.2?1:0)*(Math.random()<.04?0:1)*(.35+.25*Math.sin(tt*1.7)):0;
  if(on>0){const bg=ctx.createRadialGradient(0,-66,1,0,-66,46);bg.addColorStop(0,'rgba(140,255,230,'+(.8*on)+')');bg.addColorStop(1,'rgba(80,200,220,0)');ctx.fillStyle=bg;ctx.beginPath();ctx.arc(0,-66,46,0,6.283);ctx.fill()}
  ctx.fillStyle=on>0?'rgba(170,255,235,'+(.5+on)+')':'#1a2440';ctx.fillRect(-4,-69,8,6);
  ctx.restore();
  ctx.fillStyle='rgba(22,34,62,.9)';ctx.fillRect(lx-30,ly,60,4);
  if(st>2.2){const al=.5*(.5+.5*Math.sin(tt*2.3));ctx.fillStyle='rgba(140,255,230,'+(.12*al)+')';ctx.fillRect(lx-6,ly+4,14,80)}
  /* premier plan : le parapet du Clocher, la lanterne posée qui veille */
  ctx.fillStyle='#2a2f4e';ctx.fillRect(0,H-90,W,90);
  for(let x=0;x<W;x+=120){ctx.fillRect(x+20,H-128,64,40)}
  ctx.fillStyle='rgba(10,14,34,.5)';for(let x=0;x<W;x+=60)ctx.fillRect(x,H-60,2,60);ctx.fillRect(0,H-60,W,2)
  ctx.fillStyle='rgba(235,243,255,.75)';for(let x=0;x<W;x+=120){ctx.fillRect(x+20,H-131,64,4)}ctx.fillRect(0,H-92,W,3);
  drawFanal(292,H-128,1,tt);
  /* l'appel de la cloche part du Clocher... et se perd vers le large */
  const cyc=(st%4.5)/4.5;
  if(st<9){ctx.strokeStyle='rgba(255,236,190,'+(.35*(1-cyc))+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(292,H-140,40+700*cyc,14+160*cyc,0,Math.PI,2*Math.PI);ctx.stroke()}
  ctx.drawImage(vig,0,0,W,H);
  const f=1-clamp01(st/1.2);if(f>0){ctx.fillStyle='rgba(0,0,0,'+f+')';ctx.fillRect(0,0,W,H)}
}

function drawHints3(){
  if(!LB.help.on()||R.mode!=='play')return;
  const a=R.atk,p=R.pl;
  if(a&&p.s!=='counter'){
    const h=a.hits.find(x=>!x.done);
    if(h){
      LB.cue(ctx,{x:PX,y:DECK-206,cx:GUARD[0],cy:GUARD[1],r:60,tt:h.at-a.t,act:HD('block').act,easy:DIFF.easy});
    }
  }
  LB.drawRecoveryBar(ctx,PX,DECK,p); /* barre de récupération sous les pieds : repère d'aide, jamais rouge (la lanterne l'est) */
}
function renderR(){
  if(R.mode==='space'){renderSpace();return}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(R.shake>0&&!reduce)ctx.translate(rand(-1,1)*R.shake,rand(-1,1)*R.shake);
  r3Background();
  r3Ground();
  drawBellWaves();
  col3Ciel();
  {/* final : la lumière du fanal touche le Colosse agenouillé, en pleine poitrine ; la pierre noire se répand en cercle depuis ce point (anneau de lumière sur son bord) */
   const pk=R.mode==='finale'?clamp01((R.fin.t-(FIN.hero+.1))/1.9):0,cp=COL3.k?COL3.k.coeur:[R.bx-42,DECK-200],rr=es(pk)*620;
   if(pk<=0)drawBoss3();
   else{
     if(pk<1){ctx.save();ctx.beginPath();ctx.rect(-40,-40,W+80,H+80);ctx.arc(cp[0],cp[1],rr,0,6.283);ctx.clip('evenodd');drawBoss3();ctx.restore()}
     if(OFF.width!==cv.width||OFF.height!==cv.height){OFF.width=cv.width;OFF.height=cv.height}
     const main=ctx;OFFX.setTransform(1,0,0,1,0,0);OFFX.clearRect(0,0,OFF.width,OFF.height);OFFX.setTransform(main.getTransform());
     ctx=OFFX;try{drawBoss3()}finally{ctx=main}
     main.save();if(pk<1){main.beginPath();main.arc(cp[0],cp[1],rr,0,6.283);main.clip()}
     main.setTransform(1,0,0,1,0,0);main.filter='grayscale(1) brightness(.62)';main.drawImage(OFF,0,0);main.filter='none';main.restore();
     if(pk<1){ctx.save();ctx.strokeStyle='rgba(255,240,190,'+(.85*(1-pk))+')';ctx.lineWidth=4*(1-pk)+1;ctx.beginPath();ctx.arc(cp[0],cp[1],rr,0,6.283);ctx.stroke();ctx.restore()}
   }}
  if(R.mode==='finale'){const T=R.fin.t-FIN.collapse-.55;if(T>0&&T<.9){k3pas(ctx,R.bx-290,T,2,91);k3pas(ctx,R.bx-130,T,1.4,92)}}   /* la chute soulève la poussière du Clocher */
  drawFallWings();drawFinFx();
  if(R.mode==='finale'&&R.fin.t<.4)drawBolt(R.bx-20,-10,DECK-260,1-R.fin.t/.4,true);
  drawHits3();
  drawHero3();
  if(R.mode==='finale'){const ft=R.fin.t,a0=FIN.hero-1.0;if(ft>=a0&&ft<FIN.hero-.3){const L=lant3(),u=es(clamp01((ft-a0)/.4)),al=ft<FIN.hero-.5?1:clamp01((FIN.hero-.3-ft)/.2);lanternBeam(L,lerp2(L,FANAL3_FEU,u),12,al)}}
  if(R.mode==='finale'&&COL3.k){const ft=R.fin.t,t0=FIN.hero-.3;if(ft>=t0&&ft<FIN.hero+.5){const u=es(clamp01((ft-t0)/.4)),al=ft<FIN.hero+.1?1:clamp01((FIN.hero+.5-ft)/.4),F=FANAL3_FEU;ctx.save();ctx.globalCompositeOperation='lighter';lanternBeam(F,lerp2(F,COL3.k.coeur,u),14,al);ctx.restore()}}
  drawCn3();
  for(const s of R.steam){ctx.fillStyle='rgba(235,245,255,'+(.35*clamp01(s.life/s.max))+')';ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,6.283);ctx.fill()}
  drawHints3();
  drawFx2();
  BEL3.neige(ctx,reduce?0:R.time);
  ctx.restore();
  BEL3.vig(ctx);
  if(R.flash>0){ctx.fillStyle='rgba(255,255,255,'+R.flash+')';ctx.fillRect(0,0,W,H)}
  if(R.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(R.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  let fade=0;
  if(R.mode==='intro')fade=1-clamp01(R.t/.8);
  if(R.mode==='won'&&R.boss.t>1.6)fade=clamp01((R.boss.t-1.6)/1.2)*.6;
  if(R.mode==='finale')fade=clamp01((R.fin.t-FIN.fade)/1.1);
  if(fade>0){ctx.fillStyle='rgba(0,0,0,'+fade+')';ctx.fillRect(0,0,W,H)}
}

