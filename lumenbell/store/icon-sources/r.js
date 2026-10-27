const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pg=await b.newPage({viewport:{width:1024,height:1024}});
for(const [f,o,t] of [['bg.html','icon-background.png',false],['fgp.html','icon-foreground.png',true],['full.html','icon-only.png',false]]){
await pg.goto('file://'+process.cwd()+'/'+f);await pg.screenshot({path:o,omitBackground:t});}
await b.close()})()
