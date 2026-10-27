const path=require('path');const launch=require('./launch');
(async()=>{const b=await launch();
const errs=[];const pg=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.clock.install();
await pg.goto('file://'+path.resolve(__dirname,'../build/out/test.html'));await pg.clock.runFor(300);
const S=()=>pg.evaluate(()=>{const t=window.__t,G=t.getG(),Q=t.getQ(),R=t.getR();return {ph:R?3:Q?2:1,php:(R||Q||G).php,mode:(R||Q||G).mode,run:[t.RUN.on,t.RUN.cur,t.RUN.max,t.RUN.n].join('/'),ov:document.getElementById('ov')&&!document.getElementById('ov').hidden,tbl:(document.getElementById('ovTable')||{}).hidden===false}});
for(const nm of ['tn','th']){
console.log('=====',nm);
await pg.evaluate(n=>{window.__t.applyDiff(n);window.__t.goPhase(1)},nm);await pg.clock.runFor(300);
await pg.click('#go').catch(()=>{});await pg.clock.runFor(8000);console.log('P1 start',await S());
await pg.evaluate(()=>{const G=window.__t.getG();G.php=2;G.p2=true;G.mode='won';G.endIn=.05});await pg.clock.runFor(1500);console.log('after P1 win',await S());
await pg.clock.runFor(8000);console.log('P2 play',await S());
await pg.evaluate(()=>{const Q=window.__t.getQ();Q.php=2;Q.mode='lake';Q.endIn=.05});await pg.clock.runFor(2500);console.log('after P2 win',await S());
await pg.clock.runFor(9000);console.log('P3 play',await S());
await pg.evaluate(()=>{const R=window.__t.getR();R.mode='lost';R.endIn=.05});await pg.clock.runFor(1500);console.log('P3 dead',await S());
await pg.keyboard.press('Space');await pg.clock.runFor(800);await pg.click('#go').catch(()=>{});await pg.clock.runFor(800);console.log('after restart',await S());
await pg.screenshot({path:__dirname+'/shots/trial_'+nm+'.png'});
}
console.log(errs);await b.close()})()
