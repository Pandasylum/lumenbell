/* ---------- language ---------- */
function applyLang(){
  document.documentElement.lang=LB.lang.cur;   // menu, start screen, pause: LB.menu.lang (texts in CHAPTER, 02-core.js, and shared/js/28-ui.js)
  $('retryBtn').textContent=_('Retry','Réessayer');$('skip').textContent=_('Skip ›','Passer ›');
  $('hint').textContent=_("Space, up arrow or tap the screen · P pause · R retry · Enter to skip","Espace, flèche haut ou toucher l'écran · P pause · R réessayer · Entrée pour passer");
  hud();if(S.mode==='prologue')$('hdEye').textContent='Prologue';
}

