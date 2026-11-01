/* ---------- main loop ---------- */
let lastT=performance.now();
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;rt+=dt;
  if(!$('menu').hidden)return;
  if(!S.paused&&['play','ko','dead','cine','prologue','epilogue'].includes(S.mode))gt+=dt;
  ctx=ctxMain;SC=SCm;
  update(dt);gameUpdate(dt);draw();
}
/* the menu of the series (LB.menu, shared/js/28-ui.js) around this chapter's scene (page/body.html): sea spray, ▶ Intro, ▶ Outro
   (after the true ending), fullscreen, languages, difficulties, Trial by Water; the start screen (LB.gate: its click unlocks the
   sound and starts the menu music). The spray draws Math.random here, where the old particles did. */
LB.menu.mount(CHAPTER,{
  onDiff:dk=>{ensureAudio();LB.help.use(DIFFS[dk]);startRun(dk)},
  onResume:()=>{hideMenu();MUSIC.stop();if(S.mode==='play')setPause(false);else if(S.mode==='card'&&lastCard)showCard(lastCard)},
  onIntro:()=>{ensureAudio();replayPrologue()},onOutro:()=>{ensureAudio();replayEpilogue()},onLang:()=>applyLang(),
  onStart:()=>{if(!$('menu').hidden&&MUSIC.cur!==4)setTheme(4)}});
LB.menu.show(false);LB.gate.focus();
S.d=DIFFS.normal;S.phase=2;applyLang();requestAnimationFrame(loop);

})();
