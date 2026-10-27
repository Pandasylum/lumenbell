// Chapitre II : textes. Sans navigateur. Sortie attendue : errs []
// 1. definition _(en, fr) dans le dist ;
// 2. liste de reference : tous les appels _(en, fr) du dist, dans l'ordre, doivent redonner exactement
//    chapters/ch2-silent-bells/TEXTES.md (tableau lisible, relu et valide). Apres un changement de texte voulu :
//    node tests/ch2-texts.js --write, relire le diff de TEXTES.md, committer avec la source ;
// 3. FR et EN identiques en structure (chaine vide des deux cotes ou d'aucun, meme nombre de phrases,
//    de « · » et de « … », meme ponctuation finale) ;
// 4. cahier des charges (docs/CH2-SPEC.md) : chaque texte valide (intro, panneaux, forme II, outro), chaque titre de phase et
//    chaque nom de boss est un appel _(en, fr) du dist, mot pour mot ; les textes « À supprimer » et les anciens noms
//    (galerie, fonderie, lac gele, Ember Bridge · Chapitre II, modes d'emploi...) n'apparaissent plus dans aucun texte.
const fs=require('fs'),path=require('path');const {ROOT,DIST,script,calls,lit,specTexts}=require('./ch2-lib');
const REF=path.join(ROOT,'chapters/ch2-silent-bells/TEXTES.md');
const errs=[];
const code=script(fs.readFileSync(DIST,'utf8'));
if(!/const _=\(en,fr\)=>LANG==='fr'\?fr:en;/.test(code))errs.push('definition _(en,fr) absente du dist');
const C=calls(code);
for(const c of C)if(c.args.length!==2)errs.push('appel a '+c.args.length+' arguments: '+code.slice(c.at,c.at+60));
const cell=a=>{const v=lit(a);return v===null?'`'+a.replace(/`/g,"'")+'`':v===''?'*(vide)*':v.replace(/\|/g,'\\|').replace(/\n/g,' ')};
const md='# Textes du Chapitre II (EN / FR)\n\n'+
 'Genere par `node tests/ch2-texts.js --write` depuis `chapters/ch2-silent-bells/dist/index.html` : tous les appels `_(en, fr)`, dans l\'ordre du script. '+
 '`tests/ch2-texts.js` echoue si le jeu ne redonne pas exactement ce fichier. Texte en `code` : argument calcule (pas une chaine simple). '+
 'Les onomatopees (identiques dans les deux langues) ne passent pas par `_()`.\n\n'+
 '| # | Anglais | Français |\n|---|---|---|\n'+C.map((c,i)=>'| '+(i+1)+' | '+cell(c.args[0])+' | '+cell(c.args[1])+' |').join('\n')+'\n';
if(process.argv.includes('--write')){fs.writeFileSync(REF,md);console.log('ecrit',path.relative(ROOT,REF),C.length,'couples')}
else{const ref=fs.existsSync(REF)?fs.readFileSync(REF,'utf8'):'';
 if(ref!==md){const a=ref.split('\n'),b=md.split('\n');let n=0;
  for(let i=0;i<Math.max(a.length,b.length)&&n<12;i++)if(a[i]!==b[i]){errs.push('TEXTES.md ligne '+(i+1)+': attendu '+JSON.stringify(a[i])+' ; dist '+JSON.stringify(b[i]));n++}}}
// structure FR / EN
const shape=s=>{const t=s.replace(/[\s  »”"']+$/,'');return{empty:!s.trim(),dots:(s.match(/·/g)||[]).length,ell:(s.match(/…/g)||[]).length,
 sent:(t.match(/[.!?…](?=\s|$)/g)||[]).length,end:(t.match(/[.!?…:]$/)||[''])[0]}};
let nLit=0;
for(const c of C){const en=lit(c.args[0]),fr=lit(c.args[1]);if(en===null||fr===null)continue;nLit++;
 const a=shape(en),b=shape(fr);
 for(const k of ['empty','dots','ell','sent','end'])if(a[k]!==b[k]){errs.push('structure ('+k+'): '+JSON.stringify(en)+' / '+JSON.stringify(fr));break}}
// cahier des charges
{const sp=specTexts(),have=new Set(C.map(c=>JSON.stringify([lit(c.args[0]),lit(c.args[1])])));
 const need=[...sp.pairs,...sp.titles,...sp.bosses];
 for(const pr of need)if(!have.has(JSON.stringify(pr)))errs.push('cahier des charges : couple absent '+JSON.stringify(pr));
 const OLD=[...sp.removed,"n’est plus le Roi","no longer the King",'Silence the toll','Do not trust your eyes','Put out the beacon',
  'galerie','Gallery','fonderie','Foundry','lac gelé','Frozen Lake','marais','marsh','Marsh of Bells','bâton','staff','Ember Bridge',
  'fondu leurs cloches','melted their bells','Le bouton','The button','MAINTIENS','TOUCHE ','HOLD the','TAP ','Mêmes commandes','Same controls',
  'Forme II','Form II','Les étoiles se rallument','stars shine again','Respire, observe','read the tells'];
 // tout en capitales (MAINTIENS, TAP...) : casse exacte ; sinon sans tenir compte de la casse
 const has=(v,o)=>o===o.toUpperCase()?v.includes(o):v.toLowerCase().includes(o.toLowerCase());
 const html=fs.readFileSync(DIST,'utf8'),page=html.slice(html.indexOf('<body>'),html.indexOf('<script>'));
 for(const c of C)for(const a of c.args){const v=lit(a);if(v===null)continue;for(const o of OLD)if(has(v,o))errs.push('texte retire encore present ('+o+') : '+JSON.stringify(v))}
 for(const o of OLD)if(has(page.replace(/<[^>]*>/g,' '),o))errs.push('texte retire encore present dans la page ('+o+')');
 console.log('cahier des charges :',sp.pairs.length,'textes,',sp.titles.length,'titres,',sp.bosses.length,'noms ;',OLD.length,'textes retires controles')}
console.log('couples',C.length,'dont',nLit,'litteraux ; reference',path.relative(ROOT,REF));
console.log('errs',errs);process.exitCode=errs.length?1:0;
