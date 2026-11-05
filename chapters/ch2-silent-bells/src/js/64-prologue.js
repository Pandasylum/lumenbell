/* ---------- Prologue: the silent coast (docs/CH2-SPEC.md, intro) ---------- */
/* intro in the series frame (LB.cine, shared/js/24-cine.js, as in Ember Bridge): one shot per carton, durations in CINE_D
   (6 to 7 s, as in Chapter I); the module fades each carton in and out (LB.CINE_T.fade), shows the caption under the image
   and the Skip button; then the title shot (no caption). Shots: A the coast in the mist, B the dark Lighthouse out at sea,
   C the beach with the boats that no longer go out, D the Lighthouse's top, a faint glimmer up there; E (title) the
   Watcher comes onto the shore. */
/* carton durations of this chapter (s): intro A to E, outro (epilogue) 1 to 5 */
const CINE_D={intro:[6,7,7,7,6],outro:[7,6,6,7,7]};
const PRO_T={walk:1.4,titleAt:.6};
const PRO_SHOTS=CINE_D.intro.slice(0,4).reduce((a,d)=>(a.push(a[a.length-1]+d),a),[0]);   // starts of A, B, C, D, E
const PRO_TITLE=PRO_SHOTS[4]+PRO_T.titleAt;
const PCAP_TXT=()=>[_('On the coast, the mist no longer lifts.','Sur la côte, la brume ne se lève plus.'),
  _('Out at sea, the Drowned Lighthouse stands dark. No bell answers it.','Au large, le Phare Noyé se dresse, éteint. Aucune cloche ne lui répond.'),
  _('The ships no longer return. The fishermen say the sea keeps what it takes.',"Les navires ne reviennent plus. Les pêcheurs disent que la mer garde ce qu'elle prend."),
  _('They say its keeper still watches up there.','On dit que sa gardienne veille encore là-haut.')];
