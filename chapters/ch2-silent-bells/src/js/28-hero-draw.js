/* ---------- hero ---------- */
/* The Watcher is the one of the whole series, drawn by shared/js/20-watcher.js (LB.drawWatcher: helm with its visor, tabard with
   the lantern emblem, lantern-sceptre with its small bell; poses in LB.WATCHER_POSES; breathing as decided on 28 October). This
   chapter only picks the pose from its own state and adds its own effects: the shield of the block (LB.drawBlock, as in Ember
   Bridge), the dome of the held guard, afterimages, the red flash of a hit, the help bars. */
function drawHero(){
  const ph=S.phase,p=S.pl,play=S.mode==='play';
  let ox=0,tint=0,pose='idle',o={k:1};
  const hk=gt-S.hurtT;if(hk<.4){const k=1-hk/.4;ox=-16*k;tint=k;pose='hurt';o={k}}
  if(ph===1&&p.s==='act'&&play){pose='block';o={k:clamp(p.t/LB.WATCHER_T.raise,0,1)}}
  if(ph===2){const g=gt-S.dodgeT;if(g<.38){pose='dodgeSide';o={k:Math.sin(Math.PI*g/.38)}}}
  if(ph===3&&S.holding){pose='hold';o={}}
  if(ph===3&&gt<S.broken){pose='hurt';o={k:1}}
  if(S.cnt){pose='cast';o={rot:.06}}   // the counters of the Elder (spells of the Elder: 64-prologue.js, counterKing) and of the other bosses: the sceptre raised
  if(S.heroPose){pose='raise';o={staffA:S.heroPose.staffA,rot:S.heroPose.lean||0,breath:true}}
  const x=HX+ox,y=GY;
  if(S.ghost){for(let i=1;i<4;i++){ctx.globalAlpha=.2/i;heroShape(x-i*34,y,pose,o,0,true)}ctx.globalAlpha=1}
  // afterimages (dodge)
  if(ph===2&&gt-S.dodgeT<.3){ctx.globalAlpha=.25;heroShape(x+24,y,pose,o,0,true);ctx.globalAlpha=1}
  ell(x,y+2,30,6,'rgba(0,0,0,.45)');
  heroShape(x,y,pose,o,tint);
  // the shield of the block (phase II), as in Ember Bridge: it lasts as long as the action
  if(ph===1&&p.s==='act'&&play)LB.drawBlock(ctx,x,y,p.t,PT().act);
  // phase III, hold: the blue dome, only while the gesture is held (domeAlpha: fade-in, nothing for a tap), thin outline, light fill, the Watcher stays visible
  const da=domeAlpha(),warn=domeWarn();
  if(da>0){const Z=GUARD_FX.dome,jx=warn?Math.sin(gt*70)*2.2:0,jy=warn?Math.cos(gt*83)*1.4:0;ctx.save();ctx.globalAlpha=da;
    ctx.fillStyle=`rgba(127,214,255,${Z.fill})`;ctx.beginPath();ctx.arc(x+jx,y+jy,92,Math.PI,0);ctx.fill();
    ctx.strokeStyle=warn?`rgba(${FATIGUE.amber},${Z.lineA})`:`rgba(191,240,255,${Z.lineA})`;ctx.lineWidth=Z.line;ctx.stroke();ctx.restore()}
  // the ghost dome: the dome that was missing when a hit landed on a threat to hold (GHOST_DOME), dashed, fading
  if(ph===3&&S.ghostDome!=null&&gt-S.ghostDome<GHOST_DOME.dur){const Z=GHOST_DOME,u=(gt-S.ghostDome)/Z.dur,a=Math.min(1,(gt-S.ghostDome)/Z.in)*(1-u);ctx.save();ctx.globalAlpha=a;
    ctx.fillStyle=`rgba(127,214,255,${Z.fill})`;ctx.beginPath();ctx.arc(HX,y,Z.r,Math.PI,0);ctx.fill();
    ctx.strokeStyle=`rgba(191,240,255,${Z.lineA})`;ctx.lineWidth=GUARD_FX.dome.line;ctx.setLineDash(Z.dash);ctx.stroke();ctx.restore()}
  // the dome bursts when the hold is too long (fatigue): shards of the outline fly off
  if(ph===3&&S.domeBurst!=null&&gt-S.domeBurst<.3){const u=(gt-S.domeBurst)/.3;ctx.save();ctx.globalAlpha=1-u;ctx.strokeStyle='rgba(191,240,255,.9)';ctx.lineWidth=2;ctx.setLineDash([14,10]);ctx.beginPath();ctx.arc(x,y,92+60*u,Math.PI,0);ctx.stroke();ctx.restore()}
  // phase III, tap: an arc of light (yellow-white of the lantern) in front of the Watcher, turned towards the threat
  if(ph===3&&S.arc&&gt-S.arc.t0<GUARD_FX.arc.dur){const G=GUARD_FX.arc,u=(gt-S.arc.t0)/G.dur,cx=x+16,cy=y-80,r=G.r*(.85+.15*eout(u));
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    ctx.strokeStyle=`rgba(${COUNTER3.col},${.35*(1-u)})`;ctx.lineWidth=G.w*2.2;ctx.beginPath();ctx.arc(cx,cy,r,S.arc.a-G.span,S.arc.a+G.span);ctx.stroke();
    ctx.strokeStyle=`rgba(${COUNTER3.col},${1-u})`;ctx.lineWidth=G.w*(1-.5*u);ctx.stroke();ctx.restore()}
  // recovery bar under the Watcher: a help cue, only with the Help box ticked (the lantern turns red for a refused press)
  if(play&&!S.cine&&LB.help.on())LB.drawRecoveryBar(ctx,x,y,S.pl);
  // stamina bar, above the lantern of the Watcher (y - 206, the height of Ember Bridge's help bar)
  if(ph===3&&play&&!S.cine){const w=60;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-w/2,y-206,w,6);ctx.fillStyle=gt<S.broken?'#ff8a7a':S.pl.stam<.3?'#ffd27a':'#7fd6ff';ctx.fillRect(x-w/2,y-206,w*S.pl.stam,6)}
}
/* the Watcher at (x, y) = his feet, in a pose of LB.WATCHER_POSES (o: its options, see shared/js/20-watcher.js); tint = red flash
   of a hit (0..1); ghost = an afterimage (the lantern's position is not kept). The lantern: red for a refused press, amber while
   recovering (play only), dimmed by S.lampDim (end of phase I); its centre is kept in S.orbX, S.orbY (start of the counters). */
function heroShape(x,y,pose,o,tint,ghost){
  const P=LB.WATCHER_POSES[pose](o.k==null?1:o.k,o,rt),lit=P.lit||(o.staffA!=null&&o.staffA<-1.42-.135);
  const opt=Object.assign({lamp:1-(S.lampDim||0),breath:pose==='idle',lanternCol:LB.watcherLanternCol(S.mode==='play'?S.pl:null,lit)},o);
  if(S.pulse>0&&!ghost)opt.glow=PULSE_FX.base+(PULSE_FX.peak-PULSE_FX.base)*S.pulse;   // entry of phase III: the lantern pulses with the press
  const L=LB.drawWatcher(ctx,x,y,pose,rt,opt);
  if(!ghost){S.orbX=L.lx;S.orbY=L.ly}
  if(tint>0){ctx.save();ctx.globalAlpha=tint*.5;ctx.fillStyle='#ff4a3a';ctx.beginPath();ctx.ellipse(x,y-60,32,66,0,0,Math.PI*2);ctx.fill();ctx.restore()}
}
