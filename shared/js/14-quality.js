/* ---------- qualité adaptative des lueurs (shadowBlur) ----------
   Les lueurs coûtent cher sur smartphone : on les réduit d'emblée sur tactile (QUALITY_T.coarse), puis on les coupe si la cadence reste basse.
   LB.quality.attach(cx) pose sur un contexte 2D la surcharge de shadowBlur / shadowColor ; LB.quality.watch(ms, paused) est appelée à chaque image avec le temps réel écoulé.
   Rien n'est installé tant que attach n'est pas appelé (le hub et le Chapitre II ne l'appellent pas). */
LB.QUALITY_T={
  coarse:.5,   /* facteur de shadowBlur de départ sur tactile (1 sinon) */
  win:2000,    /* durée d'observation (ms) avant chaque décision */
  avg:23,      /* moyenne d'image (ms) au-delà de laquelle on allège */
  spike:34,    /* image « saccadée » (ms) */
  spikes:5,    /* nombre de saccades par fenêtre qui déclenche l'allègement */
  skip:250,    /* images plus longues (ms) : pause ou onglet masqué, ignorées */
  mid:.25,     /* facteur après le premier allègement ; le suivant coupe tout (0) */
  midAbove:.3  /* au-dessus de ce facteur : on passe à mid, sinon à 0 */
};
LB.quality=(()=>{
  const T=LB.QUALITY_T;
  let q=LB.coarse?T.coarse:1,slowT=0,slowN=0,slowS=0;
  const Q={
    /* facteur courant de shadowBlur (1 = plein, 0 = lueurs coupées) */
    get level(){return q},
    attach(cx){
      const pr=CanvasRenderingContext2D.prototype,db=Object.getOwnPropertyDescriptor(pr,'shadowBlur'),dc=Object.getOwnPropertyDescriptor(pr,'shadowColor');
      if(db&&db.set&&dc&&dc.set){
        Object.defineProperty(cx,'shadowBlur',{get(){return db.get.call(this)},set(v){db.set.call(this,v*q)},configurable:true});
        Object.defineProperty(cx,'shadowColor',{get(){return dc.get.call(this)},set(v){dc.set.call(this,q>0?v:'rgba(0,0,0,0)')},configurable:true});
      }
    },
    watch(raw,paused){
      if(paused||raw>T.skip||q===0)return;
      slowT+=raw;slowN++;if(raw>T.spike)slowS++;
      /* moyenne trop basse, ou saccades répétées (pics pendant les combos) : on allège les lueurs */
      if(slowT>=T.win){const avg=slowT/slowN;if(avg>T.avg||slowS>=T.spikes)q=q>T.midAbove?T.mid:0;slowT=0;slowN=0;slowS=0}
    }
  };
  return Q;
})();
