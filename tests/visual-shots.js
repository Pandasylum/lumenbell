// Captures deterministes des deux chapitres, pour verifier qu'un changement technique ne change pas l'aspect.
// Usage :
//   node visual-shots.js <dossier> [ch1.html] [ch2.html]   captures (par defaut les deux dist/index.html)
//   node visual-shots.js --compare <dossierA> <dossierB>    compare au pixel ; pour chaque ecart : nombre de pixels et boite
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
(async()=>{const a=process.argv.slice(2);
 if(a[0]==='--compare'){const d=await compare(a[1],a[2]);process.exitCode=d.length?1:0;return}
 if(!a[0])throw new Error('usage : node visual-shots.js <dossier> [ch1.html] [ch2.html]');
 const files={ch1:path.resolve(a[1]||path.join(ROOT,'chapters/ch1-ember-bridge/dist/index.html')),ch2:path.resolve(a[2]||path.join(ROOT,'chapters/ch2-silent-bells/dist/index.html'))};
 const errs=await shots(path.resolve(a[0]),files);console.log('errs',errs);process.exitCode=errs.length?1:0})().catch(e=>{console.log('exception',e.message);process.exit(1)});
