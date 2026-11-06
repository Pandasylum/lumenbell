/* ---------- backgrounds (Chapter II colour code: tide turquoise; no forge, no snow, no frozen lake, no aurora) ---------- */
const R2=mulberry(22),SHARDS=[...Array(16)].map(()=>({x:R2()*W,y:30+R2()*330,s:14+R2()*30,r:R2()*6,v:(R2()-.5)*.6,o:R2()*6}));
const R3=mulberry(33),STARS=[...Array(70)].map(()=>({x:R3()*W,y:R3()*260,r:.5+R3()*1.2,o:R3()*6}));
const CRACKS=[...Array(9)].map(()=>{const pts=[];let x=R3()*W,y=GY+12+R3()*90;for(let i=0;i<5;i++){pts.push([x,y]);x+=(R3()-.3)*90;y+=(R3()-.5)*20}return pts});
const SPRAY=[...Array(60)].map(()=>({x:R3()*W,y:R3()*H,v:14+R3()*24,d:R3()*6}));
const TCR=[...Array(6)].map(()=>{const pts=[];let x=760+(R3()-.5)*50,y=GY-250;for(let i=0;i<6;i++){pts.push([x,y]);x+=(R3()-.5)*22;y+=40}return pts});
/* rust on iron, verdigris on bronze */
/* ---------- cached static layers ----------
   The parts of a background that never move (skies, seas, floors, stone, hull frames, rocks) are drawn once into an off-screen canvas
   (one per layer, only the rows it needs) and laid with one drawImage per frame. A layer is rebuilt only when the pixel scale SC
   changes (a resize). Layers keep the painter's order: what moves is drawn live between two layers. When the frame is zoomed or
   rotated (a_cine zoom), the layers are not used: the same drawing runs live, exactly as before. */
const BGC={};
function bgOK(){const m=ctx.getTransform();return Math.abs(m.a-SC)<1e-6&&Math.abs(m.d-SC)<1e-6&&!m.b&&!m.c}
/* LB.cacheLayer (shared/js/00-lb.js) : the drawing helpers of this chapter read the global ctx, so it is swapped to the layer's while fn runs */
function bgCache(w,h,fn,o){return LB.cacheLayer(w,h,x=>{const keep=ctx;ctx=x;try{fn()}finally{ctx=keep}},o)}
/* y0..y1: logical rows of the layer; fn draws it in logical coordinates (as the live code did) */
function bgLayer(id,y0,y1,fn){
  if(!bgOK()){fn();return}
  const ty=Math.floor(y0*SC);let e=BGC[id];
  if(!e||e.s!==SC)e=BGC[id]={c:bgCache(W,y1,fn,{k:SC,y0}),s:SC};
  ctx.drawImage(e.c,0,ty/SC,e.c.width/SC,e.c.height/SC)}
/* soft cloud of the reefs, one sprite per band b (same radial gradient and ellipse as before, centred in a 344 x 84 box) */
function cloudSprite(b){
  let e=BGC['cl'+b];
  if(!e||e.s!==SC)e=BGC['cl'+b]={s:SC,c:LB.cacheLayer(344,84,x=>{const cg=x.createRadialGradient(172,42,10,172,42,170);cg.addColorStop(0,`rgba(${18+b*6},${36+b*8},${42+b*8},.75)`);cg.addColorStop(1,'rgba(10,30,36,0)');x.fillStyle=cg;x.beginPath();x.ellipse(172,42,170,40,0,0,Math.PI*2);x.fill()},{k:SC})};
  return e.c}
function rustG(x0,x1){const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'#1a0d07');g.addColorStop(.4,'#6a3218');g.addColorStop(.6,'#4a2412');g.addColorStop(1,'#140a05');return g}
/* a rusted bell hanging from the deck beams of the hold */
let RUSTBELL_G=null;
function rustBell(x,y,s,sw){ctx.save();ctx.translate(x,y);ctx.rotate(sw);ctx.scale(s,s);
  ctx.fillStyle=RUSTBELL_G||(RUSTBELL_G=rustG(-26,26));ctx.beginPath();ctx.moveTo(-26,40);ctx.quadraticCurveTo(-24,4,0,0);ctx.quadraticCurveTo(24,4,26,40);ctx.closePath();ctx.fill();
  ctx.fillStyle='#120a06';ctx.fillRect(-28,37,56,5);ell(-9,20,5,8,'rgba(79,170,150,.4)');ell(10,30,4,4,'rgba(79,170,150,.3)');
  ell(Math.sin(sw*7)*5,45,4,5,'#0d0805');ctx.restore()}

