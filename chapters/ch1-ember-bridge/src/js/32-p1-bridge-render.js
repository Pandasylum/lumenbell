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
    case 'lift':{
      hand=lerp2(FWD_HAND,[BX-150,206],eo(clamp01(t/.55)));
      const cur=[CHEST[0],CHEST[1]-liftAmt()];
      tip=lerp2(BAR,cur,clamp01(t/.12));sag=14;heat=1;break;}
    case 'hold':
      hand=[BX-150,206+Math.sin(G.time*34)*2];tip=[CHEST[0],CHEST[1]-LIFT_MAX];sag=10;heat=1;break;
    case 'slam':
      hand=lerp2([BX-150,206],[BX-140,300],ei(clamp01(t/.16)));
      tip=[CHEST[0],CHEST[1]-liftAmt()];sag=10;heat=1;break;
    case 'release':{
      const k=eo(clamp01(t/.6));
      hand=lerp2([BX-140,300],IDLE_HAND,k);
      tip=lerp2([CHEST[0],CHEST[1]+10],[hand[0]-34,hand[1]+104],k);sag=50;break;}
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
function swordPose(){
  const b=G.boss,t=b.t,tm=G.time;
  const A0=-Math.PI+.18;
  let hand=[IDLE2[0],IDLE2[1]],a=A0,len=0,heat=0;
  switch(b.s){
    case 'sw1w':{
      const k=eo(clamp01(t/.4));
      hand=lerp2(IDLE2,SW1_BACK,k);hand[1]+=Math.sin(tm*50)*1.5*(t/T.sw1w);
      len=SW_LEN*eo(clamp01(t/.5));heat=.3+.7*(t/T.sw1w);break;}
    case 'sw1':{
      const e=es(clamp01(t/T.sw1));
      hand=lerp2(SW1_BACK,SW1_HIT,e);a=-Math.PI+.18*(1-e);len=SW_LEN;heat=1;break;}
    case 'swgap':{
      const k=eo(clamp01(t/T.swgap));
      hand=lerp2(SW1_HIT,SW2_UP,k);a=-Math.PI+(Math.PI-1.2)*k;len=SW_LEN;heat=1;
      if(!G.sw.p1)hand[0]-=90*Math.sin(Math.PI*clamp01(t/.24));
      hand[0]+=G.kick*30;break;}
    case 'sw2w':
      hand=[SW2_UP[0]+Math.sin(tm*50)*1.5,SW2_UP[1]];a=-1.2;len=SW_LEN;heat=1;break;
    case 'sw2':{
      const e=es(clamp01(t/T.sw2));
      hand=lerp2(SW2_UP,SW2_HIT,e);a=-1.2-2.42*e;len=SW_LEN;heat=1;break;}
    case 'sw3g':{
      const k=eo(clamp01(t/T.sw3g));
      hand=lerp2(SW2_HIT,SW1_BACK,k);a=-3.62+(3.62-3.14+.18)*k;len=SW_LEN;heat=1;
      if(!G.sw.p2){hand[0]-=60*Math.sin(Math.PI*clamp01(t/.24))}
      hand[0]+=G.kick*30;break;}
    case 'sw3w':
      hand=[SW1_BACK[0],SW1_BACK[1]+Math.sin(tm*50)*1.5];a=-Math.PI+.18;len=SW_LEN;heat=1;break;
    case 'sw3':{
      const e=es(clamp01(t/T.sw3));
      hand=lerp2(SW1_BACK,SW1_HIT,e);a=-Math.PI+.18*(1-e);len=SW_LEN;heat=1;break;}
    case 'swrec':{
      const k=eo(clamp01(t/T.swrec));
      hand=lerp2(DIFF.hard?SW1_HIT:SW2_HIT,IDLE2,k);a=-3.62+.66*k;len=SW_LEN*(1-clamp01(t/.5));heat=.8;
      if(!(DIFF.hard?G.sw.p3:G.sw.p2)){const q=Math.sin(Math.PI*clamp01(t/.24));hand[0]-=60*q;hand[1]+=60*q}
      hand[0]+=G.kick*30;break;}
    case 'fin':{
      if(t<1.5)break;
      const UPH=[BX-30,DECK-340],DN=[HOLE_X,DECK-232];
      if(t<1.85){const k=es(clamp01((t-1.5)/.35));hand=lerp2(IDLE2,UPH,k);a=-Math.PI+.18+(-1.57+Math.PI-.18)*k;len=SW_LEN*k;heat=1}
      else if(t<2.0){const e=ei(clamp01((t-1.85)/.15));hand=lerp2(UPH,DN,e);a=-1.57-3.14*e;len=SW_LEN;heat=1.5}
      else{hand=DN;a=-4.71;len=SW_LEN;heat=1.2}
      hand=[hand[0]-finRecoil(t),hand[1]];
      break;}
    case 'orb':{
      const k=eo(clamp01(t/.6));
      hand=lerp2(DIFF.hard?SW1_HIT:SW2_HIT,IDLE2,k);a=-3.62+.66*k;len=SW_LEN*(1-clamp01(t/.4));heat=.5;
      hand[0]+=G.kick*30;break;}
  }
  return {hand,a,len,heat};
}
function drawArm(S,H,Lmin,out){
  const dx=H[0]-S[0],dy=H[1]-S[1],d=Math.max(1,Math.hypot(dx,dy)),a=Math.atan2(dy,dx),L=Math.max(Lmin,d*.56);
  const dc=Math.min(d,2*L-1),ang=Math.acos(Math.max(-1,Math.min(1,dc/(2*L))));
  const E1=[S[0]+L*Math.cos(a+ang),S[1]+L*Math.sin(a+ang)],E2=[S[0]+L*Math.cos(a-ang),S[1]+L*Math.sin(a-ang)];
  const sc=E=>E[1]*.7+out*E[0]*.6;
  let E=sc(E1)>sc(E2)?E1:E2;
  if(d>=2*L-1)E=[S[0]+dx/d*L,S[1]+dy/d*L];
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  const seg=(A,B,w1,w2)=>{
    const an=Math.atan2(B[1]-A[1],B[0]-A[0])+1.5708,c=Math.cos(an),sn=Math.sin(an);
    ctx.beginPath();ctx.moveTo(A[0]+c*w1,A[1]+sn*w1);ctx.lineTo(B[0]+c*w2,B[1]+sn*w2);ctx.lineTo(B[0]-c*w2,B[1]-sn*w2);ctx.lineTo(A[0]-c*w1,A[1]-sn*w1);ctx.closePath();
    ctx.fillStyle='#211828';ctx.fill();ctx.strokeStyle='#4a3a55';ctx.lineWidth=2.5;ctx.stroke();
  };
  seg(S,E,19,15);seg(E,H,15,12);
  ctx.strokeStyle='rgba(255,122,43,.8)';ctx.lineWidth=2.5;ctx.shadowColor='#ff7a2b';ctx.shadowBlur=8;
  ctx.beginPath();ctx.moveTo(S[0]+(E[0]-S[0])*.2,S[1]+(E[1]-S[1])*.2);ctx.lineTo(E[0],E[1]);ctx.lineTo(H[0]+(E[0]-H[0])*.25,H[1]+(E[1]-H[1])*.25);ctx.stroke();
  ctx.shadowBlur=0;
  qp([[E[0]-12,E[1]-4],[E[0]+2,E[1]-20],[E[0]+12,E[1]-2]],'#3a2d44','#5a4666',1.5);
  ctx.restore();
}
function drawSwordArm(dx,dy){
  const sp=swordPose(),b=G.boss,h=[sp.hand[0]+dx,sp.hand[1]+dy],tm=G.time;
  const S=[S2[0]+dx,S2[1]+dy];
  if(b.s==='sw1'||b.s==='sw2'){
    G.swTrail.push([h[0],h[1],h[0]+Math.cos(sp.a)*sp.len,h[1]+Math.sin(sp.a)*sp.len]);
    if(G.swTrail.length>7)G.swTrail.shift();
  }else G.swTrail.length=0;
  ctx.save();
  for(let i=1;i<G.swTrail.length;i++){
    const A=G.swTrail[i-1],B=G.swTrail[i];
    ctx.fillStyle='rgba(255,170,70,'+(i/G.swTrail.length*.4)+')';
    ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(A[2],A[3]);ctx.lineTo(B[2],B[3]);ctx.lineTo(B[0],B[1]);ctx.closePath();ctx.fill();
  }
  ctx.restore();
  drawArm(S,h,78,1);
  ctx.save();ctx.translate(h[0],h[1]);ctx.rotate(sp.a);
  drawHammer(sp.len,sp.heat,tm,9);
  ctx.restore();
  ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(h[0],h[1],15,0,6.283);ctx.fill();ctx.stroke();
}
/* Chaîne de forge à crochet : maillons de fer le long d'une suite de points, crochet de levage au bout */
function drawHookChain(pts,heat){
  const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const tot=L[L.length-1];if(tot<2)return;
  const at=d=>{let i=1;while(i<L.length-1&&L[i]<d)i++;const u=(d-L[i-1])/Math.max(.001,L[i]-L[i-1]);return[pts[i-1][0]+(pts[i][0]-pts[i-1][0])*u,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*u,Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0])]};
  ctx.save();ctx.lineCap='round';
  if(heat>0){ctx.strokeStyle='rgba(255,140,60,'+(.35*Math.min(1,heat))+')';ctx.lineWidth=12;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}
  let k=0;
  for(let d=4;d<tot-14;d+=11,k++){
    const [x,y,a]=at(d);ctx.save();ctx.translate(x,y);ctx.rotate(a);
    if(k%2===0){ctx.strokeStyle='#241b2a';ctx.lineWidth=4.5;ctx.beginPath();ctx.ellipse(0,0,8,4.5,0,0,6.283);ctx.stroke();ctx.strokeStyle='#7a6a82';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(0,0,8,4.5,0,0,6.283);ctx.stroke()}
    else{ctx.strokeStyle='#241b2a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(7,0);ctx.stroke();ctx.strokeStyle='#8a7a92';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-6,-1);ctx.lineTo(6,-1);ctx.stroke()}
    ctx.restore();
  }
  const [hx,hy,ha]=at(tot);
  ctx.save();ctx.translate(hx,hy);ctx.rotate(ha);
  ctx.strokeStyle='#241b2a';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(2,0);ctx.arc(2,9,9,-Math.PI/2,Math.PI*.95);ctx.stroke();
  ctx.strokeStyle='#9a8aa2';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-13,-1);ctx.lineTo(2,-1);ctx.arc(2,9,8,-Math.PI/2,Math.PI*.95);ctx.stroke();
  ctx.fillStyle='#241b2a';ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(-3,3);ctx.lineTo(-2,11);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#241b2a';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(-16,0,5,3.5,0,0,6.283);ctx.stroke();
  if(heat>.5){ctx.strokeStyle='rgba(255,170,80,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(2,9,6,0,Math.PI*.8);ctx.stroke()}
  ctx.restore();
  ctx.restore();
}
function drawWhip(h,tp,sag,heat){
  const c=[(h[0]+tp[0])/2,(h[1]+tp[1])/2+sag],pts=[];
  for(let i=0;i<=20;i++){const u=i/20,m=1-u;pts.push([m*m*h[0]+2*m*u*c[0]+u*u*tp[0],m*m*h[1]+2*m*u*c[1]+u*u*tp[1]])}
  drawHookChain(pts,heat);
}

