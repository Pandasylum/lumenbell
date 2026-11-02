// Hub de la serie (site/index.html, session menu/crown A) : etats, interaction, clavier, langues, mouvement reduit, tailles.
// 1. profils : vierge / I termine / I et II termines / II termine sans I (II reste ferme) / ancienne cle eb-end / cles absentes,
//    partielles, corrompues / localStorage et sessionStorage bloques (le hub s'ouvre, profil vierge). Pour chacun : etat de chaque
//    tour (closed, play, done, soon), tours fermees desactivees et sans libelle, fil allume sous les tours terminees.
// 2. interaction : ecran de demarrage (un seul bouton), toucher une tour ouvre la carte (« Chapitre N », nom, « Entrer »), III :
//    « A venir » sans « Entrer », tour fermee et centre : rien ; Echap ferme la carte ; fleches (sens horaire, boucle), Entree ;
//    Entrer mene au chapitre sans ecran de demarrage, Retour ramene au hub sans ecran ; double toucher / double Entree : une seule
//    navigation ; tours terminees pas encore fetees (lb-hub-lit) : elles s'allument a l'arrivee avec leur cloche, une seule fois
//    (rechargement : pas de rejeu ; tour deja fetee : allumee sans cloche) ; lien « Chapitres » dans le chapitre.
// 3. FR et EN ; mouvement reduit = preference du systeme seule (aucun reglage, aucune cle lb-pref-motion) : en mode normal comme en
//    mouvement reduit, les trois etats (a jouer = point + fin cercle, termine = point plein sans cercle, ferme = cercle eteint sans
//    point) donnent trois rendus differents ; en mouvement reduit, plus de pulsation ni de battement ni de particules, mais le cercle
//    reste ; aucun mot « Couronne » / « Crown » dans le texte visible, les libelles d'accessibilite, les titres ni le titre de la page.
// 3b. reglages (roue) : Musique, Bruitages (lb-mus, lb-snd), pas de reglage de mouvement, Echap ;
//    reinitialisation : un clic ou un appui relache avant 2 s n'efface rien (jauge revenue a zero), 2 s maintenues effacent toute la
//    progression (RESET_T, anciennes cles comprises) et gardent langue et reglages ; le hub revient a l'etat vierge, meme apres rechargement.
// 3c. fond sonore ?bed=a|b|c (defaut a) : toutes les frequences de la table des variantes dans la bande 50-500 Hz, passe-bas <= 1,2 kHz,
//    houles de 12 a 20 s, oscillateurs reellement crees dans la bande, retard a retroaction ; b = bourdon du premier jet a -4 dB plus un
//    partiel ; cloches inchangees (table et hauteurs jouees) ; plein ecran absent (hub et chapitres).
// 4. tailles 375x667, 390x844, 844x390 (tactile), 1280x720, 1920x1080 : zones tactiles >= 48 px, rien hors de l'ecran, pas de
//    defilement, la figure ne chevauche ni le titre ni le bas ; titre centre entre le haut de l'ecran et la tour I, sur le meme axe
//    vertical que la figure (ecart <= 2 px) ; version dans le coin bas droit a la hauteur des langues ; carte d'entree (petite, ancree
//    sous la tour, au-dessus si la place manque) : dans l'ecran, pour chacune des six tours son rectangle ne recouvre le disque d'aucune
//    tour ni du centre, la pointe est sur la carte, tour choisie eclairee, toucher une autre tour deplace la carte, fond ou Echap la
//    ferme ; rotation en cours de route.
//    Les six tours : le hub n'a que trois chapitres ; une copie temporaire du hub (HUB_CH a six entrees, tours toutes ouvertes) sert
//    aux six tours.
// Usage : node hub.js (python3 build/build_site.py avant). Sortie attendue : errs []
const path=require('path'),fs=require('fs'),os=require('os');const launch=require('./launch');
// Le hub est servi en http (serveur local, racine du depot) : le stockage des pages file:// n'est pas fiable d'une navigation a l'autre
// (cause des echecs intermittents « rechargement » : le nouveau document voyait un stockage vide, l'application ecrit pourtant de facon synchrone).
const ROOT=path.resolve(__dirname,'..'),errs=[];let HUB='',BASE='',SIX='';
const server=require('http').createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);
 if(u==='/__six.html'){r.writeHead(200,{'content-type':'text/html; charset=utf-8'});return r.end(SIX)}
 const f=path.join(ROOT,u);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 r.writeHead(200,{'content-type':/\.html$/.test(f)?'text/html; charset=utf-8':'text/plain; charset=utf-8'});r.end(fs.readFileSync(f))});
const check=(c,msg)=>{if(!c)errs.push(msg)};
const SECRET=/couronne|crown/i,HUB_PAD=16;
// table du hub lue dans le source construit (le hub est dans une fonction : HUB_T n'est pas global)
const SRC=fs.readFileSync(path.resolve(__dirname,'../site/index.html'),'utf8'),HT=new Function('return '+SRC.match(/const HUB_T=(\{[\s\S]*?\n\});/)[1])(),
 HC=new Function('return '+SRC.match(/const HUB_CH=(\[[\s\S]*?\n\]);/)[1])();
