/* ---------- drawing helpers ---------- */
/* Le Veilleur (corps, sceptre-lanterne, poses, bouclier, éclats) est commun à la série : shared/js/20-watcher.js
   (LB.drawWatcher, LB.WATCHER_POSES, LB.drawBlock). Les phases ne gardent que leur chorégraphie (positions, contres, finale). */
/* Éclat de lanterne : rayon court entre deux points */
const lanternBeam=(A,B,w,al)=>LB.lanternBeam(ctx,A,B,w,al);
