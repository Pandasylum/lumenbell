// Intro et outro des deux chapitres (LB.cine, shared/js/24-cine.js) : passage et drapeau « intro vue ».
// 1. dist publies (temps reel) : pour chaque chapitre et chaque facon de passer (Echap, Entree, Espace, bouton « Passer ») :
//    contexte vide -> Normal lance l'intro (#cine visible, drapeau lb-chN-intro absent) ; passer -> #cine cache, drapeau a '1',
//    carte de la phase I affichee (Chapitre II : cinematique d'entree de la phase I, bouton #skip du jeu) ; rechargement -> Normal ne rejoue pas l'intro ; Chapitre II : nouvelle partie depuis le menu
//    sans prologue. Anciennes cles du Chapitre I (eb-intro) lues comme avant.
// 2. outro du Chapitre I (bouton du menu, lb-ch1-end pose) : passe par Espace, aucun drapeau ecrit, rejouable.
// 3. copies de test a crochets (pas fixe, LB.cine.manual) : intro jouee jusqu'au bout -> drapeau ecrit sans passer ; rejeu
//    (replay) d'une intro deja vue ; epilogue du Chapitre II : passe par Espace, rappel appele, pas de drapeau ; dernier carton
//    de l'epilogue teinte de la couleur du Chapitre III.
// Usage : node cine.js (python3 build/build_test.py avant). Sortie attendue : errs []
const path=require('path');const launch=require('./launch');const {testPage}=require('./ch2-lib');
const ROOT=path.resolve(__dirname,'..'),errs=[];
const DIST={ch1:path.join(ROOT,'chapters/ch1-ember-bridge/dist/index.html'),ch2:path.join(ROOT,'chapters/ch2-silent-bells/dist/index.html')};
const KEY={ch1:'lb-ch1-intro',ch2:'lb-ch2-intro'};
const check=(c,msg)=>{if(!c)errs.push(msg)};
async function state(pg,ch){return pg.evaluate(k=>({cine:!document.getElementById('cine').hidden,flag:localStorage.getItem(k),
 card:!document.getElementById('ov').hidden||!document.getElementById('skip')?.hidden&&!!document.getElementById('skip'),menu:!document.getElementById('menu').hidden}),KEY[ch])}
async function startNormal(pg,ch){
 if(ch==='ch1'){await pg.evaluate(()=>{const g=document.getElementById('gateBtn');if(g&&!document.getElementById('gate').hidden)g.click()})}
 await pg.click('#mphM [data-diff=normal]');await pg.waitForTimeout(400)}
