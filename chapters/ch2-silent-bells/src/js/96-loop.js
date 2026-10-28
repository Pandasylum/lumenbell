/* ---------- main loop ---------- */
let lastT=performance.now();
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;rt+=dt;
  if(!$('menu').hidden)return;
  if(!S.paused&&['play','ko','dead','cine','prologue','epilogue'].includes(S.mode))gt+=dt;
  ctx=ctxMain;SC=SCm;
  update(dt);gameUpdate(dt);draw();
}
(function(){const w=$('mSnow');for(let i=0;i<34;i++){const e=document.createElement('i');e.className='msn';e.style.left=(Math.random()*100)+'%';e.style.setProperty('--dx',((Math.random()-.5)*120)+'px');e.style.animationDuration=(7+Math.random()*8)+'s';e.style.animationDelay=(-Math.random()*12)+'s';const z=1.5+Math.random()*2.5;e.style.width=e.style.height=z+'px';w.appendChild(e)}})();
function frameScene(){const sv=$('mScene'),port=window.innerHeight>window.innerWidth*1.1;sv.setAttribute('viewBox',port?'420 140 450 352':'0 0 960 540');sv.querySelectorAll('.mw').forEach(e=>{if(port)e.setAttribute('transform','translate(250 0)');else e.removeAttribute('transform')});sv.setAttribute('preserveAspectRatio',port?'xMidYMax meet':'xMidYMax slice')}
window.addEventListener('resize',frameScene);frameScene();
S.d=DIFFS.normal;S.phase=2;applyLang();requestAnimationFrame(loop);

})();
