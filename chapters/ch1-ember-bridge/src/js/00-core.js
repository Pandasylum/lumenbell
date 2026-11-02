/* Sauvegarde et langue : communes à la série (shared/, clés lb-…). Anciennes clés du Chapitre I (eb-…) lues si la nouvelle manque :
   eb-lang (langue, avec pn-lang : LB.OLD_KEYS), eb-intro, eb-end, eb-best-<mode>. */
LB.setup({id:'ch1',old:{'lb-ch1-intro':['eb-intro'],'lb-ch1-end':['eb-end']},oldPrefix:[['lb-ch1-best-','eb-best-']]});
const _=LB._;
const W=960,H=540,DECK=410,PX=250,BX=730;
/* Difficulté. hp/bhp : PV du Veilleur/Colosse ; m : multiplicateur des fenêtres de blocage et d'esquive ; u : PV du Colosse où se déclenchent les attaques de rage en phases II et III ;
   jets : jets de feu de la Fureur ; fury : PV du Colosse → type de fureur en phase I ; les repères de la jauge du Colosse sont calculés
   depuis les rages (rageHp, LB.hud.marks) ; l'aide visuelle est disponible partout sauf en Épreuve (LB.help) ;
   easy : aides et allègements, repères en cercle, pas de seconde vie en phase III (la foudre mène droit à la vraie fin) ;
   hard : attaques en plus (double fouet, épée à 3 coups, souffles enchaînés, rages à séquences) ; fm : fenêtre du souffle ; rm : récupération après blocage ;
   t : durées de la phase I remplacées ; waitMin/waitMax : pause entre attaques ; chain : [PV, chance] d'un souffle enchaîné ; rbhp/ru : PV du Colosse et PV de la première rage en phase III ; u2 : PV de la rage en deux temps (phase III Difficile) ; q2/rages : phase II Difficile (attaques à 4 griffes, 5 vagues, boulette de feu, cris avec éboulement, balayage de queue). */
