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
/* colour between a and b (3 channels): the string only depends on the three rounded values, so it is looked up in a small table (no array or string per particle and frame) */
const LERPC_CACHE=new Map();
function lerpC(a,b,k){const r=Math.round(lerp(a[0],b[0],k)),g=Math.round(lerp(a[1],b[1],k)),bl=Math.round(lerp(a[2],b[2],k)),key=((r+512)*2048+(g+512))*2048+(bl+512);
  let s=LERPC_CACHE.get(key);if(s===undefined){if(LERPC_CACHE.size>4096)LERPC_CACHE.clear();s=`rgb(${r},${g},${bl})`;LERPC_CACHE.set(key,s)}return s}
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
function banner(txt,sub){say(sub?txt+'. '+sub:txt);MUSIC.fx('sting');MUSIC.fx('rumble')}
/* rages, as in Ember Bridge (shared/js/18-boss-diff.js LB.BOSS_DIFF, 36-p2-foundry-logic.js qTurn / qRage): when the boss's HP has
   reached a threshold of S.d.bd.rages (rages3 in phase III), his next turn is a roar (LB.BOSS_RULES.rageDur, rageDur2 for the next ones: shake, flash, sting),
   then his rage spell (the signature spell of the phase), then the second-half patterns; the final assault comes at
   LB.BOSS_RULES.finalHp. The boss bar marks the thresholds (pips underlined, as in Ember Bridge). */
const rageAt=()=>LB.rageHp(S.d.bd,S.phase);   // rage thresholds of the current phase
const rageMarks=()=>LB.hud.marks(rageAt(),LB.BOSS_RULES.finalHp);   // both forms of phase III end on a final assault (form I: Dazzle, form II: Knell)
function rageBanner(){
  if(S.phase===2)banner(_('Echoes','Échos'),_('Three voices, one real. Only real orbs cast a shadow; the reflections shatter one by one.','Trois voix, une seule vraie. Seules les vraies orbes ont une ombre ; les reflets se brisent un à un.'));
  else if(S.phase===1){banner(_('Turquoise heart','Cœur turquoise'),_('The Bottomless takes control: every attack calls a toll.','La Sans-Fond prend le contrôle : chaque attaque appelle un glas.'));MUSIC.fx('heart')}
  else if(S.form===2)banner(_('Bell storm','Tempête de cloches'),_('The side lanterns fire rings in turn, then the trap bell falls.','Les lanternes latérales tirent des anneaux tour à tour, puis la cloche-piège tombe.'));
  else banner(_('Rising tide','Marée montante'),_('The wave floods the reefs; spikes rise as it ebbs.','La vague noie les récifs ; des pics jaillissent quand elle se retire.'));
}
/* shard rain (phase I), aligned on Ember Bridge's stone rain (36-p2-foundry-logic.js qRoar / qResolve / qHurt):
   spacing between two shards drawn at random in [lo, hi] s (Normal and Easy .32-.62, Hard .55-.9: the Hard window is
   shorter, so the rhythm is slower), not scaled by the attack speed; in Hard, `grace` s more after the impact (irregular
   rhythm); a shard that hits stuns only `hurt` s. PROVISIONAL, from Ember Bridge. */
const RAIN={normal:[.32,.62],hard:[.55,.9],grace:.13,hurt:.14};
/* new spells (docs/CH2-SPEC.md, « Sorts et rages »): times in seconds, multiplied by f (Normal's rhythm, see RHY: the same in every difficulty).
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
   volley: sizes now in SP.volley (refonte of 6 Nov); rain number of shards of a shard rain;
   echoOrbs / echoShards  orbs fired and shards dropped by each echo during the echo rage;
   dance  final assault (mirror dance): number of mirrors, fragments per mirror (Easy 1, Normal and Hard 2 in all);
   pe     permanent echo (Hard only): all fight long, fires one orb `lag` s after the end of each spell (a wail of its own instead of the orb
         after a wail), never within `wail` s of a wail of the Voice; shifted by the gap, never dropped */
const VX={
  gap:{easy:.6,normal:.75,hard:1.05},
  rain:{easy:2,normal:3,hard:3},
  echoOrbs:{easy:1,normal:2,hard:2},
  echoShards:{easy:1,normal:2,hard:2},
  pe:{lag:.7,wail:.25},
  dance:{mirrors:{easy:1,normal:2,hard:2},frag:1,n:{easy:3,normal:5,hard:5},ill:{easy:2,normal:2,hard:2}}   // final assault: mirrors the volley leaves by, fragments per exploding mirror, orbs and illusions of its volley (unchanged by the refonte)
};
const vdk=()=>S.d.hard?'hard':S.dk==='easy'?'easy':'normal';
/* internal rhythm of every attack (gaps between strikes, tells, chains): always the Normal's, in real seconds, whatever the difficulty
   and the same before and after the rage (rule of Ember Bridge, CLAUDE.md « Difficulté et chapitres »). sp = speed of that rhythm (1);
   rage = per-boss rage accelerator, by phase id (1 Elder, 2 Voice, 3 Lighthouse); 1 = no effect, nobody uses another value today:
   any other value must be listed in docs/decisions. Never read the difficulty speed here. */
