/* ---------- langue ---------- */
const UIT=[
 ['#menu .mcard .eyebrow','Chapter I · Ember Bridge','Chapitre I · Ember Bridge'],
 ['#menu .mcard .tag','The Watcher faces the Ember Colossus: on the bridge, in the Foundry, then atop the Bell Tower.','Le Veilleur affronte le Colosse de braise : sur le pont, dans la Fonderie, puis au sommet du Clocher.'],
 ['#mResume','Resume','Reprendre'],
 ['#gateBtn','Start','Commencer'],
 ['#menu [data-diff=easy] b','Easy','Facile'],['#menu [data-diff=easy] span','Breathe','Respire'],
 ['#menu [data-diff=normal] b','Normal','Normal'],['#menu [data-diff=normal] span','The real fight','Le vrai combat'],
 ['#menu [data-diff=hard] b','Hard','Difficile'],['#menu [data-diff=hard] span','The Colossus unleashed','Le Colosse déchaîné'],
 
 ['#menu [data-diff=tn] b','Normal','Normal'],['#menu [data-diff=th] b','Hard','Difficile'],
 ['#mBackT b','‹ Back','‹ Retour'],['#mBackT span','Difficulties','Difficultés'],
 ['#trialNote b','Trial by Fire','Épreuve du feu'],
 ['#trialNote li:nth-child(1)','The three phases in a row, with no pause and no visual help.',"Les trois phases d'affilée, sans pause et sans aide visuelle."],
 ['#trialNote li:nth-child(2)','No life is recovered between phases.',"Aucun PV n'est récupéré entre les phases."],
 ['#trialNote li:nth-child(3)','A single death sends you back to Phase I.','Une seule mort te renvoie à la phase I.'],
 ['#trialNote li:nth-child(4)','One stats table at the end of the run.',"Un seul tableau de stats à la fin de la run."],
 ['#menu .how','One button: block, dodge. Space, up arrow or tap the screen. P to pause.',"Un seul bouton : bloquer, esquiver. Espace, flèche haut ou toucher l'écran. P pour la pause."],
 ['.fsm span','Fullscreen','Plein écran'],['#introBtn','▶ Intro','▶ Intro'],['#outroBtn','▶ Outro','▶ Outro'],['#cineSkip','Skip ›','Passer ›'],['#pause h2','Fight paused','Combat en pause'],['#pResume','Resume','Reprendre'],
 ['#go2','Enable visual help',"Activer l'aide visuelle"],
 ['#retryBtn','Retry','Réessayer'],
 ['.hint','Space, up arrow, or tap the screen · P pause · R retry',"Espace, flèche haut, ou toucher l'écran · P pause · R réessayer"],
 ['label[for=optHelp]',' Visual help',' Aide visuelle','last'],['label[for=optSnd]',' Sound',' Son','last'],['label[for=optMus]',' Music',' Musique','last'],
 ['.bars .bar:not(.boss) > span','The Watcher ','Le Veilleur ','first'],['.bars .bar.boss > span','Ember Colossus ','Colosse de braise ','first'],
];
const UIA=[['#phases','Fight phases','Phases du combat'],['.bars','Hit points','Points de vie'],['#hpP',"The Watcher's hit points",'Points de vie du Veilleur'],['#hpB',"The Colossus's hit points",'Points de vie du Colosse'],['#menu .mph','Choose difficulty','Choisir la difficulté']];
function applyLang(){updNext();updBest();
  document.documentElement.lang=LB.lang.cur;
  UIT.forEach(([sel,en,fr,node])=>{const e=document.querySelector(sel);if(!e)return;const t=_(en,fr);
    if(node==='last'){e.lastChild.textContent=t}else if(node==='first'){e.firstChild.textContent=t}else e.textContent=t});
  UIA.forEach(([sel,en,fr])=>{const e=document.querySelector(sel);if(e)e.setAttribute('aria-label',_(en,fr))});
  document.querySelectorAll('#langs button,#gateLangs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===LB.lang.cur)));
  try{setPhaseUI(R?3:Q?2:1)}catch(e){}
  try{el.help.closest('label').hidden=!!(DIFF&&DIFF.noHelp)}catch(e){}
}
document.querySelectorAll('#langs button,#gateLangs button').forEach(b=>b.addEventListener('click',()=>{
  LB.lang.set(b.dataset.lang);applyLang();b.blur();
}));
applyLang();
