// L'Epreuve dans le menu commun, les deux chapitres (session menu/common ; decisions du 1er novembre et du 31 octobre).
// dist publies, FR et EN :
//  1. noms et sous-titres : Facile « Respire », Normal « À la loyale », Difficile « Sans pitié », Epreuve + element du chapitre
//     (« Épreuve du feu », « Épreuve de l'eau ») « Challenge ultime » ; anglais provisoire (Breathe, Fair and square, No mercy,
//     Ultimate challenge, Trial by Fire, Trial by Water : a valider par le projet Lore) ;
//  2. sous-menu de l'Epreuve : Normal, Difficile (record ou « Pas encore de record »), Retour ; note identique dans les deux chapitres (quatre regles, texte du Chapitre I), avec « Tu récupères 1 PV entre
//     les phases. » / « You recover 1 life between phases. » (texte d'origine) ;
//  3. en Epreuve (Normal) : frise des phases masquee, case « Aide » desactivee et decochee, lb-help inchangee ; retour en Normal :
//     case rendue, valeur memorisee ;
//  4. ouverte pendant les tests (TRIAL_OPEN) ; copie avec TRIAL_OPEN=false : « 🔒 », « À débloquer », aria-disabled, le clic
//     n'ouvre rien ; avec la vraie fin vue (lb-chN-end) : ouverte.
// Sortie attendue : errs []
const fs=require('fs'),path=require('path'),os=require('os');const launch=require('./launch');
const F={ch1:path.resolve(__dirname,'../chapters/ch1-ember-bridge/dist/index.html'),ch2:path.resolve(__dirname,'../chapters/ch2-silent-bells/dist/index.html')};
const NAME={ch1:{en:'Trial by Fire',fr:'Épreuve du feu'},ch2:{en:'Trial by Water',fr:"Épreuve de l'eau"}};
const SUB={en:['Easy','Breathe','Normal','Fair and square','Hard','No mercy','Ultimate challenge'],fr:['Facile','Respire','Normal','À la loyale','Difficile','Sans pitié','Challenge ultime']};
const RULES={en:['The three phases in a row, with no pause and no visual help.','A single death sends you back to Phase I.','One stats table at the end of the run.'],fr:["Les trois phases d'affilée, sans pause et sans aide visuelle.",'Une seule mort te renvoie à la phase I.','Un seul tableau de stats à la fin de la run.']};
const HEAL={en:'You recover 1 life between phases.',fr:'Tu récupères 1 PV entre les phases.'};
const errs=[],check=(c,m)=>{if(!c)errs.push(m)};
function locked(ch){const h=fs.readFileSync(F[ch],'utf8'),a='const TRIAL_OPEN=true;';if(h.split(a).length!==2)throw new Error(ch+' : TRIAL_OPEN introuvable');
 const out=path.join(os.tmpdir(),'trial-locked-'+ch+'.html');fs.writeFileSync(out,h.replace(a,'const TRIAL_OPEN=false;'));return out}
