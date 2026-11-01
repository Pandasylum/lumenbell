// Captures deterministes des deux chapitres, pour verifier qu'un changement technique ne change pas l'aspect.
// Usage :
//   node visual-shots.js <dossier> [ch1.html] [ch2.html]   captures (par defaut les deux dist/index.html)
//   node visual-shots.js --compare <dossierA> <dossierB>    compare au pixel ; pour chaque ecart : nombre de pixels et boite
//   node visual-shots.js --poses <dossier> [ch1test.html] [ch2test.html]   le Veilleur commun (LB.drawWatcher) : une planche de toutes
//        les poses et une planche de variantes (lanterne, voile blanc, silhouettes, bouclier), dessinees par le module de chaque
//        chapitre (les deux planches doivent etre identiques d'un chapitre a l'autre), puis les poses en scene : Chapitre I (phase I
//        au repos, garde, coup recu, riposte ; phase II plongee, chute ; phase III arrivee, garde, finale ; outro), Chapitre II (les
//        trois gestes, coup recu, ripostes, defaite, lanterne qui faiblit, prologue, epilogue). Copies de test a crochets : par
//        defaut build/out/test.html (python3 build/build_test.py) et la copie fabriquee par ch2-lib.js depuis le dist du Chapitre II.
//   node visual-shots.js --cine <dossier> [ch1.html] [ch2test.html]   cartons des intros et outros des deux chapitres a instants
//        fixes (CINE_AT, secondes) : Chapitre I par le DOM du dist (intro depuis Normal, outro par le bouton du menu), Chapitre II par
//        la copie de test a crochets (ch2-lib.js ; CH2_DIST / CH2_TEST_OUT pour un autre dist). Comparer ensuite avec --compare.
//   --no-breath (avec une capture) : respiration neutralisee (LB.WATCHER_T.breath a zero, par remplacement de texte dans une copie)
//        pour prouver qu'un chapitre est identique au pixel hors respiration.
// Determinisme (methode du Chapitre II, NOTES.md) : requestAnimationFrame, performance.now et Date.now remplaces par un pas
// fixe de 1/60 s avance par le test, Math.random a graine fixe, AudioContext absent, animations CSS coupees, souris en (0, 0).
// Parcours pilote par le DOM seulement (le dist n'a pas de crochets) : menu, cinematique d'intro, carte, trois instants de
// chaque phase, appui refuse et barre de recuperation (aide cochee puis decochee), pause ; FR et EN a 1100 x 760, FR a 390 x 844 ; plus un menu avec les anciennes cles du chapitre (migration).
const fs=require('fs'),path=require('path');const launch=require('./launch');
const ROOT=path.resolve(__dirname,'..');
const STEP=1000/60;
const CLOCK=seed=>{let now=0,id=0;const q=new Map();
 performance.now=()=>now;const D0=Date.UTC(2026,9,28);Date.now=()=>D0+now;
 window.requestAnimationFrame=cb=>{q.set(++id,cb);return id};window.cancelAnimationFrame=i=>q.delete(i);
 window.__adv=n=>{for(let k=0;k<n;k++){now+=1000/60;const cbs=[...q.values()];q.clear();for(const cb of cbs)try{cb(now)}catch(e){setTimeout(()=>{throw e})}}};
 let s=seed>>>0;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
 window.AudioContext=undefined;window.webkitAudioContext=undefined};
const SIZES=[['desk',1100,760,'en'],['desk',1100,760,'fr'],['phone',390,844,'fr']];
const OLD={ch1:{'eb-lang':'fr','eb-intro':'1','eb-end':'1','eb-best-tn':'123.4','eb-best-th':'99.5'},
           ch2:{'pn-lang':'fr','db-optHelp':'1','db-optMus':'0','db-best-tn':'77.7'}};
