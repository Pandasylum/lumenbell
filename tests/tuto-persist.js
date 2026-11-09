/* Reproduction : lb-tuto survit-il à un rechargement du hub (progression Ch.II débloqué posée) ? */
const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
const PORT=8765,ROOT=path.join(__dirname,'..','site');
(async()=>{
  const srv=spawn('python3',['-m','http.server',PORT,'-d',ROOT],{stdio:'ignore'});await new Promise(r=>setTimeout(r,800));
  const br=await chromium.launch();const pg=await br.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  const url='http://localhost:'+PORT+'/index.html';
  await pg.goto(url);
  await pg.evaluate(()=>{localStorage.setItem('lb-ch1-end','1');localStorage.setItem('lb-ch2-unl','1');localStorage.setItem('lb-tuto',JSON.stringify(['block','dodge','hold','still']))});
  const snap=async tag=>{const s=await pg.evaluate(()=>({tuto:localStorage.getItem('lb-tuto'),unl:localStorage.getItem('lb-ch2-unl'),keys:Object.keys(localStorage)}));
    await pg.evaluate(()=>{const b=document.getElementById('tutoBtn');b&&b.click()});await pg.waitForTimeout(300);
    const rows=await pg.evaluate(()=>[...document.querySelectorAll('#htList *')].filter(e=>!e.children.length).map(e=>e.textContent.trim()).filter(Boolean));
    console.log(tag,JSON.stringify(s),'rows',JSON.stringify(rows));};
  await pg.reload();await snap('apres-rechargement');
  await pg.goto(url+'?v=2');await snap('apres-navigation-neuve');
  console.log('errs',JSON.stringify(errs));
  await br.close();srv.kill();
})();
