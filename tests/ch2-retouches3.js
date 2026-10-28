// Chapitre II : troisieme passe de retouches (branche ch2/retouches-3), sur la copie de test a crochets.
// 1. phase III : le Veilleur ne tombe plus a l'entree (S.heroDY = 0 a chaque pas de la cinematique), la scene se dessine sans erreur ;
// 2. decor de la phase III : table HULL (cotes, mat, ponts, pointes, flottants) et dessin sans erreur ;
// 3. onomatopees : CLANG au blocage dans les phases II et III, aucun mot en phase I ; seuls CLANG, KRAKOOM, KRAAAK existent ;
// 4. chocs d'impact : forme I et forme II de la phase III ont chacune leur son et leurs particules (table SHOCK.form), differents.
// Sortie attendue : errs []
const launch=require('./launch');const {open}=require('./ch2-bot');
const errs=[];
(async()=>{const b=await launch(),{pg,errs:perr}=await open(b);
 const R=await pg.evaluate(()=>{const T=__t,o={};T.startRun('normal',true);T.jumpPhase(3);const S=T.S;
  o.mode=S.mode;let maxDY=0,steps=0;
  for(let i=0;i<60*1.6&&S.mode==='cine';i++){T.step(1/60,true);maxDY=Math.max(maxDY,Math.abs(S.heroDY||0));steps++}
  o.maxDY=maxDY;o.steps=steps;
  o.hull={ribs:T.HULL.ribs.length,mast:!!T.HULL.mast,decks:T.HULL.decks.length,spikes:T.HULL.spikes.length,floats:T.HULL.floats.length};
  o.ono=T.ONO;
  for(let i=0;i<60*20&&S.mode!=='card';i++)T.step(1/60);T.go();T.step(.1,true);
  // onomatopoeias
  const pops=ph=>{S.phase=ph;S.pops=[];T.success({pat:{perf:0},k:'orb'},false);return S.pops.map(p=>p.txt)};
  o.pops={p1:pops(2),p2:pops(1),p3:pops(3)};
  // impacts
  S.phase=3;const fx=[],orig=T.MUSIC.fx;T.MUSIC.fx=n=>{fx.push(n)};const res={};
  for(const f of [1,2]){S.form=f;S.parts=[];S.bossHp=S.bossMax;fx.length=0;T.damageBoss(1);res[f]={fx:fx.slice(),snd:T.SHOCK.form[f].snd,sndOk:typeof T.sfx[T.SHOCK.form[f].snd]==='function',n:S.parts.length,cols:[...new Set(S.parts.map(p=>p.c))],g:S.parts.map(p=>p.g)[0]};T.step(.5,true)}
  T.MUSIC.fx=orig;o.shock=res;
  for(const f of [1,2]){S.form=f;S.mode='play';S.bossHp=S.bossMax;for(let i=0;i<30;i++)T.step(1/60,true)}
  return o});
 console.log(JSON.stringify(R));
 if(R.maxDY!==0)errs.push('le Veilleur tombe encore a l\'entree de la phase III (heroDY max '+R.maxDY+')');
 if(R.steps<60)errs.push('cinematique d\'entree trop courte dans le test : '+R.steps);
 const H=R.hull;if(!(H.ribs>=4&&H.mast&&H.decks>=3&&H.spikes>=4&&H.floats>=3))errs.push('decor de la phase III incomplet '+JSON.stringify(H));
 if(JSON.stringify(R.ono)!==JSON.stringify({block:'CLANG',final:'KRAKOOM',crush:'KRAAAK'}))errs.push('ONO : '+JSON.stringify(R.ono));
 if(R.pops.p1.length)errs.push('phase I : mot affiche '+R.pops.p1);
 if(R.pops.p2.join()!=='CLANG')errs.push('phase II : '+R.pops.p2);
 if(R.pops.p3.join()!=='CLANG')errs.push('phase III : '+R.pops.p3);
 const s1=R.shock[1],s2=R.shock[2];
 if(s1.fx.join()!=='bellHit'||s2.fx.join()!=='jellyHit')errs.push('sons de choc : '+s1.fx+' / '+s2.fx);
 if(s1.snd===s2.snd||!s1.sndOk||!s2.sndOk)errs.push('sons de coup : '+s1.snd+' / '+s2.snd);
 if(JSON.stringify(s1.cols)===JSON.stringify(s2.cols)||!s2.cols.every(c=>c.startsWith('rgba')))errs.push('particules identiques ou non translucides');
 if(!(s1.n>0&&s2.n>0))errs.push('pas de particules');
 errs.push(...perr);
 console.log('errs',JSON.stringify(errs));await b.close();process.exit(errs.length?1:0)})();
