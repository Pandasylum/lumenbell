// Titre de fin d'intro des deux chapitres (LB.title, shared/js/24-cine.js ; decision n° 6 du 28 octobre : comme au Chapitre I).
// « LUMEN » en couleur du chapitre + « BELL » creme, 96 px, halo de la couleur du chapitre ; ligne du chapitre en Big Shoulders
// 26 px creme dessous. Sur les copies de test a crochets (Chapitre I : build/out/test.html, python3 build/build_test.py ;
// Chapitre II : copie fabriquee par ch2-lib.js), de 360 px de large au bureau, FR et EN : chaque texte dessine une seconde apres
// l'apparition du titre est releve avec sa boite mesuree (measureText, unites du canvas 960 x 540) ; les boites ne se chevauchent
// pas, restent dans le canvas, « LUMEN » et « BELL » sont sur la meme ligne, bout a bout, le grand texte est au-dessus et plus
// grand (8 unites d'ecart au moins) ; Chapitre I : lignes de base inchangees (118 et 160) ; Chapitre II : le bloc reste au-dessus
// du sceptre-lanterne du Veilleur ; le canvas de la cinematique tient dans la largeur de la page. Captures dans tests/shots/.
// Usage : node title.js [ch1|ch2]   (sans argument : les deux). Sortie attendue : errs []
const path=require('path');const launch=require('./launch');const {testPage}=require('./ch2-lib');
const ROOT=path.resolve(__dirname,'..');
const errs=[],SIZES=[[360,740],[390,844],[412,915],[844,390],[768,1024],[1100,760],[1920,1080]];
const CH={
 ch1:{file:()=>path.join(ROOT,'build/out/test.html'),col:'#ff7a2b',want:{fr:'CHAPITRE I · EMBER BRIDGE',en:'CHAPTER I · EMBER BRIDGE'},base:[118,160],
  start:()=>{const T=__t;T.LB.cine.manual=true;T.CINE.play(()=>{});return{step:(dt,d)=>T.LB.cine.step(dt,d),at:null}}},
 ch2:{file:()=>testPage(),col:'#4fe0cc',want:{fr:'CHAPITRE II · SILENT BELLS',en:'CHAPTER II · SILENT BELLS'},lantern:265,
  start:()=>{const T=__t;T.startRun('normal',false);return{step:(dt,d)=>T.step(dt,d),at:T.PRO_TITLE}}}};
