// Chapitre II : titre de fin d'intro (« Lumenbell » en grand, « Chapitre II · Silent Bells » en dessous, petit, turquoise).
// Sur la copie de test a crochets, de 360 px de large au bureau, FR et EN : chaque texte dessine au moment du titre est releve
// avec sa boite mesuree (measureText, unites du canvas 960 x 540) ; les boites ne se chevauchent pas, restent dans le canvas,
// le grand texte est au-dessus et plus grand, le bloc reste au-dessus du sceptre-lanterne ; le canvas tient dans la largeur de la page. Captures dans tests/shots/.
// Sortie attendue : errs []
const path=require('path');const launch=require('./launch');const {testPage}=require('./ch2-lib');
const errs=[],SIZES=[[360,740],[390,844],[412,915],[844,390],[768,1024],[1100,760],[1920,1080]];
(async()=>{const b=await launch(),file=testPage();
 for(const [w,h] of SIZES)for(const lang of ['fr','en']){
  const ctx=await b.newContext({viewport:{width:w,height:h},offline:true});
  await ctx.addInitScript(()=>{window.__boxes=null;const P=CanvasRenderingContext2D.prototype,f=P.fillText;
   P.fillText=function(t,x,y){if(window.__boxes){const m=this.measureText(t),a=this.textAlign;const l=a==='center'?x-m.width/2:a==='right'||a==='end'?x-m.width:x;
     window.__boxes.push({t:String(t).replace(/ /g,''),col:String(this.fillStyle),top:y-m.actualBoundingBoxAscent,bot:y+m.actualBoundingBoxDescent,l,r:l+m.width,px:parseFloat(/(\d+)px/.exec(this.font)[1])})}
    return f.apply(this,arguments)}});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(w+'x'+h+' '+lang+': pageerror: '+e.message));
  await pg.goto('file://'+file);await pg.waitForTimeout(150);
  const B=await pg.evaluate(l=>{document.querySelector('#langs button[data-lang='+l+']').click();const T=__t;T.startRun('normal',false);
   for(let i=0;i<Math.round(16.6*60);i++)T.step(1/60);window.__boxes=[];T.step(1/60,true);
   const out=window.__boxes;window.__boxes=null;
   const c=document.getElementById('c').getBoundingClientRect();return{boxes:out,canvas:[c.left,c.right],page:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}},lang);
  await pg.screenshot({path:path.join(__dirname,'shots','ch2-title-'+w+'x'+h+'-'+lang+'.png')});
  const tag=w+'x'+h+' '+lang,want=lang==='fr'?'CHAPITRE II · SILENT BELLS':'CHAPTER II · SILENT BELLS';
  const big=B.boxes.filter(x=>x.t==='LUMENBELL'),small=B.boxes.filter(x=>x.t===want);
  if(!big.length||!small.length){errs.push(tag+': titre absent ('+B.boxes.map(x=>x.t).join(' | ')+')');await ctx.close();continue}
  const N=big[big.length-1],S=small[0];       // le dernier LUMENBELL est le texte clair (le premier est l'ombre)
  console.log(tag.padEnd(14),'Lumenbell',N.px+'px, haut',N.top.toFixed(0),'bas',N.bot.toFixed(0),' | chapitre',S.px+'px, haut',S.top.toFixed(0),'bas',S.bot.toFixed(0),S.col,' | ecart',(S.top-N.bot).toFixed(1),' | canvas',B.canvas.map(Math.round).join('-'),'page',B.page);
  if(!(N.px>S.px*3))errs.push(tag+': Lumenbell pas plus grand ('+N.px+' / '+S.px+')');
  if(S.col.toLowerCase()!=='#4fe0cc')errs.push(tag+': chapitre pas en turquoise ('+S.col+')');
  for(const x of B.boxes){if(x.l<0||x.r>960||x.top<0||x.bot>540)errs.push(tag+': hors du canvas : '+x.t)}
  const drawn=B.boxes.filter(x=>x.t.trim());
  for(let i=0;i<drawn.length;i++)for(let j=i+1;j<drawn.length;j++){const p=drawn[i],q=drawn[j];if(p.t===q.t)continue; // ombre et texte
   if(p.l<q.r&&q.l<p.r&&p.top<q.bot&&q.top<p.bot)errs.push(tag+': chevauchement « '+p.t+' » / « '+q.t+' »')}
  // trait sous le chapitre (jusqu'a ~18 unites sous le texte) au-dessus du sceptre-lanterne du Veilleur (cristal vers y = 273)
  if(!(S.bot+18<265))errs.push(tag+': le titre descend sur le sceptre-lanterne (bas '+(S.bot+18).toFixed(0)+')');
  if(!(S.top-N.bot>=8))errs.push(tag+': ecart '+(S.top-N.bot).toFixed(1)+' entre les deux lignes (8 minimum)');
  if(B.scroll>B.page+1||B.canvas[1]>B.page+1||B.canvas[0]<-1)errs.push(tag+': debordement horizontal (page '+B.page+', defilement '+B.scroll+', canvas '+B.canvas+')');
  await ctx.close()}
 console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
