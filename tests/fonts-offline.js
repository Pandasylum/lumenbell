const path=require('path');const launch=require('./launch');
(async()=>{const b=await launch();
const pg=await (await b.newContext({viewport:{width:900,height:1300},offline:true})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../chapters/ch1-ember-bridge/dist/index.html'));await pg.waitForTimeout(800);
console.log(await pg.evaluate(async()=>{await document.fonts.ready;return [document.fonts.check('800 40px "Big Shoulders Display"'),document.fonts.check('400 15px "DM Sans"'),[...document.fonts].map(f=>f.family+' '+f.status).join(';')]}));
await pg.screenshot({path:__dirname+'/shots/fonts_off.png'});console.log(errs);await b.close();process.exitCode=errs.length?1:0})()
