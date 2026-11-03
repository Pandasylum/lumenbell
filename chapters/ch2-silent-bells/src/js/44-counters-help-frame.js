/* ---------- counters ---------- */
function drawCounter(){
  if(!S.cnt)return;const k=(gt-S.cnt.t)/S.cnt.dur;ctx.save();ctx.globalCompositeOperation='lighter';
  if(S.cnt.k===1){if(k>.32&&k<.62){const e=(k-.32)/.3;ctx.strokeStyle=`rgba(255,240,170,${1-e})`;ctx.lineWidth=10*(1-e)+2;ctx.beginPath();ctx.arc(640,GY-150,110,-2.2+e*.5,.6+e*.5);ctx.stroke()}}
  else if(S.cnt.k===2)drawCounter2(k);
  else if(S.cnt.k===3){if(k>.2&&k<.6)bolt(S.orbX,S.orbY,LX,S.form===2?ECY:LY,(k*7|0)/7,'rgba(255,250,238,.95)',4)}
  ctx.restore();
}

/* counters of the Hollow Voice, one per spell (decision 2026-11-03-ch2-voix-creuse), chosen by the last spell of the series
   (S.cv, set by P2): volley = straight beam at the Voice; rain = a thin beam bouncing on a mirror shard (`mirror`) then
   on her; wail = the scepter's bell sends a wave that shakes her; echo (end of the Echoes) = a great orb she dodges, which
   bounces on the mirror shard and comes back into her head (she reels). Fractions of the counter's length (R_CNT[2].dur;
   the hit lands at its hitAt .4): beam [a, b]; echo: orb reaches her `toV`, the mirror `toM`, her head `toH`; she leans
   aside `lean` px from `dodge[0]` to `dodge[1]`, reels `reel` px until `reelEnd`. */
const CNT2={mirror:{x:480,y:70},beam:[.22,.7],toV:.2,toM:.3,toH:.4,dodge:[.1,.34],lean:46,reel:7,reelEnd:.85};
function voiceSway(){
  if(!S.cnt||S.cnt.k!==2)return null;const C=CNT2,k=(gt-S.cnt.t)/S.cnt.dur;
  if(S.cv==='echo'&&k>C.dodge[0]&&k<C.dodge[1])return{x:C.lean*Math.sin(Math.PI*(k-C.dodge[0])/(C.dodge[1]-C.dodge[0])),y:-12*Math.sin(Math.PI*(k-C.dodge[0])/(C.dodge[1]-C.dodge[0]))};
  if((S.cv==='echo'||S.cv==='wail')&&k>C.toH&&k<C.reelEnd)return{x:Math.sin(gt*38)*C.reel*(1-(k-C.toH)/(C.reelEnd-C.toH)),y:0};
  return null;
}
function drawCounter2(k){
  const C=CNT2,ox=S.orbX,oy=S.orbY,p=voicePos(0),hx=p.x,hy=p.y-84,M=C.mirror;
  const seg=(x0,y0,x1,y1,e,w,a)=>{ctx.strokeStyle=`rgba(255,244,190,${a})`;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(lerp(x0,x1,e),lerp(y0,y1,e));ctx.stroke()};
  if(S.cv==='rain'){if(k>C.beam[0]&&k<C.beam[1]){const e=(k-C.beam[0])/(C.beam[1]-C.beam[0]),q=Math.min(1,e*3),a=1-e*.8,w=4*(1-e)+1.5;
      seg(ox,oy,M.x,M.y,Math.min(1,q*2),w,a);if(q>.5){seg(M.x,M.y,hx,hy,(q-.5)*2,w,a);glow(M.x,M.y,18,'rgba(255,250,220,.9)',a)}}}
  else if(S.cv==='wail'){if(k>C.beam[0]&&k<C.beam[1]){const e=(k-C.beam[0])/(C.beam[1]-C.beam[0]),ang=Math.atan2(hy-oy,hx-ox);
      for(let j=0;j<3;j++){const q=clamp(e*1.6-j*.25,0,1);if(q<=0||q>=1)continue;const x=lerp(ox,hx,q),y=lerp(oy,hy,q);ctx.strokeStyle=`rgba(255,240,170,${1-q})`;ctx.lineWidth=4*(1-q)+1.5;ctx.beginPath();ctx.arc(x,y,10+34*q,ang-.9,ang+.9);ctx.stroke()}}}
  else if(S.cv==='echo'){const v0=VPOS[0],vx=v0.x,vy=v0.y-84;let x=null,y;
      if(k>.04&&k<C.toV){const e=(k-.04)/(C.toV-.04);x=lerp(ox,vx,e);y=lerp(oy,vy,e)}
      else if(k>=C.toV&&k<C.toM){const e=(k-C.toV)/(C.toM-C.toV);x=lerp(vx,M.x,e);y=lerp(vy,M.y,e)}
      else if(k>=C.toM&&k<C.toH){const e=(k-C.toM)/(C.toH-C.toM);x=lerp(M.x,hx,e);y=lerp(M.y,hy,e)}
      if(k>=C.toM&&k<C.toM+.05)glow(M.x,M.y,26,'rgba(255,250,220,.95)',.9);
      if(x!=null){glow(x,y,48,'rgba(255,240,170,.95)',.9);ell(x,y,16,16,'#fff6d0')}}
  else if(k>C.beam[0]&&k<C.beam[1]){const e=(k-C.beam[0])/(C.beam[1]-C.beam[0]);seg(ox,oy,hx,hy,Math.min(1,e*3),8*(1-e)+2,1-e*.8)}
}

