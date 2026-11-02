// Hub de la serie (site/index.html, session menu/crown A) : etats, interaction, clavier, langues, mouvement reduit, tailles.
// 1. profils : vierge / I termine / I et II termines / II termine sans I (II reste ferme) / ancienne cle eb-end / cles absentes,
//    partielles, corrompues / localStorage et sessionStorage bloques (le hub s'ouvre, profil vierge). Pour chacun : etat de chaque
//    tour (closed, play, done, soon), tours fermees desactivees et sans libelle, fil allume sous les tours terminees.
// 2. interaction : ecran de demarrage (un seul bouton), toucher une tour ouvre la carte (« Chapitre N », nom, « Entrer »), III :
//    « A venir » sans « Entrer », tour fermee et centre : rien ; Echap ferme la carte ; fleches (sens horaire, boucle), Entree ;
//    Entrer mene au chapitre sans ecran de demarrage, Retour ramene au hub sans ecran ; double toucher / double Entree : une seule
//    navigation ; les tours terminees repondent a l'arrivee (cloches) ; une tour terminee depuis la derniere visite s'allume au retour.
// 3. FR et EN ; prefers-reduced-motion (plus de pulsation ni de battement ni de particules) ; aucun mot « Couronne » / « Crown »
//    dans le texte visible, les libelles d'accessibilite, les titres ni le titre de la page.
// 4. tailles 375x667, 390x844, 844x390 (tactile), 1280x720, 1920x1080 : zones tactiles >= 48 px, rien hors de l'ecran, pas de
//    defilement, la figure ne chevauche ni le titre ni le bas ; carte dans l'ecran ; rotation en cours de route.
// Usage : node hub.js (python3 build/build_site.py avant). Sortie attendue : errs []
const path=require('path');const launch=require('./launch');
const HUB='file://'+path.resolve(__dirname,'../site/index.html'),errs=[];
const check=(c,msg)=>{if(!c)errs.push(msg)};
const SECRET=/couronne|crown/i;
// instrumentation : oscillateurs crees (cloches et bourdon)
const PROBE=()=>{const A=window.AudioContext;if(!A)return;window.__osc=0;const o=A.prototype.createOscillator;A.prototype.createOscillator=function(){window.__osc++;return o.call(this)}};
const SEED=keys=>{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');for(const k in keys)localStorage.setItem(k,keys[k])}};
const BLOCK=()=>{for(const k of ['localStorage','sessionStorage'])Object.defineProperty(window,k,{get(){throw new DOMException('blocked','SecurityError')}})};
async function open(b,o){o=o||{};const ctx=await b.newContext({viewport:o.vp||{width:1280,height:720},locale:o.lang==='en'?'en-US':'fr-FR',reducedMotion:o.reduced?'reduce':'no-preference',hasTouch:!!o.touch,isMobile:!!o.touch});
 await ctx.addInitScript(PROBE);
 if(o.block)await ctx.addInitScript(BLOCK);else await ctx.addInitScript(SEED,o.keys||{});
 if(o.lit)await ctx.addInitScript(v=>{if(!sessionStorage.getItem('__l')){sessionStorage.setItem('__l','1');sessionStorage.setItem('lb-hub-lit',v)}},o.lit);
 const pg=await ctx.newPage(),tag=o.tag||'';
 pg.on('pageerror',e=>errs.push(tag+': pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(tag+': console: '+m.text())});
 await pg.goto(HUB+(o.q||''));await pg.waitForTimeout(150);return{ctx,pg}}
const towers=pg=>pg.evaluate(()=>[...document.querySelectorAll('.tw')].map(b=>({n:+b.dataset.n,st:['closed','play','done','soon'].find(k=>b.classList.contains(k)),dis:b.disabled,label:b.getAttribute('aria-label'),hid:b.getAttribute('aria-hidden')})));
const wires=pg=>pg.evaluate(()=>[...document.querySelectorAll('#wire line')].map(l=>l.classList.contains('on')));
const secret=pg=>pg.evaluate(()=>{const t=[document.title,document.body.innerText];document.querySelectorAll('[aria-label],[title],[alt]').forEach(e=>t.push(e.getAttribute('aria-label')||'',e.getAttribute('title')||'',e.getAttribute('alt')||''));return t.join(' | ')});
const cardInfo=pg=>pg.evaluate(()=>{const c=document.getElementById('hcard'),g=document.getElementById('hcGo');return{open:!c.hidden,eye:document.getElementById('hcEye').textContent,name:document.getElementById('hcName').textContent,
 soon:document.getElementById('hcSoon').hidden?'':document.getElementById('hcSoon').textContent,go:g.hidden?'':g.textContent,focus:document.activeElement&&document.activeElement.id}});
const focusN=pg=>pg.evaluate(()=>{const a=document.activeElement;return a&&a.classList.contains('tw')?+a.dataset.n:a&&a.id});
(async()=>{const b=await launch();
 // 1. profils
 const P=[['vierge',{},['play','closed','closed','closed','closed','closed']],
  ['I termine',{'lb-ch1-end':'1'},['done','play','closed','closed','closed','closed']],
  ['I et II termines',{'lb-ch1-end':'1','lb-ch2-end':'1'},['done','done','soon','closed','closed','closed']],
  ['II sans I',{'lb-ch2-end':'1'},['play','closed','closed','closed','closed','closed']],
  ['ancienne cle eb-end',{'eb-end':'1'},['done','play','closed','closed','closed','closed']],
  ['cle partielle (I a 0, II a 1)',{'lb-ch1-end':'0','lb-ch2-end':'1'},['play','closed','closed','closed','closed','closed']],
  ['cles corrompues',{'lb-ch1-end':'true','lb-ch2-end':'{"x":','lb-lang':'zz'},['play','closed','closed','closed','closed','closed']],
  ['cles vides',{'lb-ch1-end':'','lb-ch2-end':' 1'},['play','closed','closed','closed','closed','closed']],
  ['stockage bloque',null,['play','closed','closed','closed','closed','closed']]];
 for(const [nm,keys,want] of P){const {ctx,pg}=await open(b,{keys:keys||{},block:keys===null,tag:nm,lit:nm==='cles corrompues'?'pas du json':null});
  await pg.click('#gateBtn');await pg.waitForTimeout(200);
  const T=await towers(pg),W=await wires(pg);
  check(JSON.stringify(T.map(t=>t.st))===JSON.stringify(want),nm+' : etats '+JSON.stringify(T.map(t=>t.st))+' attendu '+JSON.stringify(want));
  T.forEach((t,i)=>{const closed=want[i]==='closed';check(t.dis===closed&&(closed?t.hid==='true'&&!t.label:!!t.label&&!t.hid),nm+' : tour '+t.n+' desactivee / libelle '+JSON.stringify(t))});
  check(JSON.stringify(W)===JSON.stringify(want.map(s=>s==='done')),nm+' : fil '+JSON.stringify(W));
  check(!SECRET.test(await secret(pg)),nm+' : mot interdit');
  console.log(nm.padEnd(30),T.map(t=>t.st).join(' '));await ctx.close()}
 // 2. interaction, FR et EN, I et II termines
 for(const lang of ['fr','en']){const tag='interaction '+lang,{ctx,pg}=await open(b,{keys:{'lb-ch1-end':'1','lb-ch2-end':'1'},lang,tag});
  const F=lang==='fr';
  check(await pg.evaluate(()=>!document.getElementById('gate').hidden&&document.querySelectorAll('#gate button').length===1),tag+' : ecran de demarrage a un seul bouton');
  check((await pg.textContent('#gateBtn'))===(F?'Commencer':'Start'),tag+' : bouton de demarrage');
  await pg.click('#gateBtn');await pg.waitForTimeout(150);
  check(await focusN(pg)===1,tag+' : focus apres Commencer sur la tour I ('+await focusN(pg)+')');
  await pg.waitForTimeout(2200);
  const osc=await pg.evaluate(()=>window.__osc);check(osc>=4+2*5,tag+' : les tours terminees repondent a l\'arrivee ('+osc+' oscillateurs)');
  check(await pg.evaluate(()=>document.querySelectorAll('.tw[aria-label]').length===3),tag+' : trois tours ouvertes avec libelle');
  const lab=await pg.getAttribute('.tw[data-n="2"]','aria-label');check(lab===(F?'Chapitre II · Silent Bells':'Chapter II · Silent Bells'),tag+' : libelle « '+lab+' »');
  await pg.click('.tw[data-n="1"]');await pg.waitForTimeout(100);let C=await cardInfo(pg);
  check(C.open&&C.eye===(F?'Chapitre I':'Chapter I')&&C.name==='Ember Bridge'&&C.go===(F?'Entrer':'Enter')&&!C.soon&&C.focus==='hcGo',tag+' : carte I '+JSON.stringify(C));
  const col=await pg.evaluate(()=>getComputedStyle(document.getElementById('hcName')).color);check(col==='rgb(255, 122, 43)',tag+' : nom dans la couleur du chapitre '+col);
  await pg.keyboard.press('Escape');await pg.waitForTimeout(50);C=await cardInfo(pg);check(!C.open&&await focusN(pg)===1,tag+' : Echap ferme la carte, focus sur la tour');
  await pg.click('.tw[data-n="3"]');await pg.waitForTimeout(100);C=await cardInfo(pg);
  check(C.open&&C.eye===(F?'Chapitre III':'Chapter III')&&C.name==='Hollow Roots'&&C.soon===(F?'À venir':'Coming soon')&&C.go==='',tag+' : carte III '+JSON.stringify(C));
  await pg.mouse.click(5,300);await pg.waitForTimeout(50);check(!(await cardInfo(pg)).open,tag+' : toucher a cote ferme la carte');
  await pg.click('.tw[data-n="5"]',{force:true});await pg.waitForTimeout(50);check(!(await cardInfo(pg)).open,tag+' : tour fermee : rien');
  const cc=await pg.evaluate(()=>{const r=document.getElementById('core').getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});
  await pg.mouse.click(cc[0],cc[1]);await pg.waitForTimeout(50);check(!(await cardInfo(pg)).open,tag+' : centre non cliquable');
  check(await pg.evaluate(()=>{const e=document.getElementById('core');return e.tagName!=='BUTTON'&&getComputedStyle(e).pointerEvents==='none'&&e.getAttribute('aria-hidden')==='true'}),tag+' : centre ni bouton ni cible');
  // clavier : fleches dans le sens horaire, en boucle sur les tours ouvertes
  await pg.focus('.tw[data-n="1"]');const seq=[];for(const k of ['ArrowRight','ArrowRight','ArrowRight','ArrowLeft','ArrowUp','ArrowDown']){await pg.keyboard.press(k);seq.push(await focusN(pg))}
  check(JSON.stringify(seq)==='[2,3,1,3,2,3]',tag+' : fleches '+JSON.stringify(seq));
  check(!SECRET.test(await secret(pg)),tag+' : mot interdit');
  // Entree sur une tour : la carte ; double Entree sur « Entrer » : une seule navigation, chapitre sans ecran de demarrage
  await pg.focus('.tw[data-n="2"]');await pg.keyboard.press('Enter');await pg.waitForTimeout(80);C=await cardInfo(pg);check(C.open&&C.name==='Silent Bells'&&C.focus==='hcGo',tag+' : Entree ouvre la carte II');
  let nav=0;pg.on('framenavigated',f=>{if(f===pg.mainFrame())nav++});
  await pg.keyboard.press('Enter');await pg.keyboard.press('Enter').catch(()=>{});await pg.waitForLoadState('load');await pg.waitForTimeout(500);
  check(nav===1,tag+' : double Entree : '+nav+' navigations');
  check(/\/site\/ch2\/index\.html\?from=hub$/.test(pg.url()),tag+' : chapitre II ouvert '+pg.url());
  check(await pg.evaluate(()=>document.getElementById('gate').hidden&&!!document.getElementById('mHub')),tag+' : chapitre sans ecran de demarrage, avec Retour');
  check((await pg.textContent('#mHub .nm'))===(F?'Retour':'Back'),tag+' : texte du lien Retour');
  nav=0;await pg.dblclick('#mHub');await pg.waitForLoadState('load');await pg.waitForTimeout(400);
  check(nav===1,tag+' : double toucher Retour : '+nav+' navigations');
  check(/\/site\/index\.html\?back=2$/.test(pg.url())&&await pg.evaluate(()=>document.getElementById('gate').hidden),tag+' : Retour ramene au hub sans ecran '+pg.url());
  check(await focusN(pg)===2,tag+' : focus de retour sur la tour II');
  // double toucher sur « Entrer » : une seule navigation
  await pg.click('.tw[data-n="1"]');await pg.waitForTimeout(80);nav=0;await pg.dblclick('#hcGo');await pg.waitForLoadState('load');await pg.waitForTimeout(400);
  check(nav===1&&/\/site\/ch1\/index\.html\?from=hub$/.test(pg.url()),tag+' : double toucher Entrer : '+nav+' navigations '+pg.url());
  await ctx.close()}
 // 2b. retour d'un chapitre qu'on vient de terminer : sa tour s'allume avec sa cloche, la suivante s'ouvre
 {const tag='retour termine',{ctx,pg}=await open(b,{keys:{'lb-ch1-end':'1'},lit:'[]',q:'?back=1',tag});
  const t0=(await towers(pg)).map(t=>t.st);check(t0[0]==='play'&&t0[1]==='closed',tag+' : avant '+t0);
  await pg.waitForTimeout(1400);const t1=(await towers(pg)).map(t=>t.st),osc=await pg.evaluate(()=>window.__osc);
  check(t1[0]==='done'&&t1[1]==='play',tag+' : apres '+t1);check(osc>=4+5,tag+' : cloche de la tour allumee ('+osc+')');
  check(await pg.evaluate(()=>document.getElementById('gate').hidden),tag+' : pas d\'ecran de demarrage');
  check(await pg.evaluate(()=>sessionStorage.getItem('lb-hub-lit'))==='[1]',tag+' : tours vues allumees memorisees');await ctx.close()}
 // 3. mouvement reduit
 for(const red of [false,true]){const tag='mouvement '+(red?'reduit':'normal'),{ctx,pg}=await open(b,{keys:{'lb-ch1-end':'1'},reduced:red,tag});await pg.click('#gateBtn');await pg.waitForTimeout(100);
  const A=await pg.evaluate(()=>({pulse:getComputedStyle(document.querySelector('.tw.play .dot')).animationName,core:getComputedStyle(document.getElementById('core')).animationName,
   motes:[...document.querySelectorAll('.mote')].filter(e=>getComputedStyle(e).display!=='none').length}));
  if(red)check(A.pulse==='none'&&A.core==='none'&&A.motes===0,tag+' : '+JSON.stringify(A));else check(A.pulse==='hpulse'&&A.core==='hbeat'&&A.motes>0,tag+' : '+JSON.stringify(A));
  console.log(tag.padEnd(30),JSON.stringify(A));await ctx.close()}
 // 4. tailles, rotation
 const SZ=[[375,667,true],[390,844,true],[844,390,true],[1280,720,false],[1920,1080,false]];
 const geo=pg=>pg.evaluate(()=>{const r=e=>{const q=e.getBoundingClientRect();return[q.left,q.top,q.width,q.height]},vis=e=>!e.hidden&&getComputedStyle(e).display!=='none'&&e.getClientRects().length>0;
  const W=innerWidth,H=innerHeight,out=[],small=[],ov=[];
  const ctl=[...document.querySelectorAll('.tw:not(:disabled),#langs button,#fsBtn,#hcGo,#gateBtn')].filter(vis);
  for(const e of ctl){const q=r(e);if(q[2]<48||q[3]<48)small.push((e.id||'tw'+e.dataset.n)+' '+q.map(Math.round))}
  for(const e of [...ctl,...document.querySelectorAll('.tw .dot,#brand,.hfoot,#ver,#hcard,#core')].filter(vis)){const q=r(e);if(q[0]<-.5||q[1]<-.5||q[0]+q[2]>W+.5||q[1]+q[3]>H+.5)out.push((e.id||e.className)+' '+q.map(Math.round))}
  const hb=document.getElementById('brand').getBoundingClientRect(),fb=document.querySelector('.hfoot').getBoundingClientRect();
  for(const d of document.querySelectorAll('.tw .dot')){const q=d.getBoundingClientRect();if(q.top<hb.bottom||q.bottom>fb.top)ov.push('tour '+d.parentNode.dataset.n+' '+[q.top,q.bottom].map(Math.round))}
  const s=document.documentElement;return{small,out,ov,scroll:[s.scrollWidth>W,s.scrollHeight>H],fig:Math.round(document.getElementById('fig').getBoundingClientRect().width)}});
 const judge=(tag,G)=>{check(!G.small.length,tag+' : zones < 48 px '+G.small);check(!G.out.length,tag+' : hors ecran '+G.out);check(!G.ov.length,tag+' : figure sur le titre ou le bas '+G.ov);check(!G.scroll[0]&&!G.scroll[1],tag+' : defilement '+G.scroll)};
 for(const [w,h,touch] of SZ)for(const lang of ['fr','en']){const tag=w+'x'+h+' '+lang,{ctx,pg}=await open(b,{vp:{width:w,height:h},touch,lang,keys:{'lb-ch1-end':'1','lb-ch2-end':'1'},tag});
  judge(tag+' demarrage',await geo(pg));
  if(touch)await pg.tap('#gateBtn');else await pg.click('#gateBtn');await pg.waitForTimeout(100);const G=await geo(pg);judge(tag,G);
  if(touch)await pg.tap('.tw[data-n="2"]');else await pg.click('.tw[data-n="2"]');await pg.waitForTimeout(80);
  check((await cardInfo(pg)).open,tag+' : toucher ouvre la carte');judge(tag+' carte',await geo(pg));
  if(w===390&&lang==='fr'){for(const [rw,rh] of [[844,390],[390,844]]){await pg.setViewportSize({width:rw,height:rh});await pg.waitForTimeout(150);judge(tag+' rotation '+rw+'x'+rh,await geo(pg))}
   check((await cardInfo(pg)).open,tag+' : carte gardee a la rotation')}
  console.log(tag.padEnd(30),'figure',G.fig,'px');await ctx.close()}
 console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