const RHY={sp:1,rage:{1:1,2:1,3:1}};
const SP={
  wave:{land:.55,hit:1.05,fall1:.8,fall2:1.15,after:1.6},
  dwave:{gap:.55},
  /* Rust Elder (II), refonte du 5 novembre (docs/decisions/2026-11-05-ch2-ancien-sorts.md), all PROVISIONAL, x f (Normal's rhythm; Hard = Normal's seconds, f = 1 outside Voice):
     harpoon: flies `fly` (= old hpOut) and pierces the Watcher (block 1), sticks in the wood `stick` (Kevin: 1 s), is recalled tearing
               out a plank that arrives diagonally: first impact `pl1` after the recall, second `gap` later (= rafter gap), the hand
               takes the harpoon back in `back`, next attack `after` later (= old .8);
     floor:   minimum gap (absolute seconds) between the real impacts of two different spells (a combo's spells included); a spell built as a
               series (chain, harpoon + plank, wave + beam, sweep combo, glas) keeps its own rhythm inside; a gap that is too short is pushed
               back (whole spell), never dropped. rest: Hard, extra pause before the series that follows a combo;
     sweep:   one fluid combo of the anchor (no return to rest between strikes): the first impact `ts` after the start (= old sweep
               .72), then one impact every d[i] s (Easy 2 strikes, Normal 3, Hard 4; in Hard the last one smashes the ground and
               sends a water wave, counted in the series). A gap >= `long` is a delay: the anchor is held up, trembling, then falls.
               Next attack `after` after the last impact;
     rust (rage 1): he strikes the hull (`strike`), the cloud grows for `grow` and stays until the ship collapses, `pause`, then a sweep;
     glas (final assault): the head bell rings `bell` after the start, `n` echoes leave it `gap` apart, each reaches the Watcher `hit`
               after leaving (= old toll 1.0), next attack `after` later; `chain` = the falling chain between two glas (one block);
               `need` = glas to counter before the Finish (total count, not a series);
     finish: `strikes` resonance strikes from `first`, `step` apart, the Elder falls `hit` after the last, `tail` of calm after. */
  harpoon:{fly:1.1,stick:HARPOON_FX.stick,pl1:.75,gap:HARPOON_FX.gap,back:.9,after:.8},   // stick -25 % and gap +.15 s: readability pass of 6 Nov (HARPOON_FX, 32-boss-rust-king.js)
  sweep:{d:{easy:[.85],normal:[.6,.95],hard:[.7,1,.85]},long:.7,ts:.72,after:.5},
  floor:{easy:.6,normal:.75,hard:1.05},   // minimum between two real impacts of different spells (s, NOT x f), like VX.gap of the Voice
  rest:{hard:.6},                          // Hard: pause before a series that follows a combo
  rust:{strike:.7,grow:1.4,pause:.4},
  glas:{n:2,bell:.55,gap:.5,hit:1,after:.8,chain:1.1,need:{easy:3,normal:4,hard:5}},
  finish:{strikes:4,first:.6,step:.8,hit:.3,tail:.4},
  kwave:{ts:.95,D:1.6,after:.35},
  tide:{spike1:.8,spike2:1.15,gap:.35,after:1.15},
  storm:{n:5,gap:.34,tl:.5,ti:.95,trapGap:.4,trapTl:.75,trapTa:1.3,trapTb:1.8,after:.7},
  echo:{break1:.2,tl:.42,ti:.95},
  /* wail (I): the tear wave crosses the Watcher (from the right); `lag` s after it, an Illusion appears on the left (`ill`) and
     throws a second wave the other way, then vanishes; the next attack starts `after` s before the second
     impact. Both waves are real impacts, spaced by VX.gap like every other. Per wave: `tl` s of cast, then a run of r1 (Voice) /
     r2 (Illusion) s x `run` (the wave is a little faster: x.85). Drawing: at `ti` the leading edge of the wave (`edge` px ahead of
     its centre) touches the Watcher's body (`reach` px from HX, the real hit point), without moving the hitbox or `ti`.
     The permanent echo throws the same wave from its own hand (`pe`, fired like its orb).
     mirror (I): a mirror of the hall (one of the floating shards) explodes into fragments that fly for `fly` s (wandering, then
     settling) before darting at the Watcher; dance (I, final assault): the volley goes through the mirrors, orbs leave the mirror
     after `split` of their flight, `settle` s after the last orb the mirrors explode */
  wail:{lag:.1,tl:.8,r1:1.1,r2:.9,run:.85,after:.6,edge:22,reach:30,ill:{x:62,y:248}},
  /* rain (I): the mirror bursts, its fragments are thrown across the hall for `fly` s (1.5 x .85: a little quicker), changing direction
     `turns` [min, max] times at random spots of `area`, then settle above the mirror and dart one after the other in random order.
     Same for the mirror dance (final assault). draw = drawing scale of the fragments (phone). */
  mirror:{fly:1.275,size:15,draw:1.3,turns:[2,3],area:{x0:50,x1:W-50,y0:50,y1:GY-40}},
  dance:{split:.45,settle:.6},
  /* ---- Hollow Voice refonte (6 Nov 2026, docs/decisions/2026-11-06-voix-refonte.md). ALL PROVISIONAL. Seconds, never scaled by a
     speed of the boss (VOICE_SPEED stays 1); the real impacts keep VX.gap whatever happens here (a gap too short shifts an impact).
     orb    three flights (tl -> ti) per type: slow / normal (= the old flight) / fast, the charge at the face (`charge`) is the same;
            `w` = draw weights of a volley's orbs (the type is independent of real / illusory); col / halo / spark = halo of the charge
            at the face (colour, size, crackling sparks), fx = crackle note (80-sfx-combat.js, 60-music.js);
     volley size, constant (no stage): n orbs [min, max], ill illusions; never more than `maxRun` illusions in a row, at least one real;
            cad = pauses (s) between two shots, one row drawn per volley (tight pair then delay, speeding up then pause...), tail after it;
     tear   drawing only: where tears are born on the face (eyes, mouth), seconds of the run down the face (`run`) and of the fall
            (`drop`) in the share of the cast, `fall` = x of the fall point from the face centre (the wave leaves it);
     room   the hall closes in: the shard that cracks (rage 1) / goes out (final assault), `crack` s then `fade` s; the one the dance breaks
            (`breakFade`); `trace` = opacity of the pale trace the rage echoes leave;
     pres   the reflection of the Voice in the water stretches towards the Watcher's feet: length (px) per stage (0, rage 1, rage 2 / final), `ease` = speed;
     reply  answers of the responding clone (see ECHO_REPLY below);
     rageEcho  final assault: an extra clone fires `n` real orbs without a warning, at `at` s after the start, `tell` s of charge. */
  orb:{charge:.45,
    type:{slow:{fly:1.06,col:'rgba(120,150,255,.95)',halo:1.25,spark:3,fx:'orbSlow'},
      normal:{fly:.85,col:'rgba(176,124,255,.95)',halo:1,spark:0,fx:'orbNorm'},
      fast:{fly:.64,col:'rgba(255,150,225,.95)',halo:.8,spark:8,fx:'orbFast'}},
    w:{slow:.3,normal:.4,fast:.3}},
  volley:{size:{easy:{n:[3,3],ill:1},normal:{n:[4,6],ill:2},hard:{n:[4,6],ill:2}},maxRun:2,tail:.9,
    cad:[[.22,.95,.3,.8,.5],[.62,.46,.32,1,.3],[.44,.44,.44,.44,.44],[.3,.3,1.05,.3,.9]]},
  tear:{src:[[-9,6],[9,4],[0,22]],run:.42,drop:.38,fall:{voice:-20,pe:-20,rp:-20,ill:20}},
  room:{crack:1.2,fade:1,breakFade:.25,trace:.09},
  pres:{len:[0,180,360],ease:1.6},
  rageEcho:{easy:null,normal:{n:2},hard:{n:3},at:[1,2.6,4.2],tell:.2},
  /* ECHO_REPLY: the responding clone (Normal and Hard; none in Easy), per spell and difficulty. rage = rage count from which it answers
     (Normal 1, Hard 0), delay = s after the end of the spell (the last release; after the last fall for the rain), drawn at random.
     volley: replays the last real orb (same type), from the other side of the face, never illusory;
     wail:   `tl` of cast, then a run of `run` s from farther away (wailEcho);
     rain:   one mirror fragment answers late: wanders `fly` s, `tw` of glow, darts `dart` s.
     Hard: the permanent echo answers first, the clone after it (at least VX.gap later); never during a wail of the Voice. */
  reply:{volley:{easy:null,normal:{rage:1,delay:[.7,1]},hard:{rage:0,delay:[.7,1]}},
    wail:{easy:null,normal:{rage:1,delay:[.7,1]},hard:{rage:0,delay:[.7,1]},tl:.8,run:1.4},
    rain:{easy:null,normal:{rage:1,delay:[.7,1]},hard:{rage:0,delay:[.7,1]},fly:.6,tw:.42,dart:.53}}
};
const ECHO_REPLY=SP.reply;
/* the mirrors of the hall are the floating shards of the background (SHARDS): n distinct ones, in the right-hand half of the hall */
function mirrorPick(n,x0,x1){
  x0=x0==null?HX+160:x0;x1=x1==null?880:x1;
  let c=SHARDS.map((m,i)=>i).filter(i=>SHARDS[i].x>x0&&SHARDS[i].x<x1&&SHARDS[i].y<330&&!(S.shardGone&&S.shardGone[i]>gt)&&!roomOff(i));
  if(c.length<n)c=SHARDS.map((m,i)=>i).filter(i=>!roomOff(i));
  return c.sort(()=>Math.random()-.5).slice(0,n)}
function spawn(){
  const d=S.d,id=S.phase,f2=id===3&&S.form===2,gen=f2?P3b:[P1,P2,P3][id-1];
  /* as in Ember Bridge (a fury restarts while the Colossus's HP are still at its threshold): a rage whose counter failed
     (HP not lower than when the roar began) starts again at every attack; once the boss is hit, normal attacks resume until the
     next threshold. Thresholds already passed never restart. The final assault restarts until the boss falls (LB.rageState, shared). */
  const hasFinal=true,n=LB.rageState.check(S,rageAt(),hasFinal);
  if(n){S.angerShown=true;S.roarT=gt;S.roarD=LB.rageState.dur(n);S.nextAt=gt+S.roarD;S.shake=10;rageBanner();return}
  const go=l=>{const q=sched(l);q.spell=l.spell;q.side=l.side;q.ri=l.ri;return q};   // the spell shown by the riposte (set by P2)
  const stage=S.rageN?1:0,f=1/(RHY.sp*(id===2?VOICE_SPEED:1)*(stage?RHY.rage[id]:1));   // inside rhythm = Normal's, in real seconds, same before and after the rage, whatever the difficulty
  if(S.rageNext&&!S.finalDone){const r=S.rageNext;S.rageNext=0;go(gen(stage,f,gt+.25,false,r));return}
  if(!S.finalDone&&LB.rageState.isFinal(S,hasFinal)){
    S.finalDone=true;S.angerShown=true;S.roarT=gt;S.roarD=LB.BOSS_RULES.rageDur2;S.shake=10;
    banner(_('Final assault','Dernier assaut'),id===3&&!f2?'':[null,_('Funeral toll','Glas funèbre'),_('Chorus of reflections','Chœur des reflets'),_('Implosion','Implosion')][id]);
    go(gen(1,f,gt+1.6,true));return}
  go(gen(stage,f,gt+.25));
}
/* ---- Phase I · the Hollow Voice ---- */
/* random spots of the hall a fragment is thrown to before it settles (rain, dance, the clone's answer) */
function scatterWay(){const M=SP.mirror,A=M.area,nW=M.turns[0]+Math.floor(Math.random()*(M.turns[1]-M.turns[0]+1)),w=[];
    while(w.length<nW){let q;for(let i=0;i<8;i++){q={x:A.x0+Math.random()*(A.x1-A.x0),y:A.y0+Math.random()*(A.y1-A.y0)};const p=w[w.length-1];if(!p||Math.hypot(q.x-p.x,q.y-p.y)>200)break}w.push(q)}return w}
