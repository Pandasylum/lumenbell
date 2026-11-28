/* ---------- boot ---------- */
buildStatic();
newGame();
hud();
el.ov.hidden=true;
showMenu(false);
/* écran de démarrage : un clic obligatoire, qui débloque le son et lance la musique du menu */

/* accès par URL : ?fin=1 lance directement la cinématique de fin (aucun écran, texte ni sauvegarde) */
if((()=>{try{return new URLSearchParams(location.search).get('fin')==='1'}catch(e){return false}})())apercuFin();