(async()=>{const b=await launch();
 // 1. passage et drapeau, dist publies
 for(const ch of ['ch1','ch2'])for(const how of ['Escape','Enter','Space','bouton']){
  const tag=ch+' '+how,ctx=await b.newContext({viewport:{width:1100,height:760},locale:'fr-FR'});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(tag+': pageerror: '+e.message));
  await pg.goto('file://'+DIST[ch]);await pg.waitForTimeout(200);
  await startNormal(pg,ch);let s=await state(pg,ch);
  check(s.cine,tag+': intro absente au premier lancement');check(s.flag===null,tag+': drapeau deja ecrit pendant l\'intro ('+s.flag+')');
  const cap=await pg.evaluate(()=>document.getElementById('cineSkip').textContent);check(cap==='Passer ›',tag+': bouton « '+cap+' »');
  await pg.waitForTimeout(700);
  if(how==='bouton')await pg.click('#cineSkip');else await pg.keyboard.press(how);
  await pg.waitForTimeout(400);s=await state(pg,ch);
  check(!s.cine,tag+': l\'intro ne se ferme pas');check(s.flag==='1',tag+': drapeau '+KEY[ch]+' = '+s.flag);check(s.card,tag+': carte de la phase I absente apres l\'intro');
  console.log(tag.padEnd(12),'passe :',!s.cine,' drapeau :',s.flag,' carte :',s.card);
  if(how==='Escape'){
   await pg.reload();await pg.waitForTimeout(200);await startNormal(pg,ch);s=await state(pg,ch);
   check(!s.cine&&s.card,tag+': intro rejouee apres rechargement (cine '+s.cine+', carte '+s.card+')');
   console.log(tag.padEnd(12),'apres rechargement : intro',s.cine,' carte',s.card);
   if(ch==='ch2'){await pg.click('#go');await pg.waitForTimeout(300);await pg.click('#menuBtn');await pg.waitForTimeout(200);await startNormal(pg,ch);s=await state(pg,ch);
    check(!s.cine&&s.card,tag+': prologue rejoue a la partie suivante');console.log(tag.padEnd(12),'partie suivante : prologue',s.cine)}}
  await ctx.close()}
 // ancienne cle du Chapitre I : intro vue
 {const ctx=await b.newContext({viewport:{width:1100,height:760}});await ctx.addInitScript(()=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem('eb-intro','1')}});
  const pg=await ctx.newPage();await pg.goto('file://'+DIST.ch1);await pg.waitForTimeout(200);await startNormal(pg,'ch1');const s=await state(pg,'ch1');
  check(!s.cine&&s.card,'ch1 eb-intro : intro rejouee');console.log('ch1 eb-intro   intro',s.cine,' carte',s.card);await ctx.close()}
 // 2. outro du Chapitre I
 {const ctx=await b.newContext({viewport:{width:1100,height:760}});await ctx.addInitScript(()=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem('lb-ch1-end','1')}});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push('ch1 outro: pageerror: '+e.message));await pg.goto('file://'+DIST.ch1);await pg.waitForTimeout(200);
  await pg.click('#gateBtn');await pg.waitForTimeout(100);
  for(const k of [1,2]){await pg.click('#outroBtn');await pg.waitForTimeout(500);let v=await pg.evaluate(()=>!document.getElementById('cine').hidden);check(v,'ch1 outro : ne se lance pas ('+k+')');
   await pg.keyboard.press('Space');await pg.waitForTimeout(300);v=await pg.evaluate(()=>!document.getElementById('cine').hidden);check(!v,'ch1 outro : Espace ne passe pas ('+k+')')}
  const keys=await pg.evaluate(()=>Object.keys(localStorage).filter(k=>/outro|intro/.test(k)));check(!keys.length,'ch1 outro : drapeau ecrit '+keys);
  console.log('ch1 outro      lancee deux fois, passee par Espace ; cles intro/outro :',keys);await ctx.close()}
 // 3. copies de test a crochets
 for(const ch of ['ch1','ch2']){
  const file=ch==='ch1'?path.join(ROOT,'build/out/test.html'):testPage();
  const ctx=await b.newContext({viewport:{width:1100,height:760},locale:'fr-FR'});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+' crochets: pageerror: '+e.message));
  await pg.goto('file://'+file);await pg.waitForTimeout(200);
  const r=await pg.evaluate(([ch,key])=>{const T=window.__t,L=T.LB.cine,o={};L.manual=true;const I=ch==='ch1'?T.CINE:T.PRO;
   const run=s=>{for(let i=0;i<Math.round(s*60);i++){if(ch==='ch2')T.step(1/60,false);else L.step(1/60,false)}};
   o.seen0=I.seen();if(ch==='ch1')I.play(()=>{o.done=1});else T.startRun('normal',false);o.playing=I.playing();run(40);
   o.end=!I.playing();o.flag=localStorage.getItem(key);o.seen1=I.seen();o.hidden=document.getElementById('cine').hidden;if(ch==='ch2')o.mode=T.S.mode;
   I.replay(()=>{o.replayDone=1});o.replay=I.playing()&&!document.getElementById('cine').hidden;L.skip();o.replayEnd=!I.playing();
   if(ch==='ch2'){o.epi={};T.playEpilogue(()=>{o.epi.done=1});o.epi.vis=!document.getElementById('cine').hidden;run(27.5);o.epi.col=document.getElementById('cineCap').style.color;o.epi.txt=document.getElementById('cineCap').textContent}
   return o},[ch,KEY[ch]]);
  if(ch==='ch2'){await pg.keyboard.press('Space');await pg.waitForTimeout(100);
   Object.assign(r.epi,await pg.evaluate(k=>({hidden:document.getElementById('cine').hidden,done:document.getElementById('cine').hidden,flags:Object.keys(localStorage).filter(x=>/epi|outro/.test(x)),mode:window.__t.S.mode}),KEY[ch]))}
  console.log(ch,'crochets',JSON.stringify(r));
  check(r.playing&&r.end&&r.hidden,ch+' crochets : intro pas jouee jusqu\'au bout');check(r.flag==='1'&&r.seen1,ch+' crochets : drapeau non ecrit a la fin ('+r.flag+')');
  check(r.replay&&r.replayEnd&&r.replayDone,ch+' crochets : rejeu');
  if(ch==='ch1')check(r.done,'ch1 crochets : rappel de fin non appele');
  if(ch==='ch2'){check(!r.seen0,'ch2 crochets : prologue vu avant d\'etre joue');check(r.mode!=='prologue','ch2 crochets : mode '+r.mode+' apres le prologue');
   check(r.epi.vis,'ch2 epilogue : absent');check(/rgb\(185, 207, 90\)/.test(r.epi.col)&&r.epi.txt==='Chapitre III. À suivre.','ch2 epilogue : dernier carton '+JSON.stringify([r.epi.txt,r.epi.col]));
   check(r.epi.hidden&&r.epi.mode!=='epilogue','ch2 epilogue : Espace ne passe pas');check(!r.epi.flags.length,'ch2 epilogue : drapeau ecrit '+r.epi.flags)}
  await ctx.close()}
 console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