function P2(stage,f,b,final,rage){
  const T=[],K=vdk(),gap=VX.gap[K],casts=[],O=SP.orb;let t=b;
  const cast=(kind,fn)=>(...a)=>{const n=T.length;fn(...a);casts.push({kind,ths:T.slice(n)})};
  // an orb: charge at the face, then its flight (by type: SP.orb); `ty` only for the orbs of a volley (and the answers that replay them); step = pause before the next shot
  const orb=(real,src,vsi,ty,step)=>{const tl=t+O.charge*f;T.push({k:'orb',t0:t,tl,ti:tl+O.type[ty||'normal'].fly*f,real,src:src||0,vsi,ty});t+=(step==null?.44:step)*f};
  const orbTy=()=>{const w=O.w;let r=Math.random()*(w.slow+w.normal+w.fast);return(r-=w.slow)<0?'slow':(r-=w.normal)<0?'normal':'fast'};
  // which orbs of a volley are illusions: at random, at least one real, never more than `maxRun` in a row (in the order of fire)
  const fakeSet=(n,ill,maxRun)=>{ill=Math.min(ill,n-1);
    for(let k=0;k<60;k++){const s=new Set();while(s.size<ill)s.add(Math.floor(Math.random()*n));let run=0,ok=true;for(let i=0;i<n;i++){run=s.has(i)?run+1:0;if(run>maxRun)ok=false}if(ok)return s}
    return new Set([...Array(ill).keys()].map(i=>i*2).filter(i=>i<n-1))};
  // volley: constant size (SP.volley), orbs of random types, irregular cadence (one row of pauses drawn per volley)
  const volley=cast('volley',()=>{const Z=SP.volley,V=Z.size[K],n=V.n[0]+Math.floor(Math.random()*(V.n[1]-V.n[0]+1)),fake=fakeSet(n,V.ill,Z.maxRun),cad=Z.cad[Math.floor(Math.random()*Z.cad.length)];
    for(let i=0;i<n;i++)orb(!fake.has(i),0,undefined,orbTy(),i<n-1?cad[i]:0);t+=Z.tail*f});
  // the clones' shots come in random order (all sources mixed), each one real or illusory at random, at least one real per echo
  const echo=()=>{const n=VX.echoOrbs[K],sh=[];for(let s=0;s<3;s++)for(let k=0;k<n;k++)sh.push(s);sh.sort(()=>Math.random()-.5);const rl=sh.map(()=>Math.random()<.5),any=Math.floor(Math.random()*sh.length);rl[any]=true;sh.forEach((s,i)=>{orb(rl[i],s);if(i%n===n-1)t+=.1*f});t+=.9*f};
  // rage: the echo, then the two reflections shatter one by one, each dropping its shards at the Watcher (spaced by `gap`)
  const echoR=cast('echo',()=>{const E=SP.echo,nS=VX.echoShards[K];echo();const last=T[T.length-1].ti;let end=last;
    [1,2].forEach((src,j)=>{for(let k=0;k<nS;k++){const s=last+E.break1*f+(j*nS+k)*gap;T.push({k:'shard',t0:s,tl:s+E.tl*f,ti:s+E.ti*f,from:src});end=Math.max(end,s+E.ti*f)}});
    // finish: silence, the echoes take place in a circle round the Watcher, then converge in one wave (Hard: a double crown); one dodge dissolves it
    const Z=VOICE_FX.finish,c0=end+Z.silence*f;T.push({k:'cwave',t0:c0,tl:c0+Z.form*f,ti:c0+(Z.form+Z.conv)*f,real:true,dbl:K==='hard'?1:0});
    t=Math.max(t,c0+(Z.form+Z.conv+Z.after)*f)});
  // wail: a wave crosses the Watcher, then an Illusion on the left throws a second one the other way (two real impacts)
  const wail=cast('wail',()=>{const Wl=SP.wail,t1=t+(Wl.tl+Wl.r1*Wl.run)*f,t2=t1+Wl.lag*f,i2=t2+(Wl.tl+Wl.r2*Wl.run)*f;
    T.push({k:'wail',t0:t,tl:t+Wl.tl*f,ti:t1,real:true});
    T.push({k:'wail',ill:1,t0:t2,tl:t2+Wl.tl*f,ti:i2,real:true});t=i2-Wl.after*f});
  // a mirror of the hall explodes into n fragments: they fly (SP.mirror.fly), settle, then dart one after the other
  const scatter=scatterWay;
  // arrival order of the fragments at random (slot times in order, handed out to the fragments in a shuffled order)
  const shatter=(si,n,gaps,off,dn)=>{const M=SP.mirror,fd=M.fly*f,ord=[...Array(n).keys()].sort(()=>Math.random()-.5),sl=[];let s=t+fd+(off||0);
    for(let k=0;k<n;k++){if(k)s+=gaps();sl.push(s)}
    for(let k=0;k<n;k++){const a=sl[ord[k]];T.push({k:'shard',fly:1,dn:dn?1:0,si,fi:k,fn:n,fd,way:scatter(),tw:.42*f,t0:t,tl:a+.42*f,ti:a+.95*f})}
    return s};
  const rain=cast('rain',()=>{const G=RAIN[S.d.m<1?'hard':'normal'];const s=shatter(mirrorPick(1)[0],VX.rain[K],()=>G[0]+Math.random()*(G[1]-G[0]));t=s+1.3*f});
  // final assault, mirror dance: a volley goes through the mirrors (orbs leave by 1 mirror in Easy, 2 in Normal and Hard), then
  // each mirror explodes into its fragments; real and illusory orbs as in a volley, gaps by spaceImpacts
  const dance=cast('dance',()=>{const D=VX.dance,nm=D.mirrors[K],ms=mirrorPick(nm),n=D.n[K],ill=Math.min(D.ill[K],n-1),fake=new Set();
    while(fake.size<ill)fake.add(1+Math.floor(Math.random()*(n-1)));
    const ord=[...Array(n).keys()].sort(()=>Math.random()-.5);
    for(let i=0;i<n;i++)orb(!fake.has(i),0,ms[ord[i]%ms.length]);
    t+=SP.dance.settle*f;let end=t;
    ms.forEach((si,j)=>{end=Math.max(end,shatter(si,D.frag,()=>gap,j*gap,1))});t=end+1.3*f;
    const fx=T.find(x=>x.k==='shard'&&x.fly&&x.fi===0);if(fx)fx.rb=1});   // the first mirror to explode breaks one more mirror of the hall (roomBreak)
  // final assault: an extra clone, visible all along, fires real orbs without a warning (SP.rageEcho; none in Easy)
  const rageEcho=()=>{const R=SP.rageEcho,c=R[K];if(!c)return;for(let k=0;k<c.n;k++){const s=b+R.at[k%R.at.length],tl=s+R.tell*f;T.push({k:'orb',t0:s,tl,ti:tl+O.type.normal.fly*f,real:true,src:5,re:1})}};
  if(rage)echoR();
  else if(final){dance();rageEcho()}
  else{
    const p0=[volley,volley,wail,volley,()=>{wail();volley()},rain];
    const p1=[volley,volley,()=>{volley();wail()},()=>{rain();wail()},()=>{volley();rain()},()=>{wail();volley()},rain,()=>{rain();volley()}];
    pick(stage?p1:p0)();
    // the echo only comes during the rages, never in this rotation
  }
  // Hard: the permanent echo fires one orb after each spell, rages and final assault included
  if(K==='hard')spacePE(T,casts,f,gap);
  if(!rage&&!final)spaceReplies(T,casts,f,gap,stage,K);
  spaceImpacts(T,gap);
  // the spell the riposte shows: a wail, a rain of fragments, otherwise a volley (echo and dance included)
  T.spell=T.some(x=>x.k==='wail')?'wail':T.some(x=>x.k==='shard'&&x.fly&&!x.dn)?'rain':'volley';
  return T;
}
const isRealImpact=x=>x.k==='shard'||x.k==='wail'||x.k==='cwave'||x.k==='back'||(x.k==='orb'&&x.real);
const isImpact=x=>x.k==='shard'||x.k==='wail'||x.k==='cwave'||x.k==='back'||x.k==='orb';
/* pushes every impact back so that two real ones (and the first one after the previous pattern) are never closer than `gap` s;
   each real impact is noted by noteImpact (S.gapLog = gaps between consecutive real impacts, all sources, read by the ch2-bot run) */
function spaceImpacts(T,gap){
  T.sort((a,b)=>a.ti-b.ti);
  const win=voiceWin();   // illusions and returns: the same rule, with the dodge window (VOICE_FX.margin)
  let prevR=-99,prevA=-99,d=0;
  for(const x of S.threats)if(isImpact(x)&&x.ti!=null){prevA=Math.max(prevA,x.ti);if(isRealImpact(x))prevR=Math.max(prevR,x.ti)}
  for(const x of T){
    if(d){x.t0+=d;x.tl+=d;x.ti+=d}
    if(!isImpact(x))continue;
    const re=isRealImpact(x),e=Math.max(0,(re?gap-(x.ti-prevR):0),win-(x.ti-prevA));
    if(e>0){x.t0+=e;x.tl+=e;x.ti+=e;d+=e}
    prevA=x.ti;if(re){prevR=x.ti;noteImpact(x.ti)}}}
