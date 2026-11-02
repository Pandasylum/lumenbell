// Intro et outro des deux chapitres (LB.cine, shared/js/24-cine.js) : passage et drapeau « intro vue ».
// 1. dist publies (temps reel) : pour chaque chapitre et chaque facon de passer (Echap, Entree, Espace, bouton « Passer ») :
//    contexte vide -> Normal lance l'intro (#cine visible, drapeau lb-chN-intro absent) ; passer -> #cine cache, drapeau a '1',
//    carte de la phase I affichee (Chapitre II : cinematique d'entree de la phase I, bouton #skip du jeu) ; rechargement -> Normal ne rejoue pas l'intro ; Chapitre II : nouvelle partie depuis le menu
//    sans prologue. Anciennes cles du Chapitre I (eb-intro) lues comme avant. Drapeau deja pose (bureau et telephone) : bouton
//    « ▶ Intro » visible dans le menu des deux chapitres, il rejoue l'intro puis rend le menu ; Chapitre II : une partie en pause est gardee.
// 2. outro des deux chapitres (bouton « ▶ Outro » du menu, cache sans la vraie fin, visible avec lb-chN-end) : passe par Espace, retour au menu, aucun drapeau ecrit, rejouable.
// 3. copies de test a crochets (pas fixe, LB.cine.manual) : intro jouee jusqu'au bout -> drapeau ecrit sans passer ; rejeu
//    (replay) d'une intro deja vue ; epilogue du Chapitre II : passe par Espace, rappel appele, pas de drapeau ; dernier carton
//    de l'epilogue teinte de la couleur du Chapitre III.
// 4. garde du carton « a suivre » : LB.nextCard seule implementation (aucune chaine « LUMENBELL · CHAPTER/CHAPITRE » dessinee ailleurs que dans shared/js/24-cine.js,
//    un seul appel par chapitre) ; dernier carton des Chapitres I et II rendu au meme instant : meme geometrie, LUMEN = CH_COL[n], BELL creme, legende au meme format.
// Usage : node cine.js (python3 build/build_test.py avant). Sortie attendue : errs []
const path=require('path');const launch=require('./launch');const {testPage}=require('./ch2-lib');
const ROOT=path.resolve(__dirname,'..'),errs=[];
const DIST={ch1:path.join(ROOT,'chapters/ch1-ember-bridge/dist/index.html'),ch2:path.join(ROOT,'chapters/ch2-silent-bells/dist/index.html')};
const KEY={ch1:'lb-ch1-intro',ch2:'lb-ch2-intro'};
const check=(c,msg)=>{if(!c)errs.push(msg)};
const fs=require('fs');
function guardStatic(){   // 4a
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(/^(dist|out|node_modules)$/.test(e.name)?[]:walk(path.join(d,e.name))):/\.js$/.test(e.name)?[path.join(d,e.name)]:[]);
 const dirs=[path.join(ROOT,'shared/js'),...fs.readdirSync(path.join(ROOT,'chapters')).map(c=>path.join(ROOT,'chapters',c,'src'))].filter(fs.existsSync);
 for(const d of dirs)for(const f of walk(d)){const rel=path.relative(ROOT,f),src=fs.readFileSync(f,'utf8');
  if(rel!=='shared/js/24-cine.js'){src.split('\n').forEach((l,i)=>{if(/fillText|strokeText/.test(l)&&/LUMENBELL|CHAPITRE|CHAPTER/.test(l))errs.push('carton a suivre : « '+rel+':'+(i+1)+' » dessine LUMENBELL / CHAPITRE hors de LB.nextCard')})}
  const n=(src.match(/LB\.nextCard\(/g)||[]).length;if(rel!=='shared/js/24-cine.js'&&n>1)errs.push('carton a suivre : '+rel+' contient '+n+' appels LB.nextCard');}
 for(const ch of fs.readdirSync(path.join(ROOT,'chapters'))){const d=path.join(ROOT,'chapters',ch,'src');if(!fs.existsSync(d))continue;
  const n=walk(d).reduce((a,f)=>a+(fs.readFileSync(f,'utf8').match(/LB\.nextCard\(/g)||[]).length,0);if(n>1)errs.push('carton a suivre : '+ch+' contient '+n+' appels LB.nextCard');}}
guardStatic();
async function state(pg,ch){return pg.evaluate(k=>({cine:!document.getElementById('cine').hidden,flag:localStorage.getItem(k),
 card:!document.getElementById('ov').hidden||!document.getElementById('skip')?.hidden&&!!document.getElementById('skip'),menu:!document.getElementById('menu').hidden}),KEY[ch])}
async function startNormal(pg,ch){
 await pg.evaluate(()=>{const g=document.getElementById('gateBtn');if(g&&!document.getElementById('gate').hidden)g.click()})   // ecran de demarrage (LB.gate), les deux chapitres
 await pg.click('#mphM [data-diff=normal]');await pg.waitForTimeout(400)}
const CARD={};
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
 // drapeau pose (profil qui a deja vu l'intro) : Normal ne la rejoue pas, le bouton « ▶ Intro » du menu est visible et la rejoue
 for(const ch of ['ch1','ch2'])for(const [w,h] of [[1100,760],[390,844]]){
  const tag=ch+' drapeau pose '+w+'x'+h,ctx=await b.newContext({viewport:{width:w,height:h},locale:'fr-FR'});
  await ctx.addInitScript(k=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem(k,'1')}},KEY[ch]);
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(tag+': pageerror: '+e.message));await pg.goto('file://'+DIST[ch]);await pg.waitForTimeout(200);
  await pg.click('#gateBtn');await pg.waitForTimeout(150);
  const btn=()=>pg.evaluate(()=>{const e=document.getElementById('introBtn');if(!e)return'absent';const r=e.getBoundingClientRect(),c=getComputedStyle(e),x=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
   return{vis:!e.hidden&&c.display!=='none'&&c.visibility!=='hidden'&&r.width>0&&r.right<=innerWidth&&r.bottom<=innerHeight&&r.top>=0,top:x===e||e.contains(x),txt:e.textContent}});
  let B=await btn();check(B!=='absent'&&B.vis&&B.top&&B.txt==='▶ Intro',tag+': bouton de rejeu '+JSON.stringify(B));
  await pg.click('#introBtn');await pg.waitForTimeout(500);let s=await state(pg,ch);check(s.cine,tag+': le bouton ne rejoue pas l\'intro');
  await pg.keyboard.press('Escape');await pg.waitForTimeout(300);s=await state(pg,ch);check(!s.cine&&s.menu&&s.flag==='1',tag+': retour au menu apres le rejeu '+JSON.stringify(s));
  await startNormal(pg,ch);s=await state(pg,ch);check(!s.cine&&s.card,tag+': Normal rejoue l\'intro alors qu\'elle est vue');
  if(ch==='ch2'){   // partie en cours : Menu, rejeu, Reprendre -> la partie reprend telle quelle
   await pg.click('#go');await pg.waitForTimeout(300);const eye0=await pg.evaluate(()=>document.getElementById('hdEye').textContent);
   await pg.click('#menuBtn');await pg.waitForTimeout(200);await pg.click('#introBtn');await pg.waitForTimeout(400);await pg.keyboard.press('Enter');await pg.waitForTimeout(300);
   const r=await pg.evaluate(()=>({resume:!document.getElementById('mResume').hidden,eye:document.getElementById('hdEye').textContent}));
   check(r.resume&&r.eye===eye0,tag+': partie perdue apres le rejeu '+JSON.stringify(r)+' / '+eye0)}
  console.log(tag.padEnd(26),'bouton',JSON.stringify(B),' rejeu et retour au menu : ok si aucune erreur ci-dessous');
  await ctx.close()}
 // 2. outro des deux chapitres : « ▶ Outro » au menu apres la vraie fin (lb-chN-end ; Chapitre II depuis menu/common), absent avant
 for(const ch of ['ch1','ch2']){
  {const ctx=await b.newContext({viewport:{width:1100,height:760}});const pg=await ctx.newPage();await pg.goto('file://'+DIST[ch]);await pg.waitForTimeout(200);await pg.click('#gateBtn');
   const hid=await pg.evaluate(()=>document.getElementById('outroBtn').hidden);check(hid,ch+' outro : bouton visible sans la vraie fin');await ctx.close()}
  const ctx=await b.newContext({viewport:{width:1100,height:760}});await ctx.addInitScript(k=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem(k,'1')}},'lb-'+ch+'-end');
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+' outro: pageerror: '+e.message));await pg.goto('file://'+DIST[ch]);await pg.waitForTimeout(200);
  await pg.click('#gateBtn');await pg.waitForTimeout(100);
  for(const k of [1,2]){await pg.click('#outroBtn');await pg.waitForTimeout(500);let v=await pg.evaluate(()=>!document.getElementById('cine').hidden);check(v,ch+' outro : ne se lance pas ('+k+')');
   await pg.keyboard.press('Space');await pg.waitForTimeout(300);v=await pg.evaluate(()=>!document.getElementById('cine').hidden&&!document.getElementById('menu').hidden);check(!v,ch+' outro : Espace ne passe pas ('+k+')')}
  const m=await pg.evaluate(()=>!document.getElementById('menu').hidden);check(m,ch+' outro : pas de retour au menu');
  const keys=await pg.evaluate(()=>Object.keys(localStorage).filter(k=>/outro|intro/.test(k)));check(!keys.length,ch+' outro : drapeau ecrit '+keys);
  console.log(ch,'outro      lancee deux fois, passee par Espace ; cles intro/outro :',keys);await ctx.close()}
 // 2b. dernier carton de l'outro du Chapitre I : dist publie en temps reel (OUTRO n'est pas expose a la copie de test)
 {const ctx=await b.newContext({viewport:{width:1100,height:760},locale:'fr-FR'});await ctx.addInitScript(()=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem('lb-ch1-end','1')}});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push('ch1 carton: pageerror: '+e.message));await pg.goto('file://'+DIST.ch1);await pg.waitForTimeout(200);await pg.click('#gateBtn');
  await pg.evaluate(()=>{window.__rec=[];const P=CanvasRenderingContext2D.prototype,f0=P.fillText;P.fillText=function(t,x,y){window.__rec.push({t:String(t),x,y,col:this.fillStyle,font:this.font,al:this.textAlign,w:this.measureText(String(t)).width,a:this.globalAlpha});if(window.__rec.length>400)window.__rec.shift();return f0.apply(this,arguments)}});
  await pg.click('#outroBtn');await pg.waitForFunction(()=>/suivre/.test(document.getElementById('cineCap').textContent),null,{timeout:90000});await pg.waitForTimeout(4500);
  const card=await pg.evaluate(()=>{const r=window.__rec,i=r.map(x=>x.t).lastIndexOf('LUMEN');return{cap:document.getElementById('cineCap').textContent,capCol:document.getElementById('cineCap').style.color,rec:i<0?[]:r.slice(i,i+3)}});
  CARD.ch1=card;await pg.keyboard.press('Space');await ctx.close()}
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
   // 4b : dernier carton rendu (ch1 : outro ; ch2 : epilogue deja au dernier carton) ; on enregistre les fillText de l'image finale
   if(ch==='ch2'){const rec=[],P=CanvasRenderingContext2D.prototype,f0=P.fillText;P.fillText=function(t,x,y){rec.push({t:String(t),x,y,col:this.fillStyle,font:this.font,al:this.textAlign,w:this.measureText(String(t)).width,a:this.globalAlpha});return f0.apply(this,arguments)};
    const cap=()=>document.getElementById('cineCap').textContent,end=/suivre|continued/;
    {L.skip();T.playEpilogue(()=>{});for(let i=0;i<60*80&&!end.test(cap());i++)T.step(1/60,false)}
    for(let i=0;i<60*4;i++)T.step(1/60,false)
    rec.length=0;T.step(1/60,true);
    P.fillText=f0;o.card={cap:cap(),capCol:document.getElementById('cineCap').style.color,rec,col:T.LB.CH_COL}}
   return o},[ch,KEY[ch]]);
  if(ch==='ch2')CARD[ch]=r.card;
  if(ch==='ch2'){await pg.keyboard.press('Space');await pg.waitForTimeout(100);
   Object.assign(r.epi,await pg.evaluate(k=>({hidden:document.getElementById('cine').hidden,done:document.getElementById('cine').hidden,flags:Object.keys(localStorage).filter(x=>/epi|outro/.test(x)),mode:window.__t.S.mode}),KEY[ch]))}
  console.log(ch,'crochets',JSON.stringify(r));
  check(r.playing&&r.end&&r.hidden,ch+' crochets : intro pas jouee jusqu\'au bout');check(r.flag==='1'&&r.seen1,ch+' crochets : drapeau non ecrit a la fin ('+r.flag+')');
  check(r.replay&&r.replayEnd&&r.replayDone,ch+' crochets : rejeu');
  if(ch==='ch1')check(r.done,'ch1 crochets : rappel de fin non appele');
  if(ch==='ch2'){check(!r.seen0,'ch2 crochets : prologue vu avant d\'etre joue');check(r.mode!=='prologue','ch2 crochets : mode '+r.mode+' apres le prologue');
   check(r.epi.vis,'ch2 epilogue : absent');check(/rgb\(185, 207, 90\)/.test(r.epi.col)&&r.epi.txt==='Chapitre III · Hollow Roots. À suivre.','ch2 epilogue : dernier carton '+JSON.stringify([r.epi.txt,r.epi.col]));
   check(r.epi.hidden&&r.epi.mode!=='epilogue','ch2 epilogue : Espace ne passe pas');check(!r.epi.flags.length,'ch2 epilogue : drapeau ecrit '+r.epi.flags)}
  await ctx.close()}

 {CARD.ch1.col=CARD.ch2.col;const C1=CARD.ch1,C2=CARD.ch2,hex=c=>{const m=/^rgb\((\d+), (\d+), (\d+)\)$/.exec(c);return m?'#'+[1,2,3].map(i=>(+m[i]).toString(16).padStart(2,'0')).join(''):c};
  const lines=C=>{const r=C.rec.filter(x=>/LUMEN|BELL|^[A-Z ]+$/.test(x.t)&&x.a>0);return{head:r.find(x=>x.t==='LUMEN'),tail:r.find(x=>/^BELL ·/.test(x.t)),name:r.filter(x=>x!==r.find(y=>y.t==='LUMEN')&&!/^BELL ·/.test(x.t)).pop()}};
  console.log('carton a suivre',JSON.stringify({ch1:C1.rec.map(x=>[x.t,x.col,x.x,x.y]),ch2:C2.rec.map(x=>[x.t,x.col,x.x,x.y])}));
  const L1=lines(C1),L2=lines(C2),cream='#f0e8df';
  for(const [tag,C,L,n,name] of [['ch1',C1,L1,2,'SILENT BELLS'],['ch2',C2,L2,3,'HOLLOW ROOTS']]){
   check(L.head&&L.tail&&L.name,tag+' carton : lignes absentes '+JSON.stringify(C.rec.map(x=>x.t)));if(!(L.head&&L.tail&&L.name))continue;
   check(hex(L.head.col)===C.col[n],tag+' carton : LUMEN '+hex(L.head.col)+' <> CH_COL['+n+'] '+C.col[n]);
   check(hex(L.tail.col)===cream,tag+' carton : BELL '+hex(L.tail.col)+' <> creme');
   check(hex(L.name.col)===C.col[n]&&L.name.t===name,tag+' carton : nom '+L.name.t+' '+hex(L.name.col));
   check(L.head.y===L.tail.y,tag+' carton : LUMEN et BELL pas sur la meme ligne');
   check(Math.abs(L.head.x+(L.head.w+L.tail.w)/2-480)<1,tag+' carton : ligne du haut non centree');
   check(Math.abs(L.name.x-480)<1&&L.name.al==='center',tag+' carton : nom non centre');
   const cm=C.cap.match(/^(Chapitre|Chapter) (III?) · (.+)\. (À suivre|To be continued)\.$/);
   check(!!cm&&cm[2]===(n===2?'II':'III')&&hex(C.capCol)===C.col[n],tag+' carton : legende '+JSON.stringify([C.cap,C.capCol])+' format ou teinte')}
  if(L1.head&&L2.head&&L1.name&&L2.name){
   check(L1.head.y===L2.head.y&&L1.head.font===L2.head.font&&L1.tail.font===L2.tail.font,'cartons : ligne du haut differente (y/police) '+JSON.stringify([L1.head.y,L2.head.y,L1.head.font,L2.head.font]));
   check(L1.name.y===L2.name.y&&L1.name.font===L2.name.font&&L1.name.x===L2.name.x,'cartons : titre different (position/taille) '+JSON.stringify([L1.name.y,L2.name.y,L1.name.font,L2.name.font]));
   check(Math.abs((L1.head.x+(L1.head.w+L1.tail.w)/2)-(L2.head.x+(L2.head.w+L2.tail.w)/2))<1,'cartons : centre de la ligne du haut different')}}
 console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
