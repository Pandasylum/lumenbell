/* harpoon of the Rust Elder, readability pass of 6 Nov 2026 (docs/decisions/2026-11-06-ch2-lisibilite-voix-ancien-phare.md). PROVISIONAL, to tune by eye:
   stick  delay before the recall = old 1 s x .75; gap  between the two plank shocks = old .35 + .15 s (seconds, no multiplier);
   nail   two rusty nails sticking out of the plank (n = 1 upper, 2 lower): r = thickness and len = length (px), off = place along the plank (share of its length), dir = direction (towards the Watcher), rafter / rdir = the same on the ceiling plank, glow = halo (px), lead = it lights up this many s before its shock */
const HARPOON_FX={stick:.75,gap:.5,nail:{r:4,len:26,off:.3,dir:{x:-.97,y:-.24},rafter:[.5,.8],rdir:{x:-.35,y:.94},glow:34,lead:.35}};
/* ---------- boss 1: the Rust King ---------- */
function bronze(x0,x1){const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'#0c1714');g.addColorStop(.38,'#3f7466');g.addColorStop(.55,'#2a5148');g.addColorStop(1,'#09120f');return g}
function jag(x0,x1,y,n,h,R){for(let i=0;i<=n;i++){const t=i/n;ctx.lineTo(lerp(x0,x1,t),y+(i%2?-h*(.4+R()*.6):0))}}
function drawAnchor(hx,hy,c,s,glowA){
  const px=-s,py=c,L=300;
  const at=(d,p)=>[hx+c*d+px*p,hy+s*d+py*p];
  const cr=at(L,0);
  // shaft
  ctx.lineCap='round';
  ctx.strokeStyle='#160f0a';ctx.lineWidth=17;ctx.beginPath();ctx.moveTo(...at(-26,0));ctx.lineTo(...cr);ctx.stroke();
  ctx.strokeStyle='#5c3a24';ctx.lineWidth=11;ctx.stroke();
  ctx.strokeStyle='rgba(190,120,70,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(...at(-20,-3));ctx.lineTo(...at(L-10,-3));ctx.stroke();
  // ring
  ctx.strokeStyle='#2a1c12';ctx.lineWidth=7;ctx.beginPath();ctx.arc(...at(-38,0),13,0,Math.PI*2);ctx.stroke();
  // stock
  ctx.strokeStyle='#1d140d';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(...at(18,-46));ctx.lineTo(...at(18,46));ctx.stroke();
  ell(...at(18,-48),7,7,'#3b281a');ell(...at(18,48),7,7,'#3b281a');
  // arms + flukes
  for(const sd of[-1,1]){
    ctx.strokeStyle='#160f0a';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(...cr);ctx.quadraticCurveTo(...at(L+6,sd*58),...at(L-62,sd*78));ctx.stroke();
    ctx.strokeStyle='#5c3a24';ctx.lineWidth=9;ctx.stroke();
    const tip=at(L-118,sd*86),b1=at(L-50,sd*66),b2=at(L-64,sd*100);
    ctx.fillStyle='#2a1c12';ctx.beginPath();ctx.moveTo(...tip);ctx.lineTo(...b1);ctx.lineTo(...at(L-58,sd*76));ctx.lineTo(...b2);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(220,170,120,.3)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(...tip);ctx.lineTo(...b2);ctx.stroke();
  }
  // crown spike
  ctx.fillStyle='#2a1c12';ctx.beginPath();ctx.moveTo(...at(L+30,0));ctx.lineTo(...at(L-4,-12));ctx.lineTo(...at(L-4,12));ctx.fill();
  // barnacles + glowing rust seams
  const R=mulberry(5);for(let i=0;i<10;i++){const p=at(40+R()*240,(R()-.5)*8);ell(p[0],p[1],2+R()*2.5,2+R()*2,'#b7ad92')}
  if(glowA>0)glow(...cr,70,'rgba(170,235,220,.85)',glowA);
  return cr;
}
const DRIPS=[-46,-18,12,40,64].map((x,i)=>({x,o:i*.37}));
const BARN=(()=>{const R=mulberry(77);return[...Array(22)].map(()=>({x:(R()-.5)*120,y:-112-R()*90,r:1.5+R()*2.6}))})();
function seg(x0,y0,x1,y1,w){ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.strokeStyle='#0a110d';ctx.lineWidth=w+5;ctx.stroke();ctx.strokeStyle='#36574a';ctx.lineWidth=w;ctx.stroke();
  const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  ctx.strokeStyle='rgba(170,210,190,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0+nx*w*.28,y0+ny*w*.28);ctx.lineTo(x1+nx*w*.28,y1+ny*w*.28);ctx.stroke();
  ctx.strokeStyle='#0d1712';ctx.lineWidth=3;for(const t of[.3,.65]){const cx=x0+dx*t,cy=y0+dy*t;ctx.beginPath();ctx.moveTo(cx+nx*w*.6,cy+ny*w*.6);ctx.lineTo(cx-nx*w*.6,cy-ny*w*.6);ctx.stroke()}}
