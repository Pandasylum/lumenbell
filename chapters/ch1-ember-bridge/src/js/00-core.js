(()=>{
'use strict';
let LANG='en';
/* Langue par défaut : celle de l'appareil (français si elle commence par « fr », sinon anglais) ; le choix du joueur, une fois fait, est mémorisé et prioritaire. */
try{const nl=(navigator.languages&&navigator.languages[0])||navigator.language||'';if(/^fr/i.test(nl))LANG='fr'}catch(e){}
try{const sv=localStorage.getItem('eb-lang');if(sv==='fr'||sv==='en')LANG=sv}catch(e){}
function _(en,fr){return LANG==='fr'?fr:en}
const W=960,H=540,DECK=410,PX=250,BX=730;
/* Difficulté. php/bhp : PV du Veilleur/Colosse ; m : multiplicateur des fenêtres de parade et d'esquive ; u : PV du Colosse où se déclenchent les attaques de rage en phases II et III ;
   jets : jets de feu de la Fureur ; fury : PV du Colosse → type de fureur en phase I ; mk1/mk : repères sur la jauge du Colosse (phase I / phases II-III) ;
   noHelp : pas d'aide visuelle (case masquée) ;
   easy : aides et allègements, repères en cercle, fausse fin ;
   hard : attaques en plus (double fouet, épée à 3 coups, souffles enchaînés, rages à séquences) ; fm : fenêtre du souffle ; rm : récupération après parade ;
   t : durées de la phase I remplacées ; waitMin/waitMax : pause entre attaques ; chain : [PV, chance] d'un souffle enchaîné ; rbhp/ru/mkR : PV du Colosse, PV de la première rage et repères de la jauge en phase III ; u2 : PV de la rage en deux temps (phase III Difficile) ; q2/rages : phase II Difficile (attaques à 4 griffes, 5 vagues, boulette de feu, cris avec éboulement, balayage de queue). */
const DIFFS={
  easy:{php:6,bhp:8,m:2,u:4,jets:2,easy:true,fury:{4:5,1:1},mk1:[0,3],mk:[0,3]},
  normal:{php:4,bhp:10,m:1,u:5,jets:4,easy:false,fury:{5:5,1:1},mk1:[0,4],mk:[0,4]},
  hard:{php:3,bhp:14,m:.6,fm:1,rm:1.2,u:10,jets:4,easy:false,hard:true,noHelp:true,q2:true,u2:5,rages:[10,5],fury:{10:5,5:6,1:1},mk1:[0,4,9],mk:[0,4,9],rbhp:12,ru:8,mkR:[0,4,7],
        t:{windup:.5,strike:.42,sw1w:.75,sw1:.26,swgap:.22,sw2w:.15,sw2:.26,sw3g:.27,sw3w:.34,sw3:.26,fli:.5,stagger:.6,swrec:.65,flrec:.65,fyt:.36,fyg:.05},waitMin:.5,waitMax:.9,chain:[[5,.75],[10,.4]]}
};
/* Phase III : PV du Colosse (rbhp), PV de la première rage (ru) et repères de la jauge (mkR) ; par défaut identiques aux autres phases */
for(const k of ['easy','normal','hard']){const d=DIFFS[k];d.rbhp=d.rbhp||d.bhp;d.ru=d.ru||d.u;d.mkR=d.mkR||d.mk}
DIFFS.tn=Object.assign({},DIFFS.normal,{trial:true,noHelp:true});DIFFS.th=Object.assign({},DIFFS.hard,{trial:true});
/* Épreuve du feu : les 3 phases d'affilée, PV conservés entre les phases, une mort = retour à la phase I. */
const RUN={on:false,max:4,cur:4,n:1,t:0,pt:[0,0,0],st:{},name:'tn'};
function startHP(){return RUN.on?RUN.cur:DIFF.php}
let DIFF=DIFFS.normal,BRW=.2;
const RKX=[PX+330,PX+190,PX+440];
const T={windup:.75,strike:0.5,barrier:0.333,recovery:0.7,rebound:0.42,stagger:.75,sw1w:.9,sw1:.3,swgap:.45,sw2w:.4,sw2:.3,swrec:.8,cast:.5,orb:.45,fli:.6,flo:.25,flwin:.2,flrec:.8,dash:.28,back:.5,ringAt:.5};
T.sw3g=.32;T.sw3w=.4;T.sw3=.3;
T.fyt=.45;T.fyg=.15; /* fureur : annonce d'un jet, pause entre deux jets */
const DMG_GRAB=1,DMG_PARRY=1,DMG_SWORD=1,DMG_ORB=1,DMG_FLAME=1,DMG_STAB=1,LIFT_MAX=170;
const DISPLAY='"Big Shoulders Display",Impact,sans-serif';

const cv=document.getElementById('c');let ctx=cv.getContext('2d');
const OFF=document.createElement('canvas'),OFFX=OFF.getContext('2d'); /* calque hors écran : la pétrification grise le Colosse en une seule opération */
const COARSE=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
const dpr=Math.min(COARSE?1.25:2,window.devicePixelRatio||1);
cv.width=W*dpr;cv.height=H*dpr;
/* Qualité adaptative : les lueurs (shadowBlur) coûtent cher sur smartphone. On les réduit d'emblée sur tactile,
   puis on les coupe si la cadence reste basse. */
let SBQ=COARSE?0.5:1,slowT=0,slowN=0,slowS=0;
{const pr=CanvasRenderingContext2D.prototype,db=Object.getOwnPropertyDescriptor(pr,'shadowBlur'),dc=Object.getOwnPropertyDescriptor(pr,'shadowColor');
 if(db&&db.set&&dc&&dc.set){
  Object.defineProperty(ctx,'shadowBlur',{get(){return db.get.call(this)},set(v){db.set.call(this,v*SBQ)},configurable:true});
  Object.defineProperty(ctx,'shadowColor',{get(){return dc.get.call(this)},set(v){dc.set.call(this,SBQ>0?v:'rgba(0,0,0,0)')},configurable:true});
 }}
function perfWatch(raw){
  if(paused||raw>250||SBQ===0)return;
  slowT+=raw;slowN++;if(raw>34)slowS++;
  /* moyenne trop basse, ou saccades répétées (pics pendant les combos) : on allège les lueurs */
  if(slowT>=2000){const avg=slowT/slowN;if(avg>23||slowS>=5)SBQ=SBQ>.3?.25:0;slowT=0;slowN=0;slowS=0}
}
const $=id=>document.getElementById(id);
const el={hpP:$('hpP'),hpB:$('hpB'),ov:$('ov'),eye:$('ovEye'),title:$('ovTitle'),stats:$('ovStats'),desc:$('ovDesc'),go:$('go'),go2:$('go2'),ward:$('ward'),live:$('live'),help:$('optHelp'),snd:$('optSnd')};
const prefs={help:false,sound:true,music:true};
let deaths=0; // défaites depuis le choix de la difficulté (Facile : propose l'aide visuelle à la 3e)
let paused=true,pendingLore=false;
const LORE={
  2:{get eye(){return _('Phase II · The Foundry','Phase II · La Fonderie')},get title(){return _('Into the Foundry.','Dans la Fonderie.')},get desc(){return _(`The forge shaft plunges endlessly down. Chains too large for a man's hand hang from the walls, rusted by centuries.`,`Le puits des forges s'enfonce sans fin. Aux parois pendent des chaînes trop grandes pour une main d'homme, rouillées de siècles.`)}},
  3:{get eye(){return _('Phase III · The Bell Tower','Phase III · Le Clocher')},get title(){return _(`The Watchers' Bell Tower.`,`Le Clocher des Veilleurs.`)},get desc(){return _(`After a chase up the forge chimney, the Colossus is caught atop the Watchers' Bell Tower. An echo of the past rings out.`,`Après une poursuite le long de la cheminée des forges, le Colosse est rattrapé au sommet du Clocher des Veilleurs. Un écho du passé résonne.`)}}
};
function showLore(n){
  const L=LORE[n];
  el.eye.textContent=L.eye;el.title.textContent=L.title;el.desc.textContent=L.desc;el.stats.hidden=true;el.go.textContent=_('Continue','Continuer');
  el.ov.classList.remove('clear');el.ov.hidden=false;paused=true;pendingLore=true;
  try{el.go.focus({preventScroll:true})}catch(e){}
}
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

const rand=(a,b)=>a+Math.random()*(b-a);
const clamp01=v=>v<0?0:v>1?1:v;
const eo=t=>1-(1-t)*(1-t),ei=t=>t*t,es=t=>t*t*(3-2*t);
const lerp2=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];

const IDLE_HAND=[BX-135,288],UP_HAND=[BX-114,128],FWD_HAND=[BX-150,258],TIP_BACK=[BX+70,78];
const BAR=[PX+116,DECK-76],CHEST=[PX+14,DECK-72],HEAD=[BX,DECK-268];
const IDLE2=[BX+114,DECK-68],S2=[BX+92,DECK-200],SW_LEN=230;
const SW1_BACK=[BX+110,DECK-130],SW1_HIT=[BX-134,DECK-76],SW2_UP=[BX+80,DECK-190],SW2_HIT=[556,138];
const VHIT=[352,244],ORB_T=[BX-30,DECK-190];
const MOUTH=[BX-14,DECK-236],STAB_X=556;
const JET_O=[[BX-30,DECK-215],[BX-100,DECK-250],[BX-110,DECK-110],[BX-60,DECK-150]];
const RK=[PX+70,DECK-165],RK_S=[PX+330,-70];
const AURA=[[-125,-206],[-100,-228],[-70,-236],[-40,-312],[-10,-312],[20,-312],[40,-306],[70,-236],[100,-228],[125,-206],[-110,-170],[110,-170],[-80,-130],[80,-130],[-70,-90],[70,-90],[-60,-14],[60,-14],[0,-216],[-95,-216],[95,-216],[-30,-180],[30,-180],[0,-150]];

let G=null,AC=null;

/* ---------- audio ---------- */
let bgOff=false;
function bgAudio(off){bgOff=off;try{if(AC){if(off){if(AC.state==='running')AC.suspend().catch(()=>{})}else ensureAudio()}}catch(e){}}
function ensureAudio(){
  try{
    if(AC&&AC.state==='closed')AC=null;
    if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(C){try{AC=new C({latencyHint:"playback"})}catch(e){AC=new C()}}}
    if(AC&&!bgOff&&AC.state!=='running'&&AC.resume)AC.resume().catch(()=>{}); /* suspended, ou « interrupted » sur Safari */
  }catch(e){}
}
/* Le navigateur coupe le son quand l'onglet passe en arrière-plan ou après une inactivité : on le relance à la moindre interaction. */
/* Déverrouillage : le navigateur n'autorise le son qu'après un vrai geste ; on crée / relance le contexte à chacun d'eux tant qu'il ne tourne pas, et on joue un son muet pour l'amorcer. */
function unlockAudio(){
  ensureAudio();
  try{if(AC&&AC.state==='running'&&!AC.__u){AC.__u=1;const b=AC.createBuffer(1,1,22050),n=AC.createBufferSource();n.buffer=b;n.connect(AC.destination);n.start(0)}}catch(e){}
}
['click','pointerup','mousedown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,()=>{if(!AC||AC.state!=='running'||!AC.__u)unlockAudio()},true));
document.addEventListener('visibilitychange',()=>bgAudio(document.hidden));
window.addEventListener('pagehide',()=>bgAudio(true));window.addEventListener('pageshow',()=>bgAudio(document.hidden));
window.addEventListener('blur',()=>{if(document.hidden)bgAudio(true)});window.addEventListener('focus',()=>{if(!document.hidden)bgAudio(false)});
function tone(f,d,type,v,slide){
  if(!prefs.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  try{
    const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;
    o.type=type||'sine';
    o.frequency.setValueAtTime(f,n);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),n+d);
    g.gain.setValueAtTime(v||.05,n);
    g.gain.exponentialRampToValueAtTime(.0001,n+d);
    o.connect(g);g.connect(AC.destination);
    o.start();o.stop(n+d);
  }catch(e){}
}
const say=t=>{el.live.textContent=t};
let NB=null;
function noise(d,v,f0,f1){
  if(!prefs.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  try{
    if(!NB){NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const a=NB.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}
    const n=AC.currentTime,src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
    src.buffer=NB;src.loop=true;f.type='bandpass';f.Q.value=.9;
    f.frequency.setValueAtTime(f0,n);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),n+d);
    g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(v,n+Math.min(.03,d/3));g.gain.exponentialRampToValueAtTime(.0001,n+d);
    src.connect(f);f.connect(g);g.connect(AC.destination);src.start(n);src.stop(n+d+.05);
  }catch(e){}
}
function footfall(big){tone(big?58:90,big?.22:.1,'sine',big?.16:.08,-30);noise(big?.16:.07,big?.1:.05,big?500:900,big?120:300)}
function anvil(){tone(1320,.6,'triangle',.06,0);tone(1985,.4,'sine',.04,0);tone(160,.14,'square',.06,-60)}
function forgeSparks(S,x,y,n){for(let i=0;i<(n||24);i++){const a=rand(-3.0,-.15),v=rand(160,520),L=rand(.25,.7);S.sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:900,life:L,max:L,col:i%3?'#ffd27a':(i%2?'#ffffff':'#ff9a3c'),sz:rand(2,4.5)})}}
function boom(d,v){tone(55,d,'sine',v,-20);noise(d,v*.9,900,50)}
function whoosh(d,v,up){noise(d,v,up?400:2800,up?2800:400)}
/* Cri de douleur du Colosse : hurlement qui monte puis s'effondre en gémissement tremblant */
function painCry(d,v){
  if(!prefs.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  d=d||1.7;v=v||.17;
  try{
    const n=AC.currentTime,g=AC.createGain(),f=AC.createBiquadFilter(),f2=AC.createBiquadFilter(),lfo=AC.createOscillator(),lg=AC.createGain();
    f.type='bandpass';f.Q.value=2.2;f.frequency.setValueAtTime(1100,n);f.frequency.linearRampToValueAtTime(1500,n+.2);f.frequency.exponentialRampToValueAtTime(420,n+d);
    f2.type='lowpass';f2.frequency.value=2600;
    g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(v,n+.05);g.gain.setValueAtTime(v,n+d*.35);g.gain.exponentialRampToValueAtTime(.0001,n+d);
    lfo.frequency.setValueAtTime(7,n);lfo.frequency.linearRampToValueAtTime(11,n+d);lg.gain.setValueAtTime(10,n);lg.gain.linearRampToValueAtTime(26,n+d);lfo.connect(lg);
    [[180,'sawtooth'],[186,'sawtooth'],[90,'square']].forEach(([fr,ty])=>{
      const o=AC.createOscillator();o.type=ty;
      o.frequency.setValueAtTime(fr,n);o.frequency.exponentialRampToValueAtTime(fr*1.7,n+.16);o.frequency.exponentialRampToValueAtTime(fr*.42,n+d);
      lg.connect(o.frequency);o.connect(f);o.start(n);o.stop(n+d);
    });
    f.connect(f2);f2.connect(g);g.connect(AC.destination);lfo.start(n);lfo.stop(n+d);
  }catch(e){}
  noise(d*.6,v*.5,2400,600);
}
function roar(){
  if(!prefs.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  try{
    const n=AC.currentTime,d=.9,g=AC.createGain(),f=AC.createBiquadFilter(),lfo=AC.createOscillator(),lg=AC.createGain();
    f.type='lowpass';f.frequency.setValueAtTime(900,n);f.frequency.exponentialRampToValueAtTime(220,n+d);
    g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(.16,n+.06);g.gain.exponentialRampToValueAtTime(.0001,n+d);
    lfo.frequency.value=38;lg.gain.value=30;lfo.connect(lg);
    [95,142,71].forEach((fr,i)=>{
      const o=AC.createOscillator();o.type=i?'square':'sawtooth';
      o.frequency.setValueAtTime(fr*1.5,n);o.frequency.exponentialRampToValueAtTime(fr*.55,n+d);
      lg.connect(o.frequency);o.connect(f);o.start(n);o.stop(n+d);
    });
    lfo.start(n);lfo.stop(n+d);f.connect(g);g.connect(AC.destination);
  }catch(e){}
}

/* ---------- state ---------- */
function makeEmbers(){return Array.from({length:70},()=>({x:rand(0,W),y:rand(0,H),v:rand(14,48),s:rand(1,2.6),ph:rand(0,6.28)}))}
function newGame(){
  const emb=G?G.embers:makeEmbers();
  G={mode:'title',time:0,php:startHP(),bhp:DIFF.bhp,parries:0,grabs:0,
     boss:{s:'idle',t:0,wait:1.5},pl:{s:'ready',t:0,deny:0,x:PX},
     sparks:[],rings:[],floats:[],trail:[],swTrail:[],sw:{p1:false,p2:false,p3:false},atk:{last:'',n:0,plain:0},kick:0,wound:0,p2:false,fy:null,jf:null,fin:null,ringFx:null,embers:emb,
     shake:0,flash:0,hurt:0,hitstop:0,recoil:0,endIn:0};
}
/* Remet à zéro les variantes d'attaque du Colosse (durées modifiées, double crochet, souffle enchaîné…). */
function clearMods(b){b.fli=0;b.fyb=false;b.sk=0;b.dbl=false;b.dbf=false;b.second=false;b.combo=false;b.pend=null}
function toIdle(){
  const b=G.boss;b.s='idle';b.t=0;b.fury=0;clearMods(b);
  b.wait=DIFF.hard?rand(DIFF.waitMin,DIFF.waitMax):rand(1.2,2.2);
}

function start(){
  el.go2.hidden=true;$('ovTable').hidden=true;
  if(RUN.on&&!R&&!Q&&G&&G.mode==='lost'){restartRun();return}
  if(pendingLore){pendingLore=false;paused=false;el.ov.hidden=true;ensureAudio();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();return}
  if(R){
    if(R.mode==='lost'){if(RUN.on)restartRun();else beginP3(true);return}
    if(R.mode==='space'){showMenu(false);return}
    if(R.mode==='fake'){showMenu(false);return}
    R=null;setPhaseUI(1);newGame();lastP=-1;lastB=-1;hud();
  }
  if(Q){
    if(Q.mode==='lost'){if(RUN.on)restartRun();else beginP2(true);return}
    if(Q.mode==='lake'){beginP3();return}
    Q=null;setPhaseUI(1);newGame();lastP=-1;lastB=-1;hud();
  }
  if(G.mode==='won'&&G.p2){beginP2();return}
  if(G.mode==='play'||G.mode==='intro')return;
  const fresh=G.mode==='title';
  if(!fresh)newGame();
  if(fresh){G.mode='intro';G.it=0;G.ix=530;G.sx=1;G.ib=0;G.ir=false;G.pl.x=-60}
  else{G.mode='play';G.boss.wait=1.2}
  el.ov.hidden=true;
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  ensureAudio();
  say(fresh?_('The Watcher takes his post on the bridge. The Colossus arrives.','Le Veilleur prend position sur le pont. Le Colosse arrive.'):_('Fight started.','Combat lancé.'));
}
function introStep(dt){
  G.it+=dt;const T=G.it,p=G.pl;
  if(!G.i0){G.i0=true;boom(1.6,.1);whoosh(1.2,.05,true)}
  if(T<2.2){const h=Math.floor(T*7.5/Math.PI);if(h!==G.ih){G.ih=h;footfall(false)}}
  if(T<1.9){const b=Math.floor(T/.42);if(b!==G.ibf){G.ibf=b;footfall(true);G.shake=reduce?0:Math.max(G.shake,3)}}
  /* le Veilleur arrive par la gauche et prend position ; le Colosse arrive par la droite */
  p.x=T<2.2?-60+(PX+60)*es(T/2.2):PX;
  G.ix=T<1.8?530*(1-eo(T/1.8)):0;
  G.sx=1;
  G.ib=T<2.2?Math.abs(Math.sin(T*7.5))*4*(1-es(clamp01((T-1.7)/.5))):0;
  if(T<2.2&&Math.random()<.25)G.sparks.push({x:p.x-14,y:DECK-2,vx:rand(-50,-10),vy:-rand(10,40),g:200,life:.35,max:.35,col:'#9a8a9e',sz:rand(2,3)});
  if(T<1.8&&Math.random()<.5)G.sparks.push({x:BX+G.ix+rand(-20,60),y:DECK-2,vx:rand(20,110),vy:-rand(10,70),g:200,life:.5,max:.5,col:'#9a8a9e',sz:rand(3,6)});
  if(T>=2.2&&!G.is){G.is=true;dust(PX,DECK);tone(200,.3,'sine',.06,-100);tone(660,.5,'sine',.04,200)}
  if(T>=3.0&&!G.ir){G.ir=true;G.shake=reduce?0:10;G.flash=.3;tone(70,.9,'sawtooth',.09,60);float(_('RAAAH!','RAAAH !'),BX-90,DECK-300,'#ffb347');roar();boom(.8,.14)}
  if(T>=4.0){G.mode='play';G.boss.wait=1.2;G.ix=0;G.sx=1;G.ib=0;say(_('Fight started.','Combat lancé.'))}
}
function press(){
  if(paused)return;
  if(R){rPress();return}
  if(Q){qPress();return}
  if(!G)return;
  if(G.mode==='title'){start();return}
  if(G.mode!=='play')return;
  ensureAudio();
  const p=G.pl;
  if(p.s==='ready'){p.s='barrier';p.t=0;tone(520,.14,'triangle',.05,320)}
  else if(p.s==='barrier'||p.s==='recover'){p.deny=.25}
}
/* Facile : à la 3e défaite, la carte propose d'activer l'aide visuelle. */
function deathCard(){
  if(RUN.on){el.go.textContent=_('Start over from Phase I','Reprendre à la phase I');el.desc.textContent+=_(' In the trial, one death sends you back to the very beginning, at full health.'," Dans l'épreuve, une mort te renvoie au tout début, en pleine forme.");return}
  if(!DIFF.easy||prefs.help)return;
  if(++deaths===3){
    el.desc.textContent+=_(` Visual cues can help you find the right moment to parry.`,` Des repères visuels peuvent t'aider à choisir le bon moment pour parer.`);
    el.go2.hidden=false;
  }
}
el.go2.addEventListener('click',()=>{prefs.help=el.help.checked=true;start()});
function showEnd(){
  const win=G.mode==='won';
  el.eye.textContent=win?(G.p2?_('Transition · Phase II','Transition · Phase II'):_('Phase I cleared','Phase I terminée')):_('Defeat','Défaite');
  el.title.textContent=win?(G.p2?_(`The Colossus smashes the bridge.`,`Le Colosse fracasse le pont.`):_('The Colossus drops to one knee.','Le Colosse plie un genou.')):_('Crushed on the stone.','Écrasé sur la pierre.');
  el.stats.textContent=_('Parries ','Parades ')+G.parries+_(' · Hits taken ',' · Coups subis ')+G.grabs+trStr(1);
  el.stats.hidden=false;
  el.desc.textContent=win?(G.p2?_('Through the breach, he dives into the foundry beneath the arch, as if he knew the way. Without a moment\'s doubt, the Watcher leaps after him.','Par la brèche, il plonge dans la fonderie cachée sous l\'arche, comme s\'il en connaissait le chemin. Sans hésiter, le Veilleur saute à sa poursuite.'):_(`Phase II will open with its upcoming attacks.`,`La phase II s'ouvrira avec ses prochaines attaques.`)):_(`The lantern rolls across the stones of the bridge and goes out. Nothing holds the Colossus back now: the road to the valleys lies open.`,`La lanterne roule sur les pierres du pont et s'éteint. Plus rien ne retient le Colosse : la route des vallées est ouverte.`);
  el.go.textContent=win?(G.p2?_('Start Phase II','Lancer la phase II'):_('Replay Phase I','Rejouer la phase I')):_('Retry','Réessayer');
  if(!win)deathCard();
  el.ov.hidden=false;
  try{el.go.focus({preventScroll:true})}catch(e){}
}

/* ---------- effects ---------- */
function burst(x,y,n,cols){for(let i=0;i<n;i++){const a=rand(0,6.283),v=rand(80,360),L=rand(.3,.7);G.sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,g:520,life:L,max:L,col:cols[i%cols.length],sz:rand(2,5)})}}
function dust(x,y){for(let i=0;i<18;i++){const d=Math.random()<.5?-1:1,L=rand(.4,.8);G.sparks.push({x:x+rand(-20,20),y:y-2,vx:d*rand(40,220),vy:-rand(20,120),g:260,life:L,max:L,col:'#9a8a9e',sz:rand(3,6)})}}
function ring(x,y){G.rings.push({x,y,life:.35,max:.35})}
/* Texte flottant : seules les onomatopées (coups, cris) et les titres de phase s'affichent ; tout mot d'annonce (PARADE, ORBE, TOUCHÉ…) est supprimé pour garder un ton sombre. */
const ONO={};
(function(){
  const add=(v,list)=>list.forEach(k=>{ONO[k]=v});
  add('BAM',['HIT!','COUP !','TOUCHÉ !','RAMMED!','PERCUTÉ !']);
  add('FWOOOSH',['BURNED!','BRÛLÉ !']);
  add('KRAAAK',['CRUSHED!','ÉCRASÉ !']);
  add('BOOM',['EXPLOSION!','EXPLOSION !','BOOM!','BOUM !']);
  add('CHAK',['HOOKED!','ACCROCHÉ !']);
  add('SKRAAT',['CLAWED!','GRIFFÉ !']);
  add('CLANG',['PARRY!','PARADE !','PARRIED!','PARÉ !','DOUBLE PARRY!','DOUBLE PARADE !','TRIPLE PARRY!','TRIPLE PARADE !','DISARMED!','DÉSARMÉ !']);
  add('THUNK',['STUCK!','PLANTÉ !']);
  add('KRAKOOM',['FINAL BLOW!','COUP ULTIME !']);
  add('CRAAAC',['WING SHATTERED!','AILE BRISÉE !']);
  add('GRAAAH!',['GRAAAH!']);add('GRAAAH !',['GRAAAH !']);add('RAAAH!',['RAAAH!']);add('RAAAH !',['RAAAH !']);
  add('PHASE II',['PHASE II']);add('PHASE III',['PHASE III']);
  ['BAM','FWOOOSH','KRAAAK','BOOM','CHAK','SKRAAT','CLANG','THUNK','CRAAAC','KRAKOOM'].forEach(k=>{ONO[k]=k});
})();
function ono(t){return ONO[t]||null}
/* Taille des onomatopées : plus le coup est lourd, plus le mot est gros. */
const ONOSZ={BAM:44,FWOOOSH:46,KRAAAK:48,BOOM:52,CHAK:42,SKRAAT:46,CLANG:44,THUNK:42,CRAAAC:52,KRAKOOM:68};
/* Son d'impact : un coup sourd grave et un claquement de bruit ; p = puissance (0,3 léger, 1 lourd, 1,5 coup fatal). */
function thud(p){boom(.2+.12*p,.1+.05*p);noise(.09+.05*p,.14+.07*p,2400,240)}
/* Cris du Colosse quand il est touché : six voix différentes (texte et son), choisies selon la force du coup et sa vie restante, sans jamais répéter deux fois la même. */
const CRIES=[
  {t:['GRAAAH!','GRAAAH !'],f:95,s0:1.3,up:1.5,pk:.12,dn:.5,d:.95,v:.16,fa:900,fb:900,fc:220,q:1,vr:38,vd:30,r:.3},
  {t:['RAAAH!','RAAAH !'],f:150,s0:1,up:1.9,pk:.2,dn:.55,d:.8,v:.14,bp:1,fa:1100,fb:1600,fc:500,q:2.2,vr:9,vd:20,r:.5},
  {t:['HRRNGH!','HRRNGH !'],f:80,s0:1.2,up:1.1,pk:.08,dn:.7,d:.32,v:.14,fa:700,fb:700,fc:300,q:1,vr:55,vd:18,r:.6},
  {t:['KHAAAA!','KHAAAA !'],f:210,s0:1,up:1.2,pk:.15,dn:.8,d:.7,v:.07,bp:1,fa:2400,fb:2400,fc:900,q:1.2,vr:20,vd:8,r:1.5},
  {t:['GWOOOAR!','GWOOOAR !'],f:62,s0:1.6,up:1.2,pk:.25,dn:.4,d:1.25,v:.18,fa:700,fb:700,fc:150,q:1,vr:6,vd:10,r:.2},
  {t:['AARRGH!','AARRGH !'],f:190,s0:.9,up:2.1,pk:.35,dn:.5,d:1,v:.13,bp:1,fa:1300,fb:2100,fc:450,q:2.5,vr:13,vd:45,r:.5}
];
CRIES.forEach(c=>c.t.forEach(s=>{ONO[s]=s}));
let LASTCRY=-1;
function cryVoice(c){
  if(!prefs.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  try{
    const n=AC.currentTime,d=c.d,g=AC.createGain(),f=AC.createBiquadFilter(),lfo=AC.createOscillator(),lg=AC.createGain();
    f.type=c.bp?'bandpass':'lowpass';f.Q.value=c.q;
    f.frequency.setValueAtTime(c.fa,n);f.frequency.linearRampToValueAtTime(c.fb,n+d*c.pk);f.frequency.exponentialRampToValueAtTime(c.fc,n+d);
    g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(c.v,n+Math.min(.06,d*.15));g.gain.setValueAtTime(c.v,n+d*.3);g.gain.exponentialRampToValueAtTime(.0001,n+d);
    lfo.frequency.setValueAtTime(c.vr,n);lg.gain.setValueAtTime(c.vd*.5,n);lg.gain.linearRampToValueAtTime(c.vd,n+d);lfo.connect(lg);
    [[1,'sawtooth'],[1.5,'square'],[.5,'sawtooth']].forEach(([m,ty])=>{
      const o=AC.createOscillator(),fr=c.f*m;o.type=ty;
      o.frequency.setValueAtTime(fr*c.s0,n);o.frequency.exponentialRampToValueAtTime(fr*c.up,n+d*c.pk);o.frequency.exponentialRampToValueAtTime(fr*c.dn,n+d);
      lg.connect(o.frequency);o.connect(f);o.start(n);o.stop(n+d);
    });
    lfo.start(n);lfo.stop(n+d);f.connect(g);g.connect(AC.destination);
  }catch(e){}
  if(c.r)noise(c.d*.7,c.v*c.r,2600,700);
}
/* Joue un cri et renvoie son texte. heavy : coup lourd ; hp : PV restants du Colosse (≤ 3 : cris plus déchirés). */
function hurtCry(heavy,hp){
  const pool=hp!=null&&hp<=3?[5,4,1,2]:heavy?[0,1,4,5]:[2,1,0,3];
  let i;do{i=pool[Math.floor(Math.random()*pool.length)]}while(i===LASTCRY);
  LASTCRY=i;cryVoice(CRIES[i]);
  return _(CRIES[i].t[0],CRIES[i].t[1]);
}
/* Cri de la foudre : deux voix superposées (un beuglement grave et un hurlement déchiré), très long, bien plus fort que les autres. */
const MEGA={t:['GRAAAAAAAH!','GRAAAAAAAH !'],
  a:{f:70,s0:1.8,up:2.3,pk:.3,dn:.35,d:2.2,v:.24,fa:900,fb:1500,fc:200,q:1.4,vr:8,vd:35,r:.5},
  b:{f:200,s0:.9,up:2.2,pk:.35,dn:.5,d:1.7,v:.11,bp:1,fa:1300,fb:2300,fc:450,q:2.5,vr:13,vd:50,r:.6}};
MEGA.t.forEach(s=>{ONO[s]=s});
function megaCry(){cryVoice(MEGA.a);cryVoice(MEGA.b);LASTCRY=-1;return _(MEGA.t[0],MEGA.t[1])}
/* Cri du Colosse en phase I : toujours à côté de sa tête, jamais sur le point d'impact. */
function cry1(heavy){float(hurtCry(heavy,G.bhp),HEAD[0]-70,HEAD[1]-50,heavy?'#ffc15a':'#ffb347')}
function float(txt,x,y,col){txt=ono(txt);if(!txt)return;G.floats.push({txt,x,y,col,sz:ONOSZ[txt]||38,life:.9,max:.9})}

/* ---------- game logic ---------- */
function liftAmt(){
  if(G.pl.s==='final'){const t=G.pl.t;return 80*Math.sin(Math.PI*clamp01((t-2.9)/.7))-clamp01((t-3.3)/.5)*430}
  const b=G.boss;
  if(b.s==='lift')return b.t<.12?0:LIFT_MAX*eo(clamp01((b.t-.12)/.43));
  if(b.s==='hold')return LIFT_MAX;
  if(b.s==='slam')return LIFT_MAX*(1-ei(clamp01(b.t/.16)));
  return 0;
}
/* Le bouclier est levé (ou vient juste de retomber : tolérance de 0,06 s). */
function blocked(){const p=G.pl;return p.s==='barrier'||(p.s==='recover'&&p.t<.06)}
function resolveStrike(){
  const p=G.pl,b=G.boss;
  const warded=blocked();
  if(warded&&b.dbl){ /* chaîne double : premier coup paré, le second arrive 0,5 s plus tard */
    b.dbl=false;b.sk=.32;
    parrySuccess(BAR[0],BAR[1]);
    b.s='rewind';b.t=0;
    say(_('First hit parried.','Premier coup paré.'));
    return;
  }
  b.dbl=false;b.sk=0;
  if(warded){
    if(b.combo)startComboFlame('head');else{b.s='rebound';b.t=0}
    G.parries++;G.hitstop=.08;G.flash=.35;G.shake=Math.max(G.shake,reduce?0:5);thud(.4);
    ring(BAR[0],BAR[1]);
    burst(BAR[0],BAR[1],26,['#bfeaff','#6fd3ff','#ffffff']);
    float(_('PARRY!','PARADE !'),BAR[0]-30,BAR[1]-110,'#bfeaff');
    tone(880,.28,'square',.05,-260);tone(1400,.2,'sine',.04);
    say(_('Parry successful.','Parade réussie.'));
  }else{
    b.s='lift';b.t=0;p.s='grabbed';p.t=0;
    float(_('HOOKED!','ACCROCHÉ !'),PX,DECK-190,'#ff8a6b');
    tone(150,.2,'sawtooth',.06,-80);
    say(_('Caught by the hook.','Accroché par le crochet.'));
  }
}
function headHit(){
  const b=G.boss;
  G.bhp=Math.max(0,G.bhp-DMG_PARRY);G.recoil=1;G.shake=reduce?0:13;G.hitstop=.11;G.flash=.4;thud(1.2);ring(HEAD[0],HEAD[1]);
  burst(HEAD[0],HEAD[1],22,['#ffffff','#ffc15a','#ff7a2b']);
  tone(170,.25,'square',.08,-110);
  if(G.bhp<=0){b.s='dead';b.t=0;G.mode='won';G.endIn=1.4;say(_('The Colossus is on his knees. Phase I cleared.','Le Colosse est à genoux. Phase I terminée.'))}
  else{b.s='stagger';b.t=0;b.stagT=0}
}
function slamHit(){
  const b=G.boss,p=G.pl;
  G.php=Math.max(0,G.php-DMG_GRAB);G.grabs++;G.shake=reduce?0:15;G.hurt=.35;G.hitstop=.1;thud(1.3);
  dust(PX,DECK);tone(80,.35,'sine',.14,-40);burst(PX+10,DECK-60,24,['#ffc15a','#ff7a2b','#ffffff']);float(_('BOOM!','BOUM !'),PX,DECK-190,'#ff8a6b');
  p.s='down';p.t=0;p.downT=.9;b.s='release';b.t=0;
  if(G.php<=0){G.mode='lost';G.endIn=1.1;say(_('You are down. Defeat.','Tu es à terre. Défaite.'))}
}
function startAttack(){
  const b=G.boss,a=G.atk;
  if(DIFF.fury[G.bhp]){startFury(DIFF.fury[G.bhp]);return}
  const kinds=['whip','sword','flame'];
  let k=a.last===''?'whip':kinds[Math.floor(Math.random()*3)];
  if(k===a.last&&a.n>=2){const o=kinds.filter(x=>x!==k);k=o[Math.floor(Math.random()*2)]}
  /* Difficile : un crochet ou un marteau peut être suivi de souffles sans respiration ; le contre n'arrive qu'après les avoir parés. */
  let combo=false;
  if(DIFF.hard&&k!=='flame'){
    const c=DIFF.chain.find(x=>G.bhp<=x[0]);
    combo=!!c&&(a.plain>=2||Math.random()<c[1]);
  }
  a.n=(k===a.last)?a.n+1:1;a.last=k;
  b.t=0;clearMods(b);b.combo=combo;
  /* Difficile : « plain » compte les attaques simples d'affilée (crochet simple, souffle normal) pour que les variantes reviennent régulièrement. */
  const was=a.plain;
  a.plain=(k==='sword'||combo)?0:was+1;
  if(k==='whip'){
    b.s='windup';tone(110,.5,'sawtooth',.03,60);
    if(DIFF.hard&&(Math.random()<.5||was>=1)){b.dbl=true;dblTell()} /* chaîne double (garantie après une attaque « simple ») */
  }
  else if(k==='sword'){b.s='sw1w';G.sw.p1=false;G.sw.p2=false;G.sw.p3=false;tone(180,.6,'sawtooth',.04,140)}
  else{
    b.s='fl_in';tone(90,.6,'sawtooth',.05,90);
  }
  if(k==='whip'&&b.dbl)a.plain=0;
}
function parrySuccess(x,y){
  const p=G.pl;
  G.parries++;G.hitstop=.08;G.flash=.35;G.shake=Math.max(G.shake,reduce?0:5);thud(.4);
  ring(x,y);burst(x,y,26,['#bfeaff','#6fd3ff','#ffffff']);
  float(_('PARRY!','PARADE !'),x-30,y-110,'#bfeaff');
  tone(880,.28,'square',.05,-260);tone(1400,.2,'sine',.04);
  p.s='ready';p.t=0;
}
function resolveSword(n){
  const b=G.boss,p=G.pl,pt=n===2?VHIT:BAR;
  const warded=blocked();
  anvil();forgeSparks(G,warded?pt[0]:PX+10,warded?pt[1]:DECK-70,warded?16:10);
  G.sw['p'+n]=warded;
  G.kick=warded?1:0;
  if(warded){
    parrySuccess(pt[0],pt[1]);
    say([_('First','Premier'),_('Second','Second'),_('Third','Troisième')][n-1]+_(' hit parried.',' coup paré.'));
  }else{
    G.php=Math.max(0,G.php-DMG_SWORD);G.grabs++;
    G.shake=reduce?0:13;G.hurt=.3;G.hitstop=.07;thud(1);
    burst(PX+10,DECK-70,16,['#ffc15a','#ff7a2b','#ffffff']);dust(PX,DECK);
    float(_('HIT!','COUP !'),PX,DECK-190,'#ff8a6b');
    tone(90,.3,'sine',.12,-40);
    p.s='down';p.t=0;p.downT=n<(DIFF.hard?3:2)?.3:.55; /* un coup suit : on se relève assez vite pour parer */
    say(_(`Struck by the hammer.`,`Frappé par le marteau.`));
    if(G.php<=0){G.mode='lost';G.endIn=1.1;say(_('You are down. Defeat.','Tu es à terre. Défaite.'))}
  }
  const last=DIFF.hard?3:2;
  if(n===1){b.s='swgap';b.t=0}
  else if(n<last){b.s='sw3g';b.t=0}
  else if(G.sw.p1&&G.sw.p2&&(!DIFF.hard||G.sw.p3)){
    if(b.combo)startComboFlame('orb');else startOrb();
  }else{b.s='swrec';b.t=0}
}
/* Combo paré : le Veilleur lance l'orbe de lumière. */
function startOrb(){
  const b=G.boss,p=G.pl;
  b.s='orb';b.t=0;p.s='cast';p.t=0;
  float(DIFF.hard?_('TRIPLE PARRY!','TRIPLE PARADE !'):_('DOUBLE PARRY!','DOUBLE PARADE !'),PX+150,DECK-250,'#ffffff');
  tone(400,.6,'sine',.05,400);
  say(_('Combo parried. The Watcher hurls an orb of light.','Combo paré. Le Veilleur lance une orbe de lumière.'));
}
function orbHit(){
  const b=G.boss;
  G.bhp=Math.max(0,G.bhp-DMG_ORB);G.recoil=1;G.shake=reduce?0:12;G.hitstop=.12;G.flash=.6;
  ring(ORB_T[0],ORB_T[1]);
  burst(ORB_T[0],ORB_T[1],36,['#ffffff','#fff2b8','#bfeaff','#ffc15a']);
  tone(660,.5,'sine',.08,500);tone(200,.3,'square',.06,-120);thud(1.3);cry1(true);
  if(G.bhp<=0){b.s='dead';b.t=0;G.mode='won';G.endIn=1.4;say(_('The Colossus is on his knees. Phase I cleared.','Le Colosse est à genoux. Phase I terminée.'))}
  else{b.s='hurt';b.t=0;b.hurtT=1.1;say(_('Orb of light, dead center.','Orbe de lumière en plein cœur.'))}
}
function dblTell(){tone(1100,.08,'square',.045,-200);setTimeout(()=>tone(1100,.08,'square',.045,-200),110)}
/* Après un crochet ou un marteau paré : deux souffles sans respiration ; le contre (pend) n'est donné qu'une fois les deux parés. */
function startComboFlame(pend){
  const b=G.boss,p=G.pl;
  b.pend=pend;b.s='fl_in';b.t=0;b.fli=.35;b.dbf=true;b.second=false;
  p.s='ready';p.t=0;
  chainTell();
  say(pend==='head'?_('Hit parried. Flames follow!','Coup paré. Des souffles enchaînent !'):_('Combo parried. Flames follow!','Combo paré. Des souffles enchaînent !'));
}
function chainTell(){tone(1500,.14,'square',.05,-800);tone(950,.24,'sawtooth',.04,-350);G.flash=Math.max(G.flash,.2)}
function resolveFlame(){
  const b=G.boss,p=G.pl;
  const warded=p.s==='barrier'&&p.t<=T.flwin+.03;
  if(warded&&b.dbf&&!b.second){ /* premier souffle paré : le second arrive 0,3 s plus tard */
    b.second=true;b.s='fl_in';b.t=0;b.fli=.3;
    parrySuccess(BAR[0],BAR[1]);chainTell();
    say(_('Breath parried. A second breath is coming!','Souffle paré. Un second souffle arrive !'));
    return;
  }
  b.dbf=false;
  b.pend=null;
  if(warded){
    parrySuccess(BAR[0],BAR[1]);
    p.s='dash';p.t=0;b.s='fl_stab';b.t=0;
    tone(500,.3,'sawtooth',.05,300);
    say(_('Breath parried. The Watcher rushes the Colossus.','Souffle paré. Le Veilleur fonce sur le Colosse.'));
  }else{
    G.php=Math.max(0,G.php-DMG_FLAME);G.grabs++;
    G.shake=reduce?0:13;G.hurt=.4;G.hitstop=.08;thud(1.2);
    burst(PX+10,DECK-70,24,['#ffc15a','#ff7a2b','#ff4d1a']);
    float(_('BURNED!','BRÛLÉ !'),PX,DECK-190,'#ff8a6b');
    tone(120,.5,'sawtooth',.1,-60);
    p.s='down';p.t=0;p.downT=.9;b.s='fl_rec';b.t=0;
    say(_('Burned by the flame breath.','Brûlé par le souffle de flamme.'));
    if(G.php<=0){G.mode='lost';G.endIn=1.1;say(_('You are down. Defeat.','Tu es à terre. Défaite.'))}
  }
}
function legHit(){
  const b=G.boss;
  G.bhp=Math.max(0,G.bhp-DMG_STAB);G.recoil=.6;G.shake=reduce?0:11;G.hitstop=.1;G.flash=.3;G.wound=1.6;
  burst(BX-62,DECK-58,26,['#ffc15a','#ff7a2b','#ffffff']);
  tone(220,.25,'square',.08,-120);tone(90,.3,'sawtooth',.06,-40);cry1(false);
  for(let i=0;i<26;i++){const L=rand(.4,.9);G.sparks.push({x:BX-62+rand(-14,14),y:DECK-58,vx:rand(-120,60),vy:-rand(160,420),g:-40,life:L,max:L,col:['#ffc15a','#ff7a2b','#fff2b8'][i%3],sz:rand(4,9)})}
  if(G.bhp<=0){b.s='dead';b.t=0;G.mode='won';G.endIn=1.4;say(_('The Colossus is on his knees. Phase I cleared.','Le Colosse est à genoux. Phase I terminée.'))}
  else{b.s='hurt';b.t=0;b.hurtT=1;say(_(`The lantern flares: the Colossus's leg goes dark.`,`La lanterne éclate : la jambe du Colosse noircit.`))}
}
/* j = jet de feu, b = souffle, r = rocher. Normal : jets (+ rocher à 1 PV). Difficile : séquences propres à chaque rage. */
function furySeq(lvl){
  if(DIFF.hard)return {5:'jjjjjj',6:'jjbbjj',1:'jjbbrrr'}[lvl].split('');
  return ('j'.repeat(DIFF.jets)+(lvl===1?'r':'')).split('');
}
function startFury(lvl){
  const b=G.boss,seq=furySeq(lvl);
  G.fy={lvl,i:0,miss:0,seq,ok:seq.map(()=>false),rocks:0};
  b.s='fy_roar';b.t=0;b.fury=lvl;
  tone(70,1,'sawtooth',.08,40);
  say(_('The Colossus flies into a fury.','Le Colosse entre en fureur.'));
}
function hurtPlayer(label){
  const p=G.pl;
  G.php=Math.max(0,G.php-1);G.grabs++;G.shake=reduce?0:13;G.hurt=.35;G.hitstop=.07;thud(1);
  burst(PX+10,DECK-70,22,['#ffc15a','#ff7a2b','#ff4d1a']);dust(PX,DECK);
  float(ono(label)||'BAM',PX,DECK-190,'#ff8a6b');
  tone(110,.4,'sawtooth',.1,-60);
  p.s='down';p.t=0;p.downT=.55;
  say(_('Hit.','Touché.'));
  if(G.php<=0){G.mode='lost';G.endIn=1.1;say(_('You are down. Defeat.','Tu es à terre. Défaite.'))}
}
/* Étape suivante de la fureur (ou fin). */
function fyEnter(c){
  const b=G.boss,F=G.fy;
  b.t=0;clearMods(b);
  if(c==='j')b.s=F.i?'fy_gap':'fy_t';
  else if(c==='r'){b.s='rk_t';b.rki=F.rocks++%RKX.length}
  else{b.s='fl_in';b.fyb=true;b.fli=F.seq[F.i-1]==='b'?.3:.45;tone(90,.5,'sawtooth',.05,90)}
}
function fyDone(){
  const F=G.fy;
  F.i++;
  if(G.mode!=='play'||F.i>=F.seq.length)endFury();
  else fyEnter(F.seq[F.i]);
}
function resolveJet(){
  const F=G.fy;
  const warded=blocked();
  F.ok[F.i]=warded;
  G.jf={o:JET_O[F.i%4],t:.22};
  if(warded){parrySuccess(BAR[0],BAR[1])}
  else{F.miss++;hurtPlayer(_('BURNED!','BRÛLÉ !'))}
  fyDone();
}
function resolveFuryBreath(){
  const p=G.pl,F=G.fy;
  const warded=p.s==='barrier'&&p.t<=T.flwin+.03;
  F.ok[F.i]=warded;
  if(warded){parrySuccess(BAR[0],BAR[1]);float(_('PARRIED!','PARÉ !'),BAR[0]+60,BAR[1]-170,'#ffd166')}
  else{F.miss++;burst(PX+10,DECK-70,24,['#ffc15a','#ff7a2b','#ff4d1a']);hurtPlayer(_('BURNED!','BRÛLÉ !'))}
  fyDone();
}
function resolveRock(){
  const F=G.fy;
  const warded=blocked();
  F.ok[F.i]=warded;
  burst(RK[0],RK[1],warded?20:34,['#ff9a3c','#ffc15a','#6b5a63','#ffffff']);
  if(warded){parrySuccess(RK[0],RK[1]);say(_('Rock parried.','Rocher paré.'))}
  else{F.miss++;hurtPlayer(_('CRUSHED!','ÉCRASÉ !'))}
  fyDone();
}
function endFury(){
  const b=G.boss,p=G.pl,F=G.fy;
  if(G.mode!=='play'||F.miss>0){b.s='fy_fail';b.t=0;return}
  if(F.lvl===5||F.lvl===6){
    b.s='fy_cast';b.t=0;p.s='ring';p.t=0;p.fired=false;
    say(_('Fury parried. The Watcher raises his lantern.','Fureur parée. Le Veilleur lève sa lanterne.'));
  }else startFinal();
}
function startFinal(){
  const b=G.boss,p=G.pl;
  b.s='fin';b.t=0;p.s='final';p.t=0;p.fired=true;
  G.fin={a:false,b:false,c:false};
  G.mode='won';G.p2=true;G.endIn=3.9;
  say(_('The Watcher raises his lantern.','Le Veilleur lève sa lanterne.'));
}
function ringHit(){
  const b=G.boss;
  G.bhp=Math.max(0,G.bhp-1);G.recoil=1;G.shake=reduce?0:12;G.hitstop=.12;G.flash=.6;
  burst(BX-70,DECK-150,36,['#ffffff','#fff2b8','#bfeaff']);
  tone(660,.5,'sine',.08,500);thud(1.3);cry1(true);
  b.s='hurt';b.t=0;b.hurtT=1.25;b.fury=0;
  say(_("The lantern's halo strikes the Colossus.",'Le halo de la lanterne frappe le Colosse.'));
}
function bossStep(dt){
  const b=G.boss;b.t+=dt;
  switch(b.s){
    case 'idle':if(G.mode==='play'&&b.t>=b.wait)startAttack();break;
    case 'windup':if(b.t>=T.windup){b.s='strike';b.t=0;tone(260,.14,'sawtooth',.06,-160)}break;
    case 'rewind':if(b.t>=.18){b.s='strike';b.t=0;tone(260,.14,'sawtooth',.06,-160)}break;
    case 'strike':if(b.t>=(b.sk||T.strike))resolveStrike();break;
    case 'rebound':if(b.t>=T.rebound)headHit();break;
    case 'stagger':if(b.t>=(b.stagT||T.stagger))toIdle();break;
    case 'lift':if(b.t>=.55){b.s='hold';b.t=0}break;
    case 'hold':if(b.t>=.22){b.s='slam';b.t=0}break;
    case 'slam':if(b.t>=.16)slamHit();break;
    case 'release':if(b.t>=.6)toIdle();break;
    case 'sw1w':if(b.t>=T.sw1w){b.s='sw1';b.t=0;tone(300,.12,'sawtooth',.06,-180)}break;
    case 'sw1':if(b.t>=T.sw1)resolveSword(1);break;
    case 'swgap':if(b.t>=T.swgap){b.s='sw2w';b.t=0}break;
    case 'sw2w':if(b.t>=T.sw2w){b.s='sw2';b.t=0;tone(240,.14,'sawtooth',.06,-160)}break;
    case 'sw2':if(b.t>=T.sw2)resolveSword(2);break;
    case 'sw3g':if(b.t>=T.sw3g){b.s='sw3w';b.t=0}break;
    case 'sw3w':if(b.t>=T.sw3w){b.s='sw3';b.t=0;tone(300,.12,'sawtooth',.06,-180)}break;
    case 'sw3':if(b.t>=T.sw3)resolveSword(3);break;
    case 'swrec':if(b.t>=T.swrec)toIdle();break;
    case 'orb':if(b.t>=T.cast+T.orb)orbHit();break;
    case 'fl_in':if(b.t>=(b.fli||T.fli)){b.s='fl_out';b.t=0;tone(200,.25,'sawtooth',.07,-120)}break;
    case 'fl_out':if(b.t>=T.flo){if(b.fyb)resolveFuryBreath();else resolveFlame()}break;
    case 'fl_rec':if(b.t>=T.flrec)toIdle();break;
    case 'fl_stab':if(b.t>=T.dash+.1)legHit();break;
    case 'hurt':if(b.t>=b.hurtT)toIdle();break;
    case 'fy_roar':if(b.t>=1.0)fyEnter(G.fy.seq[0]);break;
    case 'fy_t':if(b.t>=T.fyt){b.s='fy_j';b.t=0;tone(220,.15,'sawtooth',.06,-120)}break;
    case 'fy_j':if(b.t>=.3)resolveJet();break;
    case 'fy_gap':if(b.t>=T.fyg){b.s='fy_t';b.t=0}break;
    case 'rk_t':if(b.t>=.5){b.s='rk_j';b.t=0;tone(150,.5,'sawtooth',.05,-80)}break;
    case 'rk_j':if(b.t>=.55)resolveRock();break;
    case 'fy_cast':if(b.t>=T.ringAt+.55)ringHit();break;
    case 'fy_fail':if(b.t>=.9)toIdle();break;
    case 'fin':{
      const F=G.fin;
      if(!F.a&&b.t>=.5){
        F.a=true;G.shake=reduce?0:8;G.flash=.35;
        dust(PX,DECK);burst(PX,DECK,24,['#ffffff','#fff2b8','#bfeaff']);
        tone(110,.5,'sine',.12,-50);tone(700,.6,'sine',.06,500);
      }
      if(!F.b&&b.t>=1.1){
        /* gros impact : le rayon explose sur le torse du Colosse, qui recule sous le choc */
        F.b=true;G.bhp=0;G.shake=reduce?0:26;G.flash=.95;
        const cx=BX-40,cy=DECK-200;
        burst(cx,cy,70,['#ffffff','#bfeaff','#6fd3ff','#ffc15a']);burst(cx+30,cy+40,40,['#ffffff','#fff2b8','#ffc15a','#ff7a2b']);burst(cx-10,cy-50,30,['#ffffff','#bfeaff']);
        boom(1.6,.28);tone(55,1.2,'sawtooth',.14,-20);tone(1200,.8,'sine',.06,-600);noise(.5,.2,5000,400);painCry(1.9,.2);
        float(_('BOOM!','BOUM !'),BX-160,DECK-320,'#ffffff');
      }
      if(!F.r&&b.t>=1.55){F.r=true;whoosh(.5,.08,true);painCry(.8,.1);say(_('Staggered, the Colossus raises his hammer.','Ébranlé, le Colosse lève son marteau.'))}
      if(!F.s&&b.t>=2.0){
        /* coup de marteau devant lui : le pont éclate et s'ouvre */
        F.s=true;G.shake=reduce?0:22;G.flash=.35;anvil();boom(1.1,.22);
        burst(HOLE_X,DECK,50,['#ffc15a','#ff7a2b','#9a8a9e','#ffffff']);forgeSparks(G,HOLE_X,DECK-6,44);dust(HOLE_X-60,DECK);dust(HOLE_X+60,DECK);
      }
      if(!F.j&&b.t>=2.25){F.j=true;whoosh(.6,.1,false);say(_(`The Colossus dives through the breach into the Foundry. The Watcher leaps after him.`,`Le Colosse plonge par la brèche dans la Fonderie. Le Veilleur saute à sa poursuite.`))}
      if(!F.c&&b.t>=2.75){F.c=true;boom(.8,.12)}
      break;}
  }
}
function pips(box,n,max,marks){
  if(box.children.length!==max){
    box.textContent='';
    for(let i=0;i<max;i++)box.appendChild(document.createElement('span'));
  }
  for(let i=0;i<max;i++){box.children[i].classList.toggle('on',i<n);box.children[i].classList.toggle('mark',marks.includes(i))}
}
let lastP=-1,lastB=-1,tries=[0,0,0,0],cntS=null;
function trStr(ph){const n=RUN.on?RUN.n:(tries[ph]||1);return ' · '+(n>1?_('Attempts ','Essais '):_('Attempt ','Essai '))+n}
function hud(){
  const S=R||Q||G;
  if(S!==cntS&&S.mode==='play'){cntS=S;tries[R?3:Q?2:1]++}
  if(S.php!==lastP){pips(el.hpP,S.php,DIFF.php,[]);$('hpPn').textContent=S.php+'/'+DIFF.php;lastP=S.php}
  const bmax=S===R?DIFF.rbhp:DIFF.bhp,bk=S===G?1:S===R?3:2;
  if(S.bhp!==lastB||S.mkBox!==bk){S.mkBox=bk;pips(el.hpB,S.bhp,bmax,S===G?DIFF.mk1:S===R?DIFF.mkR:DIFF.mk);$('hpBn').textContent=S.bhp+'/'+bmax;lastB=S.bhp}
}
function step(dt){
  G.time+=dt;
  for(const e of G.embers){e.y-=e.v*dt;e.x+=Math.sin(G.time*.8+e.ph)*8*dt;if(e.y<-10){e.y=H+10;e.x=rand(0,W)}}
  for(let i=G.sparks.length-1;i>=0;i--){const s=G.sparks[i];s.life-=dt;if(s.life<=0){G.sparks.splice(i,1);continue}s.vy+=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt}
  for(let i=G.rings.length-1;i>=0;i--){G.rings[i].life-=dt;if(G.rings[i].life<=0)G.rings.splice(i,1)}
  for(let i=G.floats.length-1;i>=0;i--){G.floats[i].life-=dt;if(G.floats[i].life<=0)G.floats.splice(i,1)}
  G.shake=Math.max(0,G.shake-dt*45);G.flash=Math.max(0,G.flash-dt*2.2);G.hurt=Math.max(0,G.hurt-dt*1.6);G.recoil=Math.max(0,G.recoil-dt*3.5);G.kick=Math.max(0,G.kick-dt*5);G.wound=Math.max(0,G.wound-dt*.5);
  if(G.endIn>0){G.endIn-=dt;if(G.endIn<=0){if(G.mode==='won'&&G.p2&&RUN.on)beginP2(true);else showEnd()}}
  if(G.hitstop>0){G.hitstop-=dt;return}
  const p=G.pl;p.t+=dt;p.deny=Math.max(0,p.deny-dt);
  if(p.s==='barrier'&&p.t>=T.barrier){p.s='recover';p.t=0}
  else if(p.s==='recover'&&p.t>=T.recovery){p.s='ready';p.t=0}
  else if(p.s==='down'&&G.mode==='play'&&p.t>=(p.downT||.9)){p.s='ready';p.t=0}
  else if(p.s==='cast'&&p.t>=T.cast+T.orb){p.s='ready';p.t=0}
  else if(p.s==='dash'&&p.t>=T.dash){p.s='stab';p.t=0}
  else if(p.s==='stab'&&p.t>=.3){p.s='back';p.t=0}
  else if(p.s==='back'&&p.t>=T.back){p.s='ready';p.t=0}
  else if(p.s==='ring'&&p.t>=T.ringAt+.55){p.s='ready';p.t=0}
  if(p.s==='dash')p.x=PX+(STAB_X-PX)*eo(clamp01(p.t/T.dash));
  else if(p.s==='stab')p.x=STAB_X;
  else if(p.s==='back')p.x=STAB_X-(STAB_X-PX)*es(clamp01(p.t/T.back));
  else if(p.s==='final')p.x=p.t<2.9?PX:PX+(HOLE_X-PX)*es(clamp01((p.t-2.9)/.6));
  else p.x=PX;
  if(p.s==='dash')G.sparks.push({x:p.x,y:DECK-3,vx:rand(-60,-10),vy:-rand(10,60),g:200,life:.4,max:.4,col:'#9a8a9e',sz:rand(2,4)});
  if(p.s==='ring'&&!p.fired&&p.t>=T.ringAt){
    p.fired=true;G.ringFx={t:0};G.shake=reduce?0:9;G.flash=.3;dust(PX,DECK);
    tone(120,.4,'sine',.12,-60);tone(800,.5,'sine',.05,400);
  }
  if(G.ringFx){G.ringFx.t+=dt;if(G.ringFx.t>.8)G.ringFx=null}
  if(G.jf){G.jf.t-=dt;if(G.jf.t<=0)G.jf=null}
  if(G.mode==='intro')introStep(dt);
  bossStep(dt);
  hud();
}

/* ---------- static layers ---------- */
const bgFar=document.createElement('canvas'),bgBridge=document.createElement('canvas'),vig=document.createElement('canvas');
[bgFar,bgBridge,vig].forEach(c=>{c.width=W*dpr;c.height=H*dpr});
function buildStatic(){
  let c=bgFar.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
  let g=c.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#07050b');g.addColorStop(.5,'#150c19');g.addColorStop(1,'#3a1210');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  [60,210,380,560,700,850].forEach((x,i)=>{
    const w=54+(i%3)*14;
    c.fillStyle='#120d19';c.fillRect(x-w/2,70,w,430);
    c.fillStyle='rgba(120,80,140,.08)';c.fillRect(x-w/2,70,5,430);
    c.fillStyle='#17101e';c.fillRect(x-w/2-8,64,w+16,14);
  });
  c.fillStyle='#0a070e';
  for(let x=-20;x<W+20;x+=40){
    const h=30+Math.abs(Math.sin(x*.37))*90;
    c.beginPath();c.moveTo(x,0);c.lineTo(x+44,0);c.lineTo(x+22,h);c.closePath();c.fill();
  }
  c=bgBridge.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
  c.fillStyle='#241c2b';c.fillRect(0,DECK,W,30);
  c.fillStyle='#3a2f46';c.fillRect(0,DECK-4,W,6);
  c.fillStyle='rgba(0,0,0,.35)';
  for(let x=0,i=0;x<W;x+=48,i++)c.fillRect(x+(i%2)*14,DECK+3,2,24);
  c.fillStyle='#17121e';c.fillRect(0,DECK+30,W,H-DECK-30);
  c.globalCompositeOperation='destination-out';
  for(let cx=120;cx<W+120;cx+=240){c.beginPath();c.arc(cx,H+4,92,Math.PI,0);c.fill()}
  c.globalCompositeOperation='source-over';
  c.strokeStyle='#33283d';c.lineWidth=3;
  for(let cx=120;cx<W+120;cx+=240){c.beginPath();c.arc(cx,H+4,92,Math.PI,0);c.stroke()}
  c.fillStyle='#4a3d57';c.fillRect(0,DECK+28,W,2);
  c=vig.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
  const vg=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.9);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');
  c.fillStyle=vg;c.fillRect(0,0,W,H);
}

/* ---------- drawing helpers ---------- */
function drawWizard(o){
  const W=!!o.white;
  /* Le Veilleur : heaume à visière, manteau d'ordre, tabard à l'emblème de la lanterne */
  const cg=ctx.createLinearGradient(0,-96,0,0);if(W){cg.addColorStop(0,'#ffffff');cg.addColorStop(1,'#cfd7f2')}else{cg.addColorStop(0,'#3c4a6e');cg.addColorStop(1,'#1e2538')}
  ctx.beginPath();
  ctx.moveTo(-16,-92);ctx.quadraticCurveTo(-26,-50,-34,0);
  ctx.lineTo(-23,-5+o.fl);ctx.lineTo(-12,1-o.fl);ctx.lineTo(0,-5+o.fl);ctx.lineTo(12,1-o.fl);ctx.lineTo(23,-5+o.fl);ctx.lineTo(34,0);
  ctx.quadraticCurveTo(26,-50,16,-92);ctx.closePath();
  ctx.fillStyle=cg;ctx.fill();ctx.strokeStyle=W?'#8f9bc4':'#121726';ctx.lineWidth=2;ctx.stroke();
  /* tabard */
  ctx.beginPath();ctx.moveTo(-8,-88);ctx.lineTo(8,-88);ctx.lineTo(9,-8+o.fl*.4);ctx.lineTo(0,-2);ctx.lineTo(-9,-8+o.fl*.4);ctx.closePath();
  ctx.fillStyle=W?'#eef0f8':'#c9b98a';ctx.fill();ctx.strokeStyle=W?'#b9c2e0':'#8a7a5a';ctx.lineWidth=1.2;ctx.stroke();
  ctx.strokeStyle=W?'#9aa6cc':'#6b5036';ctx.lineWidth=1.8;
  ctx.beginPath();ctx.arc(0,-64,5,0,6.283);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-73);ctx.lineTo(0,-69);ctx.stroke();
  /* ceinture */
  box(-27,-44,54,6,W?'#d6dcef':'#4a3a2a',W?'#aab3d4':'#2a1e14');
  /* épaulières */
  for(const sx of[-1,1]){ctx.beginPath();ctx.ellipse(sx*15,-89,13,7,0,0,6.283);ctx.fillStyle=W?'#f2f5ff':'#5d6f96';ctx.fill();ctx.strokeStyle=W?'#8f9bc4':'#161b2b';ctx.lineWidth=1.5;ctx.stroke()}
  /* cape du heaume (nuque) */
  poly([[-12,-112],[-28,-92],[-10,-94]],W?'#dfe5fa':'#2a3550');
  /* heaume */
  ctx.beginPath();ctx.moveTo(-15,-92);ctx.quadraticCurveTo(-19,-127,1,-128);ctx.quadraticCurveTo(20,-127,18,-92);ctx.closePath();
  ctx.fillStyle=W?'#f2f5ff':'#5d6f96';ctx.fill();ctx.strokeStyle=W?'#8f9bc4':'#161b2b';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle=W?'#e8dfc0':'#c9b98a';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-12,-119);ctx.quadraticCurveTo(1,-133,15,-119);ctx.stroke();
  ctx.strokeStyle=W?'#aab3d4':'#3a4a70';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-5,-99);ctx.lineTo(-5,-92);ctx.stroke();
  ctx.fillStyle=W?'#ffffff':'#bfeaff';ctx.fillRect(-1,-109,18,5);
}
/* Lanterne-sceptre : x,y = centre de la lumière ; ang oriente le haut de la lanterne ; g = intensité (0 à 1) */
function drawLantern(x,y,g,col,ang){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang||0);
  const gl=Math.max(0,g),rr=16+30*gl;
  const rg=ctx.createRadialGradient(0,0,2,0,0,rr);
  rg.addColorStop(0,'rgba(255,245,215,'+(.35+.5*gl)+')');rg.addColorStop(.5,'rgba(150,220,255,'+(.12+.25*gl)+')');rg.addColorStop(1,'rgba(111,211,255,0)');
  ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,0,rr,0,6.283);ctx.fill();
  poly([[-9,-12],[0,-20],[9,-12]],'#6b5036');
  ctx.strokeStyle='#8a7a9a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-23,3,0,6.283);ctx.stroke();
  ctx.fillStyle=col||'#ffd27a';ctx.fillRect(-8,-12,16,22);
  ctx.strokeStyle='#6b5036';ctx.lineWidth=2;ctx.strokeRect(-8,-12,16,22);
  ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-3,-12);ctx.lineTo(-3,10);ctx.moveTo(3,-12);ctx.lineTo(3,10);ctx.stroke();
  box(-10,10,20,4,'#4a3a2a','#2a1e14');
  /* petite cloche */
  ctx.strokeStyle='#8a7a9a';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(10,12);ctx.lineTo(14,16);ctx.stroke();
  ctx.beginPath();ctx.moveTo(10,26);ctx.quadraticCurveTo(10,16,14.5,16);ctx.quadraticCurveTo(19,16,19,26);ctx.closePath();
  ctx.fillStyle='#b8a46a';ctx.fill();ctx.strokeStyle='#6b5036';ctx.lineWidth=1;ctx.stroke();
  ctx.restore();
}
/* Sceptre dans le repère de la main (axe x = direction du sceptre), lanterne au bout, à la distance L */
function drawScepter(L,g,col){
  ctx.save();ctx.lineCap='round';ctx.strokeStyle='#8a7a9a';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(L-14,0);ctx.stroke();
  ctx.fillStyle='#6b5036';ctx.beginPath();ctx.arc(-18,0,3,0,6.283);ctx.fill();
  ctx.restore();
  drawLantern(L,0,g,col,Math.PI/2);
}
/* Éclat de lanterne : rayon court entre deux points */
function lanternBeam(A,B,w,al){
  ctx.save();ctx.lineCap='round';ctx.shadowColor='#6fd3ff';ctx.shadowBlur=24;
  ctx.strokeStyle='rgba(111,211,255,'+(.5*al)+')';ctx.lineWidth=w*1.8;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,'+al+')';ctx.lineWidth=w*.55;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();
  ctx.shadowBlur=0;ctx.fillStyle='rgba(235,250,255,'+(.8*al)+')';ctx.beginPath();ctx.arc(B[0],B[1],w*.9,0,6.283);ctx.fill();
  ctx.restore();
}
function bodyChain(t,hk){
  hk=hk||0;if(hk>=1)return;
  ctx.save();ctx.lineCap='round';
  const link=(x,y,a)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle='#9a8aa8';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,9,5.5,0,0,6.283);ctx.stroke();ctx.restore()};
  const A=[70,-228],B=[-62,-118],n=9;
  for(let i=0;i<=Math.round(n*(1-hk));i++){const k=i/n;link(A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,Math.atan2(B[1]-A[1],B[0]-A[0])+(i%2?1.5708:0))}
  /* crochet qui pend à la ceinture (il le décroche pour lancer l'attaque) */
  if(hk<.5){ctx.strokeStyle='#8a7a9a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-62,-118);ctx.lineTo(-58,-100);ctx.arc(-52,-92,8,3.3,-0.35,true);ctx.stroke();}
  ctx.restore();
}
function bodyAnvils(t){
  ctx.save();
  for(const sd of[-1,1]){ctx.save();ctx.scale(sd,1);
    qp([[96,-262],[150,-266],[176,-250],[150,-246],[140,-232],[112,-232],[104,-246]],'#3a2d44','#5a4666',2.5);
    ctx.strokeStyle='rgba(255,122,43,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(112,-256);ctx.lineTo(150,-258);ctx.stroke();
    ctx.restore()}
  ctx.restore();
}
/* La masse, quand le Colosse ne s'en sert pas : accrochée dans son dos, la tête dépasse derrière l'épaule */
function stowMace(t,a){
  if(a<=.02)return;
  ctx.save();ctx.globalAlpha=a;ctx.translate(34,-112);ctx.rotate(-1.16);drawHammer(245,.25,t,9);ctx.restore();
}
function demonBody(o){
  const t=o.t,warm=o.warm||1,jaw=o.jaw||0,fl=.8+.2*Math.sin(t*9);
  const FA=['rgba(255,196,90,.92)','rgba(255,106,40,.92)'];
  stowMace(t,o.stow==null?0:o.stow);
  let g=ctx.createRadialGradient(0,-290,10,0,-290,160);
  g.addColorStop(0,'rgba(255,140,50,'+Math.min(.55,.3*warm)+')');g.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-290,160,0,6.283);ctx.fill();
  for(let i=0;i<9;i++){
    const k=Math.abs(i-4),h=(50+34*Math.abs(Math.sin(t*6+i*1.7)))*warm*(1-k*.09);
    qflame(-72+i*18,-306+k*4,13,h,i,FA[i%2]);
  }
  for(const sd of [-1,1]){
    ctx.save();ctx.scale(sd,1);
    qp([[22,-152],[72,-152],[68,-96],[56,-62],[64,-24],[22,-24],[26,-62],[18,-96]],'#1b1421','#3a2d44',2.5);
    qp([[16,-24],[68,-24],[76,0],[12,0]],'#120d17','#3a2d44',2);
    qp([[62,-100],[88,-92],[66,-78]],'#3a2d44','#4a3a55',1.5);
    ctx.strokeStyle='rgba(255,122,43,'+(.85*fl)+')';ctx.lineWidth=3;ctx.lineCap='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=8*warm;
    ctx.beginPath();ctx.moveTo(44,-142);ctx.lineTo(40,-112);ctx.lineTo(47,-82);ctx.lineTo(41,-50);ctx.stroke();
    ctx.restore();
    qflame(sd*44,-22,11,(26+12*Math.abs(Math.sin(t*8+sd)))*warm,sd+2,FA[(sd+1)/2]);
  }
  if(o.wound>0){
    ctx.save();ctx.shadowColor='#ffb04a';ctx.shadowBlur=14;ctx.lineCap='round';
    ctx.strokeStyle='rgba(255,220,140,'+clamp01(o.wound)+')';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(-72,-70);ctx.lineTo(-46,-70);ctx.moveTo(-72,-70);ctx.lineTo(-60,-88);ctx.moveTo(-72,-70);ctx.lineTo(-60,-52);ctx.stroke();
    ctx.restore();
  }
  qp([[-68,-162],[68,-162],[56,-122],[-56,-122]],'#1a1421','#3a2d44',2.5);
  qp([[-20,-160],[20,-160],[0,-124]],'#2b2233','#5a4666',2);
  const pg=ctx.createRadialGradient(0,-148,2,0,-148,26);pg.addColorStop(0,'rgba(255,220,140,'+Math.min(1,.8*fl*warm)+')');pg.addColorStop(1,'rgba(255,100,30,0)');
  ctx.fillStyle=pg;ctx.beginPath();ctx.arc(0,-148,26,0,6.283);ctx.fill();
  const tg=ctx.createLinearGradient(0,-242,0,-150);tg.addColorStop(0,'#35293d');tg.addColorStop(1,'#16101b');
  qp([[-104,-238],[104,-238],[76,-190],[56,-150],[-56,-150],[-76,-190]],tg,'#0d0911',3);
  ctx.strokeStyle='#0d0911';ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,-234);ctx.lineTo(0,-178);
  ctx.moveTo(-72,-216);ctx.quadraticCurveTo(-38,-168,0,-184);ctx.moveTo(72,-216);ctx.quadraticCurveTo(38,-168,0,-184);
  for(let i=0;i<3;i++){ctx.moveTo(-26,-170+i*10);ctx.lineTo(-4,-170+i*10);ctx.moveTo(4,-170+i*10);ctx.lineTo(26,-170+i*10)}
  ctx.stroke();
  const hg=ctx.createRadialGradient(0,-198,4,0,-198,86);
  hg.addColorStop(0,'rgba(255,200,110,'+Math.min(.8,.5*warm)+')');hg.addColorStop(.4,'rgba(255,110,40,'+Math.min(.5,.3*warm)+')');hg.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,-198,86,0,6.283);ctx.fill();
  ctx.save();
  ctx.strokeStyle='rgba(255,'+(130+Math.round(70*fl))+',50,'+Math.min(1,.8*fl*warm)+')';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=12*warm;
  [[[-6,-232],[4,-212],[-8,-196],[6,-180]],[[4,-212],[30,-206],[48,-190]],[[-8,-196],[-34,-190],[-50,-176]],[[-60,-228],[-48,-212],[-52,-196]],[[62,-226],[50,-208],[56,-194]],[[6,-180],[-4,-164],[8,-152]]].forEach(L=>{
    ctx.beginPath();L.forEach((q,n)=>n?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  });
  ctx.restore();
  qp([[-30,-258],[30,-258],[42,-232],[-42,-232]],'#1a1421','#3a2d44',2);
  for(const sd of [-1,1]){
    ctx.save();ctx.scale(sd,1);
    const brk=o.hornCut&&sd===1;
    if(brk){qp([[30,-298],[38,-320],[64,-340],[94,-346],[104,-338],[96,-330],[102,-322],[94,-316],[66,-296]],'#3a2a3c','#5a4666',2.5);
      ctx.save();ctx.strokeStyle='rgba(255,150,60,.85)';ctx.lineWidth=3;ctx.shadowColor='#ff7a2b';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(94,-346);ctx.lineTo(104,-338);ctx.lineTo(96,-330);ctx.lineTo(102,-322);ctx.lineTo(94,-316);ctx.stroke();ctx.restore();}
    else qp([[30,-298],[38,-320],[64,-340],[100,-348],[134,-390],[124,-338],[98,-316],[66,-296]],'#3a2a3c','#5a4666',2.5);
    ctx.strokeStyle='#241a2a';ctx.lineWidth=3;ctx.beginPath();
    ctx.moveTo(58,-318);ctx.lineTo(66,-298);ctx.moveTo(84,-330);ctx.lineTo(90,-312);if(!brk){ctx.moveTo(108,-352);ctx.lineTo(112,-332)}ctx.stroke();
    ctx.restore();
  }
  qp([[-42,-300],[-32,-324],[0,-332],[32,-324],[42,-300],[36,-272],[22,-254],[-22,-254],[-36,-272]],'#2e2336','#0d0911',3);
  qp([[-46,-298],[0,-289],[46,-298],[42,-310],[0,-301],[-42,-310]],'#130e18');
  if(jaw>0){
    ctx.save();ctx.shadowColor='#ffb04a';ctx.shadowBlur=18;
    qp([[-22,-268],[22,-268],[18,-254+jaw],[-18,-254+jaw]],'rgba(255,160,60,.95)');
    ctx.restore();
  }
  ctx.save();ctx.translate(0,jaw);
  qp([[-26,-266],[26,-266],[22,-252],[0,-243],[-22,-252]],'#241a2a','#0d0911',2);
  qp([[-14,-266],[-10,-277],[-6,-266]],'#eadbc8');qp([[6,-266],[10,-277],[14,-266]],'#eadbc8');
  ctx.restore();
  qp([[-18,-268],[-14,-258+jaw*.3],[-10,-268]],'#eadbc8');qp([[10,-268],[14,-258+jaw*.3],[18,-268]],'#eadbc8');
  ctx.save();ctx.shadowColor='#ffb347';ctx.shadowBlur=16;
  const ec=o.hurt?'#ffffff':'#ffd27a';
  qp([[-36,-292],[-8,-285],[-10,-277],[-34,-283]],ec);qp([[36,-292],[8,-285],[10,-277],[34,-283]],ec);
  ctx.restore();
  ctx.strokeStyle='#0d0911';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,-274);ctx.lineTo(-3,-266);ctx.moveTo(5,-274);ctx.lineTo(3,-266);ctx.stroke();
  [-26,-9,9,26].forEach((x,i)=>qflame(x,-324,8,(30+22*Math.abs(Math.sin(t*8+i*2)))*warm,i,FA[i%2]));
  for(const sd of [-1,1]){
    ctx.save();ctx.scale(sd,1);
    qp([[58,-242],[102,-258],[136,-238],[132,-206],[98,-196],[60,-208]],'#261d2e','#5a4666',3);
    qp([[136,-238],[154,-276],[118,-252]],'#3a2d44','#5a4666',2);
    qp([[110,-254],[114,-292],[90,-258]],'#3a2d44','#5a4666',2);
    qp([[134,-212],[166,-216],[136,-230]],'#3a2d44','#5a4666',2);
    ctx.strokeStyle='rgba(255,122,43,'+(.85*fl)+')';ctx.lineWidth=3;ctx.lineCap='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=8*warm;
    ctx.beginPath();ctx.moveTo(72,-232);ctx.lineTo(100,-224);ctx.lineTo(122,-226);ctx.stroke();
    ctx.restore();
    qflame(sd*98,-258,11,(28+16*Math.abs(Math.sin(t*7+sd*3)))*warm,sd+4,FA[(sd+1)/2]);
  }
  bodyAnvils(t);bodyChain(t,o.hk);
}
function box(x,y,w,h,f,s){ctx.fillStyle=f;ctx.fillRect(x,y,w,h);if(s){ctx.strokeStyle=s;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h)}}
function poly(pts,f,s){
  ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();
  ctx.fillStyle=f;ctx.fill();if(s){ctx.strokeStyle=s;ctx.lineWidth=2;ctx.stroke()}
}
function drawEmbers(from,to,am){
  for(let i=from;i<to;i++){
    const e=G.embers[i],a=am*(.35+.35*Math.sin(G.time*2+e.ph));
    ctx.fillStyle='rgba(255,'+(140+(i%5)*18)+',60,'+a+')';
    ctx.beginPath();ctx.arc(e.x,e.y,e.s*.8,0,6.283);ctx.fill();
  }
}

function pose(){
  const b=G.boss,t=b.t,sw=Math.sin(G.time*3);
  let hand,tip,sag=40,heat=.25;
  switch(b.s){
    case 'idle':
      hand=[IDLE_HAND[0],IDLE_HAND[1]+sw*3];tip=[hand[0]-34+sw*9,hand[1]+104];sag=46;break;
    case 'windup':{
      const k=eo(clamp01(t/.35));
      hand=lerp2(IDLE_HAND,UP_HAND,k);hand[0]+=Math.sin(G.time*55)*1.6*(t/T.windup);
      const rest=[hand[0]-34,hand[1]+104];
      tip=lerp2(rest,TIP_BACK,k);tip[0]+=Math.sin(G.time*8)*5;
      sag=48;heat=.3+.7*(t/T.windup);break;}
    case 'strike':{
      const p=clamp01(t/(b.sk||T.strike));
      hand=lerp2(UP_HAND,FWD_HAND,eo(clamp01(t/.14)));
      tip=lerp2(TIP_BACK,BAR,ei(p));tip[1]-=140*Math.sin(Math.PI*p)*(1-.55*p);
      sag=-80*(1-p)+8;heat=1;break;}
    case 'rewind':{
      const k=eo(clamp01(t/.18));
      hand=lerp2(FWD_HAND,UP_HAND,k);tip=lerp2(BAR,TIP_BACK,k);tip[1]-=60*Math.sin(Math.PI*k);
      sag=-30;heat=1;break;}
    case 'rebound':{
      hand=FWD_HAND;
      const e=es(clamp01(t/T.rebound));
      tip=lerp2(BAR,HEAD,e);tip[1]-=100*Math.sin(Math.PI*e);
      sag=-40;heat=1;break;}
    case 'stagger':{
      const k=eo(clamp01(t/.5));
      hand=lerp2(FWD_HAND,IDLE_HAND,k);
      tip=lerp2(HEAD,[hand[0]-24,hand[1]+110],eo(clamp01(t/.45)));
      sag=50;break;}
    case 'lift':{
      hand=lerp2(FWD_HAND,[BX-150,206],eo(clamp01(t/.55)));
      const cur=[CHEST[0],CHEST[1]-liftAmt()];
      tip=lerp2(BAR,cur,clamp01(t/.12));sag=14;heat=1;break;}
    case 'hold':
      hand=[BX-150,206+Math.sin(G.time*34)*2];tip=[CHEST[0],CHEST[1]-LIFT_MAX];sag=10;heat=1;break;
    case 'slam':
      hand=lerp2([BX-150,206],[BX-140,300],ei(clamp01(t/.16)));
      tip=[CHEST[0],CHEST[1]-liftAmt()];sag=10;heat=1;break;
    case 'release':{
      const k=eo(clamp01(t/.6));
      hand=lerp2([BX-140,300],IDLE_HAND,k);
      tip=lerp2([CHEST[0],CHEST[1]+10],[hand[0]-34,hand[1]+104],k);sag=50;break;}
    case 'dead':
      hand=[BX-120,342];tip=[hand[0]-70,DECK-6];sag=24;break;
    default:
      hand=[IDLE_HAND[0],IDLE_HAND[1]+sw*3];tip=[hand[0]-34+sw*9,hand[1]+104];sag=46;
  }
  return {hand,tip,sag,heat};
}

/* Signal du souffle enchaîné : halo blanc-bleu pulsant sur la tête et grand « ! » à gauche du Colosse (le souffle normal n'a que les flammes orange). */
function drawChainTell(x,y,t){
  const k=.85+.15*Math.sin(t*38);
  ctx.save();
  const g=ctx.createRadialGradient(x,y,4,x,y,70);
  g.addColorStop(0,'rgba(220,245,255,'+(.55*k)+')');g.addColorStop(1,'rgba(120,200,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,70,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(235,250,255,'+(.95*k)+')';ctx.shadowColor='#9fdcff';ctx.shadowBlur=18;
  ctx.font='900 78px '+DISPLAY;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('!',x-150,y-50);
  ctx.restore();
}
/* Signal du double crochet : « !! » orange à gauche du Colosse, plus discret que celui du souffle enchaîné. */
function drawDblTell(t){
  const k=.85+.15*Math.sin(t*30);
  ctx.save();
  ctx.fillStyle='rgba(255,176,74,'+k+')';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=14;
  ctx.font='900 54px '+DISPLAY;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('!!',BX-168,DECK-288);
  ctx.restore();
}
function swordPose(){
  const b=G.boss,t=b.t,tm=G.time;
  const A0=-Math.PI+.18;
  let hand=[IDLE2[0],IDLE2[1]],a=A0,len=0,heat=0;
  switch(b.s){
    case 'sw1w':{
      const k=eo(clamp01(t/.4));
      hand=lerp2(IDLE2,SW1_BACK,k);hand[1]+=Math.sin(tm*50)*1.5*(t/T.sw1w);
      len=SW_LEN*eo(clamp01(t/.5));heat=.3+.7*(t/T.sw1w);break;}
    case 'sw1':{
      const e=es(clamp01(t/T.sw1));
      hand=lerp2(SW1_BACK,SW1_HIT,e);a=-Math.PI+.18*(1-e);len=SW_LEN;heat=1;break;}
    case 'swgap':{
      const k=eo(clamp01(t/T.swgap));
      hand=lerp2(SW1_HIT,SW2_UP,k);a=-Math.PI+(Math.PI-1.2)*k;len=SW_LEN;heat=1;
      if(!G.sw.p1)hand[0]-=90*Math.sin(Math.PI*clamp01(t/.24));
      hand[0]+=G.kick*30;break;}
    case 'sw2w':
      hand=[SW2_UP[0]+Math.sin(tm*50)*1.5,SW2_UP[1]];a=-1.2;len=SW_LEN;heat=1;break;
    case 'sw2':{
      const e=es(clamp01(t/T.sw2));
      hand=lerp2(SW2_UP,SW2_HIT,e);a=-1.2-2.42*e;len=SW_LEN;heat=1;break;}
    case 'sw3g':{
      const k=eo(clamp01(t/T.sw3g));
      hand=lerp2(SW2_HIT,SW1_BACK,k);a=-3.62+(3.62-3.14+.18)*k;len=SW_LEN;heat=1;
      if(!G.sw.p2){hand[0]-=60*Math.sin(Math.PI*clamp01(t/.24))}
      hand[0]+=G.kick*30;break;}
    case 'sw3w':
      hand=[SW1_BACK[0],SW1_BACK[1]+Math.sin(tm*50)*1.5];a=-Math.PI+.18;len=SW_LEN;heat=1;break;
    case 'sw3':{
      const e=es(clamp01(t/T.sw3));
      hand=lerp2(SW1_BACK,SW1_HIT,e);a=-Math.PI+.18*(1-e);len=SW_LEN;heat=1;break;}
    case 'swrec':{
      const k=eo(clamp01(t/T.swrec));
      hand=lerp2(DIFF.hard?SW1_HIT:SW2_HIT,IDLE2,k);a=-3.62+.66*k;len=SW_LEN*(1-clamp01(t/.5));heat=.8;
      if(!(DIFF.hard?G.sw.p3:G.sw.p2)){const q=Math.sin(Math.PI*clamp01(t/.24));hand[0]-=60*q;hand[1]+=60*q}
      hand[0]+=G.kick*30;break;}
    case 'fin':{
      if(t<1.5)break;
      const UPH=[BX-30,DECK-340],DN=[HOLE_X,DECK-232];
      if(t<1.85){const k=es(clamp01((t-1.5)/.35));hand=lerp2(IDLE2,UPH,k);a=-Math.PI+.18+(-1.57+Math.PI-.18)*k;len=SW_LEN*k;heat=1}
      else if(t<2.0){const e=ei(clamp01((t-1.85)/.15));hand=lerp2(UPH,DN,e);a=-1.57-3.14*e;len=SW_LEN;heat=1.5}
      else{hand=DN;a=-4.71;len=SW_LEN;heat=1.2}
      hand=[hand[0]-finRecoil(t),hand[1]];
      break;}
    case 'orb':{
      const k=eo(clamp01(t/.6));
      hand=lerp2(DIFF.hard?SW1_HIT:SW2_HIT,IDLE2,k);a=-3.62+.66*k;len=SW_LEN*(1-clamp01(t/.4));heat=.5;
      hand[0]+=G.kick*30;break;}
  }
  return {hand,a,len,heat};
}
function drawArm(S,H,Lmin,out){
  const dx=H[0]-S[0],dy=H[1]-S[1],d=Math.max(1,Math.hypot(dx,dy)),a=Math.atan2(dy,dx),L=Math.max(Lmin,d*.56);
  const dc=Math.min(d,2*L-1),ang=Math.acos(Math.max(-1,Math.min(1,dc/(2*L))));
  const E1=[S[0]+L*Math.cos(a+ang),S[1]+L*Math.sin(a+ang)],E2=[S[0]+L*Math.cos(a-ang),S[1]+L*Math.sin(a-ang)];
  const sc=E=>E[1]*.7+out*E[0]*.6;
  let E=sc(E1)>sc(E2)?E1:E2;
  if(d>=2*L-1)E=[S[0]+dx/d*L,S[1]+dy/d*L];
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  const seg=(A,B,w1,w2)=>{
    const an=Math.atan2(B[1]-A[1],B[0]-A[0])+1.5708,c=Math.cos(an),sn=Math.sin(an);
    ctx.beginPath();ctx.moveTo(A[0]+c*w1,A[1]+sn*w1);ctx.lineTo(B[0]+c*w2,B[1]+sn*w2);ctx.lineTo(B[0]-c*w2,B[1]-sn*w2);ctx.lineTo(A[0]-c*w1,A[1]-sn*w1);ctx.closePath();
    ctx.fillStyle='#211828';ctx.fill();ctx.strokeStyle='#4a3a55';ctx.lineWidth=2.5;ctx.stroke();
  };
  seg(S,E,19,15);seg(E,H,15,12);
  ctx.strokeStyle='rgba(255,122,43,.8)';ctx.lineWidth=2.5;ctx.shadowColor='#ff7a2b';ctx.shadowBlur=8;
  ctx.beginPath();ctx.moveTo(S[0]+(E[0]-S[0])*.2,S[1]+(E[1]-S[1])*.2);ctx.lineTo(E[0],E[1]);ctx.lineTo(H[0]+(E[0]-H[0])*.25,H[1]+(E[1]-H[1])*.25);ctx.stroke();
  ctx.shadowBlur=0;
  qp([[E[0]-12,E[1]-4],[E[0]+2,E[1]-20],[E[0]+12,E[1]-2]],'#3a2d44','#5a4666',1.5);
  ctx.restore();
}
function drawSwordArm(dx,dy){
  const sp=swordPose(),b=G.boss,h=[sp.hand[0]+dx,sp.hand[1]+dy],tm=G.time;
  const S=[S2[0]+dx,S2[1]+dy];
  if(b.s==='sw1'||b.s==='sw2'){
    G.swTrail.push([h[0],h[1],h[0]+Math.cos(sp.a)*sp.len,h[1]+Math.sin(sp.a)*sp.len]);
    if(G.swTrail.length>7)G.swTrail.shift();
  }else G.swTrail.length=0;
  ctx.save();
  for(let i=1;i<G.swTrail.length;i++){
    const A=G.swTrail[i-1],B=G.swTrail[i];
    ctx.fillStyle='rgba(255,170,70,'+(i/G.swTrail.length*.4)+')';
    ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(A[2],A[3]);ctx.lineTo(B[2],B[3]);ctx.lineTo(B[0],B[1]);ctx.closePath();ctx.fill();
  }
  ctx.restore();
  drawArm(S,h,78,1);
  ctx.save();ctx.translate(h[0],h[1]);ctx.rotate(sp.a);
  drawHammer(sp.len,sp.heat,tm,9);
  ctx.restore();
  ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(h[0],h[1],15,0,6.283);ctx.fill();ctx.stroke();
}
/* Chaîne de forge à crochet : maillons de fer le long d'une suite de points, crochet de levage au bout */
function drawHookChain(pts,heat){
  const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const tot=L[L.length-1];if(tot<2)return;
  const at=d=>{let i=1;while(i<L.length-1&&L[i]<d)i++;const u=(d-L[i-1])/Math.max(.001,L[i]-L[i-1]);return[pts[i-1][0]+(pts[i][0]-pts[i-1][0])*u,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*u,Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0])]};
  ctx.save();ctx.lineCap='round';
  if(heat>0){ctx.strokeStyle='rgba(255,140,60,'+(.35*Math.min(1,heat))+')';ctx.lineWidth=12;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}
  let k=0;
  for(let d=4;d<tot-14;d+=11,k++){
    const [x,y,a]=at(d);ctx.save();ctx.translate(x,y);ctx.rotate(a);
    if(k%2===0){ctx.strokeStyle='#241b2a';ctx.lineWidth=4.5;ctx.beginPath();ctx.ellipse(0,0,8,4.5,0,0,6.283);ctx.stroke();ctx.strokeStyle='#7a6a82';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(0,0,8,4.5,0,0,6.283);ctx.stroke()}
    else{ctx.strokeStyle='#241b2a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(7,0);ctx.stroke();ctx.strokeStyle='#8a7a92';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-6,-1);ctx.lineTo(6,-1);ctx.stroke()}
    ctx.restore();
  }
  const [hx,hy,ha]=at(tot);
  ctx.save();ctx.translate(hx,hy);ctx.rotate(ha);
  ctx.strokeStyle='#241b2a';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(2,0);ctx.arc(2,9,9,-Math.PI/2,Math.PI*.95);ctx.stroke();
  ctx.strokeStyle='#9a8aa2';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-13,-1);ctx.lineTo(2,-1);ctx.arc(2,9,8,-Math.PI/2,Math.PI*.95);ctx.stroke();
  ctx.fillStyle='#241b2a';ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(-3,3);ctx.lineTo(-2,11);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#241b2a';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(-16,0,5,3.5,0,0,6.283);ctx.stroke();
  if(heat>.5){ctx.strokeStyle='rgba(255,170,80,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(2,9,6,0,Math.PI*.8);ctx.stroke()}
  ctx.restore();
  ctx.restore();
}
function drawWhip(h,tp,sag,heat){
  const c=[(h[0]+tp[0])/2,(h[1]+tp[1])/2+sag],pts=[];
  for(let i=0;i<=20;i++){const u=i/20,m=1-u;pts.push([m*m*h[0]+2*m*u*c[0]+u*u*tp[0],m*m*h[1]+2*m*u*c[1]+u*u*tp[1]])}
  drawHookChain(pts,heat);
}

/* Chaîne du Colosse : « hk » va de 0 (elle est enroulée sur son torse) à 1 (déroulée dans sa main) ; le même nombre règle les maillons du torse et la longueur dans la main */
function hookStep(o,target,t){
  const dt=Math.min(.05,Math.max(0,t-(o.hl==null?t:o.hl)));o.hl=t;
  const cur=o.hv||0,sp=(target>cur?1/.45:1/.4)*dt;
  o.hv=Math.abs(target-cur)<=sp?target:cur+Math.sign(target-cur)*sp;
  return o.hv;
}
function drawBoss(){
  const b=G.boss,pz=pose(),t=G.time;
  let dx=0,dy=0;
  if(b.s==='stagger'||b.s==='orb'||b.s==='hurt'||b.s==='fy_roar')dx=Math.sin(t*38)*3*clamp01(1-b.t/.6);
  if(b.s==='hurt')dy=Math.min(12,b.t*60)*clamp01((b.hurtT-b.t)/.4);
  if(b.s==='fin'){const T=b.t;dx=finRecoil(T)+(T<1.1?Math.sin(t*50)*3:T<1.5?Math.sin(t*44)*4:0);dy=T>=1.1&&T<1.5?-10*Math.sin(Math.PI*(T-1.1)/.4):0;
    if(T>=2.25){const u=clamp01((T-2.25)/.45);dx=finRecoil(T)+(HOLE_X-BX-finRecoil(T))*es(u);dy=-90*Math.sin(Math.PI*Math.min(u,1)*.75);if(T>=2.55){const fq=T-2.55;dy+=fq*fq*700+fq*80}}}
  if(b.s==='dead')dy=Math.min(56,b.t*150);
  const warm=(b.s==='windup'||b.s==='strike'||b.s.startsWith('sw')||b.s.startsWith('fl_'))?1.25:(b.fury?1.7:1);
  const dead=b.s==='dead';
  const hkT=(b.s==='windup'||b.s==='strike'||b.s==='rebound'||b.s==='rewind'||b.s==='lift'||b.s==='hold'||b.s==='slam'||b.s==='release')?1:0,hk1=hookStep(b,hkT,t);

  ctx.save();ctx.translate(BX+dx,DECK+dy);
  /* bras du marteau dessiné dans le repère du monde, voir drawSwordArm */
  const jaw=(G.mode==='intro'&&G.it>3.0&&G.it<3.9)?14:b.s==='fl_in'?14*clamp01(b.t/Math.min(T.fli,b.fli||T.fli)):(b.s==='fl_out'||b.s==='fy_roar')?14:0;
  ctx.save();ctx.scale(.92,.92);
  {const wf=Math.sin(t*1.8)*.03;
   for(const sd of [-1,1]){drawWing([sd*64,-222],-.85+wf,.8,'#220a11',.34,!!b.fury,sd);drawWing([sd*50,-232],-1.15+wf,1,'#35101a',.34,!!b.fury,sd)}}
  demonBody({t,warm,jaw,hurt:G.recoil>.3,dead,wound:G.wound,stow:1-clamp01(swordPose().len/40),hk:hk1});
  ctx.restore();
  ctx.restore();
  if(b.s==='fl_in'||b.s==='fl_out')faceFire(BX+dx-18,DECK+dy-238,b.s==='fl_in'?es(clamp01(b.t/Math.min(T.fli,b.fli||T.fli))):1-es(clamp01(b.t/.5)),b.s==='fl_in'?b.t:1);

  if(b.fury){ctx.save();ctx.translate(BX+dx,DECK+dy);drawAura(b.fury);ctx.restore()}
  /* bras et mains suivent le corps (secousses, chute de fin de phase) */
  const S=[BX-92+dx,DECK-200+dy],h=[pz.hand[0]+dx,pz.hand[1]+dy],tip=[pz.tip[0]+dx,pz.tip[1]+dy];
  drawArm(S,h,78,-1);
  ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(h[0],h[1],17,0,6.283);ctx.fill();ctx.stroke();
  if(pz.heat>.5){
    const rg=ctx.createRadialGradient(h[0],h[1],2,h[0],h[1],34);
    rg.addColorStop(0,'rgba(255,190,90,'+(.55*pz.heat)+')');rg.addColorStop(1,'rgba(255,120,40,0)');
    ctx.fillStyle=rg;ctx.beginPath();ctx.arc(h[0],h[1],34,0,6.283);ctx.fill();
  }
  if(b.s==='strike'||b.s==='rebound'||b.s==='rewind'){
    G.trail.push([tip[0],tip[1]]);if(G.trail.length>7)G.trail.shift();
  }else G.trail.length=0;
  G.trail.forEach((q,i)=>{
    ctx.fillStyle='rgba(255,170,70,'+(i/G.trail.length*.45)+')';
    ctx.beginPath();ctx.arc(q[0],q[1],3+i*.9,0,6.283);ctx.fill();
  });
  if(hk1>.02)drawWhip(h,lerp2(h,tip,es(hk1)),pz.sag*es(hk1),pz.heat);
  drawSwordArm(dx,dy);
}

function drawPlayer(){
  const p=G.pl,lift=liftAmt(),up=p.s==='barrier'||p.s==='cast'||p.s==='ring'||p.s==='final';
  let r=up?clamp01(p.t/.08):0;
  ctx.fillStyle='rgba(0,0,0,.38)';
  ctx.beginPath();ctx.ellipse(p.x,DECK+1,30*(1-lift/400),5,0,0,6.283);ctx.fill();

  ctx.save();ctx.translate(p.x,DECK-lift-(G.ib||0));
  if(G.mode==='intro')ctx.scale(G.sx,1);
  if(lift>0||p.s==='grabbed')ctx.rotate(.42*lift/LIFT_MAX+(p.s==='grabbed'?Math.sin(G.time*22)*.03:0));
  if(p.s==='down'){ctx.rotate(.12);ctx.scale(1,.82)}

  drawWizard({fl:0});

  const dashing=p.s==='dash'||p.s==='stab'||p.s==='back';
  const thrust=p.s==='stab'?(p.t<.1?es(p.t/.1):p.t<.22?1:1-clamp01((p.t-.22)/.08)):0;
  const hand=dashing?[28+24*thrust,-60]:[26,-62-6*r],sb=dashing?[hand[0]-34,hand[1]+6]:[26,-2-58*r],st=dashing?[hand[0]+34,hand[1]-6]:[30+18*r,-140-26*r];
  ctx.lineCap='round';
  ctx.strokeStyle='#2a3550';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(23,-78);ctx.lineTo(hand[0],hand[1]);ctx.stroke();ctx.fillStyle='#2a3550';ctx.beginPath();ctx.arc(23,-78,6.5,0,6.283);ctx.fill();
  ctx.strokeStyle='#8a7a9a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(sb[0],sb[1]);ctx.lineTo(st[0],st[1]);ctx.stroke();
  ctx.fillStyle='#cdb69a';ctx.beginPath();ctx.arc(hand[0],hand[1],5,0,6.283);ctx.fill();
  const cc=p.deny>0?'#ff6b6b':up?'#fff4d6':(p.s==='recover'?'#c9a85a':'#ffd27a');
  drawLantern(st[0],st[1],up?1:dashing?.6+.4*thrust:.25,cc,Math.atan2(st[1]-sb[1],st[0]-sb[0])+Math.PI/2);
  if(dashing&&thrust>0){const A=[st[0]+8,st[1]],Z=[BX-62-p.x,-58+lift+(G.ib||0)];lanternBeam(A,lerp2(A,Z,thrust),12+10*thrust,thrust)}

  const b=G.boss;
  if((b.s==='lift'&&b.t>=.12)||b.s==='hold'||b.s==='slam'){
    ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=10;
    ctx.strokeStyle='#ff9a3c';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-58,27,7,0,0,6.283);ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawBarrier(){
  const p=G.pl;if(p.s!=='barrier')return;
  const ramp=clamp01(p.t/.07),a=(1-.45*p.t/T.barrier)*ramp;
  const cx=PX+82,cy=DECK-76,rx=34*(.6+.4*ramp),ry=92*(.8+.2*ramp);
  ctx.save();ctx.globalAlpha=a;
  const g=ctx.createRadialGradient(cx-18,cy,6,cx,cy,ry);
  g.addColorStop(0,'rgba(111,211,255,.06)');g.addColorStop(.7,'rgba(111,211,255,.2)');g.addColorStop(1,'rgba(191,234,255,.5)');
  ctx.fillStyle=g;ctx.shadowColor='#6fd3ff';ctx.shadowBlur=24;
  ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,6.283);ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle='#cdeeff';ctx.lineWidth=3;ctx.stroke();
  ctx.lineWidth=1;ctx.strokeStyle='rgba(205,238,255,.5)';
  for(const k of[.66,.33]){ctx.beginPath();ctx.ellipse(cx,cy,rx*k,ry,0,0,6.283);ctx.stroke()}
  ctx.restore();
}

/* Repère de timing discret (Normal) : petite barre au-dessus du Veilleur, orange tant que la parade n'est pas ouverte puis bleue pendant la fenêtre. */
function hintBar(cx,y,k,blue){
  const w=68,h=6,x=cx-w/2;
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x-1,y-1,w+2,h+2);
  ctx.fillStyle=blue?'#6fd3ff':'rgba(255,122,43,.85)';ctx.fillRect(x,y,w*clamp01(k),h);
}
const HINT_LEAD=.8; // durée d'approche affichée avant l'ouverture de la fenêtre (phases II et III)
function drawHints(){
  if(G.mode!=='play'||!prefs.help)return;
  const b=G.boss,p=G.pl;
  /* repère de timing : barre au-dessus de la tête, ou en Facile un cercle qui se resserre autour du Veilleur (bleu = fenêtre de parade) */
  const cue=(k,blue)=>{
    if(DIFF.easy){
      const r=blue?40+22*clamp01(k):110-48*clamp01(k);
      ctx.save();ctx.lineWidth=blue?5:3;ctx.strokeStyle=blue?'#6fd3ff':'rgba(255,122,43,.85)';
      if(blue){ctx.shadowColor='#6fd3ff';ctx.shadowBlur=12}
      ctx.beginPath();ctx.arc(PX+10,DECK-100,r,0,6.283);ctx.stroke();ctx.restore();return;
    }
    hintBar(PX,DECK-206,k,blue);
  };
  if(['sw1w','sw1','swgap','sw2w','sw2','sw3g','sw3w','sw3'].includes(b.s)){
    const hit=+b.s.charAt(2),wait=[T.sw1w,T.sw2w,T.sw3w][hit-1],strike=[T.sw1,T.sw2,T.sw3][hit-1];
    if(b.s!=='swgap'&&b.s!=='sw3g'){
      const tl=wait+strike;
      const ela=b.s.endsWith('w')?b.t:wait+b.t;
      const rem=Math.max(0,tl-ela),inWin=rem<=T.barrier;
      const k=inWin?rem/T.barrier:ela/(tl-T.barrier);
      cue(k,inWin);
    }
    const nsw=DIFF.hard?3:2;
    for(let i=0;i<nsw;i++){
      const ok=[G.sw.p1,G.sw.p2,G.sw.p3][i],x=PX+(i-(nsw-1)/2)*18,y=DECK-220;
      ctx.beginPath();ctx.arc(x,y,5,0,6.283);
      if(ok){ctx.fillStyle='#6fd3ff';ctx.fill()}
      else{ctx.strokeStyle='rgba(240,232,223,.6)';ctx.lineWidth=2;ctx.stroke()}
    }
  }
  if(b.s==='fl_in'||b.s==='fl_out'){
    const fli=b.fli||T.fli,tl=fli+T.flo,ela=b.s==='fl_in'?b.t:fli+b.t;
    const rem=Math.max(0,tl-ela),inWin=rem<=T.flwin;
    const k=inWin?rem/T.flwin:ela/(tl-T.flwin);
    cue(k,inWin);
  }
  if(G.fy&&(['fy_roar','fy_t','fy_j','fy_gap','rk_t','rk_j'].includes(b.s)||b.fyb)){
    const F=G.fy,n=F.seq.length;
    if(b.s==='fy_t'||b.s==='fy_j'||b.s==='rk_t'||b.s==='rk_j'){
      const rk=b.s==='rk_t'||b.s==='rk_j',t1=rk?.5:T.fyt,tl=t1+(rk?.55:.3);
      const ela=(b.s==='fy_t'||b.s==='rk_t')?b.t:t1+b.t;
      const rem=Math.max(0,tl-ela),inWin=rem<=T.barrier;
      const k=inWin?rem/T.barrier:ela/(tl-T.barrier);
      cue(k,inWin);
    }
    for(let i=0;i<n;i++){
      const x=PX+(i-(n-1)/2)*18,y=DECK-220;
      ctx.beginPath();ctx.arc(x,y,5,0,6.283);
      if(i<F.i&&F.ok[i]){ctx.fillStyle='#6fd3ff';ctx.fill()}
      else if(i<F.i){ctx.fillStyle='#ff5252';ctx.fill()}
      else{ctx.strokeStyle='rgba(240,232,223,.6)';ctx.lineWidth=2;ctx.stroke()}
    }
  }
  if(b.s==='windup'||b.s==='strike'){
    const k=b.s==='windup'?b.t/T.windup:1-b.t/(b.sk||T.strike);
    const col=b.s==='windup'?'rgba(255,122,43,.85)':'#6fd3ff';
    cue(k,b.s==='strike');
  }
  if(p.s==='recover'||p.deny>0){
    const k=p.s==='recover'?p.t/T.recovery:1;
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(PX-31,DECK+8,62,6);
    ctx.fillStyle=p.deny>0?'#ff5252':'#6fd3ff';ctx.fillRect(PX-30,DECK+9,60*clamp01(k),4);
  }
}

function drawFx(){
  for(const s of G.sparks){ctx.globalAlpha=clamp01(s.life/s.max);ctx.fillStyle=s.col;ctx.fillRect(s.x,s.y,s.sz,s.sz)}
  ctx.globalAlpha=1;
  for(const r of G.rings){
    const k=1-r.life/r.max;
    ctx.strokeStyle='rgba(191,234,255,'+(1-k)+')';ctx.lineWidth=4*(1-k)+1;
    ctx.beginPath();ctx.arc(r.x,r.y,10+k*70,0,6.283);ctx.stroke();
  }
  ctx.textAlign='center';ctx.lineJoin='round';
  for(const f of G.floats){
    ctx.globalAlpha=clamp01(f.life/f.max*1.5);
    const u=1-f.life/f.max,y=f.y-u*26;
    ctx.font='800 '+Math.round((f.sz||38)*(1+.45*Math.max(0,1-u*7)))+'px '+DISPLAY; /* le mot « claque » : gros à l'impact, puis se pose */
    ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.7)';ctx.strokeText(f.txt,f.x,y);
    ctx.fillStyle=f.col;ctx.fillText(f.txt,f.x,y);
  }
  ctx.globalAlpha=1;
}

function flameShape(front,al,wide){
  const dx=front[0]-MOUTH[0],dy=front[1]-MOUTH[1],len=Math.hypot(dx,dy)||1;
  const ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
  ctx.save();ctx.globalAlpha=al;ctx.lineCap='round';
  ctx.shadowColor='#ff7a2b';ctx.shadowBlur=26;
  ctx.strokeStyle='rgba(255,100,30,.4)';ctx.lineWidth=14+34*wide;
  ctx.beginPath();ctx.moveTo(MOUTH[0],MOUTH[1]);ctx.lineTo(front[0],front[1]);ctx.stroke();
  ctx.shadowBlur=0;
  for(let i=0;i<30;i++){
    const s=i/29,d=len*s;
    const w=(8+wide*40*s)*(.75+.25*Math.sin(G.time*30+i*1.9));
    const off=Math.sin(G.time*26+i*2.3)*9*s;
    ctx.fillStyle=i%3===0?'rgba(255,236,170,.9)':i%3===1?'rgba(255,150,50,.85)':'rgba(255,80,30,.8)';
    ctx.beginPath();ctx.arc(MOUTH[0]+ux*d+nx*off,MOUTH[1]+uy*d+ny*off,w*.55,0,6.283);ctx.fill();
  }
  ctx.restore();
}
function drawFlame(){
  const b=G.boss;
  let front=null,al=1,wide=1;
  if(b.s==='fl_out'){const q=clamp01(b.t/T.flo);front=lerp2(MOUTH,BAR,es(q));wide=.4+.6*q}
  else if(b.s==='fl_stab'&&b.t<.25){front=BAR;al=1-b.t/.25}
  else if(b.s==='fl_rec'&&b.t<.45){front=lerp2(BAR,CHEST,eo(clamp01(b.t/.15)));al=1-clamp01((b.t-.15)/.3)}
  if(front)flameShape(front,al,wide);
}
function flameJet(o,front,al,wide){
  const dx=front[0]-o[0],dy=front[1]-o[1],len=Math.hypot(dx,dy)||1;
  const ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
  ctx.save();ctx.globalAlpha=clamp01(al);ctx.lineCap='round';
  ctx.shadowColor='#ff7a2b';ctx.shadowBlur=22;
  ctx.strokeStyle='rgba(255,100,30,.4)';ctx.lineWidth=10+24*wide;
  ctx.beginPath();ctx.moveTo(o[0],o[1]);ctx.lineTo(front[0],front[1]);ctx.stroke();
  ctx.shadowBlur=0;
  for(let i=0;i<22;i++){
    const s=i/21,d=len*s;
    const w=(7+wide*26*s)*(.75+.25*Math.sin(G.time*30+i*1.9));
    const off=Math.sin(G.time*26+i*2.3)*7*s;
    ctx.fillStyle=i%3===0?'rgba(255,236,170,.9)':i%3===1?'rgba(255,150,50,.85)':'rgba(255,80,30,.8)';
    ctx.beginPath();ctx.arc(o[0]+ux*d+nx*off,o[1]+uy*d+ny*off,w*.55,0,6.283);ctx.fill();
  }
  ctx.restore();
}
function drawJets(){
  const b=G.boss,F=G.fy;
  if(F&&b.s==='fy_t'){
    const k=clamp01(b.t/T.fyt),o=JET_O[F.i%4],r=10+36*k;
    ctx.save();
    const g=ctx.createRadialGradient(o[0],o[1],0,o[0],o[1],r);
    g.addColorStop(0,'rgba(255,255,220,'+(.5+.5*k)+')');g.addColorStop(1,'rgba(255,110,30,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(o[0],o[1],r,0,6.283);ctx.fill();
    ctx.restore();
  }
  if(F&&b.s==='fy_j'){
    const q=clamp01(b.t/.3),o=JET_O[F.i%4];
    flameJet(o,lerp2(o,BAR,es(q)),1,.3+.7*q);
  }
  if(G.jf)flameJet(G.jf.o,BAR,G.jf.t/.22,1);
}
function drawRock(){
  const b=G.boss;
  const S=[RKX[b.rki||0],RK_S[1]];
  if(b.s==='rk_t'){
    const k=clamp01(b.t/.5);
    ctx.save();
    const g=ctx.createRadialGradient(S[0],8,0,S[0],8,150);
    g.addColorStop(0,'rgba(255,120,40,'+(.6*k)+')');g.addColorStop(1,'rgba(255,120,40,0)');
    ctx.fillStyle=g;ctx.fillRect(S[0]-170,0,340,170);
    ctx.fillStyle='rgba(255,170,70,'+(.8*k)+')';
    for(let i=0;i<8;i++){
      const ex=S[0]-80+i*23+Math.sin(G.time*3+i)*6,ey=((G.time*140+i*57)%160);
      ctx.fillRect(ex,ey,3,3);
    }
    ctx.restore();
  }
  if(b.s==='rk_j'){
    const q=clamp01(b.t/.55),pos=lerp2(S,RK,ei(q));
    for(let i=1;i<=7;i++){
      const pp=lerp2(S,RK,ei(Math.max(0,q-i*.04)));
      ctx.fillStyle='rgba(255,'+(140+i*10)+',50,'+(.5-i*.06)+')';
      ctx.beginPath();ctx.arc(pp[0],pp[1],28-i*2.5,0,6.283);ctx.fill();
    }
    ctx.save();ctx.translate(pos[0],pos[1]);ctx.rotate(G.time*5);
    ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
    ctx.fillStyle='#2a2028';ctx.strokeStyle='#ff9a3c';ctx.lineWidth=3;
    ctx.beginPath();
    [[-26,-8],[-14,-26],[8,-28],[26,-10],[24,14],[6,28],[-18,22]].forEach((c,i)=>i?ctx.lineTo(c[0],c[1]):ctx.moveTo(c[0],c[1]));
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.restore();
  }
}
function drawRing(){
  const R=G.ringFx;if(!R)return;
  /* halo de lumière : il naît dans la lanterne levée et s'étend en anneaux jusqu'au Colosse */
  const q=clamp01(R.t/.55),L=[G.pl.x+48,DECK-166-liftAmt()],rmax=BX-G.pl.x-60,a=1-q*.35;
  ctx.save();ctx.translate(L[0],L[1]);ctx.shadowColor='#bfeaff';ctx.shadowBlur=28;
  for(const [d,w] of [[0,9],[.16,5]]){
    const qq=clamp01((R.t/.55)-d);if(qq<=0)continue;const rr=14+es(qq)*rmax;
    ctx.globalAlpha=a*(1-d*2);ctx.strokeStyle='#ffffff';ctx.lineWidth=w;
    ctx.beginPath();ctx.ellipse(0,0,rr,rr*.62,0,0,6.283);ctx.stroke();
    ctx.strokeStyle='rgba(111,211,255,.7)';ctx.lineWidth=w*2;ctx.globalAlpha=a*.35*(1-d*2);ctx.stroke();
  }
  const fl=1-q;ctx.globalAlpha=fl;const g=ctx.createRadialGradient(0,0,0,0,0,60);
  g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(191,234,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,60,0,6.283);ctx.fill();
  ctx.restore();
}
const HOLE_X=BX-170; /* le trou s'ouvre devant le Colosse, là où frappe le marteau */
function finRecoil(t){return t<1.1?0:t<1.35?55*eo((t-1.1)/.25):55-25*es(clamp01((t-1.35)/.6))}
function drawHole(){
  const b=G.boss;if(b.s!=='fin'||b.t<2.0)return;
  const k=es(clamp01((b.t-2.0)/.22)),hw=125*k,x0=HOLE_X-hw;
  ctx.save();
  const g=ctx.createLinearGradient(0,DECK-6,0,H);
  g.addColorStop(0,'#14090c');g.addColorStop(1,'#7a2a10');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x0,DECK-6);
  for(let i=1;i<=8;i++)ctx.lineTo(x0+i*hw/4,DECK-6+(i%2?10:-2));
  ctx.lineTo(HOLE_X+hw,H);ctx.lineTo(x0,H);ctx.closePath();ctx.fill();
  const lg=ctx.createRadialGradient(HOLE_X,H,10,HOLE_X,H,220*k);lg.addColorStop(0,'rgba(255,140,50,.55)');lg.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=lg;ctx.fillRect(x0,DECK-6,hw*2,H-DECK+6);
  ctx.restore();
}
function drawCracks(){
  /* coup final de la phase I : le rayon de la lanterne file jusqu'au torse du Colosse et y explose */
  const p=G.pl;if(p.s!=='final'||p.t<.5)return;
  if(p.t>=1.1&&p.t<2.0){const u=(p.t-1.1)/.9,cx=BX-40+finRecoil(p.t),cy=DECK-200,rr=40+520*eo(u),al=Math.max(0,1-u*1.15);
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,'rgba(255,255,255,'+al+')');g.addColorStop(.35,'rgba(191,234,255,'+(.6*al)+')');g.addColorStop(1,'rgba(111,211,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,rr,0,6.283);ctx.fill();
    ctx.save();ctx.strokeStyle='rgba(255,255,255,'+(.8*al)+')';ctx.lineWidth=4;ctx.lineCap='round';for(let i=0;i<14;i++){const a=i*.4488+.2,r0=30+rr*.25,r1=r0+90+rr*.45;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);ctx.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);ctx.stroke()}
    ctx.lineWidth=6*al+1;ctx.beginPath();ctx.arc(cx,cy,rr*.8,0,6.283);ctx.stroke();ctx.restore()}
  if(p.t>1.35)return;
  const L=[p.x+48,DECK-166-liftAmt()],C=[BX-40,DECK-200],u=es(clamp01((p.t-.5)/.6)),al=p.t<1.1?clamp01((p.t-.5)/.1):clamp01(1-(p.t-1.1)/.25);
  lanternBeam(L,lerp2(L,C,u),12+8*u,al);
}
function drawAura(lvl){
  const t=G.time,big=lvl===1?1.5:1;
  ctx.save();
  const rg=ctx.createRadialGradient(0,-170,20,0,-170,200*big);
  rg.addColorStop(0,'rgba(255,140,50,.3)');rg.addColorStop(1,'rgba(255,100,30,0)');
  ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,-170,200*big,0,6.283);ctx.fill();
  AURA.forEach((q,i)=>{
    const h=(26+22*Math.abs(Math.sin(t*9+i*1.7)))*big,w=(9+4*Math.abs(Math.sin(t*7+i)))*big;
    ctx.fillStyle=lvl===1?(i%2?'rgba(255,240,190,.9)':'rgba(255,180,70,.9)'):(i%2?'rgba(255,196,90,.85)':'rgba(255,100,40,.85)');
    ctx.beginPath();ctx.moveTo(q[0]-w,q[1]);
    ctx.quadraticCurveTo(q[0]+Math.sin(t*6+i)*6,q[1]-h*.6,q[0],q[1]-h);
    ctx.quadraticCurveTo(q[0]+Math.sin(t*5+i)*5,q[1]-h*.5,q[0]+w,q[1]);
    ctx.closePath();ctx.fill();
  });
  ctx.restore();
}
function drawOrb(){
  const p=G.pl;if(p.s!=='cast')return;
  const cr=[PX+48,DECK-166],charge=p.t<T.cast;
  let pos,r,q=0;
  if(charge){pos=cr;r=4+20*eo(p.t/T.cast)}
  else{q=clamp01((p.t-T.cast)/T.orb);pos=lerp2(cr,ORB_T,es(q));pos[1]-=70*Math.sin(Math.PI*q);r=24}
  if(!charge){
    for(let i=1;i<=5;i++){
      const qq=Math.max(0,q-i*.05),tp=lerp2(cr,ORB_T,es(qq));tp[1]-=70*Math.sin(Math.PI*qq);
      ctx.fillStyle='rgba(220,245,255,'+(.35-i*.06)+')';
      ctx.beginPath();ctx.arc(tp[0],tp[1],r*(1-i*.12),0,6.283);ctx.fill();
    }
  }
  ctx.save();
  const g=ctx.createRadialGradient(pos[0],pos[1],0,pos[0],pos[1],r*2.6);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,246,200,.9)');
  g.addColorStop(.65,'rgba(111,211,255,.35)');g.addColorStop(1,'rgba(111,211,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(pos[0],pos[1],r*2.6,0,6.283);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;
  for(let i=0;i<8;i++){
    const a=G.time*3+i*Math.PI/4;
    ctx.beginPath();ctx.moveTo(pos[0]+Math.cos(a)*r*1.1,pos[1]+Math.sin(a)*r*1.1);
    ctx.lineTo(pos[0]+Math.cos(a)*r*2.2,pos[1]+Math.sin(a)*r*2.2);ctx.stroke();
  }
  ctx.restore();
}
function render(){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(G.shake>0&&!reduce)ctx.translate(rand(-1,1)*G.shake,rand(-1,1)*G.shake);
  ctx.drawImage(bgFar,0,0,W,H);
  const pulse=.85+.15*Math.sin(G.time*2.1)+.05*Math.sin(G.time*7.3);
  const lg=ctx.createRadialGradient(W/2,H+60,20,W/2,H+60,560);
  lg.addColorStop(0,'rgba(255,110,30,'+(.55*pulse)+')');lg.addColorStop(.5,'rgba(200,50,20,'+(.22*pulse)+')');lg.addColorStop(1,'rgba(120,20,10,0)');
  ctx.fillStyle=lg;ctx.fillRect(0,0,W,H);
  drawEmbers(0,70,1);
  ctx.drawImage(bgBridge,0,0,W,H);
  drawHole();ctx.save();ctx.translate(G.ix||0,0);drawBoss();ctx.restore();drawCracks();drawPlayer();drawFlame();drawJets();drawRock();if(G.boss.dbf&&G.boss.s==='fl_in')drawChainTell(BX-18,DECK-238,G.boss.t);if(G.boss.dbl&&(G.boss.s==='windup'||G.boss.s==='strike'))drawDblTell(G.boss.t);drawRing();drawBarrier();drawOrb();drawHints();drawFx();
  drawEmbers(0,18,.9);
  ctx.restore();
  ctx.drawImage(vig,0,0,W,H);
  if(G.flash>0){ctx.fillStyle='rgba(255,255,255,'+G.flash+')';ctx.fillRect(0,0,W,H)}
  if(G.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(G.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  if(G.p2&&G.pl.s==='final'){const fa=clamp01((G.pl.t-2.9)/.8);if(fa>0){ctx.fillStyle='rgba(0,0,0,'+fa+')';ctx.fillRect(0,0,W,H)}}
}

/* ================= PHASE II : la Fonderie ================= */
let Q=null;
const QH=[250,300],QB=[705,285];
const DG={act:.333,rec:.7,grace:.05,hurt:.38,drop:110};
const QA={
  claws:{hits:[{k:'clawA',at:.9},{k:'clawB',at:1.65}],cn:'stab',get name(){return _('Claw strikes','Coups de griffe')}},
  wings:{hits:[{k:'wave',at:1.0},{k:'wave',at:1.7},{k:'wave',at:2.4}],cn:'head',get name(){return _(`Wing strike`,`Coup d'ailes`)}},
  rocks:{hits:[{k:'rock',at:.95},{k:'rock',at:1.55}],cn:'beam',get name(){return _('Debris throw','Lancer de débris')}}
};
const QAH={
  claws:{hits:[{k:'clawA',at:.8},{k:'clawB',at:1.15},{k:'clawA',at:1.95},{k:'clawB',at:2.3}],cn:'stab',get name(){return _('Claw flurry','Rafale de griffes')}},
  wings:{hits:[{k:'wave',at:.95},{k:'wave',at:1.5},{k:'wave',at:1.85},{k:'wave',at:2.6},{k:'wave',at:2.95}],cn:'head',get name(){return _('Wing barrage','Barrage d\'ailes')}},
  rocks:{hits:[{k:'rock',at:.95},{k:'rock',at:1.6},{k:'fire',at:2.2}],cn:'beam',get name(){return _('Debris and fireball','Débris et boule de feu')}}
};
const ROCKP=Array.from({length:9},(_,i)=>{const a=i/9*6.283;return[Math.cos(a)*(.75+((i*37)%5)/10),Math.sin(a)*(.75+((i*53)%5)/10)]});
function qNew(){
  return{mode:'intro',t:0,time:0,lt:0,php:startHP(),bhp:DIFF.bhp,parries:0,taken:0,scroll:0,speed:900,
    pl:{s:'ready',t:0,deny:0},boss:{s:'idle',t:0,wait:.6,dur:1,after:''},atk:null,cn:null,chain:null,chainMiss:false,
    enraged:false,rn:0,rage2:false,last:'',n:0,sparks:[],floats:[],rings:[],exps:[],fbs:[],
    streaks:Array.from({length:40},()=>({x:rand(0,W),y:rand(0,H),v:rand(500,1000),l:rand(16,56)})),
    debris:Array.from({length:7},()=>({x:rand(60,W-60),y:rand(0,H),v:rand(180,420),r:rand(8,24),a:rand(0,6),w:rand(-3,3)})),
    shake:0,flash:0,hurt:0,hitstop:0,recoil:0,endIn:0,wo:0,bx:QB[0],by:QB[1],hx:QH[0],hy:QH[1],dropY:0,splash:0,ended:false,wing:false,fn:0};
}
function setPhaseUI(n){
  try{$('retryBtn').disabled=false;$('phases').style.display=RUN.on?'none':''}catch(e){}
  document.querySelectorAll('#phases li').forEach((li,i)=>{
    li.classList.toggle('on',i===n-1);
    if(i===n-1)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');
  });
  $('hdEye').textContent=n===1?_('Phase I of III · On the bridge','Phase I sur III · Sur le pont'):n===2?_('Phase II of III · The Foundry','Phase II sur III · La Fonderie'):_('Phase III of III · The Bell Tower','Phase III sur III · Le Clocher');
  el.ward.textContent=n===1?_('Block','Bloquer'):n===2?_('Dodge','Esquiver'):_('Parry','Parer');
  cv.setAttribute('aria-label',n===1?_('Arena: the Watcher faces the Ember Colossus on a stone bridge','Arène du combat : le Veilleur face au Colosse de braise sur un pont de pierre'):n===2?_('Arena: the Watcher and the winged Ember Colossus fall down the Foundry shaft','Arène du combat : le Veilleur et le Colosse de braise ailé tombent dans le puits de la Fonderie'):_('Arena: the Watcher faces the Ember Colossus atop the snowy Watchers\' Bell Tower','Arène du combat : le Veilleur face au Colosse de braise au sommet enneigé du Clocher des Veilleurs'));
}
function beginP2(noLore){
  if(RUN.on&&G&&G.mode==='won'){RUN.cur=Math.min(RUN.max,G.php+1);RUN.st[1]={p:G.parries,h:G.grabs}}
  R=null;Q=qNew();setPhaseUI(2);lastP=-1;lastB=-1;
  el.ov.hidden=true;if(!noLore)showLore(2);
  say(_('Phase II. The Watcher and the Colossus fall into the Foundry. The button now dodges.','Phase II. Le Veilleur et le Colosse tombent dans la Fonderie. Le bouton sert maintenant à esquiver.'));
  hud();
}
function qBurst(x,y,n,cols){for(let i=0;i<n;i++){const a=rand(0,6.283),v=rand(80,380),L=rand(.3,.7);(R||Q).sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,g:300,life:L,max:L,col:cols[i%cols.length],sz:rand(2,5)})}}
function qFloat(txt,x,y,col,sz,life){txt=ono(txt);if(!txt)return;(R||Q).floats.push({txt,x,y,col,sz:ONOSZ[txt]||sz||26,life:life||.9,max:life||.9})}
function qFlameBurst(x,y,big,mega){
  (R||Q).fbs.push({x,y,t:0,big:big||1});
  /* Le cri (son et mot) part avec l'impact, à côté de la tête du Colosse ; la voix dépend de la force du coup et de sa vie restante. mega = cri de la foudre. */
  if(mega){qFloat(megaCry(),R.bx-224,DECK-330,'#fff2b8',52,1.7);return}
  const o=R||Q,hv=(big||1)>=1.3,hd=R?[R.bx-128,DECK-300]:[Q.bx-128,Q.by-130];
  qFloat(hurtCry(hv,o.bhp),hd[0],hd[1],hv?'#ffc15a':'#ffb347',hv?40:34,.9);
}
function qRing(x,y){(R||Q).rings.push({x,y,life:.35,max:.35})}

function qPress(){
  if(Q.mode!=='play')return;
  ensureAudio();
  const p=Q.pl;
  if(p.s==='ready'){p.s='dodge';p.t=0;tone(420,.16,'triangle',.05,-200)}
  else if(p.s==='dodge'||p.s==='recover')p.deny=.25;
}
function qPick(){
  const kinds=['claws','wings','rocks'];
  let k=Q.last===''?'claws':kinds[Math.floor(Math.random()*3)];
  if(k===Q.last&&Q.n>=2){const o=kinds.filter(x=>x!==k);k=o[Math.floor(Math.random()*2)]}
  Q.n=(k===Q.last)?Q.n+1:1;Q.last=k;
  return k;
}
function qIdle(){const b=Q.boss;b.s='idle';b.t=0;b.wait=DIFF.hard?rand(DIFF.waitMin,DIFF.waitMax):rand(.8,1.4)}
function qTurn(){
  const b=Q.boss;
  if(Q.bhp===1){
    Q.chain=DIFF.q2?['claws','wings','rocks','roar']:['claws','wings','rocks'];Q.chainMiss=false;
    qRage(1.3,'chain');
  }else if(DIFF.q2){
    const n=DIFF.rages.filter(x=>Q.bhp<=x).length;
    if(n>Q.rn){Q.rn=n;if(n>=2)Q.rage2=true;qRoar(n>=2?_('RAGE!','RAGE !'):_('ENRAGED','ENRAGEMENT'),n)}
    else qLaunch(qPick());
  }else if(Q.bhp===DIFF.u){
    qRage(Q.enraged?.8:1.6,'rand');
  }else qLaunch(qPick());
}
function qRage(dur,after){
  const b=Q.boss;
  b.s='rage';b.t=0;b.dur=dur;b.after=after;Q.enraged=true;
  Q.shake=reduce?0:10;Q.flash=.35;
  tone(70,dur,'sawtooth',.09,60);tone(140,dur*.8,'square',.04,100);
  say(Q.bhp===1?(DIFF.q2?_('Final assault: claws, wings, debris, then a final roar.','Dernier assaut : griffes, ailes, débris, puis un dernier cri.'):_('Final assault: the Colossus will chain his three attacks.','Dernier assaut : le Colosse va enchaîner ses trois attaques.')):_('The Colossus enrages. A flaming tail will end each attack.','Le Colosse s\'enrage. Une queue enflammée terminera chaque attaque.'));
}
function qLaunch(kind){
  if(kind==='roar'){qRoar();return}
  const d=(DIFF.q2?QAH:QA)[kind],b=Q.boss;
  const hits=d.hits.map(h=>({k:h.k,at:h.at,ok:null,done:false}));
  const nt=Q.enraged?(DIFF.q2&&Q.rage2?2:1):0;
  let L=hits[hits.length-1].at;
  if(nt>=1){L+=.85;hits.push({k:'tail',at:L,ok:null,done:false})}
  if(nt>=2){L+=.55;hits.push({k:'tail',at:L,ok:null,done:false})}
  Q.atk={kind,t:0,hits,end:L+.5,miss:0,cn:d.cn};
  b.s='atk';b.t=0;
  tone(120,.6,'sawtooth',.04,80);
  say(d.name+(nt>1?_(', tail sweep to follow.',', balayage de queue à suivre.'):nt?_(', tail strike to follow.',', coup de queue à suivre.'):'.'));
}
/* Cri du Colosse (Difficile, phase II) : un éboulement de 6 rochers à rythme aléatoire. */
function qRoar(label,n){
  const b=Q.boss;Q.enraged=true;
  Q.shake=reduce?0:10;Q.flash=label?.35:.2;
  tone(70,3.4,'sawtooth',.09,60);tone(140,2.8,'square',.04,100);
  const hits=[];let tt=.9+rand(0,.2);
  for(let i=0;i<5;i++){hits.push({k:'fall',at:tt,ok:null,done:false});tt+=rand(DIFF.hard?.55:.32,DIFF.hard?.9:.62)}
  Q.atk={kind:'roar',t:0,hits,end:tt,miss:0,cn:null};
  b.s='atk';b.t=0;
  say(n>=2?_('The Colossus roars again. His tail will now sweep twice after each attack. Debris rains down!','Le Colosse rugit à nouveau. Sa queue balaiera deux fois après chaque attaque. Des débris pleuvent !'):n===1?_('The Colossus roars: the bridge debris rains down!','Le Colosse rugit : les débris du pont pleuvent d\'en haut !'):_('A final roar: the bridge debris rains down!','Un dernier cri : les débris du pont pleuvent d\'en haut !'));
}
function qResolve(h){
  const p=Q.pl,a=Q.atk;
  /* Difficile : les rochers (cris et attaque) laissent une marge de plus pour esquiver, car leur rythme est irrégulier */
  const gr=DIFF.hard&&(h.k==='fall'||h.k==='rock')?DG.grace+.13:DG.grace;
  const ok=p.s==='dodge'||(p.s==='recover'&&p.t<gr);
  h.ok=ok;
  if(ok){
    Q.parries++;Q.flash=Math.max(Q.flash,.15);
    {const u=p.s==='dodge'?p.t/DG.act:1,off=u<.27?es(u/.27):u<.73?1:1-es((u-.73)/.27);p.ox=-20*off;p.oy=DG.drop*off;p.s='ready';p.t=0}
    qBurst(QH[0],QH[1]+DG.drop*.6,14,['#bfeaff','#ffffff','#6fd3ff']);
    tone(900,.18,'square',.04,-300);
  }else{
    a.miss++;
    qHurt(h.k);
  }
}
function qHurt(k){
  const p=Q.pl;
  Q.php=Math.max(0,Q.php-1);Q.taken++;Q.shake=reduce?0:13;Q.hurt=.35;Q.hitstop=.07;thud(1);
  qBurst(QH[0],QH[1],26,['#ff8a4a','#ffc15a','#ff5252']);
  qFloat(k==='rock'||k==='fall'?_('CRUSHED!','ÉCRASÉ !'):_('HIT!','TOUCHÉ !'),QH[0]-30,QH[1]-120,'#ff8a6b');
  tone(90,.3,'sawtooth',.1,-40);
  if(Q.php<=0){p.s='down';p.t=0;Q.mode='lost';Q.endIn=1.3;say(_('You are swept away by the fall. Defeat.','Tu es emporté par la chute. Défaite.'))}
  else{
    /* enchaînement : l'étourdissement s'arrête assez tôt pour esquiver le coup suivant */
    const a=Q.atk,nx=a&&a.hits.find(x=>!x.done),gap=nx?nx.at-a.t:99,base=k==='fall'?.14:DG.hurt;
    p.s='hurt';p.t=0;p.hs=Math.min(base,Math.max(.14,gap-.2));say(_('Hit.','Touché.'))
  }
}
function qAtkStep(dt){
  const a=Q.atk;a.t+=dt;
  for(const h of a.hits){if(!h.done&&a.t>=h.at){h.done=true;qResolve(h);if(Q.mode!=='play')return}}
  if(a.t>=a.end)qAtkEnd();
}
function qAtkEnd(){
  const a=Q.atk,b=Q.boss,ok=a.miss===0||a.kind==='roar'; /* un caillou touché coûte une vie mais ne casse pas la chaîne finale */
  Q.atk=null;
  if(Q.chain){
    if(!ok)Q.chainMiss=true;
    if(Q.chainMiss){Q.chain=null;b.s='fail';b.t=0;return}
    if(Q.chain.length){b.s='gap';b.t=0;return}
    Q.chain=null;qFinal();return;
  }
  if(a.kind==='roar'){qIdle();return}
  if(ok)qCounter(a.cn);else{b.s='fail';b.t=0}
}
function qCounter(k){
  const b=Q.boss,p=Q.pl;
  Q.cn={k,t:0,hit:false};b.s='cn';b.t=0;p.s='counter';p.t=0;
  tone(300,.4,'triangle',.05,300);
  say(_('Perfect dodge. Riposte!','Esquive parfaite. Riposte !'));
}
function qFinal(){
  const b=Q.boss,p=Q.pl;
  Q.cn={k:'final',t:0};b.s='cn';b.t=0;p.s='counter';p.t=0;
  say(_('Chain dodged. The Watcher gathers himself.','Enchaînement esquivé. Le Veilleur se concentre.'));
}
function qDamage(k){
  Q.bhp=Math.max(0,Q.bhp-1);Q.recoil=1;Q.shake=reduce?0:13;Q.hitstop=.11;Q.flash=.4;thud(1.2);
  const tg=k==='head'?[Q.bx,Q.by-92]:[Q.bx-30,Q.by-4];
  qBurst(tg[0],tg[1],30,['#ffffff','#bfeaff','#ffc15a']);qRing(tg[0],tg[1]);
  tone(170,.25,'square',.08,-110);tone(900,.2,'sine',.05);
  qFlameBurst(tg[0],tg[1],k==='beam'?1.3:1);
  if(k==='beam'){Q.exps.push({x:tg[0],y:tg[1],t:0,s:.8});qRing(tg[0],tg[1]);qBurst(tg[0],tg[1],30,['#ffffff','#bfeaff','#6fd3ff'])}
  say(_('Riposte landed.','Riposte réussie.'));
}
function qCnStep(dt){
  const c=Q.cn,b=Q.boss,p=Q.pl;c.t+=dt;
  if(c.k==='final'){qFinalStep(c);return}
  const sp={stab:{hit:.35,end:1.15},head:{hit:.55,end:1.45},beam:{hit:.85,end:1.65}}[c.k];
  if(c.k==='beam'&&c.t<.75&&Math.random()<.6){
    const a=rand(0,6.283),r=rand(40,80),tip=qSwordTip();
    Q.sparks.push({x:tip[0]+Math.cos(a)*r,y:tip[1]+Math.sin(a)*r,vx:-Math.cos(a)*r*4,vy:-Math.sin(a)*r*4,g:0,life:.25,max:.25,col:'#bfeaff',sz:2.5});
  }
  if(!c.hit&&c.t>=sp.hit){c.hit=true;qDamage(c.k)}
  if(c.t>=sp.end){Q.cn=null;p.s='ready';p.t=0;b.s='hurt';b.t=0}
}
function qFinalStep(c){
  const chest=[Q.bx-20,Q.by-4];
  if(!c.a&&c.t>=.15){c.a=true;tone(500,.9,'sine',.05,600)}
  if(c.t<1.1&&Math.random()<.7){
    const a=rand(0,6.283),r=rand(70,130);
    Q.sparks.push({x:Q.hx+Math.cos(a)*r,y:Q.hy+Math.sin(a)*r,vx:-Math.cos(a)*r*3.5,vy:-Math.sin(a)*r*3.5,g:0,life:.3,max:.3,col:Math.random()<.5?'#ffffff':'#bfeaff',sz:3});
  }
  if(!c.b&&c.t>=1.55){
    c.b=true;Q.bhp=0;Q.recoil=1;Q.shake=reduce?0:16;Q.hitstop=.14;Q.flash=.8;thud(1.6);qFloat(_('FINAL BLOW!','COUP ULTIME !'),chest[0]-120,chest[1]-90,'#ffc15a');
    qBurst(chest[0],chest[1],44,['#ffffff','#fff2b8','#bfeaff']);
    tone(70,.7,'sawtooth',.1,-30);tone(900,.5,'sine',.06,500);
    qFlameBurst(chest[0],chest[1],1.5);
    say(_(`The lantern's beam pierces the Colossus's chest.`,`Le rayon de la lanterne transperce le torse du Colosse.`));
  }
  [1.95,2.55,3.15].forEach((tt,i)=>{
    if(!c['e'+i]&&c.t>=tt){
      c['e'+i]=true;Q.exps.push({x:chest[0],y:chest[1],t:0,s:1+i*.45});
      Q.flash=.75;Q.shake=reduce?0:14+i*4;Q.hitstop=.06;
      qBurst(chest[0],chest[1],30,['#ffffff','#fff2b8','#bfeaff']);
      tone(120+i*40,.6,'sine',.12,-60);tone(700+i*150,.5,'sine',.06,500);
      qRing(chest[0],chest[1]);qFlameBurst(chest[0],chest[1],1.3+i*.35);
    }
  });
  if(!c.d&&c.t>=3.9){c.d=true;Q.mode='lake';Q.lt=0;say(_('The Colossus plunges toward the great furnace.','Le Colosse plonge vers le grand four.'))}
}
function qBoss(dt){
  const b=Q.boss;b.t+=dt;
  switch(b.s){
    case 'idle':if(b.t>=b.wait)qTurn();break;
    case 'rage':if(b.t>=b.dur){if(b.after==='chain'){qChainNext()}else qLaunch(qPick())}break;
    case 'atk':qAtkStep(dt);break;
    case 'gap':if(b.t>=.55)qChainNext();break;
    case 'cn':qCnStep(dt);break;
    case 'fail':if(b.t>=1.0)qIdle();break;
    case 'hurt':if(b.t>=.55)qIdle();break;
  }
}
function qChainNext(){const k=Q.chain.shift();Q.last=k;qLaunch(k)}
function lakeY(){return H+80-(H+80-340)*ei(clamp01((Q.lt-.4)/1.8))}
function qLayout(){
  const t=Q.t;
  let bx=QB[0],by=QB[1],hx=QH[0],hy=QH[1];
  if(Q.mode==='intro'){
    const eb=1-eo(clamp01(t/2.0)),eh=1-eo(clamp01((t-.2)/1.9));
    bx+=90*eb;by-=560*eb;hx-=60*eh;hy-=620*eh;
  }
  by+=Math.sin(Q.time*2)*7;hy+=Math.sin(Q.time*2.6+1)*5;
  bx+=Q.recoil*20;
  by+=Q.dropY;
  /* fin de phase II : le Veilleur se rattrape sur une passerelle au-dessus du métal en fusion, le Colosse plonge seul */
  if(Q.mode==='lake'){const cy=lakeY()-40;if(Q.landed||hy+44>=cy){hy=cy-44;if(!Q.landed){Q.landed=Q.lt||.001;qBurst(hx,cy,22,['#ffd27a','#ff9a3c','#9a8a9e']);forgeSparks(Q,hx+10,cy,20);Q.shake=reduce?0:Math.max(Q.shake,10);anvil();say(_('The Watcher catches himself on a catwalk, above the molten metal.','Le Veilleur se rattrape sur une passerelle, au-dessus du métal en fusion.'))}}}
  Q.bx=bx;Q.by=by;Q.hx=hx;Q.hy=hy;
}
function qEnd(){
  const win=Q.mode==='lake';
  if(win&&RUN.on){setTimeout(()=>beginP3(true),0);return} /* épreuve : pas de carte entre les phases */
  el.eye.textContent=win?_('Transition · Phase III','Transition · Phase III'):_('Defeat · Phase II','Défaite · Phase II');
  el.title.textContent=win?_(`The great furnace swallows the Colossus.`,`Le grand four engloutit le Colosse.`):_('Swept away by the fall.','Emporté par la chute.');
  el.stats.textContent=_('Dodges ','Esquives ')+Q.parries+_(' · Hits taken ',' · Coups subis ')+Q.taken+trStr(2);
  el.stats.hidden=false;
  el.desc.textContent=win?_(`The Watcher barely catches himself on a catwalk. Rekindled, the Colossus bursts from the furnace and flies up the chimney.`,`Le Veilleur se rattrape de justesse sur une passerelle. Ravivé, le Colosse jaillit du four et s'envole par la cheminée.`):_(`Nothing holds the Watcher anymore. He vanishes into the depths of the Foundry, and his light goes out with him.`,`Rien ne retient plus le Veilleur. Il disparaît dans les profondeurs de la Fonderie, et sa lumière s'éteint avec lui.`);
  el.go.textContent=win?_('Start Phase III','Lancer la phase III'):_('Retry Phase II','Réessayer la phase II');
  if(!win)deathCard();
  el.ov.hidden=false;
  try{el.go.focus({preventScroll:true})}catch(e){}
}
function qStep(dt){
  Q.time+=dt;Q.t+=dt;
  for(const s of Q.streaks){s.y-=s.v*dt*(Q.speed/320);if(s.y<-80){s.y=H+rand(0,80);s.x=rand(0,W)}}
  for(const d of Q.debris){d.y-=d.v*dt*(Q.speed/320);d.a+=d.w*dt;if(d.y<-60){d.y=H+rand(20,120);d.x=rand(60,W-60)}}
  Q.scroll+=Q.speed*dt;
  for(let i=Q.sparks.length-1;i>=0;i--){const s=Q.sparks[i];s.life-=dt;if(s.life<=0){Q.sparks.splice(i,1);continue}s.vy+=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt}
  for(let i=Q.rings.length-1;i>=0;i--){Q.rings[i].life-=dt;if(Q.rings[i].life<=0)Q.rings.splice(i,1)}
  for(let i=Q.floats.length-1;i>=0;i--){Q.floats[i].life-=dt;if(Q.floats[i].life<=0)Q.floats.splice(i,1)}
  for(let i=Q.exps.length-1;i>=0;i--){Q.exps[i].t+=dt;if(Q.exps[i].t>.9)Q.exps.splice(i,1)}
  for(let i=Q.fbs.length-1;i>=0;i--){Q.fbs[i].t+=dt;if(Q.fbs[i].t>.7)Q.fbs.splice(i,1)}
  Q.shake=Math.max(0,Q.shake-dt*45);Q.flash=Math.max(0,Q.flash-dt*2.2);Q.hurt=Math.max(0,Q.hurt-dt*1.6);Q.recoil=Math.max(0,Q.recoil-dt*3.5);
  if(Q.endIn>0){Q.endIn-=dt;if(Q.endIn<=0)qEnd()}
  qLayout();
  if(Q.hitstop>0){Q.hitstop-=dt;hud();return}
  const p=Q.pl;p.t+=dt;p.deny=Math.max(0,p.deny-dt);
  if(p.oy){p.oy*=Math.max(0,1-dt*14);p.ox*=Math.max(0,1-dt*14);if(p.oy<1)p.oy=p.ox=0}
  if(Q.mode==='intro'){
    Q.speed=320+580*(1-clamp01(Q.t/2.6));
    Q.wo=es(clamp01((Q.t-1.0)/1.0));
    /* battements d'ailes : un souffle grave + un claquement sourd, de plus en plus lents */
    const FL=[.9,1.25,1.7,2.25];while(Q.fn<FL.length&&Q.t>=FL[Q.fn]){noise(.4,.24,700,140);boom(.3,.08);Q.fn++}
    if(!Q.wing&&Q.t>=1.35){Q.wing=true;Q.shake=reduce?0:12;Q.flash=.35;tone(90,.7,'sawtooth',.09,60);qFloat(_('PHASE II','PHASE II'),W/2-110,120,'#ffc15a',54,1.8);qBurst(Q.bx+60,Q.by-60,30,['#ffc15a','#ff7a2b'])}
    if(Q.t>=2.7){Q.mode='play';Q.boss.wait=.6;Q.wo=1}
    hud();return;
  }
  if(Q.mode!=='lake'){Q.speed=320}
  if(p.s==='dodge'&&p.t>=DG.act){p.s='recover';p.t=0}
  else if(p.s==='recover'&&p.t>=DG.rec){p.s='ready';p.t=0}
  else if(p.s==='hurt'&&p.t>=(p.hs||DG.hurt)){p.s='ready';p.t=0}
  if(Q.mode==='play')qBoss(dt);
  if(Q.mode==='lake'){
    Q.lt+=dt;
    Q.wo=1-.75*es(clamp01(Q.lt/1.0));
    if(!Q.splash&&lakeY()<=Q.by+150){
      Q.splash=Q.lt;
      qBurst(QB[0]-40,lakeY(),70,['#fff2b8','#ffc15a','#ff7a2b','#ffffff']);
      qRing(QB[0]-40,lakeY());Q.flash=.6;Q.shake=reduce?0:18;
      tone(60,.9,'sine',.15,-30);tone(300,.5,'sawtooth',.04,-200);
    }
    if(Q.splash){
      const d=Q.lt-Q.splash;Q.speed=Math.max(0,Q.speed-900*dt);
      if(d<1.0)Q.dropY=d*240;
      else{
        /* ravivé par le métal en fusion, il jaillit du four, ailes déployées, et s'envole vers la cheminée */
        const e=d-1.0;Q.dropY=240-e*e*620-e*180;Q.wo=Math.min(1.25,.25+e*3);
        if(!Q.erupt){Q.erupt=true;Q.flash=.7;Q.shake=reduce?0:22;roar();boom(1.2,.2);qBurst(QB[0]-20,lakeY(),80,['#fff2b8','#ffc15a','#ff7a2b','#ffffff']);qRing(QB[0]-20,lakeY());forgeSparks(Q,QB[0]-20,lakeY(),50);
          say(_('The Colossus bursts from the furnace, wings spread!','Le Colosse jaillit du four, ailes déployées !'))}
        if(Math.random()<.6)Q.sparks.push({x:Q.bx+rand(-60,60),y:Q.by+rand(20,120),vx:rand(-40,40),vy:rand(60,200),g:300,life:.6,max:.6,col:Math.random()<.5?'#ffc15a':'#ff7a2b',sz:rand(3,6)});
      }
    }
    else Q.speed=320+600*clamp01(Q.lt/1.4);
    if(!Q.ended&&Q.splash&&Q.lt-Q.splash>2.8){Q.ended=true;qEnd()}
  }
  hud();
}

/* ---------- rendu phase II ---------- */
function qp(pts,fill,stroke,lw){
  ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||2;ctx.lineJoin='round';ctx.stroke()}
}
function qlimb(a,b,w,col){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
function qflame(x,y,w,h,ph,col){
  const t=R?R.time:Q?Q.time:G.time;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-w,y);
  ctx.quadraticCurveTo(x+Math.sin(t*8+ph)*w*.6-w*.2,y-h*.55,x+Math.sin(t*6+ph)*w*.5,y-h);
  ctx.quadraticCurveTo(x+Math.sin(t*7+ph)*w*.4+w*.2,y-h*.5,x+w,y);ctx.closePath();ctx.fill();
}
/* Phase II : le puits de la Fonderie, sous le pont. Tout défile vers le haut pendant la chute. */
function qScrollY(base,period,sp){return ((base-Q.scroll*sp)%period+period)%period-60}
function qGear(x,y,r,a,col){
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=col;
  for(let i=0;i<10;i++){ctx.rotate(.628);ctx.fillRect(-r*.14,-r-8,r*.28,14)}
  ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.arc(0,0,r*.45,0,6.283,true);ctx.fill();
  ctx.restore();
}
function qBackground(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b0607');g.addColorStop(.55,'#1d0d0a');g.addColorStop(1,'#5a1a08');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const pulse=.85+.15*Math.sin(Q.time*2.1);
  const lg=ctx.createRadialGradient(W/2,H+60,20,W/2,H+60,620);
  lg.addColorStop(0,'rgba(255,120,30,'+(.65*pulse)+')');lg.addColorStop(.5,'rgba(210,60,20,'+(.24*pulse)+')');lg.addColorStop(1,'rgba(120,20,10,0)');
  ctx.fillStyle=lg;ctx.fillRect(0,0,W,H);
  /* fond : engrenages et chaînes (parallaxe lente) */
  for(const [bx,base,r,dir] of [[150,80,70,1],[820,330,90,-1],[470,520,60,1]]){
    qGear(bx,qScrollY(base,700,.25),r,Q.time*.4*dir,'#1a0f10');
  }
  ctx.strokeStyle='#22151a';ctx.lineWidth=4;
  for(const cx of [260,380,600,700]){
    const o=(Q.scroll*.3)%24;
    for(let y=-24+((cx*7)%24)-o;y<H+24;y+=24){ctx.beginPath();ctx.ellipse(cx,y,4,8,0,0,6.283);ctx.stroke()}
  }
  /* plan moyen : creusets et coulées de métal */
  for(const [cx,base,side] of [[210,140,1],[750,460,-1],[330,600,1]]){
    const y=qScrollY(base,760,.6);
    ctx.fillStyle='#2b1a14';ctx.beginPath();ctx.moveTo(cx-26,y);ctx.lineTo(cx+26,y);ctx.lineTo(cx+20,y+30);ctx.lineTo(cx-20,y+30);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffc15a';ctx.fillRect(cx-20,y+2,40,4);
    const lx=cx+side*26;
    ctx.strokeStyle='rgba(255,154,60,.9)';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(cx+side*18,y+4);ctx.quadraticCurveTo(lx+side*10,y+4,lx+side*10,y+40);ctx.lineTo(lx+side*10,H+60);ctx.stroke();
    ctx.strokeStyle='rgba(255,230,160,.9)';ctx.lineWidth=2;ctx.stroke();
  }
  /* parois de fer rivetées */
  for(const side of [-1,1]){
    const w=78,x0=side<0?0:W-w;
    ctx.fillStyle='#1e1312';ctx.fillRect(x0,0,w,H);
    ctx.fillStyle='#2c1c18';ctx.fillRect(side<0?w-8:W-w,0,8,H);
    const o=(Q.scroll)%90;
    for(let y=-90-o;y<H+90;y+=90){
      ctx.fillStyle='#120a0a';ctx.fillRect(x0,y,w,4);
      ctx.fillStyle='#4a3430';
      for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x0+14+i*24,y+14,3,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(x0+14+i*24,y+76,3,0,6.283);ctx.fill()}
    }
    const ov=(Q.scroll)%270;
    for(let y=60-ov;y<H+270;y+=270){
      ctx.fillStyle='#0c0606';ctx.fillRect(x0+18,y+30,w-36,20);
      ctx.fillStyle='rgba(255,122,43,'+(.55+.25*Math.sin(Q.time*6+y))+')';
      for(let i=0;i<4;i++)ctx.fillRect(x0+22+i*((w-44)/4),y+33,(w-44)/4-4,14);
    }
    ctx.strokeStyle='#3b2a24';ctx.lineWidth=10;
    const px=side<0?w+14:W-w-14;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,H);ctx.stroke();
    ctx.strokeStyle='#5a4038';ctx.lineWidth=3;
    for(let y=-60-((Q.scroll*1.1)%160);y<H+60;y+=160){ctx.beginPath();ctx.moveTo(px-9,y);ctx.lineTo(px+9,y);ctx.stroke()}
  }
  ctx.save();ctx.lineCap='round';
  for(const s of Q.streaks){
    ctx.strokeStyle='rgba(255,170,90,'+(.1+s.l/200)+')';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x,s.y+s.l*(Q.speed/320));ctx.stroke();
  }
  ctx.restore();
  for(const d of Q.debris)qrock(d.x,d.y,d.r,d.a,false);
}
function qrock(x,y,r,rot,hot){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);
  qp(ROCKP.map(q=>[q[0]*r,q[1]*r]),hot?'#40303a':'#1b1220',hot?'#ff7a2b':'#2c1d2c',hot?3:2);
  if(hot){ctx.shadowColor='#ff7a2b';ctx.shadowBlur=18;ctx.strokeStyle='rgba(255,200,100,.6)';ctx.lineWidth=2;ctx.stroke()}
  ctx.restore();
}
function wingAngle(){
  let ang=Math.sin(Q.time*2.3)*.07;
  const a=Q.atk,b=Q.boss;
  if(a&&a.kind==='wings'){
    const ws=a.hits.filter(h=>h.k==='wave'),last=ws[ws.length-1].at;
    const raise=clamp01(a.t/.5)*(1-clamp01((a.t-(last-.3))/.5));
    ang-=.4*es(raise);
    ws.forEach(h=>{const d=(a.t-(h.at-.55))/.16;ang+=.85*Math.exp(-d*d)})
  }
  if(b.s==='rage')ang-=.3*Math.sin(clamp01(b.t/b.dur)*3.14);
  if(Q.mode==='lake'&&Q.erupt)ang+=Math.sin(Q.time*14)*.4-.2;
  return ang;
}
/* dmg (0 à 1) : aile abîmée après la foudre, bouts rongés, trous brûlés, une membrure brisée. */
const WING_OK=[[0,0],[200,-215],[250,-130],[345,-120],[285,-30],[330,60],[230,60],[250,140],[110,95]];
const WING_HURT=[[0,0],[170,-175],[235,-120],[300,-95],[262,-25],[290,40],[225,50],[200,112],[105,92]];
const WING_HOLES=[[[190,-120],[215,-100],[205,-70],[180,-85]],[[270,-20],[295,-5],[285,25],[258,10]],[[150,40],[175,50],[165,75],[140,62]]];
function drawWing(S,ang,sc,col,wo0,fire,side,dmg){
  const wo=Math.max(.001,wo0),dm=dmg||0;
  ctx.save();ctx.translate(S[0],S[1]);ctx.scale(side||1,1);ctx.rotate(ang);ctx.scale(wo*sc,wo*sc);
  const P=dm?WING_OK.map((p,i)=>[p[0]+(WING_HURT[i][0]-p[0])*dm*.75,p[1]+(WING_HURT[i][1]-p[1])*dm*.75]):WING_OK;
  qp(P,col,'rgba(255,110,40,.55)',3);
  if(dm){
    WING_HOLES.forEach((h,i)=>{
      const k=clamp01(dm*3-i*.9);if(k<=0)return;
      const cx=h.reduce((s,q)=>s+q[0],0)/4,cy=h.reduce((s,q)=>s+q[1],0)/4;
      qp(h.map(q=>[cx+(q[0]-cx)*k*1.7,cy+(q[1]-cy)*k*1.7]),'rgba(6,2,10,.92)','rgba(255,130,50,.9)',3);
    });
  }
  ctx.strokeStyle='#0f0813';ctx.lineWidth=7;ctx.lineCap='round';
  [1,3,5,7].forEach(i=>{const e=(i===3&&dm>.5)?[P[i][0]*.72,P[i][1]*.72]:P[i];ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(e[0],e[1]);ctx.stroke()});
  if(dm>.3&&fire){
    const tw=R?R.time:Q?Q.time:G.time;
    [[205,-70],[285,15],[160,65]].forEach((q,j)=>qflame(q[0],q[1],6,22+8*Math.sin(tw*9+j),j+3,j%2?'rgba(255,190,90,.85)':'rgba(255,100,40,.85)'));
  }
  if(fire){
    [1,3,5,7].forEach((i,j)=>qflame(P[i][0],P[i][1]+6,9,34+8*Math.sin((R?R.time:Q?Q.time:G.time)*9+j),j,j%2?'rgba(255,190,90,.85)':'rgba(255,100,40,.85)'));
  }
  ctx.restore();
}
function pawPos(side){
  const sg=side==='A'?-1:1,sh=[sg*85,-22];
  const rest=[sg*112,66];
  const a=Q.atk;let pos=rest,fire=Q.enraged?.45:0,held=null;
  if(a&&a.kind==='claws'){
    const hs=a.hits.filter((x,i)=>x.k.startsWith('claw')&&(i%2===0)===(side==='A'));
    const h=hs.find(x=>a.t<x.at+.35)||hs[hs.length-1],d=a.t-h.at;
    const pull=[sg*95,-125];
    const tg=[QH[0]+50-Q.bx,QH[1]-Q.by+(side==='A'?-30:35)];
    if(d>=-.7&&d<-.2)pos=lerp2(rest,pull,es((d+.7)/.5));
    else if(d>=-.2&&d<0)pos=lerp2(pull,tg,ei((d+.2)/.2));
    else if(d>=0&&d<.35)pos=lerp2(tg,rest,es(d/.35));
    if(d>=-.7&&d<.3)fire=1;
  }else if(a&&a.kind==='rocks'){
    const hold=[sg*100,-95],fwd=[-170,-70];
    a.hits.forEach((h,i)=>{
      if(h.k!=='rock'||(i%2?'B':'A')!==side)return;
      const ts=h.at-1.0,te=h.at-.45,t=a.t;
      if(t>=ts-.3&&t<te){pos=lerp2(rest,hold,es(clamp01((t-(ts-.3))/.3)));held=h}
      else if(t>=te&&t<te+.15)pos=lerp2(hold,fwd,eo((t-te)/.15));
      else if(t>=te+.15&&t<te+.55)pos=lerp2(fwd,rest,es((t-te-.15)/.4));
    });
    if(held)fire=.7;
  }else if(a&&a.kind==='wings'){
    pos=[rest[0],rest[1]-30];
  }
  const dx=pos[0]-sh[0],dy=pos[1]-sh[1],dd=Math.hypot(dx,dy),mx=215;
  if(dd>mx)pos=[sh[0]+dx/dd*mx,sh[1]+dy/dd*mx];
  return{p:pos,fire,held,sh};
}
function drawPaw(P){
  const p=P.p;
  ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p[0],p[1],18,0,6.283);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#eadbc8';ctx.lineWidth=4;ctx.lineCap='round';
  [-10,0,10].forEach(dy=>{ctx.beginPath();ctx.moveTo(p[0]-14,p[1]+dy);ctx.lineTo(p[0]-34,p[1]+dy*1.5);ctx.stroke()});
  if(P.fire>0){
    const g=ctx.createRadialGradient(p[0],p[1],2,p[0],p[1],60*P.fire);
    g.addColorStop(0,'rgba(255,200,90,.7)');g.addColorStop(1,'rgba(255,100,30,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(p[0],p[1],60*P.fire,0,6.283);ctx.fill();
    for(let i=0;i<3;i++)qflame(p[0]-8+i*8,p[1]+8,8,(32+14*Math.sin(Q.time*10+i))*P.fire,i,i%2?'rgba(255,196,90,.9)':'rgba(255,110,40,.9)');
  }
  if(P.held)qrock(p[0]-6,p[1]-24,26,Q.time*3,true);
}
function drawBoss2(){
  const t=Q.time,b=Q.boss;
  ctx.save();ctx.translate(Q.bx,Q.by);
  const big=Q.enraged?(Q.bhp===1?1.35:1):.7;
  const ag=ctx.createRadialGradient(0,-20,10,0,-20,300*big);
  ag.addColorStop(0,'rgba(255,120,40,'+(.3*big)+')');ag.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=ag;ctx.beginPath();ctx.arc(0,-20,300*big,0,6.283);ctx.fill();
  const wa=wingAngle(),fire=Q.enraged;
  for(const sd of [-1,1]){
    drawWing([sd*50,-48],wa+.3,.85,'#2a0c14',Q.wo,fire,sd);
    drawWing([sd*60,-40],wa,1,'#4a1219',Q.wo,fire,sd);
  }
  ctx.save();ctx.translate(0,148);ctx.scale(.78,.78);
  demonBody({stow:1,t,warm:Q.enraged?(Q.bhp===1?1.6:1.3):1,jaw:b.s==='rage'||(Q.atk&&Q.atk.kind==='roar')?14:(Q.atk&&Q.atk.hits.some(h=>h.k==='fire'&&Q.atk.t>h.at-.5&&Q.atk.t<h.at+.15)?12:Q.atk?4:0),hurt:Q.recoil>.3});
  ctx.restore();
  const pA=pawPos('A'),pB=pawPos('B');
  drawArm(pA.sh,pA.p,62,-1);drawArm(pB.sh,pB.p,62,1);
  drawPaw(pA);drawPaw(pB);
  if(Q.enraged){
    const sz=Q.bhp===1?1.5:1;
    [[-88,-45],[88,-45],[-60,-40],[60,-40],[-30,-30],[30,-30],[-100,-18],[100,-18],[-50,60],[50,60],[0,-112],[-30,-105],[30,-105],[-70,20],[70,20]].forEach((q,i)=>{
      const h=(26+20*Math.abs(Math.sin(t*9+i*1.7)))*sz,w=(8+3*Math.abs(Math.sin(t*7+i)))*sz;
      qflame(q[0],q[1],w,h,i,i%2?'rgba(255,196,90,.88)':'rgba(255,100,40,.88)');
    });
  }
  ctx.restore();
}
function tailTip(){
  const x=Q.bx,y=Q.by,a=Q.atk;
  let tip=[x+175+Math.sin(Q.time*2)*16,y+135+Math.cos(Q.time*2.3)*14],fire=Q.enraged?.5:0,strike=0;
  if(a){
    const th=a.hits.filter(x=>x.k==='tail'),h=th.find(x=>a.t<x.at+.4)||th[th.length-1]||a.hits[a.hits.length-1];
    if(h.k==='tail'){
      const d=a.t-h.at,up=[x+130,y-170],hit=[QH[0]+30,QH[1]+10];
      if(d>-.55&&d<=-.14){tip=lerp2(tip,up,es(clamp01((d+.55)/.4)));fire=1}
      else if(d>-.14&&d<=0){tip=lerp2(up,hit,ei(clamp01((d+.14)/.14)));fire=1;strike=1}
      else if(d>0&&d<.4){tip=lerp2(hit,tip,es(d/.4));fire=1-d/.4*.5;strike=1-d/.4}
    }
  }
  return{tip,fire,strike};
}
function drawTail2(){
  const T2=tailTip(),r=[Q.bx+34,Q.by+52],tip=T2.tip;
  const c=[(r[0]+tip[0])/2+20*(1-T2.strike),Math.max(r[1],tip[1])+70*(1-T2.strike)];
  ctx.save();ctx.lineCap='round';
  ctx.strokeStyle='#1c1220';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(r[0],r[1]);ctx.quadraticCurveTo(c[0],c[1],tip[0],tip[1]);ctx.stroke();
  ctx.strokeStyle='rgba(255,106,42,'+(.35+.5*T2.fire)+')';ctx.lineWidth=6;ctx.stroke();
  if(T2.fire>0){
    const g=ctx.createRadialGradient(tip[0],tip[1],2,tip[0],tip[1],55*T2.fire);
    g.addColorStop(0,'rgba(255,220,120,.8)');g.addColorStop(1,'rgba(255,100,30,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(tip[0],tip[1],55*T2.fire,0,6.283);ctx.fill();
    for(let i=0;i<3;i++)qflame(tip[0]-10+i*10,tip[1]+6,9,(34+12*Math.sin(Q.time*10+i))*T2.fire,i,i%2?'rgba(255,196,90,.9)':'rgba(255,110,40,.9)');
  }
  ctx.restore();
}
function drawHits2(){
  drawTail2();
  const a=Q.atk;if(!a)return;
  if(a.kind==='roar'){ctx.fillStyle='rgba(120,95,100,.55)';for(let i=0;i<16;i++){const x=(i*61+Math.sin(Q.time*3+i)*20+30)%W,y=(Q.time*(260+i*14)+i*47)%(H*.7);ctx.fillRect(x,y,3+i%3,3+i%3)}}
  for(const h of a.hits){
    const d=a.t-h.at;
    if(h.k==='clawA'||h.k==='clawB'){
      if(d<-.03||d>.32)continue;
      const up=h.k==='clawA';
      const p0=up?[QH[0]-70,QH[1]-120]:[QH[0]-70,QH[1]+80],p1=up?[QH[0]+70,QH[1]+60]:[QH[0]+70,QH[1]-110];
      const pr=clamp01((d+.03)/.1),al=1-clamp01(d/.32),e=lerp2(p0,p1,pr);
      ctx.save();ctx.lineCap='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=16;
      for(let i=-1;i<=1;i++){
        ctx.strokeStyle='rgba(255,'+(i?170:240)+','+(i?70:190)+','+al+')';ctx.lineWidth=i?6:9;
        ctx.beginPath();ctx.moveTo(p0[0]+i*16,p0[1]);ctx.lineTo(e[0]+i*16,e[1]);ctx.stroke();
      }
      ctx.restore();
    }else if(h.k==='wave'){
      if(d<-.55||d>.9)continue;
      const u=(d+.55)/.55,x0=Q.bx-95,x1=QH[0]+10,x=x0+(x1-x0)*u,cy=QH[1]-40,hh=88;
      ctx.save();
      ctx.globalAlpha=Math.max(0,d>.5?1-(d-.5)/.4:1);
      const gr=ctx.createLinearGradient(x-45,0,x+35,0);gr.addColorStop(0,'#fff6c8');gr.addColorStop(.4,'#ffb347');gr.addColorStop(1,'rgba(255,90,30,0.1)');
      ctx.fillStyle=gr;ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
      ctx.beginPath();ctx.moveTo(x+30,cy-hh);ctx.quadraticCurveTo(x-45,cy-hh*.4,x-45,cy);ctx.quadraticCurveTo(x-45,cy+hh*.4,x+30,cy+hh);ctx.quadraticCurveTo(x-5,cy,x+30,cy-hh);ctx.fill();
      ctx.shadowBlur=0;
      for(let i=0;i<6;i++)qflame(x+42+((i*13)%22),cy-70+i*28,8,26+8*Math.sin(Q.time*10+i),i,'rgba(255,150,50,.8)');
      ctx.restore();
    }else if(h.k==='rock'){
      if(d<-.45||d>0)continue;
      const u=(d+.45)/.45,s0=[Q.bx-120,Q.by-90],e0=[QH[0]+30,QH[1]];
      for(let i=4;i>=1;i--){
        const uu=Math.max(0,u-i*.07),q=lerp2(s0,e0,uu);q[1]-=60*Math.sin(Math.PI*uu);
        ctx.fillStyle='rgba(255,140,50,'+(.28-i*.05)+')';ctx.beginPath();ctx.arc(q[0],q[1],24-i*3,0,6.283);ctx.fill();
      }
      const pos=lerp2(s0,e0,u);pos[1]-=60*Math.sin(Math.PI*u);
      qrock(pos[0],pos[1],26,Q.time*14,true);
      qflame(pos[0]+10,pos[1]-18,10,34,3,'rgba(255,170,70,.85)');
    }else if(h.k==='fall'){
      if(d<-.8||d>.4)continue;
      const x=QH[0]+26,gy=QH[1]-6;
      if(d>=-.42){
        const u=clamp01((d+.42)/.42),y=d<0?-50+(gy+50)*u*u:gy+d*1100;
        for(let i=3;i>=1;i--){ctx.fillStyle='rgba(255,140,50,'+(.22-i*.05)+')';ctx.beginPath();ctx.arc(x,y-i*26,26-i*4,0,6.283);ctx.fill()}
        qrock(x,y,28,Q.time*7+x,true);
      }
      if(d<-.12){ /* flèche : orange, puis rouge quand il faut esquiver */
        const red=d>=-.3,al=red?.95:.35+.35*Math.abs(Math.sin(Q.time*18));
        ctx.save();ctx.fillStyle=red?'rgba(255,45,40,'+al+')':'rgba(255,150,50,'+al+')';ctx.beginPath();ctx.moveTo(x-12,26);ctx.lineTo(x+12,26);ctx.lineTo(x,52);ctx.closePath();ctx.fill();ctx.restore();
      }
    }else if(h.k==='fire'){
      if(d<-.32||d>.04)continue;
      const u=clamp01((d+.32)/.32),s0=[Q.bx-62,Q.by-98],e0=[QH[0]+26,QH[1]-2],pos=lerp2(s0,e0,u);
      for(let i=5;i>=1;i--){const q=lerp2(s0,e0,Math.max(0,u-i*.06));ctx.fillStyle='rgba(255,150,50,'+(.34-i*.05)+')';ctx.beginPath();ctx.arc(q[0],q[1],15-i*2,0,6.283);ctx.fill()}
      ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=22;ctx.fillStyle='#fff2b8';ctx.beginPath();ctx.arc(pos[0],pos[1],12,0,6.283);ctx.fill();ctx.restore();
      qflame(pos[0]+6,pos[1]-8,9,28,2,'rgba(255,150,50,.9)');
    }
  }
}
function heroPose(){
  const p=Q.pl,c=Q.cn;
  let x=Q.hx,y=Q.hy,rot=0,sa=-.12,glow=0;
  const chestT=[Q.bx-120,Q.by-8];
  if(c){
    const t=c.t;
    if(c.k==='stab'){
      /* pas en avant, rayon droit sur le torse */
      const adv=t<.3?eo(t/.3):t<.7?1:1-es(clamp01((t-.7)/.45));x+=60*adv;y+=-6*adv;rot=-.04*adv;
    }else if(c.k==='head'){
      /* le Veilleur s'élève et frappe la tête d'un rayon plongeant */
      const up=t<.45?es(t/.45):t<.85?1:1-es(clamp01((t-.85)/.55));y-=120*up;x+=30*up;
      glow=t>=.3&&t<.85?.6:0;
    }else if(c.k==='beam'){
      glow=clamp01(t/.75);
      if(t>1.3)glow=Math.max(0,1-(t-1.3)/.3);
    }else if(c.k==='final'){
      if(t<1.1){glow=t/1.1;y-=14*Math.sin(t*6)}
      else{const u=es(clamp01((t-1.1)/.45));x+=50*u;y-=20*u;glow=t<1.55?1:Math.max(.5,1-(t-1.55)/3)}
    }
    const tgt=qBeamTarget(c);if(tgt)sa=Math.atan2(tgt[1]-(y+WH[1]),tgt[0]-(x+WH[0]));else sa=-.7;
  }else if(p.s==='dodge'){
    const u=p.t/DG.act,off=u<.27?es(u/.27):u<.73?1:1-es((u-.73)/.27);
    y+=DG.drop*off;x-=20*off;rot=-6.283*es(u);
  }else if(p.s==='hurt'){
    const u=Math.min(1,p.t/(p.hs||DG.hurt));x-=34*(1-u);rot=-.35*(1-u);
  }else if(p.s==='down'){
    x-=p.t*40;y+=p.t*140;rot=-p.t*5;
  }
  if(p.oy&&!c){x+=p.ox;y+=p.oy}
  if(Q.mode==='lake'&&Q.landed){sa=-1.15;glow=Q.erupt?.8:.35;rot=0}
  return{x,y,rot,sa,glow};
}
const WH=[34,-8];
function qBeamTarget(c){return c.k==='head'?[Q.bx,Q.by-92]:c.k==='beam'?[Q.bx-30,Q.by-4]:c.k==='final'?[Q.bx-20,Q.by-4]:[Q.bx-30,Q.by-4]}
/* intensité du rayon de contre (phase II) à l'instant t */
function qBeamAl(c){const t=c.t;if(c.k==='stab')return t>=.28&&t<.62?(t<.35?(t-.28)/.07:1-(t-.35)/.27):0;if(c.k==='head')return t>=.48&&t<.85?(t<.55?(t-.48)/.07:1-(t-.55)/.3):0;if(c.k==='final')return t>=1.45&&t<3.5?Math.min(1,(t-1.45)/.1)*(t<3.2?1:1-(t-3.2)/.3):0;return 0}
function qSwordTip(){const h=heroPose();return[h.x+WH[0]+Math.cos(h.sa)*80,h.y+WH[1]+Math.sin(h.sa)*80]}
function drawHero2(){
  const h=heroPose(),t=Q.time;
  ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.rot);
  if(h.glow>0){
    const r=70+60*h.glow;
    const g=ctx.createRadialGradient(0,-10,6,0,-10,r);
    g.addColorStop(0,'rgba(255,255,255,'+(.7*h.glow)+')');g.addColorStop(.5,'rgba(150,220,255,'+(.3*h.glow)+')');g.addColorStop(1,'rgba(111,211,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-10,r,0,6.283);ctx.fill();
  }
  ctx.save();ctx.translate(0,44);ctx.scale(.8,.8);drawWizard({fl:3*Math.sin(t*14)});ctx.restore();
  qlimb([18.5,-18.5],WH,9,'#2a3550');ctx.fillStyle='#2a3550';ctx.beginPath();ctx.arc(18.5,-18.5,5.2,0,6.283);ctx.fill();
  ctx.save();ctx.translate(WH[0],WH[1]);ctx.rotate(h.sa);
  const c2=Q.cn,hitk=c2?qBeamAl(c2):0;
  drawScepter(80,Math.max(.35,h.glow,hitk),h.glow>0||hitk>0?'#fff4d6':'#ffd27a');
  if(h.glow>0){
    const gr=36*h.glow,og=ctx.createRadialGradient(80,0,0,80,0,gr*2);
    og.addColorStop(0,'rgba(255,255,255,1)');og.addColorStop(.4,'rgba(190,234,255,.7)');og.addColorStop(1,'rgba(111,211,255,0)');
    ctx.fillStyle=og;ctx.beginPath();ctx.arc(80,0,gr*2,0,6.283);ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle='#cdb69a';ctx.beginPath();ctx.arc(WH[0],WH[1],5,0,6.283);ctx.fill();
  ctx.restore();
}
function drawFx2(){
  const S=R||Q;
  for(const s of S.sparks){
    ctx.globalAlpha=clamp01(s.life/s.max);ctx.fillStyle=s.col;ctx.fillRect(s.x-s.sz/2,s.y-s.sz/2,s.sz,s.sz);
  }
  ctx.globalAlpha=1;
  for(const r of S.rings){
    const u=1-r.life/r.max;
    ctx.strokeStyle='rgba(191,234,255,'+(1-u)+')';ctx.lineWidth=5*(1-u)+1;
    ctx.beginPath();ctx.arc(r.x,r.y,18+120*u,0,6.283);ctx.stroke();
  }
  for(const f of S.fbs){
    const u=f.t/.7,al=Math.max(0,1-u*u);
    ctx.save();ctx.translate(f.x,f.y);
    const gg=ctx.createRadialGradient(0,0,0,0,0,110*f.big);
    gg.addColorStop(0,'rgba(255,230,150,'+(.9*al)+')');gg.addColorStop(1,'rgba(255,100,30,0)');
    ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,110*f.big,0,6.283);ctx.fill();
    ctx.globalAlpha=al;
    for(let i=0;i<11;i++){
      const a=-3.14+(i/10)*3.14+Math.sin(i*5.3)*.12,len=(50+70*((i*7)%5)/4)*f.big*eo(clamp01(u*1.6));
      ctx.save();ctx.rotate(a+1.5708);
      qflame(0,-8,11*f.big,len,i,i%2?'rgba(255,214,110,.95)':'rgba(255,110,40,.95)');
      ctx.restore();
    }
    ctx.restore();
  }
  for(const e of S.exps){
    const u=e.t/.9,rr=(30+300*eo(u))*e.s,al=Math.max(0,1-u*1.1);
    const g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,rr);
    g.addColorStop(0,'rgba(255,255,255,'+al+')');g.addColorStop(.5,'rgba(190,234,255,'+(al*.6)+')');g.addColorStop(1,'rgba(111,211,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,rr,0,6.283);ctx.fill();
  }
  ctx.textAlign='center';
  for(const f of S.floats){
    const u=1-f.life/f.max;
    ctx.globalAlpha=clamp01(f.life/f.max*1.6);
    ctx.font='800 '+Math.round(f.sz*(1+.45*Math.max(0,1-u*7)))+'px '+DISPLAY;ctx.fillStyle=f.col;
    ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeStyle='rgba(0,0,0,.7)';ctx.strokeText(f.txt,f.x+f.sz*2,f.y-26*u);
    ctx.fillText(f.txt,f.x+f.sz*2,f.y-26*u);
  }
  ctx.globalAlpha=1;ctx.textAlign='start';
}
function drawCnFx(){
  const c=Q.cn;if(!c)return;
  {const al=qBeamAl(c);if(al>0){const tip=qSwordTip(),to=qBeamTarget(c),w=c.k==='final'?26*(1+.08*Math.sin(Q.time*50)):16;lanternBeam(tip,to,w,al)}}
  if(c.k==='beam'&&c.t>=.75&&c.t<1.35){
    const tip=qSwordTip(),to=[Q.bx-30,Q.by-4],u=(c.t-.75)/.6,wd=34*(1-u*.6)*(1+.1*Math.sin(Q.time*60));
    ctx.save();ctx.lineCap='round';
    ctx.shadowColor='#6fd3ff';ctx.shadowBlur=30;
    ctx.strokeStyle='rgba(111,211,255,.55)';ctx.lineWidth=wd*1.8;
    ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(to[0],to[1]);ctx.stroke();
    ctx.strokeStyle='#ffffff';ctx.lineWidth=wd*.6;
    ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(to[0],to[1]);ctx.stroke();
    ctx.restore();
  }
}
function drawHints2(){
  if(!prefs.help||Q.mode!=='play')return;
  const p=Q.pl,a=Q.atk;
  if(a&&p.s!=='counter'){
    const h=a.hits.find(x=>!x.done);
    if(h){
      const tt=h.at-a.t;
      if(!DIFF.easy){if(tt>0&&tt<=DG.act+HINT_LEAD)hintBar(QH[0],QH[1]-95,tt<=DG.act?tt/DG.act:1-(tt-DG.act)/HINT_LEAD,tt<=DG.act)}
      else if(tt<=DG.act&&tt>0){
        ctx.strokeStyle='rgba(111,211,255,.9)';ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(QH[0],QH[1]-10,70-20*(1-tt/DG.act),0,6.283);ctx.stroke();
      }
    }
  }
  if(p.s==='recover'){
    ctx.strokeStyle='rgba(166,154,147,.8)';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(QH[0],QH[1]-10,78,-1.57,-1.57+6.283*(p.t/DG.rec));ctx.stroke();
  }
}
function drawLake(front){
  if(Q.mode!=='lake')return;
  const sy=lakeY();
  if(sy>=H)return;
  ctx.save();
  if(front){
    ctx.beginPath();ctx.rect(0,sy,W,H-sy);ctx.clip();
    ctx.fillStyle='rgba(255,110,30,.45)';ctx.fillRect(0,sy,W,H-sy);
  }else{
    const g=ctx.createLinearGradient(0,sy,0,H);g.addColorStop(0,'#ffd27a');g.addColorStop(.25,'#ff7a2b');g.addColorStop(1,'#5a1408');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(0,H);
    for(let x=0;x<=W;x+=20)ctx.lineTo(x,sy+Math.sin(x*.03+Q.time*3)*5);
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    const rg=ctx.createLinearGradient(0,sy-120,0,sy);rg.addColorStop(0,'rgba(255,160,60,0)');rg.addColorStop(1,'rgba(255,160,60,.5)');
    ctx.fillStyle=rg;ctx.fillRect(0,sy-120,W,120);
    /* passerelle de fer, accrochée à la paroi gauche */
    const cy=sy-40,x0=70,x1=390;
    /* un pan de mur de pierre derrière le rebord de gauche */
    {const wg=ctx.createLinearGradient(0,cy-170,0,cy+20);wg.addColorStop(0,'#1c1412');wg.addColorStop(1,'#3a2820');
      ctx.fillStyle=wg;ctx.beginPath();ctx.moveTo(0,cy-170);ctx.lineTo(120,cy-170);ctx.lineTo(136,cy-120);ctx.lineTo(140,cy-40);ctx.lineTo(146,cy+20);ctx.lineTo(0,cy+20);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(10,6,5,.65)';ctx.lineWidth=1.5;
      for(let r=0;r<7;r++){const yy=cy-166+r*27;ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(140,yy);ctx.stroke();
        for(let c=(r%2)*22;c<140;c+=44){ctx.beginPath();ctx.moveTo(c,yy);ctx.lineTo(c,yy+27);ctx.stroke()}}
      const lg=ctx.createLinearGradient(0,cy-60,0,cy+10);lg.addColorStop(0,'rgba(255,120,40,0)');lg.addColorStop(1,'rgba(255,130,50,.28)');
      ctx.fillStyle=lg;ctx.fillRect(0,cy-60,140,70)}
    ctx.strokeStyle='#2c1c18';ctx.lineWidth=4;
    for(let x=x0;x<x1-20;x+=40){ctx.beginPath();ctx.moveTo(x,cy+12);ctx.lineTo(x+20,cy+30);ctx.lineTo(x+40,cy+12);ctx.stroke()}
    ctx.fillStyle='#1e1312';ctx.fillRect(x0,cy,x1-x0,12);ctx.fillRect(x0,cy+26,x1-x0-20,6);
    ctx.fillStyle='rgba(255,150,60,.55)';ctx.fillRect(x0,cy+10,x1-x0,2);
    ctx.fillStyle='#4a3430';for(let x=x0+10;x<x1;x+=26){ctx.beginPath();ctx.arc(x,cy+6,2.5,0,6.283);ctx.fill()}
    ctx.strokeStyle='#3b2a24';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1-12,cy);ctx.lineTo(x1-60,cy-260);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x0+150,cy);ctx.lineTo(x0+150,cy-40);ctx.lineTo(x1-8,cy-40);ctx.stroke();
    /* le rebord de terre et de roche, au pied du mur, qui descend jusqu'à la lave */
    {const tg=ctx.createLinearGradient(0,cy,0,cy+110);tg.addColorStop(0,'#4a352a');tg.addColorStop(1,'#1a100d');
      ctx.fillStyle=tg;ctx.beginPath();ctx.moveTo(0,cy-3);ctx.lineTo(48,cy-4);ctx.lineTo(96,cy-1);ctx.lineTo(134,cy+3);ctx.lineTo(152,cy+16);ctx.lineTo(142,cy+44);ctx.lineTo(126,cy+78);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(255,160,70,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,cy-3);ctx.lineTo(48,cy-4);ctx.lineTo(96,cy-1);ctx.lineTo(134,cy+3);ctx.stroke();
      ctx.fillStyle='rgba(20,10,8,.55)';for(const [qx,qy,qr] of [[22,cy+14,5],[60,cy+24,4],[96,cy+12,6],[40,cy+44,5],[88,cy+50,4],[118,cy+36,3]]){ctx.beginPath();ctx.arc(qx,qy,qr,0,6.283);ctx.fill()}}
    /* une chaîne d'homme rompue, boulonnée au mur, et l'anneau de fer tombé sur le rebord */
    {const bx=98,by=cy-112;
      ctx.lineCap='round';
      ctx.fillStyle='#4a3a34';ctx.fillRect(74,by-11,16,22);ctx.fillRect(74,by-3,28,6);ctx.fillStyle='#6e5c54';ctx.fillRect(74,by-11,16,2);
      ctx.fillStyle='#9a8a80';for(const yy of [by-6,by+6]){ctx.beginPath();ctx.arc(82,yy,2,0,6.283);ctx.fill()}
      ctx.strokeStyle='rgba(255,150,60,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(74,by+11);ctx.lineTo(90,by+11);ctx.stroke();
      /* une seconde équerre, vide : la chaîne qui y était a disparu */
      ctx.fillStyle='#4a3a34';ctx.fillRect(22,by-11,16,22);ctx.fillRect(22,by-3,26,6);ctx.fillStyle='#6e5c54';ctx.fillRect(22,by-11,16,2);
      ctx.fillStyle='#9a8a80';for(const yy of [by-6,by+6]){ctx.beginPath();ctx.arc(30,yy,2,0,6.283);ctx.fill()}
      ctx.strokeStyle='#9aa0ab';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(50,by+3,3.6,.4,5.9);ctx.stroke();
      ctx.strokeStyle='rgba(255,150,60,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(22,by+11);ctx.lineTo(38,by+11);ctx.stroke();
      const n=5;
      for(let i=0;i<n;i++){
        const ly=by+8+i*14,sw=Math.sin(Q.time*1.3+i*.4)*.7*(i/n),lx=bx+sw*3;
        const last=i===n-1;
        ctx.strokeStyle='#9aa0ab';ctx.lineWidth=2.8;
        ctx.beginPath();
        if(i%2===0)ctx.ellipse(lx,ly,3.8,7,0,last?.7:0,last?6.0:6.283);
        else ctx.ellipse(lx,ly,7,3.4,0,0,6.283);
        ctx.stroke();
        ctx.strokeStyle='rgba(255,160,60,.4)';ctx.lineWidth=1;ctx.beginPath();
        if(i%2===0)ctx.ellipse(lx,ly+.5,3.8,7,0,.3,2.8);else ctx.ellipse(lx,ly+.5,7,3.4,0,.3,2.8);
        ctx.stroke()}
      const rx=112,ry=cy-12;
      ctx.strokeStyle='#a2a7b2';ctx.lineWidth=4;ctx.beginPath();ctx.arc(rx,ry,9,0,6.283);ctx.stroke();
      ctx.strokeStyle='rgba(255,170,70,.6)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(rx,ry+.5,9,.3,2.9);ctx.stroke();
      ctx.strokeStyle='rgba(255,236,190,'+(.35+.25*Math.sin(Q.time*2.2))+')';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(rx,ry,9,3.6,4.5);ctx.stroke();
      ctx.lineCap='butt'}
  }
  ctx.restore();
}
function renderQ(){
  qLayout();
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(Q.shake>0&&!reduce)ctx.translate(rand(-1,1)*Q.shake,rand(-1,1)*Q.shake);
  qBackground();
  drawLake(false);
  drawBoss2();
  drawHits2();
  drawHero2();
  drawCnFx();
  drawLake(true);
  drawHints2();
  drawFx2();
  ctx.restore();
  ctx.drawImage(vig,0,0,W,H);
  if(Q.flash>0){ctx.fillStyle='rgba(255,255,255,'+Q.flash+')';ctx.fillRect(0,0,W,H)}
  if(Q.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(Q.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  let fade=0;
  if(Q.mode==='intro')fade=1-clamp01(Q.t/.7);
  if(Q.mode==='lake'&&Q.splash)fade=clamp01((Q.lt-Q.splash-1.9)/.9);
  if(fade>0){ctx.fillStyle='rgba(0,0,0,'+fade+')';ctx.fillRect(0,0,W,H)}
}

/* ================= PHASE III : le Clocher ================= */
let R=null;
const GUARD=[PX+116,DECK-76];
const R_T={guard:.333,rec:.7,grace:.06,down:.55,stun:.55};
const RATK={
  greatsword:{hits:[{k:'gs',at:.75},{k:'gs',at:1.4},{k:'gs',at:2.05}],cn:'plant',get name(){return _('War hammer','Marteau de guerre')}},
  avalanche:{hits:[{k:'ice',at:.9},{k:'ice',at:1.2},{k:'ice',at:1.5},{k:'ice',at:1.8},{k:'ice',at:2.1}],cn:'bat',get name(){return _('Ember hail','Grêle de braise')}},
  charge:{hits:[{k:'ram',at:1.0},{k:'stomp',at:1.75},{k:'geyser',at:2.5}],cn:'bell',get name(){return _('Charge, stomp and geyser','Charge, piétinement et geyser')}},
  whip:{hits:[{k:'whip',at:.75}],cn:'plant',get name(){return _('The hook','Le crochet')}},
  sword2:{hits:[{k:'gs',at:.75},{k:'gs',at:1.4}],cn:'plant',get name(){return _("Hammer combo","Combo de marteau")}},
  breath:{get hits(){return[{k:'breath',at:DIFF.easy?1.0:.9}]},get hq(){return !DIFF.easy},cn:'bat',get name(){return _('Flame breath','Souffle de flamme')}},
  claws:{hits:[{k:'claw',at:.8},{k:'claw',at:1.3}],cn:'bell',get name(){return _('Claws','Griffes')}},
  rocks:{hits:[{k:'rock',at:1.0},{k:'rock',at:1.7}],cn:'bat',get name(){return _('Falling stones','Chute de pierres')}},
  waves:{hits:[{k:'wave',at:1.0},{k:'wave',at:1.5},{k:'wave',at:2.0}],cn:'bat',get name(){return _("Wing waves","Ondes d'ailes")}},
  roar:{hits:[{k:'fall',at:1.0}],cn:'bell',get name(){return _('Roar: the tower shakes','Cri : le Clocher tremble')}}
};
/* Difficile : variantes des 3 attaques de base (première vie, puis aussi en seconde vie). */
const XB=PX-170,RAM2=3.25; /* XB : où le Colosse s'arrête derrière le Veilleur */
const RATKH={
  greatsword:{h:true,hits:[{k:'stab',at:.85},{k:'gs',at:1.95},{k:'gs',at:2.45},{k:'gs',at:2.95},{k:'blast',at:3.9}],cn:'plant',get name(){return _('Ram, combo and blast','Coup de bélier, combo et explosion')}},
  avalanche:{h:true,hits:[{k:'bomb',at:3.3},{k:'bomb',at:4.0},{k:'bomb',at:4.35},{k:'bomb',at:5.05},{k:'bomb',at:5.4}],cn:'bat',get name(){return _('Ember bombs','Bombes de braise')}},
  charge:{h:true,hits:[{k:'ram',at:1.0},{k:'stomp',at:2.05},{k:'ram',at:RAM2},{k:'geyser',at:4.6}],cn:'bell',get name(){return _('Charge, stomp, recharge and geyser','Charge, piétinement, recharge et geyser')}}
};
const BASE=['greatsword','avalanche','charge'],ALLK=BASE.concat(['whip','sword2','breath','claws','rocks','waves']),ALLKH=BASE.concat(['whip','sword2','breath','claws','rocks','waves','roar']);
function allPool(){return DIFF.hard?ALLKH:ALLK}
const ULT={
  rale:{get name(){return _("Death rattle","Râle d'agonie")},off:1.9,pre:[{k:'blast',at:1.1,pre:true}]},
  fureur:{get name(){return _('Fury','Fureur')},off:4.6,pre:[{k:'blast',at:1.1,pre:true},{k:'blast',at:2.0},{k:'blast',at:2.9},{k:'blast',at:3.8}]},
  embrasement:{get name(){return _('Blaze','Embrasement')},off:3.2,pre:[{k:'blast',at:1.1,pre:true},{k:'wave',at:1.9},{k:'wave',at:2.5}]}
};
/* Difficile, seconde vie : une rage unique par palier (10, 5 et 1 PV) */
Object.assign(ULT,{
  brasier:{get name(){return _('Ember fury','Fureur de braise')},off:4.4,pre:[{k:'blast',at:1.1,pre:true},{k:'blast',at:2.2},{k:'blast',at:2.9},{k:'blast',at:3.4}]},
  danse:{get name(){return _('Chain dance','Danse des chaînes')},off:1.9,pre:[{k:'blast',at:1.1,pre:true}]},
  dernier:{get name(){return _('Final blaze','Embrasement final')},off:1.9,pre:[{k:'blast',at:1.1,pre:true}]}
});
const FIN={raise:.5,bell1:1.35,fling:1.55,leap:[1.7,2.1],cut:[2.3,3.0],charge:3.5,strike:4.4,exp:4.6,gap:.42,collapse:6.9,bell:8.4,hero:9.9,fade:12.2,space:13.3};
const SPSTARS=Array.from({length:230},()=>({x:rand(0,W),y:rand(0,H),r:rand(.4,2),p:rand(0,6.28)}));
const STARS=Array.from({length:80},()=>({x:rand(0,W),y:rand(0,250),r:rand(.5,1.6),p:rand(0,6.28)}));
const FLAKES=Array.from({length:160},()=>({x:rand(0,W),y:rand(0,H),v:rand(60,170),s:rand(1,3),ph:rand(0,6.28)}));
function rNew(){
  return{mode:'intro',t:0,time:0,php:startHP(),bhp:DIFF.rbhp,parries:0,taken:0,
    pl:{s:'ready',t:0,deny:0,downT:.55},boss:{s:'idle',t:0,wait:.9},atk:null,cn:null,last:'',n:0,
    sparks:[],floats:[],rings:[],exps:[],fbs:[],melts:[],steam:[],
    shake:0,flash:0,hurt:0,hitstop:0,recoil:0,endIn:0,bx:BX,
    rage:0,u5:false,u55:false,u1:false,healed:false,cycle:1,stacked:0,cut:0,fall:[],fin:null,st:0,ibn:-1,introHx:-20,iclash:false,roared:false};
}
function beginP3(noLore){
  if(RUN.on&&Q&&Q.mode==='lake'){RUN.cur=Math.min(RUN.max,Q.php+1);RUN.st[2]={p:Q.parries,h:Q.taken}}
  Q=null;R=rNew();el.ov.classList.remove('clear');setPhaseUI(3);lastP=-1;lastB=-1;
  el.ov.hidden=true;if(!noLore)showLore(3);
  say(_('Phase III. The Bell Tower. The button raises your guard to parry.','Phase III. Le Clocher. Le bouton lève ta garde pour parer.'));
  hud();
}
function rPress(){
  if(R.mode!=='play')return;
  ensureAudio();
  const p=R.pl;
  if(p.s==='ready'){p.s='guard';p.t=0;tone(520,.14,'triangle',.05,320)}
  else if(p.s==='guard'||p.s==='recover')p.deny=.25;
}
function rPickFrom(pool){
  let k=pool[Math.floor(Math.random()*pool.length)];
  if(k===R.last&&R.n>=2){const o=pool.filter(x=>x!==k);k=o[Math.floor(Math.random()*o.length)]}
  R.n=(k===R.last)?R.n+1:1;R.last=k;
  return k;
}
/* Difficile, seconde vie : attaques reprises des phases I et II Difficile (mêmes rythmes). */
Object.assign(RATKH,{
  whip:{cn:'plant',gen(opts){
    const four=opts&&opts.n===4,hits=four?[{k:'whip',at:.92},{k:'whip',at:1.52},{k:'whip',at:2.32},{k:'whip',at:2.92}]:[{k:'whip',at:.92},{k:'whip',at:1.52}];
    dblTell(); /* alerte sonore comme en P1 (+ « !! » à l'écran) */
    return{hits,dbl:true,tn:hits.length,name:four?_('Four hooks','Quatre crochets'):_('Double hook','Double crochet')};
  }},
  sword2:{cn:'plant',gen(){
    const hits=[{k:'gs',at:1.01},{k:'gs',at:1.64},{k:'gs',at:2.51}];
    return{hits,hard3:true,name:_('Hammer combo','Combo de marteau')};
  }},
  breath:{cn:'bat',gen(){return{hits:[{k:'breath',at:.75}],hq:true}},get name(){return _('Flame breath','Souffle de flamme')}},
  claws:{hits:[{k:'claw',at:.8},{k:'claw',at:1.15},{k:'claw',at:1.95},{k:'claw',at:2.3}],cn:'bell',get name(){return _('Claw flurry','Rafale de griffes')}},
  waves:{hits:[{k:'wave',at:.95},{k:'wave',at:1.5},{k:'wave',at:1.85},{k:'wave',at:2.6},{k:'wave',at:2.95}],cn:'bat',get name(){return _('Wing barrage','Barrage d\'ailes')}},
  rocks:{hits:[{k:'rock',at:.95},{k:'rock',at:1.6},{k:'fire',at:2.2}],cn:'bat',get name(){return _('Stones and fireball','Pierres et boule de feu')}},
  roar:{cn:'bell',gen(opts){
    const hits=[];
    if(opts&&opts.fixed){[1.0,1.7,2.4].forEach(t=>hits.push({k:'fall',at:t}))}
    else{let tt=.95+rand(0,.15);for(let i=0;i<5;i++){hits.push({k:'fall',at:tt});tt+=rand(.55,.9)}}
    return{hits,roar:true,name:_('Roar: the tower shakes','Cri : le Clocher tremble')};
  }}
});
/* temps de pose recalé : le coup actif tombe à « canon », la préparation est comprimée si le coup arrive plus tôt */
function aq(a,kind,canon){
  const off=a.off||0,pt=a.pt,hs=a.hits.filter(h=>h.k===kind);
  let prev=(kind==='breath'&&a.cf!=null)?a.cf:0,hit=null;
  for(let i=0;i<hs.length;i++){
    const base=hs[i].at-off;
    if(pt<base+.25||i===hs.length-1){hit=base;break}
    prev=base;
  }
  if(hit==null)return pt;
  const lead=Math.max(.3,hit-prev);
  return pt>=hit?canon+(pt-hit):canon-(hit-pt)*canon/lead;
}
function swq(a){ /* marteau en 3 coups (P1 Difficile) : coups recalés sur l'animation de base */
  const off=a.off||0,pt=a.pt,B=a.hits.filter(h=>h.k==='gs').map(h=>h.at-off),C=[.75,1.4,2.05];
  let pb=0,pc=0;
  for(let i=0;i<B.length;i++){if(pt<B[i])return pc+(pt-pb)*(C[i]-pc)/(B[i]-pb);pb=B[i];pc=C[i]}
  return pc+(pt-pb);
}
function rPick(){
  if(R.last===''){R.last='greatsword';R.n=1;return 'greatsword'}
  return rPickFrom(R.healed?allPool():BASE);
}
function rUlt(lv){
  if(DIFF.hard&&R.healed){ /* rages uniques de la seconde vie */
    R.rage=lv===5?2:3;
    if(lv===5){ /* rage ratée : on refait exactement la même (même attaque) */
      if(!R.rk5)R.rk5=rPickFrom(allPool());
      return rLaunch(R.rk5,{ult:'brasier',lv:5});
    }
    if(lv===55)return rLaunch('whip',{ult:'danse',lv:55,n:4});
    return rLaunch('waves',{ult:'dernier',lv:1,chain:['roar','charge'],fixed:true});
  }
  const u=(R.healed?['rale','fureur','embrasement']:['rale'])[R.healed?Math.floor(Math.random()*3):0];
  if(lv===55)R.rage=Math.min(R.healed?3:2,Math.max(1,R.rage)+1); /* rage à 5 PV (Difficile) : un coup de queue de plus */
  else if(lv===5&&u==='rale'&&R.stacked!==R.cycle){R.stacked=R.cycle;R.rage=Math.min(2,R.rage+1)}
  else if(!R.rage)R.rage=1;
  rLaunch(rPickFrom(R.healed?allPool():BASE),{ult:u,lv});
}
function rNext(){
  if(R.bhp<=1&&!R.u1)return rUlt(1);
  if(R.bhp<=DIFF.ru&&!R.u5)return rUlt(5);
  if(DIFF.u2&&R.u5&&!R.u55&&R.bhp<=DIFF.u2)return rUlt(55);
  rLaunch(rPick());
}
function rLaunch(kind,opts){
  let d=(DIFF.hard&&RATKH[kind])||RATK[kind];if(d.gen)d=Object.assign({},d,d.gen(opts));
  const b=R.boss,u=opts&&opts.ult?ULT[opts.ult]:null,off=u?u.off:0,hits=[];
  if(u)u.pre.forEach(h=>hits.push({k:h.k,at:h.at,pre:!!h.pre,ok:null,done:false}));
  /* Facile : grêle de braise réduite à 3 blocs, la charge ne finit pas par un geyser */
  const src=DIFF.easy?(kind==='avalanche'?d.hits.slice(0,3):kind==='charge'?d.hits.slice(0,2):d.hits):d.hits;
  src.forEach(h=>hits.push({k:h.k,at:h.at+off,ok:null,done:false}));
  const more=!!(opts&&opts.chain&&opts.chain.length);
  if(R.rage>0&&!more){let t=hits[hits.length-1].at;for(let i=0;i<R.rage;i++){t+=.65;hits.push({k:'blast',at:t,flap:true,ok:null,done:false})}}
  R.atk={kind,h:!!d.h,t:0,pt:-off,off,hits,end:hits[hits.length-1].at+.5,miss:(opts&&opts.carry?opts.carry.miss:0),chain:more?opts.chain:null,fixed:!!(opts&&opts.fixed),ult:u?opts.ult:(opts&&opts.carry?opts.carry.ult:null),lv:u?opts.lv:(opts&&opts.carry?opts.carry.lv:0),tn:d.tn||0,cf:d.cf!=null?d.cf:null,hq:!!d.hq,dbl:!!d.dbl,hard3:!!d.hard3,roar:!!d.roar};
  b.s='atk';b.t=0;
  tone(110,.6,'sawtooth',.04,80);
  say((u?u.name+'. ':'')+d.name+'.');
}
function rMelt(x){
  R.melts.push({x,t:0});

}
const HTXT={fire:_('BURNED!','BRÛLÉ !'),fall:_('CRUSHED!','ÉCRASÉ !'),stab:_('RAMMED!','PERCUTÉ !'),bomb:_('EXPLOSION!','EXPLOSION !'),ram:_('CRUSHED!','ÉCRASÉ !'),stomp:_('CRUSHED!','ÉCRASÉ !'),rock:_('CRUSHED!','ÉCRASÉ !'),geyser:_('BURNED!','BRÛLÉ !'),breath:_('BURNED!','BRÛLÉ !'),wave:_('BURNED!','BRÛLÉ !'),blast:_('EXPLOSION!','EXPLOSION !'),whip:_('HOOKED!','ACCROCHÉ !'),claw:_('CLAWED!','GRIFFÉ !')};
function rResolve(h){
  const p=R.pl,a=R.atk;
  const win=h.k==='breath'?BRW:R_T.guard;
  const ok=(p.s==='guard'&&p.t<=win+.002)||(p.s==='recover'&&p.t<R_T.grace);
  h.ok=ok;
  const gx=heroFlip()?PX-116:GUARD[0];
  const bi=h.k==='bomb'?a.hits.filter(x=>x.k==='bomb').indexOf(h):0;
  const px=h.k==='ice'?PX+110:h.k==='geyser'?PX+20:h.k==='bomb'?bombPos(bi)[0]:gx;
  if(h.k==='gs'||h.k==='stab'){anvil();forgeSparks(R,ok?gx:PX+20,ok?GUARD[1]:DECK-70,ok?16:10)}
  if(h.k==='bomb'){const P=bombPos(bi);qBurst(P[0],P[1]-10,22,['#ffffff','#ffc15a','#ff7a2b']);R.shake=reduce?0:Math.max(R.shake,8);boom(.4,.1)}
  if(ok){
    R.parries++;R.hitstop=(h.k==='gs'||h.k==='stab')?.04:.08;R.flash=.3;R.shake=Math.max(R.shake,reduce?0:5);thud(.4);
    qRing(gx,GUARD[1]);qBurst(gx,GUARD[1],26,['#bfeaff','#6fd3ff','#ffffff','#ffc15a']);
    qFloat(_('PARRY!','PARADE !'),gx-30,GUARD[1]-110,'#bfeaff');
    tone(880,.28,'square',.05,-260);tone(1400,.2,'sine',.04);
    p.s='ready';p.t=0;
    rMelt(px);
    for(let i=0;i<8;i++)R.steam.push({x:px+rand(-24,24),y:DECK-4,vx:rand(-20,20),vy:-rand(40,110),life:rand(.6,1.1),max:1.1,s:rand(8,20)});
  }else{
    a.miss++;
    R.php=Math.max(0,R.php-1);R.taken++;R.shake=reduce?0:15;R.hurt=.35;R.hitstop=.07;thud(1.1);
    qBurst(PX+20,DECK-70,26,['#ff8a4a','#ffc15a','#ff5252']);
    qFloat(HTXT[h.k]||_('HIT!','TOUCHÉ !'),PX-30,DECK-190,'#ff8a6b');
    tone(90,.3,'sawtooth',.1,-40);
    rMelt(px);
    /* enchaînement : l'étourdissement s'arrête assez tôt pour pouvoir parer le coup suivant */
    const nx=a.hits.find(x=>!x.done&&x!==h),gap=nx?nx.at-a.t:99,base=h.k==='whip'?1.1:R_T.down;
    p.s='down';p.t=0;p.downT=Math.min(base,Math.max(.22,gap-.2));p.lasso=h.k==='whip';
    if(R.php<=0){R.mode='lost';R.endIn=1.3;say(_('Struck down atop the tower. Defeat.','Terrassé au sommet du Clocher. Défaite.'))}
    else say(_('Hit.','Touché.'));
  }
}
function rAtkEnd(){
  const a=R.atk,b=R.boss;R.atk=null;
  if(a.chain&&a.chain.length&&R.mode==='play'){rLaunch(a.chain[0],{chain:a.chain.slice(1),fixed:a.fixed,carry:{miss:a.miss,ult:a.ult,lv:a.lv}});return}
  if(a.miss===0){
    R.cn={k:a.ult?'bolt':RATK[a.kind].cn,t:0,hit:false,lv:a.lv||0};b.s='cn';b.t=0;R.pl.s='counter';R.pl.t=0;
    tone(300,.4,'triangle',.05,300);say(a.ult?_('Combo parried. The Watcher rings the great bell!','Combo paré. Le Veilleur fait sonner la grande cloche !'):_('Perfect parry. Riposte!','Parade parfaite. Riposte !'));
  }else{b.s='fail';b.t=0}
}
function startFinale(){
  R.mode='finale';R.fin={t:0};R.cn=null;R.atk=null;R.boss.s='final';R.pl.s='ready';R.pl.t=0;R.cut=0;R.fall=[];R.fmace=null;R.fbeam=[];
  say(_('The bell calls down the lightning. The Colossus raises his weapon to crush the Watcher.','La cloche appelle la foudre. Le Colosse lève son arme pour écraser le Veilleur.'));
}
/* Facile : au lieu de se soigner, le Colosse touché par la foudre s'enfuit en volant (fausse fin). */
const FLEE={roar:.55,wing:.6,lift:1.3,gone:3.7,fade:4.0,end:5.0};
const fleeU=t=>clamp01((t-FLEE.lift)/(FLEE.gone-FLEE.lift));
function startFlee(){
  R.mode='flee';R.fl={t:0};R.cn=null;R.atk=null;R.boss.s='flee';R.pl.s='ready';R.pl.t=0;
  say(_("The bell calls down the lightning. The Colossus spreads his wings and flees.","La cloche appelle la foudre. Le Colosse déploie ses ailes et s'enfuit."));
}
function rFlee(dt){
  const f=R.fl;f.t+=dt;const t=f.t;
  if(t>=FLEE.roar&&!f.r){f.r=1;roar();R.shake=reduce?0:14;R.flash=.4}
  if(t>=FLEE.gone-.4&&!f.bl){f.bl=1;ringBell(.35)}
  [1.0,1.4,1.8,2.2,2.7,3.2].forEach((at,i)=>{if(t>=at&&!f['w'+i]){f['w'+i]=1;noise(.4,.24,700,140);boom(.3,.08)}});
  if(t>=FLEE.lift&&t<FLEE.gone&&Math.random()<.6){
    const u=fleeU(t);R.sparks.push({x:BX+190*u+rand(-70,70),y:DECK-620*u*u-rand(40,200),vx:rand(-40,40),vy:rand(20,90),g:60,life:.8,max:.8,col:'#ffb060',sz:rand(2,4)});
  }
  if(t>=1.3&&!f.hj){f.hj=1;say(_('The Watcher raises his lantern: the Colossus is driven back.','Le Veilleur lève sa lanterne : le Colosse est repoussé.'));tone(660,.6,'sine',.06,300);tone(990,.5,'sine',.04,200)}
  if(t>=FLEE.end){R.mode='fake';rEnd()}
}
function fleeBoss(o){
  const t=R.fl.t,k=es(clamp01((t-FLEE.wing)/.7)),u=fleeU(t),x=o.x;
  o.warm=t<FLEE.lift?2:1.6;o.jaw=(t>FLEE.roar&&t<2.0)?16:6;
  o.wa=.6*k;o.ws=1+.9*k;o.lean=-.06*k-.18*u;
  o.dy=-30*es(clamp01((t-.9)/.6))-620*u*u+(t>FLEE.lift?Math.sin(t*14)*4:0);
  o.x=x+190*u;
  o.hands=[lerp2([x-128,DECK-66],[x-120,DECK-330],k),lerp2([x+128,DECK-66],[x+120,DECK-330],k)].map(p=>[p[0]+190*u,p[1]]);
}
function heroFlee(){
  const t=R.fl.t,up=t>=FLEE.lift;
  const y=up&&t<FLEE.fade?-Math.abs(Math.sin((t-FLEE.lift)*5.5))*14:0;
  return{x:PX,y,hand:up?[26,-100]:[30,-72],sa:up?-1.45:.15,rot:0,sy:1,glow:up?1:.4};
}
function rDamage(k,c){
  if(k==='bolt'){
    const tg=[R.bx-20,DECK-230];
    R.recoil=1;R.shake=reduce?0:16;R.hitstop=.12;R.flash=.5;thud(1.6);
    qBurst(tg[0],tg[1],40,['#ffffff','#bfeaff','#6fd3ff','#ffc15a']);
    qFlameBurst(tg[0],tg[1],1.5,true);R.shake=reduce?0:20;
    tone(90,.6,'sawtooth',.14,-40);tone(1200,.3,'sine',.07,-600);
    if(R.healed&&R.hornAt==null){R.hornAt=R.time;R.hornX=R.bx;noise(.3,.22,5000,900);tone(900,.25,'square',.06,-600);qBurst(R.bx+105,DECK-340,16,['#ffc15a','#ff7a2b','#ffffff'])}
    if(R.bhp<=1){
      if(!R.healed&&DIFF.easy){startFlee();return}
      if(!R.healed){
        R.healed=true;R.wdAt=R.time;R.cycle=2;R.u5=false;
        qBurst(R.bx-110,DECK-300,24,['#ffc15a','#ff7a2b','#ffffff']);qBurst(R.bx+110,DECK-300,24,['#ffc15a','#ff7a2b','#ffffff']);noise(.6,.16,3200,500);R.u55=false;R.u1=false;R.rk5=null;R.cn=null;R.pl.s='ready';R.pl.t=0;
        R.boss.s='heal';R.boss.t=0;say(_("Final death cry: the Colossus recovers all his health.","Ultime cri d'agonie : le Colosse récupère toute sa vie."));
      }else{R.u1=true;R.bhp=0;startFinale()}
      return;
    }
    R.bhp=Math.max(1,R.bhp-1);
    if(c&&c.lv===5)R.u5=true;
    if(c&&c.lv===55)R.u55=true;
    say(_('The bell calls down the lightning on the Colossus.','La cloche appelle la foudre sur le Colosse.'));
    return;
  }
  R.bhp=Math.max(0,R.bhp-1);R.recoil=1;R.shake=reduce?0:13;R.hitstop=.11;R.flash=.4;thud(1.2);
  if(k==='bell')R.dizzy=R.time+1.3;
  const tg=k==='slide'?[R.bx-62,DECK-58]:k==='plant'?[R.bx-60,DECK-26]:[R.bx-30,DECK-170];
  qBurst(tg[0],tg[1],32,['#ffffff','#bfeaff','#ffc15a']);qRing(tg[0],tg[1]);
  /* Pas de mot : l'effet se voit et s'entend, propre à chaque contre (cloche, éclats, rayon au sol). */
  R.flash=.6;qRing(tg[0],tg[1]);
  if(k==='bell'){ringBell(.55);tone(70,.9,'sine',.12,-20)}
  else if(k==='bat'){tone(1700,.3,'triangle',.07,-1000);tone(2400,.2,'sine',.05,-1200);noise(.18,.12,6000,1500)}
  else{tone(220,.5,'sawtooth',.09,700);noise(.25,.14,900,4000)}
  tone(170,.25,'square',.08,-110);tone(900,.2,'sine',.05);
  qFlameBurst(tg[0],tg[1],1.2);
  if(R.bhp<=0){
    R.boss.s='dead';R.boss.t=0;R.mode='won';R.endIn=3.2;R.cn=null;
    say(_('The Colossus collapses. Victory.','Le Colosse s\'effondre. Victoire.'));
  }else say(_('Riposte landed.','Riposte réussie.'));
}
function rCnStep(dt){
  const c=R.cn,b=R.boss,p=R.pl;c.t+=dt;
  const sp={plant:{hit:.85,end:1.5},bat:{hit:.67,end:1.35},bell:{hit:.85,end:1.45},slide:{hit:.35,end:1.2},bolt:{hit:1.0,end:1.9}}[c.k];
  if(c.k==='bell'){
    if(!c.d1&&c.t>=.1){c.d1=true;tone(1568,.5,'triangle',.06,0);tone(2093,.35,'sine',.035,0);tone(2637,.25,'sine',.02,0)}
    if(!c.d2&&c.t>=.5){c.d2=true;ringBell(.55);R.flash=.2}
  }
  if(c.k==='plant'&&!c.pl&&c.t>=.3){c.pl=true;qRing(PX+105,DECK-14);qBurst(PX+105,DECK-14,22,['#ffffff','#bfeaff','#6fd3ff']);tone(160,.4,'sine',.1,-60);R.flash=.2}
  if(c.k==='bolt'&&!c.rz&&c.t>=.25){c.rz=true;tone(220,.8,'sawtooth',.05,900);R.flash=.2;qRing(PX+72,DECK-154)}
  if(c.k==='bolt'&&!c.rb&&c.t>=.55){c.rb=true;ringBell(.32)}
  if(c.k==='bolt'&&!c.rm&&c.t>=.6){c.rm=true;tone(55,.9,'sawtooth',.08,-15)}  if(c.k==='slide'&&c.t<.4&&Math.random()<.7){
    const x=heroX3();R.sparks.push({x:x-10,y:DECK-3,vx:rand(-120,-20),vy:-rand(20,100),g:260,life:.5,max:.5,col:'#ffffff',sz:rand(2,4)});
  }
  if(!c.hit&&c.t>=sp.hit){c.hit=true;rDamage(c.k,c);if(R.mode!=='play'||R.cn!==c)return}
  if(c.t>=sp.end){R.cn=null;p.s='ready';p.t=0;b.s='hurt';b.t=0}
}
function rBoss(dt){
  const b=R.boss;b.t+=dt;
  switch(b.s){
    case 'idle':if(b.t>=b.wait)rNext();break;
    case 'atk':{
      const a=R.atk;a.t+=dt;a.pt=a.t-a.off;
      for(const h of a.hits){if(!h.done&&a.t>=h.at){h.done=true;rResolve(h);if(R.mode!=='play')return}}
      if(a.t>=a.end)rAtkEnd();
      break;}
    case 'cn':rCnStep(dt);break;
    case 'heal':{
      const t=b.t;
      if(t>=.5&&!b.ro){b.ro=true;roar();R.shake=reduce?0:12;R.flash=.5}
      if(t>=.5&&t<2.9&&Math.random()<.35)R.fbs.push({x:R.bx+rand(-90,60),y:DECK-rand(60,320),t:0,big:rand(.9,1.5)});
      if(t>=.9){
        const n=Math.min(DIFF.rbhp-1,Math.floor((t-.9)/.2)+1);
        while(R.bhp<1+n){R.bhp++;tone(260+R.bhp*55,.18,'triangle',.05,120)}
      }
      if(t>=3.4){b.s='idle';b.t=0;b.wait=1.1;say(_('The Colossus is back, fiercer than ever.','Le Colosse est de retour, plus féroce encore.'))}
      break;}
    case 'fail':if(b.t>=.9){b.s='idle';b.t=0;b.wait=rand(.8,1.4)}break;
    case 'hurt':if(b.t>=R_T.stun){b.s='idle';b.t=0;b.wait=rand(.8,1.4)}break;
  }
}
function fmtT(t){const m=Math.floor(t/60),r=t-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1)}
function runTable(){
  const tot=RUN.t,key='eb-best-'+RUN.name;let best=0,rec=false;
  try{best=parseFloat(localStorage.getItem(key))||0}catch(e){}
  if(!best||tot<best){rec=true;best=tot;try{localStorage.setItem(key,String(tot))}catch(e){}}
  const a=RUN.st[1]||{p:0,h:0},b=RUN.st[2]||{p:0,h:0};
  const C=[[_('Total time','Temps total'),fmtT(tot)],[_('Hits taken','Coups subis'),a.h+b.h+R.taken],[_('Attempts','Essais'),RUN.n],
    [_('Phase I','Phase I'),fmtT(RUN.pt[0])],[_('Phase II','Phase II'),fmtT(RUN.pt[1])],[_('Phase III','Phase III'),fmtT(RUN.pt[2])],
    [_('Parries','Parades'),a.p+R.parries],[_('Dodges','Esquives'),b.p],[rec?_('New record!','Nouveau record !'):_('Best time','Meilleur temps'),fmtT(best),rec]];
  return C.map(c=>'<div'+(c[2]?' class="rec"':'')+'><small>'+c[0]+'</small><b>'+c[1]+'</b></div>').join('');
}
function rEnd(){
  $('ovTable').hidden=true;
  if(R.mode==='fake'){
    el.ov.classList.remove('clear');
    el.eye.textContent=_('The End?','Fin ?');el.title.textContent=_('He has fled.','Il s\'est enfui.');el.stats.hidden=true;
    el.desc.textContent=_(`The great bell rings alone in the night. Far out at sea, nothing answers. Somewhere, the Colossus's fire still burns. Replay the whole fight in Normal to discover the true ending.`,`La grande cloche sonne seule dans la nuit. Au large, rien ne répond. Quelque part, le feu du Colosse brûle encore. Refais tout le combat en Normal pour connaître la vraie fin.`);
    el.go.textContent=_('Back to menu','Retour au menu');el.ov.hidden=false;
    try{el.go.focus({preventScroll:true})}catch(e){}
    return;
  }
  const sp=R.mode==='space',win=R.mode==='won'||sp;
  if(sp){try{localStorage.setItem('eb-end','1')}catch(e){}updNext()}
  el.ov.classList.toggle('clear',sp);
  el.eye.textContent=sp?_('End of Chapter I · Next: Silent Bells','Fin du chapitre I · À suivre : Silent Bells'):win?_('Victory · Phase III','Victoire · Phase III'):_('Defeat · Phase III','Défaite · Phase III');
  el.title.textContent=sp?_(`The fire has gone out.`,`Le feu s'est éteint.`):win?_(`The Colossus collapses.`,`Le Colosse s'effondre.`):_('Struck down atop the tower.','Terrassé au sommet du Clocher.');
  el.stats.textContent=_('Parries ','Parades ')+R.parries+_(' · Hits taken ',' · Coups subis ')+R.taken+trStr(3);
  el.stats.hidden=false;
  el.desc.textContent=sp?_(`The Colossus is frozen in black stone, facing the bell. In his open hand lies a chain ring engraved with an erased name. In the beacon's light, the Watcher gazes at him for a long while.`,`Le Colosse est figé dans la pierre noire, face à la cloche. Dans sa main ouverte, un anneau de chaîne gravé d'un nom effacé. Sous la lumière du fanal, le Veilleur le contemple longtemps.`):win?_(`The Colossus collapses in the snow. On the Bell Tower, the Watcher's lantern still keeps watch.`,`Le Colosse s'effondre dans la neige. Sur le Clocher, la lanterne du Veilleur veille encore.`):_(`Snow covers the Watcher. Atop the Bell Tower, the Colossus rules alone, and his fire will never die again.`,`La neige recouvre le Veilleur. Sur le Clocher, le Colosse règne seul, et son feu ne s'éteindra plus.`);
  el.go.textContent=sp?_('Back to menu','Retour au menu'):win?_('Replay from Phase I','Rejouer depuis la phase I'):_('Retry Phase III','Réessayer la phase III');
  if(sp&&RUN.on){el.eye.textContent=_('Trial by Fire · Complete','Épreuve du feu · Terminée');el.stats.hidden=true;$('ovTable').innerHTML=runTable();$('ovTable').hidden=false}
  if(!win)deathCard();
  el.ov.hidden=false;
  try{el.go.focus({preventScroll:true})}catch(e){}
}
function chargeX(t){
  if(t<.35)return BX-5*Math.sin(t*50);
  if(t<1.0){const u=(t-.35)/.65;return BX+(PX+215-BX)*u*u}
  const e=es(clamp01((t-1.0)/.5));
  return PX+215+(BX-110-PX-215)*e;
}
function chargeXH(t){
  if(t<.35)return BX-5*Math.sin(t*50);
  if(t<1.0){const u=(t-.35)/.65;return BX+(PX+215-BX)*u*u}
  if(t<1.45){const u=(t-1.0)/.45;return PX+215+(XB-PX-215)*(1-Math.pow(1-u,1.5))}
  if(t<2.6)return XB;
  if(t<2.95)return XB-5*Math.sin(t*50);
  if(t<3.6){const u=(t-2.95)/.65;return XB+(BX-XB)*u*u}
  return BX;
}
function heroFlip(){const a=R&&R.atk;if(!a||!a.h||a.kind!=='charge')return false;const q=a.t-(a.off||0);return q>=1.3&&q<3.45}
function bombPos(i){return[PX+86+i*26,DECK-26]}
function bombL(i){return .95+[0,.7,1.05,1.75,2.1][i]} /* rythme « 1 - 1 1 - 1 1 » (temps = .35 s), identique à la chute et à l'explosion */
function rStep(dt){
  R.time+=dt;R.t+=dt;
  for(const f of FLAKES){f.y+=f.v*dt;f.x-=(40+f.v*.25)*dt+Math.sin(R.time+f.ph)*6*dt;if(f.y>H+6){f.y=-6;f.x=rand(0,W+80)}if(f.x<-8)f.x=W+8}
  for(let i=R.sparks.length-1;i>=0;i--){const s=R.sparks[i];s.life-=dt;if(s.life<=0){R.sparks.splice(i,1);continue}s.vy+=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt}
  for(let i=R.steam.length-1;i>=0;i--){const s=R.steam[i];s.life-=dt;if(s.life<=0){R.steam.splice(i,1);continue}s.x+=s.vx*dt;s.y+=s.vy*dt;s.s+=14*dt}
  for(let i=R.rings.length-1;i>=0;i--){R.rings[i].life-=dt;if(R.rings[i].life<=0)R.rings.splice(i,1)}
  for(let i=R.floats.length-1;i>=0;i--){R.floats[i].life-=dt;if(R.floats[i].life<=0)R.floats.splice(i,1)}
  for(let i=R.fbs.length-1;i>=0;i--){R.fbs[i].t+=dt;if(R.fbs[i].t>.7)R.fbs.splice(i,1)}
  for(const m of R.melts)m.t+=dt;
  for(let i=R.exps.length-1;i>=0;i--){R.exps[i].t+=dt;if(R.exps[i].t>.9)R.exps.splice(i,1)}
  R.shake=Math.max(0,R.shake-dt*45);R.flash=Math.max(0,R.flash-dt*2.2);R.hurt=Math.max(0,R.hurt-dt*1.6);R.recoil=Math.max(0,R.recoil-dt*3.5);
  if(R.endIn>0){R.endIn-=dt;if(R.endIn<=0)rEnd()}
  if(R.atk&&R.atk.kind==='charge')R.bx=(R.atk.h?chargeXH:chargeX)(Math.max(0,R.atk.pt));
  else if(!R.cn||R.cn.k!=='slide')R.bx+=(BX-R.bx)*Math.min(1,dt*3);
  if(R.hitstop>0){R.hitstop-=dt;hud();return}
  if(R.mode==='finale'){rFinale(dt);hud();return}
  if(R.mode==='flee'){rFlee(dt);hud();return}
  if(R.mode==='fake'){hud();return}
  if(R.mode==='space'){R.st+=dt;
    if(R.st>4.6&&!R.cardShown&&!R.outro){R.cardShown=true;rEnd()}hud();return}
  const p=R.pl;p.t+=dt;p.deny=Math.max(0,p.deny-dt);
  if(R.mode==='intro'){
    /* Entrée : le Veilleur arrive par la cheminée, lanterne en main ; le Colosse se pose en vol au sommet du Clocher */
    const T=R.t;
    R.introHx=-20+(PX+20)*es(clamp01(T/1.7));R.bx=BX+300*(1-es(clamp01(T/1.1)));
    if(T<1.7){const h=Math.floor(T/.32);if(h!==R.ih){R.ih=h;footfall(false)}}
    if(T>=.02&&!R.i0){R.i0=true;whoosh(.9,.06,true)}
    if(T<1.1){const fb=Math.floor(T*9/Math.PI);if(fb!==R.ifb){R.ifb=fb;whoosh(.35,.05,false)}}
    if(T>=.55&&!R.ibell){R.ibell=true;ringBell(.22,.45)} /* la cloche sonne avant l'impact : elle réagit au Colosse, pas au choc */
    if(T>=1.1&&!R.iclash){R.iclash=true;R.shake=reduce?0:18;R.flash=.5;boom(.8,.18);footfall(true);
      for(let i=0;i<46;i++){const L=rand(.5,1.1);R.sparks.push({x:BX+rand(-150,150),y:DECK-4,vx:rand(-260,260),vy:-rand(80,380),g:520,life:L,max:L,col:i%3?'#f2f6ff':'#bfeaff',sz:rand(3,7)})}
      qRing(BX,DECK);qRing(BX-120,DECK);qRing(BX+120,DECK)}
    if(!R.roared&&T>=2.9){R.roared=true;R.shake=reduce?0:10;R.flash=.3;tone(70,.9,'sawtooth',.09,60);qFloat(_('PHASE III','PHASE III'),W/2-110,120,'#ffc15a',54,1.8);roar()}
    if(T>=3.8){R.mode='play';R.boss.wait=.7;R.bx=BX}
    hud();return;
  }
  if(p.s==='guard'&&p.t>=R_T.guard){p.s='recover';p.t=0}
  else if(p.s==='recover'&&p.t>=R_T.rec){p.s='ready';p.t=0}
  else if(p.s==='down'&&R.mode==='play'&&p.t>=(p.downT||R_T.down)){p.s='ready';p.t=0}
  if(R.mode==='play'||R.mode==='won')rBoss(dt);
  hud();
}

function finExplode(i){
  const P=[[-20,-200],[-60,-250],[30,-150],[-30,-300],[0,-190]][i];
  const x=R.bx+P[0],y=DECK+P[1];
  R.exps.push({x,y,t:0,s:.5+.22*i});
  R.fbs.push({x,y,t:0,big:1+.45*i});
  if(i>=3)R.fbs.push({x:x+rand(-60,60),y:y+rand(-50,50),t:0,big:1.4+.3*i});
  R.flash=.35+.12*i;R.shake=reduce?0:8+3*i;
  tone(150-i*12,.55,'sawtooth',.1+.02*i,-90);boom(.6+.1*i,.12+.03*i);
  if(i===1||i===4)roar();
  qBurst(x,y,24+8*i,['#ffffff','#ffc15a','#ff7a2b','#bfeaff']);
}
function finSlash(sd){
  const x=R.bx+sd*60,y=DECK-205;(R.fbeam=R.fbeam||[]).push({sd,t:0});
  qBurst(x,y,30,['#ffffff','#bfeaff','#6fd3ff','#ffc15a']);qRing(x,y);R.exps.push({x,y,t:0,s:.5});
  R.flash=.5;R.shake=reduce?0:12;thud(1);tone(880,.4,'sine',.07,-200);tone(120,.5,'square',.09,-60);noise(.2,.12,2500,600);roar();
  qFloat(_('WING SHATTERED!','AILE BRISÉE !'),x-90,y-110,'#bfeaff',34,1.1);
}
function rFinale(dt){
  const f=R.fin;f.t+=dt;const t=f.t;
  if(!f.s0){f.s0=1;noise(.6,.22,6000,500);tone(1600,.3,'sine',.07,-1300);boom(.9,.16)}
  if(t>=.5&&!f.lp){f.lp=1;whoosh(.7,.1,false)}
  for(const w of R.fall)w.t+=dt;
  for(const b of (R.fbeam||[]))b.t+=dt;
  /* la grande cloche répond au Veilleur : son écho désarme le Colosse, la masse lui échappe des mains */
  if(t>=FIN.raise&&!f.rs){f.rs=1;whoosh(.5,.1,true);tone(90,.6,'sawtooth',.06,120)}
  if(t>=FIN.bell1&&!f.b1){f.b1=1;ringBell(.55);R.flash=.25;say(_('The Watcher raises his lantern: the great bell answers.','Le Veilleur lève sa lanterne : la grande cloche répond.'))}
  if(t>=FIN.fling&&!f.fl){f.fl=1;
    R.fmace={x:R.bx-60,y:DECK-210,a:-2.1,vx:-240,vy:-330,w:-7,b:0,land:0,t:0};
    R.shake=reduce?0:14;R.flash=.4;painCry(.7,.12);anvil();thud(1.3);
    qBurst(R.bx-60,DECK-210,36,['#ffffff','#bfeaff','#6fd3ff','#ffc15a']);qRing(R.bx-60,DECK-210);
    qFloat(_('DISARMED!','DÉSARMÉ !'),R.bx-150,DECK-330,'#bfeaff',36,1.2);
    say(_('The echo tears the mace from the Colossus\'s hands.','L\'écho arrache la masse des mains du Colosse.'));
  }
  if(R.fmace){const m=R.fmace;m.t+=dt;
    if(!m.land){
      m.vy+=1500*dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.a+=m.w*dt;
      if(m.y>=DECK-30){m.y=DECK-30;
        if(!m.b){m.b=1;m.vy=-m.vy*.32;m.vx*=.5;m.w*=.4;R.shake=reduce?0:Math.max(R.shake,10);boom(.5,.14);tone(120,.3,'square',.07,-60);
          for(let i=0;i<14;i++)R.sparks.push({x:m.x+rand(-30,30),y:DECK-4,vx:rand(-140,140),vy:-rand(20,120),g:260,life:.6,max:.6,col:'#9a8a9e',sz:rand(3,6)})}
        else{m.land=1;m.vx=0;m.vy=0;m.a=3.2;boom(.3,.08);tone(180,.2,'square',.04,-60)}
      }
    }
  }
  if(t>=FIN.cut[0]&&!f.c1){f.c1=1;R.cut=1;R.fall.push({sd:-1,t:0});finSlash(-1)}
  if(t>=FIN.cut[1]&&!f.c2){f.c2=1;R.cut=2;R.fall.push({sd:1,t:0});finSlash(1)}
  if(t>=FIN.charge&&!f.ch){f.ch=1;tone(200,1,'sawtooth',.06,600)}
  if(t>=FIN.strike&&!f.st){
    f.st=1;R.bhp=0;R.flash=1;R.shake=reduce?0:18;R.hitstop=.12;thud(1.8);
    qBurst(R.bx-20,DECK-200,50,['#ffffff','#ffc15a','#ff7a2b','#bfeaff']);qRing(R.bx-20,DECK-200);
    tone(110,.7,'square',.12,-70);painCry(2.0,.2);qFloat(_('FINAL BLOW!','COUP ULTIME !'),W/2-150,110,'#ffc15a',48,1.6);
  }
  for(let i=0;i<5;i++)if(t>=FIN.exp+i*FIN.gap&&!f['e'+i]){f['e'+i]=1;finExplode(i)}
  if(t>=FIN.collapse&&!f.cl){f.cl=1;boom(1.1,.12);whoosh(1,.07,false);say(_('The Colossus crashes down beneath the great bell.','Le Colosse s\'écrase sous la grande cloche.'))}
  if(t>=FIN.collapse+1.1&&!f.imp){
    f.imp=1;R.shake=reduce?0:20;R.flash=.4;tone(55,.9,'sine',.22,-20);boom(1.2,.22);
    for(let i=0;i<20;i++)R.steam.push({x:R.bx-200+rand(-120,120),y:DECK-4,vx:rand(-90,90),vy:-rand(20,100),life:rand(.8,1.4),max:1.4,s:rand(12,26)});
  }
  if(t>=FIN.bell&&!f.bl){f.bl=1;ringBell(.55);painCry(2.6,.12);R.flash=.35;R.shake=reduce?0:8;say(_('The Watcher raises his lantern: the great bell rings and the Colossus turns to stone.','Le Veilleur lève sa lanterne : la grande cloche sonne et le Colosse se change en pierre.'))}
  if(t>=FIN.bell+.4)for(let i=0;i<20;i++)if(R.fin.t<FIN.bell+.45&&Math.random()<.2)R.steam.push({x:R.bx-200+rand(-120,160),y:DECK-rand(20,160),vx:rand(-30,30),vy:-rand(20,60),life:rand(.8,1.4),max:1.4,s:rand(10,20)});
  if(t>=FIN.hero-.6&&!f.fn){f.fn=1;R.fanalAt=R.time;tone(520,.8,'sine',.05,200);noise(.4,.08,1200,400);say(_("The Watcher lights the Bell Tower's beacon.","Le Veilleur allume le fanal du Clocher."))}
  if(t>=FIN.hero&&!f.hs){f.hs=1;R.towerAt=[];[0,3,2,1].forEach((k,j)=>R.towerAt[k]=R.time+j*.55);tone(330,1.6,'sine',.05,0);say(_("One by one, the Spires answer.","Une à une, les Flèches répondent."))}
  if(t>=FIN.hero+.55&&!f.hs2){f.hs2=1;tone(294,1.6,'sine',.05,0)}
  if(t>=FIN.hero+1.1&&!f.hs3){f.hs3=1;tone(262,1.6,'sine',.05,0)}
  if(t>=FIN.hero+1.65&&!f.hs4){f.hs4=1;tone(349,1.6,'sine',.05,0)}
  if(t>=FIN.hero+2.2&&!f.hs5){f.hs5=1;say(_('All but one.','Toutes, sauf une.'))}
  if(t>=FIN.space){R.mode='space';R.st=0;R.outro=true;say(_('Far out at sea, the Drowned Beacon stays silent. End of Chapter I.','Au large, le Phare Noyé reste muet. Fin du chapitre I.'));
    OUTRO.play(()=>{if(!R)return;R.outro=false;if(R.mode==='space'&&!R.cardShown){R.cardShown=true;rEnd()}})}
}

/* ---------- rendu phase III ---------- */
function finTh(t){return t<FIN.collapse?0:1.4*ei(clamp01((t-FIN.collapse)/1.1))}
function flameRow(foot,d,pre,post,sc){
  /* onde de choc : une succession d'explosions qui part du pied du Colosse et grossit jusqu'à atteindre le héros */
  if(d<=-pre||d>=post)return;
  const N=7,life=.5+post*.3,gx=GUARD[0];
  ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=18;
  for(let i=0;i<N;i++){
    const t0=-pre*(1-i/(N-1)),a=d-t0;
    if(a<0||a>=life)continue;
    const k=a/life,x=foot+(gx-foot)*(i/(N-1)),r=(24+i*11)*sc*(.55+.6*es(k)),al=1-k*k;
    const y=DECK-r*.35,g=ctx.createRadialGradient(x,y,2,x,y,r);
    g.addColorStop(0,'rgba(255,248,215,'+(.95*al)+')');g.addColorStop(.35,'rgba(255,190,90,'+(.8*al)+')');
    g.addColorStop(.75,'rgba(255,100,35,'+(.45*al)+')');g.addColorStop(1,'rgba(255,60,20,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();
    if(k<.5){ctx.strokeStyle='rgba(255,230,160,'+(.7*(1-k*2))+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r*.8,0,6.283);ctx.stroke()}
  }
  ctx.restore();
}
function drawBolt(x,y0,y1,al,big){
  if(al<=0)return;
  const pts=[[x,y0]];for(let i=1;i<=9;i++)pts.push([i===9?x:x+rand(-34,34),y0+(y1-y0)*i/9]);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.shadowColor='#bfeaff';ctx.shadowBlur=30;
  for(let pass=0;pass<2;pass++){
    ctx.strokeStyle=pass?'rgba(255,255,255,'+al+')':'rgba(111,211,255,'+(al*.6)+')';ctx.lineWidth=big?(pass?8:24):(pass?4:12);
    ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  }
  ctx.restore();
}
function heroFin(){
  const f=R.fin,t=f.t,bx=R.bx,L=[-112,-165];
  let x=PX,y=0,rot=0,glow=1,hand=[28,-94],sa=-1.5;
  if(t<FIN.leap[0]){}
  else if(t<FIN.leap[1]){const u=(t-FIN.leap[0])/(FIN.leap[1]-FIN.leap[0]);x=PX+(bx+L[0]-PX)*es(u);y=L[1]*es(u)-110*Math.sin(Math.PI*u);hand=[30,-72];sa=.15-.95*es(u)}
  else{
    x=bx+L[0];y=L[1];hand=[30,-72];sa=-.8;
    /* un tir de lanterne dans chaque aile : le sceptre pointe l'aile visée, léger recul au départ du tir */
    for(let i=0;i<2;i++){
      const d=t-FIN.cut[i],ang=i?-.22:-.63;
      if(d>-.4&&d<.45){const k=d<.1?es(clamp01((d+.4)/.35)):1-es(clamp01((d-.1)/.35));sa=-.8+(ang+.8)*k;hand=[30-7*(d>=0&&d<.15?1-d/.15:0),-72]}
    }
    if(t>=FIN.charge&&t<FIN.strike){hand=[26,-100];sa=-1.45;y=L[1]-24*es(clamp01((t-FIN.charge)/.6))}
    else if(t>=FIN.strike){hand=[38,-56];sa=.12;x+=14*es(clamp01((t-FIN.strike)/.1))}
    if(t>=FIN.collapse){
      const mag=finTh(t),th=-mag,c=Math.cos(th),sn=Math.sin(th),k=es(clamp01(mag/1.4));
      const A=[L[0]+(45-L[0])*k,L[1]+(-200-L[1])*k];
      x=bx+A[0]*c-A[1]*sn;y=A[0]*sn+A[1]*c;
      hand=[30,-60];sa=.12+.9*k;glow=.4;
    }
    if(t>=FIN.bell-.6){
      /* debout sur le Colosse terrassé, il lève sa lanterne vers la cloche */
      const u=es(clamp01((t-(FIN.bell-.6))/.5));
      hand=[30-4*u,-60-40*u];sa=.12+.9*(1-u)-1.45*u;glow=.4+.6*u;
    }
  }
  return{x,y,hand,sa,rot,sy:1,glow};
}
function finBoss(o){
  const t=R.fin.t,th=-finTh(t),c=Math.cos(th),sn=Math.sin(th);
  o.warm=t<FIN.collapse?(t>=FIN.strike?2:1.5):Math.max(.03,(t<FIN.bell?Math.max(.25,1.7-(t-FIN.collapse)*.35):Math.max(.25,1.7-(FIN.bell-FIN.collapse)*.35)*(1-clamp01((t-FIN.bell)/1.2))));
  o.jaw=(t>=FIN.strike&&t<FIN.collapse)?16:(t<.6?12:0);
  o.lean=th;o.dy=0;
  if(t>=FIN.strike&&t<FIN.collapse)o.x+=rand(-3,3);
  o.hands=[[-128,-66],[128,-66]].map(p=>[o.x+p[0]*c-p[1]*sn,DECK+p[0]*sn+p[1]*c]);
  if(t<FIN.collapse){const sw=Math.sin(t*3)*4;o.hands[0][1]+=sw;o.hands[1][1]-=sw}
  o.nostow=t>=FIN.raise;
  if(t>=FIN.raise&&t<FIN.fling){
    /* le Colosse brandit sa masse au-dessus de lui pour écraser le Veilleur */
    const u=es(clamp01((t-FIN.raise)/.4)),a=-2.1,dir=[Math.cos(a),Math.sin(a)];
    const grip=[o.x-60,DECK-210],g1=[o.hands[0][0]+(grip[0]-o.hands[0][0])*u,o.hands[0][1]+(grip[1]-o.hands[0][1])*u];
    const b0=[grip[0]-dir[0]*34,grip[1]-dir[1]*34],g2=[o.hands[1][0]+(b0[0]-o.hands[1][0])*u,o.hands[1][1]+(b0[1]-o.hands[1][1])*u];
    const sh=t>FIN.bell1?Math.sin(t*60)*3:0;
    o.sword={h:[g1[0]+sh,g1[1]],a:a,l:135*u,heat:1.2+.6*u};o.hands=[g1,g2];o.warm=Math.max(o.warm,1.7);
  }
  if(t>=FIN.fling&&t<FIN.fling+.7)o.jaw=14;
}
/* Final : écho de la cloche vers la masse, masse tombée au sol, tirs de lanterne dans les ailes */
function drawFinFx(){
  if(!R||R.mode!=='finale'&&!R.fmace)return;
  const t=R.fin?R.fin.t:0;
  if(R.mode==='finale'&&t>=FIN.bell1&&t<FIN.fling+.1){
    const B=[BELL[0],BELL[1]+40],G=[R.bx-100,DECK-270];
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowColor='#6fd3ff';
    for(let i=0;i<4;i++){
      const u=clamp01((t-FIN.bell1-i*.05)/.22);if(u<=0||u>=1)continue;
      const cx=B[0]+(G[0]-B[0])*es(u),cy=B[1]+(G[1]-B[1])*es(u),r=40+50*u;
      ctx.strokeStyle='rgba(235,250,255,'+(1-u*.5)+')';ctx.lineWidth=8*(1-u*.4)+2;ctx.shadowBlur=18;
      ctx.beginPath();ctx.arc(cx-r*.6,cy,r,-.8,.8);ctx.stroke();
    }
    ctx.restore();
  }
  if(R.fmace){const m=R.fmace;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.a);drawHammer(135,m.land?.2:1,R.time,9);ctx.restore()}
  if(R.fbeam&&R.fbeam.length){
    const hp=heroPose3(),L=[hp.x+hp.hand[0]+Math.cos(hp.sa)*76,DECK+(hp.y||0)+hp.hand[1]+Math.sin(hp.sa)*76];
    for(const b of R.fbeam){const al=1-b.t/.3;if(al<=0)continue;ctx.save();ctx.globalCompositeOperation='lighter';lanternBeam(L,[R.bx+b.sd*60,DECK-205],16,al);ctx.restore()}
  }
}
function drawFallWings(){
  for(const w of R.fall){
    const t=w.t,sd=w.sd,x0=R.bx+sd*64*.92,y0=DECK-204;
    ctx.save();ctx.globalAlpha=clamp01(1.6-t*.7);
    ctx.translate(x0+sd*70*t,y0+330*t*t-40*t);ctx.rotate(sd*1.1*t);ctx.scale(.92,.92);
    drawWing([0,0],-.85,.8,'#220a11',.34,true,sd);drawWing([0,0],-1.15,1,'#35101a',.34,true,sd);
    ctx.restore();
  }
}

function heroX3(){
  const c=R.cn,p=R.pl;
  if(c&&c.k==='slide'){
    const t=c.t,tx=R.bx-150;
    if(t<.35)return PX+(tx-PX)*eo(t/.35);
    if(t<.65)return tx;
    return tx+(PX-tx)*es(clamp01((t-.65)/.5));
  }
  if(p.s==='down'&&p.lasso){const d=p.downT||1.1,k=es(clamp01(p.t/.3))*(1-es(clamp01((p.t-(d-.35))/.35)));return PX+46*k}
  if(p.s==='down')return PX-24*(1-clamp01(p.t/.5));
  return PX;
}
function heroPose3(){
  if(R.mode==='finale')return heroFin();
  if(R.mode==='flee'||R.mode==='fake')return heroFlee();
  if(R.mode==='intro'){
    const T=R.t;
    /* il arrive en marchant ; au choc du Colosse, il lève sa lanterne qui s'embrase */
    const up=es(clamp01((T-1.1)/.25))*(1-es(clamp01((T-2.4)/.6)));
    return{x:R.introHx,y:T<1.7?-Math.abs(Math.sin(T*9.8))*4:0,hand:[30,-68-26*up],sa:-.3-1.0*up,rot:0,sy:1,glow:Math.max(.25,up)};
  }
  const p=R.pl,c=R.cn;
  let hand=[28,-62],sa=-.45,rot=0,sy=1,glow=0;
  const x=heroX3();
  if(c){
    const t=c.t;
    if(c.k==='plant'){
      const u=es(clamp01(t/.3));hand=[28+10*u,-62+22*u];sa=-.45+.8*u;sy=1-.1*u;glow=t>=.3?clamp01(1-(t-.3)/1.1):0;
      if(t>1.1){const v=es(clamp01((t-1.1)/.4));hand=[38-10*v,-40-22*v];sa=.35-.8*v;sy=.9+.1*v}
    }else if(c.k==='bat'){
      const V='B',u=es(clamp01(t/.22)),v=es(clamp01((t-.6)/.5));
      if(V==='A'){hand=[26,-62-40*u*(1-v)];sa=-.45-1.1*u*(1-v)}
      else if(V==='B'){hand=[30,-62-6*u*(1-v)];sa=-.45+.3*u*(1-v)+(t>.2&&t<.6?Math.sin(t*60)*.03:0)}
      else{hand=[28,-62-26*u*(1-v)+(t>.2&&t<.62?Math.sin(t*55)*2.5:0)];sa=-.45-.5*u*(1-v)}
    }else if(c.k==='bell'){
      const u=es(clamp01(t/.2)),v=es(clamp01((t-.85)/.5));
      hand=[28,-62-30*u*(1-v)+(t>.1&&t<.5?Math.sin(t*55)*2.5:0)];sa=-.45-.7*u*(1-v);glow=.9*(1-v)
    }else if(c.k==='bolt'){
      const u=es(clamp01(t/.25));hand=[28,-62-30*u];sa=-.45-.5*u;glow=1;
      if(t>1.5){const v=es(clamp01((t-1.5)/.4));hand=[28,-92+30*v];sa=-.95+.5*v;glow=1-v}
    }else if(c.k==='slide'){
      sy=.82;hand=[34,-34];sa=0;rot=.05;
      if(t>.65){const v=es(clamp01((t-.65)/.5));sy=.82+.18*v;hand=[34-6*v,-34-28*v];sa=-.45*v;rot=.05*(1-v)}
    }
  }else if(p.s==='guard'){
    const r=clamp01(p.t/.08);hand=[28,-62-32*r];sa=-.45-1.05*r;glow=1;
  }else if(p.s==='down'&&p.lasso){
    const d=p.downT||1.1,k=es(clamp01(p.t/.3))*(1-es(clamp01((p.t-(d-.35))/.35)));
    rot=-1.45*k;hand=[24,-34];sa=.7;
  }else if(p.s==='down'){rot=.12;sy=.82;sa=.6}
  return{x,hand,sa,rot,sy,glow};
}
/* Masse de braise du Colosse, dans le repère de la main : manche le long de l'axe x, tête à pointes au bout (portée L) */
function drawHammer(L,heat,tm,w){
  if(L<2)return;const x0=L-w*5,R=w*3.4,cx=x0+R*.9,fl=.6+.4*Math.sin(tm*14);
  ctx.save();ctx.lineCap='round';
  ctx.strokeStyle='#1c1520';ctx.lineWidth=w*1.15;ctx.beginPath();ctx.moveTo(-26,0);ctx.lineTo(cx,0);ctx.stroke();
  ctx.strokeStyle='#3a2d44';ctx.lineWidth=w*.7;ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(cx,0);ctx.stroke();
  for(let i=1;i<4;i++)box(x0*i/4-3,-w*.75,6,w*1.5,'#4a3a55','#2b2233');
  ctx.fillStyle='rgba(255,120,40,'+Math.min(.25,.12*heat)+')';ctx.beginPath();ctx.arc(cx,0,R*1.7,0,6.283);ctx.fill();
  /* pointes */
  for(let i=0;i<10;i++){const a=i/10*6.283;ctx.save();ctx.translate(cx,0);ctx.rotate(a);
    ctx.beginPath();ctx.moveTo(R*.8,-w*.7);ctx.lineTo(R*1.55,0);ctx.lineTo(R*.8,w*.7);ctx.closePath();ctx.fillStyle='#3a2d44';ctx.fill();ctx.strokeStyle='#5a4666';ctx.lineWidth=1.5;ctx.stroke();ctx.restore()}
  const g=ctx.createRadialGradient(cx-R*.3,-R*.3,2,cx,0,R);g.addColorStop(0,'#4a3550');g.addColorStop(1,'#1a1119');
  ctx.beginPath();ctx.arc(cx,0,R,0,6.283);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#5a4666';ctx.lineWidth=2.5;ctx.stroke();
  ctx.strokeStyle='rgba(255,'+(130+70*fl|0)+',50,.95)';ctx.lineWidth=2.5;ctx.shadowColor='#ff7a2b';ctx.shadowBlur=10;
  ctx.beginPath();ctx.moveTo(cx-R*.7,-R*.2);ctx.lineTo(cx-R*.2,R*.1);ctx.lineTo(cx-R*.1,-R*.6);ctx.moveTo(cx-R*.2,R*.1);ctx.lineTo(cx+R*.3,R*.5);ctx.moveTo(cx+R*.1,-R*.1);ctx.lineTo(cx+R*.6,-R*.3);ctx.stroke();
  ctx.restore();
}
function drawFireBlade(L,heat,tm,w){drawHammer(L,heat,tm,w)}
function bossSword3(a,two){
  const UP=[BX+10,DECK-290],HIT1=[BX-150,DECK-230],PREP2=[BX+80,DECK-110],HIT2=[BX-150,DECK-96],REST=[BX-40,DECK-120];
  const A_UP=-1.35,A_HIT1=-3.76,A_H=-Math.PI+.12;
  let KF=[
    {t:0,h:REST,a:-.2,l:0},{t:.25,h:UP,a:A_UP,l:300},{t:.45,h:UP,a:A_UP,l:300},
    {t:.75,h:HIT1,a:A_HIT1,l:300,e:'i'},{t:1.10,h:PREP2,a:A_H,l:300},{t:1.4,h:HIT2,a:A_H,l:300,e:'i'},
    {t:1.75,h:UP,a:A_UP,l:300},{t:2.05,h:HIT1,a:A_HIT1,l:300,e:'i'},{t:2.6,h:REST,a:-.2,l:0}
  ];
  if(two)KF=KF.slice(0,6).concat([{t:1.65,h:HIT2,a:A_H,l:300},{t:2.1,h:REST,a:-.2,l:0}]);
  const t=Math.min(a,KF[KF.length-1].t);
  let i=0;while(i<KF.length-2&&t>KF[i+1].t)i++;
  const k0=KF[i],k1=KF[i+1];
  let u=clamp01((t-k0.t)/(k1.t-k0.t));u=k1.e==='i'?ei(u):es(u);
  const h=lerp2(k0.h,k1.h,u);
  return{h,a:k0.a+(k1.a-k0.a)*u,l:k0.l+(k1.l-k0.l)*u};
}
function bossSwordH(a){
  const UP=[BX+10,DECK-290],HIT1=[BX-150,DECK-230],PREP2=[BX+80,DECK-110],HIT2=[BX-150,DECK-96],REST=[BX-40,DECK-120],PULL=[BX+110,DECK-150],THR=[BX-200,DECK-150],PLANT=[BX-70,DECK-230];
  const A_UP=-1.35,A_HIT1=-3.76,A_H=-Math.PI+.12,A_PL=-4.08;
  const KF=[
    {t:0,h:REST,a:-.2,l:0},{t:.3,h:PULL,a:A_H,l:300},{t:.55,h:PULL,a:A_H,l:300},{t:.85,h:THR,a:A_H,l:300,e:'i'},
    {t:1.7,h:UP,a:A_UP,l:300},{t:1.95,h:HIT1,a:A_HIT1,l:300,e:'i'},{t:2.2,h:PREP2,a:A_H,l:300},{t:2.45,h:HIT2,a:A_H,l:300,e:'i'},
    {t:2.7,h:UP,a:A_UP,l:300},{t:2.95,h:HIT1,a:A_HIT1,l:300,e:'i'},{t:3.35,h:UP,a:A_UP,l:300},{t:3.9,h:PLANT,a:A_PL,l:300,e:'i'},{t:4.2,h:PLANT,a:A_PL,l:300},{t:4.7,h:REST,a:-.2,l:0}
  ];
  const t=Math.min(a,KF[KF.length-1].t);
  let i=0;while(i<KF.length-2&&t>KF[i+1].t)i++;
  const k0=KF[i],k1=KF[i+1];
  let u=clamp01((t-k0.t)/(k1.t-k0.t));u=k1.e==='i'?ei(u):es(u);
  return{h:lerp2(k0.h,k1.h,u),a:k0.a+(k1.a-k0.a)*u,l:k0.l+(k1.l-k0.l)*u};
}
function bossPose3(){
  const b=R.boss,x=R.bx,a=R.atk,t=R.time;
  const rest=[[x-128,DECK-66+Math.sin(t*2)*3],[x+128,DECK-66+Math.sin(t*2+1)*3]];
  const o={x,dy:Math.sin(t*1.6)*2,lean:0,jaw:0,warm:R.rage>0?1.5:1,hands:rest,sword:null,wa:0,ws:1};
  if(R.mode==='intro'){
    const T=R.t;
    o.jaw=(T>2.9&&T<3.6)?14:0;o.warm=T>2.9?1.4:1.25;
    /* il arrive en vol, ailes déployées et battantes, se pose puis replie ses ailes */
    if(T<1.1){const u=T/1.1;o.dy=-520*(1-es(u));o.wa=.6+.35*Math.sin(T*18);o.ws=1.9;o.lean=-.08;
      o.hands=rest.map(h=>[h[0]+(h[0]<x?-40:40),h[1]-30])}
    else{const v=clamp01((T-1.1)/1.4),f=1-es(clamp01((T-1.1)/.8));o.dy=24*(1-es(v));o.lean=.16*(1-es(v));o.wa=.6*f;o.ws=1+.9*f;
      const k=1-es(clamp01((T-1.1)/1.2));o.hands=rest.map(h=>[h[0]+(h[0]<x?-30:30)*k,h[1]+40*k])}
  }
  if(b.s==='hurt'||b.s==='fail'){o.jaw=b.s==='hurt'?8:0}
  if(b.s==='dead'&&R.mode!=='finale'){o.dy=Math.min(70,b.t*45);o.warm=Math.max(.2,1-b.t*.4);o.lean=.05*Math.min(1,b.t)}
  if(b.s==='heal'){
    const k=clamp01(b.t/.5)*(1-clamp01((b.t-2.9)/.5));
    o.warm=1.6+.8*k;o.jaw=(b.t>.5&&b.t<2.9)?16:6;o.wa=.6*k;o.ws=1+.9*k;o.lean=-.06*k;
    o.hands=[lerp2(rest[0],[x-120,DECK-330],k),lerp2(rest[1],[x+120,DECK-330],k)];
  }
  if(a){
    o.warm=Math.max(o.warm,1.25);
    let sp=0;
    a.hits.forEach(h=>{
      if(h.k!=='blast'&&h.k!=='wave'&&h.k!=='stomp')return;
      if(a.h&&a.kind==='greatsword'&&h.k==='blast'&&!h.pre&&!h.flap)return;
      const d=a.t-h.at;
      if(h.pre){
        const k=clamp01(a.t/.5)*(1-es(clamp01((d-.15)/.5)));
        o.wa+=.6*k;o.ws+=.9*k;if(k>.3)o.jaw=Math.max(o.jaw,14);o.warm=Math.max(o.warm,1.4+.5*k);
        o.hands=[lerp2(o.hands[0],[x-120,DECK-330],k),lerp2(o.hands[1],[x+120,DECK-330],k)];
        if(a.t>=.5&&!a.roared){a.roared=true;roar();R.shake=reduce?0:10;R.flash=.35}
      }else{
        sp=Math.max(sp,es(clamp01((d+.6)/.35))*(1-es(clamp01((d-.15)/.4))));
      }
    });
    if(sp>0){o.wa+=.6*sp;o.ws+=.9*sp}
    if(a.pt>=0){
      const q=a.pt,K=(a.cf!=null&&q>=a.cf)?'breath':a.kind;
      if(a.h&&a.kind==='avalanche'){
        let u=0;
        for(let i=0;i<5;i++){
          const L=bombL(i),T=L-.55,d=q-T;
          const b2=d<-.25?0:d<0?eo((d+.25)/.25):1-es(clamp01(d/.35));if(b2>u)u=b2;
          if(q>=T&&!a['th'+i]){a['th'+i]=1;qBurst(x+30,DECK-390,12,['#bfeaff','#ffffff','#ff9a3c']);tone(110,.2,'sawtooth',.05,-40)}
          if(q>=L&&!a['ld'+i]){a['ld'+i]=1;const P=bombPos(i);R.shake=reduce?0:Math.max(R.shake,4);tone(80,.2,'sine',.1,-30);qBurst(P[0],DECK-16,10,['#bfeaff','#ffffff'])}
        }
        o.hands=[rest[0],lerp2(rest[1],[x+50,DECK-395],u)];o.lean=-.05*u;
      }else if(a.h&&a.kind==='charge'){
        const dir=q>=1.5&&q<3.75?-1:1;o.flip=dir<0;
        const wind=q<.35||(q>=2.6&&q<2.95),run=(q>=.35&&q<1.5)||(q>=2.95&&q<3.7);
        if(wind||run){
          o.hands=[[o.x+30,DECK-150],[o.x+150,DECK-150]];o.lean=wind?.08:.14;o.jaw=wind?6:12;
          if(Math.random()<(wind?.5:.8))R.steam.push({x:o.x+dir*(wind?-60:20),y:DECK-4,vx:wind?dir*-1*rand(10,60):dir*rand(20,80),vy:-rand(20,80),life:.8,max:.8,s:rand(8,18)});
        }else if(q>=1.5&&q<2.6){
          o.lean=.14*(1-es(clamp01((q-1.5)/.4)));
          if(q>=1.65&&q<2.0)o.dy+=-16*es((q-1.65)/.35);
          else if(q>=2.0&&q<2.2)o.dy+=-16*(1-ei(clamp01((q-2.0)/.05)))+5*Math.sin(Math.PI*clamp01((q-2.05)/.15));
          if(q>=2.05&&!a.stomped){a.stomped=true;R.shake=reduce?0:9;tone(70,.4,'sine',.14,-30);
            for(let i=0;i<12;i++)R.steam.push({x:o.x+62+rand(-30,30),y:DECK-4,vx:rand(-90,90),vy:-rand(20,90),life:.7,max:.7,s:rand(10,20)})}
        }else if(q>=3.7){
          o.lean=0;
          if(q>=4.1&&q<4.95){const u=q<4.4?eo((q-4.1)/.3):1-es(clamp01((q-4.7)/.2));o.hands=[lerp2(rest[0],[o.x-110,DECK-300],u),lerp2(rest[1],[o.x+110,DECK-300],u)];o.jaw=10}
        }
      }else if(K==='greatsword'||K==='sword2'){
        const sw=(a.h&&a.kind==='greatsword')?bossSwordH(q):a.hard3?bossSword3(swq(a),false):bossSword3(q,a.kind==='sword2');
        if(sw.l>1){
          const dir=[Math.cos(sw.a),Math.sin(sw.a)],hb=[sw.h[0]-dir[0]*30,sw.h[1]-dir[1]*30];
          o.sword={h:sw.h,a:sw.a,l:sw.l,heat:1};
          o.hands=sw.h[0]<hb[0]?[sw.h,hb]:[hb,sw.h];
          if(a.h&&a.kind==='greatsword'&&q>=3.35&&q<4.0){ /* la lame se charge avant l'explosion */
            const c=clamp01((q-3.35)/.55);o.sword.chg=c;o.sword.heat=1+c;
            if(!a.chg){a.chg=true;tone(160,.55,'sawtooth',.05,520)}
            if(Math.random()<.7){const ph=Math.random(),dx=Math.cos(sw.a),dy=Math.sin(sw.a);R.sparks.push({x:sw.h[0]+dx*300*ph,y:sw.h[1]+dy*300*ph,vx:rand(-40,40),vy:-rand(30,120),g:200,life:.4,max:.4,col:'#ffd98a',sz:rand(2,4)})}
          }
        }
      }else if(a.kind==='avalanche'){
        const u=q<.25?eo(q/.25):1-es(clamp01((q-.45)/.4));
        o.hands=[rest[0],lerp2(rest[1],[x+50,DECK-395],u)];o.lean=-.05*u;
        if(q>.3&&!a.smashed){a.smashed=true;R.shake=reduce?0:7;qBurst(x+30,DECK-390,22,['#bfeaff','#ffffff','#ff9a3c']);tone(110,.3,'sawtooth',.08,-40)}
      }else if(a.kind==='charge'){
        if(q<1.0){
          const u=clamp01(q/.35);
          o.hands=[[o.x+30,DECK-150],[o.x+150,DECK-150]];o.lean=q<.35?.08*u:.14;o.jaw=q<.35?6:12;
          if(q<.35&&Math.random()<.5)R.steam.push({x:o.x-60,y:DECK-4,vx:rand(-60,-10),vy:-rand(20,70),life:.8,max:.8,s:rand(8,16)});
          if(q>=.35&&Math.random()<.8)R.steam.push({x:o.x-20,y:DECK-4,vx:rand(20,80),vy:-rand(20,80),life:.7,max:.7,s:rand(10,18)});
        }else{
          o.lean=.14*(1-es(clamp01((q-1.0)/.4)));
          if(q>=1.35&&q<1.7)o.dy+=-16*es((q-1.35)/.35);
          else if(q>=1.7&&q<1.9)o.dy+=-16*(1-ei(clamp01((q-1.7)/.05)))+5*Math.sin(Math.PI*clamp01((q-1.75)/.15));
          if(q>=1.75&&!a.stomped){a.stomped=true;R.shake=reduce?0:9;tone(70,.4,'sine',.14,-30);
            for(let i=0;i<12;i++)R.steam.push({x:o.x-62+rand(-30,30),y:DECK-4,vx:rand(-90,90),vy:-rand(20,90),life:.7,max:.7,s:rand(10,20)})}
          if(q>=2.0&&q<2.8&&!DIFF.easy){
            const u=q<2.3?eo((q-2.0)/.3):1-es(clamp01((q-2.6)/.2));
            o.hands=[lerp2(rest[0],[o.x-110,DECK-300],u),lerp2(rest[1],[o.x+110,DECK-300],u)];o.jaw=10;
          }
        }
      }else if(K==='whip'){
        const UPH=[x-100,DECK-340],FW=[x-210,DECK-240],qw=DIFF.hard?aq(a,'whip',.75):q;
        let h0;
        if(qw<.55)h0=lerp2(rest[0],UPH,es(clamp01(qw/.55)));
        else if(qw<.75)h0=lerp2(UPH,FW,ei((qw-.55)/.2));
        else h0=lerp2(FW,rest[0],es(clamp01((qw-.75)/.5)));
        o.hands=[h0,rest[1]];o.lean=qw<.55?.04*clamp01(qw/.55):-.05*(1-clamp01((qw-.75)/.5));
      }else if(K==='breath'){
        const bq=a.hq||a.cf!=null?aq(a,'breath',1.0):q;
        const inh=es(clamp01(bq/.6)),out=clamp01((bq-.85)/.2)*(1-clamp01((bq-1.3)/.4));
        o.jaw=bq>.6?14:6*inh;
        o.lean=.07*inh-.18*out;o.warm=1.3+.4*inh;
        o.hands=[lerp2(rest[0],[x-80,DECK-150],inh*(1-out)),lerp2(rest[1],[x+80,DECK-150],inh*(1-out))];
      }else if(a.kind==='claws'){
        let lunge=0,idx=0,i=0;
        a.hits.forEach(h=>{
          if(h.k!=='claw')return;
          const d=a.t-h.at;let l=0;
          if(d>=-.45&&d<-.1)l=eo((d+.45)/.35)*.35;else if(d>=-.1&&d<0)l=.35+.65*ei((d+.1)/.1);else if(d>=0&&d<.4)l=1-es(d/.4);
          if(l>lunge){lunge=l;idx=i%2}
          i++;
        });
        o.x=x-150*lunge;
        const r2=[[o.x-128,DECK-66],[o.x+128,DECK-66]];
        o.hands=r2;
        o.hands[idx]=lerp2(r2[idx],[o.x-170,GUARD[1]-30+(idx?20:-20)],lunge);
        o.jaw=lunge>.3?10:0;
      }else if(a.kind==='rocks'){
        let ri=0;
        a.hits.forEach(h=>{
          if(h.k!=='rock')return;
          const d=a.t-h.at,idx=(ri%2===0)?1:0;ri++;
          const HOLD=[x+(idx?40:-40),DECK-345],THR=[x-190,DECK-230];
          let tg=null;
          if(d>=-.95&&d<-.45)tg=lerp2(rest[idx],HOLD,es(clamp01((d+.95)/.35)));
          else if(d>=-.45&&d<-.3)tg=lerp2(HOLD,THR,eo((d+.45)/.15));
          else if(d>=-.3&&d<.25)tg=lerp2(THR,rest[idx],es((d+.3)/.55));
          if(tg)o.hands[idx]=tg;
        });
        a.hits.forEach(h=>{if(h.k!=='fire')return;const d=a.t-h.at;
          if(d>-.7&&d<.35){const k=es(clamp01((d+.7)/.4))*(1-es(clamp01((d-.05)/.3)));o.jaw=Math.max(o.jaw,14*k);o.warm=Math.max(o.warm,1.4+.4*k);o.lean=.05*k;
            o.hands=[lerp2(o.hands[0],[x-80,DECK-150],k),lerp2(o.hands[1],[x+80,DECK-150],k)]}});
      }else if(a.roar){
        const last=a.hits[a.hits.length-1].at-(a.off||0),k=es(clamp01(q/.5))*(1-es(clamp01((q-(last+.1))/.4)));
        o.jaw=Math.max(o.jaw,14*k);o.warm=Math.max(o.warm,1.4+.4*k);o.wa+=.6*k;o.ws+=.9*k;
        o.hands=[lerp2(o.hands[0],[x-120,DECK-330],k),lerp2(o.hands[1],[x+120,DECK-330],k)];
        if(q>=.3&&!a.roared){a.roared=true;roar();R.shake=reduce?0:8;R.flash=Math.max(R.flash,.2)}
      }
    }
  }
  if(R.mode==='finale')finBoss(o);
  if(R.mode==='flee'||R.mode==='fake')fleeBoss(o);
  return o;
}
const TOWERS=[[64,DECK-170,16],[906,DECK-190,14],[640,DECK-128,9],[338,DECK-118,8]];
const BELL=[480,DECK-268];
/* Fanal du Clocher : éteint pendant le combat, le Veilleur l'allume à la fin pour qu'il veille sur le Colosse pétrifié */
function drawFanal(x,by,lit,tm){
  ctx.fillStyle='#3a3f5e';ctx.fillRect(x-9,by-58,18,58);ctx.fillStyle='#4a5072';ctx.fillRect(x-13,by-62,26,6);ctx.fillRect(x-12,by-4,24,4);
  ctx.fillStyle='rgba(240,246,255,.85)';ctx.fillRect(x-13,by-64,26,2);
  if(lit>0){const r=30+60*lit,g=ctx.createRadialGradient(x,by-74,2,x,by-74,r);g.addColorStop(0,'rgba(255,214,130,'+(.55*lit)+')');g.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,by-74,r,0,6.283);ctx.fill();
    for(let i=-1;i<=1;i++)qflame(x+i*8,by-66,7,(20+12*Math.abs(Math.sin(tm*9+i*2)))*lit,i+1,i?'rgba(255,170,70,.9)':'rgba(255,224,150,.95)')}
  ctx.fillStyle='#241b2a';ctx.beginPath();ctx.moveTo(x-20,by-74);ctx.lineTo(x+20,by-74);ctx.lineTo(x+13,by-62);ctx.lineTo(x-13,by-62);ctx.closePath();ctx.fill();
  ctx.fillStyle=lit>0?'rgba(255,190,90,'+(.6+.3*lit)+')':'rgba(120,60,40,.6)';ctx.fillRect(x-17,by-76,34,3);
}
function bellAng(){if(R.bellAt==null)return 0;const a=R.time-R.bellAt;return (R.bellA||.3)*Math.exp(-a*.9)*Math.sin(a*5.2)}
function ringBell(amp,v){
  v=v==null?1:v;R.bellAt=R.time;R.bellA=amp;(R.bellW=R.bellW||[]).push(R.time);if(amp>.4)R.bellW.push(R.time+.35);
  tone(196,3.2,'sine',.16*v,0);tone(392,2.4,'sine',.08*v,0);tone(587,1.6,'triangle',.04*v,0);tone(784,1.1,'sine',.025*v,0);
}
function bellMouth(){const a=bellAng();return[BELL[0]-Math.sin(a)*112,BELL[1]+Math.cos(a)*112]}
function drawBelfry(){
  const [cx,py]=BELL,top=DECK-372;
  ctx.fillStyle='#2a2f4e';
  ctx.beginPath();ctx.moveTo(cx-118,DECK);ctx.lineTo(cx-118,py-34);ctx.quadraticCurveTo(cx,top-10,cx+118,py-34);ctx.lineTo(cx+118,DECK);ctx.lineTo(cx+86,DECK);ctx.lineTo(cx+86,py-20);ctx.quadraticCurveTo(cx,top+38,cx-86,py-20);ctx.lineTo(cx-86,DECK);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#3c4268';ctx.lineWidth=2;ctx.stroke();
  poly([[cx-140,py-58],[cx,top-56],[cx+140,py-58]],'#3c4268');
  ctx.fillStyle='rgba(240,246,255,.85)';ctx.beginPath();ctx.moveTo(cx-140,py-58);ctx.lineTo(cx,top-56);ctx.lineTo(cx+140,py-58);ctx.lineTo(cx+126,py-58);ctx.lineTo(cx,top-46);ctx.lineTo(cx-126,py-58);ctx.closePath();ctx.fill();
  ctx.fillStyle='#4a3626';ctx.fillRect(cx-90,py-12,180,10);
  const a=bellAng();
  ctx.save();ctx.translate(cx,py);ctx.rotate(a);
  ctx.fillStyle='#3a2a20';ctx.fillRect(-4,-4,8,18);
  const bg=ctx.createLinearGradient(-58,0,58,0);bg.addColorStop(0,'#7a5524');bg.addColorStop(.45,'#d9a24c');bg.addColorStop(1,'#6b4a1a');
  ctx.beginPath();ctx.moveTo(-26,14);ctx.quadraticCurveTo(-34,40,-40,80);ctx.quadraticCurveTo(-46,98,-60,108);ctx.lineTo(60,108);ctx.quadraticCurveTo(46,98,40,80);ctx.quadraticCurveTo(34,40,26,14);ctx.closePath();
  ctx.fillStyle=bg;ctx.fill();ctx.strokeStyle='#4a3010';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle='rgba(255,226,150,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-41,84);ctx.lineTo(41,84);ctx.moveTo(-36,62);ctx.lineTo(36,62);ctx.stroke();
  ctx.strokeStyle='#6b4a1a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,48,7,0,6.283);ctx.stroke();ctx.beginPath();ctx.moveTo(0,36);ctx.lineTo(0,40);ctx.stroke();
  ctx.fillStyle='#3a2a20';ctx.beginPath();ctx.arc(-Math.sin(-a*.6)*4,112,7,0,6.283);ctx.fill();
  ctx.restore();
}
function drawBellWaves(){
  if(!R.bellW)return;
  const m=bellMouth();
  R.bellW=R.bellW.filter(t0=>R.time-t0<2.2);
  ctx.save();
  for(const t0 of R.bellW){const u=(R.time-t0)/2.2;if(u<0)continue;
    ctx.strokeStyle='rgba(255,236,190,'+(.7*(1-u))+')';ctx.lineWidth=5*(1-u)+1;ctx.beginPath();ctx.ellipse(m[0],m[1]-50,30+620*u,20+380*u,0,0,6.283);ctx.stroke()}
  ctx.restore();
}
function r3Background(){
  const g=ctx.createLinearGradient(0,0,0,DECK);
  g.addColorStop(0,'#060a1a');g.addColorStop(.55,'#18204a');g.addColorStop(1,'#4b3a62');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,DECK);
  const tt=R.time;
  ctx.save();
  for(let k=0;k<2;k++){
    ctx.beginPath();ctx.moveTo(0,90+k*30);
    for(let x=0;x<=W;x+=30)ctx.lineTo(x,90+k*30+Math.sin(x*.012+tt*.4+k*2)*26);
    for(let x=W;x>=0;x-=30)ctx.lineTo(x,150+k*30+Math.sin(x*.01+tt*.35+k)*34);
    ctx.closePath();ctx.fillStyle=k?'rgba(120,220,200,.07)':'rgba(140,160,255,.07)';ctx.fill();
  }
  ctx.restore();
  for(const s of STARS){ctx.globalAlpha=.4+.5*Math.abs(Math.sin(tt*.8+s.p));ctx.fillStyle='#e8f0ff';ctx.fillRect(s.x,s.y,s.r,s.r)}
  ctx.globalAlpha=1;
  /* montagnes lointaines, très en contrebas : on est au sommet de la tour */
  ctx.fillStyle='#232c55';
  ctx.beginPath();[[0,340],[110,290],[210,322],[330,270],[440,318],[560,284],[690,326],[800,276],[900,312],[W,290],[W,DECK],[0,DECK]].forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(200,220,255,.45)';ctx.lineWidth=2;
  [[[330,270],[312,294],[326,286],[342,300]],[[800,276],[782,300],[796,292],[812,306]]].forEach(L=>{ctx.beginPath();L.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()});
  const fg=ctx.createLinearGradient(0,300,0,DECK);fg.addColorStop(0,'rgba(180,200,240,0)');fg.addColorStop(1,'rgba(180,200,240,.28)');
  ctx.fillStyle=fg;ctx.fillRect(0,300,W,DECK-300);
  /* tours de l'ordre, au loin, avec leur lanterne */
  TOWERS.forEach((T,i)=>{
    const [x,top,w]=T;ctx.fillStyle='#141a3a';ctx.fillRect(x-w/2,top,w,DECK-top);ctx.fillRect(x-w/2-3,top-6,w+6,6);
    poly([[x-w/2-4,top-6],[x,top-6-w*1.4],[x+w/2+4,top-6]],'#141a3a');
    const lit=R.towerAt&&R.towerAt[i]!=null?clamp01((R.time-R.towerAt[i])/.3):0,fl=lit?(1+1.4*Math.max(0,1-(R.time-R.towerAt[i])/1.4)):1;
    const lg=ctx.createRadialGradient(x,top+8,1,x,top+8,10+8*fl);lg.addColorStop(0,'rgba(255,215,130,'+(.55*fl)+')');lg.addColorStop(1,'rgba(255,200,110,0)');
    ctx.fillStyle=lg;ctx.beginPath();ctx.arc(x,top+8,10+8*fl,0,6.283);ctx.fill();
    ctx.fillStyle='#ffd27a';ctx.fillRect(x-2,top+5,4,6);
    if(lit&&R.time-R.towerAt[i]<1.6){const u=(R.time-R.towerAt[i])/1.6;ctx.strokeStyle='rgba(255,230,170,'+(1-u)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,top+8,8+50*u,0,6.283);ctx.stroke()}
  });
  drawBelfry();
  /* sol : dalles de la plateforme, couche de neige, créneaux aux bords */
  const gg=ctx.createLinearGradient(0,DECK,0,H);gg.addColorStop(0,'#b9c6de');gg.addColorStop(.12,'#6a7394');gg.addColorStop(1,'#2a2f4e');
  ctx.fillStyle=gg;ctx.fillRect(0,DECK,W,H-DECK);
  ctx.fillStyle='rgba(240,246,255,.92)';ctx.fillRect(0,DECK,W,5);
  ctx.strokeStyle='rgba(30,36,66,.55)';ctx.lineWidth=2;
  for(let r=0;r<4;r++){const y=DECK+22+r*32;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
    for(let x=(r%2)*60;x<W;x+=120){ctx.beginPath();ctx.moveTo(x,y-32+(r?0:10));ctx.lineTo(x,y);ctx.stroke()}}
  for(const side of [-1,1]){
    const x0=side<0?0:W-110;
    ctx.fillStyle='#3a3f5e';ctx.fillRect(x0,DECK-56,110,56);
    for(let i=0;i<3;i++){const mx=x0+(side<0?4+i*38:110-26-i*38);ctx.fillStyle='#3a3f5e';ctx.fillRect(mx,DECK-84,22,30);ctx.fillStyle='rgba(240,246,255,.9)';ctx.fillRect(mx,DECK-86,22,4)}
    ctx.fillStyle='rgba(240,246,255,.9)';ctx.fillRect(x0,DECK-58,110,3);
    ctx.strokeStyle='rgba(20,24,50,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x0,DECK-28);ctx.lineTo(x0+110,DECK-28);ctx.stroke();
  }
  drawFanal(150,DECK,R.fanalAt!=null?clamp01((R.time-R.fanalAt)/.6):0,R.time);

}
function r3Ground(){
  const bx=R.bx,pulse=.85+.15*Math.sin(R.time*2.1);
  const lg=ctx.createRadialGradient(bx,DECK,10,bx,DECK,300);
  lg.addColorStop(0,'rgba(255,130,40,'+(.55*pulse)+')');lg.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=lg;ctx.fillRect(0,DECK-120,W,H-DECK+120);
  const wet=Math.min(1,.35+R.parries*.08);
  ctx.fillStyle='rgba(30,50,90,'+(.5*wet)+')';
  ctx.beginPath();ctx.ellipse(bx,DECK+12,130+R.parries*6,14,0,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(255,140,50,'+(.25*pulse)+')';
  ctx.beginPath();ctx.ellipse(bx,DECK+10,90,9,0,0,6.283);ctx.fill();
  /* neige fondue à l'impact : une tache humide qui sèche et disparaît en quelques secondes */
  R.melts=R.melts.filter(m=>m.t<3.2);
  for(const m of R.melts){
    const u=Math.min(1,m.t/.5),f=1-clamp01((m.t-1.6)/1.6);
    ctx.fillStyle='rgba(40,48,80,'+(.45*u*f)+')';ctx.beginPath();ctx.ellipse(m.x,DECK+8,34*u+8,6*u+2,0,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(255,150,60,'+(.45*(1-u))+')';ctx.beginPath();ctx.ellipse(m.x,DECK+8,40*u,7*u,0,0,6.283);ctx.fill();
  }
}
function drawIce3(x,y,hot){
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(R.time*9+x)*.2);
  const g=ctx.createLinearGradient(-26,-30,26,30);g.addColorStop(0,'#eaf8ff');g.addColorStop(1,'#6fb4d8');
  qp([[-24,-6],[-12,-32],[16,-28],[28,-4],[14,26],[-14,28]],g,hot?'#ff7a2b':'#bfeaff',3);
  if(hot){ctx.shadowColor='#ff7a2b';ctx.shadowBlur=18;ctx.strokeStyle='rgba(255,200,100,.7)';ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;
    qflame(0,-26,10,34+8*Math.sin(R.time*10),1,'rgba(255,170,70,.9)');qflame(-14,-18,7,24,2,'rgba(255,110,40,.9)')}
  ctx.restore();
}
/* Seconde vie : aura de feu permanente autour du Colosse (plus intense à chaque rage) */
function drawAura3(o,t){
  const k=1+(R.u55?.4:R.u5?.2:0);
  ctx.save();
  const g=ctx.createRadialGradient(0,-170,20,0,-170,300*k);
  g.addColorStop(0,'rgba(255,170,70,'+(.32*k)+')');g.addColorStop(.55,'rgba(255,100,30,'+(.16*k)+')');g.addColorStop(1,'rgba(255,70,20,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-170,300*k,0,6.283);ctx.fill();
  const P=[[-110,-20],[-55,-20],[0,-20],[55,-20],[110,-20],[-130,-120],[130,-120],[-125,-230],[125,-230],[-90,-320],[90,-320]];
  P.forEach((p,i)=>{
    const f=.75+.25*Math.sin(t*9+i*1.7),h=(46+(i>6?20:34))*k*f;
    qflame(p[0],p[1],11,h,i,i%2?'rgba(255,196,90,.55)':'rgba(255,100,40,.55)');
  });
  ctx.restore();
  if(R.mode==='play'&&Math.random()<.45*k)R.sparks.push({x:o.x+rand(-120,120),y:DECK+o.dy-rand(20,330),vx:rand(-20,20),vy:-rand(50,130),g:-30,life:.9,max:.9,col:Math.random()<.5?'#ffb04a':'#ff7a2b',sz:rand(2,4)});
}
/* Fissures de braise là où la foudre l'a frappé (torse et épaule), qui palpitent doucement. */
function drawCracks3(wd,t){
  const pulse=.7+.3*Math.sin(t*5);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=10;
  [[[-14,-215],[-30,-190],[-18,-165],[-40,-135]],[[-30,-190],[-62,-184]],[[-18,-165],[6,-150],[0,-125]],[[-14,-215],[10,-228],[26,-218]]].forEach(pts=>{
    const n=Math.max(2,Math.ceil(pts.length*wd));
    ctx.strokeStyle='rgba(255,170,80,'+(.9*pulse*wd)+')';ctx.lineWidth=3;
    ctx.beginPath();pts.slice(0,n).forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  });
  ctx.restore();
}
function drawBoss3(){
  const o=bossPose3(),t=R.time;
  if(o.flip){ctx.save();ctx.translate(o.x,0);ctx.scale(-1,1);ctx.translate(-o.x,0)}
  ctx.save();ctx.translate(o.x,DECK+o.dy);
  ctx.save();ctx.rotate(o.lean);ctx.scale(.92,.92);
  const wf=Math.sin(t*1.8)*.03;
  const fire=o.warm>1.1||R.rage>0;
  if(R.healed&&R.mode!=='finale'&&R.boss.s!=='dead')drawAura3(o,t);
  if(R.atk&&R.atk.dbl&&R.atk.t<R.atk.hits[R.atk.hits.length-1].at+.05){ctx.save();ctx.fillStyle='rgba(255,176,74,'+(.85+.15*Math.sin(t*30))+')';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=14;ctx.font='900 54px '+DISPLAY;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!'.repeat(R.atk.tn||2),-170,-300);ctx.restore()}
  /* Seconde vie : la foudre l'a blessé, ses ailes sont rongées et pendent (l'aile droite plus abîmée) ; les blessures apparaissent en 0,8 s à l'impact. */
  const wd=R.healed&&R.mode!=='finale'?(R.wdAt==null?1:clamp01((R.time-R.wdAt)/.8)):(R.healed?1:0);
  for(const sd of [-1,1]){
    if((sd===-1&&R.cut>=1)||(sd===1&&R.cut>=2))continue;
    const hot=o.ws>1.05,dm=wd*(sd===1?1:.7),dr=.12*dm,sz=1-.06*dm;
    drawWing([sd*64,-222],-.85+wf+o.wa+dr,.8*o.ws*sz,hot?'#5a1a28':'#220a11',.34,fire,sd,dm);drawWing([sd*50,-232],-1.15+wf+o.wa+dr,1*o.ws*sz,hot?'#7a2230':'#35101a',.34,fire,sd,dm);
  }
  demonBody({t,hornCut:R.hornAt!=null,warm:o.warm,jaw:o.jaw,hurt:R.recoil>.3,wound:0,stow:o.sword?1-clamp01(o.sword.l/40):(o.nostow?0:1),hk:hookStep(R,(R.atk&&R.atk.kind==='whip')?1:0,R.time)});
  if(wd>0)drawCracks3(wd,t);
  ctx.restore();
  ctx.restore();
  /* La corne brisée par la foudre tombe au sol. */
  if(R.hornAt!=null&&R.mode!=='finale'){
    const u=R.time-R.hornAt;
    if(u>=0&&u<1.5){
      const x=R.hornX+106+110*u,y=DECK-330-170*u+1000*u*u;
      ctx.save();ctx.globalAlpha=clamp01((1.5-u)/.4);ctx.translate(Math.min(x,W-20),Math.min(y,DECK-4));ctx.rotate(Math.min(u,.9)*4.5);ctx.scale(.92,.92);ctx.translate(-115,345);
      qp([[100,-348],[134,-390],[124,-338],[98,-316],[104,-336]],'#3a2a3c','#5a4666',2);
      ctx.restore();
    }
  }
  const cl=Math.cos(o.lean),sl=Math.sin(o.lean);
  const sh=sd=>{const lx=sd*92,ly=-200;return[o.x+lx*cl-ly*sl,DECK+o.dy+lx*sl+ly*cl]};
  const hs=o.hands.map(h=>[h[0],h[1]+o.dy]);
  const sL=sh(-1),sR=sh(1);
  drawArm(sL,hs[0],78,-1);drawArm(sR,hs[1],78,1);
  ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;
  for(const h of hs){ctx.beginPath();ctx.arc(h[0],h[1],17,0,6.283);ctx.fill();ctx.stroke()}
  drawClaws(hs);
  drawBreathFx(o);
  drawWhipGlow(hs);
  if(o.sword){
    ctx.save();ctx.translate(o.sword.h[0],o.sword.h[1]+o.dy);ctx.rotate(o.sword.a);
    drawFireBlade(o.sword.l,o.sword.heat,t,11);
    ctx.restore();
    if(o.sword.chg){
      ctx.save();ctx.translate(o.sword.h[0],o.sword.h[1]+o.dy);ctx.rotate(o.sword.a);
      ctx.lineCap='round';ctx.beginPath();ctx.moveTo(o.sword.l-44,0);ctx.lineTo(o.sword.l,0);
      ctx.strokeStyle='rgba(255,176,74,'+(.25*o.sword.chg)+')';ctx.lineWidth=30+30*o.sword.chg;ctx.stroke();ctx.strokeStyle='rgba(255,235,170,'+(.55*o.sword.chg)+')';ctx.lineWidth=10+16*o.sword.chg;ctx.stroke();ctx.restore();
    }
    for(const h of hs){ctx.fillStyle='#2b2233';ctx.strokeStyle='#4a3a55';ctx.lineWidth=3;ctx.beginPath();ctx.arc(h[0],h[1],15,0,6.283);ctx.fill();ctx.stroke()}
  }
  if(o.flip)ctx.restore();
}
function drawBreathFx(o){
  const a=R.atk;if(!a||(a.kind!=='breath'&&!(a.cf!=null&&a.pt>=a.cf))||a.pt<0)return;
  const q=a.hq||a.cf!=null?aq(a,'breath',1.0):a.pt,k=es(clamp01(q/.6))*(1-es(clamp01((q-1.2)/.4)));
  faceFire(o.x-18,DECK+o.dy-238,k,q);
}
function faceFire(cx,cy,k,q){
  if(k<=0)return;
  const tm=R?R.time:Q?Q.time:G.time;
  ctx.save();
  const g=ctx.createRadialGradient(cx,cy,6,cx,cy,95);
  g.addColorStop(0,'rgba(255,230,150,'+(.5*k)+')');g.addColorStop(.5,'rgba(255,140,50,'+(.3*k)+')');g.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,95,0,6.283);ctx.fill();
  ctx.shadowColor='#ff7a2b';ctx.shadowBlur=16;
  for(let i=0;i<12;i++){
    const ang=i/12*6.283+tm*1.5,r=64+6*Math.sin(tm*7+i)-10*k*(q<.6?1:0),x=cx+Math.cos(ang)*r*1.05,y=cy+Math.sin(ang)*r*.9;
    ctx.save();ctx.translate(x,y);ctx.rotate(ang+1.5708);
    qflame(0,0,5+3*k,(12+18*k)*(.8+.2*Math.sin(tm*14+i)),i,i%2?'rgba(255,200,90,.9)':'rgba(255,100,40,.9)');
    ctx.restore();
  }
  if(q<.7)for(let i=0;i<9;i++){
    const u=((tm*2.2+i/9)%1),ang=i*2.4+tm,r=130*(1-u),x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r*.8;
    ctx.fillStyle='rgba(255,210,120,'+(.8*u*k)+')';ctx.fillRect(x-2,y-2,4,4);
  }
  ctx.restore();
}
function drawWhipGlow(hs){
  const a=R.atk;if(!a||a.kind!=='whip'||a.pt<0||(a.cf!=null&&a.pt>=a.cf))return;
  const wq=DIFF.hard?aq(a,'whip',.75):a.pt;
  const k=es(clamp01(wq/.55))*(1-es(clamp01((wq-.8)/.4)));
  if(k<=0)return;
  const h=hs[0];
  ctx.save();
  const g=ctx.createRadialGradient(h[0],h[1],2,h[0],h[1],46);
  g.addColorStop(0,'rgba(255,240,190,'+(.85*k)+')');g.addColorStop(.45,'rgba(255,150,50,'+(.55*k)+')');g.addColorStop(1,'rgba(255,100,30,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(h[0],h[1],46,0,6.283);ctx.fill();
  ctx.shadowColor='#ffc15a';ctx.shadowBlur=22*k;ctx.fillStyle='rgba(255,176,74,'+(.9*k)+')';
  ctx.beginPath();ctx.arc(h[0],h[1],15,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(255,243,207,'+k+')';ctx.beginPath();ctx.arc(h[0],h[1],8,0,6.283);ctx.fill();
  ctx.restore();
}
function drawClaws(hs){
  const a=R.atk;if(!a||a.kind!=='claws')return;
  const c=a.hits.filter(h=>h.k==='claw'),t0=c[0].at-.95,t1=c[c.length-1].at+.35;
  const ext=es(clamp01((a.t-t0)/.3))*(1-es(clamp01((a.t-t1)/.3)));
  if(ext<=0)return;
  hs.forEach(h=>{
    ctx.save();ctx.translate(h[0],h[1]);
    ctx.shadowColor='#ff9a3c';ctx.shadowBlur=14;
    for(let i=-2;i<=2;i++){
      const ang=Math.PI+.2+i*.3,L=(56-Math.abs(i)*6)*ext,bx=Math.cos(ang)*12,by=Math.sin(ang)*12;
      const tx=Math.cos(ang)*(12+L),ty=Math.sin(ang)*(12+L)+L*.18,nx=-Math.sin(ang)*5,ny=Math.cos(ang)*5;
      const g=ctx.createLinearGradient(bx,by,tx,ty);g.addColorStop(0,'#3a2d44');g.addColorStop(.45,'#ffb04a');g.addColorStop(1,'#fff3cf');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx+nx,by+ny);ctx.quadraticCurveTo((bx+tx)/2+nx*.4,(by+ty)/2-4,tx,ty);ctx.quadraticCurveTo((bx+tx)/2-nx*.4,(by+ty)/2+6,bx-nx,by-ny);ctx.closePath();ctx.fill();
    }
    ctx.restore();
  });
}
function drawHero3(){
  const p=R.pl,h=heroPose3(),t=R.time;
  const hf=heroFlip();if(hf){ctx.save();ctx.translate(h.x,0);ctx.scale(-1,1);ctx.translate(-h.x,0)}
  if(!h.y)ctx.fillStyle='rgba(0,0,0,.35)',ctx.beginPath(),ctx.ellipse(h.x,DECK+2,30,5,0,0,6.283),ctx.fill();
  ctx.save();ctx.translate(h.x,DECK+(h.y||0));ctx.rotate(h.rot);ctx.scale(1,h.sy);
  drawWizard({fl:0});
  qlimb([23,-78],h.hand,9,'#2a3550');ctx.fillStyle='#2a3550';ctx.beginPath();ctx.arc(23,-78,6.5,0,6.283);ctx.fill();
  ctx.save();ctx.translate(h.hand[0],h.hand[1]);ctx.rotate(h.sa);
  const c3=R.cn,hk3=c3&&(c3.k==='bat'||c3.k==='plant')?Math.max(0,1-Math.abs(c3.t-(c3.k==='bat'?.24:.32))/.16):0;
  drawScepter(76,p.s==='guard'?1:Math.max(.3,h.glow||0,hk3),p.s==='recover'?'#c9a85a':(p.s==='guard'||h.glow>0||hk3>0)?'#fff4d6':'#ffd27a');
  if(hk3>0){ctx.save();ctx.globalCompositeOperation='lighter';lanternBeam([84,0],[84+48*hk3,0],14,hk3);ctx.restore()}
  ctx.restore();
  ctx.fillStyle='#cdb69a';ctx.beginPath();ctx.arc(h.hand[0],h.hand[1],5,0,6.283);ctx.fill();
  ctx.restore();
  if(p.s==='guard'){
    const a=1-.45*p.t/R_T.guard,ramp=clamp01(p.t/.07),cx=PX+82,cy=DECK-76,rx=34*(.6+.4*ramp),ry=92*(.8+.2*ramp);
    ctx.save();ctx.globalAlpha=a*ramp;
    const g=ctx.createRadialGradient(cx-18,cy,6,cx,cy,ry);
    g.addColorStop(0,'rgba(111,211,255,.06)');g.addColorStop(.7,'rgba(111,211,255,.2)');g.addColorStop(1,'rgba(191,234,255,.5)');
    ctx.fillStyle=g;ctx.shadowColor='#6fd3ff';ctx.shadowBlur=24;
    ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,6.283);ctx.fill();
    ctx.restore();
  }
  if(hf)ctx.restore();
}
function drawBombs(a){
  const off=a.off||0,q=a.t-off;let i=0;
  for(const h of a.hits){
    if(h.k!=='bomb')continue;
    const k=i++,L=bombL(k),P=bombPos(k),d=a.t-h.at;
    if(d>=0){
      if(d<.45){
        const f=1-d/.45;
        ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
        const rr=30+110*(1-f),g=ctx.createRadialGradient(P[0],P[1],4,P[0],P[1],rr);
        g.addColorStop(0,'rgba(255,240,190,'+(.7*f)+')');g.addColorStop(1,'rgba(255,100,30,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(P[0],P[1],rr,0,6.283);ctx.fill();
        for(let j=0;j<5;j++)qflame(P[0]+(j-2)*13,DECK+4,15,(160-Math.abs(j-2)*28)*f,j,j%2?'rgba(255,196,90,.95)':'rgba(255,100,40,.95)');
        ctx.restore();
      }
      continue;
    }
    if(q<L-.55)continue;
    let y=P[1];
    if(q<L){const u=(q-(L-.55))/.55;y=-60+(P[1]+60)*ei(u)}
    drawIce3(P[0],y,true);
    if(d>-.7){ /* clignotement d'annonce : plus tôt, plus fort, de plus en plus rapide */
      const u=1+d/.7,pl=.5+.5*Math.sin(R.time*(30+30*u)),rr=40+60*u;
      const g=ctx.createRadialGradient(P[0],y,2,P[0],y,rr);
      g.addColorStop(0,'rgba(255,245,210,'+Math.min(1,.35+.65*u*pl)+')');g.addColorStop(1,'rgba(255,120,40,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(P[0],y,rr,0,6.283);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,'+(.6*u*pl)+')';ctx.beginPath();ctx.arc(P[0],y,26,0,6.283);ctx.fill();
    }
  }
}
function drawHits3a(){
  const a=R.atk;if(!a)return;
  if(a.h&&a.kind==='avalanche'){drawBombs(a);return}
  if(a.kind==='avalanche'){
    let ii=0;
    a.hits.forEach(h=>{
      if(h.k!=='ice')return;
      const i=ii++,d=a.t-h.at;
      if(d<-.55||d>0)return;
      const u=(d+.55)/.55,x=PX+104+(i%3)*14,y=-60+(GUARD[1]+10+60)*ei(u);
      drawIce3(x,y,true);
    });
  }else if(a.kind==='charge'){
    for(const h of a.hits){
      const d=a.t-h.at;
      if(h.k==='stomp'&&d>-.3&&d<.35){
        const mir=!!a.h,foot=mir?R.bx+62:R.bx-62,tgt=mir?PX+10:GUARD[0],u=clamp01((d+.3)/.3),fr=foot+(tgt-foot)*u;
        ctx.save();ctx.shadowColor='#ff9a3c';ctx.shadowBlur=14;
        for(let i=0;i<10;i++){
          const x=mir?fr-i*14:fr+i*14;if(mir?x<foot:x>foot)continue;
          const hh=(30-i*2)*(d<0?1:clamp01(1-d/.35));if(hh<=0)continue;
          ctx.fillStyle='rgba(255,'+(190-i*8)+',110,'+(.95-i*.07)+')';
          ctx.beginPath();ctx.moveTo(x-6,DECK+2);ctx.lineTo(x,DECK-hh);ctx.lineTo(x+6,DECK+2);ctx.closePath();ctx.fill();
        }
        ctx.restore();
      }else if(h.k==='geyser'&&d>-.5&&d<.45){
        const x=PX+20;
        if(d<0){
          const u=1+d/.5;
          ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=16;
          ctx.fillStyle='rgba(255,140,50,'+(.25+.5*u)+')';ctx.beginPath();ctx.ellipse(x,DECK+8,20+34*u,5+5*u,0,0,6.283);ctx.fill();
          ctx.strokeStyle='rgba(255,210,120,'+(.4+.5*u)+')';ctx.lineWidth=2.5;
          for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x+i*14,DECK+4);ctx.lineTo(x+i*22,DECK+10+Math.abs(i)*3);ctx.stroke()}
          ctx.restore();
        }else{
          const k=1-d/.45;
          ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
          for(let i=0;i<7;i++){
            const ox=(i-3)*9;
            qflame(x+ox,DECK+4,14-Math.abs(i-3)*1.5,(190-Math.abs(i-3)*28)*k*(.8+.2*Math.sin(R.time*30+i)),i,i%2?'rgba(255,196,90,.95)':'rgba(255,100,40,.95)');
          }
          ctx.restore();
        }
      }
    }
  }
}
/* Contre « lumière » (grêle, griffes, pierres, cri) : le Veilleur n'a plus de batte, il utilise sa lanterne. A : nova de lumière, B : volée d'éclats, C : cloche de la lanterne */
function batFx(c){
  const t=c.t,V='B',h=heroPose3(),x=heroX3();
  const L=[x+h.hand[0]+Math.cos(h.sa)*76,DECK+(h.hand[1]+Math.sin(h.sa)*76)*h.sy],G=[R.bx-40,DECK-190];
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(V==='A'&&t>=.2&&t<.8){
    const u=clamp01((t-.2)/.47),r=30+(G[0]-L[0]+30)*es(u),al=(t<.67?1:1-(t-.67)/.13)*.8;
    const rg=ctx.createRadialGradient(L[0],L[1],r*.4,L[0],L[1],r);rg.addColorStop(0,'rgba(111,211,255,0)');rg.addColorStop(.85,'rgba(111,211,255,'+.1*al+')');rg.addColorStop(1,'rgba(235,250,255,'+.7*al+')');
    ctx.fillStyle=rg;ctx.beginPath();ctx.arc(L[0],L[1],r,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,'+al+')';ctx.lineWidth=7*(1-u*.5)+2;ctx.shadowColor='#6fd3ff';ctx.shadowBlur=22;ctx.beginPath();ctx.arc(L[0],L[1],r,0,6.283);ctx.stroke();
  }else if(V==='B'){
    for(let i=0;i<5;i++){
      const u=clamp01((t-.16-i*.08)/.3);if(u<=0||u>=1)continue;
      const off=(i-2)*46,q=lerp2(L,[G[0]+(i%2?10:-10),G[1]+(i-2)*14],es(u));q[1]-=off*Math.sin(Math.PI*u)*.9;
      for(let k=5;k>=0;k--){const uu=Math.max(0,u-k*.035),tp=lerp2(L,[G[0]+(i%2?10:-10),G[1]+(i-2)*14],es(uu));tp[1]-=off*Math.sin(Math.PI*uu)*.9;
        ctx.fillStyle='rgba('+(k?'150,220,255':'255,255,255')+','+(.8-k*.12)+')';ctx.beginPath();ctx.arc(tp[0],tp[1],7-k*.8,0,6.283);ctx.fill()}
    }
  }else if(V==='C'){
    for(let i=0;i<3;i++){
      const u=clamp01((t-.2-i*.09)/.4);if(u<=0||u>=1)continue;
      const cx=L[0]+(G[0]-L[0])*es(u),cy=L[1]+(G[1]-L[1])*es(u),r=34+36*u;
      ctx.strokeStyle='rgba(235,250,255,'+(1-u*.5)+')';ctx.lineWidth=9*(1-u*.4)+2;ctx.shadowColor='#6fd3ff';ctx.shadowBlur=18;
      ctx.beginPath();ctx.arc(cx-r*.5,cy,r,-.95,.95);ctx.stroke();
    }
  }
  ctx.restore();
}
/* Contre de la cloche : la clochette de la lanterne sonne, la grande cloche du Clocher lui répond, et l'écho étourdit le Colosse */
function bellFx(c){
  const t=c.t,h=heroPose3(),x=heroX3();
  const L=[x+h.hand[0]+Math.cos(h.sa)*76+12,DECK+(h.hand[1]+Math.sin(h.sa)*76)*h.sy+20],B=[BELL[0],BELL[1]+40],G=[R.bx-40,DECK-190];
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowColor='#6fd3ff';
  /* 1) la clochette : ondes qui montent vers la grande cloche */
  for(let i=0;i<3;i++){
    const u=clamp01((t-.12-i*.08)/.4);if(u<=0||u>=1)continue;
    const cx=L[0]+(B[0]-L[0])*es(u),cy=L[1]+(B[1]-L[1])*es(u),r=18+22*u,al=1-u*.6;
    ctx.strokeStyle='rgba(235,250,255,'+al+')';ctx.lineWidth=6*(1-u*.4)+1;ctx.shadowBlur=14;
    ctx.beginPath();ctx.arc(cx,cy,r,0,6.283);ctx.stroke();
  }
  /* 2) la grande cloche répond : écho qui part du Clocher et traverse l'arène jusqu'au Colosse */
  if(t>=.5){
    for(let i=0;i<4;i++){
      const u=clamp01((t-.5-i*.07)/.4);if(u<=0||u>=1)continue;
      const cx=B[0]+(G[0]-B[0]+40)*es(u),r=50+120*u,al=(1-u*.55)*(i?.7:1);
      ctx.strokeStyle='rgba(235,250,255,'+al+')';ctx.lineWidth=8*(1-u*.5)+1;ctx.shadowBlur=20;
      ctx.beginPath();ctx.arc(cx-r*.6,B[1]+(G[1]-B[1])*es(u),r,-.8,.8);ctx.stroke();
    }
  }
  ctx.restore();
}
/* Colosse étourdi : trois étoiles tournent au-dessus de sa tête */
function drawDizzy(){
  if(!R||!R.dizzy||R.dizzy<=R.time)return;
  const k=Math.min(1,(R.dizzy-R.time)/.3),x=R.bx-20,y=DECK-382;
  ctx.save();ctx.globalAlpha=k;ctx.shadowColor='#ffd27a';ctx.shadowBlur=10;
  for(let i=0;i<3;i++){const a=R.time*5+i*2.094,px=x+Math.cos(a)*52,py=y+Math.sin(a)*12;
    ctx.fillStyle=i%2?'#ffe9a8':'#bfeaff';ctx.beginPath();
    for(let j=0;j<8;j++){const rr=j%2?4:10,aa=j*Math.PI/4;ctx.lineTo(px+Math.cos(aa)*rr,py+Math.sin(aa)*rr)}ctx.closePath();ctx.fill()}
  ctx.restore();
}
function drawCn3a(){
  const c=R.cn;if(!c)return;
  const t=c.t;
  if(c.k==='slide'&&t>=.22&&t<.5){const h=heroPose3(),x=heroX3(),L=[x+h.hand[0]+Math.cos(h.sa)*76,DECK+(h.hand[1]+Math.sin(h.sa)*76)*h.sy],al=t<.35?(t-.22)/.13:1-(t-.35)/.15;lanternBeam(L,[R.bx-62,DECK-58],14,al)}
  if(c.k==='plant'&&t>=.3){
    const x0=PX+105,x1=R.bx-60,fr=x0+(x1-x0)*es(clamp01((t-.3)/.5));
    ctx.save();ctx.shadowColor='#bfeaff';ctx.shadowBlur=16;
    for(let i=0;i<12;i++){
      const x=fr-i*16;if(x<x0)continue;
      const h=(34-i*2.2)*(t<.8?1:clamp01(1-(t-.8)/.3));if(h<=0)continue;
      ctx.fillStyle='rgba(235,250,255,'+(.95-i*.06)+')';
      ctx.beginPath();ctx.moveTo(x-6,DECK+2);ctx.lineTo(x,DECK-h);ctx.lineTo(x+6,DECK+2);ctx.closePath();ctx.fill();
    }
    ctx.strokeStyle='rgba(235,250,255,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0,DECK+3);ctx.lineTo(fr,DECK+3);ctx.stroke();
    ctx.restore();
  }else if(c.k==='bat'){batFx(c)}
  else if(c.k==='bell'){bellFx(c)}
}
function drawHits3(){drawHits3a();drawHitsX();drawDizzy()}
/* Coup de queue (rage) : une queue enflammée se dresse derrière le Colosse, passe au-dessus de lui et frappe le sol devant le Veilleur */
function drawTail(h,d){
  if(d<-.65||d>.4)return;
  const bp=bossPose3(),cl=Math.cos(bp.lean||0),sl=Math.sin(bp.lean||0),root=[bp.x+55*cl+105*sl,DECK+(bp.dy||0)+55*sl-105*cl],rest=[R.bx+150,DECK-30],Pw=[R.bx+110,DECK-430],C=[R.bx-70,DECK-500],Pg=[GUARD[0]+10,DECK-8];
  let tip;
  if(d<-.2){tip=lerp2(rest,Pw,es(clamp01((d+.65)/.45)))}
  else if(d<0){const u=ei((d+.2)/.2),m=1-u;tip=[m*m*Pw[0]+2*m*u*C[0]+u*u*Pg[0],m*m*Pw[1]+2*m*u*C[1]+u*u*Pg[1]]}
  else tip=Pg;
  if(d>-.22&&!h.sw){h.sw=true;tone(200,.2,'sawtooth',.06,-160)}
  const fade=d<.15?1:clamp01(1-(d-.15)/.25),arc=d<-.2?70:d<0?-20:10;
  const mid=[(root[0]+tip[0])/2,(root[1]+tip[1])/2-arc-Math.abs(tip[0]-root[0])*.12];
  const pt=u=>{const m=1-u;return[m*m*root[0]+2*m*u*mid[0]+u*u*tip[0],m*m*root[1]+2*m*u*mid[1]+u*u*tip[1]]};
  ctx.save();ctx.globalAlpha=fade;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.shadowColor='#ff7a2b';ctx.shadowBlur=12;
  for(let i=0;i<20;i++){
    const u0=i/20,u1=(i+1)/20,a=pt(u0),b=pt(u1),w=36*(1-u0)+7;
    ctx.strokeStyle='#2b2233';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    ctx.strokeStyle='rgba(255,140,50,'+(.35+.5*u0)+')';ctx.lineWidth=Math.max(2,w*.35);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    if(i%3===1){ctx.fillStyle='#4a3a55';ctx.beginPath();ctx.moveTo(a[0]-w*.3,a[1]-w*.4);ctx.lineTo(a[0]-w*.1,a[1]-w*1.1);ctx.lineTo(a[0]+w*.4,a[1]-w*.4);ctx.closePath();ctx.fill()}
  }
  qflame(tip[0],tip[1]+8,12,46,2,'rgba(255,190,90,.9)');qflame(tip[0]+6,tip[1]+8,8,34,5,'rgba(255,100,40,.9)');
  ctx.restore();
}
function drawHitsX(){
  const a=R.atk;if(!a)return;
  let ri=0;
  for(const h of a.hits){
    const d=a.t-h.at;
    if(h.k==='wave')flameRow(R.bx-70,d,.5,.4,1);
    else if(h.k==='blast'){
      const gsh=a.h&&a.kind==='greatsword'&&!h.flap&&!h.pre,tl=!!h.flap;
      if(tl)drawTail(h,d);
      if(!gsh&&!tl)flameRow(R.bx-60,d,.6,.45,1.7);
      if(gsh&&d>-.25&&d<.45){
        const tx=R.bx-247,ty=DECK-6,e=clamp01((d+.25)/.7),rr=24+190*e,al=d<0?.45:.85*(1-d/.45);
        const g=ctx.createRadialGradient(tx,ty,4,tx,ty,rr);
        g.addColorStop(0,'rgba(255,245,210,'+al+')');g.addColorStop(.5,'rgba(255,150,60,'+(al*.7)+')');g.addColorStop(1,'rgba(255,90,30,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(tx,ty,rr,0,6.283);ctx.fill();
      }
      if(!gsh&&!tl&&d>-.6&&d<0){
        const u=1+d/.6,rr=60+190*u,g=ctx.createRadialGradient(R.bx-40,DECK-140,4,R.bx-40,DECK-140,rr);
        g.addColorStop(0,'rgba(255,230,150,'+(.55*u)+')');g.addColorStop(1,'rgba(255,100,30,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(R.bx-40,DECK-140,rr,0,6.283);ctx.fill();
      }
      if(d>=0&&d<.4){
        const f=1-d/.4;ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=24;
        for(let i=-3;i<=3;i++)qflame(GUARD[0]+i*18,DECK+4,16,(150-Math.abs(i)*22)*f,i+3,i%2?'rgba(255,196,90,.95)':'rgba(255,100,40,.95)');
        ctx.restore();
      }
    }else if(h.k==='whip'&&d>-.8&&d<=-.22&&R.atk){
      /* la chaîne se déroule dans sa main au même rythme que sur son torse */
      const hv=es(R.hv||0),H0=bossPose3().hands[0].slice(),e=[H0[0]-6*hv,H0[1]+78*hv],pts=[];
      if(hv>.03){for(let i=0;i<=12;i++){const k=i/12,p=lerp2(H0,e,k);p[0]+=Math.sin(k*Math.PI)*-10*hv;pts.push(p)}
        drawHookChain(pts,.5)}
    }else if(h.k==='whip'&&d>-.22&&d<1.0){
      const H0=d<0?[R.bx-196,DECK-236]:bossPose3().hands[0].slice(),wr=h.done&&h.ok===false;
      if(h.done&&!wr&&d>.35)continue;
      if(d>=0&&!wr&&h.done===false)continue;
      const lx=heroX3()+8,leg=[lx,DECK-18],tg=[PX+8,DECK-18];
      let e;
      if(d<0)e=lerp2(H0,tg,es(clamp01((d+.22)/.22)));
      else if(wr)e=leg;
      else e=lerp2(tg,H0,es(clamp01(d/.3)));
      ctx.save();
      const sag=wr?-8:-26*(d<0?1-es(clamp01((d+.22)/.22))*.8:1),pts=[];
      for(let i=0;i<=16;i++){const k=i/16,p=lerp2(H0,e,k);p[1]+=sag*Math.sin(k*Math.PI)+Math.sin(k*6+R.time*14)*1.5;pts.push(p)}
      drawHookChain(pts,.6);
      if(wr){
        const u=es(clamp01(d/.15));
        ctx.strokeStyle='#241b2a';ctx.lineWidth=5;
        for(let c=0;c<4;c++){const y=DECK-8-c*11*u;ctx.beginPath();ctx.ellipse(lx,y,14,4,0,0,6.283);ctx.stroke()}
        ctx.strokeStyle='#7a6a82';ctx.lineWidth=1.6;ctx.setLineDash([6,5]);
        for(let c=0;c<4;c++){const y=DECK-8-c*11*u;ctx.beginPath();ctx.ellipse(lx,y,14,4,0,0,6.283);ctx.stroke()}
        ctx.setLineDash([]);
      }
      ctx.restore();
    }else if(h.k==='breath'&&d>-.17&&d<.5){
      const M=[R.bx-30,DECK-228],tg=[GUARD[0]+10,GUARD[1]],ext=d<0?es((d+.17)/.17):1,fade=d<.2?1:clamp01(1-(d-.2)/.3);
      ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=22;ctx.globalAlpha=fade;
      for(let i=0;i<14;i++){
        const k=i/13*ext,p=lerp2(M,tg,k),w=10+26*k;
        ctx.fillStyle=i%2?'rgba(255,200,90,.55)':'rgba(255,110,40,.55)';ctx.beginPath();ctx.arc(p[0],p[1],w*.8,0,6.283);ctx.fill();
        qflame(p[0],p[1]+w*.3,w,34+30*k,i,i%2?'rgba(255,200,90,.9)':'rgba(255,100,40,.9)');
      }
      ctx.restore();
    }else if(h.k==='claw'&&d>=0&&d<.35){
      const f=1-d/.35;
      ctx.save();ctx.lineCap='round';ctx.shadowColor='#ffc15a';ctx.shadowBlur=14;ctx.strokeStyle='rgba(255,215,130,'+f+')';ctx.lineWidth=6*f+1;
      for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(GUARD[0]+10+i*20,GUARD[1]-70);ctx.lineTo(GUARD[0]-40+i*20,GUARD[1]+66);ctx.stroke()}
      ctx.restore();
    }else if(h.k==='fire'&&d>-.7&&d<.1){
      const M=[R.bx-30,DECK-228],tg=[GUARD[0]+10,GUARD[1]],u=clamp01((d+.45)/.45);
      ctx.save();ctx.shadowColor='#ff7a2b';ctx.shadowBlur=22;
      if(d<-.45){const k=(d+.7)/.25;const g=ctx.createRadialGradient(M[0],M[1],2,M[0],M[1],40*k);g.addColorStop(0,'rgba(255,235,170,.9)');g.addColorStop(1,'rgba(255,100,30,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(M[0],M[1],40*k,0,6.283);ctx.fill()}
      else{
        const p=lerp2(M,tg,es(u));
        for(let i=5;i>=1;i--){const pp=lerp2(M,tg,es(Math.max(0,u-i*.06)));ctx.fillStyle='rgba(255,140,50,'+(.5-i*.08)+')';ctx.beginPath();ctx.arc(pp[0],pp[1],22-i*2.5,0,6.283);ctx.fill()}
        const g=ctx.createRadialGradient(p[0],p[1],2,p[0],p[1],28);g.addColorStop(0,'#fff6d0');g.addColorStop(.45,'#ffb04a');g.addColorStop(1,'rgba(255,90,30,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(p[0],p[1],28,0,6.283);ctx.fill();
      }
      ctx.restore();
    }else if(h.k==='fall'&&d>-.9&&d<.15){
      const gx=heroFlip()?PX-116:GUARD[0],y0=-50,y1=GUARD[1]-18;
      ctx.save();
      if(d<0){const w=clamp01((d+.9)/.5);ctx.fillStyle='rgba(255,120,50,'+(.15+.25*w)+')';ctx.beginPath();ctx.ellipse(gx,DECK+3,14+16*w,4,0,0,6.283);ctx.fill()}
      if(d>-.6&&d<.08){const u=clamp01((d+.6)/.6),y=y0+(y1-y0)*u*u;qrock(gx,y,26,R.time*6,true)}
      ctx.restore();
    }else if(h.k==='rock'){
      const idx=(ri%2===0)?1:0;ri++;
      if(d>=-.95&&d<-.45){const u=es(clamp01((d+.95)/.35));qrock(R.bx+(idx?40:-40),DECK-375,10+16*u,R.time*3,true)}
      else if(d>=-.45&&d<.05){
        const u=clamp01((d+.45)/.45),p0=[R.bx-190,DECK-250],p1=[GUARD[0]+20,GUARD[1]],q=lerp2(p0,p1,u);q[1]-=70*Math.sin(Math.PI*u);
        qrock(q[0],q[1],26,R.time*10,true);
      }
    }
  }
}
function drawCn3(){drawCn3a();drawBoltCn()}
function drawBoltCn(){
  const c=R.cn;if(!c||c.k!=='bolt')return;
  const t=c.t,tip=[PX+72,DECK-154],sky=[BELL[0],BELL[1]+60];
  if(t>=.55){
    const k=Math.min(1,(t-.55)/.45)*(t<1.35?1:Math.max(0,1-(t-1.35)/.5));
    ctx.fillStyle='rgba(8,12,40,'+(.5*k)+')';ctx.fillRect(0,0,W,DECK);
    const g=ctx.createRadialGradient(R.bx-20,10,6,R.bx-20,10,170);g.addColorStop(0,'rgba(220,240,255,'+(.9*k)+')');g.addColorStop(1,'rgba(111,211,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(R.bx-20,10,170,0,6.283);ctx.fill();
  }
  if(t>=.25&&t<1.35){
    const al=t<1.0?clamp01((t-.25)/.15):clamp01(1-(t-1.0)/.35),u=es(clamp01((t-.25)/.35)),e=lerp2(tip,sky,u);
    ctx.save();ctx.globalAlpha=al;ctx.shadowColor='#bfeaff';ctx.shadowBlur=26;ctx.lineCap='round';
    ctx.strokeStyle='rgba(111,211,255,.4)';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(e[0],e[1]);ctx.stroke();
    ctx.strokeStyle='rgba(235,250,255,.95)';ctx.lineWidth=6;ctx.stroke();
    ctx.restore();
  }
  /* l'éclair reste franc et bien lisible un moment, puis s'efface vite */
  if(t>=1.0&&t<1.7)drawBolt(R.bx-20,-10,DECK-250,t<1.4?1:1-(t-1.4)/.3,true);
}
/* Fin : depuis le Clocher, la mer de nuit. Au large, le Phare Noyé, à demi englouti, ne répond pas. Lien vers Silent Bells. */
function renderSpace(){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const tt=R.time,st=R.st,HZ=318;
  const g=ctx.createLinearGradient(0,0,0,HZ);g.addColorStop(0,'#03050f');g.addColorStop(.7,'#0c1430');g.addColorStop(1,'#1c2a4a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,HZ);
  for(const s of SPSTARS){if(s.y>HZ)continue;ctx.globalAlpha=.3+.6*Math.abs(Math.sin(tt*.7+s.p));ctx.fillStyle='#f2f6ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r*.8,0,6.283);ctx.fill()}
  ctx.globalAlpha=1;
  const mg=ctx.createRadialGradient(200,90,4,200,90,90);mg.addColorStop(0,'rgba(235,240,255,.9)');mg.addColorStop(.25,'rgba(235,240,255,.25)');mg.addColorStop(1,'rgba(235,240,255,0)');
  ctx.fillStyle=mg;ctx.fillRect(110,0,180,180);ctx.fillStyle='#eef2ff';ctx.beginPath();ctx.arc(200,90,18,0,6.283);ctx.fill();
  /* mer */
  const sg=ctx.createLinearGradient(0,HZ,0,H);sg.addColorStop(0,'#16223e');sg.addColorStop(1,'#04070f');
  ctx.fillStyle=sg;ctx.fillRect(0,HZ,W,H-HZ);
  ctx.strokeStyle='rgba(200,215,255,.10)';ctx.lineWidth=1.5;
  for(let i=0;i<14;i++){const y=HZ+8+i*i*1.3,o=(tt*(8+i*2)+i*97)%W;ctx.beginPath();ctx.moveTo(o-200,y);ctx.lineTo(o-200+60+i*8,y);ctx.moveTo(o+180,y);ctx.lineTo(o+180+40+i*6,y);ctx.stroke()}
  ctx.fillStyle='rgba(235,240,255,.08)';for(let i=0;i<8;i++){ctx.fillRect(196-6+Math.sin(tt*2+i)*6,HZ+10+i*14,12+i*2,2)}
  /* le Phare Noyé, au large : tour inclinée, à demi sous l'eau */
  const lx=704,ly=HZ+6;
  ctx.save();ctx.translate(lx,ly);ctx.rotate(.14);ctx.scale(1.7,1.7);
  ctx.fillStyle='#0b1022';ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-7,-62);ctx.lineTo(7,-62);ctx.lineTo(11,0);ctx.closePath();ctx.fill();
  ctx.fillRect(-10,-70,20,8);ctx.beginPath();ctx.moveTo(-9,-70);ctx.lineTo(0,-82);ctx.lineTo(9,-70);ctx.closePath();ctx.fill();
  const on=st>2.2?(Math.sin(tt*2.3)>-.2?1:0)*(Math.random()<.04?0:1)*(.35+.25*Math.sin(tt*1.7)):0;
  if(on>0){const bg=ctx.createRadialGradient(0,-66,1,0,-66,46);bg.addColorStop(0,'rgba(140,255,230,'+(.8*on)+')');bg.addColorStop(1,'rgba(80,200,220,0)');ctx.fillStyle=bg;ctx.beginPath();ctx.arc(0,-66,46,0,6.283);ctx.fill()}
  ctx.fillStyle=on>0?'rgba(170,255,235,'+(.5+on)+')':'#1a2440';ctx.fillRect(-4,-69,8,6);
  ctx.restore();
  ctx.fillStyle='rgba(22,34,62,.9)';ctx.fillRect(lx-30,ly,60,4);
  if(st>2.2){const al=.5*(.5+.5*Math.sin(tt*2.3));ctx.fillStyle='rgba(140,255,230,'+(.12*al)+')';ctx.fillRect(lx-6,ly+4,14,80)}
  /* premier plan : le parapet du Clocher, la lanterne posée qui veille */
  ctx.fillStyle='#2a2f4e';ctx.fillRect(0,H-90,W,90);
  for(let x=0;x<W;x+=120){ctx.fillRect(x+20,H-128,64,40)}
  ctx.fillStyle='rgba(10,14,34,.5)';for(let x=0;x<W;x+=60)ctx.fillRect(x,H-60,2,60);ctx.fillRect(0,H-60,W,2)
  ctx.fillStyle='rgba(235,243,255,.75)';for(let x=0;x<W;x+=120){ctx.fillRect(x+20,H-131,64,4)}ctx.fillRect(0,H-92,W,3);
  drawFanal(292,H-128,1,tt);
  /* l'appel de la cloche part du Clocher... et se perd vers le large */
  const cyc=(st%4.5)/4.5;
  if(st<9){ctx.strokeStyle='rgba(255,236,190,'+(.35*(1-cyc))+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(292,H-140,40+700*cyc,14+160*cyc,0,Math.PI,2*Math.PI);ctx.stroke()}
  ctx.drawImage(vig,0,0,W,H);
  const f=1-clamp01(st/1.2);if(f>0){ctx.fillStyle='rgba(0,0,0,'+f+')';ctx.fillRect(0,0,W,H)}
}

function drawHints3(){
  if(!prefs.help||R.mode!=='play')return;
  const a=R.atk,p=R.pl;
  if(a&&p.s!=='counter'){
    const h=a.hits.find(x=>!x.done);
    if(h){
      const tt=h.at-a.t;
      if(!DIFF.easy){if(tt>0&&tt<=R_T.guard+HINT_LEAD)hintBar(PX,DECK-206,tt<=R_T.guard?tt/R_T.guard:1-(tt-R_T.guard)/HINT_LEAD,tt<=R_T.guard)}
      else if(tt<=R_T.guard&&tt>0){
        ctx.strokeStyle='rgba(111,211,255,.9)';ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(GUARD[0],GUARD[1],60-20*(1-tt/R_T.guard),0,6.283);ctx.stroke();
      }
    }
  }
  if(p.s==='recover'){
    ctx.strokeStyle='rgba(166,154,147,.8)';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(PX,DECK-130,24,-1.57,-1.57+6.283*(p.t/R_T.rec));ctx.stroke();
  }
}
function renderR(){
  if(R.mode==='space'){renderSpace();return}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(R.shake>0&&!reduce)ctx.translate(rand(-1,1)*R.shake,rand(-1,1)*R.shake);
  r3Background();
  r3Ground();
  drawBellWaves();
  {const k=R.mode==='finale'?clamp01((R.fin.t-FIN.bell)/1.4):0;
   if(k>0){
     if(OFF.width!==cv.width||OFF.height!==cv.height){OFF.width=cv.width;OFF.height=cv.height}
     const main=ctx;OFFX.setTransform(1,0,0,1,0,0);OFFX.clearRect(0,0,OFF.width,OFF.height);OFFX.setTransform(main.getTransform());
     ctx=OFFX;try{drawBoss3()}finally{ctx=main}
     main.save();main.setTransform(1,0,0,1,0,0);main.filter='grayscale('+k+') brightness('+(1-.4*k)+')';main.drawImage(OFF,0,0);main.filter='none';main.restore();
   }else drawBoss3()}
  drawFallWings();drawFinFx();
  if(R.mode==='finale'&&R.fin.t<.4)drawBolt(R.bx-20,-10,DECK-260,1-R.fin.t/.4,true);
  drawHits3();
  drawHero3();
  if(R.mode==='finale'){const ft=R.fin.t,a0=FIN.hero-1.0;if(ft>=a0&&ft<FIN.hero-.3){const h=heroPose3(),L=[h.x+h.hand[0]+Math.cos(h.sa)*76,DECK+(h.y||0)+h.hand[1]+Math.sin(h.sa)*76],u=es(clamp01((ft-a0)/.4)),al=ft<FIN.hero-.5?1:clamp01((FIN.hero-.3-ft)/.2);lanternBeam(L,lerp2(L,[150,DECK-76],u),12,al)}}
  drawCn3();
  for(const s of R.steam){ctx.fillStyle='rgba(235,245,255,'+(.35*clamp01(s.life/s.max))+')';ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,6.283);ctx.fill()}
  drawHints3();
  drawFx2();
  ctx.fillStyle='rgba(240,248,255,.85)';
  for(const f of FLAKES){ctx.globalAlpha=.45+.04*f.s*3;ctx.fillRect(f.x,f.y,f.s,f.s)}
  ctx.globalAlpha=1;
  ctx.restore();
  ctx.drawImage(vig,0,0,W,H);
  if(R.flash>0){ctx.fillStyle='rgba(255,255,255,'+R.flash+')';ctx.fillRect(0,0,W,H)}
  if(R.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(R.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  let fade=0;
  if(R.mode==='intro')fade=1-clamp01(R.t/.8);
  if(R.mode==='won'&&R.boss.t>1.6)fade=clamp01((R.boss.t-1.6)/1.2)*.6;
  if(R.mode==='finale')fade=clamp01((R.fin.t-FIN.fade)/1.1);
  if(R.mode==='flee')fade=clamp01((R.fl.t-FLEE.fade)/1);
  if(R.mode==='fake')fade=1;
  if(fade>0){ctx.fillStyle='rgba(0,0,0,'+fade+')';ctx.fillRect(0,0,W,H)}
}

/* ---------- navigation entre phases ---------- */
const CARD1={get eye(){return _('Phase I · The Bridge','Phase I · Le pont')},get title(){return _('The last watch.','La dernière veille.')},
  get desc(){return _("The Colossus has reached the bridge. Behind the Watcher lies nothing but the road to the valleys. A single rule: not one step back.","Le Colosse a atteint le pont. Derrière le Veilleur, il n'y a plus que la route des vallées. Une seule règle : ne pas reculer d'un pas.")},
  get go(){return _('Start','Commencer')}};
function goPhase(n){
  pendingLore=false; // une carte de lore laissée ouverte ne doit pas avaler le bouton « Commencer » suivant
  el.go2.hidden=true;hideMenu();el.ov.classList.remove('clear');
  if(n===1){
    R=null;Q=null;setPhaseUI(1);newGame();lastP=-1;lastB=-1;hud();
    el.eye.textContent=CARD1.eye;el.title.textContent=CARD1.title;el.desc.textContent=CARD1.desc;el.go.textContent=CARD1.go;
    el.stats.hidden=true;el.ov.hidden=false;
    say(_('Phase I.','Phase I.'));
    if(RUN.on)start();
  }else if(n===2){beginP2()}
  else{beginP3()}
}
document.querySelectorAll('#phases button').forEach(b=>b.addEventListener('click',()=>{
  goPhase(+b.dataset.ph);b.blur();
  try{if(!el.ov.hidden)el.go.focus({preventScroll:true})}catch(e){}
}));

/* ---------- input ---------- */
cv.addEventListener('pointerdown',e=>{e.preventDefault();press()});
el.ward.addEventListener('pointerdown',e=>{e.preventDefault();press()});
el.ward.addEventListener('click',e=>{if(e.detail===0)press()});
el.go.addEventListener('click',start);
el.help.addEventListener('change',()=>{prefs.help=el.help.checked});
el.snd.addEventListener('change',()=>{prefs.sound=el.snd.checked;if(prefs.sound)ensureAudio()});
$('optMus').addEventListener('change',()=>{prefs.music=$('optMus').checked;if(prefs.music)ensureAudio()});
const pauseEl=$('pause');
const menuEl=$('menu');
function setPause(on){
  if(on){if(paused||!el.ov.hidden)return;paused=true;pauseEl.hidden=false;try{$('pResume').focus({preventScroll:true})}catch(e){}}
  else{pauseEl.hidden=true;paused=false;if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}
}
$('pResume').addEventListener('click',()=>setPause(false));
$('pMenu').addEventListener('click',()=>{pauseEl.hidden=true;showMenu(true)});
$('pauseBtn').addEventListener('click',e=>{setPause(true);e.currentTarget.blur()});
/* Épreuve : Réessayer = abandonner la run (compte comme une défaite), avec confirmation pour éviter les faux appuis. */
let abandonT=0,abandonTm=0;
function resetRetryLabel(){abandonT=0;clearTimeout(abandonTm);try{$('retryBtn').textContent=_('Retry','Réessayer')}catch(e){}}
function abandonRun(){
  if(abandonT){resetRetryLabel();restartRun();return}
  abandonT=1;$('retryBtn').textContent=_('Give up?','Abandonner ?');
  say(_('Press Retry again to give up the run and start over from Phase I.','Rappuie sur Réessayer pour abandonner la run et repartir de la phase I.'));
  abandonTm=setTimeout(resetRetryLabel,3000);
}
/* Réessayer : relance la phase en cours, sans carte ni lore. */
function retryPhase(){
  if(!menuEl.hidden)return;
  if(RUN.on){abandonRun();return}
  pendingLore=false;pauseEl.hidden=true;paused=false;el.ov.hidden=true;el.go2.hidden=true;el.ov.classList.remove('clear');
  ensureAudio();
  if(R)beginP3(true);
  else if(Q)beginP2(true);
  else{newGame();G.mode='play';G.boss.wait=1.2;lastP=lastB=-1;hud();say(_('Phase I. New attempt.','Phase I. Nouvel essai.'))}
}
$('retryBtn').addEventListener('click',e=>{e.currentTarget.blur();retryPhase()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true)});
/* Plein écran : API standard (ou préfixée Safari) ; bouton masqué si indisponible (iPhone). */
{const de=document.documentElement,rq=de.requestFullscreen||de.webkitRequestFullscreen,ex=document.exitFullscreen||document.webkitExitFullscreen,
  isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement),
  btns=document.querySelectorAll('.fsb');
 if(!rq){btns.forEach(b=>b.hidden=true)}
 else btns.forEach(b=>b.addEventListener('click',e=>{e.currentTarget.blur();try{const r=isFs()?ex.call(document):rq.call(de);if(r&&r.catch)r.catch(()=>{})}catch(x){}}));
}
function showMenu(fromGame){
  $('ovTable').hidden=true;paused=true;pauseEl.hidden=true;menuEl.hidden=false;el.ov.classList.remove('clear');
  $('mphM').hidden=false;$('mphT').hidden=true;$('trialNote').hidden=true;
  $('mResume').hidden=!fromGame;
  try{(fromGame?$('mResume'):document.querySelector('#menu [data-diff=normal]')).focus({preventScroll:true})}catch(e){}
}
function hideMenu(){paused=false;menuEl.hidden=true;pauseEl.hidden=true}
$('mResume').addEventListener('click',()=>{hideMenu();try{if(!el.ov.hidden)el.go.focus({preventScroll:true})}catch(e){}});
(function(){const sv=document.querySelector('.mscene');function fit(){const r=innerWidth/innerHeight;sv.setAttribute('preserveAspectRatio',r<1.2?'xMidYMax meet':'xMidYMax slice')}fit();addEventListener('resize',fit)})();
(function(){const w=$('mEmbers');for(let i=0;i<26;i++){const e=document.createElement('i');e.className='mem';e.style.left=(Math.random()*100)+'%';e.style.setProperty('--dx',((Math.random()-.5)*160)+'px');e.style.animationDuration=(5+Math.random()*7)+'s';e.style.animationDelay=(-Math.random()*10)+'s';const z=2+Math.random()*3;e.style.width=e.style.height=z+'px';w.appendChild(e)}})();
/* Épreuve du feu : Normal jouable, Difficile en attente de la phase III Difficile. */
const BASEW={barrier:T.barrier,flwin:T.flwin,dodge:DG.act,guard:R_T.guard,breath:BRW,rec:T.recovery,drec:DG.rec,rrec:R_T.rec};
const BASET=Object.assign({},T);
function restartRun(){
  RUN.n++;RUN.t=0;RUN.pt=[0,0,0];RUN.st={};resetRetryLabel();
  RUN.cur=RUN.max;pendingLore=false;pauseEl.hidden=true;paused=false;el.ov.hidden=true;
  goPhase(1);
}
function applyDiff(name){
  const d=DIFFS[name]||DIFFS.normal,m=d.m,fm=d.fm||m,rm=d.rm||1;
  DIFF=d;RUN.on=!!d.trial;RUN.max=d.php;RUN.cur=d.php;RUN.n=1;RUN.t=0;RUN.pt=[0,0,0];RUN.st={};RUN.name=name;resetRetryLabel();try{$('retryBtn').disabled=false;$('phases').style.display=RUN.on?'none':''}catch(e){}Object.assign(T,BASET,d.t||{});
  T.barrier=BASEW.barrier*m;T.flwin=BASEW.flwin*fm;DG.act=BASEW.dodge*m;R_T.guard=BASEW.guard*m;BRW=BASEW.breath*fm;
  T.recovery=BASEW.rec*rm;DG.rec=BASEW.drec*rm;R_T.rec=BASEW.rrec*rm;
  document.querySelectorAll('#phases button').forEach((b,i)=>{b.disabled=!!d.trial;b.title=d.trial?_('Not available in the trial','Indisponible dans l\'épreuve'):''});
  lastP=lastB=-1;
  prefs.help=el.help.checked=false;deaths=0;tries=[0,0,0,0];cntS=null;
  el.help.closest('label').hidden=!!d.noHelp;
}
function trialMenu(on){updBest();$('mphM').hidden=on;$('mphT').hidden=!on;$('trialNote').hidden=!on;try{(on?$('mphT').querySelector('button'):$('mphM').querySelector('[data-diff=normal]')).focus({preventScroll:true})}catch(e){}}
$('mBackT').addEventListener('click',()=>trialMenu(false));
document.querySelectorAll('#menu .mph button').forEach(b=>b.addEventListener('click',()=>{
  if(b.disabled||!b.dataset.diff)return;
  if(b.dataset.diff==='trial'&&!endSeen()){b.blur();return} /* verrouillée : aucun message, le cadenas suffit */
  if(b.dataset.diff==='trial'){trialMenu(true);return}
  applyDiff(b.dataset.diff);
  document.querySelectorAll('#menu .mph button').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));
  ensureAudio();
  if(CINE.seen())goPhase(1);else CINE.play(()=>goPhase(1));
}));
$('menuBtn').addEventListener('click',e=>{showMenu(true);e.currentTarget.blur()});
window.addEventListener('keydown',e=>{
  if(e.repeat)return;
  if(!$('gate').hidden)return; /* écran de démarrage : seul le bouton agit */
  const k=e.key;
  if(document.activeElement&&document.activeElement.tagName==='INPUT')return;
  if((k==='r'||k==='R')&&menuEl.hidden&&el.ov.hidden){e.preventDefault();retryPhase();return}
  if((k==='p'||k==='P'||k==='Escape')&&menuEl.hidden){e.preventDefault();setPause(pauseEl.hidden);return}
  if(!pauseEl.hidden){if((k===' '||k==='Enter')&&document.activeElement!==$('pMenu')){e.preventDefault();setPause(false)}return}
  if(!menuEl.hidden){
    if((k===' '||k==='Enter')&&!menuEl.contains(document.activeElement)){e.preventDefault();document.querySelector('#menu [data-diff=normal]').click()}
    return;
  }
  if(!el.ov.hidden){
    if((k===' '||k==='Enter')&&document.activeElement!==el.go){e.preventDefault();el.go.click()}
    return;
  }
  if(k===' '||k==='Spacebar'||k==='ArrowUp'||k==='w'||k==='W'||k==='z'||k==='Z'){e.preventDefault();press()}
});



/* ---------- musique (générée en direct, aucun fichier audio) ---------- */
const mtof=m=>440*Math.pow(2,(m-69)/12);
const MCH=[{r:38,t:[50,53,57]},{r:34,t:[58,62,65]},{r:41,t:[53,57,60]},{r:36,t:[55,60,64]}]; /* ré mineur : Dm · Sib · Fa · Do */
const MLEAD=[[74,0,69,72,74,77,76,74],[74,0,70,74,77,76,74,70],[72,0,69,72,77,76,72,69],[67,0,72,76,79,0,76,72]];
/* Phase III : autre progression (Dm · Sib · Gm · La) et autre thème, plus tragique, avec un cor en contre-chant. */
const MCH3=[{r:38,t:[50,53,57]},{r:34,t:[58,62,65]},{r:31,t:[55,58,62]},{r:33,t:[57,61,64]}];
const MLEAD3=[[69,0,74,77,76,74,72,74],[70,74,77,74,79,77,74,70],[70,0,74,79,77,74,70,67],[69,73,76,0,79,76,73,69]];
const MHORN3=[[62,65],[65,62],[62,67],[64,61]];
function mVoice(c,dst,t,f,d,type,v,o){
  o=o||{};
  const os=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter(),a=o.a||.01;
  os.type=type;os.frequency.setValueAtTime(f,t);
  if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(20,f+o.slide),t+d);
  if(o.det)os.detune.value=o.det;
  fl.type='lowpass';fl.frequency.value=o.lp||2000;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);
  g.gain.setValueAtTime(v,t+Math.max(a,d*(o.sus||0)));g.gain.exponentialRampToValueAtTime(.0001,t+d);
  os.connect(fl);fl.connect(g);g.connect(dst);os.start(t);os.stop(t+d+.05);
}
/* Chœur synthétique : dents de scie désaccordées passées dans des filtres de voyelle (« aah » / « ooh »), avec vibrato. */
function mChoir(c,dst,t,f,d,v,vowel){
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.7,d*.4));g.gain.setValueAtTime(v,t+d*.72);g.gain.exponentialRampToValueAtTime(.0001,t+d);g.connect(dst);
  const fm=vowel==='o'?[[330,1],[820,.45]]:[[720,1],[1150,.6],[2600,.14]];
  (vowel==='a'?[-8,8]:[-10,0,10]).forEach(dt=>{
    const os=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain();
    os.type='sawtooth';os.frequency.value=f;os.detune.value=dt;
    lfo.frequency.value=5+Math.random();lg.gain.value=f*.008;lfo.connect(lg);lg.connect(os.frequency);
    fm.forEach(([ff,q])=>{const bp=c.createBiquadFilter(),og=c.createGain();bp.type='bandpass';bp.frequency.value=ff;bp.Q.value=5;og.gain.value=q;os.connect(bp);bp.connect(og);og.connect(g)});
    os.start(t);os.stop(t+d+.05);lfo.start(t);lfo.stop(t+d+.05);
  });
}
function mNoise(c,dst,t,d,v,f0,f1){
  if(!c.__nb){const b=c.createBuffer(1,c.sampleRate,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;c.__nb=b}
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  src.buffer=c.__nb;src.loop=true;f.type='bandpass';f.Q.value=.8;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  src.connect(f);f.connect(g);g.connect(dst);src.start(t);src.stop(t+d+.05);
}
function mDrum(c,dst,t,big){
  mVoice(c,dst,t,big?78:100,big?.55:.3,'sine',big?.36:.2,{slide:-48,lp:400});
  mNoise(c,dst,t,big?.3:.18,big?.2:.1,big?700:900,big?90:140);
}
function musStep(c,dst,t,s,lvl,bpm){
  const bar=Math.floor(s/8)%8,pos=s%8,ci=Math.floor(bar/2),ch=(lvl>=3?MCH3:MCH)[ci],e=60/bpm/2,bl=e*8;
  /* percussions de guerre */
  if(pos===0)mDrum(c,dst,t,true);
  if(pos===4)mDrum(c,dst,t,false);
  if(lvl>=2&&(pos===2||pos===6))mVoice(c,dst,t,150,.18,'sine',.1,{slide:-60,lp:500});
  if(lvl>=3&&(pos===5||pos===7))mVoice(c,dst,t,130,.15,'sine',.09,{slide:-50,lp:500});
  if(lvl>=4){ /* seconde partie de la phase III : le Colosse a tout récupéré, la musique s'emballe */
    if(pos===1||pos===3)mVoice(c,dst,t,140,.15,'sine',.1,{slide:-55,lp:500});
    if(pos===4)mNoise(c,dst,t,.14,.13,1600,600);
    if(pos===0||pos===4)mDrum(c,dst,t+e*.5,false);
  }
  if(lvl>=5){ /* approche de la fin : le Colosse enragé après avoir tout récupéré, tout devient héroïque */
    if(pos===0){mDrum(c,dst,t,true);if(bar%4===0)mNoise(c,dst,t,1.3,.12,3000,400)}
    if(pos===2||pos===6)mDrum(c,dst,t,false);
    if(pos===0)ch.t.forEach(n=>mVoice(c,dst,t,mtof(n),bl*.98,'sawtooth',.018,{a:.3,lp:1100,sus:.8})); /* chœur de cuivres */
    if(pos%2===0)mVoice(c,dst,t,mtof(ch.r+12),e*1.5,'sawtooth',.035,{lp:420});
    const m5=MLEAD3[ci][(bar%2)*4+pos/2];
    if(pos%2===0&&m5){mVoice(c,dst,t,mtof(m5-12),e*3.4,'sawtooth',.022,{a:.03,lp:1800,sus:.3});mVoice(c,dst,t,mtof(m5-5),e*3.4,'sawtooth',.016,{a:.03,lp:1800,sus:.3})}
    if(pos===4)ch.t.forEach(n=>mVoice(c,dst,t,mtof(n+12),.6,'sawtooth',.024,{lp:1700,a:.012}));
    /* chœur : accord tenu (hommes « ooh », voix « aah ») + chant sur la mélodie */
    if(pos===0){ch.t.forEach((n,i)=>mChoir(c,dst,t,mtof(n+(i?12:0)),bl*.98,.1,'o'));mChoir(c,dst,t,mtof(ch.r+12),bl*.98,.12,'o')}
    if(pos%4===0&&m5)mChoir(c,dst,t,mtof(m5),e*3.8,.09,'o');
  }
  if(lvl>=6){ /* dernière rage : encore plus épique, tambours serrés, lead doublé à l'octave, quinte aux cuivres */
    if(pos%2===1)mDrum(c,dst,t,false);
    if(pos===0&&bar%2===0)mNoise(c,dst,t,.9,.14,3500,500);
    if(pos===0)ch.t.forEach(n=>mVoice(c,dst,t,mtof(n+7),bl*.98,'sawtooth',.016,{a:.25,lp:1300,sus:.8}));
    const m6=MLEAD3[ci][(bar%2)*4+pos/2];
    if(pos%2===0&&m6)mVoice(c,dst,t,mtof(m6+12),e*3,'square',.014,{a:.02,lp:2800,sus:.3});
    if(pos===0)ch.t.forEach((n,i)=>mChoir(c,dst,t,mtof(n+12+(i?7:0)),bl*.98,.07,'o'));
    if(pos%2===0&&m6)mChoir(c,dst,t,mtof(m6),e*3.8,.1,'a'); /* voix « aah » sur la mélodie */
    if(pos===0)mChoir(c,dst,t,mtof(ch.t[2]+12),bl*.98,.06,'a'); /* note tenue au-dessus de l'accord */
    {const gal=[0,1,2,1][pos%4];mVoice(c,dst,t,mtof(ch.t[gal]),e*.7,'sawtooth',.02,{lp:1600,a:.004});if(pos%2===0)mVoice(c,dst,t,mtof(ch.t[gal]+12),e*.7,'sawtooth',.012,{lp:2200,a:.004})} /* cordes galopantes */
  }
  /* basse */
  if(pos===0)mVoice(c,dst,t,mtof(ch.r),bl*.98,'sawtooth',.075,{a:.05,lp:230,sus:.8});
  if(lvl>=2&&(pos%2===0||lvl>=4)&&pos!==0)mVoice(c,dst,t,mtof(ch.r),e*1.6,'sawtooth',.045,{lp:260});
  /* nappe de cordes */
  if(pos===0&&bar%2===0)ch.t.forEach(n=>[-8,8].forEach(dt=>mVoice(c,dst,t,mtof(n),bl*2,'sawtooth',.011,{a:.9,lp:850,det:dt,sus:.9})));
  /* arpège */
  const ar=lvl>=2?[0,1,2,1,2,1,0,1][pos]:[0,1,2,1][pos>>1];
  if(lvl>=2||pos%2===0)mVoice(c,dst,t,mtof(ch.t[ar]+12),e*1.4,'square',.022,{lp:1700,a:.005});
  /* mélodie */
  if(pos%2===0){
    const m=(lvl>=3?MLEAD3:MLEAD)[ci][(bar%2)*4+pos/2];
    if(m)mVoice(c,dst,t,mtof(m),e*3.4,lvl>=2?'sawtooth':'triangle',lvl>=2?.026:.05,{a:.03,lp:2300,sus:.3});
  }
  /* cor en contre-chant (phase III) */
  if(lvl>=3&&pos===0)mVoice(c,dst,t,mtof(MHORN3[ci][bar%2]),bl*.96,'sawtooth',.03,{a:.12,lp:850,sus:.7});
  /* coups de cuivres */
  if(lvl>=3&&pos===0&&(bar%4===0||lvl>=4))ch.t.forEach(n=>mVoice(c,dst,t,mtof(n+12),.8,'sawtooth',.026,{lp:1800,a:.012}));
}
/* Ambiance sombre du menu : bourdon grave, nappe mineure, cloches lointaines, battement sourd. */
const MAMB=[{r:26,t:[50,53,57],b:[74,77,81]},{r:22,t:[46,50,53],b:[70,74,77]},{r:31,t:[43,46,50],b:[67,70,74]},{r:33,t:[45,49,52],b:[73,76,81]}];
function menuStep(c,dst,t,s){
  const ch=MAMB[s%4],L=4;
  mVoice(c,dst,t,mtof(ch.r),L*2.2,'sawtooth',.05,{a:1.6,lp:140,sus:.7});
  mVoice(c,dst,t,mtof(ch.r),L*2.2,'sine',.09,{a:1.2,lp:200,sus:.7});
  ch.t.forEach(n=>[-9,9].forEach(dt=>mVoice(c,dst,t,mtof(n),L*2.4,'sawtooth',.008,{a:2,lp:650,det:dt,sus:.7})));
  mNoise(c,dst,t,L*1.8,.03,260,520);
  mVoice(c,dst,t+.2,52,1.1,'sine',.12,{slide:-18,lp:200}); /* battement sourd */
  mVoice(c,dst,t+1.15,52,.9,'sine',.07,{slide:-18,lp:200});
  const k=2+Math.floor(Math.random()*2);
  for(let i=0;i<k;i++){const m=ch.b[Math.floor(Math.random()*3)],tt=t+.8+Math.random()*(L-1.2);
    mVoice(c,dst,tt,mtof(m-24),4,'sine',.05,{a:.6,lp:700,sus:.3});mVoice(c,dst,tt,mtof(m-36),4.5,'sine',.06,{a:.8,lp:400,sus:.3})}
}
/* Finale (phase III) : les ailes brisées, le coup ultime, le Colosse terrassé puis pétrifié par la cloche. Partition calée sur FIN (secondes). */
function finaleScore(c,dst,t0,now){
  const ev=(t,fn)=>{if(t0+t>=now-.02)fn(t0+t)};
  const big=(t)=>ev(t,x=>mDrum(c,dst,x,true)),sm=(t)=>ev(t,x=>mDrum(c,dst,x,false));
  /* montée : bourdon, cordes qui enflent, roulement de timbales */
  ev(0,x=>{mVoice(c,dst,x,mtof(26),5,'sawtooth',.06,{a:1.2,lp:200,sus:.8});[50,57,62].forEach(n=>[-9,9].forEach(dt=>mVoice(c,dst,x,mtof(n),1.9,'sawtooth',.014,{a:1.6,lp:900,det:dt,sus:.9})))});
  [0,.5,.9,1.15,1.3].forEach(sm);
  /* la masse levée, la cloche répond (1,35 s) puis l'arme est arrachée (1,55 s) */
  ev(1.35,x=>[62,69,74].forEach(n=>[-7,7].forEach(dt=>mVoice(c,dst,x,mtof(n),1.2,'triangle',.02,{a:.05,lp:1800,det:dt,sus:.6}))));
  big(1.55);ev(1.55,x=>{mNoise(c,dst,x,.5,.18,3000,300);mVoice(c,dst,x,mtof(38),.9,'sine',.12,{slide:-14,lp:260,a:.02})});
  [1.9,2.05].forEach(sm);
  /* les deux ailes brisées (un tir de lanterne chacune) */
  [2.3,3.0].forEach(t=>{big(t);ev(t,x=>[50,53,57].forEach(n=>mVoice(c,dst,x,mtof(n+12),.9,'sawtooth',.04,{lp:1500,a:.01})))});
  ev(1.75,x=>[50,57,62].forEach(n=>[-9,9].forEach(dt=>mVoice(c,dst,x,mtof(n),2.0,'sawtooth',.014,{a:1.4,lp:900,det:dt,sus:.9}))));
  [2.65,2.8].forEach(sm);
  /* la charge */
  ev(3.5,x=>mVoice(c,dst,x,150,.95,'sawtooth',.05,{slide:480,lp:2600,a:.3,sus:.8}));
  [3.5,3.7,3.9,4.05,4.2,4.3].forEach(sm);
  /* le coup fatal */
  big(4.6);big(4.6);
  ev(4.6,x=>{mNoise(c,dst,x,1.3,.25,3000,200);[38,45,50,54,57].forEach(n=>mVoice(c,dst,x,mtof(n+12),2.6,'sawtooth',.036,{lp:2000,a:.02}));mVoice(c,dst,x,mtof(26),3,'sine',.16,{lp:200,a:.02})});
  [5.1,5.7,6.3].forEach(sm);
  ev(4.8,x=>[50,53,57].forEach(n=>[-8,8].forEach(dt=>mVoice(c,dst,x,mtof(n),2.4,'sawtooth',.012,{a:.9,lp:900,det:dt,sus:.9}))));
  /* l'effondrement, puis l'élégie */
  big(6.9);ev(6.9,x=>mVoice(c,dst,x,mtof(38),1.6,'sine',.15,{slide:-22,lp:200,a:.02}));
  ev(6.9,x=>[58,62,65].forEach(n=>[-7,7].forEach(dt=>mVoice(c,dst,x,mtof(n),3.3,'sawtooth',.01,{a:.9,lp:800,det:dt,sus:.9}))));
  [[7.2,74,1.3],[8.2,72,1.2],[9.0,69,1.3],[9.9,62,3]].forEach(([t,m,d])=>ev(t,x=>mVoice(c,dst,x,mtof(m),d,'triangle',.045,{a:.12,lp:1300,sus:.4})));
  [7.5,8.6,9.8].forEach(t=>ev(t,x=>mVoice(c,dst,x,52,1,'sine',.1,{slide:-18,lp:200})));
  ev(10,x=>{[50,53,57].forEach(n=>[-6,6].forEach(dt=>mVoice(c,dst,x,mtof(n),3.6,'sawtooth',.01,{a:.8,lp:700,det:dt,sus:.8})));mVoice(c,dst,x,mtof(26),3.6,'sine',.1,{a:.6,lp:200,sus:.7})});
}
/* Fin du chapitre (outro puis carte de fin) : paix et espoir. Ré majeur, boucle de 8 mesures (Ré · La · Si mineur · Sol · Ré · La · Sol · La),
   un thème qui monte doucement au piano, une harpe qui berce, une nappe de cordes et un chœur très doux, avec un écho. */
const MSP=[
  {r:38,t:[54,57,62],m:[66,69,74,0]},{r:33,t:[52,57,61],m:[73,0,69,71]},
  {r:35,t:[54,59,62],m:[71,74,73,71]},{r:31,t:[55,59,62],m:[67,71,74,0]},
  {r:38,t:[54,57,62],m:[69,74,76,74]},{r:33,t:[52,57,61],m:[73,0,76,73]},
  {r:31,t:[55,59,62],m:[74,71,67,71]},{r:33,t:[52,57,61],m:[69,0,73,0]}];
function spaceStep(c,dst,t,s){
  const ch=MSP[s%8],L=4;
  /* basse et nappe de cordes */
  mVoice(c,dst,t,mtof(ch.r),L*1.5,'sine',.09,{a:1,lp:300,sus:.7});
  mVoice(c,dst,t,mtof(ch.r+7),L*1.5,'sine',.035,{a:1.2,lp:300,sus:.7});
  ch.t.forEach(n=>[-5,5].forEach(dt=>mVoice(c,dst,t,mtof(n),L*1.6,'triangle',.013,{a:1.4,lp:700,det:dt,sus:.7})));
  /* chœur très doux, une mesure sur deux */
  if(s%2===0)ch.t.forEach((n,i)=>mChoir(c,dst,t,mtof(n-(i?0:0)),L*1.9,.05,'o'));
  /* houle douce : trois notes longues qui se relaient, sans attaque (pas de carillon) */
  [0,1,2].forEach((k,i)=>mVoice(c,dst,t+i*1.1,mtof(ch.t[k]-12),2.6,'triangle',.03,{a:.9,lp:500,sus:.5}));
  /* thème de violoncelle : il monte doucement, comme un espoir */
  ch.m.forEach((m,i)=>{if(!m)return;const tt=t+i;
    mVoice(c,dst,tt,mtof(m-12),1.9,'sawtooth',.03,{a:.18,lp:650,sus:.5});
    mVoice(c,dst,tt,mtof(m-12),1.9,'sine',.05,{a:.15,lp:700,sus:.5})});
}
const MUS={cur:null,t:0,s:0,ctx:null,bus:{}};
function musKind(){
  if(!prefs.sound||!prefs.music||!AC||AC.state!=='running')return null;
  if(!menuEl.hidden)return 'menu';
  if(paused)return null;
  if(R&&R.mode==='finale')return 'finale';
  if(R&&R.mode==='space')return 'space';
  const S=R||Q||G;
  return S&&(S.mode==='play'||S.mode==='intro')&&el.ov.hidden?'game':null;
}
function musTick(){
  try{
    const k=musKind();
    if(MUS.ctx!==AC){
      MUS.ctx=AC;MUS.cur=null;
      const cp=AC.createDynamicsCompressor();cp.connect(AC.destination);
      MUS.bus={};['game','menu','finale','space'].forEach(n=>{const g=AC.createGain();g.gain.value=0;g.connect(cp);MUS.bus[n]=g});
      {const sg=MUS.bus.space,d=AC.createDelay(1),fb=AC.createGain(),lp=AC.createBiquadFilter(); /* écho doux pour l'espace */
       d.delayTime.value=.6;fb.gain.value=.22;lp.type='lowpass';lp.frequency.value=800;sg.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(cp)}
    }
    if(k!==MUS.cur){
      const now=AC.currentTime;
      for(const n in MUS.bus){const g=MUS.bus[n].gain;g.cancelScheduledValues(now);g.setTargetAtTime(n===k?({menu:.4,game:.7,finale:.65,space:.45}[n]):0,now,n===k?.35:.12)}
      MUS.cur=k;MUS.t=now+.08;MUS.s=0;MUS.gt=null;
      if(k==='finale')finaleScore(AC,MUS.bus.finale,now+.05-(R.fin?R.fin.t:0),now);
    }
    if(!k)return;
    const now=AC.currentTime;
    if(k==='finale')return;
    if(k==='menu'){while(MUS.t<now+.6){menuStep(AC,MUS.bus.menu,MUS.t,MUS.s);MUS.t+=4;MUS.s++}}
    else if(k==='space'){while(MUS.t<now+.6){spaceStep(AC,MUS.bus.space,MUS.t,MUS.s);MUS.t+=4;MUS.s++}}
    else{const lvl=R?(R.healed?(R.u55?6:R.u5?5:4):3):Q?2:1,bpm=[0,100,112,124,142,150,160][lvl];
      {const gt=lvl>=6?.5:lvl>=5?.56:.7;if(MUS.gt!==gt){MUS.gt=gt;MUS.bus.game.gain.setTargetAtTime(gt,now,.3)}}
      if(R&&R.healed&&MUS.hR!==R){MUS.hR=R; /* le cri d'agonie : montée et gros coups */
        mVoice(AC,MUS.bus.game,now+.02,120,1.3,'sawtooth',.05,{slide:620,lp:2200,a:.4,sus:.8});mDrum(AC,MUS.bus.game,now+1.2,true);mDrum(AC,MUS.bus.game,now+1.2,true);mNoise(AC,MUS.bus.game,now+1.2,1,.18,2500,200)}
      if(R&&R.healed&&R.u5&&MUS.uR!==R){MUS.uR=R;
        mVoice(AC,MUS.bus.game,now+.02,100,1.4,'sawtooth',.05,{slide:700,lp:2200,a:.4,sus:.8});mDrum(AC,MUS.bus.game,now+1.3,true);mDrum(AC,MUS.bus.game,now+1.3,true);mNoise(AC,MUS.bus.game,now+1.3,1.2,.2,2500,200)}
      if(R&&R.healed&&R.u55&&MUS.vR!==R){MUS.vR=R; /* dernière rage : montée finale, tambours et choc */
        mVoice(AC,MUS.bus.game,now+.02,110,1.6,'sawtooth',.055,{slide:900,lp:2600,a:.5,sus:.8});for(let i=0;i<4;i++)mDrum(AC,MUS.bus.game,now+.9+i*.14,i>1);mDrum(AC,MUS.bus.game,now+1.5,true);mNoise(AC,MUS.bus.game,now+1.5,1.5,.22,3000,200)}
      while(MUS.t<now+.3){musStep(AC,MUS.bus.game,MUS.t,MUS.s%64,lvl,bpm);MUS.t+=60/bpm/2;MUS.s++}}
  }catch(e){}
}
setInterval(musTick,90);

/* ---------- langue ---------- */
const UIT=[
 ['#menu .mcard .eyebrow','Chapter I · Ember Bridge','Chapitre I · Ember Bridge'],
 ['#menu .mcard .tag','The Watcher faces the Ember Colossus: on the bridge, in the Foundry, then atop the Bell Tower.','Le Veilleur affronte le Colosse de braise : sur le pont, dans la Fonderie, puis au sommet du Clocher.'],
 ['#mResume','Resume','Reprendre'],
 ['#gateBtn','Start','Commencer'],
 ['#menu [data-diff=easy] b','Easy','Facile'],['#menu [data-diff=easy] span','Breathe','Respire'],
 ['#menu [data-diff=normal] b','Normal','Normal'],['#menu [data-diff=normal] span','The real fight','Le vrai combat'],
 ['#menu [data-diff=hard] b','Hard','Difficile'],['#menu [data-diff=hard] span','The Colossus unleashed','Le Colosse déchaîné'],
 
 ['#menu [data-diff=tn] b','Normal','Normal'],['#menu [data-diff=th] b','Hard','Difficile'],
 ['#mBackT b','‹ Back','‹ Retour'],['#mBackT span','Difficulties','Difficultés'],
 ['#trialNote b','Trial by Fire','Épreuve du feu'],
 ['#trialNote li:nth-child(1)','The three phases in a row, with no pause and no visual help.',"Les trois phases d'affilée, sans pause et sans aide visuelle."],
 ['#trialNote li:nth-child(2)','You recover 1 life between phases.','Tu récupères 1 PV entre les phases.'],
 ['#trialNote li:nth-child(3)','A single death sends you back to Phase I.','Une seule mort te renvoie à la phase I.'],
 ['#trialNote li:nth-child(4)','One stats table at the end of the run.',"Un seul tableau de stats à la fin de la run."],
 ['#menu .how','One button: block, dodge, parry. Space, up arrow or tap the screen. P to pause.',"Un seul bouton : bloquer, esquiver, parer. Espace, flèche haut ou toucher l'écran. P pour la pause."],
 ['.fsm span','Fullscreen','Plein écran'],['#introBtn','▶ Intro','▶ Intro'],['#outroBtn','▶ Outro','▶ Outro'],['#cineSkip','Skip ›','Passer ›'],['#pause h2','Fight paused','Combat en pause'],['#pResume','Resume','Reprendre'],
 ['#go2','Enable visual help',"Activer l'aide visuelle"],
 ['#retryBtn','Retry','Réessayer'],
 ['.hint','Space, up arrow, or tap the screen · P pause · R retry',"Espace, flèche haut, ou toucher l'écran · P pause · R réessayer"],
 ['label[for=optHelp]',' Visual help',' Aide visuelle','last'],['label[for=optSnd]',' Sound',' Son','last'],['label[for=optMus]',' Music',' Musique','last'],
 ['.bars .bar:not(.boss) > span','The Watcher ','Le Veilleur ','first'],['.bars .bar.boss > span','Ember Colossus ','Colosse de braise ','first'],
];
const UIA=[['#phases','Fight phases','Phases du combat'],['.bars','Hit points','Points de vie'],['#hpP',"The Watcher's hit points",'Points de vie du Veilleur'],['#hpB',"The Colossus's hit points",'Points de vie du Colosse'],['#menu .mph','Choose difficulty','Choisir la difficulté']];
function applyLang(){updNext();updBest();
  document.documentElement.lang=LANG;
  UIT.forEach(([sel,en,fr,node])=>{const e=document.querySelector(sel);if(!e)return;const t=_(en,fr);
    if(node==='last'){e.lastChild.textContent=t}else if(node==='first'){e.firstChild.textContent=t}else e.textContent=t});
  UIA.forEach(([sel,en,fr])=>{const e=document.querySelector(sel);if(e)e.setAttribute('aria-label',_(en,fr))});
  document.querySelectorAll('#langs button,#gateLangs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===LANG)));
  try{setPhaseUI(R?3:Q?2:1)}catch(e){}
  try{el.help.closest('label').hidden=!!(DIFF&&DIFF.noHelp)}catch(e){}
}
document.querySelectorAll('#langs button,#gateLangs button').forEach(b=>b.addEventListener('click',()=>{
  LANG=b.dataset.lang;try{localStorage.setItem('eb-lang',LANG)}catch(e){}applyLang();b.blur();
}));
applyLang();
/* ---------- boot ---------- */
buildStatic();
newGame();
hud();
el.ov.hidden=true;
showMenu(false);
/* écran de démarrage : un clic obligatoire, qui débloque le son et lance la musique du menu */
/* ---------- cinématique d'introduction (canvas dédié, passable) ---------- */
const CINE=(()=>{
  const box=$('cine'),cvs=$('cineC'),cap=$('cineCap'),sk=$('cineSkip'),cx=cvs.getContext('2d');
  const K=Math.min(2,COARSE?1.25:(window.devicePixelRatio||1));cvs.width=960*K;cvs.height=540*K;
  const P=d=>new Path2D(d);
  const BRIDGE=P('M0 455 L960 455 L960 475 L900 475 Q860 475 860 505 L860 540 L760 540 L760 505 Q760 475 720 475 L560 475 Q520 475 520 505 L520 540 L420 540 L420 505 Q420 475 380 475 L200 475 Q160 475 160 505 L160 540 L60 540 L60 505 Q60 475 0 475Z');
  const WATCH=P('M205 455 L215 392 Q205 380 213 366 Q222 354 234 366 Q242 380 232 392 L242 455Z');
  const COLOS=P('M640 455 L650 330 L615 300 L640 270 L625 215 L660 245 L690 205 L720 245 L760 215 L750 270 L785 300 L745 335 L760 455Z M655 215 L630 150 L668 200Z M745 210 L772 148 L735 198Z M615 300 L540 360 L560 372 L630 330Z M785 300 L850 270 L860 290 L790 330Z');
  const FAR=P('M0 400 L90 300 L160 350 L260 240 L350 340 L450 270 L560 350 L650 250 L760 340 L860 280 L960 360 L960 540 L0 540Z');
  const NEAR=P('M0 450 L120 380 L220 430 L340 360 L470 440 L600 370 L730 440 L850 380 L960 430 L960 540 L0 540Z');
  const VOLC=P('M-60 540 L200 340 L330 295 L420 205 L450 175 L480 155 L510 175 L540 205 L630 295 L760 340 L1020 540Z');
  const STARS=Array.from({length:110},()=>({x:rand(0,960),y:rand(0,330),r:rand(.5,1.5),p:rand(0,6.28)}));
  const EMB=Array.from({length:70},()=>({x:rand(0,960),v:rand(18,60),s:rand(1,3),p:rand(0,560),ph:rand(0,6.28)}));
  const HOUSES=[[40,60,44],[130,48,38],[215,70,52],[330,52,40],[430,64,48],[540,50,36],[640,72,54],[760,54,42],[850,66,48]];
  const CR=Array.from({length:16},(v,i)=>{let x=480+rand(-60,60),y=540;const pts=[[x,y]],a0=-Math.PI/2+rand(-1.1,1.1);let a=a0;for(let k=0;k<9;k++){a+=rand(-.5,.5);x+=Math.cos(a)*rand(40,80);y+=Math.sin(a)*rand(40,80)-10;pts.push([x,y])}return pts});
  const SC=[
    {d:6,en:'For a thousand winters, the mountain has burned beneath its stone.',fr:'Depuis mille hivers, la montagne brûle sous sa pierre.'},
    {d:7,en:'In the valleys below, the villages sleep, kept safe by a single stone bridge. Beneath its arch lies a foundry forgotten by all, even by those who keep watch.',fr:"Dans les vallées, les villages dorment, à l'abri d'un unique pont de pierre. Sous son arche dort une fonderie oubliée de tous, même de ceux qui veillent."},
    {d:7,en:'On the bridge, a lone silhouette: the Watcher, a member of an order sworn to protect the Bound Spires. His lantern lives with him.',fr:"Sur le pont, une seule silhouette : le Veilleur, membre d'un ordre qui protège les Flèches liées. Sa lanterne vit avec lui."},
    {d:7,en:'Tonight, a chain gives way beneath the mountain. The Ember Colossus climbs toward the light.',fr:"Cette nuit, une chaîne cède sous la montagne. Le Colosse de braise remonte vers la lumière."},
    {d:7,en:'If the Watcher falls, the fire will reach the villages.',fr:'Si le Veilleur tombe, le feu atteindra les villages.'}
  ];
  let st=null,seen=false; /* vue une fois (Passer ou fin) : mémorisé dans le navigateur quand c'est possible, sinon jusqu'au prochain chargement */
  try{seen=localStorage.getItem('eb-intro')==='1'}catch(e){}
  function sky(top,mid,bot){const g=cx.createLinearGradient(0,0,0,540);g.addColorStop(0,top);g.addColorStop(.6,mid);g.addColorStop(1,bot);cx.fillStyle=g;cx.fillRect(0,0,960,540)}
  function stars(t,a){cx.fillStyle='#f1e3cf';for(const s of STARS){cx.globalAlpha=a*(.35+.35*Math.sin(t*1.3+s.p));cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.283);cx.fill()}cx.globalAlpha=1}
  function embers(t,k){cx.fillStyle='#ffb060';for(const e of EMB){const y=540-((e.p+t*e.v)%580),x=e.x+Math.sin(t*.8+e.ph)*16;cx.globalAlpha=k*clamp01(Math.min(1,(540-y)/90))*clamp01(y/120+.2);cx.beginPath();cx.arc(x,y,e.s,0,6.283);cx.fill()}cx.globalAlpha=1}
  function glow(y,a,r){const g=cx.createRadialGradient(480,y,0,480,y,r);g.addColorStop(0,'rgba(255,122,43,'+a+')');g.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=g;cx.fillRect(-1500,-1500,4000,4000)}
  function cam(z,fx,fy,dx,dy){cx.translate(fx,fy);cx.scale(z,z);cx.translate(-fx+(dx||0),-fy+(dy||0))}
  function sMnt(p,t){
    cx.save();cam(1+.14*p,480,330,0,-30*p);
    sky('#08060d','#26100f','#6e2410');stars(t,1);
    cx.fillStyle='#1a0b10';cx.fill(FAR);
    glow(300,.35+.15*Math.sin(t*2),520);
    cx.fillStyle='#0d0710';cx.fill(VOLC);
    cx.save();cx.clip(VOLC);cx.strokeStyle='#ff9a3c';cx.shadowColor='#ff7a2b';cx.shadowBlur=10;
    for(let i=0;i<9;i++){cx.globalAlpha=.55+.4*Math.sin(t*1.7+i);cx.lineWidth=1.5+Math.sin(t*2+i)*.6;cx.beginPath();let x=480+(i-4)*14,y=165;cx.moveTo(x,y);for(let k=0;k<7;k++){x+=(i-4)*9+Math.sin(i*3+k*1.7)*14;y+=48;cx.lineTo(x,y)}cx.stroke()}
    cx.restore();
    const g=cx.createRadialGradient(480,158,0,480,158,90);g.addColorStop(0,'rgba(255,190,90,'+(.8+.15*Math.sin(t*3))+')');g.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=g;cx.fillRect(380,70,200,180);
    cx.fillStyle='#120810';cx.fill(NEAR);
    embers(t,1);cx.restore();
  }
  function sVal(p,t){
    cx.save();cam(1.08,480,300,-34*(p-.5),0);
    sky('#0a0710','#2a1013','#5a1e10');stars(t,.7);
    cx.save();cx.translate(-260,60);cx.scale(.6,.6);glow(300,.3,520);cx.fillStyle='#160a0f';cx.fill(VOLC);cx.restore();
    cx.fillStyle='#1b0c12';cx.fill(FAR);
    const g=cx.createLinearGradient(0,400,0,540);g.addColorStop(0,'#150a10');g.addColorStop(1,'#07050a');cx.fillStyle=g;cx.fillRect(-40,420,1040,140);
    for(const [x,w,h] of HOUSES){
      cx.fillStyle='#07050a';cx.fillRect(x,440-h+30,w,h);cx.beginPath();cx.moveTo(x-6,440-h+30);cx.lineTo(x+w/2,440-h-6+30);cx.lineTo(x+w+6,440-h+30);cx.fill();
      cx.fillStyle='rgba(255,193,90,'+(.65+.25*Math.sin(t*3+x))+')';cx.fillRect(x+w*.25,440-h*.55+30,w*.18,h*.22);cx.fillRect(x+w*.6,440-h*.55+30,w*.18,h*.22);
      cx.fillStyle='rgba(120,100,110,.25)';for(let s=0;s<4;s++){const yy=440-h-10-((t*18+s*22+x)%90)+30;cx.beginPath();cx.arc(x+w*.75+Math.sin(t+s+x)*6,yy,4+s*1.4,0,6.283);cx.fill()}
    }
    embers(t,.6);cx.restore();
  }
  function sBridge(p,t){
    cx.save();cam(1+.75*p,235,380,0,-20*p);
    sky('#08060d','#2a0f14','#7a2a10');stars(t,1);
    cx.fillStyle='rgba(241,227,207,.2)';cx.beginPath();cx.arc(170,110,34,0,6.283);cx.fill();
    cx.fillStyle='#1a0b10';cx.fill(FAR);glow(470,.75+.15*Math.sin(t*2.4),600);
    cx.fillStyle='#07050a';cx.fill(BRIDGE);
    cx.save();cx.translate(225,455);cx.transform(1,0,Math.sin(t*1.6)*.035,1,0,0);cx.translate(-225,-455);cx.fill(WATCH);cx.restore();
    cx.strokeStyle='#07050a';cx.lineWidth=4;cx.beginPath();cx.moveTo(250,455);cx.lineTo(250,334);cx.stroke();
    const k=.7+.3*Math.sin(t*3.2),g=cx.createRadialGradient(250,323,0,250,323,46*k);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(.3,'rgba(255,200,110,.45)');g.addColorStop(1,'rgba(255,190,90,0)');cx.fillStyle=g;cx.fillRect(190,263,120,120);
    cx.fillStyle='#07050a';cx.beginPath();cx.moveTo(242,314);cx.lineTo(250,306);cx.lineTo(258,314);cx.closePath();cx.fill();cx.fillRect(241,331,18,4);
    cx.fillStyle='#ffd27a';cx.fillRect(243,314,14,17);cx.fillStyle='#07050a';cx.fillRect(247,314,1.5,17);cx.fillRect(251.5,314,1.5,17);
    embers(t,1);cx.restore();
  }
  function sWake(p,t){
    cx.save();
    if(!reduce&&p>.45&&p<.7){cx.translate(rand(-5,5)*(.7-p)*4,rand(-5,5)*(.7-p)*4)}
    cam(1+.1*p,480,300);
    sky('#050308','#1a0810','#4a1608');
    glow(520,.5+.4*p,640);
    const vis=clamp01(p*1.6);
    cx.strokeStyle='#ff9a3c';cx.shadowColor='#ff7a2b';cx.shadowBlur=12;cx.lineCap='round';
    for(const c of CR){const n=Math.floor(vis*(c.length-1)),f=vis*(c.length-1)-n;cx.lineWidth=2.6;cx.globalAlpha=.9;cx.beginPath();cx.moveTo(c[0][0],c[0][1]);for(let i=1;i<=n;i++)cx.lineTo(c[i][0],c[i][1]);if(n<c.length-1){const a=c[n],b=c[n+1];cx.lineTo(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f)}cx.stroke()}
    cx.globalAlpha=1;cx.shadowBlur=0;
    const rise=es(clamp01((p-.3)/.6));
    cx.save();cx.globalAlpha=clamp01((p-.28)/.3);cx.translate(-250*1.25+0,(1-rise)*210-40);cx.scale(1.25,1.25);cx.translate(0,60);cx.fillStyle='#06040a';cx.fill(COLOS);
    cx.restore();
    const ea=clamp01((p-.5)/.12);cx.fillStyle='rgba(255,210,122,'+ea+')';cx.shadowColor='#ffb347';cx.shadowBlur=18;
    for(const ex of[690,722]){cx.beginPath();cx.ellipse((ex-250)*1.25-0,(232+60-40)*1.25-75*(1-rise)*0+(1-rise)*210-60,5.5,3.6,0,0,6.283);cx.fill()}
    cx.shadowBlur=0;embers(t,1.1);cx.restore();
    if(p>.45&&p<.62){cx.fillStyle='rgba(255,230,190,'+(.55*(1-(p-.45)/.17))+')';cx.fillRect(0,0,960,540)}
  }
  function sFace(p,t){
    cx.save();cam(1.55-.55*p,480,330);
    sky('#08060d','#2a0f14','#7a2a10');stars(t,.9);
    cx.fillStyle='rgba(241,227,207,.16)';cx.beginPath();cx.arc(170,110,34,0,6.283);cx.fill();
    cx.fillStyle='#1a0b10';cx.fill(FAR);glow(470,.75+.15*Math.sin(t*2.2),620);
    cx.fillStyle='#07050a';cx.fill(BRIDGE);cx.fill(WATCH);cx.fill(COLOS);
    cx.strokeStyle='#07050a';cx.lineWidth=4;cx.beginPath();cx.moveTo(250,455);cx.lineTo(250,334);cx.stroke();
    const k=.75+.25*Math.sin(t*3.1),g=cx.createRadialGradient(250,323,0,250,323,40*k);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(.35,'rgba(255,200,110,.45)');g.addColorStop(1,'rgba(255,190,90,0)');cx.fillStyle=g;cx.fillRect(190,263,120,120);
    cx.fillStyle='#07050a';cx.beginPath();cx.moveTo(242,314);cx.lineTo(250,306);cx.lineTo(258,314);cx.closePath();cx.fill();cx.fillRect(241,331,18,4);
    cx.fillStyle='#ffd27a';cx.fillRect(243,314,14,17);cx.fillStyle='#07050a';cx.fillRect(247,314,1.5,17);cx.fillRect(251.5,314,1.5,17);
    cx.fillStyle='#ffd27a';cx.shadowColor='#ffb347';cx.shadowBlur=16;cx.beginPath();cx.arc(690,232,4,0,6.283);cx.arc(722,232,4,0,6.283);cx.fill();cx.shadowBlur=0;
    const lg=cx.createRadialGradient(705,330,0,705,330,40);lg.addColorStop(0,'rgba(255,122,43,.5)');lg.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=lg;cx.fillRect(660,290,90,80);
    embers(t,1);cx.restore();
    const ta=clamp01((p-.5)/.25);
    if(ta>0){cx.save();cx.globalAlpha=ta;cx.textAlign='center';cx.fillStyle='#f0e8df';cx.shadowColor='rgba(255,122,43,.85)';cx.shadowBlur=30;cx.font='800 96px '+DISPLAY;cx.textAlign='left';if(cx.letterSpacing!==undefined)cx.letterSpacing='4px';const w1=cx.measureText('LUMEN').width,w2=cx.measureText('BELL').width,x0=480-(w1+w2)/2;cx.fillStyle='#ff7a2b';cx.fillText('LUMEN',x0,118);cx.fillStyle='#f0e8df';cx.fillText('BELL',x0+w1,118);cx.shadowBlur=0;cx.textAlign='center';if(cx.letterSpacing!==undefined)cx.letterSpacing='3px';cx.fillStyle='rgba(240,232,223,.88)';cx.font='700 26px '+DISPLAY;cx.fillText(_('CHAPTER I · EMBER BRIDGE','CHAPITRE I · EMBER BRIDGE'),480,160);cx.restore()}
  }
  const DRAW=[sMnt,sVal,sBridge,sWake,sFace];
  function frame(now){
    if(!st)return;
    const dt=Math.min(.1,(now-st.last)/1000);st.last=now;st.t+=dt;
    let acc=0,i=0;for(;i<SC.length;i++){if(st.t<acc+SC[i].d)break;acc+=SC[i].d}
    if(i>=SC.length){finish();return}
    const s=SC[i],lt=st.t-acc,p=lt/s.d,al=Math.min(1,lt/.8,(s.d-lt)/.8);
    if(st.i!==i){st.i=i;cap.textContent=_(s.en,s.fr);
      if(i===3)st.roar=false}
    if(i===3&&!st.roar&&p>.45){st.roar=true;boom(1.2,.12);roar()}
    if(i===2&&!st.chime&&p>.3){st.chime=true;tone(660,.9,'sine',.04,200);tone(990,1.1,'sine',.025,0)}
    cap.style.opacity=String(clamp01(Math.min(lt-.5,s.d-.5-lt)/.6));
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1;cx.fillStyle='#000';cx.fillRect(0,0,960,540);
    DRAW[i](p,st.t);
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1-al;cx.fillStyle='#000';cx.fillRect(0,0,960,540);cx.globalAlpha=1;
    st.raf=requestAnimationFrame(frame);
  }
  function finish(){
    if(!st)return;const d=st.done;cancelAnimationFrame(st.raf);st=null;box.hidden=true;
    seen=true;try{localStorage.setItem('eb-intro','1')}catch(e){}
    try{d&&d()}catch(e){}
  }
  function play(done){
    if(st)return;ensureAudio();
    sk.textContent=_('Skip ›','Passer ›');cap.textContent='';cap.style.opacity='0';
    box.hidden=false;st={t:0,i:-1,last:performance.now(),done,raf:0};
    try{sk.focus({preventScroll:true})}catch(e){}
    st.raf=requestAnimationFrame(frame);
  }
  sk.addEventListener('click',finish);
  window.addEventListener('keydown',e=>{if(!st)return;e.stopImmediatePropagation();e.preventDefault();if(e.key==='Escape'||e.key==='Enter'||e.key===' ')finish()},true);
  return{play,seen:()=>seen};
})();
$('introBtn').addEventListener('click',e=>{e.currentTarget.blur();CINE.play(()=>{})});
/* Outro de la vraie fin : le lore après la bataille, jusqu'au lien avec Silent Bells. Rejouable depuis le menu une fois débloquée. */
const OUTRO=(()=>{
  const box=$('cine'),cvs=$('cineC'),cap=$('cineCap'),sk=$('cineSkip'),cx=cvs.getContext('2d');
  let st=null;
  const STR=Array.from({length:140},()=>({x:rand(0,960),y:rand(0,330),r:rand(.4,1.8),p:rand(0,6.3)}));
  const SNW=Array.from({length:90},()=>({x:rand(0,960),y:rand(0,540),v:rand(30,80),s:rand(1,3)}));
  const BUB=Array.from({length:34},(v,i)=>({x:rand(0,960),o:rand(0,340),r:rand(1.5,4)}));
  const SC=[
    {d:9.5,en:"The great bell has fallen silent. Atop the Bell Tower, the Ember Colossus is now only a statue of black stone, kneeling before the bell. Lit by the Watcher, the beacon now keeps watch over him.",fr:"La grande cloche s'est tue. Au sommet du Clocher, le Colosse de braise n'est plus qu'une statue de pierre noire, à genoux face à la cloche. Allumé par le Veilleur, le fanal veille désormais sur lui."},
    {d:6.5,en:"In the valleys, the villages are still asleep. They will never know what was at stake that night, above their roofs.",fr:"Dans les vallées, les villages dorment encore. Ils ne sauront jamais ce qui s'est joué cette nuit au-dessus de leurs toits."},
    {d:9.5,en:"One by one, the Bound Spires answered the call. From peak to peak, their bells carried the news across the mountains, and beneath every tower, the stone trembled.",fr:"Une à une, les Flèches liées ont répondu à l'appel. De sommet en sommet, leurs cloches ont porté la nouvelle à travers les montagnes, et sous chaque tour, la pierre a tremblé."},
    {d:8,en:"Every bell answered. Every one but one. Far out at sea, the Drowned Beacon stayed silent, as if the depths had imposed silence on it.",fr:"Toutes les cloches ont répondu. Toutes, sauf une. Au large, le Phare Noyé est resté muet, comme si les profondeurs lui avaient imposé le silence."},
    {d:6,en:"At dawn, lantern in hand, the Watcher set out for the coast.",fr:"À l'aube, lanterne à la main, le Veilleur s'est mis en route vers la côte."},
    {d:7,en:"Chapter II · Silent Bells. To be continued.",fr:"Chapitre II · Silent Bells. À suivre."}
  ];
  const poly=(p,col)=>{cx.fillStyle=col;cx.beginPath();p.forEach((q,i)=>i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1]));cx.closePath();cx.fill()};
  function sky(t,top,bot,hz){const g=cx.createLinearGradient(0,0,0,hz);g.addColorStop(0,top);g.addColorStop(1,bot);cx.fillStyle=g;cx.fillRect(0,0,960,hz);for(const s of STR){if(s.y>hz-10)continue;cx.globalAlpha=.3+.6*Math.abs(Math.sin(t*.8+s.p));cx.fillStyle='#eef2ff';cx.fillRect(s.x,s.y,s.r,s.r)}cx.globalAlpha=1}
  function snow(t,a){cx.fillStyle='rgba(240,246,255,'+a+')';for(const f of SNW){const y=(f.y+t*f.v)%540,x=(f.x+Math.sin(t+f.y)*14+960)%960;cx.fillRect(x,y,f.s,f.s)}}
  function lant(x,y,s,g){cx.save();cx.translate(x,y);cx.scale(s,s);const rg=cx.createRadialGradient(0,0,1,0,0,42);rg.addColorStop(0,'rgba(255,236,180,'+(.55*g)+')');rg.addColorStop(1,'rgba(255,200,110,0)');cx.fillStyle=rg;cx.beginPath();cx.arc(0,0,42,0,6.283);cx.fill();poly([[-9,-12],[0,-20],[9,-12]],'#6b5036');cx.fillStyle='#ffd27a';cx.fillRect(-8,-12,16,22);cx.strokeStyle='#6b5036';cx.lineWidth=2;cx.strokeRect(-8,-12,16,22);cx.lineWidth=1.2;cx.beginPath();cx.moveTo(-3,-12);cx.lineTo(-3,10);cx.moveTo(3,-12);cx.lineTo(3,10);cx.stroke();cx.fillStyle='#4a3a2a';cx.fillRect(-10,10,20,4);cx.restore()}
  function watcher(x,y,s,bob){cx.save();cx.translate(x,y-bob);cx.scale(s,s);poly([[-16,-92],[-34,0],[34,0],[16,-92]],'#2a3550');cx.fillStyle='#c9b98a';cx.fillRect(-8,-88,16,82);
    for(const sx of[-1,1]){cx.fillStyle='#5d6f96';cx.beginPath();cx.ellipse(sx*15,-89,13,7,0,0,6.283);cx.fill()}
    cx.fillStyle='#5d6f96';cx.beginPath();cx.moveTo(-15,-92);cx.quadraticCurveTo(-19,-127,1,-128);cx.quadraticCurveTo(20,-127,18,-92);cx.closePath();cx.fill();cx.fillStyle='#bfeaff';cx.fillRect(-1,-109,18,5);
    cx.strokeStyle='#8a7a9a';cx.lineWidth=4;cx.beginPath();cx.moveTo(26,-2);cx.lineTo(30,-140);cx.stroke();cx.restore();lant(x+30*s,y-bob+(-152)*s,s,1)}
  function bell(x,y,s,a){cx.save();cx.translate(x,y);cx.rotate(a);cx.scale(s,s);const bg=cx.createLinearGradient(-60,0,60,0);bg.addColorStop(0,'#7a5524');bg.addColorStop(.45,'#d9a24c');bg.addColorStop(1,'#6b4a1a');cx.fillStyle=bg;cx.beginPath();cx.moveTo(-26,14);cx.quadraticCurveTo(-36,50,-60,108);cx.lineTo(60,108);cx.quadraticCurveTo(36,50,26,14);cx.closePath();cx.fill();cx.strokeStyle='rgba(255,226,150,.6)';cx.lineWidth=2;cx.beginPath();cx.moveTo(-40,84);cx.lineTo(40,84);cx.stroke();cx.restore()}
  function tower(x,top,w,lit){w*=2.2;cx.fillStyle='#141a3a';poly([[x-w/2,top],[x+w/2,top],[x+w*.75,540],[x-w*.75,540]],'#141a3a');cx.fillRect(x-w/2-3,top-4,w+6,5);poly([[x-w/2-4,top-4],[x,top-4-w*1.1],[x+w/2+4,top-4]],'#141a3a');cx.fillStyle='#0a0e24';cx.fillRect(x-w*.22,top+3,w*.44,w*.5);const r=10+22*lit,g=cx.createRadialGradient(x,top+10,1,x,top+10,r);g.addColorStop(0,'rgba(255,215,130,'+(.25+.6*lit)+')');g.addColorStop(1,'rgba(255,200,110,0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,top+10,r,0,6.283);cx.fill();cx.fillStyle=lit>.1?'#ffd27a':'#6a5a3a';cx.fillRect(x-2,top+7,4,6)}
  function sStatue(p,t){
    sky(t,'#03050f','#18204a',380);poly([[0,340],[160,290],[330,320],[520,280],[700,322],[960,300],[960,380],[0,380]],'#232c55');
    cx.save();const z=1.12-.12*p;cx.translate(480,300);cx.scale(z,z);cx.translate(-480,-300);
    cx.fillStyle='#2a2f4e';cx.beginPath();cx.moveTo(362,380);cx.lineTo(362,206);cx.quadraticCurveTo(480,100,598,206);cx.lineTo(598,380);cx.lineTo(566,380);cx.lineTo(566,218);cx.quadraticCurveTo(480,150,394,218);cx.lineTo(394,380);cx.closePath();cx.fill();
    poly([[340,184],[480,70],[620,184]],'#3c4268');cx.fillStyle='rgba(240,246,255,.85)';cx.fillRect(340,182,280,4);
    cx.fillStyle='#4a3626';cx.fillRect(390,196,180,8);bell(480,204,.8,Math.sin(t*1.6)*.06*Math.exp(-t*.25));
    cx.fillStyle='#4a5272';cx.fillRect(-60,380,1080,200);cx.fillStyle='rgba(240,246,255,.9)';cx.fillRect(-60,380,1080,5);
    /* le Colosse pétrifié, à genoux face au beffroi, la tête baissée, la main ouverte tendue avec un anneau */
    cx.save();cx.translate(720,378);cx.scale(1.05,1.05);
    const SG='#3b3a40',SL='#4a4950',SD='#2a292e';
    poly([[50,-190],[104,-262],[76,-176]],SD);poly([[40,-176],[88,-226],[62,-160]],SD);
    poly([[40,-172],[58,-150],[44,-108],[28,-118]],SD);
    poly([[-26,-30],[66,-26],[70,0],[-26,0]],SD);
    poly([[18,-112],[58,-96],[0,-14],[-30,-32]],SG);
    poly([[8,-100],[68,-100],[46,-200],[-26,-194]],SG);
    poly([[-46,-210],[-8,-216],[-4,-186],[-40,-184]],SL);poly([[-42,-208],[-64,-240],[-30,-214]],SL);poly([[-10,-214],[2,-246],[-4,-210]],SL);
    poly([[-14,-182],[0,-168],[-52,-118],[-68,-128]],SG);
    poly([[-72,-126],[-52,-112],[-58,-102],[-78,-114]],SL);
    cx.strokeStyle='#9aa0ae';cx.lineWidth=2.5;cx.beginPath();cx.arc(-66,-106,6,0,6.283);cx.stroke();
    cx.strokeStyle='#1c1b20';cx.lineWidth=2;cx.beginPath();cx.moveTo(24,-170);cx.lineTo(34,-140);cx.lineTo(24,-120);cx.moveTo(-6,-196);cx.lineTo(-2,-186);cx.stroke();
    cx.fillStyle='rgba(240,246,255,.8)';cx.fillRect(-22,-194,56,3);cx.fillRect(-44,-212,34,3);cx.fillRect(-26,-32,90,3);
    cx.fillStyle='rgba(255,140,60,'+(.12+.08*Math.sin(t*2))+')';cx.beginPath();cx.arc(24,-150,6,0,6.283);cx.fill();cx.restore();
    {const fx=250,fy=380;cx.fillStyle='#3a3f5e';cx.fillRect(fx-10,fy-64,20,64);cx.fillStyle='#4a5072';cx.fillRect(fx-14,fy-68,28,6);
     const g=cx.createRadialGradient(fx,fy-82,2,fx,fy-82,90);g.addColorStop(0,'rgba(255,214,130,.6)');g.addColorStop(1,'rgba(255,170,80,0)');cx.fillStyle=g;cx.beginPath();cx.arc(fx,fy-82,90,0,6.283);cx.fill();
     for(let i=-1;i<=1;i++){const h=24+12*Math.abs(Math.sin(t*9+i*2));cx.fillStyle=i?'rgba(255,170,70,.9)':'rgba(255,224,150,.95)';cx.beginPath();cx.moveTo(fx+i*9-7,fy-72);cx.quadraticCurveTo(fx+i*9+Math.sin(t*7+i)*3,fy-72-h*.6,fx+i*9,fy-72-h);cx.quadraticCurveTo(fx+i*9+Math.sin(t*6+i)*3,fy-72-h*.5,fx+i*9+7,fy-72);cx.closePath();cx.fill()}
     poly([[fx-22,fy-82],[fx+22,fy-82],[fx+14,fy-68],[fx-14,fy-68]],'#241b2a')}
    cx.restore();snow(t,.85)}
  function sValley(p,t){
    sky(t,'#05081c','#24305a',300);poly([[0,300],[200,240],[400,280],[600,230],[800,270],[960,250],[960,540],[0,540]],'#1b2346');poly([[0,380],[960,360],[960,540],[0,540]],'#141a36');
    cx.strokeStyle='#0c1026';cx.lineWidth=14;cx.beginPath();cx.moveTo(380,300);cx.quadraticCurveTo(480,250,580,300);cx.stroke();cx.lineWidth=6;cx.beginPath();cx.moveTo(480,262);cx.lineTo(480,300);cx.stroke();
    for(let i=0;i<14;i++){const x=120+i*55+(i%3)*8,y=410+(i%4)*22,on=Math.sin(t*.7+i*1.7)>-.6;cx.fillStyle='#0d1229';cx.fillRect(x,y,34,24);poly([[x-4,y],[x+17,y-16],[x+38,y]],'#0d1229');if(on){cx.fillStyle='rgba(255,210,120,.85)';cx.fillRect(x+12,y+8,8,8)}
      cx.fillStyle='rgba(150,160,190,.18)';for(let k=0;k<3;k++){const yy=y-18-((t*14+k*20+x)%60);cx.beginPath();cx.arc(x+28+Math.sin(t+k+x)*4,yy,3+k,0,6.283);cx.fill()}}
    cx.fillStyle='rgba(255,255,255,.12)';cx.fillRect(0,390+Math.sin(t)*2,960,1)}
  function sTowers(p,t,s){
    sky(t,'#04061a','#1c2650',330);poly([[0,330],[90,250],[170,300],[260,210],[360,290],[470,230],[560,300],[690,200],[800,290],[900,240],[960,280],[960,540],[0,540]],'#1a2148');poly([[0,420],[150,370],[300,410],[480,360],[640,400],[800,370],[960,410],[960,540],[0,540]],'#121835');
    const T=[[260,212,14],[690,202,12],[470,232,10],[900,242,9],[90,252,9],[360,292,8]];
    T.forEach((q,i)=>{const at=.5+i*.75,lit=clamp01((s-at)/.4);tower(q[0],q[1],q[2],lit);
      if(s>=at&&!st['tw'+i]){st['tw'+i]=1;tone([392,440,330,494,294,523][i],1.6,'sine',.05,0)}
      if(s>at&&s<at+2){const u=(s-at)/2;cx.strokeStyle='rgba(255,230,170,'+(1-u)+')';cx.lineWidth=2;cx.beginPath();cx.arc(q[0],q[1]+10,10+70*u,0,6.283);cx.stroke()}})}
  function sSea(p,t,s){
    const HZ=318;sky(t,'#03050f','#1c2a4a',HZ);cx.fillStyle='#eef2ff';cx.beginPath();cx.arc(200,90,16,0,6.283);cx.fill();
    const sg=cx.createLinearGradient(0,HZ,0,540);sg.addColorStop(0,'#16223e');sg.addColorStop(1,'#04070f');cx.fillStyle=sg;cx.fillRect(0,HZ,960,540-HZ);
    cx.strokeStyle='rgba(200,215,255,.1)';cx.lineWidth=1.5;for(let i=0;i<12;i++){const y=HZ+10+i*i*1.4,o=(t*(10+i*2)+i*90)%960;cx.beginPath();cx.moveTo(o-160,y);cx.lineTo(o-90,y);cx.stroke()}
    const z=1+es(clamp01(s/5))*.9;cx.save();cx.translate(640,HZ+6);cx.scale(z*1.6,z*1.6);cx.rotate(.14);poly([[-11,0],[-7,-62],[7,-62],[11,0]],'#0b1022');cx.fillStyle='#0b1022';cx.fillRect(-10,-70,20,8);poly([[-9,-70],[0,-82],[9,-70]],'#0b1022');
    const on=(Math.sin(t*2.3)>-.2?1:0)*(.35+.25*Math.sin(t*1.7));if(on){const g=cx.createRadialGradient(0,-66,1,0,-66,40);g.addColorStop(0,'rgba(140,255,230,'+(.8*on)+')');g.addColorStop(1,'rgba(80,200,220,0)');cx.fillStyle=g;cx.beginPath();cx.arc(0,-66,40,0,6.283);cx.fill()}
    cx.fillStyle=on?'#aaffeb':'#1a2440';cx.fillRect(-4,-69,8,6);cx.restore();
    /* au premier plan, depuis le Clocher, le Veilleur de dos regarde le phare */
    cx.fillStyle='#232a4a';cx.fillRect(0,470,960,70);for(let x=0;x<960;x+=110){cx.fillRect(x+14,446,58,26)}cx.fillStyle='rgba(10,14,34,.45)';for(let x=0;x<960;x+=60)cx.fillRect(x,500,2,40);cx.fillRect(0,500,960,2);cx.fillStyle='rgba(235,243,255,.55)';for(let x=0;x<960;x+=110){cx.fillRect(x+14,444,58,3)}cx.fillRect(0,468,960,3);
    {const wx=250,wy=468,c0='#070a18';cx.fillStyle=c0;cx.beginPath();cx.moveTo(wx-16,wy-92);cx.lineTo(wx-30,wy);cx.lineTo(wx+30,wy);cx.lineTo(wx+16,wy-92);cx.closePath();cx.fill();
     for(const sx of[-1,1]){cx.beginPath();cx.ellipse(wx+sx*15,wy-89,13,7,0,0,6.283);cx.fill()}
     cx.beginPath();cx.moveTo(wx-15,wy-92);cx.quadraticCurveTo(wx-18,wy-126,wx,wy-127);cx.quadraticCurveTo(wx+18,wy-126,wx+15,wy-92);cx.closePath();cx.fill();
     cx.strokeStyle=c0;cx.lineWidth=4;cx.beginPath();cx.moveTo(wx+24,wy-2);cx.lineTo(wx+30,wy-132);cx.stroke();lant(wx+31,wy-146,.85,.9+.1*Math.sin(t*3))}
    if(!st.muted&&s>3.2){st.muted=1;tone(147,2.4,'sine',.05,-20)}}
  function sDawn(p,t,s){
    const HZ=300,g=cx.createLinearGradient(0,0,0,HZ);g.addColorStop(0,'#1a2246');g.addColorStop(1,'#d9a07a');cx.fillStyle=g;cx.fillRect(0,0,960,HZ);
    cx.fillStyle='rgba(255,220,170,.6)';cx.beginPath();cx.arc(780,HZ,40+6*p,Math.PI,0);cx.fill();
    cx.fillStyle='#2a3a5a';cx.fillRect(0,HZ,960,540-HZ);cx.strokeStyle='rgba(255,220,180,.18)';cx.lineWidth=1.5;for(let i=0;i<10;i++){const y=HZ+8+i*i*2;cx.beginPath();cx.moveTo(700-i*20,y);cx.lineTo(860+i*20,y);cx.stroke()}
    cx.save();cx.translate(560,HZ+4);cx.rotate(.14);cx.fillStyle='#10182c';cx.fillRect(-5,-30,10,30);poly([[-5,-30],[0,-38],[5,-30]],'#10182c');cx.restore();
    poly([[0,400],[300,380],[520,430],[520,540],[0,540]],'#141a30');
    const x=110+es(clamp01(s/6))*300;watcher(x,400+(x-110)*.09,.8,Math.abs(Math.sin(s*6))*3)}
  function sTitle(p,t,s){
    cx.fillStyle='#02040a';cx.fillRect(0,0,960,540);const g=cx.createLinearGradient(0,200,0,540);g.addColorStop(0,'#02040a');g.addColorStop(1,'#06303a');cx.fillStyle=g;cx.fillRect(0,200,960,340);
    for(const b of BUB){const y=540-((t*30+b.o)%340);cx.fillStyle='rgba(140,255,230,.25)';cx.beginPath();cx.arc(b.x,y,b.r,0,6.283);cx.fill()}
    const yb=300+es(clamp01(s/4))*80;bell(480,yb-120,.7,Math.sin(t*.8)*.12);const k=.5+.5*Math.sin(t*2),gg=cx.createRadialGradient(480,yb,2,480,yb,120);gg.addColorStop(0,'rgba(120,255,225,'+(.25*k)+')');gg.addColorStop(1,'rgba(80,200,220,0)');cx.fillStyle=gg;cx.fillRect(300,yb-140,360,280);
    const a=clamp01((s-1)/1.5);cx.globalAlpha=a;cx.fillStyle='#e8f6ff';cx.textAlign='center';cx.font='700 22px '+DISPLAY;cx.fillText(_('LUMENBELL · CHAPTER II','LUMENBELL · CHAPITRE II'),480,118);cx.font='800 62px '+DISPLAY;cx.fillText('SILENT BELLS',480,182);cx.globalAlpha=1;cx.textAlign='start'}
  const DRAW=[sStatue,sValley,sTowers,sSea,sDawn,sTitle];
  function frame(now){
    if(!st)return;
    const dt=Math.min(.1,(now-st.last)/1000);st.last=now;st.t+=dt;
    let acc=0,i=0;for(;i<SC.length;i++){if(st.t<acc+SC[i].d)break;acc+=SC[i].d}
    if(i>=SC.length){finish();return}
    const s=SC[i],lt=st.t-acc,p=lt/s.d,al=Math.min(1,lt/.8,(s.d-lt)/.8);
    if(st.i!==i){st.i=i;cap.textContent=_(s.en,s.fr);if(i===0){tone(196,3,'sine',.07,0);tone(392,2.2,'sine',.03,0)}}
    cap.style.opacity=String(clamp01(Math.min(lt-.5,s.d-.5-lt)/.6));
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1;cx.fillStyle='#000';cx.fillRect(0,0,960,540);
    DRAW[i](p,st.t,lt);
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1-al;cx.fillStyle='#000';cx.fillRect(0,0,960,540);cx.globalAlpha=1;
    st.raf=requestAnimationFrame(frame);
  }
  const K=Math.min(2,COARSE?1.25:(window.devicePixelRatio||1));
  function finish(){if(!st)return;const d=st.done;cancelAnimationFrame(st.raf);st=null;box.hidden=true;try{d&&d()}catch(e){}}
  function play(done){
    if(st)return;ensureAudio();cvs.width=960*K;cvs.height=540*K;
    sk.textContent=_('Skip ›','Passer ›');cap.textContent='';cap.style.opacity='0';
    box.hidden=false;st={t:0,i:-1,last:performance.now(),done,raf:0};
    try{sk.focus({preventScroll:true})}catch(e){}
    st.raf=requestAnimationFrame(frame);
  }
  sk.addEventListener('click',()=>{if(st)finish()});
  window.addEventListener('keydown',e=>{if(!st)return;e.stopImmediatePropagation();e.preventDefault();if(e.key==='Escape'||e.key==='Enter'||e.key===' ')finish()},true);
  return{play,playing:()=>!!st};
})();
$('outroBtn').addEventListener('click',e=>{e.currentTarget.blur();OUTRO.play(()=>{})});

/* Chapitre II : verrouillé tant que la vraie fin n'a pas été vue (mémorisé dans le navigateur, quand c'est possible) */
function endSeen(){try{return localStorage.getItem('eb-end')==='1'}catch(e){return false}}
/* Épreuve du feu : meilleur temps affiché sous chaque difficulté (mémorisé dans le navigateur) */
function updBest(){for(const n of ['tn','th']){const sp=document.querySelector('#mphT [data-diff='+n+'] span');if(!sp)continue;let v=0;try{v=parseFloat(localStorage.getItem('eb-best-'+n))||0}catch(e){}sp.textContent=v?'🏆 '+fmtT(v):_('No record yet','Pas encore de record')}}
function updNext(){const b=$('mNext'),ok=endSeen();try{$('outroBtn').hidden=!ok}catch(e){}
  const tb=document.querySelector('#mphM [data-diff=trial]');tb.setAttribute('aria-disabled',String(!ok)); /* Épreuve du feu : débloquée par la vraie fin */
  tb.querySelector('b').textContent=ok?_('Trial by Fire','Épreuve du feu'):_('🔒 Trial by Fire','🔒 Épreuve du feu');
  tb.querySelector('span').textContent=ok?_('Ultimate challenge','Challenge ultime'):_('To unlock','À débloquer');b.classList.toggle('lock',!ok);
  b.querySelector('.nm').textContent=ok?_('Chapter II · Silent Bells','Chapitre II · Silent Bells'):_('🔒 Chapter II','🔒 Chapitre II');
  b.querySelector('.soon').textContent=_('Coming soon','À venir')}
$('mNext').addEventListener('click',e=>e.currentTarget.blur()); /* Chapitre II : « À venir » suffit, aucun message */
$('gateBtn').addEventListener('click',()=>{ensureAudio();$('gate').hidden=true;try{$('menu').querySelector('[data-diff=normal]').focus({preventScroll:true})}catch(e){}});
try{$('gateBtn').focus({preventScroll:true})}catch(e){}
let last=performance.now();
function frame(now){
  perfWatch(now-last);const dt=Math.min(.05,(now-last)/1000);last=now;
  if(RUN.on&&!paused&&el.ov.hidden&&menuEl.hidden){const S=R||Q||G;if(S&&S.mode==='play'){RUN.t+=dt;RUN.pt[R?2:Q?1:0]+=dt}}
  if(R){if(!paused)rStep(dt);renderR()}else if(Q){if(!paused)qStep(dt);renderQ()}else{if(!paused)step(dt);render()}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