/* records a real impact time in sorted order and logs the gap to each neighbour (S.gapLog, one value per new adjacent pair) */
function noteImpact(ti){
  const L=S.impTi||(S.impTi=[]),G=S.gapLog||(S.gapLog=[]);
  let i=0;while(i<L.length&&L[i]<ti)i++;
  L.splice(i,0,ti);
  if(i>0)G.push(ti-L[i-1]);
  if(i<L.length-1)G.push(L[i+1]-ti)}
function spacePE(T,casts,f,gap){
  const reals=()=>T.filter(isRealImpact),P=VX.pe,O2=SP.orb;
  for(const c of casts){
    if(!c.ths.length)continue;   // every spell
    const wl=c.ths.some(x=>x.k==='wail'),Wl=SP.wail,voice=()=>T.filter(x=>x.k==='wail'&&!x.pe);
    // the orb of the echo and the clone's (which replays the last real orb of a volley) are of different types: normal, unless that is the clone's
    const lastO=c.ths.filter(x=>x.k==='orb'&&x.real&&x.ty).sort((a,b)=>a.t0-b.t0).pop(),rr=ECHO_REPLY.volley.hard,pty=lastO&&lastO.ty==='normal'?'slow':'normal';
    let t0=Math.max(...c.ths.map(x=>x.tl))+P.lag,th;
    for(let i=0;i<300;i++,t0+=.1){   // too close to a real impact or inside a wail of the Voice: shifted later, never dropped
      // after a wail the echo throws its own wail instead of its orb (same wave, from its hand); otherwise its orb
      th=wl?{k:'wail',pe:1,t0,tl:t0+Wl.tl*f,ti:t0+(Wl.tl+Wl.r1*Wl.run)*f,real:true}:{k:'orb',t0,tl:t0+O2.charge*f,ti:t0+O2.charge*f+O2.type[pty].fly*f,real:true,src:3,pe:1,ty:pty};
      if(!reals().some(r=>Math.abs(r.ti-th.ti)<gap)&&!voice().some(w=>th.tl<w.ti+P.wail&&th.ti>w.tl-P.wail))break}
    T.push(th);c.pe=th}}
/* the responding clone (ECHO_REPLY): after a spell that receives an answer, in Normal (after rage 1) and Hard (always), the clone answers
   0.7 to 1.0 s later: volley -> replays the last real orb from the other side of the face; wail -> a farther wail (wailEcho); rain -> a mirror
   fragment answers late. Real impacts: VX.gap from every other (Hard: from the echo's answer first, then the clone's), never inside a wail of
   the Voice; too close = shifted later, never dropped. */
function spaceReplies(T,casts,f,gap,stage,K){
  const R=ECHO_REPLY,P=VX.pe,O=SP.orb,Wl=SP.wail,reals=()=>T.filter(isRealImpact),voice=()=>T.filter(x=>x.k==='wail'&&!x.pe&&!x.rp);
  for(const c of casts){
    const cf=R[c.kind]&&R[c.kind][K];if(!cf||stage<cf.rage||!c.ths.length)continue;
    const dl=cf.delay[0]+Math.random()*(cf.delay[1]-cf.delay[0]),endTl=Math.max(...c.ths.map(x=>x.tl));let mk;
    if(c.kind==='volley'){const last=c.ths.filter(x=>x.k==='orb'&&x.real).sort((a,b)=>a.t0-b.t0).pop();if(!last)continue;
      mk=sh=>{const t0=endTl+dl+sh,tl=t0+O.charge*f;return{k:'orb',t0,tl,ti:tl+O.type[last.ty||'normal'].fly*f,real:true,src:4,rp:1,ty:last.ty}}}
    else if(c.kind==='wail')mk=sh=>{const t0=endTl+dl+sh;return{k:'wail',rp:1,t0,tl:t0+R.wail.tl*f,ti:t0+(R.wail.tl+R.wail.run)*f,real:true}};
    else if(c.kind==='rain'){const sh0=c.ths.find(x=>x.k==='shard'&&x.fly);if(!sh0)continue;const Z=R.rain,lastTi=Math.max(...c.ths.filter(x=>x.k==='shard').map(x=>x.ti));
      mk=sh=>{const ti=lastTi+dl+sh,tl=ti-Z.dart*f,a=tl-Z.tw*f,fd=Z.fly*f;return{k:'shard',fly:1,dn:0,rp:1,bk0:1,si:sh0.si,fi:0,fn:1,fd,way:scatterWay(),tw:Z.tw*f,t0:a-fd,tl,ti}}}
    else continue;
    let th;
    for(let i=0;i<300;i++){th=mk(i*.1);
      if(!reals().some(r=>Math.abs(r.ti-th.ti)<gap)&&!voice().some(w=>th.t0<w.ti+P.wail&&th.ti>w.t0-P.wail)&&(!c.pe||th.ti>=c.pe.ti+gap))break}
    T.push(th)}}/* a dodge aimed at a reflection: no extra recovery; the reflection turns round behind the Watcher, becomes solid and
   comes back as a real attack once he can dodge again (action + recovery + DG.backWin). Dodging a reflection is not a fault:
   the series stays clean unless the Watcher takes the returning blow (the 'hit' branches of update() set pat.ok=false) */
function fooled(th){th.done=true;th.res='fooled';th.okT=gt;S.foolT=gt;play('fool');say(_('You dodged a reflection.','Tu as esquivé un reflet.'));
  S.pl.fr=1;   // the recovery after this action is halved (plStep)
  S.dodgeFlash=gt;const c=PT(),nt={k:'back',t0:gt,tl:gt+VOICE_FX.ring.t,ti:gt+c.act+c.rec*DG.foolRec+DG.backWin,real:true,pat:th.pat};th.pat.ths.push(nt);S.threats.push(nt);
  // the returning reflection is a real impact like the others: never closer than VX.gap to one still to come (pushed back, never dropped)
  {const g=VX.gap[vdk()],w=voiceWin();for(let i=0;i<200&&S.threats.some(o=>o!==nt&&!o.done&&!o.hold&&o.ti!=null&&Math.abs(o.ti-nt.ti)<(o.real===false?w:g));i++)nt.ti+=.05}
  noteImpact(nt.ti);say(_('The reflection comes back.','Le reflet revient.'))}
/* a fragment of an exploding mirror: leaves the mirror, wanders (shrinking wobble) then settles at its own spot above it */
function fragPos(th,at){
  const m=shardPos(th.si),k=clamp((at-th.t0)/th.fd,0,1),hx=m.x+(th.fi-(th.fn-1)/2)*46,hy=m.y-34+(th.fi%2)*18,e=eout(k),w=60*(1-k)*Math.min(1,k*6);
  if(th.way){   // rain: thrown from the mirror to random spots of the hall (a burst, slowing, then a new direction), then home
    const Q=[m,...th.way,{x:hx,y:hy}],L=Q.length-1,u=Math.min(k*L,L-1e-6),i=Math.floor(u),q=eout(u-i),j=10*Math.min(1,k*6)*(1-k);
    return{x:lerp(Q[i].x,Q[i+1].x,q)+Math.sin(rt*9+th.fi*2.1)*j+(k>=1?Math.sin(rt*1.7+th.fi)*3:0),y:lerp(Q[i].y,Q[i+1].y,q)+Math.cos(rt*8+th.fi*1.3)*j*.8+(k>=1?Math.cos(rt*1.3+th.fi)*3:0)}}
  return{x:lerp(m.x,hx,e)+Math.sin(rt*6+th.fi*2.1)*w+(k>=1?Math.sin(rt*1.7+th.fi)*3:0),y:lerp(m.y,hy,e)+Math.cos(rt*5+th.fi*1.3)*w*.8+(k>=1?Math.cos(rt*1.3+th.fi)*3:0)}}
function shardPos(si){const s=SHARDS[si];return{x:s.x+Math.sin(rt*.4+s.o)*12,y:s.y+Math.cos(rt*.5+s.o)*8,s:s.s}}
/* where a wail comes from: the face (fx, fy) and the point where the tears fall into the water (x0, where the wave leaves) */
function wailSrc(th){const Z=SP.tear.fall;
  if(th.ill){const I=SP.wail.ill;return{fx:I.x,fy:I.y+Math.sin(rt*1.6)*8-96,x0:I.x+Z.ill,a:.6}}
  const i=th.rp?4:th.pe?3:0,p=voicePos(i);return{fx:p.x,fy:p.y-96,x0:p.x+Z[th.rp?'rp':th.pe?'pe':'voice'],a:i?.6:1}}