(async()=>{const b=await launch(),only=process.argv[2];
 for(const ch of Object.keys(CH)){if(only&&only!==ch)continue;const C=CH[ch],file=C.file();
 for(const [w,h] of SIZES)for(const lang of ['fr','en']){
  const ctx=await b.newContext({viewport:{width:w,height:h},offline:true});
  await ctx.addInitScript(()=>{window.__boxes=null;const P=CanvasRenderingContext2D.prototype,f=P.fillText;
   P.fillText=function(t,x,y){if(window.__boxes){const m=this.measureText(t),a=this.textAlign;const l=a==='center'?x-m.width/2:a==='right'||a==='end'?x-m.width:x;
     window.__boxes.push({t:String(t).replace(/ /g,''),y,col:String(this.fillStyle),font:this.font,top:y-m.actualBoundingBoxAscent,bot:y+m.actualBoundingBoxDescent,l,r:l+m.width,px:parseFloat(/(\d+)px/.exec(this.font)[1])})}
    return f.apply(this,arguments)}});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+' '+w+'x'+h+' '+lang+': pageerror: '+e.message));
  await pg.goto('file://'+file);await pg.waitForTimeout(150);
  const B=await pg.evaluate(([l,start])=>{document.querySelector('#langs button[data-lang='+l+']').click();
   const r=eval('('+start+')')(),dt=1/60;let n=0;
   if(r.at!=null){for(;n<Math.round((r.at+1)*60);n++)r.step(dt,false)}
   else{window.__boxes=[];for(;n<60*60;n++){r.step(dt,n>60*20);if(window.__boxes.some(x=>x.t==='LUMEN'))break;window.__boxes=[]}window.__boxes=null;for(let i=0;i<59;i++)r.step(dt,false)}
   window.__boxes=[];r.step(dt,true);const out=window.__boxes;window.__boxes=null;
   const c=document.getElementById('cineC').getBoundingClientRect(),vis=!document.getElementById('cine').hidden;
   return{boxes:out,canvas:[c.left,c.right],vis,page:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}},[lang,C.start.toString()]);
  await pg.screenshot({path:path.join(__dirname,'shots','title-'+ch+'-'+w+'x'+h+'-'+lang+'.png')});
  const tag=ch+' '+w+'x'+h+' '+lang,want=C.want[lang];
  const L=B.boxes.find(x=>x.t==='LUMEN'),E=B.boxes.find(x=>x.t==='BELL'),S=B.boxes.find(x=>x.t===want.replace(/ /g,''));
  if(!B.vis)errs.push(tag+': cinematique invisible');
  if(!L||!E||!S){errs.push(tag+': titre absent ('+B.boxes.map(x=>x.t).join(' | ')+')');await ctx.close();continue}
  const N={top:Math.min(L.top,E.top),bot:Math.max(L.bot,E.bot),l:L.l,r:E.r};
  console.log(tag.padEnd(18),'LUMEN',L.px+'px',L.col,'BELL',E.col,'base',L.y.toFixed(1),' | chapitre',S.px+'px base',S.y.toFixed(1),'haut',S.top.toFixed(0),'bas',S.bot.toFixed(0),' | ecart',(S.top-N.bot).toFixed(1),' | canvas',B.canvas.map(Math.round).join('-'),'page',B.page);
  if(L.col.toLowerCase()!==C.col)errs.push(tag+': LUMEN pas en couleur du chapitre ('+L.col+')');
  if(E.col.toLowerCase()!=='#f0e8df')errs.push(tag+': BELL pas creme ('+E.col+')');
  if(!/rgba\(240, 232, 223, 0\.88\)/.test(S.col))errs.push(tag+': chapitre pas creme ('+S.col+')');
  if(!/Big Shoulders/.test(S.font)||!/Big Shoulders/.test(L.font))errs.push(tag+': police (titre '+L.font+' ; chapitre '+S.font+')');
  if(L.px>96||S.px!==26)errs.push(tag+': tailles '+L.px+' / '+S.px+' (96 et 26 attendus)');
  if(!(L.px>S.px*3))errs.push(tag+': Lumenbell pas plus grand ('+L.px+' / '+S.px+')');
  if(L.y!==E.y||Math.abs(E.l-L.r)>.5)errs.push(tag+': LUMEN et BELL pas bout a bout sur la meme ligne');
  if(C.base&&(Math.abs(L.y-C.base[0])>.01||Math.abs(S.y-C.base[1])>.01))errs.push(tag+': lignes de base '+L.y+' / '+S.y+' (attendu '+C.base+')');
  for(const x of B.boxes){if(x.l<0||x.r>960||x.top<0||x.bot>540)errs.push(tag+': hors du canvas : '+x.t)}
  const drawn=B.boxes.filter(x=>x.t.trim()&&x!==L&&x!==E).concat([Object.assign({t:'LUMENBELL'},N)]);
  for(let i=0;i<drawn.length;i++)for(let j=i+1;j<drawn.length;j++){const p=drawn[i],q=drawn[j];if(p.t===q.t)continue;
   if(p.l<q.r&&q.l<p.r&&p.top<q.bot&&q.top<p.bot)errs.push(tag+': chevauchement « '+p.t+' » / « '+q.t+' »')}
  if(C.lantern&&!(S.bot+18<C.lantern))errs.push(tag+': le titre descend sur le sceptre-lanterne (bas '+(S.bot+18).toFixed(0)+')');
  if(!(S.top-N.bot>=8))errs.push(tag+': ecart '+(S.top-N.bot).toFixed(1)+' entre les deux lignes (8 minimum)');
  if(B.scroll>B.page+1||B.canvas[1]>B.page+1||B.canvas[0]<-1)errs.push(tag+': debordement horizontal (page '+B.page+', defilement '+B.scroll+', canvas '+B.canvas+')');
  await ctx.close()}}
 console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
