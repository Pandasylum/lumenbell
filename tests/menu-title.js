// Menu commun des deux chapitres (LB.menu, shared/js/28-ui.js, session menu/common) : ecran de demarrage, titre, structure.
// Pour chaque chapitre et chaque taille (bureau, telephone, paysage bas), dist publie :
//  1. plus d'ecran de demarrage : le menu est direct, focus a Normal (P, fleche haut ne changent rien) ;
//  2. titre : « Lumenbell » (h2, « Lumen » en couleur du chapitre) puis la ligne du chapitre DESSOUS ; memes polices et tailles
//     dans les deux chapitres (h2 Big Shoulders 800, ligne du chapitre 16 px, boutons de difficulte) ; rien ne se chevauche
//     (titre, ligne, difficultes, « ▶ Intro », langues) ; « ▶ Intro » visible, « ▶ Outro » cache sans la vraie fin ;
//  3. Entree, focus hors du menu : lance Normal (intro ou carte) ;
//  4. Chapitre II : plus de code mort du menu (renderMenu, canvas #mc).
// Captures dans tests/shots/ (lum_<chapitre>_<taille>.png). Sortie attendue : errs []
const fs=require('fs'),path=require('path');const launch=require('./launch');
const F={ch1:path.resolve(__dirname,'../site/ch1/index.html'),ch2:path.resolve(__dirname,'../site/ch2/index.html')};
const COL={ch1:'rgb(255, 122, 43)',ch2:'rgb(79, 224, 204)'},CHAP={ch1:['Chapter I · Ember Bridge','Chapitre I · Ember Bridge'],ch2:['Chapter II · Silent Bells','Chapitre II · Silent Bells']};
const errs=[],check=(c,m)=>{if(!c)errs.push(m)};
(async()=>{const b=await launch();fs.mkdirSync(__dirname+'/shots',{recursive:true});
const sizes={};
for(const ch of ['ch1','ch2'])for(const [nm,w,h,lang] of [['desk',1100,760,'en'],['phone',412,860,'fr'],['land',860,400,'en']]){
 const tag=ch+' '+nm,ctx=await b.newContext({viewport:{width:w,height:h},isMobile:nm!=='desk',hasTouch:nm!=='desk',locale:lang});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(tag+': pageerror: '+e.message));
 await pg.goto('file://'+F[ch]);await pg.waitForTimeout(500);
 check(await pg.evaluate(()=>!document.getElementById('gate')&&!document.getElementById('menu').hidden),tag+': aucun ecran de demarrage, menu direct');
 await pg.keyboard.press('p');await pg.keyboard.press('ArrowUp');await pg.waitForTimeout(900);
 const r=await pg.evaluate(()=>{const q=s=>document.querySelector(s),R=e=>{const r=e.getBoundingClientRect();return{l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}},cs=e=>getComputedStyle(e);
  const h2=q('#menu .mcard h2'),chap=q('#menu .mcard .eyebrow.chap'),mph=q('#mphM'),intro=q('#introBtn'),langs=q('#langs'),sp=q('#menu .mcard h2 span');
  return{gate:!q('#gate'),focus:document.activeElement&&document.activeElement.dataset.diff,h2:h2.textContent,chap:chap.textContent,first:h2.compareDocumentPosition(chap)&Node.DOCUMENT_POSITION_FOLLOWING?'h2':'chap',
   rh2:R(h2),rchap:R(chap),rmph:R(mph),rintro:R(intro),rlangs:R(langs),introVis:!intro.hidden&&cs(intro).display!=='none',outro:q('#outroBtn').hidden,
   font:cs(h2).fontFamily,weight:cs(h2).fontWeight,size:cs(h2).fontSize,chapSize:cs(chap).fontSize,chapLs:cs(chap).letterSpacing,lumen:cs(sp).color,bSize:cs(q('#mphM button b')).fontSize,
   langOrder:[...document.querySelectorAll('#langs button')].map(x=>x.textContent.trim()).filter(Boolean).join(','),wheel:[...document.querySelectorAll('#langs button')].filter(x=>!x.textContent.trim()).length}});
 const ov=(a,c)=>a.l<c.r&&c.l<a.r&&a.t<c.b&&c.t<a.b;
 check(r.gate&&r.focus==='normal',tag+': au demarrage direct, focus '+r.focus);
 check(r.h2==='Lumenbell'&&r.first==='h2'&&r.rchap.t>=r.rh2.b-6,tag+': ordre du titre (Lumenbell puis le chapitre dessous) '+JSON.stringify([r.first,r.rh2,r.rchap]));
 check(CHAP[ch].includes(r.chap),tag+': ligne du chapitre « '+r.chap+' »');
 check(/Big Shoulders/.test(r.font)&&r.weight==='800'&&r.chapSize==='16px'&&r.lumen===COL[ch],tag+': polices et couleur '+JSON.stringify([r.font,r.weight,r.chapSize,r.lumen]));
 check(!ov(r.rh2,r.rmph)&&!ov(r.rchap,r.rmph)&&!ov(r.rintro,r.rlangs)&&!ov(r.rintro,r.rh2)&&!ov(r.rlangs,r.rh2),tag+': chevauchement '+JSON.stringify(r));
 check(r.introVis&&r.outro&&r.langOrder==='EN,FR'&&r.wheel===1,tag+': boutons du menu '+JSON.stringify([r.introVis,r.outro,r.langOrder,r.wheel]));
 sizes[tag]=[r.size,r.chapSize,r.bSize].join(' ');
 await pg.screenshot({path:__dirname+'/shots/lum_'+ch+'_'+nm+'.png'});
 // Entree, focus hors du menu : Normal
 await pg.evaluate(()=>document.activeElement&&document.activeElement.blur());await pg.keyboard.press('Enter');await pg.waitForTimeout(500);
 const s=await pg.evaluate(()=>({cine:!!document.getElementById('cine')&&!document.getElementById('cine').hidden,card:!document.getElementById('ov').hidden}));
 check(s.cine||s.card,tag+': Entree au menu ne lance pas Normal '+JSON.stringify(s));
 console.log(tag.padEnd(10),JSON.stringify({chap:r.chap,size:sizes[tag],lumen:r.lumen,entree:s}));
 await ctx.close()}
for(const nm of ['desk','phone','land'])check(sizes['ch1 '+nm]===sizes['ch2 '+nm],nm+' : tailles differentes d\'un chapitre a l\'autre '+sizes['ch1 '+nm]+' / '+sizes['ch2 '+nm]);
{const h=fs.readFileSync(F.ch2,'utf8');check(!/renderMenu|\$\('mc'\)/.test(h),'ch2 : code mort du menu (renderMenu, #mc) encore present')}
console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
