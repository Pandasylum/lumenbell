// Entrees communes des deux chapitres (LB.input, shared/js/28-ui.js, session menu/common).
// Copies de test a crochets (build/out/test.html : python3 build/build_test.py ; Chapitre II : ch2-lib.js), contexte tactile :
//  1. action : Espace, fleche haut, w, W, z, Z, toucher l'arene, toucher le bouton d'action -> un appel a LB.hero.press chacun ;
//     une autre touche (a) -> aucun ;
//  2. relachement : touche relachee, doigt leve -> LB.hero.release (Chapitre II : garde tenue de la phase III, S.held, aussi par
//     Entree sur le bouton d'action focalise) ;
//  3. pause : P ouvre, Echap ferme, Echap ouvre, Entree reprend, P ouvre, Espace reprend (sans appui sur le Veilleur) ;
//  4. R relance la phase (Chapitre I : nouvelle partie ; Chapitre II : PV rendus) ; carte : Espace = bouton principal ;
//     menu : Entree (focus hors du menu) = Normal ; Chapitre II : Entree passe une cinematique de phase ;
//  5. dist : sous l'ecran de demarrage, P, fleche haut et Espace ne font rien (seul son bouton agit).
// Sortie attendue : errs []
const path=require('path');const launch=require('./launch');const {testPage}=require('./ch2-lib');
const ROOT=path.resolve(__dirname,'..');
const errs=[],check=(c,m)=>{if(!c)errs.push(m)};
const SPY=()=>{const L=window.__t.LB;window.__n={p:0,r:0};const P=L.hero.press,R=L.hero.release;
 L.hero.press=function(){window.__n.p++;return P.apply(this,arguments)};L.hero.release=function(){window.__n.r++;return R.apply(this,arguments)}};
async function keys(pg,tag,step){
 const n=()=>pg.evaluate(()=>({...window.__n}));
 for(const k of [' ','ArrowUp','w','W','z','Z','a']){const a=await n();await pg.keyboard.press(k);await step();const c=await n();
  check(c.p-a.p===(k==='a'?0:1),tag+': touche '+JSON.stringify(k)+' -> '+(c.p-a.p)+' appui(s)');check(c.r-a.r===(k==='a'?0:1),tag+': touche '+JSON.stringify(k)+' -> '+(c.r-a.r)+' relachement(s)');
  await step(1.2)}
 for(const sel of ['#c','#ward']){const a=await n();await pg.tap(sel);await step();const c=await n();
  check(c.p-a.p===1&&c.r-a.r>=1,tag+': toucher '+sel+' -> '+JSON.stringify([c.p-a.p,c.r-a.r]));await step(1.2)}}
async function pause(pg,tag,step){
 const vis=()=>pg.evaluate(()=>!document.getElementById('pause').hidden);const seq=[['p',true],['Escape',false],['Escape',true],['Enter',false],['P',true],[' ',false]];
 const a=await pg.evaluate(()=>window.__n.p);
 for(const [k,v] of seq){await pg.keyboard.press(k);await step();check(await vis()===v,tag+': pause apres '+JSON.stringify(k)+' : '+!v)}
 check(await pg.evaluate(()=>window.__n.p)===a,tag+': un appui sur le Veilleur pendant la pause')
 // roue de reglages en jeu : cliquee -> pause active et panneau ouvert ; fermer ne reprend pas ; deja en pause : rien de plus
 await pg.evaluate(()=>document.getElementById('gearHead').click());await step();
 check(await vis()&&await pg.evaluate(()=>!document.getElementById('lbSet').hidden),tag+': roue en jeu : pause + panneau attendus');
 await pg.keyboard.press('Escape');await step();
 check(await vis()&&await pg.evaluate(()=>document.getElementById('lbSet').hidden),tag+': fermer le panneau ne doit pas reprendre');
 await pg.evaluate(()=>document.getElementById('gearHead').click());await step();await pg.keyboard.press('Escape');await step();
 check(await vis(),tag+': roue deja en pause : la pause doit rester');
 await pg.keyboard.press('Escape');await step();
 check(!await vis(),tag+': Reprendre apres la roue')}
