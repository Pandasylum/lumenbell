/* ---------- Form II gameplay: L'Éclaté ---------- */
function drawP(k,x,y,r,heat,sc){ctx.save();ctx.translate(x,y);ctx.rotate(r||0);if(sc)ctx.scale(sc,sc);PDRAW[k](heat==null?.85:heat);ctx.restore()}
function tent(x0,y0,cx1,cy1,cx2,cy2,x1,y1,w,on){ctx.lineCap='round';ctx.strokeStyle='rgba(4,20,26,.9)';ctx.lineWidth=w+3;ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(cx1,cy1,cx2,cy2,x1,y1);ctx.stroke();
  ctx.strokeStyle=`rgba(111,232,255,${.55*on+.15})`;ctx.lineWidth=w*.45;ctx.stroke();
  for(let d=1;d<6;d++){const t=d/6,m=1-t;ell(m*m*m*x0+3*m*m*t*cx1+3*m*t*t*cx2+t*t*t*x1,m*m*m*y0+3*m*m*t*cy1+3*m*t*t*cy2+t*t*t*y1,1.6,1.6,`rgba(200,255,255,${.5*on})`)}}
function base(){ell(LX,GY+8,160,18,'#050e12');for(const r of RIBS){ctx.strokeStyle='#0a1418';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(r.x,GY+4);ctx.quadraticCurveTo(r.x+r.l*10,GY-r.h,r.x+r.l*26,GY-r.h*.9);ctx.stroke()}}
const RINGS=TOWER.map((p,i)=>p.k==='ring'?i:-1).filter(i=>i>=0);
const SBELLS=TOWER.map((p,i)=>p.k==='sbell'?i:-1).filter(i=>i>=0);
const MOV=TOWER.map((p,i)=>(p.k==='ring'||p.k==='seg'||p.k==='sbell')?i:-1).filter(i=>i>=0);
function P3b(stage,f,b,final,rage){
  const T=[];let t=b;
  const ring=n=>{const t0=t;for(let i=0;i<n;i++){const s=t0+i*.34*f;S.ringNext=((S.ringNext||0)+1)%6;T.push({k:'ring',t0:s,tl:s+.5*f,ti:s+.95*f,ri:S.ringNext})}t=t0+(n-1)*.34*f+1.35*f};
  const moon=()=>{const ts=t+.9*f,D=1.25*f;T.push({k:'moon',t0:t,ts,D,ta:ts+D*((1000-(HX+90))/1080),tb:ts+D*((1000-(HX-70))/1080),hold:true});t=ts+D+.45*f};
  const cross=()=>{for(let i=0;i<2;i++){const ts=t+.75*f,D=1.25*f;T.push({k:'lbeam',side:i?0:1,t0:t,ts,D,ta:ts+D*((940-HX-80)/1000),tb:ts+D*((940-HX+80)/1000),hold:true});t=ts+D*.62}t+=.7*f};
  const trap=()=>{T.push({k:'trap',t0:t,tl:t+.75*f,ti:t+1.3*f});t+=1.85*f};
  const burstOut=()=>{T.push({k:'burst',t0:t,ta:t+1.15*f,tb:t+1.5*f,hold:true});t+=2*f};
  const reform=()=>{const tr=t+.9*f,ts=tr+.35*f,D=1.5*f;T.push({k:'reform',t0:t,tr,ts,D,ta:ts+D*((940-HX-80)/1000),tb:ts+D*((940-HX+80)/1000),hold:true});const td=ts+D+.5*f;T.push({k:'disp',t0:ts+D,ti:td,rf:1});t=td+.7*f};
  // rage, the bell storm: rings fired in turn from the two side lanterns (taps), then the trap bell pressing down (hold)
  const storm=()=>{const Q=SP.storm;for(let i=0;i<Q.n;i++){const s=t+i*Q.gap*f;T.push({k:'sring',side:i%2,t0:s,tl:s+Q.tl*f,ti:s+Q.ti*f})}t+=(Q.n-1)*Q.gap*f+Q.ti*f+Q.trapGap*f;
    T.push({k:'trap',t0:t,tl:t+Q.trapTl*f,ta:t+Q.trapTa*f,tb:t+Q.trapTb*f,hold:true});t+=Q.trapTb*f+Q.after*f};
  if(rage){storm();return T}
  if(final){T.push({k:'implode',t0:t,ta:t+1.7*f,tb:t+2.3*f,hold:true});t+=2.8*f;return T}
  const p0=[()=>ring(3),moon,trap,()=>{ring(2);trap()},cross,burstOut,reform];
  const p1=[()=>ring(5),()=>{moon();ring(3)},()=>{trap();trap()},()=>{cross();ring(2)},()=>{burstOut();moon()},()=>{ring(3);cross()},()=>{reform();ring(2)},storm];
  pick(stage?p1:p0)();return T;
}
function beamFrom(ox,oy,bx,a){const g=ctx.createLinearGradient(ox,oy,bx,GY);g.addColorStop(0,`rgba(220,252,255,${.85*a})`);g.addColorStop(1,`rgba(110,230,255,${.28*a})`);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(ox-7,oy);ctx.lineTo(ox+7,oy);ctx.lineTo(bx+70,GY+16);ctx.lineTo(bx-70,GY+16);ctx.closePath();ctx.fill();ell(bx,GY+4,80,11,`rgba(200,250,255,${.25*a})`)}
function drawEclGame(){
  const T=S.ecPhi/.55,P=ecPose(T),A0=ecAnchor(T);let A=A0;
  let J={x:LX,y:ECY+Math.sin(rt*1.1)*4,r:44};
  if(S.angerShown){RINGS.forEach((idx,i)=>{if(i%2){const a=-S.ecPhi*1.3+i*2*Math.PI/7;P[idx]={x:LX+Math.cos(a)*140,y:ECY+Math.sin(a)*46,r:a*.5,z:Math.sin(a)}}})}
  let reBeam=null;
  for(const th of S.threats){if(gt<th.t0)continue;
    if(th.k==='reform'){const d=S.threats.find(x=>x.k==='disp'&&x.t0===th.ts+th.D);const end=d?d.ti:th.ts+th.D+.5;
      const k=gt<th.tr?eio(clamp((gt-th.t0)/(th.tr-th.t0),0,1)):gt<end-.3?1:1-ein(clamp((gt-(end-.3))/.3,0,1));
      if(gt<end+.05){TOWER.forEach((p,i)=>{const e=p.e;P[i]={x:lerp(P[i].x,e.x,k),y:lerp(P[i].y,e.y,k),r:lerp(P[i].r,e.r,k),z:lerp(P[i].z||0,0,k),sc:P[i].sc}});A={x:lerp(A.x,LX+118,k),y:lerp(A.y,GY-150,k),a:lerp(A.a,1.78,k),sc:lerp(A.sc,1,k),z:-2.5,clip:k>.9};J={x:LX,y:lerp(J.y,LY,k),r:lerp(J.r,36,k)};
        if(gt>=th.ts&&gt<=th.ts+th.D)reBeam=(gt-th.ts)/th.D;
        if(k>.95&&!th.sf){th.sf=1;MUSIC.fx('clank');MUSIC.fx('ignite')}}}
    if(th.k==='disp'&&th.done&&!th.sf){th.sf=1;S.shake=12;burst(LX,GY-200,40,'#9ff2ff',8,.9);MUSIC.fx('bellCascade')}
    if(th.k==='implode'){const pre=clamp((gt-th.t0)/(th.ta-th.t0),0,1),post=gt>th.tb?clamp((gt-th.tb)/1.1,0,1):0;
      for(const idx of MOV){const o=P[idx];if(post===0)P[idx]={...o,x:lerp(o.x,J.x,.92*ein(pre))+Math.sin(gt*50+idx)*3*pre,y:lerp(o.y,J.y,.92*ein(pre))};else{const s=Math.sin(Math.PI*post)*(1-post*.3);P[idx]={...o,x:J.x+(o.x-J.x)*(1+2.2*s),y:J.y+(o.y-J.y)*(1+2.2*s)}}}
      J={...J,r:J.r*(1+.4*pre*(1-post))};S.shake=Math.max(S.shake,pre*(1-post)*6);
      if(post>0&&!th.bf){th.bf=1;S.shake=22;S.flashT=gt;burst(J.x,J.y,70,'#e8fdff',11,1.1);MUSIC.fx('explosion')}
      if(post>0&&post<1){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(200,245,255,${1-post})`;ctx.lineWidth=8*(1-post)+1;ctx.beginPath();ctx.arc(J.x,J.y,post*900,0,Math.PI*2);ctx.stroke();ctx.restore()}}
  }
  const on=1;
  const hit={x:HX+20,y:GY-80},tells=[],beams=[],fx=[],srings=[];let trapQ=null;
  for(const th of S.threats){
    if(gt<th.t0)continue;
    if(th.done&&th.res==='ok'&&!th.sfx){th.sfx=1;if(th.k==='ring')MUSIC.fx('bellHit');if(th.k==='trap')MUSIC.fx('bellBig')}
    if(th.k==='ring'){const idx=RINGS[th.ri%6],o=P[idx];let q;
      if(gt<th.tl){q=o;tells.push([o.x,o.y,(gt-th.t0)/(th.tl-th.t0)])}
      else if(!th.done){const k=clamp((gt-th.tl)/(th.ti-th.tl),0,1);q={x:lerp(o.x,hit.x,ein(k)),y:lerp(o.y,hit.y,ein(k))-Math.sin(Math.PI*k)*30,r:o.r+k*8,z:2}}
      else{const k=eio(clamp((gt-th.okT)/.7,0,1)),from=th.res==='ok'?{x:hit.x+110,y:hit.y-90}:hit;q={x:lerp(from.x,o.x,k),y:lerp(from.y,o.y,k),r:o.r,z:k<1?2:o.z}}
      P[idx]=q}
    else if(th.k==='trap'){const o=P[EHEAD],hov={x:HX+12,y:GY-250},grd={x:HX+12,y:GY+2},ti=th.hold?th.ta:th.ti;let q;
      if(gt<th.tl){const k=eio(clamp((gt-th.t0)/(th.tl-th.t0),0,1));q={x:lerp(o.x,hov.x,k),y:lerp(o.y,hov.y,k)+Math.sin(gt*8)*3*k,r:lerp(Math.PI,0,k),z:2,sc:lerp(1,2.3,k)}}
      else if(!th.done){const k=ein(clamp((gt-th.tl)/(ti-th.tl),0,1));q={x:hov.x,y:lerp(hov.y,grd.y,k)+(gt>ti?Math.sin(gt*40)*2:0),r:0,z:2,sc:2.3};if(gt>ti)S.shake=Math.max(S.shake,3)}
      else{const d=gt-th.okT,hold=th.res==='hit'?.5:0,k=eio(clamp((d-hold)/.8,0,1)),from=th.res==='ok'?{x:hov.x+70,y:hov.y-30}:grd;
        q={x:lerp(from.x,o.x,k),y:lerp(from.y,o.y,k),r:lerp(0,Math.PI,k),z:2,sc:lerp(2.3,1,k)};
        if(th.res==='hit'&&d<.7)fx.push(['toll',grd.x,grd.y-90,d/.7])}
      if(q.sc>1.4){trapQ=q;q={...q,hide:true}}
      P[EHEAD]=q}
    else if(th.k==='burst'){const pre=clamp((gt-th.t0)/(th.ta-th.t0),0,1),post=gt>th.ta?clamp((gt-th.ta)/1.1,0,1):0;
      if(post>0&&!th.bf){th.bf=1;S.shake=14;burst(J.x,J.y,40,'#bff6ff',9,.9);MUSIC.fx('bellCascade')}
      for(const idx of MOV){const o=P[idx];if(post===0)P[idx]={...o,x:lerp(o.x,J.x,.55*eio(pre))+Math.sin(gt*40+idx)*2*pre,y:lerp(o.y,J.y,.55*eio(pre))};else{const s=Math.sin(Math.PI*post)*(1-post*.3);P[idx]={...o,x:J.x+(o.x-J.x)*(1+1.8*s),y:J.y+(o.y-J.y)*(1+1.8*s)}}}
      if(post>0&&post<1)fx.push(['wave',J.x,J.y,post])}
    else if(th.k==='moon'){const st={x:1000,y:GY-60};
      if(gt<th.ts){const k=eio(clamp((gt-th.t0)/(th.ts-th.t0),0,1));A={x:lerp(A0.x,st.x,k),y:lerp(A0.y,st.y,k),a:A0.a+k*2,sc:lerp(A0.sc,.85,k),z:3};tells.push([A.x,A.y,k])}
      else if(gt<=th.ts+th.D){const s=(gt-th.ts)/th.D;A={x:1000-1080*s,y:GY-60-Math.sin(s*Math.PI)*20,a:s*Math.PI*7,sc:.85,z:3};if(!th.wf){th.wf=1;MUSIC.fx('whoosh')}}
      else{const k=eio(clamp((gt-th.ts-th.D)/.8,0,1));A={x:lerp(-80,A0.x,k),y:lerp(GY-60,A0.y,k),a:A0.a,sc:lerp(.85,A0.sc,k),z:k<1?3:A0.z}}}
    else if(th.k==='lbeam')beams.push(th);
    else if(th.k==='sring')srings.push(th);
  }
  const LQ=lampPoses(J.x,J.y,J.r/36);
  drawEcl(P,A,J,1,on,null,LQ);
  if(reBeam!=null){ctx.save();ctx.globalCompositeOperation='lighter';beamShape(940-1000*reBeam,1);ctx.restore()}
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const th of beams){const o=LQ[th.side];
    if(gt<th.ts){const k=(gt-th.t0)/(th.ts-th.t0);glow(o.x,o.y,60,'rgba(110,235,255,.9)',.4+.5*k);beamFrom(o.x,o.y,940,.12+.25*k)}
    else if(gt<=th.ts+th.D){const s=(gt-th.ts)/th.D;beamFrom(o.x,o.y,940-1000*s,1);glow(o.x,o.y,70,'rgba(200,250,255,.9)',.8)}}
  for(const t of tells)glow(t[0],t[1],46,'rgba(200,250,255,.95)',.9*t[2]);
  // rings of the bell storm, from the two side lanterns in turn (th.side alternates)
  for(const th of srings){const o=LQ[th.side];
    if(gt<th.tl){const k=(gt-th.t0)/(th.tl-th.t0);glow(o.x,o.y,56,'rgba(110,235,255,.9)',.3+.6*k);ctx.strokeStyle=`rgba(220,252,255,${k})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,30-18*k,0,Math.PI*2);ctx.stroke();continue}
    let x,y,a=1,rr=16;
    if(!th.done){const k=ein(clamp((gt-th.tl)/(th.ti-th.tl),0,1));x=lerp(o.x,hit.x,k);y=lerp(o.y,hit.y,k)-Math.sin(Math.PI*k)*40;rr=14+12*k}
    else{const q=(gt-th.okT)/.35;if(q>=1)continue;a=1-q;x=hit.x+(th.res==='ok'?40*q:0);y=hit.y-(th.res==='ok'?50*q:0);rr=26+30*q;if(!th.bf){th.bf=1;burst(hit.x,hit.y,th.res==='ok'?16:8,'#dff8ff',5,.5)}}
    ctx.globalAlpha=a;glow(x,y,rr*2.2,'rgba(110,235,255,.9)',.6);ctx.strokeStyle='#eafcff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,y,rr,rr*.55,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(110,235,255,.8)';ctx.lineWidth=8;ctx.globalAlpha=a*.4;ctx.stroke();ctx.globalAlpha=1}
  for(const e of fx){if(e[0]==='wave'){ctx.strokeStyle=`rgba(200,245,255,${1-e[3]})`;ctx.lineWidth=6*(1-e[3])+1;ctx.beginPath();ctx.arc(e[1],e[2],e[3]*700,0,Math.PI*2);ctx.stroke()}
    else{ctx.strokeStyle=`rgba(255,200,120,${.8*(1-e[3])})`;ctx.lineWidth=3;for(let i=0;i<3;i++){const r=30+((e[3]*90+i*30)%90);ctx.beginPath();ctx.arc(e[1],e[2],r,Math.PI*.15,Math.PI*.85,true);ctx.stroke()}}}
  ctx.restore();
  if(trapQ){const q=trapQ;S.post=()=>{ctx.save();ctx.globalAlpha=.9;tent(J.x,J.y,(J.x+q.x)/2,J.y-60,(J.x+q.x)/2,q.y-140,q.x,q.y-120,3,.8);ctx.restore();ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);ctx.scale(q.sc,q.sc);PDRAW.head(.85);ctx.restore()}}
}

