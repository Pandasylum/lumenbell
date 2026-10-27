// Lance Chromium : PW_CHROMIUM=/chemin/vers/chromium pour utiliser un navigateur precis (sinon celui de Playwright).
const { chromium } = require('playwright');
module.exports = () => chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