(async()=>{const b=await launch();
 // Chapitre I
 {const ctx=await b.newContext({viewport:{width:1100,height:760},hasTouch:true,locale:'fr-FR'});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push('ch1: pageerror: '+e.message));
  await pg.goto('file://'+path.join(ROOT,'build/out/test.html'));await pg.waitForTimeout(300);
  const step=s=>pg.waitForTimeout(s?Math.round(s*1000):60);
  // menu : Entree, focus hors du menu -> Normal (intro vue dans la copie de test : carte de la phase I)
  await pg.evaluate(()=>document.activeElement&&document.activeElement.blur());await pg.keyboard.press('Enter');await step(.3);
  check(await pg.evaluate(()=>document.getElementById('menu').hidden&&!document.getElementById('ov').hidden),'ch1: Entree au menu ne lance pas Normal');
  // carte : Espace = Commencer
  await pg.keyboard.press(' ');await step(.2);check(await pg.evaluate(()=>document.getElementById('ov').hidden&&window.__t.getG().mode==='intro'),'ch1: Espace sur la carte ne lance pas la phase');
  await pg.evaluate(()=>{window.__t.adv(4.2);window.__t.getG().php=99});await pg.evaluate(SPY);   // PV hors d'atteinte : le test ne doit pas finir en defaite
  check(await pg.evaluate(()=>window.__t.getG().mode)==='play','ch1: phase I pas en jeu');
  await keys(pg,'ch1',step);await pause(pg,'ch1',step);
  const r=await pg.evaluate(()=>{const g=window.__t.getG();g.__m=1;return 1});await pg.keyboard.press('r');await step();
  check(await pg.evaluate(()=>!window.__t.getG().__m&&window.__t.getG().mode==='play'),'ch1: R ne relance pas la phase');
  console.log('ch1',JSON.stringify(await pg.evaluate(()=>window.__n)));await ctx.close()}
 // Chapitre II
 {const ctx=await b.newContext({viewport:{width:1100,height:760},hasTouch:true,locale:'fr-FR'});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push('ch2: pageerror: '+e.message));
  await pg.goto('file://'+testPage());await pg.waitForTimeout(300);
  const step=s=>pg.evaluate(s=>{for(let i=0;i<Math.round((s||1/60)*60);i++)window.__t.step(1/60,false)},s||0);
  await pg.evaluate(()=>document.activeElement&&document.activeElement.blur());await pg.keyboard.press('Enter');await step(.3);
  check(await pg.evaluate(()=>document.getElementById('menu').hidden),'ch2: Entree au menu ne lance pas Normal');
  if(await pg.evaluate(()=>!document.getElementById('cine').hidden))await pg.evaluate(()=>window.__t.LB.cine.skip());await step(.2);   // prologue (premiere partie) : passe
  const toPlay=async tag=>{for(let i=0;i<30&&await pg.evaluate(()=>window.__t.S.mode)!=='card';i++){await pg.evaluate(()=>{const c=document.getElementById('cine');if(c&&!c.hidden)window.__t.LB.cine.skip()});await step(.5)}
   if(await pg.evaluate(()=>window.__t.S.mode)!=='card'){errs.push(tag+': carte de phase absente');return}
   await pg.keyboard.press(' ');await step(.1);check(await pg.evaluate(()=>window.__t.S.mode)==='play',tag+': Espace sur la carte ne lance pas le combat')};
  // cinematique de phase : Entree passe
  check(await pg.evaluate(()=>window.__t.S.mode)==='cine','ch2: pas de cinematique d\'entree');await pg.keyboard.press('p');await step();
  check(await pg.evaluate(()=>window.__t.S.mode==='cine'&&document.getElementById('pause').hidden),'ch2: P agit pendant la cinematique');
  await pg.keyboard.press('Enter');await step();check(await pg.evaluate(()=>window.__t.S.mode)==='card','ch2: Entree ne passe pas la cinematique');
  await toPlay('ch2 phase I');await pg.evaluate(()=>{const S=window.__t.S;S.hp=S.hpMax=99;S.threats=[];S.nextAt=window.__t.gt+600});await pg.evaluate(SPY);   // plus d'attaque : le test ne doit pas finir en defaite
  await keys(pg,'ch2',step);await pause(pg,'ch2',step);
  await pg.evaluate(()=>{window.__t.S.hpMax=4;window.__t.S.hp=1});await pg.keyboard.press('r');await step();
  check(await pg.evaluate(()=>window.__t.S.mode==='play'&&window.__t.S.hp===window.__t.S.hpMax),'ch2: R ne relance pas la phase');
  // phase III : garde tenue tant que la touche (ou le doigt) l'est
  await pg.evaluate(()=>window.__t.jumpPhase(3));await toPlay('ch2 phase III');await step(1);
  for(const k of [' ','w']){await pg.evaluate(()=>{const S=window.__t.S;S.threats=[];S.nextAt=window.__t.gt+600});for(let i=0;i<20&&await pg.evaluate(()=>window.__t.S.pl.s)!=='ready';i++)await step(.25);
   await pg.keyboard.down(k);await step(.2);const d=await pg.evaluate(()=>({held:window.__t.S.held,s:window.__t.S.pl.s,down:document.getElementById('ward').classList.contains('down')}));
   await pg.keyboard.up(k);await step(.05);const u=await pg.evaluate(()=>({held:window.__t.S.held,down:document.getElementById('ward').classList.contains('down')}));
   check(d.held&&d.s==='act'&&d.down&&!u.held&&!u.down,'ch2 phase III: garde tenue par '+JSON.stringify(k)+' '+JSON.stringify([d,u]));await step(1.5)}
  // Entree sur le bouton d'action focalise (clic clavier) : appui, puis relachement a la touche relevee
  {await pg.evaluate(()=>{const S=window.__t.S;S.threats=[];S.nextAt=window.__t.gt+600});for(let i=0;i<20&&await pg.evaluate(()=>window.__t.S.pl.s)!=='ready';i++)await step(.25);
   await pg.focus('#ward');await pg.keyboard.down('Enter');await step(.2);const d=await pg.evaluate(()=>window.__t.S.held);await pg.keyboard.up('Enter');await step(.05);const u=await pg.evaluate(()=>window.__t.S.held);
   check(d&&!u,'ch2 phase III: Entree sur le bouton d\'action '+JSON.stringify([d,u]))}
  console.log('ch2',JSON.stringify(await pg.evaluate(()=>window.__n)));await ctx.close()}
 // ecran de demarrage (dist)
 for(const [ch,f] of [['ch1','chapters/ch1-ember-bridge/dist/index.html'],['ch2','chapters/ch2-silent-bells/dist/index.html']]){
  const ctx=await b.newContext({viewport:{width:1100,height:760}});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+' gate: pageerror: '+e.message));
  await pg.goto('file://'+path.join(ROOT,f));await pg.waitForTimeout(300);
  await pg.evaluate(()=>document.activeElement&&document.activeElement.blur());
  for(const k of ['p','ArrowUp',' ','Enter'])await pg.keyboard.press(k);await pg.waitForTimeout(300);
  const s=await pg.evaluate(()=>({gate:!document.getElementById('gate').hidden,menu:!document.getElementById('menu').hidden,pause:!document.getElementById('pause').hidden,ov:!document.getElementById('ov').hidden,cine:!!document.getElementById('cine')&&!document.getElementById('cine').hidden}));
  check(s.gate&&s.menu&&!s.pause&&!s.ov&&!s.cine,ch+': une touche agit sous l\'ecran de demarrage '+JSON.stringify(s));console.log(ch,'ecran de demarrage',JSON.stringify(s));await ctx.close()}
 console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
