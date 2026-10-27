const path=require('path');const launch=require('./launch');
(async()=>{const b=await launch();
const errs=[];const pg=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.clock.install();
await pg.goto('file://'+path.resolve(__dirname,'../build/out/test.html'));await pg.clock.runFor(300);
await pg.evaluate(()=>{window.__t.applyDiff('tn');window.__t.goPhase(3)});await pg.clock.runFor(300);
await pg.click('#go').catch(()=>{});await pg.clock.runFor(9000);
await pg.evaluate(()=>{const t=window.__t,R=t.getR();R.php=99;t.RUN.t=312.4;t.RUN.pt=[100,90,122.4];t.RUN.st={1:{p:14,h:2},2:{p:9,h:1}};R.mode='space';R.endIn=.05});
await pg.clock.runFor(3000);
console.log(await pg.evaluate(()=>({eye:document.getElementById('ovEye').textContent,tbl:document.getElementById('ovTable').hidden,html:document.getElementById('ovTable').innerText.replace(/\n+/g,' | '),best:localStorage.getItem('eb-best-tn')})));
await pg.screenshot({path:__dirname+'/shots/trial_end.png'});
console.log(errs);await b.close()})()