async function shots(dir,files){fs.mkdirSync(dir,{recursive:true});const b=await launch();const errs=[];
 for(const ch of ['ch1','ch2'])for(const [nm,w,h,lang] of SIZES.concat([['old',1100,760,null]])){
  const ctx=await b.newContext({viewport:{width:w,height:h},locale:lang==='fr'?'fr-FR':'en-US',reducedMotion:'reduce'});
  await ctx.addInitScript(CLOCK,1234);
  if(nm==='old')await ctx.addInitScript(o=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');for(const k in o)localStorage.setItem(k,o[k])}},OLD[ch]);
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+' '+nm+': '+e.message));
  await pg.goto('file://'+files[ch]);
  const tag=ch+'-'+nm+(lang?'-'+lang:'');
  const adv=n=>pg.evaluate(n=>window.__adv(n),n);
  const shot=async k=>{await pg.mouse.move(0,0);await pg.waitForTimeout(60);await pg.screenshot({path:path.join(dir,tag+'-'+k+'.png'),animations:'disabled'})};
  const click=async sel=>{await pg.evaluate(s=>{const e=document.querySelector(s);if(!e)throw new Error('absent: '+s);e.click()},sel)};
  await adv(30);
  if(ch==='ch1'){await shot('gate');await click('#gateBtn')}
  if(lang)await click('#langs button[data-lang='+lang+']');
  await adv(60);await shot('menu');
  if(nm==='old')continue;
  await click('#mphM [data-diff=normal]');await adv(150);await shot('intro-a');await adv(420);await shot('intro-b');
  await pg.keyboard.press('Escape');await adv(30);await pg.keyboard.press('Enter').catch(()=>{});await adv(30);
  for(const ph of [0,1,2]){
   if(ph)await click('#phases button[data-ph="'+(ph+1)+'"]');
   await adv(40);await shot('p'+(ph+1)+'-card');
   await click('#go');await adv(90);await shot('p'+(ph+1)+'-a');
   await adv(150);await pg.keyboard.press('Space');await adv(12);await shot('p'+(ph+1)+'-b');
   await adv(200);await shot('p'+(ph+1)+'-c');
   // appui refuse (lanterne rouge) et barre de recuperation (repere d'aide, case cochee) : Normal, bureau, anglais
   if(nm==='desk'&&lang==='en'){
    await pg.evaluate(()=>{const o=document.getElementById('optHelp');if(o&&!o.checked)o.click()});
    await pg.keyboard.press('Space');await adv(8);await pg.keyboard.press('Space');await adv(3);await shot('p'+(ph+1)+'-deny-act');
    await adv(28);await shot('p'+(ph+1)+'-recover-help');
    await pg.keyboard.press('Space');await adv(3);await shot('p'+(ph+1)+'-deny-recover-help');
    await pg.evaluate(()=>{const o=document.getElementById('optHelp');if(o&&o.checked)o.click()});
    await adv(3);await shot('p'+(ph+1)+'-recover-nohelp');
   }
  }
  await pg.keyboard.press('p');await adv(20);await shot('pause');
  await ctx.close()}
 await b.close();return errs}