/* Phase II · the hold of a wreck: hull frames, deck beams, rusted bells, portholes on the sea, flooded planks */
const HBELLS=[{x:105,l:64,s:.8},{x:318,l:118,s:1},{x:512,l:58,s:.7},{x:908,l:92,s:.9}];
const PORTS=[200,450,840];
function bg1(){
  bgLayer('1a',0,GY+2,()=>{
    const g=ctx.createLinearGradient(0,0,0,GY);g.addColorStop(0,'#050707');g.addColorStop(.55,'#12110e');g.addColorStop(1,'#1b1712');ctx.fillStyle=g;ctx.fillRect(0,0,W,GY);
    // hull planking, slightly curved
    ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=2;for(let y=60;y<GY;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.quadraticCurveTo(W/2,y-10,W,y);ctx.stroke()}
    ctx.strokeStyle='rgba(150,120,90,.06)';ctx.lineWidth=1;for(let y=62;y<GY;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.quadraticCurveTo(W/2,y-10,W,y);ctx.stroke()}});
  let g;
  // portholes: the sea outside, turquoise
  for(const x of PORTS){const y=172,p=.7+.3*Math.sin(rt*.9+x);
    ctx.save();ctx.globalCompositeOperation='lighter';const sg=ctx.createLinearGradient(x,y,x+70,GY);sg.addColorStop(0,`rgba(79,224,204,${.12*p})`);sg.addColorStop(1,'rgba(79,224,204,0)');ctx.fillStyle=sg;
      ctx.beginPath();ctx.moveTo(x-12,y);ctx.lineTo(x+12,y);ctx.lineTo(x+110,GY);ctx.lineTo(x+40,GY);ctx.closePath();ctx.fill();ctx.restore();
    ell(x,y,24,24,'#2a1a10');const pg=ctx.createRadialGradient(x-5,y-5,2,x,y,19);pg.addColorStop(0,`rgba(150,240,225,${.75*p})`);pg.addColorStop(1,'rgba(10,60,62,.95)');ell(x,y,18,18,pg);
    ctx.strokeStyle='rgba(200,255,245,.25)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-14,y+4+Math.sin(rt*1.3+x)*3);ctx.quadraticCurveTo(x,y-2,x+14,y+4-Math.sin(rt*1.3+x)*3);ctx.stroke();
    glow(x,y,46,'rgba(79,224,204,.6)',.25*p)}
  bgLayer('1b',0,GY+2,()=>{
    // hull frames
    for(let i=0;i<8;i++){const x=40+i*130;ctx.lineCap='butt';ctx.strokeStyle='#0d0a08';ctx.lineWidth=24;ctx.beginPath();ctx.moveTo(x-30,0);ctx.quadraticCurveTo(x+6,GY*.5,x-8,GY);ctx.stroke();
      ctx.strokeStyle='rgba(160,120,80,.10)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-38,0);ctx.quadraticCurveTo(x-2,GY*.5,x-16,GY);ctx.stroke()}
    // deck beams, bells on chains
    ctx.fillStyle='#0a0806';ctx.fillRect(0,0,W,30);ctx.fillStyle='rgba(160,120,80,.12)';ctx.fillRect(0,28,W,2);
    for(let x=-20;x<W;x+=150){ctx.fillStyle='#0c0907';ctx.fillRect(x,0,26,44);ctx.fillStyle='rgba(160,120,80,.08)';ctx.fillRect(x+22,0,3,44)}});
  ctx.lineCap='butt';ctx.lineWidth=3;ctx.strokeStyle='rgba(160,120,80,.10)';ctx.fillStyle='rgba(160,120,80,.08)';   // the state the live drawing left
  // the hatch from the mirror hall, seen from below: open, a cold light from above, the broken chain hanging
  {const hx=HATCH.x;ctx.fillStyle='#050a0b';ctx.fillRect(hx-60,0,120,30);const lg=ctx.createLinearGradient(0,0,0,GY);lg.addColorStop(0,'rgba(79,224,204,.16)');lg.addColorStop(1,'rgba(79,224,204,0)');
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=lg;ctx.beginPath();ctx.moveTo(hx-50,30);ctx.lineTo(hx+50,30);ctx.lineTo(hx+110,GY);ctx.lineTo(hx-90,GY);ctx.closePath();ctx.fill();glow(hx,14,70,'rgba(120,230,215,.7)',.35);ctx.restore();
   ctx.fillStyle='#3a1e10';for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(hx+sd*60,30);ctx.lineTo(hx+sd*58,62);ctx.lineTo(hx+sd*50,60);ctx.lineTo(hx+sd*50,30);ctx.fill()}
   chainLinks(hx-56,32,hx-50+Math.sin(rt*.8)*4,74,0,'#5a3018');
   if(S.camDY>0){ctx.fillStyle='#0b1618';ctx.fillRect(-20,-S.camDY-20,W+40,S.camDY+20);const sg=ctx.createLinearGradient(0,-S.camDY,0,0);sg.addColorStop(0,'rgba(79,224,204,.25)');sg.addColorStop(1,'rgba(79,224,204,.05)');ctx.fillStyle=sg;ctx.fillRect(hx-60,-S.camDY,120,S.camDY);
     ctx.strokeStyle='rgba(205,250,242,.4)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hx-60,-S.camDY);ctx.lineTo(hx-60,0);ctx.moveTo(hx+60,-S.camDY);ctx.lineTo(hx+60,0);ctx.stroke()}}
  for(const b of HBELLS){const sw=Math.sin(rt*.7+b.x)*.08+Math.sin(rt*9+b.x)*(S.shake||0)*.012;
    const ex=b.x+Math.sin(sw)*b.l,ey=30+Math.cos(sw)*b.l;chainLinks(b.x,30,ex,ey,0,'rgba(70,40,24,.95)');rustBell(ex,ey,b.s,sw)}
  // dripping water
  for(let i=0;i<8;i++){const x=70+i*121,k=(rt*.45+i*.29)%1;ell(x,30+k*(GY-30),1.3,3,`rgba(160,230,220,${.3*(1-k)})`)}
  // the floor: planks under a film of bilge water (and its fixed sheen)
  bgLayer('1c',GY-4,H,()=>{
    let g=ctx.createLinearGradient(0,GY,0,H);g.addColorStop(0,'#2a2017');g.addColorStop(.2,'#18120d');g.addColorStop(1,'#070504');ctx.fillStyle=g;ctx.fillRect(0,GY,W,H-GY);
    ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.5;for(let x=-480;x<W+480;x+=60){ctx.beginPath();ctx.moveTo(W/2+(x-W/2)*.55,GY);ctx.lineTo(x,H);ctx.stroke()}
    for(let y=GY+10,k=1;y<H;y+=9*k,k*=1.45){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    ctx.save();ctx.globalCompositeOperation='lighter';
    g=ctx.createLinearGradient(0,GY,0,H);g.addColorStop(0,'rgba(79,224,204,.10)');g.addColorStop(1,'rgba(79,224,204,.02)');ctx.fillStyle=g;ctx.fillRect(0,GY+8,W,H-GY);
    ctx.restore();
    ctx.strokeStyle='rgba(200,250,240,.22)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,GY+1);ctx.lineTo(W,GY+1);ctx.stroke()});
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<14;i++){const x=(i*83+rt*(6+i%3*4))%(W+120)-60,y=GY+16+(i*29)%(H-GY-20);ctx.strokeStyle=`rgba(170,240,225,${.10+.08*Math.sin(rt*2+i)})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+30+(i%4)*12,y);ctx.stroke()}
  ctx.restore();
  ctx.strokeStyle='rgba(200,250,240,.22)';ctx.lineWidth=1.5;
  // silt in the dark
  for(let i=0;i<18;i++){const x=(i*97+Math.sin(rt*.3+i)*20)%W,y=60+((rt*6+i*61)%(GY-60));ctx.globalAlpha=.15+.15*Math.sin(rt*1.5+i);ctx.fillStyle='#bfe9df';ctx.fillRect(x,y,1.6,1.6)}ctx.globalAlpha=1;
}

/* Phase I · the mirror hall at the foot of the Lighthouse: sea stone, arches open on the mist, floating mirror shards,
   a flooded floor that mirrors the hall (mirrorFloor, laid after the figures) and, on a stone step just above the water
   (so the water reflects it), the hatch down to the hold of the wreck: rusted, chained, a muffled bell tolling beneath */
const HATCH={x:470,w:150,face:16,top:12,toll:7.5};   // toll: seconds between two muffled tolls under the hatch (phase I)
function hatchTop(){const h=HATCH,y1=GY-h.face,y0=y1-h.top;return{y0,y1,l0:h.x-h.w/2+10,r0:h.x+h.w/2-10,l1:h.x-h.w/2,r1:h.x+h.w/2}}
/* k = 0 closed ... 1 open (the chain snaps first, then the two leaves swing up on their outer hinges) */
function drawHatch(k){const h=HATCH,T=hatchTop(),y1=GY-h.face;
  // the stone step
  let g=ctx.createLinearGradient(0,y1,0,GY);g.addColorStop(0,'#1d3236');g.addColorStop(1,'#0c1a1d');ctx.fillStyle=g;ctx.fillRect(h.x-h.w/2-12,y1,h.w+24,h.face);
  ctx.fillStyle='#16272a';ctx.beginPath();ctx.moveTo(T.l0-12,T.y0);ctx.lineTo(T.r0+12,T.y0);ctx.lineTo(T.r1+12,y1);ctx.lineTo(T.l1-12,y1);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;for(const x of[-40,10,55])ctx.strokeRect(h.x+x-30,y1,50,h.face);
  // the opening (dark, a faint sea light from the hold below)
  ctx.beginPath();ctx.moveTo(T.l0,T.y0);ctx.lineTo(T.r0,T.y0);ctx.lineTo(T.r1,T.y1);ctx.lineTo(T.l1,T.y1);ctx.closePath();
  g=ctx.createLinearGradient(0,T.y0,0,T.y1);g.addColorStop(0,'#000');g.addColorStop(1,'#0a1414');ctx.fillStyle=g;ctx.fill();
  if(k>0){ctx.save();ctx.clip();glow(h.x,T.y1,70,'rgba(79,224,204,.8)',.35*k);ctx.restore()}
  // the two leaves (rusted iron plates), swinging up from flat (0) to nearly upright
  const th=k*Math.PI/2*.92;
  for(const sd of[-1,1]){const hx0=sd<0?T.l0:T.r0,hx1=sd<0?T.l1:T.r1,cx0=h.x,cx1=h.x,c=Math.cos(th),s=Math.sin(th),half=h.w/2;
    const f0={x:hx0+(cx0-hx0)*c,y:T.y0-half*s*.8},f1={x:hx1+(cx1-hx1)*c,y:T.y1-half*s*.8};
    ctx.beginPath();ctx.moveTo(hx0,T.y0);ctx.lineTo(f0.x,f0.y);ctx.lineTo(f1.x,f1.y);ctx.lineTo(hx1,T.y1);ctx.closePath();
    g=ctx.createLinearGradient(hx1,0,f1.x,0);g.addColorStop(0,'#3a1e10');g.addColorStop(.6,'#5a2e16');g.addColorStop(1,'#2a160c');ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle='rgba(12,6,3,.85)';ctx.lineWidth=1.5;ctx.stroke();
    for(const q of[.35,.7]){ctx.beginPath();ctx.moveTo(lerp(hx0,f0.x,q),lerp(T.y0,f0.y,q));ctx.lineTo(lerp(hx1,f1.x,q),lerp(T.y1,f1.y,q));ctx.strokeStyle='rgba(20,10,5,.7)';ctx.lineWidth=2.5;ctx.stroke()}
    ell(lerp(hx1,f1.x,.5),lerp(T.y1,f1.y,.5)-2,4,2,'rgba(79,170,150,.35)')}
  // the chain: across the leaves and down the face, padlocked; once snapped, its two halves hang from the step
  const snap=S.hatchSnap;
  if(!snap){ctx.save();chainLinks(T.l1+6,y1+10,h.x,T.y1-4,0,'#5a3018');chainLinks(h.x,T.y1-4,T.r1-6,y1+10,0,'#5a3018');ctx.restore();
    ctx.fillStyle='#4a2612';rrect(h.x-6,T.y1-2,12,11,2);ctx.fill();ctx.strokeStyle='#2a1408';ctx.lineWidth=2;ctx.beginPath();ctx.arc(h.x,T.y1-2,4,Math.PI,0);ctx.stroke()}
  else{chainLinks(T.l1+6,y1+10,T.l1+14,GY+4,0,'#5a3018');chainLinks(T.r1-6,y1+10,T.r1-14,GY+4,0,'#5a3018')}}
/* the muffled toll under the hatch: a ring on the water at the foot of the step (date in S.hatchRing) */
function hatchRing(){if(!S.hatchRing)return;const q=gt-S.hatchRing;if(q<0||q>2)return;
  ctx.strokeStyle=`rgba(200,250,240,${.35*(1-q/2)})`;ctx.lineWidth=1.5;for(let i=0;i<2;i++){const r=20+q*70+i*16;ctx.beginPath();ctx.ellipse(HATCH.x,GY+3,r,r*.1,0,0,Math.PI*2);ctx.stroke()}}
function bg2(){
  const arch=(x,w)=>{ctx.beginPath();ctx.moveTo(x,GY);ctx.lineTo(x,150);ctx.quadraticCurveTo(x+w/2,40,x+w,150);ctx.lineTo(x+w,GY);ctx.closePath()};
  let g;
  bgLayer('2a',0,GY+2,()=>{
    let g=ctx.createLinearGradient(0,0,0,GY);g.addColorStop(0,'#03090c');g.addColorStop(.6,'#0a1b20');g.addColorStop(1,'#0f272b');ctx.fillStyle=g;ctx.fillRect(0,0,W,GY);
    // stone courses
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let y=36,r=0;y<GY;y+=34,r++){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();for(let x=(r%2)*45;x<W;x+=90){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,Math.min(GY,y+34));ctx.stroke()}}
    // arches open on the sea mist (their fill)
    for(let i=0;i<6;i++){const x=i*180-40,w=120;
      arch(x,w);g=ctx.createLinearGradient(0,60,0,GY);g.addColorStop(0,'#0b262b');g.addColorStop(.7,'#12393b');g.addColorStop(1,'#0d2c2f');ctx.fillStyle=g;ctx.fill()}});
  // the mist drifting in the arches
  for(let i=0;i<6;i++){const x=i*180-40,w=120;ctx.save();arch(x,w);ctx.clip();
    for(let k=0;k<3;k++){const yy=150+k*85,xx=((rt*(6+k*3)+i*70+k*50)%300)-150;glow(x+w/2+xx,yy,80,'rgba(150,225,215,.5)',.18)}
    ctx.restore()}
  bgLayer('2b',0,GY+2,()=>{
    for(let i=0;i<6;i++){const x=i*180-40,w=120;
      ctx.strokeStyle='#050d10';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x,GY);ctx.lineTo(x,150);ctx.quadraticCurveTo(x+w/2,40,x+w,150);ctx.lineTo(x+w,GY);ctx.stroke();
      ctx.strokeStyle='rgba(120,220,210,.12)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+12,GY);ctx.lineTo(x+12,158);ctx.quadraticCurveTo(x+w/2,66,x+w-12,158);ctx.lineTo(x+w-12,GY);ctx.stroke()}});
  // drips from the vault
  for(let i=0;i<9;i++){const x=60+i*103,k=(rt*.5+i*.37)%1;ell(x,k*GY,1.4,3,`rgba(170,235,230,${.35*(1-k)})`)}
  // floating mirror shards (same positions as the shard rain)
  roomTick();   // the hall closes in (36-boss-hollow-voice.js): the mirrors count the rages
  for(const [si,s] of SHARDS.entries()){if(S.shardGone&&S.shardGone[si]>gt)continue;const ra=roomShard(si);if(ra<=0)continue;ctx.save();ctx.globalAlpha*=ra;ctx.translate(s.x+Math.sin(rt*.4+s.o)*12,s.y+Math.cos(rt*.5+s.o)*8);ctx.rotate(s.r+rt*s.v);
    g=s.g||(s.g=ctx.createLinearGradient(-s.s,-s.s,s.s,s.s),s.g.addColorStop(0,'rgba(225,248,245,.30)'),s.g.addColorStop(.5,'rgba(100,170,170,.08)'),s.g.addColorStop(1,'rgba(225,248,245,.22)'),s.g);
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-s.s);ctx.lineTo(s.s*.6,0);ctx.lineTo(s.s*.1,s.s*.8);ctx.lineTo(-s.s*.5,s.s*.1);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(235,252,250,.35)';ctx.lineWidth=1;ctx.stroke();roomCrack(si,s.s);ctx.restore()}
  // the flooded floor: dark water over flagstones (the reflection is laid on it later)
  bgLayer('2c',GY-4,H,()=>{
    const g=ctx.createLinearGradient(0,GY,0,H);g.addColorStop(0,'#0c2b2f');g.addColorStop(1,'#020708');ctx.fillStyle=g;ctx.fillRect(0,GY,W,H-GY);
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let i=-8;i<=8;i++){ctx.beginPath();ctx.moveTo(480+i*44,GY);ctx.lineTo(480+i*130,H);ctx.stroke()}
    for(let y=GY+14,k=1;y<H;y+=10*k,k*=1.5){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}});
  drawHatch(S.hatchK||0);
}
/* the water of the mirror hall reflects what stands above it (copied from the frame itself, flipped and squashed) */
const MIRROR={src:220,a:.42};
function mirrorFloor(){
  const c=ctx.canvas,sc=c.width/W,h=MIRROR.src;
  ctx.save();ctx.beginPath();ctx.rect(0,GY,W,H-GY);ctx.clip();
  ctx.save();ctx.globalAlpha=MIRROR.a;ctx.translate(0,GY);ctx.scale(1,-.5);try{ctx.drawImage(c,0,Math.round((GY-h)*sc),c.width,Math.round(h*sc),0,-h,W,h)}catch(e){}ctx.restore();
  const g=ctx.createLinearGradient(0,GY,0,H);g.addColorStop(0,'rgba(20,80,82,.18)');g.addColorStop(1,'rgba(2,8,9,.75)');ctx.fillStyle=g;ctx.fillRect(0,GY,W,H-GY);
  ctx.strokeStyle='rgba(170,240,230,.10)';ctx.lineWidth=1;for(let i=0;i<9;i++){const y=GY+5+i*i*1.3,o=Math.sin(rt*1.2+i)*20;ctx.beginPath();ctx.moveTo(-20+o,y);ctx.lineTo(W+20+o,y);ctx.stroke()}
  voiceStretch();
  ctx.restore();
  ctx.strokeStyle='rgba(205,250,245,.35)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,GY+.5);ctx.lineTo(W,GY+.5);ctx.stroke();
}

/* Phase III · the reefs at night: low clouds, the open sea, black reef rock with foam and spray */
const R4=mulberry(44),FARROCK=[...Array(6)].map(()=>({x:R4()*W,w:20+R4()*50,h:6+R4()*16}));
/* the moon over the wreck (end of phase II) and the reefs (phase III) */
const MOON={x:720,y:78,r:26};
/* wrecks on the reef (x, keel y, scale, tilt) */
/* the lanternless staff in its heap of debris (phase III): heap centre x, top offset dx, visible height h */
const STAFF={x:150,dx:8,h:58};
const WRECKS=[[200,GY-34,.7,.08],[470,GY-22,.5,-.12]];
function wreck(x,y,s,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(s,s);ctx.fillStyle='#070b0c';ctx.beginPath();ctx.moveTo(-90,-30);ctx.quadraticCurveTo(-40,10,60,0);ctx.lineTo(96,-38);ctx.lineTo(80,-36);ctx.quadraticCurveTo(0,-14,-80,-40);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#070b0c';ctx.lineWidth=5;for(let i=0;i<5;i++){const xx=-60+i*28;ctx.beginPath();ctx.moveTo(xx,-14);ctx.quadraticCurveTo(xx-6,-50,xx+4,-70+i*4);ctx.stroke()}ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(10,-20);ctx.lineTo(24,-130);ctx.stroke();ctx.restore()}
const MIDROCK=[[0,GY-34,150,30],[120,GY-20,140,18],[330,GY-26,120,22],[470,GY-14,160,12],[880,GY-30,120,26]];
function reefRock(x,y,w,h,seed){const R=mulberry(seed);ctx.beginPath();ctx.moveTo(x-w/2,y+h);for(let i=0;i<=8;i++){const t=i/8;ctx.lineTo(x-w/2+t*w,y+h-Math.sin(Math.PI*t)*h*(.6+R()*.6))}ctx.closePath();ctx.fill()}
/* phase III: the same hull as the end of phase II (hullSky), now open to the night. Everything here is a number in HULL:
   ribs = [foot x, side (1 = leans right), height of the broken top, thickness], mast = foot, lean, height, sail tear,
   decks = [x, width] of plank decks on the reef floor, spikes = reef points between them (x, height),
   floats = planks and the barrel on the water (x, y on the sea, tilt, length; barrel: kind 'b'), bob = sway of the floating pieces */
const HULL={ribs:[[18,1,250,20],[96,1,210,16],[168,1,150,12],[952,-1,260,20],[880,-1,200,14]],
  mast:{x:470,lean:.22,h:230,w:9,sail:[.34,.9]},
  decks:[[0,150,26],[300,120,16],[560,90,12],[880,80,18]],spikes:[[168,14],[196,22],[222,12],[430,16],[458,26],[490,12],[672,14],[700,22],[800,12],[836,20]],
  floats:[[330,332,.06,46,'p'],[420,352,-.08,36,'p'],[610,338,.1,50,'p'],[700,358,0,0,'b'],[860,336,-.05,40,'p']],bob:{a:3,v:.9}};
function hullRuin(){
  const H3=HULL;ctx.lineCap='round';
  // the ribs of the hull: an arch at each side, broken at the top
  for(const [x,d,h,w] of H3.ribs){const tx=x+d*70,ty=GY-h;ctx.strokeStyle='#0a0705';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,GY+4);ctx.quadraticCurveTo(x-d*18,GY-h*.62,tx,ty);ctx.stroke();
    ctx.strokeStyle='rgba(150,120,90,.12)';ctx.lineWidth=Math.max(2,w*.15);ctx.beginPath();ctx.moveTo(x+d*5,GY+4);ctx.quadraticCurveTo(x-d*13,GY-h*.62,tx+d*3,ty+3);ctx.stroke();
    // the splintered end
    ctx.strokeStyle='#0a0705';ctx.lineWidth=Math.max(2,w*.3);ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+d*5,ty-16);ctx.moveTo(tx-d*3,ty+2);ctx.lineTo(tx-d*2,ty-12);ctx.stroke()}
  // the broken mast, leaning, its torn sail
  {const M=H3.mast,tx=M.x+Math.sin(M.lean)*M.h,ty=GY-Math.cos(M.lean)*M.h;ctx.strokeStyle='#120d09';ctx.lineWidth=M.w;ctx.beginPath();ctx.moveTo(M.x,GY+2);ctx.lineTo(tx,ty);ctx.stroke();
   ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+10,ty-14);ctx.moveTo(tx-2,ty+3);ctx.lineTo(tx-9,ty-9);ctx.stroke();
   const sx=M.x+Math.sin(M.lean)*M.h*M.sail[0],sy=GY-Math.cos(M.lean)*M.h*M.sail[0],sx2=M.x+Math.sin(M.lean)*M.h*M.sail[1],sy2=GY-Math.cos(M.lean)*M.h*M.sail[1],sw=Math.sin(rt*.8)*5;
   ctx.fillStyle='rgba(30,36,38,.82)';ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx2,sy2);ctx.quadraticCurveTo(sx2+34+sw,(sy+sy2)/2-6,sx2+50+sw*1.4,sy2+40);ctx.lineTo(sx2+36+sw,sy2+34);ctx.lineTo(sx2+30+sw,sy2+58);ctx.lineTo(sx2+14+sw*.6,sy2+44);ctx.lineTo(sx+22+sw*.4,sy+70);ctx.lineTo(sx+8,sy+62);ctx.closePath();ctx.fill();
   ctx.strokeStyle='rgba(150,170,175,.14)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx2+50+sw*1.4,sy2+40);ctx.stroke()}
  // the plank decks lying on the reef, reef points between them
  ctx.fillStyle='#050809';for(const [x,h] of H3.spikes){ctx.beginPath();ctx.moveTo(x-9,GY+2);ctx.lineTo(x-2,GY+2-h);ctx.lineTo(x+9,GY+2);ctx.closePath();ctx.fill()}
  for(const [x,w,t] of H3.decks){ctx.fillStyle='#120d09';ctx.fillRect(x,GY-t,w,t*.5);ctx.fillStyle='#0a0705';ctx.fillRect(x,GY-t*.5,w,t*.5+3);
    ctx.strokeStyle='rgba(150,120,90,.14)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k*22<w;k++){ctx.moveTo(x+k*22,GY-t);ctx.lineTo(x+k*22,GY+3)}ctx.moveTo(x,GY-t*.5);ctx.lineTo(x+w,GY-t*.5);ctx.stroke()}
}
/* planks and a barrel afloat on the open sea behind the fight */
function floatDebris(){
  for(const [x,y,a,l,k] of HULL.floats){const dy=Math.sin(rt*HULL.bob.v+x*.03)*HULL.bob.a;ctx.save();ctx.translate(x,y+dy);ctx.rotate(a+Math.sin(rt*HULL.bob.v+x)*.03);ctx.fillStyle='#0c0907';
    if(k==='b'){ctx.beginPath();ctx.ellipse(0,0,14,11,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(150,120,90,.25)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-13,-4);ctx.lineTo(13,-4);ctx.moveTo(-13,4);ctx.lineTo(13,4);ctx.stroke()}
    else{ctx.fillRect(-l/2,-3,l,6);ctx.fillRect(-l/3,3,l*.5,4)}
    ctx.strokeStyle='rgba(200,235,230,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,5,(k==='b'?18:l*.6),2.5,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
}
function bg3(){
  bgLayer('3a',0,300,()=>{const g=ctx.createLinearGradient(0,0,0,300);g.addColorStop(0,'#02060a');g.addColorStop(1,'#0a2228');ctx.fillStyle=g;ctx.fillRect(0,0,W,300)});
  for(const s of STARS){if(s.y>200)continue;ctx.globalAlpha=.15+.2*Math.sin(rt*1.5+s.o);ctx.fillStyle='#e8f6f2';ctx.fillRect(s.x,s.y,s.r,s.r)}ctx.globalAlpha=1;
  // the moon that lit the King at the end of phase II
  bgLayer('3b',0,190,()=>{glow(MOON.x-120,MOON.y-10,110,'rgba(220,235,255,.8)',.3);ell(MOON.x-120,MOON.y-10,MOON.r*.8,MOON.r*.8,'rgba(225,235,242,.85)')});
  // low clouds (a sprite per band while the frame is not zoomed; the same gradient drawn live otherwise)
  const live=!bgOK();
  for(let b=0;b<3;b++){const spr=live?null:cloudSprite(b);for(let i=0;i<6;i++){const x=((i*210+rt*(4+b*3)+b*90)%(W+300))-150,y=40+b*55+Math.sin(i+b)*12;
    if(spr)ctx.drawImage(spr,x-172,y-42,spr.width/SC,spr.height/SC);
    else{const cg=ctx.createRadialGradient(x,y,10,x,y,170);cg.addColorStop(0,`rgba(${18+b*6},${36+b*8},${42+b*8},.75)`);cg.addColorStop(1,'rgba(10,30,36,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.ellipse(x,y,170,40,0,0,Math.PI*2);ctx.fill()}}}
  // the open sea
  bgLayer('3c',250,GY+3,()=>{const g=ctx.createLinearGradient(0,300,0,GY);g.addColorStop(0,'#0c2c31');g.addColorStop(1,'#051418');ctx.fillStyle=g;ctx.fillRect(0,300,W,GY-300+2);
    ctx.fillStyle='#03090b';FARROCK.forEach((r,i)=>reefRock(r.x+r.w/2,300-r.h,r.w,r.h+1,80+i))});
  ctx.strokeStyle='rgba(140,230,220,.12)';ctx.lineWidth=1.2;for(let i=0;i<9;i++){const y=304+i*i*1.6,ph=rt*.6+i;ctx.beginPath();for(let x=0;x<=W;x+=30){const yy=y+Math.sin(x*.02+ph)*(1+i*.4);x?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke()}
  // rocks of the reef behind the fight, the ships the sea took, asleep on the reef
  bgLayer('3d',GY-170,GY+8,()=>{ctx.fillStyle='#060c0e';MIDROCK.forEach((r,i)=>reefRock(r[0]+r[2]/2,r[1],r[2],r[3],60+i));
    for(const [x,y,s,a] of WRECKS)wreck(x,y,s,a)});
  floatDebris();
  for(let i=0;i<5;i++){const r=MIDROCK[i],k=(rt*.35+i*.23)%1;ctx.strokeStyle=`rgba(220,245,240,${.35*(1-k)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(r[0]+r[2]/2,r[1]+r[3],r[2]*.5*(.8+k*.4),3+k*4,0,Math.PI,0);ctx.stroke()}
  // the reef floor: wet black rock, crevices, foam pools, the mooring rocks
  bgLayer('3e',GY-44,H,()=>{
    const g=ctx.createLinearGradient(0,GY-20,0,H);g.addColorStop(0,'#101a1d');g.addColorStop(.3,'#0a1114');g.addColorStop(1,'#030607');ctx.fillStyle=g;ctx.fillRect(0,GY-6,W,H-GY+6);
    ctx.fillStyle='#0b1315';reefRock(590,GY-14,90,16,71);reefRock(945,GY-14,90,16,72);
    ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=2;for(const c of CRACKS){ctx.beginPath();c.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke()}});
  for(const c of CRACKS){const p=c[2];ell(p[0],p[1],18,3,`rgba(160,230,220,${.08+.05*Math.sin(rt+p[0])})`)}
  ctx.strokeStyle='rgba(150,235,225,.28)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,GY-6);ctx.lineTo(W,GY-6);ctx.stroke();
  // a Watcher's staff without its lantern, planted in a heap of debris on the left: only its upper half shows, its small bell
  {const S0=STAFF;ctx.lineCap='round';ctx.strokeStyle='#3a2a1a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(S0.x,GY-18);ctx.lineTo(S0.x+S0.dx,GY-18-S0.h);ctx.stroke();
   const tx=S0.x+S0.dx,ty=GY-18-S0.h;ctx.strokeStyle='#2a3238';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx-4,ty-12);ctx.moveTo(tx,ty);ctx.lineTo(tx+7,ty-10);ctx.stroke();
   const sw=Math.sin(rt*1.1)*.15;ctx.save();ctx.translate(tx+2,ty+4);ctx.rotate(sw);ctx.strokeStyle='#2a3238';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,6);ctx.stroke();
   ctx.fillStyle=BRONZE_STAFF||(BRONZE_STAFF=bronze(-5,5));ctx.beginPath();ctx.moveTo(-5,15);ctx.quadraticCurveTo(-4,6,0,6);ctx.quadraticCurveTo(4,6,5,15);ctx.closePath();ctx.fill();ctx.restore();
   ctx.fillStyle='#0a0705';ctx.beginPath();ctx.moveTo(S0.x-46,GY+2);ctx.lineTo(S0.x-30,GY-14);ctx.lineTo(S0.x-8,GY-22);ctx.lineTo(S0.x+12,GY-26);ctx.lineTo(S0.x+34,GY-12);ctx.lineTo(S0.x+52,GY+2);ctx.closePath();ctx.fill();
   ctx.fillStyle='#16100b';ctx.save();ctx.translate(S0.x-14,GY-18);ctx.rotate(-.35);ctx.fillRect(-22,-3,44,6);ctx.restore();ctx.save();ctx.translate(S0.x+20,GY-14);ctx.rotate(.5);ctx.fillRect(-16,-3,32,5);ctx.restore()}
  hullRuin();
  // surf breaking at the front edge, spray in the wind
  for(let i=0;i<4;i++){const k=(rt*.25+i*.25)%1,y=H-6-k*18;ctx.strokeStyle=`rgba(225,245,240,${.3*Math.sin(Math.PI*k)})`;ctx.lineWidth=2;ctx.beginPath();for(let x=0;x<=W;x+=40){const yy=y+Math.sin(x*.03+i*2+rt)*3;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke()}
  ctx.fillStyle='rgba(225,245,240,.55)';for(const s of SPRAY){const y=H-((s.y*.5+rt*s.v)%(H*.55)),x=(s.x+rt*s.v*.8+Math.sin(rt+s.d)*10)%W;ctx.globalAlpha=clamp((y-H*.45)/80,0,1)*.7;ctx.fillRect(x,y,1.6,1.6)}ctx.globalAlpha=1;
}
let BRONZE_STAFF=null;

