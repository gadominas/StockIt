const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let positions = [];
  let { E, p } = await run({ checkPositions: () => positions }); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234";
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "VWCE.DE 440 @ 36.31\nNVDA 34 @ 194.58\nAAPL 12 @ 168"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  const m = JSON.parse(E.files["/docs/Stockit/market.json"]), pv = m["VWCE.DE"].price, pn = m.NVDA.price, pa = m.AAPL.price;
  // a bank screenshot: price and the position's value in EUR, with the gain; no shares, no average price
  positions = [
    { symbol: null, name: "VANGUARD FTSE ALL-WORLD UCITS ETF", price: pv, currency: "EUR", value: +(480 * pv).toFixed(2), valueCurrency: "EUR", gain: +(480 * pv - 480 * 36.31).toFixed(2), gainCurrency: "EUR", gainPct: +((pv / 36.31 - 1) * 100).toFixed(2) },
    { symbol: null, name: "NVIDIA CORP", price: pn, currency: "USD", value: +(34 * pn * 0.92).toFixed(2), valueCurrency: "EUR", gain: 713.44, gainCurrency: "EUR", gainPct: 12.27 },
    { symbol: "AAPL", name: "Apple", price: pa, currency: "USD" },
  ];
  tap(".sum .ck-icon"); await wait(30); tap('#checksheet [data-act="checkpick"]'); await wait(60);
  { const orig = w.recv; w.recv = st => { w.__lastSt = st; orig(st); }; }
  tap('#checksheet [data-act="checkrun"]'); await wait(1500);
  require("fs").writeFileSync(require("path").join(require("os").tmpdir(), "stockit-check2.json"), JSON.stringify(w.__lastSt.check));
  console.log("prompt asks for value, gain, ignores IBANs:", /total market value and its currency/.test(E.log.checkPrompt), /IBANs/.test(E.log.checkPrompt));
  const card = sym => [...d.querySelectorAll("#checksheet .ck")].find(c => c.querySelector(".ck-h b").textContent === sym);
  for (const s of ["VWCE.DE", "NVDA", "AAPL"]) {
    const c = card(s);
    console.log(`\n${s} [${c.querySelector(".ck-b").textContent}] ${(c.querySelector(".ck-what") || {}).textContent || ""}`);
    console.log("  " + [...c.querySelectorAll(".ck-r:not(.hd)")].map(r => r.textContent.replace(/\s+/g, " ").trim()).join("\n  "));
    console.log("  note:", [...c.querySelectorAll(".note")].map(n => n.textContent).join(" | "), "| fields:", [...c.querySelectorAll(".ck-in")].map(i => i.dataset.f + "=" + i.value).join(" "));
  }
  tap(card("VWCE.DE").querySelector('[data-k="update"]')); await wait(80);
  console.log("\napplied:", JSON.parse(E.files["/docs/Stockit/stocks.json"]).filter(x => x.s === "VWCE.DE").map(x => x.sh + " @ " + x.cost).join());
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