async function compare(a,b){const fa=fs.readdirSync(a).filter(f=>f.endsWith('.png')).sort(),fb=new Set(fs.readdirSync(b));
 const br=await launch();const pg=await (await br.newContext()).newPage();const out=[];let same=0;
 for(const f of fa){if(!fb.has(f)){out.push(f+' : absent de '+b);continue}
  const A=fs.readFileSync(path.join(a,f)),B=fs.readFileSync(path.join(b,f));if(A.equals(B)){same++;continue}
  const r=await pg.evaluate(async([x,y])=>{const ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s});
   const [i,j]=[await ld(x),await ld(y)];if(i.width!==j.width||i.height!==j.height)return{size:[i.width,i.height,j.width,j.height]};
   const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');
   g.drawImage(i,0,0);const p=g.getImageData(0,0,c.width,c.height).data;g.clearRect(0,0,c.width,c.height);g.drawImage(j,0,0);const q=g.getImageData(0,0,c.width,c.height).data;
   let n=0,x0=1e9,y0=1e9,x1=-1,y1=-1;for(let k=0;k<p.length;k+=4)if(p[k]!==q[k]||p[k+1]!==q[k+1]||p[k+2]!==q[k+2]||p[k+3]!==q[k+3]){n++;const px=(k/4)%c.width,py=Math.floor(k/4/c.width);x0=Math.min(x0,px);y0=Math.min(y0,py);x1=Math.max(x1,px);y1=Math.max(y1,py)}
   return{n,box:n?[x0,y0,x1,y1]:null}},[A.toString('base64'),B.toString('base64')]);
  if(r.n===0){same++;continue}
  out.push(f+' : '+JSON.stringify(r))}
 await br.close();console.log('identiques',same+'/'+fa.length);out.forEach(l=>console.log('ECART',l));return out}
/* respiration neutralisee : copie du fichier avec LB.WATCHER_T.breath a zero (verifie que le remplacement a eu lieu) */
const BREATH=/breath:\{bob:[\d.]+,bobF:([\d.]+),fl:[\d.]+,flF:([\d.]+)\}/;
function noBreath(f){const h=fs.readFileSync(f,'utf8');if(!BREATH.test(h))return f;
 const out=path.join(require('os').tmpdir(),'nobreath-'+path.basename(path.dirname(path.dirname(f)))+'-'+path.basename(f));
 fs.writeFileSync(out,h.replace(BREATH,'breath:{bob:0,bobF:$1,fl:0,flF:$2}'));return out}
/* planches du Veilleur commun, dessinees dans la page par LB (crochets __t) : 960 x 540, fond uni, une case par pose */
function sheet(o){const LB=window.__t.LB;let c=document.getElementById('__sheet');if(!c){c=document.createElement('canvas');c.id='__sheet';c.width=960;c.height=540;
  c.style.cssText='position:fixed;left:0;top:0;width:960px;height:540px;z-index:2147483647;background:#151a28';document.body.appendChild(c)}
 const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,960,540);g.fillStyle='#151a28';g.fillRect(0,0,960,540);
 const cells=o.cells(LB),cw=960/7,ch=270;
 cells.forEach((q,i)=>{const x=(i%7)*cw+cw*.42,y=Math.floor(i/7)*ch+ch-34;
  g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x-cw*.42+4,y-ch+40,cw-8,ch-10);
  g.fillStyle='#c8d0e8';g.font='12px monospace';g.textAlign='left';g.fillText(q.n,x-cw*.42+10,y+18);
  g.save();q.draw(g,x,y,LB);g.restore()});}
