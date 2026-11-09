/* ---------- Form II gameplay: L'Éclaté ---------- */
/* Last assault of form II (implode): provisional values. charge = pieces converge to the core from t0 to tb (pull = share of the way), glow floor/rise, growing tremor (shake px, rumble screen), quiet = still instant before the blast, squeeze = contraction of the core;
   blast at tb: wave reaches the Watcher (reach x distance, in waveT of the 1.1 s), flash, spray. No timing change (ta, tb unchanged). */
const IMPLODE_FX={pull:.97,glowMin:.35,shake:3,rumble:6,quiet:.18,squeeze:.25,reach:1.15,waveT:.55,flashT:.2,sprayN:50,sprayV:13,shake2:14};
function drawP(k,x,y,r,heat,sc){ctx.save();ctx.translate(x,y);ctx.rotate(r||0);if(sc)ctx.scale(sc,sc);PDRAW[k](heat==null?.85:heat);ctx.restore()}
function tent(x0,y0,cx1,cy1,cx2,cy2,x1,y1,w,on){ctx.lineCap='round';ctx.strokeStyle='rgba(4,20,26,.9)';ctx.lineWidth=w+3;ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(cx1,cy1,cx2,cy2,x1,y1);ctx.stroke();
  ctx.strokeStyle=`rgba(111,232,255,${.55*on+.15})`;ctx.lineWidth=w*.45;ctx.stroke();
  for(let d=1;d<6;d++){const t=d/6,m=1-t;ell(m*m*m*x0+3*m*m*t*cx1+3*m*t*t*cx2+t*t*t*x1,m*m*m*y0+3*m*m*t*cy1+3*m*t*t*cy2+t*t*t*y1,1.6,1.6,`rgba(200,255,255,${.5*on})`)}}
