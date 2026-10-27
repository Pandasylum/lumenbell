const path=require('path');const launch=require('./launch');
const DIFF=process.argv[2];
(async()=>{const b=await launch();
const pg=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../build/out/test.html'));await pg.waitForTimeout(300);
await pg.click(`[data-diff=${DIFF}]`);await pg.waitForTimeout(300);
await pg.evaluate(()=>window.__t.goPhase(3));await pg.click('#go').catch(()=>{});
await pg.waitForFunction(()=>{const R=window.__t.getR();return !!R&&R.mode==='play'},null,{timeout:15000});
await pg.evaluate(()=>{const t=window.__t,R=t.getR();R.php=99;R.healed=true;R.bhp=14;
 setInterval(()=>{const R=t.getR(),a=R.atk;if(!a||R.mode!=='play')return;for(const h of a.hits){if(h.done)continue;const dt=h.at-a.t;if(dt<.1&&dt>.02&&R.pl.s==='ready')t.press();break}},8)});
const kinds=['greatsword','avalanche','charge','whip','sword2','breath','claws','rocks','waves'].concat(DIFF==='hard'?['roar']:[]);
for(const k of kinds){
 for(const rage of [0,2]){
 await pg.evaluate(([k,rage])=>{const t=window.__t,R=t.getR();R.boss.s='idle';R.atk=null;R.cn=null;R.pl.s='ready';R.rage=rage;t.rLaunch(k);window.__a=R.atk;window.__before=R.taken},[k,rage]);
 for(let i=0;i<300;i++){const done=await pg.evaluate(()=>!window.__t.getR().atk||window.__t.getR().atk!==window.__a);if(done)break;await pg.waitForTimeout(100)}
 const r=await pg.evaluate(()=>({miss:window.__a.hits.filter(h=>!h.ok).length,n:window.__a.hits.length,taken:window.__t.getR().taken-window.__before}));
 if(r.miss||r.taken)console.log('PROBLEM',DIFF,k,rage,JSON.stringify(r));
 await pg.waitForTimeout(300);
 }}
console.log(DIFF,'done',errs);await b.close()})()
