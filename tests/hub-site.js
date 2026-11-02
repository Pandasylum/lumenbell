// Site assemble (site/ : hub + chapitres, build/build_site.py), comme sur itch.io et dans l'APK.
// 1. parcours complet hub -> Chapitre I -> Retour -> Chapitre II -> Retour, une fois servi en http, une fois en file:// (chemins
//    relatifs) : chapitre sans ecran de demarrage, lien « Chapitres » visible, retour sans ecran de demarrage.
// 2. chapitre ouvert seul (sans ?from=hub : site/chN et chapters/*/dist) : ecran de demarrage, pas de lien vers le hub.
// 3. 5 allers-retours hub <-> Chapitre I : un seul AudioContext par page, ecouteurs et intervalles actifs identiques a chaque
//    passage au hub, memoire JS stable (CDP, apres ramasse-miettes).
// 4. audio bloque (autoplay refuse, simule : tant que la page n'a pas recu de geste, un AudioContext nait suspendu et resume() est
//    refuse ; Chromium, lui, laisse partir le son apres une navigation sur le meme site depuis un clic, voir NOTES) : chapitre ouvert depuis
//    le hub et retour au hub sans erreur, contexte suspendu puis relance au premier appui (la musique part alors).
// 5. rechargement (hub de retour, chapitre depuis le hub, hub) et retour arriere du navigateur.
// 6. fin du Chapitre I ouvert depuis le hub (profil vierge ; la vraie fin ecrit lb-ch1-end puis la derniere carte rend le hub comme
//    LB.toHub) : la tour I s'allume une seule fois avec sa cloche, la II s'ouvre ; rechargement : pas de rejeu. Les deux chapitres
//    branchent leur derniere carte sur LB.hubEnd (hors Epreuve).
// Erreurs console et de page : aucune. Usage : node hub-site.js (python3 build/build_site.py avant). Sortie attendue : errs []
const path=require('path'),http=require('http'),fs=require('fs');const launch=require('./launch');
const ROOT=path.resolve(__dirname,'..'),SITE=path.join(ROOT,'site'),errs=[];
const check=(c,msg)=>{if(!c)errs.push(msg)};
const TYPES={'.html':'text/html; charset=utf-8'};
// oscillateurs du fond sonore par defaut (a), lus dans la table du hub construit : balayage + houle commune + (houle + voix) par note + souffle ; le reste = cloches
const HT=new Function('return '+fs.readFileSync(path.join(SITE,'index.html'),'utf8').match(/const HUB_T=(\{[\s\S]*?\n\});/)[1])(),BEDN=1+1+HT.beds.a.notes.length*(1+HT.beds.a.detune.length)+1;
const server=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]),f=path.join(SITE,u.endsWith('/')?u+'index.html':u);
 if(!f.startsWith(SITE)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return}
 r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
// instrumentation par page : contextes audio crees, ecouteurs ajoutes / retires, intervalles actifs
const PROBE=()=>{const A=window.AudioContext;window.__ac=[];if(A){const W=function(...a){const c=new A(...a);window.__ac.push(c);return c};W.prototype=A.prototype;window.AudioContext=W;window.webkitAudioContext=W}
 let lis=0;const ae=EventTarget.prototype.addEventListener,re=EventTarget.prototype.removeEventListener;
 EventTarget.prototype.addEventListener=function(...a){lis++;return ae.apply(this,a)};EventTarget.prototype.removeEventListener=function(...a){lis--;return re.apply(this,a)};
 const iv=new Set(),si=window.setInterval,ci=window.clearInterval;window.setInterval=function(...a){const id=si.apply(this,a);iv.add(id);return id};window.clearInterval=function(id){iv.delete(id);return ci(id)};
 let osc=0;if(A){const co=A.prototype.createOscillator;A.prototype.createOscillator=function(){osc++;return co.call(this)}}
 window.__probe=()=>({ac:window.__ac.length,state:window.__ac.map(c=>c.state),lis,iv:iv.size,osc})};
