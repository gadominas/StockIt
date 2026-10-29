// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: download;

// Installs or updates "Stockit" from GitHub. Run it again any time to update.
// Your stocks, settings and keys are stored separately and are kept.
const URL = 'https://raw.githubusercontent.com/gadominas/StockIt/main/Stockit.js';
const NAME = 'Stockit';

const req = new Request(URL + '?t=' + Date.now());
req.timeoutInterval = 30;
let code = '';
try { code = await req.loadString(); } catch (e) { code = ''; }
if (!req.response || req.response.statusCode !== 200 || !code.includes("const APP_ID = 'stockit'")) {
  const a = new Alert();
  a.title = 'Download failed';
  a.message = `Could not download Stockit (HTTP ${req.response ? req.response.statusCode : '?'}). Check your connection and try again.`;
  a.addAction('OK'); await a.present();
} else {
  let fm; try { fm = FileManager.iCloud(); } catch (e) { fm = FileManager.local(); }
  const path = fm.joinPath(fm.documentsDirectory(), `${NAME}.js`);
  const existed = fm.fileExists(path);
  fm.writeString(path, code);
  const a = new Alert();
  a.title = existed ? 'Updated' : 'Installed';
  a.message = existed
    ? 'You now have the latest Stockit. Your stocks, settings and keys are kept.'
    : '"Stockit" is in your Scriptable library. Open it and add your first stock.';
  a.addAction('Open Stockit');
  a.addCancelAction('Later');
  if (await a.present() === 0) Safari.open('scriptable:///run/' + encodeURIComponent(NAME));
}
Script.complete();