const SHEETS={
 poses:LB=>Object.keys(LB.WATCHER_POSES).map(n=>({n:n+(n==='fall'?' k=.15':n==='walk'?' t=.1':''),draw:(g,x,y,L)=>{const r=L.drawWatcher(g,x,y,n,n==='walk'?.1:0,{k:n==='fall'?.15:n==='dodgeDown'?.4:1,drop:60,breath:false});
   g.fillStyle='#ff3df0';g.fillRect(r.lx-2,r.ly-2,4,4)}})),
 variants:LB=>[
  {n:'idle respire t=.4',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'idle',.4)},
  {n:'block k=.5',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'block',0,{k:.5})},
  {n:'raise k=.5',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'raise',0,{k:.5})},
  {n:'hurt k=.5',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'hurt',0,{k:.5})},
  {n:'counter k=0',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'counter',0,{k:0})},
  {n:'dodgeSide k=.5',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'dodgeSide',0,{k:.5})},
  {n:'deny (rouge)',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'idle',0,{breath:false,lanternCol:L.watcherLanternCol({deny:.2,s:'act'},0)})},
  {n:'recover',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'idle',0,{breath:false,lanternCol:L.watcherLanternCol({deny:0,s:'recover'},0)})},
  {n:'lamp .5',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'raise',0,{lamp:.5})},
  {n:'lamp 0',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'raise',0,{lamp:0})},
  {n:'white .6',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'idle',0,{breath:false,white:.6})},
  {n:'staffA -1.9',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'raise',0,{staffA:-1.9,rot:-.1})},
  {n:'staffA -.55',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'raise',0,{staffA:-.55,rot:.12})},
  {n:'aura .8 + beam',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'raise',0,{k:.4,aura:.8,beam:{len:30,w:14,al:.8}})},
  ],
 shapes:LB=>[
  {n:'block (bouclier)',draw:(g,x,y,L)=>{L.drawWatcher(g,x-30,y,'block',0);L.drawBlock(g,x-30,y,.1,.333)}},
  {n:'flat .6',draw:(g,x,y,L)=>L.drawWatcher(g,x,y,'walk',0,{flat:true,dy:0,scale:.6})},
  {n:'ink (de dos)',draw:(g,x,y,L)=>{g.fillStyle='#8a90a8';g.fillRect(x-60,y-200,120,200);L.drawWatcher(g,x,y,'idle',0,{ink:'#070a18',lamp:1})}},
  {n:'silhouette',draw:(g,x,y,L)=>{g.translate(x-225,y-455);g.fillStyle='#8a90a8';g.fillRect(190,290,90,170);L.drawWatcherSil(g,'#07050a',{k:1,r:40,s:.35})}}]};
