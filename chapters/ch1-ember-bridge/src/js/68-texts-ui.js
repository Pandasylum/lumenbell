/* ---------- langue ---------- */
const UIT=[   /* textes du menu, de l'écran de démarrage, de la pause et des barres : LB.menu, LB.pause, LB.hud (CHAPTER, 00-core.js) */
 ['#cineSkip','Skip ›','Passer ›'],
 ['#retryBtn','Retry','Réessayer'],
 ['.hint','Space, up arrow, or tap the screen · P pause · R retry',"Espace, flèche haut, ou toucher l'écran · P pause · R réessayer"],
 ];
const UIA=[['#phases','Fight phases','Phases du combat'],['.bars','Hit points','Points de vie'],['#hpP',"The Watcher's hit points",'Points de vie du Veilleur'],['#hpB',"The Colossus's hit points",'Points de vie du Colosse']];
function applyLang(){
  document.documentElement.lang=LB.lang.cur;
  UIT.forEach(([sel,en,fr,node])=>{const e=document.querySelector(sel);if(!e)return;const t=_(en,fr);
    if(node==='last'){e.lastChild.textContent=t}else if(node==='first'){e.firstChild.textContent=t}else e.textContent=t});
  UIA.forEach(([sel,en,fr])=>{const e=document.querySelector(sel);if(e)e.setAttribute('aria-label',_(en,fr))});
  try{setPhaseUI(R?3:Q?2:1)}catch(e){}
}
applyLang();   /* boutons de langue : LB.menu (menu et écran de démarrage), qui rappelle applyLang */