/* Chaîne du Colosse : « hk » va de 0 (elle est enroulée sur son torse) à 1 (déroulée dans sa main) ; le même nombre règle les maillons du torse et la longueur dans la main */
function hookStep(o,target,t){
  const dt=Math.min(.05,Math.max(0,t-(o.hl==null?t:o.hl)));o.hl=t;
  const cur=o.hv||0,sp=(target>cur?1/.45:1/.4)*dt;
  o.hv=Math.abs(target-cur)<=sp?target:cur+Math.sign(target-cur)*sp;
  return o.hv;
}
function drawBoss(){
  const b=G.boss,pz=pose(),t=G.time;
  let dx=0,dy=0;
  if(b.s==='stagger'||b.s==='orb'||b.s==='hurt'||b.s==='fy_roar')dx=Math.sin(t*38)*3*clamp01(1-b.t/.6);
  if(b.s==='hurt')dy=Math.min(12,b.t*60)*clamp01((b.hurtT-b.t)/.4);
  if(b.s==='fin'){const T=b.t;dx=finRecoil(T)+(T<1.1?Math.sin(t*50)*3:T<1.5?Math.sin(t*44)*4:0);dy=T>=1.1&&T<1.5?-10*Math.sin(Math.PI*(T-1.1)/.4):0;
    if(T>=2.25){const u=clamp01((T-2.25)/.45);dx=finRecoil(T)+(HOLE_X-BX-finRecoil(T))*es(u);dy=-90*Math.sin(Math.PI*Math.min(u,1)*.75);if(T>=2.55){const fq=T-2.55;dy+=fq*fq*700+fq*80}}}
  if(b.s==='dead')dy=Math.min(56,b.t*150);
  const warm=(b.s==='windup'||b.s==='strike'||b.s.startsWith('sw')||b.s.startsWith('fl_'))?1.25:(b.fury?1.7:1);
  const dead=b.s==='dead';
  const hkT=(b.s==='windup'||b.s==='strike'||b.s==='rebound'||b.s==='rewind'||b.s==='lift'||b.s==='hold'||b.s==='slam'||b.s==='release')?1:0,hk1=hookStep(b,hkT,t);

  ctx.save();ctx.translate(BX+dx,DECK+dy);
  /* bras du marteau dessiné dans le repère du monde, voir drawSwordArm */
  const jaw=(G.mode==='intro'&&G.it>3.0&&G.it<3.9)?14:b.s==='fl_in'?14*clamp01(b.t/Math.min(T.fli,b.fli||T.fli)):(b.s==='fl_out'||b.s==='fy_roar')?14:0;
  ctx.save();ctx.scale(.92,.92);
  {const wf=Math.sin(t*1.8)*.03;
   for(const sd of [-1,1]){drawWing([sd*64,-222],-.85+wf,.8,'#220a11',.34,!!b.fury,sd);drawWing([sd*50,-232],-1.15+wf,1,'#35101a',.34,!!b.fury,sd)}}
  demonBody({t,warm,jaw,hurt:G.recoil>.3,dead,wound:G.wound,stow:1-clamp01(swordPose().len/40),hk:hk1});
  ctx.restore();
  ctx.restore();
  if(b.s==='fl_in'||b.s==='fl_out')faceFire(BX+dx-18,DECK+dy-238,b.s==='fl_in'?es(clamp01(b.t/Math.min(T.fli,b.fli||T.fli))):1-es(clamp01(b.t/.5)),b.s==='fl_in'?b.t:1);

  if(b.fury){ctx.save();ctx.translate(BX+dx,DECK+dy);drawAura(b.fury);ctx.restore()}
  /* bras et mains suivent le corps (secousses, chute de fin de phase) */
  const S=[BX-92+dx,DECK-200+dy],h=[pz.hand[0]+dx,pz.hand[1]+dy],tip=[pz.tip[0]+dx,pz.tip[1]+dy];
  drawArm(S,h,78,-1);
  ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(h[0],h[1],17,0,6.283);ctx.fill();ctx.stroke();
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
  if(hk1>.02)drawWhip(h,lerp2(h,tip,es(hk1)),pz.sag*es(hk1),pz.heat);
  drawSwordArm(dx,dy);
}