async function poses(dir,files){fs.mkdirSync(dir,{recursive:true});const b=await launch();const errs=[];
 for(const ch of ['ch1','ch2']){
  const ctx=await b.newContext({viewport:{width:1100,height:760},locale:'en-US',reducedMotion:'reduce'});
  await ctx.addInitScript(CLOCK,1234);
  if(ch==='ch1')await ctx.addInitScript(()=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem('lb-ch1-end','1')}});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+': '+e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.goto('file://'+files[ch]);await pg.evaluate(()=>window.__adv(10));
  const shot=async k=>{await pg.mouse.move(0,0);await pg.waitForTimeout(40);await pg.screenshot({path:path.join(dir,ch+'-'+k+'.png'),animations:'disabled'})};
  for(const k of Object.keys(SHEETS)){
   await pg.evaluate(([fn,src])=>{const f=eval('('+fn+')'),cells=eval('('+src+')');f({cells})},[sheet.toString(),SHEETS[k].toString()]);
   await pg.screenshot({path:path.join(dir,ch+'-sheet-'+k+'.png'),animations:'disabled',clip:{x:0,y:0,width:960,height:540}})}
  await pg.evaluate(()=>document.getElementById('__sheet').remove());
  if(ch==='ch1'){
   const ev=f=>pg.evaluate(f),adv=n=>pg.evaluate(n=>window.__adv(n),n);
   await ev(()=>{const T=window.__t;T.applyDiff('normal');T.goPhase(1);T.start()});await adv(300);
   await ev(()=>{const b=window.__t.getG().boss;b.s='idle';b.t=0;b.wait=1e9});await adv(30);await shot('p1-idle');
   await ev(()=>window.__t.press());await adv(4);await shot('p1-block');await adv(60);
   await ev(()=>{const p=window.__t.getG().pl;p.s='hurt';p.t=0;p.rd=1});await adv(3);await shot('p1-hurt');
   await ev(()=>{const p=window.__t.getG().pl;p.s='stab';p.t=.12;p.x=400});await adv(1);await shot('p1-counter');
   await ev(()=>{const T=window.__t;T.goPhase(2);T.start()});await adv(240);
   await ev(()=>{const Q=window.__t.getQ();Q.cn=null;Q.pl.s='ready';Q.pl.t=0});await adv(2);await shot('p2-idle');
   await ev(()=>{const Q=window.__t.getQ();Q.pl.s='act';Q.pl.t=.13});await adv(1);await shot('p2-dodge');
   await ev(()=>{const Q=window.__t.getQ();Q.pl.s='down';Q.pl.t=.3});await adv(1);await shot('p2-fall');
   await ev(()=>{const T=window.__t;T.goPhase(3);T.start()});await adv(40);await shot('p3-walk');await adv(200);
   await ev(()=>{const R=window.__t.getR();R.cn=null;R.pl.s='ready';R.pl.t=0});await adv(2);await shot('p3-idle');
   await ev(()=>window.__t.press());await adv(6);await shot('p3-block');
   await ev(()=>{window.__t.startFinale()});await adv(60*1.9);await shot('p3-finale-leap');await adv(60*2);await shot('p3-finale-charge');await adv(60*7);await shot('p3-finale-end');
   await ev(()=>{window.__t.showMenu&&window.__t.showMenu();document.getElementById('outroBtn').click()});await adv(60*28.5);await shot('outro-sea');await adv(60*8);await shot('outro-dawn');
  }else{
   const ev=(f,x)=>pg.evaluate(f,x),st=s=>pg.evaluate(s=>{for(let i=0;i<Math.round(s*60);i++)window.__t.step(1/60,false);window.__t.step(1/60,true)},s);
   await ev(()=>window.__t.startRun('normal'));await st(27.7);await shot('prologue-walk');await st(2);await shot('prologue-idle');
   for(const [gp,nm] of [[1,'p1'],[2,'p2'],[3,'p3']]){
    await ev(gp=>{const T=window.__t;T.startRun('normal',true);T.jumpPhase(gp);for(let i=0;i<60*20&&T.S.mode!=='card';i++)T.step(1/60);T.go()},gp);await st(4);
    await ev(()=>{const S=window.__t.S;S.threats=[];S.pat=null;S.nextAt=1e9});await st(1);await shot(nm+'-idle');
    await ev(()=>window.__t.down());await st(.1);await shot(nm+'-act');await ev(()=>window.__t.up());await st(1.2);
    await ev(()=>{window.__t.S.hurtT=window.__t.gt});await st(.1);await shot(nm+'-hurt');await st(.5);
    await ev(()=>{const S=window.__t.S;S.cnt={t:window.__t.gt,dmg:0,dur:1.2,hitAt:9,k:S.phase};S.nextAt=1e9});await st(.55);await shot(nm+'-counter');await st(1);
   }
   await ev(()=>{window.__t.S.lampDim=.8});await st(0);await shot('lamp-dim');await ev(()=>{window.__t.S.lampDim=0});
   await ev(()=>{const S=window.__t.S;S.mode='dead';S.deadT=window.__t.gt-1});await st(0);await shot('dead');
   await ev(()=>window.__t.playEpilogue(()=>{}));await st(3);await shot('epilogue');
  }
  await ctx.close()}
 await b.close();return errs}
/* cartons des intros et outros a instants fixes (secondes depuis le debut) : Chapitre I par le DOM (dist, menu puis Normal ;
   outro par le bouton du menu, lb-ch1-end pose), Chapitre II par la copie de test a crochets (startRun, playEpilogue, pas fixe) */
const CINE_AT={ch1:{intro:[1,3,5.6,9,16,22.5,24,28,31,32.5,33.6],outro:[2,8,12,20,28,31,36,41,44,46.2]},
               ch2:{intro:[2,5.8,9,16,23,28.5,30,31.5,32.6],outro:[2,6,10,15,20,24,28,31,32.6]}};
