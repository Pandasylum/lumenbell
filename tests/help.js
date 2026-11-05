// Aide visuelle commune (LB.help, LB.cue, shared/js/28-ui.js ; decisions n° 3 et 8 du 28 octobre, session menu/common).
//  1. dist, sans cle : case decochee au chargement ; Facile ne la coche pas (Chapitre II : plus d'aide cochee d'office) ;
//     Difficile : case desactivee, decochee, Off, lb-help intact (comme l'Epreuve ; decision 2026-11-04-aide-difficile) ;
//  2. copies de test : 3e defaite en Facile sans aide -> la carte propose « Activer l'aide visuelle » (go2), pas avant ; le
//     bouton coche la case, ecrit lb-help et relance la phase ; une fois l'aide active, plus de proposition ; Normal et Epreuve :
//     jamais ;
//  3. repere : avec l'aide, barre au-dessus de la tete en Normal (LB.cue.bar), cercle en Facile (pas de barre) ; sans l'aide,
//     rien, y compris en Difficile meme si lb-help vaut oui (Chapitre I : trois secondes de la phase I en temps reel ; Chapitre II : phase I au pas fixe, dessin compris).
// Sortie attendue : errs []
const path=require('path');const launch=require('./launch');const {testPage}=require('./ch2-lib');
const ROOT=path.resolve(__dirname,'..');
const F={ch1:path.join(ROOT,'chapters/ch1-ember-bridge/dist/index.html'),ch2:path.join(ROOT,'chapters/ch2-silent-bells/dist/index.html')};
const OFFER={fr:"Activer l'aide visuelle",en:'Enable visual help'};
const errs=[],check=(c,m)=>{if(!c)errs.push(m)};
const card=()=>({vis:!document.getElementById('ov').hidden,go2:document.getElementById('go2').hidden?null:document.getElementById('go2').textContent,desc:document.getElementById('ovDesc').textContent,
 help:window.__t.LB.help.on(),key:localStorage.getItem('lb-help')});
const SPY=()=>{const L=window.__t.LB;window.__c={bar:0,ring:0,cue:0,easy:0};const B=L.cue.bar,R=L.cue.ring,C=L.cue;
 L.cue=function(ctx,o){window.__c.cue++;if(o.easy)window.__c.easy++;return C.apply(this,arguments)};L.cue.bar=function(){window.__c.bar++;return B.apply(this,arguments)};L.cue.ring=function(){window.__c.ring++;return R.apply(this,arguments)}};
