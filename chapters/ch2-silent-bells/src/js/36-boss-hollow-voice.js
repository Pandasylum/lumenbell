/* ---------- boss 2: the Hollow Voice ---------- */
/* the turquoise glow deep in the mirror (the keeper's lantern, unseen): faint at first, rising as the Voice weakens,
   brightest just before the mirror shatters. MIRROR_GLOW: base / max during the fight, end = before the shattering */
const MIRROR_GLOW={base:.06,max:.65,end:.95};
function mirrorLight(){if(S.phase!==2)return 0;const G=MIRROR_GLOW;
  if(S.cine&&S.cine.k==='out'){const t=gt-S.cine.t0;return t<CINE_P1.drop?lerp(G.max,G.end,clamp(t/CINE_P1.drop,0,1)):0}
  if(S.mode==='play'||S.mode==='ko'||S.mode==='dead')return G.base+(G.max-G.base)*(1-S.bossHp/S.bossMax);return G.base}
function voiceAnim(){
  let cast=0;for(const th of S.threats){if(th.k==='orb'&&gt>=th.t0&&gt<=th.tl+.15&&th.src===0)cast=Math.max(cast,1);if(th.k==='wail'&&!th.ill&&gt>=th.t0&&gt<=th.tl+.2)cast=Math.max(cast,1.4)}
  let echo=0;for(const th of S.threats){if(th.k==='orb'&&th.src>0&&!th.pe&&gt>=th.t0-.3&&gt<=th.ti+.2)echo=1;if(th.k==='shard'&&th.from!=null&&gt<th.t0+.05)echo=1}
  return{cast,echo};
}
const VPOS=[{x:735,y:248},{x:575,y:180},{x:860,y:160}];
function voicePos(i){const v=VPOS[i];return{x:v.x,y:v.y+Math.sin(rt*1.6+i*2)*8}}
function voiceHand(i,cast){const p=voicePos(i);return cast?{x:p.x-84,y:p.y-62}:{x:p.x-46,y:p.y+30}}
function drawBoss2(){
  const A=voiceAnim();
  let ko=S.mode==='ko'&&S.phase===2?clamp((gt-S.koT)/2,0,1):0;
  if(A.echo){S.echoA=Math.min(1,(S.echoA||0)+.06)}else S.echoA=Math.max(0,(S.echoA||0)-.05);
  if(S.echoA>0){for(const i of[1,2]){
    // rage: a reflection shatters, sending a shard at the Watcher
    const br=S.threats.find(t=>t.k==='shard'&&t.from===i&&gt>=t.t0);
    if(br){if(!br.bk){br.bk=1;const p=voicePos(i);burst(p.x,p.y-80,26,'#ece4ff',6,.9,.2);burst(p.x,p.y-20,16,'#9a86c8',4,1,.3);MUSIC.fx('crackGlass')}continue}
    const has=S.threats.some(t=>t.k==='orb'&&t.src===i&&gt>=t.t0&&gt<=t.tl+.15);drawVoice(i,S.echoA*.5,has?1:0,0)}}
  // permanent echo (Hard): a reflection stands beside the Voice and fires the orb after each spell; it fades during the rages
  // and the final assault, then returns
  if(S.d.hard){const on=!S.peOff&&S.mode==='play';S.peA=on?Math.min(1,(S.peA||0)+.04):Math.max(0,(S.peA||0)-.05);
    if(S.peA>0&&!(S.echoA>0))drawVoice(1,S.peA*.5,S.threats.some(t=>t.pe&&gt>=t.t0&&gt<=t.tl+.15)?1:0,0)}
  // the Illusion of the wail: appears on the left, throws the second wave towards the Watcher, vanishes
  const iw=S.threats.find(t=>t.k==='wail'&&t.ill&&gt>=t.t0&&gt<=t.ti+.7);
  if(iw){const a=Math.min(clamp((gt-iw.t0)/.35,0,1),clamp((iw.ti+.7-gt)/.5,0,1)),I=SP.wail.ill;
    ctx.save();ctx.translate(2*I.x,0);ctx.scale(-1,1);drawVoice(1,a*.5,gt<=iw.tl+.2?1.4:0,0,{x:I.x,y:I.y+Math.sin(rt*1.6)*8});ctx.restore()}
  ctx.save();
  if(hasFilter&&gt-S.bossFlash<.15)ctx.filter='brightness(1.8)';
  drawVoice(0,1-clamp((ko-.4)/.6,0,1),A.cast,ko);
  ctx.restore();
  if(ko>0&&!S.koBurst){S.koBurst=true;const p=voicePos(0);for(let i=0;i<4;i++)burst(p.x,p.y-82,16,'#f2ecff',7,1.6,.25)}
}
function drawVoice(i,alpha,cast,ko,pos){
  if(alpha<=0)return;
  const p=pos||voicePos(i),x=p.x,y=p.y-ko*60;
  ctx.save();ctx.globalAlpha*=alpha;
  // shadow tendrils curling from below
  ctx.lineCap='round';
  for(let r=0;r<7;r++){const bx=x-60+r*20;ctx.strokeStyle=`rgba(8,4,16,${.7-r%3*.15})`;ctx.lineWidth=5-r%3;ctx.beginPath();ctx.moveTo(bx,y+150);for(let k=1;k<=8;k++){const t=k/8;ctx.lineTo(bx+Math.sin(t*5+rt*2+r)*18*t,y+150+t*110)}ctx.stroke()}
  // orbiting mirror shards
  for(let k=0;k<7;k++){const a=rt*.7+k*Math.PI*2/7,ox=x+Math.cos(a)*78,oy=y-96+Math.sin(a)*26,front=Math.sin(a)>0;if(front)continue;shard(ox,oy,9+k%3*3,a)}
  // ribbons, torn
  ctx.lineWidth=2.5;for(let r=0;r<4;r++){ctx.strokeStyle=`rgba(150,110,210,${.4-r*.08})`;ctx.beginPath();for(let k=0;k<=14;k++){const t=k/14,xx=x+16+t*170,yy=y-50+r*26+Math.sin(t*7-rt*3+r)*18*t;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.stroke()}
  // robe: dirty ivory to bruise violet to nothing, long ragged hem
  const g=ctx.createLinearGradient(0,y-80,0,y+200);g.addColorStop(0,'#bdb3a2');g.addColorStop(.35,'#6e5f86');g.addColorStop(.75,'#2a1d40');g.addColorStop(1,'rgba(20,10,35,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-20,y-64);ctx.quadraticCurveTo(x-46,y+40,x-84,y+190);
  for(let k=0;k<=12;k++){const xx=x-84+k*14,yy=y+190+(k%2?-34-(k%3)*10:Math.sin(rt*4+k)*8);ctx.lineTo(xx,yy)}
  ctx.quadraticCurveTo(x+46,y+40,x+20,y-64);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(10,5,20,.55)';ctx.lineWidth=1.6;for(const o of[-30,-14,0,14,30]){ctx.beginPath();ctx.moveTo(x+o*.25,y-50);ctx.quadraticCurveTo(x+o*.9,y+60,x+o*1.9,y+170);ctx.stroke()}
  // tall pointed cowl
  ctx.fillStyle='#120c1e';ctx.beginPath();ctx.moveTo(x-40,y-50);ctx.quadraticCurveTo(x-48,y-120,x-6,y-170);ctx.lineTo(x+4,y-176);ctx.quadraticCurveTo(x+44,y-124,x+40,y-50);ctx.quadraticCurveTo(x,y-38,x-40,y-50);ctx.fill();
  ctx.strokeStyle='rgba(180,140,255,.18)';ctx.lineWidth=1.5;ctx.stroke();
  // arms: very long, needle claws
  const sx=x-22,sy=y-50,h=cast?{x:x-84,y:y-62}:{x:x-46,y:y+30};
  ctx.strokeStyle='#4a4058';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo((sx+h.x)/2-8,(sy+h.y)/2+14,h.x,h.y);ctx.stroke();
  ctx.strokeStyle='#d8d0e6';ctx.lineWidth=1.4;for(let f=-2;f<=1;f++){const len=cast?26:22;ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.quadraticCurveTo(h.x-len*.6,h.y+f*7-(cast?6:-8),h.x-len,h.y+f*11-(cast?2:-16));ctx.stroke()}
  ctx.strokeStyle='#4a4058';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(x+22,y-50);ctx.quadraticCurveTo(x+48,y,x+40,y+44);ctx.stroke();
  ctx.strokeStyle='#d8d0e6';ctx.lineWidth=1.4;for(let f=-1;f<=1;f++){ctx.beginPath();ctx.moveTo(x+40,y+44);ctx.lineTo(x+44+f*5,y+68);ctx.stroke()}
  if(cast)glow(h.x,h.y,36,'rgba(190,150,255,.95)',.9);
  const fx=x,fy=y-96,pulse=.6+.4*Math.sin(rt*2.2);
  if(!S.noFace){
  const mg=ctx.createRadialGradient(fx-8,fy-10,2,fx,fy,30);mg.addColorStop(0,'#8a80a8');mg.addColorStop(.5,'#2c2440');mg.addColorStop(1,'#0c0816');
  ctx.fillStyle=mg;ctx.beginPath();ctx.ellipse(fx,fy,25,31,0,0,Math.PI*2);ctx.fill();
  if(i===0){const L=mirrorLight();if(L>0){ctx.save();ctx.clip();ctx.globalCompositeOperation='lighter';const g2=ctx.createRadialGradient(fx-2,fy+10,1,fx-2,fy+10,22);g2.addColorStop(0,`rgba(150,255,235,${L*(.75+.25*Math.sin(rt*3.4))})`);g2.addColorStop(1,'rgba(79,224,204,0)');ctx.fillStyle=g2;ctx.fillRect(fx-26,fy-32,52,64);ctx.restore()}}
  ctx.strokeStyle='#05030a';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(fx,fy,25,31,0,0,Math.PI*2);ctx.stroke();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(200,160,255,${.55+.4*pulse})`;ctx.lineWidth=1.6;
  ctx.beginPath();ctx.moveTo(fx+4,fy-31);ctx.lineTo(fx,fy-10);ctx.lineTo(fx+12,fy+2);ctx.lineTo(fx+3,fy+30);ctx.moveTo(fx,fy-10);ctx.lineTo(fx-20,fy-4);ctx.moveTo(fx+12,fy+2);ctx.lineTo(fx+24,fy-8);ctx.moveTo(fx-10,fy-6);ctx.lineTo(fx-14,fy+20);ctx.moveTo(fx+6,fy+14);ctx.lineTo(fx-6,fy+26);ctx.stroke();
  glow(fx+2,fy-6,26,'rgba(190,150,255,.8)',.35*pulse);ctx.restore();
  // ink seeping from the cracks
  for(const [dx,o] of[[3,0],[-14,.4],[10,.7]]){const k=(rt*.4+o)%1;ell(fx+dx,fy+24+k*40,1.6,3+k*3,`rgba(10,5,20,${.8*(1-k)})`)}
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(fx,fy,18,24,0,Math.PI*1.1,Math.PI*1.4);ctx.stroke();
  ell(fx-9,fy+6,2,2,'#7fd6ff');}
  for(let k=0;k<7;k++){const a=rt*.7+k*Math.PI*2/7,ox=x+Math.cos(a)*78,oy=y-96+Math.sin(a)*26;if(Math.sin(a)>0)shard(ox,oy,9+k%3*3,a)}
  if(ko>0&&!S.noFace){ctx.strokeStyle='rgba(230,210,255,.9)';ctx.lineWidth=1.5;for(let k=0;k<9;k++){const a=k/9*Math.PI*2;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+Math.cos(a)*30*Math.min(1,ko*3),fy+Math.sin(a)*30*Math.min(1,ko*3));ctx.stroke()}}
  ctx.restore();
}
/* the keeper's lantern (a Watcher's lantern, turquoise flame): position after the mirror face shatters */
function lanternPos(t,fx,fy){const C=CINE_P1,d=t-C.drop;
  if(d<C.fall){const k=d/C.fall;return{x:fx-20*k,y:lerp(fy,GY,k*k),a:k*2.4,splash:false}}
  const s=eout(clamp((d-C.fall)/C.sink,0,1));return{x:fx-20+Math.sin(d*1.3)*4,y:GY+8+s*C.depth,a:2.4+Math.sin(d*1.1)*.25,splash:true,sub:s}}
/* a Watcher's lantern cage, unlit, hanging at the Rust King's belt */
function deadLantern(x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle='#2a1a10';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-15,4,Math.PI,0);ctx.stroke();
  ctx.fillStyle='#24180f';ctx.beginPath();ctx.moveTo(-6,-11);ctx.lineTo(6,-11);ctx.lineTo(8,-7);ctx.lineTo(-8,-7);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(20,30,30,.8)';ctx.fillRect(-6,-7,12,14);
  ctx.strokeStyle='#24180f';ctx.lineWidth=1.5;for(const x0 of[-6,0,6]){ctx.beginPath();ctx.moveTo(x0,-7);ctx.lineTo(x0,7);ctx.stroke()}ctx.fillStyle='#24180f';ctx.fillRect(-8,7,16,3);ctx.strokeStyle='rgba(170,230,210,.15)';ctx.beginPath();ctx.moveTo(-4,-5);ctx.lineTo(-4,4);ctx.stroke();ctx.restore()}
function keeperLantern(x,y,a,t){const p=.55+.45*Math.sin(t*3.4);
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(1.5,1.5);
  glow(0,0,46,'rgba(79,224,204,.9)',.55*p);
  ctx.strokeStyle='#1d2a28';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-17,4,Math.PI,0);ctx.stroke();
  ctx.fillStyle='#22312e';ctx.beginPath();ctx.moveTo(-6,-13);ctx.lineTo(6,-13);ctx.lineTo(8,-9);ctx.lineTo(-8,-9);ctx.closePath();ctx.fill();
  ctx.fillStyle=`rgba(150,255,235,${.35+.4*p})`;ctx.fillRect(-6,-9,12,15);
  ctx.save();ctx.globalCompositeOperation='lighter';ell(0,-1,3.2,5.5,`rgba(220,255,248,${.6+.4*p})`);ctx.restore();
  ctx.strokeStyle='#1d2a28';ctx.lineWidth=1.5;for(const x0 of[-6,0,6]){ctx.beginPath();ctx.moveTo(x0,-9);ctx.lineTo(x0,6);ctx.stroke()}
  ctx.fillStyle='#22312e';ctx.fillRect(-8,6,16,3);ctx.restore()}
/* phase I end, over the water: the hatch opening on the hold, and the lantern's pulse once it has sunk */
function sinkGlow(t){
    // the hatch: the chain snaps, then the leaves swing open (drawn with the hall, so the water reflects it)
    const C=CINE_P1;{const k=clamp((t-C.dim)/C.dimD,0,1);S.lampDim=k>0&&k<1?Math.sin(Math.PI*k)*(Math.sin(t*37)>-.3?1:.6):0}
    if(t>=C.hatch-C.snap&&once('snap')){S.hatchSnap=1;S.shake=7;const T=hatchTop();burst(HATCH.x,T.y1,18,'#8a4a24',5,.7,.4);MUSIC.fx('chainSlip');MUSIC.fx('clank')}
    S.hatchK=eio(clamp((t-C.hatch)/.8,0,1));if(S.hatchK>0&&once('hatch')){MUSIC.fx('plant');S.shake=6}
    if(S.hatchK>0)glow(HATCH.x,GY-30,90,'rgba(79,224,204,.8)',.3*S.hatchK);
  if(t<CINE_P1.drop+CINE_P1.fall)return;const vp=voicePos(0),q=lanternPos(t,vp.x,vp.y-96),p=.5+.5*Math.sin(t*3.4);
  ctx.save();ctx.globalCompositeOperation='lighter';glow(q.x,q.y,60+20*p,'rgba(79,224,204,.9)',.35+.3*p);ell(q.x,q.y-1,2.5,4,`rgba(220,255,248,${.5+.4*p})`);ctx.restore()}
function shard(x,y,s,a){ctx.save();ctx.translate(x,y);ctx.rotate(a*1.5);const g=ctx.createLinearGradient(-s,-s,s,s);g.addColorStop(0,'rgba(235,225,255,.75)');g.addColorStop(1,'rgba(90,70,140,.4)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*.5,s*.2);ctx.lineTo(-s*.3,s*.7);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.stroke();ctx.restore()}