function limb(sx,sy,hx,hy,bend,w){const dx=hx-sx,dy=hy-sy,l=Math.hypot(dx,dy)||1;const ex=(sx+hx)/2-dy/l*bend,ey=(sy+hy)/2+dx/l*bend;
  seg(sx,sy,ex,ey,w);seg(ex,ey,hx,hy,w*.86);ell(ex,ey,w*.62,w*.62,'#1c2b24');ell(ex-1,ey-1,w*.3,w*.3,'#4a6e5e')}
function fist(x,y){ell(x,y,13,12,'#0a110d');ell(x,y,11,10,'#2f4a3e');ell(x-3,y-3,4,3,'rgba(170,210,190,.3)')}
/* the Rust Elder's heart (lore: the Bottomless ate the Lumen of his lantern and wears its colour; the copy does not pulse):
   fixed turquoise from the start of phase II to the end, shown through the bars of the cage and through the seams of the armour */
const HEART_GLOW={core:'rgba(222,253,255,1)',mid:'rgba(60,200,255,.9)',edge:'rgba(6,34,44,1)',spot:'rgba(200,250,255,.7)',spread:12,
  vein:'rgba(111,232,255,.55)',halo:'rgba(90,220,255,.9)',haloR:110,haloA:.5,seamA:.7,seamW:2,seamGlow:.22};
function heartSeams(br){const G=HEART_GLOW;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const [y,hw] of[[GY-140+br*.5,80],[GY-180+br,64]]){const g=ctx.createLinearGradient(-hw,0,hw,0);
    g.addColorStop(0,'rgba(90,220,255,0)');g.addColorStop(.5,`rgba(150,240,255,${G.seamA})`);g.addColorStop(1,'rgba(90,220,255,0)');
    ctx.strokeStyle=g;ctx.lineWidth=G.seamW;ctx.beginPath();ctx.moveTo(-hw,y);ctx.lineTo(hw,y);ctx.stroke();
    ctx.globalAlpha=G.seamGlow;ell(0,y,hw*.8,5,'rgba(90,220,255,.9)');ctx.globalAlpha=1}
  ctx.restore()}
