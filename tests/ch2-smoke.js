// Test de fumee du Chapitre II (Silent Bells) sur chapters/ch2-silent-bells/dist/index.html.
// Puis, sans aucune cle de sauvegarde (UNLOCK_ALL) : phases II et III lancees directement depuis le menu et la frise,
// en Facile, Normal et Difficile ; l'Epreuve se lance depuis le menu (frise fermee).
// Syntaxe du script final, puis Normal et Difficile : prologue, phases I, II, III (deblocage via localStorage db-unl),
// PV du Veilleur affiches (4 en Normal, 3 en Difficile).
// Aucun appel reseau externe : controle statique du fichier (aucune URL http(s) ni API reseau), puis en jeu,
// hors ligne, toute requete autre que file:/data:/blob: (page, sous-ressource, worker, WebSocket, appel d'API
// reseau depuis le script) est interceptee et comptee comme erreur. Sortie attendue : errs []
const fs=require('fs'),path=require('path');const launch=require('./launch');
const FILE=path.resolve(__dirname,'../chapters/ch2-silent-bells/dist/index.html');
const errs=[];
const html=fs.readFileSync(FILE,'utf8');let nScript=0;
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)){nScript++;try{new Function(m[1])}catch(e){errs.push('syntaxe: '+e.message)}}
if(nScript!==1)errs.push('scripts: '+nScript+' au lieu de 1');
console.log('syntaxe',errs.length?'KO':'OK');
// statique : aucune URL externe ni API reseau dans le fichier publie
{const n=errs.length;
 for(const m of html.matchAll(/(?:https?:)?\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)+(?=[\/"'\s)?:]|$)/gi))errs.push('URL externe: '+m[0]);
 for(const m of html.matchAll(/\b(?:fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|serviceWorker|importScripts|import\s*\(|window\.open\s*\()/g))errs.push('API reseau: '+m[0]);
 for(const m of html.matchAll(/<(?:a|link|iframe|img|script|source|audio|video|embed|object|form)\b[^>]*\b(?:href|src|action|data)\s*=/gi))errs.push('ressource liee: '+m[0]);
 console.log('reseau (statique)',errs.length>n?'KO':'OK')}
(async()=>{const b=await launch();
const ctx=await b.newContext({viewport:{width:1100,height:760},offline:true});
await ctx.addInitScript(()=>{try{localStorage.setItem('db-unl','3')}catch(e){}});
// toute requete HTTP(S) du contexte (page, workers) est interceptee et refusee
await ctx.route(u=>!/^(file|data|blob):/.test(u.href),r=>{errs.push('reseau: '+r.request().url());return r.abort()});
// appels d'API reseau depuis le script, meme s'ils echouaient en silence hors ligne
await ctx.addInitScript(()=>{const hit=(k,u)=>{try{console.error('reseau-api '+k+' '+u)}catch(e){}};
 const F=window.fetch;window.fetch=function(u){hit('fetch',u&&u.url||u);return F.apply(this,arguments)};
 const O=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){hit('xhr',u);return O.apply(this,arguments)};
 const W=window.WebSocket;window.WebSocket=function(u){hit('websocket',u);return new W(...arguments)};
 if(navigator.sendBeacon){const B=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=(u,d)=>{hit('beacon',u);return B(u,d)}}
 const E=window.EventSource;if(E)window.EventSource=function(u){hit('eventsource',u);return new E(...arguments)};
 window.open=u=>{hit('window.open',u);return null}});
let pg=await ctx.newPage();
pg.on('websocket',w=>errs.push('websocket: '+w.url()));
pg.on('worker',w=>{if(!/^(file|data|blob):/.test(w.url()))errs.push('worker: '+w.url())});
pg.on('popup',p=>errs.push('popup: '+p.url()));
pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
pg.on('requestfailed',r=>errs.push('requestfailed: '+r.url()));
await pg.goto('file://'+FILE);await pg.waitForTimeout(500);
const st=()=>pg.evaluate(()=>({ph:document.body.dataset.ph,eye:document.getElementById('hdEye').textContent,
 menu:!document.getElementById('menu').hidden,card:!document.getElementById('ov').hidden,skip:!document.getElementById('skip').hidden,
 ward:document.getElementById('ward').textContent,boss:document.getElementById('nmB').textContent,hp:document.getElementById('hpPn').textContent,
 locked:[...document.querySelectorAll('#phases button')].map(x=>x.disabled?1:0).join('')}));
// passe prologue et cinematique (Entree) jusqu'a la carte de phase
const toCard=async lbl=>{for(let i=0;i<40;i++){const s=await st();if(s.card)return s;if(s.skip)await pg.keyboard.press('Enter');await pg.waitForTimeout(250)}errs.push(lbl+': carte de phase jamais affichee');return st()};
const play=async(lbl,ph,hp)=>{let s=await toCard(lbl);
 await pg.click('#go');await pg.waitForTimeout(300);
 for(let i=0;i<12;i++){await pg.keyboard.down('Space');await pg.waitForTimeout(120);await pg.keyboard.up('Space');await pg.waitForTimeout(380)}
 s=await st();console.log(lbl,JSON.stringify(s));
 if(s.ph!==String(ph))errs.push(lbl+': phase interne '+s.ph+' au lieu de '+ph);
 if(s.menu)errs.push(lbl+': menu affiche');
 if(!s.hp.endsWith('/'+hp))errs.push(lbl+': PV '+s.hp+' (max attendu '+hp+')')};
console.log('menu',JSON.stringify(await st()));
if(await pg.evaluate(()=>localStorage.getItem('db-unl'))!=='3')errs.push('db-unl non pose');
for(const [dk,hp] of [['normal',4],['hard',3]]){
 if(dk!=='normal'){await pg.click('#menuBtn');await pg.waitForTimeout(300)}
 await pg.click('[data-diff='+dk+']');await pg.waitForTimeout(300);
 await play(dk+' phase I',2,hp);
 // frise : boutons I, II, III ; ORDER=[2,1,3]
 const s0=await st();if(s0.locked!=='000')errs.push('phases verrouillees malgre db-unl=3: '+s0.locked);
 await pg.click('#phases button[data-ph="2"]');await pg.waitForTimeout(300);
 await play(dk+' phase II',1,hp);
 await pg.click('#phases button[data-ph="3"]');await pg.waitForTimeout(300);
 await play(dk+' phase III',3,hp)}
// sans cle : tout est ouvert des le depart (UNLOCK_ALL)
{const ctx2=await b.newContext({viewport:{width:1100,height:760},offline:true});
 await ctx2.route(u=>!/^(file|data|blob):/.test(u.href),r=>{errs.push('reseau: '+r.request().url());return r.abort()});
 pg=await ctx2.newPage();pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
 await pg.goto('file://'+FILE);await pg.waitForTimeout(500);
 if(await pg.evaluate(()=>localStorage.length))errs.push('sans cle : localStorage non vide');
 const s0=await st();console.log('sans cle, menu',JSON.stringify(s0));if(s0.locked!=='000')errs.push('sans cle : frise verrouillee '+s0.locked);
 for(const [dk,gp,ph,hp] of [['normal',3,3,4],['hard',2,1,3],['easy',3,3,6]]){
  await pg.click('[data-diff='+dk+']');await pg.waitForTimeout(300);           // menu -> prologue
  await pg.click('#phases button[data-ph="'+gp+'"]');await pg.waitForTimeout(300); // frise, sans finir le niveau precedent
  await play('sans cle '+dk+' phase '+['','I','II','III'][gp]+' directe',ph,hp);
  await pg.click('#menuBtn');await pg.waitForTimeout(300)}
 await pg.click('[data-diff=trial]');await pg.waitForTimeout(200);await pg.click('[data-diff=tn]');await pg.waitForTimeout(300);
 const t=await toCard('Epreuve');console.log('sans cle, Epreuve',JSON.stringify(t));
 if(t.ph!=='2'||!t.hp.endsWith('/4')||t.locked!=='111')errs.push('Epreuve : phase '+t.ph+', PV '+t.hp+', frise '+t.locked+' (attendu phase I, 4 PV, frise fermee)');
 await ctx2.close()}
// pages non file: ouvertes par la page (onglet, navigation) : aucune
for(const p of ctx.pages())if(!p.url().startsWith('file:'))errs.push('page externe: '+p.url());
console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)})
