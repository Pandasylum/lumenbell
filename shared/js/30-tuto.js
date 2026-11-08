/* ---------- Onglet Tuto : contenu partagé (décision du 8 novembre 2026, docs/decisions/2026-11-08-onglet-tuto-hub.md) ----------
   Quatre entrées, une par geste. Une entrée n'existe qu'après la première réussite du geste, puis reste (clé commune lb-tuto, liste des
   identifiants). Les gestes sont détectés ici seulement : LB.hero.stopped (16-hero.js) appelle LB.tuto.note('block' | 'dodge' | 'hold') ;
   le seul signal propre à un chapitre est 'still' (cible à ne pas esquiver laissée passer). note() écrit puis émet l'événement unique
   EV (window, detail {id}). Version 1 : texte seul ; version 2 (plus tard) : animations rejouées par le moteur.
   LB.tuto.mount(el) monte le bloc (rendu + données), se rafraîchit à l'événement et renvoie la fonction de rendu (à rappeler au
   changement de langue). Monté pour l'instant dans le hub uniquement : aucun montage dans les menus des chapitres. */
LB.TUTO_T={ids:['block','dodge','hold','still'],ev:'lb-gesture',none:'—'};
LB.tuto={
  /* [titre, texte] d'une entrée dans la langue courante */
  text(id){return{
    block:[LB._('Block','Bloquer'),LB._("One press, at the exact instant: the blow stops dead.","Un seul appui, à l'instant juste : le coup s'arrête net.")],
    dodge:[LB._('Dodge','Esquiver'),LB._("One press, at the exact instant: you slip out of its path.","Un seul appui, à l'instant juste : tu glisses hors de sa trajectoire.")],
    hold:[LB._('Hold','Tenir'),LB._("Keep pressing: your block holds, a dome wraps around you.","Maintiens l'appui : ton blocage tient, un dôme t'enveloppe.")],
    still:[LB._('Stand still','Rester en place'),LB._("Sometimes dodging is a misjudgment: know when to stand still.","Parfois, l'esquive est une erreur de jugement : sache rester en place.")]
  }[id]},
  seen(){try{const a=JSON.parse(LB.store.get(LB.key('tuto'),'[]'));return Array.isArray(a)?a.filter(x=>LB.TUTO_T.ids.includes(x)):[]}catch(e){return[]}},
  /* première réussite d'un geste : mémorise puis signale (une seule fois par entrée) */
  note(id){if(!LB.TUTO_T.ids.includes(id))return;const a=LB.tuto.seen();if(a.includes(id))return;a.push(id);
    LB.store.set(LB.key('tuto'),JSON.stringify(a));
    try{window.dispatchEvent(new CustomEvent(LB.TUTO_T.ev,{detail:{id}}))}catch(e){}},
  render(el){const a=LB.tuto.seen();el.textContent='';
    for(const id of LB.TUTO_T.ids){const li=document.createElement('li');li.dataset.id=id;
      if(a.includes(id)){const t=LB.tuto.text(id),h=document.createElement('h3'),p=document.createElement('p');h.textContent=t[0];p.textContent=t[1];li.append(h,p)}
      else{li.className='lbt-none';li.setAttribute('aria-hidden','true');li.textContent=LB.TUTO_T.none}   // rien ne se déduit à l'avance
      el.appendChild(li)}},
  mount(el){
    if(!document.getElementById('lbTutoCss')){const s=document.createElement('style');s.id='lbTutoCss';
      s.textContent='.lbtuto{list-style:none;margin:0;padding:0;display:grid;gap:12px}.lbtuto li{display:grid;gap:2px}'
        +'.lbtuto h3{margin:0;font-family:var(--font-display,inherit);font-weight:700;font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:var(--lantern,#ffd28a)}'
        +'.lbtuto p{margin:0;font-size:15px;line-height:1.4;color:var(--fg,#eee)}.lbtuto .lbt-none{color:var(--muted,#888);font-size:18px;line-height:1.4}';
      document.head.appendChild(s)}
    el.classList.add('lbtuto');const r=()=>LB.tuto.render(el);r();window.addEventListener(LB.TUTO_T.ev,r);return r}
};
