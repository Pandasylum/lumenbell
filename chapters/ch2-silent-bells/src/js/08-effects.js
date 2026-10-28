/* ---------- particles & pops ---------- */
function burst(x,y,n,col,spd,life,g){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(.3+Math.random())*spd;S.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(g?spd*.4:0),g:g||0,t0:gt,life:life*(.6+Math.random()*.6),c:col,r:1.5+Math.random()*2.2})}}
/* floating text: only onomatopoeia (same words in both languages, as in Ember Bridge); no announcement words */
/* onomatopoeia: no word on an ordinary riposte (as in Ember Bridge); the Voice only cries, by sound */
const ONO={block:'CLANG',final:'KRAKOOM',crush:'KRAAAK'};
function pop(txt,col,x,y){S.pops.push({txt,c:col,x:x||HX+10,y:y||GY-150,t0:gt})}

/* ---------- patterns ---------- */
function sched(list){const pat={ths:list,ok:true,perf:0,nReal:list.filter(t=>t.real!==false&&!t.hold).length};list.forEach(th=>{if(th.real===undefined)th.real=true;th.pat=pat;S.threats.push(th)});S.pat=pat;return pat}

