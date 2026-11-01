/* ---------- Form II: L'Éclaté ---------- */
const ECY=GY-200;
/* form II: the three torso bells left standing on the reef, stacked (mouth heights) */
const STUMP={tb0:GY,tb1:GY-50,tb2:GY-94};
/* where the Lighthouse's bell comes to rest at the end of phase III (mouth centre, tilt) */
const BELL_REST={x:LX-150,y:GY-10,r:-.28};
function ecPose(T){let ri=0,si=0,bi=0;return TOWER.map(p=>{
  if(p.k.startsWith('tb'))return{x:p.e.x,y:STUMP[p.k],r:Math.sin(T*.6)*.04,z:-3};
  if(p.k==='fist'||p.k==='harp')return{x:p.e.x,y:p.e.y,r:p.e.r,z:-3};
  if(p.k==='ring'){const a=T*.55+ri*2*Math.PI/7;ri++;return{x:LX+Math.cos(a)*112,y:ECY+Math.sin(a)*36,r:a*.5,z:Math.sin(a)}}
  if(p.k==='seg'){const a=-T*.7+si*Math.PI/2;si++;return{x:LX+Math.cos(a)*168,y:ECY+28+Math.sin(a)*44,r:a,z:Math.sin(a)}}
  if(p.k==='sbell'){const s=bi?1:-1;bi++;return{x:LX+s*(142+Math.sin(T+s)*8),y:ECY-96+Math.cos(T*1.2+s)*8,r:-s*Math.PI/2,z:.5}}
  return{x:LX,y:ECY-132+Math.sin(T*1.3)*5,r:Math.PI,z:.5}})}
function ecAnchor(T){const a=T*.4;return{x:LX+Math.cos(a)*190,y:ECY+72+Math.sin(a)*46,a:a+2,sc:.7,z:Math.sin(a)}}
function ecGap(T){const a=T*.55+12*Math.PI/7;return{x:LX+Math.cos(a)*112,y:ECY+Math.sin(a)*36}}
function drawAnchorQ(q){ctx.save();if(q.clip){ctx.beginPath();ctx.rect(0,0,W,GY+6);ctx.clip()}ctx.translate(q.x,q.y);ctx.scale(q.sc,q.sc);drawAnchor(0,0,Math.cos(q.a),Math.sin(q.a),0);ctx.restore()}
function drawEcl(P,A,J,tentA,on,gapQ){
  base();
  if(J)glow(J.x,J.y,260,'rgba(90,220,255,.55)',.6*on+.05);
  const link=(x,y,front)=>{if(!J||tentA<=0)return;ctx.save();ctx.globalAlpha=tentA;tent(J.x,J.y,(J.x+x)/2,J.y+(front?30:-40),(J.x+x)/2,y,x,y,3,front?.9:.6);ctx.restore()};
  const order=P.map((q,i)=>i).sort((a,b)=>P[a].z-P[b].z);
  const piece=i=>{const q=P[i],k=TOWER[i].k;if(q.hide)return;if(!FIXED(k))link(q.x,q.y,q.z>=0);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);if(q.sc)ctx.scale(q.sc,q.sc);PDRAW[k](.85,q.o);ctx.restore()};
  order.filter(i=>P[i].z<0).forEach(piece);
  if(A&&A.z<0){link(A.x,A.y,false);drawAnchorQ(A)}
  if(J){jelly(J.x,J.y,J.r,on,rt);
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2+rt*.3;ctx.save();ctx.globalAlpha=Math.max(.25,tentA);tent(J.x,J.y+10,J.x+Math.cos(a)*60,J.y+40+Math.sin(a)*30,J.x+Math.cos(a)*90,J.y+90,J.x+Math.cos(a)*100+Math.sin(rt*2+k)*14,J.y+140,3,.8*on);ctx.restore()}}
  if(gapQ){ctx.save();ctx.globalCompositeOperation='lighter';glow(gapQ.x,gapQ.y,60,'rgba(255,255,255,.9)',.8);ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(gapQ.x,gapQ.y,22+Math.sin(rt*10)*3,0,Math.PI*2);ctx.stroke();ctx.restore()}
  order.filter(i=>P[i].z>=0).forEach(piece);
  if(A&&A.z>=0){link(A.x,A.y,true);drawAnchorQ(A)}
}
function drawEclIdle(T){drawEcl(ecPose(T),ecAnchor(T),{x:LX,y:ECY+Math.sin(T*1.1)*4,r:44*(1+Math.sin(T*2.6)*.1)},1,1,null)}
/* finale timing: the orbit stops with the gap facing the Watcher */
const EPHI05=Math.PI-12*Math.PI/7;
function ePhi(t){if(t<.6)return EPHI05+.55*(t-.5);const d=Math.min(t-.6,1.2);return EPHI05+.055+.55*(d-d*d/2.4)}
const EFALL=(()=>{const O=ecPose(ePhi(5)/.55),R=mulberry(73),out={};let rank=0;
  TOWER.forEach((p,i)=>{if(FIXED(p.k))return;const o=O[i];let x=clamp(o.x+(o.x-LX)*.35+(R()-.5)*30,360,945),y=GY-13,r=(R()-.5)*.5;
    if(p.k==='sbell'){y=GY-34;r=(o.x<LX?-1:1)*Math.PI/2}else if(p.k==='seg'){y=GY-10;r=(R()-.5)*.3}else if(p.k==='head'){x=BELL_REST.x;y=BELL_REST.y;r=BELL_REST.r}
    out[i]={x,y,r,ft:p.k==='head'?3:2.2+rank*.08};rank++});return out})();