const PSFX=[[0,'swell'],[PRO_SHOTS[1],'rumble'],[PRO_SHOTS[2],'swell'],[PRO_SHOTS[3],'glints'],[PRO_SHOTS[4]+PRO_T.walk,'land'],[PRO_TITLE+.4,'sting']];
/* ---- pieces of the coast, shared by the intro and the outro ---- */
function skyGrad(top,bot,y1){const g=ctx.createLinearGradient(0,0,0,y1);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(-40,-40,W+80,y1+40)}
/* the sea from y0 down: colour stops, swell lines */
function seaBand(y0,c0,c1,a){const g=ctx.createLinearGradient(0,y0,0,H);g.addColorStop(0,c0);g.addColorStop(1,c1);ctx.fillStyle=g;ctx.fillRect(-40,y0,W+80,H-y0+40);
  ctx.strokeStyle=`rgba(170,235,225,${a})`;ctx.lineWidth=1.2;for(let i=0;i<10;i++){const y=y0+4+i*i*2.2,ph=rt*.5+i;ctx.beginPath();for(let x=-40;x<=W+40;x+=30){const yy=y+Math.sin(x*.018+ph)*(1+i*.5);x>-40?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke()}}
/* mist banks drifting along the coast */
function mist(y,n,a,sp){for(let i=0;i<n;i++){const x=((i*260+rt*sp*(1+i%3*.3))%(W+520))-260,yy=y+Math.sin(i*1.7)*18;const g=ctx.createRadialGradient(x,yy,10,x,yy,220);g.addColorStop(0,`rgba(170,200,200,${a})`);g.addColorStop(1,'rgba(170,200,200,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,yy,240,52,0,0,Math.PI*2);ctx.fill()}}
/* the Drowned Lighthouse itself (stone, before the tower of bells): base on its reef at (x, y), scale s; glim = turquoise
   glimmer up in the lantern room (0..1); sub = how much of the base is under water (0..1) */
function lighthouse(x,y,s,glim){ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ctx.fillStyle='#060c0e';ctx.beginPath();ctx.moveTo(-80,0);ctx.lineTo(-56,-18);ctx.lineTo(-20,-22);ctx.lineTo(30,-16);ctx.lineTo(70,-6);ctx.lineTo(90,0);ctx.closePath();ctx.fill();
  const g=ctx.createLinearGradient(-34,0,34,0);g.addColorStop(0,'#0b1214');g.addColorStop(.45,'#2a3a3c');g.addColorStop(1,'#080e10');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-34,-14);ctx.lineTo(-22,-250);ctx.lineTo(22,-250);ctx.lineTo(34,-14);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.35)';for(const y0 of[-60,-120,-180])ctx.fillRect(-32+(-y0)*.045,y0,64-(-y0)*.09,6);
  ctx.fillStyle='#030607';for(const [wy,wx] of[[-90,-4],[-150,3],[-205,-3]])ctx.fillRect(wx-3,wy,6,12);
  ctx.fillStyle='#0d1618';ctx.fillRect(-32,-258,64,8);ctx.strokeStyle='#0d1618';ctx.lineWidth=2;for(let i=-28;i<=28;i+=7){ctx.beginPath();ctx.moveTo(i,-258);ctx.lineTo(i,-270);ctx.stroke()}
  ctx.fillStyle='#0a1214';ctx.fillRect(-16,-296,32,38);ctx.fillStyle='rgba(30,50,52,.9)';ctx.fillRect(-12,-292,24,28);
  ctx.strokeStyle='#050a0b';ctx.lineWidth=2;for(const i of[-4,4]){ctx.beginPath();ctx.moveTo(i,-292);ctx.lineTo(i,-264);ctx.stroke()}
  ctx.fillStyle='#0a1214';ctx.beginPath();ctx.moveTo(-20,-296);ctx.lineTo(0,-318);ctx.lineTo(20,-296);ctx.closePath();ctx.fill();
  if(glim>0){ctx.globalCompositeOperation='lighter';glow(0,-278,40,'rgba(79,224,204,.9)',glim);ell(0,-278,2.5,3.5,`rgba(220,255,248,${glim})`);ctx.globalCompositeOperation='source-over'}
  ctx.restore()}
/* a fishing village on the shore: houses, a chapel with its bell, all dark (lit = window light 0..1) */
function village(x0,y,lit){ctx.fillStyle='#071014';
  for(const [x,w,h] of[[0,46,40],[54,38,30],[100,52,46],[170,40,34],[218,48,40]]){ctx.fillRect(x0+x,y-h,w,h);ctx.beginPath();ctx.moveTo(x0+x-4,y-h);ctx.lineTo(x0+x+w/2,y-h-18);ctx.lineTo(x0+x+w+4,y-h);ctx.fill();
    if(lit>0){ctx.fillStyle=`rgba(255,207,122,${lit*(.6+.3*Math.sin(rt*2+x))})`;ctx.fillRect(x0+x+w/2-4,y-h+12,7,8);ctx.fillStyle='#071014'}}
  ctx.fillRect(x0+290,y-96,26,96);ctx.beginPath();ctx.moveTo(x0+286,y-96);ctx.lineTo(x0+303,y-122);ctx.lineTo(x0+320,y-96);ctx.fill();
  ctx.fillStyle='#0c1a1c';ctx.beginPath();ctx.moveTo(x0+294,y-70);ctx.quadraticCurveTo(x0+303,y-84,x0+312,y-70);ctx.lineTo(x0+313,y-62);ctx.lineTo(x0+293,y-62);ctx.fill()}
/* a boat pulled up on the sand, keel up */
function boat(x,y,s,up){ctx.save();ctx.translate(x,y);ctx.scale(s,up?-s:s);ctx.fillStyle='#120d09';ctx.beginPath();ctx.moveTo(-50,-14);ctx.quadraticCurveTo(0,8,50,-18);ctx.lineTo(44,-4);ctx.quadraticCurveTo(0,10,-44,-2);ctx.closePath();ctx.fill();ctx.restore()}
function drawPrologue(t){
  const shot=PRO_SHOTS.filter(s=>t>=s).length-1,ts=t-PRO_SHOTS[shot],drift=ts*5;
  ctx.save();
  if(shot===0){ // A: the coast in the mist
    skyGrad('#070c10','#2a3a3e',330);mist(150,4,.18,10);
    ctx.translate(-drift,0);
    ctx.fillStyle='#0b1619';ctx.beginPath();ctx.moveTo(-40,300);[[120,280],[300,292],[480,276],[700,290],[1000,284]].forEach(p=>ctx.lineTo(p[0],p[1]));ctx.lineTo(1000,330);ctx.lineTo(-40,330);ctx.fill();
    seaBand(330,'#1d3236','#071214',.14);
    ctx.fillStyle='#0a1012';ctx.beginPath();ctx.moveTo(-40,H);ctx.lineTo(-40,380);ctx.quadraticCurveTo(300,350,560,372);ctx.quadraticCurveTo(760,392,1000,360);ctx.lineTo(1000,H);ctx.fill();
    village(120,372,.25);
    ctx.translate(drift,0);mist(330,5,.32,16);mist(420,4,.28,-12)}
  else if(shot===1){ // B: the Lighthouse out at sea, dark
    skyGrad('#05090c','#1c2c30',300);mist(120,3,.14,8);
    seaBand(300,'#14292d','#040b0d',.16);
    lighthouse(640-drift*.6,306,.62,0);
    for(let i=0;i<4;i++){const k=(rt*.3+i*.25)%1;ctx.strokeStyle=`rgba(220,245,240,${.25*Math.sin(Math.PI*k)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(640-drift*.6,307,40+k*30,3+k*2,0,Math.PI,0);ctx.stroke()}
    mist(290,5,.26,14)}
  else if(shot===2){ // C: the beach, boats keel up, empty moorings
    skyGrad('#060a0d','#22343a',310);mist(170,3,.15,9);
    seaBand(310,'#18303a','#050c0e',.15);
    lighthouse(860,312,.22,0);
    ctx.translate(-drift,0);
    ctx.fillStyle='#14110d';ctx.beginPath();ctx.moveTo(-40,H);ctx.lineTo(-40,400);ctx.quadraticCurveTo(400,382,1000,410);ctx.lineTo(1000,H);ctx.fill();
    for(const x of[120,190,620,700,770]){ctx.fillStyle='#0a0806';ctx.fillRect(x,350,6,64);ctx.strokeStyle='rgba(60,40,24,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+3,366);ctx.quadraticCurveTo(x+40,400,x+80,374);ctx.stroke()}
    boat(330,420,1.3,true);boat(480,432,1.1,true);boat(880,424,1,false);
    ctx.fillStyle='#071014';for(const x of[560,590]){ctx.beginPath();ctx.moveTo(x,412);ctx.lineTo(x+6,370);ctx.arc(x+8,362,7,0,Math.PI*2);ctx.lineTo(x+16,412);ctx.closePath();ctx.fill()}
    ctx.translate(drift,0);
    ctx.fillStyle='#0a0f10';ctx.fillRect(760-drift*.3,320,3,-60);ctx.fillRect(748-drift*.3,288,26,2); // a mast out of the water
    mist(360,4,.22,12)}
  else{ // D: the Lighthouse's top, a glimmer; E: the same, the Watcher comes onto the shore
    skyGrad('#04080b','#1a2b30',330);mist(110,3,.12,8);
    seaBand(330,'#132a2e','#040b0d',.15);
    const z=1+.06*eio(clamp((t-PRO_SHOTS[3])/8,0,1));ctx.save();ctx.translate(700,330);ctx.scale(z,z);ctx.translate(-700,-330);
    lighthouse(700,336,.95,.55+.35*Math.sin(t*2.2));ctx.restore();
    ctx.fillStyle='#0a1012';ctx.beginPath();ctx.moveTo(-40,H);ctx.lineTo(-40,GY-8);ctx.quadraticCurveTo(300,GY-16,520,GY+6);ctx.quadraticCurveTo(580,GY+40,640,H);ctx.fill();
    ctx.strokeStyle='rgba(220,245,240,.3)';ctx.lineWidth=1.5;for(let i=0;i<3;i++){const k=(rt*.3+i*.33)%1;ctx.beginPath();ctx.moveTo(520-k*40,GY+10+i*8);ctx.quadraticCurveTo(700,GY+20+i*12,W+40,GY+14+i*12);ctx.stroke()}
    mist(400,3,.2,10);
    if(shot>=4){const walk=eio(clamp(ts/PRO_T.walk,0,1)),hx=lerp(-40,W/2-60,walk);
    LB.drawWatcher(ctx,hx,GY,walk<1?'walk':'idle',walk<1?t:rt);   // the Watcher of the series (shared/js/20-watcher.js)
    if(ts>=PRO_T.walk&&once('land'))burst(W/2-60,GY,14,'#9fb6a0',3,.7,.3)}}
  ctx.restore();
  // particles
  ctx.save();ctx.globalCompositeOperation='lighter';for(const p of S.parts){const q=gt-p.t0,k=1-q/p.life;ctx.globalAlpha=k;ctx.fillStyle=p.c;ctx.fillRect(p.x+p.vx*q*30,p.y+p.vy*q*30+p.g*q*q*300,p.r,p.r)}ctx.restore();
  // the series title (LB.title, as in Chapter I); captions, fades and cuts are the frame's (LB.cine)
  LB.title(ctx,t,PRO_TITLE,{col:CH_COL[2],sub:_('Chapter II · Silent Bells','Chapitre II · Silent Bells')});
  PSFX.forEach((c,i)=>{if(t>=c[0]&&once('pfx'+i))MUSIC.fx(c[1])});
}
function lerpC(a,b,k){return`rgb(${a.map((v,i)=>Math.round(lerp(v,b[i],k))).join(',')})`}
/* ================= GAME: Silent Bells (Ember Bridge, chapter II) ================= */
const ORDER=[2,1,3];               // phase I = the Voice, II = the King, III = the Beacon
const gpOf=id=>ORDER.indexOf(id)+1;
/* phase texts (docs/CH2-SPEC.md): eye = phase title, boss = name (card title), desc = entry panel, end = end panel */
const PH=[null,
 {eye:()=>_('Phase II · The Hold','Phase II · La cale'),
  desc:()=>_('Beneath the Lighthouse, the hull of a stranded ship. The iron, eaten away by salt, seems to have lain here for centuries.',"Sous le Phare, la coque d'un navire échoué. Le fer rongé par le sel semble reposer ici depuis des siècles."),
  end:()=>_('After years of waiting, by the light of the moon, only silence answers him.',"Après des années d'attente, à la lueur de la lune, seul le silence lui répond."),
  head:()=>_('Phase II of III · The Hold','Phase II sur III · La cale'),boss:()=>_('The Rust Elder',"L'Ancien de Rouille"),btn:()=>_('Block','Bloquer'),
  aria:()=>_("The Watcher facing the Rust Elder, a colossus of bells armed with an anchor","Le Veilleur face à l'Ancien de Rouille, un colosse de cloches armé d'une ancre")},
 {eye:()=>_('Phase I · The Mirror Hall','Phase I · La salle des reflets'),
  desc:()=>_("A strange heaviness settles over the foot of the Lighthouse. Crystalline sounds ring out across the vastness. Among these suspended echoes, a voice drifts through the air, steeped in deep sorrow.","Une étrange pesanteur enveloppe le pied du Phare. Des sonorités cristallines résonnent dans l'immensité. Parmi ces échos suspendus, une voix flotte dans l'air, empreinte d'une profonde tristesse."),
  end:()=>_("The Voice fades in a last murmur, familiar to the Watcher.","La Voix s'éteint dans un dernier murmure, familier au Veilleur."),
  head:()=>_('Phase I of III · The Mirror Hall','Phase I sur III · La salle des reflets'),boss:()=>_('The Hollow Voice','La Voix Creuse'),btn:()=>_('Dodge','Esquiver'),
  aria:()=>_('The Watcher facing the Hollow Voice, a figure with a cracked mirror face','Le Veilleur face à la Voix Creuse, une silhouette au visage de miroir fêlé')},
 {eye:()=>_('Phase III · The Reefs','Phase III · Les récifs'),
  desc:()=>_('The sea has drawn back. The ships it took sleep on the reef, their wrecks given over to a presence that knows neither rest nor forgetting.',"La mer s'est retirée. Les navires qu'elle a pris dorment sur le récif, leurs carcasses livrées à une présence qui ne connaît ni repos ni oubli."),
  end:()=>_("In the wreckage lies the Lighthouse's bell, cracked and silent.","Dans les décombres gît la cloche du Phare, fêlée et muette."),
  head:()=>_('Phase III of III · The Reefs','Phase III sur III · Les récifs'),boss:()=>S.form===2?_('The Bottomless','La Sans-Fond'):_('The Drowned Lighthouse','Le Phare Noyé'),btn:()=>_('Block','Bloquer'),
  aria:()=>_("The Watcher on the reefs facing the Drowned Lighthouse, a tower made of the Elder's body, crowned by an electric jellyfish","Le Veilleur sur les récifs face au Phare Noyé, une tour faite du corps de l'Ancien et couronnée d'une méduse électrique")}
];
/* HUD of the series (LB.hud): bars, rage marks, boss name, header line, action button, phase track (hidden in the Trial) */
function hud(){
  LB.hud.player(S.hp,S.hpMax);LB.hud.boss(S.bossHp,S.bossMax,rageMarks());
  const P=PH[S.phase];LB.hud.set({boss:P.boss(),head:P.head(),ward:P.btn(),player:LB.tx(CHAPTER.player)});
  $('c').setAttribute('aria-label',P.aria());document.body.dataset.ph=S.phase;
  LB.hud.track(gpOf(S.phase),{trial:!!S.d.trial,unl:unlocked()});
}

/* ================= spells, anger and final assaults ================= */
/* rages and final assaults: nothing written on screen (the sound and the attacks tell it); the screen reader gets the name */
function banner(txt,sub){say(txt+'. '+sub);MUSIC.fx('sting');MUSIC.fx('rumble')}
/* rages, as in Ember Bridge (00-core.js DIFFS u / rages / mk, 36-p2-foundry-logic.js qTurn / qRage): when the boss's HP has
   reached a threshold of DIFFS[..].u, his next turn is a roar (RAGE.dur, RAGE.dur2 for the next ones: shake, flash, sting),
   then his rage spell (the signature spell of the phase), then the second-half patterns; the final assault comes at
   RAGE.finalHp. The boss bar marks the thresholds (pips underlined, as in Ember Bridge). */
const RAGE={dur:1.6,dur2:.8,finalHp:1};
const rageAt=()=>S.phase===3?S.d.u3:S.d.u;   // rage thresholds of the current phase
const rageMarks=()=>LB.hud.marks(rageAt(),S.phase!==3||S.form===2?RAGE.finalHp:null);   // form I of phase III has no final assault
function rageBanner(){
  if(S.phase===2)banner(_('Echoes','Échos'),_('Three voices, one real. Only real orbs cast a shadow; the reflections shatter one by one.','Trois voix, une seule vraie. Seules les vraies orbes ont une ombre ; les reflets se brisent un à un.'));
  else if(S.phase===1){banner(_('Turquoise heart','Cœur turquoise'),_('The Bottomless takes control: every attack calls a toll.','La Sans-Fond prend le contrôle : chaque attaque appelle un glas.'));MUSIC.fx('heart')}
  else if(S.form===2)banner(_('Bell storm','Tempête de cloches'),_('The side lanterns fire rings in turn, then the trap bell falls.','Les lanternes latérales tirent des anneaux tour à tour, puis la cloche-piège tombe.'));
  else banner(_('Rising tide','Marée montante'),_('The wave floods the reefs; spikes rise as it ebbs.','La vague noie les récifs ; des pics jaillissent quand elle se retire.'));
}
const FINAL_AT=RAGE.finalHp;
/* shard rain (phase I), aligned on Ember Bridge's stone rain (36-p2-foundry-logic.js qRoar / qResolve / qHurt):
   spacing between two shards drawn at random in [lo, hi] s (Normal and Easy .32-.62, Hard .55-.9: the Hard window is
   shorter, so the rhythm is slower), not scaled by the attack speed; in Hard, `grace` s more after the impact (irregular
   rhythm); a shard that hits stuns only `hurt` s. PROVISIONAL, from Ember Bridge. */
const RAIN={normal:[.32,.62],hard:[.55,.9],grace:.13,hurt:.14};
/* new spells (docs/CH2-SPEC.md, « Sorts et rages »): times in seconds, multiplied by f (attack speed, like every pattern).
   PROVISIONAL values, taken from the neighbouring spells they replace or extend; to be set in the balancing session.
   wave  (II): stomp lands at `land` (the anchor's strike of the Hard sweep too), the wave reaches the Watcher at `hit` (= old stomp), the beam falls twice,
               `fall1` / `fall2` after the wave (= old stones .8 / 1.15), next attack `after` later (= old stomp 1.6);
   dwave (II, rage): second, bigger wave `gap` after the first (chain spacing .4 + margin); the beam falls after it;
   kwave (III, form I): the King's wave crosses the reef like the beam (= sweep: `ts` .95, `D` 1.6, `after` .35); hold;
   tide  (III, form I, rage): the wave, then as it ebbs two reef spikes (taps) `spike1` / `spike2` after it (= spike .8,
               second +.35), `gap` between their tells, next attack `after` later (= spike 1.15);
   storm (III, form II, rage): `n` rings fired in turn from the two side lanterns, every `gap` (= ring .34), each `tl` /
               `ti` (= ring .5 / .95); then the trap bell, `trapGap` later: hovers until `trapTl`, presses from `trapTa` to
               `trapTb` (hold; = trap .75 / 1.3, +.5 held), next attack `after` later;
   echo  (I, rage): after the last orb of the echo, the two reflections shatter one by one, the first `break1` after it,
               the next ones `VX.gap` s apart (the minimum between two real impacts), each sending shards (= shard rain .42 / .95). */
/* Hollow Voice balancing (phase I), per difficulty (Hard = Normal values unless stated). Seconds, NOT scaled by f.
   gap    minimum between two REAL impacts, all spells together (orb, shard, wail); enforced for every pattern in P2;
   volley number of orbs of a volley [min, max]; rain number of shards of a shard rain;
   echoOrbs / echoShards  orbs fired and shards dropped by each echo during the echo rage;
   dance  final assault (mirror dance): number of mirrors, fragments per mirror (Easy 1, Normal and Hard 2 in all);
   pe     permanent echo (Hard only): all fight long, fires one orb `lag` s after the end of each spell (a wail of its own instead of the orb
         after a wail), never within `wail` s of a wail of the Voice; shifted by the gap, never dropped */
const VX={
  gap:{easy:.6,normal:.75,hard:1.05},
  volley:{easy:[2,3],normal:[3,5],hard:[3,5]},
  rain:{easy:2,normal:3,hard:3},
  echoOrbs:{easy:1,normal:2,hard:2},
  echoShards:{easy:1,normal:2,hard:2},
  pe:{lag:.7,wail:.25},
  dance:{mirrors:{easy:1,normal:2,hard:2},frag:1}   // final assault: mirrors the volley leaves by, fragments per exploding mirror
};
const vdk=()=>S.d.hard?'hard':S.dk==='easy'?'easy':'normal';
const SP={
  wave:{land:.55,hit:1.05,fall1:.8,fall2:1.15,after:1.6},
  dwave:{gap:.55},
  /* Rust Elder (II), refonte du 5 novembre (docs/decisions/2026-11-05-ch2-ancien-sorts.md), all PROVISIONAL, x f:
     harpoon: flies `fly` (= old hpOut) and pierces the Watcher (block 1), sticks in the wood `stick` (Kevin: 1 s), is recalled tearing
               out a plank that arrives diagonally: first impact `pl1` after the recall, second `gap` later (= rafter gap), the hand
               takes the harpoon back in `back`, next attack `after` later (= old .8);
     sweep:   one fluid combo of the anchor (no return to rest between strikes): the first impact `ts` after the start (= old sweep
               .72), then one impact every d[i] s (Easy 2 strikes, Normal 3, Hard 4; in Hard the last one smashes the ground and
               sends a water wave, counted in the series). A gap >= `long` is a delay: the anchor is held up, trembling, then falls.
               Next attack `after` after the last impact;
     rust (rage 1): he strikes the hull (`strike`), the cloud grows for `grow` and stays until the ship collapses, `pause`, then a sweep;
     glas (final assault): the head bell rings `bell` after the start, `n` echoes leave it `gap` apart, each reaches the Watcher `hit`
               after leaving (= old toll 1.0), next attack `after` later; `chain` = the falling chain between two glas (one block);
               `need` = glas to counter before the Finish (total count, not a series);
     finish: `strikes` resonance strikes from `first`, `step` apart, the Elder falls `hit` after the last, `tail` of calm after. */
  harpoon:{fly:1.1,stick:1,pl1:.75,gap:.35,back:.9,after:.8},
  sweep:{d:{easy:[.85],normal:[.6,.95],hard:[.55,.9,.75]},long:.7,ts:.72,after:.5},
  rust:{strike:.7,grow:1.4,pause:.4},
  glas:{n:2,bell:.55,gap:.5,hit:1,after:.8,chain:1.1,need:{easy:3,normal:4,hard:5}},
  finish:{strikes:4,first:.6,step:.8,hit:.3,tail:.4},
  kwave:{ts:.95,D:1.6,after:.35},
  tide:{spike1:.8,spike2:1.15,gap:.35,after:1.15},
  storm:{n:5,gap:.34,tl:.5,ti:.95,trapGap:.4,trapTl:.75,trapTa:1.3,trapTb:1.8,after:.7},
  echo:{break1:.2,tl:.42,ti:.95},
  /* wail (I): the tear wave crosses the Watcher (from the right); `lag` s after it, an Illusion appears on the left (`ill`) and
     throws a second wave the other way (wave starting at x0), then vanishes; the next attack starts `after` s before the second
     impact. Both waves are real impacts, spaced by VX.gap like every other. Per wave: `tl` s of cast, then a run of r1 (Voice) /
     r2 (Illusion) s x `run` (the wave is a little faster: x.85). Drawing: at `ti` the leading edge of the wave (`edge` px ahead of
     its centre) touches the Watcher's body (`reach` px from HX, the real hit point), without moving the hitbox or `ti`.
     The permanent echo throws the same wave from its own hand (`pe`, fired like its orb).
     mirror (I): a mirror of the hall (one of the floating shards) explodes into fragments that fly for `fly` s (wandering, then
     settling) before darting at the Watcher; dance (I, final assault): the volley goes through the mirrors, orbs leave the mirror
     after `split` of their flight, `settle` s after the last orb the mirrors explode */
  wail:{lag:.1,tl:.8,r1:1.1,r2:.9,run:.85,after:.6,x0:110,edge:22,reach:30,ill:{x:62,y:248}},
  /* rain (I): the mirror bursts, its fragments are thrown across the hall for `fly` s (1.5 x .85: a little quicker), changing direction
     `turns` [min, max] times at random spots of `area`, then settle above the mirror and dart one after the other in random order.
     Same for the mirror dance (final assault). draw = drawing scale of the fragments (phone). */
  mirror:{fly:1.275,size:15,draw:1.3,turns:[2,3],area:{x0:50,x1:W-50,y0:50,y1:GY-40}},
  dance:{split:.45,settle:.6}
};
/* the mirrors of the hall are the floating shards of the background (SHARDS): n distinct ones, in the right-hand half of the hall */
function mirrorPick(n,x0,x1){
  x0=x0==null?HX+160:x0;x1=x1==null?880:x1;
  let c=SHARDS.map((m,i)=>i).filter(i=>SHARDS[i].x>x0&&SHARDS[i].x<x1&&SHARDS[i].y<330&&!(S.shardGone&&S.shardGone[i]>gt));
  if(c.length<n)c=SHARDS.map((m,i)=>i);
  return c.sort(()=>Math.random()-.5).slice(0,n)}
function spawn(){
  const d=S.d,id=S.phase,f2=id===3&&S.form===2,gen=f2?P3b:[P1,P2,P3][id-1];
  const n=rageAt().filter(x=>S.bossHp<=x).length;
  /* as in Ember Bridge (a fury restarts while the Colossus's HP are still at its threshold): a rage whose counter failed
     (HP not lower than when the roar began) starts again at every attack; once the boss is hit, normal attacks resume until the
     next threshold. Thresholds already passed never restart (rageN). The final assault restarts until the boss falls. */
  if(!S.rageNext){
    if(S.rageHp0!=null){if(S.bossHp>=S.rageHp0&&S.rageN>0)S.rageN--;S.rageHp0=null}
    if(S.finalDone&&S.bossHp>0)S.finalDone=false;
  }
  if(n>S.rageN&&!(S.bossHp<=FINAL_AT&&(id!==3||f2))){S.rageN=n;S.rageHp0=S.bossHp;S.angerShown=true;S.roarT=gt;S.roarD=n>1?RAGE.dur2:RAGE.dur;S.nextAt=gt+S.roarD;S.shake=10;rageBanner();S.rageNext=n;return}
  const go=l=>{const q=sched(l);q.spell=l.spell;return q};   // the spell shown by the riposte (set by P2)
  const stage=S.rageN?1:0,f=1/(d.sp*(id===2?VOICE_SPEED:1)*(1+.1*stage));
  if(S.rageNext&&!S.finalDone){const r=S.rageNext;S.rageNext=0;go(gen(stage,f,gt+.25,false,r));return}
  if(!S.finalDone&&S.bossHp<=FINAL_AT&&(id!==3||f2)){
    S.finalDone=true;S.angerShown=true;S.roarT=gt;S.roarD=RAGE.dur2;S.shake=10;
    banner(_('Final assault','Dernier assaut'),[null,_('Funeral toll','Glas funèbre'),_('Chorus of reflections','Chœur des reflets'),_('Implosion','Implosion')][id]);
    go(gen(1,f,gt+1.6,true));return}
  go(gen(stage,f,gt+.25));
}
/* ---- Phase I · the Hollow Voice ---- */
function P2(stage,f,b,final,rage){
  const T=[],K=vdk(),gap=VX.gap[K],casts=[];let t=b;
  const cast=(fn,w)=>(...a)=>{const n=T.length;fn(...a);casts.push({ths:T.slice(n),w})};
  const orb=(real,src,vsi)=>{T.push({k:'orb',t0:t,tl:t+.45*f,ti:t+1.3*f,real,src:src||0,vsi});t+=.44*f};
  const volley=cast((n,ill)=>{const [lo,hi]=VX.volley[K];n=clamp(n,lo,hi);ill=Math.min(ill,n-1);const fake=new Set();while(fake.size<ill){const i=1+Math.floor(Math.random()*(n-1));fake.add(i)}for(let i=0;i<n;i++)orb(!fake.has(i));t+=.9*f});
  // the clones' shots come in random order (all sources mixed), each one real or illusory at random, at least one real per echo
  const echo=()=>{const n=VX.echoOrbs[K],sh=[];for(let s=0;s<3;s++)for(let k=0;k<n;k++)sh.push(s);sh.sort(()=>Math.random()-.5);const rl=sh.map(()=>Math.random()<.5),any=Math.floor(Math.random()*sh.length);rl[any]=true;sh.forEach((s,i)=>{orb(rl[i],s);if(i%n===n-1)t+=.1*f});t+=.9*f};
  // rage: the echo, then the two reflections shatter one by one, each dropping its shards at the Watcher (spaced by `gap`)
  const echoR=cast(()=>{const E=SP.echo,nS=VX.echoShards[K];echo();const last=T[T.length-1].ti;let end=last;
    [1,2].forEach((src,j)=>{for(let k=0;k<nS;k++){const s=last+E.break1*f+(j*nS+k)*gap;T.push({k:'shard',t0:s,tl:s+E.tl*f,ti:s+E.ti*f,from:src});end=Math.max(end,s+E.ti*f)}});t=Math.max(t,end+.4*f)});
  // wail: a wave crosses the Watcher, then an Illusion on the left throws a second one the other way (two real impacts)
  const wail=cast(()=>{const Wl=SP.wail,t1=t+(Wl.tl+Wl.r1*Wl.run)*f,t2=t1+Wl.lag*f,i2=t2+(Wl.tl+Wl.r2*Wl.run)*f;
    T.push({k:'wail',t0:t,tl:t+Wl.tl*f,ti:t1,real:true});
    T.push({k:'wail',ill:1,t0:t2,tl:t2+Wl.tl*f,ti:i2,real:true});t=i2-Wl.after*f},1);
  // a mirror of the hall explodes into n fragments: they fly (SP.mirror.fly), settle, then dart one after the other
  const scatter=()=>{const M=SP.mirror,A=M.area,nW=M.turns[0]+Math.floor(Math.random()*(M.turns[1]-M.turns[0]+1)),w=[];
    while(w.length<nW){let q;for(let i=0;i<8;i++){q={x:A.x0+Math.random()*(A.x1-A.x0),y:A.y0+Math.random()*(A.y1-A.y0)};const p=w[w.length-1];if(!p||Math.hypot(q.x-p.x,q.y-p.y)>200)break}w.push(q)}return w};
  // arrival order of the fragments at random (slot times in order, handed out to the fragments in a shuffled order)
  const shatter=(si,n,gaps,off,dn)=>{const M=SP.mirror,fd=M.fly*f,ord=[...Array(n).keys()].sort(()=>Math.random()-.5),sl=[];let s=t+fd+(off||0);
    for(let k=0;k<n;k++){if(k)s+=gaps();sl.push(s)}
    for(let k=0;k<n;k++){const a=sl[ord[k]];T.push({k:'shard',fly:1,dn:dn?1:0,si,fi:k,fn:n,fd,way:scatter(),tw:.42*f,t0:t,tl:a+.42*f,ti:a+.95*f})}
    return s};
  const rain=cast(()=>{const G=RAIN[S.d.m<1?'hard':'normal'];const s=shatter(mirrorPick(1)[0],VX.rain[K],()=>G[0]+Math.random()*(G[1]-G[0]));t=s+1.3*f});
  // final assault, mirror dance: a volley goes through the mirrors (orbs leave by 1 mirror in Easy, 2 in Normal and Hard), then
  // each mirror explodes into its fragments; real and illusory orbs as in a volley, gaps by spaceImpacts
  const dance=cast(()=>{const D=VX.dance,nm=D.mirrors[K],ms=mirrorPick(nm),[lo,hi]=VX.volley[K],n=clamp(5,lo,hi),ill=Math.min(2,n-1),fake=new Set();
    while(fake.size<ill)fake.add(1+Math.floor(Math.random()*(n-1)));
    const ord=[...Array(n).keys()].sort(()=>Math.random()-.5);
    for(let i=0;i<n;i++)orb(!fake.has(i),0,ms[ord[i]%ms.length]);
    t+=SP.dance.settle*f;let end=t;
    ms.forEach((si,j)=>{end=Math.max(end,shatter(si,D.frag,()=>gap,j*gap,1))});t=end+1.3*f});
  if(rage)echoR();
  else if(final)dance()
  else{
    const p0=[()=>volley(2,0),()=>volley(3,1),wail,()=>volley(3,0),()=>{wail();volley(2,1)},rain];
    const p1=[()=>volley(4,1),()=>volley(5,2),()=>{volley(3,0);wail()},()=>{rain();wail()},()=>{volley(3,1);rain()},()=>{wail();volley(4,2)},rain,()=>{rain();volley(3,1)}];
    pick(stage?p1:p0)();
    // the echo only comes during the rages, never in this rotation
  }
  // Hard: the permanent echo fires one orb after each spell, rages and final assault included
  if(K==='hard')spacePE(T,casts,f,gap);
  spaceImpacts(T,gap);
  // the spell the riposte shows: a wail, a rain of fragments, otherwise a volley (echo and dance included)
  T.spell=T.some(x=>x.k==='wail')?'wail':T.some(x=>x.k==='shard'&&x.fly&&!x.dn)?'rain':'volley';
  return T;
}
const isRealImpact=x=>x.k==='shard'||x.k==='wail'||(x.k==='orb'&&x.real);
/* pushes every impact back so that two real ones (and the first one after the previous pattern) are never closer than `gap` s;
   each real impact is noted by noteImpact (S.gapLog = gaps between consecutive real impacts, all sources, read by the ch2-bot run) */
function spaceImpacts(T,gap){
  T.sort((a,b)=>a.ti-b.ti);
  let prev=-99,d=0;
  for(const x of S.threats)if(isRealImpact(x)&&x.ti!=null)prev=Math.max(prev,x.ti);
  for(const x of T){
    if(d){x.t0+=d;x.tl+=d;x.ti+=d}
    if(!isRealImpact(x))continue;
    if(x.ti-prev<gap){const e=gap-(x.ti-prev);x.t0+=e;x.tl+=e;x.ti+=e;d+=e}
    prev=x.ti;noteImpact(x.ti)}}
/* records a real impact time in sorted order and logs the gap to each neighbour (S.gapLog, one value per new adjacent pair) */
function noteImpact(ti){
  const L=S.impTi||(S.impTi=[]),G=S.gapLog||(S.gapLog=[]);
  let i=0;while(i<L.length&&L[i]<ti)i++;
  L.splice(i,0,ti);
  if(i>0)G.push(ti-L[i-1]);
  if(i<L.length-1)G.push(L[i+1]-ti)}
function spacePE(T,casts,f,gap){
  const reals=()=>T.filter(isRealImpact),P=VX.pe;
  for(const c of casts){
    if(!c.ths.length)continue;   // every spell
    const wl=c.ths.some(x=>x.k==='wail'),Wl=SP.wail,voice=()=>T.filter(x=>x.k==='wail'&&!x.pe);
    let t0=Math.max(...c.ths.map(x=>x.tl))+P.lag,th;
    for(let i=0;i<300;i++,t0+=.1){   // too close to a real impact or inside a wail of the Voice: shifted later, never dropped
      // after a wail the echo throws its own wail instead of its orb (same wave, from its hand); otherwise its orb
      th=wl?{k:'wail',pe:1,t0,tl:t0+Wl.tl*f,ti:t0+(Wl.tl+Wl.r1*Wl.run)*f,real:true}:{k:'orb',t0,tl:t0+.45*f,ti:t0+1.3*f,real:true,src:3,pe:1};
      if(!reals().some(r=>Math.abs(r.ti-th.ti)<gap)&&!voice().some(w=>th.tl<w.ti+P.wail&&th.ti>w.tl-P.wail))break}
    T.push(th)}}
/* a dodge aimed at a reflection: no extra recovery; the reflection turns round behind the Watcher, becomes solid and
   comes back as a real attack once he can dodge again (action + recovery + DG.backWin). Dodging a reflection is not a fault:
   the series stays clean unless the Watcher takes the returning blow (the 'hit' branches of update() set pat.ok=false) */
function fooled(th){th.done=true;th.res='fooled';th.okT=gt;S.foolT=gt;play('fool');say(_('You dodged a reflection.','Tu as esquivé un reflet.'));
  S.pl.fr=1;   // the recovery after this action is halved (plStep)
  const c=PT(),nt={k:'back',t0:gt,tl:gt+DG.backTurn,ti:gt+c.act+c.rec*DG.foolRec+DG.backWin,real:true,pat:th.pat};th.pat.ths.push(nt);S.threats.push(nt);noteImpact(nt.ti);say(_('The reflection comes back.','Le reflet revient.'))}
/* a fragment of an exploding mirror: leaves the mirror, wanders (shrinking wobble) then settles at its own spot above it */
function fragPos(th,at){
  const m=shardPos(th.si),k=clamp((at-th.t0)/th.fd,0,1),hx=m.x+(th.fi-(th.fn-1)/2)*46,hy=m.y-34+(th.fi%2)*18,e=eout(k),w=60*(1-k)*Math.min(1,k*6);
  if(th.way){   // rain: thrown from the mirror to random spots of the hall (a burst, slowing, then a new direction), then home
    const Q=[m,...th.way,{x:hx,y:hy}],L=Q.length-1,u=Math.min(k*L,L-1e-6),i=Math.floor(u),q=eout(u-i),j=10*Math.min(1,k*6)*(1-k);
    return{x:lerp(Q[i].x,Q[i+1].x,q)+Math.sin(rt*9+th.fi*2.1)*j+(k>=1?Math.sin(rt*1.7+th.fi)*3:0),y:lerp(Q[i].y,Q[i+1].y,q)+Math.cos(rt*8+th.fi*1.3)*j*.8+(k>=1?Math.cos(rt*1.3+th.fi)*3:0)}}
  return{x:lerp(m.x,hx,e)+Math.sin(rt*6+th.fi*2.1)*w+(k>=1?Math.sin(rt*1.7+th.fi)*3:0),y:lerp(m.y,hy,e)+Math.cos(rt*5+th.fi*1.3)*w*.8+(k>=1?Math.cos(rt*1.3+th.fi)*3:0)}}
function shardPos(si){const s=SHARDS[si];return{x:s.x+Math.sin(rt*.4+s.o)*12,y:s.y+Math.cos(rt*.5+s.o)*8,s:s.s}}
function drawOrbs(){
  for(const th of S.threats){
    if(gt<th.t0)continue;
    if(th.k==='orb'||th.k==='back'){
      const back=th.k==='back',h=back?{x:HX-110,y:HY-56}:voiceHand(th.src,1),tx=HX+(back?30:14),ty=HY; // a returning reflection lands on the real hit point (HX+30, as HIT elsewhere), not on the Watcher's centre
      let x,y,r=17,a=1,p=0,dash=th.real?0:1;
      if(gt<th.tl){const k=(gt-th.t0)/(th.tl-th.t0);if(back){const e=eout(k);x=lerp(tx,h.x,e);y=lerp(ty,h.y,e)-Math.sin(Math.PI*k)*30;dash=1-k}else{x=h.x;y=h.y;r=5+12*k}}
      else{p=(gt-th.tl)/(th.ti-th.tl);
        if(th.done){if(th.res==='hit'||th.res==='pass'){if(gt-th.okT>.05)continue;p=1}else{a=Math.max(0,1-(gt-th.okT)/.45)}}
        if(th.vsi!=null){   // mirror dance: the orb goes into a mirror of the hall and comes out of it
          const m=shardPos(th.vsi),q=SP.dance.split,pp=Math.min(p,1.15);
          if(pp<q){x=lerp(h.x,m.x,pp/q);y=lerp(h.y,m.y,pp/q)}else{x=lerp(m.x,tx,(pp-q)/(1-q));y=lerp(m.y,ty,(pp-q)/(1-q))}
          if(Math.abs(pp-q)<.15)glow(m.x,m.y,46,'rgba(200,170,255,.9)',.6*(1-Math.abs(pp-q)/.15));
          if(pp>=q&&!th.pv){th.pv=1;burst(m.x,m.y,10,'#ece4ff',4,.4);MUSIC.fx('glints')}}
        else{x=lerp(h.x,tx,p);y=lerp(h.y,ty,p)-Math.sin(Math.PI*Math.min(p,1))*(th.k==='back'?20:46)}}
      if(a<=0)continue;
      ctx.save();ctx.globalAlpha=a;
      if(th.real&&gt>=th.tl){const sh=clamp(1-(GY-y)/400,.25,1);ell(x,GY+3,r*1.6*sh,5*sh,`rgba(0,0,0,${.5*sh})`)}
      // every orb is full; an illusory one (clones' included) has a dotted outline, a real one casts its shadow (above)
      // an illusory orb is a hollow ring (no bright centre) with a paler halo; a real one is solid
      glow(x,y,r*50/17,'rgba(176,124,255,.95)',th.real?.85:.45);
      if(th.real){ell(x,y,r,r,'#c9a8ff');ell(x,y,r*.5,r*.5,'#fbf6ff')}
      else{ctx.save();ctx.strokeStyle='#c9a8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.restore()}
      if(dash>0){ctx.save();ctx.globalAlpha*=dash;ctx.setLineDash([6,5]);ctx.lineDashOffset=-gt*12;ctx.strokeStyle='#f4ecff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r+3,0,Math.PI*2);ctx.stroke();ctx.restore()}
      ctx.restore();
    }else if(th.k==='shard'){
      if(th.fly){   // the mirror explodes (once), hidden from the hall until its fragments are gone
        (S.shardGone||(S.shardGone={}))[th.si]=Math.max(S.shardGone[th.si]||0,th.ti+1.2);
        if(!th.bk0){th.bk0=1;if(!th.fi){const m=shardPos(th.si);burst(m.x,m.y,22,'#ece4ff',6,.9,.2);burst(m.x,m.y,12,'#9a86c8',4,1,.3);MUSIC.fx('crackGlass');S.shake=Math.max(S.shake,7)}}}
      const o=th.from!=null?{x:voicePos(th.from).x,y:voicePos(th.from).y-90,s:24}:th.fly?{...fragPos(th,Math.min(gt,th.t0+th.fd)),s:SP.mirror.size}:shardPos(th.si),tx=HX+16,ty=HY-10;let x,y,a=1,ang;
      if(gt<th.tl){const k=th.fly?clamp(1-(th.tl-gt)/th.tw,0,1):(gt-th.t0)/(th.tl-th.t0);x=o.x;y=o.y;ang=Math.atan2(ty-y,tx-x);glow(x,y,30*SP.mirror.draw,'rgba(220,200,255,.9)',.8*k)}
      else{let p=(gt-th.tl)/(th.ti-th.tl);if(th.done){if(th.res==='hit'){if(gt-th.okT>.05)continue;p=1}else{a=Math.max(0,1-(gt-th.okT)/.3);if(!th.sf){th.sf=1;burst(tx+30,ty-20,10,'#f2ecff',5,.4)}}}
        p=Math.min(p,1);x=lerp(o.x,tx,ein(p));y=lerp(o.y,ty,ein(p));ang=Math.atan2(ty-o.y,tx-o.x)}
      if(a<=0)continue;
      ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.rotate(ang+Math.PI/2);const s=o.s*.8*SP.mirror.draw;
      const gr=ctx.createLinearGradient(0,-s,0,s);gr.addColorStop(0,'rgba(245,240,255,.95)');gr.addColorStop(1,'rgba(150,120,210,.7)');ctx.fillStyle=gr;
      ctx.beginPath();ctx.moveTo(0,-s*1.2);ctx.lineTo(s*.45,s*.4);ctx.lineTo(0,s*.9);ctx.lineTo(-s*.45,s*.4);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
    }else if(th.k==='wail'&&gt>=th.tl){
      let p=(gt-th.tl)/(th.ti-th.tl),a=1;if(th.done){if(th.res==='hit')continue;a=Math.max(0,1-(gt-th.okT)/.4)}
      // the wave runs from its source to the body: at ti (p=1) its leading edge touches the Watcher (reach px from HX, as the returning reflection)
      const Wl=SP.wail,x0=th.ill?Wl.x0:th.pe?voicePos(3).x-84:voiceHand(0,1).x,xe=th.ill?HX-Wl.reach-Wl.edge:HX+Wl.reach+Wl.edge;
      const x=lerp(x0,xe,Math.min(p,1.25));ctx.save();ctx.globalAlpha=a;
      if(th.ill){ctx.translate(x,0);ctx.scale(-1,1)}else ctx.translate(x,0);   // the Illusion's wave goes the other way
      for(let i=0;i<4;i++){ctx.strokeStyle=`rgba(200,160,255,${.75-i*.17})`;ctx.lineWidth=5-i;ctx.beginPath();ctx.ellipse(i*16,GY-90,22+i*4,110,0,Math.PI*.55,Math.PI*1.45);ctx.stroke()}
      ctx.restore();
    }
  }
}
/* ---- Phase II · the Rust Elder ---- */
function P1(stage,f,b,final,rage){
  const T=[],K=vdk();let t=b,sp='';
  // harpoon: pierces the Watcher (block), sticks in the wood behind him, then is recalled tearing out a plank: two blocks, upper then lower
  const harpoon=()=>{const H=SP.harpoon,ti=t+H.fly*f,rc=ti+H.stick*f,p1=rc+H.pl1*f,p2=p1+H.gap*f,ret=p2+H.back*f,hp={k:'hpOut',t0:t,ti,rc,p1,p2,tb:ret,ret};
    T.push(hp);T.push({k:'plank',n:1,t0:rc,ti:p1,hp});T.push({k:'plank',n:2,t0:rc,ti:p2,hp});t=ret+H.after*f;sp='harpoon'};
  // the water wave: he lifts his foot, the shock wave grows towards the Watcher (block); `anchor` = struck by the anchor (Hard sweep): no beam
  const wave=(big,anchor)=>{const ti=t+SP.wave.hit*f;T.push({k:'wave',t0:t,tl:t+SP.wave.land*f,ti,big:!!big,anchor:anchor?1:0});
    if(anchor)T.push({k:'slam',t0:t,ti:t+SP.wave.land*f,real:false,done:true});return ti};   // (the slam is only the anchor's picture)
  // the vibrations drop a plank on the Watcher: two blocks
  const rafter=ti=>{T.push({k:'rafter',n:1,t0:ti,ti:ti+SP.wave.fall1*f});T.push({k:'rafter',n:2,t0:ti+.2*f,ti:ti+SP.wave.fall2*f});t=ti+SP.wave.after*f};
  const surge=()=>{rafter(wave());sp='wave'};
  // the anchor combo: 2 / 3 / 4 linked strikes (impacts every SP.sweep.d[..]); in Hard the 4th smashes the ground: a water wave, part of the series
  const sweep=()=>{const Z=SP.sweep,D=Z.d[K],n=D.length+1,hw=K==='hard',tis=[t+Z.ts*f];D.forEach(d=>tis.push(tis[tis.length-1]+d*f));
    const cb={t0:t,tis,types:tis.map((x,i)=>i%2===0||(hw&&i===n-1)?'slam':'sweep'),lg:[false,...D.map(d=>d>=Z.long)],end:tis[n-1]+.95},t0=t;
    for(let i=0;i<n;i++){
      if(hw&&i===n-1){t=tis[i]-SP.wave.land*f;const n0=T.length,ti=wave(false,true);T.slice(n0).forEach(x=>x.cb=cb);t=ti+Z.after*f}
      else T.push({k:'sweep',t0:i?tis[i-1]:t0,ti:tis[i],cb})}
    if(!hw)t=tis[n-1]+Z.after*f;sp='sweep'};
  // rage 2 (Hard), double wave: foot 1 -> wave + plank, foot 2 -> wave + plank, then a harpoon (counted in the series, no counter of its own)
  const dwave=()=>{rafter(wave());rafter(wave(true));harpoon();sp='dwave'};
  // rage 1, rust cloud: he strikes the hull, the cloud grows and stays until the ship collapses; then a sweep. A cloud already there is kept
  const rust=()=>{const R=SP.rust;if(S.rust)t+=R.pause*f;else{const st=t+R.strike*f,tc=st+R.grow*f;S.rust={t0:t,st,tc,end:Infinity};t=tc+R.pause*f}sweep();sp='rust'};
  // final assault, glas: the head bell rings, echoes cross the ship towards the Watcher (each one blocked is sent back at the Elder)
  const glas=()=>{const G=SP.glas,id=S.glasId=(S.glasId||0)+1,tw0=t+G.bell*f;let e=t;
    for(let i=0;i<G.n;i++){const tw=tw0+i*G.gap*f,ti=tw+G.hit*f;T.push({k:'toll',t0:t,tw,ti,gid:id});e=ti}t=e+G.after*f};
  // between two glas, a piece of the scenery falls: a plank (2 blocks) or a chain (1 block); a block, no counter
  const decor=()=>{if(Math.random()<.5)rafter(t);else{T.push({k:'dchain',t0:t,ti:t+SP.glas.chain*f});t+=(SP.glas.chain+SP.glas.after)*f}};
  if(rage){(rage>1?dwave:rust)();T.spell=sp;return T}
  if(final){const left=Math.max(1,SP.glas.need[K]-(S.glasN||0));for(let i=0;i<left;i++){if((S.glasN||0)+i>0)decor();glas()}T.spell='glas';return T}
  const p0=[harpoon,sweep,surge,()=>{harpoon();sweep()},()=>{sweep();surge()},()=>{surge();harpoon()}];
  const p1=[()=>{harpoon();sweep()},()=>{sweep();surge()},()=>{surge();harpoon()},()=>{sweep();surge();harpoon()},()=>{surge();sweep()}];
  pick(stage?p1:p0)();T.spell=sp;return T;
}
/* the plank torn out by the harpoon (phase II): stuck in the wood behind the Watcher (q), then flown to his head (a: first block) and
   down his body (b: second block), tilted by `ang`; the harpoon is planted in it */
const PLANK={q:{x:HX-120,y:HY-24},a:{x:HX+24,y:HY-70},b:{x:HX+24,y:GY-46},ang:-.62,len:170};
function plankPos(hp,at){const P=PLANK;
  if(at<=hp.rc)return{x:P.q.x,y:P.q.y};
  if(at<=hp.p1){const k=ein(clamp((at-hp.rc)/(hp.p1-hp.rc),0,1));return{x:lerp(P.q.x,P.a.x,k),y:lerp(P.q.y,P.a.y,k)}}
  const k=clamp((at-hp.p1)/(hp.p2-hp.p1),0,1);return{x:lerp(P.a.x,P.b.x,k),y:lerp(P.a.y,P.b.y,k)}}
/* the anchor combo (sweep): a single linked movement, impact poses by strike type (slam = from above, sweep = from the side), no return to rest
   between two strikes: after each impact the anchor is raised, held (trembling) if the gap is a delay, then falls. cb = {t0, tis, types, lg, end} */
const SWP={slam:{mid:{a:-1.3,c:-1.3,l:-30},hit:{a:-3.5,c:-3.5,l:-175}},sweep:{mid:{a:.1,c:.1,l:20},hit:{a:2.7,c:2.7,l:-165}}};
const comboAct=()=>{for(const t of S.threats)if(t.cb&&gt>=t.cb.t0&&gt<=t.cb.end)return t.cb;return null};
function comboPose(r,cb){
  const L=cb.tis,n=L.length;r.onBack=false;
  if(gt>=L[n-1]){   // follow-through, then the anchor goes back to his back (as the single strikes did)
    const af=gt-L[n-1],slam=cb.types[n-1]==='slam',hold=.22,ret=.5,e=eio(clamp((af-hold)/ret,0,1));
    if(af>hold+ret){r.onBack=true;r.armA=lerp(ARM_BACK,ARM_REST,clamp((af-hold-ret)/.2,0,1));return}
    if(slam){r.armA=lerp(-3.5,ARM_BACK,e);r.clap=lerp(-3.5,BACK_DIR-TWO_PI,e);r.lunge=lerp(-175,0,e)}
    else{r.armA=lerp(2.7,ARM_BACK+TWO_PI,e);r.clap=lerp(2.7,BACK_DIR,e);r.lunge=lerp(-165,0,e)}
    return}
  let i=0;while(gt>=L[i])i++;
  const T0=i?L[i-1]:cb.t0,p=(gt-T0)/(L[i]-T0),fr=!i?[.3,0,.42,.28]:cb.lg[i]?[.18,.3,.3,.22]:[.22,0,.5,.28],c1=fr[0],c2=c1+fr[1],c3=c2+fr[2],
        P0=i?SWP[cb.types[i-1]].hit:{a:ARM_REST,c:BACK_DIR,l:0},RA={a:ARM_BACK,c:BACK_DIR,l:0},M=SWP[cb.types[i]].mid,Hh=SWP[cb.types[i]].hit;
  const set=(A,B,e)=>{r.armA=lerp(A.a,B.a,e);r.clap=lerp(A.c,B.c,e);r.lunge=lerp(A.l,B.l,e)};
  if(p<c1)set(P0,RA,eio(p/c1));
  else if(p<c2){set(RA,RA,0);const w=Math.sin(gt*55)*.04;r.armA+=w;r.clap+=w}   // the delay: held up, trembling
  else if(p<c3)set(RA,M,eio((p-c2)/fr[2]));
  else set(M,Hh,ein((p-c3)/fr[3]))}
function anim1(){
  const r=anim1raw();const th=curAct(['slam','sweep'],.75);if(th&&th.ls)r.lunge*=th.ls;
  if(S.cine)return r;
  const hp=S.threats.find(t=>t.k==='hpOut'&&gt>=t.t0&&gt<=t.ret+.05);
  if(hp){const w=hp.ti-.38,hand={x:-150,y:GY-218},hero={x:HX+40-700,y:HY-6};
    r.lunge=0;
    if(gt<w){r.larm=eio(clamp((gt-hp.t0)/(w-hp.t0),0,1))}
    else{r.larm=1;let pos;
      if(gt<=hp.ti){const k=ein(clamp((gt-w)/(hp.ti-w),0,1));pos={x:lerp(hand.x,hero.x,k),y:lerp(hand.y,hero.y,k)-Math.sin(Math.PI*k)*40}}
      else if(gt<hp.rc){const k=eout(clamp((gt-hp.ti)/.2,0,1));pos={x:lerp(hero.x,PLANK.q.x-700,k),y:lerp(hero.y,PLANK.q.y,k)}}   // planted in the wood behind the Watcher
      else if(gt<=hp.p2){const q=plankPos(hp,gt);pos={x:q.x-700,y:q.y}}                                                            // carried by the plank
      else{const q=plankPos(hp,hp.p2),k=eio(clamp((gt-hp.p2)/(hp.ret-hp.p2),0,1));pos={x:lerp(q.x-700,hand.x,k),y:lerp(q.y,hand.y,k)}}
      r.harp={x:pos.x,y:pos.y};
      if(!hp.sf&&gt>=w){hp.sf=1;MUSIC.fx('whoosh');MUSIC.fx('chainSlip')}}}
  if(S.rust&&gt>=S.rust.t0&&gt<S.rust.st+.3)r.toll=Math.max(r.toll,.8);   // he strikes the hull, the bell shakes
  const kc=S.cnt&&S.cnt.k===1?S.cnt:null;   // counters: the Elder's bell shakes (sweep: the echo; finish: the resonance, louder and louder)
  if(kc&&kc.spell==='sweep'){const q=(gt-kc.t)/kc.dur;if(q>.3&&q<.8)r.toll=Math.max(r.toll,.5)}
  if(kc&&kc.spell==='finish'){const F=SP.finish;r.toll=Math.max(r.toll,.35+.65*clamp((gt-kc.t)/(F.first+(F.strikes-1)*F.step),0,1))}
  if(gt<S.roarT+S.roarD)r.toll=Math.max(r.toll,.9);
  const st=S.threats.find(t=>t.k==='wave'&&!t.anchor&&gt>=t.t0&&gt<=t.tl+.1);
  if(st){const up=st.tl-.18;r.stomp=gt<up?eout(clamp((gt-st.t0)/(up-st.t0),0,1))*46:lerp(46,0,ein(clamp((gt-up)/.18,0,1)))}
  return r;
}
function drawKingFx(){
  for(const th of S.threats){
    if(th.k==='wave'&&gt>=th.tl&&!th.sf){th.sf=1;S.shake=Math.max(S.shake,th.anchor?13:10);MUSIC.fx(th.anchor?'slam':'step');burst(662,GY,18,'#cff7ef',5,.6,.4)}
    if(th.k==='wave'&&gt>=th.tl){const big=th.big?1.35:1,k=clamp((gt-th.tl)/(th.ti-th.tl),0,1);
      if(gt<th.ti)drawWave(lerp(650,HX+40,eio(k)),lerp(14,86*big,eout(k)),1);
      else{const q=(gt-th.ti)/.55;if(q<1)drawWave(lerp(HX+40,-90,q),86*big*(th.res==='ok'?1-q*.6:1-q*.3),th.res==='ok'?1-q*.5:1);
        if(!th.wf&&q>=.62){th.wf=1;S.shake=Math.max(S.shake,13);MUSIC.fx('rumble');for(let i=0;i<14;i++)S.parts.push({x:Math.random()*W,y:-4,vx:(Math.random()-.5)*.25,vy:.3,g:.28,t0:gt,life:1.6,c:'#7a6a56',r:2})}
        if(!th.bf){th.bf=1;burst(HX+40,GY-50,th.res==='ok'?26:14,'#e6f8f2',6,.7,.3)}}}
  }
  drawRafter();drawPlank();drawDChain();drawEchoes();
}
/* a breaking wave, crest towards the Watcher (left): front at x, height h, opacity a */
function drawWave(x,h,a){if(a<=0||h<=1)return;ctx.save();ctx.globalAlpha*=a;
  const g=ctx.createLinearGradient(0,GY-h,0,GY+6);g.addColorStop(0,'rgba(175,245,230,.95)');g.addColorStop(.35,'rgba(40,170,165,.88)');g.addColorStop(1,'rgba(8,60,66,.92)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x+h*2.4,GY+6);ctx.quadraticCurveTo(x+h*1.1,GY+2,x+h*.45,GY-h*.85);ctx.quadraticCurveTo(x+h*.05,GY-h*1.08,x-h*.38,GY-h*.72);
  ctx.quadraticCurveTo(x-h*.12,GY-h*.56,x-h*.2,GY-h*.22);ctx.quadraticCurveTo(x-h*.3,GY+2,x-h*.62,GY+6);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(235,252,248,.9)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x+h*1.1,GY-h*.25);ctx.quadraticCurveTo(x+h*.5,GY-h*.85,x+h*.05,GY-h*1.05);ctx.quadraticCurveTo(x-h*.25,GY-h*.95,x-h*.38,GY-h*.72);ctx.stroke();
  for(let i=0;i<6;i++){const k=(gt*2+i*.17)%1;ell(x-h*.3-k*20+i*4,GY-h*.8-k*18+i*3,1.6,1.6,`rgba(235,252,248,${.8*(1-k)})`)}
  ctx.restore()}
/* the deck beam that falls twice after the wave hits the back wall: first it swings down on its hinge, then the hinge breaks */
const RAFTER={px:HX-150,py:34,L:330,aHit:.95,aHang:.62};
function drawRafter(){const r1=S.threats.find(t=>t.k==='rafter'&&t.n===1),r2=S.threats.find(t=>t.k==='rafter'&&t.n===2);if(!r1&&!r2)return;
  const R=RAFTER,P={x:R.px,y:R.py},end=a=>({x:P.x+Math.cos(a)*R.L,y:P.y+Math.sin(a)*R.L});let A=P,B,al=1,shadow=0;
  const hang=()=>{const a=r1&&r1.res==='hit'&&gt-r1.okT<.3?R.aHit:R.aHang;return a};
  if(r1&&!r1.done){const k=gt<r1.t0?0:ein(clamp((gt-r1.t0)/(r1.ti-r1.t0),0,1));B=end(R.aHit*k);shadow=k;if(gt>=r1.t0&&!r1.cr){r1.cr=1;MUSIC.fx('crackRun')}}
  else if(r2&&!r2.done&&gt<r2.t0){const q=r1?clamp((gt-r1.okT)/.3,0,1):1;B=end(lerp(R.aHit,R.aHang,eout(q)));if(r1&&r1.res==='ok'&&!r1.bf){r1.bf=1;burst(B.x,B.y,14,'#cdb69a',5,.5,.3);MUSIC.fx('chunk')}}
  else if(r2&&!r2.done){const k=ein(clamp((gt-r2.t0)/(r2.ti-r2.t0),0,1)),b0=end(R.aHang),c={x:HX+10,y:GY-138};
    A={x:lerp(P.x,c.x-R.L/2,k),y:lerp(P.y,c.y-6,k)};B={x:lerp(b0.x,c.x+R.L/2,k),y:lerp(b0.y,c.y+6,k)};shadow=k}
  else if(r2){const q=clamp((gt-r2.okT)/.8,0,1),c={x:HX+10,y:GY-138};al=1-q;if(!r2.bf){r2.bf=1;burst(HX+10,GY-130,20,r2.res==='ok'?'#cdb69a':'#8a7a6a',6,.6,.3);MUSIC.fx('chunk')}
    const dx=r2.res==='ok'?220*eout(q):0,dy=r2.res==='ok'?(GY-12-c.y)*ein(q):0;A={x:c.x-R.L/2+dx,y:c.y-6+dy};B={x:c.x+R.L/2+dx,y:c.y+6+dy}}
  else return;
  if(shadow>0)ell(HX+10,GY+3,30+40*shadow,4+3*shadow,`rgba(0,0,0,${.15+.35*shadow})`);
  ctx.save();ctx.globalAlpha*=al;ctx.lineCap='butt';ctx.strokeStyle='#120c08';ctx.lineWidth=22;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();
  ctx.strokeStyle='#4a3320';ctx.lineWidth=15;ctx.stroke();ctx.strokeStyle='rgba(200,160,110,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(A.x,A.y-4);ctx.lineTo(B.x,B.y-4);ctx.stroke();
  const dx=B.x-A.x,dy=B.y-A.y,l=Math.hypot(dx,dy)||1;for(const t of[.2,.5,.8])ell(A.x+dx*t,A.y+dy*t,2,2,'#1a120b');
  ctx.fillStyle='#4a3320';ctx.beginPath();ctx.moveTo(B.x-dy/l*7,B.y+dx/l*7);ctx.lineTo(B.x+dx/l*14,B.y+dy/l*14-4);ctx.lineTo(B.x+dx/l*6,B.y+dy/l*6+2);ctx.lineTo(B.x+dx/l*12,B.y+dy/l*12+6);ctx.lineTo(B.x+dy/l*7,B.y-dx/l*7);ctx.fill();
  ctx.restore()}
/* a board: from A to B, thickness w (same look as the deck beam) */
function board(A,B,w,al){ctx.save();ctx.globalAlpha*=al;ctx.lineCap='butt';ctx.strokeStyle='#120c08';ctx.lineWidth=w+7;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();
  ctx.strokeStyle='#4a3320';ctx.lineWidth=w;ctx.stroke();ctx.strokeStyle='rgba(200,160,110,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(A.x,A.y-3);ctx.lineTo(B.x,B.y-3);ctx.stroke();
  const dx=B.x-A.x,dy=B.y-A.y;for(const t of[.25,.75])ell(A.x+dx*t,A.y+dy*t,2,2,'#1a120b');ctx.restore()}
/* the plank torn out by the harpoon: stuck in the wood with the harpoon, then flown at the Watcher (upper then lower block), broken after the second */
function drawPlank(){
  for(const hp of S.threats){if(hp.k!=='hpOut'||gt<hp.ti||gt>hp.p2+.7)continue;
    const P=PLANK,q=plankPos(hp,gt),c=Math.cos(P.ang),sn=Math.sin(P.ang),pk=S.threats.filter(o=>o.k==='plank'&&o.hp===hp);
    if(!hp.sf2){hp.sf2=1;burst(P.q.x,P.q.y,10,'#cdb69a',4,.5,.3);MUSIC.fx('chunk')}
    if(gt>=hp.rc&&!hp.rf){hp.rf=1;S.shake=Math.max(S.shake,5);MUSIC.fx('crackRun')}
    let al=1,dy=0;if(gt>hp.p2){const u=(gt-hp.p2)/.7;al=1-u;dy=60*u*u}
    const l=P.len/2;
    if(gt>=hp.rc&&gt<=hp.p2)ell(HX+24,GY+3,34,4,'rgba(0,0,0,.3)');
    board({x:q.x-c*l,y:q.y-sn*l+dy},{x:q.x+c*l,y:q.y+sn*l+dy},15,al);
    for(const th of pk)if(th.done&&gt-th.okT<.12&&!th.bf){th.bf=1;burst(HX+30,th.n===1?HY-60:GY-50,th.res==='ok'?14:8,'#cdb69a',5,.4,.3)}}}
/* a chain falling from the ceiling on the Watcher (between two glas): one block */
function drawDChain(){
  for(const th of S.threats){if(th.k!=='dchain'||gt<th.t0)continue;
    const k=ein(clamp((gt-th.t0)/(th.ti-th.t0),0,1)),x=HX+16,y=lerp(-30,HY-70,k),al=th.done?Math.max(0,1-(gt-th.okT)/.4):1,y1=th.done&&th.res==='ok'?lerp(HY-70,GY-6,eio(clamp((gt-th.okT)/.4,0,1))):y;
    ctx.save();ctx.globalAlpha*=al;chainLinks(x+6,-40,x,y1,0,'#4a2a18');ell(x,y1,5,7,'#2a1810');ctx.restore();
    if(th.done&&!th.bf){th.bf=1;burst(HX+20,HY-60,10,'#b9a48c',4,.4,.3)}}}
/* the blocked glas sent back at the Elder: an echo from the Watcher's bell to the Elder's head bell */
function echoWave(x0,y0,x1,y1,u,a,sc){const x=lerp(x0,x1,eout(u)),y=lerp(y0,y1,eout(u)),ang=Math.atan2(y1-y0,x1-x0);
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,244,200,${(.75-i*.2)*a})`;ctx.lineWidth=4-i;ctx.beginPath();ctx.ellipse(-i*14,0,(14+i*4)*sc,(50+i*12)*sc,0,-Math.PI*.45,Math.PI*.45);ctx.stroke()}ctx.restore()}
const headPos=()=>S.kingHead||{x:694,y:GY-204};
function drawEchoes(){
  if(!S.echoes||!S.echoes.length)return;S.echoes=S.echoes.filter(e=>gt-e.t0<1);
  for(const e of S.echoes){const age=gt-e.t0,u=clamp(age/.6,0,1),h=headPos();
    if(u<1)echoWave(e.x,e.y,h.x-30,h.y,u,1,.8);
    else{const q=(age-.6)/.4;ctx.strokeStyle=`rgba(255,244,200,${.7*(1-q)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.x,h.y,20+60*q,0,Math.PI*2);ctx.stroke()}}}
/* ---- counters of the Elder (S.cnt.k === 1; S.cnt.spell = the last spell of the series), drawn by drawCounter ---- */
/* a ray along the ground from the Watcher to the Elder's foot: it splits the wave and bursts there */
function groundRay(k,u,a,dy){const x0=HX+36,x1=640,x=lerp(x0,x1,u),y=GY-3+dy;
  ctx.strokeStyle=`rgba(255,244,190,${a})`;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x,y);ctx.stroke();glow(x,y,46,'rgba(255,244,190,.9)',.7*a);
  if(u<1)drawWave(lerp(x0+30,x1-10,eout(u)),70*(1-u*.7),a*.8);
  else for(let i=0;i<5;i++){const s=(i-2)*16,h=(34+(i%2)*22)*a;ctx.strokeStyle=`rgba(200,245,235,${a})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1+s,GY);ctx.lineTo(x1+s*1.5,GY-h);ctx.stroke()}}
function counterKing(k){
  const c=S.cnt,sp=c.spell,u=clamp((k-.12)/.3,0,1),a=1-clamp((k-.42)/.4,0,1),A={x:S.orbX,y:S.orbY},bx=S.orbX+24,by=S.orbY-30,h=headPos();
  if(sp==='finish'){
    const F=SP.finish,T=gt-c.t,n=F.strikes,p=clamp(T/(F.first+(n-1)*F.step),0,1);
    // the Watcher's bell, charged with Lumen, and the Elder's bell answer each other: a trembling thread between them, rings at each strike (stronger and stronger)
    glow(bx,by,40+50*p,'rgba(150,255,235,.9)',.35+.5*p);glow(h.x,h.y,40+60*p,'rgba(255,226,170,.9)',.2+.5*p);
    ctx.strokeStyle=`rgba(230,250,240,${.25+.4*p})`;ctx.lineWidth=1.5+2*p;ctx.beginPath();for(let i=0;i<=24;i++){const q=i/24,x=lerp(bx,h.x,q),y=lerp(by,h.y,q)+Math.sin(q*30+gt*40)*(2+10*p)*Math.sin(Math.PI*q);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
    for(let i=0;i<n;i++){const age=T-(F.first+i*F.step);if(age<0||age>.7)continue;const g=.4+.6*i/(n-1),r=age*(260+160*g),al=(1-age/.7)*g;
      ctx.strokeStyle=`rgba(255,244,200,${al})`;ctx.lineWidth=4*g+1;ctx.beginPath();ctx.arc(bx,by,r*.6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(h.x,h.y,r,0,Math.PI*2);ctx.stroke()}
    return}
  if(sp==='harpoon'){   // the lightning leaves the lantern, strikes the harpoon and climbs the chain to the Elder's hand
    const hk=c.hitAt/c.dur,tp=S.harpTip,hd=S.harpHand;
    if(tp&&hd&&k>.04&&k<hk+.3){const cu=clamp((k-.1)/(hk-.1),0,1),fa=1-clamp((k-hk)/.3,0,1),sd=(k*12|0)/12;
      if(k<.14)bolt(A.x,A.y,tp.x,tp.y,sd,`rgba(190,245,255,${.9*fa})`,3);
      const ex=lerp(tp.x,hd.x,cu),ey=lerp(tp.y,hd.y,cu);bolt(tp.x,tp.y,ex,ey,sd,`rgba(190,245,255,${.95*fa})`,3.5);
      glow(ex,ey,38,'rgba(190,245,255,.9)',.8*fa);if(cu>=1)glow(hd.x,hd.y,55,'rgba(190,245,255,.9)',.7*fa)}return}
  if(sp==='wave'){if(k>.12&&k<.85)groundRay(k,u,Math.max(a,.05),0);return}
  if(sp==='dwave'){if(k>.12&&k<.85){groundRay(k,u,Math.max(a,.05),0);const u2=clamp((k-.2)/.3,0,1);if(k>.2)groundRay(k,u2,Math.max(a,.05),-7)}return}
  // sweep (bell stroke) and rust (staff raised, light round the Watcher): the bell's echo crosses the hold to the Elder
  if(sp==='rust'){const l=Math.sin(Math.PI*clamp((k-.05)/.8,0,1));glow(A.x,A.y,150,'rgba(255,244,200,.9)',.55*l);glow(A.x,A.y,60,'rgba(150,255,235,.9)',.6*l)}
  if(k>.1&&k<.8){const env=1-clamp((k-.1)/.7,0,1);ctx.save();ctx.translate(bx,by);ctx.rotate(Math.sin(gt*55)*.45*env);ctx.fillStyle=`rgba(255,236,170,${.35+.65*env})`;
    ctx.beginPath();ctx.moveTo(-9,6);ctx.quadraticCurveTo(-9,-8,0,-10);ctx.quadraticCurveTo(9,-8,9,6);ctx.closePath();ctx.fill();ctx.restore()}
  if(k>.12&&k<.85){echoWave(bx,by,h.x-40,h.y+40,u,Math.max(a,.1),1);
    if(sp==='sweep'&&u>=1){const q=clamp((k-.42)/.4,0,1);ctx.strokeStyle=`rgba(255,244,200,${.7*(1-q)})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(700,GY-150,40+90*q,60+110*q,0,0,Math.PI*2);ctx.stroke()}}   // the echo bounces on the Elder
}
/* one-shot sounds of the Elder's counters, and the strikes of the Finish */
function kingCounterFx(c){
  const k=(gt-c.t)/c.dur;
  if(c.spell==='finish'){const F=SP.finish;while((c.fi||0)<F.strikes&&gt-c.t>=F.first+(c.fi||0)*F.step){const i=c.fi||0;c.fi=i+1;S.shake=Math.max(S.shake,5+i*4);MUSIC.fx(i===F.strikes-1?'bellHit':'bellChime')}return}
  const sp=c.spell,fx={harpoon:'thunder',sweep:'bellChime',rust:'bellChime',wave:'plant',dwave:'plant'}[sp];
  if(k>=.12&&!c.s1){c.s1=1;if(fx)MUSIC.fx(fx)}
  if(sp==='dwave'&&k>=.2&&!c.s2){c.s2=1;MUSIC.fx('plant')}
  if(k>=.42&&!c.s3){c.s3=1;const e=sp==='wave'||sp==='dwave'?[640,GY]:[700,GY-150];burst(e[0],e[1],12,'#e6f8f2',5,.5,.3)}}
/* the rust cloud (rage 1): red dust over the hold until the ship collapses. It hides the scenery and the Elder himself, never the
   block signal: the attacks are drawn over it, and it thins out around the Watcher (clear round him during the rage-1 counter) */
const RUSTP=(()=>{const R=mulberry(57);return[...Array(26)].map(()=>({x:R()*W,y:R()*GY,r:60+R()*90,v:(R()-.5)*14,o:R()*6}))})();
function drawRust(){const R=S.rust;if(!R||gt<R.t0)return;
  if(gt>=R.st&&!R.sf){R.sf=1;S.shake=Math.max(S.shake,14);MUSIC.fx('rumble');MUSIC.fx('chainSlip')}   // the hull is struck
  const a=clamp((gt-R.st)/(R.tc-R.st),0,1),front=lerp(-40,H+60,eout(clamp((gt-R.st)/(R.tc-R.st+.5),0,1)));
  // counter of rage 1: the staff raised, the cloud thins out round the Watcher only (and comes back)
  const kc=S.cnt&&S.cnt.k===1&&S.cnt.spell==='rust'?S.cnt:null,cl=kc?Math.sin(Math.PI*clamp(((gt-kc.t)/kc.dur-.05)/.8,0,1)):0,
        near=(x,y)=>1-cl*clamp(1.25-Math.hypot(x-HX,y-(GY-90))/230,0,1);
  ctx.save();
  if(gt>=R.st&&gt<R.tc+.8){const am=7*Math.max(0,1-(gt-R.st)/(R.tc-R.st+.8));for(const x of[120,330,540,830])chainLinks(x,-10,x+Math.sin(gt*37+x)*am,150+(x%3)*40,0,'#4a2a18')}   // the chains tremble
  for(let x=0;x<W;x+=40){const k=near(x+20,GY-90),g=ctx.createLinearGradient(0,front-160,0,front);g.addColorStop(0,`rgba(110,40,18,${.62*a*k})`);g.addColorStop(1,'rgba(110,40,18,0)');ctx.fillStyle=g;ctx.fillRect(x,0,40,front)}
  for(const p of RUSTP){const x=(p.x+gt*p.v+W)%W,k=clamp((front-p.y)/90,0,1)*near(x,p.y);const rg=ctx.createRadialGradient(x,p.y,4,x,p.y,p.r);rg.addColorStop(0,`rgba(150,62,28,${.45*a*k})`);rg.addColorStop(1,'rgba(120,45,20,0)');ctx.fillStyle=rg;ctx.fillRect(x-p.r,p.y-p.r,p.r*2,p.r*2)}
  {const g=ctx.createRadialGradient(700,GY-150,20,700,GY-150,240);g.addColorStop(0,`rgba(96,36,16,${.55*a})`);g.addColorStop(1,'rgba(96,36,16,0)');ctx.fillStyle=g;ctx.fillRect(440,GY-400,520,420)}   // the Elder himself hardly shows in it
  for(let i=0;i<40;i++){const x=(i*97+gt*20)%W,y=(i*53+gt*40)%Math.max(front,1);ctx.fillStyle=`rgba(200,110,60,${.5*a*near(x,y)})`;ctx.fillRect(x,y,1.6,1.6)}
  ctx.restore()}
/* the same cloud over the Watcher too (called after him): a thin haze everywhere; only the rage-1 counter opens a clear ring round him */
function drawRustHaze(){const R=S.rust;if(!R||gt<R.st)return;
  const a=clamp((gt-R.st)/(R.tc-R.st),0,1),kc=S.cnt&&S.cnt.k===1&&S.cnt.spell==='rust'?S.cnt:null,cl=kc?Math.sin(Math.PI*clamp(((gt-kc.t)/kc.dur-.05)/.8,0,1)):0;
  const g=ctx.createRadialGradient(HX,GY-90,0,HX,GY-90,260);g.addColorStop(0,`rgba(120,46,22,${.24*a*(1-cl)})`);g.addColorStop(1,`rgba(120,46,22,${.24*a})`);
  ctx.save();ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}
/* ---- Phase III · Form I: the tower's tentacles and torn pieces ---- */
function P3(stage,f,b,final,rage){
  const T=[];let t=b;
  const R=88;
  const sweep=dir=>{const ts=t+.95*f,D=1.6*f;let s0,s1;if(dir<0){s0=(940-HX-R)/1000;s1=(940-HX+R)/1000}else{s0=(HX-R+60)/1000;s1=(HX+R+60)/1000}
    T.push({k:'beam',t0:t,ts,D,dir,ta:ts+D*s0,tb:ts+D*s1,real:true,hold:true});t=ts+D+.35*f};
  const bolt=()=>{T.push({k:'bolt',t0:t,ti:t+.95*f,real:true,seed:Math.random()});t+=1.3*f};
  const spike=()=>{T.push({k:'spike',t0:t,ti:t+.8*f,real:true,seed:Math.random()});t+=1.15*f};
  const whip=()=>{T.push({k:'whip',t0:t,ti:t+.9*f,side:Math.random()<.5?-1:1});t+=1.2*f};
  const chunk=()=>{T.push({k:'chunk',t0:t,tl:t+.6*f,ti:t+1.2*f,ri:RINGS[Math.floor(Math.random()*6)]});t+=1.55*f};
  // the King's wave (hold), crossing the reef like the beam
  const kwave=()=>{const K=SP.kwave,ts=t+K.ts*f,D=K.D*f,th={k:'kwave',t0:t,ts,D,dir:-1,ta:ts+D*(940-HX-R)/1000,tb:ts+D*(940-HX+R)/1000,real:true,hold:true};T.push(th);t=ts+D+K.after*f;return th};
  // rage, the rising tide: the wave (hold), then reef spikes rise in its wake as it ebbs (taps)
  const tide=()=>{const w=kwave(),e=w.ts+w.D,P=SP.tide;T.push({k:'spike',t0:e,ti:e+P.spike1*f,real:true,seed:Math.random(),tide:1});T.push({k:'spike',t0:e+P.gap*f,ti:e+P.spike2*f,real:true,seed:Math.random(),tide:1});t=e+P.spike2*f+P.after*f};
  const p0=[bolt,()=>sweep(-1),()=>{spike();bolt()},()=>{sweep(-1);bolt()},()=>{bolt();spike()},whip,chunk,()=>{whip();bolt()},kwave];
  const p1=[()=>{bolt();spike();bolt()},()=>{sweep(-1);sweep(1)},()=>{sweep(-1);t-=.15*f;spike()},()=>{spike();sweep(1);bolt()},()=>{bolt();bolt();sweep(-1)},()=>{whip();whip();chunk()},()=>{sweep(-1);chunk()},tide,()=>{kwave();bolt()}];
  if(rage){tide();return T}
  pick(stage?p1:p0)();return T;
}
function beaconHide(){S.hide=null;for(const th of S.threats){if(th.k==='chunk'&&gt>=th.tl&&!(th.done&&gt>th.okT+.8)){(S.hide||(S.hide=new Set())).add(TOWER[th.ri])}}}
function drawBeaconFx(){
  const hit={x:HX+30,y:HY-40};
  for(const th of S.threats){
    if(gt<th.t0)continue;
    if(th.k==='whip'){const x0=LX+th.side*44,y0=GY-210;let tip;
      if(th.done){const k=clamp((gt-th.okT)/.5,0,1);if(k>=1)continue;tip={x:lerp(hit.x+60,x0+th.side*80,k),y:lerp(hit.y-60,y0+40,k)}}
      else if(gt<th.ti-.28){const k=eio(clamp((gt-th.t0)/(th.ti-.28-th.t0),0,1));tip={x:x0+th.side*120*k+40*k,y:y0-150*k}}
      else{const k=ein(clamp((gt-(th.ti-.28))/.28,0,1));tip={x:lerp(x0+th.side*120+40,hit.x,k),y:lerp(y0-150,hit.y,k)}}
      if(!th.sf&&gt>=th.ti-.28){th.sf=1;MUSIC.fx('whoosh')}
      tent(x0,y0,x0+th.side*60,y0-60,(x0+tip.x)/2,tip.y-80,tip.x,tip.y,7,1)}
    if(th.k==='chunk'){const p=TOWER[th.ri],o=p.e;let q;
      if(gt<th.tl){const k=(gt-th.t0)/(th.tl-th.t0);glow(o.x,o.y,50,'rgba(200,250,255,.9)',.8*k);tent(LX,LY,LX+60,LY+40,o.x+50,o.y-20,o.x+20,o.y,4,1);continue}
      if(!th.done){const k=ein(clamp((gt-th.tl)/(th.ti-th.tl),0,1));q={x:lerp(o.x,hit.x,k),y:lerp(o.y,hit.y,k)-Math.sin(Math.PI*k)*60,r:k*9}}
      else{const k=eio(clamp((gt-th.okT)/.8,0,1));const from=th.res==='ok'?{x:hit.x+80,y:hit.y-70}:hit;q={x:lerp(from.x,o.x,k),y:lerp(from.y,o.y,k),r:(1-k)*6};if(th.res==='ok'&&!th.sf){th.sf=1;MUSIC.fx('bellHit')}}
      ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);PDRAW[p.k](.85);ctx.restore()}
  }
}

