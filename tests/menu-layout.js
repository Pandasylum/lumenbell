// Placement des boutons du menu commun (LB.menu, session menu/common, corrections) : les deux chapitres, memes positions, memes
// tailles, meme ordre, bureau (1100 x 760, souris), telephone (390 x 844, tactile) et paysage bas (860 x 400, tactile), FR et EN. Quatre etats : menu neuf (vraie fin vue :
// « ▶ Outro » visible), menu avec « Reprendre » (partie en cours), sous-menu de l'Epreuve, ecran de demarrage. Pour chaque element
// present dans les deux chapitres on compare gauche, haut, largeur, hauteur a TOL pixels ; le tableau des ecarts est affiche.
// Tolerance TOL (pixels). Les elements dont le texte est centre et de longueur propre au chapitre (ligne du chapitre, bouton du chapitre
// suivant, titre) sont compares par leur centre, leur haut et leur hauteur, pas par leur largeur.
// Sortie attendue : errs []
const path=require('path');const launch=require('./launch');
const F={ch1:path.resolve(__dirname,'../chapters/ch1-ember-bridge/dist/index.html'),ch2:path.resolve(__dirname,'../chapters/ch2-silent-bells/dist/index.html')};
const TOL=1.5,errs=[];
const SEL={intro:'#introBtn',outro:'#outroBtn',fs:'.fsm',langEn:'#langs [data-lang=en]',langFr:'#langs [data-lang=fr]',easy:'#mphM [data-diff=easy]',normal:'#mphM [data-diff=normal]',hard:'#mphM [data-diff=hard]',
 trial:'#mphM [data-diff=trial]',resume:'#mResume',next:'#mNext',ver:'.mcard .ver',h2:'.mcard h2',chap:'#mEye',tn:'#mphT [data-diff=tn]',th:'#mphT [data-diff=th]',back:'#mBackT',note:'#trialNote',
 gate:'#gateBtn',gEn:'#gateLangs [data-lang=en]',gFr:'#gateLangs [data-lang=fr]'};
async function grab(pg,names){return pg.evaluate(([S,names])=>{const o={};for(const n of names){const e=document.querySelector(S[n]);if(!e||e.hidden||getComputedStyle(e).display==='none'){o[n]=null;continue}
  const r=e.getBoundingClientRect();o[n]=[r.left,r.top,r.width,r.height].map(v=>Math.round(v*10)/10)}return o},[SEL,names])}
(async()=>{const b=await launch();const all={};
for(const [nm,w,h,touch] of [['desk',1100,760,false],['phone',390,844,true],['land',860,400,true]])for(const lang of ['fr','en'])for(const ch of ['ch1','ch2']){
 const tag=nm+' '+lang,ctx=await b.newContext({viewport:{width:w,height:h},isMobile:touch,hasTouch:touch,locale:lang==='fr'?'fr-FR':'en-US'});
 await ctx.addInitScript(k=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem(k[0],'1');localStorage.setItem(k[1],'1')}},['lb-'+ch+'-end','lb-'+ch+'-intro']);
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+' '+tag+': pageerror: '+e.message));
 await pg.goto('file://'+F[ch]);await pg.waitForTimeout(400);
 const R={};R.gate=await grab(pg,['gate','gEn','gFr']);
 await pg.click('#gateBtn');await pg.waitForTimeout(300);
 R.menu=await grab(pg,['intro','outro','fs','langEn','langFr','easy','normal','hard','trial','next','ver','h2','chap']);
 await pg.click('#mphM [data-diff=normal]');await pg.waitForTimeout(500);
 if(ch==='ch2'&&await pg.evaluate(()=>!document.getElementById('skip').hidden)){await pg.keyboard.press('Enter');await pg.waitForTimeout(400)}   // cinematique d'entree de phase : passee, la carte s'affiche
 await pg.evaluate(()=>document.getElementById('menuBtn').click());await pg.waitForTimeout(300);
 R.resume=await grab(pg,['intro','outro','fs','langEn','langFr','easy','normal','hard','trial','resume','next','ver','h2','chap']);
 await pg.evaluate(()=>document.querySelector('#mphM [data-diff=trial]').click());await pg.waitForTimeout(200);
 R.trial=await grab(pg,['intro','outro','fs','langEn','langFr','tn','th','back','note','next','ver','h2','chap']);
 (all[tag]=all[tag]||{})[ch]=R;await ctx.close()}
const CENTRE=new Set(['chap','next','note','h2']);   // texte centre, de longueur propre au chapitre : on compare le centre, le haut et la hauteur
for(const tag in all)for(const st of ['gate','menu','resume','trial']){const A=all[tag].ch1[st],B=all[tag].ch2[st];
 for(const n in A){const a=A[n],c=B[n];
  if(!a&&!c)continue;
  if(!a||!c){errs.push(tag+' '+st+' '+n+' : present dans un seul chapitre ('+(a?'ch1':'ch2')+')');continue}
  const f=CENTRE.has(n)?r=>[r[0]+r[2]/2,r[1],r[3]]:r=>r;
  const x=f(a),y=f(c);let bad=false;for(let i=0;i<x.length;i++)if(Math.abs(x[i]-y[i])>TOL)bad=true;
  if(bad)errs.push(tag+' '+st+' '+n+' : ch1 '+JSON.stringify(a)+' ch2 '+JSON.stringify(c))}}
console.log('elements compares :',Object.keys(all).length*4,'etats ;',errs.length,'ecarts');
console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
