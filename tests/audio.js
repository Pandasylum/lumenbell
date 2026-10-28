// LB.audio (shared/js/12-audio.js) sur les deux chapitres.
// - un seul AudioContext pour toute la page : bruitages, musique et gestes d'amorcage compris ; aucun AudioContext dans le code des chapitres
// - suspension a la mise en arriere-plan (onglet cache, pagehide, perte de focus) et reprise au retour ; en arriere-plan, un bruitage ne relance pas le contexte
// - les bruitages et la musique des deux chapitres passent par LB.audio (compteurs tone / noise, musique sur le contexte commun)
// - reglages Son et Musique : lb-snd, lb-mus lus par LB.store, ecrits par LB.audio, relus apres rechargement ; Son coupe = aucun bruitage
// Hors ligne. Sortie attendue : errs []
const fs=require('fs'),path=require('path');const launch=require('./launch');const lib=require('./ch2-lib');
const ROOT=path.resolve(__dirname,'..');
const errs=[];const ok=(c,m)=>{if(!c){errs.push(m);console.log('KO',m)}else console.log('ok',m)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// espion place avant la page : contextes crees, sources creees par contexte, etat force de document.hidden
const SPY=`(()=>{window.__acs=[];window.__h=false;
 Object.defineProperty(document,'hidden',{get:()=>window.__h,configurable:true});
 const C=window.AudioContext;if(!C)return;
 window.AudioContext=class extends C{constructor(...a){super(...a);this.__src=0;window.__acs.push(this)}};
 window.webkitAudioContext=window.AudioContext;
 for(const k of ['createOscillator','createBufferSource']){const f=C.prototype[k];C.prototype[k]=function(...a){this.__src=(this.__src||0)+1;return f.apply(this,a)}}})();`;
const CH={
 ch1:{dist:path.join(ROOT,'chapters/ch1-ember-bridge/dist/index.html'),src:path.join(ROOT,'chapters/ch1-ember-bridge/src/js'),gate:'#gateBtn'},
 ch2:{dist:lib.DIST,src:path.join(ROOT,'chapters/ch2-silent-bells/src/js'),gate:'#go'}};
async function page(b,file){const ctx=await b.newContext({viewport:{width:1100,height:760},offline:true,locale:'en-US'});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.addInitScript(SPY);await p.goto('file://'+file);await sleep(400);return {ctx,p}}
const state=p=>p.evaluate(()=>({n:window.__acs.length,st:window.__acs.map(a=>a.state),src:window.__acs.map(a=>a.__src||0)}));
const hide=(p,off)=>p.evaluate(off=>{window.__h=off;document.dispatchEvent(new Event('visibilitychange'))},off);
(async()=>{
 // 1. code des chapitres : aucun AudioContext, aucune sortie directe
 for(const [ch,c] of Object.entries(CH)){
  const files=fs.readdirSync(c.src).filter(f=>f.endsWith('.js'));
  const bad=files.filter(f=>/AudioContext|\.destination\b/.test(fs.readFileSync(path.join(c.src,f),'utf8').replace(/globalCompositeOperation\s*=\s*'destination-[a-z]+'/g,'')));
  ok(!bad.length,ch+' : ni AudioContext ni .destination dans le code du chapitre '+bad.join(','));
 }
 const sh=fs.readFileSync(path.join(ROOT,'shared/js/12-audio.js'),'utf8');
 ok((sh.match(/new C\(/g)||[]).length===2,'shared : le contexte n\'est construit que dans ensure() (essai playback, repli)');
 const b=await launch();
 // 2. dist publies : contexte unique, musique du menu, suspension et reprise
 for(const [ch,c] of Object.entries(CH)){
  const {ctx,p}=await page(b,c.dist);
  await p.click(c.gate).catch(()=>p.mouse.click(300,300));await sleep(1500);
  let s=await state(p);
  ok(s.n===1,ch+' dist : un seul contexte apres le premier geste ('+s.n+')');
  ok(s.st[0]==='running',ch+' dist : contexte actif ('+s.st[0]+')');
  ok(s.src[0]>3,ch+' dist : la musique du menu joue sur ce contexte ('+s.src[0]+' sources, hors amorcage)');
  await p.mouse.click(5,5);await p.keyboard.press('a');await sleep(300);
  s=await state(p);ok(s.n===1,ch+' dist : toujours un seul contexte apres d\'autres gestes');
  await hide(p,true);await sleep(500);s=await state(p);
  ok(s.st[0]==='suspended',ch+' dist : suspendu quand l\'onglet est cache ('+s.st[0]+')');
  await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await sleep(200);
  ok((await state(p)).st[0]==='suspended',ch+' dist : un focus pendant que l\'onglet est cache ne relance pas');
  await hide(p,false);await sleep(700);s=await state(p);
  ok(s.st[0]==='running',ch+' dist : repris au retour de l\'onglet ('+s.st[0]+')');
  await p.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await sleep(500);
  ok((await state(p)).st[0]==='suspended',ch+' dist : suspendu a pagehide');
  await p.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await sleep(700);
  s=await state(p);ok(s.st[0]==='running'&&s.n===1,ch+' dist : repris a pageshow, toujours un seul contexte ('+s.st[0]+', '+s.n+')');
  await ctx.close();
 }
 // 3. copies de test : les bruitages et la musique passent par LB.audio
 const T1=path.join(ROOT,'build/out/test.html'),T2=lib.testPage();
 for(const [ch,file] of [['ch1',T1],['ch2',T2]]){
  const c=CH[ch],{ctx,p}=await page(b,file);
  await p.mouse.click(5,5);await sleep(800);
  const ev=f=>p.evaluate(f);
  ok(await ev(()=>!!(__t.LB&&__t.LB.audio.ctx&&__t.LB.audio.ctx===window.__acs[0])),ch+' test : LB.audio.ctx est le contexte de la page');
  const before=await ev(()=>({...__t.LB.audio.stat}));
  await ev(()=>{if(__t.sfx){__t.sfx.hurt();__t.sfx.block(1);__t.sfx.thud(1)}else{__t.thud(1);__t.boom(.3,.1);__t.painCry(.5,.1);__t.roar()}});
  const after=await ev(()=>({...__t.LB.audio.stat}));
  ok(after.tone>before.tone&&after.noise>before.noise,ch+' test : bruitages par LB.audio.tone / noise ('+before.tone+'/'+before.noise+' -> '+after.tone+'/'+after.noise+')');
  const srcBefore=(await state(p)).src[0];
  if(ch==='ch2')await ev(()=>{__t.MUSIC.play(1);__t.MUSIC.fx('refill')});else await ev(()=>__t.showMenu());
  await sleep(700);
  const st=await state(p);
  ok(st.n===1&&st.src[0]>(ch==='ch1'?3:srcBefore+3),ch+' test : musique et effets sur le meme contexte, un seul ('+st.n+' contexte, '+srcBefore+' -> '+st.src[0]+' sources)');
  if(ch==='ch1')ok(await ev(()=>__t.MUS.ctx===__t.LB.audio.ctx&&!!__t.MUS.bus.menu),ch+' test : la chaine de la musique est sur le contexte commun');
  // reglages
  await ev(()=>__t.LB.audio.setSound(false));
  const k1=await ev(()=>[localStorage.getItem('lb-snd'),__t.LB.audio.sfx.gain.value]);
  ok(k1[0]==='0'&&k1[1]===0,ch+' test : Son coupe -> lb-snd=0 et bus muet');
  const t0=await ev(()=>__t.LB.audio.stat.tone);
  await ev(()=>{if(__t.sfx)__t.sfx.hurt();else __t.thud(1)});
  ok(await ev(()=>__t.LB.audio.stat.tone)===t0,ch+' test : Son coupe -> aucun bruitage');
  await ev(()=>__t.LB.audio.setMusic(false));
  ok((await ev(()=>localStorage.getItem('lb-mus')))==='0',ch+' test : Musique coupee -> lb-mus=0');
  await p.reload();await sleep(500);
  const r=await ev(()=>[__t.LB.audio.sound,__t.LB.audio.music,document.getElementById('optSnd').checked,document.getElementById('optMus').checked]);
  ok(r.join()==='false,false,false,false',ch+' test : reglages relus apres rechargement ('+r+')');
  await ev(()=>{__t.LB.audio.setSound(true);__t.LB.audio.setMusic(true)});
  await ctx.close();
 }
 await b.close();
 console.log('errs',JSON.stringify(errs));process.exit(errs.length?1:0);
})();
