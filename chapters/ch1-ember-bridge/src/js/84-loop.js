/* Chapitre II : verrouillé tant que la vraie fin n'a pas été vue (mémorisé dans le navigateur, quand c'est possible) */
function endSeen(){return LB.store.get(LB.key('end'),'0')==='1'}
function trialOpen(){return TRIAL_OPEN||endSeen()} /* TRIAL_OPEN : 00-core.js */
/* Épreuve du feu (records sous Normal et Difficile, verrou), « ▶ Outro » et chapitre suivant : LB.menu.update (CHAPTER.best, trialOpen, endSeen) */
try{document.querySelector('#menu [data-diff=normal]').focus({preventScroll:true})}catch(e){}   /* démarrage direct : focus sur « Normal », posé en dernier */
let last=performance.now(),menuDrawn=false;
function frame(now){
  perfWatch(now-last);const dt=Math.min(.05,(now-last)/1000);last=now;
  if(RUN.on&&!paused&&el.ov.hidden&&menuEl.hidden){const S=R||Q||G;if(S&&S.mode==='play'){RUN.t+=dt;RUN.pt[R?2:Q?1:0]+=dt}}
  const drawOk=menuEl.hidden||!menuDrawn;menuDrawn=!menuEl.hidden; /* menu ouvert : une seule image, puis la scène (en pause, donc figée) reste telle quelle sous le voile */
  if(R){if(!paused)rStep(dt);if(drawOk)renderR()}else if(Q){if(!paused)qStep(dt);if(drawOk)renderQ()}else{if(!paused)step(dt);if(drawOk)render()}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
