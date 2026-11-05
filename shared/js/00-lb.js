/* ---------- shared/ : commun à la série (voir shared/NOTES.md). Un seul objet, LB, dans l'IIFE du chapitre ---------- */
const LB={};
/* Polices du canvas : mêmes familles que --font-display / --font-body du CSS (build/fonts.css, inlinées par le build) */
LB.FONT={display:'"Big Shoulders Display",Impact,sans-serif',body:'"DM Sans",system-ui,sans-serif'};
/* Écran tactile (pointer:coarse) : une seule détection pour toute la série, lue au chargement. */
LB.coarse=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
/* Rapport de pixels du canvas principal du Chapitre I et défaut de LB.cacheLayer : plafond 1,25 sur tactile, 2 sinon */
LB.dpr=Math.min(LB.coarse?1.25:2,window.devicePixelRatio||1);
LB.$=id=>document.getElementById(id);
/* Calque hors écran : canvas de w x h unités logiques dessiné une fois par draw(cx), puis posé par drawImage(canvas,0,0,w,h).
   o.k : rapport de pixels (défaut LB.dpr) ; o.y0 : première rangée logique conservée (calque en bande, h = bord bas) ;
   o.round : arrondi de la taille en pixels (défaut Math.ceil). Le contexte reçu a déjà la transformation k (et le décalage de y0). */
LB.cacheLayer=(w,h,draw,o)=>{
  o=o||{};const k=o.k||LB.dpr,rd=o.round||Math.ceil,ty=Math.floor((o.y0||0)*k);
  const c=document.createElement('canvas');c.width=rd(w*k);c.height=Math.max(1,rd(h*k)-ty);
  const x=c.getContext('2d');x.setTransform(k,0,0,k,0,-ty);draw(x);return c;
};