const EHEAD=TOWER.findIndex(p=>p.k==='head');
/* the bell after the last blow: cracked, lying in the wreckage, the word engraved in clear (o.word) */
const bellMarks=()=>({crack:true,word:_('Crown','Couronne')});
function ecTransition(t){
  const lean=t<2.1?.05*eio(clamp(t/1.2,0,1)):0;
  if(t<2.1){
    const on=t<.4?1-t/.4:t<1.6?(t>1.3&&Math.sin(t*40)>.6?.3:0):1;
    if(t<.6)S.shake=Math.max(S.shake,2);
    base();ctx.save();ctx.translate(LX,GY);ctx.rotate(lean);ctx.translate(-LX,-GY);
    moorings(1);drawAnchorAt(anchorPose(null));drawPieces(null,.85);lamps(LX,LY,1);bindings(on,1);jelly(LX,LY,36*(t>1.6?1.15:1),on,rt);ctx.restore();
    if(t>=1&&once('pebble'))burst(LX+30,GY-210,14,'#8a7a6a',4,1,.4);
    if(t>=1.6&&once('relight')){S.flashT=gt;S.shake=6;burst(LX,LY,24,'#bff6ff',6,.6)}
    return}
  if(once('burst')){S.flashT=gt;S.shake=18;burst(LX,GY-220,60,'#9ff2ff',10,1.2);burst(590,GY,14,'#9a8a76',5,.7,.4);burst(945,GY,14,'#9a8a76',5,.7,.4)}
  const Tor=Math.max(0,t-3.4)*1.1,O=ecPose(Tor),A0=ecAnchor(Tor);
  const sc=eout(clamp((t-2.1)/.5,0,1)),gl=eio(clamp((t-3.4)/1.2,0,1)),C={x:LX,y:GY-200};
  const P=TOWER.map((p,i)=>{const o=O[i];if(FIXED(p.k))return o;const e=p.e;const dx=e.x-C.x,dy=e.y-C.y,l=Math.hypot(dx,dy)||1;
    const hx=lerp(e.x,e.x+dx/l*95,sc)+Math.sin(rt*2+i)*4*sc,hy=lerp(e.y,e.y+dy/l*95-30,sc)+Math.cos(rt*1.7+i)*4*sc,hr=e.r+sc*(i%2?.6:-.6);
    return{x:lerp(hx,o.x,gl),y:lerp(hy,o.y,gl),r:lerp(hr,o.r,gl),z:gl>.5?o.z:(i%2?.1:-.1)}});
  const ay=eout(clamp((t-2.4)/.5,0,1)),Ap={x:LX+118,y:GY-150,a:1.78},As={x:LX+215,y:GY-370,a:2.6};
  const Ah={x:lerp(Ap.x,As.x,ay),y:lerp(Ap.y,As.y,ay),a:lerp(Ap.a,As.a,ay),sc:lerp(1,.62,ay)};
  const A={x:lerp(Ah.x,A0.x,gl),y:lerp(Ah.y,A0.y,gl),a:lerp(Ah.a,A0.a,gl),sc:lerp(Ah.sc,A0.sc,gl),z:gl>.5?A0.z:1,clip:ay<.25};
  if(t>=2.4&&once('yank')){burst(LX+118,GY,26,'#dff8ff',6,.8,.4);S.shake=12}
  const J={x:LX,y:lerp(LY,ECY,eio(clamp((t-2.1)/1.2,0,1))),r:lerp(36,44,sc)};
  lamps(J.x,J.y,1-gl,sc);
  drawEcl(P,A,J,1,1,null);
}
function ecFinale(tAll){
  const OFF=2.2,t=tAll-OFF;
  const T=ePhi(t)/.55,O=ecPose(T),A0=ecAnchor(T),conv=t>.5&&t<2.2;
  const on=t<.5?1:t<2.2?(Math.sin(t*30)>0?1:.25):.6;
  if(t>5){STARS.forEach((s,i)=>{const a=clamp((t-5-i*.035)/.4,0,1);if(a>0)glow(s.x,s.y,7,'rgba(240,250,248,.95)',a*.9)});
}
  const P=TOWER.map((p,i)=>{const o=O[i];if(FIXED(p.k))return o;const F=EFALL[i],e=clamp((t-F.ft)/.5,0,1);
    if(e<=0)return conv?{...o,x:o.x+Math.sin(t*50+i)*2.5}:o;
    if(e>=1&&once('ef'+i)){burst(F.x,GY,12,'#dff8ff',5,.6,.4);S.shake=Math.max(S.shake,6)}
    return{x:lerp(o.x,F.x,e),y:lerp(o.y,F.y,ein(e)),r:lerp(o.r,F.r,e),z:e>=1?-2:o.z}});
  const ae=clamp((t-3.1)/.5,0,1),Apl={x:Math.abs(A0.x-LX)<130?LX+(A0.x<LX?-1:1)*135:A0.x,y:GY-120,a:1.78,sc:1};
  const A=ae<=0?A0:{x:lerp(A0.x,Apl.x,ae),y:lerp(A0.y,Apl.y,ein(ae))-Math.sin(Math.PI*ae)*50,a:lerp(A0.a,Apl.a,ae),sc:lerp(A0.sc,1,ae),z:-2.5,clip:ae>.6};
  if(ae>=1&&once('aplant')){S.shake=12;burst(Apl.x,GY,26,'#dff8ff',6,.8,.4)}
  let J=null;
  if(t<5.3){const fe=ein(clamp((t-3.6)/1.6,0,1));J={x:lerp(LX,LX-40,fe)+(conv?Math.sin(t*50)*4:0),y:lerp(ECY,GY-16,fe),r:lerp(44,18,fe)+(conv?Math.sin(t*40)*4:0)}}
  else if(once('dis'))evaporate(LX-40,GY-16);
  const tentA=1-clamp((t-2)/.4,0,1);
  if(t>=.5)P[EHEAD]={...P[EHEAD],o:bellMarks()};
  drawEcl(P,A,J,tentA,(S.zapT&&gt-S.zapT<.09&&t<.5)?.15:on,t>-.75&&t<.6?ecGap(T):null);
  ecFinisher(tAll,T,P);
  if(t>=.5&&once('hit')){S.flashT=gt;S.shake=26;burst(LX,ECY,70,'#ffffff',11,1.2);burst(LX,ECY,40,'#9fe4ff',8,1);pop(ONO.final,'#ffffff',LX,ECY-150)}
  S.heroDX=lerp(0,BELL_REST.x-HX-78,eio(clamp((t-6.4)/1.6,0,1)));
  if(t>9){const pu=.5+.5*Math.sin(t*3);glow(760,GY+56,40,'rgba(90,220,255,.9)',.5*pu*clamp((t-9)/.5,0,1))}
}