// oscillateurs du fond sonore par defaut (a) : balayage + houle commune + (houle + voix) par note + souffle ; le reste vient des cloches
const BEDN=1+1+HT.beds.a.notes.length*(1+HT.beds.a.detune.length)+1;
// instrumentation : oscillateurs crees (cloches et bourdon)
const PROBE=()=>{const A=window.AudioContext;if(!A)return;window.__osc=0;window.__oscs=[];window.__flt=[];window.__dl=0;const o=A.prototype.createOscillator,f=A.prototype.createBiquadFilter,d=A.prototype.createDelay;A.prototype.createDelay=function(){window.__dl++;return d.apply(this,arguments)};
 A.prototype.createOscillator=function(){window.__osc++;const x=o.call(this);window.__oscs.push(x);return x};A.prototype.createBiquadFilter=function(){const x=f.call(this);window.__flt.push(x);return x}};
// graines posees une seule fois par contexte : le repere est dans localStorage (le meme stockage que les cles testees, valide par settle), pas dans sessionStorage
const SEED=keys=>{if(/\.html$/.test(location.pathname)&&!localStorage.getItem('__i')){localStorage.setItem('__i','1');for(const k in keys)localStorage.setItem(k,keys[k])}};
const BLOCK=()=>{for(const k of ['localStorage','sessionStorage'])Object.defineProperty(window,k,{get(){throw new DOMException('blocked','SecurityError')}})};
// attend que l'ecriture localStorage de la page soit vue par une AUTRE page du meme contexte (donc validee cote navigateur) avant un
// rechargement ou une navigation : etat attendu, jamais une duree fixe. fn(arg) s'evalue dans la page temoin (un fichier texte local).
async function settle(ctx,fn,arg,tag){const w=await ctx.newPage();try{await w.goto(BASE+'/tests/hub.js');await w.waitForFunction(fn,arg,{timeout:8000})}
 catch(e){errs.push((tag||'')+': ecriture localStorage non validee : '+e.message.split('\n')[0])}finally{await w.close()}}
