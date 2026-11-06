const TMP = process.env.STOCKIT_TMP || require("path").join(require("os").tmpdir(), "stockit-screens");
const OUT = process.env.STOCKIT_SHOTS || require("path").join(TMP, "shots") + "/";
require("fs").mkdirSync(OUT, { recursive: true });
const { run } = require("../harness");
const fs = require("fs");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let { E, p } = await run({ alertValues: [] });
  await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => (typeof sel === "string" ? d.querySelector(sel) : sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "AAPL 12 @ 168\nNVDA 30 @ 96\nMSFT 4 @ 410\nVWCE.DE 40 @ 98\nFTS.TO 28 @ 77.53\nHSBA.L 200 @ 640\nKO\nASML"; tap('[data-act="paste"]'); await wait(900);
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234"; E.kc["STOCKIT_QUIVER_KEY"] = "qk-test";
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "refresh", force: true }))); await wait(1500);
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "story", s: "NVDA" }))); await wait(600);
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "ideas" }))); await wait(900);
  E.finish(); await p;
  // nicer AI text for the screenshots
  const ins = JSON.parse(E.files["/docs/Stockit/insights.json"]);
  ins.briefing.headline = "Chips lead a calm day; Apple waits for its quarter";
  ins.briefing.story = "Your portfolio rose about half a percent today, carried mostly by NVIDIA after reports that data-centre orders are running ahead of plan [1]. Apple drifted as investors wait for next week's results.\n\nMost of your money sits in two technology names, so their news moves the whole portfolio. Coca-Cola on your watchlist is the calm counterweight.\n\nNothing here calls for a quick move; the bigger questions are next week's earnings.";
  const sig = { AAPL: ["hold", "Fairly priced after a strong year; results next week will set the tone."], NVDA: ["buy", "Demand for its AI chips keeps beating forecasts, though the price already expects a lot."], MSFT: ["hold", "Steady cloud growth; the price looks full for now."], KO: ["buy", "A dependable dividend payer that would balance a tech-heavy portfolio."], ASML: ["sell", "Orders from China are slowing and the next year may be flat."] };
  for (const [s, [g, l]] of Object.entries(sig)) if (ins.briefing.stocks[s]) Object.assign(ins.briefing.stocks[s], { signal: g, line: l, confidence: "medium" });
  ins.stories.NVDA = Object.assign(ins.stories.NVDA, { headline: "Still the engine of the AI build-out", story: "NVIDIA designs the chips that train and run most of today's AI models, and big cloud companies keep ordering more of them [1].\n\nThe price has climbed about 50% this year. At roughly 25 times next year's expected profit it isn't cheap, but profit has been growing faster than the price [2].", signal: "buy", confidence: "medium", reasons: ["Orders still ahead of supply", "Profit growing faster than the price"], risks: ["Big customers designing their own chips", "Export limits to China"], watch: ["Next quarter's data-centre sales"] });
  const now = Date.now();
  { const st = JSON.parse(E.files["/docs/Stockit/settings.json"]); st.homeCur = "EUR"; st.checkIntro = 3; st.briefSeen = 0; st.usageAsked = true; E.files["/docs/Stockit/settings.json"] = JSON.stringify(st); }
  E.files["/docs/Stockit/fx.json"] = JSON.stringify({ USDEUR: { rate: 0.92, prev: 0.9185, at: now }, CADEUR: { rate: 0.638, prev: 0.637, at: now }, GBPEUR: { rate: 1.17, prev: 1.168, at: now } });
  E.files["/docs/Stockit/strategies.json"] = JSON.stringify([
    { id: "g2", text: "Over the next six months, invest more in pharmaceutical companies that work closely with AI companies", when: "next six months", status: "active", at: now - 864e5 },
    { id: "g1", text: "When Nike recovers to my average price, sell it and buy a pharmaceutical company", when: "when NKE is back at $80", status: "active", at: now - 5 * 864e5 },
    { id: "g0", text: "Trim NVDA if it grows above half of the portfolio", when: "", status: "retired", at: now - 30 * 864e5, retiredAt: now - 3 * 864e5 }]);
  if (ins.ideas) {
    ins.ideas.notes = { g2: "Pharma companies with AI research partnerships, such as Johnson & Johnson below, fit this; spreading buys over the six months smooths the price you pay.",
      g1: "Nike is still about 12% below your average price, so the sale isn't due yet; large, steady drug makers would fit what you'd buy with the money." };
    if (ins.ideas.list && ins.ideas.list[0]) ins.ideas.list[0].serves = "g2";
  }
  ins.assessment = { at: now - 40 * 60e3, by: "anthropic", cur: "EUR", score: 64, headline: "Solid core, too much riding on chips",
    summary: "You're up 5% since you bought, led by NVIDIA, but NVIDIA alone is 34% of your money and tech about 70%. The market is calm, which makes this a good time to rebalance gently.",
    market: { mood: "risk-on", text: "US and European indices rose about 3% this month and the VIX is low near 16, so investors are relaxed; the 10-year yield eased to 4.1%." },
    areas: [{ name: "Diversification", rating: "weak", text: "NVDA is 34% and tech about 70% of the portfolio; VWCE is your only broad fund." }, { name: "Risk", rating: "fair", text: "Your largest holdings move 1.3 to 1.7 times as much as the market." }, { name: "Quality and valuation", rating: "fair", text: "Strong businesses, but NVDA and AAPL trade at 30 to 47 times earnings." }, { name: "Fit with your plans", rating: "fair", text: "Your pharma strategy hasn't started: you own no healthcare stocks yet." }],
    world: [{ theme: "US limits on chip exports to China", effect: "Could cut NVDA and ASML orders; next quarter's guidance will show it." }, { theme: "Rates easing in the US and Europe", effect: "Supports richly valued growth stocks like NVDA and AAPL." }],
    risks: ["One stock drives most of your result", "Tech valuations leave little room for disappointment", "Most of your money is in dollars"], upside: ["AI spending keeps NVDA's orders strong", "A dividend payer like KO would steady the swings"],
    watchlist: [{ s: "KO", verdict: "add", why: "A steady 3% dividend payer that balances your tech." }, { s: "ASML", verdict: "wait", why: "Export limits weigh on it this year; its P/E of 34 leaves no cushion." }],
    actions: [{ title: "Trim NVDA to about a quarter of your money", why: "It's 34% now; selling a quarter of it locks in part of its 50% gain.", tickers: ["NVDA"], when: "this month" },
      { title: "Start your pharma strategy with JNJ", why: "Buy in three parts over three months to smooth the price.", tickers: ["JNJ"], when: "this quarter" },
      { title: "Add KO from your watchlist", why: "Its 3% dividend steadies a portfolio that swings with tech.", tickers: ["KO"], when: "now" }],
    gauges: [{ n: "S&P 500", m1: 3.1 }, { n: "Nasdaq", m1: 4.2 }, { n: "Euro Stoxx 50", m1: 2.4 }, { n: "DAX", m1: 2.0 }, { n: "VIX, the fear gauge", m1: -12.5 }, { n: "US 10-year yield", m1: -2.1 }, { n: "Oil (WTI)", m1: -4.3 }, { n: "Gold", m1: 1.8 }, { n: "Euro in dollars", m1: 0.6 }], heads: 18 };
  ins.stratSuggest = { at: now - 2 * 3600e3, by: "anthropic", cur: "EUR", notes: {}, list: [
    { id: "s1", text: "I'll trim NVDA back to a third of my portfolio if it rises another 10%, and move the money into Coca-Cola.", when: "if NVDA passes $158", why: "NVDA is now 38% of your portfolio after a 50% gain; KO would add a steady dividend.", tickers: ["NVDA", "KO"] },
    { id: "s2", text: "I'll buy Johnson & Johnson in three equal parts over the next three months.", when: "monthly until January", why: "It fits your pharma strategy and sits at 86% of its 52-week range, so spreading the buys smooths the price.", tickers: ["JNJ"] },
    { id: "s3", text: "I'll keep at least a fifth of my money in euro-priced stocks.", when: "review each quarter", why: "77% of your portfolio is priced in dollars, so the euro-dollar rate moves your total.", tickers: ["VWCE.DE"] }] };
  E.files["/docs/Stockit/insights.json"] = E.files["/docs/Stockit/insights.json"].replace(/VWCE\.DE line <script>[^"]*/g, "A broad world fund: steady, and a good counterweight to your tech stocks");
  fs.writeFileSync(TMP + "/state.json", JSON.stringify({ files: E.files, kc: E.kc }));
  ({ E, p } = await run({ files: E.files, kc: E.kc }));
  E.files["/docs/Stockit/insights.json"] = JSON.stringify(ins);
  E.finish(); await p;
  ({ E, p } = await run({ files: Object.assign(E.files, { "/docs/Stockit/insights.json": JSON.stringify(ins) }), kc: E.kc }));
  await wait(100);
  const bootState = JSON.stringify(E.getDom().window.__INIT).replace(/<\//g, "<\\/");   // the page now boots from handed-over data
  const html = E.wv().html.replace('window.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify(m)));', 'void 0;').replace("</body>", "<script>window.__boot(" + bootState + ");</script></body>");
  fs.writeFileSync(TMP + "/page.html", html);
  console.log("page bytes", html.length);
  E.finish(); await p;
  // widgets from the same data
  const trees = {};
  { // the widget pinned with 8 stocks: the 4 owned, then the watchlist and two more
    const sts = JSON.parse(E.files["/docs/Stockit/stocks.json"]);
    for (const x of sts) x.wpin = true;
    for (const s2 of ["JNJ", "HSBA.L"]) if (!sts.some(x => x.s === s2)) sts.push({ s: s2, name: s2, list: "watch", wpin: true });
    E.files["/docs/Stockit/stocks.json"] = JSON.stringify(sts);
    const mk = JSON.parse(E.files["/docs/Stockit/market.json"]);
    mk.JNJ = Object.assign({}, mk.KO, { name: "Johnson & Johnson", price: 156.52, prev: 157.9 });
    mk["HSBA.L"] = Object.assign({}, mk.KO, { name: "HSBC", price: 812.4, prev: 806.1, cur: "GBp" });
    E.files["/docs/Stockit/market.json"] = JSON.stringify(mk);
    delete E.files[Object.keys(E.files).find(f => /stockit-widget\.json$/i.test(f))];
  }
  for (const family of ["small", "medium", "large"]) {
    const r = await run({ files: E.files, kc: E.kc, widget: true, family });
    await r.p; await wait(80);
    const w = r.E.log.widgets[0];
    const ser = x => x == null ? x : Array.isArray(x) ? x.map(ser) : typeof x === "object" ? Object.fromEntries(Object.entries(x).filter(([k, v]) => typeof v !== "function").map(([k, v]) => [k, ser(v)])) : x;
    trees[family] = ser(w);
  }
  fs.writeFileSync(TMP + "/widgets.json", JSON.stringify(trees));
  console.log("widgets", Object.keys(trees).map(k => k + ":" + JSON.stringify(trees[k]).length).join(" ")); process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
