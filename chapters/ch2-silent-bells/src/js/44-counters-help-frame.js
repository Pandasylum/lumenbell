/* ---------- counters ---------- */
function drawCounter(){
  if(!S.cnt)return;const k=(gt-S.cnt.t)/S.cnt.dur;ctx.save();ctx.globalCompositeOperation='lighter';
  if(S.cnt.k===1){if(k>.32&&k<.62){const e=(k-.32)/.3;ctx.strokeStyle=`rgba(255,240,170,${1-e})`;ctx.lineWidth=10*(1-e)+2;ctx.beginPath();ctx.arc(640,GY-150,110,-2.2+e*.5,.6+e*.5);ctx.stroke()}}
  else if(S.cnt.k===2){if(k>.22&&k<.7){const e=(k-.22)/.48,p=voicePos(0);ctx.strokeStyle=`rgba(255,244,190,${1-e*.8})`;ctx.lineWidth=8*(1-e)+2;ctx.beginPath();ctx.moveTo(S.orbX,S.orbY);ctx.lineTo(lerp(S.orbX,p.x,Math.min(1,e*3)),lerp(S.orbY,p.y-84,Math.min(1,e*3)));ctx.stroke()}}
  else if(S.cnt.k===3){if(k>.2&&k<.6)bolt(S.orbX,S.orbY,LX,S.form===2?ECY:LY,(k*7|0)/7,'rgba(255,250,238,.95)',4)}
  ctx.restore();
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

