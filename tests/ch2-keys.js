// Chapitre II : cles de sauvegarde communes lb-* et migration des anciennes (pn-, db-, eb-lang du Chapitre I).
// Langue par defaut : celle de l'appareil (locale du contexte), sinon anglais (decision du 28 octobre, commune a la serie).
// Chaque cas : localStorage pose avant le chargement, puis lecture de l'etat (langue, options, frise, cles).
// UNLOCK_ALL=true dans le jeu : frise toujours ouverte (000). Les cas marques off tournent sur une copie avec UNLOCK_ALL=false
// (build/out/ch2-unlock-off.html) pour verifier que le deblocage progressif (lb-ch2-unl) marche encore.
// Hors ligne. Sortie attendue : errs []
const fs=require('fs'),path=require('path');const launch=require('./launch');
const FILE=path.resolve(__dirname,'../site/ch2/index.html');
const OFF=path.resolve(__dirname,'../build/out/ch2-unlock-off.html');
{const h=fs.readFileSync(FILE,'utf8'),a='const UNLOCK_ALL=true;';if(h.split(a).length!==2)throw new Error('UNLOCK_ALL introuvable');fs.mkdirSync(path.dirname(OFF),{recursive:true});fs.writeFileSync(OFF,h.replace(a,'const UNLOCK_ALL=false;'))}
const errs=[];
const CASES=[
 {nom:'anciennes cles seules',set:{'pn-lang':'en','db-optSnd':'0','db-optMus':'0','db-optHelp':'1','db-unl':'2','db-best-tn':'123.5'},
  want:{lang:'en',snd:false,mus:false,help:true,locked:'000'},
  keys:{'lb-lang':'en','lb-snd':'0','lb-mus':'0','lb-help':'1','lb-ch2-unl':'2','lb-ch2-best-tn':'123.5','pn-lang':'en','db-unl':'2'}},
 {nom:'nouvelles cles prioritaires',set:{'lb-lang':'fr','pn-lang':'en','eb-lang':'en','lb-ch2-unl':'3','db-unl':'1','lb-snd':'1','db-optSnd':'0'},
  want:{lang:'fr',snd:true,locked:'000'},keys:{'lb-lang':'fr','lb-ch2-unl':'3','lb-snd':'1'}},
 {nom:'langue du Chapitre I (eb-lang)',set:{'eb-lang':'en'},want:{lang:'en'},keys:{'lb-lang':'en','eb-lang':'en'}},
 {nom:'pn-lang avant eb-lang',set:{'pn-lang':'fr','eb-lang':'en'},want:{lang:'fr'},keys:{'lb-lang':'fr'}},
 {nom:'aucune cle, appareil en francais',locale:'fr-FR',set:{},want:{lang:'fr',snd:true,mus:true,help:false,locked:'000'},keys:{'lb-lang':null,'lb-ch2-unl':null}},
 {nom:'aucune cle, appareil en anglais',locale:'en-US',set:{},want:{lang:'en'},keys:{'lb-lang':null}},
 {nom:'aucune cle, autre langue',locale:'de-DE',set:{},want:{lang:'en'},keys:{'lb-lang':null}},
 {nom:'off : aucune cle',off:1,set:{},want:{locked:'011'},keys:{'lb-ch2-unl':null}},
 {nom:'off : db-unl=2 migre',off:1,set:{'db-unl':'2'},want:{locked:'001'},keys:{'lb-ch2-unl':'2'}},
 {nom:'off : lb-ch2-unl=3',off:1,set:{'lb-ch2-unl':'3'},want:{locked:'000'},keys:{'lb-ch2-unl':'3'}},
];
(async()=>{const b=await launch();
for(const c of CASES){
 const ctx=await b.newContext({viewport:{width:1100,height:760},offline:true,locale:c.locale||'en-US'});
 await ctx.addInitScript(o=>{if(sessionStorage.getItem('__init'))return;sessionStorage.setItem('__init','1');localStorage.clear();for(const k in o)localStorage.setItem(k,o[k])},c.set);
 const pg=await ctx.newPage();
 pg.on('pageerror',e=>errs.push(c.nom+': pageerror: '+e.message));
 pg.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))errs.push(c.nom+': reseau: '+r.url())});
 await pg.goto('file://'+(c.off?OFF:FILE));await pg.waitForTimeout(300);
 const st=await pg.evaluate(ks=>({lang:document.documentElement.lang,snd:((id)=>{const g=document.getElementById('mGear');g.click();const q=s=>document.querySelector('#lbSet [data-id='+id+'] '+s),b=q('button[aria-pressed=true]'),d=q('button').disabled;g.click();return{on:!!b&&b.dataset.v==='true',dis:d}})('snd').on,mus:((id)=>{const g=document.getElementById('mGear');g.click();const q=s=>document.querySelector('#lbSet [data-id='+id+'] '+s),b=q('button[aria-pressed=true]'),d=q('button').disabled;g.click();return{on:!!b&&b.dataset.v==='true',dis:d}})('mus').on,help:((id)=>{const g=document.getElementById('mGear');g.click();const q=s=>document.querySelector('#lbSet [data-id='+id+'] '+s),b=q('button[aria-pressed=true]'),d=q('button').disabled;g.click();return{on:!!b&&b.dataset.v==='true',dis:d}})('help').on,
  locked:[...document.querySelectorAll('#phases button')].map(x=>x.disabled?1:0).join(''),
  keys:Object.fromEntries(ks.map(k=>[k,localStorage.getItem(k)]))}),Object.keys(c.keys));
 for(const k in c.want)if(st[k]!==c.want[k])errs.push(c.nom+': '+k+' = '+st[k]+' au lieu de '+c.want[k]);
 for(const k in c.keys)if(st.keys[k]!==c.keys[k])errs.push(c.nom+': cle '+k+' = '+st.keys[k]+' au lieu de '+c.keys[k]);
 console.log(c.nom,JSON.stringify(st));
 await ctx.close()}
// ecriture : le choix de langue et les options vont dans les cles lb-*, jamais dans les anciennes
{const ctx=await b.newContext({offline:true});const pg=await ctx.newPage();await pg.goto('file://'+FILE);await pg.waitForTimeout(300);
 await pg.click('#langs button[data-lang=en]');await pg.evaluate(()=>{const s=((id,v)=>{const g=document.getElementById('mGear');g.click();document.querySelector('#lbSet [data-id='+id+'] [data-v='+v+']').click();g.click()});s('mus',false);s('help',true)});
 const k=await pg.evaluate(()=>({...localStorage}));console.log('ecriture',JSON.stringify(k));
 if(k['lb-lang']!=='en'||k['lb-mus']!=='0'||k['lb-help']!=='1')errs.push('ecriture: cles lb-* non ecrites');
 if(Object.keys(k).some(x=>/^(pn|db|eb)-/.test(x)))errs.push('ecriture: ancienne cle ecrite');
 await ctx.close()}
console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)})
