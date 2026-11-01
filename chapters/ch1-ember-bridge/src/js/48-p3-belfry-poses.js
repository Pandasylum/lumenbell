/* ---------- rendu phase III ---------- */
function finTh(t){return t<FIN.collapse?0:1.4*ei(clamp01((t-FIN.collapse)/1.1))}
function flameRow(foot,d,pre,post,sc){
  /* onde de choc : une succession d'explosions qui part du pied du Colosse et grossit jusqu'à atteindre le héros */
  if(d<=-pre||d>=post)return;
  const N=7,life=.5+post*.3,gx=GUARD[0];
  ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=18;
  for(let i=0;i<N;i++){
    const t0=-pre*(1-i/(N-1)),a=d-t0;
    if(a<0||a>=life)continue;
    const k=a/life,x=foot+(gx-foot)*(i/(N-1)),r=(24+i*11)*sc*(.55+.6*es(k)),al=1-k*k;
    const y=DECK-r*.35,g=ctx.createRadialGradient(x,y,2,x,y,r);
    g.addColorStop(0,'rgba(255,248,215,'+(.95*al)+')');g.addColorStop(.35,'rgba(255,190,90,'+(.8*al)+')');
    g.addColorStop(.75,'rgba(255,100,35,'+(.45*al)+')');g.addColorStop(1,'rgba(255,60,20,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();
    if(k<.5){ctx.strokeStyle='rgba(255,230,160,'+(.7*(1-k*2))+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r*.8,0,6.283);ctx.stroke()}
  }
  ctx.restore();
}
function drawBolt(x,y0,y1,al,big){
  if(al<=0)return;
  const pts=[[x,y0]];for(let i=1;i<=9;i++)pts.push([i===9?x:x+rand(-34,34),y0+(y1-y0)*i/9]);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.shadowColor='#fff0b0';ctx.shadowBlur=30;
  for(let pass=0;pass<2;pass++){
    ctx.strokeStyle=pass?'rgba(255,255,255,'+al+')':'rgba(255,217,102,'+(al*.6)+')';ctx.lineWidth=big?(pass?8:24):(pass?4:12);
    ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  }
  ctx.restore();
}
function heroFin(){
  const f=R.fin,t=f.t,bx=R.bx,L=[-112,-165];
  let x=PX,y=0,rot=0,glow=1,hand=[28,-94],sa=-1.5;
  if(t<FIN.leap[0]){}
  else if(t<FIN.leap[1]){const u=(t-FIN.leap[0])/(FIN.leap[1]-FIN.leap[0]);x=PX+(bx+L[0]-PX)*es(u);y=L[1]*es(u)-110*Math.sin(Math.PI*u);hand=[30,-72];sa=.15-.95*es(u)}
  else{
    x=bx+L[0];y=L[1];hand=[30,-72];sa=-.8;
    /* un tir de lanterne dans chaque aile : le sceptre pointe l'aile visée, léger recul au départ du tir */
    for(let i=0;i<2;i++){
      const d=t-FIN.cut[i],ang=i?-.22:-.63;
      if(d>-.4&&d<.45){const k=d<.1?es(clamp01((d+.4)/.35)):1-es(clamp01((d-.1)/.35));sa=-.8+(ang+.8)*k;hand=[30-7*(d>=0&&d<.15?1-d/.15:0),-72]}
    }
    if(t>=FIN.charge&&t<FIN.strike){hand=[26,-100];sa=-1.45;y=L[1]-24*es(clamp01((t-FIN.charge)/.6))}
    else if(t>=FIN.strike){hand=[38,-56];sa=.12;x+=14*es(clamp01((t-FIN.strike)/.1))}
    if(t>=FIN.collapse){
      const mag=finTh(t),th=-mag,c=Math.cos(th),sn=Math.sin(th),k=es(clamp01(mag/1.4));
      const A=[L[0]+(45-L[0])*k,L[1]+(-200-L[1])*k];
      x=bx+A[0]*c-A[1]*sn;y=A[0]*sn+A[1]*c;
      hand=[30,-60];sa=.12+.9*k;glow=.4;
    }
    if(t>=FIN.bell-.6){
      /* debout sur le Colosse terrassé, il lève sa lanterne vers la cloche */
      const u=es(clamp01((t-(FIN.bell-.6))/.5));
      hand=[30-4*u,-60-40*u];sa=.12+.9*(1-u)-1.45*u;glow=.4+.6*u;
    }
  }
  return{x,y,hand,sa,rot,sy:1,glow};
}
function finBoss(o){
  const t=R.fin.t,th=-finTh(t),c=Math.cos(th),sn=Math.sin(th);
  o.warm=t<FIN.collapse?(t>=FIN.strike?2:1.5):Math.max(.03,(t<FIN.bell?Math.max(.25,1.7-(t-FIN.collapse)*.35):Math.max(.25,1.7-(FIN.bell-FIN.collapse)*.35)*(1-clamp01((t-FIN.bell)/1.2))));
  o.jaw=(t>=FIN.strike&&t<FIN.collapse)?16:(t<.6?12:0);
  o.lean=th;o.dy=0;
  if(t>=FIN.strike&&t<FIN.collapse)o.x+=rand(-3,3);
  o.hands=[[-128,-66],[128,-66]].map(p=>[o.x+p[0]*c-p[1]*sn,DECK+p[0]*sn+p[1]*c]);
  if(t<FIN.collapse){const sw=Math.sin(t*3)*4;o.hands[0][1]+=sw;o.hands[1][1]-=sw}
  o.nostow=t>=FIN.raise;
  if(t>=FIN.raise&&t<FIN.fling){
    /* le Colosse brandit sa masse au-dessus de lui pour écraser le Veilleur */
    const u=es(clamp01((t-FIN.raise)/.4)),a=-2.1,dir=[Math.cos(a),Math.sin(a)];
    const grip=[o.x-60,DECK-210],g1=[o.hands[0][0]+(grip[0]-o.hands[0][0])*u,o.hands[0][1]+(grip[1]-o.hands[0][1])*u];
    const b0=[grip[0]-dir[0]*34,grip[1]-dir[1]*34],g2=[o.hands[1][0]+(b0[0]-o.hands[1][0])*u,o.hands[1][1]+(b0[1]-o.hands[1][1])*u];
    const sh=t>FIN.bell1?Math.sin(t*60)*3:0;
    o.sword={h:[g1[0]+sh,g1[1]],a:a,l:135*u,heat:1.2+.6*u};o.hands=[g1,g2];o.warm=Math.max(o.warm,1.7);
  }
  if(t>=FIN.fling&&t<FIN.fling+.7)o.jaw=14;
}
/* Final : écho de la cloche vers la masse, masse tombée au sol, tirs de lanterne dans les ailes */
function drawFinFx(){
  if(!R||R.mode!=='finale'&&!R.fmace)return;
  const t=R.fin?R.fin.t:0;
  if(R.mode==='finale'&&t>=FIN.bell1&&t<FIN.fling+.1){
    const B=[BELL[0],BELL[1]+40],G=[R.bx-100,DECK-270];
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowColor='#6fd3ff';
    for(let i=0;i<4;i++){
      const u=clamp01((t-FIN.bell1-i*.05)/.22);if(u<=0||u>=1)continue;
      const cx=B[0]+(G[0]-B[0])*es(u),cy=B[1]+(G[1]-B[1])*es(u),r=40+50*u;
      ctx.strokeStyle='rgba(235,250,255,'+(1-u*.5)+')';ctx.lineWidth=8*(1-u*.4)+2;ctx.shadowBlur=18;
      ctx.beginPath();ctx.arc(cx-r*.6,cy,r,-.8,.8);ctx.stroke();
    }
    ctx.restore();
  }
  if(R.fmace){const m=R.fmace;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.a);drawHammer(135,m.land?.2:1,R.time,9);ctx.restore()}
  if(R.fbeam&&R.fbeam.length){
    const hp=heroPose3(),L=[hp.x+hp.hand[0]+Math.cos(hp.sa)*76,DECK+(hp.y||0)+hp.hand[1]+Math.sin(hp.sa)*76];
    for(const b of R.fbeam){const al=1-b.t/.3;if(al<=0)continue;ctx.save();ctx.globalCompositeOperation='lighter';lanternBeam(L,[R.bx+b.sd*60,DECK-205],16,al);ctx.restore()}
  }
}
function drawFallWings(){
  for(const w of R.fall){
    const t=w.t,sd=w.sd,x0=R.bx+sd*64*.92,y0=DECK-204;
    ctx.save();ctx.globalAlpha=clamp01(1.6-t*.7);
    ctx.translate(x0+sd*70*t,y0+330*t*t-40*t);ctx.rotate(sd*1.1*t);ctx.scale(.92,.92);
    drawWing([0,0],-.85,.8,'#220a11',.34,true,sd);drawWing([0,0],-1.15,1,'#35101a',.34,true,sd);
    ctx.restore();
  }
}