function drawPlayer(){
  const p=G.pl,lift=liftAmt(),up=p.s==='act'||p.s==='cast'||p.s==='ring'||p.s==='final';
  let r=up?clamp01(p.t/.08):0;
  ctx.fillStyle='rgba(0,0,0,.38)';
  ctx.beginPath();ctx.ellipse(p.x,DECK+1,30*(1-lift/400),5,0,0,6.283);ctx.fill();

  ctx.save();ctx.translate(p.x,DECK-lift-(G.ib||0));
  if(G.mode==='intro')ctx.scale(G.sx,1);
  if(lift>0||p.s==='grabbed')ctx.rotate(.42*lift/LIFT_MAX+(p.s==='grabbed'?Math.sin(G.time*22)*.03:0));
  if(p.s==='down'||p.s==='hurt'){ctx.rotate(.12);ctx.scale(1,.82)}

  drawWizard({fl:0});

  const dashing=p.s==='dash'||p.s==='stab'||p.s==='back';
  const thrust=p.s==='stab'?(p.t<.1?es(p.t/.1):p.t<.22?1:1-clamp01((p.t-.22)/.08)):0;
  const hand=dashing?[28+24*thrust,-60]:[26,-62-6*r],sb=dashing?[hand[0]-34,hand[1]+6]:[26,-2-58*r],st=dashing?[hand[0]+34,hand[1]-6]:[30+18*r,-140-26*r];
  ctx.lineCap='round';
  ctx.strokeStyle='#2a3550';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(23,-78);ctx.lineTo(hand[0],hand[1]);ctx.stroke();ctx.fillStyle='#2a3550';ctx.beginPath();ctx.arc(23,-78,6.5,0,6.283);ctx.fill();
  ctx.strokeStyle='#8a7a9a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(sb[0],sb[1]);ctx.lineTo(st[0],st[1]);ctx.stroke();
  ctx.fillStyle='#cdb69a';ctx.beginPath();ctx.arc(hand[0],hand[1],5,0,6.283);ctx.fill();
  const cc=p.deny>0?LB.DENY_COL:up?'#fff4d6':(p.s==='recover'?'#c9a85a':'#ffd27a');
  drawLantern(st[0],st[1],up?1:dashing?.6+.4*thrust:.25,cc,Math.atan2(st[1]-sb[1],st[0]-sb[0])+Math.PI/2);
  if(dashing&&thrust>0){const A=[st[0]+8,st[1]],Z=[BX-62-p.x,-58+lift+(G.ib||0)];lanternBeam(A,lerp2(A,Z,thrust),12+10*thrust,thrust)}

  const b=G.boss;
  if((b.s==='lift'&&b.t>=.12)||b.s==='hold'||b.s==='slam'){
    ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=10;
    ctx.strokeStyle='#ff9a3c';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-58,27,7,0,0,6.283);ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawBarrier(){
  const p=G.pl;if(p.s!=='act')return;
  const ramp=clamp01(p.t/.07),a=(1-.45*p.t/HD('block').act)*ramp;
  const cx=PX+82,cy=DECK-76,rx=34*(.6+.4*ramp),ry=92*(.8+.2*ramp);
  ctx.save();ctx.globalAlpha=a;
  const g=ctx.createRadialGradient(cx-18,cy,6,cx,cy,ry);
  g.addColorStop(0,'rgba(111,211,255,.06)');g.addColorStop(.7,'rgba(111,211,255,.2)');g.addColorStop(1,'rgba(191,234,255,.5)');
  ctx.fillStyle=g;ctx.shadowColor='#6fd3ff';ctx.shadowBlur=24;
  ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,6.283);ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle='#cdeeff';ctx.lineWidth=3;ctx.stroke();
  ctx.lineWidth=1;ctx.strokeStyle='rgba(205,238,255,.5)';
  for(const k of[.66,.33]){ctx.beginPath();ctx.ellipse(cx,cy,rx*k,ry,0,0,6.283);ctx.stroke()}
  ctx.restore();
}

