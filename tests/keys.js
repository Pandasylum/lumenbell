// Cles de sauvegarde communes aux deux chapitres (shared/js/04-store.js, 08-lang.js), sur les deux dist/index.html.
// - Cles communes lb-lang, lb-snd, lb-mus, lb-help : meme lecture dans les deux chapitres (cases cochees, langue affichee),
//   migration depuis les anciennes (pn-lang puis eb-lang ; db-optSnd, db-optMus, db-optHelp), nouvelle cle prioritaire.
// - Langue par defaut : celle de l'appareil (francais si elle commence par fr, sinon anglais), dans les deux chapitres.
// - Chapitre I : eb-intro, eb-end, eb-best-<mode> migrees vers lb-ch1-intro, lb-ch1-end, lb-ch1-best-<mode> (Epreuve
//   debloquee, bouton Outro, record affiche, intro non rejouee) ; anciennes cles jamais effacees.
// - Ecriture : seulement dans les cles lb-* ; aide memorisee d'une difficulte a l'autre au Chapitre I (coupee la ou elle
//   est masquee, sans toucher a lb-help) ; un choix fait dans un chapitre est vu par l'autre (meme origine file://).
// Les cles propres au Chapitre II (lb-ch2-unl, deblocage) restent dans ch2-keys.js. Hors ligne. Sortie attendue : errs []
const path=require('path');const launch=require('./launch');
const F={ch1:path.resolve(__dirname,'../chapters/ch1-ember-bridge/dist/index.html'),ch2:path.resolve(__dirname,'../chapters/ch2-silent-bells/dist/index.html')};
const errs=[];
// cas communs : memes cles posees, meme etat attendu dans les deux chapitres
const COMMON=[
 {nom:'aucune cle, appareil fr',locale:'fr-FR',set:{},want:{lang:'fr',snd:true,mus:true,help:false},keys:{'lb-lang':null,'lb-snd':null}},
 {nom:'aucune cle, appareil en',locale:'en-GB',set:{},want:{lang:'en'},keys:{'lb-lang':null}},
 {nom:'aucune cle, appareil de',locale:'de-DE',set:{},want:{lang:'en'},keys:{'lb-lang':null}},
 {nom:'eb-lang (Chapitre I)',set:{'eb-lang':'fr'},want:{lang:'fr'},keys:{'lb-lang':'fr','eb-lang':'fr'}},
 {nom:'pn-lang (Chapitre II)',set:{'pn-lang':'fr'},want:{lang:'fr'},keys:{'lb-lang':'fr','pn-lang':'fr'}},
 {nom:'pn-lang avant eb-lang',set:{'pn-lang':'fr','eb-lang':'en'},want:{lang:'fr'},keys:{'lb-lang':'fr'}},
 {nom:'lb-lang prioritaire',locale:'fr-FR',set:{'lb-lang':'en','eb-lang':'fr','pn-lang':'fr'},want:{lang:'en'},keys:{'lb-lang':'en','eb-lang':'fr'}},
 {nom:'options db-opt* migrees',set:{'db-optSnd':'0','db-optMus':'0','db-optHelp':'1'},want:{snd:false,mus:false,help:true},
  keys:{'lb-snd':'0','lb-mus':'0','lb-help':'1','db-optSnd':'0'}},
 {nom:'options lb-* prioritaires',set:{'lb-snd':'1','db-optSnd':'0','lb-mus':'0','lb-help':'0','db-optHelp':'1'},want:{snd:true,mus:false,help:false},
  keys:{'lb-snd':'1','lb-help':'0'}},
];
// cas propres au Chapitre I (anciennes cles eb-*)
const CH1=[
 {nom:'ch1 anciennes cles eb-*',locale:'en-US',set:{'eb-lang':'fr','eb-intro':'1','eb-end':'1','eb-best-tn':'123.4','eb-best-th':'99.5'},
  want:{lang:'fr',trial:'false',outro:true,bestTn:'🏆 2:03.4',bestTh:'🏆 1:39.5'},
  keys:{'lb-lang':'fr','lb-ch1-intro':'1','lb-ch1-end':'1','lb-ch1-best-tn':'123.4','lb-ch1-best-th':'99.5','eb-intro':'1','eb-end':'1','eb-best-tn':'123.4'}},
 {nom:'ch1 nouvelles cles prioritaires',set:{'lb-ch1-end':'1','eb-end':'0','lb-ch1-best-tn':'60','eb-best-tn':'123.4'},
  want:{trial:'false',outro:true,bestTn:'🏆 1:00.0'},keys:{'lb-ch1-best-tn':'60','lb-ch1-end':'1','eb-best-tn':'123.4'}},
 {nom:'ch1 aucune cle',set:{},want:{trial:'true',outro:false},keys:{'lb-ch1-end':null,'lb-ch1-intro':null,'lb-ch1-best-tn':null}},
];
const state=ch=>()=>{const q=s=>document.querySelector(s),o={lang:document.documentElement.lang,snd:q('#optSnd').checked,mus:q('#optMus').checked,help:q('#optHelp').checked};
 if(q('#gate')){const t=q('#mphM [data-diff=trial]');o.trial=t.getAttribute('aria-disabled');o.outro=!q('#outroBtn').hidden;
  const sp=n=>{const e=q('#mphT [data-diff='+n+'] span');return e?e.textContent:null};o.bestTn=sp('tn');o.bestTh=sp('th')}
 return o};
