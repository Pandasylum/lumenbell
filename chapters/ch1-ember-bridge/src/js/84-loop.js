/* Chapitre II : verrouillé tant que la vraie fin n'a pas été vue (mémorisé dans le navigateur, quand c'est possible) */
function endSeen(){return LB.store.get(LB.key('end'),'0')==='1'}
/* Épreuve du feu : meilleur temps affiché sous chaque difficulté (mémorisé dans le navigateur) */
function updBest(){for(const n of ['tn','th']){const sp=document.querySelector('#mphT [data-diff='+n+'] span');if(!sp)continue;const v=parseFloat(LB.store.get(LB.key('best-'+n),'0'))||0;sp.textContent=v?'🏆 '+fmtT(v):_('No record yet','Pas encore de record')}}
function updNext(){const b=$('mNext'),ok=endSeen();try{$('outroBtn').hidden=!ok}catch(e){}
  const tb=document.querySelector('#mphM [data-diff=trial]');tb.setAttribute('aria-disabled',String(!ok)); /* Épreuve du feu : débloquée par la vraie fin */
  tb.querySelector('b').textContent=ok?_('Trial by Fire','Épreuve du feu'):_('🔒 Trial by Fire','🔒 Épreuve du feu');
  tb.querySelector('span').textContent=ok?_('Ultimate challenge','Challenge ultime'):_('To unlock','À débloquer');b.classList.toggle('lock',!ok);
  b.querySelector('.nm').textContent=ok?_('Chapter II · Silent Bells','Chapitre II · Silent Bells'):_('🔒 Chapter II','🔒 Chapitre II');
  b.querySelector('.soon').textContent=_('Coming soon','À venir')}
$('mNext').addEventListener('click',e=>e.currentTarget.blur()); /* Chapitre II : « À venir » suffit, aucun message */
$('gateBtn').addEventListener('click',()=>{ensureAudio();$('gate').hidden=true;try{$('menu').querySelector('[data-diff=normal]').focus({preventScroll:true})}catch(e){}});
try{$('gateBtn').focus({preventScroll:true})}catch(e){}
let last=performance.now();
function frame(now){
  perfWatch(now-last);const dt=Math.min(.05,(now-last)/1000);last=now;
  if(RUN.on&&!paused&&el.ov.hidden&&menuEl.hidden){const S=R||Q||G;if(S&&S.mode==='play'){RUN.t+=dt;RUN.pt[R?2:Q?1:0]+=dt}}
  if(R){if(!paused)rStep(dt);renderR()}else if(Q){if(!paused)qStep(dt);renderQ()}else{if(!paused)step(dt);render()}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