async function page(b,tag,keys,blocked){const ctx=await b.newContext({viewport:{width:1280,height:720},locale:'fr-FR'});if(blocked)await ctx.addInitScript(BLOCKED);await ctx.addInitScript(PROBE);
 if(keys)await ctx.addInitScript(k=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');for(const x in k)localStorage.setItem(x,k[x])}},keys);
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(tag+': pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(tag+': console: '+m.text())});return{ctx,pg}}
// geste = vrai appui dans CETTE page (l'activation de Chromium, elle, survit a une navigation sur le meme site et aux evaluate de Playwright)
const BLOCKED=()=>{const A=window.AudioContext;if(!A)return;let g=false;for(const ev of ['pointerdown','keydown'])window.addEventListener(ev,()=>{g=true},true);const act=()=>g;
 const W=function(...a){const c=new A(...a);if(!act()){c.suspend();const r=c.resume.bind(c);c.resume=()=>act()?r():Promise.reject(new DOMException('autoplay','NotAllowedError'))}return c};
 W.prototype=A.prototype;window.AudioContext=W;window.webkitAudioContext=W};
const st=pg=>pg.evaluate(()=>({gate:!!document.getElementById('gate')&&!document.getElementById('gate').hidden,back:!!document.getElementById('mHub'),hub:!!document.getElementById('fig'),p:window.__probe()}));
async function enter(pg,n){await pg.click('.tw[data-n="'+n+'"]');await pg.waitForTimeout(60);await Promise.all([pg.waitForNavigation({waitUntil:'load'}),pg.click('#hcGo')]);await pg.waitForTimeout(300)}
async function back(pg){await Promise.all([pg.waitForNavigation({waitUntil:'load'}),pg.click('#mHub')]);await pg.waitForTimeout(300)}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;const BASE={http:'http://127.0.0.1:'+port+'/',file:'file://'+SITE+'/'};
 const b=await launch();
 // 1. parcours complet, http et file://
 for(const mode of ['http','file']){const tag='parcours '+mode,{ctx,pg}=await page(b,tag,{'lb-ch1-end':'1'});
  await pg.goto(BASE[mode]+'index.html');await pg.waitForTimeout(200);let S=await st(pg);check(S.hub&&S.gate,tag+' : hub avec son ecran de demarrage');
  await pg.click('#gateBtn');await pg.waitForTimeout(200);
  for(const n of [1,2]){await enter(pg,n);S=await st(pg);
   check(pg.url()===BASE[mode]+'ch'+n+'/index.html?from=hub',tag+' : chapitre '+n+' '+pg.url());
   check(!S.gate&&S.back,tag+' : chapitre '+n+' sans ecran de demarrage, avec Retour '+JSON.stringify(S));
   check(S.p.ac<=1,tag+' : chapitre '+n+' : '+S.p.ac+' AudioContext');
   await back(pg);S=await st(pg);
   check(pg.url()===BASE[mode]+'index.html?back='+n&&S.hub&&!S.gate,tag+' : retour du chapitre '+n+' '+pg.url()+' '+JSON.stringify(S));
   check(S.p.ac===1,tag+' : hub de retour : '+S.p.ac+' AudioContext (fond sonore)')}
  console.log(tag.padEnd(22),'ok');await ctx.close()}
 // 2. chapitre ouvert seul
 for(const [nm,f] of [['site/ch1',BASE.file+'ch1/index.html'],['site/ch2',BASE.file+'ch2/index.html'],['site/ch1 http',BASE.http+'ch1/index.html'],
   ['dist ch1','file://'+path.join(ROOT,'chapters/ch1-ember-bridge/dist/index.html')],['dist ch2','file://'+path.join(ROOT,'chapters/ch2-silent-bells/dist/index.html')]]){
  const tag='seul '+nm,{ctx,pg}=await page(b,tag);await pg.goto(f);await pg.waitForTimeout(300);const S=await st(pg);
  check(S.gate&&!S.back,tag+' : ecran de demarrage et pas de Retour '+JSON.stringify(S));
  await pg.click('#gateBtn');await pg.waitForTimeout(150);check(await pg.evaluate(()=>!document.getElementById('mHub')&&!document.querySelector('.mfoot')),tag+' : menu sans lien');
  console.log(tag.padEnd(22),'ok');await ctx.close()}
 // 3. 5 allers-retours : pas d'accumulation
 {const tag='allers-retours',{ctx,pg}=await page(b,tag);const cdp=await ctx.newCDPSession(pg);
  const heap=async()=>{await cdp.send('HeapProfiler.collectGarbage');const m=await cdp.send('Performance.getMetrics');return m.metrics.find(x=>x.name==='JSHeapUsedSize').value};
  await cdp.send('Performance.enable');await pg.goto(BASE.http+'index.html');await pg.waitForTimeout(200);await pg.click('#gateBtn');await pg.waitForTimeout(300);
  const H=[],P=[];
  for(let i=0;i<5;i++){await enter(pg,1);const C=await st(pg);check(C.p.ac<=1,tag+' '+i+' : chapitre, '+C.p.ac+' AudioContext');
   await back(pg);await pg.waitForTimeout(200);await cdp.send('Performance.enable');const S=await st(pg);P.push([S.p.ac,S.p.lis,S.p.iv]);H.push(await heap())}
  check(P.every(p=>JSON.stringify(p)===JSON.stringify(P[0]))&&P[0][0]===1,tag+' : AudioContext / ecouteurs / intervalles par passage '+JSON.stringify(P));
  check(H[4]<=H[0]*1.25+1e6,tag+' : memoire '+H.map(h=>Math.round(h/1024)+' Ko').join(' '));
  console.log(tag.padEnd(22),JSON.stringify(P[0]),H.map(h=>Math.round(h/1024)+'Ko').join(' '));await ctx.close()}
 // 5. rechargement et retour arriere
 {const tag='rechargement',{ctx,pg}=await page(b,tag);await pg.goto(BASE.http+'index.html');await pg.waitForTimeout(150);await pg.click('#gateBtn');await pg.waitForTimeout(150);
  await enter(pg,1);await pg.reload();await pg.waitForTimeout(300);let S=await st(pg);check(!S.gate&&S.back,tag+' : chapitre depuis le hub recharge '+JSON.stringify(S));
  await back(pg);await pg.reload();await pg.waitForTimeout(300);S=await st(pg);check(S.hub&&!S.gate&&S.p.ac===1,tag+' : hub de retour recharge '+JSON.stringify(S));
  await pg.goto(BASE.http+'index.html');await pg.waitForTimeout(150);S=await st(pg);check(S.gate,tag+' : hub ouvert seul : ecran de demarrage');
  await pg.click('#gateBtn');await pg.waitForTimeout(150);await enter(pg,1);
  await pg.goBack({waitUntil:'load'});await pg.waitForTimeout(400);S=await st(pg);check(S.hub&&pg.url()===BASE.http+'index.html',tag+' : retour arriere vers le hub '+pg.url());
  if(S.gate){await pg.click('#gateBtn');await pg.waitForTimeout(150)}
  await enter(pg,1);check(pg.url()===BASE.http+'ch1/index.html?from=hub',tag+' : le hub repart apres le retour arriere '+pg.url());
  await pg.goBack({waitUntil:'load'});await pg.waitForTimeout(300);await pg.goForward({waitUntil:'load'});await pg.waitForTimeout(300);S=await st(pg);check(S.back&&!S.gate,tag+' : avance du navigateur vers le chapitre '+JSON.stringify(S));
  console.log(tag.padEnd(22),'ok');await ctx.close()}
 // 6. fin du Chapitre I depuis le hub -> la tour I s'allume une seule fois
 {const tag='fin du chapitre',{ctx,pg}=await page(b,tag);await pg.goto(BASE.http+'index.html');await pg.waitForTimeout(150);await pg.click('#gateBtn');await pg.waitForTimeout(200);
  await enter(pg,1);await pg.evaluate(()=>localStorage.setItem('lb-ch1-end','1'));
  await Promise.all([pg.waitForNavigation({waitUntil:'load'}),pg.evaluate(()=>location.replace('../index.html?back=1'))]);
  const tw=()=>pg.evaluate(()=>[1,2].map(n=>{const e=document.querySelector('.tw[data-n="'+n+'"]');return ['closed','play','done'].find(k=>e.classList.contains(k))+(e.classList.contains('ring')?'+ring':'')}));
  const t0=await tw();await pg.waitForTimeout(1500);const t1=await tw();let S=await st(pg);
  check(t0.join()==='play,closed'&&t1.join()==='done+ring,play'&&S.p.osc>=BEDN+5&&!S.gate,tag+' : la tour I s\'allume avec sa cloche '+t0+' -> '+t1+' ('+S.p.osc+' oscillateurs)');
  await pg.reload();await pg.waitForTimeout(1500);const t2=await tw();S=await st(pg);
  check(t2.join()==='done,play'&&S.p.osc<=BEDN,tag+' : rechargement : pas de rejeu '+t2+' ('+S.p.osc+')');
  for(const d of ['chapters/ch1-ember-bridge/dist/index.html','chapters/ch2-silent-bells/dist/index.html']){const src=fs.readFileSync(path.join(ROOT,d),'utf8');
   check((src.match(/LB\.hubEnd\(/g)||[]).length>=1,tag+' : '+d+' : derniere carte non branchee sur LB.hubEnd')}
  console.log(tag.padEnd(22),t0.join(' '),'->',t1.join(' '),'| recharge',t2.join(' '));await ctx.close()}
 await b.close();
 // 4. audio bloque sans geste
 {const b2=await launch();
  for(const ch of [1,2]){const tag='audio bloque ch'+ch,{ctx,pg}=await page(b2,tag,{'lb-ch1-end':'1'},true);
   await pg.goto(BASE.http+'index.html');await pg.waitForTimeout(150);await pg.click('#gateBtn');await pg.waitForTimeout(200);
   let S=await st(pg);check(S.p.state[0]==='running',tag+' : hub apres Commencer '+S.p.state);
   await enter(pg,ch);S=await st(pg);check(!S.gate&&S.p.ac===1&&S.p.state[0]!=='running',tag+' : chapitre sans geste : contexte '+S.p.state);
   await pg.mouse.click(640,30);await pg.waitForTimeout(300);S=await st(pg);check(S.p.ac===1&&S.p.state[0]==='running',tag+' : premier appui : contexte '+S.p.state);
   await back(pg);S=await st(pg);check(!S.gate&&S.p.ac===1,tag+' : retour au hub '+JSON.stringify(S));
   await pg.mouse.click(5,300);await pg.waitForTimeout(300);S=await st(pg);check(S.p.state[0]==='running',tag+' : hub, premier appui : '+S.p.state);
   console.log(tag.padEnd(22),'ok');await ctx.close()}
  await b2.close()}
 server.close();console.log('errs',errs);process.exitCode=errs.length?1:0})().catch(e=>{server.close();console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
