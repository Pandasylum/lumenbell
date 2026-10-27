// Test de fumee du Chapitre II (Silent Bells) sur chapters/ch2-silent-bells/dist/index.html.
// Syntaxe du script final, puis Normal : prologue, phases I, II, III (deblocage via localStorage db-unl).
// Hors ligne : toute requete externe est une erreur. Sortie attendue : errs []
const fs=require('fs'),path=require('path');const launch=require('./launch');
const FILE=path.resolve(__dirname,'../chapters/ch2-silent-bells/dist/index.html');
const errs=[];
const html=fs.readFileSync(FILE,'utf8');let nScript=0;
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)){nScript++;try{new Function(m[1])}catch(e){errs.push('syntaxe: '+e.message)}}
if(nScript!==1)errs.push('scripts: '+nScript+' au lieu de 1');
console.log('syntaxe',errs.length?'KO':'OK');
(async()=>{const b=await launch();
const ctx=await b.newContext({viewport:{width:1100,height:760},offline:true});
await ctx.addInitScript(()=>{try{localStorage.setItem('db-unl','3')}catch(e){}});
const pg=await ctx.newPage();
pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
pg.on('requestfailed',r=>errs.push('requestfailed: '+r.url()));
pg.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))errs.push('reseau: '+r.url())});
await pg.goto('file://'+FILE);await pg.waitForTimeout(500);
const st=()=>pg.evaluate(()=>({ph:document.body.dataset.ph,eye:document.getElementById('hdEye').textContent,
 menu:!document.getElementById('menu').hidden,card:!document.getElementById('ov').hidden,skip:!document.getElementById('skip').hidden,
 ward:document.getElementById('ward').textContent,boss:document.getElementById('nmB').textContent,hp:document.getElementById('hpPn').textContent,
 locked:[...document.querySelectorAll('#phases button')].map(x=>x.disabled?1:0).join('')}));
// passe prologue et cinematique (Entree) jusqu'a la carte de phase
const toCard=async lbl=>{for(let i=0;i<40;i++){const s=await st();if(s.card)return s;if(s.skip)await pg.keyboard.press('Enter');await pg.waitForTimeout(250)}errs.push(lbl+': carte de phase jamais affichee');return st()};
const play=async(lbl,ph)=>{let s=await toCard(lbl);
 await pg.click('#go');await pg.waitForTimeout(300);
 for(let i=0;i<12;i++){await pg.keyboard.down('Space');await pg.waitForTimeout(120);await pg.keyboard.up('Space');await pg.waitForTimeout(380)}
 s=await st();console.log(lbl,JSON.stringify(s));
 if(s.ph!==String(ph))errs.push(lbl+': phase interne '+s.ph+' au lieu de '+ph);
 if(s.menu)errs.push(lbl+': menu affiche')};
console.log('menu',JSON.stringify(await st()));
if(await pg.evaluate(()=>localStorage.getItem('db-unl'))!=='3')errs.push('db-unl non pose');
await pg.click('[data-diff=normal]');await pg.waitForTimeout(300);
await play('phase I',2);
// frise : boutons I, II, III ; ORDER=[2,1,3]
const s0=await st();if(s0.locked!=='000')errs.push('phases verrouillees malgre db-unl=3: '+s0.locked);
await pg.click('#phases button[data-ph="2"]');await pg.waitForTimeout(300);
await play('phase II',1);
await pg.click('#phases button[data-ph="3"]');await pg.waitForTimeout(300);
await play('phase III',3);
console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)})
