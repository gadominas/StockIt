const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  process.on('exit', () => {});
  const errors = [];
  process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  const { E, p } = await run({ alertValues: [["10", "150"]] });
  p.catch(e => errors.push("SCRIPT " + e.stack));
  await wait(300);
  const dom = E.getDom(); const w = dom.window, d = w.document;
  const vErr = []; 
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  console.log("1 empty state:", d.querySelector("#main").textContent.trim().slice(0, 60));
  console.log("  status:", d.querySelector("#status").textContent, "| tabs:", d.querySelector("#tabs").textContent);
  // open add sheet, paste a list
  tap('[data-act="addopen"]'); await wait(50);
  console.log("2 add sheet open:", d.querySelector("#addsheet").classList.contains("open"), "| screenshot row shown w/o key:", !!d.querySelector('[data-act="shot"]'));
  d.querySelector("#paste").value = "AAPL 10 @ 150\nMSFT, NVDA\nnotareal 3\n$KO";
  tap('[data-act="paste"]'); await wait(800);
  console.log("  toasts:", d.querySelector("#toast").textContent);
  console.log("  stocks:", JSON.parse(E.files["/docs/Stockit/stocks.json"]).map(x => `${x.s}:${x.list}:${x.sh || 0}@${x.cost || 0}`).join(" "));
  tap('[data-act="addclose"]'); await wait(50);
  // search & add
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#q").value = "coca"; tap('[data-act="find"]'); await wait(300);
  console.log("3 search results:", d.querySelector("#results").textContent.replace(/\s+/g, " ").trim());
  tap('[data-act="addclose"]');
  // refresh
  tap('[data-act="refresh"]'); await wait(900);
  console.log("4 after refresh status:", d.querySelector("#status").textContent, "| toast:", d.querySelector("#toast").textContent);
  console.log("  main:", d.querySelector("#main").textContent.replace(/\s+/g, " ").trim().slice(0, 400));
  // watchlist tab
  tap('[data-act="tab"][data-v="watch"]'); await wait(30);
  console.log("5 watchlist rows:", [...d.querySelectorAll(".row .sym")].map(e => e.textContent).join(","), "| no-AI chips:", d.querySelectorAll(".chip.ex").length);
  // open a stock
  tap('[data-act="open"][data-v="MSFT"]'); await wait(400);
  const det = d.querySelector("#detail");
  console.log("6 detail open:", det.classList.contains("open"), "|", det.querySelector(".dname").textContent.trim());
  console.log("  tiles:", [...det.querySelectorAll(".tile")].map(t => t.textContent.replace(/\s+/g, " ").trim()).join(" | "));
  console.log("  news:", det.querySelectorAll(".news").length, "| about:", !!det.querySelector(".about"), "| crowd:", !!det.querySelector(".mood"), "| trend:", det.querySelector(".sigsec") && det.querySelector(".sigsec").textContent.replace(/\s+/g, " ").trim().slice(0, 120));
  tap(det.querySelector('[data-act="explain"][data-v="pe"]')); await wait(20);
  console.log("  explain:", det.querySelector(".explain").textContent.slice(0, 50));
  tap(det.querySelector('[data-act="range"][data-v="5y"]')); await wait(300);
  console.log("  5y chart:", det.querySelector(".chart figcaption") && det.querySelector(".chart figcaption").textContent);
  tap(det.querySelector('[data-act="range"][data-v="1m"]')); await wait(50);
  tap(det.querySelector(".news")); await wait(100);
  console.log("  opened:", E.log.opened.slice(-1)[0]);
  // I own this → alert gives 10 @ 150? (alert queue empty -> 0)
  tap(det.querySelector('[data-act="remove"]')); await wait(20);
  console.log("  remove armed:", det.querySelector('[data-act="remove"]').textContent);
  tap(det.querySelector('[data-act="remove"]')); await wait(300);
  console.log("  after remove, MSFT present:", JSON.parse(E.files["/docs/Stockit/stocks.json"]).some(x => x.s === "MSFT"), "| detail open:", det.classList.contains("open"));
  // settings
  tap('[data-act="cfgopen"]'); await wait(30);
  const cs = d.querySelector("#cfgsheet");
  console.log("7 settings sections:", [...cs.querySelectorAll(".sec")].map(e => e.textContent).join(" / "));
  tap(cs.querySelector('[data-act="look"][data-k="theme"][data-v="night"]')); await wait(120);
  console.log("  theme:", d.documentElement.dataset.theme, "| saved:", JSON.parse(E.files["/docs/Stockit/settings.json"]).theme);
  tap(cs.querySelector('[data-act="cfgstep"][data-k="newsDays"][data-v="1"]')); await wait(150);
  console.log("  cfg saved:", JSON.stringify(JSON.parse(E.files["/docs/Stockit/settings.json"]).cfg), "| changed note:", cs.querySelector(".cfg-foot .note").textContent);
  const inp = cs.querySelector('input.cfgin[data-k="concurrency"]'); inp.value = "99"; inp.dispatchEvent(new w.Event("change", { bubbles: true })); await wait(150);
  console.log("  clamped concurrency:", JSON.parse(E.files["/docs/Stockit/settings.json"]).cfg.concurrency);
  console.log("  built with rows:", cs.querySelectorAll(".srow.bp").length, cs.querySelector(".srow.bp").dataset.v);
  tap(cs.querySelector(".srow.bp")); await wait(100); console.log("  opened:", E.log.opened.slice(-1)[0]);
  // updates check
  tap(cs.querySelector('[data-act="updcheck"]')); await wait(200);
  console.log("  update check:", d.querySelector("#updmsg").textContent);
  // AI sheet: add key
  E.kc; tap(cs.querySelector('[data-act="aiopen"]')); await wait(30);
  console.log("8 AI sheet:", d.querySelector("#aisheet").classList.contains("open"), [...d.querySelectorAll("#aisheet .aicard .aic-h b")].map(e => e.textContent).join(","));
  console.log("  key alert values queue should give key:");
  // simulate adding key: queue an alert value
  E.log.alerts.length = 0;
  require("../harness"); 
  // push key via alert: we need alertValues; set directly
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234"; w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "state" }))); await wait(100);
  tap(d.querySelector('#aisheet [data-act="aimodels"][data-v="anthropic"]')); await wait(300);
  console.log("  models:", [...d.querySelectorAll("#ms-anthropic option")].map(o => o.textContent).join(" | "), "| key shown:", d.querySelector("#aisheet code").textContent);
  tap(d.querySelector('#aisheet [data-act="aitest"][data-v="anthropic"]')); await wait(300);
  console.log("  test toast:", d.querySelector("#toast").textContent);
  tap(d.querySelector('[data-act="aiclose"]')); tap(d.querySelector('[data-act="cfgclose"]')); await wait(30);
  console.log("  tabs now:", d.querySelector("#tabs").textContent.replace(/\s+/g, " "));
  // briefing
  tap('[data-act="tab"][data-v="own"]'); await wait(30);
  tap('[data-act="briefing"]'); await wait(600);
  const br = d.querySelector(".brief");
  console.log("9 briefing:", br.textContent.replace(/\s+/g, " ").trim().slice(0, 260));
  console.log("  escaped html?", br.innerHTML.includes("&lt;b&gt;Apple"), "| row sig lines:", [...d.querySelectorAll(".r-sig")].map(e => e.textContent.trim()).join(" || "));
  console.log("  script tag injection in row?", d.querySelector(".r-sig").innerHTML.includes("<script>"));
  tap('[data-act="brieffull"]'); await wait(20); console.log("  full paras:", d.querySelectorAll(".brief-s p").length, "| watch list:", d.querySelectorAll(".brief ul.dots li").length);
  tap('[data-act="share-brief"]'); await wait(150); console.log("  shared:", E.log.shares.slice(-1)[0].slice(0, 80).replace(/\n/g, "⏎"));
  // story
  tap('[data-act="open"][data-v="AAPL"]'); await wait(300);
  tap(d.querySelector('#detail [data-act="story"]')); await wait(600);
  const sty = d.querySelector("#detail .story");
  console.log("10 story:", sty.textContent.replace(/\s+/g, " ").trim().slice(0, 200), "| refs:", sty.querySelectorAll(".ref").length);
  console.log("  holding:", d.querySelector("#detail .hold").textContent.replace(/\s+/g, " ").trim());
  console.log("  signal:", d.querySelector("#detail .sigbig").textContent.replace(/\s+/g, " ").trim());
  tap('[data-act="close"]'); await wait(30);
  // ideas
  tap('[data-act="tab"][data-v="ideas"]'); await wait(30);
  tap('[data-act="ideas"]'); await wait(800);
  console.log("11 ideas:", [...d.querySelectorAll(".idea .sym")].map(e => e.textContent).join(","), "|", d.querySelector("#main .note") && d.querySelector("#main .note").textContent.slice(0, 80));
  tap('[data-act="watchidea"][data-v="JNJ"]'); await wait(500);
  // screenshot import
  tap('[data-act="addopen"]'); await wait(30);
  console.log("12 shot button now:", !!d.querySelector('[data-act="shot"]'));
  tap('[data-act="shot"]'); await wait(800);
  console.log("  toast:", d.querySelector("#toast").textContent, "| image sent:", JSON.stringify(E.log.aiBodies.slice(-1)[0].messages[0].content[0]).slice(0, 80));
  // CSV import
  tap('[data-act="csv"]'); await wait(800);
  console.log("13 csv toast:", d.querySelector("#toast").textContent);
  // usage
  const usage = JSON.parse(E.files["/docs/Stockit/usage.json"]);
  console.log("14 usage features:", Object.keys(usage.p.anthropic.features).join(","), "calls", usage.p.anthropic.calls);
  console.log("  keys in settings.json?", /sk-ant/.test(E.files["/docs/Stockit/settings.json"]), "| keys in page?", d.documentElement.outerHTML.includes("ABCDEFGHIJKLMNOP1234"));
  E.finish(); await wait(300);
  console.log("15 widget snapshot:", E.files["/docs/stockit-widget.json"] && E.files["/docs/stockit-widget.json"].slice(0, 200));
  console.log("ERRORS:", errors.length ? errors : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log('TEST CRASH', e.stack); process.exit(1); });