async function open(b,o){o=o||{};const ctx=await b.newContext({viewport:o.vp||{width:1280,height:720},locale:o.lang==='en'?'en-US':'fr-FR',reducedMotion:o.reduced?'reduce':'no-preference',hasTouch:!!o.touch,isMobile:!!o.touch});
 await ctx.addInitScript(PROBE);
 if(o.block)await ctx.addInitScript(BLOCK);else await ctx.addInitScript(SEED,o.keys||{});
 if(o.lit)await ctx.addInitScript(v=>{if(/\.html$/.test(location.pathname)&&!localStorage.getItem('__l')){localStorage.setItem('__l','1');localStorage.setItem('lb-hub-lit',v)}},o.lit);
 const pg=await ctx.newPage(),tag=o.tag||'';
 pg.on('pageerror',e=>errs.push(tag+': pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(tag+': console: '+m.text())});
 await pg.goto((o.url||HUB)+(o.q||''));await pg.waitForTimeout(150);return{ctx,pg}}
const towers=pg=>pg.evaluate(()=>[...document.querySelectorAll('.tw')].map(b=>({n:+b.dataset.n,st:['closed','play','done','soon'].find(k=>b.classList.contains(k)),dis:b.disabled,label:b.getAttribute('aria-label'),hid:b.getAttribute('aria-hidden')})));
const wires=pg=>pg.evaluate(()=>[...document.querySelectorAll('#wire line')].map(l=>l.classList.contains('on')));
const secret=pg=>pg.evaluate(()=>{const t=[document.title,document.body.innerText];document.querySelectorAll('[aria-label],[title],[alt]').forEach(e=>t.push(e.getAttribute('aria-label')||'',e.getAttribute('title')||'',e.getAttribute('alt')||''));return t.join(' | ')});
const cardInfo=pg=>pg.evaluate(()=>{const c=document.getElementById('hcard'),g=document.getElementById('hcGo');return{open:!c.hidden,name:document.getElementById('hcName').textContent,
 soon:document.getElementById('hcSoon').hidden?'':document.getElementById('hcSoon').textContent,go:g.hidden?'':g.textContent,focus:document.activeElement&&document.activeElement.id}});
// carte d'entree : dans l'ecran, rectangle sans toucher le disque d'aucune tour ni du centre, ancree (du bon cote de la tour choisie, pointe sur la carte)
const cardGeo=pg=>pg.evaluate(()=>{const c=document.getElementById('hcard'),q=c.getBoundingClientRect(),W=innerWidth,H=innerHeight,sel=[...document.querySelectorAll('.tw.sel')].map(e=>+e.dataset.n),
 ds=[...document.querySelectorAll('.tw .dot,#core')].map(e=>{const r=e.getBoundingClientRect();return{id:e.id||e.parentNode.dataset.n,x:r.left+r.width/2,y:r.top+r.height/2,r:r.width/2}}),
 hit=ds.filter(d=>{const dx=Math.max(q.left-d.x,0,d.x-q.right),dy=Math.max(q.top-d.y,0,d.y-q.bottom);return dx*dx+dy*dy<d.r*d.r}).map(d=>d.id),
 t=ds.find(d=>String(d.id)===String(sel[0])),up=c.classList.contains('up'),tip=c.querySelector('.tip').getBoundingClientRect();
 return{open:!c.hidden,discs:ds.length,hit,inside:q.left>=0&&q.top>=0&&q.right<=W&&q.bottom<=H,sel,up,
  anchored:!!t&&(up?q.bottom<=t.y-t.r+.5:q.top>=t.y+t.r-.5)&&t.x>=q.left&&t.x<=q.right&&tip.left>=q.left-1&&tip.right<=q.right+1}});
const cardOk=(tag,G,n)=>check(G.open&&G.discs===7&&!G.hit.length&&G.inside&&G.anchored&&G.sel.join()===String(n),tag+' : carte '+JSON.stringify(G));
const focusN=pg=>pg.evaluate(()=>{const a=document.activeElement;return a&&a.classList.contains('tw')?+a.dataset.n:a&&a.id});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));BASE='http://127.0.0.1:'+server.address().port;HUB=BASE+'/site/index.html';const b=await launch();
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
  await pg.click('#gateBtn');await pg.waitForTimeout(1100);   // apres l'allumage des tours pas encore fetees
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
  const osc=await pg.evaluate(()=>window.__osc);check(osc>=BEDN+2*5,tag+' : les tours terminees pas encore fetees s\'allument a l\'arrivee ('+osc+' oscillateurs)');
  check(await pg.evaluate(()=>localStorage.getItem('lb-hub-lit'))==='[1,2]',tag+' : tours fetees memorisees');
  check(await pg.evaluate(()=>!document.querySelector('#fsBtn,.fsb,.fsm')&&!/fullscreen|plein .cran/i.test(document.body.innerText+[...document.querySelectorAll('[aria-label],[title]')].map(e=>e.getAttribute('aria-label')+e.title).join(' '))),tag+' : plein ecran absent du hub');
  check(await pg.evaluate(()=>document.querySelectorAll('.tw[aria-label]').length===3),tag+' : trois tours ouvertes avec libelle');
  const lab=await pg.getAttribute('.tw[data-n="2"]','aria-label');check(lab===(F?'Chapitre II · Silent Bells':'Chapter II · Silent Bells'),tag+' : libelle « '+lab+' »');
  await pg.click('.tw[data-n="1"]');await pg.waitForTimeout(100);let C=await cardInfo(pg);
  check(C.open&&C.name==='Ember Bridge'&&C.go===(F?'Entrer':'Enter')&&!C.soon&&C.focus==='hcGo',tag+' : carte I '+JSON.stringify(C));
  const col=await pg.evaluate(()=>getComputedStyle(document.getElementById('hcName')).color);check(col==='rgb(255, 122, 43)',tag+' : nom dans la couleur du chapitre '+col);
  await pg.keyboard.press('Escape');await pg.waitForTimeout(50);C=await cardInfo(pg);check(!C.open&&await focusN(pg)===1,tag+' : Echap ferme la carte, focus sur la tour');
  await pg.click('.tw[data-n="3"]');await pg.waitForTimeout(100);C=await cardInfo(pg);
  check(C.open&&C.name==='Hollow Roots'&&C.soon===(F?'À venir':'Coming soon')&&C.go==='',tag+' : carte III '+JSON.stringify(C));
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
  check(await pg.evaluate(()=>document.getElementById('gate').hidden&&!!document.getElementById('mHub')),tag+' : chapitre sans ecran de demarrage, avec Chapitres');
  check((await pg.textContent('#mHub .nm'))===(F?'Chapitres':'Chapters'),tag+' : texte du lien Chapitres');
  check(await pg.evaluate(()=>!document.querySelector('.fsb,.fsm')&&!/fullscreen|plein .cran/i.test(document.body.innerText+[...document.querySelectorAll('[aria-label],[title]')].map(e=>e.getAttribute('aria-label')+e.title).join(' '))),tag+' : plein ecran absent du chapitre');
  nav=0;await pg.dblclick('#mHub');await pg.waitForLoadState('load');await pg.waitForTimeout(400);
  check(nav===1,tag+' : double toucher Chapitres : '+nav+' navigations');
  check(/\/site\/index\.html\?back=2$/.test(pg.url())&&await pg.evaluate(()=>document.getElementById('gate').hidden),tag+' : Chapitres ramene au hub sans ecran '+pg.url());
  await pg.waitForTimeout(1200);check(await pg.evaluate(()=>window.__osc)<=BEDN,tag+' : tours deja fetees : pas de cloche au retour ('+await pg.evaluate(()=>window.__osc)+')');
  check(await focusN(pg)===2,tag+' : focus de retour sur la tour II');
  // double toucher sur « Entrer » : une seule navigation
  await pg.click('.tw[data-n="1"]');await pg.waitForTimeout(80);nav=0;await pg.dblclick('#hcGo');await pg.waitForLoadState('load');await pg.waitForTimeout(400);
  check(nav===1&&/\/site\/ch1\/index\.html\?from=hub$/.test(pg.url()),tag+' : double toucher Entrer : '+nav+' navigations '+pg.url());
  await ctx.close()}
 // 2b. retour d'un chapitre qu'on vient de terminer : sa tour s'allume avec sa cloche, la suivante s'ouvre
 {const tag='retour termine',{ctx,pg}=await open(b,{keys:{'lb-ch1-end':'1'},lit:'[]',q:'?back=1',tag});
  const t0=(await towers(pg)).map(t=>t.st);check(t0[0]==='play'&&t0[1]==='closed',tag+' : avant '+t0);
  await pg.waitForTimeout(1400);const t1=(await towers(pg)).map(t=>t.st),osc=await pg.evaluate(()=>window.__osc);
  check(t1[0]==='done'&&t1[1]==='play',tag+' : apres '+t1);check(osc>=BEDN+5,tag+' : cloche de la tour allumee ('+osc+')');
  check(await pg.evaluate(()=>document.getElementById('gate').hidden),tag+' : pas d\'ecran de demarrage');
  check(await pg.evaluate(()=>localStorage.getItem('lb-hub-lit'))==='[1]',tag+' : tour fetee memorisee');
  check(await pg.evaluate(()=>document.querySelector('.tw[data-n="1"]').classList.contains('ring')),tag+' : tour I sonne');
  // rechargement : pas de rejeu (tour allumee d'emblee, aucune cloche)
  await settle(ctx,()=>localStorage.getItem('lb-hub-lit')==='[1]',null,tag);await pg.reload();await pg.waitForTimeout(1400);const t2=(await towers(pg)).map(t=>t.st),o2=await pg.evaluate(()=>window.__osc);
  check(t2[0]==='done'&&o2<=BEDN&&await pg.evaluate(()=>!document.querySelector('.tw.ring')),tag+' : rechargement : pas de rejeu '+t2+' ('+o2+' oscillateurs)');await ctx.close()}
 // 2c. tour deja fetee, arrivee par l'ecran de demarrage : allumee sans animation ni cloche
 {const tag='deja fetee',{ctx,pg}=await open(b,{keys:{'lb-ch1-end':'1'},lit:'[1]',tag});
  check((await towers(pg))[0].st==='done',tag+' : allumee avant Commencer');await pg.click('#gateBtn');await pg.waitForTimeout(1400);
  const o=await pg.evaluate(()=>window.__osc);check(o<=BEDN&&await pg.evaluate(()=>!document.querySelector('.tw.ring')),tag+' : ni cloche ni eclat ('+o+')');await ctx.close()}
 // 3. mouvement reduit (preference du systeme seule) : les trois etats, en mode normal et en mouvement reduit (tour II : fermee, a jouer, terminee)
 const look=pg=>pg.evaluate(()=>{const t=document.querySelector('.tw[data-n="2"]'),d=t.querySelector('.dot'),h=t.querySelector('.halo'),c=getComputedStyle(d),p=document.querySelector('.tw.play .dot');
  return{bg:c.backgroundColor,anim:c.animationName,halo:getComputedStyle(h).display!=='none'&&getComputedStyle(h).borderTopWidth!=='0px',haloW:getComputedStyle(h).width,dotW:c.width,
   pulse:p?getComputedStyle(p).animationName:'',core:getComputedStyle(document.getElementById('core')).animationName,
   motes:[...document.querySelectorAll('.mote')].filter(e=>getComputedStyle(e).display!=='none').length,rm:document.documentElement.classList.contains('lb-rm')}});
 const PROF={closed:{},play:{'lb-ch1-end':'1'},done:{'lb-ch1-end':'1','lb-ch2-end':'1'}},LITP={closed:'[]',play:'[1]',done:'[1,2]'};
 for(const [nm,red] of [['mode normal',false],['mouvement reduit (systeme)',true]]){
  const R={},shots={};
  for(const k of ['closed','play','done']){const tag='mouvement '+nm+' '+k;
   // une ancienne cle lb-pref-motion n'a plus aucun effet
   const {ctx,pg}=await open(b,{keys:Object.assign({'lb-pref-motion':red?'normal':'reduce'},PROF[k]),reduced:red,lit:LITP[k],tag});await pg.click('#gateBtn');await pg.waitForTimeout(150);await pg.mouse.move(1,1);
   R[k]=await look(pg);shots[k]=(await pg.locator('.tw[data-n="2"]').screenshot()).toString('base64');await ctx.close()}
  const A=R.play,tag='mouvement '+nm,clear=v=>/rgba\(0, 0, 0, 0\)|transparent/.test(v);
  check(A.rm===red,tag+' : classe de mouvement reduit '+A.rm+' (le hub suit seul le systeme)');
  check(A.halo&&parseFloat(A.haloW)>parseFloat(A.dotW)&&!R.done.halo&&!R.closed.halo,tag+' : cercle autour du point seulement a jouer '+JSON.stringify([R.closed.halo,A.halo,R.done.halo]));
  check(!clear(A.bg)&&!clear(R.done.bg),tag+' : a jouer et termine = point plein');
  check(clear(R.closed.bg),tag+' : ferme = cercle eteint sans point '+JSON.stringify(R.closed));
  check(R.done.anim==='none',tag+' : termine = fixe ('+R.done.anim+')');
  check(shots.closed!==shots.play&&shots.play!==shots.done&&shots.closed!==shots.done,tag+' : trois rendus differents');
  if(red)check(A.pulse==='none'&&A.core==='none'&&A.motes===0,tag+' : rien ne bouge '+JSON.stringify(A));
  else check(A.pulse==='hpulse'&&A.core==='hbeat'&&A.motes>0,tag+' : pulsation, battement, particules '+JSON.stringify(A));
  console.log(tag.padEnd(36),JSON.stringify({rm:A.rm,pulse:A.pulse,halo:[R.closed.halo,A.halo,R.done.halo]}))}
 // 3b. reglages
 for(const lang of ['fr','en']){const tag='reglages '+lang,F=lang==='fr',{ctx,pg}=await open(b,{lang,tag,keys:{'lb-ch1-end':'1'},lit:'[1]'});await pg.click('#gateBtn');await pg.waitForTimeout(100);
  await pg.click('#setBtn');await pg.waitForTimeout(80);
  const P=await pg.evaluate(()=>({open:!document.getElementById('hset').hidden,title:document.getElementById('hsTitle').textContent,rows:[...document.querySelectorAll('.hsrow')].map(r=>r.innerText.replace(/\s+/g,' ').trim()),
   label:document.getElementById('setBtn').getAttribute('aria-label')}));
  const W=F?['Musique OUI NON','Bruitages OUI NON','RÉINITIALISER LA PROGRESSION Maintenir pour effacer']:['Music ON OFF','Sound effects ON OFF','RESET PROGRESS Hold to erase'];
  check(P.open&&P.title===(F?'Réglages':'Settings')&&P.label===(F?'Réglages':'Settings')&&JSON.stringify(P.rows)===JSON.stringify(W),tag+' : panneau '+JSON.stringify(P));
  check(!SECRET.test(await secret(pg)),tag+' : mot interdit');
  await pg.click('.hsrow[data-id=mus] [data-v=false]');await pg.click('.hsrow[data-id=snd] [data-v=false]');await pg.waitForTimeout(50);
  const K=await pg.evaluate(()=>({mus:localStorage.getItem('lb-mus'),snd:localStorage.getItem('lb-snd'),mo:localStorage.getItem('lb-pref-motion'),pr:[...document.querySelectorAll('.hsrow [aria-pressed=true]')].map(b=>b.dataset.v).join(' ')}));
  check(K.mus==='0'&&K.snd==='0'&&K.mo===null&&K.pr==='false false',tag+' : reglages ecrits et appliques, aucune cle de mouvement '+JSON.stringify(K));
  await pg.keyboard.press('Escape');await pg.waitForTimeout(50);check(await pg.evaluate(()=>document.getElementById('hset').hidden&&document.activeElement.id==='setBtn'),tag+' : Echap ferme les reglages');
  // dans les chapitres : son et musique relus
  await settle(ctx,()=>localStorage.getItem('lb-mus')==='0'&&localStorage.getItem('lb-snd')==='0',null,tag);
  for(const ch of [1,2]){await pg.goto(HUB.replace('index.html','ch'+ch+'/index.html?from=hub'));await pg.waitForTimeout(400);
   const C=await pg.evaluate(()=>({snd:document.getElementById('optSnd').checked,mus:document.getElementById('optMus').checked}));
   check(!C.snd&&!C.mus,tag+' : chapitre '+ch+' : reglages appliques '+JSON.stringify(C))}
  await ctx.close()}
 // reinitialisation maintenue
 {const tag='reinitialisation',KEEP={'lb-lang':'fr','lb-snd':'0','lb-mus':'0','lb-help':'1'},
  GONE={'lb-ch1-end':'1','lb-ch2-end':'1','lb-ch1-intro':'1','lb-ch2-unl':'3','lb-ch1-best-tn':'99.5','lb-ch2-best-th':'120','lb-hub-lit':'[1,2]','eb-end':'1','eb-intro':'1','eb-best-tn':'88','db-unl':'2','db-best-tn':'77'};
  const {ctx,pg}=await open(b,{tag,keys:Object.assign({},KEEP,GONE)});await pg.click('#gateBtn');await pg.waitForTimeout(100);
  const ks=()=>pg.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
  const n0=Object.keys(await ks()).length;
  await pg.click('#setBtn');await pg.waitForTimeout(50);const hb=await pg.locator('#hs-reset').boundingBox(),cx=hb.x+hb.width/2,cy=hb.y+hb.height/2;
  await pg.click('#hs-reset');await pg.waitForTimeout(100);check(Object.keys(await ks()).length===n0,tag+' : un clic n\'efface rien');
  await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.waitForTimeout(1000);const mid=await pg.evaluate(()=>+getComputedStyle(document.getElementById('hs-reset')).getPropertyValue('--p'));
  await pg.mouse.up();await pg.waitForTimeout(1300);
  const after=await pg.evaluate(()=>+getComputedStyle(document.getElementById('hs-reset')).getPropertyValue('--p'));
  check(mid>.3&&mid<.7&&after===0&&Object.keys(await ks()).length===n0,tag+' : relache avant 2 s : rien d\'efface, jauge '+mid+' puis '+after);
  await pg.focus('#hs-reset');await pg.keyboard.down('Enter').catch(()=>{});await pg.keyboard.up('Enter');await pg.waitForTimeout(100);check(Object.keys(await ks()).length===n0,tag+' : Entree breve : rien');
  await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.waitForTimeout(2300);await pg.mouse.up();await pg.waitForTimeout(150);
  let K=await ks();const left=Object.keys(GONE).filter(k=>k in K),lost=Object.keys(KEEP).filter(k=>K[k]!==KEEP[k]);
  check(!left.length&&!lost.length,tag+' : cles restantes '+left+' / reglages perdus '+lost);
  let T=(await towers(pg)).map(t=>t.st).join(' ');check(T==='play closed closed closed closed closed'&&await pg.evaluate(()=>document.getElementById('hset').hidden),tag+' : hub vierge apres effacement '+T);
  await settle(ctx,k=>k.every(x=>localStorage.getItem(x)===null),Object.keys(GONE).filter(k=>k!=='lb-hub-lit'),tag);
  await pg.goto(HUB);await pg.waitForTimeout(150);await pg.click('#gateBtn');await pg.waitForTimeout(1200);T=(await towers(pg)).map(t=>t.st).join(' ');K=await ks();
  check(T==='play closed closed closed closed closed'&&!('lb-ch1-end' in K)&&(await pg.evaluate(()=>document.documentElement.lang))==='fr',tag+' : rechargement : toujours vierge '+T+' '+JSON.stringify(K));
  console.log(tag.padEnd(36),'jauge a 1 s',mid.toFixed(2),'| restent',Object.keys(K).join(' '));await ctx.close()}
 // 3c. fond sonore : trois ambiances graves ; table lue dans le source construit (le hub est dans une fonction : HUB_T n'est pas global)
 {const inBand=f=>f>=50&&f<=500,near=(x,y)=>Math.abs(x-y)<=Math.abs(y)*.001+.005;
  // table : bande utile 50-500 Hz, rien au-dessus de 1,2 kHz, houles de 12 a 20 s, echo long, entree en fondu
  for(const k of ['a','b','c']){const v=HT.beds[k],fr=v.notes.map(n=>n[0]).concat(v.air.f,v.spark?v.spark.f:[],v.echo.damp),tag='table fond '+k;
   check(fr.every(inBand),tag+' : frequences hors de la bande 50-500 Hz '+fr.filter(f=>!inBand(f)));
   check(v.hp>=50&&v.lp.lo>=50&&v.lp.hi<=1200&&v.lp.lo<v.lp.hi&&v.lp.period>=12,tag+' : passe-bas / passe-haut '+JSON.stringify([v.hp,v.lp]));
   const per=[v.swell.all.period].concat(v.swell.periods);check(per.every(x=>x>=12&&x<=20)&&v.swell.depth>0&&v.swell.all.depth>0,tag+' : houles de 12 a 20 s '+per);
   check(v.echo.t>=1&&v.echo.fb>0&&v.echo.fb<.7&&v.fade>=5,tag+' : ecart long, retroaction, fondu '+JSON.stringify([v.echo,v.fade]));
   check(v.notes.length>=2&&(k!=='a'||(v.detune.length>=2&&v.detune.length<=3)),tag+' : notes / voix desaccordees');
   console.log(tag.padEnd(36),'notes',v.notes.map(n=>n[0]).join(' '),'| passe-bas',v.lp.lo+'-'+v.lp.hi,'| houles',per.join(' '))}
  check(HT.beds.a.notes.length===3&&Math.abs(HT.beds.a.notes[1][0]/HT.beds.a.notes[0][0]-1.5)<.01,'table fond a : quinte ouverte');
  // b : bourdon du premier jet (55 / 82,41 / 110,2 Hz ; .07 / .045 / .025) a -4 dB, plus un partiel (octave de 82,41)
  {const nb=HT.beds.b.notes,F0=[[55,.07],[82.41,.045],[110.2,.025]],g=Math.pow(10,-4/20);
   check(F0.every(([f,v],i)=>near(nb[i][0],f)&&Math.abs(nb[i][1]/(v*g)-1)<.02),'table fond b : bourdon du premier jet a -4 dB '+JSON.stringify(nb));
   check(nb.length>=4&&near(nb[3][0],82.41*2),'table fond b : second partiel '+JSON.stringify(nb[3]))}
  // cloches inchangees : table et hauteurs
  const BELL={dur:3.6,vol:.07,partials:[[1,1,1],[2.0,.5,.7],[2.76,.32,.5],[4.07,.18,.35],[5.4,.1,.25]]};
  check(JSON.stringify(HT.bell)===JSON.stringify(BELL)&&JSON.stringify(HC.map(c=>c.bell))==='[392,329.63,293.66]','cloches : table changee '+JSON.stringify([HT.bell,HC.map(c=>c.bell)]));
  {const {ctx,pg}=await open(b,{keys:{'lb-ch1-end':'1'},lit:'[]',tag:'cloche'});await pg.click('#gateBtn');await pg.waitForTimeout(1500);
   const f=await pg.evaluate(()=>window.__oscs.map(o=>o.frequency.value));
   check(BELL.partials.every(([k])=>f.some(x=>near(x,392*k))),'cloches : hauteurs jouees '+f.filter(x=>x>=20).map(Math.round));
   check(f.filter(x=>x>=20&&x>500).length===BELL.partials.filter(([k])=>392*k>500).length,'cloches : seules les cloches depassent 500 Hz '+f.filter(x=>x>500).map(Math.round));await ctx.close()}
  // a l'ecoute : oscillateurs, filtres et retard reellement crees ; sans ?bed (ou valeur inconnue) : a
  const pages=[];for(const bd of ['a','b','c','z']){const r=await open(b,{q:bd==='z'?'?bed=z':'?bed='+bd,tag:'fond '+bd});await r.pg.click('#gateBtn');pages.push([bd,r])}
  await pages[0][1].pg.waitForTimeout(9500);const got={};
  for(const [bd,{ctx,pg}] of pages){const A=await pg.evaluate(()=>({f:window.__oscs.map(o=>o.frequency.value),flt:window.__flt.map(f=>[f.type,f.frequency.value]),dl:window.__dl}));
   const aud=A.f.filter(f=>f>=20),lfo=A.f.filter(f=>f<20),v=HT.beds[bd==='z'?'a':bd];got[bd]=aud.slice().sort((x,y)=>x-y).join();
   check(aud.length>=v.notes.length&&aud.every(inBand),'fond '+bd+' : composantes audibles hors bande '+JSON.stringify(aud));
   check(v.notes.every(n=>aud.some(f=>near(f,n[0]))),'fond '+bd+' : notes de la table jouees '+JSON.stringify(aud));
   check(A.flt.filter(f=>f[0]==='highpass').every(f=>f[1]>=50)&&A.flt.filter(f=>f[0]==='lowpass').every(f=>f[1]<=1200)&&A.flt.some(f=>f[0]==='highpass')&&A.flt.some(f=>f[0]==='lowpass'),'fond '+bd+' : filtres '+JSON.stringify(A.flt));
   check(lfo.length>=v.notes.length+3&&lfo.every(f=>f>=1/40-1e-6&&f<=1/12+1e-6),'fond '+bd+' : houles et balayage lents '+JSON.stringify(lfo));
   check(A.dl>=1,'fond '+bd+' : ecart a retroaction cree ('+A.dl+')');
   console.log(('fond sonore '+bd).padEnd(36),'audibles',aud.map(Math.round).join(' '),'| lents',lfo.map(f=>(1/f).toFixed(0)+'s').join(' '));await ctx.close()}
  check(got.z===got.a,'fond : valeur ?bed inconnue = a');}
 // 4. tailles, rotation
 const SZ=[[375,667,true],[390,844,true],[844,390,true],[1280,720,false],[1920,1080,false]];
 const geo=pg=>pg.evaluate(()=>{const r=e=>{const q=e.getBoundingClientRect();return[q.left,q.top,q.width,q.height]},vis=e=>!e.hidden&&getComputedStyle(e).display!=='none'&&e.getClientRects().length>0;
  const W=innerWidth,H=innerHeight,out=[],small=[],ov=[];
  const ctl=[...document.querySelectorAll('.tw:not(:disabled),#langs button,#setBtn,#hcGo,#gateBtn')].filter(vis);
  for(const e of ctl){const q=r(e);if(q[2]<48||q[3]<48)small.push((e.id||'tw'+e.dataset.n)+' '+q.map(Math.round))}
  for(const e of [...ctl,...document.querySelectorAll('.tw .dot,#brand,.hfoot,#ver,#hcard,#core,#setBtn')].filter(vis)){const q=r(e);if(q[0]<-.5||q[1]<-.5||q[0]+q[2]>W+.5||q[1]+q[3]>H+.5)out.push((e.id||e.className)+' '+q.map(Math.round))}
  const hb=document.getElementById('brand').getBoundingClientRect(),fb=document.querySelector('.hfoot').getBoundingClientRect();
  for(const d of document.querySelectorAll('.tw .dot')){const q=d.getBoundingClientRect();if(q.top<hb.bottom||q.bottom>fb.top)ov.push('tour '+d.parentNode.dataset.n+' '+[q.top,q.bottom].map(Math.round))}
  // titre centre entre le haut de l'ecran (zone sure : 0 ici) et le haut de la tour I ; version au coin bas droit, a la hauteur des langues
  const t1=document.querySelector('.tw[data-n="1"] .dot').getBoundingClientRect(),tc=(hb.top+hb.bottom)/2,vr=document.getElementById('ver').getBoundingClientRect(),lg=document.getElementById('langs').getBoundingClientRect();
  const title=Math.abs(tc-t1.top/2),ver=[W-vr.right,Math.abs((vr.top+vr.bottom)/2-(lg.top+lg.bottom)/2)];
  // meme axe vertical : le titre (texte seul, sans l'espace de lettre apres la derniere lettre) et la figure (son centre, celui du point central)
  const rg=document.createRange();rg.selectNodeContents(document.getElementById('brand'));const tr=rg.getBoundingClientRect(),ls=parseFloat(getComputedStyle(document.getElementById('brand')).letterSpacing)||0,
   fb2=document.getElementById('fig').getBoundingClientRect(),cb=document.getElementById('core').getBoundingClientRect(),
   axis=Math.max(Math.abs((tr.left+tr.right-ls)/2-(fb2.left+fb2.right)/2),Math.abs((tr.left+tr.right-ls)/2-(cb.left+cb.right)/2));
  const s=document.documentElement;return{small,out,ov,title,axis,ver,scroll:[s.scrollWidth>W,s.scrollHeight>H],fig:Math.round(document.getElementById('fig').getBoundingClientRect().width)}});
 const judge=(tag,G)=>{check(G.title<=2,tag+' : titre pas centre ('+G.title.toFixed(1)+' px)');check(G.axis<=2,tag+' : titre et figure pas sur le meme axe ('+G.axis.toFixed(1)+' px)');check(G.ver[0]<=HUB_PAD+2&&G.ver[1]<=2,tag+' : version '+G.ver.map(v=>v.toFixed(1)));
  check(!G.small.length,tag+' : zones < 48 px '+G.small);check(!G.out.length,tag+' : hors ecran '+G.out);check(!G.ov.length,tag+' : figure sur le titre ou le bas '+G.ov);check(!G.scroll[0]&&!G.scroll[1],tag+' : defilement '+G.scroll)};
 for(const [w,h,touch] of SZ)for(const lang of ['fr','en']){const tag=w+'x'+h+' '+lang,{ctx,pg}=await open(b,{vp:{width:w,height:h},touch,lang,keys:{'lb-ch1-end':'1','lb-ch2-end':'1'},lit:'[1,2]',tag});
  judge(tag+' demarrage',await geo(pg));
  if(touch)await pg.tap('#gateBtn');else await pg.click('#gateBtn');await pg.waitForTimeout(100);const G=await geo(pg);judge(tag,G);
  if(touch)await pg.tap('.tw[data-n="2"]');else await pg.click('.tw[data-n="2"]');await pg.waitForTimeout(80);
  check((await cardInfo(pg)).open,tag+' : toucher ouvre la carte');const GC=await geo(pg);judge(tag+' carte',GC);cardOk(tag+' tour II',await cardGeo(pg),2);
  const c2=await pg.evaluate(()=>{const r=document.getElementById('hcard').getBoundingClientRect();return[r.left,r.top]});
  if(touch)await pg.tap('.tw[data-n="1"]');else await pg.click('.tw[data-n="1"]');await pg.waitForTimeout(80);const G1=await geo(pg);
  const c1=await pg.evaluate(()=>{const r=document.getElementById('hcard').getBoundingClientRect();return[r.left,r.top]});
  check((await cardInfo(pg)).name==='Ember Bridge',tag+' : autre tour : la carte change');cardOk(tag+' tour I',await cardGeo(pg),1);judge(tag+' carte I',G1);
  check(c1[0]!==c2[0]||c1[1]!==c2[1],tag+' : toucher une autre tour deplace la carte '+c2+' -> '+c1);
  // le fond ferme la carte, Echap aussi
  await pg.mouse.click(3,Math.round(h/2));await pg.waitForTimeout(60);check(!(await cardInfo(pg)).open&&await pg.evaluate(()=>!document.querySelector('.tw.sel')),tag+' : toucher le fond ferme la carte');
  if(touch)await pg.tap('.tw[data-n="2"]');else await pg.click('.tw[data-n="2"]');await pg.waitForTimeout(60);await pg.keyboard.press('Escape');await pg.waitForTimeout(60);
  check(!(await cardInfo(pg)).open,tag+' : Echap ferme la carte');
  if(touch)await pg.tap('.tw[data-n="1"]');else await pg.click('.tw[data-n="1"]');await pg.waitForTimeout(80);
  if(w===390&&lang==='fr'){for(const [rw,rh] of [[844,390],[390,844]]){await pg.setViewportSize({width:rw,height:rh});await pg.waitForTimeout(150);judge(tag+' rotation '+rw+'x'+rh,await geo(pg))}
   check((await cardInfo(pg)).open,tag+' : carte gardee a la rotation')}
  console.log(tag.padEnd(30),'figure',G.fig,'px');await ctx.close()}
 // 4b. les six tours : copie temporaire du hub (six chapitres, toutes les tours ouvertes) ; la carte de chacune, a chaque taille
 {const src=fs.readFileSync(path.resolve(__dirname,'../site/index.html'),'utf8'),A3="{n:3,title:'Hollow Roots',soon:true,bell:293.66}",
   six=src.replace(A3,A3+",{n:4,title:'Test Four',soon:true,bell:293.66},{n:5,title:'Test Five',soon:true,bell:293.66},{n:6,title:'Test Six',soon:true,bell:293.66}").replace("prev=st[n]==='done'","prev=true"),
   f=null;
  check(six!==src&&six.includes('prev=true')&&six.includes("{n:6,title:'Test Six'"),'six tours : copie de test non construite');SIX=six;
  try{for(const [w,h,touch] of SZ)for(const lang of ['fr','en']){const tag='six tours '+w+'x'+h+' '+lang,{ctx,pg}=await open(b,{vp:{width:w,height:h},touch,lang,url:BASE+'/__six.html',tag});
    if(touch)await pg.tap('#gateBtn');else await pg.click('#gateBtn');await pg.waitForTimeout(100);const sides=[];
    for(let n=1;n<=6;n++){if(touch)await pg.tap('.tw[data-n="'+n+'"]');else await pg.click('.tw[data-n="'+n+'"]');await pg.waitForTimeout(40);const G=await cardGeo(pg);cardOk(tag+' tour '+n,G,n);sides.push(G.up?'^':'v')}
    console.log(tag.padEnd(30),'carte (v dessous, ^ dessus) :',sides.join(' '));await ctx.close()}}
  finally{SIX=''}}
 console.log('errs',errs);await b.close();server.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
