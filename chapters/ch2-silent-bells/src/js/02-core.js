const $=id=>document.getElementById(id);
/* save keys and language: common to the series (shared/, LB.store, LB.key, LB.lang). Common keys lb-lang, lb-snd, lb-mus,
   lb-help (old pn-lang, eb-lang, db-opt*: LB.OLD_KEYS); this chapter's keys lb-ch2-* (unlock, records), old db-unl, db-best-*. */
LB.setup({id:'ch2',old:{'lb-ch2-unl':['db-unl']},oldPrefix:[['lb-ch2-best-','db-best-']],audio:{master:.75,sfx:.9,mus:.3}});
const OPT_KEY={optHelp:LB.key('help')};
/* UNLOCK_ALL: true = the three phases are open from the start (phase track), as in Ember Bridge; the difficulties and the
   Trial are always open. false = progressive unlock: a phase opens once the previous one is cleared (key lb-ch2-unl, still
   written on every clear). Disabled for testing; idea to extend to the whole series later (common screen). */
const UNLOCK_ALL=true;
const unlocked=()=>UNLOCK_ALL?3:+LB.store.get(LB.key('unl'),1);
const _=LB._;

/* ---------- constants ---------- */
const W=960,H=540,GY=430,HX=230,HY=GY-70;
/* Difficulty, same values as Ember Bridge for the Watcher: hp = Watcher HP (6 / 4 / 3, trial 4 for the whole run);
   m = multiplier of the Watcher's action (block, side step, held block: x2 / x1 / x0.6) and rm of his recovery (x1.2 in Hard),
   as applyDiff() in Ember Bridge; sp = attack speed; boss = boss HP (kept from the import until playtests);
   heal = HP refilled between phases; u = boss HP at which a rage starts (one in Easy and Normal, two in Hard, as in
   Ember Bridge, where Normal raged at 5 of 10 HP and Hard at 10 and 5 of 14: same proportions here). */
const DIFFS={
  easy:{hp:6,m:2,rm:1,sp:.85,boss:6,u:[3],heal:true,fr:'Facile',en:'Easy'},
  normal:{hp:4,m:1,rm:1,sp:1,boss:8,u:[4],heal:true,fr:'Normal',en:'Normal'},
  hard:{hp:3,m:.6,rm:1.2,sp:1.18,boss:10,u:[7,4],heal:true,fr:'Difficile',en:'Hard'},
  tn:{hp:4,m:1,rm:1,sp:1,boss:8,u:[4],heal:false,trial:true,fr:'Épreuve · Normal',en:'Trial · Normal'},
  th:{hp:4,m:.6,rm:1.2,sp:1.18,boss:10,u:[7,4],heal:false,trial:true,fr:'Épreuve · Difficile',en:'Trial · Hard'}
};
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const eio=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, eout=t=>1-Math.pow(1-t,3), ein=t=>t*t*t;
const pick=a=>a[Math.floor(Math.random()*a.length)];
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------- canvas ---------- */
let ctx=document.createElement('canvas').getContext('2d');let SC=1;const hasFilter='filter' in ctx;

/* ---------- state ---------- */
let gt=0,rt=0;
let S=fresh('normal');S.mode='menu';
function fresh(dk){const d=DIFFS[dk];return{dk,d,phase:1,mode:'card',paused:false,hp:d.hp,hpMax:d.hp,bossHp:d.boss,bossMax:d.boss,
  threats:[],pat:null,nextAt:0,cnt:null,pl:newPl(),held:false,guardT:-9,okT:-9,hurtT:-9,dodgeT:-9,foolT:-9,holding:false,stam:1,broken:0,
  hits:0,perfects:0,runT:0,full:true,parts:[],pops:[],shake:0,bossFlash:-9,koT:0,deadT:0,deadShown:false,lastK:''}}

function say(t){$('live').textContent=t}

