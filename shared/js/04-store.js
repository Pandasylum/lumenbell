/* ---------- sauvegarde : clés lb-… ----------
   Clés communes à la série : lb-<nom> pour les noms de COMMON ; propres à un chapitre : lb-<id>-<nom> (LB.key).
   LB.store.get lit la nouvelle clé, sinon les anciennes dans l'ordre (OLD_KEYS communes, puis celles du chapitre, puis
   les préfixes du chapitre) et recopie la première trouvée dans la nouvelle. Les anciennes clés ne sont jamais effacées ni écrites. */
LB.COMMON=['lang','snd','mus','help'];
LB.OLD_KEYS={'lb-lang':['pn-lang','eb-lang'],'lb-snd':['db-optSnd'],'lb-mus':['db-optMus'],'lb-help':['db-optHelp']};
LB.id='';LB.old={};LB.oldPrefix=[];
LB.key=name=>LB.COMMON.includes(name)?'lb-'+name:'lb-'+LB.id+'-'+name;
LB.oldKeys=k=>{const o=(LB.OLD_KEYS[k]||[]).concat(LB.old[k]||[]);
  for(const [n,a] of LB.oldPrefix)if(k.startsWith(n))o.push(a+k.slice(n.length));return o};
LB.store={get(k,d){try{let v=localStorage.getItem(k);
  if(v==null)for(const o of LB.oldKeys(k)){v=localStorage.getItem(o);if(v!=null){try{localStorage.setItem(k,v)}catch(e){}break}}
  return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* À appeler en tête du chapitre, avant toute lecture : id (préfixe lb-<id>-), old ({nouvelle clé:[anciennes]}),
   oldPrefix ([[début de la nouvelle clé, début de l'ancienne]], pour les records). Migre au démarrage toutes les clés
   connues (et chaque ancienne clé à préfixe présente), puis fixe la langue. */
LB.setup=({id,old={},oldPrefix=[],audio})=>{LB.id=id;LB.old=old;LB.oldPrefix=oldPrefix;
  try{const ks=[];for(let i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));
    const want=Object.keys(LB.OLD_KEYS).concat(Object.keys(old));
    for(const [n,a] of oldPrefix)ks.filter(k=>k.startsWith(a)).forEach(k=>want.push(n+k.slice(a.length)));
    want.forEach(k=>LB.store.get(k))}catch(e){}
  LB.lang.init();LB.audio.config(audio);LB.audio.load()};