async function cineShots(dir,files){fs.mkdirSync(dir,{recursive:true});const b=await launch();const errs=[];
 for(const ch of ['ch1','ch2'])for(const [nm,w,h,lang] of SIZES)for(const k of ['intro','outro']){
  const ctx=await b.newContext({viewport:{width:w,height:h},locale:lang==='fr'?'fr-FR':'en-US',reducedMotion:'reduce'});
  await ctx.addInitScript(CLOCK,1234);
  if(ch==='ch1'&&k==='outro')await ctx.addInitScript(()=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem('lb-ch1-end','1')}});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+' '+k+': '+e.message));
  await pg.goto('file://'+files[ch]);
  const tag=ch+'-'+k+'-'+nm+'-'+lang;
  const shot=async t=>{await pg.mouse.move(0,0);await pg.waitForTimeout(40);await pg.screenshot({path:path.join(dir,tag+'-'+String(t).replace('.','_')+'s.png'),animations:'disabled'})};
  const click=s=>pg.evaluate(s=>{const e=document.querySelector(s);if(!e)throw new Error('absent: '+s);e.click()},s);
  let now=0;
  if(ch==='ch1'){
   const adv=n=>pg.evaluate(n=>window.__adv(n),n);
   await adv(30);await click('#gateBtn');await click('#langs button[data-lang='+lang+']');await adv(30);
   await click(k==='intro'?'#mphM [data-diff=normal]':'#outroBtn');
   for(const t of CINE_AT.ch1[k]){await adv(Math.round((t-now)*60));now=Math.round(t*60)/60;await shot(t)}
  }else{
   await pg.evaluate(l=>{document.querySelector('#langs button[data-lang='+l+']').click();const T=window.__t;if(T.LB.cine)T.LB.cine.manual=true},lang);
   await pg.evaluate(k=>{const T=window.__t;if(k==='intro')T.startRun('normal',false);else T.playEpilogue(()=>{})},k);
   for(const t of CINE_AT.ch2[k]){const n=Math.round((t-now)*60)-1;await pg.evaluate(n=>{for(let i=0;i<n;i++)window.__t.step(1/60,false);window.__t.step(1/60,true)},n);now=Math.round(t*60)/60;await shot(t)}
  }
  await ctx.close()}
 await b.close();return errs}
(async()=>{const a=process.argv.slice(2);
 if(a[0]==='--compare'){const d=await compare(a[1],a[2]);process.exitCode=d.length?1:0;return}
 const nb=a.includes('--no-breath');const A=a.filter(x=>x!=='--no-breath');
 if(A[0]==='--cine'){if(!A[1])throw new Error('usage : node visual-shots.js --cine <dossier> [ch1.html] [ch2test.html]');
  const files={ch1:path.resolve(A[2]||path.join(ROOT,'chapters/ch1-ember-bridge/dist/index.html')),ch2:path.resolve(A[3]||require('./ch2-lib').testPage())};
  const errs=await cineShots(path.resolve(A[1]),files);console.log('errs',errs);process.exitCode=errs.length?1:0;return}
 if(A[0]==='--poses'){if(!A[1])throw new Error('usage : node visual-shots.js --poses <dossier> [ch1test.html] [ch2test.html]');
  const files={ch1:path.resolve(A[2]||path.join(ROOT,'build/out/test.html')),ch2:path.resolve(A[3]||require('./ch2-lib').testPage())};
  const errs=await poses(path.resolve(A[1]),files);console.log('errs',errs);process.exitCode=errs.length?1:0;return}
 if(!A[0])throw new Error('usage : node visual-shots.js <dossier> [ch1.html] [ch2.html] [--no-breath]');
 const files={ch1:path.resolve(A[1]||path.join(ROOT,'chapters/ch1-ember-bridge/dist/index.html')),ch2:path.resolve(A[2]||path.join(ROOT,'chapters/ch2-silent-bells/dist/index.html'))};
 if(nb){files.ch1=noBreath(files.ch1);files.ch2=noBreath(files.ch2)}
 const errs=await shots(path.resolve(A[0]),files);console.log('errs',errs);process.exitCode=errs.length?1:0})().catch(e=>{console.log('exception',e.message);process.exit(1)});
