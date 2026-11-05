/* ---------- rendu phase II ---------- */
function qp(pts,fill,stroke,lw){
  ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||2;ctx.lineJoin='round';ctx.stroke()}
}
function qflame(x,y,w,h,ph,col){
  const t=R?R.time:Q?Q.time:G.time;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-w,y);
  ctx.quadraticCurveTo(x+Math.sin(t*8+ph)*w*.6-w*.2,y-h*.55,x+Math.sin(t*6+ph)*w*.5,y-h);
  ctx.quadraticCurveTo(x+Math.sin(t*7+ph)*w*.4+w*.2,y-h*.5,x+w,y);ctx.closePath();ctx.fill();
}
/* Phase II : le fond de la Fonderie, sous le pont (1er novembre : plus de chute, le décor ne défile plus). */
function qScrollY(base,period){return (base%period+period)%period-60}
function qGear(x,y,r,a,col){
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=col;
  for(let i=0;i<10;i++){ctx.rotate(.628);ctx.fillRect(-r*.14,-r-8,r*.28,14)}
  ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.arc(0,0,r*.45,0,6.283,true);ctx.fill();
  ctx.restore();
}
function qBackground(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b0607');g.addColorStop(.55,'#1d0d0a');g.addColorStop(1,'#5a1a08');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const pulse=.85+.15*Math.sin(Q.time*2.1);
  const lg=ctx.createRadialGradient(W/2,H+60,20,W/2,H+60,620);
  lg.addColorStop(0,'rgba(255,120,30,'+(.65*pulse)+')');lg.addColorStop(.5,'rgba(210,60,20,'+(.24*pulse)+')');lg.addColorStop(1,'rgba(120,20,10,0)');
  ctx.fillStyle=lg;ctx.fillRect(0,0,W,H);
  /* fond : engrenages et chaînes */
  for(const [bx,base,r,dir] of [[150,80,70,1],[820,330,90,-1],[470,520,60,1]]){
    qGear(bx,qScrollY(base,700),r,Q.time*.4*dir,'#1a0f10');
  }
  ctx.strokeStyle='#22151a';ctx.lineWidth=4;
  for(const cx of [260,380,600,700]){
    for(let y=-24+((cx*7)%24);y<QLAKE+8;y+=24){ctx.beginPath();ctx.ellipse(cx,y,4,8,0,0,6.283);ctx.stroke()}
  }
  qHood();
  /* plan moyen : creusets et coulées de métal, qui tombent dans la lave */
  for(const [cx,base,side] of [[430,140,1],[750,460,-1]]){
    const y=qScrollY(base,760);
    ctx.fillStyle='#2b1a14';ctx.beginPath();ctx.moveTo(cx-26,y);ctx.lineTo(cx+26,y);ctx.lineTo(cx+20,y+30);ctx.lineTo(cx-20,y+30);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffc15a';ctx.fillRect(cx-20,y+2,40,4);
    const lx=cx+side*26;
    ctx.strokeStyle='rgba(255,154,60,.9)';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(cx+side*18,y+4);ctx.quadraticCurveTo(lx+side*10,y+4,lx+side*10,y+40);ctx.lineTo(lx+side*10,QLAKE+10);ctx.stroke();
    ctx.strokeStyle='rgba(255,230,160,.9)';ctx.lineWidth=2;ctx.stroke();
  }
  /* parois de fer rivetées */
  for(const side of [-1,1]){
    const w=78,x0=side<0?0:W-w;
    ctx.fillStyle='#1e1312';ctx.fillRect(x0,0,w,H);
    ctx.fillStyle='#2c1c18';ctx.fillRect(side<0?w-8:W-w,0,8,H);
    const o=0;
    for(let y=-90-o;y<H+90;y+=90){
      ctx.fillStyle='#120a0a';ctx.fillRect(x0,y,w,4);
      ctx.fillStyle='#4a3430';
      for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x0+14+i*24,y+14,3,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(x0+14+i*24,y+76,3,0,6.283);ctx.fill()}
    }
    const ov=0;
    for(let y=60-ov;y<H+270;y+=270){
      ctx.fillStyle='#0c0606';ctx.fillRect(x0+18,y+30,w-36,20);
      ctx.fillStyle='rgba(255,122,43,'+(.55+.25*Math.sin(Q.time*6+y))+')';
      for(let i=0;i<4;i++)ctx.fillRect(x0+22+i*((w-44)/4),y+33,(w-44)/4-4,14);
    }
    ctx.strokeStyle='#3b2a24';ctx.lineWidth=10;
    const px=side<0?w+14:W-w-14;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,H);ctx.stroke();
    ctx.strokeStyle='#5a4038';ctx.lineWidth=3;
    for(let y=-60;y<H+60;y+=160){ctx.beginPath();ctx.moveTo(px-9,y);ctx.lineTo(px+9,y);ctx.stroke()}
  }
  /* Q.streaks et Q.debris (traits et débris de la chute) ne sont plus dessinés ; leur mise à jour reste dans qStep (même suite aléatoire) */
}
/* hotte du grand four, au-dessus du lac : la cheminée par où le Colosse s'envole à la fin */
function qHood(){
  ctx.save();
  const g=ctx.createLinearGradient(0,0,0,170);g.addColorStop(0,'#0a0506');g.addColorStop(1,'#1c0e0b');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(600,0);ctx.lineTo(840,0);ctx.lineTo(905,150);ctx.lineTo(535,150);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(10,5,5,.7)';ctx.lineWidth=1.5;
  for(let r=1;r<6;r++){const y=r*25,a=y/150;ctx.beginPath();ctx.moveTo(600-65*a,y);ctx.lineTo(840+65*a,y);ctx.stroke()}
  ctx.fillStyle='#120909';ctx.fillRect(525,146,390,12);
  ctx.fillStyle='rgba(255,140,60,'+(.35+.1*Math.sin(Q.time*2.1))+')';ctx.fillRect(525,156,390,2);
  ctx.restore();
}
function qrock(x,y,r,rot,hot){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);
  qp(ROCKP.map(q=>[q[0]*r,q[1]*r]),hot?'#40303a':'#1b1220',hot?'#ff7a2b':'#2c1d2c',hot?3:2);
  if(hot){ctx.shadowColor='#ff7a2b';ctx.shadowBlur=18;ctx.strokeStyle='rgba(255,200,100,.6)';ctx.lineWidth=2;ctx.stroke()}
  ctx.restore();
}
function wingAngle(){
  let ang=Math.sin(Q.time*2.3)*.07;
  const a=Q.atk,b=Q.boss;
  if(a&&a.kind==='wings'){
    const ws=a.hits.filter(h=>h.k==='wave'),last=ws[ws.length-1].at;
    const raise=clamp01(a.t/.5)*(1-clamp01((a.t-(last-.3))/.5));
    ang-=.4*es(raise);
    ws.forEach(h=>{const d=(a.t-(h.at-.55))/.16;ang+=.85*Math.exp(-d*d)})
  }
  if(b.s==='rage')ang-=.3*Math.sin(clamp01(b.t/b.dur)*3.14);
  if(Q.mode==='lake'&&Q.erupt)ang+=Math.sin(Q.time*14)*.4-.2;
  return ang;
}
/* dmg (0 à 1) : aile abîmée après la foudre, bouts rongés, trous brûlés, une membrure brisée. */
const WING_OK=[[0,0],[200,-215],[250,-130],[345,-120],[285,-30],[330,60],[230,60],[250,140],[110,95]];
const WING_HURT=[[0,0],[170,-175],[235,-120],[300,-95],[262,-25],[290,40],[225,50],[200,112],[105,92]];
const WING_HOLES=[[[190,-120],[215,-100],[205,-70],[180,-85]],[[270,-20],[295,-5],[285,25],[258,10]],[[150,40],[175,50],[165,75],[140,62]]];
function drawWing(S,ang,sc,col,wo0,fire,side,dmg){
  const wo=Math.max(.001,wo0),dm=dmg||0;
  ctx.save();ctx.translate(S[0],S[1]);ctx.scale(side||1,1);ctx.rotate(ang);ctx.scale(wo*sc,wo*sc);
  const P=dm?WING_OK.map((p,i)=>[p[0]+(WING_HURT[i][0]-p[0])*dm*.75,p[1]+(WING_HURT[i][1]-p[1])*dm*.75]):WING_OK;
  qp(P,col,'rgba(255,110,40,.55)',3);
  if(dm){
    WING_HOLES.forEach((h,i)=>{
      const k=clamp01(dm*3-i*.9);if(k<=0)return;
      const cx=h.reduce((s,q)=>s+q[0],0)/4,cy=h.reduce((s,q)=>s+q[1],0)/4;
      qp(h.map(q=>[cx+(q[0]-cx)*k*1.7,cy+(q[1]-cy)*k*1.7]),'rgba(6,2,10,.92)','rgba(255,130,50,.9)',3);
    });
  }
  ctx.strokeStyle='#0f0813';ctx.lineWidth=7;ctx.lineCap='round';
  [1,3,5,7].forEach(i=>{const e=(i===3&&dm>.5)?[P[i][0]*.72,P[i][1]*.72]:P[i];ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(e[0],e[1]);ctx.stroke()});
  if(dm>.3&&fire){
    const tw=R?R.time:Q?Q.time:G.time;
    [[205,-70],[285,15],[160,65]].forEach((q,j)=>qflame(q[0],q[1],6,22+8*Math.sin(tw*9+j),j+3,j%2?'rgba(255,190,90,.85)':'rgba(255,100,40,.85)'));
  }
  if(fire){
    [1,3,5,7].forEach((i,j)=>qflame(P[i][0],P[i][1]+6,9,34+8*Math.sin((R?R.time:Q?Q.time:G.time)*9+j),j,j%2?'rgba(255,190,90,.85)':'rgba(255,100,40,.85)'));
  }
  ctx.restore();
}
function pawPos(side){
  const sg=side==='A'?-1:1,sh=[sg*85,-22];
  const rest=[sg*112,66];
  const a=Q.atk;let pos=rest,fire=Q.enraged?.45:0,held=null;
  if(a&&a.kind==='claws'){
    const hs=a.hits.filter((x,i)=>x.k.startsWith('claw')&&(i%2===0)===(side==='A'));
    const h=hs.find(x=>a.t<x.at+.35)||hs[hs.length-1],d=a.t-h.at;
    const pull=[sg*95,-125];
    const tg=[QH[0]+50-Q.bx,QH[1]-Q.by+(side==='A'?-30:35)];
    if(d>=-.7&&d<-.2)pos=lerp2(rest,pull,es((d+.7)/.5));
    else if(d>=-.2&&d<0)pos=lerp2(pull,tg,ei((d+.2)/.2));
    else if(d>=0&&d<.35)pos=lerp2(tg,rest,es(d/.35));
    if(d>=-.7&&d<.3)fire=1;
  }else if(a&&a.kind==='rocks'){
    const hold=[sg*100,-95],fwd=[-170,-70];
    a.hits.forEach((h,i)=>{
      if(h.k!=='rock'||(i%2?'B':'A')!==side)return;
      const ts=h.at-1.0,te=h.at-.45,t=a.t;
      if(t>=ts-.3&&t<te){pos=lerp2(rest,hold,es(clamp01((t-(ts-.3))/.3)));held=h}
      else if(t>=te&&t<te+.15)pos=lerp2(hold,fwd,eo((t-te)/.15));
      else if(t>=te+.15&&t<te+.55)pos=lerp2(fwd,rest,es((t-te-.15)/.4));
    });
    if(held)fire=.7;
  }else if(a&&a.kind==='wings'){
    pos=[rest[0],rest[1]-30];
  }
  const dx=pos[0]-sh[0],dy=pos[1]-sh[1],dd=Math.hypot(dx,dy),mx=215;
  if(dd>mx)pos=[sh[0]+dx/dd*mx,sh[1]+dy/dd*mx];
  return{p:pos,fire,held,sh};
}
function drawPaw(P){
  const p=P.p;
  ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p[0],p[1],18,0,6.283);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#eadbc8';ctx.lineWidth=4;ctx.lineCap='round';
  [-10,0,10].forEach(dy=>{ctx.beginPath();ctx.moveTo(p[0]-14,p[1]+dy);ctx.lineTo(p[0]-34,p[1]+dy*1.5);ctx.stroke()});
  if(P.fire>0){
    const g=ctx.createRadialGradient(p[0],p[1],2,p[0],p[1],60*P.fire);
    g.addColorStop(0,'rgba(255,200,90,.7)');g.addColorStop(1,'rgba(255,100,30,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(p[0],p[1],60*P.fire,0,6.283);ctx.fill();
    for(let i=0;i<3;i++)qflame(p[0]-8+i*8,p[1]+8,8,(32+14*Math.sin(Q.time*10+i))*P.fire,i,i%2?'rgba(255,196,90,.9)':'rgba(255,110,40,.9)');
  }
  if(P.held)qrock(p[0]-6,p[1]-24,26,Q.time*3,true);
}
function drawBoss2(){
  const t=Q.time,b=Q.boss;
  ctx.save();ctx.translate(Q.bx,Q.by);
  const big=Q.enraged?(Q.bhp===1?1.35:1):.7;
  const ag=ctx.createRadialGradient(0,-20,10,0,-20,300*big);
  ag.addColorStop(0,'rgba(255,120,40,'+(.3*big)+')');ag.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=ag;ctx.beginPath();ctx.arc(0,-20,300*big,0,6.283);ctx.fill();
  const wa=wingAngle(),fire=Q.enraged;
  for(const sd of [-1,1]){
    drawWing([sd*50,-48],wa+.3,.85,'#2a0c14',Q.wo,fire,sd);
    drawWing([sd*60,-40],wa,1,'#4a1219',Q.wo,fire,sd);
  }
  ctx.save();ctx.translate(0,148);ctx.scale(.78,.78);
  demonBody({stow:1,t,warm:Q.enraged?(Q.bhp===1?1.6:1.3):1,jaw:b.s==='rage'||(Q.atk&&Q.atk.kind==='roar')?14:(Q.atk&&Q.atk.hits.some(h=>h.k==='fire'&&Q.atk.t>h.at-.5&&Q.atk.t<h.at+.15)?12:Q.atk?4:0),hurt:Q.recoil>.3});
  ctx.restore();
  const pA=pawPos('A'),pB=pawPos('B');
  drawArm(pA.sh,pA.p,62,-1);drawArm(pB.sh,pB.p,62,1);
  drawPaw(pA);drawPaw(pB);
  if(Q.enraged){
    const sz=Q.bhp===1?1.5:1;
    [[-88,-45],[88,-45],[-60,-40],[60,-40],[-30,-30],[30,-30],[-100,-18],[100,-18],[-50,60],[50,60],[0,-112],[-30,-105],[30,-105],[-70,20],[70,20]].forEach((q,i)=>{
      const h=(26+20*Math.abs(Math.sin(t*9+i*1.7)))*sz,w=(8+3*Math.abs(Math.sin(t*7+i)))*sz;
      qflame(q[0],q[1],w,h,i,i%2?'rgba(255,196,90,.88)':'rgba(255,100,40,.88)');
    });
  }
  ctx.restore();
}
function tailTip(){
  const x=Q.bx,y=Q.by,a=Q.atk;
  let tip=[x+175+Math.sin(Q.time*2)*16,y+135+Math.cos(Q.time*2.3)*14],fire=Q.enraged?.5:0,strike=0;
  if(a){
    const th=a.hits.filter(x=>x.k==='tail'),h=th.find(x=>a.t<x.at+.4)||th[th.length-1]||a.hits[a.hits.length-1];
    if(h.k==='tail'){
      const d=a.t-h.at,up=[x+130,y-170],hit=[QH[0]+30,QH[1]+10];
      if(d>-.55&&d<=-.14){tip=lerp2(tip,up,es(clamp01((d+.55)/.4)));fire=1}
      else if(d>-.14&&d<=0){tip=lerp2(up,hit,ei(clamp01((d+.14)/.14)));fire=1;strike=1}
      else if(d>0&&d<.4){tip=lerp2(hit,tip,es(d/.4));fire=1-d/.4*.5;strike=1-d/.4}
    }
  }
  return{tip,fire,strike};
}
function drawTail2(){
  const T2=tailTip(),r=[Q.bx+34,Q.by+52],tip=T2.tip;
  const c=[(r[0]+tip[0])/2+20*(1-T2.strike),Math.max(r[1],tip[1])+70*(1-T2.strike)];
  ctx.save();ctx.lineCap='round';
  ctx.strokeStyle='#1c1220';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(r[0],r[1]);ctx.quadraticCurveTo(c[0],c[1],tip[0],tip[1]);ctx.stroke();
  ctx.strokeStyle='rgba(255,106,42,'+(.35+.5*T2.fire)+')';ctx.lineWidth=6;ctx.stroke();
  if(T2.fire>0){
    const g=ctx.createRadialGradient(tip[0],tip[1],2,tip[0],tip[1],55*T2.fire);
    g.addColorStop(0,'rgba(255,220,120,.8)');g.addColorStop(1,'rgba(255,100,30,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(tip[0],tip[1],55*T2.fire,0,6.283);ctx.fill();
    for(let i=0;i<3;i++)qflame(tip[0]-10+i*10,tip[1]+6,9,(34+12*Math.sin(Q.time*10+i))*T2.fire,i,i%2?'rgba(255,196,90,.9)':'rgba(255,110,40,.9)');
  }
  ctx.restore();
}
function drawHits2(){
  drawTail2();
  const a=Q.atk;if(!a)return;
  if(a.kind==='roar'){ctx.fillStyle='rgba(120,95,100,.55)';for(let i=0;i<16;i++){const x=(i*61+Math.sin(Q.time*3+i)*20+30)%W,y=(Q.time*(260+i*14)+i*47)%(H*.7);ctx.fillRect(x,y,3+i%3,3+i%3)}}
  for(const h of a.hits){
    const d=a.t-h.at;
    if(h.k==='clawA'||h.k==='clawB'){
      if(d<-.03||d>.32)continue;
      const up=h.k==='clawA';
      const p0=up?[QH[0]-70,QH[1]-120]:[QH[0]-70,QH[1]+80],p1=up?[QH[0]+70,QH[1]+60]:[QH[0]+70,QH[1]-110];
      const pr=clamp01((d+.03)/.1),al=1-clamp01(d/.32),e=lerp2(p0,p1,pr);
      ctx.save();ctx.lineCap='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=16;
      for(let i=-1;i<=1;i++){
        ctx.strokeStyle='rgba(255,'+(i?170:240)+','+(i?70:190)+','+al+')';ctx.lineWidth=i?6:9;
        ctx.beginPath();ctx.moveTo(p0[0]+i*16,p0[1]);ctx.lineTo(e[0]+i*16,e[1]);ctx.stroke();
      }
      ctx.restore();
    }else if(h.k==='wave'){
      if(d<-.55||d>.9)continue;
      const u=(d+.55)/.55,x0=Q.bx-95,x1=QH[0]+10,x=x0+(x1-x0)*u,cy=QH[1]-40,hh=88;
      ctx.save();
      ctx.globalAlpha=Math.max(0,d>.5?1-(d-.5)/.4:1);
      const gr=ctx.createLinearGradient(x-45,0,x+35,0);gr.addColorStop(0,'#fff6c8');gr.addColorStop(.4,'#ffb347');gr.addColorStop(1,'rgba(255,90,30,0.1)');
      ctx.fillStyle=gr;ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
      ctx.beginPath();ctx.moveTo(x+30,cy-hh);ctx.quadraticCurveTo(x-45,cy-hh*.4,x-45,cy);ctx.quadraticCurveTo(x-45,cy+hh*.4,x+30,cy+hh);ctx.quadraticCurveTo(x-5,cy,x+30,cy-hh);ctx.fill();
      ctx.shadowBlur=0;
      for(let i=0;i<6;i++)qflame(x+42+((i*13)%22),cy-70+i*28,8,26+8*Math.sin(Q.time*10+i),i,'rgba(255,150,50,.8)');
      ctx.restore();
    }else if(h.k==='rock'){
      if(d<-.45||d>0)continue;
      const u=(d+.45)/.45,s0=[Q.bx-120,Q.by-90],e0=[QH[0]+30,QH[1]];
      for(let i=4;i>=1;i--){
        const uu=Math.max(0,u-i*.07),q=lerp2(s0,e0,uu);q[1]-=60*Math.sin(Math.PI*uu);
        ctx.fillStyle='rgba(255,140,50,'+(.28-i*.05)+')';ctx.beginPath();ctx.arc(q[0],q[1],24-i*3,0,6.283);ctx.fill();
      }
      const pos=lerp2(s0,e0,u);pos[1]-=60*Math.sin(Math.PI*u);
      qrock(pos[0],pos[1],26,Q.time*14,true);
      qflame(pos[0]+10,pos[1]-18,10,34,3,'rgba(255,170,70,.85)');
    }else if(h.k==='fall'){
      if(d<-.8||d>.4)continue;
      const x=QH[0]+26,gy=QH[1]-6;
      if(d>=-.42){
        const u=clamp01((d+.42)/.42),y=d<0?-50+(gy+50)*u*u:gy+d*1100;
        for(let i=3;i>=1;i--){ctx.fillStyle='rgba(255,140,50,'+(.22-i*.05)+')';ctx.beginPath();ctx.arc(x,y-i*26,26-i*4,0,6.283);ctx.fill()}
        qrock(x,y,28,Q.time*7+x,true);
      }
      if(d<-.12){ /* flèche : orange, puis rouge quand il faut esquiver */
        const red=d>=-.3,al=red?.95:.35+.35*Math.abs(Math.sin(Q.time*18));
        ctx.save();ctx.fillStyle=red?'rgba(255,45,40,'+al+')':'rgba(255,150,50,'+al+')';ctx.beginPath();ctx.moveTo(x-12,26);ctx.lineTo(x+12,26);ctx.lineTo(x,52);ctx.closePath();ctx.fill();ctx.restore();
      }
    }else if(h.k==='fire'){
      if(d<-.32||d>.04)continue;
      const u=clamp01((d+.32)/.32),s0=[Q.bx-62,Q.by-98],e0=[QH[0]+26,QH[1]-2],pos=lerp2(s0,e0,u);
      for(let i=5;i>=1;i--){const q=lerp2(s0,e0,Math.max(0,u-i*.06));ctx.fillStyle='rgba(255,150,50,'+(.34-i*.05)+')';ctx.beginPath();ctx.arc(q[0],q[1],15-i*2,0,6.283);ctx.fill()}
      ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=22;ctx.fillStyle='#fff2b8';ctx.beginPath();ctx.arc(pos[0],pos[1],12,0,6.283);ctx.fill();ctx.restore();
      qflame(pos[0]+6,pos[1]-8,9,28,2,'rgba(255,150,50,.9)');
    }
  }
}
function heroPose(){
  const p=Q.pl,c=Q.cn;
  let x=Q.hx,y=Q.hy,rot=0,sa=-.12,glow=0;
  const chestT=[Q.bx-120,Q.by-8];
  if(c){
    const t=c.t;
    if(c.k==='stab'){
      /* pas en avant (28 px, 1er novembre : la robe reste sur le bloc), rayon droit sur le torse */
      const adv=t<.3?eo(t/.3):t<.7?1:1-es(clamp01((t-.7)/.45));x+=28*adv;rot=-.04*adv;
    }else if(c.k==='head'){
      /* le Veilleur reste sur son bloc : seul son rayon monte vers la tête (1er novembre) */
      glow=t>=.3&&t<.85?.6:0;
    }else if(c.k==='beam'){
      glow=clamp01(t/.75);
      if(t>1.3)glow=Math.max(0,1-(t-1.3)/.3);
    }else if(c.k==='final'){
      /* coup ultime : le Veilleur reste au sol, un pas en avant sur son bloc ; seul le rayon vise (1er novembre) */
      if(t<1.1){glow=t/1.1}
      else{const u=es(clamp01((t-1.1)/.45));x+=28*u;glow=t<1.55?1:Math.max(.5,1-(t-1.55)/3)}
    }
    const tgt=qBeamTarget(c);if(tgt)sa=Math.atan2(tgt[1]-(y+WH[1]),tgt[0]-(x+WH[0]));else sa=-.7;
  }else if(qSideK()>0){
    /* esquive : pas de côté sur le bloc (pose dodgeSide du Chapitre II), inclinaison autour des pieds (corps décalé de 44 px) */
    const k=qSideK(),r=DG.side.rot*k;x+=DG.side.dx*k+44*Math.sin(r);y+=44-44*Math.cos(r);rot=r;
  }else if(p.s==='hurt'){
    const u=Math.min(1,p.t/p.rd);x-=34*(1-u);rot=-.35*(1-u);
  }else if(p.s==='down'){
    /* défaite : le Veilleur s'effondre du bloc sur le rebord (DG.drop plus bas) */
    x-=Math.min(p.t,.8)*40;y+=Math.min(DG.drop,p.t*140);rot=-Math.min(1.45,p.t*5);
  }
  /* fin : le Veilleur revient debout sur son bloc et regarde le Colosse plonger, puis s'envoler */
  if(Q.mode==='lake'){const e=es(clamp01(Q.lt/.6));x+=(Q.hx-x)*e;y+=(Q.hy-y)*e;sa=-1.15;glow=Q.erupt?.8:.35;rot=0}
  return{x,y,rot,sa,glow};
}
const WH=[34,-8];
/* avancement du pas de côté (0 à 1 à 0, sur DG.side.dur depuis l'appui) ; 0 hors esquive, pendant un coup reçu, un contre ou la défaite */
function qSideAge(){const p=Q.pl;return p.s==='act'?p.t:Q.time-Q.sideT}
function qSideK(){const p=Q.pl,g=qSideAge();return Q.cn||p.s==='hurt'||p.s==='down'||Q.mode==='lake'||g<0||g>=DG.side.dur?0:Math.sin(Math.PI*g/DG.side.dur)}
function qBeamTarget(c){return c.k==='head'?[Q.bx,Q.by-92]:c.k==='beam'?[Q.bx-30,Q.by-4]:c.k==='final'?[Q.bx-20,Q.by-4]:[Q.bx-30,Q.by-4]}
/* intensité du rayon de contre (phase II) à l'instant t */
function qBeamAl(c){const t=c.t;if(c.k==='stab')return t>=.28&&t<.62?(t<.35?(t-.28)/.07:1-(t-.35)/.27):0;if(c.k==='head')return t>=.48&&t<.85?(t<.55?(t-.48)/.07:1-(t-.55)/.3):0;if(c.k==='final')return t>=1.45&&t<3.5?Math.min(1,(t-1.45)/.1)*(t<3.2?1:1-(t-3.2)/.3):0;return 0}
function qSwordTip(){const h=heroPose();return[h.x+WH[0]+Math.cos(h.sa)*80,h.y+WH[1]+Math.sin(h.sa)*80]}
function drawHero2(){
  const h=heroPose(),t=Q.time,p=Q.pl,c=Q.cn;
  /* le Veilleur commun (LB.drawWatcher), corps réduit pendant la chute dans le puits ; la phase donne sa géométrie */
  const c2=Q.cn,hitk=c2?qBeamAl(c2):0;
  const sk=qSideK(),pose=c?'counter':sk>0?'dodgeSide':p.s==='hurt'?'hurt':p.s==='down'?'fall':'idle';
  const opt={k:sk,dx:0,dy:0,rot:h.rot,rot2:0,sx:1,sy:1,breath:false,fl:3*Math.sin(t*14),
    body:{dy:44,s:.8},shoulder:[18.5,-18.5],armR:5.2,hand:WH,sa:h.sa,L:80,aura:h.glow,
    glow:Math.max(.35,h.glow,hitk),lanternCol:LB.watcherLanternCol(Q.pl,h.glow>0||hitk>0)};
  /* image rémanente du pas de côté, vers sa place de départ, comme au Chapitre II */
  if(sk>0&&qSideAge()<DG.side.ghost){ctx.save();ctx.globalAlpha=DG.side.ga;LB.drawWatcher(ctx,h.x+DG.side.gx,h.y,pose,t,Object.assign({},opt,{aura:0}));ctx.restore()}
  LB.drawWatcher(ctx,h.x,h.y,pose,t,opt);
}
function drawFx2(){
  const S=R||Q;
  for(const s of S.sparks){
    ctx.globalAlpha=clamp01(s.life/s.max);ctx.fillStyle=s.col;ctx.fillRect(s.x-s.sz/2,s.y-s.sz/2,s.sz,s.sz);
  }
  ctx.globalAlpha=1;
  for(const r of S.rings){
    const u=1-r.life/r.max;
    ctx.strokeStyle='rgba(191,234,255,'+(1-u)+')';ctx.lineWidth=5*(1-u)+1;
    ctx.beginPath();ctx.arc(r.x,r.y,18+120*u,0,6.283);ctx.stroke();
  }
  for(const f of S.fbs){
    const u=f.t/.7,al=Math.max(0,1-u*u);
    ctx.save();ctx.translate(f.x,f.y);
    const gg=ctx.createRadialGradient(0,0,0,0,0,110*f.big);
    gg.addColorStop(0,'rgba(255,230,150,'+(.9*al)+')');gg.addColorStop(1,'rgba(255,100,30,0)');
    ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,110*f.big,0,6.283);ctx.fill();
    ctx.globalAlpha=al;
    for(let i=0;i<11;i++){
      const a=-3.14+(i/10)*3.14+Math.sin(i*5.3)*.12,len=(50+70*((i*7)%5)/4)*f.big*eo(clamp01(u*1.6));
      ctx.save();ctx.rotate(a+1.5708);
      qflame(0,-8,11*f.big,len,i,i%2?'rgba(255,214,110,.95)':'rgba(255,110,40,.95)');
      ctx.restore();
    }
    ctx.restore();
  }
  for(const e of S.exps){
    const u=e.t/.9,rr=(30+300*eo(u))*e.s,al=Math.max(0,1-u*1.1);
    const g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,rr);
    g.addColorStop(0,'rgba(255,255,255,'+al+')');g.addColorStop(.5,'rgba(190,234,255,'+(al*.6)+')');g.addColorStop(1,'rgba(111,211,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,rr,0,6.283);ctx.fill();
  }
  ctx.textAlign='center';
  for(const f of S.floats){
    const u=1-f.life/f.max;
    ctx.globalAlpha=clamp01(f.life/f.max*1.6);
    ctx.font='800 '+Math.round(f.sz*(1+.45*Math.max(0,1-u*7)))+'px '+DISPLAY;ctx.fillStyle=f.col;
    ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeStyle='rgba(0,0,0,.7)';ctx.strokeText(f.txt,f.x+f.sz*2,f.y-26*u);
    ctx.fillText(f.txt,f.x+f.sz*2,f.y-26*u);
  }
  ctx.globalAlpha=1;ctx.textAlign='start';
}
function drawCnFx(){
  const c=Q.cn;if(!c)return;
  {const al=qBeamAl(c);if(al>0){const tip=qSwordTip(),to=qBeamTarget(c),w=c.k==='final'?26*(1+.08*Math.sin(Q.time*50)):16;lanternBeam(tip,to,w,al)}}
  if(c.k==='beam'&&c.t>=.75&&c.t<1.35){
    const tip=qSwordTip(),to=[Q.bx-30,Q.by-4],u=(c.t-.75)/.6,wd=34*(1-u*.6)*(1+.1*Math.sin(Q.time*60));
    ctx.save();ctx.lineCap='round';
    ctx.shadowColor='#ffd966';ctx.shadowBlur=30;
    ctx.strokeStyle='rgba(255,217,102,.55)';ctx.lineWidth=wd*1.8;
    ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(to[0],to[1]);ctx.stroke();
    ctx.strokeStyle='#ffffff';ctx.lineWidth=wd*.6;
    ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(to[0],to[1]);ctx.stroke();
    ctx.restore();
  }
}
function drawHints2(){
  if(!LB.help.on()||Q.mode!=='play')return;
  const p=Q.pl,a=Q.atk;
  if(a&&p.s!=='counter'){
    const h=a.hits.find(x=>!x.done);
    if(h){
      LB.cue(ctx,{x:QH[0],y:QH[1]-95,cx:QH[0],cy:QH[1]-10,r:70,tt:h.at-a.t,act:HD('dodge').act,easy:DIFF.easy});
    }
  }
  LB.drawRecoveryBar(ctx,QH[0],QH[1]+44,p); /* barre de récupération sous les pieds : repère d'aide, jamais rouge (la lanterne l'est) */
}
/* lave, rebord, bloc du pont tombé, chaînes, équerres, anneau et lanterne : visibles pendant tout le combat (sections G et K) */
function qLantern(x,y){
  /* petite lanterne de Veilleur posée sur le rebord : lueur orange de la braise, faible, pulsation lente (section G) */
  const pu=.5+.5*Math.sin(Q.time*1.3),gy=y-17;
  ctx.save();
  const hg=ctx.createRadialGradient(x,gy,1,x,gy,30);hg.addColorStop(0,'rgba(255,122,43,'+(.16+.12*pu)+')');hg.addColorStop(1,'rgba(255,122,43,0)');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(x,gy,30,0,6.283);ctx.fill();
  ctx.fillStyle='#3a2a20';ctx.fillRect(x-8,y-4,16,4);
  ctx.fillStyle='rgba(255,'+Math.round(122+40*pu)+',43,'+(.55+.25*pu)+')';ctx.fillRect(x-6,y-22,12,18);
  ctx.strokeStyle='#4a3a2a';ctx.lineWidth=1.6;ctx.strokeRect(x-6,y-22,12,18);
  ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-2,y-22);ctx.lineTo(x-2,y-4);ctx.moveTo(x+2,y-22);ctx.lineTo(x+2,y-4);ctx.stroke();
  ctx.fillStyle='#4a3a2a';ctx.beginPath();ctx.moveTo(x-7,y-22);ctx.lineTo(x,y-28);ctx.lineTo(x+7,y-22);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#6e5c54';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y-31,2.5,0,6.283);ctx.stroke();
  ctx.restore();
}
function drawLake(front){
  const sy=QLAKE;
  ctx.save();
  if(front){
    /* le Colosse englouti : la lave passe devant lui (côté lac seulement) */
    if(Q.mode==='lake'&&Q.splash){ctx.beginPath();ctx.rect(QEDGE,sy,W-QEDGE,H-sy);ctx.clip();
      ctx.fillStyle='rgba(255,110,30,.7)';ctx.fillRect(QEDGE,sy,W-QEDGE,H-sy)}
  }else{
    const g=ctx.createLinearGradient(0,sy,0,H);g.addColorStop(0,'#ffd27a');g.addColorStop(.25,'#ff7a2b');g.addColorStop(1,'#5a1408');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(0,H);
    for(let x=0;x<=W;x+=20)ctx.lineTo(x,sy+Math.sin(x*.03+Q.time*3)*5);
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    const rg=ctx.createLinearGradient(0,sy-120,0,sy);rg.addColorStop(0,'rgba(255,160,60,0)');rg.addColorStop(1,'rgba(255,160,60,.5)');
    ctx.fillStyle=rg;ctx.fillRect(0,sy-120,W,120);
    const cy=QFLOOR;
    /* un pan de mur de pierre derrière le rebord de gauche */
    {const wg=ctx.createLinearGradient(0,cy-170,0,cy+20);wg.addColorStop(0,'#1c1412');wg.addColorStop(1,'#3a2820');
      ctx.fillStyle=wg;ctx.beginPath();ctx.moveTo(0,cy-170);ctx.lineTo(120,cy-170);ctx.lineTo(136,cy-120);ctx.lineTo(140,cy-40);ctx.lineTo(146,cy+20);ctx.lineTo(0,cy+20);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(10,6,5,.65)';ctx.lineWidth=1.5;
      for(let r=0;r<7;r++){const yy=cy-166+r*27;ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(140,yy);ctx.stroke();
        for(let c=(r%2)*22;c<140;c+=44){ctx.beginPath();ctx.moveTo(c,yy);ctx.lineTo(c,yy+27);ctx.stroke()}}
      const lg=ctx.createLinearGradient(0,cy-60,0,cy+10);lg.addColorStop(0,'rgba(255,120,40,0)');lg.addColorStop(1,'rgba(255,130,50,.28)');
      ctx.fillStyle=lg;ctx.fillRect(0,cy-60,140,70)}
    /* le rebord de terre et de roche, au pied du mur, qui descend jusqu'à la lave */
    {const tg=ctx.createLinearGradient(0,cy,0,H);tg.addColorStop(0,'#4a352a');tg.addColorStop(1,'#1a100d');
      ctx.fillStyle=tg;ctx.beginPath();ctx.moveTo(0,cy-3);ctx.lineTo(120,cy-4);ctx.lineTo(240,cy-1);ctx.lineTo(QEDGE-26,cy+1);ctx.lineTo(QEDGE,cy+12);ctx.lineTo(QEDGE+12,sy+8);ctx.lineTo(QEDGE+20,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(255,160,70,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,cy-3);ctx.lineTo(120,cy-4);ctx.lineTo(240,cy-1);ctx.lineTo(QEDGE-26,cy+1);ctx.lineTo(QEDGE,cy+12);ctx.lineTo(QEDGE+12,sy+8);ctx.stroke();
      ctx.fillStyle='rgba(20,10,8,.55)';for(const [qx,qy,qr] of [[22,cy+20,5],[60,cy+34,4],[180,cy+18,6],[250,cy+40,5],[300,cy+26,4],[140,cy+60,3]]){ctx.beginPath();ctx.arc(qx,qy,qr,0,6.283);ctx.fill()}}
    /* un bloc du pont, tombé sur le rebord : le Veilleur s'y tient (son pas de côté d'esquive reste dessus) */
    {const x0=QH[0]-52,x1=QH[0]+64,top=QH[1]+44;
      const bg=ctx.createLinearGradient(0,top,0,cy);bg.addColorStop(0,'#5a4a44');bg.addColorStop(1,'#2e2320');
      ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(x0+4,top);ctx.lineTo(x1-6,top-2);ctx.lineTo(x1,top+8);ctx.lineTo(x1+3,cy);ctx.lineTo(x0-4,cy);ctx.lineTo(x0,top+10);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(12,8,7,.7)';ctx.lineWidth=1.5;
      for(const yy of [top+36,top+73]){ctx.beginPath();ctx.moveTo(x0-1,yy);ctx.lineTo(x1+1,yy);ctx.stroke()}
      for(const [xx,y0] of [[x0+50,top],[x0+28,top+36],[x0+80,top+36],[x0+56,top+73]]){ctx.beginPath();ctx.moveTo(xx,y0);ctx.lineTo(xx,y0+36);ctx.stroke()}
      ctx.strokeStyle='rgba(255,170,90,.4)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0+4,top);ctx.lineTo(x1-6,top-2);ctx.lineTo(x1,top+8);ctx.stroke();
      ctx.strokeStyle='rgba(8,5,4,.8)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x1-14,top);ctx.lineTo(x1-22,top+14);ctx.lineTo(x1-16,top+26);ctx.stroke()}
    /* une chaîne d'homme rompue, boulonnée au mur, et l'anneau de fer tombé sur le rebord */
    {const bx=98,by=cy-112;
      ctx.lineCap='round';
      ctx.fillStyle='#4a3a34';ctx.fillRect(74,by-11,16,22);ctx.fillRect(74,by-3,28,6);ctx.fillStyle='#6e5c54';ctx.fillRect(74,by-11,16,2);
      ctx.fillStyle='#9a8a80';for(const yy of [by-6,by+6]){ctx.beginPath();ctx.arc(82,yy,2,0,6.283);ctx.fill()}
      ctx.strokeStyle='rgba(255,150,60,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(74,by+11);ctx.lineTo(90,by+11);ctx.stroke();
      /* une seconde équerre, vide : la chaîne qui y était a disparu */
      ctx.fillStyle='#4a3a34';ctx.fillRect(22,by-11,16,22);ctx.fillRect(22,by-3,26,6);ctx.fillStyle='#6e5c54';ctx.fillRect(22,by-11,16,2);
      ctx.fillStyle='#9a8a80';for(const yy of [by-6,by+6]){ctx.beginPath();ctx.arc(30,yy,2,0,6.283);ctx.fill()}
      ctx.strokeStyle='#9aa0ab';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(50,by+3,3.6,.4,5.9);ctx.stroke();
      ctx.strokeStyle='rgba(255,150,60,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(22,by+11);ctx.lineTo(38,by+11);ctx.stroke();
      const n=5;
      for(let i=0;i<n;i++){
        const ly=by+8+i*14,sw=Math.sin(Q.time*1.3+i*.4)*.7*(i/n),lx=bx+sw*3;
        const last=i===n-1;
        ctx.strokeStyle='#9aa0ab';ctx.lineWidth=2.8;
        ctx.beginPath();
        if(i%2===0)ctx.ellipse(lx,ly,3.8,7,0,last?.7:0,last?6.0:6.283);
        else ctx.ellipse(lx,ly,7,3.4,0,0,6.283);
        ctx.stroke();
        ctx.strokeStyle='rgba(255,160,60,.4)';ctx.lineWidth=1;ctx.beginPath();
        if(i%2===0)ctx.ellipse(lx,ly+.5,3.8,7,0,.3,2.8);else ctx.ellipse(lx,ly+.5,7,3.4,0,.3,2.8);
        ctx.stroke()}
      const rx=112,ry=cy-12;
      ctx.strokeStyle='#a2a7b2';ctx.lineWidth=4;ctx.beginPath();ctx.arc(rx,ry,9,0,6.283);ctx.stroke();
      ctx.strokeStyle='rgba(255,170,70,.6)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(rx,ry+.5,9,.3,2.9);ctx.stroke();
      ctx.strokeStyle='rgba(255,236,190,'+(.35+.25*Math.sin(Q.time*2.2))+')';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(rx,ry,9,3.6,4.5);ctx.stroke();
      ctx.lineCap='butt'}
    qLantern(150,cy-2);
  }
  ctx.restore();
}
function renderQ(){
  qLayout();
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(Q.shake>0&&!reduce)ctx.translate(rand(-1,1)*Q.shake,rand(-1,1)*Q.shake);
  qBackground();
  drawLake(false);
  ctx.save();ctx.translate(0,qDive());
  drawBoss2();
  drawHits2();
  ctx.restore();
  drawHero2();
  drawCnFx();
  drawLake(true);
  drawHints2();
  drawFx2();
  ctx.restore();
  ctx.drawImage(vig,0,0,W,H);
  if(Q.flash>0){ctx.fillStyle='rgba(255,255,255,'+Q.flash+')';ctx.fillRect(0,0,W,H)}
  if(Q.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(Q.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  let fade=0;
  if(Q.mode==='intro')fade=1-clamp01(Q.t/.7);
  if(Q.mode==='lake'&&Q.splash)fade=clamp01((Q.lt-Q.splash-1.9)/.9);
  if(fade>0){ctx.fillStyle='rgba(0,0,0,'+fade+')';ctx.fillRect(0,0,W,H)}
}

