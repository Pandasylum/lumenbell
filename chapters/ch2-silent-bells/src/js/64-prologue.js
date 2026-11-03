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
  end:()=>_('The ship collapses around the Elder. The moon gleams on his armor, but nothing answers his light.',"Le navire s'effondre autour de l'Ancien. La lune se reflète sur son armure, mais rien ne répond à sa lumière."),
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
const rageMarks=()=>LB.hud.marks(S.d.u,S.phase!==3||S.form===2?RAGE.finalHp:null);   // form I of phase III has no final assault
function rageBanner(){
  if(S.phase===2)banner(_('Echoes','Échos'),_('Three voices, one real. Only real orbs cast a shadow; the reflections shatter one by one.','Trois voix, une seule vraie. Seules les vraies orbes ont une ombre ; les reflets se brisent un à un.'));
  else if(S.phase===1){banner(_('Blue heart','Cœur bleu'),_('The Bottomless takes control: every attack calls a toll.','La Sans-Fond prend le contrôle : chaque attaque appelle un glas.'));MUSIC.fx('heart')}
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
   wave  (II): stomp lands at `land`, the wave reaches the Watcher at `hit` (= old stomp), the beam falls twice,
               `fall1` / `fall2` after the wave (= old stones .8 / 1.15), next attack `after` later (= old stomp 1.6);
   dwave (II, rage): second, bigger wave `gap` after the first (chain spacing .4 + margin); the beam falls after it;
   rust  (II, rage): the King shakes his bell for `cloud` (cloud descends), then advances: block at contact `hit` later
               (anchor swing, lunge x `ls`); the cloud clears `fade` after the contact; next attack `after` later;
   kwave (III, form I): the King's wave crosses the reef like the beam (= sweep: `ts` .95, `D` 1.6, `after` .35); hold;
   tide  (III, form I, rage): the wave, then as it ebbs two reef spikes (taps) `spike1` / `spike2` after it (= spike .8,
               second +.35), `gap` between their tells, next attack `after` later (= spike 1.15);
   storm (III, form II, rage): `n` rings fired in turn from the two side lanterns, every `gap` (= ring .34), each `tl` /
               `ti` (= ring .5 / .95); then the trap bell, `trapGap` later: hovers until `trapTl`, presses from `trapTa` to
               `trapTb` (hold; = trap .75 / 1.3, +.5 held), next attack `after` later;
   echo  (I, rage): after the three orbs of the echo, the two reflections shatter `break1` / `break2` after the last orb,
               each sending a shard (= shard rain .42 / .95). */
const SP={
  wave:{land:.55,hit:1.05,fall1:.8,fall2:1.15,after:1.6},
  dwave:{gap:.55},
  rust:{cloud:.6,hit:1.55,ls:1.6,fade:2.2,after:1.4},
  kwave:{ts:.95,D:1.6,after:.35},
  tide:{spike1:.8,spike2:1.15,gap:.35,after:1.15},
  storm:{n:5,gap:.34,tl:.5,ti:.95,trapGap:.4,trapTl:.75,trapTa:1.3,trapTb:1.8,after:.7},
  echo:{break1:.2,break2:.65,tl:.42,ti:.95}
};
function spawn(){
  const d=S.d,id=S.phase,f2=id===3&&S.form===2,gen=f2?P3b:[P1,P2,P3][id-1];
  const n=d.u.filter(x=>S.bossHp<=x).length;
  /* as in Ember Bridge (a fury restarts while the Colossus's HP are still at its threshold): a rage or final assault whose counter
     failed (HP not lower than when the roar began) starts again; the counter that lowers the HP closes it */
  if(!S.rageNext){
    if(S.rageHp0!=null){if(S.bossHp>=S.rageHp0&&S.rageN>0)S.rageN--;S.rageHp0=null}
    if(S.finalDone&&S.bossHp>0)S.finalDone=false;
  }
  if(n>S.rageN&&!(S.bossHp<=FINAL_AT&&(id!==3||f2))){S.rageN=n;S.rageHp0=S.bossHp;S.angerShown=true;S.roarT=gt;S.roarD=n>1?RAGE.dur2:RAGE.dur;S.nextAt=gt+S.roarD;S.shake=10;rageBanner();S.rageNext=n;return}
  const stage=S.rageN?1:0,f=1/(d.sp*(1+.1*stage));
  if(S.rageNext&&!S.finalDone){const r=S.rageNext;S.rageNext=0;sched(gen(stage,f,gt+.25,false,r));return}
  if(!S.finalDone&&S.bossHp<=FINAL_AT&&(id!==3||f2)){
    S.finalDone=true;S.angerShown=true;S.roarT=gt;S.roarD=RAGE.dur2;S.shake=10;
    banner(_('Final assault','Dernier assaut'),[null,_('Funeral toll','Glas funèbre'),_('Chorus of reflections','Chœur des reflets'),_('Implosion','Implosion')][id]);
    sched(gen(1,f,gt+1.6,true));return}
  sched(gen(stage,f,gt+.25));
}
/* ---- Phase I · the Hollow Voice (decision docs/decisions/2026-11-03-ch2-voix-creuse.md) ---- */
/* numbers per difficulty (easy / normal / hard): vol = orbs of a volley [min, max] (each pattern's count is clamped into it);
   rain = shards of a shard rain; echo = orbs, then shards, of each reflection in the Echoes (rages); last = shards of each
   reflection of the last Echo (final assault) when it shatters; twin = Hard's permanent echo beside the Voice: it copies
   every spell of the Voice (same draw, real or illusory) `dt` s later (not scaled by f); wail: the cry bounces on the screen
   edge `edge` and comes back towards its caster (second dodge, same speed); field = margin keeping every orb, shard and cry
   inside the visible field; ray = how long before a reflection shatters the Watcher's ray strikes it (s) */
const VOICE={vol:{easy:[2,3],normal:[3,5],hard:[3,5]},rain:{easy:2,normal:3,hard:3},echo:{easy:1,normal:2,hard:2},
  last:{easy:1,normal:2,hard:2},twin:{dt:.45},wail:{edge:24,mouth:85},field:24,ray:.28};
const voiceDk=()=>S.dk==='easy'?'easy':S.d.u.length>1?'hard':'normal';
const fieldX=x=>clamp(x,VOICE.field,W-VOICE.field), fieldY=y=>clamp(y,VOICE.field,GY);
function P2(stage,f,b,final,rage){
  const T=[],dk=voiceDk();let t=b,hitT=b;
  const orb=(real,src)=>{T.push({k:'orb',t0:t,tl:t+.45*f,ti:t+1.3*f,real,src:src||0});hitT=Math.max(hitT,t+1.3*f);t+=.44*f};
  const volley=(n,ill,src)=>{const V=VOICE.vol[dk];n=clamp(n,V[0],V[1]);ill=Math.min(ill,n-1);const fake=new Set();while(fake.size<ill){const i=1+Math.floor(Math.random()*(n-1));fake.add(i)}for(let i=0;i<n;i++)orb(!fake.has(i),src);t+=.9*f;S.cv='volley'};
  // the cry leaves the mouth, crosses the Watcher, bounces on the screen edge and comes back towards its caster (two dodges)
  const wail=src=>{src=src||0;const x0=fieldX(VPOS[src].x-VOICE.wail.mouth),e=VOICE.wail.edge,ti=t+1.9*f,v=(x0-HX)/(1.1*f),d=(HX-e)/v;
    T.push({k:'wail',t0:t,tl:t+.8*f,ti,real:true,src,x0,ret:0});T.push({k:'wail',t0:ti,tl:ti+d,ti:ti+2*d,real:true,src,x0,ret:1});
    hitT=Math.max(hitT,ti+2*d);t=Math.max(t+1.3*f,ti+2*d-1.3*f+.44*f);S.cv='wail'};
  // a reflection shatters once its attacks are dodged (the Watcher's ray breaks it), sending n shards at the Watcher
  const shatter=(src,n)=>{const E=SP.echo,g=(E.break2-E.break1)*f;let s=hitT+E.break1*f,end=s;for(let i=0;i<n;i++){T.push({k:'shard',t0:s,tl:s+E.tl*f,ti:s+E.ti*f,from:src,ray:!i});end=s+E.ti*f;s+=g}hitT=end;t=Math.max(t,end-1.3*f+.4*f)};
  // Echoes (rages): each reflection casts its orbs (nature drawn at random), then shatters into as many shards
  const echoR=()=>{const n=VOICE.echo[dk];[1,2].sort(()=>Math.random()-.5).forEach(src=>{for(let i=0;i<n;i++){orb(Math.random()<.5,src);t+=.1*f}t+=.9*f;shatter(src,n)});S.cv='echo'};
  const rain=()=>{const n=VOICE.rain[dk],G=RAIN[S.d.m<1?'hard':'normal'];let s=t;for(let i=0;i<n;i++){if(i)s+=G[0]+Math.random()*(G[1]-G[0]);S.shardNext=((S.shardNext||0)+5)%SHARDS.length;T.push({k:'shard',t0:s,tl:s+.42*f,ti:s+.95*f,si:S.shardNext})}hitT=Math.max(hitT,s+.95*f);t=s+1.3*f;S.cv='rain'};
  if(rage){echoR();return T}
  // last Echo: two reflections, each a volley then a cry, then it shatters; the finish is the classic counter on the Voice
  if(final){[1,2].forEach(src=>{volley(VOICE.vol[dk][0],1,src);wail(src);shatter(src,VOICE.last[dk])});S.cv='volley';return T}
  const p0=[()=>volley(2,0),()=>volley(3,1),()=>wail(),()=>volley(3,0),()=>{wail();volley(2,1)},rain];
  const p1=[()=>volley(4,1),()=>volley(5,2),echoR,()=>{echoR();wail()},()=>{volley(3,1);echoR()},()=>{wail();volley(4,2)},rain,()=>{rain();volley(3,1)}];
  pick(stage?p1:p0)();
  // Hard: the permanent echo beside the Voice copies each of her spells (same draw) VOICE.twin.dt s later
  if(dk==='hard'){const dt=VOICE.twin.dt;for(const th of T.slice()){const own=(th.k==='orb'||th.k==='wail')&&th.src===0||th.k==='shard'&&th.si!=null;if(!own)continue;
    const c=Object.assign({},th,{t0:th.t0+dt,tl:th.tl+dt,ti:th.ti+dt,twin:1});if(th.k!=='shard')c.src=3;if(th.k==='wail')c.x0=fieldX(VPOS[3].x-VOICE.wail.mouth);if(th.si!=null)c.si=(th.si+8)%SHARDS.length;T.push(c)}}
  return T;
}
/* a dodge aimed at a reflection: no extra recovery; the reflection turns round behind the Watcher, becomes solid and
   comes back as a real attack once he can dodge again (action + recovery + DG.backWin). Dodging a reflection is not a fault:
   the series stays clean unless the Watcher takes the returning blow (the 'hit' branches of update() set pat.ok=false) */
function fooled(th){th.done=true;th.res='fooled';th.okT=gt;S.foolT=gt;play('fool');say(_('You dodged a reflection.','Tu as esquivé un reflet.'));
  const c=PT(),nt={k:'back',t0:gt,tl:gt+DG.backTurn,ti:gt+c.act+c.rec+DG.backWin,real:true,pat:th.pat};th.pat.ths.push(nt);S.threats.push(nt);say(_('The reflection comes back.','Le reflet revient.'))}
function shardPos(si){const s=SHARDS[si],m=VOICE.field+s.s;return{x:clamp(s.x+Math.sin(rt*.4+s.o)*12,m,W-m),y:clamp(s.y+Math.cos(rt*.5+s.o)*8,m,GY-m),s:s.s}}
function drawOrbs(){
  for(const th of S.threats){
    if(gt<th.t0)continue;
    if(th.k==='orb'||th.k==='back'){
      const back=th.k==='back',h=back?{x:HX-110,y:HY-56}:voiceHand(th.src,1),tx=HX+14,ty=HY;
      let x,y,r=13,a=1,p=0,dash=th.real?0:1;
      if(gt<th.tl){const k=(gt-th.t0)/(th.tl-th.t0);if(back){const e=eout(k);x=lerp(tx,h.x,e);y=lerp(ty,h.y,e)-Math.sin(Math.PI*k)*30;dash=1-k}else{x=h.x;y=h.y;r=4+9*k}}
      else{p=(gt-th.tl)/(th.ti-th.tl);
        if(th.done){if(th.res==='hit'||th.res==='pass'){if(gt-th.okT>.05)continue;p=1}else{a=Math.max(0,1-(gt-th.okT)/.45)}}
        x=lerp(h.x,tx,p);y=lerp(h.y,ty,p)-Math.sin(Math.PI*Math.min(p,1))*(th.k==='back'?20:46)}
      x=fieldX(x);y=fieldY(y);
      if(a<=0)continue;
      ctx.save();ctx.globalAlpha=a;
      if(th.real&&gt>=th.tl){const sh=clamp(1-(GY-y)/400,.25,1);ell(x,GY+3,r*1.6*sh,4*sh,`rgba(0,0,0,${.5*sh})`)}
      // every orb is full; an illusory one (clones' included) has a dotted outline, a real one casts its shadow (above)
      glow(x,y,r*3,'rgba(176,124,255,.95)',th.real?.85:.6);ell(x,y,r,r,'#c9a8ff');ell(x,y,r*.5,r*.5,'#fbf6ff');
      if(dash>0){ctx.save();ctx.globalAlpha*=dash;ctx.setLineDash([3,4]);ctx.lineDashOffset=-gt*12;ctx.strokeStyle='#f4ecff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r+3,0,Math.PI*2);ctx.stroke();ctx.restore()}
      ctx.restore();
    }else if(th.k==='shard'){
      const o=th.from!=null?{x:voicePos(th.from).x,y:voicePos(th.from).y-90,s:24}:shardPos(th.si),tx=HX+16,ty=HY-10;let x,y,a=1,ang;
      if(gt<th.tl){const k=(gt-th.t0)/(th.tl-th.t0);x=o.x;y=o.y;ang=Math.atan2(ty-y,tx-x);glow(x,y,30,'rgba(220,200,255,.9)',.8*k)}
      else{let p=(gt-th.tl)/(th.ti-th.tl);if(th.done){if(th.res==='hit'){if(gt-th.okT>.05)continue;p=1}else{a=Math.max(0,1-(gt-th.okT)/.3);if(!th.sf){th.sf=1;burst(tx+30,ty-20,10,'#f2ecff',5,.4)}}}
        p=Math.min(p,1);x=lerp(o.x,tx,ein(p));y=lerp(o.y,ty,ein(p));ang=Math.atan2(ty-o.y,tx-o.x)}
      // the Watcher's ray breaks the reflection once its attacks are dodged (none of them hit him)
      if(th.ray&&gt>=th.t0-VOICE.ray&&gt<th.t0+.06&&S.orbX!=null&&!S.threats.some(o=>o.pat===th.pat&&o.src===th.from&&o.res==='hit')){const v=voicePos(th.from),e=clamp((gt-th.t0+VOICE.ray)/VOICE.ray,0,1);
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,244,190,${.95-.5*e})`;ctx.lineWidth=6*(1-e)+2;ctx.beginPath();ctx.moveTo(S.orbX,S.orbY);ctx.lineTo(lerp(S.orbX,v.x,Math.min(1,e*2.5)),lerp(S.orbY,v.y-84,Math.min(1,e*2.5)));ctx.stroke();ctx.restore()}
      x=fieldX(x);y=fieldY(y);
      if(a<=0)continue;
      ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.rotate(ang+Math.PI/2);const s=o.s*.8;
      const gr=ctx.createLinearGradient(0,-s,0,s);gr.addColorStop(0,'rgba(245,240,255,.95)');gr.addColorStop(1,'rgba(150,120,210,.7)');ctx.fillStyle=gr;
      ctx.beginPath();ctx.moveTo(0,-s*1.2);ctx.lineTo(s*.45,s*.4);ctx.lineTo(0,s*.9);ctx.lineTo(-s*.45,s*.4);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
    }else if(th.k==='wail'&&gt>=th.tl){
      // outward: from the mouth (x0) past the Watcher to the screen edge; back: from the edge past the Watcher to its caster
      const e=VOICE.wail.edge,p=(gt-th.tl)/(th.ti-th.tl);let a=1,x;
      if(!th.ret){if(th.done&&th.res==='hit')continue;x=lerp(th.x0,HX,p);if(x<=e)continue}
      else{if(th.done&&th.res==='hit')continue;x=lerp(e,HX,p);if(x>=th.x0)continue;a=Math.min(1,(th.x0-x)/80)}
      x=fieldX(x);const dir=th.ret?-1:1;ctx.save();ctx.globalAlpha=a;
      for(let i=0;i<4;i++){ctx.strokeStyle=`rgba(200,160,255,${.75-i*.17})`;ctx.lineWidth=5-i;ctx.beginPath();ctx.ellipse(x+dir*i*16,GY-90,22+i*4,110,0,th.ret?-Math.PI*.45:Math.PI*.55,th.ret?Math.PI*.45:Math.PI*1.45);ctx.stroke()}
      ctx.restore();
    }
  }
}
/* ---- Phase II · the Rust King ---- */
function P1(stage,f,b,final,rage){
  const T=[];let t=b;
  const slam=()=>{T.push({k:'slam',t0:t,ti:t+.95*f});t+=1.4*f};
  const sweep=()=>{T.push({k:'sweep',t0:t,ti:t+.72*f});t+=1.17*f};
  const chain=n=>{const t0=t;for(let i=0;i<n;i++)T.push({k:'chain',t0,ti:t0+.85*f+i*.4*f,i,n});t=t0+.85*f+(n-1)*.4*f+.55*f};
  const toll=()=>{T.push({k:'toll',t0:t,tw:t+.55*f,ti:t+1.55*f});t+=1.05*f};
  const harpoon=()=>{const ti=t+1.1*f,tb=ti+.7*f;T.push({k:'hpOut',t0:t,ti,tb,ret:tb+.5*f});T.push({k:'hpBack',t0:t,ti:tb});t=tb+.8*f};
  // the water wave: he stamps, the wave grows towards the Watcher (block), hits the back wall, a beam falls twice (two blocks)
  const wave=big=>{const ti=t+SP.wave.hit*f;T.push({k:'wave',t0:t,tl:t+SP.wave.land*f,ti,big:!!big});return ti};
  const rafter=ti=>{T.push({k:'rafter',n:1,t0:ti,ti:ti+SP.wave.fall1*f});T.push({k:'rafter',n:2,t0:ti+.2*f,ti:ti+SP.wave.fall2*f});t=ti+SP.wave.after*f};
  const surge=()=>rafter(wave());
  const dwave=()=>{wave();t+=SP.dwave.gap*f;rafter(wave(true))};
  // the rust cloud: he shakes his bell, red dust comes down over the hold, he advances: block at contact
  const rust=()=>{const R=SP.rust,tc=t+R.cloud*f,ti=tc+R.hit*f;S.rust={t0:t,tc,end:ti+R.fade*f};T.push({k:'slam',t0:tc,ti,ls:R.ls,rust:1});t=ti+R.after*f};
  if(rage){(rage>1?dwave:rust)();return T}
  if(final){surge();slam();chain(3);toll();toll();return T}
  const p0=[slam,sweep,()=>{slam();sweep()},()=>chain(3),toll,()=>{sweep();slam()},harpoon,surge];
  const p1=[()=>{slam();chain(3)},()=>{sweep();slam();chain(3)},()=>{chain(3);toll()},()=>chain(5),harpoon,()=>{surge();slam()},()=>{harpoon();sweep()},dwave,rust,()=>{rust();sweep()}];
  pick(stage?p1:p0)();if(stage)toll();return T;
}
function anim1(){
  const r=anim1raw();const th=curAct(['slam','sweep'],.75);if(th&&th.ls)r.lunge*=th.ls;
  if(S.cine)return r;
  const hp=S.threats.find(t=>t.k==='hpOut'&&gt>=t.t0&&gt<=t.ret+.05);
  if(hp){const w=hp.ti-.38,hand={x:-150,y:GY-218},hero={x:HX+40-700,y:HY-6};
    r.lunge=0;
    if(gt<w){r.larm=eio(clamp((gt-hp.t0)/(w-hp.t0),0,1))}
    else{r.larm=1;let pos;
      if(gt<=hp.ti){const k=ein(clamp((gt-w)/(hp.ti-w),0,1));pos={x:lerp(hand.x,hero.x,k),y:lerp(hand.y,hero.y,k)-Math.sin(Math.PI*k)*40}}
      else if(gt<=hp.tb){const u=(gt-hp.ti)/(hp.tb-hp.ti),mid={x:(hand.x+hero.x)/2+30,y:hero.y-130};pos=u<.4?{x:lerp(hero.x,mid.x,eout(u/.4)),y:lerp(hero.y,mid.y,eout(u/.4))}:{x:lerp(mid.x,hero.x,ein((u-.4)/.6)),y:lerp(mid.y,hero.y,ein((u-.4)/.6))}}
      else{const k=eio(clamp((gt-hp.tb)/(hp.ret-hp.tb),0,1));pos={x:lerp(hero.x,hand.x,k),y:lerp(hero.y,hand.y,k)}}
      r.harp={x:pos.x,y:pos.y};
      if(!hp.sf&&gt>=w){hp.sf=1;MUSIC.fx('whoosh');MUSIC.fx('chainSlip')}}}
  if(S.rust&&gt>=S.rust.t0&&gt<S.rust.tc+.2)r.toll=Math.max(r.toll,.8);
  if(gt<S.roarT+S.roarD)r.toll=Math.max(r.toll,.9);
  const st=S.threats.find(t=>t.k==='wave'&&gt>=t.t0&&gt<=t.tl+.1);
  if(st){const up=st.tl-.18;r.stomp=gt<up?eout(clamp((gt-st.t0)/(up-st.t0),0,1))*46:lerp(46,0,ein(clamp((gt-up)/.18,0,1)))}
  return r;
}
function drawKingFx(){
  for(const th of S.threats){
    if(th.k==='wave'&&gt>=th.tl&&!th.sf){th.sf=1;S.shake=Math.max(S.shake,10);MUSIC.fx('step');burst(662,GY,18,'#cff7ef',5,.6,.4)}
    if(th.k==='wave'&&gt>=th.tl){const big=th.big?1.35:1,k=clamp((gt-th.tl)/(th.ti-th.tl),0,1);
      if(gt<th.ti)drawWave(lerp(650,HX+40,eio(k)),lerp(14,86*big,eout(k)),1);
      else{const q=(gt-th.ti)/.55;if(q<1)drawWave(lerp(HX+40,-90,q),86*big*(th.res==='ok'?1-q*.6:1-q*.3),th.res==='ok'?1-q*.5:1);
        if(!th.wf&&q>=.62){th.wf=1;S.shake=Math.max(S.shake,13);MUSIC.fx('rumble');for(let i=0;i<14;i++)S.parts.push({x:Math.random()*W,y:-4,vx:(Math.random()-.5)*.25,vy:.3,g:.28,t0:gt,life:1.6,c:'#7a6a56',r:2})}
        if(!th.bf){th.bf=1;burst(HX+40,GY-50,th.res==='ok'?26:14,'#e6f8f2',6,.7,.3)}}}
  }
  drawRafter();
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
/* the rust cloud: red dust coming down over the hold. It hides the scenery, never the block signal: it thins out around the
   Watcher, and the King's bell lamp and the anchor's head shine through it */
const RUSTP=(()=>{const R=mulberry(57);return[...Array(26)].map(()=>({x:R()*W,y:R()*GY,r:60+R()*90,v:(R()-.5)*14,o:R()*6}))})();
function drawRust(){const R=S.rust;if(!R||gt<R.t0||gt>R.end)return;
  const a=clamp((gt-R.t0)/(R.tc-R.t0),0,1)*(1-clamp((gt-(R.end-.9))/.9,0,1)),front=lerp(-40,H+60,eout(clamp((gt-R.t0)/(R.tc-R.t0+.5),0,1)));
  ctx.save();
  for(let x=0;x<W;x+=40){const k=.35+.65*eio(clamp((x-HX)/220,0,1)),g=ctx.createLinearGradient(0,front-160,0,front);g.addColorStop(0,`rgba(110,40,18,${.62*a*k})`);g.addColorStop(1,'rgba(110,40,18,0)');ctx.fillStyle=g;ctx.fillRect(x,0,40,front)}
  for(const p of RUSTP){const x=(p.x+gt*p.v+W)%W,k=(x<HX+90?.3:1)*clamp((front-p.y)/90,0,1);const rg=ctx.createRadialGradient(x,p.y,4,x,p.y,p.r);rg.addColorStop(0,`rgba(150,62,28,${.45*a*k})`);rg.addColorStop(1,'rgba(120,45,20,0)');ctx.fillStyle=rg;ctx.fillRect(x-p.r,p.y-p.r,p.r*2,p.r*2)}
  for(let i=0;i<40;i++){const x=(i*97+gt*20)%W,y=(i*53+gt*40)%front;ctx.fillStyle=`rgba(200,110,60,${.5*a})`;ctx.fillRect(x,y,1.6,1.6)}
  ctx.restore();
  if(S.kingHead)glow(S.kingHead.x,S.kingHead.y,70,'rgba(255,220,160,.9)',.55*a+.2);
  const sl=S.threats.find(t=>t.rust&&!t.done&&gt>=t.t0);if(sl&&S.clapTip)glow(S.clapTip.x,S.clapTip.y,50,'rgba(220,250,240,.9)',.7)}
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

