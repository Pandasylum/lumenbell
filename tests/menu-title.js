const path=require('path');const launch=require('./launch');
(async()=>{const b=await launch();
for(const [nm,w,h,lang] of [['desk',1100,760,'en'],['phone',412,860,'fr'],['land',860,400,'en']]){
const pg=await (await b.newContext({viewport:{width:w,height:h},isMobile:nm!=='desk',hasTouch:nm!=='desk',locale:lang})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../chapters/ch1-ember-bridge/dist/index.html'));await pg.waitForTimeout(600);
await pg.click('#gateBtn').catch(()=>{});await pg.waitForTimeout(900);
await pg.screenshot({path:__dirname+'/shots/lum_'+nm+'.png'});
console.log(nm,await pg.evaluate(()=>document.title),errs);}
await b.close()})()