function base(){ell(LX,GY+8,160,18,'#050e12');for(const r of RIBS){ctx.strokeStyle='#0a1418';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(r.x,GY+4);ctx.quadraticCurveTo(r.x+r.l*10,GY-r.h,r.x+r.l*26,GY-r.h*.9);ctx.stroke()}}
const RINGS=TOWER.map((p,i)=>p.k==='ring'?i:-1).filter(i=>i>=0);
const SBELLS=TOWER.map((p,i)=>p.k==='sbell'?i:-1).filter(i=>i>=0);
const MOV=TOWER.map((p,i)=>(p.k==='ring'||p.k==='seg'||p.k==='sbell')?i:-1).filter(i=>i>=0);
function P3b(stage,f,b,final,rage){
  const T=[],BF=BEACON_FX,Q=PD(),TL=Q.tell;let t=b,sp='';   // TL: x on the warning times (PHARE_DIFF)
  const ring=n=>{const t0=t;for(let i=0;i<n;i++){const s=t0+i*.34*f;S.ringNext=((S.ringNext||0)+1)%6;T.push({k:'ring',t0:s,tl:s+.5*TL*f,ti:s+(.5*TL+.45)*f,ri:S.ringNext})}t=t0+(n-1)*.34*f+1.35*f;sp='ring'};
  // the anchor: a sweep (hold), the Watcher releases, the chain rings as the anchor lifts, then the blow (tap): "hold... release... tap"
  const moon=()=>{const A=BF.anchor,ts=t+.9*TL*f,D=1.25*f,e=ts+D;T.push({k:'moon',t0:t,ts,D,ta:ts+D*((1000-(HX+90))/1080),tb:ts+D*((1000-(HX-70))/1080),hold:true});
    T.push({k:'anch',t0:e,tl:e+A.rel*f,ti:e+(A.rel+A.lift)*f,real:true});t=e+(A.rel+A.lift+.45)*f;sp='anchor'};
  // the beam played twice (there and back), `cross.dark` s of black between the two to let go
  // Hard signature (sig, Part 2 only): a bolt lands `sig.at` s after the end of the first sweep: release, tap, hold again
  const cross=sig=>{for(let i=0;i<2;i++){const ts=t+.75*TL*f,D=1.25*f;T.push({k:'lbeam',side:i?0:1,t0:t,ts,D,ta:ts+D*((940-HX-80)/1000),tb:ts+D*((940-HX+80)/1000),hold:true});
    if(sig&&!i){const Z=BF.bolt,ti=ts+D+BF.sig.at*f;T.push({k:'bolt',t0:ti-(Z.tell*TL+Z.fly)*f,tell:Z.tell*TL*f,ti,real:true,seed:Math.random(),side:Math.random()<.5?0:1})}
    t=ts+D+(i?0:Q.crossDark*f)}t+=.7*f;sp='cross'};
  // the big bell (hold): its shadow grows on the Watcher, three blows each with a visible ring
  const trap=()=>{const Z=BF.bell,span=bellSpan(Q),ta=t+Z.ta*TL*f;T.push({k:'trap',t0:t,tl:t+Z.tl*TL*f,ta,tb:ta+span*f,hold:true,blows:Q.blows,step:Z.step*f});t=ta+span*f+Z.after*f;sp='bell'};
  // the shard of the tower (hold): a glow climbs in the cracks, then the blast
  const burstOut=()=>{const Z=BF.shard,g=Z.glow*TL;T.push({k:'burst',t0:t,ta:t+g*f,tb:t+(g+Z.blast)*f,hold:true});t+=(g+Z.blast+.5)*f;sp='shard'};
  const reform=()=>{const tr=t+.9*TL*f,ts=tr+.35*f,D=1.5*f;T.push({k:'reform',t0:t,tr,ts,D,ta:ts+D*((940-HX-80)/1000),tb:ts+D*((940-HX+80)/1000),hold:true});const td=ts+D+.5*f;T.push({k:'disp',t0:ts+D,ti:td,rf:1});t=td+.7*f;sp='cross'};
  // sound wave (tap per wave): 4-6 concentric waves, the delay between them shrinking
  const sonic=()=>{const Z=BF.sonic,N=Q.sonic,n=N.n[0]+Math.floor(Math.random()*(N.n[1]-N.n[0]+1));let s=t+Z.first*f,d=Z.d0;for(let i=0;i<n;i++){T.push({k:'sonic',t0:s-Z.fly*TL*f,ti:s});s+=d*f;d*=N.shrink}t=s+.3*f;sp='sonic'};
  // rage, the bell storm (kept in the rotation): rings fired in turn from the two side lanterns (taps), then the trap bell (hold)
  const storm=()=>{const Q=SP.storm;for(let i=0;i<Q.n;i++){const s=t+i*Q.gap*f;T.push({k:'sring',side:i%2,t0:s,tl:s+Q.tl*f,ti:s+Q.ti*f})}t+=(Q.n-1)*Q.gap*f+Q.ti*f+Q.trapGap*f;
    T.push({k:'trap',t0:t,tl:t+Q.trapTl*f,ta:t+Q.trapTa*f,tb:t+Q.trapTb*f,hold:true});t+=Q.trapTb*f+Q.after*f;sp='bell'};
  // rage 1, Bell storm: a rhythmic rain of small bells (taps). Hard rage 2: the big bell (hold), then the waves (taps)
  const rain=()=>{const Z=BF.rain;let s=t+.5*f;for(let i=0;i<Z.n;i++){T.push({k:'sbl',t0:s-Z.fall*TL*f,tl:s-Z.fall*TL*f+.15*f,ti:s,x:HX+20+((i*7)%3-1)*14});s+=Z.pattern[i%Z.pattern.length]*f}t=s+.2*f;sp='rain'};
  const bellWaves=()=>{trap();sonic()};
  // rage 3, Knell: n knells at a tempo that slows down (taps), the last one is held in a bubble (the implosion) then released as a wave that breaks the bell
  const glas=()=>{const Z=BF.glas;let s=t+Z.pre*f,d=Z.g0;for(let i=0;i<Q.glas;i++){T.push({k:'sbl',knell:1,t0:s-Z.fall*TL*f,tl:s-Z.fall*TL*f+.1*f,ti:s,x:HX+12});s+=d*f;d*=Z.k}
    T.push({k:'implode',t0:s-d/Z.k*f+.2*f,ta:s-d/Z.k*f+1.9*f,tb:s-d/Z.k*f+2.5*f,hold:true});t=s-d/Z.k*f+3*f;sp='glas'};
  if(rage){(rage>1?bellWaves:rain)();T.spell=sp;return T}
  if(final){glas();T.spell=sp;return T}
  const p0=[()=>ring(3),moon,trap,()=>{ring(2);trap()},cross,burstOut,reform];
  const p1=[()=>ring(5),()=>{moon();ring(3)},()=>{trap();trap()},()=>{cross();ring(2)},()=>{burstOut();moon()},()=>{ring(3);cross()},()=>{reform();ring(2)},storm,sonic];
  if(Q.sig)p1.push(()=>cross(true));   // Hard signature, in the normal rotation (not in the rages)
  pick(stage?p1:p0)();
  T.spell=sp;return T;
}
function beamFrom(ox,oy,bx,a){const g=ctx.createLinearGradient(ox,oy,bx,GY);g.addColorStop(0,`rgba(220,252,255,${.85*a})`);g.addColorStop(1,`rgba(110,230,255,${.28*a})`);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(ox-7,oy);ctx.lineTo(ox+7,oy);ctx.lineTo(bx+70,GY+16);ctx.lineTo(bx-70,GY+16);ctx.closePath();ctx.fill();ell(bx,GY+4,80,11,`rgba(200,250,255,${.25*a})`)}
function drawEclGame(){
  const T=S.ecPhi/.55,P=ecPose(T),A0=ecAnchor(T);let A=A0;
  let J={x:LX,y:ECY+Math.sin(rt*1.1)*4,r:44};
  if(S.angerShown){RINGS.forEach((idx,i)=>{if(i%2){const a=-S.ecPhi*1.3+i*2*Math.PI/7;P[idx]={x:LX+Math.cos(a)*140,y:ECY+Math.sin(a)*46,r:a*.5,z:Math.sin(a)}}})}
  let reBeam=null,sw=1;
  for(const th of S.threats){if(gt<th.t0)continue;
    if(th.k==='reform'){const d=S.threats.find(x=>x.k==='disp'&&x.t0===th.ts+th.D);const end=d?d.ti:th.ts+th.D+.5;
      const k=gt<th.tr?eio(clamp((gt-th.t0)/(th.tr-th.t0),0,1)):gt<end-.3?1:1-ein(clamp((gt-(end-.3))/.3,0,1));
      if(gt<end+.05){TOWER.forEach((p,i)=>{const e=p.e;P[i]={x:lerp(P[i].x,e.x,k),y:lerp(P[i].y,e.y,k),r:lerp(P[i].r,e.r,k),z:lerp(P[i].z||0,0,k),sc:P[i].sc}});A={x:lerp(A.x,LX+118,k),y:lerp(A.y,GY-150,k),a:lerp(A.a,1.78,k),sc:lerp(A.sc,1,k),z:-2.5,clip:k>.9};J={x:LX,y:lerp(J.y,LY,k),r:lerp(J.r,36,k)};sw=1-k;
        if(gt>=th.ts&&gt<=th.ts+th.D)reBeam=(gt-th.ts)/th.D;
        if(k>.95&&!th.sf){th.sf=1;MUSIC.fx('clank');MUSIC.fx('ignite')}}}
    if(th.k==='disp'&&th.done&&!th.sf){th.sf=1;S.shake=12;burst(LX,GY-200,40,'#9ff2ff',8,.9);MUSIC.fx('bellCascade')}
    if(th.k==='implode'){const IF=IMPLODE_FX,c=clamp((gt-th.t0)/(th.tb-th.t0),0,1),pre=ein(c),calm=gt>=th.tb-IF.quiet&&gt<th.tb,post=gt>th.tb?clamp((gt-th.tb)/1.1,0,1):0;   // charge t0 -> tb, then a still instant, then the blast at tb
      for(const idx of MOV){const o=P[idx];if(post===0)P[idx]={...o,x:lerp(o.x,J.x,IF.pull*pre)+(calm?0:Math.sin(gt*50+idx)*IF.shake*c),y:lerp(o.y,J.y,IF.pull*pre)};else{const s=Math.sin(Math.PI*post)*(1-post*.3);P[idx]={...o,x:J.x+(o.x-J.x)*(1+2.2*s),y:J.y+(o.y-J.y)*(1+2.2*s)}}}
      J={...J,r:post===0?J.r*(1-IF.squeeze*pre):J.r*(1-IF.squeeze+(IF.squeeze+.4)*Math.min(1,post*4)*(1-post))};S.shake=Math.max(S.shake,calm?0:c*(1-post)*IF.rumble);
      if(post>0&&!th.bf){th.bf=1;S.shake=22;S.flashT=gt;burst(J.x,J.y,70,'#e8fdff',11,1.1);burst(J.x,J.y,IMPLODE_FX.sprayN,'#ffffff',IMPLODE_FX.sprayV,1.4,.1);MUSIC.fx('explosion')}
      if(post>0&&post<.45){const e=eout(post/.45),hq=P[EHEAD];ctx.save();ctx.globalCompositeOperation='lighter';   // the last knell, released: a yellow-white wave goes from the Watcher to the bell
        ctx.strokeStyle=`rgba(${COUNTER3.col},${1-.4*e})`;ctx.lineWidth=7*(1-e*.5);ctx.beginPath();ctx.ellipse(lerp(HX+12,hq.x,e),lerp(GY-90,hq.y,e),30+40*e,70+20*e,0,-Math.PI*.45,Math.PI*.45);ctx.stroke();ctx.restore()}
      if(post>=.45){const hq=P[EHEAD];ctx.save();ctx.translate(hq.x,hq.y);ctx.rotate(hq.r||0);ctx.scale(hq.sc||1,hq.sc||1);ctx.strokeStyle=`rgba(${COUNTER3.col},.95)`;ctx.lineWidth=2.4;crackLine(CRACK,clamp((post-.45)/.2,0,1));ctx.restore();   // the bell breaks
        if(!th.gf){th.gf=1;burst(hq.x,hq.y,26,'#fff3c4',8,.8,.3)}}
      if(post>0&&post<1){const IF=IMPLODE_FX,dist=Math.hypot(HX+20-J.x,GY-80-J.y),rw=dist*IF.reach*eout(clamp(post/IF.waveT,0,1));ctx.save();ctx.globalCompositeOperation='lighter';
        if(post<IF.flashT)glow(J.x,J.y,260*(1-post/IF.flashT)+60,'rgba(255,255,255,.95)',1-post/IF.flashT);   // the flash of the blast
        ctx.strokeStyle=`rgba(200,245,255,${1-post*.7})`;ctx.lineWidth=12*(1-post)+2;ctx.beginPath();ctx.arc(J.x,J.y,rw,0,Math.PI*2);ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle=`rgba(255,255,255,${1-post})`;ctx.beginPath();ctx.arc(J.x,J.y,rw*.92,0,Math.PI*2);ctx.stroke();
        if(rw>=dist&&!th.hf){th.hf=1;S.shake=Math.max(S.shake,IF.shake2);burst(HX+20,GY-80,30,'#e8fdff',9,.8)}   // the wave reaches the Watcher
        if(th.hf){const u=clamp((post-IF.waveT/IF.reach)/.4,0,1);glow(HX+20,GY-80,120*(1-u)+40,'rgba(220,250,255,.9)',.8*(1-u))}ctx.restore()}}
  }
  const on=1;
  const hit={x:HX+20,y:GY-80},tells=[],bolts=[],beams=[],fx=[],srings=[],sonics=[],sbls=[];let trapQ=null;
  for(const th of S.threats){
    if(gt<th.t0)continue;
    if(th.done&&th.res==='ok'&&!th.sfx){th.sfx=1;if(th.k==='ring')MUSIC.fx('bellHit');if(th.k==='trap')MUSIC.fx('bellBig')}
    if(th.k==='ring'){const idx=RINGS[th.ri%6],o=P[idx];let q;
      if(gt<th.tl){q=o;tells.push([o.x,o.y,(gt-th.t0)/(th.tl-th.t0)])}
      else if(!th.done){const k=clamp((gt-th.tl)/(th.ti-th.tl),0,1);q={x:lerp(o.x,hit.x,ein(k)),y:lerp(o.y,hit.y,ein(k))-Math.sin(Math.PI*k)*30,r:o.r+k*8,z:2}}
      else{const k=eio(clamp((gt-th.okT)/.7,0,1)),from=th.res==='ok'?{x:hit.x+110,y:hit.y-90}:hit;q={x:lerp(from.x,o.x,k),y:lerp(from.y,o.y,k),r:o.r,z:k<1?2:o.z}}
      P[idx]=q}
    else if(th.k==='trap'){const o=P[EHEAD],hov={x:HX+12,y:GY-250},grd={x:HX+12,y:GY+2},ti=th.hold?th.ta:th.ti;let q;
      if(!th.done&&gt<ti){const sh=clamp((gt-th.t0)/(ti-th.t0),0,1);ell(HX+12,GY+3,20+90*sh,6+14*sh,`rgba(0,0,0,${.2+.4*sh})`)}   // the shadow of the bell grows on the Watcher
      if(th.hold)for(let i=0;i<(th.blows||1);i++){const w=(gt-(th.ta+i*(th.step||0)))/.4;if(w>=0&&w<1)fx.push(['ring',HX+12,GY-30,w])}   // a ring for each blow
      if(gt<th.tl){const k=eio(clamp((gt-th.t0)/(th.tl-th.t0),0,1));q={x:lerp(o.x,hov.x,k),y:lerp(o.y,hov.y,k)+Math.sin(gt*8)*3*k,r:lerp(Math.PI,0,k),z:2,sc:lerp(1,2.3,k)}}
      else if(!th.done){const k=ein(clamp((gt-th.tl)/(ti-th.tl),0,1));q={x:hov.x,y:lerp(hov.y,grd.y,k)+(gt>ti?Math.sin(gt*40)*2:0),r:0,z:2,sc:2.3};if(gt>ti)S.shake=Math.max(S.shake,3)}
      else{const d=gt-th.okT,hold=th.res==='hit'?.5:0,k=eio(clamp((d-hold)/.8,0,1)),from=th.res==='ok'?{x:hov.x+70,y:hov.y-30}:grd;
        q={x:lerp(from.x,o.x,k),y:lerp(from.y,o.y,k),r:lerp(0,Math.PI,k),z:2,sc:lerp(2.3,1,k)};
        if(th.res==='hit'&&d<.7)fx.push(['toll',grd.x,grd.y-90,d/.7])}
      if(q.sc>1.4){trapQ=q;q={...q,hide:true}}
      P[EHEAD]=q}
    else if(th.k==='burst'){const pre=clamp((gt-th.t0)/(th.ta-th.t0),0,1),post=gt>th.ta?clamp((gt-th.ta)/1.1,0,1):0;
      if(post===0)for(const idx of MOV)if(idx%2===0)tells.push([P[idx].x,P[idx].y,pre*pre]);   // the glow climbs in the cracks of the tower
      if(post>0&&!th.bf){th.bf=1;S.shake=14;burst(J.x,J.y,40,'#bff6ff',9,.9);MUSIC.fx('bellCascade')}
      for(const idx of MOV){const o=P[idx];if(post===0)P[idx]={...o,x:lerp(o.x,J.x,.55*eio(pre))+Math.sin(gt*40+idx)*2*pre,y:lerp(o.y,J.y,.55*eio(pre))};else{const s=Math.sin(Math.PI*post)*(1-post*.3);P[idx]={...o,x:J.x+(o.x-J.x)*(1+1.8*s),y:J.y+(o.y-J.y)*(1+1.8*s)}}}
      if(post>0&&post<1)fx.push(['wave',J.x,J.y,post])}
    else if(th.k==='implode'){const IF=IMPLODE_FX,c=clamp((gt-th.t0)/(th.tb-th.t0),0,1);if(gt<th.tb){const a=IF.glowMin+(1-IF.glowMin)*c;for(const idx of MOV)tells.push([P[idx].x,P[idx].y,a]);tells.push([J.x,J.y,a],[J.x,J.y,a*c])}}   // the glow rises on the pieces and on the core (floor from the start)
    else if(th.k==='moon'){const st={x:1000,y:GY-60};
      if(gt<th.ts){const k=eio(clamp((gt-th.t0)/(th.ts-th.t0),0,1));A={x:lerp(A0.x,st.x,k),y:lerp(A0.y,st.y,k),a:A0.a+k*2,sc:lerp(A0.sc,.85,k),z:3};tells.push([A.x,A.y,k])}
      else if(gt<=th.ts+th.D){const s=(gt-th.ts)/th.D;A={x:1000-1080*s,y:GY-60-Math.sin(s*Math.PI)*20,a:s*Math.PI*7,sc:.85,z:3};if(!th.wf){th.wf=1;MUSIC.fx('whoosh')}}
      else{const k=eio(clamp((gt-th.ts-th.D)/.8,0,1));A={x:lerp(-80,A0.x,k),y:lerp(GY-60,A0.y,k),a:A0.a,sc:lerp(.85,A0.sc,k),z:k<1?3:A0.z}}}
    else if(th.k==='anch'&&gt>=th.tl){const L=th.ti-th.tl,up=L-.3;let ax,ay;   // after the sweep: the chain rings, the anchor lifts, then falls on the Watcher (tap)
      if(!th.sf){th.sf=1;MUSIC.fx('chainSlip');burst(LX+60,GY-150,6,'#e8d8a8',3,.4)}
      if(!th.done){const lk=gt<th.tl+up?eio((gt-th.tl)/up):1,dp=gt<th.tl+up?0:ein((gt-th.tl-up)/.3);ax=lerp(A0.x,HX+40,lk);ay=lerp(A0.y,GY-300,lk)+dp*230}
      else{const q=eio(clamp((gt-th.okT)/.8,0,1)),fy=th.res==='ok'?GY-300:GY-70;ax=lerp(HX+40,A0.x,q);ay=lerp(fy,A0.y,q)}
      A={x:ax,y:ay,a:A0.a,sc:.9,z:3}}
    else if(th.k==='bolt')bolts.push(th);
    else if(th.k==='sonic')sonics.push(th);
    else if(th.k==='sbl')sbls.push(th);
    else if(th.k==='lbeam')beams.push(th);
    else if(th.k==='sring')srings.push(th);
  }
  drawEcl(P,A,J,1,on,null,null,sw);
  if(reBeam!=null){ctx.save();ctx.globalCompositeOperation='lighter';beamShape(940-1000*reBeam,1);ctx.restore()}
  ctx.save();ctx.globalCompositeOperation='lighter';
  // side beams and storm rings leave from the side lanterns, held where the shoulder bells were (P[SBELLS], see drawEcl)
  for(const th of beams){const o=P[SBELLS[th.side]];
    if(gt<th.ts){const k=(gt-th.t0)/(th.ts-th.t0);glow(o.x,o.y,60,'rgba(110,235,255,.9)',.4+.5*k);beamFrom(o.x,o.y,940,.12+.25*k)}
    else if(gt<=th.ts+th.D){const s=(gt-th.ts)/th.D;beamFrom(o.x,o.y,940-1000*s,1);glow(o.x,o.y,70,'rgba(200,250,255,.9)',.8)}}
  // Hard signature: a bolt from a shoulder bell (crackle = the tell, tap), as in form I
  for(const th of bolts){const o=P[SBELLS[th.side]];
    if(!th.done){const k=clamp((th.ti-gt)/(th.ti-th.t0),0,1);ctx.strokeStyle=`rgba(180,250,255,${.85-k*.4})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(HX,GY,24+60*k,6+14*k,0,0,Math.PI*2);ctx.stroke();crackle(o,clamp((gt-th.t0)/(th.ti-th.t0),0,1))}
    else if(gt-th.okT<.22)bolt(o.x,o.y,th.res==='ok'?HX+6:HX,th.res==='ok'?GY-150:GY-40,th.seed,'rgba(220,250,255,.95)',4)}
  for(const t of tells)glow(t[0],t[1],46,'rgba(200,250,255,.95)',.9*t[2]);
  // rings of the bell storm, from the two side lanterns in turn (th.side alternates)
  for(const th of srings){const o=P[SBELLS[th.side]];
    if(gt<th.tl){const k=(gt-th.t0)/(th.tl-th.t0);glow(o.x,o.y,56,'rgba(110,235,255,.9)',.3+.6*k);ctx.strokeStyle=`rgba(220,252,255,${k})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,30-18*k,0,Math.PI*2);ctx.stroke();continue}
    let x,y,a=1,rr=16;
    if(!th.done){const k=ein(clamp((gt-th.tl)/(th.ti-th.tl),0,1));x=lerp(o.x,hit.x,k);y=lerp(o.y,hit.y,k)-Math.sin(Math.PI*k)*40;rr=14+12*k}
    else{const q=(gt-th.okT)/.35;if(q>=1)continue;a=1-q;x=hit.x+(th.res==='ok'?40*q:0);y=hit.y-(th.res==='ok'?50*q:0);rr=26+30*q;if(!th.bf){th.bf=1;burst(hit.x,hit.y,th.res==='ok'?16:8,'#dff8ff',5,.5)}}
    ctx.globalAlpha=a;glow(x,y,rr*2.2,'rgba(110,235,255,.9)',.6);ctx.strokeStyle='#eafcff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,y,rr,rr*.55,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(110,235,255,.8)';ctx.lineWidth=8;ctx.globalAlpha=a*.4;ctx.stroke();ctx.globalAlpha=1}
  for(const e of fx){if(e[0]==='ring'){ctx.strokeStyle=`rgba(255,246,204,${.9*(1-e[3])})`;ctx.lineWidth=5*(1-e[3])+1;ctx.beginPath();ctx.ellipse(e[1],e[2],30+110*e[3],(30+110*e[3])*.5,0,0,Math.PI*2);ctx.stroke()}
    else if(e[0]==='wave'){ctx.strokeStyle=`rgba(200,245,255,${1-e[3]})`;ctx.lineWidth=6*(1-e[3])+1;ctx.beginPath();ctx.arc(e[1],e[2],e[3]*700,0,Math.PI*2);ctx.stroke()}
    else{ctx.strokeStyle=`rgba(255,200,120,${.8*(1-e[3])})`;ctx.lineWidth=3;for(let i=0;i<3;i++){const r=30+((e[3]*90+i*30)%90);ctx.beginPath();ctx.arc(e[1],e[2],r,Math.PI*.15,Math.PI*.85,true);ctx.stroke()}}}
  ctx.restore();
  // sound waves (tap per wave): concentric crescents coming from the tower; small bells and knells falling on the Watcher (taps)
  for(const th of sonics){const u=clamp((gt-th.t0)/(th.ti-th.t0),0,1),x=lerp(LX-60,hit.x,eout(u));
    if(th.done){const q=(gt-th.okT)/.3;if(q>=1)continue;ctx.save();ctx.globalAlpha=1-q;ctx.strokeStyle=th.res==='ok'?`rgb(${COUNTER3.col})`:'#eafcff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(hit.x,hit.y,20+50*q,0,Math.PI*2);ctx.stroke();if(th.res==='ok'){ctx.lineWidth=2;ctx.beginPath();ctx.arc(hit.x,hit.y,10+30*q,0,Math.PI*2);ctx.stroke()}ctx.restore();if(!th.bf){th.bf=1;burst(hit.x,hit.y,th.res==='ok'?12:8,'#dff8ff',5,.5)}continue}
    ctx.save();for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(190,240,255,${.8-i*.2})`;ctx.lineWidth=4-i;ctx.beginPath();ctx.ellipse(x+i*14,hit.y,16+i*5,70+i*6,0,Math.PI*.55,Math.PI*1.45);ctx.stroke()}ctx.restore()}
  for(const th of sbls){const sc=th.knell?1.5:1;
    if(gt<th.tl){const u=(gt-th.t0)/(th.tl-th.t0);ctx.save();ctx.globalCompositeOperation='lighter';glow(th.x,26,30*sc,'rgba(200,250,255,.9)',.6*u);ctx.restore();continue}
    if(th.done){const q=(gt-th.okT)/.35;if(q>=1)continue;ctx.save();ctx.globalAlpha=1-q;ctx.strokeStyle='#eafcff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(hit.x,hit.y,24+60*q,(24+60*q)*.55,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      if(!th.bf){th.bf=1;burst(hit.x,hit.y,th.res==='ok'?14:8,'#dff8ff',5,.5);MUSIC.fx(th.knell?'bellBig':'bellHit')}continue}
    drawP('sbell',th.x,lerp(-30,hit.y-30,ein(clamp((gt-th.tl)/(th.ti-th.tl),0,1))),Math.sin(gt*9+th.ti)*.25,.85,sc)}
  if(trapQ){const q=trapQ;S.post=()=>{ctx.save();ctx.globalAlpha=.9;tent(J.x,J.y,(J.x+q.x)/2,J.y-60,(J.x+q.x)/2,q.y-140,q.x,q.y-120,3,.8);ctx.restore();ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);ctx.scale(q.sc,q.sc);PDRAW.head(.85);ctx.restore()}}
}