async function open(b,ch,c){const ctx=await b.newContext({viewport:{width:1100,height:760},offline:true,locale:c.locale||'en-US'});
 // cles posees une seule fois par contexte (marque dans localStorage : une 2e page du meme contexte garde l'etat)
 await ctx.addInitScript(o=>{if(localStorage.getItem('__init'))return;localStorage.clear();localStorage.setItem('__init','1');for(const k in o)localStorage.setItem(k,o[k])},c.set||{});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(ch+' '+c.nom+': pageerror: '+e.message));
 pg.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))errs.push(ch+' '+c.nom+': reseau: '+r.url())});
 await pg.goto('file://'+F[ch]);await pg.waitForTimeout(300);return{ctx,pg}}
const check=(tag,st,c)=>{for(const k in c.want)if(st[k]!==c.want[k])errs.push(tag+': '+k+' = '+st[k]+' au lieu de '+c.want[k]);
 for(const k in c.keys)if(st.keys[k]!==c.keys[k])errs.push(tag+': cle '+k+' = '+st.keys[k]+' au lieu de '+c.keys[k])};
(async()=>{const b=await launch();
for(const [ch,c] of [...COMMON.flatMap(c=>[['ch1',c],['ch2',c]]),...CH1.map(c=>['ch1',c])]){
 const {ctx,pg}=await open(b,ch,c);
 const st=await pg.evaluate(state(ch));st.keys=await pg.evaluate(ks=>Object.fromEntries(ks.map(k=>[k,localStorage.getItem(k)])),Object.keys(c.keys));
 check(ch+' '+c.nom,st,c);console.log(ch,c.nom,JSON.stringify(st));
 await ctx.close()}
// Chapitre I : intro deja vue (ancienne cle) -> Normal lance la carte de la phase I sans cinematique
{const c={nom:'intro vue',set:{'eb-intro':'1'}};const {ctx,pg}=await open(b,'ch1',c);
 await pg.click('#gateBtn');await pg.click('#mphM [data-diff=normal]');await pg.waitForTimeout(300);
 const cine=await pg.evaluate(()=>!document.getElementById('cine').hidden);console.log('ch1 intro vue : cinematique',cine);
 if(cine)errs.push('ch1 intro vue (eb-intro) : la cinematique se rejoue');await ctx.close()}
// Chapitre I : aide memorisee d'une difficulte a l'autre ; coupee en Difficile (case masquee) sans toucher a lb-help
{const c={nom:'aide'};const {ctx,pg}=await open(b,'ch1',c);
 await pg.click('#gateBtn');await pg.evaluate(()=>document.getElementById('optHelp').click());
 const r=[];for(const d of ['easy','hard','normal']){await pg.evaluate(()=>{const m=document.getElementById('menuBtn');if(m&&m.offsetParent)m.click()});
  await pg.evaluate(d=>document.querySelector('#mphM [data-diff='+d+']').click(),d);await pg.waitForTimeout(200);
  r.push(await pg.evaluate(()=>({help:document.getElementById('optHelp').checked,hidden:document.getElementById('optHelp').closest('label').hidden,key:localStorage.getItem('lb-help')})))}
 console.log('ch1 aide',JSON.stringify(r));
 const want=[{help:true,hidden:false,key:'1'},{help:false,hidden:true,key:'1'},{help:true,hidden:false,key:'1'}];
 if(JSON.stringify(r)!==JSON.stringify(want))errs.push('ch1 aide : '+JSON.stringify(r)+' au lieu de '+JSON.stringify(want));await ctx.close()}
// Ecriture dans chaque chapitre : cles lb-* seulement ; puis l'autre chapitre (meme origine file://) relit le choix
for(const [ch,other] of [['ch1','ch2'],['ch2','ch1']]){
 const c={nom:'ecriture',locale:'fr-FR'};const {ctx,pg}=await open(b,ch,c);
 if(ch==='ch1')await pg.click('#gateBtn');
 await pg.click('#langs button[data-lang=en]');await pg.evaluate(()=>{optSnd.click();optMus.click();optHelp.click()});
 const k=await pg.evaluate(()=>{const o={...localStorage};delete o.__init;return o});console.log(ch,'ecriture',JSON.stringify(k));
 if(k['lb-lang']!=='en'||k['lb-snd']!=='0'||k['lb-mus']!=='0'||k['lb-help']!=='1')errs.push(ch+' ecriture : cles lb-* non ecrites');
 if(Object.keys(k).some(x=>/^(pn|db|eb)-/.test(x)))errs.push(ch+' ecriture : ancienne cle ecrite');
 const p2=await ctx.newPage();p2.on('pageerror',e=>errs.push(other+' relecture: pageerror: '+e.message));
 await p2.goto('file://'+F[other]);await p2.waitForTimeout(300);
 const st=await p2.evaluate(state(other));console.log(other,'relit',JSON.stringify(st));
 for(const [kk,v] of Object.entries({lang:'en',snd:false,mus:false,help:true}))if(st[kk]!==v)errs.push(other+' relit le choix de '+ch+' : '+kk+' = '+st[kk]);
 await ctx.close()}
console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)})
