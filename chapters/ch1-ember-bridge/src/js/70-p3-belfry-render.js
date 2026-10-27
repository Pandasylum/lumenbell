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
/* Fissures de braise là où la foudre l'a frappé (torse et épaule), qui palpitent doucement. */
function drawCracks3(wd,t){
  const pulse=.7+.3*Math.sin(t*5);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=10;
  [[[-14,-215],[-30,-190],[-18,-165],[-40,-135]],[[-30,-190],[-62,-184]],[[-18,-165],[6,-150],[0,-125]],[[-14,-215],[10,-228],[26,-218]]].forEach(pts=>{
    const n=Math.max(2,Math.ceil(pts.length*wd));
    ctx.strokeStyle='rgba(255,170,80,'+(.9*pulse*wd)+')';ctx.lineWidth=3;
    ctx.beginPath();pts.slice(0,n).forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  });
  ctx.restore();
}
function drawBoss3(){
  const o=bossPose3(),t=R.time;
  if(o.flip){ctx.save();ctx.translate(o.x,0);ctx.scale(-1,1);ctx.translate(-o.x,0)}
  ctx.save();ctx.translate(o.x,DECK+o.dy);
  ctx.save();ctx.rotate(o.lean);ctx.scale(.92,.92);
  const wf=Math.sin(t*1.8)*.03;
  const fire=o.warm>1.1||R.rage>0;
  if(R.healed&&R.mode!=='finale'&&R.boss.s!=='dead')drawAura3(o,t);
  if(R.atk&&R.atk.dbl&&R.atk.t<R.atk.hits[R.atk.hits.length-1].at+.05){ctx.save();ctx.fillStyle='rgba(255,176,74,'+(.85+.15*Math.sin(t*30))+')';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=14;ctx.font='900 54px '+DISPLAY;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!'.repeat(R.atk.tn||2),-170,-300);ctx.restore()}
  /* Seconde vie : la foudre l'a blessé, ses ailes sont rongées et pendent (l'aile droite plus abîmée) ; les blessures apparaissent en 0,8 s à l'impact. */
  const wd=R.healed&&R.mode!=='finale'?(R.wdAt==null?1:clamp01((R.time-R.wdAt)/.8)):(R.healed?1:0);
  for(const sd of [-1,1]){
    if((sd===-1&&R.cut>=1)||(sd===1&&R.cut>=2))continue;
    const hot=o.ws>1.05,dm=wd*(sd===1?1:.7),dr=.12*dm,sz=1-.06*dm;
    drawWing([sd*64,-222],-.85+wf+o.wa+dr,.8*o.ws*sz,hot?'#5a1a28':'#220a11',.34,fire,sd,dm);drawWing([sd*50,-232],-1.15+wf+o.wa+dr,1*o.ws*sz,hot?'#7a2230':'#35101a',.34,fire,sd,dm);
  }
  demonBody({t,hornCut:R.hornAt!=null,warm:o.warm,jaw:o.jaw,hurt:R.recoil>.3,wound:0,stow:o.sword?1-clamp01(o.sword.l/40):(o.nostow?0:1),hk:hookStep(R,(R.atk&&R.atk.kind==='whip')?1:0,R.time)});
  if(wd>0)drawCracks3(wd,t);
  ctx.restore();
  ctx.restore();
  /* La corne brisée par la foudre tombe au sol. */
  if(R.hornAt!=null&&R.mode!=='finale'){
    const u=R.time-R.hornAt;
    if(u>=0&&u<1.5){
      const x=R.hornX+106+110*u,y=DECK-330-170*u+1000*u*u;
      ctx.save();ctx.globalAlpha=clamp01((1.5-u)/.4);ctx.translate(Math.min(x,W-20),Math.min(y,DECK-4));ctx.rotate(Math.min(u,.9)*4.5);ctx.scale(.92,.92);ctx.translate(-115,345);
      qp([[100,-348],[134,-390],[124,-338],[98,-316],[104,-336]],'#3a2a3c','#5a4666',2);
      ctx.restore();
    }
  }
  const cl=Math.cos(o.lean),sl=Math.sin(o.lean);
  const sh=sd=>{const lx=sd*92,ly=-200;return[o.x+lx*cl-ly*sl,DECK+o.dy+lx*sl+ly*cl]};
  const hs=o.hands.map(h=>[h[0],h[1]+o.dy]);
  const sL=sh(-1),sR=sh(1);
  drawArm(sL,hs[0],78,-1);drawArm(sR,hs[1],78,1);
  ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;
  for(const h of hs){ctx.beginPath();ctx.arc(h[0],h[1],17,0,6.283);ctx.fill();ctx.stroke()}
  drawClaws(hs);
  drawBreathFx(o);
  drawWhipGlow(hs);
  if(o.sword){
    ctx.save();ctx.translate(o.sword.h[0],o.sword.h[1]+o.dy);ctx.rotate(o.sword.a);
    drawFireBlade(o.sword.l,o.sword.heat,t,11);
    ctx.restore();
    if(o.sword.chg){
      ctx.save();ctx.translate(o.sword.h[0],o.sword.h[1]+o.dy);ctx.rotate(o.sword.a);
      ctx.lineCap='round';ctx.beginPath();ctx.moveTo(o.sword.l-44,0);ctx.lineTo(o.sword.l,0);
      ctx.strokeStyle='rgba(255,176,74,'+(.25*o.sword.chg)+')';ctx.lineWidth=30+30*o.sword.chg;ctx.stroke();ctx.strokeStyle='rgba(255,235,170,'+(.55*o.sword.chg)+')';ctx.lineWidth=10+16*o.sword.chg;ctx.stroke();ctx.restore();
    }
    for(const h of hs){ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;ctx.beginPath();ctx.arc(h[0],h[1],15,0,6.283);ctx.fill();ctx.stroke()}
  }
  if(o.flip)ctx.restore();
}
function drawBreathFx(o){
  const a=R.atk;if(!a||(a.kind!=='breath'&&!(a.cf!=null&&a.pt>=a.cf))||a.pt<0)return;
  const q=a.hq||a.cf!=null?aq(a,'breath',1.0):a.pt,k=es(clamp01(q/.6))*(1-es(clamp01((q-1.2)/.4)));
  faceFire(o.x-18,DECK+o.dy-238,k,q);
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
function drawWhipGlow(hs){
  const a=R.atk;if(!a||a.kind!=='whip'||a.pt<0||(a.cf!=null&&a.pt>=a.cf))return;
  const wq=DIFF.hard?aq(a,'whip',.75):a.pt;
  const k=es(clamp01(wq/.55))*(1-es(clamp01((wq-.8)/.4)));
  if(k<=0)return;
  const h=hs[0];
  ctx.save();
  const g=ctx.createRadialGradient(h[0],h[1],2,h[0],h[1],46);
  g.addColorStop(0,'rgba(255,240,190,'+(.85*k)+')');g.addColorStop(.45,'rgba(255,150,50,'+(.55*k)+')');g.addColorStop(1,'rgba(255,100,30,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(h[0],h[1],46,0,6.283);ctx.fill();
  ctx.shadowColor='#ffc15a';ctx.shadowBlur=22*k;ctx.fillStyle='rgba(255,176,74,'+(.9*k)+')';
  ctx.beginPath();ctx.arc(h[0],h[1],15,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(255,243,207,'+k+')';ctx.beginPath();ctx.arc(h[0],h[1],8,0,6.283);ctx.fill();
  ctx.restore();
}
function drawClaws(hs){
  const a=R.atk;if(!a||a.kind!=='claws')return;
  const c=a.hits.filter(h=>h.k==='claw'),t0=c[0].at-.95,t1=c[c.length-1].at+.35;
  const ext=es(clamp01((a.t-t0)/.3))*(1-es(clamp01((a.t-t1)/.3)));
  if(ext<=0)return;
  hs.forEach(h=>{
    ctx.save();ctx.translate(h[0],h[1]);
    ctx.shadowColor='#ff9a3c';ctx.shadowBlur=14;
    for(let i=-2;i<=2;i++){
      const ang=Math.PI+.2+i*.3,L=(56-Math.abs(i)*6)*ext,bx=Math.cos(ang)*12,by=Math.sin(ang)*12;
      const tx=Math.cos(ang)*(12+L),ty=Math.sin(ang)*(12+L)+L*.18,nx=-Math.sin(ang)*5,ny=Math.cos(ang)*5;
      const g=ctx.createLinearGradient(bx,by,tx,ty);g.addColorStop(0,'#3a2d44');g.addColorStop(.45,'#ffb04a');g.addColorStop(1,'#fff3cf');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx+nx,by+ny);ctx.quadraticCurveTo((bx+tx)/2+nx*.4,(by+ty)/2-4,tx,ty);ctx.quadraticCurveTo((bx+tx)/2-nx*.4,(by+ty)/2+6,bx-nx,by-ny);ctx.closePath();ctx.fill();
    }
    ctx.restore();
  });
}
function drawHero3(){
  const p=R.pl,h=heroPose3(),t=R.time;
  const hf=heroFlip();if(hf){ctx.save();ctx.translate(h.x,0);ctx.scale(-1,1);ctx.translate(-h.x,0)}
  if(!h.y)ctx.fillStyle='rgba(0,0,0,.35)',ctx.beginPath(),ctx.ellipse(h.x,DECK+2,30,5,0,0,6.283),ctx.fill();
  ctx.save();ctx.translate(h.x,DECK+(h.y||0));ctx.rotate(h.rot);ctx.scale(1,h.sy);
  drawWizard({fl:0});
  qlimb([23,-78],h.hand,9,'#2a3550');ctx.fillStyle='#2a3550';ctx.beginPath();ctx.arc(23,-78,6.5,0,6.283);ctx.fill();
  ctx.save();ctx.translate(h.hand[0],h.hand[1]);ctx.rotate(h.sa);
  const c3=R.cn,hk3=c3&&(c3.k==='bat'||c3.k==='plant')?Math.max(0,1-Math.abs(c3.t-(c3.k==='bat'?.24:.32))/.16):0;
  drawScepter(76,p.s==='guard'?1:Math.max(.3,h.glow||0,hk3),p.s==='recover'?'#c9a85a':(p.s==='guard'||h.glow>0||hk3>0)?'#fff4d6':'#ffd27a');
  if(hk3>0){ctx.save();ctx.globalCompositeOperation='lighter';lanternBeam([84,0],[84+48*hk3,0],14,hk3);ctx.restore()}
  ctx.restore();
  ctx.fillStyle='#cdb69a';ctx.beginPath();ctx.arc(h.hand[0],h.hand[1],5,0,6.283);ctx.fill();
  ctx.restore();
  if(p.s==='guard'){
    const a=1-.45*p.t/R_T.guard,ramp=clamp01(p.t/.07),cx=PX+82,cy=DECK-76,rx=34*(.6+.4*ramp),ry=92*(.8+.2*ramp);
    ctx.save();ctx.globalAlpha=a*ramp;
    const g=ctx.createRadialGradient(cx-18,cy,6,cx,cy,ry);
    g.addColorStop(0,'rgba(111,211,255,.06)');g.addColorStop(.7,'rgba(111,211,255,.2)');g.addColorStop(1,'rgba(191,234,255,.5)');
    ctx.fillStyle=g;ctx.shadowColor='#6fd3ff';ctx.shadowBlur=24;
    ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,6.283);ctx.fill();
    ctx.restore();
  }
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
  }else if(a.kind==='charge'){
    for(const h of a.hits){
      const d=a.t-h.at;
      if(h.k==='stomp'&&d>-.3&&d<.35){
        const mir=!!a.h,foot=mir?R.bx+62:R.bx-62,tgt=mir?PX+10:GUARD[0],u=clamp01((d+.3)/.3),fr=foot+(tgt-foot)*u;
        ctx.save();ctx.shadowColor='#ff9a3c';ctx.shadowBlur=14;
        for(let i=0;i<10;i++){
          const x=mir?fr-i*14:fr+i*14;if(mir?x<foot:x>foot)continue;
          const hh=(30-i*2)*(d<0?1:clamp01(1-d/.35));if(hh<=0)continue;
          ctx.fillStyle='rgba(255,'+(190-i*8)+',110,'+(.95-i*.07)+')';
          ctx.beginPath();ctx.moveTo(x-6,DECK+2);ctx.lineTo(x,DECK-hh);ctx.lineTo(x+6,DECK+2);ctx.closePath();ctx.fill();
        }
        ctx.restore();
      }else if(h.k==='geyser'&&d>-.5&&d<.45){
        const x=PX+20;
        if(d<0){
          const u=1+d/.5;
          ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=16;
          ctx.fillStyle='rgba(255,140,50,'+(.25+.5*u)+')';ctx.beginPath();ctx.ellipse(x,DECK+8,20+34*u,5+5*u,0,0,6.283);ctx.fill();
          ctx.strokeStyle='rgba(255,210,120,'+(.4+.5*u)+')';ctx.lineWidth=2.5;
          for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x+i*14,DECK+4);ctx.lineTo(x+i*22,DECK+10+Math.abs(i)*3);ctx.stroke()}
          ctx.restore();
        }else{
          const k=1-d/.45;
          ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
          for(let i=0;i<7;i++){
            const ox=(i-3)*9;
            qflame(x+ox,DECK+4,14-Math.abs(i-3)*1.5,(190-Math.abs(i-3)*28)*k*(.8+.2*Math.sin(R.time*30+i)),i,i%2?'rgba(255,196,90,.95)':'rgba(255,100,40,.95)');
          }
          ctx.restore();
        }
      }
    }
  }
}
/* Contre « lumière » (grêle, griffes, pierres, cri) : le Veilleur n'a plus de batte, il utilise sa lanterne. A : nova de lumière, B : volée d'éclats, C : cloche de la lanterne */
function batFx(c){
  const t=c.t,V='B',h=heroPose3(),x=heroX3();
  const L=[x+h.hand[0]+Math.cos(h.sa)*76,DECK+(h.hand[1]+Math.sin(h.sa)*76)*h.sy],G=[R.bx-40,DECK-190];
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(V==='A'&&t>=.2&&t<.8){
    const u=clamp01((t-.2)/.47),r=30+(G[0]-L[0]+30)*es(u),al=(t<.67?1:1-(t-.67)/.13)*.8;
    const rg=ctx.createRadialGradient(L[0],L[1],r*.4,L[0],L[1],r);rg.addColorStop(0,'rgba(111,211,255,0)');rg.addColorStop(.85,'rgba(111,211,255,'+.1*al+')');rg.addColorStop(1,'rgba(235,250,255,'+.7*al+')');
    ctx.fillStyle=rg;ctx.beginPath();ctx.arc(L[0],L[1],r,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,'+al+')';ctx.lineWidth=7*(1-u*.5)+2;ctx.shadowColor='#6fd3ff';ctx.shadowBlur=22;ctx.beginPath();ctx.arc(L[0],L[1],r,0,6.283);ctx.stroke();
  }else if(V==='B'){
    for(let i=0;i<5;i++){
      const u=clamp01((t-.16-i*.08)/.3);if(u<=0||u>=1)continue;
      const off=(i-2)*46,q=lerp2(L,[G[0]+(i%2?10:-10),G[1]+(i-2)*14],es(u));q[1]-=off*Math.sin(Math.PI*u)*.9;
      for(let k=5;k>=0;k--){const uu=Math.max(0,u-k*.035),tp=lerp2(L,[G[0]+(i%2?10:-10),G[1]+(i-2)*14],es(uu));tp[1]-=off*Math.sin(Math.PI*uu)*.9;
        ctx.fillStyle='rgba('+(k?'150,220,255':'255,255,255')+','+(.8-k*.12)+')';ctx.beginPath();ctx.arc(tp[0],tp[1],7-k*.8,0,6.283);ctx.fill()}
    }
  }else if(V==='C'){
    for(let i=0;i<3;i++){
      const u=clamp01((t-.2-i*.09)/.4);if(u<=0||u>=1)continue;
      const cx=L[0]+(G[0]-L[0])*es(u),cy=L[1]+(G[1]-L[1])*es(u),r=34+36*u;
      ctx.strokeStyle='rgba(235,250,255,'+(1-u*.5)+')';ctx.lineWidth=9*(1-u*.4)+2;ctx.shadowColor='#6fd3ff';ctx.shadowBlur=18;
      ctx.beginPath();ctx.arc(cx-r*.5,cy,r,-.95,.95);ctx.stroke();
    }
  }
  ctx.restore();
}
/* Contre de la cloche : la clochette de la lanterne sonne, la grande cloche du Clocher lui répond, et l'écho étourdit le Colosse */
function bellFx(c){
  const t=c.t,h=heroPose3(),x=heroX3();
  const L=[x+h.hand[0]+Math.cos(h.sa)*76+12,DECK+(h.hand[1]+Math.sin(h.sa)*76)*h.sy+20],B=[BELL[0],BELL[1]+40],G=[R.bx-40,DECK-190];
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowColor='#6fd3ff';
  /* 1) la clochette : ondes qui montent vers la grande cloche */
  for(let i=0;i<3;i++){
    const u=clamp01((t-.12-i*.08)/.4);if(u<=0||u>=1)continue;
    const cx=L[0]+(B[0]-L[0])*es(u),cy=L[1]+(B[1]-L[1])*es(u),r=18+22*u,al=1-u*.6;
    ctx.strokeStyle='rgba(235,250,255,'+al+')';ctx.lineWidth=6*(1-u*.4)+1;ctx.shadowBlur=14;
    ctx.beginPath();ctx.arc(cx,cy,r,0,6.283);ctx.stroke();
  }
  /* 2) la grande cloche répond : écho qui part du Clocher et traverse l'arène jusqu'au Colosse */
  if(t>=.5){
    for(let i=0;i<4;i++){
      const u=clamp01((t-.5-i*.07)/.4);if(u<=0||u>=1)continue;
      const cx=B[0]+(G[0]-B[0]+40)*es(u),r=50+120*u,al=(1-u*.55)*(i?.7:1);
      ctx.strokeStyle='rgba(235,250,255,'+al+')';ctx.lineWidth=8*(1-u*.5)+1;ctx.shadowBlur=20;
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
    ctx.save();ctx.shadowColor='#bfeaff';ctx.shadowBlur=16;
    for(let i=0;i<12;i++){
      const x=fr-i*16;if(x<x0)continue;
      const h=(34-i*2.2)*(t<.8?1:clamp01(1-(t-.8)/.3));if(h<=0)continue;
      ctx.fillStyle='rgba(235,250,255,'+(.95-i*.06)+')';
      ctx.beginPath();ctx.moveTo(x-6,DECK+2);ctx.lineTo(x,DECK-h);ctx.lineTo(x+6,DECK+2);ctx.closePath();ctx.fill();
    }
    ctx.strokeStyle='rgba(235,250,255,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0,DECK+3);ctx.lineTo(fr,DECK+3);ctx.stroke();
    ctx.restore();
  }else if(c.k==='bat'){batFx(c)}
  else if(c.k==='bell'){bellFx(c)}
}
function drawHits3(){drawHits3a();drawHitsX();drawDizzy()}
/* Coup de queue (rage) : une queue enflammée se dresse derrière le Colosse, passe au-dessus de lui et frappe le sol devant le Veilleur */
function drawTail(h,d){
  if(d<-.65||d>.4)return;
  const bp=bossPose3(),cl=Math.cos(bp.lean||0),sl=Math.sin(bp.lean||0),root=[bp.x+55*cl+105*sl,DECK+(bp.dy||0)+55*sl-105*cl],rest=[R.bx+150,DECK-30],Pw=[R.bx+110,DECK-430],C=[R.bx-70,DECK-500],Pg=[GUARD[0]+10,DECK-8];
  let tip;
  if(d<-.2){tip=lerp2(rest,Pw,es(clamp01((d+.65)/.45)))}
  else if(d<0){const u=ei((d+.2)/.2),m=1-u;tip=[m*m*Pw[0]+2*m*u*C[0]+u*u*Pg[0],m*m*Pw[1]+2*m*u*C[1]+u*u*Pg[1]]}
  else tip=Pg;
  if(d>-.22&&!h.sw){h.sw=true;tone(200,.2,'sawtooth',.06,-160)}
  const fade=d<.15?1:clamp01(1-(d-.15)/.25),arc=d<-.2?70:d<0?-20:10;
  const mid=[(root[0]+tip[0])/2,(root[1]+tip[1])/2-arc-Math.abs(tip[0]-root[0])*.12];
  const pt=u=>{const m=1-u;return[m*m*root[0]+2*m*u*mid[0]+u*u*tip[0],m*m*root[1]+2*m*u*mid[1]+u*u*tip[1]]};
  ctx.save();ctx.globalAlpha=fade;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.shadowColor='#ff7a2b';ctx.shadowBlur=12;
  for(let i=0;i<20;i++){
    const u0=i/20,u1=(i+1)/20,a=pt(u0),b=pt(u1),w=36*(1-u0)+7;
    ctx.strokeStyle='#2b2233';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    ctx.strokeStyle='rgba(255,140,50,'+(.35+.5*u0)+')';ctx.lineWidth=Math.max(2,w*.35);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    if(i%3===1){ctx.fillStyle='#4a3a55';ctx.beginPath();ctx.moveTo(a[0]-w*.3,a[1]-w*.4);ctx.lineTo(a[0]-w*.1,a[1]-w*1.1);ctx.lineTo(a[0]+w*.4,a[1]-w*.4);ctx.closePath();ctx.fill()}
  }
  qflame(tip[0],tip[1]+8,12,46,2,'rgba(255,190,90,.9)');qflame(tip[0]+6,tip[1]+8,8,34,5,'rgba(255,100,40,.9)');
  ctx.restore();
}
function drawHitsX(){
  const a=R.atk;if(!a)return;
  let ri=0;
  for(const h of a.hits){
    const d=a.t-h.at;
    if(h.k==='wave')flameRow(R.bx-70,d,.5,.4,1);
    else if(h.k==='blast'){
      const gsh=a.h&&a.kind==='greatsword'&&!h.flap&&!h.pre,tl=!!h.flap;
      if(tl)drawTail(h,d);
      if(!gsh&&!tl)flameRow(R.bx-60,d,.6,.45,1.7);
      if(gsh&&d>-.25&&d<.45){
        const tx=R.bx-247,ty=DECK-6,e=clamp01((d+.25)/.7),rr=24+190*e,al=d<0?.45:.85*(1-d/.45);
        const g=ctx.createRadialGradient(tx,ty,4,tx,ty,rr);
        g.addColorStop(0,'rgba(255,245,210,'+al+')');g.addColorStop(.5,'rgba(255,150,60,'+(al*.7)+')');g.addColorStop(1,'rgba(255,90,30,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(tx,ty,rr,0,6.283);ctx.fill();
      }
      if(!gsh&&!tl&&d>-.6&&d<0){
        const u=1+d/.6,rr=60+190*u,g=ctx.createRadialGradient(R.bx-40,DECK-140,4,R.bx-40,DECK-140,rr);
        g.addColorStop(0,'rgba(255,230,150,'+(.55*u)+')');g.addColorStop(1,'rgba(255,100,30,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(R.bx-40,DECK-140,rr,0,6.283);ctx.fill();
      }
      if(d>=0&&d<.4){
        const f=1-d/.4;ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
        for(let i=-3;i<=3;i++)qflame(GUARD[0]+i*18,DECK+4,16,(150-Math.abs(i)*22)*f,i+3,i%2?'rgba(255,196,90,.95)':'rgba(255,100,40,.95)');
        ctx.restore();
      }
    }else if(h.k==='whip'&&d>-.8&&d<=-.22&&R.atk){
      /* la chaîne se déroule dans sa main au même rythme que sur son torse */
      const hv=es(R.hv||0),H0=bossPose3().hands[0].slice(),e=[H0[0]-6*hv,H0[1]+78*hv],pts=[];
      if(hv>.03){for(let i=0;i<=12;i++){const k=i/12,p=lerp2(H0,e,k);p[0]+=Math.sin(k*Math.PI)*-10*hv;pts.push(p)}
        drawHookChain(pts,.5)}
    }else if(h.k==='whip'&&d>-.22&&d<1.0){
      const H0=d<0?[R.bx-196,DECK-236]:bossPose3().hands[0].slice(),wr=h.done&&h.ok===false;
      if(h.done&&!wr&&d>.35)continue;
      if(d>=0&&!wr&&h.done===false)continue;
      const lx=heroX3()+8,leg=[lx,DECK-18],tg=[PX+8,DECK-18];
      let e;
      if(d<0)e=lerp2(H0,tg,es(clamp01((d+.22)/.22)));
      else if(wr)e=leg;
      else e=lerp2(tg,H0,es(clamp01(d/.3)));
      ctx.save();
      const sag=wr?-8:-26*(d<0?1-es(clamp01((d+.22)/.22))*.8:1),pts=[];
      for(let i=0;i<=16;i++){const k=i/16,p=lerp2(H0,e,k);p[1]+=sag*Math.sin(k*Math.PI)+Math.sin(k*6+R.time*14)*1.5;pts.push(p)}
      drawHookChain(pts,.6);
      if(wr){
        const u=es(clamp01(d/.15));
        ctx.strokeStyle='#241b2a';ctx.lineWidth=5;
        for(let c=0;c<4;c++){const y=DECK-8-c*11*u;ctx.beginPath();ctx.ellipse(lx,y,14,4,0,0,6.283);ctx.stroke()}
        ctx.strokeStyle='#7a6a82';ctx.lineWidth=1.6;ctx.setLineDash([6,5]);
        for(let c=0;c<4;c++){const y=DECK-8-c*11*u;ctx.beginPath();ctx.ellipse(lx,y,14,4,0,0,6.283);ctx.stroke()}
        ctx.setLineDash([]);
      }
      ctx.restore();
    }else if(h.k==='breath'&&d>-.17&&d<.5){
      const M=[R.bx-30,DECK-228],tg=[GUARD[0]+10,GUARD[1]],ext=d<0?es((d+.17)/.17):1,fade=d<.2?1:clamp01(1-(d-.2)/.3);
      ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=22;ctx.globalAlpha=fade;
      for(let i=0;i<14;i++){
        const k=i/13*ext,p=lerp2(M,tg,k),w=10+26*k;
        ctx.fillStyle=i%2?'rgba(255,200,90,.55)':'rgba(255,110,40,.55)';ctx.beginPath();ctx.arc(p[0],p[1],w*.8,0,6.283);ctx.fill();
        qflame(p[0],p[1]+w*.3,w,34+30*k,i,i%2?'rgba(255,200,90,.9)':'rgba(255,100,40,.9)');
      }
      ctx.restore();
    }else if(h.k==='claw'&&d>=0&&d<.35){
      const f=1-d/.35;
      ctx.save();ctx.lineCap='round';ctx.shadowColor='#ffc15a';ctx.shadowBlur=14;ctx.strokeStyle='rgba(255,215,130,'+f+')';ctx.lineWidth=6*f+1;
      for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(GUARD[0]+10+i*20,GUARD[1]-70);ctx.lineTo(GUARD[0]-40+i*20,GUARD[1]+66);ctx.stroke()}
      ctx.restore();
    }else if(h.k==='fire'&&d>-.7&&d<.1){
      const M=[R.bx-30,DECK-228],tg=[GUARD[0]+10,GUARD[1]],u=clamp01((d+.45)/.45);
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
    const g=ctx.createRadialGradient(R.bx-20,10,6,R.bx-20,10,170);g.addColorStop(0,'rgba(220,240,255,'+(.9*k)+')');g.addColorStop(1,'rgba(111,211,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(R.bx-20,10,170,0,6.283);ctx.fill();
  }
  if(t>=.25&&t<1.35){
    const al=t<1.0?clamp01((t-.25)/.15):clamp01(1-(t-1.0)/.35),u=es(clamp01((t-.25)/.35)),e=lerp2(tip,sky,u);
    ctx.save();ctx.globalAlpha=al;ctx.shadowColor='#bfeaff';ctx.shadowBlur=26;ctx.lineCap='round';
    ctx.strokeStyle='rgba(111,211,255,.4)';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(e[0],e[1]);ctx.stroke();
    ctx.strokeStyle='rgba(235,250,255,.95)';ctx.lineWidth=6;ctx.stroke();
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
  if(!prefs.help||R.mode!=='play')return;
  const a=R.atk,p=R.pl;
  if(a&&p.s!=='counter'){
    const h=a.hits.find(x=>!x.done);
    if(h){
      const tt=h.at-a.t;
      if(!DIFF.easy){if(tt>0&&tt<=R_T.guard+HINT_LEAD)hintBar(PX,DECK-206,tt<=R_T.guard?tt/R_T.guard:1-(tt-R_T.guard)/HINT_LEAD,tt<=R_T.guard)}
      else if(tt<=R_T.guard&&tt>0){
        ctx.strokeStyle='rgba(111,211,255,.9)';ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(GUARD[0],GUARD[1],60-20*(1-tt/R_T.guard),0,6.283);ctx.stroke();
      }
    }
  }
  if(p.s==='recover'){
    ctx.strokeStyle='rgba(166,154,147,.8)';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(PX,DECK-130,24,-1.57,-1.57+6.283*(p.t/R_T.rec));ctx.stroke();
  }
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
  {const k=R.mode==='finale'?clamp01((R.fin.t-FIN.bell)/1.4):0;
   if(k>0){
     if(OFF.width!==cv.width||OFF.height!==cv.height){OFF.width=cv.width;OFF.height=cv.height}
     const main=ctx;OFFX.setTransform(1,0,0,1,0,0);OFFX.clearRect(0,0,OFF.width,OFF.height);OFFX.setTransform(main.getTransform());
     ctx=OFFX;try{drawBoss3()}finally{ctx=main}
     main.save();main.setTransform(1,0,0,1,0,0);main.filter='grayscale('+k+') brightness('+(1-.4*k)+')';main.drawImage(OFF,0,0);main.filter='none';main.restore();
   }else drawBoss3()}
  drawFallWings();drawFinFx();
  if(R.mode==='finale'&&R.fin.t<.4)drawBolt(R.bx-20,-10,DECK-260,1-R.fin.t/.4,true);
  drawHits3();
  drawHero3();
  if(R.mode==='finale'){const ft=R.fin.t,a0=FIN.hero-1.0;if(ft>=a0&&ft<FIN.hero-.3){const h=heroPose3(),L=[h.x+h.hand[0]+Math.cos(h.sa)*76,DECK+(h.y||0)+h.hand[1]+Math.sin(h.sa)*76],u=es(clamp01((ft-a0)/.4)),al=ft<FIN.hero-.5?1:clamp01((FIN.hero-.3-ft)/.2);lanternBeam(L,lerp2(L,[150,DECK-76],u),12,al)}}
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
  if(R.mode==='flee')fade=clamp01((R.fl.t-FLEE.fade)/1);
  if(R.mode==='fake')fade=1;
  if(fade>0){ctx.fillStyle='rgba(0,0,0,'+fade+')';ctx.fillRect(0,0,W,H)}
}

/* ---------- navigation entre phases ---------- */
const CARD1={get eye(){return _('Phase I · The Bridge','Phase I · Le pont')},get title(){return _('The last watch.','La dernière veille.')},
  get desc(){return _("The Colossus has reached the bridge. Behind the Watcher lies nothing but the road to the valleys. A single rule: not one step back.","Le Colosse a atteint le pont. Derrière le Veilleur, il n'y a plus que la route des vallées. Une seule règle : ne pas reculer d'un pas.")},
  get go(){return _('Start','Commencer')}};
function goPhase(n){
  pendingLore=false; // une carte de lore laissée ouverte ne doit pas avaler le bouton « Commencer » suivant
  el.go2.hidden=true;hideMenu();el.ov.classList.remove('clear');
  if(n===1){
    R=null;Q=null;setPhaseUI(1);newGame();lastP=-1;lastB=-1;hud();
    el.eye.textContent=CARD1.eye;el.title.textContent=CARD1.title;el.desc.textContent=CARD1.desc;el.go.textContent=CARD1.go;
    el.stats.hidden=true;el.ov.hidden=false;
    say(_('Phase I.','Phase I.'));
    if(RUN.on)start();
  }else if(n===2){beginP2()}
  else{beginP3()}
}
document.querySelectorAll('#phases button').forEach(b=>b.addEventListener('click',()=>{
  goPhase(+b.dataset.ph);b.blur();
  try{if(!el.ov.hidden)el.go.focus({preventScroll:true})}catch(e){}
}));

/* ---------- input ---------- */
cv.addEventListener('pointerdown',e=>{e.preventDefault();press()});
el.ward.addEventListener('pointerdown',e=>{e.preventDefault();press()});
el.ward.addEventListener('click',e=>{if(e.detail===0)press()});
el.go.addEventListener('click',start);
el.help.addEventListener('change',()=>{prefs.help=el.help.checked});
el.snd.addEventListener('change',()=>{prefs.sound=el.snd.checked;if(prefs.sound)ensureAudio()});
$('optMus').addEventListener('change',()=>{prefs.music=$('optMus').checked;if(prefs.music)ensureAudio()});
const pauseEl=$('pause');
const menuEl=$('menu');
function setPause(on){
  if(on){if(paused||!el.ov.hidden)return;paused=true;pauseEl.hidden=false;try{$('pResume').focus({preventScroll:true})}catch(e){}}
  else{pauseEl.hidden=true;paused=false;if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}
}
$('pResume').addEventListener('click',()=>setPause(false));
$('pMenu').addEventListener('click',()=>{pauseEl.hidden=true;showMenu(true)});
$('pauseBtn').addEventListener('click',e=>{setPause(true);e.currentTarget.blur()});
/* Épreuve : Réessayer = abandonner la run (compte comme une défaite), avec confirmation pour éviter les faux appuis. */
let abandonT=0,abandonTm=0;
function resetRetryLabel(){abandonT=0;clearTimeout(abandonTm);try{$('retryBtn').textContent=_('Retry','Réessayer')}catch(e){}}
function abandonRun(){
  if(abandonT){resetRetryLabel();restartRun();return}
  abandonT=1;$('retryBtn').textContent=_('Give up?','Abandonner ?');
  say(_('Press Retry again to give up the run and start over from Phase I.','Rappuie sur Réessayer pour abandonner la run et repartir de la phase I.'));
  abandonTm=setTimeout(resetRetryLabel,3000);
}
/* Réessayer : relance la phase en cours, sans carte ni lore. */
function retryPhase(){
  if(!menuEl.hidden)return;
  if(RUN.on){abandonRun();return}
  pendingLore=false;pauseEl.hidden=true;paused=false;el.ov.hidden=true;el.go2.hidden=true;el.ov.classList.remove('clear');
  ensureAudio();
  if(R)beginP3(true);
  else if(Q)beginP2(true);
  else{newGame();G.mode='play';G.boss.wait=1.2;lastP=lastB=-1;hud();say(_('Phase I. New attempt.','Phase I. Nouvel essai.'))}
}
$('retryBtn').addEventListener('click',e=>{e.currentTarget.blur();retryPhase()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true)});
/* Plein écran : API standard (ou préfixée Safari) ; bouton masqué si indisponible (iPhone). */
{const de=document.documentElement,rq=de.requestFullscreen||de.webkitRequestFullscreen,ex=document.exitFullscreen||document.webkitExitFullscreen,
  isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement),
  btns=document.querySelectorAll('.fsb');
 if(!rq){btns.forEach(b=>b.hidden=true)}
 else btns.forEach(b=>b.addEventListener('click',e=>{e.currentTarget.blur();try{const r=isFs()?ex.call(document):rq.call(de);if(r&&r.catch)r.catch(()=>{})}catch(x){}}));
}
function showMenu(fromGame){
  $('ovTable').hidden=true;paused=true;pauseEl.hidden=true;menuEl.hidden=false;el.ov.classList.remove('clear');
  $('mphM').hidden=false;$('mphT').hidden=true;$('trialNote').hidden=true;
  $('mResume').hidden=!fromGame;
  try{(fromGame?$('mResume'):document.querySelector('#menu [data-diff=normal]')).focus({preventScroll:true})}catch(e){}
}
function hideMenu(){paused=false;menuEl.hidden=true;pauseEl.hidden=true}
$('mResume').addEventListener('click',()=>{hideMenu();try{if(!el.ov.hidden)el.go.focus({preventScroll:true})}catch(e){}});
(function(){const sv=document.querySelector('.mscene');function fit(){const r=innerWidth/innerHeight;sv.setAttribute('preserveAspectRatio',r<1.2?'xMidYMax meet':'xMidYMax slice')}fit();addEventListener('resize',fit)})();
(function(){const w=$('mEmbers');for(let i=0;i<26;i++){const e=document.createElement('i');e.className='mem';e.style.left=(Math.random()*100)+'%';e.style.setProperty('--dx',((Math.random()-.5)*160)+'px');e.style.animationDuration=(5+Math.random()*7)+'s';e.style.animationDelay=(-Math.random()*10)+'s';const z=2+Math.random()*3;e.style.width=e.style.height=z+'px';w.appendChild(e)}})();
/* Épreuve du feu : Normal jouable, Difficile en attente de la phase III Difficile. */
const BASEW={barrier:T.barrier,flwin:T.flwin,dodge:DG.act,guard:R_T.guard,breath:BRW,rec:T.recovery,drec:DG.rec,rrec:R_T.rec};
const BASET=Object.assign({},T);
function restartRun(){
  RUN.n++;RUN.t=0;RUN.pt=[0,0,0];RUN.st={};resetRetryLabel();
  RUN.cur=RUN.max;pendingLore=false;pauseEl.hidden=true;paused=false;el.ov.hidden=true;
  goPhase(1);
}
function applyDiff(name){
  const d=DIFFS[name]||DIFFS.normal,m=d.m,fm=d.fm||m,rm=d.rm||1;
  DIFF=d;RUN.on=!!d.trial;RUN.max=d.php;RUN.cur=d.php;RUN.n=1;RUN.t=0;RUN.pt=[0,0,0];RUN.st={};RUN.name=name;resetRetryLabel();try{$('retryBtn').disabled=false;$('phases').style.display=RUN.on?'none':''}catch(e){}Object.assign(T,BASET,d.t||{});
  T.barrier=BASEW.barrier*m;T.flwin=BASEW.flwin*fm;DG.act=BASEW.dodge*m;R_T.guard=BASEW.guard*m;BRW=BASEW.breath*fm;
  T.recovery=BASEW.rec*rm;DG.rec=BASEW.drec*rm;R_T.rec=BASEW.rrec*rm;
  document.querySelectorAll('#phases button').forEach((b,i)=>{b.disabled=!!d.trial;b.title=d.trial?_('Not available in the trial','Indisponible dans l\'épreuve'):''});
  lastP=lastB=-1;
  prefs.help=el.help.checked=false;deaths=0;tries=[0,0,0,0];cntS=null;
  el.help.closest('label').hidden=!!d.noHelp;
}
function trialMenu(on){updBest();$('mphM').hidden=on;$('mphT').hidden=!on;$('trialNote').hidden=!on;try{(on?$('mphT').querySelector('button'):$('mphM').querySelector('[data-diff=normal]')).focus({preventScroll:true})}catch(e){}}
$('mBackT').addEventListener('click',()=>trialMenu(false));
document.querySelectorAll('#menu .mph button').forEach(b=>b.addEventListener('click',()=>{
  if(b.disabled||!b.dataset.diff)return;
  if(b.dataset.diff==='trial'&&!endSeen()){b.blur();return} /* verrouillée : aucun message, le cadenas suffit */
  if(b.dataset.diff==='trial'){trialMenu(true);return}
  applyDiff(b.dataset.diff);
  document.querySelectorAll('#menu .mph button').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));
  ensureAudio();
  if(CINE.seen())goPhase(1);else CINE.play(()=>goPhase(1));
}));
$('menuBtn').addEventListener('click',e=>{showMenu(true);e.currentTarget.blur()});
window.addEventListener('keydown',e=>{
  if(e.repeat)return;
  if(!$('gate').hidden)return; /* écran de démarrage : seul le bouton agit */
  const k=e.key;
  if(document.activeElement&&document.activeElement.tagName==='INPUT')return;
  if((k==='r'||k==='R')&&menuEl.hidden&&el.ov.hidden){e.preventDefault();retryPhase();return}
  if((k==='p'||k==='P'||k==='Escape')&&menuEl.hidden){e.preventDefault();setPause(pauseEl.hidden);return}
  if(!pauseEl.hidden){if((k===' '||k==='Enter')&&document.activeElement!==$('pMenu')){e.preventDefault();setPause(false)}return}
  if(!menuEl.hidden){
    if((k===' '||k==='Enter')&&!menuEl.contains(document.activeElement)){e.preventDefault();document.querySelector('#menu [data-diff=normal]').click()}
    return;
  }
  if(!el.ov.hidden){
    if((k===' '||k==='Enter')&&document.activeElement!==el.go){e.preventDefault();el.go.click()}
    return;
  }
  if(k===' '||k==='Spacebar'||k==='ArrowUp'||k==='w'||k==='W'||k==='z'||k==='Z'){e.preventDefault();press()}
});



/* ---------- musique (générée en direct, aucun fichier audio) ---------- */
const mtof=m=>440*Math.pow(2,(m-69)/12);
const MCH=[{r:38,t:[50,53,57]},{r:34,t:[58,62,65]},{r:41,t:[53,57,60]},{r:36,t:[55,60,64]}]; /* ré mineur : Dm · Sib · Fa · Do */
const MLEAD=[[74,0,69,72,74,77,76,74],[74,0,70,74,77,76,74,70],[72,0,69,72,77,76,72,69],[67,0,72,76,79,0,76,72]];
/* Phase III : autre progression (Dm · Sib · Gm · La) et autre thème, plus tragique, avec un cor en contre-chant. */
const MCH3=[{r:38,t:[50,53,57]},{r:34,t:[58,62,65]},{r:31,t:[55,58,62]},{r:33,t:[57,61,64]}];
const MLEAD3=[[69,0,74,77,76,74,72,74],[70,74,77,74,79,77,74,70],[70,0,74,79,77,74,70,67],[69,73,76,0,79,76,73,69]];
const MHORN3=[[62,65],[65,62],[62,67],[64,61]];
function mVoice(c,dst,t,f,d,type,v,o){
  o=o||{};
  const os=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter(),a=o.a||.01;
  os.type=type;os.frequency.setValueAtTime(f,t);
  if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(20,f+o.slide),t+d);
  if(o.det)os.detune.value=o.det;
  fl.type='lowpass';fl.frequency.value=o.lp||2000;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);
  g.gain.setValueAtTime(v,t+Math.max(a,d*(o.sus||0)));g.gain.exponentialRampToValueAtTime(.0001,t+d);
  os.connect(fl);fl.connect(g);g.connect(dst);os.start(t);os.stop(t+d+.05);
}
/* Chœur synthétique : dents de scie désaccordées passées dans des filtres de voyelle (« aah » / « ooh »), avec vibrato. */
function mChoir(c,dst,t,f,d,v,vowel){
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.7,d*.4));g.gain.setValueAtTime(v,t+d*.72);g.gain.exponentialRampToValueAtTime(.0001,t+d);g.connect(dst);
  const fm=vowel==='o'?[[330,1],[820,.45]]:[[720,1],[1150,.6],[2600,.14]];
  (vowel==='a'?[-8,8]:[-10,0,10]).forEach(dt=>{
    const os=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain();
    os.type='sawtooth';os.frequency.value=f;os.detune.value=dt;
    lfo.frequency.value=5+Math.random();lg.gain.value=f*.008;lfo.connect(lg);lg.connect(os.frequency);
    fm.forEach(([ff,q])=>{const bp=c.createBiquadFilter(),og=c.createGain();bp.type='bandpass';bp.frequency.value=ff;bp.Q.value=5;og.gain.value=q;os.connect(bp);bp.connect(og);og.connect(g)});
    os.start(t);os.stop(t+d+.05);lfo.start(t);lfo.stop(t+d+.05);
  });
}
function mNoise(c,dst,t,d,v,f0,f1){
  if(!c.__nb){const b=c.createBuffer(1,c.sampleRate,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;c.__nb=b}
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  src.buffer=c.__nb;src.loop=true;f.type='bandpass';f.Q.value=.8;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  src.connect(f);f.connect(g);g.connect(dst);src.start(t);src.stop(t+d+.05);
}
function mDrum(c,dst,t,big){
  mVoice(c,dst,t,big?78:100,big?.55:.3,'sine',big?.36:.2,{slide:-48,lp:400});
  mNoise(c,dst,t,big?.3:.18,big?.2:.1,big?700:900,big?90:140);
}
function musStep(c,dst,t,s,lvl,bpm){
  const bar=Math.floor(s/8)%8,pos=s%8,ci=Math.floor(bar/2),ch=(lvl>=3?MCH3:MCH)[ci],e=60/bpm/2,bl=e*8;
  /* percussions de guerre */
  if(pos===0)mDrum(c,dst,t,true);
  if(pos===4)mDrum(c,dst,t,false);
  if(lvl>=2&&(pos===2||pos===6))mVoice(c,dst,t,150,.18,'sine',.1,{slide:-60,lp:500});
  if(lvl>=3&&(pos===5||pos===7))mVoice(c,dst,t,130,.15,'sine',.09,{slide:-50,lp:500});
  if(lvl>=4){ /* seconde partie de la phase III : le Colosse a tout récupéré, la musique s'emballe */
    if(pos===1||pos===3)mVoice(c,dst,t,140,.15,'sine',.1,{slide:-55,lp:500});
    if(pos===4)mNoise(c,dst,t,.14,.13,1600,600);
    if(pos===0||pos===4)mDrum(c,dst,t+e*.5,false);
  }
  if(lvl>=5){ /* approche de la fin : le Colosse enragé après avoir tout récupéré, tout devient héroïque */
    if(pos===0){mDrum(c,dst,t,true);if(bar%4===0)mNoise(c,dst,t,1.3,.12,3000,400)}
    if(pos===2||pos===6)mDrum(c,dst,t,false);
    if(pos===0)ch.t.forEach(n=>mVoice(c,dst,t,mtof(n),bl*.98,'sawtooth',.018,{a:.3,lp:1100,sus:.8})); /* chœur de cuivres */
    if(pos%2===0)mVoice(c,dst,t,mtof(ch.r+12),e*1.5,'sawtooth',.035,{lp:420});
    const m5=MLEAD3[ci][(bar%2)*4+pos/2];
    if(pos%2===0&&m5){mVoice(c,dst,t,mtof(m5-12),e*3.4,'sawtooth',.022,{a:.03,lp:1800,sus:.3});mVoice(c,dst,t,mtof(m5-5),e*3.4,'sawtooth',.016,{a:.03,lp:1800,sus:.3})}
    if(pos===4)ch.t.forEach(n=>mVoice(c,dst,t,mtof(n+12),.6,'sawtooth',.024,{lp:1700,a:.012}));
    /* chœur : accord tenu (hommes « ooh », voix « aah ») + chant sur la mélodie */
    if(pos===0){ch.t.forEach((n,i)=>mChoir(c,dst,t,mtof(n+(i?12:0)),bl*.98,.1,'o'));mChoir(c,dst,t,mtof(ch.r+12),bl*.98,.12,'o')}
    if(pos%4===0&&m5)mChoir(c,dst,t,mtof(m5),e*3.8,.09,'o');
  }
  if(lvl>=6){ /* dernière rage : encore plus épique, tambours serrés, lead doublé à l'octave, quinte aux cuivres */
    if(pos%2===1)mDrum(c,dst,t,false);
    if(pos===0&&bar%2===0)mNoise(c,dst,t,.9,.14,3500,500);
    if(pos===0)ch.t.forEach(n=>mVoice(c,dst,t,mtof(n+7),bl*.98,'sawtooth',.016,{a:.25,lp:1300,sus:.8}));
    const m6=MLEAD3[ci][(bar%2)*4+pos/2];
    if(pos%2===0&&m6)mVoice(c,dst,t,mtof(m6+12),e*3,'square',.014,{a:.02,lp:2800,sus:.3});
    if(pos===0)ch.t.forEach((n,i)=>mChoir(c,dst,t,mtof(n+12+(i?7:0)),bl*.98,.07,'o'));
    if(pos%2===0&&m6)mChoir(c,dst,t,mtof(m6),e*3.8,.1,'a'); /* voix « aah » sur la mélodie */
    if(pos===0)mChoir(c,dst,t,mtof(ch.t[2]+12),bl*.98,.06,'a'); /* note tenue au-dessus de l'accord */
    {const gal=[0,1,2,1][pos%4];mVoice(c,dst,t,mtof(ch.t[gal]),e*.7,'sawtooth',.02,{lp:1600,a:.004});if(pos%2===0)mVoice(c,dst,t,mtof(ch.t[gal]+12),e*.7,'sawtooth',.012,{lp:2200,a:.004})} /* cordes galopantes */
  }
  /* basse */
  if(pos===0)mVoice(c,dst,t,mtof(ch.r),bl*.98,'sawtooth',.075,{a:.05,lp:230,sus:.8});
  if(lvl>=2&&(pos%2===0||lvl>=4)&&pos!==0)mVoice(c,dst,t,mtof(ch.r),e*1.6,'sawtooth',.045,{lp:260});
  /* nappe de cordes */
  if(pos===0&&bar%2===0)ch.t.forEach(n=>[-8,8].forEach(dt=>mVoice(c,dst,t,mtof(n),bl*2,'sawtooth',.011,{a:.9,lp:850,det:dt,sus:.9})));
  /* arpège */
  const ar=lvl>=2?[0,1,2,1,2,1,0,1][pos]:[0,1,2,1][pos>>1];
  if(lvl>=2||pos%2===0)mVoice(c,dst,t,mtof(ch.t[ar]+12),e*1.4,'square',.022,{lp:1700,a:.005});
  /* mélodie */
  if(pos%2===0){
    const m=(lvl>=3?MLEAD3:MLEAD)[ci][(bar%2)*4+pos/2];
    if(m)mVoice(c,dst,t,mtof(m),e*3.4,lvl>=2?'sawtooth':'triangle',lvl>=2?.026:.05,{a:.03,lp:2300,sus:.3});
  }
  /* cor en contre-chant (phase III) */
  if(lvl>=3&&pos===0)mVoice(c,dst,t,mtof(MHORN3[ci][bar%2]),bl*.96,'sawtooth',.03,{a:.12,lp:850,sus:.7});
  /* coups de cuivres */
  if(lvl>=3&&pos===0&&(bar%4===0||lvl>=4))ch.t.forEach(n=>mVoice(c,dst,t,mtof(n+12),.8,'sawtooth',.026,{lp:1800,a:.012}));
}
/* Ambiance sombre du menu : bourdon grave, nappe mineure, cloches lointaines, battement sourd. */
const MAMB=[{r:26,t:[50,53,57],b:[74,77,81]},{r:22,t:[46,50,53],b:[70,74,77]},{r:31,t:[43,46,50],b:[67,70,74]},{r:33,t:[45,49,52],b:[73,76,81]}];
function menuStep(c,dst,t,s){
  const ch=MAMB[s%4],L=4;
  mVoice(c,dst,t,mtof(ch.r),L*2.2,'sawtooth',.05,{a:1.6,lp:140,sus:.7});
  mVoice(c,dst,t,mtof(ch.r),L*2.2,'sine',.09,{a:1.2,lp:200,sus:.7});
  ch.t.forEach(n=>[-9,9].forEach(dt=>mVoice(c,dst,t,mtof(n),L*2.4,'sawtooth',.008,{a:2,lp:650,det:dt,sus:.7})));
  mNoise(c,dst,t,L*1.8,.03,260,520);
  mVoice(c,dst,t+.2,52,1.1,'sine',.12,{slide:-18,lp:200}); /* battement sourd */
  mVoice(c,dst,t+1.15,52,.9,'sine',.07,{slide:-18,lp:200});
  const k=2+Math.floor(Math.random()*2);
  for(let i=0;i<k;i++){const m=ch.b[Math.floor(Math.random()*3)],tt=t+.8+Math.random()*(L-1.2);
    mVoice(c,dst,tt,mtof(m-24),4,'sine',.05,{a:.6,lp:700,sus:.3});mVoice(c,dst,tt,mtof(m-36),4.5,'sine',.06,{a:.8,lp:400,sus:.3})}
}
/* Finale (phase III) : les ailes brisées, le coup ultime, le Colosse terrassé puis pétrifié par la cloche. Partition calée sur FIN (secondes). */
function finaleScore(c,dst,t0,now){
  const ev=(t,fn)=>{if(t0+t>=now-.02)fn(t0+t)};
  const big=(t)=>ev(t,x=>mDrum(c,dst,x,true)),sm=(t)=>ev(t,x=>mDrum(c,dst,x,false));
  /* montée : bourdon, cordes qui enflent, roulement de timbales */
  ev(0,x=>{mVoice(c,dst,x,mtof(26),5,'sawtooth',.06,{a:1.2,lp:200,sus:.8});[50,57,62].forEach(n=>[-9,9].forEach(dt=>mVoice(c,dst,x,mtof(n),1.9,'sawtooth',.014,{a:1.6,lp:900,det:dt,sus:.9})))});
  [0,.5,.9,1.15,1.3].forEach(sm);
  /* la masse levée, la cloche répond (1,35 s) puis l'arme est arrachée (1,55 s) */
  ev(1.35,x=>[62,69,74].forEach(n=>[-7,7].forEach(dt=>mVoice(c,dst,x,mtof(n),1.2,'triangle',.02,{a:.05,lp:1800,det:dt,sus:.6}))));
  big(1.55);ev(1.55,x=>{mNoise(c,dst,x,.5,.18,3000,300);mVoice(c,dst,x,mtof(38),.9,'sine',.12,{slide:-14,lp:260,a:.02})});
  [1.9,2.05].forEach(sm);
  /* les deux ailes brisées (un tir de lanterne chacune) */
  [2.3,3.0].forEach(t=>{big(t);ev(t,x=>[50,53,57].forEach(n=>mVoice(c,dst,x,mtof(n+12),.9,'sawtooth',.04,{lp:1500,a:.01})))});
  ev(1.75,x=>[50,57,62].forEach(n=>[-9,9].forEach(dt=>mVoice(c,dst,x,mtof(n),2.0,'sawtooth',.014,{a:1.4,lp:900,det:dt,sus:.9}))));
  [2.65,2.8].forEach(sm);
  /* la charge */
  ev(3.5,x=>mVoice(c,dst,x,150,.95,'sawtooth',.05,{slide:480,lp:2600,a:.3,sus:.8}));
  [3.5,3.7,3.9,4.05,4.2,4.3].forEach(sm);
  /* le coup fatal */
  big(4.6);big(4.6);
  ev(4.6,x=>{mNoise(c,dst,x,1.3,.25,3000,200);[38,45,50,54,57].forEach(n=>mVoice(c,dst,x,mtof(n+12),2.6,'sawtooth',.036,{lp:2000,a:.02}));mVoice(c,dst,x,mtof(26),3,'sine',.16,{lp:200,a:.02})});
  [5.1,5.7,6.3].forEach(sm);
  ev(4.8,x=>[50,53,57].forEach(n=>[-8,8].forEach(dt=>mVoice(c,dst,x,mtof(n),2.4,'sawtooth',.012,{a:.9,lp:900,det:dt,sus:.9}))));
  /* l'effondrement, puis l'élégie */
  big(6.9);ev(6.9,x=>mVoice(c,dst,x,mtof(38),1.6,'sine',.15,{slide:-22,lp:200,a:.02}));
  ev(6.9,x=>[58,62,65].forEach(n=>[-7,7].forEach(dt=>mVoice(c,dst,x,mtof(n),3.3,'sawtooth',.01,{a:.9,lp:800,det:dt,sus:.9}))));
  [[7.2,74,1.3],[8.2,72,1.2],[9.0,69,1.3],[9.9,62,3]].forEach(([t,m,d])=>ev(t,x=>mVoice(c,dst,x,mtof(m),d,'triangle',.045,{a:.12,lp:1300,sus:.4})));
  [7.5,8.6,9.8].forEach(t=>ev(t,x=>mVoice(c,dst,x,52,1,'sine',.1,{slide:-18,lp:200})));
  ev(10,x=>{[50,53,57].forEach(n=>[-6,6].forEach(dt=>mVoice(c,dst,x,mtof(n),3.6,'sawtooth',.01,{a:.8,lp:700,det:dt,sus:.8})));mVoice(c,dst,x,mtof(26),3.6,'sine',.1,{a:.6,lp:200,sus:.7})});
}
/* Fin du chapitre (outro puis carte de fin) : paix et espoir. Ré majeur, boucle de 8 mesures (Ré · La · Si mineur · Sol · Ré · La · Sol · La),
   un thème qui monte doucement au piano, une harpe qui berce, une nappe de cordes et un chœur très doux, avec un écho. */
const MSP=[
  {r:38,t:[54,57,62],m:[66,69,74,0]},{r:33,t:[52,57,61],m:[73,0,69,71]},
  {r:35,t:[54,59,62],m:[71,74,73,71]},{r:31,t:[55,59,62],m:[67,71,74,0]},
  {r:38,t:[54,57,62],m:[69,74,76,74]},{r:33,t:[52,57,61],m:[73,0,76,73]},
  {r:31,t:[55,59,62],m:[74,71,67,71]},{r:33,t:[52,57,61],m:[69,0,73,0]}];
function spaceStep(c,dst,t,s){
  const ch=MSP[s%8],L=4;
  /* basse et nappe de cordes */
  mVoice(c,dst,t,mtof(ch.r),L*1.5,'sine',.09,{a:1,lp:300,sus:.7});
  mVoice(c,dst,t,mtof(ch.r+7),L*1.5,'sine',.035,{a:1.2,lp:300,sus:.7});
  ch.t.forEach(n=>[-5,5].forEach(dt=>mVoice(c,dst,t,mtof(n),L*1.6,'triangle',.013,{a:1.4,lp:700,det:dt,sus:.7})));
  /* chœur très doux, une mesure sur deux */
  if(s%2===0)ch.t.forEach((n,i)=>mChoir(c,dst,t,mtof(n-(i?0:0)),L*1.9,.05,'o'));
  /* houle douce : trois notes longues qui se relaient, sans attaque (pas de carillon) */
  [0,1,2].forEach((k,i)=>mVoice(c,dst,t+i*1.1,mtof(ch.t[k]-12),2.6,'triangle',.03,{a:.9,lp:500,sus:.5}));
  /* thème de violoncelle : il monte doucement, comme un espoir */
  ch.m.forEach((m,i)=>{if(!m)return;const tt=t+i;
    mVoice(c,dst,tt,mtof(m-12),1.9,'sawtooth',.03,{a:.18,lp:650,sus:.5});
    mVoice(c,dst,tt,mtof(m-12),1.9,'sine',.05,{a:.15,lp:700,sus:.5})});
}
const MUS={cur:null,t:0,s:0,ctx:null,bus:{}};
function musKind(){
  if(!prefs.sound||!prefs.music||!AC||AC.state!=='running')return null;
  if(!menuEl.hidden)return 'menu';
  if(paused)return null;
  if(R&&R.mode==='finale')return 'finale';
  if(R&&R.mode==='space')return 'space';
  const S=R||Q||G;
  return S&&(S.mode==='play'||S.mode==='intro')&&el.ov.hidden?'game':null;
}
function musTick(){
  try{
    const k=musKind();
    if(MUS.ctx!==AC){
      MUS.ctx=AC;MUS.cur=null;
      const cp=AC.createDynamicsCompressor();cp.connect(AC.destination);
      MUS.bus={};['game','menu','finale','space'].forEach(n=>{const g=AC.createGain();g.gain.value=0;g.connect(cp);MUS.bus[n]=g});
      {const sg=MUS.bus.space,d=AC.createDelay(1),fb=AC.createGain(),lp=AC.createBiquadFilter(); /* écho doux pour l'espace */
       d.delayTime.value=.6;fb.gain.value=.22;lp.type='lowpass';lp.frequency.value=800;sg.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(cp)}
    }
    if(k!==MUS.cur){
      const now=AC.currentTime;
      for(const n in MUS.bus){const g=MUS.bus[n].gain;g.cancelScheduledValues(now);g.setTargetAtTime(n===k?({menu:.4,game:.7,finale:.65,space:.45}[n]):0,now,n===k?.35:.12)}
      MUS.cur=k;MUS.t=now+.08;MUS.s=0;MUS.gt=null;
      if(k==='finale')finaleScore(AC,MUS.bus.finale,now+.05-(R.fin?R.fin.t:0),now);
    }
    if(!k)return;
    const now=AC.currentTime;
    if(k==='finale')return;
    if(k==='menu'){while(MUS.t<now+.6){menuStep(AC,MUS.bus.menu,MUS.t,MUS.s);MUS.t+=4;MUS.s++}}
    else if(k==='space'){while(MUS.t<now+.6){spaceStep(AC,MUS.bus.space,MUS.t,MUS.s);MUS.t+=4;MUS.s++}}
    else{const lvl=R?(R.healed?(R.u55?6:R.u5?5:4):3):Q?2:1,bpm=[0,100,112,124,142,150,160][lvl];
      {const gt=lvl>=6?.5:lvl>=5?.56:.7;if(MUS.gt!==gt){MUS.gt=gt;MUS.bus.game.gain.setTargetAtTime(gt,now,.3)}}
      if(R&&R.healed&&MUS.hR!==R){MUS.hR=R; /* le cri d'agonie : montée et gros coups */
        mVoice(AC,MUS.bus.game,now+.02,120,1.3,'sawtooth',.05,{slide:620,lp:2200,a:.4,sus:.8});mDrum(AC,MUS.bus.game,now+1.2,true);mDrum(AC,MUS.bus.game,now+1.2,true);mNoise(AC,MUS.bus.game,now+1.2,1,.18,2500,200)}
      if(R&&R.healed&&R.u5&&MUS.uR!==R){MUS.uR=R;
        mVoice(AC,MUS.bus.game,now+.02,100,1.4,'sawtooth',.05,{slide:700,lp:2200,a:.4,sus:.8});mDrum(AC,MUS.bus.game,now+1.3,true);mDrum(AC,MUS.bus.game,now+1.3,true);mNoise(AC,MUS.bus.game,now+1.3,1.2,.2,2500,200)}
      if(R&&R.healed&&R.u55&&MUS.vR!==R){MUS.vR=R; /* dernière rage : montée finale, tambours et choc */
        mVoice(AC,MUS.bus.game,now+.02,110,1.6,'sawtooth',.055,{slide:900,lp:2600,a:.5,sus:.8});for(let i=0;i<4;i++)mDrum(AC,MUS.bus.game,now+.9+i*.14,i>1);mDrum(AC,MUS.bus.game,now+1.5,true);mNoise(AC,MUS.bus.game,now+1.5,1.5,.22,3000,200)}
      while(MUS.t<now+.3){musStep(AC,MUS.bus.game,MUS.t,MUS.s%64,lvl,bpm);MUS.t+=60/bpm/2;MUS.s++}}
  }catch(e){}
}
setInterval(musTick,90);

/* ---------- langue ---------- */
const UIT=[
 ['#menu .mcard .eyebrow','Chapter I · Ember Bridge','Chapitre I · Ember Bridge'],
 ['#menu .mcard .tag','The Watcher faces the Ember Colossus: on the bridge, in the Foundry, then atop the Bell Tower.','Le Veilleur affronte le Colosse de braise : sur le pont, dans la Fonderie, puis au sommet du Clocher.'],
 ['#mResume','Resume','Reprendre'],
 ['#gateBtn','Start','Commencer'],
 ['#menu [data-diff=easy] b','Easy','Facile'],['#menu [data-diff=easy] span','Breathe','Respire'],
 ['#menu [data-diff=normal] b','Normal','Normal'],['#menu [data-diff=normal] span','The real fight','Le vrai combat'],
 ['#menu [data-diff=hard] b','Hard','Difficile'],['#menu [data-diff=hard] span','The Colossus unleashed','Le Colosse déchaîné'],
 
 ['#menu [data-diff=tn] b','Normal','Normal'],['#menu [data-diff=th] b','Hard','Difficile'],
 ['#mBackT b','‹ Back','‹ Retour'],['#mBackT span','Difficulties','Difficultés'],
 ['#trialNote b','Trial by Fire','Épreuve du feu'],
 ['#trialNote li:nth-child(1)','The three phases in a row, with no pause and no visual help.',"Les trois phases d'affilée, sans pause et sans aide visuelle."],
 ['#trialNote li:nth-child(2)','You recover 1 life between phases.','Tu récupères 1 PV entre les phases.'],
 ['#trialNote li:nth-child(3)','A single death sends you back to Phase I.','Une seule mort te renvoie à la phase I.'],
 ['#trialNote li:nth-child(4)','One stats table at the end of the run.',"Un seul tableau de stats à la fin de la run."],
 ['#menu .how','One button: block, dodge, parry. Space, up arrow or tap the screen. P to pause.',"Un seul bouton : bloquer, esquiver, parer. Espace, flèche haut ou toucher l'écran. P pour la pause."],
 ['.fsm span','Fullscreen','Plein écran'],['#introBtn','▶ Intro','▶ Intro'],['#outroBtn','▶ Outro','▶ Outro'],['#cineSkip','Skip ›','Passer ›'],['#pause h2','Fight paused','Combat en pause'],['#pResume','Resume','Reprendre'],
 ['#go2','Enable visual help',"Activer l'aide visuelle"],
 ['#retryBtn','Retry','Réessayer'],
 ['.hint','Space, up arrow, or tap the screen · P pause · R retry',"Espace, flèche haut, ou toucher l'écran · P pause · R réessayer"],
 ['label[for=optHelp]',' Visual help',' Aide visuelle','last'],['label[for=optSnd]',' Sound',' Son','last'],['label[for=optMus]',' Music',' Musique','last'],
 ['.bars .bar:not(.boss) > span','The Watcher ','Le Veilleur ','first'],['.bars .bar.boss > span','Ember Colossus ','Colosse de braise ','first'],
];
const UIA=[['#phases','Fight phases','Phases du combat'],['.bars','Hit points','Points de vie'],['#hpP',"The Watcher's hit points",'Points de vie du Veilleur'],['#hpB',"The Colossus's hit points",'Points de vie du Colosse'],['#menu .mph','Choose difficulty','Choisir la difficulté']];
function applyLang(){updNext();updBest();
  document.documentElement.lang=LANG;
  UIT.forEach(([sel,en,fr,node])=>{const e=document.querySelector(sel);if(!e)return;const t=_(en,fr);
    if(node==='last'){e.lastChild.textContent=t}else if(node==='first'){e.firstChild.textContent=t}else e.textContent=t});
  UIA.forEach(([sel,en,fr])=>{const e=document.querySelector(sel);if(e)e.setAttribute('aria-label',_(en,fr))});
  document.querySelectorAll('#langs button,#gateLangs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===LANG)));
  try{setPhaseUI(R?3:Q?2:1)}catch(e){}
  try{el.help.closest('label').hidden=!!(DIFF&&DIFF.noHelp)}catch(e){}
}
document.querySelectorAll('#langs button,#gateLangs button').forEach(b=>b.addEventListener('click',()=>{
  LANG=b.dataset.lang;try{localStorage.setItem('eb-lang',LANG)}catch(e){}applyLang();b.blur();
}));
applyLang();
/* ---------- boot ---------- */
buildStatic();
newGame();
hud();
el.ov.hidden=true;
showMenu(false);
/* écran de démarrage : un clic obligatoire, qui débloque le son et lance la musique du menu */
/* ---------- cinématique d'introduction (canvas dédié, passable) ---------- */
const CINE=(()=>{
  const box=$('cine'),cvs=$('cineC'),cap=$('cineCap'),sk=$('cineSkip'),cx=cvs.getContext('2d');
  const K=Math.min(2,COARSE?1.25:(window.devicePixelRatio||1));cvs.width=960*K;cvs.height=540*K;
  const P=d=>new Path2D(d);
  const BRIDGE=P('M0 455 L960 455 L960 475 L900 475 Q860 475 860 505 L860 540 L760 540 L760 505 Q760 475 720 475 L560 475 Q520 475 520 505 L520 540 L420 540 L420 505 Q420 475 380 475 L200 475 Q160 475 160 505 L160 540 L60 540 L60 505 Q60 475 0 475Z');
  const WATCH=P('M205 455 L215 392 Q205 380 213 366 Q222 354 234 366 Q242 380 232 392 L242 455Z');
  const COLOS=P('M640 455 L650 330 L615 300 L640 270 L625 215 L660 245 L690 205 L720 245 L760 215 L750 270 L785 300 L745 335 L760 455Z M655 215 L630 150 L668 200Z M745 210 L772 148 L735 198Z M615 300 L540 360 L560 372 L630 330Z M785 300 L850 270 L860 290 L790 330Z');
  const FAR=P('M0 400 L90 300 L160 350 L260 240 L350 340 L450 270 L560 350 L650 250 L760 340 L860 280 L960 360 L960 540 L0 540Z');
  const NEAR=P('M0 450 L120 380 L220 430 L340 360 L470 440 L600 370 L730 440 L850 380 L960 430 L960 540 L0 540Z');
  const VOLC=P('M-60 540 L200 340 L330 295 L420 205 L450 175 L480 155 L510 175 L540 205 L630 295 L760 340 L1020 540Z');
  const STARS=Array.from({length:110},()=>({x:rand(0,960),y:rand(0,330),r:rand(.5,1.5),p:rand(0,6.28)}));
  const EMB=Array.from({length:70},()=>({x:rand(0,960),v:rand(18,60),s:rand(1,3),p:rand(0,560),ph:rand(0,6.28)}));
  const HOUSES=[[40,60,44],[130,48,38],[215,70,52],[330,52,40],[430,64,48],[540,50,36],[640,72,54],[760,54,42],[850,66,48]];
  const CR=Array.from({length:16},(v,i)=>{let x=480+rand(-60,60),y=540;const pts=[[x,y]],a0=-Math.PI/2+rand(-1.1,1.1);let a=a0;for(let k=0;k<9;k++){a+=rand(-.5,.5);x+=Math.cos(a)*rand(40,80);y+=Math.sin(a)*rand(40,80)-10;pts.push([x,y])}return pts});
  const SC=[
    {d:6,en:'For a thousand winters, the mountain has burned beneath its stone.',fr:'Depuis mille hivers, la montagne brûle sous sa pierre.'},
    {d:7,en:'In the valleys below, the villages sleep, kept safe by a single stone bridge. Beneath its arch lies a foundry forgotten by all, even by those who keep watch.',fr:"Dans les vallées, les villages dorment, à l'abri d'un unique pont de pierre. Sous son arche dort une fonderie oubliée de tous, même de ceux qui veillent."},
    {d:7,en:'On the bridge, a lone silhouette: the Watcher, a member of an order sworn to protect the Bound Spires. His lantern lives with him.',fr:"Sur le pont, une seule silhouette : le Veilleur, membre d'un ordre qui protège les Flèches liées. Sa lanterne vit avec lui."},
    {d:7,en:'Tonight, a chain gives way beneath the mountain. The Ember Colossus climbs toward the light.',fr:"Cette nuit, une chaîne cède sous la montagne. Le Colosse de braise remonte vers la lumière."},
    {d:7,en:'If the Watcher falls, the fire will reach the villages.',fr:'Si le Veilleur tombe, le feu atteindra les villages.'}
  ];
  let st=null,seen=false; /* vue une fois (Passer ou fin) : mémorisé dans le navigateur quand c'est possible, sinon jusqu'au prochain chargement */
  try{seen=localStorage.getItem('eb-intro')==='1'}catch(e){}
  function sky(top,mid,bot){const g=cx.createLinearGradient(0,0,0,540);g.addColorStop(0,top);g.addColorStop(.6,mid);g.addColorStop(1,bot);cx.fillStyle=g;cx.fillRect(0,0,960,540)}
  function stars(t,a){cx.fillStyle='#f1e3cf';for(const s of STARS){cx.globalAlpha=a*(.35+.35*Math.sin(t*1.3+s.p));cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.283);cx.fill()}cx.globalAlpha=1}
  function embers(t,k){cx.fillStyle='#ffb060';for(const e of EMB){const y=540-((e.p+t*e.v)%580),x=e.x+Math.sin(t*.8+e.ph)*16;cx.globalAlpha=k*clamp01(Math.min(1,(540-y)/90))*clamp01(y/120+.2);cx.beginPath();cx.arc(x,y,e.s,0,6.283);cx.fill()}cx.globalAlpha=1}
  function glow(y,a,r){const g=cx.createRadialGradient(480,y,0,480,y,r);g.addColorStop(0,'rgba(255,122,43,'+a+')');g.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=g;cx.fillRect(-1500,-1500,4000,4000)}
  function cam(z,fx,fy,dx,dy){cx.translate(fx,fy);cx.scale(z,z);cx.translate(-fx+(dx||0),-fy+(dy||0))}
  function sMnt(p,t){
    cx.save();cam(1+.14*p,480,330,0,-30*p);
    sky('#08060d','#26100f','#6e2410');stars(t,1);
    cx.fillStyle='#1a0b10';cx.fill(FAR);
    glow(300,.35+.15*Math.sin(t*2),520);
    cx.fillStyle='#0d0710';cx.fill(VOLC);
    cx.save();cx.clip(VOLC);cx.strokeStyle='#ff9a3c';cx.shadowColor='#ff7a2b';cx.shadowBlur=10;
    for(let i=0;i<9;i++){cx.globalAlpha=.55+.4*Math.sin(t*1.7+i);cx.lineWidth=1.5+Math.sin(t*2+i)*.6;cx.beginPath();let x=480+(i-4)*14,y=165;cx.moveTo(x,y);for(let k=0;k<7;k++){x+=(i-4)*9+Math.sin(i*3+k*1.7)*14;y+=48;cx.lineTo(x,y)}cx.stroke()}
    cx.restore();
    const g=cx.createRadialGradient(480,158,0,480,158,90);g.addColorStop(0,'rgba(255,190,90,'+(.8+.15*Math.sin(t*3))+')');g.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=g;cx.fillRect(380,70,200,180);
    cx.fillStyle='#120810';cx.fill(NEAR);
    embers(t,1);cx.restore();
  }
  function sVal(p,t){
    cx.save();cam(1.08,480,300,-34*(p-.5),0);
    sky('#0a0710','#2a1013','#5a1e10');stars(t,.7);
    cx.save();cx.translate(-260,60);cx.scale(.6,.6);glow(300,.3,520);cx.fillStyle='#160a0f';cx.fill(VOLC);cx.restore();
    cx.fillStyle='#1b0c12';cx.fill(FAR);
    const g=cx.createLinearGradient(0,400,0,540);g.addColorStop(0,'#150a10');g.addColorStop(1,'#07050a');cx.fillStyle=g;cx.fillRect(-40,420,1040,140);
    for(const [x,w,h] of HOUSES){
      cx.fillStyle='#07050a';cx.fillRect(x,440-h+30,w,h);cx.beginPath();cx.moveTo(x-6,440-h+30);cx.lineTo(x+w/2,440-h-6+30);cx.lineTo(x+w+6,440-h+30);cx.fill();
      cx.fillStyle='rgba(255,193,90,'+(.65+.25*Math.sin(t*3+x))+')';cx.fillRect(x+w*.25,440-h*.55+30,w*.18,h*.22);cx.fillRect(x+w*.6,440-h*.55+30,w*.18,h*.22);
      cx.fillStyle='rgba(120,100,110,.25)';for(let s=0;s<4;s++){const yy=440-h-10-((t*18+s*22+x)%90)+30;cx.beginPath();cx.arc(x+w*.75+Math.sin(t+s+x)*6,yy,4+s*1.4,0,6.283);cx.fill()}
    }
    embers(t,.6);cx.restore();
  }
  function sBridge(p,t){
    cx.save();cam(1+.75*p,235,380,0,-20*p);
    sky('#08060d','#2a0f14','#7a2a10');stars(t,1);
    cx.fillStyle='rgba(241,227,207,.2)';cx.beginPath();cx.arc(170,110,34,0,6.283);cx.fill();
    cx.fillStyle='#1a0b10';cx.fill(FAR);glow(470,.75+.15*Math.sin(t*2.4),600);
    cx.fillStyle='#07050a';cx.fill(BRIDGE);
    cx.save();cx.translate(225,455);cx.transform(1,0,Math.sin(t*1.6)*.035,1,0,0);cx.translate(-225,-455);cx.fill(WATCH);cx.restore();
    cx.strokeStyle='#07050a';cx.lineWidth=4;cx.beginPath();cx.moveTo(250,455);cx.lineTo(250,334);cx.stroke();
    const k=.7+.3*Math.sin(t*3.2),g=cx.createRadialGradient(250,323,0,250,323,46*k);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(.3,'rgba(255,200,110,.45)');g.addColorStop(1,'rgba(255,190,90,0)');cx.fillStyle=g;cx.fillRect(190,263,120,120);
    cx.fillStyle='#07050a';cx.beginPath();cx.moveTo(242,314);cx.lineTo(250,306);cx.lineTo(258,314);cx.closePath();cx.fill();cx.fillRect(241,331,18,4);
    cx.fillStyle='#ffd27a';cx.fillRect(243,314,14,17);cx.fillStyle='#07050a';cx.fillRect(247,314,1.5,17);cx.fillRect(251.5,314,1.5,17);
    embers(t,1);cx.restore();
  }
  function sWake(p,t){
    cx.save();
    if(!reduce&&p>.45&&p<.7){cx.translate(rand(-5,5)*(.7-p)*4,rand(-5,5)*(.7-p)*4)}
    cam(1+.1*p,480,300);
    sky('#050308','#1a0810','#4a1608');
    glow(520,.5+.4*p,640);
    const vis=clamp01(p*1.6);
    cx.strokeStyle='#ff9a3c';cx.shadowColor='#ff7a2b';cx.shadowBlur=12;cx.lineCap='round';
    for(const c of CR){const n=Math.floor(vis*(c.length-1)),f=vis*(c.length-1)-n;cx.lineWidth=2.6;cx.globalAlpha=.9;cx.beginPath();cx.moveTo(c[0][0],c[0][1]);for(let i=1;i<=n;i++)cx.lineTo(c[i][0],c[i][1]);if(n<c.length-1){const a=c[n],b=c[n+1];cx.lineTo(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f)}cx.stroke()}
    cx.globalAlpha=1;cx.shadowBlur=0;
    const rise=es(clamp01((p-.3)/.6));
    cx.save();cx.globalAlpha=clamp01((p-.28)/.3);cx.translate(-250*1.25+0,(1-rise)*210-40);cx.scale(1.25,1.25);cx.translate(0,60);cx.fillStyle='#06040a';cx.fill(COLOS);
    cx.restore();
    const ea=clamp01((p-.5)/.12);cx.fillStyle='rgba(255,210,122,'+ea+')';cx.shadowColor='#ffb347';cx.shadowBlur=18;
    for(const ex of[690,722]){cx.beginPath();cx.ellipse((ex-250)*1.25-0,(232+60-40)*1.25-75*(1-rise)*0+(1-rise)*210-60,5.5,3.6,0,0,6.283);cx.fill()}
    cx.shadowBlur=0;embers(t,1.1);cx.restore();
    if(p>.45&&p<.62){cx.fillStyle='rgba(255,230,190,'+(.55*(1-(p-.45)/.17))+')';cx.fillRect(0,0,960,540)}
  }
  function sFace(p,t){
    cx.save();cam(1.55-.55*p,480,330);
    sky('#08060d','#2a0f14','#7a2a10');stars(t,.9);
    cx.fillStyle='rgba(241,227,207,.16)';cx.beginPath();cx.arc(170,110,34,0,6.283);cx.fill();
    cx.fillStyle='#1a0b10';cx.fill(FAR);glow(470,.75+.15*Math.sin(t*2.2),620);
    cx.fillStyle='#07050a';cx.fill(BRIDGE);cx.fill(WATCH);cx.fill(COLOS);
    cx.strokeStyle='#07050a';cx.lineWidth=4;cx.beginPath();cx.moveTo(250,455);cx.lineTo(250,334);cx.stroke();
    const k=.75+.25*Math.sin(t*3.1),g=cx.createRadialGradient(250,323,0,250,323,40*k);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(.35,'rgba(255,200,110,.45)');g.addColorStop(1,'rgba(255,190,90,0)');cx.fillStyle=g;cx.fillRect(190,263,120,120);
    cx.fillStyle='#07050a';cx.beginPath();cx.moveTo(242,314);cx.lineTo(250,306);cx.lineTo(258,314);cx.closePath();cx.fill();cx.fillRect(241,331,18,4);
    cx.fillStyle='#ffd27a';cx.fillRect(243,314,14,17);cx.fillStyle='#07050a';cx.fillRect(247,314,1.5,17);cx.fillRect(251.5,314,1.5,17);
    cx.fillStyle='#ffd27a';cx.shadowColor='#ffb347';cx.shadowBlur=16;cx.beginPath();cx.arc(690,232,4,0,6.283);cx.arc(722,232,4,0,6.283);cx.fill();cx.shadowBlur=0;
    const lg=cx.createRadialGradient(705,330,0,705,330,40);lg.addColorStop(0,'rgba(255,122,43,.5)');lg.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=lg;cx.fillRect(660,290,90,80);
    embers(t,1);cx.restore();
    const ta=clamp01((p-.5)/.25);
    if(ta>0){cx.save();cx.globalAlpha=ta;cx.textAlign='center';cx.fillStyle='#f0e8df';cx.shadowColor='rgba(255,122,43,.85)';cx.shadowBlur=30;cx.font='800 96px '+DISPLAY;cx.textAlign='left';if(cx.letterSpacing!==undefined)cx.letterSpacing='4px';const w1=cx.measureText('LUMEN').width,w2=cx.measureText('BELL').width,x0=480-(w1+w2)/2;cx.fillStyle='#ff7a2b';cx.fillText('LUMEN',x0,118);cx.fillStyle='#f0e8df';cx.fillText('BELL',x0+w1,118);cx.shadowBlur=0;cx.textAlign='center';if(cx.letterSpacing!==undefined)cx.letterSpacing='3px';cx.fillStyle='rgba(240,232,223,.88)';cx.font='700 26px '+DISPLAY;cx.fillText(_('CHAPTER I · EMBER BRIDGE','CHAPITRE I · EMBER BRIDGE'),480,160);cx.restore()}
  }
  const DRAW=[sMnt,sVal,sBridge,sWake,sFace];
  function frame(now){
    if(!st)return;
    const dt=Math.min(.1,(now-st.last)/1000);st.last=now;st.t+=dt;
    let acc=0,i=0;for(;i<SC.length;i++){if(st.t<acc+SC[i].d)break;acc+=SC[i].d}
    if(i>=SC.length){finish();return}
    const s=SC[i],lt=st.t-acc,p=lt/s.d,al=Math.min(1,lt/.8,(s.d-lt)/.8);
    if(st.i!==i){st.i=i;cap.textContent=_(s.en,s.fr);
      if(i===3)st.roar=false}
    if(i===3&&!st.roar&&p>.45){st.roar=true;boom(1.2,.12);roar()}
    if(i===2&&!st.chime&&p>.3){st.chime=true;tone(660,.9,'sine',.04,200);tone(990,1.1,'sine',.025,0)}
    cap.style.opacity=String(clamp01(Math.min(lt-.5,s.d-.5-lt)/.6));
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1;cx.fillStyle='#000';cx.fillRect(0,0,960,540);
    DRAW[i](p,st.t);
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1-al;cx.fillStyle='#000';cx.fillRect(0,0,960,540);cx.globalAlpha=1;
    st.raf=requestAnimationFrame(frame);
  }
  function finish(){
    if(!st)return;const d=st.done;cancelAnimationFrame(st.raf);st=null;box.hidden=true;
    seen=true;try{localStorage.setItem('eb-intro','1')}catch(e){}
    try{d&&d()}catch(e){}
  }
  function play(done){
    if(st)return;ensureAudio();
    sk.textContent=_('Skip ›','Passer ›');cap.textContent='';cap.style.opacity='0';
    box.hidden=false;st={t:0,i:-1,last:performance.now(),done,raf:0};
    try{sk.focus({preventScroll:true})}catch(e){}
    st.raf=requestAnimationFrame(frame);
  }
  sk.addEventListener('click',finish);
  window.addEventListener('keydown',e=>{if(!st)return;e.stopImmediatePropagation();e.preventDefault();if(e.key==='Escape'||e.key==='Enter'||e.key===' ')finish()},true);
  return{play,seen:()=>seen};
})();
$('introBtn').addEventListener('click',e=>{e.currentTarget.blur();CINE.play(()=>{})});
/* Outro de la vraie fin : le lore après la bataille, jusqu'au lien avec Silent Bells. Rejouable depuis le menu une fois débloquée. */
const OUTRO=(()=>{
  const box=$('cine'),cvs=$('cineC'),cap=$('cineCap'),sk=$('cineSkip'),cx=cvs.getContext('2d');
  let st=null;
  const STR=Array.from({length:140},()=>({x:rand(0,960),y:rand(0,330),r:rand(.4,1.8),p:rand(0,6.3)}));
  const SNW=Array.from({length:90},()=>({x:rand(0,960),y:rand(0,540),v:rand(30,80),s:rand(1,3)}));
  const BUB=Array.from({length:34},(v,i)=>({x:rand(0,960),o:rand(0,340),r:rand(1.5,4)}));
  const SC=[
    {d:9.5,en:"The great bell has fallen silent. Atop the Bell Tower, the Ember Colossus is now only a statue of black stone, kneeling before the bell. Lit by the Watcher, the beacon now keeps watch over him.",fr:"La grande cloche s'est tue. Au sommet du Clocher, le Colosse de braise n'est plus qu'une statue de pierre noire, à genoux face à la cloche. Allumé par le Veilleur, le fanal veille désormais sur lui."},
    {d:6.5,en:"In the valleys, the villages are still asleep. They will never know what was at stake that night, above their roofs.",fr:"Dans les vallées, les villages dorment encore. Ils ne sauront jamais ce qui s'est joué cette nuit au-dessus de leurs toits."},
    {d:9.5,en:"One by one, the Bound Spires answered the call. From peak to peak, their bells carried the news across the mountains, and beneath every tower, the stone trembled.",fr:"Une à une, les Flèches liées ont répondu à l'appel. De sommet en sommet, leurs cloches ont porté la nouvelle à travers les montagnes, et sous chaque tour, la pierre a tremblé."},
    {d:8,en:"Every bell answered. Every one but one. Far out at sea, the Drowned Beacon stayed silent, as if the depths had imposed silence on it.",fr:"Toutes les cloches ont répondu. Toutes, sauf une. Au large, le Phare Noyé est resté muet, comme si les profondeurs lui avaient imposé le silence."},
    {d:6,en:"At dawn, lantern in hand, the Watcher set out for the coast.",fr:"À l'aube, lanterne à la main, le Veilleur s'est mis en route vers la côte."},
    {d:7,en:"Chapter II · Silent Bells. To be continued.",fr:"Chapitre II · Silent Bells. À suivre."}
  ];
  const poly=(p,col)=>{cx.fillStyle=col;cx.beginPath();p.forEach((q,i)=>i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1]));cx.closePath();cx.fill()};
  function sky(t,top,bot,hz){const g=cx.createLinearGradient(0,0,0,hz);g.addColorStop(0,top);g.addColorStop(1,bot);cx.fillStyle=g;cx.fillRect(0,0,960,hz);for(const s of STR){if(s.y>hz-10)continue;cx.globalAlpha=.3+.6*Math.abs(Math.sin(t*.8+s.p));cx.fillStyle='#eef2ff';cx.fillRect(s.x,s.y,s.r,s.r)}cx.globalAlpha=1}
  function snow(t,a){cx.fillStyle='rgba(240,246,255,'+a+')';for(const f of SNW){const y=(f.y+t*f.v)%540,x=(f.x+Math.sin(t+f.y)*14+960)%960;cx.fillRect(x,y,f.s,f.s)}}
  function lant(x,y,s,g){cx.save();cx.translate(x,y);cx.scale(s,s);const rg=cx.createRadialGradient(0,0,1,0,0,42);rg.addColorStop(0,'rgba(255,236,180,'+(.55*g)+')');rg.addColorStop(1,'rgba(255,200,110,0)');cx.fillStyle=rg;cx.beginPath();cx.arc(0,0,42,0,6.283);cx.fill();poly([[-9,-12],[0,-20],[9,-12]],'#6b5036');cx.fillStyle='#ffd27a';cx.fillRect(-8,-12,16,22);cx.strokeStyle='#6b5036';cx.lineWidth=2;cx.strokeRect(-8,-12,16,22);cx.lineWidth=1.2;cx.beginPath();cx.moveTo(-3,-12);cx.lineTo(-3,10);cx.moveTo(3,-12);cx.lineTo(3,10);cx.stroke();cx.fillStyle='#4a3a2a';cx.fillRect(-10,10,20,4);cx.restore()}
  function watcher(x,y,s,bob){cx.save();cx.translate(x,y-bob);cx.scale(s,s);poly([[-16,-92],[-34,0],[34,0],[16,-92]],'#2a3550');cx.fillStyle='#c9b98a';cx.fillRect(-8,-88,16,82);
    for(const sx of[-1,1]){cx.fillStyle='#5d6f96';cx.beginPath();cx.ellipse(sx*15,-89,13,7,0,0,6.283);cx.fill()}
    cx.fillStyle='#5d6f96';cx.beginPath();cx.moveTo(-15,-92);cx.quadraticCurveTo(-19,-127,1,-128);cx.quadraticCurveTo(20,-127,18,-92);cx.closePath();cx.fill();cx.fillStyle='#bfeaff';cx.fillRect(-1,-109,18,5);
    cx.strokeStyle='#8a7a9a';cx.lineWidth=4;cx.beginPath();cx.moveTo(26,-2);cx.lineTo(30,-140);cx.stroke();cx.restore();lant(x+30*s,y-bob+(-152)*s,s,1)}
  function bell(x,y,s,a){cx.save();cx.translate(x,y);cx.rotate(a);cx.scale(s,s);const bg=cx.createLinearGradient(-60,0,60,0);bg.addColorStop(0,'#7a5524');bg.addColorStop(.45,'#d9a24c');bg.addColorStop(1,'#6b4a1a');cx.fillStyle=bg;cx.beginPath();cx.moveTo(-26,14);cx.quadraticCurveTo(-36,50,-60,108);cx.lineTo(60,108);cx.quadraticCurveTo(36,50,26,14);cx.closePath();cx.fill();cx.strokeStyle='rgba(255,226,150,.6)';cx.lineWidth=2;cx.beginPath();cx.moveTo(-40,84);cx.lineTo(40,84);cx.stroke();cx.restore()}
  function tower(x,top,w,lit){w*=2.2;cx.fillStyle='#141a3a';poly([[x-w/2,top],[x+w/2,top],[x+w*.75,540],[x-w*.75,540]],'#141a3a');cx.fillRect(x-w/2-3,top-4,w+6,5);poly([[x-w/2-4,top-4],[x,top-4-w*1.1],[x+w/2+4,top-4]],'#141a3a');cx.fillStyle='#0a0e24';cx.fillRect(x-w*.22,top+3,w*.44,w*.5);const r=10+22*lit,g=cx.createRadialGradient(x,top+10,1,x,top+10,r);g.addColorStop(0,'rgba(255,215,130,'+(.25+.6*lit)+')');g.addColorStop(1,'rgba(255,200,110,0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,top+10,r,0,6.283);cx.fill();cx.fillStyle=lit>.1?'#ffd27a':'#6a5a3a';cx.fillRect(x-2,top+7,4,6)}
  function sStatue(p,t){
    sky(t,'#03050f','#18204a',380);poly([[0,340],[160,290],[330,320],[520,280],[700,322],[960,300],[960,380],[0,380]],'#232c55');
    cx.save();const z=1.12-.12*p;cx.translate(480,300);cx.scale(z,z);cx.translate(-480,-300);
    cx.fillStyle='#2a2f4e';cx.beginPath();cx.moveTo(362,380);cx.lineTo(362,206);cx.quadraticCurveTo(480,100,598,206);cx.lineTo(598,380);cx.lineTo(566,380);cx.lineTo(566,218);cx.quadraticCurveTo(480,150,394,218);cx.lineTo(394,380);cx.closePath();cx.fill();
    poly([[340,184],[480,70],[620,184]],'#3c4268');cx.fillStyle='rgba(240,246,255,.85)';cx.fillRect(340,182,280,4);
    cx.fillStyle='#4a3626';cx.fillRect(390,196,180,8);bell(480,204,.8,Math.sin(t*1.6)*.06*Math.exp(-t*.25));
    cx.fillStyle='#4a5272';cx.fillRect(-60,380,1080,200);cx.fillStyle='rgba(240,246,255,.9)';cx.fillRect(-60,380,1080,5);
    /* le Colosse pétrifié, à genoux face au beffroi, la tête baissée, la main ouverte tendue avec un anneau */
    cx.save();cx.translate(720,378);cx.scale(1.05,1.05);
    const SG='#3b3a40',SL='#4a4950',SD='#2a292e';
    poly([[50,-190],[104,-262],[76,-176]],SD);poly([[40,-176],[88,-226],[62,-160]],SD);
    poly([[40,-172],[58,-150],[44,-108],[28,-118]],SD);
    poly([[-26,-30],[66,-26],[70,0],[-26,0]],SD);
    poly([[18,-112],[58,-96],[0,-14],[-30,-32]],SG);
    poly([[8,-100],[68,-100],[46,-200],[-26,-194]],SG);
    poly([[-46,-210],[-8,-216],[-4,-186],[-40,-184]],SL);poly([[-42,-208],[-64,-240],[-30,-214]],SL);poly([[-10,-214],[2,-246],[-4,-210]],SL);
    poly([[-14,-182],[0,-168],[-52,-118],[-68,-128]],SG);
    poly([[-72,-126],[-52,-112],[-58,-102],[-78,-114]],SL);
    cx.strokeStyle='#9aa0ae';cx.lineWidth=2.5;cx.beginPath();cx.arc(-66,-106,6,0,6.283);cx.stroke();
    cx.strokeStyle='#1c1b20';cx.lineWidth=2;cx.beginPath();cx.moveTo(24,-170);cx.lineTo(34,-140);cx.lineTo(24,-120);cx.moveTo(-6,-196);cx.lineTo(-2,-186);cx.stroke();
    cx.fillStyle='rgba(240,246,255,.8)';cx.fillRect(-22,-194,56,3);cx.fillRect(-44,-212,34,3);cx.fillRect(-26,-32,90,3);
    cx.fillStyle='rgba(255,140,60,'+(.12+.08*Math.sin(t*2))+')';cx.beginPath();cx.arc(24,-150,6,0,6.283);cx.fill();cx.restore();
    {const fx=250,fy=380;cx.fillStyle='#3a3f5e';cx.fillRect(fx-10,fy-64,20,64);cx.fillStyle='#4a5072';cx.fillRect(fx-14,fy-68,28,6);
     const g=cx.createRadialGradient(fx,fy-82,2,fx,fy-82,90);g.addColorStop(0,'rgba(255,214,130,.6)');g.addColorStop(1,'rgba(255,170,80,0)');cx.fillStyle=g;cx.beginPath();cx.arc(fx,fy-82,90,0,6.283);cx.fill();
     for(let i=-1;i<=1;i++){const h=24+12*Math.abs(Math.sin(t*9+i*2));cx.fillStyle=i?'rgba(255,170,70,.9)':'rgba(255,224,150,.95)';cx.beginPath();cx.moveTo(fx+i*9-7,fy-72);cx.quadraticCurveTo(fx+i*9+Math.sin(t*7+i)*3,fy-72-h*.6,fx+i*9,fy-72-h);cx.quadraticCurveTo(fx+i*9+Math.sin(t*6+i)*3,fy-72-h*.5,fx+i*9+7,fy-72);cx.closePath();cx.fill()}
     poly([[fx-22,fy-82],[fx+22,fy-82],[fx+14,fy-68],[fx-14,fy-68]],'#241b2a')}
    cx.restore();snow(t,.85)}
  function sValley(p,t){
    sky(t,'#05081c','#24305a',300);poly([[0,300],[200,240],[400,280],[600,230],[800,270],[960,250],[960,540],[0,540]],'#1b2346');poly([[0,380],[960,360],[960,540],[0,540]],'#141a36');
    cx.strokeStyle='#0c1026';cx.lineWidth=14;cx.beginPath();cx.moveTo(380,300);cx.quadraticCurveTo(480,250,580,300);cx.stroke();cx.lineWidth=6;cx.beginPath();cx.moveTo(480,262);cx.lineTo(480,300);cx.stroke();
    for(let i=0;i<14;i++){const x=120+i*55+(i%3)*8,y=410+(i%4)*22,on=Math.sin(t*.7+i*1.7)>-.6;cx.fillStyle='#0d1229';cx.fillRect(x,y,34,24);poly([[x-4,y],[x+17,y-16],[x+38,y]],'#0d1229');if(on){cx.fillStyle='rgba(255,210,120,.85)';cx.fillRect(x+12,y+8,8,8)}
      cx.fillStyle='rgba(150,160,190,.18)';for(let k=0;k<3;k++){const yy=y-18-((t*14+k*20+x)%60);cx.beginPath();cx.arc(x+28+Math.sin(t+k+x)*4,yy,3+k,0,6.283);cx.fill()}}
    cx.fillStyle='rgba(255,255,255,.12)';cx.fillRect(0,390+Math.sin(t)*2,960,1)}
  function sTowers(p,t,s){
    sky(t,'#04061a','#1c2650',330);poly([[0,330],[90,250],[170,300],[260,210],[360,290],[470,230],[560,300],[690,200],[800,290],[900,240],[960,280],[960,540],[0,540]],'#1a2148');poly([[0,420],[150,370],[300,410],[480,360],[640,400],[800,370],[960,410],[960,540],[0,540]],'#121835');
    const T=[[260,212,14],[690,202,12],[470,232,10],[900,242,9],[90,252,9],[360,292,8]];
    T.forEach((q,i)=>{const at=.5+i*.75,lit=clamp01((s-at)/.4);tower(q[0],q[1],q[2],lit);
      if(s>=at&&!st['tw'+i]){st['tw'+i]=1;tone([392,440,330,494,294,523][i],1.6,'sine',.05,0)}
      if(s>at&&s<at+2){const u=(s-at)/2;cx.strokeStyle='rgba(255,230,170,'+(1-u)+')';cx.lineWidth=2;cx.beginPath();cx.arc(q[0],q[1]+10,10+70*u,0,6.283);cx.stroke()}})}
  function sSea(p,t,s){
    const HZ=318;sky(t,'#03050f','#1c2a4a',HZ);cx.fillStyle='#eef2ff';cx.beginPath();cx.arc(200,90,16,0,6.283);cx.fill();
    const sg=cx.createLinearGradient(0,HZ,0,540);sg.addColorStop(0,'#16223e');sg.addColorStop(1,'#04070f');cx.fillStyle=sg;cx.fillRect(0,HZ,960,540-HZ);
    cx.strokeStyle='rgba(200,215,255,.1)';cx.lineWidth=1.5;for(let i=0;i<12;i++){const y=HZ+10+i*i*1.4,o=(t*(10+i*2)+i*90)%960;cx.beginPath();cx.moveTo(o-160,y);cx.lineTo(o-90,y);cx.stroke()}
    const z=1+es(clamp01(s/5))*.9;cx.save();cx.translate(640,HZ+6);cx.scale(z*1.6,z*1.6);cx.rotate(.14);poly([[-11,0],[-7,-62],[7,-62],[11,0]],'#0b1022');cx.fillStyle='#0b1022';cx.fillRect(-10,-70,20,8);poly([[-9,-70],[0,-82],[9,-70]],'#0b1022');
    const on=(Math.sin(t*2.3)>-.2?1:0)*(.35+.25*Math.sin(t*1.7));if(on){const g=cx.createRadialGradient(0,-66,1,0,-66,40);g.addColorStop(0,'rgba(140,255,230,'+(.8*on)+')');g.addColorStop(1,'rgba(80,200,220,0)');cx.fillStyle=g;cx.beginPath();cx.arc(0,-66,40,0,6.283);cx.fill()}
    cx.fillStyle=on?'#aaffeb':'#1a2440';cx.fillRect(-4,-69,8,6);cx.restore();
    /* au premier plan, depuis le Clocher, le Veilleur de dos regarde le phare */
    cx.fillStyle='#232a4a';cx.fillRect(0,470,960,70);for(let x=0;x<960;x+=110){cx.fillRect(x+14,446,58,26)}cx.fillStyle='rgba(10,14,34,.45)';for(let x=0;x<960;x+=60)cx.fillRect(x,500,2,40);cx.fillRect(0,500,960,2);cx.fillStyle='rgba(235,243,255,.55)';for(let x=0;x<960;x+=110){cx.fillRect(x+14,444,58,3)}cx.fillRect(0,468,960,3);
    {const wx=250,wy=468,c0='#070a18';cx.fillStyle=c0;cx.beginPath();cx.moveTo(wx-16,wy-92);cx.lineTo(wx-30,wy);cx.lineTo(wx+30,wy);cx.lineTo(wx+16,wy-92);cx.closePath();cx.fill();
     for(const sx of[-1,1]){cx.beginPath();cx.ellipse(wx+sx*15,wy-89,13,7,0,0,6.283);cx.fill()}
     cx.beginPath();cx.moveTo(wx-15,wy-92);cx.quadraticCurveTo(wx-18,wy-126,wx,wy-127);cx.quadraticCurveTo(wx+18,wy-126,wx+15,wy-92);cx.closePath();cx.fill();
     cx.strokeStyle=c0;cx.lineWidth=4;cx.beginPath();cx.moveTo(wx+24,wy-2);cx.lineTo(wx+30,wy-132);cx.stroke();lant(wx+31,wy-146,.85,.9+.1*Math.sin(t*3))}
    if(!st.muted&&s>3.2){st.muted=1;tone(147,2.4,'sine',.05,-20)}}
  function sDawn(p,t,s){
    const HZ=300,g=cx.createLinearGradient(0,0,0,HZ);g.addColorStop(0,'#1a2246');g.addColorStop(1,'#d9a07a');cx.fillStyle=g;cx.fillRect(0,0,960,HZ);
    cx.fillStyle='rgba(255,220,170,.6)';cx.beginPath();cx.arc(780,HZ,40+6*p,Math.PI,0);cx.fill();
    cx.fillStyle='#2a3a5a';cx.fillRect(0,HZ,960,540-HZ);cx.strokeStyle='rgba(255,220,180,.18)';cx.lineWidth=1.5;for(let i=0;i<10;i++){const y=HZ+8+i*i*2;cx.beginPath();cx.moveTo(700-i*20,y);cx.lineTo(860+i*20,y);cx.stroke()}
    cx.save();cx.translate(560,HZ+4);cx.rotate(.14);cx.fillStyle='#10182c';cx.fillRect(-5,-30,10,30);poly([[-5,-30],[0,-38],[5,-30]],'#10182c');cx.restore();
    poly([[0,400],[300,380],[520,430],[520,540],[0,540]],'#141a30');
    const x=110+es(clamp01(s/6))*300;watcher(x,400+(x-110)*.09,.8,Math.abs(Math.sin(s*6))*3)}
  function sTitle(p,t,s){
    cx.fillStyle='#02040a';cx.fillRect(0,0,960,540);const g=cx.createLinearGradient(0,200,0,540);g.addColorStop(0,'#02040a');g.addColorStop(1,'#06303a');cx.fillStyle=g;cx.fillRect(0,200,960,340);
    for(const b of BUB){const y=540-((t*30+b.o)%340);cx.fillStyle='rgba(140,255,230,.25)';cx.beginPath();cx.arc(b.x,y,b.r,0,6.283);cx.fill()}
    const yb=300+es(clamp01(s/4))*80;bell(480,yb-120,.7,Math.sin(t*.8)*.12);const k=.5+.5*Math.sin(t*2),gg=cx.createRadialGradient(480,yb,2,480,yb,120);gg.addColorStop(0,'rgba(120,255,225,'+(.25*k)+')');gg.addColorStop(1,'rgba(80,200,220,0)');cx.fillStyle=gg;cx.fillRect(300,yb-140,360,280);
    const a=clamp01((s-1)/1.5);cx.globalAlpha=a;cx.fillStyle='#e8f6ff';cx.textAlign='center';cx.font='700 22px '+DISPLAY;cx.fillText(_('LUMENBELL · CHAPTER II','LUMENBELL · CHAPITRE II'),480,118);cx.font='800 62px '+DISPLAY;cx.fillText('SILENT BELLS',480,182);cx.globalAlpha=1;cx.textAlign='start'}
  const DRAW=[sStatue,sValley,sTowers,sSea,sDawn,sTitle];
  function frame(now){
    if(!st)return;
    const dt=Math.min(.1,(now-st.last)/1000);st.last=now;st.t+=dt;
    let acc=0,i=0;for(;i<SC.length;i++){if(st.t<acc+SC[i].d)break;acc+=SC[i].d}
    if(i>=SC.length){finish();return}
    const s=SC[i],lt=st.t-acc,p=lt/s.d,al=Math.min(1,lt/.8,(s.d-lt)/.8);
    if(st.i!==i){st.i=i;cap.textContent=_(s.en,s.fr);if(i===0){tone(196,3,'sine',.07,0);tone(392,2.2,'sine',.03,0)}}
    cap.style.opacity=String(clamp01(Math.min(lt-.5,s.d-.5-lt)/.6));
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1;cx.fillStyle='#000';cx.fillRect(0,0,960,540);
    DRAW[i](p,st.t,lt);
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1-al;cx.fillStyle='#000';cx.fillRect(0,0,960,540);cx.globalAlpha=1;
    st.raf=requestAnimationFrame(frame);
  }
  const K=Math.min(2,COARSE?1.25:(window.devicePixelRatio||1));
  function finish(){if(!st)return;const d=st.done;cancelAnimationFrame(st.raf);st=null;box.hidden=true;try{d&&d()}catch(e){}}
  function play(done){
    if(st)return;ensureAudio();cvs.width=960*K;cvs.height=540*K;
    sk.textContent=_('Skip ›','Passer ›');cap.textContent='';cap.style.opacity='0';
    box.hidden=false;st={t:0,i:-1,last:performance.now(),done,raf:0};
    try{sk.focus({preventScroll:true})}catch(e){}
    st.raf=requestAnimationFrame(frame);
  }
  sk.addEventListener('click',()=>{if(st)finish()});
  window.addEventListener('keydown',e=>{if(!st)return;e.stopImmediatePropagation();e.preventDefault();if(e.key==='Escape'||e.key==='Enter'||e.key===' ')finish()},true);
  return{play,playing:()=>!!st};
})();
$('outroBtn').addEventListener('click',e=>{e.currentTarget.blur();OUTRO.play(()=>{})});

/* Chapitre II : verrouillé tant que la vraie fin n'a pas été vue (mémorisé dans le navigateur, quand c'est possible) */
function endSeen(){try{return localStorage.getItem('eb-end')==='1'}catch(e){return false}}
/* Épreuve du feu : meilleur temps affiché sous chaque difficulté (mémorisé dans le navigateur) */
function updBest(){for(const n of ['tn','th']){const sp=document.querySelector('#mphT [data-diff='+n+'] span');if(!sp)continue;let v=0;try{v=parseFloat(localStorage.getItem('eb-best-'+n))||0}catch(e){}sp.textContent=v?'🏆 '+fmtT(v):_('No record yet','Pas encore de record')}}
function updNext(){const b=$('mNext'),ok=endSeen();try{$('outroBtn').hidden=!ok}catch(e){}
  const tb=document.querySelector('#mphM [data-diff=trial]');tb.setAttribute('aria-disabled',String(!ok)); /* Épreuve du feu : débloquée par la vraie fin */
  tb.querySelector('b').textContent=ok?_('Trial by Fire','Épreuve du feu'):_('🔒 Trial by Fire','🔒 Épreuve du feu');
  tb.querySelector('span').textContent=ok?_('Ultimate challenge','Challenge ultime'):_('To unlock','À débloquer');b.classList.toggle('lock',!ok);
  b.querySelector('.nm').textContent=ok?_('Chapter II · Silent Bells','Chapitre II · Silent Bells'):_('🔒 Chapter II','🔒 Chapitre II');
  b.querySelector('.soon').textContent=_('Coming soon','À venir')}
$('mNext').addEventListener('click',e=>e.currentTarget.blur()); /* Chapitre II : « À venir » suffit, aucun message */
$('gateBtn').addEventListener('click',()=>{ensureAudio();$('gate').hidden=true;try{$('menu').querySelector('[data-diff=normal]').focus({preventScroll:true})}catch(e){}});
try{$('gateBtn').focus({preventScroll:true})}catch(e){}
let last=performance.now();
function frame(now){
  perfWatch(now-last);const dt=Math.min(.05,(now-last)/1000);last=now;
  if(RUN.on&&!paused&&el.ov.hidden&&menuEl.hidden){const S=R||Q||G;if(S&&S.mode==='play'){RUN.t+=dt;RUN.pt[R?2:Q?1:0]+=dt}}
  if(R){if(!paused)rStep(dt);renderR()}else if(Q){if(!paused)qStep(dt);renderQ()}else{if(!paused)step(dt);render()}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