/* ---------- visual help ---------- */
/* the cue of the series for a real attack (LB.cue, decision 8 of 28 October, as in Chapter I): a bar above the head in Normal and
   Hard, a ring closing round the Watcher in Easy. This chapter keeps its own cues: the half-circle of the beams (hold: dashed to get
   ready, full to hold) and the dashed ring of a reflection (fake). CUE_Y: height of the bar above the feet, per internal phase (in
   phase III the stamina bar sits at 206, the bar goes above it). */
const CUE_Y={1:206,2:206,3:218};
function drawHelp(){
  if(!LB.help.on()||S.mode!=='play')return;
  const easy=S.dk==='easy';let next=null;
  for(const th of S.threats){
    if(th.done)continue;
    if(th.hold){if(gt>=th.t0&&gt<=th.tb){const on=gt>=th.ta;ctx.save();ctx.strokeStyle=on?'#e8fdff':'rgba(232,253,255,.6)';ctx.lineWidth=on?4:2;if(!on)ctx.setLineDash([5,6]);ctx.beginPath();ctx.arc(HX,GY-40,on?100:100+40*clamp((th.ta-gt)/1.2,0,1),Math.PI,0);ctx.stroke();ctx.restore()}continue}
    if(gt<th.t0)continue;
    if(th.real){if(th.ti>gt&&(!next||th.ti<next.ti))next=th;continue}   // the series' cue shows the next real attack only, as in Chapter I
    const span=Math.min(1,th.ti-th.t0),k=(th.ti-gt)/span;if(k>1||k<-.3)continue;
    const r=26+64*Math.max(0,k);
    ctx.save();ctx.strokeStyle='rgba(170,160,190,.7)';ctx.lineWidth=2;ctx.setLineDash([5,6]);
    ctx.beginPath();ctx.arc(HX+10,HY-10,r,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  if(next){ctx.save();LB.cue(ctx,{x:HX,y:GY-CUE_Y[S.phase],cx:HX+10,cy:HY-10,r:70,tt:next.ti-gt,act:PT().act,easy});ctx.restore()}
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(HX+10,HY-10,26,0,Math.PI*2);ctx.stroke();
}

/* ---------- frame ---------- */
let last=performance.now();
function draw(){
  ctx.setTransform(SC,0,0,SC,0,0);
  if(S.mode==='epilogue'||S.mode==='prologue'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);return}   // drawn by LB.cine in its own frame (72-flow.js)
  if(S.mode==='card'&&S.still){ctx.save();drawStill(S.still);ctx.restore();const vs=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.9);vs.addColorStop(0,'rgba(0,0,0,0)');vs.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vs;ctx.fillRect(0,0,W,H);return}
  ctx.save();
  if(S.shake>.3)ctx.translate((Math.random()-.5)*S.shake,(Math.random()-.5)*S.shake);
  const ph=S.phase;
  S.camDY=0;if(S.cine&&ph===1&&S.cine.k==='in'){const C=CINE_P2;S.camDY=C.descD*(1-eio(clamp((gt-S.cine.t0)/C.desc,0,1)));if(S.camDY>0)ctx.translate(0,S.camDY)}
  if(S.cine&&ph===3&&S.cine.k==='in'){const C=CINE_P3,z=1+(C.revealZ-1)*(1-eio(clamp((gt-S.cine.t0)/C.reveal,0,1)));if(z>1){ctx.translate(C.revealX,C.revealY);ctx.scale(z,z);ctx.translate(-C.revealX,-C.revealY)}}
  if(S.cine&&ph===3&&S.cine.k==='out'){const C=CINE_P3,z=1+(C.zoomZ-1)*eio(clamp((gt-S.cine.t0-C.zoom)/C.zoomD,0,1));if(z>1){const cx=BELL_REST.x-20,cy=GY-40;ctx.translate(cx,cy);ctx.scale(z,z);ctx.translate(-cx,-cy)}}
  [bg1,bg2,bg3][ph-1]();
  if(S.cine)cineBoss();
  else{const rc=(S.mode==='play'||S.mode==='ko')?S.recoil*SHOCK.recoilPx:0,hk=gt-(S.bossHurtT==null?-9:S.bossHurtT),hu=hk>=0&&hk<SHOCK.hurt?Math.sin(Math.PI*hk/SHOCK.hurt):0;
    const body=f=>{if(!rc&&!hu){f();return}const c=bossCore();ctx.save();ctx.translate(c.x+rc,GY);ctx.rotate(hu*.035);ctx.translate(-c.x,-GY);f();ctx.restore()};
    if(ph===1){body(drawBoss1);drawRust();drawToll();drawKingFx()}
    else if(ph===2){body(drawBoss2)}
    else if(S.form===2)body(drawEclGame);else{beaconHide();body(drawBoss3);drawBeacon();drawBeaconFx()}}
  if(S.mode!=='dead'||gt-S.deadT<.6){ctx.save();ctx.translate(S.heroDX||0,S.heroDY||0);drawHero();ctx.restore()}
  else{ell(HX,GY+2,30,6,'rgba(0,0,0,.45)');ctx.save();ctx.translate(HX,GY);ctx.rotate(-Math.PI/2*.9);ctx.translate(-HX,-GY);heroShape(HX,GY,'down',{},.3);ctx.restore()}
  if(S.post){const f=S.post;S.post=null;f()}
  if(ph===2)hatchRing();
  if(ph===2){mirrorFloor();if(S.cine&&S.cine.k==='out')sinkGlow(gt-S.cine.t0)}
  if(ph===2)drawOrbs();
  drawCounter();
  // particles
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const p of S.parts){const t=gt-p.t0,k=1-t/p.life;ctx.globalAlpha=k;ctx.fillStyle=p.c2?lerpC(p.c,p.c2,t/p.life):p.c;ctx.fillRect(p.x+p.vx*t*30,p.y+p.vy*t*30+p.g*t*t*300,p.r,p.r)}
  ctx.restore();
  drawHelp();
  // pops
  ctx.textAlign='center';ctx.font='800 26px '+LB.FONT.display;
  for(const p of S.pops){const t=gt-p.t0;ctx.globalAlpha=1-t;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(p.txt.toUpperCase(),p.x+2,p.y-t*40+2);ctx.fillStyle=p.c;ctx.fillText(p.txt.toUpperCase(),p.x,p.y-t*40)}
  ctx.globalAlpha=1;ctx.restore();
  // vignette & hurt flash
  const vg=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.9);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  if(S.cine)cineOverlay();
  if(S.rings)for(const r of S.rings){const u=1-r.life/SHOCK.ringLife;ctx.save();ctx.globalAlpha=1-u;ctx.strokeStyle=r.c;ctx.lineWidth=5*(1-u)+1;ctx.beginPath();ctx.arc(r.x,r.y,18+120*u,0,Math.PI*2);ctx.stroke();ctx.restore()}
  if(S.flashHit>0){ctx.fillStyle=`rgba(255,255,255,${S.flashHit})`;ctx.fillRect(0,0,W,H)}
  if(S.mode==='play'&&gt-S.roarT<.35){ctx.fillStyle=`rgba(230,250,245,${.3*(1-(gt-S.roarT)/.35)})`;ctx.fillRect(0,0,W,H)}
  const hk=gt-S.hurtT;if(hk<.3){ctx.fillStyle=`rgba(255,40,30,${.25*(1-hk/.3)})`;ctx.fillRect(0,0,W,H)}
  if(S.mode==='ko'){const k=gt-S.koT;if(k<.5){ctx.fillStyle=`rgba(255,255,255,${.5*(1-k/.5)})`;ctx.fillRect(0,0,W,H)}}
}

