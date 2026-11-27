/* ---------- drawing helpers ---------- */
/* Le Veilleur (corps, sceptre-lanterne, poses, bouclier, éclats) est commun à la série : shared/js/20-watcher.js
   (LB.drawWatcher, LB.WATCHER_POSES, LB.drawBlock). Les phases ne gardent que leur chorégraphie (positions, contres, finale). */
/* Éclat de lanterne : rayon court entre deux points */
/* rayon de la lanterne (phases I à III du Chapitre I) : un coin de lumière en aplats nets, comme la lumière de la phase I (plus de dégradé : LB.lanternBeam reste réservé au Chapitre II) */
const lanternBeam=(A,B,w,al)=>{
  if(!(al>0))return;
  const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,q=(k,s)=>[[A[0]+nx*5*k,A[1]+ny*5*k],[B[0]+nx*w*s,B[1]+ny*w*s],[B[0]-nx*w*s,B[1]-ny*w*s],[A[0]-nx*5*k,A[1]-ny*5*k]];
  ctx.save();ctx.globalAlpha=Math.min(1,al);
  COLFX.poly(ctx,q(1,1.1),'rgba(255,214,110,.55)');COLFX.poly(ctx,q(.7,.8),'#ffe9a0');COLFX.poly(ctx,q(.35,.35),'#fffbea');
  ctx.restore();
};
