// Aucun mot d'annonce a l'ecran, les deux chapitres (generalise ch2-announce.js ; session menu/common). Liste BAN commune : ch2-lib.js.
//  1. DOM, dist publies, FR et EN : textes visibles de l'ecran de demarrage, du menu (difficultes, sous-menu et note de l'Epreuve),
//     de la pause, de l'en-tete, des barres, des boutons, et des cartes de phase rencontrees : aucun mot interdit (hors libelle du
//     bouton d'action « Bloquer » / « Esquiver » et mode d'emploi du menu, qui nomment le geste) ;
//  2. canvas du Chapitre I (copie de test build/out/test.html, python3 build/build_test.py) : tout texte passe a fillText /
//     strokeText pendant les trois phases, Normal et Difficile, FR et EN, avec des appuis reguliers (blocages, coups recus) ;
//  3. canvas du Chapitre II : ch2-announce.js (parcours complet et bots maladroits, plus long) ; --all le lance a la suite.
// Sortie attendue : errs []
const path=require('path'),{spawnSync}=require('child_process');const launch=require('./launch');const {banned}=require('./ch2-lib');
const ROOT=path.resolve(__dirname,'..');
const F={ch1:path.join(ROOT,'chapters/ch1-ember-bridge/dist/index.html'),ch2:path.join(ROOT,'chapters/ch2-silent-bells/dist/index.html')};
const errs=[];
const TXT=()=>{const out=[],seen=new Set();
 for(const e of document.querySelectorAll('#gate,#menu,#pause,#ov,header,.bars,.controls')){if(e.hidden)continue;
  const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const p=n.parentElement;if(!p||p.closest('[hidden]')||p.closest('svg')||p.closest('#ward,.how'))continue;   // libelle du bouton d'action et mode d'emploi : des verbes, pas des annonces
   const t=n.textContent.trim();if(t&&!seen.has(t)){seen.add(t);out.push(t)}}}
 return out};
(async()=>{const b=await launch();
 // 1. DOM
 for(const ch of ['ch1','ch2'])for(const lang of ['fr','en']){
  const tag=ch+' '+lang,ctx=await b.newContext({viewport:{width:1100,height:760},locale:lang==='fr'?'fr-FR':'en-US'});
  await ctx.addInitScript(k=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem(k,'1')}},'lb-'+ch+'-intro');
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(tag+': pageerror: '+e.message));
  await pg.goto('file://'+F[ch]);await pg.waitForTimeout(300);const all=new Set();const add=async()=>{for(const t of await pg.evaluate(TXT))all.add(t)};
  await add();await pg.click('#gateBtn');await add();
  await pg.evaluate(()=>document.querySelector('#mphM [data-diff=trial]').click());await add();await pg.click('#mBackT');
  await pg.click('#mphM [data-diff=normal]');await pg.waitForTimeout(400);
  for(let i=0;i<20&&await pg.evaluate(()=>document.getElementById('ov').hidden);i++){await pg.keyboard.press('Enter');await pg.waitForTimeout(250)}   // Chapitre II : cinematique d'entree
  await add();await pg.click('#go');await pg.waitForTimeout(300);await pg.keyboard.press('p');await pg.waitForTimeout(100);await add();await pg.keyboard.press('p');
  for(const t of all){const x=banned(t);if(x)errs.push(tag+' : texte affiche '+JSON.stringify(t)+' ('+x+')')}
  console.log(tag,all.size,'textes lus');await ctx.close()}
 // 2. canvas du Chapitre I
 {const ctx=await b.newContext({viewport:{width:1100,height:760},locale:'fr-FR'});
  await ctx.addInitScript(()=>{window.__drawn={};const P=CanvasRenderingContext2D.prototype;for(const f of ['fillText','strokeText']){const o=P[f];P[f]=function(t){window.__drawn[t]=(window.__drawn[t]||0)+1;return o.apply(this,arguments)}}});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push('ch1 canvas: pageerror: '+e.message));
  await pg.goto('file://'+path.join(ROOT,'build/out/test.html'));await pg.waitForTimeout(300);
  for(const lang of ['fr','en'])for(const dk of ['normal','hard'])for(const ph of [1,2,3]){
   await pg.evaluate(([l,dk,ph])=>{document.querySelector('#langs button[data-lang='+l+']').click();const T=window.__t;T.applyDiff(dk);T.goPhase(ph);T.start()},[lang,dk,ph]);
   for(let i=0;i<14;i++){await pg.waitForTimeout(450);await pg.evaluate(()=>{const T=window.__t,S=T.getR()||T.getQ()||T.getG();if(S&&S.php<2)S.php=3;T.press()})}}
  const d=await pg.evaluate(()=>window.__drawn);
  for(const k in d){const x=banned(k);if(x)errs.push('ch1 canvas : '+JSON.stringify(k)+' ('+d[k]+' fois) : '+x)}
  console.log('ch1 canvas, textes dessines :',Object.keys(d).sort().map(k=>JSON.stringify(k)).join(', '));await ctx.close()}
 await b.close();
 if(process.argv.includes('--all')){const r=spawnSync(process.execPath,[path.join(__dirname,'ch2-announce.js')],{encoding:'utf8',env:process.env});
  process.stdout.write(r.stdout.split('\n').slice(-3).join('\n')+'\n');if(r.status)errs.push('ch2-announce.js en echec')}
 else console.log('canvas du Chapitre II : node ch2-announce.js (ou node announce.js --all)');
 console.log('errs',errs);process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