(async()=>{const b=await launch();
for(const ch of ['ch1','ch2'])for(const lang of ['fr','en']){
 const tag=ch+' '+lang,ctx=await b.newContext({viewport:{width:1100,height:760},locale:lang==='fr'?'fr-FR':'en-US'});
 await ctx.addInitScript(()=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem('lb-help','1')}});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(tag+': pageerror: '+e.message));
 await pg.goto('file://'+F[ch]);await pg.waitForTimeout(300);await pg.click('#gateBtn');
 const m=await pg.evaluate(()=>[...document.querySelectorAll('#mphM button')].flatMap(x=>[x.querySelector('b').textContent,x.querySelector('span').textContent]));
 const want=[SUB[lang][0],SUB[lang][1],SUB[lang][2],SUB[lang][3],SUB[lang][4],SUB[lang][5],NAME[ch][lang],SUB[lang][6]];
 check(JSON.stringify(m)===JSON.stringify(want),tag+': difficultes '+JSON.stringify(m)+' au lieu de '+JSON.stringify(want));
 await pg.click('#mphM [data-diff=trial]');await pg.waitForTimeout(100);
 const t=await pg.evaluate(()=>({m:document.getElementById('mphM').hidden,t:!document.getElementById('mphT').hidden,note:!document.getElementById('trialNote').hidden,
  noteName:document.querySelector('#trialNote b').textContent,lines:[...document.querySelectorAll('#trialNote li')].map(x=>x.textContent),
  sub:[...document.querySelectorAll('#mphT button')].map(x=>x.textContent)}));
 check(t.m&&t.t&&t.note&&t.noteName===NAME[ch][lang]&&t.lines.length===4&&t.lines.includes(HEAL[lang])&&t.lines[0]===RULES[lang][0]&&t.lines[2]===RULES[lang][1]&&t.lines[3]===RULES[lang][2],tag+': sous-menu de l\'Epreuve '+JSON.stringify(t));
 check(t.sub.length===3&&/^(Normal|Normal)/.test(t.sub[0])&&t.sub[0].endsWith(lang==='fr'?'Pas encore de record':'No record yet'),tag+': boutons du sous-menu '+JSON.stringify(t.sub));
 await pg.click('#mphT [data-diff=tn]');await pg.waitForTimeout(400);
 if(await pg.evaluate(()=>!!document.getElementById('cine')&&!document.getElementById('cine').hidden)){await pg.keyboard.press('Escape');await pg.waitForTimeout(300)}
 const r=await pg.evaluate(()=>({track:getComputedStyle(document.getElementById('phases')).display,help:((id)=>{const g=document.getElementById('mGear');g.click();const q=s=>document.querySelector('#lbSet [data-id='+id+'] '+s),b=q('button[aria-pressed=true]'),d=q('button').disabled;g.click();return{on:!!b&&b.dataset.v==='true',dis:d}})('help').on,dis:((id)=>{const g=document.getElementById('mGear');g.click();const q=s=>document.querySelector('#lbSet [data-id='+id+'] '+s),b=q('button[aria-pressed=true]'),d=q('button').disabled;g.click();return{on:!!b&&b.dataset.v==='true',dis:d}})('help').dis,
  label:false,key:localStorage.getItem('lb-help')}));
 check(r.track==='none'&&!r.help&&r.dis&&!r.label&&r.key==='1',tag+': Epreuve (frise, aide) '+JSON.stringify(r));
 await pg.click('#menuBtn');await pg.waitForTimeout(200);await pg.click('#mphM [data-diff=normal]');await pg.waitForTimeout(300);
 const n=await pg.evaluate(()=>({track:getComputedStyle(document.getElementById('phases')).display,help:((id)=>{const g=document.getElementById('mGear');g.click();const q=s=>document.querySelector('#lbSet [data-id='+id+'] '+s),b=q('button[aria-pressed=true]'),d=q('button').disabled;g.click();return{on:!!b&&b.dataset.v==='true',dis:d}})('help').on,dis:((id)=>{const g=document.getElementById('mGear');g.click();const q=s=>document.querySelector('#lbSet [data-id='+id+'] '+s),b=q('button[aria-pressed=true]'),d=q('button').disabled;g.click();return{on:!!b&&b.dataset.v==='true',dis:d}})('help').dis}));
 check(n.track!=='none'&&n.help&&!n.dis,tag+': retour en Normal (frise, aide memorisee) '+JSON.stringify(n));
 console.log(tag,JSON.stringify({difficultes:m.join(' / '),note:t.lines.length+' lignes',epreuve:r,normal:n}));
 await ctx.close()}
// verrou (TRIAL_OPEN=false), puis vraie fin vue
for(const ch of ['ch1','ch2'])for(const end of [false,true]){
 const tag=ch+' verrou'+(end?' + vraie fin':''),ctx=await b.newContext({viewport:{width:1100,height:760},locale:'fr-FR'});
 if(end)await ctx.addInitScript(k=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem(k,'1')}},'lb-'+ch+'-end');
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(tag+': pageerror: '+e.message));
 await pg.goto('file://'+locked(ch));await pg.waitForTimeout(300);await pg.click('#gateBtn');
 const s0=await pg.evaluate(()=>{const t=document.querySelector('#mphM [data-diff=trial]');return{b:t.querySelector('b').textContent,s:t.querySelector('span').textContent,dis:t.getAttribute('aria-disabled'),outro:!document.getElementById('outroBtn').hidden}});
 await pg.evaluate(()=>document.querySelector('#mphM [data-diff=trial]').click());await pg.waitForTimeout(100);   // aria-disabled : Playwright refuse le clic
 const open=await pg.evaluate(()=>!document.getElementById('mphT').hidden);
 if(!end)check(s0.b==='🔒 '+NAME[ch].fr&&s0.s==='À débloquer'&&s0.dis==='true'&&!open&&!s0.outro,tag+': '+JSON.stringify([s0,open]));
 else check(s0.b===NAME[ch].fr&&s0.s==='Challenge ultime'&&s0.dis==='false'&&open&&s0.outro,tag+': '+JSON.stringify([s0,open]));
 console.log(tag,JSON.stringify(s0),'sous-menu',open);
 await ctx.close()}
console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
