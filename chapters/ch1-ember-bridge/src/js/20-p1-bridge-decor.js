/* ---------- static layers ---------- */
let bgFar,bgBridge,vig; /* calques hors écran, créés une fois par buildStatic (LB.cacheLayer ; taille tronquée comme avant : round:Math.floor) */
const LAYER={round:Math.floor};
function buildStatic(){
  bgFar=LB.cacheLayer(W,H,c=>{
    let g=c.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#07050b');g.addColorStop(.5,'#150c19');g.addColorStop(1,'#3a1210');
    c.fillStyle=g;c.fillRect(0,0,W,H);
    [60,210,380,560,700,850].forEach((x,i)=>{
      const w=54+(i%3)*14;
      c.fillStyle='#120d19';c.fillRect(x-w/2,70,w,430);
      c.fillStyle='rgba(120,80,140,.08)';c.fillRect(x-w/2,70,5,430);
      c.fillStyle='#17101e';c.fillRect(x-w/2-8,64,w+16,14);
    });
    c.fillStyle='#0a070e';
    for(let x=-20;x<W+20;x+=40){
      const h=30+Math.abs(Math.sin(x*.37))*90;
      c.beginPath();c.moveTo(x,0);c.lineTo(x+44,0);c.lineTo(x+22,h);c.closePath();c.fill();
    }
  },LAYER);
  bgBridge=LB.cacheLayer(W,H,c=>{
    c.fillStyle='#241c2b';c.fillRect(0,DECK,W,30);
    c.fillStyle='#3a2f46';c.fillRect(0,DECK-4,W,6);
    c.fillStyle='rgba(0,0,0,.35)';
    for(let x=0,i=0;x<W;x+=48,i++)c.fillRect(x+(i%2)*14,DECK+3,2,24);
    c.fillStyle='#17121e';c.fillRect(0,DECK+30,W,H-DECK-30);
    c.globalCompositeOperation='destination-out';
    for(let cx=120;cx<W+120;cx+=240){c.beginPath();c.arc(cx,H+4,92,Math.PI,0);c.fill()}
    c.globalCompositeOperation='source-over';
    c.strokeStyle='#33283d';c.lineWidth=3;
    for(let cx=120;cx<W+120;cx+=240){c.beginPath();c.arc(cx,H+4,92,Math.PI,0);c.stroke()}
    c.fillStyle='#4a3d57';c.fillRect(0,DECK+28,W,2);
  },LAYER);
  vig=LB.cacheLayer(W,H,c=>{
    const vg=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.9);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');
    c.fillStyle=vg;c.fillRect(0,0,W,H);
  },LAYER);
}
