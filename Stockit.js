// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: chart-line;

/*
 * Stockit — your stocks, the news around them and a plain-English story, for Scriptable on iPhone.
 * https://github.com/gadominas/StockIt
 *
 *  - Owned stocks (shares, average price) and a watchlist; add by search, pasted list, a broker CSV or a screenshot
 *  - Prices and a year of history, P/E, market cap, dividend, analyst view, 52-week range, explained in plain words
 *  - Headlines from Yahoo Finance and the web (Google News), plus the crowd's mood from StockTwits
 *  - Flash: each stock's top headlines, a TL;DR of any headline (✦ AI or taken from the article), then the original source
 *  - Privacy mode: one tap on the eye hides your amounts (value, gains, shares, average prices) for demos
 *  - ✦ Suggested strategies from your portfolio, watchlist and plans, refreshed on a schedule you choose; keep any as your own, and edit every strategy
 *  - Check my portfolio: screenshots of your broker's app compared with Stockit, every difference a suggestion you apply or ignore
 *  - All your money in one currency of your choice (euros, dollars, …), in the app and the widget
 *  - Charts from one day to five years; touch to see the price at any moment
 *  - Whether each stock's market is open now, and a Markets tab with every market's opening and closing countdown
 *  - My strategies: your own plans in Ideas, kept or retired, and taken into account by ✦ ideas, briefing and stories
 *  - Listen to a stock's news: its top articles are read in full and told as one ✦ AI story (or their key sentences without AI)
 *  - Read aloud, as in BlogPulse: the briefing, stories, TL;DRs and Flash, with iPhone voices or ✦ OpenAI voices
 *  - Optional Claude or OpenAI: a portfolio briefing, a story and a buy / hold / sell view per stock, and new ideas
 *  - Home Screen widget in the shared frame (app-blueprints · widgets), in-app updates from GitHub
 *  - Opens on a 2.4 s launch screen with the Stockit logo (app-blueprints · launch-screen)
 *  - The BLUEPRINTS block below lists every shared blueprint this app follows (Settings › Built with)
 *
 * Data lives in iCloud Drive › Scriptable › Stockit (JSON files). Keys live in the iOS Keychain.
 * Nothing here is financial advice: AI views are opinions written from the data and headlines shown in the app.
 */

// This build's version. When releasing, bump it and add a matching entry to releases.json.
const VERSION = '1.12.0';
const APP_ID = 'stockit';   // unique per app, never changes
const REPO_RAW = 'https://raw.githubusercontent.com/gadominas/StockIt/main/';
const SCRIPT_FILE = 'Stockit.js';   // the script's file name in the repository
const UPDATE_SNOOZE_MS = 2 * 24 * 3600 * 1000;   // "Later" = 2 days
const KC_UPDATE_SNOOZE = 'stockit-update-snooze';   // Keychain key, unique per app

// ───────── Blueprints ─────────
// Shared blueprints this app was built with (github.com/gadominas/app-blueprints). One line per blueprint, in this exact shape:
// inventory tools read it without running the script, and Settings › Built with shows it.
const BLUEPRINTS_REPO = 'https://github.com/gadominas/app-blueprints';
const BLUEPRINTS = [
  { id: 'in-app-updates', name: 'In-app updates', version: '1.0.0', since: '1.0.0' },
  { id: 'settings', name: 'Settings', version: '1.0.0', since: '1.0.0' },
  { id: 'ai-configuration', name: 'AI configuration', version: '1.0.0', since: '1.0.0' },
  { id: 'launch-screen', name: 'Launch screen', version: '1.0.0', since: '1.0.0' },
  { id: 'widgets', name: 'Widgets', version: '1.0.0', since: '1.0.0' },
];

// ---------- config ----------
const APP = "Stockit";
const SCHEME = "stockit://";
// AI providers. Keychain names are unique per app; models are defaults until the user picks one.
const AI = {
  anthropic: { key: "STOCKIT_ANTHROPIC_KEY", model: "claude-haiku-5-5" },
  openai:    { key: "STOCKIT_OPENAI_KEY",    model: "gpt-4o-mini" },
};
const PROVIDERS = { anthropic: "Claude", openai: "OpenAI" };
// Other secrets: each its own Keychain entry, typed into a native secure prompt, never in settings.json or the page.
const SECRETS = { finnhub: { key: "STOCKIT_FINNHUB_KEY", name: "Finnhub key", hint: "Free at finnhub.io › Dashboard. Used only when Yahoo doesn't answer." } };
const DAY = 864e5;
const DEFAULT_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

// Everything tunable lives here; the Settings screen edits these (stored in settings.cfg, defaults below).
const CONFIG = [
  ["Market data", [
    { k: "fetchTimeout", label: "Time limit per request", help: "How long to wait for one answer from a data source", unit: "s", def: 15, min: 5, max: 60, step: 1 },
    { k: "concurrency", label: "Stocks loaded at once", help: "Higher is faster but heavier on the network", unit: "", def: 4, min: 1, max: 8, step: 1 },
    { k: "pricesFreshMin", label: "Reload prices on open when older than", help: "0 reloads every time Stockit opens", unit: "min", def: 5, min: 0, max: 120, step: 5 },
    { k: "fundHours", label: "Reload company numbers every", help: "P/E, market cap, dividend and analyst views change slowly", unit: "h", def: 12, min: 1, max: 72, step: 1 },
    { k: "userAgent", label: "Browser identity", help: "The User-Agent sent to data sources; some block unknown apps", type: "text", def: DEFAULT_UA },
  ]],
  ["Headlines", [
    { k: "newsPerStock", label: "Headlines kept per stock", unit: "headlines", def: 10, min: 3, max: 25, step: 1 },
    { k: "newsDays", label: "Headlines from the last", unit: "days", def: 7, min: 1, max: 30, step: 1 },
    { k: "newsRefreshMin", label: "Reload headlines when older than", help: "Refresh still reloads prices every time", unit: "min", def: 60, min: 15, max: 720, step: 15 },
    { k: "flashPerStock", label: "Headlines per stock in Flash", help: "The most recent and best-known sources come first", unit: "headlines", def: 3, min: 1, max: 5, step: 1 },
  ]],
  ["AI limits", [
    { k: "briefingHours", label: "Rewrite the briefing at most every", help: "Adding or removing a stock also brings a new one", unit: "h", def: 6, min: 1, max: 48, step: 1 },
    { k: "briefingMaxStocks", label: "Stocks in the briefing", help: "Owned stocks first, biggest first, then the watchlist", unit: "stocks", def: 25, min: 5, max: 60, step: 5 },
    { k: "aiHeadlines", label: "Headlines AI reads per stock", help: "More gives richer stories but uses more tokens", unit: "headlines", def: 6, min: 2, max: 15, step: 1 },
    { k: "tldrChars", label: "Article text sent for a TL;DR", help: "More gives fuller TL;DRs but uses more tokens", unit: "chars", def: 12000, min: 2000, max: 30000, step: 1000 },
    { k: "ideasCount", label: "Ideas per request", unit: "ideas", def: 5, min: 3, max: 10, step: 1 },
    { k: "ideaThemes", label: "Themes for ideas", help: "Edited in the Ideas tab; AI looks for stocks that fit them", type: "lines", def: ["Quality companies at a fair price", "Steady dividend payers", "Long-term growth trends"] },
  ]],
  ["Strategy suggestions", [
    { k: "stratEvery", label: "Refresh suggested strategies every", help: "When Stockit opens, after a refresh or when you open Ideas; 0 means only when you tap Refresh", unit: "h", def: 24, min: 0, max: 168, step: 6 },
    { k: "stratCount", label: "Strategies suggested at a time", unit: "strategies", def: 3, min: 1, max: 5, step: 1 },
  ]],
  ["Portfolio check", [
    { k: "checkPriceTol", label: "Flag a price difference from", help: "Between your screenshot and the price Stockit has; screenshots are often a little older", unit: "%", def: 5, min: 1, max: 30, step: 1 },
    { k: "checkCostTol", label: "Flag an average price difference from", unit: "%", def: 1, min: 0.1, max: 10, step: 0.1 },
    { k: "checkMaxShots", label: "Screenshots per check", unit: "screenshots", def: 6, min: 1, max: 10, step: 1 },
  ]],
  ["Widget", [
    { k: "widgetRefreshMin", label: "Ask iOS to refresh every", help: "iOS decides the exact timing", unit: "min", def: 30, min: 15, max: 240, step: 15 },
    { k: "widgetStaleMin", label: "Mark the widget as out of date after", help: "Older data shows \"Updated …\" in amber", unit: "min", def: 720, min: 60, max: 2880, step: 60 },
    { k: "widgetPriceAfterMin", label: "Widget reloads prices if older than", unit: "min", def: 30, min: 10, max: 720, step: 10 },
    { k: "widgetBudget", label: "Time the widget may spend loading", unit: "s", def: 15, min: 5, max: 25, step: 1 },
  ]],
];
const CFG_FLAT = CONFIG.flatMap(([, items]) => items);
const cfgDef = k => CFG_FLAT.find(x => x.k === k);
const cfg = k => { const v = settings.cfg && settings.cfg[k]; return v === undefined ? cfgDef(k).def : v; };
function setCfg(k, v) {
  const d = cfgDef(k);
  if (!d) return;
  settings.cfg = settings.cfg || {};
  if (v === null) { delete settings.cfg[k]; return; }   // Reset
  if (d.type === "text") v = String(v || "").trim() || d.def;
  else if (d.type === "lines") { v = String(Array.isArray(v) ? v.join("\n") : v || "").split("\n").map(x => x.trim()).filter(Boolean).slice(0, 20); if (!v.length) v = d.def; }
  else {
    v = Number(String(v).replace(",", "."));   // accept a decimal comma
    if (!isFinite(v)) v = d.def;
    v = Math.min(d.max, Math.max(d.min, v));
    v = d.step < 1 ? Math.round(v / d.step) * d.step : Math.round(v);
    v = Number(v.toFixed(2));
  }
  if (JSON.stringify(v) === JSON.stringify(d.def)) delete settings.cfg[k]; else settings.cfg[k] = v;   // store only what differs
}

// Six palettes on the shared tokens. up / down are Stockit's own colours for gains and losses (see docs/BLUEPRINTS.md).
const PALETTES = {
  ink:      { paper: "#f6f7f9", sheet: "#ffffff", ink: "#0f172a", ink2: "#334155", muted: "#5b6475", rule: "#dde2ea", signal: "#1d4ed8", signalWash: "#e5edff", amber: "#b45309", amberWash: "#fdf0dc", danger: "#b91c1c", up: "#15803d", down: "#b91c1c", scheme: "light" },
  sepia:    { paper: "#f3ead6", sheet: "#fbf5e6", ink: "#2a1f14", ink2: "#4b3b2a", muted: "#73604a", rule: "#e1d3b5", signal: "#8a3b12", signalWash: "#f3dfc8", amber: "#a16207", amberWash: "#f6e5bf", danger: "#9f1239", up: "#3f6212", down: "#9f1239", scheme: "light" },
  mint:     { paper: "#f1f6f3", sheet: "#ffffff", ink: "#0d2318", ink2: "#2c4a3b", muted: "#556d60", rule: "#d3e2d9", signal: "#15803d", signalWash: "#dcf3e4", amber: "#b45309", amberWash: "#fbeed8", danger: "#b91c1c", up: "#047857", down: "#b91c1c", scheme: "light" },
  contrast: { paper: "#ffffff", sheet: "#ffffff", ink: "#000000", ink2: "#111111", muted: "#333333", rule: "#9a9a9a", signal: "#0033cc", signalWash: "#e0e8ff", amber: "#7a4b00", amberWash: "#ffeec2", danger: "#a30000", up: "#005a1e", down: "#a30000", scheme: "light" },
  slate:    { paper: "#1c2128", sheet: "#22272e", ink: "#e6edf3", ink2: "#c5ced8", muted: "#9aa5b1", rule: "#373e47", signal: "#6cb6ff", signalWash: "#1d3350", amber: "#e3b341", amberWash: "#3a2f12", danger: "#ff8a7a", up: "#57d18b", down: "#ff8a7a", scheme: "dark" },
  night:    { paper: "#05070b", sheet: "#0f141c", ink: "#f3f6fa", ink2: "#d0d7e1", muted: "#9aa4b2", rule: "#1f2733", signal: "#7ab4ff", signalWash: "#132640", amber: "#f5c04a", amberWash: "#2d240c", danger: "#ff8f7a", up: "#4ade80", down: "#ff8f7a", scheme: "dark" },
};

// ---------- pure helpers (no Scriptable APIs) ----------
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };
const decode = s => String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e.toLowerCase()] || m))
  .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const num = v => v != null && typeof v === "object" ? num(v.raw) : (v == null || v === "" || !isFinite(+v) ? null : +v);
const round = (v, d = 2) => v == null ? null : Number((+v).toFixed(d));
// Quote currencies in minor units (pence, agorot, cents) are shown as such but totalled in the main unit.
const MINOR = { GBp: ["GBP", 100], GBX: ["GBP", 100], ILA: ["ILS", 100], ZAc: ["ZAR", 100] };
const normCur = c => MINOR[c] || [c || "USD", 1];
const cleanName = n => String(n || "").replace(/[,.]?\s+(inc|incorporated|corp|corporation|co|company|plc|ltd|limited|n\.?v|s\.?a|a\.?g|se|holdings?|group|class [a-z]|common stock|ordinary shares?)\.?$/gi, "")
  .replace(/[,.]?\s+(inc|corp|plc|ltd|n\.?v|s\.?a|a\.?g|se)\.?$/gi, "").trim();
const normTitle = t => String(t || "").toLowerCase().replace(/\s+-\s+[^-]{2,40}$/, "").replace(/[^a-z0-9]+/g, " ").trim();

async function pool(items, n, fn) {
  const q = items.slice();
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, q.length)) }, async () => {
    while (q.length) { const it = q.shift(); try { await fn(it); } catch (e) { console.log(String(e)); } }
  }));
}

// Price statistics from a year of daily closes ([day, close], day = days since 1970).
function stats(m) {
  const p = (m && m.pts) || [];
  if (p.length < 2) return {};
  const price = m.price != null ? m.price : p[p.length - 1][1];
  const lastDay = p[p.length - 1][0];
  const back = days => { let v = p[0][1]; for (const [d, c] of p) { if (d <= lastDay - days) v = c; else break; } return v; };
  const pct = (a, b) => a != null && b ? (a / b - 1) * 100 : null;
  const ma = n => p.length >= n ? p.slice(-n).reduce((s, x) => s + x[1], 0) / n : null;
  const closes = p.map(x => x[1]);
  const hi = m.hi52 || Math.max(...closes), lo = m.lo52 || Math.min(...closes);
  return {
    p1m: pct(price, back(30)), p6m: pct(price, back(182)), p1y: pct(price, p[0][1]),
    ma50: ma(50), ma200: ma(200), hi, lo, pos52: hi > lo ? Math.max(0, Math.min(100, (price - lo) / (hi - lo) * 100)) : null,
  };
}
const dayPct = m => m && m.price != null && m.prev ? (m.price / m.prev - 1) * 100 : null;
// A rule-based trend for when there is no AI: price against its 50- and 200-day averages and its 6-month move.
function trendOf(m) {
  const st = stats(m), price = m && m.price;
  if (price == null || st.ma50 == null) return null;
  let score = 0; const why = [];
  if (price > st.ma50) { score++; why.push("above its 50-day average"); } else { score--; why.push("below its 50-day average"); }
  if (st.ma200 != null) { if (price > st.ma200) { score++; why.push("above its 200-day average"); } else { score--; why.push("below its 200-day average"); } }
  if (st.p6m != null) { if (st.p6m > 5) score++; else if (st.p6m < -5) score--; why.push(`${st.p6m >= 0 ? "up" : "down"} ${Math.abs(st.p6m).toFixed(0)}% in 6 months`); }
  return { trend: score >= 2 ? "up" : score <= -2 ? "down" : "flat", why: "Price is " + why.join(", ").replace(/, ([^,]*)$/, " and $1") + "." };
}
// RSI over 14 days (Wilder): above 70 the price has risen fast lately, below 30 it has fallen fast.
function rsi14(pts) {
  const c = (pts || []).map(p => p[1]);
  if (c.length < 16) return null;
  let g = 0, l = 0;
  for (let i = 1; i <= 14; i++) { const d = c[i] - c[i - 1]; if (d > 0) g += d; else l -= d; }
  g /= 14; l /= 14;
  for (let i = 15; i < c.length; i++) { const d = c[i] - c[i - 1]; g = (g * 13 + Math.max(d, 0)) / 14; l = (l * 13 + Math.max(-d, 0)) / 14; }
  return l === 0 ? 100 : 100 - 100 / (1 + g / l);
}
// ---------- end pure helpers ----------

// ---------- storage ----------
const fm = (() => { try { return FileManager.iCloud(); } catch (e) { return FileManager.local(); } })();
const DIR = fm.joinPath(fm.documentsDirectory(), APP);
if (!fm.fileExists(DIR)) fm.createDirectory(DIR, true);
const P = n => fm.joinPath(DIR, n + ".json");
// A short start-up log on the phone (local, not iCloud): Settings › Updates › Start-up log, and on screen if opening stalls.
const LOG_PATH = FileManager.local().joinPath(FileManager.local().documentsDirectory(), APP_ID + "-startup.log");
function startLog(msg) {
  try {
    const lfm = FileManager.local(), line = new Date().toISOString().slice(11, 19) + "  " + msg;
    const old = lfm.fileExists(LOG_PATH) ? lfm.readString(LOG_PATH).split("\n").slice(-60) : [];
    lfm.writeString(LOG_PATH, old.concat(line).join("\n"));
  } catch (e) {}
}
const loadIssues = [];   // files iCloud didn't hand over in time
async function load(n, def, waitMs = 10000) {
  const p = P(n);
  if (!fm.fileExists(p)) return def;
  try {
    if (fm.isFileStoredIniCloud(p) && !fm.isFileDownloaded(p)) {
      // iCloud can take a long time (or forever, offline): never let start-up hang on it (as BlogPulse 1.9.1)
      await Promise.race([fm.downloadFileFromiCloud(p), new Promise(r => Timer.schedule(waitMs, false, r))]);
      if (!fm.isFileDownloaded(p)) { loadIssues.push(n); startLog(`iCloud didn't deliver ${n}.json in ${waitMs / 1000} s`); return def; }
    }
    return JSON.parse(fm.readString(p));
  } catch (e) { loadIssues.push(n); startLog(`Couldn't read ${n}.json: ${e}`); return def; }   // a broken file falls back to defaults, never crashes
}
// Data files are only written once they were read, so a slow start can never save an empty list over them.
let dataLoaded = false;
const write = (n, v) => {
  if (n === "settings" ? !settingsOk : (["stocks", "market", "insights", "tldrs", "usage", "strategies", "fx"].includes(n) && !dataLoaded)) return;
  fm.writeString(P(n), JSON.stringify(v));
};

// Defaults first, saved choices on top. Loaded here, before the app and widget branches.
const settings = Object.assign(
  { tab: "own", sort: "value", range: "1y", addTo: "watch", flashFold: {}, ideasFold: {}, checkIntro: 0, aiStrat: true, privacy: false,   // privacy: your amounts hidden, for showing the app to someone   // aiStrat: suggested strategies refresh on their own    // remembered picks; flashFold: symbol → newest headline time when folded
    refreshOnOpen: true, widgetMoney: false, homeCur: "auto",   // homeCur: the currency your money is shown in (auto: your biggest holdings')                                    // Portfolio
    newsYahoo: true, newsWeb: true, crowd: true,                                // News and signals
    style: "balanced",                                                          // AI advice: cautious, balanced, adventurous
    ai: true, aiProvider: "anthropic",                                          // AI configuration
    speechEngine: "device", voiceURI: "", voiceRate: 1, voicePitch: 1, voiceGender: "all",   // Listening: iPhone voice
    ttsModel: "gpt-4o-mini-tts", ttsVoice: "coral", ttsInstructions: "",                    // Listening: ✦ AI voice (OpenAI)
    checkUpdates: true,   // offer new versions from GitHub (asks again 2 days after "Later")
    theme: "auto", density: "comfortable", font: "sans", textSize: 1,           // Appearance
    lastRefresh: 0 },                                                           // internal state
  await load("settings", {})
);
const settingsOk = !loadIssues.includes("settings");   // settings that were never read are never saved over
// Stocks, prices, AI texts and usage are read in loadData(): the app shows its first screen before reading them,
// because iCloud can be slow to hand files over (a blank screen when opened from the widget; BlogPulse 1.9.x).
let stocks = [];        // [{ s, name, exch, list: "own" | "watch", sh, cost, added }]
let market = {};        // per symbol: price, prev, pts, f (fundamentals), prof, news, crowd
let insights = { briefing: null, stories: {}, ideas: null };   // AI output, with provider and time
let tldrs = {};         // TL;DRs and news stories by headline link, newest 150 kept
let fxRates = {};       // exchange rates to your currency: { "USDEUR": { rate, prev, at } }
let strategies = [];    // the investor's own plans: [{ id, text, when, status: "active" | "retired", at, retiredAt }]
async function loadData() {
  loadIssues.length = 0;
  stocks = await load("stocks", []);
  market = await load("market", {});
  insights = await load("insights", { briefing: null, stories: {}, ideas: null });
  insights.stories = insights.stories || {};
  tldrs = await load("tldrs", {});
  strategies = await load("strategies", []);
  fxRates = await load("fx", {});
  usage = await load("usage", usage);
  dataLoaded = loadIssues.length === 0;   // anything missing: show what we have, save nothing over it
}

function saveAll() {
  write("stocks", stocks); write("market", market); write("insights", insights); write("settings", settings);
}

// ---------- network ----------
async function getText(url, headers = {}, timeout = cfg("fetchTimeout")) {
  const r = new Request(url);
  r.timeoutInterval = timeout;
  r.headers = Object.assign({ "User-Agent": cfg("userAgent"), "Accept": "application/json, text/xml, */*" }, headers);
  const t = await r.loadString();
  const code = r.response ? r.response.statusCode : 0;
  if (code >= 400) throw new Error(`HTTP ${code}`);
  return t;
}
const getJSON = async (url, headers, timeout) => JSON.parse(await getText(url, headers, timeout));
const secretFor = id => Keychain.contains(SECRETS[id].key) ? Keychain.get(SECRETS[id].key) : null;

// ---------- Yahoo Finance: prices and history (no sign-in) ----------
async function yChart(sym, range = "1y", interval = "1d", keepTime = false) {   // keepTime: points in seconds (intraday), else days
  const q = `/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=${interval}&includePrePost=false`;
  let j;
  try { j = await getJSON("https://query1.finance.yahoo.com" + q); }
  catch (e) { j = await getJSON("https://query2.finance.yahoo.com" + q); }   // the second host answers when the first is busy
  const r = j && j.chart && j.chart.result && j.chart.result[0];
  if (!r || !r.meta) throw new Error((j && j.chart && j.chart.error && j.chart.error.description) || "No data for " + sym);
  const close = ((r.indicators && r.indicators.quote) || [{}])[0].close || [];
  const pts = [];
  (r.timestamp || []).forEach((t, i) => { if (close[i] != null) pts.push([keepTime ? t : Math.floor(t / 86400), round(close[i], 4)]); });
  return { meta: r.meta, pts };
}

// Today's (or the next) regular session from Yahoo, which knows the exchange's holidays.
const tradingPeriod = meta => { const r = meta && meta.currentTradingPeriod && meta.currentTradingPeriod.regular; return r && r.start && r.end ? { start: r.start * 1000, end: r.end * 1000 } : null; };

// The latest price and the close before today's session, from a chart answer.
function priceFrom(meta, pts) {
  const price = num(meta.regularMarketPrice) != null ? num(meta.regularMarketPrice) : (pts.length ? pts[pts.length - 1][1] : null);
  let prev = num(meta.previousClose);
  if (prev == null && pts.length > 1) {
    const mktDay = Math.floor((meta.regularMarketTime || 0) / 86400);
    prev = pts[pts.length - 1][0] === mktDay ? pts[pts.length - 2][1] : pts[pts.length - 1][1];
  }
  return { price, prev };
}

async function loadPrices(sym) {
  const { meta, pts } = await yChart(sym, "1y", "1d");
  const m = market[sym] = market[sym] || {};
  const { price, prev } = priceFrom(meta, pts);
  Object.assign(m, {
    price, prev, cur: meta.currency || m.cur, name: meta.longName || meta.shortName || m.name,
    exch: meta.fullExchangeName || meta.exchangeName || m.exch, type: meta.instrumentType || m.type,
    hi52: num(meta.fiftyTwoWeekHigh), lo52: num(meta.fiftyTwoWeekLow), mt: (meta.regularMarketTime || 0) * 1000,
    pts, at: Date.now(), err: null, tz: meta.exchangeTimezoneName || m.tz, tp: tradingPeriod(meta) || m.tp || null,
  });
  const x = stocks.find(s => s.s === sym);
  if (x && m.name && (!x.name || x.name === sym)) x.name = m.name;
}

// A light price check for the widget: two requests' worth of data, kept in memory only.
async function quickPrice(sym) {
  const { meta, pts } = await yChart(sym, "5d", "1d");
  const m = market[sym] = market[sym] || {};
  Object.assign(m, priceFrom(meta, pts), { mt: (meta.regularMarketTime || 0) * 1000, tp: tradingPeriod(meta) || m.tp || null });
}

// ---------- Yahoo Finance: company numbers (needs a session cookie and crumb) ----------
let yAuth = null;
async function yahooAuth(force = false) {
  if (!force && yAuth && Date.now() - yAuth.at < 6 * 3600e3) return yAuth;
  if (!force && !yAuth) { const saved = await load("yahoo", null); if (saved && Date.now() - saved.at < 6 * 3600e3) return (yAuth = saved); }
  const r1 = new Request("https://fc.yahoo.com/");
  r1.headers = { "User-Agent": cfg("userAgent") }; r1.timeoutInterval = cfg("fetchTimeout");
  try { await r1.loadString(); } catch (e) {}
  const cookie = ((r1.response && r1.response.cookies) || []).map(c => c.name + "=" + c.value).join("; ");
  const r2 = new Request("https://query2.finance.yahoo.com/v1/test/getcrumb");
  r2.headers = Object.assign({ "User-Agent": cfg("userAgent") }, cookie ? { Cookie: cookie } : {}); r2.timeoutInterval = cfg("fetchTimeout");
  const crumb = String(await r2.loadString()).trim();
  if (!crumb || crumb.length > 40 || /[\s<>{}]/.test(crumb)) throw new Error("Yahoo didn't open a session");
  yAuth = { cookie, crumb, at: Date.now() };
  write("yahoo", yAuth);   // a short-lived session for the data source, not a user secret
  return yAuth;
}
async function yAuthed(path) {
  for (const force of [false, true]) {
    const a = await yahooAuth(force);
    try { return await getJSON(`https://query2.finance.yahoo.com${path}${path.includes("?") ? "&" : "?"}crumb=${encodeURIComponent(a.crumb)}`, a.cookie ? { Cookie: a.cookie } : {}); }
    catch (e) { if (force || !/HTTP 40[13]/.test(String(e))) throw e; }   // an expired crumb: open a new session once
  }
}

// P/E, market cap, dividend and the analysts' average for many stocks in one request; Finnhub fills gaps if a key is saved.
async function loadFundamentals(syms) {
  const missing = new Set(syms);
  try {
    for (let i = 0; i < syms.length; i += 40) {
      const j = await yAuthed(`/v7/finance/quote?symbols=${syms.slice(i, i + 40).map(encodeURIComponent).join(",")}`);
      for (const q of (j && j.quoteResponse && j.quoteResponse.result) || []) {
        const m = market[q.symbol];
        if (!m) continue;
        const ty = num(q.trailingAnnualDividendYield);
        m.f = Object.assign(m.f || {}, {
          pe: num(q.trailingPE), fpe: num(q.forwardPE), mcap: num(q.marketCap), eps: num(q.epsTrailingTwelveMonths),
          divY: ty != null && ty > 0 ? ty * 100 : num(q.dividendYield), rating: q.averageAnalystRating || (m.f && m.f.rating) || null, src: "Yahoo Finance",
        });
        if (q.longName && !m.name) m.name = q.longName;
        m.fAt = Date.now(); missing.delete(q.symbol);
      }
    }
  } catch (e) { console.log("Yahoo numbers: " + e); }
  const fk = secretFor("finnhub");
  if (fk && missing.size) await pool([...missing], 2, async s => {
    const j = await getJSON(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(s)}&metric=all&token=${encodeURIComponent(fk)}`);
    const x = (j && j.metric) || {}, m = market[s];
    if (!m || !Object.keys(x).length) return;
    m.f = Object.assign(m.f || {}, {
      pe: num(x.peTTM != null ? x.peTTM : x.peBasicExclExtraTTM), mcap: num(x.marketCapitalization) != null ? num(x.marketCapitalization) * 1e6 : null,
      divY: num(x.dividendYieldIndicatedAnnual), beta: num(x.beta), eps: num(x.epsTTM != null ? x.epsTTM : x.epsBasicExclExtraItemsTTM), src: "Finnhub",
    });
    m.fAt = Date.now();
  });
}

// What the company does, sector, beta, analyst target and margins: loaded when a stock is opened.
async function loadProfile(sym) {
  const m = market[sym];
  if (!m) return;
  try {
    const j = await yAuthed(`/v10/finance/quoteSummary/${encodeURIComponent(sym)}?modules=assetProfile,financialData,defaultKeyStatistics,summaryDetail`);
    const r = j && j.quoteSummary && j.quoteSummary.result && j.quoteSummary.result[0];
    if (!r) throw new Error("No profile");
    const ap = r.assetProfile || {}, fd = r.financialData || {}, ks = r.defaultKeyStatistics || {}, sd = r.summaryDetail || {};
    m.prof = { sector: ap.sector || "", industry: ap.industry || "", about: decode(ap.longBusinessSummary).slice(0, 900), site: ap.website || "", at: Date.now() };
    const pm = num(fd.profitMargins), rg = num(fd.revenueGrowth), dy = num(sd.dividendYield);
    m.f = Object.assign(m.f || {}, {
      beta: num(sd.beta) != null ? num(sd.beta) : num(ks.beta), target: num(fd.targetMeanPrice), analysts: num(fd.numberOfAnalystOpinions),
      rec: fd.recommendationKey || null, margin: pm != null ? pm * 100 : null, growth: rg != null ? rg * 100 : null,
      pe: num(sd.trailingPE) != null ? num(sd.trailingPE) : (m.f && m.f.pe), fpe: num(sd.forwardPE) != null ? num(sd.forwardPE) : (m.f && m.f.fpe),
      mcap: num(sd.marketCap) != null ? num(sd.marketCap) : (m.f && m.f.mcap), divY: dy != null ? dy * 100 : (m.f && m.f.divY),
    });
    return;
  } catch (e) { console.log("Yahoo profile: " + e); }
  const fk = secretFor("finnhub");
  if (!fk) return;
  try {
    const j = await getJSON(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(fk)}`);
    if (j && j.name) m.prof = { sector: j.finnhubIndustry || "", industry: "", about: "", site: j.weburl || "", at: Date.now() };
  } catch (e) {}
}

// ---------- headlines: Yahoo Finance and the web (Google News) ----------
function parseRSS(xml) {
  const out = [];
  for (const it of String(xml).match(/<item[\s>][\s\S]*?<\/item>/gi) || []) {
    const g = n => { const x = it.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`, "i")); return x ? decode(x[1]) : ""; };
    const src = g("source");
    let t = g("title");
    if (src && t.endsWith(" - " + src)) t = t.slice(0, -(src.length + 3));
    const at = Date.parse(g("pubDate"));
    if (t && g("link")) out.push({ t, p: src || "Web", l: g("link"), at: isFinite(at) ? at : Date.now(), src: "web" });
  }
  return out;
}
async function loadNews(sym) {
  const m = market[sym] = market[sym] || {}, out = [];
  const since = Date.now() - cfg("newsDays") * DAY;
  if (settings.newsYahoo) {
    try {
      const j = await getJSON(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(sym)}&quotesCount=0&newsCount=${cfg("newsPerStock")}&listsCount=0`);
      for (const n of (j && j.news) || []) if (n.title && n.link) out.push({ t: decode(n.title), p: n.publisher || "Yahoo Finance", l: n.link, at: (n.providerPublishTime || 0) * 1000, src: "yahoo" });
    } catch (e) { console.log("Yahoo news " + sym + ": " + e); }
  }
  if (settings.newsWeb) {
    try {
      const name = cleanName(m.name) || sym;
      const q = `"${name}" ${name.toUpperCase() === sym ? "" : sym + " "}stock when:${cfg("newsDays")}d`;
      out.push(...parseRSS(await getText(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`)));
    } catch (e) { console.log("Web news " + sym + ": " + e); }
  }
  const seen = new Set();
  m.news = out.filter(n => n.at >= since).sort((a, b) => b.at - a.at)
    .filter(n => { const k = normTitle(n.t); if (!k || seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, cfg("newsPerStock"));
  m.newsAt = Date.now();
}

// ---------- exchange rates: everything you own in one currency ----------
const HOME_CURS = ["EUR", "USD", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "JPY", "CAD", "AUD", "HKD"];
function homeCur() {   // your choice, or the currency most of your money is in
  if (settings.homeCur && settings.homeCur !== "auto") return settings.homeCur;
  const by = {};
  for (const x of stocks) { const m = market[x.s]; if (x.list === "own" && x.sh > 0 && m && m.price != null) { const [c, k] = normCur(m.cur); by[c] = (by[c] || 0) + x.sh * m.price / k; } }
  const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : (stocks[0] && normCur((market[stocks[0].s] || {}).cur)[0]) || "USD";
}
// From a stock's currency to yours: 1 for the same currency, null when the rate isn't known yet. prev: yesterday's rate.
function fxRate(cur, prev, home = homeCur()) {
  const [c, k] = normCur(cur);
  if (c === home) return 1 / k;
  const r = fxRates[c + home];
  return r && r.rate ? (prev ? (r.prev || r.rate) : r.rate) / k : null;
}
async function loadFx(force = false) {
  const home = homeCur();
  const curs = [...new Set(stocks.map(x => normCur((market[x.s] || {}).cur)[0]).filter(c => c && c !== home))];
  await pool(curs.filter(c => force || !fxRates[c + home] || Date.now() - fxRates[c + home].at > 30 * 60e3), 3, async c => {
    try {
      const { meta, pts } = await yChart(`${c}${home}=X`, "5d", "1d");
      const q = priceFrom(meta, pts);
      if (q.price) fxRates[c + home] = { rate: q.price, prev: q.prev || q.price, at: Date.now() };
    } catch (e) { console.log(`Rate ${c}→${home}: ${e}`); }
  });
  write("fx", fxRates);
}

// ---------- the crowd's mood: StockTwits posts tagged bullish or bearish ----------
async function loadCrowd(sym) {
  const m = market[sym];
  if (!settings.crowd || !m || /[.=^-]/.test(sym)) return;   // StockTwits covers US tickers only
  const j = await getJSON(`https://api.stocktwits.com/api/2/streams/symbol/${encodeURIComponent(sym)}.json`);
  let bull = 0, bear = 0;
  const msgs = (j && j.messages) || [];
  for (const x of msgs) { const s = x.entities && x.entities.sentiment && x.entities.sentiment.basic; if (s === "Bullish") bull++; else if (s === "Bearish") bear++; }
  m.crowd = { bull, bear, n: msgs.length, at: Date.now() };
}

// ---------- finding and adding stocks ----------
const QTYPES = ["EQUITY", "ETF", "MUTUALFUND", "INDEX", "CRYPTOCURRENCY"];
async function searchSymbols(q) {
  const j = await getJSON(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0&listsCount=0`);
  return ((j && j.quotes) || []).filter(x => x.symbol && QTYPES.includes(x.quoteType))
    .map(x => ({ s: x.symbol, name: x.longname || x.shortname || x.symbol, exch: x.exchDisp || x.exchange || "", type: x.typeDisp || x.quoteType || "" }));
}
// A ticker or company name → a symbol Yahoo knows, or null.
async function resolveSymbol(tok) {
  const t = String(tok || "").trim().replace(/^\$/, "");
  if (!t) return null;
  if (/^[A-Za-z0-9.\-=^]{1,12}$/.test(t)) {
    try { const { meta } = await yChart(t.toUpperCase(), "5d", "1d"); if (meta && meta.symbol) return { s: meta.symbol, name: meta.longName || meta.shortName || meta.symbol, exch: meta.fullExchangeName || "" }; } catch (e) {}
  }
  try { const r = await searchSymbols(t); if (r[0]) return r[0]; } catch (e) {}
  return null;
}
// items: [{ tok, name?, sh?, cost? }] → added to `list`; existing stocks only get shares and cost updated.
async function addStocks(items, list) {
  const res = { added: [], updated: [], missing: [] };
  await pool(items.slice(0, 80), cfg("concurrency"), async it => {
    const r = it.s ? it : await resolveSymbol(it.tok || it.name);
    if (!r) { res.missing.push(it.tok || it.name); return; }
    let x = stocks.find(y => y.s === r.s);
    if (x) {
      if (it.sh > 0) { x.sh = it.sh; x.list = "own"; if (it.cost > 0) x.cost = it.cost; res.updated.push(r.s); }
      return;
    }
    x = { s: r.s, name: r.name || r.s, exch: r.exch || "", list: it.sh > 0 ? "own" : list, added: Date.now() };
    if (it.sh > 0) { x.sh = it.sh; if (it.cost > 0) x.cost = it.cost; }
    stocks.push(x); res.added.push(r.s);
    try { await loadPrices(r.s); } catch (e) { market[r.s] = Object.assign(market[r.s] || {}, { err: String(e.message || e).slice(0, 80) }); }
    await loadFx().catch(() => {});   // a new currency's rate (cached ones are skipped)
    loadNews(r.s).catch(() => {});
  });
  if (res.added.length) await loadFundamentals(res.added).catch(() => {});
  return res;
}
// "AAPL 10 @ 150", "MSFT", "NVDA, TSLA", "$AMD 5" → items
function parseList(text) {
  const out = [];
  for (const line of String(text || "").split(/\n|;/)) {
    const parts = line.split(",").map(x => x.trim()).filter(Boolean);
    const one = parts.length > 1 && parts.every(p => /^\$?[A-Za-z][A-Za-z0-9.\-=^]{0,11}$/.test(p)) ? parts : [line.trim()];
    for (const p of one) {
      const m = p.match(/^\$?([A-Za-z0-9.\-=^]{1,12}|[^\d@]+?)(?:\s+([\d.,]+))?(?:\s*(?:@|at|x)\s*([\d.,]+))?\s*$/i);
      if (!m || !m[1].trim()) continue;
      const n = v => v ? +String(v).replace(/,(?=\d{3}\b)/g, "").replace(",", ".") : 0;
      out.push({ tok: m[1].trim(), sh: n(m[2]), cost: n(m[3]) });
    }
  }
  return out;
}
// A broker's CSV export: finds the symbol, quantity and average price columns by their names.
function parseCSV(text) {
  const rows = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter(l => l.trim());
  if (rows.length < 2) return [];
  const sep = [",", ";", "\t"].sort((a, b) => rows[0].split(b).length - rows[0].split(a).length)[0];
  const split = l => { const out = []; let cur = "", q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === sep && !q) { out.push(cur.trim()); cur = ""; } else cur += ch; } out.push(cur.trim()); return out; };
  const head = split(rows[0]).map(h => h.toLowerCase());
  const col = res => head.findIndex(h => res.some(r => r.test(h)));
  const cs = col([/^(symbol|ticker|ticker symbol|instrument symbol|code)$/, /symbol|ticker/]);
  const cq = col([/^(quantity|shares|qty|units|no\. of shares|position)$/, /quantity|shares|qty/]);
  const cc = col([/^(average price|avg price|average cost|avg cost|cost per share|average buy price|price \/ share)$/, /avg|average/]);
  if (cs < 0) return [];
  const n = v => { const x = parseFloat(String(v || "").replace(/[^\d.,-]/g, "").replace(/,(?=\d{3}\b)/g, "").replace(",", ".")); return isFinite(x) ? x : 0; };
  const byS = {};
  for (const r of rows.slice(1).map(split)) {
    const s = (r[cs] || "").replace(/^\$/, "").trim();
    if (!s || /^(cash|total)/i.test(s)) continue;
    const it = byS[s] = byS[s] || { tok: s, sh: 0, cost: 0 };
    const q = cq >= 0 ? n(r[cq]) : 0, c = cc >= 0 ? n(r[cc]) : 0;
    if (q > 0) { it.cost = it.sh + q ? (it.cost * it.sh + c * q) / (it.sh + q) : c; it.sh += q; }
  }
  return Object.values(byS);
}

// ---------- refresh ----------
let refreshing = false;
async function runRefresh(force = false) {
  if (refreshing) return;
  refreshing = true;
  try {
    const syms = stocks.map(x => x.s), failed = [];
    let done = 0;
    call("onProgress", 0, syms.length);
    await pool(syms, cfg("concurrency"), async s => {
      try { await loadPrices(s); }
      catch (e) { failed.push(s); market[s] = Object.assign(market[s] || {}, { err: String(e.message || e).slice(0, 80) }); }
      const m = market[s];
      if (m && (force || !m.newsAt || Date.now() - m.newsAt > cfg("newsRefreshMin") * 60e3)) {
        await loadNews(s).catch(() => {});
        await loadCrowd(s).catch(() => {});
      }
      call("onProgress", ++done, syms.length);
    });
    await loadFx(force).catch(e => console.log("Exchange rates: " + e));
    const stale = syms.filter(s => market[s] && (force || !market[s].fAt || Date.now() - market[s].fAt > cfg("fundHours") * 3600e3));
    if (stale.length) await loadFundamentals(stale).catch(e => console.log(String(e)));
    for (const k of Object.keys(market)) if (!syms.includes(k) && !previews.has(k)) delete market[k];
    if (syms.length) settings.lastRefresh = Date.now();
    call("onProgress", 0, 0);
    saveAll(); push(); saveWidget(widgetSnapshot());
    if (syms.length) toast(failed.length ? `Updated; couldn't load ${failed.slice(0, 3).join(", ")}${failed.length > 3 ? " and " + (failed.length - 3) + " more" : ""}` : "Prices and news updated");
    if (settings.ai && aiKey() && briefingDue()) await runBriefing(false);
    if (stratDue()) await runStratSuggest(false);   // suggested strategies, when they're older than you chose
  } finally { refreshing = false; call("onProgress", 0, 0); }
}

// ---------- AI configuration (app-blueprints · ai-configuration) ----------
const keyFor  = p => Keychain.contains(AI[p].key) ? Keychain.get(AI[p].key) : null;
const aiKey   = () => keyFor(settings.aiProvider);   // the key of the provider in use
const modelFor = p => (settings.model && settings.model[p]) || AI[p].model;
const maskKey = k => k ? (k.length > 14 ? k.slice(0, 7) + "…" + k.slice(-4) : "…" + k.slice(-4)) : null;
if (!aiKey() && keyFor(settings.aiProvider === "openai" ? "anthropic" : "openai")) settings.aiProvider = settings.aiProvider === "openai" ? "anthropic" : "openai";

async function askKey(p) {
  const cur = keyFor(p);
  const al = new Alert();
  al.title = `${PROVIDERS[p]} API key`;
  al.message = cur ? `The saved key ends in …${cur.slice(-4)}. Paste a new key to replace it.`
                   : "Paste your API key. It's stored in the iOS Keychain on this device only.";
  al.addSecureTextField(p === "openai" ? "sk-…" : "sk-ant-…", "");
  al.addAction("Save key");
  al.addCancelAction("Cancel");
  if (await al.present() !== 0) return false;
  const v = al.textFieldValue(0).trim();
  if (!v) return false;
  Keychain.set(AI[p].key, v);
  if (!aiKey()) settings.aiProvider = p;   // first key saved: use that provider
  return true;
}
function removeKey(p) {
  if (Keychain.contains(AI[p].key)) Keychain.remove(AI[p].key);
}

// Token usage, counted from what the provider reports, per provider, model, feature and local day.
var usage = { since: Date.now(), p: {} };   // read in loadData()
const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function recordUsage(provider, model, feature, tin, tout, chars = 0) {   // chars: text sent for speech
  const P = usage.p[provider] = usage.p[provider] || { calls: 0, in: 0, out: 0, models: {}, features: {}, days: {} };
  const b = (o, k) => o[k] = o[k] || { calls: 0, in: 0, out: 0 };
  for (const x of [P, b(P.models, model), b(P.features, feature), b(P.days, dayKey())]) {
    x.calls++; x.in += tin; x.out += tout; if (chars) x.chars = (x.chars || 0) + chars;
  }
  const days = Object.keys(P.days).sort();
  while (days.length > 400) delete P.days[days.shift()];   // keep about 13 months of days
  write("usage", usage);   // save after every call: the app can be closed at any moment
}
function resetUsage() { usage = { since: Date.now(), p: {} }; write("usage", usage); }

async function fetchModels(p) {
  const key = keyFor(p);
  if (!key) throw new Error(`Add a ${PROVIDERS[p]} key first`);
  const r = new Request(p === "openai" ? "https://api.openai.com/v1/models" : "https://api.anthropic.com/v1/models?limit=100");
  r.headers = p === "openai" ? { "Authorization": "Bearer " + key } : { "x-api-key": key, "anthropic-version": "2023-06-01" };
  r.timeoutInterval = 20;
  const j = await r.loadJSON();
  if (j.error) throw new Error(j.error.message || "Couldn't load models");
  let list = (j.data || []).map(m => ({
    id: m.id, name: m.display_name || m.id,
    t: m.created_at ? Date.parse(m.created_at) : (m.created || 0) * 1000,
  }));
  // OpenAI lists every model the key can reach; keep only the ones that write text.
  if (p === "openai")   // speech models get their own list, for Settings › Listening
    settings.ttsModels = { at: Date.now(), list: list.filter(m => /tts/.test(m.id)).sort((a, b) => b.t - a.t).map(m => ({ id: m.id, name: m.id })) };
  if (p === "openai") list = list.filter(m => /^(gpt-|o\d|chatgpt-)/.test(m.id)
    && !/(audio|realtime|tts|transcribe|image|search|embedding|instruct|moderation)/.test(m.id));
  list.sort((a, b) => b.t - a.t);
  settings.models = settings.models || {};
  settings.models[p] = { at: Date.now(), list: list.map(m => ({ id: m.id, name: m.name })) };
  return list.length;
}

// Every AI request goes through here. feature: the usage table's tag. images: base64 JPEGs (screenshot import).
async function aiCall(system, user, maxTokens = 2500, feature = "other", provider = settings.aiProvider, images = []) {
  const key = keyFor(provider);
  if (!key) throw new Error(`No ${PROVIDERS[provider]} key saved`);
  const openai = provider === "openai", model = modelFor(provider);
  const r = new Request(openai ? "https://api.openai.com/v1/chat/completions" : "https://api.anthropic.com/v1/messages");
  r.method = "POST";
  r.timeoutInterval = 90;
  const oaUser = images.length ? [{ type: "text", text: user }].concat(images.map(d => ({ type: "image_url", image_url: { url: "data:image/jpeg;base64," + d } }))) : user;
  const anUser = images.length ? images.map(d => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: d } })).concat([{ type: "text", text: user }]) : user;
  if (openai) {
    r.headers = { "Authorization": "Bearer " + key, "Content-Type": "application/json" };
    r.body = JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: oaUser }] });
  } else {
    r.headers = { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" };
    r.body = JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: anUser }] });
  }
  const j = await r.loadJSON();
  if (j.error) throw new Error(j.error.message || "AI request failed");
  const u = j.usage || {};
  recordUsage(provider, model, feature,
    openai ? (u.prompt_tokens || 0) : (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0),
    openai ? (u.completion_tokens || 0) : (u.output_tokens || 0));
  return openai ? ((j.choices && j.choices[0] && j.choices[0].message.content) || "")
                : (j.content || []).map(c => c.text || "").join("");
}

// For prompts that ask for JSON: tolerate code fences and stray text around it.
function parseJSON(txt) {
  const s = String(txt).replace(/```json|```/g, "").trim();
  const a = s.search(/[\[{]/), b = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  return JSON.parse(s.slice(a, b + 1));
}

// ---------- what the AI reads: the numbers and headlines the app shows ----------
const STYLE = {
  cautious: "cautious: protecting money matters more than big gains; prefers steady, profitable companies and dividends",
  balanced: "balanced: wants steady growth over years and accepts normal ups and downs",
  adventurous: "adventurous: accepts big swings for bigger long-term growth",
};
const SIGNALS = ["buy", "hold", "sell"], CONF = ["low", "medium", "high"];
// What you own, in your currency (Settings › Portfolio). Stocks whose exchange rate isn't known yet are kept apart, in their own currency.
function totals() {
  const home = homeCur(), by = {};
  for (const x of stocks) {
    const m = market[x.s];
    if (x.list !== "own" || !(x.sh > 0) || !m || m.price == null) continue;
    const [cur, k] = normCur(m.cur), r = fxRate(m.cur, false, home), rp = fxRate(m.cur, true, home);
    const key = r != null ? home : cur, f = r != null ? r : 1 / k, fp = r != null ? rp : 1 / k;
    const t = by[key] = by[key] || { cur: key, value: 0, day: 0, cost: 0, costKnown: true, n: 0, mixed: false };
    t.value += x.sh * m.price * f; t.n++;
    if (r != null && normCur(m.cur)[0] !== home) t.mixed = true;
    if (m.prev) t.day += x.sh * (m.price * f - m.prev * fp);   // in your currency: the stock's move and the currency's
    if (x.cost > 0) t.cost += x.sh * x.cost * f; else t.costKnown = false;   // what you paid, at today's rate
  }
  return Object.values(by).sort((a, b) => (b.cur === home) - (a.cur === home) || b.value - a.value);
}
const fx = (v, d = 2) => v == null || !isFinite(v) ? "n/a" : (+v).toFixed(Math.abs(v) >= 1000 ? 0 : d);
const sx = v => v == null || !isFinite(v) ? "n/a" : (v >= 0 ? "+" : "") + v.toFixed(1) + "%";
const bigx = v => v == null ? "n/a" : v >= 1e12 ? (v / 1e12).toFixed(2) + "T" : v >= 1e9 ? (v / 1e9).toFixed(1) + "B" : v >= 1e6 ? (v / 1e6).toFixed(0) + "M" : String(Math.round(v));
const dateS = ts => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function stockFacts(x, nNews, tot) {
  const m = market[x.s] || {}, st = stats(m), f = m.f || {}, c = m.crowd;
  const t = tot && tot.find(z => z.cur === normCur(m.cur)[0]);
  const w = x.list === "own" && x.sh > 0 && m.price != null && t && t.value ? x.sh * m.price / normCur(m.cur)[1] / t.value * 100 : null;
  const hold = x.list === "own" ? `owned${x.sh ? `, ${x.sh} shares` : ""}${x.cost ? ` bought at ${fx(x.cost)} on average (${sx(m.price / x.cost * 100 - 100)} since)` : ""}${w != null ? `, ${w.toFixed(0)}% of the portfolio in ${t.cur}` : ""}` : "watching, not owned";
  return [
    `### ${x.s} — ${m.name || x.name || x.s} (${hold})`,
    `Price ${fx(m.price)} ${m.cur || ""}; today ${sx(dayPct(m))}; 1 month ${sx(st.p1m)}, 6 months ${sx(st.p6m)}, 1 year ${sx(st.p1y)}; 52-week range ${fx(st.lo)}–${fx(st.hi)}, now at ${st.pos52 == null ? "n/a" : st.pos52.toFixed(0) + "%"} of it; ${st.ma50 ? (m.price > st.ma50 ? "above" : "below") + " its 50-day average" : ""}${st.ma200 ? ", " + (m.price > st.ma200 ? "above" : "below") + " its 200-day average" : ""}`,
    `P/E ${fx(f.pe)}, forward P/E ${fx(f.fpe)}, market cap ${bigx(f.mcap)}, dividend yield ${f.divY ? fx(f.divY) + "%" : "none or n/a"}, beta ${fx(f.beta)}, analysts' average ${f.rating || f.rec || "n/a"}${f.target ? `, mean target ${fx(f.target)}` : ""}${f.margin != null ? `, profit margin ${fx(f.margin, 1)}%` : ""}${f.growth != null ? `, revenue growth ${sx(f.growth)}` : ""}${m.prof && m.prof.sector ? `; sector ${m.prof.sector}${m.prof.industry ? " / " + m.prof.industry : ""}` : ""}`,
    c && c.bull + c.bear >= 5 ? `Crowd mood (StockTwits, last ${c.n} posts): ${c.bull} bullish, ${c.bear} bearish` : "",
    (m.news || []).length ? "Headlines:\n" + m.news.slice(0, nNews).map((h, i) => `[${i + 1}] ${dateS(h.at)} ${h.p}: ${h.t}`).join("\n") : "Headlines: none found",
  ].filter(Boolean).join("\n");
}

// The investor's own strategies (Ideas › My strategies), for every prompt that gives advice.
function planLine() {
  const act = strategies.filter(g => g.status !== "retired");
  if (!act.length) return "";
  return "\nThe investor's own strategies, to take into account (they decide; you help):\n" + act.map(g => `- [${g.id}] ${g.text}${g.when ? " (timing: " + g.when + ")" : ""} — set ${dateS(g.at)}`).join("\n");
}
function positionsLine() {
  const own = stocks.filter(x => x.list === "own" && x.sh);
  return own.length ? "\nPositions: " + own.map(x => { const m = market[x.s] || {}, g = x.cost && m.price ? (m.price / x.cost - 1) * 100 : null;
    return `${x.s} ${x.sh} shares${x.cost ? ", average price " + fx(x.cost) : ""}${m.price != null ? ", now " + fx(m.price) : ""}${g != null ? " (" + sx(g) + " since bought)" : ""}`; }).join("; ") + "." : "";
}
const TONE = `You are Stockit, a calm, plain-spoken companion for a casual long-term investor who doesn't follow technical analysis.
Write like a knowledgeable friend: short sentences, everyday words, and when a term like P/E matters, explain it in passing.
Use only the numbers and headlines provided. If something isn't in them, say it isn't known rather than guessing; never invent figures, events or quotes.
Signals are an opinion for a long-term investor, not certainty: "buy" means it looks attractive to add (or start, for a watchlist stock), "hold" means keep or wait, "sell" means consider trimming or avoiding.
Reply with JSON only, no other text.`;

function briefingStocks() {
  const val = x => { const m = market[x.s] || {}; return x.list === "own" && x.sh > 0 && m.price != null ? x.sh * m.price / normCur(m.cur)[1] : 0; };
  return stocks.filter(x => market[x.s] && market[x.s].price != null)
    .sort((a, b) => (a.list === "own" ? 0 : 1) - (b.list === "own" ? 0 : 1) || val(b) - val(a))
    .slice(0, cfg("briefingMaxStocks"));
}
const briefingSig = () => briefingStocks().map(x => x.s + ":" + x.list).sort().join(",");
function briefingDue() {
  const b = insights.briefing;
  return briefingStocks().length > 0 && (!b || b.sig !== briefingSig() || Date.now() - b.at > cfg("briefingHours") * 3600e3);
}

let briefingBusy = false;
async function runBriefing(force) {
  if (briefingBusy || !aiKey()) return;
  if (!force && !briefingDue()) return;
  const list = briefingStocks();
  if (!list.length) return;
  briefingBusy = true; call("onBusy", "briefing", true);
  try {
    const tot = totals();
    const user = `Today is ${dateS(Date.now())}. Investing style: ${STYLE[settings.style] || STYLE.balanced}.${planLine()}
Portfolio: ${list.filter(x => x.list === "own").length} owned, ${list.filter(x => x.list !== "own").length} on the watchlist.${tot.length ? " Value: " + tot.map(t => `${t.value.toFixed(0)} ${t.cur} (today ${t.day >= 0 ? "+" : ""}${t.day.toFixed(0)})`).join(", ") + "." : ""}

${list.map(x => stockFacts(x, cfg("aiHeadlines"), tot)).join("\n\n")}

Write today's briefing as JSON in this exact shape:
{"portfolio":{"headline":"at most 12 words","story":"3 to 5 short paragraphs separated by blank lines: what moved and why (from the headlines), themes across these stocks, anything concentrated or risky, and what it means for this investor","mood":"positive|mixed|negative","watch":["up to 3 short things to keep an eye on"]},
"stocks":{"SYMBOL":{"signal":"buy|hold|sell","confidence":"low|medium|high","line":"one sentence, at most 22 words, on why","story":"2 or 3 sentences on what is happening with this company now"}}}
Include every symbol above in "stocks". Owned stocks matter most.`;
    const out = parseJSON(await aiCall(TONE, user, Math.min(8000, 900 + 190 * list.length), "briefing"));
    const p = out.portfolio || {}, ss = {};
    for (const x of list) {
      const v = (out.stocks || {})[x.s] || (out.stocks || {})[x.s.toUpperCase()];
      if (!v) continue;
      ss[x.s] = { signal: SIGNALS.includes(String(v.signal).toLowerCase()) ? String(v.signal).toLowerCase() : "hold", confidence: CONF.includes(v.confidence) ? v.confidence : "low",
        line: String(v.line || "").slice(0, 240), story: String(v.story || "").slice(0, 900) };
    }
    insights.briefing = { headline: String(p.headline || "Your portfolio today").slice(0, 120), story: String(p.story || "").slice(0, 5000),
      mood: ["positive", "mixed", "negative"].includes(p.mood) ? p.mood : "mixed", watch: (p.watch || []).slice(0, 3).map(String),
      stocks: ss, by: settings.aiProvider, model: modelFor(settings.aiProvider), at: Date.now(), sig: briefingSig() };
    write("insights", insights); push(); saveWidget(widgetSnapshot());
  } catch (e) { toast("Briefing not written: " + String(e.message || e).slice(0, 90)); }
  finally { briefingBusy = false; call("onBusy", "briefing", false); }
}

// A deeper story for one stock, when the user asks for it.
const storyBusy = new Set();
async function runStory(sym) {
  const x = stocks.find(y => y.s === sym) || (previews.has(sym) ? { s: sym, name: (market[sym] || {}).name || sym, list: "preview" } : null);
  if (!x || storyBusy.has(sym)) return;
  if (!aiKey()) return toast("Add a Claude or OpenAI key in Settings › AI settings");
  storyBusy.add(sym); call("onBusy", "story:" + sym, true);
  try {
    const m = market[sym] || {};
    if (!m.prof || Date.now() - m.prof.at > cfg("fundHours") * 3600e3) await loadProfile(sym).catch(() => {});
    const user = `Today is ${dateS(Date.now())}. Investing style: ${STYLE[settings.style] || STYLE.balanced}.${planLine()}
${m.prof && m.prof.about ? "What the company does: " + m.prof.about + "\n" : ""}
${stockFacts(x, Math.max(cfg("aiHeadlines"), 10), totals())}

Write the story of this stock right now as JSON in this exact shape:
{"headline":"at most 12 words","story":"4 to 6 short paragraphs separated by blank lines: what the company does, what is happening now and why (cite headlines as [n]), how the price has behaved, and whether the price looks cheap or expensive in plain words","signal":"buy|hold|sell","confidence":"low|medium|high","reasons":["up to 3 reasons for the signal"],"risks":["up to 3 things that could go wrong"],"watch":["up to 3 things to watch next"]}`;
    const o = parseJSON(await aiCall(TONE, user, 2200, "story"));
    insights.stories[sym] = { headline: String(o.headline || sym).slice(0, 140), story: String(o.story || "").slice(0, 6000),
      signal: SIGNALS.includes(String(o.signal).toLowerCase()) ? String(o.signal).toLowerCase() : "hold", confidence: CONF.includes(o.confidence) ? o.confidence : "low",
      reasons: (o.reasons || []).slice(0, 3).map(String), risks: (o.risks || []).slice(0, 3).map(String), watch: (o.watch || []).slice(0, 3).map(String),
      news: (m.news || []).slice(0, Math.max(cfg("aiHeadlines"), 10)).map(h => ({ t: h.t, l: h.l, p: h.p })),
      by: settings.aiProvider, model: modelFor(settings.aiProvider), at: Date.now() };
    write("insights", insights); write("market", market); push(); saveWidget(widgetSnapshot());
  } catch (e) { toast("Story not written: " + String(e.message || e).slice(0, 90)); }
  finally { storyBusy.delete(sym); call("onBusy", "story:" + sym, false); }
}

// New stocks to look at: trending and value lists from Yahoo as candidates, picked and explained by AI, then checked.
let ideasBusy = false;
async function runIdeas() {
  if (ideasBusy) return;
  if (!aiKey()) return toast("Add a Claude or OpenAI key in Settings › AI settings");
  ideasBusy = true; call("onBusy", "ideas", true);
  try {
    const cand = new Map();
    try {
      const j = await getJSON("https://query1.finance.yahoo.com/v1/finance/trending/US?count=25");
      for (const q of ((j.finance && j.finance.result && j.finance.result[0]) || {}).quotes || []) cand.set(q.symbol, "trending in the US today");
    } catch (e) {}
    for (const id of ["undervalued_large_caps", "growth_technology_stocks"]) {
      try {
        const j = await yAuthed(`/v1/finance/screener/predefined/saved?scrIds=${id}&count=12`);
        for (const q of ((j.finance && j.finance.result && j.finance.result[0]) || {}).quotes || [])
          if (q.symbol && !cand.has(q.symbol)) cand.set(q.symbol, `${q.shortName || q.symbol}: ${id.replace(/_/g, " ")}, P/E ${fx(num(q.trailingPE))}, today ${sx(num(q.regularMarketChangePercent))}`);
      } catch (e) {}
    }
    const mine = new Set(stocks.map(x => x.s));
    const nAct = strategies.filter(g => g.status !== "retired").length;
    const sectors = [...new Set(stocks.map(x => market[x.s] && market[x.s].prof && market[x.s].prof.sector).filter(Boolean))];
    const n = Math.min(10, cfg("ideasCount") + Math.min(3, nAct));   // a little room for ideas that serve your strategies
    const user = `Today is ${dateS(Date.now())}. Investing style: ${STYLE[settings.style] || STYLE.balanced}.${planLine()}
Themes this investor likes: ${cfg("ideaThemes").join("; ")}.
Already owned: ${stocks.filter(x => x.list === "own").map(x => `${x.s} (${(market[x.s] || {}).name || x.name})`).join(", ") || "nothing yet"}.
Watching: ${stocks.filter(x => x.list !== "own").map(x => x.s).join(", ") || "nothing"}.${sectors.length ? "\nSectors held: " + sectors.join(", ") + "." : ""}
Candidates seen in the market today (you may pick from these or suggest well-known companies you know):
${[...cand].filter(([s]) => !mine.has(s)).slice(0, 40).map(([s, w]) => `- ${s}: ${w}`).join("\n") || "- none loaded"}

${positionsLine()}\n\nSuggest ${n} stocks or ETFs this investor doesn't own or watch yet, that would fit their style and themes and balance what they hold. Use real tickers listed on major exchanges, as Yahoo Finance writes them.${strategies.some(g => g.status !== "retired") ? "\nThe investor's strategies come first: make sure ideas serve each active strategy whose timing has come or is near (for example the kind of company a strategy names, or what to buy after a planned sale), and say which strategy each idea serves. For each active strategy, also say in one or two sentences where it stands today given the positions and prices above (for example how far a stock is from its average price) and what would fit it." : ""}
Your knowledge has a cutoff, so don't claim recent events you can't see here.
JSON in this exact shape: {"ideas":[{"symbol":"TICKER","name":"company","why":"2 sentences in plain words","fit":"1 sentence on how it fits this portfolio","risk":"1 sentence on the main risk","signal":"buy|hold","serves":"strategy id like g1abc, or empty"}],"strategies":[{"id":"strategy id","note":"where it stands today and what would fit"}],"note":"one sentence about this set of ideas"}`;
    const o = parseJSON(await aiCall(TONE, user, 1800, "ideas"));
    const list = [];
    await pool((o.ideas || []).slice(0, n + 2), cfg("concurrency"), async it => {
      const sym = String(it.symbol || "").toUpperCase().trim();
      if (!sym || mine.has(sym)) return;
      try {
        const { meta, pts } = await yChart(sym, "1y", "1d");   // a year: averages, range, performance and RSI
        const q = priceFrom(meta, pts);
        const pm = { pts, price: q.price, prev: q.prev, hi52: num(meta.fiftyTwoWeekHigh), lo52: num(meta.fiftyTwoWeekLow) };
        it.__x = { st: stats(pm), trend: trendOf(pm), rsi: rsi14(pts), exch: meta.fullExchangeName || meta.exchangeName || "", tz: meta.exchangeTimezoneName || "", year: pts };
        list.push({ s: meta.symbol || sym, name: meta.longName || meta.shortName || it.name || sym, why: String(it.why || ""), fit: String(it.fit || ""), risk: String(it.risk || ""),
          signal: it.signal === "hold" ? "hold" : "buy", price: q.price, prev: q.prev, cur: meta.currency, pts: pts.slice(-23), order: (o.ideas || []).indexOf(it),
          st: it.__x.st, trend: it.__x.trend, rsi: it.__x.rsi, exch: it.__x.exch, tz: it.__x.tz, year: it.__x.year,
          serves: strategies.some(g => g.id === it.serves) ? it.serves : "" });
      } catch (e) {}   // a ticker Yahoo doesn't know is left out
    });
    list.sort((a, b) => a.order - b.order);
    // Company numbers and profile for each idea, through the same loaders the stock pages use (kept apart from your stocks)
    const tmp = list.filter(it => !market[it.s]).map(it => it.s);
    for (const it of list) market[it.s] = market[it.s] || { pts: it.year, price: it.price, prev: it.prev, cur: it.cur };
    await loadFundamentals(list.map(it => it.s)).catch(() => {});
    await pool(list, cfg("concurrency"), it => loadProfile(it.s).catch(() => {}));
    for (const it of list) {
      const m = market[it.s] || {};
      it.f = m.f || {}; it.prof = m.prof ? { sector: m.prof.sector, industry: m.prof.industry, about: m.prof.about } : null;
      delete it.year;
    }
    for (const s2 of tmp) if (!stocks.some(x => x.s === s2) && !previews.has(s2)) delete market[s2];
    const notes = {};
    for (const g of Array.isArray(o.strategies) ? o.strategies : []) if (g && strategies.some(x => x.id === g.id) && g.note) notes[g.id] = String(g.note).slice(0, 500);
    insights.ideas = { list: list.slice(0, n), notes, note: String(o.note || ""), style: settings.style, by: settings.aiProvider, model: modelFor(settings.aiProvider), at: Date.now() };
    write("insights", insights); push();
    if (!list.length) toast("No ideas could be checked against market data. Try again.");
  } catch (e) { toast("Ideas not found: " + String(e.message || e).slice(0, 90)); }
  finally { ideasBusy = false; call("onBusy", "ideas", false); }
}

// Apple's Stocks app can't export its watchlist; a screenshot of it (or any broker app) is read by AI instead.
async function importScreenshot(list) {
  if (!aiKey()) return toast("Add a Claude or OpenAI key in Settings › AI settings");
  let img;
  try { img = await Photos.fromLibrary(); } catch (e) { return; }   // cancelled
  if (!img) return;
  const s = img.size, k = Math.min(1, 1400 / Math.max(s.width, s.height));
  const dc = new DrawContext();
  dc.size = new Size(Math.round(s.width * k), Math.round(s.height * k)); dc.respectScreenScale = false;
  dc.drawImageInRect(img, new Rect(0, 0, dc.size.width, dc.size.height));
  const b64 = Data.fromJPEG(dc.getImage()).toBase64String();
  call("onBusy", "import", true);
  try {
    const out = parseJSON(await aiCall("You read stock tickers from screenshots of stock and brokerage apps. Reply with JSON only.",
      `List every stock, ETF or fund shown in this screenshot. Use the ticker exactly as shown; if only a company name is shown, give its most likely main ticker as Yahoo Finance writes it. Give "shares" only when a share count is clearly shown, otherwise null.
JSON: {"items":[{"symbol":"AAPL","name":"Apple","shares":null}]}`, 1200, "import", settings.aiProvider, [b64]));
    const items = (out.items || []).map(i => ({ tok: i.symbol || i.name, name: i.name, sh: +i.shares > 0 ? +i.shares : 0 })).filter(i => i.tok);
    if (!items.length) return toast("No tickers found in that picture");
    reportAdd(await addStocks(items, list));
  } catch (e) { toast("Screenshot not read: " + String(e.message || e).slice(0, 90)); }
  finally { call("onBusy", "import", false); }
}
function reportAdd(r) {
  saveAll(); push(); saveWidget(widgetSnapshot());
  const parts = [];
  if (r.added.length) parts.push(`Added ${r.added.length}: ${r.added.slice(0, 5).join(", ")}${r.added.length > 5 ? "…" : ""}`);
  if (r.updated.length) parts.push(`updated ${r.updated.length}`);
  if (r.missing.length) parts.push(`not found: ${r.missing.slice(0, 4).join(", ")}`);
  toast(parts.join("; ") || "Already on your lists");
  if (r.added.length && settings.ai && aiKey()) runBriefing(false);
}

// ---------- Flash: a TL;DR of one headline ----------
// The article is read here (Google News links are followed to the publisher when the page names it); paywalls, consent
// pages and apps that need JavaScript leave only the headline and summary, and the TL;DR says so.
const plain = s => decode(String(s || "").replace(/<(script|style)[\s\S]*?<\/\1>/gi, " "));
function extractArticle(html) {
  const meta = name => { const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*>`, "i")); const c = m && m[0].match(/content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i); return c ? plain(c[1] || c[2]) : ""; };
  const desc = meta("og:description") || meta("description");
  let h = html.replace(/<(script|style|noscript|svg|nav|header|footer|aside|form|iframe|figure|button)\b[\s\S]*?<\/\1>/gi, " ");
  const main = h.match(/<article[\s>][\s\S]*<\/article>/i) || h.match(/<main[\s>][\s\S]*<\/main>/i);
  if (main) h = main[0];
  const paras = (h.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || []).map(plain).filter(t => t.length >= 60);
  const text = paras.join("\n\n");
  return { desc, paras, text, words: text ? text.split(/\s+/).length : 0 };
}
// Yahoo asks visitors in Europe for cookie consent before showing an article. Stockit answers the consent form once
// (the same choice as tapping "Accept all") and keeps the cookies it gets, so later articles load directly.
let consentRun = null;
async function yahooConsent(html, pageUrl) {
  const form = (html.match(/<form[^>]*method="post"[\s\S]*?<\/form>/i) || [])[0];
  if (!form) return false;
  const action = new URL((form.match(/action="([^"]*)"/i) || [])[1] || pageUrl, pageUrl).toString();
  const fields = [];
  for (const inp of form.match(/<input[^>]+>/gi) || []) {
    const name = (inp.match(/name="([^"]+)"/i) || [])[1], val = (inp.match(/value="([^"]*)"/i) || [])[1] || "";
    if (name && /type="hidden"/i.test(inp)) fields.push(encodeURIComponent(name) + "=" + encodeURIComponent(val.replace(/&amp;/g, "&")));
  }
  fields.push("agree=agree", "agree=agree");
  const r = new Request(action);
  r.method = "POST"; r.timeoutInterval = cfg("fetchTimeout");
  r.headers = { "User-Agent": cfg("userAgent"), "Content-Type": "application/x-www-form-urlencoded" };
  r.body = fields.join("&");
  await r.loadString();
  const jar = ((r.response && r.response.cookies) || []).filter(c => c && c.name && /yahoo/i.test(c.domain || "yahoo")).map(c => c.name + "=" + c.value);
  if (jar.length) { settings.yahooCookie = jar.join("; "); write("settings", settings); }
  return true;
}
async function articleHTML(url) {
  const get = async u => {
    const r = new Request(u);
    r.timeoutInterval = cfg("fetchTimeout");
    r.headers = { "User-Agent": cfg("userAgent"), "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5", "Accept-Language": "en-US,en;q=0.8" };
    if (settings.yahooCookie && /(^|\.)yahoo\.com$/i.test((u.match(/^https?:\/\/([^/]+)/i) || [])[1] || "")) r.headers.Cookie = settings.yahooCookie;
    const html = await r.loadString();
    return { html: html || "", url: (r.response && r.response.url) || u, code: r.response ? r.response.statusCode : 0 };
  };
  if (/news\.google\.com/i.test(url)) {   // Google News links: find the publisher's address first
    const real = await googleNewsURL(url).catch(e => { console.log("Google News link: " + e); return null; });
    if (real) url = real;
  }
  let r = await get(url);
  if (/consent\.yahoo\.com|guce\.yahoo\.com/i.test(r.url)) {   // one consent answer at a time, shared by articles loading together
    consentRun = consentRun || yahooConsent(r.html, r.url).catch(e => { console.log("Yahoo consent: " + e); return false; }).finally(() => { setTimeout(() => { consentRun = null; }, 0); });
    if (await consentRun) r = await get(url);
  }
  if (/news\.google\.com/i.test(r.url)) {   // still a Google page: follow it if it names the article
    const m = r.html.match(/data-n-au="([^"]+)"/) || r.html.match(/<a[^>]+href="(https:\/\/(?![a-z.]*google\.)[^"]+)"/i);
    r = m ? await get(m[1].replace(/&amp;/g, "&")) : { html: "", url };
  }
  if (r.code >= 400 || /(^https?:\/\/)?(consent|guce)\.[a-z.]*\//i.test(r.url)) r.html = "";
  return r;
}
// Google News article links hide the publisher's address. Older ones carry it inside the id; newer ones are
// exchanged for it with the signature and timestamp on Google's article page (the method news readers use).
async function googleNewsURL(url) {
  const id = (String(url).match(/\/articles\/([^?/#]+)/) || [])[1];
  if (!id) return null;
  try {
    const b = id.replace(/-/g, "+").replace(/_/g, "/"), raw = Data.fromBase64String(b + "===".slice((b.length + 3) % 4)).toRawString() || "";
    const m = raw.match(/https?:\/\/[^\s"'<>\x00-\x1f\x7f-\uffff]+/);
    if (m && !/^AU_yq/.test(raw.slice(4))) return m[0];
  } catch (e) {}
  const page = await getText(`https://news.google.com/rss/articles/${id}`, { Accept: "text/html" });
  const sg = (page.match(/data-n-a-sg="([^"]+)"/) || [])[1], ts = (page.match(/data-n-a-ts="([^"]+)"/) || [])[1];
  if (!sg || !ts) return null;
  const inner = `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"${id}",${ts},"${sg}"]`;
  const r = new Request("https://news.google.com/_/DotsSplashUi/data/batchexecute");
  r.method = "POST"; r.timeoutInterval = cfg("fetchTimeout");
  r.headers = { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "User-Agent": cfg("userAgent") };
  r.body = "f.req=" + encodeURIComponent(JSON.stringify([[["Fbv4je", inner, null, "generic"]]]));
  const txt = await r.loadString();
  for (const line of String(txt).split("\n")) {
    if (!line.startsWith("[")) continue;
    try { for (const row of JSON.parse(line)) if (row[0] === "wrb.fr" && row[2]) { const res = JSON.parse(row[2]); if (res[0] === "garturlres" && /^https?:/.test(res[1])) return res[1]; } } catch (e) {}
  }
  const m = String(txt).match(/garturlres\\+",\\+"(https?:[^"\\]+)/);
  return m ? m[1] : null;
}
// Articles read this session, by link: a TL;DR and a stock's news story share them instead of loading pages twice.
const artMem = {};
async function readArticle(n) {
  if (artMem[n.l]) return artMem[n.l];
  let art = null, url = n.l;
  try { const r = await articleHTML(n.l); url = r.url; if (r.html) art = extractArticle(r.html); } catch (e) { console.log("Article " + n.l + ": " + e); }
  return artMem[n.l] = { art, url: /^https:\/\//i.test(url) ? url : n.l, usable: !!(art && art.words > 80) };
}
function extractiveTldr(title, art, text) {
  if (!art || !art.paras.length) return { lead: text || title, points: [] };
  const tk = s => [...new Set(String(s).toLowerCase().match(/[a-z0-9][a-z0-9'-]{3,}/g) || [])];
  const sents = [];
  art.paras.slice(0, 40).forEach((p, pi) => (p.match(/[^.!?]+[.!?]+["”’)]?(\s|$)/g) || [p]).forEach(x => {
    x = x.trim(); if (x.length >= 50 && x.length <= 300) sents.push({ s: x, pi });
  }));
  const freq = {};
  sents.forEach(x => tk(x.s).forEach(t => freq[t] = (freq[t] || 0) + 1));
  const inTitle = new Set(tk(title));
  sents.forEach((x, i) => { const ts = tk(x.s); x.i = i; x.score = ts.reduce((n, t) => n + Math.min(freq[t], 6) + (inTitle.has(t) ? 3 : 0), 0) / Math.sqrt(ts.length || 1) + (x.pi < 2 ? 2 : 0); });
  const lead = art.desc && art.desc.length > 40 ? art.desc : (sents[0] ? sents[0].s : title);
  const points = sents.filter(x => x.s !== lead && !lead.includes(x.s.slice(0, 40)))
    .sort((a, b) => b.score - a.score).slice(0, 6).sort((a, b) => a.i - b.i).map(x => x.s);
  return { lead, points };
}
async function makeNewsTldr(sym, n) {
  const m = market[sym] || {}, x = stocks.find(y => y.s === sym) || {};
  const ra = await readArticle(n), art = ra.art, usable = ra.usable;
  const text = usable ? art.text : (art && art.desc) || "";
  const base = { at: Date.now(), mins: usable ? Math.max(1, Math.round(art.words / 230)) : 0, partial: !usable, url: ra.url };
  let note = "";
  if (aiKey()) {
    try {
      const name = cleanName(m.name) || x.name || sym, dp = dayPct(m);
      const system = `You write TL;DRs of financial news for a casual long-term investor who owns or watches ${name} (${sym}). Plain words, short sentences, explain any jargon in passing.
Use only facts in what you're given. If the article text is missing, explain only what the headline and summary say and make clear the full article wasn't available. Never invent figures, quotes or events. Don't tell the reader to buy or sell.
Reply with ONLY JSON, no code fences: {"tldr":"one sentence with the gist","story":"2 or 3 short paragraphs separated by blank lines, 120 to 200 words: what happened, why, and the context the article gives, with its concrete numbers and names","points":["4 to 6 short bullets with the key facts and figures"],"why":"two or three sentences on what this could mean for ${sym} and its shareholders"}`;
      const user = `Headline: ${n.t}\nPublisher: ${n.p}\nPublished: ${dateS(n.at || Date.now())}\n${dp != null ? `${sym} moved ${dp.toFixed(2)}% today.\n` : ""}\n` +
        (usable ? "Article text:\n" + text.slice(0, cfg("tldrChars")) : text ? "Only the article's summary is available:\n" + text : "The article text is not available.");
      const j = parseJSON(await aiCall(system, user, 1500, "tldr"));
      return Object.assign(base, { kind: "ai", by: settings.aiProvider, lead: String(j.tldr || n.t).slice(0, 600), story: String(j.story || "").slice(0, 3000),
        points: (Array.isArray(j.points) ? j.points : []).map(String).slice(0, 6), why: String(j.why || "").slice(0, 800) });
    } catch (e) { note = "The AI summary failed (" + String(e.message || e).slice(0, 60) + "), so this was taken from the article instead."; }
  }
  if (!usable && !text) throw new Error("This article couldn't be read here. Open it at the source to read it");
  return Object.assign(base, { kind: "extract", note }, extractiveTldr(n.t, usable ? art : null, text));
}
// A stock's news, told as one story to listen to: its top articles are read in full (kept in memory) and
// ✦ AI weaves them into a few spoken paragraphs; without AI, each article's key sentences are read in turn.
async function makeDigest(sym, links) {
  const m = market[sym] || {}, x = stocks.find(y => y.s === sym) || {};
  const ranked = links.map(l => (m.news || []).find(h => h.l === l)).filter(Boolean).slice(0, 8);
  if (!ranked.length) throw new Error("No headlines to read for " + sym);
  // Read the top three articles; when one can't be read, read the next headline instead, until three are read.
  const want = Math.min(3, ranked.length), done = [];
  for (let k = 0; k < ranked.length && done.filter(d => d.a.usable).length < want; ) {
    const need = want - done.filter(d => d.a.usable).length, batch = ranked.slice(k, k + need);
    k += batch.length;
    (await Promise.all(batch.map(readArticle))).forEach((a, i) => done.push({ h: batch[i], a }));
  }
  const readOnes = done.filter(d => d.a.usable).slice(0, want);
  const headOnly = ranked.slice(0, want).filter(h => !readOnes.some(d => d.h === h));
  const used = readOnes.concat(headOnly.map(h => ({ h, a: done.find(d => d.h === h) ? done.find(d => d.h === h).a : { art: null, usable: false } })));
  const others = (m.news || []).filter(h => !used.some(d => d.h === h)).slice(0, 8);
  const base = { at: Date.now(), n: used.length, read: readOnes.length, tried: done.length,
    sources: used.map(d => ({ t: d.h.t, p: d.h.p, l: d.a.url || d.h.l, read: !!d.a.usable, words: d.a.usable ? d.a.art.words : 0 })) };
  const name = cleanName(m.name) || x.name || sym;
  let note = readOnes.length < want ? `Read ${readOnes.length} of ${want} articles in full; the rest are told from their headlines.` : "";
  if (aiKey()) {
    try {
      const dp = dayPct(m), per = Math.max(3000, Math.floor(cfg("tldrChars") * 2 / Math.max(1, readOnes.length)));
      const system = `You are the news presenter in a stock app, telling a casual long-term investor who owns or watches ${name} (${sym}) what the latest news says. Your words are read aloud by a voice.
Weave the articles into one story: lead with what matters most, then go through what each article reports in detail — the facts, numbers, names, quotes and reasons it gives — connect the pieces, explain jargon in passing, and say where facts come from in words ("Reuters reports…").
Use only facts in the material given. For items with only a headline, say briefly what the headline reports and that the full article wasn't available. Never invent figures, quotes or events. Don't tell the listener to buy or sell.
Written for the ear: no bullet points, lists, brackets, tables, URLs or emoji; spell out symbols where it helps ("percent", "billion").
Length: 350 to 550 words in 4 to 6 paragraphs when full articles are given; shorter only if there is genuinely little to say.
Reply with ONLY JSON, no code fences: {"title":"at most 10 words","story":"the paragraphs, separated by blank lines","takeaway":"one or two sentences on what it could mean for ${sym}"}`;
      const facts = [dp != null ? `${sym} moved ${dp.toFixed(2)}% today.` : "", m.f && m.f.rating ? `Analysts' average rating: ${m.f.rating}.` : ""].filter(Boolean).join(" ");
      const user = `Today is ${dateS(Date.now())}. ${facts}\n\n` + used.map((d, i) => `Article ${i + 1}: ${d.h.t}\nFrom ${d.h.p}, ${dateS(d.h.at || Date.now())}\n` +
          (d.a.usable ? "Full text:\n" + d.a.art.text.slice(0, per) : d.a.art && d.a.art.desc ? "Only its summary is available: " + d.a.art.desc : "Only the headline is available.")).join("\n\n---\n\n") +
        (others.length ? "\n\n---\n\nOther recent headlines, for context only:\n" + others.map(h => `- ${h.t} (${h.p}, ${dateS(h.at || Date.now())})`).join("\n") : "");
      let j = parseJSON(await aiCall(system, user, 2600, "digest"));
      const words = t => String(t || "").split(/\s+/).filter(Boolean).length;
      if (readOnes.length && words(j.story) < 250) {   // too thin for the material given: ask once more, longer
        const again = parseJSON(await aiCall(system, user + `\n\nYour last story was only ${words(j.story)} words. Write the full 350 to 550 words, going through each article's details.`, 2600, "digest"));
        if (words(again.story) > words(j.story)) j = again;
      }
      return Object.assign(base, { kind: "ai", by: settings.aiProvider, note, title: String(j.title || name + " in the news").slice(0, 140),
        story: String(j.story || "").slice(0, 9000), takeaway: String(j.takeaway || "").slice(0, 700), words: words(j.story) });
    } catch (e) { note = "The AI story failed (" + String(e.message || e).slice(0, 60) + "), so these are the articles' key sentences."; }
  }
  const parts = used.map(d => {
    const t = extractiveTldr(d.h.t, d.a.usable ? d.a.art : null, (d.a.art && d.a.art.desc) || "");
    return [d.h.t + ". From " + d.h.p + "."].concat(t.lead && t.lead !== d.h.t ? [t.lead] : []).concat(t.points.slice(0, 6)).join(" ");
  });
  return Object.assign(base, { kind: "extract", note, title: name + " in the news", story: parts.join("\n\n"), takeaway: "" });
}
function pruneTldrs() { Object.keys(tldrs).sort((a, b) => tldrs[b].at - tldrs[a].at).slice(150).forEach(k => delete tldrs[k]); }

// ---------- read aloud: ✦ AI voice from OpenAI's speech endpoint (Claude's API has no speech output) ----------
const TTS_LEGACY_VOICES = ["alloy", "ash", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer"];   // all tts-1 and tts-1-hd can use
async function aiSpeech(text) {
  const key = keyFor("openai");
  if (!key) throw new Error("AI voices need an OpenAI key");
  const model = settings.ttsModel || "gpt-4o-mini-tts", legacy = /^tts-1/.test(model);
  let voice = settings.ttsVoice || "coral";
  if (legacy && !TTS_LEGACY_VOICES.includes(voice)) voice = "coral";
  const body = { model, voice, input: String(text).slice(0, 4096), response_format: "mp3" };
  if (!legacy && settings.ttsInstructions) body.instructions = String(settings.ttsInstructions).slice(0, 500);
  const speed = Number(settings.voiceRate) || 1;
  if (speed !== 1) body.speed = speed;
  const r = new Request("https://api.openai.com/v1/audio/speech");
  r.method = "POST"; r.timeoutInterval = 60;
  r.headers = { "Authorization": "Bearer " + key, "Content-Type": "application/json" };
  r.body = JSON.stringify(body);
  const data = await r.load();
  const code = r.response && r.response.statusCode;
  if (code !== 200) {
    let msg = `HTTP ${code}`;
    try { msg = JSON.parse(data.toRawString()).error.message || msg; } catch (e) {}
    throw new Error(msg);
  }
  recordUsage("openai", model, "speech", 0, 0, body.input.length);
  return data.toBase64String();
}

// ---------- Check my portfolio: your broker's screenshots compared with Stockit ----------
// ✦ AI reads the positions; Stockit matches them with your stocks and lists every difference as a suggestion.
// Nothing changes until you tap Apply on a suggestion.
let checkBusy = false, check = null;
function toJPEG(img, maxSide = 1600) {
  const s = img.size, k = Math.min(1, maxSide / Math.max(s.width, s.height));
  const dc = new DrawContext();
  dc.size = new Size(Math.round(s.width * k), Math.round(s.height * k)); dc.respectScreenScale = false;
  dc.drawImageInRect(img, new Rect(0, 0, dc.size.width, dc.size.height));
  return Data.fromJPEG(dc.getImage()).toBase64String();
}
// Screenshots chosen for a check, one at a time, shown to you before anything is read; kept for this run only.
let checkShots = [];   // [{ full: base64 JPEG for AI, thumb: small base64 JPEG for the page }]
async function addCheckShot() {
  if (checkBusy) return;
  if (checkShots.length >= cfg("checkMaxShots")) return toast(`Up to ${cfg("checkMaxShots")} screenshots per check (Settings › Portfolio check)`);
  let img;
  try { img = await Photos.fromLibrary(); } catch (e) { return; }   // cancelled
  if (!img) return;
  checkShots.push({ full: toJPEG(img, 1600), thumb: toJPEG(img, 360) });
  push();
}
async function ensureRate(cur) {   // a rate to your currency for a screenshot's currency, if Stockit doesn't have it yet
  const [c] = normCur(cur), home = homeCur();
  if (!c || c === home || fxRates[c + home]) return;
  try { const { meta, pts } = await yChart(`${c}${home}=X`, "5d", "1d"); const q = priceFrom(meta, pts); if (q.price) fxRates[c + home] = { rate: q.price, prev: q.prev || q.price, at: Date.now() }; } catch (e) {}
}
function convertCur(v, from, to) {   // between any two currencies, through yours; null when a rate is missing
  if (v == null || !isFinite(v)) return null;
  const [f, kf] = normCur(from), [t, kt] = normCur(to);
  if (f === t) return v / kf * kt;
  const rf = fxRate(f), rt = fxRate(t);
  return rf != null && rt != null ? v / kf * rf / rt * kt : null;
}
const nameKey = n => cleanName(n).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
function matchPosition(p, pool2) {
  const sym = String(p.symbol || "").toUpperCase().replace(/^\$/, "").trim(), base = s2 => String(s2).split(/[.:\s-]/)[0];
  let x = sym && (pool2.find(y => y.s === sym) || pool2.find(y => base(y.s) === base(sym)));
  if (!x && p.name) {
    const n = nameKey(p.name), first = n.split(" ")[0];
    x = pool2.find(y => { const yn = nameKey((market[y.s] || {}).name || y.name || ""); return yn && (yn === n || (first.length > 2 && yn.split(" ")[0] === first)); });
  }
  return x || null;
}
// What a position's total value (and gain) on the broker's screenshot says about its shares and average price,
// for brokers and banks that show only the price and the position's value. Value in another currency than the
// price (a USD stock valued in EUR) goes through today's rate, so its share count is approximate.
function fromValue(p, cur, yahooPrice) {
  const vc = p.valueCurrency || p.currency || cur, px = convertCur(p.price, p.currency || cur, cur) || yahooPrice;
  const val = convertCur(p.value, vc, cur);
  if (val == null || !px) return {};
  const same = normCur(vc)[0] === normCur(cur)[0], raw = val / px, near = Math.round(raw), tol = same ? 0.005 : 0.02;
  const sh = near > 0 && Math.abs(raw - near) / raw < tol ? near : round(raw, 2);
  const gc = p.gainCurrency || vc;
  // Average price from the gain only when value, gain and stock share one currency: brokers count a foreign
  // stock's gain at the exchange rates of the day you bought, which Stockit doesn't know.
  const cost = p.gain != null && same && normCur(gc)[0] === normCur(cur)[0] && sh > 0 ? (p.value - p.gain) / sh * (convertCur(1, vc, cur) || 1) : null;
  return { sh, raw, exact: sh === near, cost, same, vc, tol };
}
async function runCheck() {
  if (checkBusy) return;
  if (!aiKey()) return toast("Add a Claude or OpenAI key in Settings › AI settings");
  const shots = checkShots.map(x => x.full);
  if (!shots.length) return toast("Add a screenshot first");
  const prog = (p, label) => call("onCheckProgress", p, label);
  checkBusy = true; call("onBusy", "check", true);
  prog(0.04, `Preparing ${shots.length} screenshot${shots.length === 1 ? "" : "s"}…`);
  try {
    prog(0.08, "Reading your screenshots with ✦ AI…");
    const o = parseJSON(await aiCall("You read brokerage and portfolio screenshots precisely, digit by digit. Reply with JSON only.",
      `These ${shots.length} screenshot${shots.length === 1 ? "" : "s"} show one investment portfolio, possibly scrolled across several screens: list each position once, even if it appears twice.
For every position give exactly what is shown: the ticker if shown (else null), the name as shown, the ISIN if shown, the number of shares or units, the average purchase price per share, the current price per share and its currency, the position's total market value and its currency (often different from the price's, e.g. a USD price with a EUR value), and the unrealised gain or loss shown for the position (an amount, negative when down, with its currency, and the percentage).
Cash and bank accounts are not positions. Ignore account numbers (IBANs), names and other personal identifiers; never include them.
Use null for anything not shown. Never calculate or guess a number that isn't on screen. Read decimal commas correctly (1.234,56 is one thousand two hundred thirty-four point fifty-six).
Also give the broker or app name and the portfolio total if they are shown.
JSON: {"broker":null,"total":null,"totalCurrency":null,"positions":[{"symbol":"NVDA","name":"NVIDIA Corp","isin":null,"shares":30,"avgPrice":96.0,"price":143.61,"currency":"USD","value":3964.1,"valueCurrency":"EUR","gain":713.44,"gainCurrency":"EUR","gainPct":12.27}]}`,
      3000, "check", settings.aiProvider, shots));
    const num2 = v => {   // numbers as shown: 1,234.56 and 1.234,56 both read right
      if (v == null || v === "") return null;
      if (typeof v === "number") return isFinite(v) ? v : null;
      let t = String(v).replace(/[^\d.,-]/g, "");
      const lc = t.lastIndexOf(","), ld = t.lastIndexOf(".");
      if (lc > ld && !(ld === -1 && /,\d{3}$/.test(t) && t.split(",").length > 1 && !/,\d{1,2}$/.test(t))) t = t.replace(/\./g, "").replace(",", ".");
      else t = t.replace(/,/g, "");
      const k = parseFloat(t); return isFinite(k) ? k : null;
    };
    const pos = (Array.isArray(o.positions) ? o.positions : []).map(p => ({ symbol: p.symbol ? String(p.symbol).trim() : "", name: String(p.name || "").trim(), isin: p.isin || "",
      shares: num2(p.shares), avgPrice: num2(p.avgPrice), price: num2(p.price), value: num2(p.value), currency: p.currency ? String(p.currency).trim() : "",
      valueCurrency: p.valueCurrency ? String(p.valueCurrency).trim() : "", gain: num2(p.gain), gainCurrency: p.gainCurrency ? String(p.gainCurrency).trim() : "", gainPct: num2(p.gainPct) })).filter(p => p.symbol || p.name);
    if (!pos.length) { toast("No positions found in those screenshots"); return; }
    prog(0.62, `Read ${pos.length} position${pos.length === 1 ? "" : "s"}. Comparing with Stockit…`);
    for (const c of new Set(pos.flatMap(p => [p.currency, p.valueCurrency, p.gainCurrency]).filter(Boolean))) await ensureRate(c);
    const items = [], used = new Set(), pTol = cfg("checkPriceTol"), cTol = cfg("checkCostTol");
    let n = 0;
    for (const p of pos) {
      prog(0.62 + 0.34 * n / pos.length, `Checking ${p.symbol || p.name} (${n + 1} of ${pos.length})…`);
      const id = "c" + (n++);
      const x = matchPosition(p, stocks.filter(y => !used.has(y.s)));
      if (x) {
        used.add(x.s);
        const m = market[x.s] || {}, cur = m.cur || p.currency || "USD", pc = p.currency || cur;
        const shotPrice = convertCur(p.price, pc, cur), shotCost = convertCur(p.avgPrice, pc, cur);
        const gap = shotPrice != null && m.price ? (shotPrice / m.price - 1) * 100 : null;
        const dv = fromValue(p, cur, m.price), sh = p.shares != null ? p.shares : dv.sh, cost = shotCost != null ? shotCost : dv.cost;
        const diffs = [];
        if (x.list !== "own") diffs.push("watch");
        if (sh != null && Math.abs(sh - (x.sh || 0)) / Math.max(sh, x.sh || 0, 1e-9) > (p.shares != null ? 1e-6 : dv.tol)) diffs.push("shares");
        if (cost != null && (!x.cost || Math.abs(cost / x.cost - 1) * 100 > cTol)) diffs.push("cost");
        if (gap != null && Math.abs(gap) > pTol) diffs.push("price");
        if (p.shares != null && dv.sh != null && Math.abs(dv.raw / p.shares - 1) > 0.02) diffs.push("value");   // shares and value disagree: likely misread
        const mineValue = convertCur((x.sh || 0) * (shotPrice || m.price || 0), cur, dv.vc || cur);
        items.push({ id, kind: x.list !== "own" ? "watch" : diffs.length ? "differs" : "match", s: x.s, name: m.name || x.name || x.s, cur, shot: p, shotCur: pc,
          mine: { sh: x.sh || 0, cost: x.cost || 0, price: m.price != null ? m.price : null, value: mineValue }, diffs, gap, dv,
          partial: sh == null && cost == null,   // only the price could be compared
          suggest: { sh: sh != null ? sh : x.sh || 0, cost: cost != null ? round(cost, cost < 10 ? 4 : 2) : x.cost || 0 }, converted: normCur(pc)[0] !== normCur(cur)[0] });
      } else {
        const r = await resolveSymbol(p.symbol || p.name).catch(() => null);
        let cur = p.currency || "USD", price = null;
        if (r) { try { const { meta, pts } = await yChart(r.s, "5d", "1d"); cur = meta.currency || cur; price = priceFrom(meta, pts).price; } catch (e) {} }
        const shotPrice = convertCur(p.price, p.currency || cur, cur), shotCost = convertCur(p.avgPrice, p.currency || cur, cur);
        const gap = shotPrice != null && price ? (shotPrice / price - 1) * 100 : null;
        const dv = fromValue(p, cur, price);
        items.push({ id, kind: "missing", dv, s: r ? r.s : null, name: (r && r.name) || p.name || p.symbol, cur, shot: p, shotCur: p.currency || cur, yahooPrice: price, gap,
          diffs: gap != null && Math.abs(gap) > pTol ? ["price"] : [], suggest: { sh: p.shares || dv.sh || 0, cost: shotCost != null ? round(shotCost, shotCost < 10 ? 4 : 2) : dv.cost != null ? round(dv.cost, dv.cost < 10 ? 4 : 2) : 0 }, converted: !!p.currency && normCur(p.currency)[0] !== normCur(cur)[0] });
      }
    }
    for (const x of stocks.filter(y => y.list === "own" && !used.has(y.s)))
      items.push({ id: "c" + (n++), kind: "extra", s: x.s, name: (market[x.s] || {}).name || x.name || x.s, cur: (market[x.s] || {}).cur || "", mine: { sh: x.sh || 0, cost: x.cost || 0, price: (market[x.s] || {}).price }, diffs: [] });
    const tot = totals()[0];
    prog(1, "Done");
    check = { at: Date.now(), shots: shots.length, thumbs: checkShots.map(x => x.thumb), broker: o.broker ? String(o.broker).slice(0, 60) : "", n: pos.length, items,
      total: num2(o.total), totalCur: o.totalCurrency ? String(o.totalCurrency) : "", mineTotal: tot ? { v: tot.value, cur: tot.cur } : null,
      totalInMine: tot && num2(o.total) != null ? convertCur(num2(o.total), o.totalCurrency || tot.cur, tot.cur) : null, by: settings.aiProvider };
    push();
  } catch (e) { toast("Screenshots not read: " + String(e.message || e).slice(0, 90)); }
  finally { checkBusy = false; call("onBusy", "check", false); }
}
async function applyCheck(m) {
  const it = check && check.items.find(i => i.id === m.id);
  if (!it || it.resolved) return;
  const n = v => { const k = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(k) && k >= 0 ? k : 0; };
  const x = it.s && stocks.find(y => y.s === it.s);
  if (m.k === "update" || m.k === "own") {
    if (!x) return;
    x.sh = n(m.sh); x.cost = n(m.cost); if (x.sh > 0) x.list = "own";
    it.resolved = m.k === "own" ? "Moved to your portfolio" : "Updated";
  } else if (m.k === "add") {
    if (!it.s) return;
    const r = await addStocks([{ s: it.s, name: it.name, sh: n(m.sh), cost: n(m.cost) }], "own");
    it.resolved = r.added.length || r.updated.length ? "Added to your portfolio" : "Couldn't add";
  } else if (m.k === "watch") {
    if (!x) return; x.list = "watch"; it.resolved = "Moved to your watchlist";
  } else if (m.k === "remove") {
    if (!x) return;
    stocks = stocks.filter(y => y.s !== it.s); delete market[it.s]; delete insights.stories[it.s];
    it.resolved = "Removed";
  } else if (m.k === "ignore") it.resolved = "Ignored";
  saveAll(); push(); saveWidget(widgetSnapshot());
}

// ---------- ✦ Suggested strategies: plans drawn from your portfolio, watchlist and strategies, kept fresh ----------
// Refreshed when they're older than Settings › Strategy suggestions (every day by default), because prices and
// exchange rates move; each run also updates "Where it stands" for your own active strategies.
let stratBusy = false;
function stratDue() {
  const h = cfg("stratEvery"), g = insights.stratSuggest;
  return h > 0 && stocks.length > 0 && settings.aiStrat !== false && !!aiKey() && (!g || Date.now() - g.at > h * 3600e3);
}
async function runStratSuggest(force) {
  if (stratBusy || (!force && !stratDue())) return;
  if (!aiKey()) return toast("Add a Claude or OpenAI key in Settings › AI settings");
  stratBusy = true; call("onBusy", "strat", true);
  try {
    const tot = totals()[0], home = homeCur();
    const watch = stocks.filter(x => x.list !== "own").map(x => { const m = market[x.s] || {}, st = stats(m), tr = trendOf(m);
      return `${x.s} (${m.name || x.name || x.s})${m.price != null ? ", " + fx(m.price) + " " + (m.cur || "") : ""}${st.p6m != null ? ", " + sx(st.p6m) + " in 6 months" : ""}${tr ? ", " + tr.trend : ""}`; });
    const own = stocks.filter(x => x.list === "own").map(x => { const m = market[x.s] || {}, st = stats(m), tr = trendOf(m), sector = m.prof && m.prof.sector;
      return `${x.s} (${m.name || x.name || x.s}${sector ? ", " + sector : ""})${st.p6m != null ? ", " + sx(st.p6m) + " in 6 months" : ""}${tr ? ", " + tr.trend : ""}`; });
    const n = cfg("stratCount"), act = strategies.filter(g => g.status !== "retired");
    const user = `Today is ${dateS(Date.now())}. Investing style: ${STYLE[settings.style] || STYLE.balanced}.${planLine()}${positionsLine()}
${tot ? `Portfolio value: ${fx(tot.value)} ${tot.cur}, ${sx(tot.value - tot.day ? tot.day / (tot.value - tot.day) * 100 : 0)} today. The investor counts their money in ${home}.` : ""}
Owned: ${own.join("; ") || "nothing yet"}.
Watching: ${watch.join("; ") || "nothing"}.
Themes they like: ${cfg("ideaThemes").filter(Boolean).join("; ")}.

Suggest ${n} new strategies this investor could adopt, different from their own strategies above: concrete plans for this portfolio and watchlist, such as rebalancing, trimming or adding to a position under a condition, using a watchlist stock, spreading risk across sectors or currencies, or how to carry out one of their own strategies. Name the tickers involved. Write each in the first person, the way the investor would write it in their notes, with a timing or condition, and say why with the numbers above. Don't repeat or merely rephrase their strategies.
${act.length ? "Also, for each of their own active strategies, say in one or two sentences where it stands today given these prices." : ""}
JSON in this exact shape: {"strategies":[{"text":"1 or 2 sentences, first person","when":"timing or condition, short","why":"1 or 2 sentences with the numbers that support it","tickers":["NVDA"]}],"notes":[{"id":"strategy id","note":"where it stands today"}]}`;
    const o = parseJSON(await aiCall(TONE, user, 1800, "strategies"));
    const list = (Array.isArray(o.strategies) ? o.strategies : []).filter(g => g && g.text).slice(0, n).map((g, i) => ({
      id: "s" + Date.now().toString(36) + i, text: String(g.text).slice(0, 600), when: String(g.when || "").slice(0, 80), why: String(g.why || "").slice(0, 500),
      tickers: (Array.isArray(g.tickers) ? g.tickers : []).map(String).slice(0, 6) }));
    const notes = {};
    for (const x of Array.isArray(o.notes) ? o.notes : []) if (x && x.note && strategies.some(g => g.id === x.id)) notes[x.id] = String(x.note).slice(0, 500);
    insights.stratSuggest = { at: Date.now(), list, notes, by: settings.aiProvider, model: modelFor(settings.aiProvider), cur: home };
    write("insights", insights); push();
  } catch (e) { toast("Strategies not suggested: " + String(e.message || e).slice(0, 90)); }
  finally { stratBusy = false; call("onBusy", "strat", false); }
}

// ---------- in-app updates (app-blueprints · in-app-updates) ----------
// Compares "1.10.0" and "1.9.2" as numbers: returns 1, 0 or -1.
function cmpVer(a, b) {
  const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}
function updateSnoozed() {
  try {
    return Keychain.contains(KC_UPDATE_SNOOZE) && Date.now() < +Keychain.get(KC_UPDATE_SNOOZE);
  } catch (e) { return false; }
}
function snoozeUpdate() {
  Keychain.set(KC_UPDATE_SNOOZE, String(Date.now() + UPDATE_SNOOZE_MS));
}
function clearUpdateSnooze() {
  if (Keychain.contains(KC_UPDATE_SNOOZE)) Keychain.remove(KC_UPDATE_SNOOZE);
}
async function checkForUpdate(force = false) {
  if (!force && (settings.checkUpdates === false || updateSnoozed())) return null;
  try {
    const req = new Request(`${REPO_RAW}releases.json?t=${Date.now()}`);
    req.timeoutInterval = 10;
    const data = await req.loadJSON();
    if (!data || !Array.isArray(data.releases)) return null;
    const newer = data.releases
      .filter(r => r && r.version && cmpVer(r.version, VERSION) > 0)
      .sort((x, y) => cmpVer(y.version, x.version));
    if (!newer.length) return null;
    // The newest release's highlights first, topped up from older versions the user skipped.
    const highlights = [];
    newer.forEach(r => (r.highlights || []).forEach(h => {
      if (highlights.length < 3 && h && h.title) highlights.push(h);
    }));
    return {
      current: VERSION, latest: newer[0].version, title: newer[0].title || '',
      skipped: newer.length, highlights, script: data.script || SCRIPT_FILE,
    };
  } catch (e) {
    console.log('Update check skipped: ' + e);
    return null;
  }
}
async function applyUpdate(info) {
  const req = new Request(`${REPO_RAW}${encodeURI((info && info.script) || SCRIPT_FILE)}?t=${Date.now()}`);
  req.timeoutInterval = 30;
  const code = await req.loadString();
  const okStatus = req.response && req.response.statusCode === 200;
  const m = code && code.match(/const VERSION = '([^']+)'/);
  // 1. A real script for THIS app, not an error page or another project's file
  if (!okStatus || !m || !code.includes(`const APP_ID = '${APP_ID}'`)) {
    throw new Error("The download didn't look right. Try again later.");
  }
  // 2. Actually newer: GitHub's cache can serve the old file for a few minutes after a release
  if (cmpVer(m[1], VERSION) <= 0) {
    throw new Error('GitHub is still serving the old version. Try again in a few minutes.');
  }
  // 3. Write it where the running script lives (iCloud or on the phone)
  const path = module.filename;
  let ufm = FileManager.local();
  try {
    const ic = FileManager.iCloud();
    if (path.startsWith(ic.documentsDirectory())) ufm = ic;
  } catch (e) {}
  ufm.writeString(path, code);
  return m[1];   // the version now installed
}
let pendingUpdate = null, updateChecked = false;
const offerUpdate = () => { if (pendingUpdate) call("__showUpdate", pendingUpdate); };

// ---------- state sent to the UI ----------
// The signal shown for a stock: the newer of its own story and the portfolio briefing.
const tldrId = l => { let h = 5381; const s = String(l); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
function sigFor(sym) {
  const st = insights.stories[sym], b = insights.briefing, bs = b && b.stocks && b.stocks[sym];
  if (st && (!bs || st.at >= b.at)) return { signal: st.signal, confidence: st.confidence, line: st.reasons && st.reasons[0] || "", by: st.by, at: st.at };
  if (bs) return Object.assign({}, bs, { by: b.by, at: b.at });
  return null;
}
// A stock you're looking at from Ideas, without adding it: loaded like a stock on your lists, kept for this run only.
const previews = new Set();
async function openPreview(sym) {
  sym = String(sym || "").toUpperCase().trim();
  if (!sym || stocks.some(x => x.s === sym)) return push();
  previews.add(sym); push();
  try { await loadPrices(sym); } catch (e) { market[sym] = Object.assign(market[sym] || {}, { err: String(e.message || e).slice(0, 80) }); }
  push();
  await Promise.all([loadNews(sym).catch(() => {}), loadCrowd(sym).catch(() => {}), loadFundamentals([sym]).catch(() => {}), loadProfile(sym).catch(() => {})]);
  push();
}
function clientState() {
  const tot = totals();
  const view = x => {
      const m = market[x.s] || {};
      return {
        s: x.s, name: m.name || x.name || x.s, exch: m.exch || x.exch || "", list: x.list, sh: x.sh || 0, cost: x.cost || 0,
        price: m.price, prev: m.prev, cur: m.cur || "", mt: m.mt || 0, tz: m.tz || "", tp: m.tp || null, type: m.type || "", at: m.at || 0, err: m.err || null, pts: m.pts || [],
        st: stats(m), trend: trendOf(m), f: m.f || {}, fAt: m.fAt || 0, prof: m.prof || null, news: m.news || [], newsAt: m.newsAt || 0, crowd: m.crowd || null,
        sig: sigFor(x.s), bstory: insights.briefing && insights.briefing.stocks && insights.briefing.stocks[x.s] ? insights.briefing.stocks[x.s].story : "",
        story: insights.stories[x.s] || null,
      };
    };
  return {
    stocks: stocks.map(view),
    previews: [...previews].filter(s => market[s] && !stocks.some(x => x.s === s)).map(s => view({ s, name: market[s].name || s, exch: "", list: "preview", sh: 0, cost: 0 })),
    totals: tot,
    briefing: insights.briefing ? Object.assign({}, insights.briefing, { stocks: undefined, stale: insights.briefing.sig !== briefingSig() }) : null,
    ideas: insights.ideas,
    strategies,
    fx: (() => { const home = homeCur(), rates = {};
      for (const [k, r] of Object.entries(fxRates)) if (k.endsWith(home) && k.length === home.length + 3) rates[k.slice(0, 3)] = { rate: r.rate, prev: r.prev, at: r.at };
      return { home, choice: settings.homeCur || "auto", rates, curs: HOME_CURS }; })(),
    busy: { briefing: briefingBusy, ideas: ideasBusy, stories: [...storyBusy], check: checkBusy, strat: stratBusy },
    stratSuggest: insights.stratSuggest || null,
    check, checkShots: checkShots.map(x => x.thumb),
    ai: {
      provider: settings.aiProvider,
      keys:  Object.fromEntries(Object.keys(PROVIDERS).map(p => [p, maskKey(keyFor(p))])),
      model: Object.fromEntries(Object.keys(PROVIDERS).map(p => [p, modelFor(p)])),
      models: settings.models || {}, usage, today: dayKey(),
    },
    secrets: Object.fromEntries(Object.keys(SECRETS).map(id => [id, { name: SECRETS[id].name, hint: SECRETS[id].hint, last4: (secretFor(id) || "").slice(-4) || null }])),
    cfg: Object.fromEntries(CFG_FLAT.map(d => [d.k, cfg(d.k)])),
    cfgSchema: CONFIG.map(([title, items]) => ({ title, items })),
    settings: {
      tab: settings.tab, sort: settings.sort, range: settings.range, addTo: settings.addTo, refreshOnOpen: settings.refreshOnOpen !== false,
      widgetMoney: !!settings.widgetMoney, newsYahoo: settings.newsYahoo !== false, newsWeb: settings.newsWeb !== false, crowd: settings.crowd !== false,
      style: settings.style, ai: settings.ai, aiProvider: settings.aiProvider, hasKey: !!aiKey(), checkUpdates: settings.checkUpdates !== false,
      theme: settings.theme, density: settings.density, font: settings.font, textSize: settings.textSize,
      speechEngine: settings.speechEngine || "device", voiceURI: settings.voiceURI || "", voiceRate: settings.voiceRate || 1, voicePitch: settings.voicePitch || 1,
      voiceGender: settings.voiceGender || "all", ttsModel: settings.ttsModel || "gpt-4o-mini-tts", ttsVoice: settings.ttsVoice || "coral",
      ttsInstructions: settings.ttsInstructions || "", hasOpenAI: !!keyFor("openai"), flashFold: settings.flashFold || {}, ideasFold: settings.ideasFold || {}, checkIntro: settings.checkIntro || 0, aiStrat: settings.aiStrat !== false, privacy: !!settings.privacy,
    },
    ttsModels: settings.ttsModels || null,
    lastRefresh: settings.lastRefresh, palettes: PALETTES, version: VERSION,
    blueprints: BLUEPRINTS, blueprintsRepo: BLUEPRINTS_REPO, appName: APP,
  };
}
const safeJSON = x => JSON.stringify(x === undefined ? null : x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/<\//g, "<\\/");

// ---------- UI ----------
// The WebView is built in main() only, so a widget run never builds one (app-blueprints · widgets, Step 4).
let wv = null;
const call = (fn, ...args) => wv ? wv.evaluateJavaScript(`window.${fn} && window.${fn}(${args.map(safeJSON).join(",")})`, false).catch(() => {}) : Promise.resolve();
const toast = msg => call("toast", msg);
const push = () => call("recv", clientState());

// Shares and average price, in a native prompt (decimal keypad).
async function editHolding(x) {
  const m = market[x.s] || {};
  const al = new Alert();
  al.title = `${x.s}: your shares`;
  al.message = `How many shares you own, and the average price you paid per share${m.cur ? " in " + m.cur : ""}. Leave the price empty if you don't know it.`;
  al.addTextField("Shares", x.sh ? String(x.sh) : "").setDecimalPadKeyboard();
  al.addTextField(`Average price${m.cur ? " (" + m.cur + ")" : ""}`, x.cost ? String(x.cost) : "").setDecimalPadKeyboard();
  al.addAction("Save");
  al.addCancelAction("Cancel");
  if (await al.present() !== 0) return false;
  const n = v => { const k = parseFloat(String(v || "").replace(",", ".")); return isFinite(k) && k > 0 ? k : 0; };
  x.sh = n(al.textFieldValue(0)); x.cost = n(al.textFieldValue(1));
  if (x.sh > 0) x.list = "own";
  return true;
}
async function askSecret(id) {
  const d = SECRETS[id], cur = secretFor(id);
  const al = new Alert();
  al.title = d.name;
  al.message = (cur ? `The saved key ends in …${cur.slice(-4)}. Paste a new key to replace it. ` : "") + d.hint + " Stored in the iOS Keychain on this device only.";
  al.addSecureTextField("Key", "");
  al.addAction("Save key");
  al.addCancelAction("Cancel");
  if (await al.present() !== 0) return false;
  const v = al.textFieldValue(0).trim();
  if (!v) return false;
  Keychain.set(d.key, v);
  return true;
}

const hist = {};   // charts beyond the daily year (a day, a week, five years), kept in memory for this run
async function handle(m) {
  const x = m.s ? stocks.find(y => y.s === m.s) : null;
  switch (m.type) {
    // updates first: they must work whatever state the app's data is in
    case "update-later": snoozeUpdate(); pendingUpdate = null; return;
    case "update-now": {
      let ok = false, msg = "";
      try { msg = await applyUpdate(pendingUpdate); ok = true; pendingUpdate = null; clearUpdateSnooze(); }
      catch (e) { msg = String(e.message || e); }
      return call("__done", m.req, ok, msg);
    }
    case "updcheck": {
      clearUpdateSnooze();
      const u = await checkForUpdate(true);
      await call("__done", m.req, true, u ? `Version ${u.latest} is available` : `You're on the latest version (${VERSION})`);
      if (u) { pendingUpdate = u; offerUpdate(); }
      return;
    }
    case "secret-set": if (SECRETS[m.v] && await askSecret(m.v)) { toast(`${SECRETS[m.v].name} saved`); runRefresh(true); } return push();
    case "secret-remove": if (SECRETS[m.v] && Keychain.contains(SECRETS[m.v].key)) { Keychain.remove(SECRETS[m.v].key); toast(`${SECRETS[m.v].name} removed`); } return push();
    case "state": return push();
    case "set":
      if (["tab", "sort", "range", "addTo", "refreshOnOpen", "widgetMoney", "newsYahoo", "newsWeb", "crowd", "style", "ai", "theme", "density", "font", "textSize", "checkUpdates", "aiStrat", "privacy",
        "speechEngine", "voiceURI", "voiceRate", "voicePitch", "voiceGender", "ttsModel", "ttsVoice", "ttsInstructions"].includes(m.k)) settings[m.k] = m.v;
      if (m.k === "ideasFold" && m.v && typeof m.v === "object" && !Array.isArray(m.v)) settings.ideasFold = { strat: !!m.v.strat, themes: !!m.v.themes, ideas: !!m.v.ideas };
      if (m.k === "flashFold" && m.v && typeof m.v === "object" && !Array.isArray(m.v))   // folded Flash cards, kept for stocks you follow
        settings.flashFold = Object.fromEntries(Object.entries(m.v).filter(([s, t]) => stocks.some(x => x.s === s) && isFinite(t)));
      if (m.k === "homeCur" && (m.v === "auto" || HOME_CURS.includes(m.v))) settings.homeCur = m.v;
      if (m.k === "checkIntro" && isFinite(m.v)) settings.checkIntro = Math.max(0, Math.min(99, +m.v));
      write("settings", settings);
      if (m.k === "homeCur") { await loadFx().catch(() => {}); push(); }
      if (m.k === "widgetMoney" || m.k === "homeCur" || m.k === "privacy") saveWidget(widgetSnapshot());
      return;
    case "cfg": {
      if (m.k === "*") settings.cfg = {}; else setCfg(m.k, m.v);
      if (m.k === "*" || m.k === "newsPerStock") for (const k of Object.keys(market)) if (market[k].news) market[k].news = market[k].news.slice(0, cfg("newsPerStock"));
      saveAll(); return push();
    }
    case "refresh": return runRefresh(!!m.force);
    case "search": {
      let res = [];
      try { res = await searchSymbols(String(m.q || "").slice(0, 80)); } catch (e) { toast("Search failed: " + String(e.message || e).slice(0, 60)); }
      return call("onSearch", res.map(r => Object.assign(r, { have: stocks.some(y => y.s === r.s) })));
    }
    case "add": {
      if (!m.s || stocks.some(y => y.s === m.s)) return;
      const list = m.list === "own" ? "own" : "watch";
      const r = await addStocks([{ s: m.s, name: m.name, exch: m.exch }], list);
      if (list === "own" && r.added.length) { const y = stocks.find(z => z.s === m.s); if (y) await editHolding(y); }
      return reportAdd(r);
    }
    case "paste": { const items = parseList(m.text); if (!items.length) return toast("No tickers found in that text"); call("onBusy", "import", true); const r = await addStocks(items, m.list === "own" ? "own" : "watch"); call("onBusy", "import", false); call("onPasted"); return reportAdd(r); }
    case "csv": {
      let text = "";
      try { const paths = await DocumentPicker.open(["public.comma-separated-values-text", "public.plain-text", "public.text"]); if (!paths || !paths[0]) return; text = FileManager.local().readString(paths[0]); }
      catch (e) { return; }   // cancelled
      const items = parseCSV(text);
      if (!items.length) return toast("No symbol column found. Try pasting the tickers instead.");
      call("onBusy", "import", true);
      const r = await addStocks(items, m.list === "own" ? "own" : "watch");
      call("onBusy", "import", false);
      return reportAdd(r);
    }
    case "shot": return importScreenshot(m.list === "own" ? "own" : "watch");
    case "holding": if (x && await editHolding(x)) { saveAll(); push(); saveWidget(widgetSnapshot()); } return;
    case "move": if (x) { x.list = m.v === "own" ? "own" : "watch"; if (x.list === "own" && !x.sh) await editHolding(x); saveAll(); push(); saveWidget(widgetSnapshot()); } return;
    case "remove":
      if (!x) return;
      stocks = stocks.filter(y => y.s !== m.s); delete market[m.s]; delete insights.stories[m.s];
      saveAll(); push(); saveWidget(widgetSnapshot()); toast(`${m.s} removed`); return;
    case "detail": {   // opening a stock: load what it doesn't have yet
      if (!x) return;
      const d = market[x.s] = market[x.s] || {};
      const jobs = [];
      if (!d.prof || Date.now() - d.prof.at > cfg("fundHours") * 3600e3) jobs.push(loadProfile(x.s));
      if (!d.newsAt || Date.now() - d.newsAt > cfg("newsRefreshMin") * 60e3) jobs.push(loadNews(x.s), loadCrowd(x.s));
      if (!jobs.length) return;
      await Promise.all(jobs.map(j => j.catch(() => {})));
      write("market", market); return push();
    }
    case "history": {
      const key = m.s + "|" + m.v, intra = m.v === "1d" || m.v === "5d";
      if (!hist[key] || (intra && Date.now() - hist[key].at > 5 * 60e3)) {   // a day and a week: five minutes old at most
        try {
          const r = intra ? await yChart(m.s, m.v, m.v === "1d" ? "5m" : "30m", true) : await yChart(m.s, "5y", "1wk");
          const prevClose = num(r.meta.chartPreviousClose) != null ? num(r.meta.chartPreviousClose) : num(r.meta.previousClose);
          hist[key] = { pts: r.pts, intraday: intra, base: m.v === "1d" ? prevClose : null, at: Date.now() };
        } catch (e) { return call("onHistory", m.s, m.v, { pts: [], err: String(e.message || e).slice(0, 80), at: Date.now() }); }
      }
      return call("onHistory", m.s, m.v, hist[key]);
    }
    case "story": return runStory(m.s);
    case "briefing": return runBriefing(true);
    case "ideas": return runIdeas();
    case "checkrun": return runCheck();
    case "checkapply": return applyCheck(m);
    case "checkclear": check = null; checkShots = []; return push();
    case "checkpick": return addCheckShot();
    case "checkdrop": checkShots.splice(+m.v, 1); return push();
    case "checknew": check = null; checkShots = []; push(); return addCheckShot();
    case "preview": return openPreview(m.s);
    case "addpreview": {   // from a stock's page opened from Ideas: onto your watchlist or portfolio
      if (stocks.some(y => y.s === m.s)) return;
      const r = await addStocks([{ s: m.s, name: (market[m.s] || {}).name || m.s }], m.v === "own" ? "own" : "watch");
      previews.delete(m.s);
      const x2 = stocks.find(y => y.s === m.s);
      if (x2 && x2.list === "own") await editHolding(x2);
      saveAll(); push(); saveWidget(widgetSnapshot());
      return reportAdd(r);
    }
    case "watchidea": {
      const it = insights.ideas && insights.ideas.list.find(y => y.s === m.s);
      if (!it || stocks.some(y => y.s === m.s)) return;
      return reportAdd(await addStocks([{ s: it.s, name: it.name }], "watch"));
    }
    case "share": if (m.text) await ShareSheet.present([String(m.text).slice(0, 20000)]); return;
    case "tldr": {   // Flash and stock pages: a TL;DR of one headline, cached per link
      const n = ((market[m.s] || {}).news || []).find(h => h.l === m.l);
      if (!n) return call("onTldr", m.id, { error: "This headline is no longer in the list. Refresh and try again" });
      const id = tldrId(n.l);
      if (tldrs[id] && !m.force && !(tldrs[id].kind === "extract" && aiKey())) return call("onTldr", m.id, tldrs[id]);
      try { tldrs[id] = await makeNewsTldr(m.s, n); pruneTldrs(); write("tldrs", tldrs); }
      catch (e) { return call("onTldr", m.id, { error: String(e.message || e) }); }
      return call("onTldr", m.id, tldrs[id]);
    }
    case "digest": {   // Flash › Listen: a stock's top articles as one story, cached for the same headlines
      const links = (Array.isArray(m.links) ? m.links : []).map(String).slice(0, 8), id = "d2:" + tldrId(m.s + "|" + links.slice(0, 3).join("|"));
      if (tldrs[id] && !m.force && !(tldrs[id].kind === "extract" && aiKey())) return call("onDigest", m.id, tldrs[id]);   // a key added since: tell it with AI now
      try { tldrs[id] = await makeDigest(m.s, links); pruneTldrs(); write("tldrs", tldrs); }
      catch (e) { return call("onDigest", m.id, { error: String(e.message || e) }); }
      return call("onDigest", m.id, tldrs[id]);
    }
    case "ttsaudio":   // one piece of ✦ AI speech, returned to the page as base64 MP3
      try { return call("__done", m.req, true, await aiSpeech(m.text)); }
      catch (e) { return call("__done", m.req, false, String(e.message || e)); }
    case "speak": if (m.text) Speech.speak(String(m.text).slice(0, 8000)); return;   // fallback when the page can't speak
    case "stratadd": {   // Ideas › My strategies
      const text = String(m.text || "").trim().slice(0, 600);
      if (!text) return;
      strategies.unshift({ id: "g" + Date.now().toString(36), text, when: String(m.when || "").trim().slice(0, 80), status: "active", at: Date.now() });
      write("strategies", strategies); return push();
    }
    case "stratretire": case "stratrestore": {
      const g = strategies.find(x => x.id === m.v);
      if (g) { g.status = m.type === "stratretire" ? "retired" : "active"; g.retiredAt = m.type === "stratretire" ? Date.now() : null; write("strategies", strategies); }
      return push();
    }
    case "stratedit": {   // your strategies can always be changed
      const g = strategies.find(x => x.id === m.v), text = String(m.text || "").trim().slice(0, 600);
      if (!g || !text) return push();
      g.text = text; g.when = String(m.when || "").trim().slice(0, 80); g.editedAt = Date.now();
      write("strategies", strategies); return push();
    }
    case "stratkeep": {   // a suggested strategy becomes yours
      const ss = insights.stratSuggest, it = ss && ss.list.find(x => x.id === m.v);
      if (!it) return;
      const text = String(m.text != null ? m.text : it.text).trim().slice(0, 600);
      if (text) strategies.unshift({ id: "g" + Date.now().toString(36), text, when: String(m.when != null ? m.when : it.when || "").trim().slice(0, 80), status: "active", at: Date.now(), from: "suggested" });
      ss.list = ss.list.filter(x => x.id !== m.v);
      write("strategies", strategies); write("insights", insights); return push();
    }
    case "stratdismiss": { const ss = insights.stratSuggest; if (ss) { ss.list = ss.list.filter(x => x.id !== m.v); write("insights", insights); } return push(); }
    case "stratsuggest": return runStratSuggest(true);
    case "stratdue": return runStratSuggest(false);
    case "stratdelete": strategies = strategies.filter(x => x.id !== m.v); write("strategies", strategies); return push();
    case "startlog": {
      let txt = "";
      try { txt = FileManager.local().readString(LOG_PATH).split("\n").slice(-40).join("\n"); } catch (e) {}
      return call("__done", m.req, true, txt);
    }
    case "openlink": if (/^https:\/\//i.test(String(m.v || ""))) await Safari.openInApp(m.v, false); return;
    case "openurl":   // Settings › Built with: only the blueprints repository opens from here
      if (m.v === BLUEPRINTS_REPO || String(m.v).startsWith(BLUEPRINTS_REPO + "/")) await Safari.openInApp(m.v, false);
      return;
    case "aikey": {
      const p = PROVIDERS[m.v] ? m.v : settings.aiProvider;
      if (await askKey(p)) {
        settings.ai = true; saveAll(); push();
        try { const n = await fetchModels(p); toast(`${PROVIDERS[p]} key saved — ${n} models available`); }
        catch (e) { toast(`Key saved, but checking it failed: ${String(e.message || e).slice(0, 70)}`); }
      }
      saveAll(); return push();
    }
    case "airm": { const p = m.v; if (PROVIDERS[p]) { removeKey(p); toast(`${PROVIDERS[p]} key removed`); } saveAll(); return push(); }
    case "aiprov": if (PROVIDERS[m.v]) settings.aiProvider = m.v; saveAll(); return push();
    case "aimodels":
      try { const n = await fetchModels(m.v); toast(`${n} ${PROVIDERS[m.v]} models found`); }
      catch (e) { toast(String(e.message || e).slice(0, 90)); }
      saveAll(); return push();
    case "aimodel":
      if (PROVIDERS[m.p] && m.v) { settings.model = settings.model || {}; settings.model[m.p] = m.v; toast(`${PROVIDERS[m.p]} now uses ${m.v}`); }
      saveAll(); return push();
    case "aitest": {
      const p = m.v, t0 = Date.now();
      try {
        await aiCall("Reply with the single word OK.", "Connection test.", 10, "test", p);
        toast(`${PROVIDERS[p]} works — ${modelFor(p)} answered in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      } catch (e) { toast(`${PROVIDERS[p]} test failed: ${String(e.message || e).slice(0, 80)}`); }
      return push();
    }
    case "usagereset": resetUsage(); toast("Usage counters reset"); return push();
  }
}

function buildWebView() {
  wv = new WebView();
  wv.shouldAllowRequest = req => {
    const u = req.url || "";
    if (u.startsWith(SCHEME)) {
      let m = {};
      try { m = JSON.parse(decodeURIComponent(u.split("?d=")[1] || "%7B%7D")); } catch (e) {}
      handle(m).catch(e => toast(String(e.message || e)));
      return false;
    }
    if (/^https?:/i.test(u)) { Safari.openInApp(u, false); return false; }
    return true;
  };
}

function clientApp() {
  let S = window.__INIT;
  const look = { theme: S.settings.theme || "auto", density: S.settings.density || "comfortable", font: S.settings.font || "sans", textSize: +S.settings.textSize || 1 };
  let tab = S.settings.tab || "own", sort = S.settings.sort || "value", range = S.settings.range || "1y", addTo = S.settings.addTo || "watch";
  let openSym = null, addOpen = false, cfgOpen = false, cfgArmed = false, aiOpen = false, aiArmed = null, rmArmed = null, secArmed = null;
  let newsOpen = null; const tl = {};
  let previewWait = null, themeText = "", ideaExplain = null, checkOpen = false, ckArmed = null, ckProg = null, ckShown = 0, ckTimer = null; const ckEdit = {};
  let introState = null;   // "big" on the first launches, then "shrunk" a few seconds later
  let stratEditing = null; const stratEdit = { text: "", when: "" }, sgEdit = {};
  let stratText = "", stratWhen = "", stratArmed = null, inspecting = null, xhTimer = null, chartNow = null; const histWant = new Set();   // the headline open in the TL;DR sheet, and TL;DRs by link
  let explainKey = null, briefFull = false, progress = null, results = null, searching = false, pasteText = "";
  const busyK = new Set(), hist = {}, aiLoading = new Set();
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const PN = { anthropic: "Claude", openai: "OpenAI" };
  const FEAT = { briefing: "Portfolio briefing", story: "Stock stories", ideas: "Ideas", tldr: "Article TL;DRs", check: "Portfolio checks", strategies: "Strategy suggestions", digest: "News stories to listen to", speech: "Read aloud", import: "Screenshot import", test: "Connection tests", other: "Other" };
  const STYLE_L = { cautious: "cautious", balanced: "balanced", adventurous: "adventurous" };
  const syncBusy = () => { busyK.clear(); if (S.busy.briefing) busyK.add("briefing"); if (S.busy.ideas) busyK.add("ideas"); if (S.busy.check) busyK.add("check"); if (S.busy.strat) busyK.add("strat"); (S.busy.stories || []).forEach(s => busyK.add("story:" + s)); };
  syncBusy();

  // ---- appearance (app-blueprints · settings, Step 3) ----
  const THEMES = [["auto", "Auto"]].concat(Object.keys(S.palettes).map(k => [k, k[0].toUpperCase() + k.slice(1)]));
  const dark = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : { matches: false };
  function applyLook() {
    const root = document.documentElement;
    root.dataset.theme = look.theme === "auto" ? (dark.matches ? "night" : "ink") : look.theme;
    root.dataset.font = look.font;
    root.style.setProperty("--ts", look.textSize);
    document.body.classList.remove("d-comfortable", "d-compact", "d-tiny");
    document.body.classList.add("d-" + look.density);
  }
  const onDark = () => { if (look.theme === "auto") applyLook(); };
  if (dark.addEventListener) dark.addEventListener("change", onDark); else if (dark.addListener) dark.addListener(onDark);
  const segRow = (k, opts) => `<div class="seg wide">${opts.map(([v, l]) => `<button class="${String(look[k]) === String(v) ? "on" : ""}" data-act="look" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
  function lookHTML() {
    return `
      <div class="lk-row"><span class="lk-l">Colours</span><div class="sws">${THEMES.map(t => `
        <button class="sw ${look.theme === t[0] ? "on" : ""}" data-act="look" data-k="theme" data-v="${t[0]}" aria-label="${t[1]} colours">
          <span class="prev" style="${t[0] === "auto" ? `background:linear-gradient(135deg,${S.palettes.ink.paper} 50%,${S.palettes.night.sheet} 50%);color:${S.palettes.night.signal}` : `background:${S.palettes[t[0]].paper};color:${S.palettes[t[0]].ink}`}">Aa<i style="background:${(S.palettes[t[0]] || S.palettes.night).signal}"></i></span>
          <small>${t[1]}</small></button>`).join("")}</div></div>
      <div class="lk-row"><span class="lk-l">Layout</span>${segRow("density", [["comfortable", "Comfortable"], ["compact", "Compact"], ["tiny", "Tiny"]])}</div>
      <div class="lk-row"><span class="lk-l">Text size</span>${segRow("textSize", [[0.92, "Small"], [1, "Default"], [1.12, "Large"], [1.25, "Larger"]])}</div>
      <div class="lk-row"><span class="lk-l">Headline font</span>${segRow("font", [["sans", "Sans serif"], ["serif", "Serif"]])}</div>`;
  }

  // ---- bridge → Scriptable (queued so rapid taps aren't lost) ----
  const q = []; let flushing = false;
  const pending = {}; let reqN = 0;
  function send(type, data, cb) {
    const m = Object.assign({ type }, data);
    if (cb) { m.req = "r" + (++reqN); pending[m.req] = cb; }
    q.push(m); if (!flushing) flush();
  }
  window.__done = (req, ok, msg) => { const cb = pending[req]; delete pending[req]; if (cb) cb(ok, msg); };
  function flush() {
    const m = q.shift();
    if (!m) { flushing = false; return; }
    flushing = true;
    location.href = "stockit://a?d=" + encodeURIComponent(JSON.stringify(m));
    setTimeout(flush, 80);
  }

  // ---- bridge ← Scriptable ----
  window.recv = st => {
    S = st; syncBusy(); aiLoading.clear();
      if (openSym && !byS(openSym) && previewWait !== openSym) openSym = null;
    if (previewWait && byS(previewWait)) previewWait = null;
    if (newsOpen && !S.stocks.some(x => x.s === newsOpen.s)) newsOpen = null;
    renderAll();
  };
  window.onProgress = (d, t) => { progress = t ? [d, t] : null; renderStatus(); };
  window.onSearch = res => { results = res; searching = false; renderAdd(); };
  window.onHistory = (s, r, h) => { hist[s + "|" + r] = h; histWant.delete(s + "|" + r); if (openSym === s) renderDetail(); };
  window.onBusy = (k, on) => { if (on) busyK.add(k); else busyK.delete(k); renderAll(); };
  window.onPasted = () => { pasteText = ""; const t = $("#paste"); if (t) t.value = ""; };
  window.toast = msg => {
    const t = $("#toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(window.__tt); window.__tt = setTimeout(() => t.classList.remove("on"), 3400);
  };

  // ── update pitch (app-blueprints · in-app-updates, Step 6) ──
  window.__showUpdate = function (u) {
    if (!u || document.getElementById("upd")) return;
    var ov = document.createElement("div"); ov.id = "upd";
    var cards = (u.highlights || []).map(function (h) {
      return '<div class="updi"><span class="updic">' + escH(h.icon || "✨") + "</span><div><b>" +
        escH(h.title) + "</b><span>" + escH(h.text || "") + "</span></div></div>";
    }).join("");
    var more = u.skipped > 1 ? " (and " + (u.skipped - 1) + " more update" + (u.skipped > 2 ? "s" : "") + ")" : "";
    ov.innerHTML = '<div class="updp" role="dialog" aria-label="Update available">' +
      '<div class="updtag">New version ' + escH(u.latest) + "</div>" +
      '<h2 class="updt">' + escH(u.title || "An update is ready") + "</h2>" +
      '<div class="upds">You have ' + escH(u.current) + more + ". Here’s what you get:</div>" +
      '<div class="updl">' + cards + "</div>" +
      '<div class="updmsg" aria-live="polite"></div>' +
      '<button class="primary updgo" data-act="upd-now">Update now</button>' +
      '<button class="updlater" data-act="upd-later">Later, remind me in 2 days</button></div>';
    document.body.appendChild(ov);
    ov.addEventListener("click", function (e) { if (e.target === ov) updLater(); });   // outside = Later
  };
  function escH(t) { var d = document.createElement("div"); d.textContent = String(t == null ? "" : t); return d.innerHTML; }
  function updLater() { var ov = document.getElementById("upd"); if (!ov) return; ov.remove(); send("update-later", {}); }
  function updNow(btn) {
    var ov = document.getElementById("upd"), msg = ov.querySelector(".updmsg"), later = ov.querySelector(".updlater");
    btn.disabled = true; btn.textContent = "Updating…"; later.hidden = true; msg.textContent = "";
    send("update-now", {}, function (ok, res) {
      if (ok) {
        ov.querySelector(".updtag").textContent = "Updated to " + res;
        msg.innerHTML = "<b>✓ Done.</b> Close Stockit and open it again to start using the new version.";
        btn.disabled = false; btn.textContent = "Got it"; btn.dataset.act = "upd-close";
      } else {
        msg.textContent = res || "Update failed"; btn.disabled = false; btn.textContent = "Try again"; later.hidden = false;
      }
    });
  }

  // ---- numbers and time ----
  const nf = (v, d = 2) => v == null || !isFinite(v) ? "—" : (+v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  const MINOR = { GBp: "p", GBX: "p", ILA: " ag", ZAc: " c" };
  function money(v, cur, compact, dec) {   // dec: fixed decimals (amounts of money); prices under 1 otherwise get 4
    if (v == null || !isFinite(v)) return "—";
    if (MINOR[cur]) return nf(v, 2) + MINOR[cur];
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency: cur || "USD", notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 1 : dec != null ? dec : (Math.abs(v) < 1 ? 4 : 2) }).format(v); }
    catch (e) { return nf(v) + " " + (cur || ""); }
  }
  // Your money in one currency (Settings › Portfolio): rates come with the state; a stock whose rate isn't known yet keeps its own currency.
  const NORMC = { GBp: ["GBP", 100], GBX: ["GBP", 100], ILA: ["ILS", 100], ZAc: ["ZAR", 100] };
  const HOME = () => (S.fx && S.fx.home) || "USD";
  function fxr(cur, prev) {
    const [c, k] = NORMC[cur] || [cur || "USD", 1];
    if (c === HOME()) return 1 / k;
    const r = S.fx && S.fx.rates && S.fx.rates[c];
    return r && r.rate ? (prev ? (r.prev || r.rate) : r.rate) / k : null;
  }
  const inHome = (v, cur) => { const r = fxr(cur); return v == null || r == null ? null : v * r; };
  const foreign = cur => (NORMC[cur] || [cur || "USD"])[0] !== HOME();
  const posHome = x => x.list === "own" && x.sh && x.price != null ? inHome(x.sh * x.price, x.cur) : null;
  const dayHome = x => x.list === "own" && x.sh && x.price != null && x.prev != null && fxr(x.cur) != null ? x.sh * (x.price * fxr(x.cur) - x.prev * fxr(x.cur, true)) : null;
  const homeMoney = (v, cur, compact, signedV) => {   // in your currency first, the stock's own currency small beside it
    const h = inHome(v, cur), f = signedV ? signed : money;
    if (h == null) return f(v, cur, compact);
    return f(h, HOME(), compact) + (foreign(cur) ? `<small class="orig">${f(v, cur, compact)}</small>` : "");
  };
  // Privacy mode (the eye in the header): your own amounts become •••• so the app can be shown to someone.
  // Market prices and percentages stay; amounts written by AI or in your strategies are masked too.
  const priv = () => !!S.settings.privacy;
  const P = h => priv() ? `<span class="pv" title="Hidden">••••</span>` : h;
  const MONEY_RX = /(?:US\$|[$€£¥]|\b(?:USD|EUR|GBP|CHF|SEK|NOK|DKK|PLN|JPY|CAD|AUD|HKD)\s?)\s?\d[\d,.\u00a0 ]*\d(?:\s?(?:[kKmMbB]n?|million|billion|thousand)\b)?|\b\d[\d,.\u00a0]*\d?\s?(?:USD|EUR|GBP|CHF|SEK|NOK|DKK|PLN|JPY|CAD|AUD|HKD|euros?|dollars?|pounds?)\b|\b\d[\d,.]*\s?(?:shares|units)\b/gi;
  const mask = t => priv() ? String(t == null ? "" : t).replace(MONEY_RX, "••••") : t;
  const PRIV_ON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.9 10.9 0 0 1 12 5c5.5 0 9.3 4.6 10 7-.3 1-1.1 2.4-2.4 3.8M6.6 6.6C4.4 8 2.9 10 2 12c.9 2.5 4.6 7 10 7 1.8 0 3.4-.5 4.8-1.2M9.9 9.9a3 3 0 0 0 4.2 4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const PRIV_OFF = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12c.9-2.5 4.6-7 10-7s9.1 4.5 10 7c-.9 2.5-4.6 7-10 7S2.9 14.5 2 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
  function renderPriv() {
    const b = $("#privbtn"); if (!b) return;
    b.innerHTML = priv() ? PRIV_ON : PRIV_OFF; b.classList.toggle("on", priv());
    b.setAttribute("aria-pressed", priv() ? "true" : "false");
    b.setAttribute("aria-label", priv() ? "Show your amounts" : "Hide your amounts");
    document.body.classList.toggle("privacy", priv());
  }
  const signed = (v, cur) => v == null || !isFinite(v) ? "—" : (v >= 0 ? "+" : "−") + money(Math.abs(v), cur, false, 2);
  const pct = (v, d = 2) => v == null || !isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d) + "%";
  const bigN = v => v == null || !isFinite(v) ? "—" : v >= 1e12 ? nf(v / 1e12, 2) + "T" : v >= 1e9 ? nf(v / 1e9, 1) + "B" : v >= 1e6 ? nf(v / 1e6, 0) + "M" : nf(v, 0);
  const dayPct = x => x && x.price != null && x.prev ? (x.price / x.prev - 1) * 100 : null;
  const cls = v => v == null || !isFinite(v) ? "" : v >= 0 ? "up" : "down";
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : "";
  function rel(ts) {
    const s = (Date.now() - ts) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " h ago";
    if (s < 7 * 86400) return Math.floor(s / 86400) + " d ago";
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  const when = ts => new Date(ts).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" });
  const dayDate = (d, y) => new Date(d * 864e5).toLocaleDateString(undefined, y ? { month: "short", year: "numeric" } : { month: "short", day: "numeric" });
  const isBusy = k => busyK.has(k);
  const byS = s => S.stocks.find(x => x.s === s) || (S.previews || []).find(x => x.s === s);   // previews: stocks opened from Ideas

  // ---- small pictures ----
  function spark(pts, c, wide) {
    if (!pts || pts.length < 2) return `<svg class="trendln" viewBox="0 0 72 28" aria-hidden="true"></svg>`;
    const W = wide ? 300 : 72, H = wide ? 40 : 28, vs = pts.map(p => p[1]);
    const mn = Math.min(...vs), mx = Math.max(...vs), rg = mx - mn || 1;
    const d = pts.map((p, i) => (i ? "L" : "M") + (i * W / (pts.length - 1)).toFixed(1) + " " + (2 + (H - 4) * (1 - (p[1] - mn) / rg)).toFixed(1)).join("");
    return `<svg class="trendln ${c}${wide ? " wide" : ""}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`;
  }
  const HIST_R = ["1d", "5d", "5y"];
  const clock = t => new Date(t * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const wkClock = t => new Date(t * 1000).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" });
  // o: { intraday, span ("1d" | "5d"), base (yesterday's close for a day), weekly, cur, err }
  function chartSVG(pts, long, o = {}) {
    if (!pts || pts.length < 2) return `<p class="muted pad">${o.err ? "Chart not loaded: " + esc(o.err) + "." : o.intraday ? "No trading yet in this period." : "No price history yet."}</p>`;
    const W = 340, H = 160, vs = pts.map(p => p[1]), hasBase = o.base != null && isFinite(o.base);
    const base = hasBase ? o.base : vs[0], hi = Math.max(...vs), lo = Math.min(...vs);
    const mn = Math.min(lo, base), mx = Math.max(hi, base), rg = mx - mn || 1;
    const X = i => i * W / (pts.length - 1), Y = v => 6 + (H - 12) * (1 - (v - mn) / rg);
    const d = pts.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(p[1]).toFixed(1)).join("");
    const chg = (vs[vs.length - 1] / base - 1) * 100, c = cls(chg);
    chartNow = { pts, long, intraday: !!o.intraday, span: o.span, weekly: !!o.weekly, base, W, H, mn, rg, cur: o.cur || "" };
    const lab = t => o.intraday ? (o.span === "1d" ? clock(t) : wkClock(t)) : dayDate(t, long);
    return `<figure class="chart ${c}"><div class="xtip" hidden></div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Price chart, ${pct(chg)} over this period. Touch to see the price at any moment.">
      <path class="ar" d="${d}L${W} ${H}L0 ${H}Z"/><path class="ln" d="${d}"/><line class="base" x1="0" x2="${W}" y1="${Y(base).toFixed(1)}" y2="${Y(base).toFixed(1)}"/>
      <g class="xh" style="display:none"><line class="xl" x1="0" x2="0" y1="0" y2="${H}"/><circle class="xd" r="4.5" cx="0" cy="0"/></g></svg>
      <figcaption><span>${lab(pts[0][0])}</span><span class="${c}">${pct(chg)} ${o.span === "1d" ? (hasBase ? "since yesterday's close" : "today") : "in this period"}</span><span>${lab(pts[pts.length - 1][0])}</span></figcaption>
      <div class="chart-hl"><span>High ${nf(hi)}</span><span class="muted">Touch the chart to see any price</span><span>Low ${nf(lo)}</span></div></figure>`;
  }
  function chartFor(x) {
    if (HIST_R.includes(range)) {
      const h = hist[x.s + "|" + range] || {};
      return chartSVG(h.pts, range === "5y", { intraday: !!h.intraday, span: range, base: h.base, weekly: range === "5y", cur: x.cur, err: h.err });
    }
    const p = x.pts || [];
    return chartSVG(range === "1m" ? p.slice(-23) : range === "6m" ? p.slice(-127) : p, false, { cur: x.cur });
  }
  // Touch or drag across a chart: a line, a dot and the price, time and change at that moment.
  function inspectAt(fig, clientX) {
    const c = chartNow, svg = fig && fig.querySelector("svg");
    if (!c || !svg) return;
    const r = svg.getBoundingClientRect(), f = Math.min(1, Math.max(0, (clientX - r.left) / (r.width || 1)));
    const i = Math.round(f * (c.pts.length - 1)), p = c.pts[i], x = i * c.W / (c.pts.length - 1), y = 6 + (c.H - 12) * (1 - (p[1] - c.mn) / c.rg);
    const g = svg.querySelector(".xh"); g.style.display = "";
    const ln = g.querySelector(".xl"); ln.setAttribute("x1", x); ln.setAttribute("x2", x);
    const dot = g.querySelector(".xd"); dot.setAttribute("cx", x); dot.setAttribute("cy", y);
    const when = c.intraday ? (c.span === "1d" ? clock(p[0]) : wkClock(p[0]))
      : new Date(p[0] * 864e5).toLocaleDateString(undefined, c.weekly ? { day: "numeric", month: "short", year: "numeric" } : { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    const ch = (p[1] / c.base - 1) * 100, tip = fig.querySelector(".xtip");
    tip.innerHTML = `<b>${money(p[1], c.cur)}</b><span class="${cls(ch)}">${pct(ch)}</span><small>${c.weekly ? "Week of " : ""}${esc(when)}</small>`;
    tip.hidden = false;
    const tw = tip.offsetWidth || 120, px = f * r.width;
    tip.style.left = Math.max(0, Math.min(r.width - tw, px - tw / 2)) + "px";
    clearTimeout(xhTimer);
  }
  function hideInspect(fig) {
    if (!fig || inspecting === fig) return;
    const g = fig.querySelector(".xh"), tip = fig.querySelector(".xtip");
    if (g) g.style.display = "none"; if (tip) tip.hidden = true;
  }
  document.addEventListener("pointerdown", e => {
    const svg = e.target.closest && e.target.closest(".chart svg");
    if (!svg) return;
    inspecting = svg.closest(".chart"); inspectAt(inspecting, e.clientX);
  });
  document.addEventListener("pointermove", e => { if (inspecting) inspectAt(inspecting, e.clientX); });
  ["pointerup", "pointercancel"].forEach(t => document.addEventListener(t, () => {
    if (!inspecting) return;
    const f = inspecting; inspecting = null;
    clearTimeout(xhTimer); xhTimer = setTimeout(() => hideInspect(f), 2500);   // the price stays a moment after you let go
  }));

  // ---- markets: is a stock's market open now, and when it opens or closes ----
  // Regular hours in each exchange's own time zone, in minutes after midnight, Monday to Friday. Yahoo's trading
  // period for a stock (x.tp) is used on top where it's known, which covers public holidays.
  const MKTS = [
    { id: "us", flag: "🇺🇸", name: "New York", ex: "NYSE · Nasdaq", tz: "America/New_York", s: [[570, 960]] },
    { id: "tsx", flag: "🇨🇦", name: "Toronto", ex: "TSX", tz: "America/Toronto", s: [[570, 960]], sfx: ["TO", "V", "CN", "NE"] },
    { id: "lse", flag: "🇬🇧", name: "London", ex: "London Stock Exchange", tz: "Europe/London", s: [[480, 990]], sfx: ["L", "IL"] },
    { id: "xetra", flag: "🇩🇪", name: "Frankfurt", ex: "Xetra", tz: "Europe/Berlin", s: [[540, 1050]], sfx: ["DE", "F", "BE", "DU", "HM", "HA", "MU", "SG"] },
    { id: "euronext", flag: "🇪🇺", name: "Paris · Amsterdam · Brussels", ex: "Euronext", tz: "Europe/Paris", s: [[540, 1050]], sfx: ["PA", "AS", "BR", "LS", "IR"] },
    { id: "six", flag: "🇨🇭", name: "Zurich", ex: "SIX Swiss Exchange", tz: "Europe/Zurich", s: [[540, 1050]], sfx: ["SW"] },
    { id: "milan", flag: "🇮🇹", name: "Milan", ex: "Borsa Italiana", tz: "Europe/Rome", s: [[540, 1050]], sfx: ["MI"] },
    { id: "madrid", flag: "🇪🇸", name: "Madrid", ex: "BME", tz: "Europe/Madrid", s: [[540, 1050]], sfx: ["MC"] },
    { id: "stockholm", flag: "🇸🇪", name: "Stockholm", ex: "Nasdaq Stockholm", tz: "Europe/Stockholm", s: [[540, 1050]], sfx: ["ST"] },
    { id: "copenhagen", flag: "🇩🇰", name: "Copenhagen", ex: "Nasdaq Copenhagen", tz: "Europe/Copenhagen", s: [[540, 1020]], sfx: ["CO"] },
    { id: "helsinki", flag: "🇫🇮", name: "Helsinki", ex: "Nasdaq Helsinki", tz: "Europe/Helsinki", s: [[600, 1110]], sfx: ["HE"] },
    { id: "oslo", flag: "🇳🇴", name: "Oslo", ex: "Oslo Børs", tz: "Europe/Oslo", s: [[540, 980]], sfx: ["OL"] },
    { id: "warsaw", flag: "🇵🇱", name: "Warsaw", ex: "GPW", tz: "Europe/Warsaw", s: [[540, 1020]], sfx: ["WA"] },
    { id: "baltic", flag: "🇱🇹", name: "Vilnius · Riga · Tallinn", ex: "Nasdaq Baltic", tz: "Europe/Vilnius", s: [[600, 960]], sfx: ["VS", "RG", "TL"] },
    { id: "tokyo", flag: "🇯🇵", name: "Tokyo", ex: "Tokyo Stock Exchange", tz: "Asia/Tokyo", s: [[540, 690], [750, 930]], sfx: ["T"] },
    { id: "hongkong", flag: "🇭🇰", name: "Hong Kong", ex: "HKEX", tz: "Asia/Hong_Kong", s: [[570, 720], [780, 960]], sfx: ["HK"] },
    { id: "sydney", flag: "🇦🇺", name: "Sydney", ex: "ASX", tz: "Australia/Sydney", s: [[600, 960]], sfx: ["AX"] },
    { id: "crypto", flag: "🪙", name: "Crypto", ex: "Trades around the clock", tz: "UTC", always: true },
  ];
  const MK = {}, SFX = {};
  MKTS.forEach(m => { MK[m.id] = m; (m.sfx || []).forEach(x => { SFX[x] = m; }); });
  function mktOf(x) {
    if (!x) return null;
    const s = String(x.s || ""), byTz = x.tz ? MKTS.find(k => k.tz === x.tz) : null;
    if (/-(USD|EUR|GBP|USDT|BTC)$/.test(s) || /crypto/i.test(x.type || "")) return MK.crypto;
    const m = s.match(/\.([A-Z]{1,3})$/);
    if (m) return SFX[m[1]] || byTz || null;
    if (s.startsWith("^")) return byTz || (x.tz ? null : MK.us);
    return x.tz && x.tz !== "America/New_York" && byTz ? byTz : MK.us;
  }
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const zfmt = {};
  function zoned(ts, tz) {   // wall-clock parts of a moment in a time zone
    const f = zfmt[tz] || (zfmt[tz] = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short" }));
    const o = {}; f.formatToParts(new Date(ts)).forEach(p => { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second, wd: WD.indexOf(o.weekday) };
  }
  const tzOff = (ts, tz) => { const z = zoned(ts, tz); return Date.UTC(z.y, z.mo - 1, z.d, z.h, z.mi, z.s) - Math.floor(ts / 1000) * 1000; };
  function atLocal(y, mo, d, minutes, tz) {   // the moment a wall-clock time happens in a time zone
    const guess = Date.UTC(y, mo - 1, d, 0, minutes);
    let t = guess - tzOff(guess, tz);
    return guess - tzOff(t, tz);
  }
  function sessions(mk, now) {
    const out = [], z = zoned(now, mk.tz);
    for (let k = -1; k <= 8; k++) {
      const dt = new Date(Date.UTC(z.y, z.mo - 1, z.d + k)), wd = dt.getUTCDay();
      if (wd === 0 || wd === 6) continue;
      for (const [a, b] of mk.s) out.push([atLocal(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), a, mk.tz), atLocal(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), b, mk.tz)]);
    }
    return out;
  }
  function mktStatus(mk, tp, now = Date.now()) {
    if (!mk) return null;
    if (mk.always) return { open: true, always: true };
    const ss = sessions(mk, now);
    let cur = ss.find(([a, b]) => now >= a && now < b) || null, next = ss.find(([a]) => a > now) || null;
    const prev = ss.filter(([, b]) => b <= now).pop();
    if (tp && tp.start && tp.end) {
      if (now >= tp.start && now < tp.end) cur = cur || [tp.start, tp.end];
      else if (tp.start > now && tp.start - now < 6 * 864e5) {   // Yahoo's next session: later than the usual one means a holiday
        if (cur && tp.start >= cur[1]) cur = null;
        if (!cur && (!next || tp.start > next[0])) next = [tp.start, tp.end];
      }
    }
    const lunch = !cur && prev && next && next[0] - prev[1] < 3 * 3600e3 && zoned(prev[1], mk.tz).d === zoned(next[0], mk.tz).d;
    return { open: !!cur, closesAt: cur && cur[1], opensAt: !cur && next ? next[0] : null, since: cur && cur[0], lunch: !!lunch };
  }
  function dur(ms) {
    const m = Math.max(1, Math.round(ms / 60e3)), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mi = m % 60;
    return d ? `${d} d ${h} h` : h ? `${h} h ${mi} min` : `${mi} min`;
  }
  const hm = mins => String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  const yourTime = ts => new Date(ts).toLocaleString(undefined, Math.abs(ts - Date.now()) < 20 * 3600e3 && new Date(ts).getDate() === new Date().getDate() ? { hour: "2-digit", minute: "2-digit" } : { weekday: "short", hour: "2-digit", minute: "2-digit" });
  function mkText(mk, st, long) {
    if (st.always) return long ? "Open around the clock" : "Open 24/7";
    if (st.open) return long ? `${esc(mk.ex)} open · closes in ${dur(st.closesAt - Date.now())}` : "Open";
    if (st.lunch) return long ? `${esc(mk.ex)} on lunch break · reopens in ${dur(st.opensAt - Date.now())}` : "Lunch break";
    return long ? `${esc(mk.ex)} closed${st.opensAt ? ` · opens in ${dur(st.opensAt - Date.now())} (${yourTime(st.opensAt)} your time)` : ""}` : "Closed";
  }
  function mkBadge(x, long) {
    const mk = mktOf(x), st = mk && mktStatus(mk, x.tp);
    if (!st) return "";
    return `<span class="mk ${st.open ? "on" : st.lunch ? "lunch" : "off"} ${long ? "long" : ""}" data-s="${esc(x.s)}" data-long="${long ? 1 : 0}" title="${esc(mk.name)}">${mkText(mk, st, long)}</span>`;
  }
  function marketsHTML() {
    const now = Date.now(), mine = new Map();
    S.stocks.forEach(x => { const mk = mktOf(x); if (mk) { if (!mine.has(mk.id)) mine.set(mk.id, []); mine.get(mk.id).push(x); } });
    const order = (a, b) => { const sa = mktStatus(a, null, now), sb = mktStatus(b, null, now);
      return (sb.open - sa.open) || ((sa.open ? sa.closesAt : sa.opensAt) - (sb.open ? sb.closesAt : sb.opensAt)); };
    const card = mk => {
      const xs = mine.get(mk.id) || [], tp = (xs.find(x => x.tp) || {}).tp, st = mktStatus(mk, tp, now), z = zoned(now, mk.tz);
      const state = st.always ? "Open 24/7" : st.open ? "Open" : st.lunch ? "Lunch break" : "Closed";
      const prog = st.open && !st.always ? Math.round((now - st.since) / (st.closesAt - st.since) * 100) : null;
      const today = new Date(Date.UTC(z.y, z.mo - 1, z.d));
      const hoursYou = mk.always ? "" : mk.s.map(([a, b]) => yourTime(atLocal(z.y, z.mo, z.d, a, mk.tz)).replace(/^\w+\s/, "") + "–" + yourTime(atLocal(z.y, z.mo, z.d, b, mk.tz)).replace(/^\w+\s/, "")).join(", ");
      return `<article class="mkt ${st.open ? "on" : ""}"><div class="mkt-h"><span class="mkt-f" aria-hidden="true">${mk.flag}</span>
          <div class="grow"><b>${esc(mk.name)}</b><small>${esc(mk.ex)}${mk.always ? "" : ` · ${WD[z.wd]} ${hm(z.h * 60 + z.mi)} there`}</small></div>
          <span class="mk ${st.open ? "on" : st.lunch ? "lunch" : "off"}">${state}</span></div>
        ${mk.always ? "" : `<p class="mkt-c">${st.open ? `Closes in <b>${dur(st.closesAt - now)}</b>` : st.opensAt ? `${st.lunch ? "Reopens" : "Opens"} in <b>${dur(st.opensAt - now)}</b>` : ""}<small>${st.open ? `at ${yourTime(st.closesAt)} your time` : st.opensAt ? `at ${yourTime(st.opensAt)} your time` : ""}</small></p>
        ${prog != null ? `<div class="mkt-p" role="progressbar" aria-valuenow="${prog}" aria-valuemin="0" aria-valuemax="100"><i style="width:${prog}%"></i></div>` : ""}
        <p class="note">Hours ${mk.s.map(([a, b]) => hm(a) + "–" + hm(b)).join(", ")} local · ${hoursYou} your time · Mon–Fri</p>`}
        ${xs.length ? `<div class="mkt-s">${xs.map(x => `<button class="chip" data-act="open" data-v="${esc(x.s)}">${esc(x.s)} <span class="${cls(dayPct(x))}">${pct(dayPct(x), 1)}</span></button>`).join("")}</div>` : ""}</article>`;
    };
    const yours = MKTS.filter(m => mine.has(m.id)).sort(order), others = MKTS.filter(m => !mine.has(m.id)).sort(order);
    const openN = MKTS.filter(m => !m.always && mktStatus(m, null, now).open).length;
    return `<div class="listbar"><span>Your time ${new Date(now).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} · ${openN} of ${MKTS.length - 1} markets open</span></div>
      ${yours.length ? `<h3 class="sec">Where your stocks trade</h3><div class="mkts">${yours.map(card).join("")}</div>` : ""}
      <h3 class="sec">${yours.length ? "Other markets" : "Markets"}</h3><div class="mkts">${others.map(card).join("")}</div>
      <p class="note pad">Regular trading hours, Monday to Friday. For markets where you have stocks, Yahoo's own session times also catch public holidays; other markets may show open on a holiday. Updates every 30 seconds.</p>`;
  }
  function tickMarkets() {
    if (document.hidden) return;
    if (tab === "markets" && !openSym && !newsOpen) return render();
    document.querySelectorAll(".mk[data-s]").forEach(el => { const x = byS(el.dataset.s); if (x) el.outerHTML = mkBadge(x, el.dataset.long === "1"); });
  }
  setInterval(tickMarkets, 30000);

  function paras(t, links) {
    return String(mask(t) || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\s*\[(\d+(?:\s*,\s*\d+)*)\]/g, (m, g) => links ? `<span class="refw">${g.split(/\s*,\s*/).map(n => links[+n - 1] ? `<button class="ref" data-act="openlink" data-v="${esc(links[+n - 1].l)}" aria-label="Open headline ${+n}">${+n}</button>` : "").join("")}</span>` : "")}</p>`);
  }
  const sigChip = sig => sig ? `<span class="chip sig-${sig.signal}">✦ ${cap(sig.signal)}</span>` : "";
  const TREND = { up: "Uptrend", flat: "Sideways", down: "Downtrend" };

  // ---- header, tabs, status ----
  function renderStatus() {
    const el = $("#status");
    $("#top").classList.toggle("busy", !!progress);
    if (progress) { el.textContent = progress[0] ? `Loading ${progress[0]} of ${progress[1]}…` : `Loading ${progress[1]} stock${progress[1] === 1 ? "" : "s"}…`; return; }
    el.textContent = S.stocks.length ? (S.lastRefresh ? `Updated ${rel(S.lastRefresh)}` : "Pull fresh prices with ↻") : "Add your first stock";
  }
  function renderTabs() {
    const own = S.stocks.filter(x => x.list === "own").length, watch = S.stocks.length - own;
    const t = [["own", "Portfolio", own], ["watch", "Watchlist", watch], ["flash", "Flash", null], ["markets", "Markets", null], ["ideas", S.settings.hasKey ? "✦ Ideas" : "Ideas", null]];
    $("#tabs").innerHTML = t.map(([k, l, n]) => `<button class="${tab === k ? "on" : ""}" data-act="tab" data-v="${k}">${l}${n != null ? ` <span class="n">${n}</span>` : ""}</button>`).join("");
  }
  function renderAll() { renderPriv(); render(); renderDetail(); renderNews(); renderCheck(); renderAdd(); renderAI(); renderCfg(); }
  function render() {
    applyLook(); renderPriv(); renderStatus(); renderTabs();
    $("#main").innerHTML = tab === "ideas" ? ideasHTML() : tab === "flash" ? flashHTML() : tab === "markets" ? marketsHTML() : listHTML();
  }

  // ---- portfolio and watchlist ----
  function sortRows(items) {
    const val = x => x.list === "own" && x.sh && x.price != null ? (posHome(x) != null ? posHome(x) : x.sh * x.price) : -1;
    const rank = { buy: 0, hold: 1, sell: 2 };
    const k = tab === "watch" && sort === "value" ? "today" : sort;
    return items.slice().sort((a, b) =>
      k === "value" ? val(b) - val(a) || a.s.localeCompare(b.s)
      : k === "today" ? (dayPct(b) == null ? -1e9 : dayPct(b)) - (dayPct(a) == null ? -1e9 : dayPct(a))
      : k === "signal" ? (a.sig ? rank[a.sig.signal] : 3) - (b.sig ? rank[b.sig.signal] : 3) || a.s.localeCompare(b.s)
      : a.s.localeCompare(b.s));
  }
  function listHTML() {
    if (!S.stocks.length) return `<section class="empty"><svg class="empty-mark" viewBox="0 0 240 240" aria-hidden="true">${window.__LOGO}</svg>
      <h2>Start with the stocks you own or follow</h2><p>Search by name or ticker, paste a list, import your broker's CSV${S.settings.hasKey ? ", or snap a screenshot of your Stocks app watchlist" : ""}.</p>
      <button class="primary" data-act="addopen">Add stocks</button></section>`;
    const items = S.stocks.filter(x => tab === "own" ? x.list === "own" : x.list !== "own");
    const head = tab === "own" ? checkIntroHTML(items) + summaryHTML(items) + briefHTML() : "";
    if (!items.length) return head + `<section class="empty small"><p>${tab === "own" ? "No owned stocks yet. Open one from your watchlist and tap <b>I own this</b>, or add one with +." : "Nothing on your watchlist. Add stocks you're curious about with +."}</p></section>`;
    const sorts = (tab === "own" ? [["value", "Value"]] : []).concat([["today", "Today"], ["signal", "Signal"], ["az", "A–Z"]]);
    const cur = tab === "watch" && sort === "value" ? "today" : sort;
    return head + `<div class="listbar"><span>${items.length} ${tab === "own" ? "owned" : "watching"}</span><div class="seg">${sorts.map(([v, l]) => `<button class="${cur === v ? "on" : ""}" data-act="sort" data-v="${v}">${l}</button>`).join("")}</div></div>
      <div class="rows">${sortRows(items).map(row).join("")}</div>`;
  }
  function row(x) {
    const d = dayPct(x), c = cls(d);
    const ph = posHome(x), sub = x.list === "own" && x.sh && x.price != null ? (priv() ? `${P("")} shares · ${P("")}` : `${nf(x.sh, x.sh % 1 ? 2 : 0)} shares · ${ph != null ? money(ph, HOME(), true) : money(x.sh * x.price, x.cur, true)}`) : esc(x.name);
    const sig = x.sig ? `<div class="r-sig">${sigChip(x.sig)}<span>${esc(x.sig.line)}</span></div>`
      : x.trend ? `<div class="r-sig"><span class="chip ex">${TREND[x.trend.trend]} · no AI</span></div>` : "";
    return `<div class="row" role="button" tabindex="0" data-act="open" data-v="${esc(x.s)}">
      <div class="r-l"><b class="sym">${esc(x.s)}</b><small>${x.err && x.price == null ? `<span class="danger">Couldn't load</span>` : sub}</small>${mkBadge(x)}</div>
      ${spark((x.pts || []).slice(-23), c)}
      <div class="r-r"><b>${money(x.price, x.cur)}</b><span class="pill ${c}">${pct(d)}</span></div>${sig}</div>`;
  }
  function summaryHTML(items) {
    if (!items.length) return "";
    const T = S.totals;
    if (!T.length) {
      const ds = items.map(dayPct).filter(v => v != null);
      if (!ds.length) return "";
      const avg = ds.reduce((a, b) => a + b, 0) / ds.length;
      return `<section class="sum">${checkIcon()}<span class="sum-k">Your stocks today, on average</span><div class="sum-v ${cls(avg)}">${pct(avg)}</div>
        <p class="note">Add how many shares you own (open a stock › Edit shares) to see your portfolio's value.</p></section>`;
    }
    const t = T[0], dp = t.value - t.day ? t.day / (t.value - t.day) * 100 : null;
    const vals = items.map(x => [x.s, t.cur === HOME() ? posHome(x) : null]).filter(v => v[1] != null).sort((a, b) => b[1] - a[1]);
    const shown = vals.slice(0, 6), rest = vals.slice(6).reduce((a, b) => a + b[1], 0);
    if (rest > 0) shown.push(["Other", rest]);
    return `<section class="sum">${checkIcon()}<span class="sum-k">Portfolio value${t.mixed ? ` in ${esc(t.cur)}` : ""}</span><div class="sum-v">${P(money(t.value, t.cur))}</div>
      <div class="sum-d ${cls(t.day)}">${P(signed(t.day, t.cur))} (${pct(dp)}) today</div>
      ${t.costKnown && t.cost ? `<div class="sum-g">${P(signed(t.value - t.cost, t.cur))} (${pct((t.value / t.cost - 1) * 100)}) since you bought</div>` : ""}
      ${T.length > 1 ? `<p class="note">Plus ${T.slice(1).map(z => P(money(z.value, z.cur))).join(" and ")} until their exchange rates load</p>` : ""}
      ${t.mixed ? `<p class="note">Stocks in other currencies at today's exchange rates. Change the currency in <button class="link small" data-act="cfgopen">Settings › Portfolio</button>.</p>` : ""}
      ${shown.length > 1 ? `<div class="alloc" aria-hidden="true">${shown.map((v, i) => `<i style="flex:${v[1].toFixed(2)};background:color-mix(in srgb, var(--signal) ${Math.max(18, 100 - i * 13)}%, var(--sheet))"></i>`).join("")}</div>
        <div class="alloc-l">${shown.map((v, i) => `<span><i style="background:color-mix(in srgb, var(--signal) ${Math.max(18, 100 - i * 13)}%, var(--sheet))"></i>${esc(v[0])} ${(v[1] / t.value * 100).toFixed(0)}%</span>`).join("")}</div>` : ""}
    </section>`;
  }
  function briefHTML() {
    if (!S.settings.hasKey) {
      const ds = S.stocks.map(x => [x, dayPct(x)]).filter(o => o[1] != null);
      if (!ds.length) return "";
      const up = ds.filter(o => o[1] > 0).length, dn = ds.filter(o => o[1] < 0).length;
      const big = ds.slice().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
      return `<section class="brief"><span class="badge-ex">Summary — no AI</span>
        <p class="brief-p">${up} up and ${dn} down today. The biggest move is ${esc(big[0].s)}, ${pct(big[1])}.</p>
        <p class="note">For a daily story about your stocks and a buy, hold or sell view for each, add a Claude or OpenAI key in <button class="link small" data-act="cfgopen">Settings › AI settings</button>.</p></section>`;
    }
    const b = S.briefing, bz = isBusy("briefing");
    if (!b) return `<section class="brief"><span class="badge-ai">✦ AI briefing</span><h2 class="brief-t">The story of your stocks</h2>
      <p class="brief-p muted">What moved and why, in plain words, with a buy, hold or sell view for each stock.</p>
      <div class="aic-btns"><button class="primary" data-act="briefing" ${bz ? "disabled" : ""}>${bz ? "Writing…" : "Write today's briefing"}</button></div></section>`;
    const ps = paras(b.story);
    const n = { buy: 0, hold: 0, sell: 0 };
    S.stocks.forEach(x => { if (x.sig && n[x.sig.signal] != null) n[x.sig.signal]++; });
    return `<section class="brief mood-${esc(b.mood)}">
      <div class="brief-h"><span class="badge-ai">✦ AI briefing by ${PN[b.by] || esc(b.by)}</span><span class="note">${rel(b.at)}</span></div>
      <h2 class="brief-t">${esc(mask(b.headline))}</h2>
      <div class="brief-s">${(briefFull ? ps : ps.slice(0, 1)).join("")}</div>
      ${ps.length > 1 ? `<button class="link small" data-act="brieffull">${briefFull ? "Show less" : "Read the full briefing"}</button>` : ""}
      ${briefFull && (b.watch || []).length ? `<h3 class="mini">Keep an eye on</h3><ul class="dots">${b.watch.map(w => `<li>${esc(w)}</li>`).join("")}</ul>` : ""}
      <div class="sigcount">${["buy", "hold", "sell"].filter(k => n[k]).map(k => `<span class="chip sig-${k}">${n[k]} ${k}</span>`).join("")}</div>
      <p class="note">${b.stale ? "Your stocks changed since this was written. " : ""}Opinions from the news and numbers, not financial advice.</p>
      <div class="aic-btns"><button class="sm" data-act="listenbrief">${SPK}Listen</button><button class="sm" data-act="share-brief">Share</button><button class="sm" data-act="briefing" ${bz ? "disabled" : ""}>${bz ? "Writing…" : "Rewrite"}</button></div>
    </section>`;
  }

  // ---- ideas ----
  const EVERY = [[6, "6 hours"], [12, "12 hours"], [24, "day"], [48, "2 days"], [0, "only when I tap Refresh"]];
  function suggestHTML() {
    const G = S.stratSuggest, bz = isBusy("strat"), every = S.cfg.stratEvery != null ? S.cfg.stratEvery : 24;
    if (!S.settings.hasKey) return "";
    const list = (G && G.list) || [];
    const sel = `<label class="sg-every"><span>Refresh every</span><select id="stratEvery" class="cursel">${EVERY.concat(EVERY.some(e => e[0] === every) ? [] : [[every, every + " hours"]]).map(([v, l]) => `<option value="${v}" ${v === every ? "selected" : ""}>${l}</option>`).join("")}</select></label>`;
    const card = g => {
      const ed = sgEdit[g.id];
      return `<article class="strat-c sg">${ed ? `<textarea class="sg-in" data-id="${esc(g.id)}" data-f="text" rows="3">${esc(ed.text)}</textarea><input class="sg-in cfgin wide" data-id="${esc(g.id)}" data-f="when" value="${esc(ed.when)}" placeholder="Timing (optional)">`
        : `<p class="strat-t">${esc(mask(g.text))}</p>${g.when ? `<small class="muted">Timing: ${esc(mask(g.when))}</small>` : ""}`}
        ${g.why ? `<p class="strat-ai">${esc(mask(g.why))}</p>` : ""}${(g.tickers || []).length ? `<div class="sg-tk">${g.tickers.map(t => `<button class="chip" data-act="${S.stocks.some(x => x.s === t) ? "open" : "preview"}" data-v="${esc(t)}">${esc(t)}</button>`).join("")}</div>` : ""}
        <div class="aic-btns"><button class="sm primary" data-act="sgkeep" data-v="${esc(g.id)}">${ed ? "Keep my version" : "Keep"}</button>${ed ? `<button class="sm" data-act="sgcancel" data-v="${esc(g.id)}">Cancel</button>` : `<button class="sm" data-act="sgedit" data-v="${esc(g.id)}">Edit, then keep</button>`}<button class="sm" data-act="sgdismiss" data-v="${esc(g.id)}">Dismiss</button></div></article>`;
    };
    return `<div class="sg-box"><div class="sg-h"><span class="badge-ai">✦ Suggested for you</span>${G ? `<small class="muted">${rel(G.at)}${G.by ? " · " + (PN[G.by] || esc(G.by)) : ""}</small>` : ""}</div>
      <p class="muted small">Plans drawn from your portfolio, watchlist, strategies and today's prices${G && G.cur ? " in " + esc(G.cur) : ""}. Keep one to make it yours; you can change it any time.</p>
      ${bz ? `<div class="tli-load" role="status"><span class="busy-dot"></span>Thinking about your portfolio…</div>` : list.map(card).join("") || `<p class="note">${G ? "You've kept or dismissed all of these. Refresh for new ones." : "No suggestions yet."}</p>`}
      <div class="sg-foot">${sel}<button class="sm" data-act="sgrefresh" ${bz ? "disabled" : ""}>${G ? "Refresh now" : "Suggest strategies"}</button></div></div>`;
  }
  function strategiesHTML() {
    const all = S.strategies || [], act = all.filter(g => g.status !== "retired"), ret = all.filter(g => g.status === "retired");
    const I = S.ideas || {}, G = S.stratSuggest || {};
    const note = id => { const a = (I.notes || {})[id], b = (G.notes || {})[id]; return a && b ? ((G.at || 0) > (I.at || 0) ? [b, G.at] : [a, I.at]) : a ? [a, I.at] : b ? [b, G.at] : null; };
    const card = g => {
      const n = g.status !== "retired" && note(g.id), ed = stratEditing === g.id;
      if (ed) return `<article class="strat-c editing"><label class="lk-l">Your strategy</label><textarea id="stratEditText" rows="3">${esc(stratEdit.text)}</textarea>
        <input id="stratEditWhen" class="cfgin wide" placeholder="Timing (optional)" value="${esc(stratEdit.when)}">
        <div class="aic-btns"><button class="sm primary" data-act="stratsave" data-v="${esc(g.id)}">Save</button><button class="sm" data-act="stratcancel">Cancel</button></div></article>`;
      return `<article class="strat-c ${g.status === "retired" ? "retired" : ""}"><p class="strat-t">${esc(mask(g.text))}</p>
      <small class="muted">${g.when ? `Timing: ${esc(mask(g.when))} · ` : ""}${g.from === "suggested" ? "From a ✦ suggestion · " : ""}Set ${rel(g.at)}${g.editedAt ? ` · changed ${rel(g.editedAt)}` : ""}${g.status === "retired" && g.retiredAt ? ` · retired ${rel(g.retiredAt)}` : ""}</small>
      ${n ? `<p class="strat-ai"><span class="badge-ai">✦ Where it stands</span> ${esc(mask(n[0]))} <small class="muted">${rel(n[1])}</small></p>` : ""}
      <div class="aic-btns">${g.status === "retired"
        ? `<button class="sm" data-act="stratrestore" data-v="${esc(g.id)}">Bring back</button><button class="sm danger ${stratArmed === g.id ? "armed" : ""}" data-act="stratdelete" data-v="${esc(g.id)}">${stratArmed === g.id ? "Confirm" : "Delete"}</button>`
        : `<button class="sm" data-act="stratedit" data-v="${esc(g.id)}">Edit</button><button class="sm" data-act="stratretire" data-v="${esc(g.id)}">Retire</button>`}</div></article>`;
    };
    return foldSec("strat", "My strategies", `${act.length} active${ret.length ? ` · ${ret.length} retired` : ""}${(S.stratSuggest && S.stratSuggest.list || []).length ? ` · ${S.stratSuggest.list.length} suggested` : ""}`, `<div class="strat">
      <p class="brief-p muted">Your own plans and directions${S.settings.hasKey ? ". ✦ Ideas, the briefing and stock stories take them into account" : ""}. Edit one any time, or retire it when it's done.</p>
      ${act.map(card).join("") || `<p class="note">No strategies yet. For example: “When Nike recovers to my average price, sell it and buy a pharmaceutical company”, or “Over the next six months, invest more in pharma companies working with AI companies”.</p>`}
      ${suggestHTML()}
      <div class="strat-add"><label for="stratText" class="lk-l">New strategy</label>
        <textarea id="stratText" rows="3" placeholder="e.g. When Nike recovers, sell it and buy a pharmaceutical company">${esc(stratText)}</textarea>
        <input id="stratWhen" class="cfgin wide" placeholder="Timing (optional), e.g. in six months, when NKE is back at $80" value="${esc(stratWhen)}">
        <div class="aic-btns"><button class="primary" data-act="stratadd">Add strategy</button></div></div>
      ${ret.length ? `<details class="strat-ret"><summary>Retired strategies (${ret.length})</summary>${ret.map(card).join("")}</details>` : ""}</div>`, "strat-sec");
  }
  const folded = k => !!(S.settings.ideasFold || {})[k];
  const foldSec = (k, title, sub, body, cls2) => `<details class="fold-sec ${cls2 || ""}" data-fold="${k}" ${folded(k) ? "" : "open"}><summary><span class="fs-t">${title}</span>${sub ? `<span class="fs-s">${sub}</span>` : ""}<span class="chev" aria-hidden="true">›</span></summary><div class="fs-b">${body}</div></details>`;
  function themesHTML() {
    const th = (S.cfg.ideaThemes || []).filter(Boolean);
    return foldSec("themes", "Themes you like", `${th.length} theme${th.length === 1 ? "" : "s"}`,
      `<p class="muted small">${S.settings.hasKey ? "✦ Ideas look for stocks that fit these, together with your strategies." : "Ideas will look for stocks that fit these."}</p>
      <div class="themes">${th.map((t, i) => `<span class="theme">${esc(t)}<button data-act="themerm" data-v="${i}" aria-label="Remove ${esc(t)}">×</button></span>`).join("") || `<p class="note">No themes yet.</p>`}</div>
      <div class="theme-add"><input id="themeIn" class="cfgin" placeholder="Add a theme, e.g. European banks" value="${esc(themeText)}"><button class="sm primary" data-act="themeadd">Add</button></div>`, "themes-sec");
  }
  function ideasHTML() {
    const I = S.ideas, bz = isBusy("ideas"), act = (S.strategies || []).filter(g => g.status !== "retired").length;
    const top = strategiesHTML() + themesHTML();
    if (!S.settings.hasKey) return top + `<p class="note pad">For ✦ AI ideas that follow your strategies and themes, add a Claude or OpenAI key in <button class="link small" data-act="cfgopen">Settings › AI settings</button>.</p>`;
    const n = I && I.list ? I.list.length : 0;
    const body = `<p class="brief-p muted">Picked for a ${STYLE_L[S.settings.style] || "balanced"} investor, ${act ? `your ${act} strateg${act === 1 ? "y" : "ies"}, ` : ""}your themes and what you hold, from what's trending and from good-value lists today. Tap a stock to see everything about it before you add it.</p>
      <div class="aic-btns"><button class="primary" data-act="ideas" ${bz ? "disabled" : ""}>${bz ? "Looking…" : I ? "Find new ideas" : "Find ideas"}</button></div>
      ${n ? `<p class="note">✦ AI ideas by ${PN[I.by] || esc(I.by)}, ${rel(I.at)}. ${esc(I.note)} AI knowledge has a cutoff, so read the latest news before you buy. Not financial advice.</p>${I.list.map(ideaCard).join("")}` : ""}`;
    return top + foldSec("ideas", "✦ Stocks worth a closer look", n ? `${n} idea${n === 1 ? "" : "s"} · ${rel(I.at)}` : "", body, "ideas-sec");
  }
  function ideaCard(it) {
    const d = dayPct(it), c = cls(d), have = S.stocks.some(x => x.s === it.s), f = it.f || {}, st = it.st || {}, pr = it.prof || {};
    const up = f.target && it.price ? (f.target / it.price - 1) * 100 : null, vsMa = v => v && it.price != null ? `<small class="${cls(it.price - v)}">${pct((it.price / v - 1) * 100, 1)}</small>` : "";
    const cell = (k, l, v) => `<button class="tile ${ideaExplain === it.s + "|" + k ? "on" : ""}" data-act="ideaexplain" data-v="${esc(it.s + "|" + k)}"><small>${l}</small><b>${v}</b></button>`;
    const grid = [
      cell("pe", "P/E", f.pe != null ? nf(f.pe, 1) : "—"), cell("fpe", "Forward P/E", f.fpe != null ? nf(f.fpe, 1) : "—"),
      cell("divY", "Dividend yield", f.divY ? nf(f.divY, 2) + "%" : f.pe != null || f.mcap ? "None" : "—"), cell("mcap", "Market cap", bigN(f.mcap)),
      cell("ma50", "50-day average", st.ma50 ? `${money(st.ma50, it.cur)} ${vsMa(st.ma50)}` : "—"), cell("ma200", "200-day average", st.ma200 ? `${money(st.ma200, it.cur)} ${vsMa(st.ma200)}` : "—"),
      cell("rsi", "RSI, 14 days", it.rsi != null ? `${nf(it.rsi, 0)} <small>${rsiWord(it.rsi)}</small>` : "—"), cell("beta", "Beta", f.beta != null ? nf(f.beta, 2) : "—"),
      cell("target", "Analyst target", f.target ? `${money(f.target, it.cur)} <small class="${cls(up)}">${pct(up, 0)}</small>` : "—"), cell("rating", "Analysts", f.rating ? esc(f.rating) : f.rec ? esc(cap(String(f.rec).replace(/_/g, " "))) : "—"),
    ].concat(f.margin != null ? [cell("margin", "Profit margin", nf(f.margin, 1) + "%")] : []).concat(f.growth != null ? [cell("growth", "Revenue growth", pct(f.growth, 1))] : []);
    const ek = ideaExplain && ideaExplain.startsWith(it.s + "|") ? ideaExplain.slice(it.s.length + 1) : null;
    return `<article class="idea" id="idea-${esc(it.s)}"><div class="idea-h"><button class="r-l idea-open" data-act="preview" data-v="${esc(it.s)}" aria-label="See everything about ${esc(it.s)}"><b class="sym">${esc(it.s)} <span class="chev" aria-hidden="true">›</span></b><small>${esc(it.name)}</small></button>
      <div class="r-r"><b>${money(it.price, it.cur)}</b><span class="pill ${c}">${pct(d)}</span></div></div>
      ${pr.sector ? `<p class="cap">${esc([pr.sector, pr.industry].filter(Boolean).join(" › "))}${it.exch ? " · " + esc(it.exch) : ""}</p>` : it.exch ? `<p class="cap">${esc(it.exch)}</p>` : ""}
      ${it.serves && (S.strategies || []).some(g => g.id === it.serves) ? `<p class="serves">↳ For your strategy: “${esc((S.strategies.find(g => g.id === it.serves).text).slice(0, 90))}${S.strategies.find(g => g.id === it.serves).text.length > 90 ? "…" : ""}”</p>` : ""}
      <p>${esc(it.why)}</p>${it.fit ? `<p class="ink2"><b>How it fits.</b> ${esc(it.fit)}</p>` : ""}${it.risk ? `<p class="ink2"><b>Main risk.</b> ${esc(it.risk)}</p>` : ""}
      ${spark(it.pts, cls(it.pts && it.pts.length > 1 ? it.pts[it.pts.length - 1][1] - it.pts[0][1] : null), true)}<p class="cap">Last month</p>
      ${it.st ? `<div class="tiles idea-t">${grid.join("")}</div>
      <div class="rangebox"><small>52-week range</small><div class="rbar"><i style="left:${st.pos52 == null ? 50 : st.pos52.toFixed(1)}%"></i></div>
        <div class="rlab"><span>${money(st.lo, it.cur)}</span><span>${st.pos52 == null ? "" : "now at " + st.pos52.toFixed(0) + "% of the range"}</span><span>${money(st.hi, it.cur)}</span></div></div>
      <div class="rangebox"><small>Performance</small><div class="perf">${[["1 month", st.p1m], ["6 months", st.p6m], ["1 year", st.p1y]].map(([l, v]) => `<span><small>${l}</small><b class="${cls(v)}">${pct(v, 1)}</b></span>`).join("")}</div></div>
      ${it.trend ? `<p class="ink2 idea-trend"><span class="chip t-${it.trend.trend}">${TREND[it.trend.trend]}</span> ${esc(it.trend.why)}</p>` : ""}
      ${ek && EXPLAIN[ek] ? `<p class="explain">${esc(EXPLAIN[ek])}</p>` : `<p class="note">Tap a number to see what it means.</p>`}` : `<p class="note">Ask for new ideas to see their numbers and technicals.</p>`}
      <div class="aic-btns">${sigChip({ signal: it.signal })}<span class="grow"></span><button class="sm" data-act="preview" data-v="${esc(it.s)}">See everything</button>${have ? `<span class="note">On your lists ✓</span>` : `<button class="sm primary" data-act="watchidea" data-v="${esc(it.s)}">Add to watchlist</button>`}</div></article>`;
  }

  // ---- one stock ----
  function rsiC(pts) {   // RSI over 14 days (Wilder), from daily closes
    const c = (pts || []).map(p => p[1]);
    if (c.length < 16) return null;
    let g = 0, l = 0;
    for (let i = 1; i <= 14; i++) { const d = c[i] - c[i - 1]; if (d > 0) g += d; else l -= d; }
    g /= 14; l /= 14;
    for (let i = 15; i < c.length; i++) { const d = c[i] - c[i - 1]; g = (g * 13 + Math.max(d, 0)) / 14; l = (l * 13 + Math.max(-d, 0)) / 14; }
    return l === 0 ? 100 : 100 - 100 / (1 + g / l);
  }
  const rsiWord = r => r >= 70 ? "risen fast" : r <= 30 ? "fallen fast" : "neutral";
  const EXPLAIN = {
    pe: "P/E (price to earnings): how many dollars investors pay for each $1 of yearly profit. Higher usually means more growth is expected; compare it with similar companies, not across industries.",
    fpe: "Forward P/E: the same idea, using next year's expected profit. Lower than the P/E means profit is expected to grow.",
    mcap: "Market cap: what the whole company is worth on the stock market, the price times all its shares.",
    divY: "Dividend yield: the cash paid to shareholders each year, as a share of today's price.",
    eps: "EPS (earnings per share): the company's profit over the last 12 months, divided by its number of shares.",
    beta: "Beta: how much the stock tends to swing compared with the whole market. 1 means the same, 1.5 means about 50% bigger swings, 0.5 about half.",
    target: "Analyst target: the average price analysts expect in about a year. A guess, not a promise.",
    rating: "Analysts: the average of analysts' ratings, from 1 (strong buy) to 5 (sell).",
    margin: "Profit margin: how much of each $1 of sales the company keeps as profit.",
    growth: "Revenue growth: how much sales grew compared with a year earlier.",
    range: "52-week range: the lowest and highest price in the last year, and where today's price sits between them.",
    perf: "Performance: how much the price changed over each period. Dividends aren't included.",
    ma50: "50-day average: the average closing price over the last 50 trading days, about ten weeks. A price above it means the recent trend is up; the small number is how far the price is from it.",
    ma200: "200-day average: the average over about ten months, the classic long-term trend line. Above it, the long-term trend is up; below it, down.",
    rsi: "RSI (relative strength index, 14 days): from 0 to 100, how strongly the price has moved lately. Above 70 it has risen fast and may pause; below 30 it has fallen fast and may bounce. A hint, not a rule.",
    crowd: "Crowd mood: recent StockTwits posts tagged bullish versus bearish. Loud and fast-moving, not always right.",
  };
  function renderDetail() {
    const el = $("#detail"), keep = el.scrollTop;
    const x = openSym && byS(openSym);
    el.classList.toggle("open", !!x || (!!openSym && previewWait === openSym)); lockBody();
    if (!x && openSym && previewWait === openSym) {   // a stock from Ideas, still loading
      el.innerHTML = `<div class="sh-head"><h2>${esc(openSym)}</h2><button class="link" data-act="close">Done</button></div><div class="sh-body"><div class="booting" role="status"><span class="busy-dot"></span>Loading ${esc(openSym)}…</div></div>`;
      return;
    }
    if (!x) return;
    const d = dayPct(x), c = cls(d);
    const hk = x.s + "|" + range;
    if (HIST_R.includes(range) && (!hist[hk] || (range !== "5y" && Date.now() - hist[hk].at > 5 * 60e3)) && !histWant.has(hk)) { histWant.add(hk); send("history", { s: x.s, v: range }); }
    el.innerHTML = `<div class="sh-head"><h2>${esc(x.s)}</h2><button class="link" data-act="close">Done</button></div><div class="sh-body">
      <p class="dname">${esc(x.name)}<small>${esc([x.exch, x.cur].filter(Boolean).join(" · "))}</small></p>
      <div class="dprice"><b>${money(x.price, x.cur)}</b><span class="pill ${c}">${pct(d)} today</span></div>
      <p class="note">${x.mt ? "Last trade " + when(x.mt) : x.err ? "Couldn't load: " + esc(x.err) : ""}</p>${mkBadge(x, true)}
      <div class="seg wide rng">${[["1d", "1D"], ["5d", "1W"], ["1m", "1M"], ["6m", "6M"], ["1y", "1Y"], ["5y", "5Y"]].map(([v, l]) => `<button class="${range === v ? "on" : ""}" data-act="range" data-v="${v}">${l}</button>`).join("")}</div>
      ${HIST_R.includes(range) && !hist[x.s + "|" + range] ? `<p class="muted pad chart-wait">Loading ${range === "1d" ? "today" : range === "5d" ? "the week" : "five years"}…</p>` : chartFor(x)}
      ${holdingHTML(x)}${signalHTML(x)}${storyHTML(x)}${numbersHTML(x)}${aboutHTML(x)}${newsHTML(x)}${manageHTML(x)}
    </div>`;
    el.scrollTop = keep;   // re-renders must not jump the user back to the top
  }
  function holdingHTML(x) {
    if (x.list !== "own") return "";
    if (!x.sh) return `<section class="hold"><p class="muted">How many shares do you own? Add them to see your value and gain.</p><button class="sm primary" data-act="holding" data-v="${esc(x.s)}">Add shares</button></section>`;
    const v = x.price != null ? x.sh * x.price : null, g = x.cost && v != null ? v - x.sh * x.cost : null, dh = dayHome(x);
    return `<section class="hold"><div class="hold-g">
      <div><small>Shares</small><b>${P(nf(x.sh, x.sh % 1 ? 2 : 0))}</b></div><div><small>Value</small><b>${P(homeMoney(v, x.cur))}</b></div>
      <div><small>Today</small><b class="${cls(dh != null ? dh : dayPct(x))}">${P(dh != null ? signed(dh, HOME()) + (foreign(x.cur) ? `<small class="orig">${signed(x.sh * (x.price - x.prev), x.cur)}</small>` : "") : x.prev ? signed(x.sh * (x.price - x.prev), x.cur) : "—")}${priv() ? ` <small>${pct(dayPct(x))}</small>` : ""}</b></div>
      <div><small>Since you bought</small><b class="${cls(g)}">${g != null ? P(homeMoney(g, x.cur, false, true)) + " (" + pct((x.price / x.cost - 1) * 100, 1) + ")" : "—"}</b></div></div>
      ${foreign(x.cur) && fxr(x.cur) != null ? `<p class="note">In ${esc(HOME())} at today's rate; the stock trades in ${esc(x.cur)}.</p>` : ""}
      ${x.cost ? `<p class="note">Average price ${P(money(x.cost, x.cur))}</p>` : ""}</section>`;
  }
  function signalHTML(x) {
    if (x.sig) return `<section class="sigsec"><h3 class="sec">Stockit's view</h3>
      <div class="sigbig sig-${x.sig.signal}"><span class="sb-w">${cap(x.sig.signal)}</span><span class="sb-c">${esc(x.sig.confidence)} confidence</span></div>
      ${x.sig.line ? `<p>${esc(x.sig.line)}</p>` : ""}${!x.story && x.bstory ? `<p class="ink2">${esc(x.bstory)}</p>` : ""}
      <span class="badge-ai">✦ AI view by ${PN[x.sig.by] || esc(x.sig.by)}, ${rel(x.sig.at)}</span><p class="note">An opinion from the numbers and headlines here, not financial advice.</p></section>`;
    if (x.trend) return `<section class="sigsec"><h3 class="sec">Price trend</h3>
      <div class="sigbig ex t-${x.trend.trend}"><span class="sb-w">${TREND[x.trend.trend]}</span></div><p>${esc(x.trend.why)}</p>
      <span class="badge-ex">From the price alone — no AI</span></section>`;
    return "";
  }
  function storyHTML(x) {
    if (!S.settings.hasKey) return `<p class="note pad">For this stock's story in plain words and a buy, hold or sell view, add a key in <button class="link small" data-act="cfgopen">Settings › AI settings</button>.</p>`;
    const st = x.story, bz = isBusy("story:" + x.s);
    if (!st) return `<section class="story"><h3 class="sec">The story</h3><p class="muted">What the company does, what's happening now and why, and whether the price looks cheap or expensive, from the latest headlines.</p>
      <div class="aic-btns"><button class="primary" data-act="story" data-v="${esc(x.s)}" ${bz ? "disabled" : ""}>${bz ? "Writing…" : "Write the story"}</button></div></section>`;
    const list = (t, a) => a && a.length ? `<h3 class="mini">${t}</h3><ul class="dots">${a.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
    return `<section class="story"><h3 class="sec">The story</h3><span class="badge-ai">✦ AI story by ${PN[st.by] || esc(st.by)}</span>
      <h2 class="story-t">${esc(st.headline)}</h2>${paras(st.story, st.news).join("")}
      ${list("Why " + st.signal, st.reasons)}${list("What could go wrong", st.risks)}${list("What to watch", st.watch)}
      <p class="note">Written ${rel(st.at)}. Not financial advice.</p>
      <div class="aic-btns"><button class="sm" data-act="listenstory" data-v="${esc(x.s)}">${SPK}Listen</button><button class="sm" data-act="share-story" data-v="${esc(x.s)}">Share</button>
        <button class="sm" data-act="story" data-v="${esc(x.s)}" ${bz ? "disabled" : ""}>${bz ? "Writing…" : "Rewrite"}</button></div></section>`;
  }
  function numbersHTML(x) {
    const f = x.f || {}, st = x.st || {};
    const up = f.target && x.price ? (f.target / x.price - 1) * 100 : null;
    const tiles = [
      ["pe", "P/E", f.pe != null ? nf(f.pe, 1) : "—"], ["fpe", "Forward P/E", f.fpe != null ? nf(f.fpe, 1) : "—"],
      ["mcap", "Market cap", bigN(f.mcap)], ["divY", "Dividend yield", f.divY ? nf(f.divY, 2) + "%" : f.pe != null || f.mcap ? "None" : "—"],
      ["eps", "EPS, 12 months", f.eps != null ? money(f.eps, x.cur) : "—"], ["beta", "Beta", f.beta != null ? nf(f.beta, 2) : "—"],
      ["target", "Analyst target", f.target ? `${money(f.target, x.cur)} <small class="${cls(up)}">${pct(up, 0)}</small>` : "—"],
      ["rating", "Analysts", f.rating ? esc(f.rating) : f.rec ? esc(cap(String(f.rec).replace(/_/g, " "))) : "—"],
    ].concat(f.margin != null ? [["margin", "Profit margin", nf(f.margin, 1) + "%"]] : []).concat(f.growth != null ? [["growth", "Revenue growth", pct(f.growth, 1)]] : []);
    const rsi = rsiC(x.pts), vsMa = v => v && x.price != null ? ` <small class="${cls(x.price - v)}">${pct((x.price / v - 1) * 100, 1)}</small>` : "";
    tiles.push(["ma50", "50-day average", st.ma50 ? money(st.ma50, x.cur) + vsMa(st.ma50) : "—"], ["ma200", "200-day average", st.ma200 ? money(st.ma200, x.cur) + vsMa(st.ma200) : "—"],
      ["rsi", "RSI, 14 days", rsi != null ? `${nf(rsi, 0)} <small>${rsiWord(rsi)}</small>` : "—"]);
    const c = x.crowd, crowd = c && c.bull + c.bear >= 5 ? Math.round(c.bull / (c.bull + c.bear) * 100) : null;
    const ex = explainKey && EXPLAIN[explainKey] ? `<p class="explain">${esc(EXPLAIN[explainKey])}</p>` : `<p class="note">Tap a number to see what it means.</p>`;
    return `<section><h3 class="sec">Key numbers</h3>
      <div class="tiles">${tiles.map(([k, l, v]) => `<button class="tile ${explainKey === k ? "on" : ""}" data-act="explain" data-v="${k}"><small>${l}</small><b>${v}</b></button>`).join("")}</div>
      <button class="rangebox ${explainKey === "range" ? "on" : ""}" data-act="explain" data-v="range"><small>52-week range</small>
        <div class="rbar"><i style="left:${st.pos52 == null ? 50 : st.pos52.toFixed(1)}%"></i></div>
        <div class="rlab"><span>${money(st.lo, x.cur)}</span><span>${st.pos52 == null ? "" : "now at " + st.pos52.toFixed(0) + "% of the range"}</span><span>${money(st.hi, x.cur)}</span></div></button>
      <button class="rangebox ${explainKey === "perf" ? "on" : ""}" data-act="explain" data-v="perf"><small>Performance</small>
        <div class="perf">${[["1 month", st.p1m], ["6 months", st.p6m], ["1 year", st.p1y]].map(([l, v]) => `<span><small>${l}</small><b class="${cls(v)}">${pct(v, 1)}</b></span>`).join("")}</div></button>
      ${crowd != null ? `<button class="rangebox ${explainKey === "crowd" ? "on" : ""}" data-act="explain" data-v="crowd"><small>Crowd mood on StockTwits</small>
        <div class="mood"><i style="width:${crowd}%"></i></div><div class="rlab"><span class="up">${crowd}% bullish</span><span>${c.bull + c.bear} tagged posts</span><span class="down">${100 - crowd}% bearish</span></div></button>` : ""}
      ${ex}${f.src ? `<p class="note">Company numbers from ${esc(f.src)}${x.fAt ? ", " + rel(x.fAt) : ""}.</p>` : `<p class="note">Company numbers load with the next refresh.</p>`}</section>`;
  }
  function aboutHTML(x) {
    const p = x.prof;
    if (!p || !(p.about || p.sector)) return "";
    return `<section><h3 class="sec">About</h3>${p.sector ? `<p class="ink2">${esc([p.sector, p.industry].filter(Boolean).join(" › "))}</p>` : ""}
      ${p.about ? `<details class="about"><summary>${esc(p.about.slice(0, 160))}${p.about.length > 160 ? "…" : ""}</summary><p>${esc(p.about)}</p></details>` : ""}</section>`;
  }
  function newsHTML(x) {
    const n = x.news || [];
    return `<section><h3 class="sec">Headlines</h3>${n.length ? n.map(h => `<button class="news" data-act="newsopen" data-s="${esc(x.s)}" data-v="${esc(h.l)}">
      <b>${esc(h.t)}</b><small>${esc(h.p)} · ${rel(h.at)}${h.src === "web" ? " · web" : ""}</small></button>`).join("")
      : `<p class="muted">${x.newsAt ? "No headlines in the last few days." : "Headlines load in a moment…"}</p>`}</section>`;
  }
  function manageHTML(x) {
    if (x.list === "preview") return `<section class="manage"><h3 class="sec">Not on your lists yet</h3><p class="muted">You're looking at ${esc(x.s)} from Ideas. Add it to follow it like your other stocks.</p>
      <div class="aic-btns"><button class="sm primary" data-act="addpreview" data-v="watch" data-s="${esc(x.s)}">Add to watchlist</button><button class="sm" data-act="addpreview" data-v="own" data-s="${esc(x.s)}">I own this</button></div></section>`;
    return `<section class="manage"><h3 class="sec">Manage</h3><div class="aic-btns">
      ${x.list === "own" ? `<button class="sm" data-act="holding" data-v="${esc(x.s)}">Edit shares</button><button class="sm" data-act="move" data-v="watch" data-s="${esc(x.s)}">Move to watchlist</button>`
        : `<button class="sm primary" data-act="move" data-v="own" data-s="${esc(x.s)}">I own this</button>`}
      <button class="sm danger ${rmArmed === x.s ? "armed" : ""}" data-act="remove" data-v="${esc(x.s)}">${rmArmed === x.s ? "Confirm" : "Remove"}</button></div></section>`;
  }

  // ---- adding stocks ----
  function renderAdd() {
    const el = $("#addsheet"), keep = el.scrollTop;
    el.classList.toggle("open", addOpen); lockBody();
    if (!addOpen) return;
    const bz = isBusy("import");
    const res = searching ? `<p class="muted pad">Searching…</p>` : results ? (results.length ? results.map(r => `<div class="srow">
        <div class="grow"><b>${esc(r.s)}</b><small class="muted">${esc(r.name)} · ${esc(r.exch)}${r.type ? " · " + esc(r.type) : ""}</small></div>
        ${r.have || byS(r.s) ? `<span class="note">Added ✓</span>` : `<button class="sm primary" data-act="addsym" data-v="${esc(r.s)}">Add</button>`}</div>`).join("") : `<p class="muted pad">Nothing found. Try the company name or its ticker.</p>`) : "";
    el.innerHTML = `<div class="sh-head"><h2>Add stocks</h2><button class="link" data-act="addclose">Done</button></div><div class="sh-body">
      <div class="lk-row"><span class="lk-l">Add to</span><div class="seg wide">${[["own", "Portfolio (I own it)"], ["watch", "Watchlist"]].map(([v, l]) => `<button class="${addTo === v ? "on" : ""}" data-act="addto" data-v="${v}">${l}</button>`).join("")}</div></div>
      <div class="field"><input id="q" type="search" placeholder="Company name or ticker" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search"><button class="primary" data-act="find">Find</button></div>
      <div id="results">${res}</div>
      <h3 class="sec">Bring in a list</h3>
      <p class="hint">One per line, with shares and average price if you like: <b>AAPL 10 @ 150</b>, or just <b>MSFT, NVDA, ASML.AS</b>.</p>
      <textarea id="paste" class="cfgin wide" rows="4" placeholder="AAPL 10 @ 150&#10;MSFT&#10;NVDA">${esc(pasteText)}</textarea>
      <div class="aic-btns"><button class="sm primary" data-act="paste" ${bz ? "disabled" : ""}>${bz ? "Adding…" : "Add these"}</button></div>
      <div class="srow"><div class="grow"><b>Import a CSV file</b><small class="muted">A broker export: the symbol, quantity and average price columns are found for you</small></div><button class="sm" data-act="csv" ${bz ? "disabled" : ""}>Choose file</button></div>
      ${S.settings.hasKey ? `<div class="srow"><div class="grow"><b>✦ Import from a screenshot</b><small class="muted">Screenshot your watchlist in Apple's Stocks app or your broker app; AI reads the tickers</small></div><button class="sm" data-act="shot" ${bz ? "disabled" : ""}>${bz ? "Reading…" : "Choose photo"}</button></div>` : ""}
      <p class="note">Apple's Stocks app doesn't share its watchlist with other apps, so ${S.settings.hasKey ? "a screenshot is the quickest way to bring it over" : "paste its tickers here, or add an AI key in Settings to import a screenshot of it"}.</p>
    </div>`;
    el.scrollTop = keep;
  }

  // ---- Settings (app-blueprints · settings) ----
  const cfgItem = k => { for (const sec of S.cfgSchema) for (const d of sec.items) if (d.k === k) return d; return null; };
  const cfgChanged = k => { const d = cfgItem(k); return d && JSON.stringify(S.cfg[k]) !== JSON.stringify(d.def); };
  const fmtCfg = (d, v) => d.step && d.step < 1 ? Number(v).toFixed(String(d.step).split(".")[1].length) : String(v);
  const bpLink = b => `${S.blueprintsRepo}/blob/${b.id}-v${b.version}/blueprints/${b.id}.md`;   // the exact version the app follows
  function builtWithHTML() {
    return `<h3 class="sec">Built with</h3>
      <p class="hint">${esc(S.appName)} is built from shared blueprints that its other apps use too. Tap one to read how that part works.</p>
      ${S.blueprints.map(b => `<button class="srow bp" data-act="openurl" data-v="${esc(bpLink(b))}">
        <div class="grow"><b>${esc(b.name)}</b><small class="muted">Blueprint ${esc(b.version)} · since ${esc(S.appName)} ${esc(b.since)}</small></div><span class="chev" aria-hidden="true">›</span></button>`).join("")}
      <button class="srow bp" data-act="openurl" data-v="${esc(S.blueprintsRepo)}">
        <div class="grow"><b>All blueprints</b><small class="muted">${esc(S.blueprintsRepo.replace("https://", ""))}</small></div><span class="chev" aria-hidden="true">›</span></button>`;
  }
  const sw = (k, label, help) => `<div class="srow"><div class="grow"><b>${label}</b><small class="muted">${help}</small></div><button class="switch ${S.settings[k] ? "on" : ""}" data-act="toggle" data-v="${k}" aria-label="${label}"></button></div>`;
  function renderCfg() {
    const el = $("#cfgsheet"), keepTop = el.scrollTop;
    el.classList.toggle("open", cfgOpen); lockBody();
    if (!cfgOpen) return;
    const field = d => {
      const v = S.cfg[d.k], ch = cfgChanged(d.k);
      const reset = ch ? `<button class="link small" data-act="cfgreset" data-k="${d.k}">Reset</button>` : "";
      const head = `<div class="cfg-h"><b>${esc(d.label)}</b>${reset}</div>${d.help ? `<small class="muted">${esc(d.help)}</small>` : ""}`;
      if (d.type === "text") return `<div class="cfg ${ch ? "ch" : ""}">${head}<input class="cfgin wide" data-k="${d.k}" value="${esc(v)}" autocapitalize="off" autocorrect="off" spellcheck="false"></div>`;
      if (d.type === "lines") return `<div class="cfg ${ch ? "ch" : ""}">${head}<textarea class="cfgin wide" data-k="${d.k}" rows="${Math.max(4, v.length + 1)}">${esc(v.join("\n"))}</textarea></div>`;
      return `<div class="cfg ${ch ? "ch" : ""}">${head}
        <div class="stepper"><button data-act="cfgstep" data-k="${d.k}" data-v="-1" aria-label="Decrease" ${v <= d.min ? "disabled" : ""}>−</button>
        <input class="cfgin" data-k="${d.k}" value="${fmtCfg(d, v)}" inputmode="decimal" aria-label="${esc(d.label)}">
        <button data-act="cfgstep" data-k="${d.k}" data-v="1" aria-label="Increase" ${v >= d.max ? "disabled" : ""}>+</button>
        <span class="unit">${esc(d.unit || "")}</span><span class="range">${fmtCfg(d, d.min)}–${fmtCfg(d, d.max)}${ch ? ` — original ${fmtCfg(d, d.def)}` : ""}</span></div></div>`;
    };
    const changed = Object.keys(S.cfg).filter(cfgChanged).length;
    const fh = S.secrets.finnhub, A = S.ai, Pu = A.usage.p[A.provider];
    el.innerHTML = `<div class="sh-head"><h2>Settings</h2><button class="link" data-act="cfgclose">Done</button></div><div class="sh-body">
      <p class="hint">Changes apply right away and are kept on this iPhone.</p>
      <h3 class="sec">Appearance</h3>${lookHTML()}
      <h3 class="sec">Portfolio</h3>
      ${sw("refreshOnOpen", "Refresh when Stockit opens", "Off: prices and news load only when you tap refresh")}
      <div class="srow"><div class="grow"><b>Show your money in</b><small class="muted">Portfolio value, today and gains, here and in the widget. Stocks in other currencies are converted at today's rate. ${S.fx && S.fx.choice === "auto" ? `Auto uses the currency most of your money is in (now ${esc(HOME())}).` : ""}</small></div>
        <select id="homeCur" class="cursel" aria-label="Currency">${[["auto", "Auto"]].concat(((S.fx && S.fx.curs) || []).map(c2 => [c2, c2])).map(([v, l]) => `<option value="${v}" ${(S.fx && S.fx.choice) === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      ${sw("widgetMoney", "Show portfolio value in the widget", "Off: the widget shows only percentages, never amounts")}
      <h3 class="sec">News and signals</h3>
      ${sw("newsYahoo", "Yahoo Finance headlines", "Business news about each stock")}
      ${sw("newsWeb", "Headlines from the web", "Wider coverage through Google News, including blogs and big newspapers")}
      ${sw("crowd", "Crowd mood", "How StockTwits posts lean, bullish or bearish (US tickers)")}
      <div class="srow"><div class="grow"><b>Finnhub key (optional)</b><small class="muted">${fh.last4 ? "Saved, ending …" + esc(fh.last4) : "Not set"}. A backup source for company numbers when Yahoo doesn't answer.</small></div>
        <button class="sm" data-act="secret-set" data-v="finnhub">${fh.last4 ? "Change" : "Add"}</button>${fh.last4 ? `<button class="sm danger ${secArmed === "finnhub" ? "armed" : ""}" data-act="secret-remove" data-v="finnhub">${secArmed === "finnhub" ? "Confirm" : "Remove"}</button>` : ""}</div>
      <h3 class="sec">AI advice</h3>
      <div class="lk-row"><span class="lk-l">Investing style</span><div class="seg wide">${[["cautious", "Cautious"], ["balanced", "Balanced"], ["adventurous", "Adventurous"]].map(([v, l]) => `<button class="${S.settings.style === v ? "on" : ""}" data-act="style" data-v="${v}">${l}</button>`).join("")}</div>
        <small class="muted">Shapes the buy, hold or sell views and the ideas. Applies to the next briefing.</small></div>
      <div class="srow"><div class="grow"><b>Keys, models and token usage</b><small class="muted">${S.settings.hasKey
        ? `${PN[A.provider]} — ${esc(A.model[A.provider])}${Pu ? " — " + fmtN(Pu.in + Pu.out) + " tokens used" : ""}`
        : "Add a Claude or OpenAI key for the briefing, stories, signals and ideas"}</small></div>
        <button class="sm ${S.settings.hasKey ? "" : "primary"}" data-act="aiopen">AI settings</button></div>
      <h3 class="sec">Listening</h3>${listenHTML()}
      <h3 class="sec">Updates</h3>
      <div class="srow"><div class="grow"><b>Offer new versions</b><small class="muted">You have Stockit ${esc(S.version)}. “Later” waits two days.</small></div><button class="switch ${S.settings.checkUpdates ? "on" : ""}" data-act="toggle" data-v="checkUpdates" aria-label="Offer new versions"></button></div>
      <div class="srow"><div class="grow"><b>Check for updates now</b><small id="updmsg" class="muted" aria-live="polite"></small></div><button class="sm" data-act="updcheck">Check</button></div>
      <div class="srow"><div class="grow"><b>Start-up log</b><small class="muted">What happened the last times Stockit opened</small></div><button class="sm" data-act="startlog">Show</button></div>
      <pre id="startlog" class="startlog" hidden></pre>
      ${S.cfgSchema.map(sec => `<h3 class="sec">${esc(sec.title)}</h3>${sec.items.filter(d2 => d2.k !== "ideaThemes").map(field).join("")}${sec.items.some(d2 => d2.k === "ideaThemes") ? `<p class="note">Themes for ideas are in the <button class="link small" data-act="gotab" data-v="ideas">Ideas tab</button>.</p>` : ""}`).join("")}
      <div class="aic-btns cfg-foot"><span class="note">${changed ? changed + " setting" + (changed === 1 ? "" : "s") + " changed" : "All settings are at their original values"}</span>
        ${changed ? `<button class="sm danger ${cfgArmed ? "armed" : ""}" data-act="cfgall">${cfgArmed ? "Confirm reset" : "Reset all"}</button>` : ""}</div>
      ${builtWithHTML()}
    </div>`;
    el.scrollTop = keepTop;   // re-renders must not jump the user back to the top
  }

  // ---- AI settings (app-blueprints · ai-configuration, Step 7) ----
  const fmtN = n => n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e4 ? Math.round(n / 1e3) + "k" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(n);
  function arm(key) { aiArmed = key; renderAI(); setTimeout(() => { if (aiArmed === key) { aiArmed = null; renderAI(); } }, 3500); }
  function usageBlock(p, P) {
    const days = [], now = new Date();
    for (let i = 13; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i);
      days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`); }
    const tot = k => { const x = P.days[k]; return x ? x.in + x.out : 0; };
    const max = Math.max(1, ...days.map(tot)), month = S.ai.today.slice(0, 7);
    const monthTot = Object.entries(P.days).filter(([k]) => k.startsWith(month)).reduce((n, [, x]) => n + x.in + x.out, 0);
    const rows = (obj, label) => Object.entries(obj).sort((x, y) => (y[1].in + y[1].out) - (x[1].in + x[1].out))
      .map(([k, x]) => `<tr><td>${esc(label(k))}</td><td>${x.calls}</td>${x.chars && !x.in ? `<td>${fmtN(x.chars)} chars</td><td>—</td>` : `<td>${fmtN(x.in)}</td><td>${fmtN(x.out)}</td>`}</tr>`).join("");
    return `<div class="ucard"><div class="aic-h"><b>${PN[p]}</b><span class="muted small">${P.calls} request${P.calls === 1 ? "" : "s"}</span></div>
      <div class="ustat"><div><b>${fmtN(P.in + P.out)}</b><small>total tokens</small></div><div><b>${fmtN(P.in)}</b><small>input</small></div><div><b>${fmtN(P.out)}</b><small>output</small></div></div>
      <p class="note">Today ${fmtN(tot(S.ai.today))} tokens — this month ${fmtN(monthTot)} tokens</p>
      <div class="ubars" aria-label="Tokens per day, last 14 days">${days.map(k => `<span style="height:${Math.max(tot(k) ? 6 : 2, tot(k) / max * 100)}%" class="${tot(k) ? "" : "zero"}" title="${k}: ${tot(k)} tokens"></span>`).join("")}</div>
      <div class="ubars-l"><span>2 weeks ago</span><span>Today</span></div>
      <table class="utab"><tr><th>Feature</th><th>Requests</th><th>In</th><th>Out</th></tr>${rows(P.features, k => FEAT[k] || k)}</table>
      <table class="utab"><tr><th>Model</th><th>Requests</th><th>In</th><th>Out</th></tr>${rows(P.models, k => k)}</table></div>`;
  }
  function renderAI() {
    const el = document.getElementById("aisheet"), keep = el.scrollTop;
    el.classList.toggle("open", aiOpen); lockBody();
    if (!aiOpen) return;
    const A = S.ai;
    const card = p => {
      const key = A.keys[p], ml = (A.models[p] || {}).list || [], cur = A.model[p];
      const opts = ml.some(m => m.id === cur) ? ml : [{ id: cur, name: cur }].concat(ml);   // keep the chosen model visible
      return `<div class="aicard ${A.provider === p ? "active" : ""}">
        <div class="aic-h"><b>${PN[p]}</b>${A.provider === p ? `<span class="badge-ai">In use</span>` : key ? `<button class="sm" data-act="aiprov" data-v="${p}">Use ${PN[p]}</button>` : ""}</div>
        <div class="aic-row"><span class="lbl">API key</span>${key ? `<code>${esc(key)}</code>` : `<span class="muted">Not set</span>`}</div>
        <div class="aic-btns"><button class="sm ${key ? "" : "primary"}" data-act="aikey" data-v="${p}">${key ? "Change key" : "Add key"}</button>
          ${key ? `<button class="sm" data-act="aitest" data-v="${p}">Test connection</button><button class="sm danger ${aiArmed === "rm" + p ? "armed" : ""}" data-act="airm" data-v="${p}">${aiArmed === "rm" + p ? "Confirm" : "Remove"}</button>` : ""}</div>
        <label class="aic-row lbl" for="ms-${p}">Model</label>
        <select id="ms-${p}" class="modelsel" data-p="${p}">${opts.map(m => `<option value="${esc(m.id)}" ${m.id === cur ? "selected" : ""}>${esc(m.name)}${m.name !== m.id ? " — " + esc(m.id) : ""}</option>`).join("")}</select>
        <div class="aic-btns"><button class="sm" data-act="aimodels" data-v="${p}" ${key && !aiLoading.has(p) ? "" : "disabled"}>${aiLoading.has(p) ? "Loading…" : ml.length ? "Refresh model list" : "Load my models"}</button>
          <span class="note">${ml.length ? `${ml.length} models, updated ${rel(A.models[p].at)}` : key ? "Loads the models your key can use" : "Add a key to load models"}</span></div>
      </div>`;
    };
    const order = A.provider === "openai" ? ["openai", "anthropic"] : ["anthropic", "openai"];
    const used = Object.keys(A.usage.p).filter(p => A.usage.p[p].calls);
    el.innerHTML = `<div class="sh-head"><h2>AI</h2><button class="link" data-act="aiclose">Done</button></div><div class="sh-body">
      <p class="hint">Keys stay in this iPhone's Keychain. Only the provider marked “In use” is called.</p>
      ${order.map(card).join("")}
      <h3 class="sec">What AI does</h3>
      <div class="srow"><div class="grow"><b>Portfolio briefing</b><small class="muted">Written after a refresh, at most every ${S.cfg.briefingHours} h or when your stocks change; one request each time. Stories and ideas run only when you tap them.</small></div>
        <button class="switch ${S.settings.ai ? "on" : ""}" data-act="toggle" data-v="ai" aria-label="Portfolio briefing"></button></div>
      <div class="srow"><div class="grow"><b>Suggested strategies</b><small class="muted">${S.cfg.stratEvery ? `Refreshed every ${S.cfg.stratEvery >= 24 ? (S.cfg.stratEvery / 24 === 1 ? "day" : S.cfg.stratEvery / 24 + " days") : S.cfg.stratEvery + " hours"}, when Stockit opens or you open Ideas; one request each time.` : "Only when you tap Refresh in Ideas."}</small></div>
        <button class="switch ${S.settings.aiStrat ? "on" : ""}" data-act="toggle" data-v="aiStrat" aria-label="Suggested strategies"></button></div>
      <h3 class="sec">Token usage</h3>
      ${used.length ? used.map(p => usageBlock(p, A.usage.p[p])).join("") : `<p class="muted pad">No AI requests yet.</p>`}
      ${used.length ? `<div class="aic-btns"><span class="note">Counting since ${new Date(A.usage.since).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
        <button class="sm danger ${aiArmed === "reset" ? "armed" : ""}" data-act="usagereset">${aiArmed === "reset" ? "Confirm reset" : "Reset counters"}</button></div>` : ""}
    </div>`;
    el.scrollTop = keep;   // re-renders must not jump the user back to the top
  }

  // ---- Flash: each stock's top headlines, a TL;DR per headline, and reading aloud ----
  const MAJOR = /reuters|bloomberg|financial times|wall street journal|\bwsj\b|cnbc|barron|marketwatch|economist|associated press|yahoo finance|investor's business|morningstar|nikkei|forbes|fortune|handelsblatt/i;
  const QUOTE_PAGE = /stock price, news, quote|bond yield and price|price, chart|quote & history|historical prices/i;   // listing pages, not news
  function rankNews(x) {
    const now = Date.now(), tick = x.s.split(/[.=^-]/)[0].replace(/[^A-Za-z0-9]/g, ""), first = String(x.name || "").split(/[\s,.]/)[0].toLowerCase();
    const about = h => (tick && new RegExp("\\b" + tick + "\\b", "i").test(h.t)) || (first.length > 2 && h.t.toLowerCase().includes(first));
    const score = h => Math.exp(-(now - h.at) / 864e5 / 1.5) + (MAJOR.test(h.p) ? 0.5 : 0) + (about(h) ? 0.4 : -0.8);   // headlines that don't name the company sink
    return (x.news || []).filter(h => !QUOTE_PAGE.test(h.t)).map(h => [h, score(h)]).sort((a, b) => b[1] - a[1]).map(a => a[0]);
  }
  const topNews = x => rankNews(x).slice(0, S.cfg.flashPerStock || 3);
  const flashOrder = () => S.stocks.slice().sort((a, b) => (a.list === "own" ? 0 : 1) - (b.list === "own" ? 0 : 1)
    || (posHome(b) || 0) - (posHome(a) || 0) || a.s.localeCompare(b.s));
  // A folded card stays folded until a newer headline arrives; then it opens again, marked New.
  const fold = () => S.settings.flashFold || {};
  const newest = x => Math.max(0, ...topNews(x).map(h => h.at || 0));
  const isFolded = x => fold()[x.s] != null && newest(x) <= fold()[x.s];
  function setFold(syms, on) {
    const f = Object.assign({}, fold());
    syms.forEach(s => { const x = byS(s); if (on && x) f[s] = newest(x); else delete f[s]; });
    S.settings.flashFold = f; send("set", { k: "flashFold", v: f }); render();
  }
  const ratingWord = r => { const m = String(r || "").match(/^\s*([\d.]+)\s*-\s*(.+)$/); return m ? [m[2].trim(), m[1]] : r ? [String(r), ""] : null; };
  function flashFacts(x) {   // the left column: your position, today's money, Stockit's view, analysts and the crowd
    const d = dayPct(x), own = x.list === "own" && x.sh, dh = own ? dayHome(x) : null, todayMoney = dh != null ? dh : own && x.prev != null && x.price != null ? x.sh * (x.price - x.prev) : null, tmCur = dh != null ? HOME() : x.cur;
    const r = ratingWord(x.f && x.f.rating), c = x.crowd, crowd = c && c.bull + c.bear >= 5 ? Math.round(c.bull / (c.bull + c.bear) * 100) : null;
    return `<span class="pill ${cls(d)}">${pct(d)}</span>
      ${own ? `<span class="fl-k">${P(nf(x.sh, x.sh % 1 ? 2 : 0))} share${x.sh === 1 ? "" : "s"}</span><span class="fl-m ${cls(todayMoney)}">${todayMoney != null ? P(signed(todayMoney, tmCur)) + " today" : ""}</span>`
        : x.list !== "own" ? `<span class="fl-k">Watching</span>` : `<span class="fl-k">Shares not set</span>`}
      ${x.sig ? sigChip(x.sig) : x.trend ? `<span class="chip t-${x.trend.trend}">${TREND[x.trend.trend]}</span>` : ""}
      ${r ? `<span class="fl-r" title="Average analyst rating">Analysts <b>${esc(r[0])}</b>${r[1] ? ` <span class="muted">${esc(r[1])}</span>` : ""}</span>` : ""}
      ${crowd != null ? `<span class="fl-r" title="StockTwits crowd mood">Crowd <b class="${crowd >= 50 ? "up" : "down"}">${crowd}% bullish</b></span><span class="flmood" aria-hidden="true"><i style="width:${crowd}%"></i></span>` : ""}`;
  }
  const dgOpen = new Set();
  function storyPanel(x, d, dk) {
    const srcs = d.sources || [];
    return `<details class="fl-story" data-k="${esc(dk)}" ${dgOpen.has(dk) ? "open" : ""}><summary>${d.kind === "ai" ? "✦ " : ""}The story you heard · ${srcs.length ? `${d.read} of ${srcs.length} articles read in full` : esc(rel(d.at))}</summary>
      <h4>${esc(d.title)}</h4>${paras(d.story).join("")}${d.takeaway ? `<p class="fl-take"><b>What it could mean for ${esc(x.s)}:</b> ${esc(d.takeaway)}</p>` : ""}
      ${srcs.length ? `<ol class="fl-src">${srcs.map(sr => `<li><button class="link small" data-act="openlink" data-v="${esc(sr.l)}">${esc(sr.t)}</button><small>${esc(sr.p)} · ${sr.read ? `read in full, ${sr.words} words` : "headline only — the article couldn't be opened"}</small></li>`).join("")}</ol>` : ""}
      ${d.note ? `<p class="note">${esc(d.note)}</p>` : ""}</details>`;
  }
  function flashHTML() {
    if (!S.stocks.length) return `<section class="empty"><h2>No stocks yet</h2><p>Add a stock and its top headlines appear here, each with a TL;DR.</p><button class="primary" data-act="addopen">Add stocks</button></section>`;
    const n = S.cfg.flashPerStock || 3, list = flashOrder(), folded = list.filter(isFolded).length;
    return `<div class="listbar"><span>${folded ? `Top ${n} per stock · ${folded} read` : `Top ${n} headline${n === 1 ? "" : "s"} per stock`}</span><div class="lb-a">
        ${folded ? `<button class="sm" data-act="unfoldall">Open all</button>` : list.length > 1 ? `<button class="sm" data-act="foldall">Fold all</button>` : ""}
        <button class="sm" data-act="listenflash">${SPK}Listen</button></div></div>
      <div class="flash">${list.map(x => {
        const top = topNews(x), f = isFolded(x), isNew = fold()[x.s] != null && !f;
        const short = esc(String(x.name || "").replace(/,? (Inc\.?|Corporation|Corp\.?|N\.V\.|plc|Ltd\.?|Holdings?|Company|AG|SE|S\.E\.|S\.A\.)$/i, ""));
        if (f) return `<article class="fl folded" id="c-fl-${esc(x.s)}"><button class="fl-fold" data-act="fold" data-v="${esc(x.s)}" data-on="0" aria-label="Open ${esc(x.s)} headlines">
            <b>${esc(x.s)}</b><span class="pill ${cls(dayPct(x))}">${pct(dayPct(x))}</span>${x.sig ? sigChip(x.sig) : ""}
            <span class="fl-fs">${top.length} read · newest ${top.length ? rel(newest(x)) : "—"}</span><span class="chev" aria-hidden="true">›</span></button></article>`;
        const dk = dgKey(x), dd = dg[dk], busyS = !!dgWait[dk], on = tts.on && (tts.items[(tts.parts[tts.i] || {}).k] || {}).id === "fl-" + x.s;
        return `<article class="fl" id="c-fl-${esc(x.s)}"><div class="fl-l"><button class="fl-s" data-act="listenstock" data-v="${esc(x.s)}" aria-label="Listen to ${esc(x.s)} news">
            <b>${esc(x.s)} <span class="fl-spk ${busyS ? "busy" : ""}">${busyS ? `<span class="busy-dot"></span>` : SPK}</span></b><small>${short}</small></button>${mkBadge(x)}${flashFacts(x)}
            <button class="fl-open" data-act="open" data-v="${esc(x.s)}">Details ›</button></div>
          <div class="fl-n">${isNew ? `<span class="fl-new">New since you folded it</span>` : ""}${top.length ? top.map(h => `<button class="fl-h" data-act="newsopen" data-s="${esc(x.s)}" data-v="${esc(h.l)}"><b>${esc(h.t)}</b><small>${esc(h.p)} · ${rel(h.at)}</small></button>`).join("")
            : `<p class="muted small">${x.newsAt ? "No headlines in the last few days." : "Headlines load with the next refresh."}</p>`}
            ${top.length ? `<div class="fl-act"><button class="fl-done" data-act="fold" data-v="${esc(x.s)}" data-on="1">✓ Read — fold it</button><button class="fl-lis" data-act="listenstock" data-v="${esc(x.s)}">${SPK}Listen</button></div>` : ""}</div>${dd && !dd.error ? storyPanel(x, dd, dk) : ""}</article>`;
      }).join("")}</div>
      <p class="note pad">Tap a stock to hear the story of its top three articles, read in full; tap a headline for its TL;DR; fold a card once you've read it, and it opens again when new headlines arrive. Analysts is the average Wall Street rating from Yahoo Finance; Crowd is the StockTwits mood. Not financial advice.</p>`;
  }
  const newsOf = (s, l) => { const x = byS(s); return x && (x.news || []).find(h => h.l === l); };
  function openNews(s, l) {
    newsOpen = { s, l };
    if (!tl[l] || tl[l].error || (tl[l].kind === "extract" && S.settings.hasKey)) { tl[l] = "loading"; send("tldr", { s, l, id: l }); }
    renderNews(); $("#newssheet").scrollTop = 0;
  }
  window.onTldr = (id, d) => { tl[id] = d; if (newsOpen && newsOpen.l === id) renderNews(); };
  function renderNews() {
    const el = $("#newssheet"), keep = el.scrollTop;
    const x = newsOpen && byS(newsOpen.s), h = x && newsOf(x.s, newsOpen.l);
    if (newsOpen && !h) newsOpen = null;
    el.classList.toggle("open", !!h); lockBody();
    if (!h) return;
    const d = tl[h.l], dp = dayPct(x);
    let body;
    if (!d || d === "loading") body = `<div class="tli-load" role="status"><span class="busy-dot"></span>${S.settings.hasKey ? "Reading and summarising the article…" : "Reading the article…"}</div>`;
    else if (d.error) body = `<p class="err">${esc(d.error)}.</p><div class="aic-btns"><button class="sm" data-act="tldrretry">Try again</button></div>`;
    else body = `<div class="tli-top">${d.kind === "ai" ? `<span class="badge-ai">✦ AI summary by ${PN[d.by] || esc(d.by)}</span>` : `<span class="badge-ex">From the article — no AI</span>`}${d.mins ? `<span>${d.mins} min read</span>` : ""}</div>
      ${d.partial ? `<p class="note">The full article couldn't be read here, so this ${d.kind === "ai" ? "explains the headline and summary" : "is the article's own summary"}.</p>` : ""}${d.note ? `<p class="note">${esc(d.note)}</p>` : ""}
      <p class="tl-lead">${esc(d.lead)}</p>
      ${d.story ? `<div class="tl-story">${paras(d.story).join("")}</div><h3 class="mini">Key facts</h3>` : ""}
      ${(d.points || []).length ? `<ul class="tl-pts">${d.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      ${d.why ? `<div class="tl-why"><b>What it could mean for ${esc(x.s)}</b><p>${esc(d.why)}</p></div>` : ""}
      <div class="tl-listen"><button class="listen" data-act="listentldr">${SPK}Listen</button>${d.kind !== "ai" && S.settings.hasKey ? `<button class="sm" data-act="tldrretry">✦ Summarise with AI</button>` : ""}</div>`;
    const more = (x.news || []).filter(n => n.l !== h.l).slice(0, 6);
    el.innerHTML = `<div class="sh-head"><h2>${esc(x.s)} <span class="pill ${cls(dp)}">${pct(dp)}</span></h2><button class="link" data-act="newsclose">Done</button></div><div class="sh-body tl">
      <p class="kicker">${esc(h.p)} · ${rel(h.at)}${h.src === "web" ? " · from the web" : ""}</p>
      <h2 class="tl-h">${esc(h.t)}</h2>
      <h3 class="mini">TL;DR</h3>
      ${body}
      <button class="primary block" data-act="openlink" data-v="${esc((d && d.url) || h.l)}">Read the full article at ${esc(h.p)}</button>
      <p class="note">Summaries can miss details, and nothing here is financial advice.</p>
      ${more.length ? `<h3 class="sec">More about ${esc(x.s)}</h3>${more.map(n => `<button class="news" data-act="newsopen" data-s="${esc(x.s)}" data-v="${esc(n.l)}"><b>${esc(n.t)}</b><small>${esc(n.p)} · ${rel(n.at)}</small></button>`).join("")}` : ""}
    </div>`;
    el.scrollTop = keep;
  }
  const sentence = t => { t = clean(t); return t && !/[.!?]$/.test(t) ? t + "." : t; };
  function tldrItems(x, h, d) {
    return [{ title: h.t, text: [h.t, "From " + h.p, d.lead].concat(d.story ? [d.story.replace(/\s*\n+\s*/g, " ")] : d.points || []).concat(d.why ? ["What it could mean for " + (x.name || x.s) + ": " + d.why] : []).map(sentence).join(" ") }];
  }
  function briefItems(b) {
    return [{ title: b.headline, text: sentence(b.headline) + " " + b.story }].concat((b.watch || []).length ? [{ title: "Keep an eye on", text: "Keep an eye on: " + b.watch.map(sentence).join(" ") }] : []);
  }
  function storyItems(x, st) {
    const list = (t, a) => a && a.length ? [{ title: t, text: t + ". " + a.map(sentence).join(" ") }] : [];
    return [{ title: st.headline, text: sentence(st.headline) + " " + st.story }]
      .concat(list("Why " + st.signal, st.reasons), list("What could go wrong", st.risks), list("What to watch", st.watch));
  }
  function flashItems() {
    return flashOrder().filter(x => !isFolded(x)).map(x => ({ id: "fl-" + x.s, title: x.s, text: topNews(x).length
      ? sentence(x.name || x.s) + " " + topNews(x).map(h => sentence(h.t) + " From " + h.p + ".").join(" ")
      : "" })).filter(it => it.text);
  }

  // ---- read aloud (as in BlogPulse): iPhone voices through the Web Speech API, or ✦ AI voices from OpenAI ----
  // ── Read aloud: system voices through the Web Speech API ──
  const SYN = window.speechSynthesis;
  const SPK = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>`;
  const GENDER = {};
  ("Samantha Karen Moira Tessa Fiona Veena Victoria Allison Ava Susan Zoe Nicky Kate Serena Martha Catherine Isha Agnes Kathy Princess Vicki Joelle Flo Sandy Shelley Grandma " +
   "Amélie Audrey Aurélie Marie Anna Petra Helena Alice Federica Paulina Mónica Monica Marisol Luciana Joana Milena Katya Yuna Kyoko Ting-Ting Tingting Sin-ji Mei-Jia Meijia " +
   "Lekha Sara Nora Ellen Laura Zuzana Ioana Mariska Melina Yelda Damayanti Kanya Lesya Carmit Laila Amira Tünde Linh Montse Ewa Zosia Iveta Lana Satu Klara Alva Kristina Ellen Soumya Vani")
    .split(" ").forEach(n => GENDER[n] = "f");
  ("Daniel Alex Fred Aaron Arthur Rishi Oliver Tom Gordon Lee Evan Nathan Rocko Eddy Reed Ralph Grandpa Thomas Jacques Markus Yannick Luca Diego Jorge Juan Carlos Felipe Xander " +
   "Maged Majed Tarik Otoya Hattori Li-mu Yu-shu Aman Neel Dariush Rodrigo Martin Henrik Magnus Oskar Viktor Tünde")
    .split(" ").forEach(n => GENDER[n] = GENDER[n] || "m");
  const NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Pipe Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Deranged|Hysterical)\b/i;
  const baseName = v => v.name.replace(/\s*\((Enhanced|Premium|Compact)\)/i, "").replace(/\s*\(.*\)\s*$/, "").trim();
  const quality = v => /premium/i.test(v.name + v.voiceURI) ? "Premium" : /enhanced/i.test(v.name + v.voiceURI) ? "Enhanced" : "";
  const genderOf = v => GENDER[baseName(v)] || "";
  let voices = [];
  function loadVoices() { voices = SYN ? SYN.getVoices().filter(v => !NOVELTY.test(v.name)) : []; if (cfgOpen) renderCfg(); }
  if (SYN) { loadVoices(); SYN.addEventListener ? SYN.addEventListener("voiceschanged", loadVoices) : (SYN.onvoiceschanged = loadVoices); }
  function currentVoice() {
    if (!voices.length) return null;
    const saved = voices.find(v => v.voiceURI === S.settings.voiceURI);
    if (saved) return saved;
    const en = voices.filter(v => /^en(-|_|$)/i.test(v.lang));   // headlines are mostly English
    const rank = v => (quality(v) === "Premium" ? 3 : quality(v) === "Enhanced" ? 2 : 0) + (v.default ? 1 : 0) + (/en-(US|GB)/i.test(v.lang) ? 0.5 : 0);
    return (en.length ? en : voices).slice().sort((x, y) => rank(y) - rank(x))[0];
  }
  const langName = code => { try { return new Intl.DisplayNames([navigator.language || "en"], { type: "language" }).of(code) || code; } catch (e) { return code; } };
  const clean = t => String(t || "").replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, "").replace(/\*\*|__/g, "").replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
  function chunks(t) {   // short pieces: long utterances can stop early in WebKit
    const out = [];
    for (let sen of clean(t).match(/[^.!?…]+[.!?…]+["”’)]*\s*|[^.!?…]+$/g) || []) {
      sen = sen.trim(); if (!sen) continue;
      while (sen.length > 220) { let cut = sen.lastIndexOf(", ", 220); if (cut < 80) cut = sen.lastIndexOf(" ", 220); if (cut < 40) cut = 220; out.push(sen.slice(0, cut + 1).trim()); sen = sen.slice(cut + 1).trim(); }
      if (out.length && out[out.length - 1].length + sen.length < 160) out[out.length - 1] += " " + sen; else out.push(sen);
    }
    return out;
  }
  const tts = { parts: [], i: 0, label: "", items: [], token: 0, paused: false, on: false, timer: null, engine: "device", loading: false };
  // AI voice: OpenAI speech, played through one <audio> element that a tap unlocks first
  const OAI_VOICES = [["alloy", "n"], ["ash", "m"], ["ballad", "m"], ["coral", "f"], ["echo", "m"], ["fable", "m"], ["nova", "f"], ["onyx", "m"], ["sage", "f"], ["shimmer", "f"], ["verse", "m"], ["marin", "f"], ["cedar", "m"]];
  const LEGACY_TTS = new Set(["alloy", "ash", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer"]);
  const aiTTS = () => S.settings.speechEngine === "ai" && S.settings.hasOpenAI;
  const au = new Audio(); au.preload = "auto"; au.setAttribute("playsinline", "");
  const SILENT = (() => {   // 0.1 s of silence as a WAV, to unlock audio inside the tap
    const n = 800, buf = new Uint8Array(44 + n), dv = new DataView(buf.buffer);
    const w = (o, t) => { for (let i = 0; i < t.length; i++) buf[o + i] = t.charCodeAt(i); };
    w(0, "RIFF"); dv.setUint32(4, 36 + n, true); w(8, "WAVE"); w(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); w(36, "data"); dv.setUint32(40, n, true); buf.fill(128, 44);
    let str = ""; buf.forEach(b => { str += String.fromCharCode(b); }); return "data:audio/wav;base64," + btoa(str);
  })();
  function unlockAudio() { try { au.src = SILENT; const p = au.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
  function aiChunks(t) {   // split at sentences: a short first piece so audio starts quickly, then up to ~2,000 characters
    const out = []; let cur = "";
    for (const sen of clean(t).match(/[^.!?…]+[.!?…]+["”’)]*\s*|[^.!?…]+$/g) || []) {
      if (cur && (cur + sen).length > (out.length ? 2000 : 700)) { out.push(cur.trim()); cur = ""; }
      cur += sen;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function aiFetch(part) {
    if (part.audio) return Promise.resolve(part.audio);
    if (!part.pending) part.pending = new Promise((res, rej) => send("ttsaudio", { text: part.t }, (ok, msg) => ok ? res(part.audio = msg) : rej(msg)));
    return part.pending;
  }
  function aiPlayPart() {
    const my = ++tts.token, part = tts.parts[tts.i];
    if (!part) return waitOrStop();
    tts.loading = !part.audio; renderPlayer();
    aiFetch(part).then(b64 => {
      if (my !== tts.token) return;
      tts.loading = false;
      au.onended = () => { if (my !== tts.token) return; part.audio = null; tts.i++; aiPlayPart(); };
      au.src = "data:audio/mpeg;base64," + b64;
      if (!tts.paused) {
        const pr = au.play();
        if (pr && pr.catch) pr.catch(() => { if (my === tts.token) { tts.paused = true; renderPlayer(); window.toast("Tap play to start the AI voice"); } });
      }
      renderPlayer();
      const nx = tts.parts[tts.i + 1]; if (nx) aiFetch(nx).catch(() => {});   // the next piece is ready before this one ends
    }).catch(err => {
      if (my !== tts.token) return;
      const rest = tts.items.slice(part.k), label = tts.label;
      window.toast(`AI voice failed: ${String(err || "").slice(0, 70)}. Using the iPhone voice.`);
      if (SYN && voices.length) speak(label, rest, "device"); else stopSpeaking();
    });
  }
  const playSoon = () => { clearTimeout(tts.timer); tts.timer = setTimeout(playPart, 60); };   // iOS needs a beat after cancel()
  function speak(label, items, engine) {
    const ai = engine ? engine === "ai" : aiTTS();
    if (!ai && (!SYN || !voices.length)) {   // no Web Speech: hand the text to Scriptable's system voice
      send("speak", { text: items.map(x => clean(x.text)).join(" ") });
      return window.toast("Reading aloud with the system voice");
    }
    stopSpeaking(true);
    if (ai) unlockAudio();   // has to happen inside the tap, before any waiting
    tts.engine = ai ? "ai" : "device";
    tts.items = items; tts.label = label; tts.i = 0; tts.paused = false; tts.on = true;
    tts.parts = [];
    items.forEach((it, k) => (ai ? aiChunks : chunks)(it.text).forEach(t => tts.parts.push({ t, k })));
    if (!tts.parts.length) return stopSpeaking();
    playSoon();
  }
  function playPart() {
    if (tts.engine === "ai") return aiPlayPart();
    const my = ++tts.token, part = tts.parts[tts.i];
    if (!part) return waitOrStop();
    const u = new SpeechSynthesisUtterance(part.t), v = currentVoice();
    if (v) { u.voice = v; u.lang = v.lang; }
    u.rate = Number(S.settings.voiceRate) || 1; u.pitch = Number(S.settings.voicePitch) || 1;
    const next = () => { if (my !== tts.token) return; tts.i++; playPart(); };
    u.onend = next; u.onerror = e => { if (e.error !== "interrupted" && e.error !== "canceled") next(); };
    SYN.speak(u); renderPlayer();
  }
  // A queue the player starts on at once (inside the tap, so audio is allowed) and fills as stories arrive.
  function waitOrStop() {
    if (tts.on && tts.waiting > 0) { tts.idle = true; tts.loading = true; renderPlayer(); return; }
    return stopSpeaking();
  }
  function speakQueue(label, n) {
    const ai = aiTTS();
    if (!ai && (!SYN || !voices.length)) {   // no Web Speech: the system voice reads everything once it's ready
      const buf = []; let left = n;
      window.toast("Reading the articles… the system voice starts when they're ready");
      return it => { if (it) buf.push(it); if (--left === 0 && buf.length) send("speak", { text: buf.map(x => clean(x.text)).join(" ") }); };
    }
    stopSpeaking(true);
    if (ai) unlockAudio();
    const ses = Date.now() + Math.random();
    Object.assign(tts, { engine: ai ? "ai" : "device", items: [], label, i: 0, paused: false, on: true, parts: [], waiting: n, idle: true, loading: true, ses });
    renderPlayer();
    return it => {
      if (tts.ses !== ses || !tts.on) return;
      tts.waiting--;
      if (it) { const k = tts.items.length; tts.items.push(it); (ai ? aiChunks : chunks)(it.text).forEach(t => tts.parts.push({ t, k })); }
      if (tts.idle && tts.i < tts.parts.length) { tts.idle = false; playSoon(); }
      else if (tts.idle && !tts.waiting) stopSpeaking();
      else renderPlayer();
    };
  }
  // Listen to stocks' news: each stock's top articles, read in full and told as one story, one stock after another.
  const dg = {}, dgWait = {};
  const dgKey = x => x.s + "|" + topNews(x).map(h => h.l).join("|");
  function getDigest(x) {
    const k = dgKey(x);
    if (dg[k] && !(dg[k].kind === "extract" && S.settings.hasKey)) return Promise.resolve(dg[k]);
    if (!dgWait[k]) { let res; const p = new Promise(r => { res = r; }); dgWait[k] = { p, res }; send("digest", { s: x.s, links: rankNews(x).slice(0, 8).map(h => h.l), id: k }); if (tab === "flash") render(); }
    return dgWait[k].p;
  }
  window.onDigest = (id, d) => { if (!d.error) dg[id] = d; const w = dgWait[id]; delete dgWait[id]; if (w) w.res(d); if (tab === "flash") render(); };
  function digestItem(x, d) {
    if (d.error) return { id: "fl-" + x.s, title: x.s, text: sentence(x.name || x.s) + " " + topNews(x).map(h => sentence(h.t) + " From " + h.p + ".").join(" ") };
    return { id: "fl-" + x.s, title: (d.kind === "ai" ? "✦ " : "") + x.s + " — " + d.title, text: `${sentence(x.name || x.s)} ${sentence(d.title)} ${d.story.replace(/\s*\n+\s*/g, " ")} ${d.takeaway ? sentence(d.takeaway) : ""}` };
  }
  async function listenNews(xs, label) {
    const add = speakQueue(label, xs.length);
    if (S.settings.hasKey) window.toast(`Reading ${xs.length === 1 ? "the articles" : xs.length + " stocks' articles"}; the story starts in a few seconds`);
    for (const x of xs) {
      const d = await getDigest(x);
      if (d.note || d.error) window.toast(String(d.note || d.error).slice(0, 120));
      add(digestItem(x, d));
    }
  }
  function stopSpeaking(quiet) {
    tts.token++; tts.on = false; tts.paused = false; tts.loading = false; tts.waiting = 0; tts.idle = false; tts.ses = 0; clearTimeout(tts.timer);
    au.onended = null; try { au.pause(); } catch (e) {}
    if (SYN) SYN.cancel();
    if (!quiet) renderPlayer();
  }
  function togglePause() {
    if (!tts.on) return;
    if (tts.engine === "ai") {
      if (tts.paused) { tts.paused = false; if (!tts.loading) { const pr = au.play(); if (pr && pr.catch) pr.catch(() => {}); } }
      else { tts.paused = true; au.pause(); }
    } else if (tts.paused) { SYN.resume(); tts.paused = false; } else { SYN.pause(); tts.paused = true; }
    renderPlayer();
  }
  function skipItem() {
    if (!tts.on) return;
    const k = (tts.parts[tts.i] || {}).k, j = tts.parts.findIndex((p, n) => n > tts.i && p.k !== k);
    if (j < 0) { if (!tts.waiting) return stopSpeaking(); tts.token++; if (tts.engine === "ai") { au.onended = null; au.pause(); } else SYN.cancel(); tts.i = tts.parts.length; return waitOrStop(); }
    tts.token++; if (tts.engine === "ai") { au.onended = null; au.pause(); } else SYN.cancel();
    tts.i = j; tts.paused = false; playSoon();
  }
  function renderPlayer() {
    const pl = $("#player"), on = tts.on;
    pl.hidden = !on; document.body.classList.toggle("playing", on);
    document.querySelectorAll(".speaking").forEach(el => el.classList.remove("speaking"));
    if (!on) return;
    const part = tts.parts[tts.i] || {}, it = tts.items[part.k] || {};
    $("#plTitle").textContent = it.title || tts.label;
    $("#plSub").textContent = (tts.engine === "ai" ? "✦ AI voice — " : "") + tts.label + (tts.items.length > 1 ? ` — ${part.k + 1} of ${tts.items.length}` : "")
      + (tts.loading ? (tts.idle ? " — reading the articles…" : " — preparing…") : tts.paused ? " — paused" : "");
    pl.classList.toggle("paused", tts.paused);
    $("#plPause").innerHTML = tts.paused ? PLAY_ICO : PAUSE_ICO;
    $("#plPause").setAttribute("aria-label", tts.paused ? "Resume" : "Pause");
    if (it.id) { const c = document.getElementById("c-" + it.id); if (c) c.classList.add("speaking"); }
    if (!on || tts.idle) document.querySelectorAll(".fl.speaking").forEach(el => el.classList.remove("speaking"));
  }
  const PLAY_ICO = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`, PAUSE_ICO = `<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>`;
  const vseg = (k, opts) => `<div class="seg wide">${opts.map(([v, l]) => `<button class="${String(S.settings[k]) === String(v) ? "on" : ""}" data-act="voiceset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
  function listenHTML() {
    const eng = S.settings.speechEngine === "ai" ? "ai" : "device";
    return `<div class="lk-row"><span class="lk-l">Voice engine</span>${vseg("speechEngine", [["device", "iPhone voice"], ["ai", "✦ AI voice"]])}</div>` + (eng === "ai" ? aiListenHTML() : deviceListenHTML());
  }
  function aiListenHTML() {
    if (!S.settings.hasOpenAI) return `<p class="note">AI voices come from OpenAI, so they need an OpenAI key, even when Claude writes your briefing (Claude's API doesn't offer speech).</p>
      <div class="aic-btns"><button class="sm primary" data-act="aiopen">Add an OpenAI key</button></div>`;
    const model = S.settings.ttsModel || "gpt-4o-mini-tts", legacy = /^tts-1/.test(model), g = S.settings.voiceGender || "all";
    const vs = OAI_VOICES.filter(([v, gg]) => (!legacy || LEGACY_TTS.has(v)) && (g === "all" || gg === g || v === S.settings.ttsVoice));
    const loaded = ((S.ttsModels || {}).list || []).map(m => m.id);
    const mlist = [model].concat(loaded.length ? loaded : ["gpt-4o-mini-tts", "tts-1-hd", "tts-1"]).filter((x, i, a) => a.indexOf(x) === i);
    const gl = { f: " (female)", m: " (male)", n: " (neutral)" };
    return `<div class="lk-row"><span class="lk-l">Voice</span>${vseg("voiceGender", [["all", "All"], ["f", "Female"], ["m", "Male"]])}
        <select class="ttsvoicesel voicesel" aria-label="AI voice">${vs.map(([v, gg]) => `<option value="${v}" ${v === S.settings.ttsVoice ? "selected" : ""}>${v[0].toUpperCase() + v.slice(1)}${gl[gg]}</option>`).join("")}</select></div>
      <div class="lk-row"><span class="lk-l">Speech model</span><select class="ttsmodelsel voicesel" aria-label="Speech model">${mlist.map(m => `<option value="${esc(m)}" ${m === model ? "selected" : ""}>${esc(m)}</option>`).join("")}</select></div>
      ${legacy ? "" : `<div class="lk-row"><span class="lk-l">How it should sound</span><textarea class="ttsinstr cfgin wide" rows="2" placeholder="e.g. Calm, clear newsreader. Neutral accent.">${esc(S.settings.ttsInstructions || "")}</textarea></div>`}
      <div class="lk-row"><span class="lk-l">Speed</span>${vseg("voiceRate", [[0.85, "Slow"], [1, "Normal"], [1.15, "Fast"], [1.3, "Faster"]])}</div>
      <div class="aic-btns"><button class="sm" data-act="voicetest">${SPK}Test the voice</button></div>
      <p class="note">✦ Spoken by OpenAI with your key, one piece at a time; the first piece takes a few seconds. OpenAI bills each use; Stockit counts the characters under AI settings › Token usage as “Read aloud”. Voice labels describe how each voice usually sounds.${loaded.length ? "" : " Load your OpenAI models in AI settings to see every speech model your key can use."}</p>`;
  }
  function deviceListenHTML() {
    if (!SYN || !voices.length) return `<p class="note">This device reads aloud with the system voice. Choose it in iOS Settings › Accessibility › Spoken Content.</p>`;
    const g = S.settings.voiceGender || "all", cur = currentVoice();
    const shown = voices.filter(v => g === "all" || genderOf(v) === g || v === cur);
    const langs = {};
    shown.forEach(v => (langs[v.lang] = langs[v.lang] || []).push(v));
    const mine = (navigator.languages || [navigator.language || "en"]).map(l => l.toLowerCase().split("-")[0]);
    const rankLang = l => { const b = l.toLowerCase().split(/[-_]/)[0]; const i = mine.indexOf(b); return i >= 0 ? i : b === "en" ? 50 : 100; };
    const order = Object.keys(langs).sort((x, y) => rankLang(x) - rankLang(y) || langName(x).localeCompare(langName(y)));
    const label = v => `${baseName(v)}${quality(v) ? " — " + quality(v) : ""}${genderOf(v) ? (genderOf(v) === "f" ? " (female)" : " (male)") : ""}`;
    const seg = (k, opts) => `<div class="seg wide">${opts.map(([v, l]) => `<button class="${String(S.settings[k]) === String(v) ? "on" : ""}" data-act="voiceset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    return `<div class="lk-row"><span class="lk-l">Voice</span>${seg("voiceGender", [["all", "All"], ["f", "Female"], ["m", "Male"]])}
      <select class="voicesel" aria-label="Voice">${order.map(l => `<optgroup label="${esc(langName(l))} (${esc(l)})">${langs[l].map(v => `<option value="${esc(v.voiceURI)}" ${cur && v.voiceURI === cur.voiceURI ? "selected" : ""}>${esc(label(v))}</option>`).join("")}</optgroup>`).join("")}</select></div>
      <div class="lk-row"><span class="lk-l">Speed</span>${seg("voiceRate", [[0.85, "Slow"], [1, "Normal"], [1.15, "Fast"], [1.3, "Faster"]])}</div>
      <div class="lk-row"><span class="lk-l">Pitch</span>${seg("voicePitch", [[0.85, "Lower"], [1, "Normal"], [1.15, "Higher"]])}</div>
      <div class="aic-btns"><button class="sm" data-act="voicetest">${SPK}Test the voice</button><span class="note">${voices.length} voices on this ${/iPad/.test(navigator.userAgent) ? "iPad" : "iPhone"}</span></div>
      <p class="note">More natural voices: iOS Settings › Accessibility › Spoken Content › Voices. Download an Enhanced or Premium voice and it appears here.</p>`;
  }
  // ---- Check my portfolio: screenshots of your broker's app, compared with Stockit; you apply each change ----
  const CK = {   // what each result means, with its badge
    match: ["ok", "✓ Matches", "Shares and average price match your broker."],
    partial: ["ok", "✓ Price checked", "Your screenshot shows neither shares nor the position's value, so only the price could be compared."],
    differs: ["warn", "≠ Different", ""],
    price: ["bad", "⚠ Price doesn't match", "The price on your screenshot is far from today's. If the screenshot is recent, Stockit may hold the wrong shares or average price for it, or a different listing of the same company."],
    watch: ["warn", "Owned, on your watchlist", "Your screenshot shows you own it, but in Stockit it's on your watchlist."],
    missing: ["add", "+ Not in Stockit", "On your broker's screenshot, but not in your Stockit portfolio."],
    extra: ["gone", "− Not on your screenshots", "In your Stockit portfolio, but not on your screenshots. If they show your whole portfolio, you may have sold it."],
  };
  const ckStatus = it => it.kind === "differs" && it.diffs.includes("price") && it.diffs.length === 1 ? "price" : it.kind === "match" && it.partial ? "partial" : it.kind;
  function renderCheck() {
    const el = $("#checksheet"), keep = el.scrollTop;
    el.classList.toggle("open", checkOpen); lockBody();
    if (!checkOpen) return;
    const C = S.check, bz = isBusy("check"), shots = S.checkShots || [];
    if (C && C.at !== renderCheck.at) { for (const k of Object.keys(ckEdit)) delete ckEdit[k]; renderCheck.at = C.at; }
    const head = `<div class="sh-head"><h2>Check my portfolio</h2><button class="link" data-act="checkclose">Done</button></div>`;
    if (!S.settings.hasKey) { el.innerHTML = head + `<div class="sh-body"><p class="muted">Stockit reads your broker's screenshots with ✦ AI. Add a Claude or OpenAI key in <button class="link small" data-act="cfgopen">Settings › AI settings</button> to check your portfolio.</p></div>`; return; }
    const thumbs = (list, edit) => `<div class="ck-shots ${edit ? "" : "mini"}">${list.map((t, i) => `<figure class="ck-shot ${bz ? "scan" : ""}"><img src="data:image/jpeg;base64,${t}" alt="Screenshot ${i + 1}">${edit && !bz ? `<button class="ck-x" data-act="checkdrop" data-v="${i}" aria-label="Remove screenshot ${i + 1}">×</button>` : ""}<figcaption>${i + 1}</figcaption></figure>`).join("")}
      ${edit && !bz && list.length < (S.cfg.checkMaxShots || 6) ? `<button class="ck-add" data-act="checkpick"><span>+</span>${list.length ? "Add another" : "Add a screenshot"}</button>` : ""}</div>`;
    if (!C || bz) {   // 1. choose screenshots, 2. reading them, with progress
      const p = bz ? Math.max(ckShown, (ckProg || {}).p || 0) : 0;
      el.innerHTML = head + `<div class="sh-body">
        <section class="ck-step"><span class="ck-n">1</span><div><b>Your broker's screenshots</b><small>Each position's shares and prices should show. Add more if your portfolio takes several screens.</small></div></section>
        ${thumbs(shots, true)}
        ${bz ? `<section class="ck-progress" role="status"><div class="ck-prog-h"><span>${esc((ckProg || {}).label || "Reading…")}</span><span class="ck-prog-p">${Math.round(p * 100)}%</span></div><div class="ck-prog"><i style="width:${(p * 100).toFixed(1)}%"></i></div></section>`
          : `<section class="ck-step"><span class="ck-n">2</span><div><b>Check them</b><small>✦ AI reads every position and Stockit compares it with your portfolio. Nothing changes until you tap a button.</small></div></section>
        <button class="primary block" data-act="checkrun" ${shots.length ? "" : "disabled"}>${shots.length ? `Check ${shots.length} screenshot${shots.length === 1 ? "" : "s"}` : "Add a screenshot first"}</button>`}
      </div>`;
      el.scrollTop = keep; return;
    }
    // 3. the results, all open: problems first, then what matches
    const order = { price: 0, differs: 1, watch: 2, missing: 3, extra: 4, match: 5, partial: 6 };
    const items = C.items.slice().sort((a, b) => (!!a.resolved - !!b.resolved) || order[ckStatus(a)] - order[ckStatus(b)]);
    const count = k => C.items.filter(i => ckStatus(i) === k).length, todo = C.items.filter(i => i.kind !== "match" && !i.resolved).length;
    const m2 = (v, c2) => v == null ? "—" : money(v, c2);
    const fldReal = (it, f, label, val, c2) => `<label class="ck-f"><span>${label}${c2 ? ` (${esc(c2)})` : ""}</span><input class="ck-in" inputmode="decimal" data-id="${it.id}" data-f="${f}" value="${esc(ckEdit[it.id] && ckEdit[it.id][f] != null ? ckEdit[it.id][f] : val != null ? +(+val).toFixed(4) : "")}"></label>`;
    const fld = (...a) => priv() ? `<p class="note">Turn off privacy (the eye at the top) to see and edit amounts.</p>` : fldReal(...a);
    const nsh = v => priv() ? "••••" : nf(v, v % 1 ? 4 : 0);
    const cmp = it => {
      const yh = it.kind === "missing", dv = it.dv || {}, m2 = (v, c2) => v == null ? "—" : priv() ? "••••" : money(v, c2);
      const row = (label, a, b, bad) => `<div class="ck-r ${bad ? "bad" : ""}"><span>${label}</span><b>${a}</b><b>${b}</b><i>${bad ? "≠" : a !== "—" && b !== "—" ? "✓" : ""}</i></div>`;
      if (it.kind === "extra") return `<div class="ck-cmp"><div class="ck-r hd"><span></span><span>Stockit</span><span>Broker</span><i></i></div>${row("Shares", nsh(it.mine.sh), "not shown", true)}${row("Price now", m2(it.mine.price, it.cur), "—", false)}</div>`;
      return `<div class="ck-cmp"><div class="ck-r hd"><span></span><span>${yh ? "Yahoo" : "Stockit"}</span><span>Broker</span><i></i></div>
        ${row("Shares", it.mine ? nsh(it.mine.sh) : "—", it.shot && it.shot.shares != null ? nsh(it.shot.shares) : dv.sh != null ? `${dv.exact ? "" : "≈ "}${nsh(dv.sh)} <small class="muted">from value</small>` : "—", it.diffs.includes("shares") || yh)}
        ${row("Average price", it.mine && it.mine.cost ? m2(it.mine.cost, it.cur) : "—", it.shot && it.shot.avgPrice != null ? m2(it.shot.avgPrice, it.shotCur) : dv.cost != null ? `${m2(dv.cost, it.cur)} <small class="muted">from gain</small>` : "—", it.diffs.includes("cost") || yh)}
        ${it.shot && it.shot.value != null ? row("Position value", it.mine && it.mine.value != null && !yh ? m2(it.mine.value, dv.vc || it.cur) : "—", m2(it.shot.value, it.shot.valueCurrency || it.shotCur) + (it.shot.gain != null ? ` <small class="${it.shot.gain >= 0 ? "up" : "down"}">${it.shot.gain >= 0 ? "+" : "−"}${priv() ? "••••" : nf(Math.abs(it.shot.gain), 2)}${it.shot.gainPct != null ? " (" + pct(it.shot.gainPct, 2) + ")" : ""}</small>` : ""), it.diffs.includes("shares") || it.diffs.includes("value")) : ""}
        ${row("Price now", m2(it.mine ? it.mine.price : it.yahooPrice, it.cur), (it.shot ? m2(it.shot.price, it.shotCur) : "—") + (it.gap != null ? ` <small class="${it.diffs.includes("price") ? "down" : "muted"}">${pct(it.gap, 1)}</small>` : ""), it.diffs.includes("price"))}</div>`;
    };
    const card = it => {
      const st = ckStatus(it), [tone, label, why] = CK[st];
      const whyTxt = st === "differs" ? `Your broker shows a different ${it.diffs.filter(d => d !== "watch").map(d => ({ shares: "number of shares", cost: "average price", price: "price", value: "position value" }[d])).join(" and ")}.` + (it.diffs.includes("price") ? " " + CK.price[2] : "") : why;
      const fields = it.suggest ? `<div class="ck-fs">${fld(it, "sh", "Shares", it.suggest.sh)}${fld(it, "cost", "Average price", it.suggest.cost, it.cur)}</div>${it.converted ? `<p class="note">Average price converted from ${esc(it.shotCur)} at today's rate.</p>` : ""}` : "";
      const acts = it.resolved || st === "match" || st === "partial" ? "" : st === "missing" ? (it.s
          ? `${fields}<div class="aic-btns"><button class="sm primary" data-act="checkapply" data-v="${it.id}" data-k="add">Add to portfolio</button><button class="sm" data-act="checkapply" data-v="${it.id}" data-k="ignore">Ignore</button></div>`
          : `<div class="aic-btns"><button class="sm primary" data-act="checkfind" data-v="${esc(it.shot.symbol || it.name)}">Find it</button><button class="sm" data-act="checkapply" data-v="${it.id}" data-k="ignore">Ignore</button></div>`)
        : st === "extra" ? `<div class="aic-btns"><button class="sm danger ${ckArmed === it.id ? "armed" : ""}" data-act="checkapply" data-v="${it.id}" data-k="remove">${ckArmed === it.id ? "Confirm" : "Remove"}</button><button class="sm" data-act="checkapply" data-v="${it.id}" data-k="watch">Move to watchlist</button><button class="sm" data-act="checkapply" data-v="${it.id}" data-k="ignore">Keep</button></div>`
        : `${fields}<div class="aic-btns"><button class="sm primary" data-act="checkapply" data-v="${it.id}" data-k="${it.kind === "watch" ? "own" : "update"}">${it.kind === "watch" ? "Move to portfolio" : "Apply these"}</button><button class="sm" data-act="checkapply" data-v="${it.id}" data-k="ignore">Keep Stockit's</button></div>`;
      return `<article class="ck t-${tone} ${it.resolved ? "done" : ""}" id="ck-${it.id}"><div class="ck-h"><div class="r-l"><b class="sym">${esc(it.s || it.shot.symbol || "?")}</b><small>${esc(it.name || "")}</small></div>
          <span class="ck-b b-${tone}">${it.resolved ? "✓ " + esc(it.resolved) : label}</span></div>
        ${it.resolved || st === "match" ? "" : `<p class="ck-what">${whyTxt}${it.kind === "missing" && !it.s ? " Stockit couldn't find it on Yahoo Finance." : ""}</p>`}
        ${cmp(it)}${it.dv && it.dv.sh != null && it.shot && it.shot.shares == null && !it.resolved ? `<p class="note">Shares worked out from the position's value ÷ its price${it.dv.same ? "" : `, through today's ${esc(it.dv.vc)} rate, so they're approximate`}.${it.dv.cost != null && it.shot.avgPrice == null ? " Average price from the value minus the gain." : !it.dv.same && it.shot.gain != null ? " The average price can't be worked out: your broker counts the gain at the exchange rates of the day you bought." : ""}</p>` : ""}${it.diffs.includes("value") ? `<p class="note">The shares and position value read from your screenshot don't add up; check them before you apply.</p>` : ""}${acts}</article>`;
    };
    const chip = (k, n) => n ? `<span class="ck-b b-${CK[k][0]}">${CK[k][1]} <b>${n}</b></span>` : "";
    el.innerHTML = head + `<div class="sh-body">
      <section class="sum ck-res"><span class="sum-k">Checked ${C.n} position${C.n === 1 ? "" : "s"}${C.broker ? " from " + esc(C.broker) : ""}</span>
        <div class="sum-v ${todo ? "" : "up"}">${todo ? `${todo} to review` : "All in step ✓"}</div>
        <div class="ck-chips">${["match", "partial", "differs", "price", "watch", "missing", "extra"].map(k => chip(k, count(k))).join("")}</div>
        ${C.total != null ? `<p class="ck-tot">Broker's total ${P(money(C.total, C.totalCur || (C.mineTotal || {}).cur))}${C.mineTotal ? ` · Stockit ${P(money(C.mineTotal.v, C.mineTotal.cur))}${C.totalInMine != null ? ` <small class="${Math.abs(C.totalInMine / C.mineTotal.v - 1) > 0.02 ? "down" : "muted"}">${pct((C.mineTotal.v / C.totalInMine - 1) * 100, 1)}</small>` : ""}` : ""}</p>` : ""}
        <p class="note">Read by ✦ ${PN[C.by] || esc(C.by)} ${rel(C.at)} from ${C.shots} screenshot${C.shots === 1 ? "" : "s"}. AI can misread a screenshot, so check a suggestion before you apply it.</p></section>
      ${(C.thumbs || []).length ? thumbs(C.thumbs, false) : ""}
      <div class="ck-list">${items.map(card).join("")}</div>
      <div class="aic-btns ck-again"><button class="sm primary" data-act="checknew">New check</button><button class="sm" data-act="checkclear">Clear results</button></div>
      <p class="note">Not financial advice.</p></div>`;
    el.scrollTop = keep;
  }
  // ---- the check button: big on the first three launches, then it shrinks into the ✓ icon on the portfolio ----
  const CHECK_ICO = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.8 12.2l2.3 2.3 4.3-4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function checkIcon() { return `<button class="ck-icon ${introState === "shrunk" ? "ping" : ""}" data-act="checkopen" aria-label="Check against your broker" title="Check against your broker">${CHECK_ICO}</button>`; }
  function checkIntroHTML(items) {
    if (!items.length || !introState || introState === "gone") return "";
    return `<button class="ck-big ${introState === "shrunk" ? "shrink" : ""}" data-act="checkopen"><span class="ck-big-i">${CHECK_ICO}</span><span class="ck-big-t"><b>Check against your broker</b><small>Upload screenshots of your broker's app and see what's different</small></span><span class="chev" aria-hidden="true">›</span></button>`;
  }
  (function startIntro() {
    const own = S.stocks.filter(x => x.list === "own").length, n = +S.settings.checkIntro || 0;
    if (!own || n >= 3) return;
    introState = "big"; send("set", { k: "checkIntro", v: n + 1 });
    setTimeout(() => {
      introState = "shrunk";
      const big = document.querySelector(".ck-big"), ico = document.querySelector(".ck-icon");
      if (big) big.classList.add("shrink"); if (ico) ico.classList.add("ping");
      setTimeout(() => { introState = "gone"; if (big) big.remove(); }, 1600);
    }, 6000);
  })();
  window.onCheckProgress = (p, label) => {
    ckProg = p >= 1 ? null : { p, label };
    if (ckProg && ckShown < p) ckShown = p;
    clearInterval(ckTimer);
    if (ckProg && p < 0.6) ckTimer = setInterval(() => {   // the AI reading takes a while: creep towards 60% meanwhile
      if (!ckProg) return clearInterval(ckTimer);
      ckShown += (0.58 - ckShown) * 0.035;
      const bar = document.querySelector(".ck-prog i"), pc = document.querySelector(".ck-prog-p");
      if (bar) bar.style.width = (ckShown * 100).toFixed(1) + "%"; if (pc) pc.textContent = Math.round(ckShown * 100) + "%";
    }, 300);
    renderCheck();
  };
  function lockBody() { document.body.classList.toggle("locked", !!(openSym || newsOpen || checkOpen || addOpen || cfgOpen || aiOpen)); }

  // ---- interactions ----
  const shareText = (title, by, body) => `${title}\n\n${String(body || "").replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, "")}\n\n✦ Written by ${PN[by] || by} in Stockit. Not financial advice.`;
  function find() {
    const v = ($("#q") || {}).value || "";
    if (!v.trim()) return;
    searching = true; results = null; renderAdd(); send("search", { q: v.trim() });
  }
  document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "q") { e.preventDefault(); e.target.blur(); find(); } });
  document.addEventListener("input", e => { if (e.target.id === "stratEditText") { stratEdit.text = e.target.value; return; } if (e.target.id === "stratEditWhen") { stratEdit.when = e.target.value; return; }
    if (e.target.classList && e.target.classList.contains("sg-in")) { const g = sgEdit[e.target.dataset.id]; if (g) g[e.target.dataset.f] = e.target.value; return; }
    if (e.target.classList && e.target.classList.contains("ck-in")) { const id = e.target.dataset.id; ckEdit[id] = Object.assign(ckEdit[id] || {}, { [e.target.dataset.f]: e.target.value }); return; } if (e.target.id === "themeIn") themeText = e.target.value; if (e.target.id === "paste") pasteText = e.target.value; if (e.target.id === "stratText") stratText = e.target.value; if (e.target.id === "stratWhen") stratWhen = e.target.value; });
  document.addEventListener("click", e => {
    if (e.target.closest("select, option, input, textarea, summary")) return;   // form controls handle themselves
    const t = e.target.closest("[data-act]");
    if (!t || t.disabled) return;
    const act = t.dataset.act, v = t.dataset.v;
    switch (act) {
      case "tab": tab = v; if (v !== "ideas") send("set", { k: "tab", v }); else if (S.settings.hasKey) send("stratdue", {}); render(); window.scrollTo(0, 0); break;
      case "sort": sort = v; send("set", { k: "sort", v }); render(); break;
      case "refresh": if (!progress) send("refresh", { force: true }); break;
      case "newsopen": openNews(t.dataset.s, v); break;
      case "fold": setFold([v], t.dataset.on === "1"); break;
      case "foldall": setFold(flashOrder().filter(x => topNews(x).length).map(x => x.s), true); window.scrollTo(0, 0); break;
      case "unfoldall": setFold(Object.keys(fold()), false); break;
      case "newsclose": newsOpen = null; renderNews(); break;
      case "tldrretry": if (newsOpen) { tl[newsOpen.l] = "loading"; send("tldr", { s: newsOpen.s, l: newsOpen.l, id: newsOpen.l, force: true }); renderNews(); } break;
      case "listentldr": { const x = newsOpen && byS(newsOpen.s), h = x && newsOf(x.s, newsOpen.l), d = h && tl[h.l]; if (d && d !== "loading" && !d.error) speak("TL;DR", tldrItems(x, h, d)); break; }
      case "listenbrief": if (S.briefing) speak("Briefing", briefItems(S.briefing)); break;
      case "listenstory": { const x = byS(v); if (x && x.story) speak(x.s + " story", storyItems(x, x.story)); break; }
      case "listenflash": { const xs = flashOrder().filter(x => !isFolded(x) && topNews(x).length); if (xs.length) listenNews(xs, "Flash"); else window.toast("No headlines to read yet"); break; }
      case "listenstock": { const x = byS(v); if (!x || !topNews(x).length) break; const cur = tts.on && (tts.items[(tts.parts[tts.i] || {}).k] || {}).id === "fl-" + x.s; if (cur || (tts.on && tts.label === x.s + " news")) togglePause(); else listenNews([x], x.s + " news"); break; }
      case "plpause": togglePause(); break;
      case "plnext": skipItem(); break;
      case "plstop": stopSpeaking(); break;
      case "voiceset": {
        const k = t.dataset.k, val = k === "voiceGender" || k === "speechEngine" ? v : +v;
        if (k === "speechEngine" && tts.on) stopSpeaking();
        S.settings[k] = val; send("set", { k, v: val }); renderCfg(); break;
      }
      case "voicetest": speak("Voice test", [{ title: "Voice test", text: "Hello! This is how Stockit will read your briefing, stories and headlines to you." }]); break;
      case "stratadd": {
        const tx = stratText.trim();
        if (!tx) { window.toast("Describe your strategy first"); const ta = $("#stratText"); if (ta) ta.focus(); break; }
        send("stratadd", { text: tx, when: stratWhen.trim() }); stratText = ""; stratWhen = "";
        window.toast(S.settings.hasKey ? "Strategy added. The next ✦ ideas and briefing take it into account" : "Strategy added"); break;
      }
      case "stratedit": { const g = (S.strategies || []).find(x => x.id === v); if (!g) break; stratEditing = v; stratEdit.text = g.text; stratEdit.when = g.when || ""; render(); const ta = $("#stratEditText"); if (ta) ta.focus(); break; }
      case "stratsave": if (!stratEdit.text.trim()) { window.toast("A strategy needs some words"); break; } stratEditing = null; send("stratedit", { v, text: stratEdit.text, when: stratEdit.when }); render(); window.toast("Strategy saved"); break;
      case "stratcancel": stratEditing = null; render(); break;
      case "sgedit": { const g = ((S.stratSuggest || {}).list || []).find(x => x.id === v); if (g) { sgEdit[v] = { text: g.text, when: g.when || "" }; render(); } break; }
      case "sgcancel": delete sgEdit[v]; render(); break;
      case "sgkeep": { const e2 = sgEdit[v]; delete sgEdit[v]; send("stratkeep", Object.assign({ v }, e2 ? { text: e2.text, when: e2.when } : {})); render(); window.toast("Added to your strategies"); break; }
      case "sgdismiss": delete sgEdit[v]; send("stratdismiss", { v }); break;
      case "sgrefresh": send("stratsuggest", {}); break;
      case "stratretire": send("stratretire", { v }); window.toast("Retired. It's kept under Retired strategies"); break;
      case "stratrestore": send("stratrestore", { v }); break;
      case "stratdelete":
        if (stratArmed !== v) { stratArmed = v; render(); setTimeout(() => { if (stratArmed === v) { stratArmed = null; render(); } }, 3500); break; }
        stratArmed = null; send("stratdelete", { v }); break;
      case "mktopen": tab = v; render(); break;
      case "privacy": S.settings.privacy = !priv(); send("set", { k: "privacy", v: S.settings.privacy }); renderPriv(); renderAll(); window.toast(priv() ? "Your amounts are hidden" : "Your amounts are showing"); break;
      case "checkopen": checkOpen = true; renderCheck(); $("#checksheet").scrollTop = 0; break;
      case "checkclose": checkOpen = false; renderCheck(); break;
      case "checkrun": ckProg = { p: 0.02, label: "Starting…" }; ckShown = 0.02; send("checkrun", {}); renderCheck(); break;
      case "checkpick": send("checkpick", {}); break;
      case "checkdrop": send("checkdrop", { v }); break;
      case "checknew": for (const k of Object.keys(ckEdit)) delete ckEdit[k]; send("checknew", {}); break;
      case "checkclear": send("checkclear", {}); break;
      case "checkapply": {
        const it = S.check && S.check.items.find(i => i.id === v), k = t.dataset.k;
        if (!it) break;
        if (k === "remove" && ckArmed !== v) { ckArmed = v; renderCheck(); setTimeout(() => { if (ckArmed === v) { ckArmed = null; renderCheck(); } }, 3500); break; }
        ckArmed = null;
        const e2 = ckEdit[v] || {}, sh = e2.sh != null ? e2.sh : it.suggest && it.suggest.sh, cost = e2.cost != null ? e2.cost : it.suggest && it.suggest.cost;
        send("checkapply", { id: v, k, sh, cost }); break;
      }
      case "checkfind": checkOpen = false; renderCheck(); addOpen = true; results = null; renderAdd(); { const q = $("#q"); if (q) { q.value = v; } } break;
      case "ideaexplain": ideaExplain = ideaExplain === v ? null : v; render(); break;
      case "gotab": cfgOpen = false; renderCfg(); tab = v; send("set", { k: "tab", v }); render(); window.scrollTo(0, 0); break;
      case "preview": openSym = v; previewWait = byS(v) ? null : v; explainKey = null; rmArmed = null; renderDetail(); send("preview", { s: v }); $("#detail").scrollTop = 0; break;
      case "addpreview": send("addpreview", { s: t.dataset.s, v }); previewWait = null; break;
      case "themeadd": {
        const tx = themeText.trim().slice(0, 120);
        if (!tx) { const ti = $("#themeIn"); if (ti) ti.focus(); break; }
        const list = (S.cfg.ideaThemes || []).concat(tx).slice(0, 20); S.cfg.ideaThemes = list; themeText = "";
        send("cfg", { k: "ideaThemes", v: list }); render(); break;
      }
      case "themerm": { const list = (S.cfg.ideaThemes || []).filter((_, i) => i !== +v); S.cfg.ideaThemes = list; send("cfg", { k: "ideaThemes", v: list.length ? list : [""] }); render(); break; }
      case "open": openSym = v; explainKey = null; rmArmed = null; renderDetail(); send("detail", { s: v }); $("#detail").scrollTop = 0; break;
      case "close": openSym = null; renderDetail(); break;
      case "range": range = v; send("set", { k: "range", v }); renderDetail(); break;
      case "explain": explainKey = explainKey === v ? null : v; renderDetail(); break;
      case "holding": send("holding", { s: v }); break;
      case "move": send("move", { s: t.dataset.s, v }); break;
      case "remove":
        if (rmArmed === v) { rmArmed = null; openSym = null; send("remove", { s: v }); renderDetail(); }
        else { rmArmed = v; renderDetail(); setTimeout(() => { if (rmArmed === v) { rmArmed = null; renderDetail(); } }, 3500); }
        break;
      case "openlink": send("openlink", { v }); break;
      case "story": busyK.add("story:" + v); renderDetail(); send("story", { s: v }); break;
      case "briefing": busyK.add("briefing"); render(); send("briefing", {}); break;
      case "brieffull": briefFull = !briefFull; render(); break;
      case "share-brief": if (S.briefing) send("share", { text: shareText(S.briefing.headline, S.briefing.by, S.briefing.story) }); break;
      case "share-story": { const x = byS(v); if (x && x.story) send("share", { text: shareText(`${x.s}: ${x.story.headline}`, x.story.by, x.story.story) }); break; }
      case "ideas": busyK.add("ideas"); render(); send("ideas", {}); break;
      case "watchidea": send("watchidea", { s: v }); break;
      case "addopen": addOpen = true; results = null; renderAdd(); setTimeout(() => { const i = $("#q"); if (i) i.focus(); }, 320); break;
      case "addclose": addOpen = false; renderAdd(); break;
      case "addto": addTo = v; send("set", { k: "addTo", v }); renderAdd(); break;
      case "find": find(); break;
      case "addsym": { const r = (results || []).find(x => x.s === v); if (r) { r.have = true; send("add", { s: r.s, name: r.name, exch: r.exch, list: addTo }); renderAdd(); } break; }
      case "paste": { const txt = ($("#paste") || {}).value || ""; if (txt.trim()) send("paste", { text: txt, list: addTo }); break; }
      case "csv": send("csv", { list: addTo }); break;
      case "shot": send("shot", { list: addTo }); break;
      case "style": S.settings.style = v; send("set", { k: "style", v }); renderCfg(); break;
      case "look": {
        const k = t.dataset.k, val = k === "textSize" ? +v : v;
        look[k] = val; send("set", { k, v: val }); render(); renderCfg(); break;
      }
      case "toggle": S.settings[v] = !S.settings[v]; send("set", { k: v, v: S.settings[v] }); renderCfg(); renderAI(); break;
      case "cfgopen": cfgOpen = true; renderCfg(); break;
      case "cfgclose": cfgOpen = false; cfgArmed = false; renderCfg(); break;
      case "cfgreset": { const d = cfgItem(t.dataset.k); S.cfg[d.k] = d.def; send("cfg", { k: d.k, v: null }); renderCfg(); break; }
      case "cfgstep": {
        const d = cfgItem(t.dataset.k), step = d.step || 1;
        const nv = Number(Math.min(d.max, Math.max(d.min, Number(S.cfg[d.k]) + step * +v)).toFixed(2));
        S.cfg[d.k] = nv; send("cfg", { k: d.k, v: nv }); renderCfg(); break;
      }
      case "cfgall":
        if (cfgArmed) { cfgArmed = false; send("cfg", { k: "*" }); }
        else { cfgArmed = true; renderCfg(); setTimeout(() => { if (cfgArmed) { cfgArmed = false; renderCfg(); } }, 3500); }
        break;
      case "secret-set": send("secret-set", { v }); break;
      case "secret-remove":
        if (secArmed === v) { secArmed = null; send("secret-remove", { v }); }
        else { secArmed = v; renderCfg(); setTimeout(() => { if (secArmed === v) { secArmed = null; renderCfg(); } }, 3500); }
        break;
      case "startlog": {
        const pre = $("#startlog");
        if (!pre.hidden) { pre.hidden = true; t.textContent = "Show"; break; }
        send("startlog", {}, (ok, txt) => { pre.textContent = txt || "Nothing logged yet."; pre.hidden = false; t.textContent = "Hide"; });
        break;
      }
      case "updcheck": { const m = $("#updmsg"); if (m) m.textContent = "Checking…"; send("updcheck", {}, (ok, msg) => { const mm = $("#updmsg"); if (mm) mm.textContent = msg; }); break; }
      case "openurl": send("openurl", { v }); break;
      case "aiopen": aiOpen = true; renderAI(); break;
      case "aiclose": aiOpen = false; renderAI(); break;
      case "aikey": case "aitest": case "aiprov": send(act, { v }); break;
      case "aimodels": aiLoading.add(v); renderAI(); send("aimodels", { v }); break;
      case "airm": if (aiArmed === "rm" + v) { aiArmed = null; send("airm", { v }); } else arm("rm" + v); break;
      case "usagereset": if (aiArmed === "reset") { aiArmed = null; send("usagereset", {}); } else arm("reset"); break;
      case "upd-now": updNow(t); break;
      case "upd-later": updLater(); break;
      case "upd-close": { const uo = document.getElementById("upd"); if (uo) uo.remove(); break; }
    }
  });
  // Typed values and menus arrive through "change"
  document.addEventListener("toggle", e => { const el = e.target;
    if (el.classList && el.classList.contains("fold-sec")) { const f = Object.assign({}, S.settings.ideasFold || {}); f[el.dataset.fold] = !el.open; if (!!(S.settings.ideasFold || {})[el.dataset.fold] !== !el.open) { S.settings.ideasFold = f; send("set", { k: "ideasFold", v: f }); } return; }
    if (el.classList && el.classList.contains("fl-story")) { if (el.open) dgOpen.add(el.dataset.k); else dgOpen.delete(el.dataset.k); } }, true);
  document.addEventListener("change", e => {
    if (e.target.id === "stratEvery") { const v2 = +e.target.value; S.cfg.stratEvery = v2; send("cfg", { k: "stratEvery", v: v2 }); window.toast(v2 ? `Suggestions refresh every ${v2 >= 24 ? (v2 / 24 === 1 ? "day" : v2 / 24 + " days") : v2 + " hours"}` : "Suggestions refresh only when you tap Refresh"); return; }
    if (e.target.id === "homeCur") { S.fx = Object.assign({}, S.fx, { choice: e.target.value }); send("set", { k: "homeCur", v: e.target.value }); window.toast("Converting to " + (e.target.value === "auto" ? "your main currency" : e.target.value) + "…"); return; }
    if (e.target.classList && e.target.classList.contains("ttsvoicesel")) { S.settings.ttsVoice = e.target.value; send("set", { k: "ttsVoice", v: e.target.value }); return; }
    if (e.target.classList && e.target.classList.contains("ttsmodelsel")) { S.settings.ttsModel = e.target.value; send("set", { k: "ttsModel", v: e.target.value }); renderCfg(); return; }
    if (e.target.classList && e.target.classList.contains("ttsinstr")) { S.settings.ttsInstructions = e.target.value.trim(); send("set", { k: "ttsInstructions", v: S.settings.ttsInstructions }); return; }
    if (e.target.classList && e.target.classList.contains("voicesel")) {
      S.settings.voiceURI = e.target.value; send("set", { k: "voiceURI", v: e.target.value });
      if (tts.on && tts.engine === "device") { tts.token++; SYN.cancel(); playSoon(); }   // switch voice mid-sentence
      return;
    }
    const el = e.target;
    if (el.classList && el.classList.contains("modelsel")) send("aimodel", { p: el.dataset.p, v: el.value });
    else if (el.classList && el.classList.contains("cfgin") && el.dataset.k) {
      const d = cfgItem(el.dataset.k);
      send("cfg", { k: d.k, v: d.type === "lines" ? el.value.split("\n") : el.value });
    }
  });

  applyLook();
  renderAll();
}

const PALETTE_CSS = Object.entries(PALETTES).map(([k, p]) => `[data-theme=${k}]{--paper:${p.paper};--sheet:${p.sheet};--ink:${p.ink};--ink-2:${p.ink2};--muted:${p.muted};--rule:${p.rule};--signal:${p.signal};--signal-wash:${p.signalWash};--amber:${p.amber};--amber-wash:${p.amberWash};--danger:${p.danger};--up:${p.up};--down:${p.down};color-scheme:${p.scheme}}`).join("\n");
const CSS = `
:root{
  --ts:1; --serif: ui-serif, "New York", Georgia, serif; --sans: -apple-system, system-ui, "SF Pro Text", sans-serif; --display: var(--sans);
  --t:19px; --d:16px; --m:13.5px; --pad:16px; --num: ui-rounded, -apple-system, system-ui, sans-serif;
}
html[data-font=serif]{--display:var(--serif)}
${PALETTE_CSS}
body.d-compact{--t:16.5px;--d:14.5px;--m:12.5px;--pad:11px}
body.d-tiny{--t:15.5px;--d:14px;--m:12px;--pad:8px}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:calc(16px * var(--ts));line-height:1.5;-webkit-text-size-adjust:100%}
body.locked{overflow:hidden}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
button.primary,.primary{background:var(--signal);color:var(--paper);border-radius:10px;padding:11px 16px;font-weight:600;font-size:calc(15px * var(--ts))}
button.sm.primary{padding:6px 11px;font-size:calc(13px * var(--ts));border-color:var(--signal)}
button[disabled]{opacity:.55}
.muted{color:var(--muted)} .ink2{color:var(--ink-2)} .small{font-size:calc(13px * var(--ts))} .pad{padding:8px 2px} .grow{flex:1;min-width:0}
.up{color:var(--up)} .down{color:var(--down)} .danger{color:var(--danger)}
.note{font-size:calc(12.5px * var(--ts));color:var(--muted);margin:6px 0 0}

/* header */
#top{position:sticky;top:0;z-index:5;background:var(--paper);padding:calc(env(safe-area-inset-top) + 10px) 16px 0;border-bottom:1px solid var(--rule)}
.tb{display:flex;justify-content:space-between;align-items:center;gap:10px}
.brand{display:flex;align-items:center;gap:9px;margin:0;font:800 calc(24px * var(--ts))/1 var(--display);letter-spacing:-.02em}
.brand-mark{width:30px;height:30px;border-radius:7px;background:#0E1116;flex:none}
.brand .x{color:var(--up)}
.status{font-size:calc(12.5px * var(--ts));color:var(--muted);margin-top:3px;min-height:1.2em}
.st-row{display:flex;align-items:center;gap:6px;margin-top:3px} .st-row .status{margin-top:0}
.privbtn{width:24px;height:24px;flex:none;border-radius:12px;display:grid;place-items:center;color:var(--muted);opacity:.75}
.privbtn svg{width:16px;height:16px}
.privbtn.on{color:var(--paper);background:var(--signal);opacity:1}
.pv{display:inline-block;letter-spacing:.12em;color:var(--muted);font-weight:700;filter:blur(.3px);user-select:none;-webkit-user-select:none}
.tb-a{display:flex;gap:6px}
.icon{width:40px;height:40px;border-radius:20px;display:grid;place-items:center;background:var(--sheet);border:1px solid var(--rule)}
.icon svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#top.busy .rf svg{animation:rot 1s linear infinite}
@keyframes rot{to{transform:rotate(360deg)}}
.tabs{display:flex;gap:0;justify-content:space-between;margin-top:10px;overflow-x:auto;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tabs button{padding:9px 6px 10px;font-weight:600;font-size:calc(14px * var(--ts));color:var(--muted);border-bottom:2.5px solid transparent;white-space:nowrap}
.tabs button.on{color:var(--ink);border-bottom-color:var(--signal)}
.tabs .n{font-weight:500;font-size:calc(12px * var(--ts));color:var(--muted)}
main{padding:12px 14px 30px;max-width:720px;margin:0 auto}
.ver{text-align:center;font-size:calc(12px * var(--ts));color:var(--muted);margin:10px 0 calc(env(safe-area-inset-bottom) + 24px)}

/* summary, briefing */
.sum{padding:14px 4px 10px}
.sum-k{font-size:calc(13px * var(--ts));color:var(--muted);font-weight:600}
.sum-v{font:700 calc(38px * var(--ts))/1.1 var(--num);letter-spacing:-.02em;margin:2px 0 4px;font-variant-numeric:tabular-nums}
.sum-d,.sum-g{font:600 calc(15px * var(--ts))/1.4 var(--num);font-variant-numeric:tabular-nums}
.sum-g{color:var(--ink-2);font-weight:500}
.alloc{display:flex;height:8px;border-radius:4px;overflow:hidden;gap:2px;margin:14px 0 6px}
.alloc i{min-width:3px}
.alloc-l{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:calc(12px * var(--ts));color:var(--ink-2)}
.alloc-l i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px}
.brief{background:var(--sheet);border:1px solid var(--rule);border-left:4px solid var(--signal);border-radius:12px;padding:var(--pad);margin:10px 0 16px}
.brief.mood-positive{border-left-color:var(--up)} .brief.mood-negative{border-left-color:var(--down)} .brief.mood-mixed{border-left-color:var(--amber)}
.brief-h{display:flex;justify-content:space-between;align-items:center;gap:8px}
.brief-t{font:700 calc(var(--t) * 1.12 * var(--ts))/1.25 var(--display);margin:8px 0 6px;letter-spacing:-.01em}
.brief-p,.brief-s p,.story p,.idea p{font-size:calc(var(--d) * var(--ts));line-height:1.55;margin:0 0 10px}
.brief-s p:last-child{margin-bottom:4px}
.mini{font:700 calc(14px * var(--ts))/1.3 var(--display);margin:14px 0 4px}
ul.dots{margin:0;padding-left:18px;font-size:calc(var(--d) * var(--ts))} ul.dots li{margin:3px 0}
.sigcount{display:flex;gap:6px;margin:10px 0 0}
.badge-ai{display:inline-block;font-size:calc(12px * var(--ts));font-weight:700;color:var(--signal);background:var(--signal-wash);border-radius:6px;padding:2px 8px}
.badge-ex{display:inline-block;font-size:calc(12px * var(--ts));font-weight:600;color:var(--ink-2);border:1px dashed var(--muted);border-radius:6px;padding:1px 8px}

/* rows */
.listbar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:6px 2px 8px;font-size:calc(13px * var(--ts));color:var(--muted)}
.rows{background:var(--sheet);border:1px solid var(--rule);border-radius:12px;overflow:hidden}
.row{display:grid;grid-template-columns:minmax(0,1fr) 72px auto;align-items:center;gap:6px 12px;padding:calc(var(--pad) * .8) var(--pad);border-bottom:1px solid var(--rule);cursor:pointer}
.row:last-child{border-bottom:0}
.r-l{min-width:0}
.sym{display:block;font:700 calc(var(--d) * 1.05 * var(--ts))/1.2 var(--num);letter-spacing:.01em}
.r-l small{display:block;font-size:calc(var(--m) * var(--ts));color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.r-r{display:flex;flex-direction:column;align-items:flex-end;gap:3px}
.r-r b{font:600 calc(var(--d) * var(--ts))/1.2 var(--num);font-variant-numeric:tabular-nums;white-space:nowrap}
.pill{font:600 calc(12.5px * var(--ts))/1 var(--num);padding:4px 7px;border-radius:6px;font-variant-numeric:tabular-nums;white-space:nowrap;background:var(--paper);color:var(--muted)}
.pill.up{color:var(--up);background:color-mix(in srgb, var(--up) 13%, transparent)}
.pill.down{color:var(--down);background:color-mix(in srgb, var(--down) 13%, transparent)}
.r-sig{grid-column:1 / -1;display:flex;align-items:baseline;gap:8px;font-size:calc(var(--m) * var(--ts));color:var(--ink-2);margin-top:-2px}
.r-sig span:last-child{overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
body.d-tiny .row{grid-template-columns:minmax(0,1fr) auto}
body.d-tiny .row .trendln,body.d-tiny .r-sig span:last-child{display:none}
.trendln{width:72px;height:28px;display:block}
.trendln.wide{width:100%;height:40px;margin-top:8px}
.trendln path{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.trendln.up path{stroke:var(--up)} .trendln.down path{stroke:var(--down)}
.chip{display:inline-block;flex:none;font-size:calc(12px * var(--ts));font-weight:700;padding:2px 8px;border-radius:6px;white-space:nowrap}
.chip.sig-buy{color:var(--up);background:color-mix(in srgb, var(--up) 14%, transparent)}
.chip.sig-hold{color:var(--amber);background:var(--amber-wash)}
.chip.sig-sell{color:var(--down);background:color-mix(in srgb, var(--down) 14%, transparent)}
.chip.ex{font-weight:600;color:var(--ink-2);border:1px dashed var(--muted);padding:1px 7px}
.empty{text-align:center;padding:40px 18px}
.empty.small{padding:20px 10px;color:var(--muted)}
.empty h2{font:700 calc(21px * var(--ts))/1.25 var(--display);margin:14px 0 8px}
.empty p{color:var(--ink-2);margin:0 0 18px}
.empty-mark{width:84px;height:84px;border-radius:20px;background:#0E1116}

/* ideas */
.idea{background:var(--sheet);border:1px solid var(--rule);border-radius:12px;padding:var(--pad);margin:0 0 12px}
.idea-h{display:flex;justify-content:space-between;gap:10px}
.cap{font-size:calc(11.5px * var(--ts));color:var(--muted);margin:2px 0 8px !important}

/* sheets (app-blueprints · settings) */
.sheet{position:fixed;inset:0;z-index:10;background:var(--paper);transform:translateY(102%);transition:transform .28s ease;overflow-y:auto;-webkit-overflow-scrolling:touch}
.sheet.open{transform:none}
#detail{z-index:11} #addsheet{z-index:12} #cfgsheet{z-index:13}
.sh-head{position:sticky;top:0;z-index:2;background:var(--paper);display:flex;justify-content:space-between;align-items:center;padding:calc(env(safe-area-inset-top) + 14px) 18px 12px;border-bottom:1px solid var(--rule)}
.sh-head h2{font:700 calc(24px * var(--ts))/1 var(--display);margin:0}
.sh-body{padding:16px 18px calc(env(safe-area-inset-bottom) + 40px);max-width:720px;margin:0 auto}
.link{color:var(--signal);font-weight:600;font-size:16px}
.link.small{font-size:calc(14px * var(--ts))}
.hint{font-size:calc(13px * var(--ts));color:var(--muted);margin:8px 2px 0}
.sec{font:700 calc(17px * var(--ts))/1.2 var(--display);margin:26px 0 6px}
.srow{display:flex;align-items:center;gap:8px;padding:11px 0;border-bottom:1px solid var(--rule)}
.grow b{display:block;font-weight:600}
.grow small{display:block;font-size:calc(13px * var(--ts));color:var(--ink-2)}
.switch{width:46px;height:28px;border-radius:14px;background:var(--rule);position:relative;flex:none;transition:background .2s}
.switch::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:11px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .2s}
.switch.on{background:var(--signal)}
.switch.on::after{transform:translateX(18px)}
.sm{font-size:calc(13px * var(--ts));padding:6px 11px;border-radius:8px;border:1px solid var(--rule);background:var(--sheet);white-space:nowrap;flex:none}
.danger.armed{background:var(--danger);color:#fff;border-color:var(--danger)}
.seg{display:flex;border:1px solid var(--rule);border-radius:9px;overflow:hidden;flex:none;background:var(--sheet)}
.seg button{font-size:calc(12.5px * var(--ts));padding:6px 10px;color:var(--ink-2);white-space:nowrap}
.seg button.on{background:var(--ink);color:var(--paper);font-weight:600}
.seg.wide button{flex:1;text-align:center;padding:9px 4px;font-size:calc(13.5px * var(--ts))}
.lk-row{margin:10px 0 14px}
.lk-l{display:block;font-size:calc(13px * var(--ts));font-weight:600;color:var(--ink-2);margin-bottom:6px}
.lk-row > small{display:block;margin-top:6px;font-size:calc(12.5px * var(--ts))}
.sws{display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;padding:3px 3px 2px}
.sws::-webkit-scrollbar{display:none}
.sw{display:flex;flex-direction:column;align-items:center;gap:5px;flex:none}
.sw .prev{position:relative;width:50px;height:50px;border-radius:13px;display:grid;place-items:center;border:1px solid rgba(127,127,127,.35);font:700 18px/1 var(--display)}
.sw .prev i{position:absolute;right:6px;bottom:6px;width:9px;height:9px;border-radius:5px}
.sw.on .prev{outline:2.5px solid var(--signal);outline-offset:2px}
.sw small{font-size:12px;color:var(--ink-2)}
.sw.on small{color:var(--ink);font-weight:600}
.cfg{padding:12px 0;border-bottom:1px solid var(--rule)}
.cfg.ch .cfg-h b::after{content:"";display:inline-block;width:7px;height:7px;border-radius:4px;background:var(--signal);margin-left:7px;vertical-align:2px}
.cfg-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.cfg-h b{font-weight:600}
.cfg small{display:block;font-size:calc(13px * var(--ts));margin-top:2px}
.stepper{display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap}
.stepper button{width:38px;height:36px;border-radius:9px;border:1px solid var(--rule);background:var(--sheet);font-size:20px;font-weight:600;text-align:center}
.stepper button[disabled]{opacity:.35}
.stepper input{width:86px;text-align:center;font:600 16px var(--sans);padding:7px 6px;border-radius:9px;border:1px solid var(--rule);background:var(--paper);color:var(--ink)}
.stepper .unit{font-size:calc(14px * var(--ts));color:var(--ink-2);min-width:2.5em}
.stepper .range{flex-basis:100%;font-size:calc(12px * var(--ts));color:var(--muted)}
.cfgin.wide{display:block;width:100%;margin-top:8px;font:16px/1.45 var(--sans);padding:9px 11px;border-radius:9px;border:1px solid var(--rule);background:var(--paper);color:var(--ink)}
.cfgin:focus{outline:2px solid var(--signal);outline-offset:-1px}
.cfg-foot{margin-top:18px}
.srow.bp{width:100%;text-align:left}
.chev{flex:none;color:var(--muted);font-size:calc(20px * var(--ts));line-height:1}
.field{display:flex;gap:8px;margin-top:12px}
.field input{flex:1;min-width:0;font:16px var(--sans);padding:10px 12px;border-radius:10px;border:1px solid var(--rule);background:var(--sheet);color:var(--ink)}

/* AI sheet (app-blueprints · ai-configuration) */
#aisheet{position:fixed;inset:0;z-index:14;background:var(--paper);transform:translateY(102%);transition:transform .28s ease;overflow-y:auto}
#aisheet.open{transform:none}
.aicard,.ucard{background:var(--sheet);border:1px solid var(--rule);border-radius:14px;padding:14px;margin:14px 0}
.aicard.active{border-color:var(--signal);box-shadow:0 0 0 1px var(--signal)}
.aic-h{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:calc(17px * var(--ts))}
.aic-row{display:flex;align-items:center;gap:10px;margin-top:10px;font-size:calc(14px * var(--ts))}
.aic-row.lbl,.aic-row .lbl{font-weight:600;color:var(--ink-2)}
.aicard code{font:13px ui-monospace,Menlo,monospace;background:var(--paper);border:1px solid var(--rule);border-radius:6px;padding:2px 6px}
.aic-btns{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}
.sm[disabled]{opacity:.5}
.modelsel{display:block;width:100%;margin-top:6px;font:16px var(--sans);color:var(--ink);background:var(--paper);border:1px solid var(--rule);border-radius:9px;padding:9px 10px}
.ustat{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 4px}
.ustat div{background:var(--paper);border-radius:10px;padding:8px 10px}
.ustat b{display:block;font-size:calc(20px * var(--ts));font-weight:700}
.ustat small{color:var(--muted);font-size:calc(12px * var(--ts))}
.ubars{display:flex;align-items:flex-end;gap:3px;height:56px;margin-top:10px}
.ubars span{flex:1;background:var(--signal);border-radius:3px 3px 0 0;min-height:2px}
.ubars span.zero{background:var(--rule)}
.ubars-l{display:flex;justify-content:space-between;font-size:calc(11.5px * var(--ts));color:var(--muted);margin-top:4px}
.utab{width:100%;border-collapse:collapse;margin-top:12px;font-size:calc(13px * var(--ts))}
.utab th{text-align:left;font-weight:600;color:var(--muted);padding:4px 4px 4px 0;border-bottom:1px solid var(--rule)}
.utab td{padding:6px 4px 6px 0;border-bottom:1px solid var(--rule);color:var(--ink-2);word-break:break-word}
.utab th:not(:first-child),.utab td:not(:first-child){text-align:right;white-space:nowrap}

/* one stock */
.dname{font:600 calc(17px * var(--ts))/1.3 var(--display);margin:0}
.dname small{display:block;font:400 calc(13px * var(--ts)) var(--sans);color:var(--muted)}
.dprice{display:flex;align-items:baseline;gap:10px;margin-top:10px}
.dprice b{font:700 calc(36px * var(--ts))/1.1 var(--num);letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.rng{margin:14px 0 8px}
.chart{margin:0}
.chart svg{width:100%;height:170px;display:block}
.chart .ln{fill:none;stroke:var(--muted);stroke-width:2;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.chart .ar{fill:var(--muted);opacity:.1}
.chart.up .ln{stroke:var(--up)} .chart.up .ar{fill:var(--up)}
.chart.down .ln{stroke:var(--down)} .chart.down .ar{fill:var(--down)}
.chart .base{stroke:var(--rule);stroke-width:1;stroke-dasharray:3 4;vector-effect:non-scaling-stroke}
.chart figcaption,.chart-hl{display:flex;justify-content:space-between;font-size:calc(12px * var(--ts));color:var(--muted);margin-top:4px}
.chart figcaption .up,.chart figcaption .down{font-weight:700}
.hold{background:var(--sheet);border:1px solid var(--rule);border-radius:12px;padding:12px 14px;margin-top:16px}
.hold-g{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}
.hold-g small{display:block;font-size:calc(12px * var(--ts));color:var(--muted)}
.hold-g b{font:600 calc(16px * var(--ts))/1.3 var(--num);font-variant-numeric:tabular-nums}
.sigbig{display:flex;align-items:baseline;gap:12px;margin:4px 0 6px}
.sb-w{font:800 calc(40px * var(--ts))/1 var(--display);letter-spacing:-.02em}
.sb-c{font-size:calc(13px * var(--ts));color:var(--muted);font-weight:600}
.sigbig.sig-buy .sb-w,.sigbig.t-up .sb-w{color:var(--up)} .sigbig.sig-hold .sb-w,.sigbig.t-flat .sb-w{color:var(--amber)} .sigbig.sig-sell .sb-w,.sigbig.t-down .sb-w{color:var(--down)}
.sigbig.ex .sb-w{font-size:calc(28px * var(--ts))}
.sigsec p{margin:6px 0 8px;font-size:calc(var(--d) * var(--ts))}
.story-t{font:700 calc(var(--t) * 1.1 * var(--ts))/1.25 var(--display);margin:10px 0 8px}
.refw{white-space:nowrap}
.ref{display:inline-grid;place-items:center;min-width:19px;height:19px;padding:0 4px;margin-left:3px;border-radius:5px;background:var(--signal-wash);color:var(--signal);font:700 11px/1 var(--sans);vertical-align:2px}
.tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.tile,.rangebox{display:block;width:100%;text-align:left;background:var(--sheet);border:1px solid var(--rule);border-radius:10px;padding:9px 11px}
.tile.on,.rangebox.on{border-color:var(--signal);box-shadow:0 0 0 1px var(--signal)}
.tile small,.rangebox > small{display:block;font-size:calc(12px * var(--ts));color:var(--muted)}
.tile b{font:600 calc(16.5px * var(--ts))/1.3 var(--num);font-variant-numeric:tabular-nums}
.tile b small{font-size:calc(12px * var(--ts));font-weight:700}
.rangebox{margin-top:8px}
.rbar{position:relative;height:6px;border-radius:3px;background:linear-gradient(90deg,var(--down),var(--amber),var(--up));margin:12px 4px 6px;opacity:.85}
.rbar i{position:absolute;top:-5px;width:4px;height:16px;margin-left:-2px;border-radius:2px;background:var(--ink)}
.rlab{display:flex;justify-content:space-between;gap:6px;font-size:calc(12px * var(--ts));color:var(--muted)}
.perf{display:flex;justify-content:space-between;margin-top:6px}
.perf small{display:block;font-size:calc(11.5px * var(--ts));color:var(--muted)}
.perf b{font:600 calc(16px * var(--ts))/1.3 var(--num)}
.mood{height:8px;border-radius:4px;background:var(--down);overflow:hidden;margin:10px 0 6px;opacity:.85}
.mood i{display:block;height:100%;background:var(--up)}
.explain{background:var(--signal-wash);color:var(--ink);border-radius:10px;padding:10px 12px;font-size:calc(14px * var(--ts));margin:10px 0 0}
.about summary{font-size:calc(var(--d) * var(--ts));color:var(--ink-2);cursor:pointer}
.about p{font-size:calc(var(--d) * var(--ts));color:var(--ink-2)}
.news{display:block;width:100%;text-align:left;padding:10px 0;border-bottom:1px solid var(--rule)}
.news b{display:block;font-weight:600;font-size:calc(var(--d) * var(--ts));line-height:1.35}
.news small{display:block;font-size:calc(var(--m) * var(--ts));color:var(--muted);margin-top:2px}
.manage{margin-top:10px}

/* update sheet (app-blueprints · in-app-updates) */
#upd{position:fixed;inset:0;z-index:48;background:rgba(0,0,0,.55);display:flex;align-items:flex-end}
.updp{width:100%;background:var(--sheet);border-radius:22px 22px 0 0;padding:20px 18px calc(16px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px}
.updtag{align-self:flex-start;background:var(--signal);color:var(--paper);font-size:calc(12px * var(--ts));font-weight:800;padding:4px 10px;border-radius:999px}
.updt{margin:6px 0 0;font:700 calc(22px * var(--ts))/1.2 var(--display)}
.upds{color:var(--muted);font-size:calc(14px * var(--ts))}
.updl{display:flex;flex-direction:column;gap:10px;margin:8px 0 6px}
.updi{display:flex;gap:12px;align-items:flex-start;background:var(--paper);border-radius:14px;padding:12px}
.updic{font-size:24px;line-height:1.1;flex:none}
.updi b{display:block;font-size:calc(15px * var(--ts))}
.updi span{display:block;color:var(--muted);font-size:calc(13px * var(--ts));line-height:1.35;margin-top:2px}
.updmsg:empty{display:none}
.updgo{padding:13px;font-size:16px}
.updlater{padding:11px;background:var(--paper);color:inherit;border-radius:10px}

#toast{position:fixed;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom) + 18px);z-index:60;background:var(--ink);color:var(--paper);border-radius:12px;padding:12px 14px;font-size:calc(14px * var(--ts));transform:translateY(calc(100% + 40px));visibility:hidden;transition:transform .25s ease,visibility 0s linear .25s;text-align:center}
#toast.on{transform:none;visibility:visible;transition:transform .25s ease}

/* launch screen (app-blueprints · launch-screen) */
.splash{--sp-bg:#0E1116;--sp-ink:#F6F7F9;--sp-accent:#34D399;--sp-accent2:#60A5FA;--sp-muted:#9AA3AE;--sp-font:var(--display);
  position:fixed;inset:0;z-index:90;background:var(--sp-bg);color:var(--sp-ink);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;cursor:pointer;
  animation:spOut .4s ease 2.4s forwards}
.splash.gone{display:none}
.spIcon{width:148px;height:148px;opacity:0;transform:scale(.86);animation:spIn .5s cubic-bezier(.2,.9,.3,1.2) .05s forwards}
.spIcon svg{width:100%;height:100%;display:block;overflow:visible}
.spFrame{fill:none;stroke:var(--sp-ink);stroke-opacity:.35;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;opacity:0;animation:spFade .4s ease .25s forwards}
.spDraw{fill:none;stroke:var(--sp-ink);stroke-width:13;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100;stroke-dashoffset:100;animation:spDraw .8s ease-in-out .15s forwards}
.spPop{fill:var(--sp-accent);transform-box:fill-box;transform-origin:center;transform:scale(0);animation:spPop .45s cubic-bezier(.3,1.7,.5,1) .75s forwards}
.spDetail{fill:var(--sp-ink);opacity:0;animation:spFade .3s ease 1.05s forwards}
.spSweep{fill:none;stroke:var(--sp-accent2);stroke-width:7;stroke-linecap:round;opacity:0;transform:translateX(var(--sp-sweep-from,-120px));animation:spSweep 1s ease-in-out .95s forwards}
.spWord{font:800 40px/1 var(--sp-font,ui-rounded,-apple-system,system-ui,sans-serif);letter-spacing:-.02em;opacity:0;transform:translateY(10px);animation:spUp .45s ease 1.05s forwards}
.spWord span{color:var(--sp-accent)}
.spTag{font:600 15px/1.3 -apple-system,system-ui,sans-serif;letter-spacing:.06em;color:var(--sp-muted);opacity:0;transform:translateY(8px);animation:spUp .45s ease 1.4s forwards}
@keyframes spIn{to{opacity:1;transform:scale(1)}}
@keyframes spFade{to{opacity:1}}
@keyframes spDraw{to{stroke-dashoffset:0}}
@keyframes spPop{to{transform:scale(1)}}
@keyframes spSweep{0%{opacity:0}15%{opacity:1}100%{opacity:1;transform:translateX(0)}}
@keyframes spUp{to{opacity:1;transform:none}}
@keyframes spOut{to{opacity:0;visibility:hidden}}
/* Flash: each stock with its top headlines */
.flash{display:flex;flex-direction:column;gap:10px;margin:6px 0 4px}
.fl{display:grid;grid-template-columns:minmax(84px,30%) 1fr;gap:12px;background:var(--sheet);border:1px solid var(--rule);border-radius:12px;padding:12px}
.fl.speaking{box-shadow:inset 4px 0 0 var(--amber)}
.fl-s{display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-width:0;text-align:left}
.fl-s b{font:700 calc(18px * var(--ts))/1.1 var(--display);letter-spacing:-.01em}
.fl-s small{font-size:calc(12.5px * var(--ts));color:var(--muted);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.fl-s .pill{margin-top:4px}
.fl-w{font-size:calc(11.5px * var(--ts));color:var(--muted);font-weight:600}
.fl-l{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0;padding-right:10px;border-right:1px solid var(--rule)}
.fl-l .fl-s{border-right:0;padding-right:0}
.fl-k{font-size:calc(13px * var(--ts));color:var(--ink-2);font-weight:600}
.fl-m{font-size:calc(13px * var(--ts));font-weight:700;margin-top:-4px}
.fl-r{font-size:calc(12px * var(--ts));color:var(--muted);line-height:1.3}
.fl-r b{color:var(--ink);font-weight:700}
.flmood{display:flex;width:100%;height:5px;margin-top:-3px;border-radius:3px;overflow:hidden;background:var(--down);opacity:.85}
.flmood i{flex:none;height:100%;background:var(--up)}
.fl-spk{display:inline-grid;place-items:center;width:24px;height:24px;margin-left:4px;border-radius:12px;background:var(--signal-wash);color:var(--signal);vertical-align:2px}
.fl-spk .ico{width:14px;height:14px;margin:0}
.fl-spk .busy-dot{width:12px;height:12px}
.fl.speaking .fl-spk{background:var(--amber);color:var(--paper)}
.fl-open{font-size:calc(12.5px * var(--ts));font-weight:700;color:var(--signal);padding:2px 0}
.fl-story{grid-column:1 / -1;margin:0;border-top:1px solid var(--rule);padding-top:10px}
.fl-story summary{font-size:calc(13px * var(--ts));font-weight:700;color:var(--signal);cursor:pointer}
.fl-story h4{font:700 calc(16px * var(--ts))/1.3 var(--display);margin:8px 0 6px}
.fl-story p{font-size:calc(14.5px * var(--ts));line-height:1.55;margin:0 0 9px}
.fl-take{background:var(--signal-wash);border-radius:8px;padding:8px 10px}
.fl-src{padding-left:1.2em;margin:6px 0}
.fl-src li{margin-bottom:6px;font-size:calc(13px * var(--ts))}
.fl-src li .link{text-align:left;font-weight:600}
.fl-src small{display:block;color:var(--muted)}
.fl-act{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}
.fl-done{font-size:calc(13px * var(--ts));font-weight:700;color:var(--signal);padding:6px 0}
.fl-lis{display:inline-flex;align-items:center;font-size:calc(13px * var(--ts));font-weight:700;color:var(--signal);padding:5px 10px;border-radius:16px;background:var(--signal-wash)}
.fl-lis .ico{width:14px;height:14px}
.fl-new{align-self:flex-start;font-size:calc(11.5px * var(--ts));font-weight:700;color:var(--amber);margin-bottom:4px}
.fl.folded{display:block;padding:0;opacity:.82}
.fl-fold{display:flex;align-items:center;gap:8px;width:100%;padding:11px 12px;text-align:left}
.fl-fold b{font:700 calc(16px * var(--ts))/1.1 var(--display)}
.fl-fs{flex:1;min-width:0;text-align:right;font-size:calc(12px * var(--ts));color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl-fold .chev{font-size:20px;line-height:1;color:var(--muted);transform:rotate(90deg)}
.lb-a{display:flex;gap:6px}
.chip.t-up{color:var(--up);box-shadow:inset 0 0 0 1px currentColor} .chip.t-flat{color:var(--amber);box-shadow:inset 0 0 0 1px currentColor} .chip.t-down{color:var(--down);box-shadow:inset 0 0 0 1px currentColor}
.fl-n{display:flex;flex-direction:column;min-width:0}
.fl-h{display:block;width:100%;text-align:left;padding:7px 0;border-bottom:1px solid var(--rule)}
.fl-h:first-child{padding-top:0}
.fl-h:last-child{border-bottom:0;padding-bottom:0}
.fl-h b{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-weight:600;font-size:calc(14.5px * var(--ts));line-height:1.32}
.fl-h small{display:block;font-size:calc(12px * var(--ts));color:var(--muted);margin-top:2px}
body.d-compact .fl{padding:9px;gap:9px} body.d-tiny .fl-h small{display:none}
/* TL;DR sheet */
#newssheet{z-index:12}
.tl .kicker{color:var(--muted);font-size:calc(13.5px * var(--ts));margin:2px 0 6px}
.tl-h{font:700 calc(23px * var(--ts))/1.22 var(--display);margin:0 0 12px;letter-spacing:-.01em}
.tli-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:calc(12.5px * var(--ts));color:var(--muted);margin-bottom:4px}
.tli-load{display:flex;align-items:center;gap:10px;color:var(--ink-2);font-size:calc(14px * var(--ts));padding:14px 0}
.tl-lead{font-size:calc(18px * var(--ts));line-height:1.5;font-weight:500;margin:10px 0 12px}
html[data-font=serif] .tl-lead{font-family:var(--serif)}
.tl-pts{padding-left:1.2em;margin:0 0 16px}
.tl-pts li{font-size:calc(16px * var(--ts));line-height:1.55;margin-bottom:8px;color:var(--ink-2)}
.tl-story p{font-size:calc(16px * var(--ts));line-height:1.6;margin:0 0 12px;color:var(--ink)}
html[data-font=serif] .tl-story p{font-family:var(--serif)}
.tl-why{background:var(--sheet);border-left:3px solid var(--signal);border-radius:0 10px 10px 0;padding:10px 14px;margin:0 0 16px}
.tl-why p{margin:4px 0 0;color:var(--ink-2);font-size:calc(15px * var(--ts));line-height:1.5}
.tl-listen{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:4px 0 18px}
.primary.block{display:block;width:100%;text-align:center;padding:13px 16px;margin:6px 0 4px}
.err{color:var(--danger)}
.cursel{font:16px var(--sans);color:var(--ink);background:var(--paper);border:1px solid var(--rule);border-radius:9px;padding:7px 8px;flex:none}
.orig{display:block;font-size:calc(12px * var(--ts));font-weight:500;color:var(--muted);margin-top:1px}
/* Market open or closed */
.mk{display:inline-flex;align-items:center;gap:5px;font-size:calc(11.5px * var(--ts));font-weight:700;color:var(--muted);white-space:nowrap}
.mk::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--muted);opacity:.7}
.mk.on{color:var(--up)} .mk.on::before{background:var(--up);opacity:1;box-shadow:0 0 0 3px color-mix(in srgb, var(--up) 22%, transparent)}
.mk.lunch{color:var(--amber)} .mk.lunch::before{background:var(--amber);opacity:1}
.mk.long{display:flex;white-space:normal;font-size:calc(13px * var(--ts));font-weight:600;margin:2px 0 10px}
.r-l .mk{display:flex;margin-top:2px}
.mkts{display:flex;flex-direction:column;gap:10px}
.mkt{background:var(--sheet);border:1px solid var(--rule);border-radius:12px;padding:12px 14px}
.mkt.on{border-left:4px solid var(--up)}
.mkt-h{display:flex;align-items:center;gap:10px}
.mkt-h b{display:block;font:700 calc(16px * var(--ts))/1.2 var(--display)}
.mkt-h small{display:block;font-size:calc(12.5px * var(--ts));color:var(--muted)}
.mkt-f{font-size:24px;line-height:1}
.mkt-c{margin:10px 0 6px;font-size:calc(15px * var(--ts))} .mkt-c b{font-size:calc(17px * var(--ts))}
.mkt-c small{display:block;color:var(--muted);font-size:calc(12.5px * var(--ts))}
.mkt-p{height:6px;border-radius:3px;background:var(--rule);overflow:hidden;margin:4px 0 8px} .mkt-p i{display:block;height:100%;background:var(--up)}
.mkt-s{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.mkt-s .chip{background:var(--paper);box-shadow:inset 0 0 0 1px var(--rule);color:var(--ink)}
/* Charts you can touch */
.chart{position:relative}
.chart svg{touch-action:pan-y;cursor:crosshair}
.xh .xl{stroke:var(--ink-2);stroke-width:1;stroke-dasharray:3 3;vector-effect:non-scaling-stroke}
.xh .xd{fill:var(--paper);stroke:currentColor;stroke-width:2.5;vector-effect:non-scaling-stroke}
.xtip{position:absolute;top:-6px;z-index:2;display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 8px;background:var(--ink);color:var(--paper);border-radius:9px;padding:6px 10px;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.18);max-width:220px}
.xtip b{font-size:calc(15px * var(--ts))} .xtip small{flex-basis:100%;font-size:calc(11.5px * var(--ts));opacity:.8}
.xtip .up{color:#86efac} .xtip .down{color:#fca5a5}
.rng button{padding-left:4px;padding-right:4px}
/* Check my portfolio */
.sum{position:relative}
.ck-icon{position:absolute;top:10px;right:2px;width:38px;height:38px;border-radius:19px;display:grid;place-items:center;background:var(--signal-wash);color:var(--signal)}
.ck-icon svg{width:21px;height:21px}
.ck-icon.ping{animation:ckping 1.4s ease-out 1}
@keyframes ckping{0%{box-shadow:0 0 0 0 color-mix(in srgb, var(--signal) 55%, transparent);transform:scale(1.25)}100%{box-shadow:0 0 0 16px transparent;transform:scale(1)}}
.ck-big{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--signal);color:var(--paper);border-radius:14px;padding:14px 16px;margin:12px 0 2px;max-height:120px;overflow:hidden;transform-origin:top right;transition:max-height .6s ease,opacity .5s ease,transform .6s ease,margin .6s ease,padding .6s ease}
.ck-big.shrink{max-height:0;opacity:0;transform:scale(.2) translate(40%,-20%);margin:0;padding-top:0;padding-bottom:0}
.ck-big-i{width:40px;height:40px;border-radius:20px;display:grid;place-items:center;background:rgba(255,255,255,.18);flex:none} .ck-big-i svg{width:24px;height:24px}
.ck-big-t{flex:1} .ck-big-t b{display:block;font:700 calc(17px * var(--ts))/1.25 var(--display)} .ck-big-t small{display:block;opacity:.85;font-size:calc(13px * var(--ts));margin-top:2px}
.ck-big .chev{font-size:24px;opacity:.85}
#checksheet{z-index:12}
.ck-step{display:flex;gap:12px;align-items:flex-start;margin:14px 0 8px}
.ck-step b{display:block;font:700 calc(16px * var(--ts))/1.3 var(--display)} .ck-step small{display:block;color:var(--muted);font-size:calc(13px * var(--ts));margin-top:2px}
.ck-n{width:26px;height:26px;flex:none;border-radius:13px;display:grid;place-items:center;background:var(--signal);color:var(--paper);font-weight:700;font-size:14px}
.ck-shots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 12px}
.ck-shots.mini{grid-template-columns:repeat(6,1fr);gap:6px;margin:0 0 12px} .ck-shots.mini figcaption{display:none}
.ck-shot{position:relative;margin:0;aspect-ratio:9/16;border-radius:10px;overflow:hidden;border:1px solid var(--rule);background:var(--sheet)}
.ck-shot img{width:100%;height:100%;object-fit:cover;display:block}
.ck-shot figcaption{position:absolute;left:6px;bottom:6px;min-width:20px;height:20px;border-radius:10px;background:rgba(0,0,0,.6);color:#fff;font-size:12px;font-weight:700;display:grid;place-items:center;padding:0 6px}
.ck-x{position:absolute;top:5px;right:5px;width:26px;height:26px;border-radius:13px;background:rgba(0,0,0,.6);color:#fff;font-size:18px;line-height:1}
.ck-shot.scan::after{content:"";position:absolute;left:0;right:0;height:30%;top:-30%;background:linear-gradient(180deg,transparent,color-mix(in srgb, var(--signal) 45%, transparent),transparent);animation:ckscan 1.6s linear infinite}
@keyframes ckscan{to{top:100%}}
.ck-add{aspect-ratio:9/16;border-radius:10px;border:2px dashed var(--rule);color:var(--signal);font-weight:700;font-size:calc(13px * var(--ts));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
.ck-add span{font-size:28px;line-height:1}
.primary.block[disabled]{opacity:.5}
.ck-progress{background:var(--sheet);border:1px solid var(--rule);border-radius:12px;padding:12px 14px;margin:6px 0}
.ck-prog-h{display:flex;justify-content:space-between;gap:10px;font-size:calc(14px * var(--ts));font-weight:600;margin-bottom:8px}
.ck-prog-p{color:var(--signal);font-variant-numeric:tabular-nums}
.ck-prog{height:8px;border-radius:4px;background:var(--rule);overflow:hidden} .ck-prog i{display:block;height:100%;background:var(--signal);border-radius:4px;transition:width .3s ease}
.ck-res{background:var(--sheet);border:1px solid var(--rule);border-radius:12px;padding:12px 14px;margin:14px 0 10px}
.ck-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}
.ck-b{display:inline-flex;align-items:center;gap:4px;font-size:calc(12px * var(--ts));font-weight:700;padding:3px 9px;border-radius:7px;white-space:nowrap}
.ck-b b{font-weight:800}
.b-ok{color:var(--up);background:color-mix(in srgb, var(--up) 13%, transparent)} .b-warn{color:var(--amber);background:color-mix(in srgb, var(--amber) 15%, transparent)}
.b-bad{color:var(--danger);background:color-mix(in srgb, var(--danger) 12%, transparent)} .b-add{color:var(--signal);background:var(--signal-wash)} .b-gone{color:var(--ink-2);background:color-mix(in srgb, var(--muted) 18%, transparent)}
.ck-tot{margin:8px 0 2px;font-size:calc(14px * var(--ts))}
.ck-list{display:flex;flex-direction:column;gap:8px}
.ck{background:var(--sheet);border:1px solid var(--rule);border-left:4px solid var(--rule);border-radius:12px;padding:12px 14px}
.ck.t-ok{border-left-color:var(--up)} .ck.t-warn{border-left-color:var(--amber)} .ck.t-bad{border-left-color:var(--danger)} .ck.t-add{border-left-color:var(--signal)} .ck.t-gone{border-left-color:var(--muted)}
.ck.done{opacity:.72}
.ck-h{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.ck-what{margin:6px 0 8px;font-size:calc(14px * var(--ts));color:var(--ink-2);line-height:1.45}
.ck-cmp{margin:8px 0 6px;font-size:calc(14px * var(--ts))}
.ck-r{display:grid;grid-template-columns:1.15fr 1fr 1fr 18px;gap:6px;align-items:baseline;padding:5px 4px;border-top:1px solid var(--rule)}
.ck-r.hd{border-top:0;padding-top:0;font-size:calc(11.5px * var(--ts));color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.03em}
.ck-r span{color:var(--muted)} .ck-r b{font-weight:600} .ck-r i{font-style:normal;color:var(--up);font-weight:800;text-align:right}
.ck-r.bad b{color:var(--ink);font-weight:800} .ck-r.bad i{color:var(--danger)}
.ck-r.bad{background:linear-gradient(90deg,color-mix(in srgb, var(--amber) 14%, transparent),transparent);border-radius:6px}
.ck-fs{display:flex;gap:10px;margin:8px 0 6px}
.ck-f{flex:1;display:flex;flex-direction:column;gap:3px;font-size:calc(12.5px * var(--ts));color:var(--muted);font-weight:600}
.ck-f input{font:16px var(--sans);padding:8px 10px;border-radius:9px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);width:100%;-webkit-user-select:text;user-select:text}
.ck-again{margin:14px 0 4px}
#checksheet{z-index:12}
/* Ideas: sections that fold, themes, rich idea cards */
.fold-sec{background:var(--sheet);border:1px solid var(--rule);border-radius:12px;margin:10px 0 14px;overflow:hidden}
.fold-sec.strat-sec{border-left:4px solid var(--amber)} .fold-sec.ideas-sec{border-left:4px solid var(--signal)}
.fold-sec>summary{display:flex;align-items:center;gap:8px;padding:12px var(--pad);cursor:pointer;list-style:none}
.fold-sec>summary::-webkit-details-marker{display:none}
.fs-t{font:700 calc(var(--t) * 1.02 * var(--ts))/1.25 var(--display)}
.fs-s{flex:1;text-align:right;font-size:calc(12.5px * var(--ts));color:var(--muted)}
.fold-sec .chev{font-size:20px;line-height:1;color:var(--muted);transition:transform .2s}
.fold-sec[open]>summary .chev{transform:rotate(90deg)}
.fs-b{padding:0 var(--pad) var(--pad)}
.fold-sec .strat{background:none;border:0;padding:0;margin:0}
.ideas-sec .idea{background:var(--paper)}
.themes{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.theme{display:inline-flex;align-items:center;gap:2px;background:var(--signal-wash);color:var(--signal);border-radius:16px;padding:4px 4px 4px 11px;font-weight:600;font-size:calc(13.5px * var(--ts))}
.theme button{width:24px;height:24px;border-radius:12px;font-size:16px;line-height:1;color:var(--signal)}
.theme-add{display:flex;gap:8px;align-items:center}
.theme-add .cfgin{flex:1;font:16px var(--sans);padding:8px 10px;border-radius:9px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);-webkit-user-select:text;user-select:text}
.idea-open{text-align:left}
.idea-open .chev{color:var(--signal);font-weight:700}
.idea-t{margin-top:10px}
.idea .rangebox{margin-top:8px}
/* My strategies */
.idea-trend{margin:14px 0 6px;line-height:1.65}
.idea-trend .chip{margin-right:4px;vertical-align:1px}
.sg-box{border:1px dashed color-mix(in srgb, var(--signal) 45%, var(--rule));border-radius:12px;padding:10px 12px;margin:12px 0 6px;background:color-mix(in srgb, var(--signal-wash) 45%, transparent)}
.sg-h{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px}
.strat-c.sg{border-top:1px solid var(--rule)}
.strat-c.editing textarea,.sg-in{display:block;width:100%;margin:6px 0;font:16px/1.45 var(--sans);padding:9px 11px;border-radius:9px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);resize:vertical;-webkit-user-select:text;user-select:text}
.sg-tk{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 2px}
.sg-tk .chip{background:var(--paper);box-shadow:inset 0 0 0 1px var(--rule);color:var(--ink)}
.sg-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;border-top:1px solid var(--rule);padding-top:10px;margin-top:6px}
.sg-every{display:flex;align-items:center;gap:8px;font-size:calc(13px * var(--ts));color:var(--muted);font-weight:600}

.strat{background:var(--sheet);border:1px solid var(--rule);border-left:4px solid var(--amber);border-radius:12px;padding:var(--pad);margin:10px 0 16px}
.strat-c{border-top:1px solid var(--rule);padding:10px 0 4px}
.strat-c.retired{opacity:.7}
.strat-t{font-size:calc(var(--d) * var(--ts));line-height:1.5;margin:0 0 2px;font-weight:600}
.strat-ai{font-size:calc(14px * var(--ts));line-height:1.5;color:var(--ink-2);margin:8px 0 2px}
.strat-add{border-top:1px solid var(--rule);padding-top:10px;margin-top:6px}
.strat-add textarea{display:block;width:100%;margin-top:6px;font:16px/1.45 var(--sans);padding:9px 11px;border-radius:9px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);resize:vertical;-webkit-user-select:text;user-select:text}
.strat-ret{margin-top:10px} .strat-ret summary{font-weight:700;color:var(--signal);font-size:calc(14px * var(--ts))}
.serves{font-size:calc(13.5px * var(--ts));color:var(--amber);font-weight:600;margin:4px 0 8px}
.booting{display:flex;align-items:center;justify-content:center;gap:10px;padding:80px 20px;color:var(--muted);font-size:calc(14px * var(--ts))}
.booting.note{flex-direction:column;text-align:center;color:var(--ink-2);padding:60px 24px}
.booting.note b{font-size:calc(18px * var(--ts));color:var(--ink)}
.booting.note pre,.startlog{max-width:100%;overflow:auto;text-align:left;font:12px/1.45 ui-monospace,Menlo,monospace;background:var(--sheet);border:1px solid var(--rule);border-radius:10px;padding:10px;color:var(--ink-2);white-space:pre-wrap;-webkit-user-select:text;user-select:text}
.startlog{margin:8px 0;max-height:260px}
.busy-dot{width:15px;height:15px;flex:none;border-radius:50%;border:2px solid var(--rule);border-top-color:var(--signal);animation:bdspin .8s linear infinite}
@keyframes bdspin{to{transform:rotate(360deg)}}
/* Read aloud (as in BlogPulse) */
.ico{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vertical-align:-3px;margin-right:5px;flex:none}
.ico path:first-child{fill:currentColor;stroke:none}
.sm .ico{width:15px;height:15px}
.sm{display:inline-flex;align-items:center}
.listen{display:inline-flex;align-items:center;padding:9px 14px;border-radius:20px;background:var(--signal-wash);color:var(--signal);border:1.5px solid var(--signal);font-weight:700;font-size:calc(14.5px * var(--ts))}
.voicesel{display:block;width:100%;margin-top:8px;font:16px var(--sans);color:var(--ink);background:var(--paper);border:1px solid var(--rule);border-radius:9px;padding:9px 10px}
.cfgin.wide{display:block;width:100%;margin-top:8px;font:16px/1.45 var(--sans);padding:9px 11px;border-radius:9px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);-webkit-user-select:text;user-select:text}
#player{position:fixed;left:10px;right:10px;bottom:calc(env(safe-area-inset-bottom) + 10px);z-index:30;display:flex;align-items:center;gap:8px;padding:10px 10px 10px 14px;border-radius:16px;background:var(--ink);color:var(--paper);box-shadow:0 8px 28px rgba(0,0,0,.28)}
#player[hidden]{display:none}
.pl-info{flex:1;min-width:0}
.pl-info b,.pl-info small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pl-info b{font-size:14.5px}
.pl-info small{font-size:12px;opacity:.75}
.pl-btn{width:40px;height:40px;border-radius:20px;display:grid;place-items:center;flex:none;background:rgba(127,127,127,.22)}
.pl-btn svg{width:20px;height:20px;fill:currentColor}
.eq{display:flex;align-items:flex-end;gap:2px;height:16px;flex:none}
.eq i{width:3px;height:100%;background:currentColor;border-radius:2px;animation:eq 1s ease-in-out infinite}
.eq i:nth-child(2){animation-delay:-.35s}.eq i:nth-child(3){animation-delay:-.7s}
#player.paused .eq i{animation:none;height:40%}
@keyframes eq{0%,100%{height:30%}50%{height:100%}}
body.playing #main{padding-bottom:96px}
body.playing #toast{bottom:calc(env(safe-area-inset-bottom) + 84px)}
@media (prefers-reduced-motion:reduce){
  .eq i{animation:none;height:60%} .busy-dot{animation-duration:2.4s}
  .splash *{animation:none!important;opacity:1!important;transform:none!important;stroke-dashoffset:0!important}
  .splash{animation:spOut .3s ease 1.6s forwards!important}
  .sheet,#aisheet,#toast,.switch,.switch::after{transition:none}
  #top.busy .rf svg{animation:none}
}
`;

// Stockit logo (a price line climbing to an emerald dot, a blue average line under it), drawn on its dark tile
const LOGO_SVG = '<path d="M58 62 V182 H190" fill="none" stroke="#F6F7F9" stroke-opacity="0.35" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M74 150 L104 116 L130 136 L170 88" fill="none" stroke="#F6F7F9" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><circle cx="170" cy="88" r="14" fill="#34D399"/><circle cx="175" cy="83" r="4.5" fill="#F6F7F9"/><path d="M78 164 H148" fill="none" stroke="#60A5FA" stroke-width="7" stroke-linecap="round"/>';
const REFRESH_SVG = `<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>`;
const ADD_SVG = `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`;
const SETTINGS_SVG = `<svg viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>`;
const THEME_IDS = ["ink", "sepia", "mint", "contrast", "slate", "night"];
const initTheme = THEME_IDS.includes(settings.theme) ? settings.theme : (Device.isUsingDarkAppearance() ? "night" : "ink");

const buildHTML = () => `<!doctype html><html data-theme="${initTheme}" data-font="${settings.font === "serif" ? "serif" : "sans"}" style="--ts:${+settings.textSize || 1}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<style>${CSS}</style></head><body class="d-${["compact", "tiny"].includes(settings.density) ? settings.density : "comfortable"}">
<div class="splash" id="splash" role="img" aria-label="Stockit. Track. Read. Decide.">
  <div class="spIcon"><svg viewBox="0 0 240 240" aria-hidden="true">
    <path class="spFrame" d="M58 62 V182 H190"></path>
    <path class="spDraw" pathLength="100" d="M74 150 L104 116 L130 136 L170 88"></path>
    <circle class="spPop" cx="170" cy="88" r="14"></circle>
    <circle class="spDetail" cx="175" cy="83" r="4.5"></circle>
    <path class="spSweep" d="M78 164 H148"></path>
  </svg></div>
  <div class="spWord">Stock<span>it</span></div>
  <div class="spTag">Track. Read. Decide.</div>
</div>
<header id="top">
  <div class="tb"><div><h1 class="brand"><svg class="brand-mark" viewBox="0 0 240 240" aria-hidden="true">${LOGO_SVG}</svg><span>Stock<span class="x">it</span></span></h1><div class="st-row"><div id="status" class="status"></div><button id="privbtn" class="privbtn" data-act="privacy" aria-pressed="false" aria-label="Hide your amounts"></button></div></div>
    <div class="tb-a"><button class="icon" data-act="cfgopen" aria-label="Settings">${SETTINGS_SVG}</button>
    <button class="icon" data-act="addopen" aria-label="Add stocks">${ADD_SVG}</button>
    <button class="icon rf" data-act="refresh" aria-label="Refresh prices and news">${REFRESH_SVG}</button></div></div>
  <nav id="tabs" class="tabs" aria-label="Lists"></nav>
</header>
<main id="main"><div class="booting" role="status"><span class="busy-dot"></span>Loading your stocks…</div></main>
<p class="ver">Stockit v${VERSION}</p>
<div id="detail" class="sheet" aria-label="Stock"></div>
<div id="addsheet" class="sheet" aria-label="Add stocks"></div>
<div id="cfgsheet" class="sheet" aria-label="Settings"></div>
<div id="aisheet" class="sheet" aria-label="AI settings"></div>
<div id="newssheet" class="sheet" aria-label="TL;DR"></div>
<div id="checksheet" class="sheet" aria-label="Check my portfolio"></div>
<div id="player" hidden role="region" aria-label="Reading aloud">
  <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
  <div class="pl-info"><b id="plTitle"></b><small id="plSub"></small></div>
  <button id="plPause" class="pl-btn" data-act="plpause" aria-label="Pause"></button>
  <button class="pl-btn" data-act="plnext" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M6 5l9 7-9 7zM16 5h3v14h-3z"/></svg></button>
  <button class="pl-btn" data-act="plstop" aria-label="Stop"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg></button>
</div>
<div id="toast" role="status"></div>
<script>
// Launch screen (app-blueprints · launch-screen 1.0.0): first, self-contained
(function () {
  var sp = document.getElementById("splash");
  if (!sp) return;
  function gone() { sp.classList.add("gone"); sp.setAttribute("aria-hidden", "true"); }
  sp.addEventListener("click", gone);   // tap to skip
  setTimeout(gone, 2900);               // out of the page once the CSS fade is done
})();
window.__LOGO = ${safeJSON(LOGO_SVG)};
// The page goes on screen first; Scriptable hands over the data once it has read it (as in BlogPulse 1.9.2).
window.__parts = [];
window.__bootNote = function (title, detail) {
  var b = document.querySelector(".booting"); if (!b) return;
  b.className = "booting note";
  b.innerHTML = "<b></b><span></span>" + (detail ? "<pre></pre>" : "");
  b.querySelector("b").textContent = title;
  b.querySelector("span").textContent = "Close Stockit and open it again. If it keeps happening, run the installer once more.";
  if (detail) b.querySelector("pre").textContent = detail;
};
setTimeout(function () { if (!window.__booted) window.__bootNote("Still loading…"); }, 25000);
document.addEventListener("visibilitychange", function () {   // coming back into view: redraw
  if (document.visibilityState !== "visible") return;
  var d = document.documentElement; d.style.transform = "translateZ(0)"; void d.offsetHeight; d.style.transform = "";
});
window.__boot = function (st) {
  if (window.__booted) return;
  if (!st.stocks || !st.stocks.length) st.stocks = [].concat.apply([], window.__parts);
  window.__parts = [];
  window.__booted = true; window.__INIT = st;
  requestAnimationFrame(function () {   // make WebKit draw again once the stocks are in (helps if the window came up blank)
    var d = document.documentElement; d.style.transform = "translateZ(0)"; void d.offsetHeight;
    requestAnimationFrame(function () { d.style.transform = ""; });
  });
  (${clientApp.toString()})();
};</script>
</body></html>`;

// ---------- home-screen widget: Stockit's content for the shared frame below ----------
// The snapshot the widget reads (saveWidget): the day's move, biggest movers, the ✦ briefing headline, and the
// portfolio value only when "Show portfolio value in the widget" is on. Saved after refreshes, edits and new AI text.
function widgetSnapshot(pricesAt) {
  const tot = totals()[0] || null;
  const rows = stocks.map(x => {
    const m = market[x.s] || {}, sg = sigFor(x.s);
    return { s: x.s, own: x.list === "own", chg: dayPct(m), price: m.price, cur: m.cur || "", sig: sg ? sg.signal : "" };
  }).filter(r => r.chg != null);
  const own = rows.filter(r => r.own), base = own.length ? own : rows;
  const avg = base.length ? base.reduce((a, r) => a + r.chg, 0) / base.length : null;
  const b = insights.briefing;
  return {
    n: stocks.length, owned: stocks.filter(x => x.list === "own").length, scope: own.length ? "own" : "watch",
    dayPct: tot && tot.value - tot.day ? tot.day / (tot.value - tot.day) * 100 : avg,
    value: tot && settings.widgetMoney && !settings.privacy ? { v: tot.value, day: tot.day, cur: tot.cur } : null,   // privacy mode hides it here too
    movers: base.slice().sort((a, b2) => Math.abs(b2.chg) - Math.abs(a.chg)).slice(0, 6),
    headline: b && Date.now() - b.at < 48 * 3600e3 ? b.headline : "",
    prices: pricesAt || settings.lastRefresh || 0,
  };
}
const wPct = v => v == null || !isFinite(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(2) + "%";
function wMoney(v, cur, compact) {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: cur || "USD", notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 1 : 2 }).format(v); }
  catch (e) { return v.toFixed(2) + " " + (cur || ""); }
}
// The widget's content (app-blueprints · widgets, Step 7). When the saved prices are older than "widgetPriceAfterMin",
// the widget checks prices itself within "widgetBudget", keeps them in memory and saves only its own snapshot.
// The ✦ line is the briefing headline already written in the app; the widget never calls AI.
async function widgetModel(param, family) {
  let d = readWidget();
  if (stocks.length && (!d || Date.now() - (d.prices || 0) > cfg("widgetPriceAfterMin") * 60e3)) {
    const done = await Promise.race([
      pool(stocks.map(x => x.s), cfg("concurrency"), s => quickPrice(s)).then(() => true, () => false),
      new Promise(r => Timer.schedule(cfg("widgetBudget") * 1000, false, () => r(false))),
    ]);
    if (done) { d = widgetSnapshot(Date.now()); saveWidget(d); }
  }
  if (!d) d = widgetSnapshot();   // no snapshot yet: from Stockit's own files, read only
  if (!d.n) return { empty: "Add your first stock. Tap to open Stockit." };
  const tone = v => v == null ? "muted" : v >= 0 ? "good" : "#F87171";
  const rows = (d.headline && family === "large" ? [{ icon: "✦", text: d.headline, lines: 2 }] : [])
    .concat((d.movers || []).map(r => ({ icon: r.chg >= 0 ? "▲" : "▼", text: `${r.s}  ${wPct(r.chg)}`, tone: tone(r.chg),
      sub: [r.price != null ? (MINOR[r.cur] ? r.price.toFixed(2) + "p" : wMoney(r.price, r.cur)) : "", r.sig ? "✦ " + r.sig[0].toUpperCase() + r.sig.slice(1) : ""].filter(Boolean).join("  ") })));
  const kicker = d.scope === "own" ? "Your portfolio today" : "Your watchlist today";
  const footer = d.prices ? "Prices " + wWhen(d.prices) : "";
  const accessory = { glyph: d.dayPct >= 0 ? "▲" : "▼", inline: `${d.dayPct >= 0 ? "▲" : "▼"} ${wPct(d.dayPct)} today`, value: d.dayPct == null ? "–" : (d.dayPct >= 0 ? "+" : "") + d.dayPct.toFixed(1) };
  if (d.value) {
    return { badge: wPct(d.dayPct), badgeTone: tone(d.dayPct), kicker, value: wMoney(d.value.v, d.value.cur, true),
      caption: `${d.value.day >= 0 ? "+" : "−"}${wMoney(Math.abs(d.value.day), d.value.cur, true)} today`, rows, footer, at: d.prices, accessory };
  }
  return { kicker, value: wPct(d.dayPct), valueTone: tone(d.dayPct), caption: d.scope === "own" ? `${d.owned} owned stock${d.owned === 1 ? "" : "s"}` : `${d.n} on your watchlist`,
    rows, footer, at: d.prices, accessory };
}

// ───────── Widget ─────────
// Shared widget frame (github.com/gadominas/app-blueprints › blueprints/widgets.md).
// An app changes only WIDGET and widgetModel(); everything below WB is the same in every app.
const WIDGET = {
  name: ['Stock', 'it'],                  // as on the launch screen: plain part, highlighted part, optional rest
  accent: '#34D399',                      // the logo's focal colour (the launch screen's --sp-accent)
  icon: REPO_RAW + 'docs/icon-1024.png',  // the app icon, cached on the phone after the first fetch
  words: { open: 'Tap to open', nothing: 'Nothing to show yet.', updated: 'Updated', yesterday: 'yesterday' },   // in the app's language
};
// Brand colours, the same in every app and in light and dark mode: the logo tile's ground and lines.
const WB = { ground: '#0E1116', raised: '#171B22', ink: '#F6F7F9', ink2: '#C9CED6', muted: '#9AA3AE', good: '#2DD4BF', warn: '#FBBF24' };
const wfm = FileManager.local();
const wPath = (n) => wfm.joinPath(wfm.documentsDirectory(), APP_ID + '-' + n);

// What the widget shows is saved by the app and only read by the widget: fast, offline, no sign-in.
function saveWidget(data) {
  try { wfm.writeString(wPath('widget.json'), JSON.stringify(Object.assign({}, data, { at: Date.now() }))); }
  catch (e) { console.log('Widget: not saved: ' + e); }
}
function readWidget() {
  try { const p = wPath('widget.json'); return wfm.fileExists(p) ? JSON.parse(wfm.readString(p)) : null; }
  catch (e) { return null; }
}

// Tones: ink, soft, muted, accent, good, warn, or a hex colour.
const wColor = (c, a = 1) => {
  const k = c === 'soft' ? 'ink2' : c;
  return new Color(k === 'accent' ? WIDGET.accent : (WB[k] || k), a);
};
// Rounded system fonts, falling back to the plain system font on older Scriptable versions.
function wFont(weight, size) {
  const name = { bold: 'boldRoundedSystemFont', semi: 'semiboldRoundedSystemFont', med: 'mediumRoundedSystemFont' }[weight] || 'regularRoundedSystemFont';
  if (typeof Font[name] === 'function') return Font[name](size);
  return weight === 'bold' ? Font.boldSystemFont(size) : weight === 'semi' ? Font.semiboldSystemFont(size) : weight === 'med' ? Font.mediumSystemFont(size) : Font.systemFont(size);
}
function wText(stack, s, size, weight, tone, lines = 1) {
  const t = stack.addText(String(s));
  t.font = wFont(weight, size);
  t.textColor = wColor(tone);
  t.lineLimit = lines;
  if (lines === 1) t.minimumScaleFactor = 0.75;
  return t;
}
function wWhen(ts) {
  const d = new Date(ts), now = new Date(), f = new DateFormatter();
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const ago = Math.round((day(now) - day(d)) / 864e5);
  if (ago === 1) return WIDGET.words.yesterday;
  f.dateFormat = ago === 0 ? 'HH:mm' : 'd MMM';
  return f.string(d);
}

// The app's logo tile, from the repository's icon, cached per app version; a monogram until then.
async function widgetIcon() {
  const p = wPath('widget-icon-' + VERSION + '.png');
  try {
    if (wfm.fileExists(p)) return wfm.readImage(p);
    const r = new Request(WIDGET.icon);
    r.timeoutInterval = 8;
    const dc = new DrawContext();
    dc.size = new Size(96, 96); dc.opaque = false; dc.respectScreenScale = false;
    dc.drawImageInRect(await r.loadImage(), new Rect(0, 0, 96, 96));
    const img = dc.getImage();
    const dir = wfm.documentsDirectory();
    wfm.listContents(dir).filter((f) => f.startsWith(APP_ID + '-widget-icon-')).forEach((f) => { try { wfm.remove(wfm.joinPath(dir, f)); } catch (e) {} });
    wfm.writeImage(p, img);
    return img;
  } catch (e) {
    return widgetMonogram();
  }
}
function widgetMonogram() {
  const dc = new DrawContext();
  dc.size = new Size(96, 96); dc.opaque = false; dc.respectScreenScale = false;
  dc.setFillColor(wColor('raised')); dc.fillRect(new Rect(0, 0, 96, 96));
  dc.setFont(wFont('bold', 54)); dc.setTextColor(wColor('accent')); dc.setTextAlignedCenter();
  dc.drawTextInRect(WIDGET.name.join('').charAt(0), new Rect(0, 14, 96, 70));
  return dc.getImage();
}

// Rows that fit: a line counts 1, a sub line 0.8; medium holds 5.5 (3 rows at most), large 12 (6 at most).
function wFit(rows, budget, max) {
  const out = [];
  let used = 0;
  for (const r of rows || []) {
    const n = (r.lines || 1) + (r.sub ? 0.8 : 0);
    if (out.length >= max || used + n > budget + 1e-9) break;   // 1e-9: 3 + 5 × 1.8 must still fit in 12
    used += n;
    out.push(r);
  }
  return out;
}
function wRows(stack, rows) {
  rows.forEach((r, i) => {
    if (i) stack.addSpacer(5);
    const row = stack.addStack();
    row.topAlignContent(); row.spacing = 6;
    if (r.url) row.url = r.url;
    if (r.icon) { const ic = row.addStack(); ic.size = new Size(15, 0); wText(ic, r.icon, 11.5, 'reg', 'ink'); }
    const tx = row.addStack();
    tx.layoutVertically();
    wText(tx, r.text, 12.5, r.lines ? 'reg' : 'med', r.tone || (r.lines ? 'soft' : 'ink'), r.lines || 1);
    if (r.sub) wText(tx, r.sub, 11, 'reg', 'muted');
  });
}

async function renderWidget(m) {
  const fam = config.widgetFamily || 'medium';
  const w = new ListWidget();
  w.url = m.url || URLScheme.forRunningScript();
  w.refreshAfterDate = new Date(Date.now() + cfg('widgetRefreshMin') * 60e3);
  if (fam.startsWith('accessory')) return renderAccessory(w, fam, m);
  const small = fam === 'small', medium = fam === 'medium', large = !small && !medium;
  const g = new LinearGradient();
  g.colors = [wColor('raised'), wColor('ground')]; g.locations = [0, 1];
  g.startPoint = new Point(0, 0); g.endPoint = new Point(0, 1);
  w.backgroundGradient = g;
  w.setPadding(14, 14, 14, 14);

  // 1. Header: logo tile, name (highlighted part in the accent), badge
  const hd = w.addStack();
  hd.centerAlignContent();
  const icon = hd.addImage(await widgetIcon());
  const is = small ? 18 : 20;
  icon.imageSize = new Size(is, is); icon.cornerRadius = is * 0.225;
  hd.addSpacer(6);
  WIDGET.name.forEach((part, i) => {
    if (!part) return;
    const t = hd.addText(part);
    t.font = wFont('bold', small ? 13 : 14); t.textColor = wColor(i === 1 ? 'accent' : 'ink'); t.lineLimit = 1;
  });
  hd.addSpacer();
  if (m.badge && !small) {
    const b = hd.addStack();
    b.setPadding(2, 7, 2, 7); b.cornerRadius = 8;
    b.backgroundColor = wColor(m.badgeTone || 'accent', 0.16);
    wText(b, m.badge, 11.5, 'semi', m.badgeTone || 'accent');
  }
  w.addSpacer(small ? 8 : 10);

  // Empty state: what to do next, never an error
  if (m.empty) {
    wText(w, m.empty, 13, 'semi', 'soft', 3);
    w.addSpacer();
    wText(w, m.footer || WIDGET.words.open, 11, 'reg', 'muted');
    Script.setWidget(w);
    return;
  }

  // 2. Hero: kicker, then a big value with its caption, or a title with its caption
  const body = w.addStack();
  body.topAlignContent();
  const left = body.addStack();
  left.layoutVertically();
  if (medium) left.size = new Size(136, 0);
  if (m.kicker) wText(left, m.kicker, 11, 'semi', m.kickerTone || 'accent');
  if (m.value != null && m.value !== '') {
    wText(left, m.value, small ? 40 : 42, 'bold', m.valueTone || 'ink');
    if (m.caption) wText(left, m.caption, 13, 'semi', 'ink');
  } else {
    if (m.title) wText(left, m.title, small ? 16 : 18, 'bold', 'ink', 2);
    if (m.caption) { left.addSpacer(2); wText(left, m.caption, 12, 'reg', 'soft', 2); }
  }

  // 3. Rows: beside the hero on medium, under it on large, none on small
  const rows = m.rows || [];
  if (medium && wFit(rows, 5.5, 3).length) {
    body.addSpacer(12);
    const right = body.addStack();
    right.layoutVertically();
    wRows(right, wFit(rows, 5.5, 3));
  }
  body.addSpacer();
  if (large && wFit(rows, 12, 6).length) { w.addSpacer(14); wRows(w, wFit(rows, 12, 6)); }

  // 4. Footer: one muted line; amber when the data is stale. Small shows the badge here if there's no footer.
  w.addSpacer();
  const ft = small ? (m.footer || m.badge) : m.footer;
  if (ft) wText(w, (m.stale ? '⟳ ' : '') + ft, 11, 'reg', m.stale ? 'warn' : 'muted');
  Script.setWidget(w);
}

// Lock Screen: iOS tints these, so text only, no colours or logo.
function renderAccessory(w, fam, m) {
  const name = WIDGET.name.join('');
  const a = m.accessory || {};
  const hasValue = m.value != null && m.value !== '';
  const hero = m.empty || (hasValue ? (m.value + ' ' + (m.caption || '')).trim() : (m.title || ''));
  if (fam === 'accessoryInline') {
    w.addText(a.inline || (hero ? name + ': ' + hero : name));
  } else if (fam === 'accessoryCircular') {
    w.addAccessoryWidgetBackground = true;
    const c = w.addStack();
    c.layoutVertically(); c.centerAlignContent();
    const gl = c.addText(a.glyph || name.charAt(0)); gl.font = Font.systemFont(11); gl.centerAlignText();
    const v = c.addText(String(a.value != null ? a.value : hasValue ? m.value : '–'));
    v.font = wFont('bold', 20); v.minimumScaleFactor = 0.5; v.centerAlignText();
  } else {
    const lines = [
      [[name, m.badge || m.kicker].filter(Boolean).join(' · '), 'semi', 12],
      [hero, 'bold', 15],
      [m.empty ? '' : hasValue ? (m.footer || '') : (m.caption || m.footer || ''), 'reg', 12],
    ];
    lines.forEach(([s, wt, size]) => { if (!s) return; const t = w.addText(s); t.font = wFont(wt, size); t.lineLimit = 1; t.minimumScaleFactor = 0.7; });
  }
  Script.setWidget(w);
}

// Widget runs come here and only here: no WebView, Alert or QuickLook may be built or presented.
async function runWidget() {
  const name = WIDGET.name.join('');
  let m = null;
  try { m = await widgetModel(args.widgetParameter || '', config.widgetFamily || 'medium'); }
  catch (e) { console.error('Widget model: ' + e); }
  if (!m) m = { empty: WIDGET.words.nothing };
  try {
    if (m.at && !m.empty && Date.now() - m.at > cfg('widgetStaleMin') * 60e3) {
      m.stale = true;
      m.footer = WIDGET.words.updated + ' ' + wWhen(m.at);
    }
    await renderWidget(m);
  } catch (e) {
    console.error('Widget render: ' + e);
    const w = new ListWidget();
    w.backgroundColor = wColor('ground');
    w.url = URLScheme.forRunningScript();
    wText(w, name, 14, 'bold', 'ink');
    w.addSpacer(4);
    wText(w, WIDGET.words.open, 12, 'reg', 'muted');
    Script.setWidget(w);
  }
}
// ───────── end of Widget ─────────

// ---------- run ----------
// ---------- run ----------
// A run marks itself as open while its window is on screen. A new run waits at most 1.5 s for an older
// window to close, then opens anyway (as BlogPulse 1.9.1): quick taps on the widget don't stack up copies.
const lockFm = FileManager.local();
const RUN_LOCK = lockFm.joinPath(lockFm.temporaryDirectory(), APP_ID + '-running');
let lockTimer = null;
const lockAge = () => { try { return lockFm.fileExists(RUN_LOCK) ? Date.now() - Number(lockFm.readString(RUN_LOCK)) : Infinity; } catch (e) { return Infinity; } };
const pause = ms => new Promise(r => Timer.schedule(ms, false, r));
async function waitForOtherWindow() { for (let waited = 0; lockAge() < 2500 && waited < 1500; waited += 300) await pause(300); }
function holdLock() {
  const beat = () => { try { lockFm.writeString(RUN_LOCK, String(Date.now())); } catch (e) {} };
  beat(); lockTimer = Timer.schedule(1000, true, beat);
}
function releaseLock() {
  if (lockTimer) { lockTimer.invalidate(); lockTimer = null; }
  try { if (lockFm.fileExists(RUN_LOCK)) lockFm.remove(RUN_LOCK); } catch (e) {}
}
// Talks to the page with a time limit, so a stuck page can't stall the app.
const ev = (js, ms = 20000) => Promise.race([wv.evaluateJavaScript(js, false), pause(ms).then(() => { throw new Error("the page didn't respond in " + ms / 1000 + " s"); })]);

async function bootApp(isClosed) {
  const t0 = Date.now();
  startLog(`Stockit ${VERSION}: reading data`);
  await loadData();
  startLog(`data read in ${((Date.now() - t0) / 1000).toFixed(1)} s: ${stocks.length} stocks${loadIssues.length ? "; missing: " + loadIssues.join(", ") : ""}`);
  if (isClosed()) return;
  const st = clientState(), list = st.stocks;
  st.stocks = [];
  for (let i = 0; i < list.length; i += 6) await ev(`window.__parts.push(${safeJSON(list.slice(i, i + 6))})`);   // in pieces: one huge message can stall WebKit
  await ev(`window.__boot(${safeJSON(st)})`);
  let seen = "";
  try { seen = await ev(`document.visibilityState + ", " + innerWidth + "x" + innerHeight`, 5000); } catch (e) { seen = String(e.message || e); }
  startLog(`screen ready in ${((Date.now() - t0) / 1000).toFixed(1)} s (page: ${seen})`);
  if (loadIssues.length) toast("Some of your data is still coming from iCloud. Nothing will be saved until you reopen Stockit.");
  // Deferred work, once the first screen is drawn: prices and news, then updates, then the widget's icon.
  Timer.schedule(700, false, () => {
    if (isClosed() || !dataLoaded) return;
    if (stocks.length && settings.refreshOnOpen !== false && Date.now() - (settings.lastRefresh || 0) > cfg("pricesFreshMin") * 60e3)
      runRefresh(false).catch(e => toast(String(e.message || e)));
    else if (settings.ai && aiKey() && briefingDue()) runBriefing(false).then(() => runStratSuggest(false));
    else runStratSuggest(false);
  });
  Timer.schedule(3500, false, () => {
    if (isClosed() || updateChecked) return;
    updateChecked = true;
    checkForUpdate().then(u => { pendingUpdate = u; offerUpdate(); });
  });
  Timer.schedule(6000, false, () => { widgetIcon(); });
}

async function main() {
  await waitForOtherWindow();
  buildWebView();
  // A page built before its window is on screen can stay blank on some iPhones (the page runs, nothing is drawn),
  // most often when opened from the widget. So: an empty dark window first, then the real page built inside it.
  await wv.loadHTML('<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#0E1116"></body></html>');
  const presented = wv.present(true);
  holdLock();
  await pause(300);                          // let the window finish appearing
  startLog("window on screen");
  await Promise.race([wv.loadHTML(buildHTML()), pause(15000)]);   // the launch screen, drawn on screen
  let closed = false;
  presented.then(() => { closed = true; releaseLock(); });
  bootApp(() => closed).catch(e => {         // runs beside the window: closing it never waits on this
    startLog("start-up failed: " + (e.message || e));
    let log = "";
    try { log = FileManager.local().readString(LOG_PATH).split("\n").slice(-12).join("\n"); } catch (x) {}
    if (!closed) wv.evaluateJavaScript(`window.__bootNote("Stockit couldn't open", ${safeJSON(log)})`, false).catch(() => {});
  });
  await presented;
  closed = true;
  releaseLock();
  saveAll();                                 // write() skips data that was never read
  if (dataLoaded) saveWidget(widgetSnapshot());
}

// Settings are loaded at the top of the script (load("settings")), before every branch; data is read in each branch.
if (config.runsInWidget || config.runsInAccessoryWidget) {
  await loadData();
  await runWidget();             // never builds or presents a WebView, Alert or QuickLook
} else {
  await main();
}
Script.complete();
