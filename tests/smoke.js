const path=require('path');const launch=require('./launch');
(async()=>{const b=await launch();
const pg=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../build/out/test.html'));await pg.waitForTimeout(300);
for(const d of ['easy','normal','hard']){
 await pg.evaluate(d=>window.__t.applyDiff(d),d);await pg.waitForTimeout(150);
 for(const ph of [1,2,3]){
  await pg.evaluate(p=>window.__t.goPhase(p),ph);await pg.waitForTimeout(250);
  await pg.click('#go').catch(()=>{});await pg.waitForTimeout(1200);
  await pg.keyboard.press('Space');await pg.waitForTimeout(400);
 }
}
console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})()
