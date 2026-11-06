const $=LB.$;
/* save keys and language: common to the series (shared/, LB.store, LB.key, LB.lang). Common keys lb-lang, lb-snd, lb-mus,
   lb-help (old pn-lang, eb-lang, db-opt*: LB.OLD_KEYS); this chapter's keys lb-ch2-* (unlock, records), old db-unl, db-best-*. */
LB.setup({id:'ch2',old:{'lb-ch2-unl':['db-unl']},oldPrefix:[['lb-ch2-best-','db-best-']],audio:{master:.75,sfx:.9,mus:.3}});
/* UNLOCK_ALL: true = the three phases are open from the start (phase track), as in Ember Bridge; the difficulties and the
   Trial are always open. false = progressive unlock: a phase opens once the previous one is cleared (key lb-ch2-unl, still
   written on every clear). Disabled for testing; idea to extend to the whole series later (common screen). */
const UNLOCK_ALL=true;
const unlocked=()=>UNLOCK_ALL?3:+LB.store.get(LB.key('unl'),1);
const _=LB._;
/* TRIAL_OPEN: true = the Trial is open from the start (testing, as in Chapter I); false = opened by the true ending (lb-ch2-end,
   written at the victory, which also shows « ▶ Outro » in the menu). */
const TRIAL_OPEN=true;
const endSeen=LB.endSeen; /* true ending seen: shared/js/04-store.js */
/* the chapter's table for the series frame (menu, start screen, cards, HUD: shared/js/28-ui.js, docs/COMMUN.md § 3.1) */
const CHAPTER={n:2,id:'ch2',
  title:'Silent Bells',
  color:'#4fe0cc',color2:'#9fe4ff',rgb:'79,224,204',
  menu:{bg:'#04070b',glowA:.3,titleA:.4,particles:'spray',t:{glowMin:.5}},
  trial:{name:()=>_('Trial by Water',"Épreuve de l'eau")},
  player:()=>_('The Watcher','Le Veilleur'),help:{},
  trialOpen:()=>TRIAL_OPEN||endSeen(),endSeen,best:n=>+LB.store.get(LB.key('best-'+n),0)||0,fmt:t=>fmt(t)
};
/* card and pause of the series (LB.card, LB.pause); the menu and the start screen are mounted in 96-loop.js */
LB.card.mount($('stage'),$('menu'));LB.pause.mount($('stage'),$('menu'));

/* ---------- constants ---------- */
const W=960,H=540,GY=430,HX=230,HY=GY-70;
/* Difficulty. The Watcher's own settings (hp = HP 6 / 4 / 3, trial 4 at the start and +1 between phases, capped at 4; m = multiplier of his action,
   x2 / x1 / x0.6; rm = of his recovery, x1.2 in Hard) are LB.HERO_DIFF (shared/js/16-hero.js), merged into each entry by
   LB.diff.apply (the trial entries 'tn' / 'th' take the base difficulty of Normal / Hard); bd = boss HP and rage thresholds of phases I-II and III,
   from LB.BOSS_DIFF (shared/js/18-boss-diff.js: hp, hp3, rages, rages3); heal = HP refilled between phases (true = all, a number = that many, capped at the starting HP). */
/* La Voix (phase I) attacks 10 % faster in the three difficulties (exception to Chapter I): the one constant, read by spawn() for
   the Voice only. Gaps between real impacts (VX.gap) are absolute seconds and stay respected. */
const VOICE_SPEED=1.1;
const DIFFS={
  easy:{heal:true,fr:'Facile',en:'Easy'},
  normal:{heal:true,fr:'Normal',en:'Normal'},
  hard:{heal:true,hard:true,fr:'Difficile',en:'Hard'},
  tn:{trial:true,fr:'Épreuve · Normal',en:'Trial · Normal'},
  th:{hard:true,trial:true,fr:'Épreuve · Difficile',en:'Trial · Hard'}
};
for(const k of Object.keys(DIFFS)){const base={tn:'normal',th:'hard'}[k]||k;DIFFS[k]=LB.diff.apply(base,DIFFS[k]);DIFFS[k].bd=LB.bossDiff(base,'ch2')}
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const eio=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, eout=t=>1-Math.pow(1-t,3), ein=t=>t*t*t;
const pick=a=>a[Math.floor(Math.random()*a.length)];
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------- canvas ---------- */
let ctx=document.createElement('canvas').getContext('2d');let SC=1;const hasFilter='filter' in ctx;

/* ---------- state ---------- */
let gt=0,rt=0;
let S=fresh('normal');S.mode='menu';
function fresh(dk){const d=LB.diff.use(DIFFS[dk]);return{dk,d,phase:1,mode:'card',paused:false,hp:d.hp,hpMax:d.hp,bossHp:d.bd.hp,bossMax:d.bd.hp,
  threats:[],pat:null,nextAt:0,cnt:null,pl:newPl(),held:false,guardT:-9,okT:-9,hurtT:-9,dodgeT:-9,foolT:-9,holding:false,broken:0,
  hits:0,perfects:0,runT:0,full:true,parts:[],pops:[],shake:0,bossFlash:-9,koT:0,deadT:0,deadShown:false,lastK:''}}

function say(t){$('live').textContent=t}