(async()=>{const b=await launch();
 // 1. dist
 for(const ch of ['ch1','ch2']){const ctx=await b.newContext({viewport:{width:1100,height:760},locale:'fr-FR'});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+': pageerror: '+e.message));
  await pg.goto('file://'+F[ch]);await pg.waitForTimeout(300);const st=()=>pg.evaluate(()=>{const r=((id)=>{const g=document.getElementById('mGear');g.click();const q=s=>document.querySelector('#lbSet [data-id='+id+'] '+s),b=q('button[aria-pressed=true]'),d=q('button').disabled;g.click();return{on:!!b&&b.dataset.v==='true',dis:d}})('help');return{on:r.on,dis:r.dis,hid:false}   /* cases retirees : roue de reglages */});
  const s0=await st();
  const r={};for(const d of ['easy','hard']){await pg.evaluate(()=>{const m=document.getElementById('menuBtn');if(document.getElementById('menu').hidden)m.click()});
   await pg.evaluate(d=>document.querySelector('#mphM [data-diff='+d+']').click(),d);await pg.waitForTimeout(300);
   if(await pg.evaluate(()=>!!document.getElementById('cine')&&!document.getElementById('cine').hidden)){await pg.keyboard.press('Escape');await pg.waitForTimeout(200)}
   r[d]=await st()}
  check(!s0.on,ch+': aide cochee au chargement sans cle');check(!r.easy.on&&!r.easy.dis,ch+': Facile '+JSON.stringify(r.easy));check(!r.hard.on&&r.hard.dis&&!r.hard.hid,ch+': Difficile '+JSON.stringify(r.hard));
  console.log(ch,'case',JSON.stringify({chargement:s0,...r}));await ctx.close()}
 // 2. et 3. Chapitre I
 {const ctx=await b.newContext({viewport:{width:1100,height:760},locale:'fr-FR'});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push('ch1: pageerror: '+e.message));
  await pg.goto('file://'+path.join(ROOT,'build/out/test.html'));await pg.waitForTimeout(300);
  const lose=d=>pg.evaluate(()=>{const T=window.__t;T.getG().mode='lost';T.showEnd()});
  for(const d of ['easy','normal','tn']){
   await pg.evaluate(d=>{const T=window.__t;T.applyDiff(d);T.goPhase(1);T.start()},d);const seq=[];
   for(let i=0;i<4;i++){await lose();seq.push(await pg.evaluate(card))}
   const offers=seq.map(s=>s.go2===OFFER.fr);
   if(d==='easy'){check(JSON.stringify(offers)==='[false,false,true,false]'&&/repères visuels/.test(seq[2].desc),'ch1 Facile : proposition '+JSON.stringify(seq));
    // la 4e carte n'offre rien parce que la 3e n'a pas ete acceptee et que le compte est passe ; on refait le parcours et on accepte
    await pg.evaluate(()=>{const T=window.__t;T.applyDiff('easy');T.goPhase(1);T.start()});for(let i=0;i<3;i++)await lose();
    await pg.click('#go2');await pg.waitForTimeout(200);const s=await pg.evaluate(card);check(s.help&&s.key==='1'&&!s.vis,'ch1 Facile : « Activer l\'aide » '+JSON.stringify(s));
    for(let i=0;i<3;i++)await lose();check((await pg.evaluate(card)).go2===null,'ch1 Facile : proposition alors que l\'aide est active')}
   else check(!offers.some(x=>x),'ch1 '+d+' : proposition hors Facile '+JSON.stringify(offers));
   console.log('ch1',d,'propositions',JSON.stringify(offers))}
  // repere : Normal et Facile, aide cochee puis decochee
  await pg.evaluate(SPY);
  for(const [d,on] of [['normal',true],['easy',true],['normal',false],['hard',true]]){
   await pg.evaluate(([d,on])=>{const T=window.__t;T.applyDiff(d==='hard'?'normal':d);if(T.LB.help.on()!==on){T.LB.settings.toggle(true);document.querySelector('#lbSet [data-id=help] [data-v='+on+']').click();T.LB.settings.toggle(false)}if(d==='hard')T.applyDiff('hard');T.goPhase(1);T.start();T.adv(4.2);T.getG().php=99;window.__c={bar:0,ring:0,cue:0,easy:0}},[d,on]);
   await pg.waitForTimeout(3500);const c=await pg.evaluate(()=>window.__c);
   if(!on||d==='hard')check(c.bar+c.ring===0,'ch1 '+(on?'Difficile (lb-help oui)':'sans aide')+' : repere dessine '+JSON.stringify(c));else if(d==='normal')check(c.bar>0&&c.ring===0,'ch1 Normal : '+JSON.stringify(c));else check(c.ring>0&&c.bar===0,'ch1 Facile : '+JSON.stringify(c));
   console.log('ch1 repere',d,on?'aide':'sans aide',JSON.stringify(c))}
  await ctx.close()}
 // 2. et 3. Chapitre II
 {const ctx=await b.newContext({viewport:{width:1100,height:760},locale:'fr-FR'});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push('ch2: pageerror: '+e.message));
  await pg.goto('file://'+testPage());await pg.waitForTimeout(300);
  const step=(s,draw)=>pg.evaluate(([s,draw])=>{for(let i=0;i<Math.round(s*60);i++)window.__t.step(1/60,draw&&i%3===0)},[s,!!draw]);
  for(const d of ['easy','normal','tn']){
   await pg.evaluate(d=>{const T=window.__t;T.LB.help.use(T.DIFFS[d]);T.startRun(d,true)},d);const seq=[];
   for(let i=0;i<4;i++){await pg.evaluate(()=>window.__t.deathCard());seq.push(await pg.evaluate(card))}
   const offers=seq.map(s=>s.go2===OFFER.fr);
   if(d==='easy'){check(JSON.stringify(offers)==='[false,false,true,false]','ch2 Facile : proposition '+JSON.stringify(seq.map(s=>s.go2)));
    await pg.evaluate(()=>{const T=window.__t;T.LB.help.use(T.DIFFS.easy);T.startRun('easy',true);for(let i=0;i<3;i++)T.deathCard()});
    await pg.click('#go2');await pg.waitForTimeout(100);const s=await pg.evaluate(card);check(s.help&&s.key==='1'&&!s.vis&&await pg.evaluate(()=>window.__t.S.mode)==='play','ch2 Facile : « Activer l\'aide » '+JSON.stringify(s));
    await pg.evaluate(()=>{for(let i=0;i<3;i++)window.__t.deathCard()});check((await pg.evaluate(card)).go2!==OFFER.fr,'ch2 Facile : proposition alors que l\'aide est active')}
   else check(!offers.some(x=>x),'ch2 '+d+' : proposition hors Facile '+JSON.stringify(offers));
   console.log('ch2',d,'propositions',JSON.stringify(offers))}
  await pg.evaluate(SPY);
  for(const [d,on] of [['normal',true],['easy',true],['normal',false],['hard',true]]){
   await pg.evaluate(([d,on])=>{const T=window.__t;T.LB.help.use(T.DIFFS[d==='hard'?'normal':d]);if(T.LB.help.on()!==on){T.LB.settings.toggle(true);document.querySelector('#lbSet [data-id=help] [data-v='+on+']').click();T.LB.settings.toggle(false)}if(d==='hard')T.LB.help.use(T.DIFFS.hard);T.startRun(d,true)},[d,on]);
   for(let i=0;i<30&&await pg.evaluate(()=>window.__t.S.mode)!=='card';i++)await step(.5);await pg.evaluate(()=>window.__t.go());
   await pg.evaluate(()=>{const S=window.__t.S;S.hp=S.hpMax=99;window.__c={bar:0,ring:0,cue:0,easy:0}});await step(12,true);const c=await pg.evaluate(()=>window.__c);
   if(!on||d==='hard')check(c.cue===0,'ch2 '+(on?'Difficile (lb-help oui)':'sans aide')+' : repere dessine '+JSON.stringify(c));else if(d==='normal')check(c.bar>0&&c.easy===0,'ch2 Normal : '+JSON.stringify(c));else check(c.easy>0&&c.bar===0,'ch2 Facile : '+JSON.stringify(c));
   console.log('ch2 repere',d,on?'aide':'sans aide',JSON.stringify(c))}
  await ctx.close()}
 console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
