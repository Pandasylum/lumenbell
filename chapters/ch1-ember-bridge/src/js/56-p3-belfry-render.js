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
  const fire=(ob.warm>1.1||R.rage>0)&&!(o.out>.5),hot=ob.ws>1.05,wf=reduce?0:Math.sin(t*1.8)*.03;
  if(ob.flip){ctx.save();ctx.translate(bx,0);ctx.scale(-1,1);ctx.translate(-bx,0)}
  if(R.healed&&!fin&&R.boss.s!=='dead'){ctx.save();ctx.translate(bx,DECK+dy);ctx.scale(.92,.92);drawAura3(ob,t);ctx.restore()}
  if(R.atk&&R.atk.dbl&&R.atk.t<R.atk.hits[R.atk.hits.length-1].at+.05){ctx.save();ctx.translate(bx,DECK+dy);ctx.rotate(fin?ob.lean:0);ctx.scale(.92,.92);ctx.fillStyle='rgba(255,176,74,'+(.85+.15*Math.sin(t*30))+')';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=14;ctx.font='900 54px '+DISPLAY;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!'.repeat(R.atk.tn||2),-170,-300);ctx.restore()}
  ctx.save();ctx.translate(bx,DECK+dy);if(fin&&ob.lean)ctx.rotate(ob.lean);ctx.translate(C3X+o.dx,0);ctx.scale(C3*fm,C3);
  const rig=COLOSSE.draw(ctx,{dos:o.dos||0,qD:o.qD,qP:o.qP||undefined,ouvre:o.dos?1-o.plie:0,rage:o.dos?Math.min(.34,wd):undefined,lean:o.lean,drop:o.drop,sx:o.sx,dF:o.dF,dN:o.dN,off:o.off,nn:o.nn,plie:o.plie,kneel:o.kneel,kdk:o.kdk,out:o.out,tete:o.tete,jaw:o.jaw,fissure:fin?1:wd,
    t:reduce?0:t,warm:ob.warm,eyes:o.yeux,breath:reduce?null:t,smoke:1,hurt:R.recoil>.3,legs:{f:[o.fx,o.fl,o.fa],n:[o.nx,o.nl,o.na]},tip:[o.tx,o.ty],heat:o.heat,sag:20,
    ham:{P:o.P,a:o.a,g:o.g,wN:o.wN,wF:o.wF,s:o.s,r:o.r},
    back:applyM=>{
      /* ailes dans le dos (mêmes sprites et même place qu'en phase I) : elles suivent le buste ; la seconde vie les abîme, le final en coupe une ou deux */
      ctx.save();applyM();ctx.scale(.92/C3,.92/C3);
      for(const sd of [-1,1]){
        if((sd===-1&&R.cut>=1)||(sd===1&&R.cut>=2))continue;
        const dm=wd*(sd===1?1:.7),dr=.12*dm,sz=1-.06*dm,k=sd<0?.82:1,x=sd<0?-57:63;
        drawWing([x,-250],-.85+wf+o.wa+dr,.8*k*o.ws*sz,hot?'#5a1a28':'#220a11',.34,fire,sd,dm);
        drawWing([x-sd*13,-260],-1.15+wf+o.wa+dr,k*o.ws*sz,hot?'#7a2230':'#35101a',.34,fire,sd,dm);
      }
      ctx.restore();
    },
    front:r=>{if(o.griffe>.02){ctx.save();k3griffes(ctx,r.na.E,r.na.W,o.griffe);k3griffes(ctx,r.fa.E,r.fa.W,o.griffe);ctx.restore()}}});
  ctx.restore();
  COL3.k={gueule:col3W(rig.gueule),coeur:col3W(rig.coeur),head:col3W(rig.head),poing:col3W(rig.fa.W),Z:o.Z||null,x0:COL3.f.x0};COL3.mouth=COL3.k.gueule;
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
function drawHero3(){
  const p=R.pl,h=heroPose3(),t=R.time;
  const hf=heroFlip();if(hf){ctx.save();ctx.translate(h.x,0);ctx.scale(-1,1);ctx.translate(-h.x,0)}
  if(!h.y)ctx.fillStyle='rgba(0,0,0,.35)',ctx.beginPath(),ctx.ellipse(h.x,DECK+2,30,5,0,0,6.283),ctx.fill();
  /* le Veilleur commun (LB.drawWatcher) ; la phase donne sa géométrie : sceptre en main, garde levée, contres, finale */
  const c3=R.cn,hk3=c3&&(c3.k==='bat'||c3.k==='plant')?Math.max(0,1-Math.abs(c3.t-(c3.k==='bat'?.24:.32))/.16):0;
  const play=R.mode==='play',low=p.s==='down'||p.s==='hurt';
  const pose=R.mode==='intro'?'walk':R.mode==='finale'?'victory':!play?'idle':c3?'cast':p.s==='act'?'raise':low?(p.s==='down'?'down':'hurt'):'idle';
  LB.drawWatcher(ctx,h.x,DECK+(h.y||0),pose,t,{dx:0,dy:0,rot:h.rot,rot2:0,sx:1,sy:h.sy,
    breath:pose==='idle'&&play,hand:h.hand,sa:h.sa,L:76,
    glow:p.s==='act'?1:Math.max(.3,h.glow||0,hk3),
    lanternCol:LB.watcherLanternCol(p,p.s!=='recover'&&(p.s==='act'||h.glow>0||hk3>0)),
    beam:hk3>0?{len:48*hk3,w:14,al:hk3}:null});
  if(p.s==='act')LB.drawBlock(ctx,PX,DECK,p.t,HD('block').act,{plain:true});
  if(hf)ctx.restore();
}
function drawBombs(a){
  const off=a.off||0,q=a.t-off;let i=0;
  for(const h of a.hits){
    if(h.k!=='bomb')continue;
    const k=i++,L=bombL(k),P=bombPos(k),d=a.t-h.at;
    if(d>=0){
      if(d<.45){
        const f=1-d/.45;
        ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
        const rr=30+110*(1-f),g=ctx.createRadialGradient(P[0],P[1],4,P[0],P[1],rr);
        g.addColorStop(0,'rgba(255,240,190,'+(.7*f)+')');g.addColorStop(1,'rgba(255,100,30,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(P[0],P[1],rr,0,6.283);ctx.fill();
        for(let j=0;j<5;j++)qflame(P[0]+(j-2)*13,DECK+4,15,(160-Math.abs(j-2)*28)*f,j,j%2?'rgba(255,196,90,.95)':'rgba(255,100,40,.95)');
        ctx.restore();
      }
      continue;
    }
    if(q<L-.55)continue;
    let y=P[1];
    if(q<L){const u=(q-(L-.55))/.55;y=-60+(P[1]+60)*ei(u)}
    drawIce3(P[0],y,true);
    if(d>-.7){ /* clignotement d'annonce : plus tôt, plus fort, de plus en plus rapide */
      const u=1+d/.7,pl=.5+.5*Math.sin(R.time*(30+30*u)),rr=40+60*u;
      const g=ctx.createRadialGradient(P[0],y,2,P[0],y,rr);
      g.addColorStop(0,'rgba(255,245,210,'+Math.min(1,.35+.65*u*pl)+')');g.addColorStop(1,'rgba(255,120,40,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(P[0],y,rr,0,6.283);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,'+(.6*u*pl)+')';ctx.beginPath();ctx.arc(P[0],y,26,0,6.283);ctx.fill();
    }
  }
}
function drawHits3a(){
  const a=R.atk;if(!a)return;
  if(a.h&&a.kind==='avalanche'){drawBombs(a);return}
  if(a.kind==='avalanche'){
    let ii=0;
    a.hits.forEach(h=>{
      if(h.k!=='ice')return;
      const i=ii++,d=a.t-h.at;
      if(d<-.55||d>0)return;
      const u=(d+.55)/.55,x=PX+104+(i%3)*14,y=-60+(GUARD[1]+10+60)*ei(u);
      drawIce3(x,y,true);
    });
  }
}
/* Contre « lumière » (grêle, griffes, pierres, cri) : le Veilleur n'a plus de batte, il utilise sa lanterne. A : nova de lumière, B : volée d'éclats, C : cloche de la lanterne */
function batFx(c){
  const t=c.t,V='B',h=heroPose3(),x=heroX3();
  const L=[x+h.hand[0]+Math.cos(h.sa)*76,DECK+(h.hand[1]+Math.sin(h.sa)*76)*h.sy],G=[R.bx-40,DECK-190];
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(V==='A'&&t>=.2&&t<.8){
    const u=clamp01((t-.2)/.47),r=30+(G[0]-L[0]+30)*es(u),al=(t<.67?1:1-(t-.67)/.13)*.8;
    const rg=ctx.createRadialGradient(L[0],L[1],r*.4,L[0],L[1],r);rg.addColorStop(0,'rgba(255,217,102,0)');rg.addColorStop(.85,'rgba(255,217,102,'+.1*al+')');rg.addColorStop(1,'rgba(255,250,238,'+.7*al+')');
    ctx.fillStyle=rg;ctx.beginPath();ctx.arc(L[0],L[1],r,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,'+al+')';ctx.lineWidth=7*(1-u*.5)+2;ctx.shadowColor='#ffd966';ctx.shadowBlur=22;ctx.beginPath();ctx.arc(L[0],L[1],r,0,6.283);ctx.stroke();
  }else if(V==='B'){
    for(let i=0;i<5;i++){
      const u=clamp01((t-.16-i*.08)/.3);if(u<=0||u>=1)continue;
      const off=(i-2)*46,q=lerp2(L,[G[0]+(i%2?10:-10),G[1]+(i-2)*14],es(u));q[1]-=off*Math.sin(Math.PI*u)*.9;
      for(let k=5;k>=0;k--){const uu=Math.max(0,u-k*.035),tp=lerp2(L,[G[0]+(i%2?10:-10),G[1]+(i-2)*14],es(uu));tp[1]-=off*Math.sin(Math.PI*uu)*.9;
        ctx.fillStyle='rgba('+(k?'255,226,140':'255,255,255')+','+(.8-k*.12)+')';ctx.beginPath();ctx.arc(tp[0],tp[1],7-k*.8,0,6.283);ctx.fill()}
    }
  }else if(V==='C'){
    for(let i=0;i<3;i++){
      const u=clamp01((t-.2-i*.09)/.4);if(u<=0||u>=1)continue;
      const cx=L[0]+(G[0]-L[0])*es(u),cy=L[1]+(G[1]-L[1])*es(u),r=34+36*u;
      ctx.strokeStyle='rgba(255,250,238,'+(1-u*.5)+')';ctx.lineWidth=9*(1-u*.4)+2;ctx.shadowColor='#ffd966';ctx.shadowBlur=18;
      ctx.beginPath();ctx.arc(cx-r*.5,cy,r,-.95,.95);ctx.stroke();
    }
  }
  ctx.restore();
}
/* Contre de la cloche : la clochette de la lanterne sonne, la grande cloche du Clocher lui répond, et l'écho étourdit le Colosse */
function bellFx(c){
  const t=c.t,h=heroPose3(),x=heroX3();
  const L=[x+h.hand[0]+Math.cos(h.sa)*76+12,DECK+(h.hand[1]+Math.sin(h.sa)*76)*h.sy+20],B=[BELL[0],BELL[1]+40],G=[R.bx-40,DECK-190];
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowColor='#ffd966';
  /* 1) la clochette : ondes qui montent vers la grande cloche */
  for(let i=0;i<3;i++){
    const u=clamp01((t-.12-i*.08)/.4);if(u<=0||u>=1)continue;
    const cx=L[0]+(B[0]-L[0])*es(u),cy=L[1]+(B[1]-L[1])*es(u),r=18+22*u,al=1-u*.6;
    ctx.strokeStyle='rgba(255,250,238,'+al+')';ctx.lineWidth=6*(1-u*.4)+1;ctx.shadowBlur=14;
    ctx.beginPath();ctx.arc(cx,cy,r,0,6.283);ctx.stroke();
  }
  /* 2) la grande cloche répond : écho qui part du Clocher et traverse l'arène jusqu'au Colosse */
  if(t>=.5){
    for(let i=0;i<4;i++){
      const u=clamp01((t-.5-i*.07)/.4);if(u<=0||u>=1)continue;
      const cx=B[0]+(G[0]-B[0]+40)*es(u),r=50+120*u,al=(1-u*.55)*(i?.7:1);
      ctx.strokeStyle='rgba(255,250,238,'+al+')';ctx.lineWidth=8*(1-u*.5)+1;ctx.shadowBlur=20;
      ctx.beginPath();ctx.arc(cx-r*.6,B[1]+(G[1]-B[1])*es(u),r,-.8,.8);ctx.stroke();
    }
  }
  ctx.restore();
}
/* Colosse étourdi : trois étoiles tournent au-dessus de sa tête */
function drawDizzy(){
  if(!R||!R.dizzy||R.dizzy<=R.time)return;
  const k=Math.min(1,(R.dizzy-R.time)/.3),x=R.bx-20,y=DECK-382;
  ctx.save();ctx.globalAlpha=k;ctx.shadowColor='#ffd27a';ctx.shadowBlur=10;
  for(let i=0;i<3;i++){const a=R.time*5+i*2.094,px=x+Math.cos(a)*52,py=y+Math.sin(a)*12;
    ctx.fillStyle=i%2?'#ffe9a8':'#bfeaff';ctx.beginPath();
    for(let j=0;j<8;j++){const rr=j%2?4:10,aa=j*Math.PI/4;ctx.lineTo(px+Math.cos(aa)*rr,py+Math.sin(aa)*rr)}ctx.closePath();ctx.fill()}
  ctx.restore();
}
function drawCn3a(){
  const c=R.cn;if(!c)return;
  const t=c.t;
  if(c.k==='slide'&&t>=.22&&t<.5){const h=heroPose3(),x=heroX3(),L=[x+h.hand[0]+Math.cos(h.sa)*76,DECK+(h.hand[1]+Math.sin(h.sa)*76)*h.sy],al=t<.35?(t-.22)/.13:1-(t-.35)/.15;lanternBeam(L,[R.bx-62,DECK-58],14,al)}
  if(c.k==='plant'&&t>=.3){
    const x0=PX+105,x1=R.bx-60,fr=x0+(x1-x0)*es(clamp01((t-.3)/.5));
    ctx.save();ctx.shadowColor='#fff0b0';ctx.shadowBlur=16;
    for(let i=0;i<12;i++){
      const x=fr-i*16;if(x<x0)continue;
      const h=(34-i*2.2)*(t<.8?1:clamp01(1-(t-.8)/.3));if(h<=0)continue;
      ctx.fillStyle='rgba(255,250,238,'+(.95-i*.06)+')';
      ctx.beginPath();ctx.moveTo(x-6,DECK+2);ctx.lineTo(x,DECK-h);ctx.lineTo(x+6,DECK+2);ctx.closePath();ctx.fill();
    }
    ctx.strokeStyle='rgba(255,250,238,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0,DECK+3);ctx.lineTo(fr,DECK+3);ctx.stroke();
    ctx.restore();
  }else if(c.k==='bat'){batFx(c)}
  else if(c.k==='bell'){bellFx(c)}
}
function drawHits3(){col3Fx();drawHits3a();drawHitsX();drawDizzy()}
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
  if(al>0){c.save();c.globalAlpha=al;k3glow(c,x,DECK-50,170,'255,130,50',.5*al);
    for(let i=7;i>=0;i--){const px=x-sg*(i*30+(fin>0?fin*40*i:0));if((x0-px)*sg>60)continue;const h=(214-i*24)*(fin<0?.55+.45*k3cl(u*2.4):1-k3cl(fin/.3))*(1+.13*Math.sin(tm*23+i*2));k3flame(c,px,DECK+8+(i%2)*3,40-i*2.4,h,(-34+i*3)*-sg,tm*14+i*1.7)}
    c.restore()}
  const r=k3rnd(52),span=Math.max(.2,ONDE.vg-ONDE.imp);for(let i=0;i<15;i++){const px=k3l(x0,x1,(i+.5)/15),v=(u*span-(i+.5)/15*span)/.55;if(v<=0||v>=1)continue;
    const y=DECK+4-Math.sin(v*Math.PI)*(26+r()*52),R_=8+r()*9,q=v*6+i;
    k3poly(c,[[px+Math.cos(q)*R_,y+Math.sin(q)*R_*.7],[px+Math.cos(q+1.7)*R_,y+Math.sin(q+1.7)*R_*.7],[px+Math.cos(q+3.1)*R_,y+Math.sin(q+3.1)*R_*.5],[px+Math.cos(q+4.6)*R_,y+Math.sin(q+4.6)*R_*.5]],i%2?'#5d6092':'#8d90bc')}
  if(fin>0&&fin<.55){const v=fin/.55;[[-92,150],[-66,190],[-40,140],[-112,110],[-20,100]].forEach(([deg,L],i)=>{const an=(sg<0?deg:-180-deg)*Math.PI/180,bx=x1-4*sg,by=DECK-40;
    c.save();c.globalAlpha=1-v*v;k3flame(c,bx+Math.cos(an)*L*v*.8,by+Math.sin(an)*L*v*.8,18*(1-v*.5),70*(1-v*.6),(deg+90)*.7*-sg,tm*17+i);c.restore()})}}
/* il aspire le feu : traits de braise qui convergent vers son cœur */
function k3aspire(c,p,m,tm){const k=k3bump(m,.25,1.15,.2);if(k<=0)return;c.save();c.globalAlpha=k;k3glow(c,p[0],p[1],60+50*k3ez((m-.3)/.8),'255,150,60',.7*k);
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
  let ri=0,fi=0;
  for(const h of a.hits){
    const d=a.t-h.at;
    if(h.k==='blast'){
      const gsh=a.h&&a.kind==='greatsword'&&!h.flap&&!h.pre;
      if(h.flap){if(d>-.22&&!h.sw){h.sw=true;tone(200,.2,'sawtooth',.06,-160)}drawQueueFx(a,h,d,fi++)}   /* coup de queue : sa vraie queue (pose), ici la traînée et l'impact */
      else if(gsh)drawMarteauOnde(d);   /* Difficile : la frappe du marteau reste, l'explosion devient une onde de flammes */
      else drawOnde(a,h,d);
    }else if(h.k==='fire'&&d>-.7&&d<.1){
      const M=COL3.mouth||[R.bx-84,DECK-228],tg=[GUARD[0]+10,GUARD[1]],u=clamp01((d+.45)/.45);
      ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=22;
      if(d<-.45){const k=(d+.7)/.25;const g=ctx.createRadialGradient(M[0],M[1],2,M[0],M[1],40*k);g.addColorStop(0,'rgba(255,235,170,.9)');g.addColorStop(1,'rgba(255,100,30,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(M[0],M[1],40*k,0,6.283);ctx.fill()}
      else{
        const p=lerp2(M,tg,es(u));
        for(let i=5;i>=1;i--){const pp=lerp2(M,tg,es(Math.max(0,u-i*.06)));ctx.fillStyle='rgba(255,140,50,'+(.5-i*.08)+')';ctx.beginPath();ctx.arc(pp[0],pp[1],22-i*2.5,0,6.283);ctx.fill()}
        const g=ctx.createRadialGradient(p[0],p[1],2,p[0],p[1],28);g.addColorStop(0,'#fff6d0');g.addColorStop(.45,'#ffb04a');g.addColorStop(1,'rgba(255,90,30,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(p[0],p[1],28,0,6.283);ctx.fill();
      }
      ctx.restore();
    }else if(h.k==='fall'&&d>-.9&&d<.15){
      const gx=heroFlip()?PX-116:GUARD[0],y0=-50,y1=GUARD[1]-18;
      ctx.save();
      if(d<0){const w=clamp01((d+.9)/.5);ctx.fillStyle='rgba(255,120,50,'+(.15+.25*w)+')';ctx.beginPath();ctx.ellipse(gx,DECK+3,14+16*w,4,0,0,6.283);ctx.fill()}
      if(d>-.6&&d<.08){const u=clamp01((d+.6)/.6),y=y0+(y1-y0)*u*u;qrock(gx,y,26,R.time*6,true)}
      ctx.restore();
    }else if(h.k==='rock'){
      const idx=(ri%2===0)?1:0;ri++;
      if(d>=-.95&&d<-.45){const u=es(clamp01((d+.95)/.35));qrock(R.bx+(idx?40:-40),DECK-375,10+16*u,R.time*3,true)}
      else if(d>=-.45&&d<.05){
        const u=clamp01((d+.45)/.45),p0=[R.bx-190,DECK-250],p1=[GUARD[0]+20,GUARD[1]],q=lerp2(p0,p1,u);q[1]-=70*Math.sin(Math.PI*u);
        {const T=[];for(let i=1;i<=5;i++){const uu=Math.max(0,u-i*.06),t2=lerp2(p0,p1,uu);t2[1]-=70*Math.sin(Math.PI*uu);T.push(t2)}qrockTrail(T,22)}
        qrock(q[0],q[1],26,R.time*10,true);
      }
    }
  }
}
function drawCn3(){drawCn3a();drawBoltCn()}
function drawBoltCn(){
  const c=R.cn;if(!c||c.k!=='bolt')return;
  const t=c.t,tip=[PX+72,DECK-154],sky=[BELL[0],BELL[1]+60];
  if(t>=.55){
    const k=Math.min(1,(t-.55)/.45)*(t<1.35?1:Math.max(0,1-(t-1.35)/.5));
    ctx.fillStyle='rgba(8,12,40,'+(.5*k)+')';ctx.fillRect(0,0,W,DECK);
    const g=ctx.createRadialGradient(R.bx-20,10,6,R.bx-20,10,170);g.addColorStop(0,'rgba(255,247,214,'+(.9*k)+')');g.addColorStop(1,'rgba(255,217,102,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(R.bx-20,10,170,0,6.283);ctx.fill();
  }
  if(t>=.25&&t<1.35){
    const al=t<1.0?clamp01((t-.25)/.15):clamp01(1-(t-1.0)/.35),u=es(clamp01((t-.25)/.35)),e=lerp2(tip,sky,u);
    ctx.save();ctx.globalAlpha=al;ctx.shadowColor='#fff0b0';ctx.shadowBlur=26;ctx.lineCap='round';
    ctx.strokeStyle='rgba(255,217,102,.4)';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(e[0],e[1]);ctx.stroke();
    ctx.strokeStyle='rgba(255,250,238,.95)';ctx.lineWidth=6;ctx.stroke();
    ctx.restore();
  }
  /* l'éclair reste franc et bien lisible un moment, puis s'efface vite */
  if(t>=1.0&&t<1.7)drawBolt(R.bx-20,-10,DECK-250,t<1.4?1:1-(t-1.4)/.3,true);
}
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
  if(R.mode==='finale'){const ft=R.fin.t,a0=FIN.hero-1.0;if(ft>=a0&&ft<FIN.hero-.3){const h=heroPose3(),L=[h.x+h.hand[0]+Math.cos(h.sa)*76,DECK+(h.y||0)+h.hand[1]+Math.sin(h.sa)*76],u=es(clamp01((ft-a0)/.4)),al=ft<FIN.hero-.5?1:clamp01((FIN.hero-.3-ft)/.2);lanternBeam(L,lerp2(L,[150,DECK-76],u),12,al)}}
  if(R.mode==='finale'&&COL3.k){const ft=R.fin.t,t0=FIN.hero-.3;if(ft>=t0&&ft<FIN.hero+.5){const u=es(clamp01((ft-t0)/.4)),al=ft<FIN.hero+.1?1:clamp01((FIN.hero+.5-ft)/.4),F=[150,DECK-76];ctx.save();ctx.globalCompositeOperation='lighter';lanternBeam(F,lerp2(F,COL3.k.coeur,u),14,al);ctx.restore()}}
  drawCn3();
  for(const s of R.steam){ctx.fillStyle='rgba(235,245,255,'+(.35*clamp01(s.life/s.max))+')';ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,6.283);ctx.fill()}
  drawHints3();
  drawFx2();
  ctx.fillStyle='rgba(240,248,255,.85)';
  for(const f of FLAKES){ctx.globalAlpha=.45+.04*f.s*3;ctx.fillRect(f.x,f.y,f.s,f.s)}
  ctx.globalAlpha=1;
  ctx.restore();
  ctx.drawImage(vig,0,0,W,H);
  if(R.flash>0){ctx.fillStyle='rgba(255,255,255,'+R.flash+')';ctx.fillRect(0,0,W,H)}
  if(R.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(R.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  let fade=0;
  if(R.mode==='intro')fade=1-clamp01(R.t/.8);
  if(R.mode==='won'&&R.boss.t>1.6)fade=clamp01((R.boss.t-1.6)/1.2)*.6;
  if(R.mode==='finale')fade=clamp01((R.fin.t-FIN.fade)/1.1);
  if(fade>0){ctx.fillStyle='rgba(0,0,0,'+fade+')';ctx.fillRect(0,0,W,H)}
}

