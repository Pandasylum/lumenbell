/* ---------- language ---------- */
function applyLang(){
  document.documentElement.lang=LB.lang.cur;
  document.querySelectorAll('#langs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===LB.lang.cur)));
  $('mEye').textContent=_('Chapter II · Silent Bells','Chapitre II · Silent Bells');
  const M=[['easy',_('Easy','Facile'),_('Breathe','Respirer')],['normal',_('Normal','Normal'),_('The real fight','Le vrai combat')],['hard',_('Hard','Difficile'),_('No mercy','Sans pitié')],
    ['trial',_('Trial','Épreuve'),_('No healing','Sans soin')],['tn',_('Normal','Normal'),_('4 HP total','4 PV au total')],['th',_('Hard','Difficile'),_('4 HP total','4 PV au total')]];
  for(const m of M){const b=document.querySelector(`[data-diff="${m[0]}"]`);b.querySelector('b').textContent=m[1];b.querySelector('span').textContent=m[2]}
  $('mBackT').querySelector('b').textContent=_('‹ Back','‹ Retour');$('mBackT').querySelector('span').textContent=_('Difficulties','Difficultés');
  $('mResume').textContent=_('Resume','Reprendre');$('pResume').textContent=_('Resume','Reprendre');$('pTitle').textContent=_('Fight paused','Combat en pause');
  $('retryBtn').textContent=_('Retry','Réessayer');$('skip').textContent=_('Skip ›','Passer ›');
  $('hint').textContent=_("Space, up arrow or tap the screen · P pause · R retry · Enter to skip","Espace, flèche haut ou toucher l'écran · P pause · R réessayer · Entrée pour passer");
  $('lHelp').textContent=_('Visual help','Aide visuelle');$('lSnd').textContent=_('Sound','Son');$('lMus').textContent=_('Music','Musique');
  $('nmP').textContent=_('The Watcher','Le Veilleur');
  hud();if(S.mode==='prologue')$('hdEye').textContent='Prologue';
}