/* the tears of a wail (drawing only, same times as the cast): they are born at the eyes and the mouth, run down the face and the robe, drip,
   fall into the water at the fall point (x0); the wave leaves it at `tl` */
function drawTears(th){
  const Z=SP.tear,c=wailSrc(th),u=clamp((gt-th.t0)/(th.tl-th.t0),0,1);if(u<=0)return;
  const run=Z.run,k=clamp((u-run)/Z.drop,0,1),fadeIn=clamp(u/.08,0,1);   // k: the fall, in the share of the cast that follows the run
  ctx.save();ctx.globalAlpha*=c.a*fadeIn;ctx.lineCap='round';
  Z.src.forEach(([dx,dy],i)=>{
    const sx=c.fx+dx,sy=c.fy+dy,ex=c.fx+dx*1.5,ey=c.fy+34,hx=c.x0+(i-1)*5,hy=c.fy+112,s=clamp((u-i*.04)/run,0,1);
    // path: eye / mouth -> chin -> down the robe to where it drips (hx, hy)
    const pt=q=>q<.4?{x:lerp(sx,ex,q/.4),y:lerp(sy,ey,q/.4)}:{x:lerp(ex,hx,(q-.4)/.6),y:lerp(ey,hy,(q-.4)/.6)};
    ctx.strokeStyle='rgba(190,235,255,.8)';ctx.lineWidth=2;ctx.beginPath();const a0=Math.max(0,s-.5);
    for(let m=0;m<=8;m++){const q=lerp(a0,s,m/8),P=pt(q);m?ctx.lineTo(P.x,P.y):ctx.moveTo(P.x,P.y)}ctx.stroke();
    if(k<=0){ell(pt(s).x,pt(s).y,2.2,2.8,'rgba(220,245,255,.9)')}
    else{const dy2=ein(k)*(GY-hy),x=hx+(c.x0-hx)*k,y=hy+dy2;
      if(k<1){ell(x,y,2.2,3.6,'rgba(220,245,255,.9)')}
      else{const q=clamp((u-run-Z.drop)/.12,0,1);ctx.strokeStyle=`rgba(200,235,255,${.6*(1-q)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(c.x0+(i-1)*5,GY+4,4+14*q,1.5+4*q,0,0,Math.PI*2);ctx.stroke()}}});
  ctx.restore()}
function drawOrbs(){
  for(const th of S.threats){
    if(gt<th.t0)continue;
    if(th.k==='back'&&gt<th.tl){   // a dodged illusion is gone: a ring tightens on the point where it will land, the orb reappears when the ring ends
      const k=(gt-th.t0)/(th.tl-th.t0),R=VOICE_FX.ring,rx=HX+30,ry=HY;ctx.save();ctx.strokeStyle=`rgba(244,236,255,${.25+.65*k})`;ctx.lineWidth=2+2*k;
      ctx.beginPath();ctx.arc(rx,ry,R.r0*(1-k)+9,0,Math.PI*2);ctx.stroke();glow(rx,ry,24+18*k,'rgba(201,168,255,.9)',.3*k);ctx.restore();continue}
    if(th.k==='orb'||th.k==='back'){
      const back=th.k==='back',h=back?{x:HX-110,y:HY-56}:voiceHand(th.src,1),tx=HX+(back?30:14),ty=HY; // a returning reflection lands on the real hit point (HX+30, as HIT elsewhere), not on the Watcher's centre
      let x,y,r=17,a=1,p=0,dash=th.real?0:1;
      if(gt<th.tl){const k=(gt-th.t0)/(th.tl-th.t0);if(back){const e=eout(k);x=lerp(tx,h.x,e);y=lerp(ty,h.y,e)-Math.sin(Math.PI*k)*30;dash=1-k}else{x=h.x;y=h.y;r=5+12*k}}
      else{p=(gt-th.tl)/(th.ti-th.tl);
        if(th.done){if(th.res==='hit'||th.res==='pass'){if(gt-th.okT>.05)continue;p=1}else{a=Math.max(0,1-(gt-th.okT)/(th.res==='fooled'?VOICE_FX.ring.fade:.45))}}
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
      {const OT=SP.orb.type[th.ty||'normal'],ch=gt<th.tl;   // charge at the face: halo and crackling sparks of the type (flight: the usual violet)
        glow(x,y,r*50/17*(ch?OT.halo:1),ch?OT.col:'rgba(176,124,255,.95)',th.real?.85:.45);
        if(ch&&OT.spark){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=OT.col;ctx.lineWidth=1.4;ctx.beginPath();
          for(let k=0;k<OT.spark;k++){const a=gt*(9+k)+k*2.4,l0=r+3,l1=r+5+7*Math.abs(Math.sin(gt*23+k*5));ctx.moveTo(x+Math.cos(a)*l0,y+Math.sin(a)*l0);ctx.lineTo(x+Math.cos(a)*l1,y+Math.sin(a)*l1)}ctx.stroke();ctx.restore()}}
      if(th.real){ell(x,y,r,r,'#c9a8ff');ell(x,y,r*.5,r*.5,'#fbf6ff')}
      else{ctx.save();ctx.strokeStyle='#c9a8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.restore()}
      if(dash>0){ctx.save();ctx.globalAlpha*=dash;ctx.setLineDash([6,5]);ctx.lineDashOffset=-gt*12;ctx.strokeStyle='#f4ecff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r+3,0,Math.PI*2);ctx.stroke();ctx.restore()}
      ctx.restore();
    }else if(th.k==='shard'){
      if(th.fly){   // the mirror explodes (once), hidden from the hall until its fragments are gone
        (S.shardGone||(S.shardGone={}))[th.si]=Math.max(S.shardGone[th.si]||0,th.ti+1.2);
        if(!th.bk0){th.bk0=1;if(!th.fi){const m=shardPos(th.si);burst(m.x,m.y,22,'#ece4ff',6,.9,.2);burst(m.x,m.y,12,'#9a86c8',4,1,.3);MUSIC.fx('crackGlass');S.shake=Math.max(S.shake,7);if(th.rb)roomBreak()}}}
      const o=th.from!=null?{x:voicePos(th.from).x,y:voicePos(th.from).y-90,s:24}:th.fly?{...fragPos(th,Math.min(gt,th.t0+th.fd)),s:SP.mirror.size}:shardPos(th.si),tx=HX+16,ty=HY-10;let x,y,a=1,ang;
      if(gt<th.tl){const k=th.fly?clamp(1-(th.tl-gt)/th.tw,0,1):(gt-th.t0)/(th.tl-th.t0);x=o.x;y=o.y;ang=Math.atan2(ty-y,tx-x);glow(x,y,30*SP.mirror.draw,'rgba(220,200,255,.9)',.8*k)}
      else{let p=(gt-th.tl)/(th.ti-th.tl);if(th.done){if(th.res==='hit'){if(gt-th.okT>.05)continue;p=1}else{a=Math.max(0,1-(gt-th.okT)/.3);if(!th.sf){th.sf=1;burst(tx+30,ty-20,10,'#f2ecff',5,.4)}}}
        p=Math.min(p,1);x=lerp(o.x,tx,ein(p));y=lerp(o.y,ty,ein(p));ang=Math.atan2(ty-o.y,tx-o.x)}
      if(a<=0)continue;
      ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.rotate(ang+Math.PI/2);const s=o.s*.8*SP.mirror.draw;
      const gr=ctx.createLinearGradient(0,-s,0,s);gr.addColorStop(0,'rgba(245,240,255,.95)');gr.addColorStop(1,'rgba(150,120,210,.7)');ctx.fillStyle=gr;
      ctx.beginPath();ctx.moveTo(0,-s*1.2);ctx.lineTo(s*.45,s*.4);ctx.lineTo(0,s*.9);ctx.lineTo(-s*.45,s*.4);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
    }else if(th.k==='cwave'){
      drawEchoFinish(th)
    }else if(th.k==='wail'&&gt<th.tl){
      drawTears(th)   // tears born at the face run down and fall into the water; the wave leaves the fall point (drawing only)
    }else if(th.k==='wail'&&gt>=th.tl){
      let p=(gt-th.tl)/(th.ti-th.tl),a=1;if(th.done){if(th.res==='hit')continue;a=Math.max(0,1-(gt-th.okT)/.4)}
      // the wave runs from its source to the body: at ti (p=1) its leading edge touches the Watcher (reach px from HX, as the returning reflection)
      const Wl=SP.wail,sc=wailSrc(th),x0=sc.x0,xe=th.ill?HX-Wl.reach-Wl.edge:HX+Wl.reach+Wl.edge;
      if(gt-th.tl<.5){const q=(gt-th.tl)/.5;ctx.save();ctx.strokeStyle=`rgba(200,160,255,${.6*(1-q)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x0,GY+4,8+30*q,2+6*q,0,0,Math.PI*2);ctx.stroke();ctx.restore()}   // the ripple of the fall
      const x=lerp(x0,xe,Math.min(p,1.25));ctx.save();ctx.globalAlpha=a;
      if(th.ill){ctx.translate(x,0);ctx.scale(-1,1)}else ctx.translate(x,0);   // the Illusion's wave goes the other way
      for(let i=0;i<4;i++){ctx.strokeStyle=`rgba(200,160,255,${.75-i*.17})`;ctx.lineWidth=5-i;ctx.beginPath();ctx.ellipse(i*16,GY-90,22+i*4,110,0,Math.PI*.55,Math.PI*1.45);ctx.stroke()}
      ctx.restore();
    }
  }
  if(S.dodgeFlash!=null){const q=(gt-S.dodgeFlash)/VOICE_FX.flash.t;   // flash on the Watcher at every successful dodge
    if(q>=0&&q<1){ctx.save();ctx.globalCompositeOperation='lighter';glow(HX+10,HY-10,VOICE_FX.flash.r,'rgba(190,255,245,.95)',.75*(1-q));ctx.restore()}}
}
/* a small hooded echo (the finish of the Echoes rage), s = scale */
function echoWisp(x,y,a,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha*=a;glow(0,0,34,'rgba(190,150,255,.9)',.45);
  ctx.fillStyle='rgba(18,12,30,.92)';ctx.beginPath();ctx.moveTo(-11,13);ctx.quadraticCurveTo(-14,-14,0,-26);ctx.quadraticCurveTo(14,-14,11,13);ctx.quadraticCurveTo(0,19,-11,13);ctx.fill();
  ctx.strokeStyle='rgba(200,160,255,.55)';ctx.lineWidth=1.3;ctx.stroke();ell(0,-6,5,6.5,'#8a80a8');ctx.restore()}
/* the finish of the Echoes rage (th = cwave): the echoes take place on a circle round the Watcher, converge in a single wave; a dodge dissolves it (flash + wave) */
function drawEchoFinish(th){
  const Z=VOICE_FX.finish,cx=HX+10,cy=HY-10;
  if(th.done){
    if(th.res!=='ok')return;
    const q=(gt-th.okT)/Z.dis;if(q>=1)return;
    if(!th.sf){th.sf=1;burst(cx,cy,16,'#ece4ff',6,.5);MUSIC.fx('glints')}
    ctx.save();ctx.globalCompositeOperation='lighter';glow(cx,cy,110,'rgba(230,220,255,.95)',.8*(1-q));
    ctx.strokeStyle=`rgba(236,228,255,${.85*(1-q)})`;ctx.lineWidth=5*(1-q)+1;ctx.beginPath();ctx.ellipse(cx,cy,30+280*eout(q),(30+280*eout(q))*.55,0,0,Math.PI*2);ctx.stroke();ctx.restore();return}
  const form=clamp((gt-th.t0)/(th.tl-th.t0),0,1),conv=clamp((gt-th.tl)/(th.ti-th.tl),0,1);
  if(form>=1&&!th.sf0){th.sf0=1;MUSIC.fx('echoArrive')}
  const crowns=th.dbl?[{r:1,off:0,d:1},{r:Z.rIn,off:.5,d:-1}]:[{r:1,off:0,d:1}];
  ctx.save();
  for(const C of crowns){const R=lerp(Z.r0*C.r,22,ein(conv));
    for(let i=0;i<Z.n;i++){const a=(i+C.off)*Math.PI*2/Z.n+C.d*rt*.5*(1+conv*2),ex=cx+Math.cos(a)*R,ey=cy+Math.sin(a)*R*.55,o=voicePos(1+i%2);
      const x=lerp(o.x,ex,eout(form)),y=lerp(o.y-60,ey,eout(form));echoWisp(x,y,.35+.55*form,.55+.25*Math.sin(a)*.3)}
    if(form>=1){ctx.strokeStyle=`rgba(220,200,255,${.2+.5*conv})`;ctx.lineWidth=2+3*conv;ctx.beginPath();ctx.ellipse(cx,cy,R,R*.55,0,0,Math.PI*2);ctx.stroke()}}
  if(conv>0)glow(cx,cy,40+70*conv,'rgba(220,200,255,.9)',.5*conv);
  ctx.restore()}
/* ---- Phase II · the Rust Elder ---- */
function P1(stage,f,b,final,rage){
  const T=[],K=vdk();let t=b,sp='',gi=0;
  // every spell is a group (g): its inside rhythm is kept, the floor applies between groups (see `space` below)
  const G=fn=>(...a)=>{const n=T.length,g=gi++;fn(...a);for(let i=n;i<T.length;i++)T[i].g=T[i].g==null?g:T[i].g};
  if(K==='hard'&&S.lastCombo)t+=SP.rest.hard;   // not two combos in a row without a pause
  // harpoon: pierces the Watcher (block), sticks in the wood behind him, then is recalled tearing out a plank: two blocks, upper then lower
  const harpoon=G(()=>{const H=SP.harpoon,ti=t+H.fly*f,rc=ti+H.stick*f,p1=rc+H.pl1*f,p2=p1+H.gap*f,ret=p2+H.back*f,hp={k:'hpOut',t0:t,ti,rc,p1,p2,tb:ret,ret};
    T.push(hp);T.push({k:'plank',n:1,t0:rc,ti:p1,hp});T.push({k:'plank',n:2,t0:rc,ti:p2,hp});t=ret+H.after*f;sp='harpoon'});
  // the water wave: he lifts his foot, the shock wave grows towards the Watcher (block); `anchor` = struck by the anchor (Hard sweep): no beam
  const wave=(big,anchor)=>{const ti=t+SP.wave.hit*f;T.push({k:'wave',t0:t,tl:t+SP.wave.land*f,ti,big:!!big,anchor:anchor?1:0});
    if(anchor)T.push({k:'slam',t0:t,ti:t+SP.wave.land*f,real:false,done:true});return ti};   // (the slam is only the anchor's picture)
  // the vibrations drop a plank on the Watcher: two blocks
  const rafter=ti=>{T.push({k:'rafter',n:1,t0:ti,ti:ti+SP.wave.fall1*f});T.push({k:'rafter',n:2,t0:ti+.2*f,ti:ti+SP.wave.fall2*f});t=ti+SP.wave.after*f};
  const surge=G(()=>{rafter(wave());sp='wave'});
  // the anchor combo: 2 / 3 / 4 linked strikes (impacts every SP.sweep.d[..]); in Hard the 4th smashes the ground: a water wave, part of the series
  const sweep=G(()=>{const Z=SP.sweep,D=Z.d[K],n=D.length+1,hw=K==='hard',m=f,tis=[t+Z.ts*f];D.forEach(d=>tis.push(tis[tis.length-1]+d*m));
    const cb={t0:t,tis,types:tis.map((x,i)=>hw&&i===n-1?'plant':i%2===0?'slam':'sweep'),lg:[false,...D.map(d=>d>=Z.long)],end:tis[n-1]+.95},t0=t;
    for(let i=0;i<n;i++){
      if(hw&&i===n-1){t=tis[i]-SP.wave.land*f;const n0=T.length,ti=wave(false,true);T.slice(n0).forEach(x=>x.cb=cb);t=ti+Z.after*f}
      else T.push({k:'sweep',t0:i?tis[i-1]:t0,ti:tis[i],cb})}
    if(!hw)t=tis[n-1]+Z.after*f;sp='sweep'});
  // rage 2 (Hard), double wave: foot 1 -> wave + plank, foot 2 -> wave + plank, then a harpoon (counted in the series, no counter of its own)
  const wv=G(big=>rafter(wave(big))),dwave=()=>{wv();wv(true);harpoon();sp='dwave'};
  // rage 1, rust cloud: he strikes the hull, the cloud grows and stays until the ship collapses; then a sweep. A cloud already there is kept
  const rust=()=>{const R=SP.rust;if(S.rust)t+=R.pause*f;else{const st=t+R.strike*f,tc=st+R.grow*f;S.rust={t0:t,st,tc,end:Infinity};t=tc+R.pause*f}sweep();sp='rust'};
  // final assault, glas: the head bell rings, echoes cross the ship towards the Watcher (each one blocked is sent back at the Elder)
  const glas=G(()=>{const Q=SP.glas,id=S.glasId=(S.glasId||0)+1,tw0=t+Q.bell*f;let e=t;
    for(let i=0;i<Q.n;i++){const tw=tw0+i*Q.gap*f,ti=tw+Q.hit*f;T.push({k:'toll',t0:t,tw,ti,gid:id});e=ti}t=e+Q.after*f});
  // between two glas, a piece of the scenery falls: a plank (2 blocks) or a chain (1 block); a block, no counter
  const decor=G(()=>{if(Math.random()<.5)rafter(t);else{T.push({k:'dchain',t0:t,ti:t+SP.glas.chain*f});t+=(SP.glas.chain+SP.glas.after)*f}});
  // the floor: the first real impact of each group is at least SP.floor after the last one of the previous groups (whole group pushed back)
  const fin=()=>{const fl=SP.floor[K],real=x=>x.real!==false&&x.ti!=null,seen=new Set();let prev=-99;
    for(const x of S.threats)if(real(x)&&!x.done)prev=Math.max(prev,x.ti);
    for(let g=0;g<gi;g++){const it=T.filter(x=>x.g===g);if(!it.length)continue;const re=it.filter(real);if(!re.length)continue;
      const first=Math.min(...re.map(x=>x.ti)),e=Math.max(0,prev+fl-first);
      if(e>0){for(const x of it){for(const k of['t0','tl','ti','tw','tb','rc','p1','p2','ret'])if(typeof x[k]==='number')x[k]+=e;
        if(x.cb&&!seen.has(x.cb)){seen.add(x.cb);x.cb.t0+=e;x.cb.end+=e;x.cb.tis=x.cb.tis.map(v=>v+e)}}}
      prev=Math.max(prev,...re.map(x=>x.ti))}
    S.lastCombo=gi>1&&!final&&!rage;T.spell=sp;return T};
  if(rage){(rage>1?dwave:rust)();return fin()}
  if(final){const left=Math.max(1,SP.glas.need[K]-(S.glasN||0));for(let i=0;i<left;i++){if((S.glasN||0)+i>0)decor();glas()}sp='glas';return fin()}
  // one counter per series: Easy = one spell per series; Normal = 3 single spells and 3 combos, then only combos after the rage; Hard = combos of 2 spells, of 3 after the second rage
  const one=[harpoon,sweep,surge],duo=[()=>{harpoon();sweep()},()=>{sweep();surge()},()=>{surge();harpoon()}],trio=[()=>{sweep();surge();harpoon()},()=>{surge();sweep();harpoon()},()=>{harpoon();surge();sweep()}];
  const p0=K==='easy'?one:K==='hard'?duo:[...one,...duo],p1=K==='easy'?one:K==='hard'?((S.rageN||0)>=2?trio:duo):[...duo,trio[0]];
  pick(stage?p1:p0)();return fin();
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
const SWP={slam:{mid:{a:-1.3,c:-1.3,l:-30},hit:{a:-3.5,c:-3.5,l:-175}},
  plant:{mid:{a:-1.3,c:-1.3,l:-30},hit:{a:-1.7,c:-4.71,l:-130}},   // Hard, last strike: planted upright in front of him (sets off the wave, does not hit the Watcher)
  sweep:{mid:{a:.1,c:.1,l:20},hit:{a:2.7,c:2.7,l:-165}}};
const comboAct=()=>{for(const t of S.threats)if(t.cb&&gt>=t.cb.t0&&gt<=t.cb.end)return t.cb;return null};
function comboPose(r,cb){
  const L=cb.tis,n=L.length;r.onBack=false;
  if(gt>=L[n-1]){   // follow-through, then the anchor goes back to his back (as the single strikes did)
    const af=gt-L[n-1],slam=cb.types[n-1]!=='sweep',Q=SWP[cb.types[n-1]].hit,hold=.22,ret=.5,e=eio(clamp((af-hold)/ret,0,1));
    if(af>hold+ret){r.onBack=true;r.armA=lerp(ARM_BACK,ARM_REST,clamp((af-hold-ret)/.2,0,1));return}
    if(slam){r.armA=lerp(Q.a,ARM_BACK,e);r.clap=lerp(Q.c,BACK_DIR-TWO_PI,e);r.lunge=lerp(Q.l,0,e)}
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
        if(!th.wf&&q>=.62){th.wf=1;S.shake=Math.max(S.shake,13);MUSIC.fx('rumble');for(let i=0;i<14;i++)addPart({x:Math.random()*W,y:-4,vx:(Math.random()-.5)*.25,vy:.3,g:.28,t0:gt,life:1.6,c:'#7a6a56',r:2})}
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
  // nails stick out of the ceiling plank too (towards the Watcher), lit before the swing (1) then before the fall (2)
  {const N=HARPOON_FX.nail,sh=r1&&!r1.done?r1:r2&&!r2.done?r2:null,lit=!!sh&&gt>=sh.ti-N.lead;
    for(const t of N.rafter)drawNail(A.x+dx*t,A.y+dy*t+8,N.rdir.x,N.rdir.y,lit,sh?sh.ti:0,1)}
  ctx.restore()}
/* a rusty nail sticking out of a board, from its base (bx, by) along the unit direction (dx, dy); it glows just before the shock at `ti` (HARPOON_FX.nail) */
function drawNail(bx,by,dx,dy,lit,ti,al){const N=HARPOON_FX.nail,tx=bx+dx*N.len,ty=by+dy*N.len;
  ctx.save();ctx.globalAlpha*=al;ctx.lineCap='round';
  if(lit)glow(tx,ty,N.glow,'rgba(255,214,150,.95)',.4+.5*clamp((gt-(ti-N.lead))/N.lead,0,1));
  ctx.strokeStyle='#120c08';ctx.lineWidth=N.r+3;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(tx,ty);ctx.stroke();
  ctx.strokeStyle=lit?'#ffcf86':'#7a3d1c';ctx.lineWidth=N.r;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(tx,ty);ctx.stroke();
  ctx.strokeStyle=lit?'#fff3d0':'#a85c2c';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(bx,by-1);ctx.lineTo(tx,ty-1);ctx.stroke();
  ell(bx,by,N.r+2,N.r+2,'#2b1a10');ctx.restore()}
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
    // two rusty nails stick out of the plank, pointing at the Watcher (they are why it wounds); each lights up just before its shock (first the upper one, then the lower one)
    for(const th of pk){const N=HARPOON_FX.nail,u=(th.n===1?1:-1)*N.off*P.len;
      if(th.done&&gt-th.okT>.25&&gt>hp.p2)continue;
      drawNail(q.x+c*u,q.y+sn*u+dy,N.dir.x,N.dir.y,!th.done&&gt>=th.ti-N.lead,th.ti,al)}
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
  if(sp==='rust'){const l=Math.sin(Math.PI*clamp((k-.05)/.8,0,1)),fl=k>.08?clamp(1-(k-.08)/.15,0,1):0;if(fl>0){const g=ctx.createRadialGradient(HX,GY-90,0,HX,GY-90,RUST_HALO);for(let i=0;i<=10;i++)g.addColorStop(i/10,`rgba(255,248,220,${.55*fl*(1-halo(i/10))})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}   // the flash, as a halo
    glow(A.x,A.y,150,'rgba(255,244,200,.9)',.55*l);glow(A.x,A.y,60,'rgba(150,255,235,.9)',.6*l)}
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
  if(sp==='rust'&&k>=.08&&S.rust&&S.rust.clr==null)S.rust.clr=gt;   // the flash: his half stays clear from now on
  if(sp==='dwave'&&k>=.2&&!c.s2){c.s2=1;MUSIC.fx('plant')}
  if(k>=.42&&!c.s3){c.s3=1;const e=sp==='wave'||sp==='dwave'?[640,GY]:[700,GY-150];burst(e[0],e[1],12,'#e6f8f2',5,.5,.3)}}
/* the rust cloud (rage 1): red dust over the hold until the ship collapses. It hides the scenery and the Elder himself, never the
   block signal: the attacks are drawn over it, and it thins out around the Watcher (clear round him during the rage-1 counter) */
const RUSTP=(()=>{const R=mulberry(57);return[...Array(26)].map(()=>({x:R()*W,y:R()*GY,r:60+R()*90,v:(R()-.5)*14,o:R()*6}))})();
/* how far the Watcher's half of the screen is cleared (0..1): from the flash of the rage-1 counter on, for good (until the ship collapses) */
const rustClear=()=>S.rust&&S.rust.clr!=null?eio(clamp((gt-S.rust.clr)/.35,0,1)):0;
function drawRust(){const R=S.rust;if(!R||gt<R.t0)return;
  if(gt>=R.st&&!R.sf){R.sf=1;S.shake=Math.max(S.shake,14);MUSIC.fx('rumble');MUSIC.fx('chainSlip')}   // the hull is struck
  const a=clamp((gt-R.st)/(R.tc-R.st),0,1),front=lerp(-40,H+60,eout(clamp((gt-R.st)/(R.tc-R.st+.5),0,1)));
  // counter of rage 1: the staff raised, the cloud thins out round the Watcher only (and comes back)
  const cl=rustClear(),
        near=(x,y)=>1-cl*(1-halo(Math.hypot(x-HX,y-(GY-90))/RUST_HALO));   // the cleared halo round the Watcher (soft edge)
  ctx.save();
  if(gt>=R.st&&gt<R.tc+.8){const am=7*Math.max(0,1-(gt-R.st)/(R.tc-R.st+.8));for(const x of[120,330,540,830])chainLinks(x,-10,x+Math.sin(gt*37+x)*am,150+(x%3)*40,0,'#4a2a18')}   // the chains tremble
  for(let x=0;x<W;x+=40){const k=near(x+20,GY-90),g=ctx.createLinearGradient(0,front-160,0,front);g.addColorStop(0,`rgba(110,40,18,${.62*a*k})`);g.addColorStop(1,'rgba(110,40,18,0)');ctx.fillStyle=g;ctx.fillRect(x,0,40,front)}
  for(const p of RUSTP){const x=(p.x+gt*p.v+W)%W,k=clamp((front-p.y)/90,0,1)*near(x,p.y);const rg=ctx.createRadialGradient(x,p.y,4,x,p.y,p.r);rg.addColorStop(0,`rgba(150,62,28,${.45*a*k})`);rg.addColorStop(1,'rgba(120,45,20,0)');ctx.fillStyle=rg;ctx.fillRect(x-p.r,p.y-p.r,p.r*2,p.r*2)}
  {const g=ctx.createRadialGradient(700,GY-150,20,700,GY-150,240);g.addColorStop(0,`rgba(96,36,16,${.55*a})`);g.addColorStop(1,'rgba(96,36,16,0)');ctx.fillStyle=g;ctx.fillRect(440,GY-400,520,420)}   // the Elder himself hardly shows in it
  for(let i=0;i<40;i++){const x=(i*97+gt*20)%W,y=(i*53+gt*40)%Math.max(front,1);ctx.fillStyle=`rgba(200,110,60,${.5*a*near(x,y)})`;ctx.fillRect(x,y,1.6,1.6)}
  ctx.restore()}
/* the same cloud over the Watcher too (called after him): he is covered like the rest. Only the rage-1 counter reveals a halo of light round him
   (a flash, then a soft-edged clear zone, `RUST_HALO`) which stays; the Elder stays in the rust until the ship collapses */
function drawRustHaze(){const R=S.rust;if(!R||gt<R.st)return;
  const a=clamp((gt-R.st)/(R.tc-R.st),0,1),cl=rustClear(),b=RUST_HAZE*a;
  const g=ctx.createRadialGradient(HX,GY-90,0,HX,GY-90,RUST_HALO);for(let i=0;i<=10;i++)g.addColorStop(i/10,`rgba(120,46,22,${b*(1-cl*(1-halo(i/10)))})`);
  ctx.save();ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}
const RUST_HAZE=.5,RUST_HALO=430;   // RUST_HALO = radius (px) of the halo of light round the Watcher after the rage-1 counter (provisional)
const halo=u=>{u=clamp((u-.25)/.75,0,1);return u*u*(3-2*u)};   // 0 in the core, 1 outside, smooth   // opacity of the veil over everything once the cloud is full (provisional)
/* ---- Phase III · Form I: the tower's tentacles and torn pieces ---- */
function P3(stage,f,b,final,rage){
  const T=[],BF=BEACON_FX,Q=PD(),TL=Q.tell;let t=b,sp='',side=0,cri=null;   // TL: x on the warning times (PHARE_DIFF)
  const R=88;
  // sweep (hold): lamp dark, thin cone, sweep; B = the timings (BEACON_FX.beam, or the short beam of the Morse rage)
  const beamAt=(dir,B)=>{const ts=t+(B.dark+B.cone)*TL*f,D=B.D*f;let s0,s1;if(dir<0){s0=(940-HX-R)/1000;s1=(940-HX+R)/1000}else{s0=(HX-R+60)/1000;s1=(HX+R+60)/1000}
    T.push({k:'beam',t0:t,dark:B.dark*TL*f,ts,D,dir,ta:ts+D*s0,tb:ts+D*s1,real:true,hold:true});t=ts+D+B.after*f;sp='beam';side=dir<0?1:0};
  const sweep=dir=>beamAt(dir,BF.beam);
  // bolt (tap): one lamp at a time, left then right; `tell` s of crackling round it
  const bolt=(tell,night)=>{const Z=BF.bolt;tell=tell==null?Z.tell*TL:tell;side=S.boltSide=1-(S.boltSide==null?1:S.boltSide);
    T.push({k:'bolt',t0:t,tell:tell*f,ti:t+(tell+Z.fly)*f,real:true,seed:Math.random(),side,night:night?1:0});t+=Z.gap*f;sp='bolt'};
  // reef spikes (tap): swirl, then three spikes "tap... tap-tap"
  const spike=()=>{const Z=BF.spike,seq=Q.spike,tl=Z.tell*TL*f,ti0=t+tl;seq.forEach(o=>{const ti=ti0+o*f;T.push({k:'spike',t0:ti-tl,ti,real:true,seed:Math.random()})});t=ti0+seq[seq.length-1]*f+Z.after*f;sp='spike'};
  const whip=()=>{T.push({k:'whip',t0:t,ti:t+.9*TL*f,side:Math.random()<.5?-1:1});t+=(.3+.9*TL)*f;sp='whip'};
  // pieces of the tower (tap): the tentacle coils, the stone cracks and throws dust, salvo of 2-3
  const chunk=()=>{const Z=BF.chunk,n=Q.salvo[0]+Math.floor(Math.random()*(Q.salvo[1]-Q.salvo[0]+1));
    for(let i=0;i<n;i++){const s=t+i*Z.gap*f;cri=RINGS[Math.floor(Math.random()*6)];T.push({k:'chunk',t0:s,tl:s+Z.dust*TL*f,ti:s+(Z.dust*TL+Z.fly)*f,ri:cri})}
    t+=((n-1)*Z.gap+Z.dust*TL+Z.fly+.25)*f;sp='chunk'};
  // the King's wave (hold), crossing the reef like the beam
  const kwave=()=>{const K=SP.kwave,ts=t+K.ts*TL*f,D=K.D*f,th={k:'kwave',t0:t,ts,D,dir:-1,ta:ts+D*(940-HX-R)/1000,tb:ts+D*(940-HX+R)/1000,real:true,hold:true};T.push(th);t=ts+D+K.after*f;sp='kwave';return th};
  // rage, the rising tide: the wave (hold), then reef spikes rise in its wake as it ebbs (taps) (kept in the rotation)
  const tide=()=>{const w=kwave(),e=w.ts+w.D,P=SP.tide;T.push({k:'spike',t0:e,ti:e+P.spike1*f,real:true,seed:Math.random(),tide:1});T.push({k:'spike',t0:e+P.gap*f,ti:e+P.spike2*f,real:true,seed:Math.random(),tide:1});t=e+P.spike2*f+P.after*f;sp='tide'};
  // rage 1, Night of the Lighthouse: lamps out, each lights `lit` s before it fires, bolts in a chain (taps)
  const night=()=>{const Z=BF.night;for(let i=0;i<Q.night.n;i++)bolt(Q.night.lit,true);t+=.4*f};
  // rage 2 (Hard), Morse: long (short beam, hold) - short - short (bolt, tap), each signal announced by its own shape
  const morse=()=>{const M=BF.morse;for(let r=0;r<M.reps;r++)for(const g of M.seq){if(g==='L')beamAt(r%2?1:-1,M.long);else{bolt();t-=(BF.bolt.gap-M.gap)*f}}};
  const p0=[bolt,()=>sweep(-1),()=>{spike();bolt()},()=>{sweep(-1);bolt()},()=>{bolt();spike()},whip,chunk,()=>{whip();bolt()},kwave];
  const p1=[()=>{bolt();spike();bolt()},()=>{sweep(-1);sweep(1)},()=>{sweep(-1);t-=.15*f;spike()},()=>{spike();sweep(1);bolt()},()=>{bolt();bolt();sweep(-1)},()=>{whip();whip();chunk()},()=>{sweep(-1);chunk()},tide,()=>{kwave();bolt()}];
  // final rage of Part 1, Dazzle (code name): n sweeps (hold) that the Watcher absorbs; the counter sends the light back at the central lighthouse (counter3)
  const dazzle=()=>{const Z=BF.dazzle;for(let i=0;i<Z.n;i++)beamAt(i%2?1:-1,Z);sp='dazzle'};
  if(final)dazzle();
  else if(rage){(rage>1?morse:night)()}
  else if(LEARN_FIRST()){S.learn.first=true;sweep(-1)}   // learning the hold (BEACON_LEARN): the first spell of the fight is always the beam, no draw
  else pick(stage?p1:p0)();
  T.spell=sp;T.side=side;T.ri=cri;return T;
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

