/* ---------- main loop ---------- */
let lastT=performance.now();
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;rt+=dt;
  humStep();   // the hum of the dome follows the dome, also over the menu or a pause (then it is stopped)
  if(!$('menu').hidden)return;
  if(!S.paused&&['play','ko','dead','cine','prologue','epilogue'].includes(S.mode))gt+=dt;
  ctx=ctxMain;SC=SCm;
  update(dt);gameUpdate(dt);draw();
}
/* the menu of the series (LB.menu, shared/js/28-ui.js) around this chapter's scene (page/body.html): sea spray, ▶ Intro, ▶ Outro
   (after the true ending), fullscreen, languages, difficulties, Trial by Water; no start screen any more (the chapter starts directly; the
   sound and starts the menu music). The spray draws Math.random here, where the old particles did. */
LB.menu.mount(CHAPTER,{
  onDiff:dk=>{ensureAudio();LB.help.use(DIFFS[dk]);startRun(dk)},
  onResume:()=>{hideMenu();MUSIC.stop();if(S.mode==='play')setPause(false);else if(S.mode==='card'&&lastCard)showCard(lastCard)},
  onIntro:()=>{ensureAudio();replayPrologue()},onOutro:()=>{ensureAudio();replayEpilogue()},onLang:()=>applyLang(),
  onStart:()=>{if(!$('menu').hidden&&MUSIC.cur!==4)setTheme(4)},onSet:syncAudio});
LB.menu.show(false);try{document.querySelector('#menu [data-diff=normal]').focus({preventScroll:true})}catch(e){}
S.d=DIFFS.normal;S.phase=2;applyLang();requestAnimationFrame(loop);

})();