const DIFFS={
  easy:{bhp:8,u:4,jets:2,easy:true,fury:{4:5,1:1}},
  normal:{bhp:10,u:5,jets:4,easy:false,fury:{5:5,1:1}},
  hard:{bhp:14,fm:1,u:10,jets:4,easy:false,hard:true,q2:true,u2:5,rages:[10,5],fury:{10:5,5:6,1:1},rbhp:12,ru:8,
        t:{windup:.5,strike:.42,sw1w:.75,sw1:.26,swgap:.22,sw2w:.15,sw2:.26,sw3g:.27,sw3w:.34,sw3:.26,fli:.5,stagger:.6,swrec:.65,flrec:.65,fyt:.36,fyg:.05},waitMin:.5,waitMax:.9,chain:[[5,.75],[10,.4]]}
};
/* Phase III : PV du Colosse (rbhp) et PV de la première rage (ru) ; par défaut identiques aux autres phases */
for(const k of ['easy','normal','hard']){const d=DIFFS[k];d.rbhp=d.rbhp||d.bhp;d.ru=d.ru||d.u}
DIFFS.tn=Object.assign({},DIFFS.normal,{trial:true});DIFFS.th=Object.assign({},DIFFS.hard,{trial:true});
/* PV du Veilleur (hp), multiplicateurs m et rm : LB.HERO_DIFF (shared/js/16-hero.js), fusionnés ici ; l'Épreuve (tn, th) prend 4 PV au départ et +1 PV entre les phases (heal) */
for(const k of Object.keys(DIFFS))DIFFS[k]=LB.diff.apply({tn:'normal',th:'hard'}[k]||k,DIFFS[k]);
/* Épreuve du feu ouverte pendant les tests (décision du 28 octobre) ; false rétablit le verrou par la vraie fin (84-loop.js) */
const TRIAL_OPEN=true;
/* PV du Colosse où part chaque rage, par phase (1 à 3) : repères de sa jauge (LB.hud.marks, plus la case du dernier PV) */
const rageHp=(d,ph)=>ph===3?(d.u2?[d.ru,d.u2]:[d.ru]):(d.rages||[d.u]);
/* Table du chapitre pour le cadre commun (menu, écran de démarrage, cartes, HUD : shared/js/28-ui.js, docs/COMMUN.md § 3.1) */
const CHAPTER={n:1,id:'ch1',
  title:'Ember Bridge',
  color:'#ff7a2b',color2:'#ffc15a',rgb:'255,122,43',
  menu:{bg:'#08060d',glowA:.38,titleA:.45,particles:'embers'},
  tag:()=>_('The Watcher faces the Ember Colossus: on the bridge, in the Foundry, then atop the Bell Tower.','Le Veilleur affronte le Colosse de braise : sur le pont, dans la Fonderie, puis au sommet du Clocher.'),
  how:()=>_('One button: block, dodge. Space, up arrow or tap the screen. P to pause.',"Un seul bouton : bloquer, esquiver. Espace, flèche haut ou toucher l'écran. P pour la pause."),
  trial:{name:()=>_('Trial by Fire','Épreuve du feu')},
  player:()=>_('The Watcher','Le Veilleur'),boss:()=>_('Ember Colossus','Colosse de braise'),
  help:{offer:()=>_(` Visual cues can help you find the right moment to block.`,` Des repères visuels peuvent t'aider à choisir le bon moment pour bloquer.`)},
  trialOpen:()=>trialOpen(),endSeen:()=>endSeen(),best:n=>parseFloat(LB.store.get(LB.key('best-'+n),'0'))||0,fmt:t=>fmtT(t)
};
/* Épreuve du feu : les 3 phases d'affilée, 4 PV au départ, +1 PV entre les phases (plafond : les 4 PV de départ, RUN.max), une mort = retour à la phase I. */
const RUN={on:false,max:4,cur:4,n:1,t:0,pt:[0,0,0],st:{},name:'tn'};
function startHP(){return RUN.on?RUN.cur:DIFF.hp}
let DIFF=LB.diff.use(DIFFS.normal),BRW=.2;
const RKX=[PX+330,PX+190,PX+440];
const T={windup:.75,strike:0.5,rebound:0.42,stagger:.75,sw1w:.9,sw1:.3,swgap:.45,sw2w:.4,sw2:.3,swrec:.8,cast:.5,orb:.45,fli:.6,flo:.25,flwin:.2,flrec:.8,dash:.28,back:.5,ringAt:.5};
T.sw3g=.32;T.sw3w=.4;T.sw3=.3;
T.fyt=.45;T.fyg=.15; /* fureur : annonce d'un jet, pause entre deux jets */
T.hitSw=.3;T.hitSwLast=.55;T.hitFl=.9;T.hitFy=.55; /* phase I : étourdissement fixe après un coup de marteau (non dernier / dernier), un souffle, une fureur ; le Veilleur a le temps de bloquer le coup suivant */
const HD=g=>LB.hero.dur(g); /* durées du Veilleur (action, récupération, grâce) pour la difficulté en cours */
const DMG_GRAB=1,DMG_BLOCK=1,DMG_SWORD=1,DMG_ORB=1,DMG_FLAME=1,DMG_STAB=1,LIFT_MAX=170;
const DISPLAY=LB.FONT.display;

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
/* carte et pause communes (LB.card, LB.pause), créées avant `el` ; le menu et l'écran de démarrage le sont dans 60-ui-menu.js */
LB.card.mount($('stage'),$('menu'));LB.pause.mount($('stage'),$('menu'));
const el={hpP:$('hpP'),hpB:$('hpB'),ov:$('ov'),eye:$('ovEye'),title:$('ovTitle'),stats:$('ovStats'),table:$('ovTable'),desc:$('ovDesc'),go:$('go'),go2:$('go2'),ward:$('ward'),live:$('live'),help:$('optHelp'),snd:$('optSnd')};
/* Aide : LB.help (lb-help, décochée par défaut) ; Son et Musique : LB.audio.sound / LB.audio.music (lb-snd, lb-mus) */
let paused=true,pendingLore=false;
const LORE={
  2:{get eye(){return _('Phase II · The Foundry','Phase II · La Fonderie')},get title(){return _('Into the Foundry.','Dans la Fonderie.')},get desc(){return _(`The forge shaft plunges endlessly down. Chains too large for a man's hand hang from the walls, rusted by centuries.`,`Le puits des forges s'enfonce sans fin. Aux parois pendent des chaînes trop grandes pour une main d'homme, rouillées de siècles.`)}},
  3:{get eye(){return _('Phase III · The Bell Tower','Phase III · Le Clocher')},get title(){return _(`The Watchers' Bell Tower.`,`Le Clocher des Veilleurs.`)},get desc(){return _(`After a chase up the forge chimney, the Colossus is caught atop the Watchers' Bell Tower. An echo of the past rings out.`,`Après une poursuite le long de la cheminée des forges, le Colosse est rattrapé au sommet du Clocher des Veilleurs. Un écho du passé résonne.`)}}
};
function showLore(n){
  const L=LORE[n];
  paused=true;pendingLore=true;LB.card.show({eye:L.eye,title:L.title,desc:L.desc,go:_('Continue','Continuer'),onGo:start});
}
const reduce=LB.motion.reduced();   /* mouvement réduit : réglage du hub (lb-pref-motion), sinon le système */

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

let G=null;