function drawBoss1(){
  const A=anim1();const X=700+A.lunge;
  if(!S.cine){S.walkLegs=A.stomp?[{dx:0,dy:0},{dx:-6,dy:A.stomp}]:null;S.bodyBob=A.stomp?-A.stomp*.12:0}
  ctx.save();
  if(S.mode==='ko'&&S.phase===1){const ko=clamp((gt-S.koT)/1.8,0,1);ctx.translate(X+70,GY);ctx.rotate(eio(ko)*.5);ctx.translate(-(X+70),-GY);ctx.globalAlpha=1-clamp((gt-S.koT-1.6)/.9,0,1)}
  if(hasFilter&&gt-S.bossFlash<.15)ctx.filter='brightness(2.4)';
  const sh=A.toll*(Math.random()-.5)*8,br=Math.sin(rt*1.1)*2.5;
  ctx.translate(X+sh,0);
  const ty=GY-224+br;                 // top of the upper torso bell
  const rS={x:80,y:ty+22},lS={x:-80,y:ty+22};  // shoulders
  const backHand={x:rS.x+Math.cos(ARM_BACK)*82,y:rS.y+Math.sin(ARM_BACK)*82};
  ell(0,GY+2,125,11,'rgba(0,0,0,.6)');
  glow(0,GY-150,190,'rgba(220,160,100,.25)',.35+Math.sin(rt*2)*.06);
  // 1. anchor slung on the back (behind everything)
  ctx.translate(0,S.bodyBob||0);
  if(A.onBack&&!S.noAnchor){S.clapTip=drawAnchor(backHand.x,backHand.y,Math.cos(BACK_DIR),Math.sin(BACK_DIR),0);S.clapTip={x:S.clapTip[0]+X,y:S.clapTip[1]}}
  // 2. legs: stacked bronze rings on bell-rim feet (each leg can step on its own); the rings become the tower's collars
  const bb=S.bodyBob||0;ctx.translate(0,-bb);
  for(const sx of[-1,1]){const L=S.walkLegs?S.walkLegs[sx<0?0:1]:null,ldx=L?L.dx:0,ldy=L?L.dy:0;const hx0=sx*38,lx=hx0+ldx;
    ell(lx,GY-1,36*(1-ldy/70),4,'#0a110d');
    for(let k=0;k<3;k++){const y0=GY-104+k*30-ldy*(.2+k*.3),lx=hx0+ldx*(.12+k*.34);drawP('ring',lx,y0+13,0)}
    const fy=GY-ldy;ctx.fillStyle=bronze(lx-34,lx+34);ctx.beginPath();ctx.moveTo(lx-22,fy-16);ctx.quadraticCurveTo(lx-30,fy-4,lx-36,fy);ctx.lineTo(lx+36,fy);ctx.quadraticCurveTo(lx+30,fy-4,lx+22,fy-16);ctx.fill();}
  ctx.translate(0,bb);
  // 3. the torso: three bells stacked mouth down (the tower's three floors)
  drawP('tb0',0,GY-98,0,-1);drawP('tb1',0,GY-140+br*.5,0,-1);drawP('tb2',0,GY-180+br,0,-1);
  for(const b of BARN)ell(b.x,GY+b.y+br,b.r,b.r*.8,'rgba(200,195,170,.45)');
  // the heart behind its bars: the Bottomless lives in him, a fixed turquoise light (a copy of the Watcher's Lumen: it does not pulse);
  // it also shows through the seams of the armour (HEART_GLOW)
  const hy=GY-166+br*.5,HG=HEART_GLOW;
  ctx.save();ctx.beginPath();ctx.moveTo(-28,hy-30);jag(-28,30,hy-34,7,-8,mulberry(4));ctx.lineTo(34,hy+8);jag(34,-32,hy+26,8,8,mulberry(6));ctx.closePath();
  const hg=ctx.createRadialGradient(0,hy,4,0,hy,46);hg.addColorStop(0,HG.core);hg.addColorStop(.4,HG.mid);hg.addColorStop(1,HG.edge);ctx.fillStyle=hg;ctx.fill();ctx.clip();
  ctx.save();ctx.globalCompositeOperation='lighter';const pg=ctx.createRadialGradient(0,hy+4,1,0,hy+4,14+HG.spread);pg.addColorStop(0,HG.spot);pg.addColorStop(1,'rgba(60,200,255,0)');ctx.fillStyle=pg;ctx.fillRect(-40,hy-50,80,100);
  ctx.strokeStyle=HG.vein;ctx.lineWidth=1.2;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(0,hy+6);ctx.quadraticCurveTo(-14+k*9,hy+20,-18+k*12,hy+34);ctx.stroke()}ctx.restore();
  ctx.strokeStyle='#0a110d';ctx.lineWidth=6;for(const x of[-16,0,16]){ctx.beginPath();ctx.moveTo(x,hy-50);ctx.lineTo(x,hy+50);ctx.stroke()}
  ctx.restore();
  glow(0,hy,HG.haloR,HG.halo,HG.haloA);
  heartSeams(br);
  // sea water running off the rims
  for(const d of DRIPS){const k=(rt*.6+d.o)%1;ell(d.x,GY-96+k*86,1.8,3+k*3,`rgba(170,235,225,${.6*(1-k)})`)}
  // 4. the anchor's sling: one chain from left hip to right shoulder (the tower's moorings); at the belt, a Watcher's lantern cage, unlit
  chainLinks(-74,GY-112,rS.x-6,rS.y-8,-6,'#4a2a18');
  ctx.save();ctx.translate(46,GY-100);ctx.scale(1.4,1.4);deadLantern(0,0,Math.sin(rt*1.4)*.12);ctx.restore();ctx.strokeStyle='#4a2a18';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,GY-112);ctx.lineTo(46,GY-121);ctx.stroke();
  // 5. left arm: the harpoon (thrown on its chain, then hauled back)
  let lh;
  if(A.larm){lh={x:lerp(-96,-150,A.larm),y:lerp(GY-118,ty+6,A.larm)}}else lh={x:-98+Math.sin(rt*1.3)*2,y:GY-118};
  limb(lS.x,lS.y,lh.x,lh.y,-16,20);
  chainLinks(lh.x+20,lh.y-26,lh.x-4,lh.y+4,0,'#4a2a18');
  let tip,thrown=false;
  if(A.harp){tip={x:A.harp.x,y:A.harp.y};thrown=true}
  else if(A.chain){const h0={x:lh.x-60,y:lh.y+40},tg={x:HX+44-X,y:HY+10};tip={x:lerp(h0.x,tg.x,A.chain.k),y:lerp(h0.y,tg.y,A.chain.k)};thrown=A.chain.k>.05}
  else if(A.coil){const a=gt*9;tip={x:lh.x-20+Math.cos(a)*62,y:lh.y-20+Math.sin(a)*44}}
  else tip={x:lh.x-60,y:lh.y+40+Math.sin(rt*1.3)*3};
  {const a=Math.atan2(tip.y-lh.y,tip.x-lh.x);
   S.harpTip=thrown?{x:tip.x+X,y:tip.y}:null;S.harpHand={x:lh.x+X,y:lh.y};   // (the counter's lightning climbs the chain)
   if(thrown){const ring=harpoon(tip.x,tip.y,a,74);chainLinks(lh.x,lh.y,ring[0],ring[1],A.chain?6:10,'#4a2a18')}
   else drawP('harp',lh.x,lh.y,a-Math.PI/2)}
  if(A.chain&&A.chain.k>.9)glow(tip.x,tip.y,30,A.chain.ok?'rgba(127,214,255,.9)':'rgba(230,200,150,.9)',.8);
  fist(lh.x,lh.y);
  // 6. shoulder bells (the tower's balconies)
  for(const s of[-1,1])drawP('sbell',s*80,ty+40,0);
  // what is left of a Watcher on him: a torn strip of cloak hanging from the left shoulder
  {const sw=Math.sin(rt*1.2)*4;ctx.fillStyle='#2a3554';ctx.beginPath();ctx.moveTo(lS.x-8,lS.y-14);ctx.quadraticCurveTo(lS.x-40,lS.y+40,lS.x-44+sw,GY-140);
   [[-38,GY-126],[-30,GY-142],[-24,GY-122],[-16,GY-140],[-10,GY-150]].forEach(([dx,y])=>ctx.lineTo(lS.x+dx+sw*.6,y));ctx.quadraticCurveTo(lS.x-12,lS.y+30,lS.x+14,lS.y-10);ctx.closePath();ctx.fill();
   ctx.strokeStyle='rgba(120,140,190,.18)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(lS.x-4,lS.y);ctx.quadraticCurveTo(lS.x-20,lS.y+50,lS.x-22+sw,GY-150);ctx.stroke()}
  // 7. head bell, hunched forward between the shoulders: the Lighthouse's bell, its lamp still lit
  const hs=A.toll*Math.sin(gt*60)*.09-.2;
  S.kingHead={x:X+sh-6,y:ty+20};
  ctx.save();ctx.translate(-6,ty+6);ctx.rotate(hs);
  pHead();
  const lit=clamp(.6+.3*Math.sin(rt*2.4)+A.toll*.6,0,1);
  ctx.globalCompositeOperation='lighter';const cg=ctx.createLinearGradient(0,2,0,100);cg.addColorStop(0,`rgba(255,215,160,${.42*lit})`);cg.addColorStop(1,'rgba(220,150,90,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(-36,3);ctx.lineTo(36,3);ctx.lineTo(58,100);ctx.lineTo(-58,100);ctx.fill();ctx.globalCompositeOperation='source-over';
  ctx.fillStyle=`rgba(255,226,170,${lit})`;ctx.beginPath();ctx.ellipse(0,3,34,5,0,0,Math.PI*2);ctx.fill();
  ell(Math.sin(rt*1.7+A.toll*8)*7,11,6,7,'#140c07');
  ctx.restore();
  if(A.toll>0){ctx.strokeStyle=`rgba(240,226,184,${A.toll*.7})`;ctx.lineWidth=2.5;for(let i=0;i<3;i++){const r=40+((gt*120+i*30)%90);ctx.beginPath();ctx.arc(-6,ty-10,r,Math.PI*.15,Math.PI*.85,true);ctx.stroke()}}
  // 8. right arm (+ anchor when drawn)
  const rh={x:rS.x+Math.cos(A.armA)*82,y:rS.y+Math.sin(A.armA)*82};
  if(!A.onBack&&!S.noAnchor){const tip=drawAnchor(rh.x,rh.y,Math.cos(A.clap),Math.sin(A.clap),curAct(['slam','sweep'],0)?.45:0);S.clapTip={x:tip[0]+X,y:tip[1]}}
  limb(rS.x,rS.y,rh.x,rh.y,A.onBack?14:-14,22);
  fist(rh.x,rh.y);
  // a chain ring at the wrist, one link hanging
  {const dx=rh.x-rS.x,dy=rh.y-rS.y,l=Math.hypot(dx,dy)||1,wx=rh.x-dx/l*16,wy=rh.y-dy/l*16;ctx.strokeStyle='#6a3a1c';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(wx,wy,5,12,Math.atan2(dy,dx),0,Math.PI*2);ctx.stroke();ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(wx+2,wy+13,3,6,.3,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
  if(S.mode==='ko'&&S.phase===1&&!S.koBurst){S.koBurst=true;for(let i=0;i<5;i++)burst(700+(Math.random()-.5)*160,GY-120-Math.random()*120,14,i%2?'#cfeee6':'#c9925e',6,1.4,.35)}
}
/* the King's harpoon: tip at (x,y), pointing along a; returns the ring at the back of the shaft (for the chain) */
function harpoon(x,y,a,len){const c=Math.cos(a),s=Math.sin(a),px=-s,py=c,at=(d,p)=>[x-c*d+px*p,y-s*d+py*p];
  ctx.lineCap='round';ctx.strokeStyle='#140a05';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(...at(len,0));ctx.lineTo(...at(22,0));ctx.stroke();
  ctx.strokeStyle='#6a3a1c';ctx.lineWidth=4.5;ctx.stroke();ctx.strokeStyle='rgba(220,160,110,.25)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(...at(len,-1.5));ctx.lineTo(...at(24,-1.5));ctx.stroke();
  ctx.fillStyle='#2a1810';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(...at(28,11));ctx.lineTo(...at(21,3.5));ctx.lineTo(...at(36,3.5));ctx.lineTo(...at(36,-3.5));ctx.lineTo(...at(21,-3.5));ctx.lineTo(...at(28,-11));ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(225,200,170,.45)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(...at(28,-11));ctx.lineTo(x,y);ctx.lineTo(...at(28,11));ctx.stroke();
  const r=at(len+6,0);ctx.strokeStyle='#2a1810';ctx.lineWidth=3;ctx.beginPath();ctx.arc(r[0],r[1],5,0,Math.PI*2);ctx.stroke();return r}
function drawToll(){
  for(const th of S.threats){if(th.k!=='toll'||gt<th.tw)continue;
    const p=(gt-th.tw)/(th.ti-th.tw);if(th.res==='ok'&&gt>th.okT+.3)continue;
    const x=lerp(620,HX+40,Math.min(p,1)),a=th.res==='ok'?1-(gt-th.okT)/.3:th.res==='hit'?Math.max(0,1-(gt-th.okT)/.3):1;
    ctx.save();ctx.globalAlpha=clamp(a,0,1);
    for(let i=0;i<3;i++){const h=60+i*28;ctx.strokeStyle=`rgba(${240-i*20},${226-i*16},${184-i*10},${.8-i*.22})`;ctx.lineWidth=4-i;ctx.beginPath();ctx.ellipse(x+i*14,GY,14+i*6,h,0,Math.PI*.5,Math.PI*1.5);ctx.stroke()}
    glow(x,GY-30,70,'rgba(230,220,180,.55)',.45);ctx.restore()}
}

