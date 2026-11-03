// Page verrouillee (ui/lock-scroll) : glisser au doigt de haut en bas puis de bas en haut ne deplace rien (scrollY 0, document pas plus haut
// que la fenetre, fenetre visuelle immobile). Utilise par hub.js et menu-layout.js. Contexte tactile requis.
async function swipe(cdp,x,y0,y1){const P=y=>[{x,y,id:1}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P(y0)});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:P(y0+(y1-y0)*i/8)});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
module.exports=async function lock(ctx,pg,tag,errs){const cdp=await ctx.newCDPSession(pg);
 const{w,h}=await pg.evaluate(()=>({w:innerWidth,h:innerHeight}));const x=Math.round(w*.5);
 for(const[a,b]of[[.2,.8],[.8,.2]]){await swipe(cdp,x,Math.round(h*a),Math.round(h*b));await pg.waitForTimeout(150);
  const S=await pg.evaluate(()=>({y:scrollY,x:scrollX,sh:document.documentElement.scrollHeight,bh:document.body.scrollHeight,ih:innerHeight,vo:visualViewport.offsetTop,vp:visualViewport.pageTop}));
  if(S.y||S.x)errs.push(tag+' : page deplacee (scroll '+S.x+','+S.y+')');
  if(S.sh>S.ih)errs.push(tag+' : document plus haut que la fenetre ('+S.sh+' > '+S.ih+')');
  if(S.vo||S.vp)errs.push(tag+' : fenetre visuelle deplacee ('+S.vo+','+S.vp+')')}
 await cdp.detach()};