/* the Watcher's finisher: a chain of lightning, then a pillar through the window */
const ZAPS=[.5,.72,.94,1.16,1.38,1.6,1.8];
function ecFinisher(tAll,T,P){
  if(tAll>3.4){S.heroPose=null;return}
  const OFF=2.2,J={x:LX,y:ECY};
  const up=eio(clamp(tAll/.4,0,1)),th=eout(clamp((tAll-1.95)/.2,0,1));
  S.heroPose=tAll<1.95?{staffA:lerp(-1.42,-1.86,up),lean:-.06*up}:{staffA:lerp(-1.86,-.5,th),lean:.12*th};
  const ox=S.orbX||HX+40,oy=S.orbY||GY-200;
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(tAll<OFF+.6){glow(ox,oy,60+30*Math.sin(tAll*30),'rgba(200,240,255,.9)',.8);for(let k=0;k<3;k++){const a=Math.random()*Math.PI*2;bolt(ox,oy,ox+Math.cos(a)*45,oy+Math.sin(a)*45,Math.random(),'rgba(200,245,255,.8)',1.5)}}
  const rings=TOWER.map((p,i)=>p.k==='ring'?i:-1).filter(i=>i>=0);
  ZAPS.forEach((s0,i)=>{const d=tAll-s0;
    if(d>=0&&once('zap'+i)){S.zapT=gt;S.shake=Math.max(S.shake,8+i*1.5);burst(J.x,J.y,16+i*3,'#e8fdff',6,.5)}
    if(d<0||d>.2)return;ctx.globalAlpha=1-d/.2;const w=3+i*.6;
    if(i%2===0){const x0=J.x+((i*97)%220-110);bolt(x0,0,J.x,J.y-20,i*.137,'rgba(235,252,255,.97)',w);bolt(lerp(x0,J.x,.5),J.y/2,lerp(x0,J.x,.5)+(i%4?60:-60),J.y*.7,i*.31,'rgba(190,240,255,.8)',w*.5)}
    else{const a=P[rings[i%6]],b=P[rings[(i+3)%6]];bolt(ox,oy,a.x,a.y,i*.11,'rgba(235,252,255,.97)',w);bolt(a.x,a.y,b.x,b.y,i*.23,'rgba(210,248,255,.9)',w*.8);bolt(b.x,b.y,J.x,J.y,i*.41,'rgba(235,252,255,.97)',w);glow(a.x,a.y,40,'rgba(200,245,255,.9)',.8);glow(b.x,b.y,40,'rgba(200,245,255,.9)',.8)}
    glow(J.x,J.y,120,'rgba(220,250,255,.95)',.9*(1-d/.2));ctx.globalAlpha=1});
  // the storm gathers on the jellyfish
  if(tAll>1.95&&tAll<2.7){const g=(tAll-1.95)/.75;for(let k=0;k<6;k++){const a=k/6*Math.PI*2+tAll*3,r=200*(1-g)+30;bolt(J.x+Math.cos(a)*r,J.y+Math.sin(a)*r*.6,J.x,J.y,Math.random(),`rgba(200,245,255,${.4+g*.5})`,1.5+g*2)}glow(J.x,J.y,80+g*140,'rgba(220,250,255,.95)',.5+g*.5)}
  // the pillar: sky and staff together, through the window
  const q=tAll-2.7;
  if(q>=0&&q<.6){const a=1-q/.6,gp=ecGap(T);
    const pw=70*a;const g=ctx.createLinearGradient(J.x-pw,0,J.x+pw,0);g.addColorStop(0,'rgba(160,235,255,0)');g.addColorStop(.5,`rgba(255,255,255,${.95*a})`);g.addColorStop(1,'rgba(160,235,255,0)');ctx.fillStyle=g;ctx.fillRect(J.x-pw,0,pw*2,J.y+30);
    bolt(J.x,0,J.x,J.y,(q*12|0)/12,`rgba(255,255,255,${a})`,10*a+2);
    bolt(ox,oy,gp.x,gp.y,(q*14|0)/14,`rgba(235,252,255,${a})`,8*a+2);bolt(gp.x,gp.y,J.x,J.y,(q*9|0)/9,`rgba(235,252,255,${a})`,7*a+2);
    ctx.strokeStyle=`rgba(220,250,255,${a})`;ctx.lineWidth=8*a+1;ctx.beginPath();ctx.arc(J.x,J.y,q*1100,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=`rgba(127,214,255,${.8*a})`;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(J.x,GY,q*900,q*60,0,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
  if(S.zapT&&gt-S.zapT<.12&&tAll<2.7){ctx.fillStyle=`rgba(220,245,255,${.2*(1-(gt-S.zapT)/.12)})`;ctx.fillRect(0,0,W,H)}
}
const CSFX=(()=>{const L={'2:in':[[0,'glints'],[1.1,'swell'],[1.95,'crackGlass'],[2.4,'shatter'],[3.1,'sting']],
  '2:out':[[.3,'charge'],[1.45,'throw'],[1.75,'impactLight'],[1.8,'overload'],[3.1,'explosion'],[3.3,'glassRain'],[4.4,'voice'],[5.4,'rumble']],
  '1:in':[[0,'rumble'],[4.5,'heart'],[4.8,'draw'],[5.5,'whoosh'],[5.75,'slam'],[6.3,'sting']],
  '1:out':[[.6,'chainSlip'],[1.1,'plant'],[1.4,'tollLast'],[1.7,'heart'],[2.3,'crackRun'],[3.3,'rumble'],[4.75,'whooshDown'],[5.6,'iceCrack']],
  '3:in':[[1.6,'heart'],[3.5,'burst'],[3.7,'creature'],[9.2,'plant'],[9.3,'creature'],[10.1,'ignite'],[11.7,'beam'],[12.3,'sting']],
  '3:out':[[.5,'thunder'],[.7,'scream'],[4.4,'fallWhine'],[5,'stars'],[6,'dissolve'],[8.3,'sting']]};
  for(let i=0;i<5;i++)L['1:in'].push([.3+.8*(i+1),'step']);
  for(let j=0;j<9;j++)L['1:out'].push([3.3+j*.17,'chunk']);
  TOWER.forEach(p=>L['3:in'].push([1.5+p.t+(p.d||.9),'clank']));
  Object.values(FALL).forEach(F=>L['3:out'].push([F.ft+.55,'chunk']));
  return L})();
CSFX['3:out']=[[0,'charge'],...ZAPS.map(z=>[z,'zap']),[1.95,'swell'],[2.7,'thunder'],[2.72,'explosion'],[2.9,'scream'],[5.3,'whooshDown'],[5.75,'plant'],[5.9,'fallWhine'],[7.5,'dissolve'],[7.6,'stars'],[10.8,'sting']];Object.entries(EFALL).forEach(([i,F])=>{CSFX['3:out'].push([F.ft+2.7,'chunk']);CSFX['3:out'].push([F.ft+2.7,+i===EHEAD?'bellBig':'bellHit'])});CSFX['3:out'].push([5.75,'bellHit']);
CSFX['3:p2']=[[0,'rumble'],[1,'chunk'],[1.02,'bellSoft'],[2.12,'bellCascade'],[2.6,'bellSoft'],[2.85,'bellSoft'],[3.1,'bellSoft'],[3.35,'bellSoft'],[4.45,'bellChime'],[4.75,'bellHit'],[1.6,'heart'],[2.1,'burst'],[2.15,'creature'],[2.2,'refill'],[2.4,'chainSlip'],[2.45,'plant'],[3.4,'swell'],[4.6,'ignite'],[5.8,'sting']];
function cineSfx(t,key){const L=CSFX[key];if(!L)return;L.forEach((c,i)=>{if(t>=c[0]&&once('fx'+i))MUSIC.fx(c[1])})}
function cineBoss(){
  const t=gt-S.cine.t0,k=S.cine.k,ph=S.phase;
  cineSfx(t,ph+':'+k);
  /* ===== Voice (shown as Phase I) ===== */
  if(ph===2&&k==='in'){
    fadeAll(.8*(1-clamp((t-2.4)/1.2,0,1)));
    SHARDS.forEach((sh,i)=>{const a=clamp((t-i*.07)/.3,0,1)*(1-clamp((t-2.6)/1,0,1));if(a>0)glow(sh.x+Math.sin(rt*.4+sh.o)*12,sh.y+Math.cos(rt*.5+sh.o)*8,30,'rgba(127,214,255,.9)',a*.7)});
    const vp=voicePos(0);
    if(t>1.1&&t<2.5){const e=eio(clamp((t-1.1)/1,0,1)),s=95*e;glow(vp.x,vp.y-40,160*e,'rgba(200,170,255,.8)',.6*e);
      ctx.save();ctx.translate(vp.x,vp.y-40);const g=ctx.createLinearGradient(-s,-s,s,s);g.addColorStop(0,'rgba(240,232,255,.85)');g.addColorStop(1,'rgba(110,80,170,.5)');ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(0,-s*1.4);ctx.lineTo(s*.6,0);ctx.lineTo(s*.1,s*1.2);ctx.lineTo(-s*.55,s*.1);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
      if(t>1.9){const c=clamp((t-1.9)/.5,0,1);ctx.strokeStyle='rgba(30,15,50,.9)';ctx.lineWidth=2;for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*s*c,Math.sin(a)*s*c*1.2);ctx.stroke()}}
      ctx.restore()}
    if(t>=2.4){if(once('b')){burst(vp.x,vp.y-40,60,'#e2d2ff',8,1.3,.12);S.flashT=gt;S.shake=8}
      const e=eout(clamp((t-2.4)/.7,0,1));ctx.save();ctx.translate(vp.x,vp.y);ctx.scale(.55+.45*e,.55+.45*e);ctx.translate(-vp.x,-vp.y);drawVoice(0,e,t<3.6?1:0,0);ctx.restore()}
    return}
  if(ph===2&&k==='out'){
    const vp=voicePos(0);
    // 1. the Watcher raises his staff and charges a ball of light
    const ch=clamp((t-.3)/1.1,0,1),thr=clamp((t-1.4)/.15,0,1),fl=clamp((t-1.45)/.32,0,1);
    const ov=clamp((t-1.75)/1.35,0,1),boom=t>=3.1;
    S.heroPose=t<.3?null:t<1.4?{staffA:lerp(-1.42,-1.62,eio(clamp((t-.3)/.3,0,1))),lean:-.08*eio(ch)}:t<3.4?{staffA:lerp(-1.62,-.55,eout(thr)),lean:.12*thr+(t>1.75?Math.sin(t*40)*.01*ov:0)}:null;
    const tr=t>1.75&&!boom?ov*ov*5:0,jx=(Math.random()-.5)*tr,jy=(Math.random()-.5)*tr;
    const fx=vp.x+jx,fy=vp.y-96+jy;
    if(!boom){ctx.save();ctx.translate(jx,jy);drawVoice(0,1,t>1.75?1:0,Math.min(.33,t/1.75*.33));ctx.restore()}
    const ox=(S.orbX||HX+40)+S.heroDX,oy=(S.orbY||GY-170)+S.heroDY;
    if(t>.3&&t<1.45){const r=4+18*eio(ch);
      for(let i=0;i<10;i++){const a=rt*6+i*.63,d=(1-((t*1.6+i*.1)%1))*70;ell(ox+Math.cos(a)*d,oy+Math.sin(a)*d,1.6,1.6,`rgba(190,240,255,${.8*ch})`)}
      ctx.save();ctx.globalCompositeOperation='lighter';glow(ox,oy,r*4,'rgba(127,214,255,.9)',.9);ell(ox,oy,r,r,'rgba(220,248,255,.95)');ell(ox,oy,r*.5,r*.5,'#ffffff');ctx.restore();S.shake=Math.max(S.shake,ch*2)}
    // 2. the throw
    if(fl>0&&fl<1){const e=ein(fl),bx=lerp(ox,fx,e),by=lerp(oy,fy,e)-Math.sin(Math.PI*e)*40;ctx.save();ctx.globalCompositeOperation='lighter';
      for(let i=5;i>0;i--){const ee=ein(Math.max(0,fl-i*.04)),tx=lerp(ox,fx,ee),ty=lerp(oy,fy,ee)-Math.sin(Math.PI*ee)*40;ell(tx,ty,20-i*3,20-i*3,`rgba(127,214,255,${.25-i*.04})`)}
      glow(bx,by,90,'rgba(127,214,255,.9)',.9);ell(bx,by,22,22,'rgba(220,248,255,.95)');ell(bx,by,11,11,'#fff');ctx.restore()}
    // 3. overload: the light floods the mirror, cracks spread, beams burst out
    if(t>=1.75&&!boom){
      if(once('hit')){S.flashT=gt;S.shake=10;burst(fx,fy,24,'#ffffff',6,.6)}
      S.shake=Math.max(S.shake,2+ov*9);
      ctx.save();ctx.globalCompositeOperation='lighter';
      // a stream of light still pouring from the staff
      ctx.strokeStyle=`rgba(170,235,255,${.5+.3*Math.sin(t*30)})`;ctx.lineWidth=3+ov*3;ctx.beginPath();ctx.moveTo(ox,oy);
      for(let i=1;i<=8;i++){const q=i/8;ctx.lineTo(lerp(ox,fx,q)+(Math.random()-.5)*8*(1-Math.abs(q-.5)*2),lerp(oy,fy,q)+(Math.random()-.5)*8)}ctx.stroke();
      // beams breaking out of the cracks
      const nb=Math.floor(3+ov*11);
      for(let i=0;i<nb;i++){const a=i*2.399+rt*.3,len=(80+i%4*60)*(.4+ov),w=.05+ov*.05;const g=ctx.createLinearGradient(fx,fy,fx+Math.cos(a)*len,fy+Math.sin(a)*len);g.addColorStop(0,`rgba(230,250,255,${.55*ov+.15})`);g.addColorStop(1,'rgba(127,214,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+Math.cos(a-w)*len,fy+Math.sin(a-w)*len);ctx.lineTo(fx+Math.cos(a+w)*len,fy+Math.sin(a+w)*len);ctx.closePath();ctx.fill()}
      // glowing crack web
      const R=mulberry(41);ctx.strokeStyle='#eafcff';ctx.lineWidth=1.8;ctx.shadowColor='rgba(127,214,255,1)';ctx.shadowBlur=10;
      for(let i=0;i<14;i++){const a=i/14*Math.PI*2+R()*.3,reach=clamp(ov*1.6-i*.04,0,1)*(28+R()*8);if(reach<=0)continue;let x=fx,y=fy;ctx.beginPath();ctx.moveTo(x,y);for(let s2=1;s2<=4;s2++){const d=reach*s2/4;x=fx+Math.cos(a+(R()-.5)*.5)*d;y=fy+Math.sin(a+(R()-.5)*.5)*d*1.2;ctx.lineTo(x,y)}ctx.stroke()}
      ctx.shadowBlur=0;
      glow(fx,fy,60+ov*120,'rgba(200,245,255,.95)',.5+ov*.5);ell(fx,fy,10+ov*14,10+ov*14,'rgba(255,255,255,.95)');
      ctx.restore();
      if(Math.random()<ov)burst(fx,fy,2,'#dff8ff',5,.5);
    }
    // 4. explosion
    if(boom){
      if(once('s')){S.flashT=gt;S.shake=24;burst(fx,fy,70,'#ffffff',12,1.1);burst(fx,fy,40,'#9fe4ff',9,1);for(let i=0;i<6;i++)burst(fx,fy,30,i%2?'#f2ecff':'#b48cff',7,2.8,.06)}
      const q=t-3.1;if(q<1){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(200,245,255,${1-q})`;ctx.lineWidth=10*(1-q)+1;ctx.beginPath();ctx.arc(fx,fy,q*700,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle=`rgba(180,140,255,${.7*(1-q)})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(fx,fy,q*480,0,Math.PI*2);ctx.stroke();glow(fx,fy,260*(1-q*.5),'rgba(220,250,255,.9)',1-q);ctx.restore()}
      S.noFace=true;const e=eio(clamp((t-3.2)/1.4,0,1));
      if(e<1){ctx.save();ctx.globalAlpha=1-e;ctx.translate(vp.x,GY);ctx.scale(1,1-e*.8);ctx.translate(-vp.x,-GY);drawVoice(0,1,0,0);ctx.restore()}
      if(e>.6)ell(vp.x,GY+2,80*e,7,`rgba(200,190,220,${.35*(1-clamp((t-5.4)/1,0,1))})`)}
    // the keeper's lantern drops from the shattered face into the water and sinks, pulsing
    if(boom){const q=lanternPos(t,fx,fy);if(q.splash&&once('splash')){burst(q.x,GY,26,'#cff7ef',5,.7,.35);S.ripT=gt;S.ripX=q.x}
      keeperLantern(q.x,q.y,q.a,t)}
    if(S.ripT){const q=gt-S.ripT;if(q<1.6){ctx.strokeStyle=`rgba(200,250,240,${.6*(1-q/1.6)})`;ctx.lineWidth=2;for(let i=0;i<3;i++){const r=q*90+i*18;ctx.beginPath();ctx.ellipse(S.ripX,GY+3,r,r*.1,0,0,Math.PI*2);ctx.stroke()}}}
    return}
  /* ===== Rust King (shown as Phase II) ===== */
  if(ph===1&&k==='in'){
    const dust=(n,big)=>{for(let i=0;i<n;i++)S.parts.push({x:Math.random()*W,y:-4,vx:(Math.random()-.5)*.25,vy:.2+Math.random()*.4,g:.28,t0:gt,life:1.4+Math.random()*.9,c:Math.random()<.25?'#6a5a48':'#9a8a76',r:big&&Math.random()<.3?3.5:1.6+Math.random()*1.4})};
    // five heavy steps: slow lift, hard drop, the body sinks into each landing
    const N=5,T0=.3,TS=.8,u=clamp((t-T0)/(N*TS),0,1),si=Math.min(N-1,Math.floor(u*N)),f=u>=1?1:u*N-si;
    const dx=lerp(330,0,u),S2=24,H2=15;
    const lift=f<.62?eout(f/.62)*H2:(1-ein((f-.62)/.38))*H2;
    const adv=f<.62?eio(f/.62)*.85:.85+.15*((f-.62)/.38);
    let legs=[{dx:0,dy:0},{dx:0,dy:0}];
    if(u<1){const sw=si%2,st=1-sw;legs[sw]={dx:lerp(S2,-S2,adv),dy:lift};legs[st]={dx:lerp(-S2,S2,f),dy:0}}
    else{const e=eio(clamp((t-T0-N*TS)/.4,0,1)),last=(N-1)%2;legs[last]={dx:lerp(-S2,0,e),dy:0};legs[1-last]={dx:lerp(S2,0,e),dy:0}}
    const since=u>=1?(t-T0-N*TS):(f*TS),dip=since<.28?Math.sin(since/.28*Math.PI)*7:0;
    S.walkLegs=legs;S.bodyBob=(u<1?-lift*.25:0)+dip;const tilt=u<1?(si%2?1:-1)*.02*Math.sin(Math.PI*f):0,bob=0;
    for(let i=0;i<N;i++){if(t>=T0+(i+1)*TS&&once('st'+i)){S.shake=17;dust(30,true);const sw=i%2,fxp=700+lerp(330,0,(i+1)/N)+(sw?38:-38)-S2;burst(fxp,GY,20,'#8a7a6a',3.5,.7,.25);burst(fxp,GY,8,'#bfe9df',3,.4,.3)}}
    // the anchor lies on the floor of the hold until the King hauls it up by its chain and slings it on his back
    const C=CINE_P2;S.noAnchor=t<C.slung;
    if(t<C.slung){const AF=ANCHOR_FLOOR,AB={x:700+80+Math.cos(ARM_BACK)*82,y:GY-202+Math.sin(ARM_BACK)*82,a:BACK_DIR};
      const e=eio(clamp((t-C.lift)/(C.slung-C.lift),0,1)),q={x:lerp(AF.x,AB.x,e),y:lerp(AF.y,AB.y,e)-Math.sin(Math.PI*e)*90,a:lerp(AF.a,AB.a,e)};
      ctx.save();if(e===0){ctx.beginPath();ctx.rect(0,0,W,GY+4);ctx.clip()}drawAnchor(q.x,q.y,Math.cos(q.a),Math.sin(q.a),0);ctx.restore();
      if(t>C.haul){const hand={x:700+dx+76,y:GY-120},ring={x:q.x-Math.cos(q.a)*38,y:q.y-Math.sin(q.a)*38},k=eout(clamp((t-C.haul)/.25,0,1));
        chainLinks(hand.x,hand.y,lerp(hand.x,ring.x,k),lerp(hand.y,ring.y,k),e>0?-10:14,'#4a2a18')}
      if(t>=C.lift&&once('haul')){S.shake=8;dust(20,false);burst(AF.x-120,GY,20,'#8a7a6a',4,.8,.3);MUSIC.fx('chainSlip')}}
    // then swung down into the floor
    if(t>=4.75&&once('slam'))S.threats.push({k:'slam',t0:gt,ti:gt+1,real:true,done:true,ls:.25});
    ctx.save();ctx.translate(700+dx,GY);ctx.rotate(tilt);ctx.translate(-(700+dx),-GY);ctx.translate(dx,bob);drawBoss1();ctx.restore();
    if(t>=5.75&&once('imp')){const ix=S.clapTip?S.clapTip.x:470;S.impX=ix;S.impT=gt;S.shake=22;dust(70,true);burst(ix,GY-6,50,'#cfeee6',8,1,.35);burst(ix,GY,26,'#8a7a6a',5,1,.3)}
    if(S.impT){const q=gt-S.impT;if(q<1.1){const r=q*520;ctx.strokeStyle=`rgba(210,250,240,${.8*(1-q/1.1)})`;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(S.impX,GY+4,r,r*.08,0,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle=`rgba(20,12,8,${.9*(1-q/1.1)})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(S.impX,GY+2);ctx.lineTo(S.impX-30,GY+12);ctx.lineTo(S.impX-56,GY+6);ctx.moveTo(S.impX,GY+2);ctx.lineTo(S.impX+26,GY+14);ctx.lineTo(S.impX+50,GY+8);ctx.stroke()}
      if(q<2&&Math.random()<.5)dust(2,false)}
    const dim=.55*(1-clamp(t/3,0,1));fadeAll(dim,'12,9,6');
    return}
  if(ph===1&&k==='out'){
    // the floor holds: the hull collapses around the King, the deck opens, the moon lights his metal body for the first time
    const C=CINE_P2,col=clamp((t-C.collapse)/C.collapseD,0,1),open=eio(clamp((t-C.open)/C.openD,0,1)),moon=clamp((t-C.moon)/.8,0,1);
    if(t>C.collapse&&t<C.open+C.openD)S.shake=Math.max(S.shake,3+4*Math.sin(Math.PI*col));
    if(open>0)hullSky(open);
    hullDebris(t-C.collapse);
    // the anchor slips off his back and plants itself behind him
    S.noAnchor=t>.6;
    if(t>.6){const e=ein(clamp((t-.6)/.5,0,1));drawAnchorAt({x:lerp(753,878,e),y:lerp(GY-280,GY-150,e),a:lerp(2.11,1.95,e),f:e});if(e>=1&&once('an')){S.shake=10;burst(862,GY,24,'#cff7ef',6,.7,.4)}}
    // the King kneels and tolls one last time; the parasite's light shows in his heart
    const sink=eio(clamp((t-1)/.8,0,1))*45;
    if(t<1)S.shake=Math.max(S.shake,3);
    if(moon>0)moonCone(moon);
    kingKneel(sink);
    if(moon>0)moonOnKing(sink,moon);
    if(t>1.4&&t<3){const a=1-(t-1.4)/1.6;ctx.strokeStyle=`rgba(240,226,184,${a*.8})`;ctx.lineWidth=3;for(let i=0;i<4;i++){const r=30+((t-1.4)*90+i*35)%140;ctx.beginPath();ctx.arc(694,GY-226+sink,r,Math.PI*.1,Math.PI*.9,true);ctx.stroke()}S.shake=Math.max(S.shake,2)}
    // the Watcher braces while the hull comes down
    S.heroDY=0;S.heroPose=col>0&&col<1?{staffA:-1.9,lean:-.1}:null;
    return}
  /* ===== Drowned Beacon (Phase III) ===== */
  if(ph===3&&k==='in'){
    if(t<1.5){ctx.save();ctx.translate(60,0);drawBoss1();ctx.restore();S.heroDY=0}
    else if(t<11.5){S.heroDY=0;S.tfT=S.cine.t0+1.5;drawTransform()}
    else{drawBoss3();const s=clamp((t-11.7)/1.4,0,1);if(s>0&&s<1){ctx.save();ctx.globalCompositeOperation='lighter';beamShape(940-1000*s,.8);ctx.restore()}}
    return}
  if(ph===3&&k==='out'){ecFinale(t);return}
  if(ph===3&&k==='p2'){ecTransition(t);return}
}
function cineOverlay(){
  const t=gt-S.cine.t0,k=S.cine.k,ph=S.phase;
  const fk=gt-(S.flashT||-9);if(fk<.45&&!(ph===3&&k==='in'&&t>1.5&&t<11.5))fadeAll(.55*(1-fk/.45),'235,245,255');
  if(ph===2&&k==='in')title(t,3.1,PH[2].eye(),PH[2].boss(),CH_COL[2]);
  if(ph===2&&k==='out')fadeAll(clamp((t-6.5)/.7,0,1));
  if(ph===1&&k==='in')title(t,6.3,PH[1].eye(),PH[1].boss(),CH_COL[2]);
  if(ph===1&&k==='out')fadeAll(clamp((t-(CINE_LEN[1].out-1.1))/.7,0,1));
  if(ph===3&&k==='in')title(t,12.3,PH[3].eye(),_('The Drowned Lighthouse','Le Phare Noyé'),CH_COL[2]);
  if(ph===3&&k==='p2'){const shat=_('The Bottomless','La Sans-Fond');title(t,5.8,PH[3].eye(),shat,CH_COL[2])}
}