/* Repère de timing discret (Normal) : petite barre au-dessus du Veilleur, orange tant que le blocage n'est pas ouvert puis bleue pendant la fenêtre. */
function hintBar(cx,y,k,blue){
  const w=68,h=6,x=cx-w/2;
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x-1,y-1,w+2,h+2);
  ctx.fillStyle=blue?'#6fd3ff':'rgba(255,122,43,.85)';ctx.fillRect(x,y,w*clamp01(k),h);
}
const HINT_LEAD=.8; // durée d'approche affichée avant l'ouverture de la fenêtre (phases II et III)
function drawHints(){
  if(G.mode!=='play'||!prefs.help)return;
  const b=G.boss,p=G.pl;
  /* repère de timing : barre au-dessus de la tête, ou en Facile un cercle qui se resserre autour du Veilleur (bleu = fenêtre de blocage) */
  const cue=(k,blue)=>{
    if(DIFF.easy){
      const r=blue?40+22*clamp01(k):110-48*clamp01(k);
      ctx.save();ctx.lineWidth=blue?5:3;ctx.strokeStyle=blue?'#6fd3ff':'rgba(255,122,43,.85)';
      if(blue){ctx.shadowColor='#6fd3ff';ctx.shadowBlur=12}
      ctx.beginPath();ctx.arc(PX+10,DECK-100,r,0,6.283);ctx.stroke();ctx.restore();return;
    }
    hintBar(PX,DECK-206,k,blue);
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

function flameShape(front,al,wide){
  const dx=front[0]-MOUTH[0],dy=front[1]-MOUTH[1],len=Math.hypot(dx,dy)||1;
  const ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
  ctx.save();ctx.globalAlpha=al;ctx.lineCap='round';
  ctx.shadowColor='#ff7a2b';ctx.shadowBlur=26;
  ctx.strokeStyle='rgba(255,100,30,.4)';ctx.lineWidth=14+34*wide;
  ctx.beginPath();ctx.moveTo(MOUTH[0],MOUTH[1]);ctx.lineTo(front[0],front[1]);ctx.stroke();
  ctx.shadowBlur=0;
  for(let i=0;i<30;i++){
    const s=i/29,d=len*s;
    const w=(8+wide*40*s)*(.75+.25*Math.sin(G.time*30+i*1.9));
    const off=Math.sin(G.time*26+i*2.3)*9*s;
    ctx.fillStyle=i%3===0?'rgba(255,236,170,.9)':i%3===1?'rgba(255,150,50,.85)':'rgba(255,80,30,.8)';
    ctx.beginPath();ctx.arc(MOUTH[0]+ux*d+nx*off,MOUTH[1]+uy*d+ny*off,w*.55,0,6.283);ctx.fill();
  }
  ctx.restore();
}
function drawFlame(){
  const b=G.boss;
  let front=null,al=1,wide=1;
  if(b.s==='fl_out'){const q=clamp01(b.t/T.flo);front=lerp2(MOUTH,BAR,es(q));wide=.4+.6*q}
  else if(b.s==='fl_stab'&&b.t<.25){front=BAR;al=1-b.t/.25}
  else if(b.s==='fl_rec'&&b.t<.45){front=lerp2(BAR,CHEST,eo(clamp01(b.t/.15)));al=1-clamp01((b.t-.15)/.3)}
  if(front)flameShape(front,al,wide);
}
function flameJet(o,front,al,wide){
  const dx=front[0]-o[0],dy=front[1]-o[1],len=Math.hypot(dx,dy)||1;
  const ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
  ctx.save();ctx.globalAlpha=clamp01(al);ctx.lineCap='round';
  ctx.shadowColor='#ff7a2b';ctx.shadowBlur=22;
  ctx.strokeStyle='rgba(255,100,30,.4)';ctx.lineWidth=10+24*wide;
  ctx.beginPath();ctx.moveTo(o[0],o[1]);ctx.lineTo(front[0],front[1]);ctx.stroke();
  ctx.shadowBlur=0;
  for(let i=0;i<22;i++){
    const s=i/21,d=len*s;
    const w=(7+wide*26*s)*(.75+.25*Math.sin(G.time*30+i*1.9));
    const off=Math.sin(G.time*26+i*2.3)*7*s;
    ctx.fillStyle=i%3===0?'rgba(255,236,170,.9)':i%3===1?'rgba(255,150,50,.85)':'rgba(255,80,30,.8)';
    ctx.beginPath();ctx.arc(o[0]+ux*d+nx*off,o[1]+uy*d+ny*off,w*.55,0,6.283);ctx.fill();
  }
  ctx.restore();
}
function drawJets(){
  const b=G.boss,F=G.fy;
  if(F&&b.s==='fy_t'){
    const k=clamp01(b.t/T.fyt),o=JET_O[F.i%4],r=10+36*k;
    ctx.save();
    const g=ctx.createRadialGradient(o[0],o[1],0,o[0],o[1],r);
    g.addColorStop(0,'rgba(255,255,220,'+(.5+.5*k)+')');g.addColorStop(1,'rgba(255,110,30,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(o[0],o[1],r,0,6.283);ctx.fill();
    ctx.restore();
  }
  if(F&&b.s==='fy_j'){
    const q=clamp01(b.t/.3),o=JET_O[F.i%4];
    flameJet(o,lerp2(o,BAR,es(q)),1,.3+.7*q);
  }
  if(G.jf)flameJet(G.jf.o,BAR,G.jf.t/.22,1);
}
function drawRock(){
  const b=G.boss;
  const S=[RKX[b.rki||0],RK_S[1]];
  if(b.s==='rk_t'){
    const k=clamp01(b.t/.5);
    ctx.save();
    const g=ctx.createRadialGradient(S[0],8,0,S[0],8,150);
    g.addColorStop(0,'rgba(255,120,40,'+(.6*k)+')');g.addColorStop(1,'rgba(255,120,40,0)');
    ctx.fillStyle=g;ctx.fillRect(S[0]-170,0,340,170);
    ctx.fillStyle='rgba(255,170,70,'+(.8*k)+')';
    for(let i=0;i<8;i++){
      const ex=S[0]-80+i*23+Math.sin(G.time*3+i)*6,ey=((G.time*140+i*57)%160);
      ctx.fillRect(ex,ey,3,3);
    }
    ctx.restore();
  }
  if(b.s==='rk_j'){
    const q=clamp01(b.t/.55),pos=lerp2(S,RK,ei(q));
    for(let i=1;i<=7;i++){
      const pp=lerp2(S,RK,ei(Math.max(0,q-i*.04)));
      ctx.fillStyle='rgba(255,'+(140+i*10)+',50,'+(.5-i*.06)+')';
      ctx.beginPath();ctx.arc(pp[0],pp[1],28-i*2.5,0,6.283);ctx.fill();
    }
    ctx.save();ctx.translate(pos[0],pos[1]);ctx.rotate(G.time*5);
    ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
    ctx.fillStyle='#2a2028';ctx.strokeStyle='#ff9a3c';ctx.lineWidth=3;
    ctx.beginPath();
    [[-26,-8],[-14,-26],[8,-28],[26,-10],[24,14],[6,28],[-18,22]].forEach((c,i)=>i?ctx.lineTo(c[0],c[1]):ctx.moveTo(c[0],c[1]));
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.restore();
  }
}
function drawRing(){
  const R=G.ringFx;if(!R)return;
  /* halo de lumière : il naît dans la lanterne levée et s'étend en anneaux jusqu'au Colosse */
  const q=clamp01(R.t/.55),L=[G.pl.x+48,DECK-166-liftAmt()],rmax=BX-G.pl.x-60,a=1-q*.35;
  ctx.save();ctx.translate(L[0],L[1]);ctx.shadowColor='#bfeaff';ctx.shadowBlur=28;
  for(const [d,w] of [[0,9],[.16,5]]){
    const qq=clamp01((R.t/.55)-d);if(qq<=0)continue;const rr=14+es(qq)*rmax;
    ctx.globalAlpha=a*(1-d*2);ctx.strokeStyle='#ffffff';ctx.lineWidth=w;
    ctx.beginPath();ctx.ellipse(0,0,rr,rr*.62,0,0,6.283);ctx.stroke();
    ctx.strokeStyle='rgba(111,211,255,.7)';ctx.lineWidth=w*2;ctx.globalAlpha=a*.35*(1-d*2);ctx.stroke();
  }
  const fl=1-q;ctx.globalAlpha=fl;const g=ctx.createRadialGradient(0,0,0,0,0,60);
  g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(191,234,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,60,0,6.283);ctx.fill();
  ctx.restore();
}
const HOLE_X=BX-170; /* le trou s'ouvre devant le Colosse, là où frappe le marteau */
function finRecoil(t){return t<1.1?0:t<1.35?55*eo((t-1.1)/.25):55-25*es(clamp01((t-1.35)/.6))}
function drawHole(){
  const b=G.boss;if(b.s!=='fin'||b.t<2.0)return;
  const k=es(clamp01((b.t-2.0)/.22)),hw=125*k,x0=HOLE_X-hw;
  ctx.save();
  const g=ctx.createLinearGradient(0,DECK-6,0,H);
  g.addColorStop(0,'#14090c');g.addColorStop(1,'#7a2a10');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x0,DECK-6);
  for(let i=1;i<=8;i++)ctx.lineTo(x0+i*hw/4,DECK-6+(i%2?10:-2));
  ctx.lineTo(HOLE_X+hw,H);ctx.lineTo(x0,H);ctx.closePath();ctx.fill();
  const lg=ctx.createRadialGradient(HOLE_X,H,10,HOLE_X,H,220*k);lg.addColorStop(0,'rgba(255,140,50,.55)');lg.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=lg;ctx.fillRect(x0,DECK-6,hw*2,H-DECK+6);
  ctx.restore();
}
function drawCracks(){
  /* coup final de la phase I : le rayon de la lanterne file jusqu'au torse du Colosse et y explose */
  const p=G.pl;if(p.s!=='final'||p.t<.5)return;
  if(p.t>=1.1&&p.t<2.0){const u=(p.t-1.1)/.9,cx=BX-40+finRecoil(p.t),cy=DECK-200,rr=40+520*eo(u),al=Math.max(0,1-u*1.15);
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,'rgba(255,255,255,'+al+')');g.addColorStop(.35,'rgba(191,234,255,'+(.6*al)+')');g.addColorStop(1,'rgba(111,211,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,rr,0,6.283);ctx.fill();
    ctx.save();ctx.strokeStyle='rgba(255,255,255,'+(.8*al)+')';ctx.lineWidth=4;ctx.lineCap='round';for(let i=0;i<14;i++){const a=i*.4488+.2,r0=30+rr*.25,r1=r0+90+rr*.45;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);ctx.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);ctx.stroke()}
    ctx.lineWidth=6*al+1;ctx.beginPath();ctx.arc(cx,cy,rr*.8,0,6.283);ctx.stroke();ctx.restore()}
  if(p.t>1.35)return;
  const L=[p.x+48,DECK-166-liftAmt()],C=[BX-40,DECK-200],u=es(clamp01((p.t-.5)/.6)),al=p.t<1.1?clamp01((p.t-.5)/.1):clamp01(1-(p.t-1.1)/.25);
  lanternBeam(L,lerp2(L,C,u),12+8*u,al);
}
function drawAura(lvl){
  const t=G.time,big=lvl===1?1.5:1;
  ctx.save();
  const rg=ctx.createRadialGradient(0,-170,20,0,-170,200*big);
  rg.addColorStop(0,'rgba(255,140,50,.3)');rg.addColorStop(1,'rgba(255,100,30,0)');
  ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,-170,200*big,0,6.283);ctx.fill();
  AURA.forEach((q,i)=>{
    const h=(26+22*Math.abs(Math.sin(t*9+i*1.7)))*big,w=(9+4*Math.abs(Math.sin(t*7+i)))*big;
    ctx.fillStyle=lvl===1?(i%2?'rgba(255,240,190,.9)':'rgba(255,180,70,.9)'):(i%2?'rgba(255,196,90,.85)':'rgba(255,100,40,.85)');
    ctx.beginPath();ctx.moveTo(q[0]-w,q[1]);
    ctx.quadraticCurveTo(q[0]+Math.sin(t*6+i)*6,q[1]-h*.6,q[0],q[1]-h);
    ctx.quadraticCurveTo(q[0]+Math.sin(t*5+i)*5,q[1]-h*.5,q[0]+w,q[1]);
    ctx.closePath();ctx.fill();
  });
  ctx.restore();
}
function drawOrb(){
  const p=G.pl;if(p.s!=='cast')return;
  const cr=[PX+48,DECK-166],charge=p.t<T.cast;
  let pos,r,q=0;
  if(charge){pos=cr;r=4+20*eo(p.t/T.cast)}
  else{q=clamp01((p.t-T.cast)/T.orb);pos=lerp2(cr,ORB_T,es(q));pos[1]-=70*Math.sin(Math.PI*q);r=24}
  if(!charge){
    for(let i=1;i<=5;i++){
      const qq=Math.max(0,q-i*.05),tp=lerp2(cr,ORB_T,es(qq));tp[1]-=70*Math.sin(Math.PI*qq);
      ctx.fillStyle='rgba(220,245,255,'+(.35-i*.06)+')';
      ctx.beginPath();ctx.arc(tp[0],tp[1],r*(1-i*.12),0,6.283);ctx.fill();
    }
  }
  ctx.save();
  const g=ctx.createRadialGradient(pos[0],pos[1],0,pos[0],pos[1],r*2.6);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,246,200,.9)');
  g.addColorStop(.65,'rgba(111,211,255,.35)');g.addColorStop(1,'rgba(111,211,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(pos[0],pos[1],r*2.6,0,6.283);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;
  for(let i=0;i<8;i++){
    const a=G.time*3+i*Math.PI/4;
    ctx.beginPath();ctx.moveTo(pos[0]+Math.cos(a)*r*1.1,pos[1]+Math.sin(a)*r*1.1);
    ctx.lineTo(pos[0]+Math.cos(a)*r*2.2,pos[1]+Math.sin(a)*r*2.2);ctx.stroke();
  }
  ctx.restore();
}
function render(){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(G.shake>0&&!reduce)ctx.translate(rand(-1,1)*G.shake,rand(-1,1)*G.shake);
  ctx.drawImage(bgFar,0,0,W,H);
  const pulse=.85+.15*Math.sin(G.time*2.1)+.05*Math.sin(G.time*7.3);
  const lg=ctx.createRadialGradient(W/2,H+60,20,W/2,H+60,560);
  lg.addColorStop(0,'rgba(255,110,30,'+(.55*pulse)+')');lg.addColorStop(.5,'rgba(200,50,20,'+(.22*pulse)+')');lg.addColorStop(1,'rgba(120,20,10,0)');
  ctx.fillStyle=lg;ctx.fillRect(0,0,W,H);
  drawEmbers(0,70,1);
  ctx.drawImage(bgBridge,0,0,W,H);
  drawHole();ctx.save();ctx.translate(G.ix||0,0);drawBoss();ctx.restore();drawCracks();drawPlayer();drawFlame();drawJets();drawRock();if(G.boss.dbf&&G.boss.s==='fl_in')drawChainTell(BX-18,DECK-238,G.boss.t);if(G.boss.dbl&&(G.boss.s==='windup'||G.boss.s==='strike'))drawDblTell(G.boss.t);drawRing();drawBarrier();drawOrb();drawHints();drawFx();
  drawEmbers(0,18,.9);
  ctx.restore();
  ctx.drawImage(vig,0,0,W,H);
  if(G.flash>0){ctx.fillStyle='rgba(255,255,255,'+G.flash+')';ctx.fillRect(0,0,W,H)}
  if(G.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(G.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  if(G.p2&&G.pl.s==='final'){const fa=clamp01((G.pl.t-2.9)/.8);if(fa>0){ctx.fillStyle='rgba(0,0,0,'+fa+')';ctx.fillRect(0,0,W,H)}}
}

