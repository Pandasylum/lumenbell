// Outils communs aux tests du Chapitre II (Silent Bells).
// - script(html) : le contenu de l'unique <script> du fichier
// - calls(code)  : liste des appels _(en, fr), imbriques compris, dans l'ordre d'apparition ([arg1, arg2] bruts)
// - lit(a)       : valeur d'un argument s'il est une chaine litterale simple (sinon null)
// - testPage()   : copie de test de dist/index.html (build/out/ch2-test.html) avec crochets window.__t et sans
//                  boucle requestAnimationFrame : le test fait avancer le temps lui-meme (pas fixe). Le dist publie
//                  n'a aucun crochet ; seule cette copie, non suivie par git, en a.
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const DIST=path.join(ROOT,'chapters/ch2-silent-bells/dist/index.html');
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
const HOOK='S.d=DIFFS.normal;S.phase=2;applyLang();\n'+
 'window.__t={get S(){return S},get gt(){return gt},DIFFS,CINE_LEN,down,up,startRun,jumpPhase,'+
 'go(){onGo&&onGo()},step(dt,drawIt){rt+=dt;if(!S.paused&&["play","ko","dead","cine","prologue","epilogue"].includes(S.mode))gt+=dt;'+
 'update(dt);gameUpdate(dt);if(drawIt){ctx=ctxMain;SC=SCm;draw()}}};';
function testPage(){const h=fs.readFileSync(DIST,'utf8');if(h.split(END).length!==2)throw new Error('fin du script introuvable dans dist');
 const out=path.join(ROOT,'build/out/ch2-test.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,h.replace(END,HOOK));return out}
module.exports={ROOT,DIST,script,calls,lit,testPage};
