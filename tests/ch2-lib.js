// Outils communs aux tests du Chapitre II (Silent Bells).
// - script(html) : le contenu de l'unique <script> du fichier
// - calls(code)  : liste des appels _(en, fr), imbriques compris, dans l'ordre d'apparition ([arg1, arg2] bruts)
// - lit(a)       : valeur d'un argument s'il est une chaine litterale simple (sinon null)
// - testPage()   : copie de test de dist/index.html (build/out/ch2-test.html) avec crochets window.__t et sans
//                  boucle requestAnimationFrame : le test fait avancer le temps lui-meme (pas fixe). Le dist publie
//                  n'a aucun crochet ; seule cette copie, non suivie par git, en a. Le prologue et l'epilogue (LB.cine) y passent
//                  en mode manuel (LB.cine.manual) : step(dt, dessiner) les fait avancer au meme pas que le jeu.
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const DIST=process.env.CH2_DIST||path.join(ROOT,'chapters/ch2-silent-bells/dist/index.html');   // CH2_DIST=<fichier> : comparer avec un autre dist (avant / apres)
function script(h){const m=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];if(m.length!==1)throw new Error('scripts: '+m.length);return m[0][1]}
function calls(code){const out=[];const re=/(?<![\w$.])_\(/g;let m;
 const parse=i=>{const args=[];let d=0,st=i;
  for(;;){const c=code[i];
   if(c==="'"||c==='"'||c==='`'){const q=c;i++;while(code[i]!==q){if(code[i]==='\\')i++;i++}i++;continue}
   if('([{'.includes(c))d++;
   else if(')]}'.includes(c)){if(!d){args.push(code.slice(st,i).trim());return args}d--}
   else if(c===','&&!d){args.push(code.slice(st,i).trim());st=i+1}
   i++}};
 while((m=re.exec(code))){out.push({args:parse(m.index+2),at:m.index})}
 return out}
function lit(a){if(!/^(['"`])[\s\S]*\1$/.test(a)||(a[0]==='`'&&a.includes('${')))return null;try{return Function('return '+a)()}catch(e){return null}}
const END='S.d=DIFFS.normal;S.phase=2;applyLang();requestAnimationFrame(loop);';
const HOOK='S.d=DIFFS.normal;S.phase=2;applyLang();if(LB.cine)LB.cine.manual=true;\n'+  
 'window.__t={LB,get S(){return S},get gt(){return gt},DIFFS,CINE_LEN,PRO_TITLE,down,up,startRun,jumpPhase,SHOCK,MUSIC,sfx,damageBoss,success,HULL,CINE_P3,ONO,'+
 'PRO:typeof PRO!=="undefined"?PRO:null,EPI:typeof EPI!=="undefined"?EPI:null,'+
 'playPrologue,playEpilogue,deathCard:typeof deathCard!=="undefined"?deathCard:null,go(){if(typeof onGo!=="undefined"){onGo&&onGo()}else LB.card.go()},step(dt,drawIt){rt+=dt;if(!S.paused&&["play","ko","dead","cine","prologue","epilogue"].includes(S.mode))gt+=dt;'+
 'update(dt);gameUpdate(dt);if(drawIt){ctx=ctxMain;SC=SCm;draw()}if(LB.cine)LB.cine.step(dt,!!drawIt)}};';
function testPage(){const h=fs.readFileSync(DIST,'utf8');if(h.split(END).length!==2)throw new Error('fin du script introuvable dans dist');
 const out=process.env.CH2_TEST_OUT||path.join(ROOT,'build/out/ch2-test.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,h.replace(END,HOOK));return out}
// Textes valides du cahier des charges (docs/CH2-SPEC.md), mot pour mot : phrases entre « » de la section francaise et
// entre " " de la section anglaise (meme ordre), hors ligne « À supprimer » ; titres de phase et noms de boss (listes ci-dessous,
// recopiees du cahier des charges, qui les donne hors guillemets).
const TITLES=[['Phase I · The Mirror Hall','Phase I · La salle des reflets'],['Phase II · The Hold','Phase II · La cale'],['Phase III · The Reefs','Phase III · Les récifs']];
const BOSSES=[['The Hollow Voice','La Voix Creuse'],['The Rust Elder',"L'Ancien de Rouille"],['The Drowned Lighthouse','Le Phare Noyé'],['The Bottomless','La Sans-Fond']];
function specTexts(){const md=fs.readFileSync(path.join(ROOT,'docs/CH2-SPEC.md'),'utf8');
 const sec=(a,b)=>{const i=md.indexOf(a),j=md.indexOf(b,i);if(i<0||j<0)throw new Error('section introuvable: '+a);return md.slice(i,j)};
 const fr=sec('## Textes validés (français','## Textes validés (anglais)').split('\n').filter(l=>!l.startsWith('À supprimer')).join('\n');
 const en=sec('## Textes validés (anglais)','## Code couleur');
 const F=[...fr.matchAll(/«\s*([^»]+?)\s*»/g)].map(m=>m[1]),E=[...en.matchAll(/"([^"]+)"/g)].map(m=>m[1]);
 if(F.length!==E.length)throw new Error('cahier des charges : '+F.length+' textes FR, '+E.length+' EN');
 return{pairs:F.map((f,i)=>[E[i],f]),titles:TITLES,bosses:BOSSES,
  removed:[...md.match(/^À supprimer.*$/m)[0].matchAll(/«\s*([^»]+?)\s*»/g)].map(m=>m[1]),
  // mot grave en clair sur la cloche (section « La cloche ») : [EN, FR]
  engraving:(m=>{if(!m)throw new Error('mot grave de la cloche introuvable');return[m[2],m[1]]})(md.match(/le mot \*\*([^*]+)\*\* \(EN : \*\*([^*]+)\*\*\)/))}}
// Mots d'annonce interdits a l'ecran (FR et EN), communs aux deux chapitres : ch2-announce.js, announce.js
const BAN=[/parfait/i,/\bparée?s?\b/i,/esquiv/i,/touché/i,/contré/i,/un reflet/i,/trop tard/i,/frappe\s*!/i,/tiens\s*!/i,/coup de grâce/i,
 /coup double/i,/bloqué/i,/garde brisée/i,/il revient/i,/prépare la garde/i,/riposte/i,/parade/i,
 /\bperfect/i,/parried/i,/\bparry!/i,/dodged/i,/countered/i,/a reflection/i,/too late/i,/strike\s*!/i,/hold\s*!/i,/get ready/i,
 /final blow/i,/double hit/i,/^hit\s*!?$/i,/blocked/i,/guard broken/i,/comes back/i,/×\s*\d/];
const banned=s=>{s=String(s).replace(/\u200a/g,'');return BAN.find(r=>r.test(s))};
module.exports={ROOT,DIST,script,calls,lit,testPage,specTexts,BAN,banned};
