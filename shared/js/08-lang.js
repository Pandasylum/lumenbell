/* ---------- langue et texte ----------
   Choix mémorisé (lb-lang) prioritaire ; sinon la langue de l'appareil (français si elle commence par « fr »), sinon anglais.
   LB.LANGS : ordre des boutons de langue (celui du Chapitre I). */
LB.LANGS=['en','fr'];
LB.lang={cur:'en',
  init(){let l='en';try{const nl=(navigator.languages&&navigator.languages[0])||navigator.language||'';if(/^fr/i.test(nl))l='fr'}catch(e){}
    const v=LB.store.get(LB.key('lang'),null);if(LB.LANGS.includes(v))l=v;return LB.lang.cur=l},
  set(l){if(!LB.LANGS.includes(l))return;LB.lang.cur=l;LB.store.set(LB.key('lang'),l)}};
LB._=(en,fr)=>LB.lang.cur==='fr'?fr:en;
