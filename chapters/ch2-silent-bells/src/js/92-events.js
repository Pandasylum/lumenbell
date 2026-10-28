/* ---------- events ---------- */
const ward=$('ward'),cvm=$('c'),ctxMain=cvm.getContext('2d');let SCm=1;
function fitMain(){const r=cvm.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);cvm.width=Math.max(1,Math.round(r.width*d));cvm.height=Math.max(1,Math.round(r.height*d));SCm=cvm.width/W}
new ResizeObserver(fitMain).observe($('stage'));fitMain();
ward.addEventListener('pointerdown',e=>{e.preventDefault();try{ward.setPointerCapture(e.pointerId)}catch(_e){}down()});
ward.addEventListener('pointerup',up);ward.addEventListener('pointercancel',up);ward.addEventListener('lostpointercapture',up);ward.addEventListener('contextmenu',e=>e.preventDefault());
cvm.addEventListener('pointerdown',e=>{if(S.mode!=='play')return;e.preventDefault();try{cvm.setPointerCapture(e.pointerId)}catch(_e){}down()});
cvm.addEventListener('pointerup',up);cvm.addEventListener('pointercancel',up);cvm.addEventListener('lostpointercapture',up);
function skip(){if(S.mode==='prologue')endPrologue();else if(S.mode==='epilogue')endEpilogue();else if(S.mode==='cine')endCine()}
$('skip').addEventListener('click',skip);
document.addEventListener('keydown',e=>{
  const k=e.key;if(!$('menu').hidden)return;
  if(S.mode==='cine'||S.mode==='prologue'||S.mode==='epilogue'){if(k==='Enter'||k==='Escape'){e.preventDefault();skip()}else if(k===' '||k==='ArrowUp')e.preventDefault();return}
  if(k===' '||k==='ArrowUp'){if(!$('ov').hidden||!$('pause').hidden)return;e.preventDefault();if(!e.repeat)down();return}
  if(k==='p'||k==='P'||k==='Escape'){if(S.mode==='play')setPause(!S.paused);return}
  if((k==='r'||k==='R')&&(S.mode==='play'||S.mode==='dead')){$('pause').hidden=true;S.d.trial?startRun(S.dk,true):retryPhase()}
});
document.addEventListener('keyup',e=>{if(e.key===' '||e.key==='ArrowUp')up()});
window.addEventListener('blur',()=>{up();if(S.mode==='play')setPause(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(S.mode==='play')setPause(true);MUSIC.stop();MUSIC.bedStop()}else if(!$('menu').hidden)setTheme(4)});
$('go').addEventListener('click',()=>{ensureAudio();onGo&&onGo()});
$('go2').addEventListener('click',()=>onGo2&&onGo2());
$('pResume').addEventListener('click',()=>setPause(false));
$('pMenu').addEventListener('click',showMenu);
$('pauseBtn').addEventListener('click',()=>{if(S.mode==='play')setPause(!S.paused)});
$('retryBtn').addEventListener('click',()=>{if(S.mode!=='play'&&S.mode!=='dead')return;$('pause').hidden=true;S.d.trial?startRun(S.dk,true):retryPhase()});
$('menuBtn').addEventListener('click',showMenu);
$('mResume').addEventListener('click',()=>{hideMenu();MUSIC.stop();if(S.mode==='play')setPause(false);else if(S.mode==='card'&&lastCard)showCard(lastCard)});
document.querySelectorAll('#phases button').forEach(b=>b.addEventListener('click',()=>jumpPhase(+b.dataset.ph)));
document.querySelectorAll('[data-diff]').forEach(b=>b.addEventListener('click',()=>{ensureAudio();const dk=b.dataset.diff;if(dk==='trial'){$('mphM').hidden=true;$('mphT').hidden=false;return}startRun(dk)}));
$('mBackT').addEventListener('click',()=>{$('mphM').hidden=false;$('mphT').hidden=true});
document.querySelectorAll('#langs button').forEach(b=>b.addEventListener('click',()=>{LANG=b.dataset.lang;store.set('lb-lang',LANG);applyLang()}));
['optSnd','optMus'].forEach(id=>{$(id).checked=store.get(OPT_KEY[id],'1')==='1'});$('optHelp').checked=store.get(OPT_KEY.optHelp,'0')==='1';
function syncAudio(){MUSIC.setFx($('optSnd').checked);MUSIC.setMus($('optMus').checked);applyVol();
  if($('optMus').checked){if(!$('menu').hidden)setTheme(4);else if(S.mode==='play'&&!S.paused)setTheme(S.phase)}}
['optHelp','optSnd','optMus'].forEach(id=>{const el=$(id);el.addEventListener('change',()=>{store.set(OPT_KEY[id],el.checked?'1':'0');if(id!=='optHelp')syncAudio();el.blur()})});
MUSIC.setFx($('optSnd').checked);MUSIC.setMus($('optMus').checked);
// menu music starts on the first interaction (browsers block sound before that)
document.addEventListener('pointerdown',()=>{if(!$('menu').hidden&&MUSIC.cur!==4)setTheme(4)});
document.addEventListener('keydown',()=>{if(!$('menu').hidden&&MUSIC.cur!==4)setTheme(4)});

