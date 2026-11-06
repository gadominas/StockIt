// Stockit test harness: runs the real Stockit.js in Node with the Scriptable APIs stubbed (see docs/TESTING.md)
// Runs Stockit.js with mocked Scriptable APIs. The page runs in jsdom; its stockit:// navigations reach shouldAllowRequest.
const fs = require("fs");
const { JSDOM } = require("jsdom");
const SRC = fs.readFileSync(process.env.STOCKIT_SCRIPT || require("path").join(__dirname, "..", "Stockit.js"), "utf8");

const NEWS = {
  AAPL: { yahoo: [["Apple readies iPhone sales update ahead of next week's results", "Reuters", 2], ["Services revenue on track for another record quarter, analysts say", "Bloomberg", 9]], web: [["Why Apple's China sales matter more than ever", "Financial Times", 5], ["Apple expands Vision lineup with a lighter headset", "The Verge", 20]] },
  NVDA: { yahoo: [["Cloud giants lift spending plans as AI demand holds up", "Reuters", 1], ["Nvidia's next-generation chips enter volume production", "Bloomberg", 6], ["US weighs new limits on AI chip exports", "Reuters", 26]], web: [["Data-centre orders run ahead of plan, suppliers say", "Financial Times", 3], ["How long can the AI chip boom last?", "The Economist", 30]] },
  MSFT: { yahoo: [["Microsoft slips as investors weigh rising AI spending", "Reuters", 3], ["Azure growth expected to stay above 30%", "Bloomberg", 12]], web: [["Copilot adoption: what businesses are actually paying for", "WSJ", 8]] },
  KO: { yahoo: [["Coca-Cola raises full-year outlook on pricing", "Reuters", 4], ["Consumer staples draw buyers as markets wobble", "Barron's", 14]], web: [["Inside Coca-Cola's zero-sugar push", "Bloomberg", 22]] },
  ASML: { yahoo: [["ASML falls as chipmakers delay equipment orders", "Reuters", 2], ["China sales expected to slow next year", "Bloomberg", 10]], web: [["Europe's chip champion faces a flat 2027", "Financial Times", 6]] },
};
const FUND = {
  AAPL: { trailingPE: 31.2, forwardPE: 27.9, marketCap: 3.35e12, trailingAnnualDividendYield: 0.0044, epsTrailingTwelveMonths: 6.9, averageAnalystRating: "2.0 - Buy" },
  NVDA: { trailingPE: 46.8, forwardPE: 25.1, marketCap: 3.52e12, trailingAnnualDividendYield: 0.0003, epsTrailingTwelveMonths: 3.07, averageAnalystRating: "1.4 - Strong Buy" },
  MSFT: { trailingPE: 35.6, forwardPE: 30.2, marketCap: 3.1e12, trailingAnnualDividendYield: 0.0076, epsTrailingTwelveMonths: 12.4, averageAnalystRating: "1.6 - Buy" },
  KO:   { trailingPE: 24.1, forwardPE: 21.9, marketCap: 2.57e11, trailingAnnualDividendYield: 0.0312, epsTrailingTwelveMonths: 2.47, averageAnalystRating: "2.1 - Buy" },
  ASML: { trailingPE: 33.5, forwardPE: 28.4, marketCap: 2.78e11, trailingAnnualDividendYield: 0.009, epsTrailingTwelveMonths: 21.1, averageAnalystRating: "2.2 - Buy" },
};
const PROF = {
  AAPL: ["Technology", "Consumer Electronics", "Designs and sells iPhone, Mac, iPad and wearables, and runs a growing services business with the App Store, iCloud and Apple Music.", 236, 41, "buy", 0.24, 0.06, 1.24],
  NVDA: ["Technology", "Semiconductors", "Designs graphics processors and AI accelerators used in data centres, gaming PCs, cars and robotics, together with the software that runs on them.", 168, 58, "strong_buy", 0.55, 0.94, 1.66],
  MSFT: ["Technology", "Software - Infrastructure", "Makes Windows and Office, runs the Azure cloud and LinkedIn, and builds Xbox games and devices.", 495, 52, "buy", 0.36, 0.15, 0.9],
  KO:   ["Consumer Defensive", "Beverages - Non-Alcoholic", "Makes and sells soft drinks, water, juice, coffee and tea under brands such as Coca-Cola, Sprite and Costa in more than 200 countries.", 74, 24, "buy", 0.23, 0.03, 0.6],
  ASML: ["Technology", "Semiconductor Equipment & Materials", "Builds the lithography machines that chip makers use to print the smallest circuits, including the only extreme-ultraviolet systems in production.", 915, 30, "buy", 0.27, 0.08, 1.15],
};
function makeEnv(opts = {}) {
  const files = opts.files || {};
  const kc = opts.kc || {};
  const log = { requests: [], shares: [], opened: [], widgets: [], toasts: [], alerts: [], aiBodies: [] };
  const fmObj = {
    temporaryDirectory: () => "/tmp", documentsDirectory: () => "/docs",
    joinPath: (a, b) => a + "/" + b,
    fileExists: p => p in files || Object.keys(files).some(k => k.startsWith(p + "/")) || p === "/docs/Stockit",
    createDirectory: () => {},
    readString: p => { if (!(p in files)) throw new Error("nofile " + p); return files[p]; },
    writeString: (p, s) => { files[p] = s; },
    isFileStoredIniCloud: p => !!(opts.slowCloud && p.endsWith(opts.slowCloud)), isFileDownloaded: p => !(opts.slowCloud && p.endsWith(opts.slowCloud)), downloadFileFromiCloud: p => opts.slowCloud && p.endsWith(opts.slowCloud) ? new Promise(() => {}) : Promise.resolve(),
    readImage: p => ({ size: { width: 96, height: 96 } }), writeImage: (p) => { files[p] = "IMG"; },
    listContents: d => Object.keys(files).filter(k => k.startsWith(d + "/")).map(k => k.slice(d.length + 1)),
    remove: p => { delete files[p]; },
  };
  const day = Math.floor(Date.now() / 864e5);
  const series = (sym, n) => { const base = { AAPL: 180, MSFT: 400, NVDA: 120, ASML: 700 }[sym] || 50; return Array.from({ length: n }, (_, i) => [(day - n + 1 + i) * 86400 + 72000, base * (0.8 + 0.4 * i / n) + Math.sin(i / 5) * 3]); };
  const KNOWN = ["AAPL", "MSFT", "NVDA", "ASML", "KO", "JNJ", "VWCE.DE", "HSBA.L", "FTS.TO"];
  function route(url, req) {
    log.requests.push(url);
    const u = new URL(url);
    if (u.pathname.startsWith("/v8/finance/chart/")) {
      const sym = decodeURIComponent(u.pathname.split("/").pop());
      if (/^\^|=F$/.test(sym)) {   // indices and futures for the market's mood
        log.gauges = (log.gauges || []).concat(sym);
        const base = { "^GSPC": 6800, "^IXIC": 23000, "^STOXX50E": 5600, "^GDAXI": 24000, "^VIX": 19, "^TNX": 4.1, "CL=F": 62, "GC=F": 4000 }[sym] || 100;
        const now = Math.floor(Date.now() / 1000), ts = [], cl = [];
        for (let i = 64; i >= 0; i--) { ts.push(now - i * 86400); cl.push(+(base * (1 + 0.0015 * (32 - i) / 10 + 0.01 * Math.sin(i / 4))).toFixed(2)); }
        return [200, JSON.stringify({ chart: { result: [{ meta: { symbol: sym, currency: "USD", regularMarketPrice: cl[cl.length - 1], previousClose: cl[cl.length - 2], regularMarketTime: now }, timestamp: ts, indicators: { quote: [{ close: cl }] } }], error: null } })];
      }
      if (/^[A-Z]{6}=X$/.test(sym)) {   // exchange rates
        const R = { CADEUR: 0.638, EURCAD: 1.567, CADUSD: 0.73, USDCAD: 1.37, USDEUR: 0.92, GBPEUR: 1.17, EURUSD: 1.087, GBPUSD: 1.27, USDGBP: 0.787, EURGBP: 0.855, USDCHF: 0.88, EURCHF: 0.957 }[sym.slice(0, 6)] || 1.1;
        log.fx = (log.fx || []).concat(sym);
        return [200, JSON.stringify({ chart: { result: [{ meta: { symbol: sym, currency: sym.slice(3, 6), regularMarketPrice: R, previousClose: R * 1.004, regularMarketTime: Math.floor(Date.now() / 1000) }, timestamp: [Math.floor(Date.now() / 1000)], indicators: { quote: [{ close: [R] }] } }], error: null } })];
      }
      if (!KNOWN.includes(sym)) return [404, JSON.stringify({ chart: { result: null, error: { code: "Not Found", description: "No data found, symbol may be delisted" } } })];
      const n = u.searchParams.get("range") === "5d" ? 5 : u.searchParams.get("range") === "1mo" ? 22 : u.searchParams.get("range") === "5y" ? 260 : 252;
      const pts = series(sym, n); const nudge = { MSFT: 0.986, ASML: 0.978, KO: 1.006, AAPL: 0.997 }[sym]; if (nudge) pts[n - 1][1] *= nudge;
      return [200, JSON.stringify({ chart: { result: [{ meta: { symbol: sym, currency: sym.endsWith(".DE") ? "EUR" : sym.endsWith(".L") ? "GBp" : sym.endsWith(".TO") ? "CAD" : "USD", longName: ({ AAPL: "Apple Inc.", MSFT: "Microsoft Corporation", NVDA: "NVIDIA Corporation", ASML: "ASML Holding N.V.", KO: "The Coca-Cola Company", JNJ: "Johnson & Johnson", "VWCE.DE": "Vanguard FTSE All-World" })[sym] || sym, fullExchangeName: "NasdaqGS", regularMarketPrice: pts[n - 1][1], regularMarketTime: pts[n - 1][0], fiftyTwoWeekHigh: Math.max(...pts.map(p => p[1])) * 1.04, fiftyTwoWeekLow: Math.min(...pts.map(p => p[1])) * 0.95, instrumentType: "EQUITY" },
        timestamp: pts.map(p => p[0]), indicators: { quote: [{ close: pts.map(p => p[1]) }] } }], error: null } })];
    }
    if (u.hostname === "fc.yahoo.com") return [404, "", [{ name: "A3", value: "abc" }]];
    if (u.pathname === "/v1/test/getcrumb") return [200, "cRuMb123"];
    if (u.pathname === "/v7/finance/quote") return [200, JSON.stringify({ quoteResponse: { result: u.searchParams.get("symbols").split(",").map(s => Object.assign({ symbol: s }, FUND[s] || FUND.AAPL)) } })];
    if (u.pathname.startsWith("/v10/finance/quoteSummary/")) { const s = decodeURIComponent(u.pathname.split("/").pop()); const P = PROF[s] || PROF.AAPL; return [200, JSON.stringify({ quoteSummary: { result: [{ assetProfile: { sector: P[0], industry: P[1], longBusinessSummary: P[2], website: "https://example.com" },
      financialData: { targetMeanPrice: { raw: P[3] }, numberOfAnalystOpinions: { raw: P[4] }, recommendationKey: P[5], profitMargins: { raw: P[6] }, revenueGrowth: { raw: P[7] } }, summaryDetail: { beta: { raw: P[8] }, dividendYield: { raw: (FUND[s] || FUND.AAPL).trailingAnnualDividendYield } }, defaultKeyStatistics: {} }] } })]; }
    if (u.pathname === "/v1/finance/search") {
      if (+u.searchParams.get("newsCount") > 0 && /\s/.test(u.searchParams.get("q"))) { log.titleSearch = (log.titleSearch || []).concat(u.searchParams.get("q")); return [200, JSON.stringify({ news: [{ title: u.searchParams.get("q"), publisher: "Simply Wall St.", link: "https://finance.yahoo.com/news/nvda-2", providerPublishTime: Math.floor(Date.now() / 1000) - 3600 }] })]; }
      if (+u.searchParams.get("newsCount") > 0) { const q = u.searchParams.get("q"); return [200, JSON.stringify({ news: (NEWS[q] || NEWS.AAPL).yahoo.map(([t, pb, h], k) => ({ title: t, publisher: pb, link: "https://finance.yahoo.com/news/" + q.toLowerCase() + "-" + k, providerPublishTime: Math.floor(Date.now() / 1000) - h * 3600, relatedTickers: [q] })) })]; }
      const q = u.searchParams.get("q").toLowerCase();
      return [200, JSON.stringify({ quotes: q.includes("apple") ? [{ symbol: "AAPL", longname: "Apple Inc.", exchDisp: "NASDAQ", quoteType: "EQUITY", typeDisp: "Equity" }] : q.includes("coca") ? [{ symbol: "KO", shortname: "Coca-Cola", exchDisp: "NYSE", quoteType: "EQUITY" }] : [] })];
    }
    if (u.hostname === "news.google.com" && u.pathname.startsWith("/rss/search")) { const q = u.searchParams.get("q"); const sym = Object.keys(NEWS).find(k => q.includes(k)) || "AAPL";
      return [200, "<rss><channel>" + NEWS[sym].web.map(([t, pb, h], k) => `<item><title>${t} - ${pb}</title><link>https://news.google.com/rss/articles/${sym}${k}</link><pubDate>${new Date(Date.now() - h * 3600e3).toUTCString()}</pubDate><source url="https://example.com">${pb}</source></item>`).join("") + "</channel></rss>"]; }
    if (u.hostname === "api.stocktwits.com") return [200, JSON.stringify({ messages: Array.from({ length: 30 }, (_, i) => ({ entities: { sentiment: i % 3 ? { basic: "Bullish" } : i % 2 ? { basic: "Bearish" } : null } })) })];
    if (u.pathname.startsWith("/v1/finance/trending")) return [200, JSON.stringify({ finance: { result: [{ quotes: [{ symbol: "KO" }, { symbol: "JNJ" }] }] } })];
    if (u.pathname.startsWith("/v1/finance/screener")) return [200, JSON.stringify({ finance: { result: [{ quotes: [{ symbol: "JNJ", shortName: "J&J", trailingPE: 15, regularMarketChangePercent: 0.4 }] }] } })];
    if (u.hostname === "finnhub.io") return [200, JSON.stringify({ metric: { peTTM: 30, marketCapitalization: 3000000, beta: 1.1 } })];
    if (u.hostname === "api.anthropic.com" && u.pathname === "/v1/models") return [200, JSON.stringify({ data: [{ id: "claude-haiku-5-5", display_name: "Claude Haiku 5.5", created_at: "2026-06-01" }, { id: "claude-sonnet-5-5", display_name: "Claude Sonnet 5.5", created_at: "2026-06-02" }] })];
    if (u.hostname === "api.anthropic.com") {
      const b = JSON.parse(req.body); log.aiBodies.push(b);
      if (!b.max_tokens) throw new Error("Claude request without max_tokens");
      const txt = JSON.stringify(b.messages);
      let out = "OK";
      if (opts.checkPositions && (txt.includes("screenshots show one investment portfolio") || txt.includes("screenshot show one investment portfolio"))) { log.checkPrompt = txt; out = JSON.stringify({ broker: "Swedbank", positions: opts.checkPositions() }); }
      else if (txt.includes("screenshots show one investment portfolio") || txt.includes("screenshot show one investment portfolio")) { log.checkBody = b;
        out = JSON.stringify({ broker: "Swedbank", total: "12.345,67", totalCurrency: "EUR", positions: [
          { symbol: "NVDA", name: "NVIDIA Corp", shares: 30, avgPrice: 96, price: 143.61, value: 4308.3, currency: "USD" },
          { symbol: "AAPL", name: "Apple Inc", shares: "15", avgPrice: "160,00", price: 215.5, currency: "USD" },
          { symbol: "MSFT", name: "Microsoft", shares: 4, avgPrice: 410, price: 200, currency: "USD" },
          { symbol: null, name: "Coca-Cola Co", shares: 10, avgPrice: 50.6, price: 55.2, currency: "EUR" },
          { symbol: "JNJ", name: "Johnson & Johnson", shares: 5, avgPrice: 150, price: 56.5, currency: "USD" },
          { symbol: "ZZZQ", name: "Unknown Holdings", shares: 3, avgPrice: 10, price: 11, currency: "USD" } ] }); }
      else if (b.system && b.system.includes("news presenter in a stock app")) { log.digestPrompt = txt; out = JSON.stringify({ title: "Chips ship on time as cloud spending climbs", story: "NVIDIA has started mass-producing its next chips, Bloomberg reports, right on the schedule it promised.\n\nReuters adds that the big cloud companies have raised their spending plans again, which is where most of those chips go.\n\nThe Financial Times says suppliers see orders running ahead of plan.", takeaway: "Steady demand supports the outlook, but a slowdown in cloud spending would hurt." }); }
      else if (b.system && b.system.includes("TL;DRs of financial news")) out = JSON.stringify({ story: "Demand held up better than expected.\n\nThe company prepares for a busy quarter.", tldr: "Demand is holding up and the company heads into its results with momentum.", points: ["Revenue from the main business keeps growing at a steady pace", "Costs stayed under control in the last period", "Competition and regulation are the main worries"], why: "Steady demand supports the share price, but next quarter's outlook will decide the next move." });
      else if (txt.includes("today's briefing")) {
        const syms = [...txt.matchAll(/### ([A-Z.]+) —/g)].map(m => m[1]);
        out = "```json\n" + JSON.stringify({ portfolio: { headline: "Tech carries the day", story: "Para one about <b>Apple</b> [1].\n\nPara two.\n\nPara three.", mood: "positive", watch: ["Earnings next week"] },
          stocks: Object.fromEntries(syms.map((s, i) => [s, { signal: ["buy", "hold", "sell"][i % 3], confidence: "medium", line: s + " line <script>", story: s + " story." }])) }) + "\n```";
      } else if (txt.includes("story of this stock")) out = JSON.stringify({ headline: "Strong quarter", story: "What it does [1].\n\nNow [2, 3].", signal: "Buy", confidence: "high", reasons: ["r1"], risks: ["k1"], watch: ["w1"] });
      else if (txt.includes("Write a portfolio assessment for this investor")) { log.assessPrompt = txt;
        out = JSON.stringify({ score: 64, headline: "Solid core, too much riding on chips", summary: "Your portfolio is up 5% since you bought, led by NVIDIA, but NVIDIA alone is 38% of it and tech is 75%. The market is calm, so this is a good time to rebalance gently.",
          market: { mood: "risk-on", text: "US and European indices rose about 3% this month and the VIX is low at 19, so investors are relaxed." },
          areas: [{ name: "Diversification", rating: "weak", text: "NVDA is 38% and tech 75% of the portfolio." }, { name: "Risk", rating: "fair", text: "A beta around 1.4 means bigger swings than the market." }, { name: "Fit with your plans", rating: "fair", text: "Your pharma strategy isn't started yet: no healthcare stocks owned." }],
          world: [{ theme: "US chip export limits to China", effect: "Could hit NVDA and ASML orders; watch next quarter's guidance." }, { theme: "Oil near $62", effect: "Lower energy costs help consumer names; nothing you own depends on oil." }],
          risks: ["One stock drives most of your result", "Tech valuations are high"], upside: ["AI spending keeps NVDA's orders strong", "VWCE spreads your money worldwide"],
          watchlist: [{ s: "KO", verdict: "add", why: "A steady dividend payer that balances your tech." }, { s: "ASML", verdict: "wait", why: "Export limits weigh on it this year." }],
          actions: [{ title: "Trim NVDA to a quarter of the portfolio", why: "It is 38% now; selling a third locks in part of the 50% gain.", tickers: ["NVDA"], when: "this month" }, { title: "Start your pharma strategy with JNJ", why: "Buy in three parts over three months.", tickers: ["JNJ"], when: "this quarter" }, { title: "Add KO from your watchlist", why: "Its 3% dividend steadies a portfolio that swings with tech.", tickers: ["KO"], when: "now" }] }); }
      else if (txt.includes("new strategies this investor could adopt")) { log.stratPrompt = txt; log.stratCalls = (log.stratCalls || 0) + 1; const gid = (txt.match(/\[(g[a-z0-9]+)\]/) || [])[1];
        out = JSON.stringify({ strategies: [
          { text: "I'll trim NVDA back to a third of my portfolio if it rises another 10%, and put the money into KO.", when: "if NVDA passes $158", why: "NVDA is 49% of the portfolio after a 50% gain.", tickers: ["NVDA", "KO"] },
          { text: "I'll buy JNJ in three equal parts over the next three months.", when: "monthly until January", why: "It's on my watchlist, near the top of its range.", tickers: ["JNJ"] },
          { text: "I'll keep at least a fifth of my money in euros.", when: "review each quarter", why: "Almost everything I own is priced in dollars.", tickers: [] }],
          notes: gid ? [{ id: gid, note: "Nike is 12% below your average price; not yet." }] : [] }); }
      else if (txt.includes("Suggest") && txt.includes("own strategies")) { log.ideasPrompt = txt; const gid = (txt.match(/\[(g[a-z0-9]+)\]/) || [])[1];
        out = JSON.stringify({ ideas: [{ symbol: "JNJ", name: "Johnson & Johnson", why: "A large pharmaceutical company.", fit: "Adds healthcare.", risk: "Litigation.", signal: "buy", serves: gid }, { symbol: "KO", name: "Coca-Cola", why: "Steady.", fit: "Balances tech.", risk: "Slow growth.", signal: "buy", serves: "" }],
          strategies: [{ id: gid, note: "NKE is 12% below your average price, so the sale isn't due yet; large pharma names with AI research partnerships would fit." }], note: "Two ideas." }); }
      else if (txt.includes("Suggest")) out = JSON.stringify({ ideas: [{ symbol: "KO", name: "Coca-Cola", why: "Steady.", fit: "Balances tech.", risk: "Slow growth.", signal: "buy" }, { symbol: "ZZZZ", name: "Fake", why: "x" }, { symbol: "JNJ", name: "Johnson & Johnson", why: "Defensive healthcare.", fit: "Adds a non-tech sector.", risk: "Litigation.", signal: "hold" }, { symbol: "AAPL", name: "Apple" }], note: "Defensive tilt." });
      else if (txt.includes("screenshot")) out = JSON.stringify({ items: [{ symbol: "ASML", name: "ASML", shares: null }, { symbol: "NOPE1", name: "Nope" }] });
      return [200, JSON.stringify({ content: [{ type: "text", text: out }], usage: { input_tokens: 1200, output_tokens: 300 } })];
    }
    if (url.includes("releases.json")) return [200, JSON.stringify(opts.releases || { releases: [{ version: "1.0.0" }] })];
    if (url.endsWith("Stockit.js?") || url.includes("Stockit.js?t=")) return [200, "const VERSION = '1.1.0';\nconst APP_ID = 'stockit';"];
    if (u.hostname === "consent.yahoo.com") { log.consentPosts = (log.consentPosts || []).concat(String(req.body)); return [200, "ok", opts.consentCopy ? [] : [{ name: "A1", value: "consented", domain: ".yahoo.com" }, { name: "GUC", value: "g1", domain: ".yahoo.com" }]]; }
    if (u.hostname === "guce.yahoo.com" && u.pathname === "/copyConsent") { log.copyConsent = (log.copyConsent || 0) + 1; return [200, "ok", opts.consentStuck ? [] : [{ name: "A1", value: "consented", domain: ".yahoo.com" }, { name: "A3", value: "d=x", domain: ".yahoo.com" }]]; }
    if (u.hostname === "api.quiverquant.com" && u.pathname === "/beta/live/insiders") {
      const auth = String((req.headers || {}).Authorization || "");
      log.quiver = (log.quiver || []).concat(u.search);
      if (auth !== "Bearer qk-test") return [401, JSON.stringify({ detail: "Invalid token." })];
      if (opts.quiverPlan === "hobby") return [403, JSON.stringify({ detail: "Upgrade to Trader." })];
      const d = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
      const row = (t, name, title, code, sh, px, days, extra = {}) => Object.assign({ Ticker: t, Name: name, officerTitle: title, TransactionCode: code, Shares: sh, PricePerShare: px, Date: d(days + 2), fileDate: d(days), AcquiredDisposedCode: code === "S" || code === "F" ? "D" : "A", SharesOwnedFollowing: sh * 3, isOfficer: !!title, isDirector: !title, isTenPercentOwner: false }, extra);
      const ALL = [
        row("NVDA", "Huang Jen-Hsun", "Chief Executive Officer", "P", 8000, 150, 5),
        row("NVDA", "Doe Jane", "", "P", 1000, 148, 20),
        row("NVDA", "Stevens Mark", "", "S", 20000, 140, 30),
        row("NVDA", "Kress Colette", "Chief Financial Officer", "F", 3000, 140, 10),
        row("NVDA", "Kress Colette", "Chief Financial Officer", "A", 12000, 0, 10),
        row("NVDA", "Old Buyer", "", "P", 50000, 100, 200),
        row("(NASDAQ:AAPL)", "Cook Timothy", "Chief Executive Officer", "S", 30000, 210, 12),
        row("AAPL", "Maestri Luca", "Chief Financial Officer", "S", 10000, 212, 25),
        row("AAPL", "Adams Kate", "General Counsel", "S", 5000, 215, 40),
        row("PLTR", "Karp Alexander", "Chief Executive Officer", "P", 15000, 140, 2),
        row("OXY", "Berkshire Hathaway Inc", "", "P", 400000, 55, 3, { isTenPercentOwner: true, isDirector: false }),
        row("TINY", "Small Fry", "", "P", 100, 10, 4),
      ];
      const t = u.searchParams.get("ticker");
      return [200, JSON.stringify(t ? ALL.filter(r => r.Ticker.includes(t)) : ALL)];
    }
    if (u.hostname === "r.jina.ai") {
      log.jina = (log.jina || []).concat(url);
      return [200, `Title: Volkswagen Puts New Vehicle Software And AV Data Partnerships To Work\n\nURL Source: ${url.slice(19)}\n\nMarkdown Content:\n[Home](https://www.yahoo.com/) [News](https://www.yahoo.com/news/) [Finance](https://finance.yahoo.com/) [Sports](https://sports.yahoo.com/)\n\n# Volkswagen Puts New Vehicle Software And AV Data Partnerships To Work\n\n- Volkswagen agreed a vehicle electronics partnership with NXP Semiconductors to develop zonal architecture for future models.\n- The group set up an autonomous driving data flywheel involving Porsche, NVIDIA, Microsoft, and Voxel51 to refine software features.\n\nVolkswagen is a €35.0 billion auto manufacturer with a broad footprint in passenger and commercial vehicles across Europe, Germany, North America and the Asia Pacific region, which gives it many driving conditions to learn from.\n\n### How the tech partnerships stress-test the restructuring\n\nThe NXP deal directly supports the plan for lower complexity and a more regionalised cost structure. A zonal architecture shared with Rivian gives Volkswagen one electronic spine to spread across many models, lining up with the goal of trimming the investment plan.\n\nThe data flywheel leans into higher margin digital services but also sharpens execution risk, as analysts highlight labour disputes, pressure in China and interest coverage concerns.\n\nStory Continues\n\n[Add Volkswagen to your Watchlist](https://simplywall.st/x) and get alerts as these catalysts play out.`];
    }
    if (u.hostname === "finance.yahoo.com" && (u.pathname.startsWith("/news/") || u.pathname.includes("/articles/")) && opts.consent && !String((req.headers || {}).Cookie || "").includes("A1=consented"))
      return [200, `<html><body><form method="post" action="https://consent.yahoo.com/v2/collectConsent?sessionId=abc"><input type="hidden" name="csrfToken" value="t1"><input type="hidden" name="sessionId" value="abc"><button type="submit" name="agree" value="agree">Accept all</button></form></body></html>`, [], "https://consent.yahoo.com/v2/collectConsent?sessionId=abc"];
    if (opts.block && u.hostname === "finance.yahoo.com" && /^\/news\/nvda-1$/.test(u.pathname)) return [403, "<html>Forbidden</html>"];
    if (u.hostname === "finance.yahoo.com" && u.pathname.startsWith("/news/")) {
      const sym = (u.pathname.split("/").pop().split("-")[0] || "aapl").toUpperCase();
      const it = (NEWS[sym] || NEWS.AAPL).yahoo[+u.pathname.split("-").pop() || 0] || NEWS.AAPL.yahoo[0];
      return [200, `<html><head><meta property="og:description" content="${it[0]}: what investors need to know."><script>var x = 1;</script></head><body><nav>Menu Home Markets</nav><article><h1>${it[0]}</h1>
        <p>${it[0]}, according to people familiar with the matter, as the company prepares for a busy quarter with several product launches and a closely watched earnings call.</p>
        <p>Analysts said demand held up better than expected in the most recent period, with revenue from the main business growing at a steady pace while costs stayed under control.</p>
        <p>The company did not comment on the report. Rival Coca-Cola ( NYSE:KO ) and Microsoft ($MSFT) were also mentioned. Its shares have risen this year, helped by strong results and growing interest from large investors who see room for further growth.</p>
        <p>Some investors remain cautious, pointing to rising competition, regulatory pressure in several markets and the risk that spending by big customers slows next year.</p>
        <p>The next update is expected with the quarterly results, when management will give its outlook for the rest of the year and comment on margins and new products.</p></article><footer>Copyright</footer></body></html>`];
    }
    if (opts.gconsent && u.hostname === "news.google.com" && u.pathname.startsWith("/rss/articles/") && !String((req.headers || {}).Cookie || "").includes("SOCS=CAESok")) {
      log.googleConsentShown = (log.googleConsentShown || 0) + 1;
      return [200, `<html><body>${"x".repeat(2000)}<form action="https://consent.google.com/save" method="POST"><input type="hidden" name="gl" value="LT"><input type="hidden" name="set_eom" value="false"><button>Accept all</button></form><form action="https://consent.google.com/save" method="POST"><input type="hidden" name="gl" value="LT"><input type="hidden" name="continue" value="${url}"><input type="hidden" name="set_eom" value="true"><button>Reject all</button></form></body></html>`, [], "https://consent.google.com/ml?continue=" + encodeURIComponent(url)];
    }
    if (u.hostname === "consent.google.com" && u.pathname === "/save") { log.googleConsentPosts = (log.googleConsentPosts || []).concat(String(req.body)); return [200, "ok", opts.gstuck ? [] : [{ name: "SOCS", value: "CAESok", domain: ".google.com" }]]; }
    if (u.hostname === "news.google.com" && u.pathname.startsWith("/rss/articles/")) return [200, `<html><body><c-wiz><div jscontroller="x" data-n-a-id="${u.pathname.split("/").pop()}" data-n-a-ts="1730000000" data-n-a-sg="SIGxyz"></div></c-wiz></body></html>`];
    if (u.hostname === "news.google.com" && u.pathname === "/_/DotsSplashUi/data/batchexecute") {
      const fr = JSON.parse(decodeURIComponent(String(req.body).replace(/^f\.req=/, "")))[0][0][1];
      const id = JSON.parse(fr)[2], sym = id.replace(/\d+$/, "").toLowerCase();
      log.gnDecoded = (log.gnDecoded || 0) + 1;
      return [200, ")]}'\n\n" + JSON.stringify([["wrb.fr", "Fbv4je", JSON.stringify(["garturlres", "https://finance.yahoo.com/news/" + sym + "-1", 1]), null, null, null, "generic"]])];
    }
    if (u.hostname === "api.openai.com" && u.pathname === "/v1/audio/speech") return [200, "MP3DATA"];
    return [404, "not mocked: " + url];
  }
  class Request {
    constructor(url) { this.url = url; this.headers = {}; this.method = "GET"; }
    async _go() { const [code, body, cookies, final] = route(this.url, this); this.response = { statusCode: code, cookies: cookies || [], url: final || this.url }; return body; }
    async loadString() { return this._go(); }
    async loadJSON() { return JSON.parse(await this._go()); }
    async load() { const body = await this._go(); return { toBase64String: () => Buffer.from(String(body)).toString("base64"), toRawString: () => String(body) }; }
    async loadImage() { return { size: { width: 1024, height: 1024 } }; }
  }
  const alertValues = opts.alertValues || [];
  log.pushAlert = v => alertValues.push(v);
  class Alert {
    constructor() { this.fields = []; }
    addSecureTextField() { this.fields.push(null); } addTextField() { this.fields.push(null); return { setDecimalPadKeyboard() {} }; }
    addAction() {} addCancelAction() {} addDestructiveAction() {}
    async present() { log.alerts.push(this.title); this.vals = alertValues.shift() || []; return this.vals.cancel ? -1 : this.vals.action || 0; }
    textFieldValue(i) { return this.vals[i] || ""; }
  }
  let dom = null, resolvePresent;
  const presented = new Promise(r => resolvePresent = r);
  class WebView {
    async loadHTML(html) {
      const hook = 'window.__hostBridge(url)';   // portable-bridge recipe: the page hands bridge URLs to __hostBridge when it exists
      if (!html.includes(hook)) { if (/stockit:\/\//.test(html) || /clientApp/.test(html)) throw new Error("bridge hook not found"); log.blankFirst = true; dom = new JSDOM(html); return; }   // the empty first window
      this.html = html;
      dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://local.test/" ,
        beforeParse(w) {
          if (opts.speech) {   // a fake Web Speech API with one English voice, to test the read-aloud queue
            w.SpeechSynthesisUtterance = function (t) { this.text = t; };
            w.speechSynthesis = { getVoices: () => [{ name: "Samantha", lang: "en-US", voiceURI: "samantha", localService: true }], cancel() {}, pause() {}, resume() {},
              speak(u) { (log.webSpoken = log.webSpoken || []).push(u.text); setTimeout(() => u.onend && u.onend(), 5); } };
          }
          w.matchMedia = () => ({ matches: false, addEventListener() {} });
          w.scrollTo = () => {};
          w.__nav = u => { wvRef.shouldAllowRequest({ url: u }); };
          w.__hostBridge = w.__nav;   // as a native shell does: bridge URLs go straight to shouldAllowRequest
        } });
      const w = dom.window;
      // jsdom can't navigate to custom schemes; intercept location.href assignments made by flush()
      w.eval(`(function(){ const orig = Object.getOwnPropertyDescriptor(window.location.__proto__ || {}, 'href'); })()`);
      return;
    }
    async present() { return presented; }
    async evaluateJavaScript(code) { try { return dom.window.eval(code); } catch (e) { log.jsErrors = (log.jsErrors || []).concat(String(e.stack || e)); throw e; } }
  }
  let wvRef;
  const WVProxy = function () { const w = new WebView(); wvRef = w; return w; };
  const noop = () => {};
  class Stack { constructor() { this.children = []; this.kind = "stack"; this.vertical = false; }
    addStack() { const s = new Stack(); this.children.push(s); return s; }
    addText(t) { const x = { kind: "text", text: String(t), centerAlignText() { this.center = true; } }; this.children.push(x); return x; }
    addImage(img) { const x = { kind: "image", img }; this.children.push(x); return x; }
    addSpacer(n) { this.children.push({ kind: "spacer", n: n == null ? null : n }); }
    setPadding(t, l, b, r) { this.pad = [t, l, b, r]; } centerAlignContent() { this.align = "center"; } topAlignContent() { this.align = "start"; } layoutVertically() { this.vertical = true; } layoutHorizontally() { this.vertical = false; } }
  class ListWidget extends Stack { constructor() { super(); this.vertical = true; this.kind = "widget"; } }
  const env = {
    FileManager: { iCloud: () => fmObj, local: () => fmObj },
    Keychain: { contains: k => k in kc, get: k => kc[k], set: (k, v) => { kc[k] = v; }, remove: k => { delete kc[k]; } },
    Request, Alert, WebView: WVProxy,
    Safari: { openInApp: async u => log.opened.push(u) },
    ShareSheet: { present: async a => log.shares.push(a[0]) },
    Pasteboard: { copy: noop },
    Speech: { speak: t => log.spoken = (log.spoken || []).concat(t) },
    // Scriptable's JavaScriptCore has none of these browser APIs: shadow them so native code that uses one fails here too
    URL: undefined, URLSearchParams: undefined, setTimeout: undefined, setInterval: undefined, clearTimeout: undefined, clearInterval: undefined,
    atob: undefined, btoa: undefined, fetch: undefined, TextEncoder: undefined, TextDecoder: undefined, structuredClone: undefined, queueMicrotask: undefined,
    DocumentPicker: { open: async () => { files["/tmp/x.csv"] = opts.csv || ""; return ["/tmp/x.csv"]; } },
    Photos: { fromLibrary: async () => ({ size: { width: 1170, height: 2532 } }) },
    Data: { fromJPEG: () => ({ toBase64String: () => "QUJD" }), fromBase64String: b => ({ toRawString: () => Buffer.from(String(b), "base64").toString("latin1") }) },
    DrawContext: class { drawImageInRect() {} getImage() { return {}; } setFillColor() {} fillRect() {} setFont() {} setTextColor() {} setTextAlignedCenter() {} drawTextInRect() {} },
    Size: class { constructor(w, h) { this.width = w; this.height = h; } }, Rect: class {}, Point: class {}, LinearGradient: class {},
    Color: class { constructor(h, a) { this.hex = h; this.a = a == null ? 1 : a; } }, Font: new Proxy({}, { get: (t, name) => size => ({ name: String(name), size }) }),
    Device: { isUsingDarkAppearance: () => false },
    config: { runsInWidget: !!opts.widget, runsInAccessoryWidget: false, widgetFamily: opts.family || "medium" },
    args: { widgetParameter: opts.widgetParameter || "", shortcutParameter: opts.shortcutParameter, queryParameters: opts.queryParameters || {} },
    Script: { setShortcutOutput: v => { log.shortcutOutput = v; }, complete: noop, setWidget: w => log.widgets.push(w) },
    ListWidget, URLScheme: { forRunningScript: () => "scriptable:///run/Stockit" },
    DateFormatter: class { string() { return "10:22"; } },
    Timer: { schedule: (ms, rep, fn) => { const id = (rep ? setInterval : setTimeout)(fn, Math.min(ms, 50)); return { invalidate: () => (rep ? clearInterval : clearTimeout)(id) }; } },
    module: { filename: "/docs/Stockit.js" },
  };
  return { env, files, kc, log, getDom: () => dom, finish: () => resolvePresent(), wv: () => wvRef };
}

async function run(opts = {}) {
  const E = makeEnv(opts);
  const names = Object.keys(E.env);
  const fn = new Function(...names, "console", `return (async () => {\n${SRC}\n})();`);
  const quiet = { log: () => {}, error: (...a) => (E.log.consoleErrors = (E.log.consoleErrors || []).concat(a.join(" "))) };
  const p = fn(...names.map(n => E.env[n]), quiet);
  return { E, p };
}
module.exports = { run, makeEnv };
