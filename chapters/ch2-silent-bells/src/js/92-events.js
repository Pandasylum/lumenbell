/* ---------- events ---------- */
const ward=$('ward'),cvm=$('c'),ctxMain=cvm.getContext('2d');let SCm=1;
/* pixel ratio cap: 1.25 on touch screens (as Chapter I, 00-core.js), 2 on computers */
const DPR_MAX=LB.coarse?1.25:2;
function fitMain(){const r=cvm.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,DPR_MAX);cvm.width=Math.max(1,Math.round(r.width*d));cvm.height=Math.max(1,Math.round(r.height*d));SCm=cvm.width/W}
new ResizeObserver(fitMain).observe($('stage'));fitMain();
function skip(){if(S.mode==='prologue'||S.mode==='epilogue')LB.cine.skip();else if(S.mode==='cine'&&S.cine&&cineSeen(S.phase,S.cine.k))endCine()}
$('skip').addEventListener('click',skip);
/* inputs of the series (LB.input, shared/js/28-ui.js): Space, up arrow, W, Z, touching the arena or the action button, released
   for all; P / Escape pause; R retry; Enter / Space on a card, the pause and the menu (Normal). This chapter's phase cinematics
   (S.mode 'cine') take every key: Enter / Escape skip (the prologue and the epilogue are LB.cine's). */
function retryKey(){if(S.mode!=='play'&&S.mode!=='dead')return;LB.pause.hide();S.d.trial?startRun(S.dk,true):retryPhase()}
LB.input.bind({press:down,release:up,pause:()=>{if(S.mode==='play')setPause(!S.paused)},retry:retryKey,
  skip:e=>{if(S.mode!=='cine')return false;const k=e.key;if(k==='Enter'||k==='Escape'){e.preventDefault();skip()}else if(LB.input.ACT.includes(k))e.preventDefault();return true}});
window.addEventListener('blur',()=>{if(S.mode==='play')setPause(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(S.mode==='play')setPause(true);MUSIC.stop();MUSIC.bedStop()}else if(!$('menu').hidden)setTheme(4)});
$('go').addEventListener('click',()=>ensureAudio());
LB.pause.bind({onResume:()=>setPause(false),onMenu:()=>{S.mode='menu';lastCard=null;showMenu()}});   // « Menu du chapitre » après confirmation : le combat en pause est perdu (pas de Reprendre)
$('pauseBtn').addEventListener('click',()=>{if(S.mode==='play')setPause(!S.paused)});
$('retryBtn').addEventListener('click',retryKey);
$('menuBtn').addEventListener('click',e=>{showMenu();e.currentTarget.blur()});
document.querySelectorAll('#phases button').forEach(b=>b.addEventListener('click',()=>jumpPhase(+b.dataset.ph)));
LB.help.mount();   // help: LB.help (lb-help, off by default); Music, Sound effects, Visual help: the settings wheel of the menu (LB.settings)
function syncAudio(id){if(id!=='mus')return;MUSIC.setMus(LB.audio.music);
  if(LB.audio.music){if(!$('menu').hidden)setTheme(4);else if(S.mode==='play'&&!S.paused)setTheme(S.phase)}}
// menu music starts on the first interaction (browsers block sound before that)
document.addEventListener('pointerdown',()=>{if(!$('menu').hidden&&MUSIC.cur!==4)setTheme(4)});
document.addEventListener('keydown',()=>{if(!$('menu').hidden&&MUSIC.cur!==4)setTheme(4)});