function heroX3(){
  const c=R.cn,p=R.pl;
  if(c&&c.k==='slide'){
    const t=c.t,tx=R.bx-150;
    if(t<.35)return PX+(tx-PX)*eo(t/.35);
    if(t<.65)return tx;
    return tx+(PX-tx)*es(clamp01((t-.65)/.5));
  }
  if((p.s==='down'||p.s==='hurt')&&p.lasso){const d=p.rd||R_T.lasso,k=es(clamp01(p.t/.3))*(1-es(clamp01((p.t-(d-.35))/.35)));return PX+46*k}
  if(p.s==='down'||p.s==='hurt')return PX-24*(1-clamp01(p.t/.5));
  return PX;
}
function heroPose3(){
  if(R.mode==='finale')return heroFin();
  if(R.mode==='intro'){
    const T=R.t;
    /* il arrive en marchant ; au choc du Colosse, il lève sa lanterne qui s'embrase */
    const up=es(clamp01((T-1.1)/.25))*(1-es(clamp01((T-2.4)/.6)));
    return{x:R.introHx,y:T<1.7?-Math.abs(Math.sin(T*9.8))*4:0,hand:[30,-68-26*up],sa:-.3-1.0*up,rot:0,sy:1,glow:Math.max(.25,up)};
  }
  const p=R.pl,c=R.cn;
  let hand=[28,-62],sa=-.45,rot=0,sy=1,glow=0;
  const x=heroX3();
  if(c){
    const t=c.t;
    if(c.k==='plant'){
      const u=es(clamp01(t/.3));hand=[28+10*u,-62+22*u];sa=-.45+.8*u;sy=1-.1*u;glow=t>=.3?clamp01(1-(t-.3)/1.1):0;
      if(t>1.1){const v=es(clamp01((t-1.1)/.4));hand=[38-10*v,-40-22*v];sa=.35-.8*v;sy=.9+.1*v}
    }else if(c.k==='bat'){
      const V='B',u=es(clamp01(t/.22)),v=es(clamp01((t-.6)/.5));
      if(V==='A'){hand=[26,-62-40*u*(1-v)];sa=-.45-1.1*u*(1-v)}
      else if(V==='B'){hand=[30,-62-6*u*(1-v)];sa=-.45+.3*u*(1-v)+(t>.2&&t<.6?Math.sin(t*60)*.03:0)}
      else{hand=[28,-62-26*u*(1-v)+(t>.2&&t<.62?Math.sin(t*55)*2.5:0)];sa=-.45-.5*u*(1-v)}
    }else if(c.k==='bell'){
      const u=es(clamp01(t/.2)),v=es(clamp01((t-.85)/.5));
      hand=[28,-62-30*u*(1-v)+(t>.1&&t<.5?Math.sin(t*55)*2.5:0)];sa=-.45-.7*u*(1-v);glow=.9*(1-v)
    }else if(c.k==='bolt'){
      const u=es(clamp01(t/.25));hand=[28,-62-30*u];sa=-.45-.5*u;glow=1;
      if(t>1.5){const v=es(clamp01((t-1.5)/.4));hand=[28,-92+30*v];sa=-.95+.5*v;glow=1-v}
    }else if(c.k==='slide'){
      sy=.82;hand=[34,-34];sa=0;rot=.05;
      if(t>.65){const v=es(clamp01((t-.65)/.5));sy=.82+.18*v;hand=[34-6*v,-34-28*v];sa=-.45*v;rot=.05*(1-v)}
    }
  }else if(p.s==='act'){
    const r=clamp01(p.t/.08);hand=[28,-62-32*r];sa=-.45-1.05*r;glow=1;
  }else if((p.s==='down'||p.s==='hurt')&&p.lasso){
    const d=p.rd||R_T.lasso,k=es(clamp01(p.t/.3))*(1-es(clamp01((p.t-(d-.35))/.35)));
    rot=-1.45*k;hand=[24,-34];sa=.7;
  }else if(p.s==='down'||p.s==='hurt'){rot=.12;sy=.82;sa=.6}
  return{x,hand,sa,rot,sy,glow};
}
/* Masse de braise du Colosse, dans le repère de la main : manche le long de l'axe x, tête à pointes au bout (portée L) */
function drawHammer(L,heat,tm,w){
  if(L<2)return;const x0=L-w*5,R=w*3.4,cx=x0+R*.9,fl=.6+.4*Math.sin(tm*14);
  ctx.save();ctx.lineCap='round';
  ctx.strokeStyle='#1c1520';ctx.lineWidth=w*1.15;ctx.beginPath();ctx.moveTo(-26,0);ctx.lineTo(cx,0);ctx.stroke();
  ctx.strokeStyle='#3a2d44';ctx.lineWidth=w*.7;ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(cx,0);ctx.stroke();
  for(let i=1;i<4;i++)box(x0*i/4-3,-w*.75,6,w*1.5,'#4a3a55','#2b2233');
  ctx.fillStyle='rgba(255,120,40,'+Math.min(.25,.12*heat)+')';ctx.beginPath();ctx.arc(cx,0,R*1.7,0,6.283);ctx.fill();
  /* pointes */
  for(let i=0;i<10;i++){const a=i/10*6.283;ctx.save();ctx.translate(cx,0);ctx.rotate(a);
    ctx.beginPath();ctx.moveTo(R*.8,-w*.7);ctx.lineTo(R*1.55,0);ctx.lineTo(R*.8,w*.7);ctx.closePath();ctx.fillStyle='#3a2d44';ctx.fill();ctx.strokeStyle='#5a4666';ctx.lineWidth=1.5;ctx.stroke();ctx.restore()}
  const g=ctx.createRadialGradient(cx-R*.3,-R*.3,2,cx,0,R);g.addColorStop(0,'#4a3550');g.addColorStop(1,'#1a1119');
  ctx.beginPath();ctx.arc(cx,0,R,0,6.283);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#5a4666';ctx.lineWidth=2.5;ctx.stroke();
  ctx.strokeStyle='rgba(255,'+(130+70*fl|0)+',50,.95)';ctx.lineWidth=2.5;ctx.shadowColor='#ff7a2b';ctx.shadowBlur=10;
  ctx.beginPath();ctx.moveTo(cx-R*.7,-R*.2);ctx.lineTo(cx-R*.2,R*.1);ctx.lineTo(cx-R*.1,-R*.6);ctx.moveTo(cx-R*.2,R*.1);ctx.lineTo(cx+R*.3,R*.5);ctx.moveTo(cx+R*.1,-R*.1);ctx.lineTo(cx+R*.6,-R*.3);ctx.stroke();
  ctx.restore();
}
function drawFireBlade(L,heat,tm,w){drawHammer(L,heat,tm,w)}
function bossSword3(a,two){
  const UP=[BX+10,DECK-290],HIT1=[BX-150,DECK-230],PREP2=[BX+80,DECK-110],HIT2=[BX-150,DECK-96],REST=[BX-40,DECK-120];
  const A_UP=-1.35,A_HIT1=-3.76,A_H=-Math.PI+.12;
  let KF=[
    {t:0,h:REST,a:-.2,l:0},{t:.25,h:UP,a:A_UP,l:300},{t:.45,h:UP,a:A_UP,l:300},
    {t:.75,h:HIT1,a:A_HIT1,l:300,e:'i'},{t:1.10,h:PREP2,a:A_H,l:300},{t:1.4,h:HIT2,a:A_H,l:300,e:'i'},
    {t:1.75,h:UP,a:A_UP,l:300},{t:2.05,h:HIT1,a:A_HIT1,l:300,e:'i'},{t:2.6,h:REST,a:-.2,l:0}
  ];
  if(two)KF=KF.slice(0,6).concat([{t:1.65,h:HIT2,a:A_H,l:300},{t:2.1,h:REST,a:-.2,l:0}]);
  const t=Math.min(a,KF[KF.length-1].t);
  let i=0;while(i<KF.length-2&&t>KF[i+1].t)i++;
  const k0=KF[i],k1=KF[i+1];
  let u=clamp01((t-k0.t)/(k1.t-k0.t));u=k1.e==='i'?ei(u):es(u);
  const h=lerp2(k0.h,k1.h,u);
  return{h,a:k0.a+(k1.a-k0.a)*u,l:k0.l+(k1.l-k0.l)*u};
}
function bossSwordH(a){
  const UP=[BX+10,DECK-290],HIT1=[BX-150,DECK-230],PREP2=[BX+80,DECK-110],HIT2=[BX-150,DECK-96],REST=[BX-40,DECK-120],PULL=[BX+110,DECK-150],THR=[BX-200,DECK-150],PLANT=[BX-70,DECK-230];
  const A_UP=-1.35,A_HIT1=-3.76,A_H=-Math.PI+.12,A_PL=-4.08;
  const KF=[
    {t:0,h:REST,a:-.2,l:0},{t:.3,h:PULL,a:A_H,l:300},{t:.55,h:PULL,a:A_H,l:300},{t:.85,h:THR,a:A_H,l:300,e:'i'},
    {t:1.7,h:UP,a:A_UP,l:300},{t:1.95,h:HIT1,a:A_HIT1,l:300,e:'i'},{t:2.2,h:PREP2,a:A_H,l:300},{t:2.45,h:HIT2,a:A_H,l:300,e:'i'},
    {t:2.7,h:UP,a:A_UP,l:300},{t:2.95,h:HIT1,a:A_HIT1,l:300,e:'i'},{t:3.35,h:UP,a:A_UP,l:300},{t:3.9,h:PLANT,a:A_PL,l:300,e:'i'},{t:4.2,h:PLANT,a:A_PL,l:300},{t:4.7,h:REST,a:-.2,l:0}
  ];
  const t=Math.min(a,KF[KF.length-1].t);
  let i=0;while(i<KF.length-2&&t>KF[i+1].t)i++;
  const k0=KF[i],k1=KF[i+1];
  let u=clamp01((t-k0.t)/(k1.t-k0.t));u=k1.e==='i'?ei(u):es(u);
  return{h:lerp2(k0.h,k1.h,u),a:k0.a+(k1.a-k0.a)*u,l:k0.l+(k1.l-k0.l)*u};
}
function bossPose3(){
  const b=R.boss,x=R.bx,a=R.atk,t=R.time;
  const rest=[[x-128,DECK-66+Math.sin(t*2)*3],[x+128,DECK-66+Math.sin(t*2+1)*3]];
  const o={x,dy:Math.sin(t*1.6)*2,lean:0,jaw:0,warm:R.rage>0?1.5:1,hands:rest,sword:null,wa:0,ws:1};
  if(R.mode==='intro'){
    const T=R.t;
    o.jaw=(T>2.9&&T<3.6)?14:0;o.warm=T>2.9?1.4:1.25;
    /* il arrive en vol, ailes déployées et battantes, se pose puis replie ses ailes */
    if(T<1.1){const u=T/1.1;o.dy=-520*(1-es(u));o.wa=.6+.35*Math.sin(T*18);o.ws=1.9;o.lean=-.08;
      o.hands=rest.map(h=>[h[0]+(h[0]<x?-40:40),h[1]-30])}
    else{const v=clamp01((T-1.1)/1.4),f=1-es(clamp01((T-1.1)/.8));o.dy=24*(1-es(v));o.lean=.16*(1-es(v));o.wa=.6*f;o.ws=1+.9*f;
      const k=1-es(clamp01((T-1.1)/1.2));o.hands=rest.map(h=>[h[0]+(h[0]<x?-30:30)*k,h[1]+40*k])}
  }
  if(b.s==='hurt'||b.s==='fail'){o.jaw=b.s==='hurt'?8:0}
  if(b.s==='dead'&&R.mode!=='finale'){o.dy=Math.min(70,b.t*45);o.warm=Math.max(.2,1-b.t*.4);o.lean=.05*Math.min(1,b.t)}
  if(b.s==='heal'){
    const k=clamp01(b.t/.5)*(1-clamp01((b.t-2.9)/.5));
    o.warm=1.6+.8*k;o.jaw=(b.t>.5&&b.t<2.9)?16:6;o.wa=.6*k;o.ws=1+.9*k;o.lean=-.06*k;
    o.hands=[lerp2(rest[0],[x-120,DECK-330],k),lerp2(rest[1],[x+120,DECK-330],k)];
  }
  if(a){
    o.warm=Math.max(o.warm,1.25);
    let sp=0;
    a.hits.forEach(h=>{
      if(h.k!=='blast'&&h.k!=='wave'&&h.k!=='stomp')return;
      if(a.h&&a.kind==='greatsword'&&h.k==='blast'&&!h.pre&&!h.flap)return;
      const d=a.t-h.at;
      if(h.pre){
        const k=clamp01(a.t/.5)*(1-es(clamp01((d-.15)/.5)));
        o.wa+=.6*k;o.ws+=.9*k;if(k>.3)o.jaw=Math.max(o.jaw,14);o.warm=Math.max(o.warm,1.4+.5*k);
        o.hands=[lerp2(o.hands[0],[x-120,DECK-330],k),lerp2(o.hands[1],[x+120,DECK-330],k)];
        if(a.t>=.5&&!a.roared){a.roared=true;roar();R.shake=reduce?0:10;R.flash=.35}
      }else{
        sp=Math.max(sp,es(clamp01((d+.6)/.35))*(1-es(clamp01((d-.15)/.4))));
      }
    });
    if(sp>0){o.wa+=.6*sp;o.ws+=.9*sp}
    if(a.pt>=0){
      const q=a.pt,K=(a.cf!=null&&q>=a.cf)?'breath':a.kind;
      if(a.h&&a.kind==='avalanche'){
        let u=0;
        for(let i=0;i<5;i++){
          const L=bombL(i),T=L-.55,d=q-T;
          const b2=d<-.25?0:d<0?eo((d+.25)/.25):1-es(clamp01(d/.35));if(b2>u)u=b2;
          if(q>=T&&!a['th'+i]){a['th'+i]=1;qBurst(x+30,DECK-390,12,['#bfeaff','#ffffff','#ff9a3c']);tone(110,.2,'sawtooth',.05,-40)}
          if(q>=L&&!a['ld'+i]){a['ld'+i]=1;const P=bombPos(i);R.shake=reduce?0:Math.max(R.shake,4);tone(80,.2,'sine',.1,-30);qBurst(P[0],DECK-16,10,['#bfeaff','#ffffff'])}
        }
        o.hands=[rest[0],lerp2(rest[1],[x+50,DECK-395],u)];o.lean=-.05*u;
      }else if(a.h&&a.kind==='charge'){
        const dir=q>=1.5&&q<3.75?-1:1;o.flip=dir<0;
        const wind=q<.35||(q>=2.6&&q<2.95),run=(q>=.35&&q<1.5)||(q>=2.95&&q<3.7);
        if(wind||run){
          o.hands=[[o.x+30,DECK-150],[o.x+150,DECK-150]];o.lean=wind?.08:.14;o.jaw=wind?6:12;
          if(Math.random()<(wind?.5:.8))R.steam.push({x:o.x+dir*(wind?-60:20),y:DECK-4,vx:wind?dir*-1*rand(10,60):dir*rand(20,80),vy:-rand(20,80),life:.8,max:.8,s:rand(8,18)});
        }else if(q>=1.5&&q<2.6){
          o.lean=.14*(1-es(clamp01((q-1.5)/.4)));
          if(q>=1.65&&q<2.0)o.dy+=-16*es((q-1.65)/.35);
          else if(q>=2.0&&q<2.2)o.dy+=-16*(1-ei(clamp01((q-2.0)/.05)))+5*Math.sin(Math.PI*clamp01((q-2.05)/.15));
          if(q>=2.05&&!a.stomped){a.stomped=true;R.shake=reduce?0:9;tone(70,.4,'sine',.14,-30);
            for(let i=0;i<12;i++)R.steam.push({x:o.x+62+rand(-30,30),y:DECK-4,vx:rand(-90,90),vy:-rand(20,90),life:.7,max:.7,s:rand(10,20)})}
        }else if(q>=3.7){
          o.lean=0;
          if(q>=4.1&&q<4.95){const u=q<4.4?eo((q-4.1)/.3):1-es(clamp01((q-4.7)/.2));o.hands=[lerp2(rest[0],[o.x-110,DECK-300],u),lerp2(rest[1],[o.x+110,DECK-300],u)];o.jaw=10}
        }
      }else if(K==='greatsword'||K==='sword2'){
        const sw=(a.h&&a.kind==='greatsword')?bossSwordH(q):a.hard3?bossSword3(swq(a),false):bossSword3(q,a.kind==='sword2');
        if(sw.l>1){
          const dir=[Math.cos(sw.a),Math.sin(sw.a)],hb=[sw.h[0]-dir[0]*30,sw.h[1]-dir[1]*30];
          o.sword={h:sw.h,a:sw.a,l:sw.l,heat:1};
          o.hands=sw.h[0]<hb[0]?[sw.h,hb]:[hb,sw.h];
          if(a.h&&a.kind==='greatsword'&&q>=3.35&&q<4.0){ /* la lame se charge avant l'explosion */
            const c=clamp01((q-3.35)/.55);o.sword.chg=c;o.sword.heat=1+c;
            if(!a.chg){a.chg=true;tone(160,.55,'sawtooth',.05,520)}
            if(Math.random()<.7){const ph=Math.random(),dx=Math.cos(sw.a),dy=Math.sin(sw.a);R.sparks.push({x:sw.h[0]+dx*300*ph,y:sw.h[1]+dy*300*ph,vx:rand(-40,40),vy:-rand(30,120),g:200,life:.4,max:.4,col:'#ffd98a',sz:rand(2,4)})}
          }
        }
      }else if(a.kind==='avalanche'){
        const u=q<.25?eo(q/.25):1-es(clamp01((q-.45)/.4));
        o.hands=[rest[0],lerp2(rest[1],[x+50,DECK-395],u)];o.lean=-.05*u;
        if(q>.3&&!a.smashed){a.smashed=true;R.shake=reduce?0:7;qBurst(x+30,DECK-390,22,['#bfeaff','#ffffff','#ff9a3c']);tone(110,.3,'sawtooth',.08,-40)}
      }else if(a.kind==='charge'){
        if(q<1.0){
          const u=clamp01(q/.35);
          o.hands=[[o.x+30,DECK-150],[o.x+150,DECK-150]];o.lean=q<.35?.08*u:.14;o.jaw=q<.35?6:12;
          if(q<.35&&Math.random()<.5)R.steam.push({x:o.x-60,y:DECK-4,vx:rand(-60,-10),vy:-rand(20,70),life:.8,max:.8,s:rand(8,16)});
          if(q>=.35&&Math.random()<.8)R.steam.push({x:o.x-20,y:DECK-4,vx:rand(20,80),vy:-rand(20,80),life:.7,max:.7,s:rand(10,18)});
        }else{
          o.lean=.14*(1-es(clamp01((q-1.0)/.4)));
          if(q>=1.35&&q<1.7)o.dy+=-16*es((q-1.35)/.35);
          else if(q>=1.7&&q<1.9)o.dy+=-16*(1-ei(clamp01((q-1.7)/.05)))+5*Math.sin(Math.PI*clamp01((q-1.75)/.15));
          if(q>=1.75&&!a.stomped){a.stomped=true;R.shake=reduce?0:9;tone(70,.4,'sine',.14,-30);
            for(let i=0;i<12;i++)R.steam.push({x:o.x-62+rand(-30,30),y:DECK-4,vx:rand(-90,90),vy:-rand(20,90),life:.7,max:.7,s:rand(10,20)})}
          if(q>=2.0&&q<2.8&&!DIFF.easy){
            const u=q<2.3?eo((q-2.0)/.3):1-es(clamp01((q-2.6)/.2));
            o.hands=[lerp2(rest[0],[o.x-110,DECK-300],u),lerp2(rest[1],[o.x+110,DECK-300],u)];o.jaw=10;
          }
        }
      }else if(K==='whip'){
        const UPH=[x-100,DECK-340],FW=[x-210,DECK-240],qw=DIFF.hard?aq(a,'whip',.75):q;
        let h0;
        if(qw<.55)h0=lerp2(rest[0],UPH,es(clamp01(qw/.55)));
        else if(qw<.75)h0=lerp2(UPH,FW,ei((qw-.55)/.2));
        else h0=lerp2(FW,rest[0],es(clamp01((qw-.75)/.5)));
        o.hands=[h0,rest[1]];o.lean=qw<.55?.04*clamp01(qw/.55):-.05*(1-clamp01((qw-.75)/.5));
      }else if(K==='breath'){
        const bq=a.hq||a.cf!=null?aq(a,'breath',1.0):q;
        const inh=es(clamp01(bq/.6)),out=clamp01((bq-.85)/.2)*(1-clamp01((bq-1.3)/.4));
        o.jaw=bq>.6?14:6*inh;
        o.lean=.07*inh-.18*out;o.warm=1.3+.4*inh;
        o.hands=[lerp2(rest[0],[x-80,DECK-150],inh*(1-out)),lerp2(rest[1],[x+80,DECK-150],inh*(1-out))];
      }else if(a.kind==='claws'){
        let lunge=0,idx=0,i=0;
        a.hits.forEach(h=>{
          if(h.k!=='claw')return;
          const d=a.t-h.at;let l=0;
          if(d>=-.45&&d<-.1)l=eo((d+.45)/.35)*.35;else if(d>=-.1&&d<0)l=.35+.65*ei((d+.1)/.1);else if(d>=0&&d<.4)l=1-es(d/.4);
          if(l>lunge){lunge=l;idx=i%2}
          i++;
        });
        o.x=x-150*lunge;
        const r2=[[o.x-128,DECK-66],[o.x+128,DECK-66]];
        o.hands=r2;
        o.hands[idx]=lerp2(r2[idx],[o.x-170,GUARD[1]-30+(idx?20:-20)],lunge);
        o.jaw=lunge>.3?10:0;
      }else if(a.kind==='rocks'){
        let ri=0;
        a.hits.forEach(h=>{
          if(h.k!=='rock')return;
          const d=a.t-h.at,idx=(ri%2===0)?1:0;ri++;
          const HOLD=[x+(idx?40:-40),DECK-345],THR=[x-190,DECK-230];
          let tg=null;
          if(d>=-.95&&d<-.45)tg=lerp2(rest[idx],HOLD,es(clamp01((d+.95)/.35)));
          else if(d>=-.45&&d<-.3)tg=lerp2(HOLD,THR,eo((d+.45)/.15));
          else if(d>=-.3&&d<.25)tg=lerp2(THR,rest[idx],es((d+.3)/.55));
          if(tg)o.hands[idx]=tg;
        });
        a.hits.forEach(h=>{if(h.k!=='fire')return;const d=a.t-h.at;
          if(d>-.7&&d<.35){const k=es(clamp01((d+.7)/.4))*(1-es(clamp01((d-.05)/.3)));o.jaw=Math.max(o.jaw,14*k);o.warm=Math.max(o.warm,1.4+.4*k);o.lean=.05*k;
            o.hands=[lerp2(o.hands[0],[x-80,DECK-150],k),lerp2(o.hands[1],[x+80,DECK-150],k)]}});
      }else if(a.roar){
        const last=a.hits[a.hits.length-1].at-(a.off||0),k=es(clamp01(q/.5))*(1-es(clamp01((q-(last+.1))/.4)));
        o.jaw=Math.max(o.jaw,14*k);o.warm=Math.max(o.warm,1.4+.4*k);o.wa+=.6*k;o.ws+=.9*k;
        o.hands=[lerp2(o.hands[0],[x-120,DECK-330],k),lerp2(o.hands[1],[x+120,DECK-330],k)];
        if(q>=.3&&!a.roared){a.roared=true;roar();R.shake=reduce?0:8;R.flash=Math.max(R.flash,.2)}
      }
    }
  }
  if(R.mode==='finale')finBoss(o);
  return o;
}
