const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96\nVWCE.DE 100 @ 100\nHSBA.L 500 @ 600"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  const S = () => JSON.parse(JSON.stringify(w.eval("1") && 0) || "null");
  const sum = () => d.querySelector(".sum").textContent.replace(/\s+/g, " ").trim();
  console.log("A auto:", sum().slice(0, 230));
  console.log("  rates fetched:", [...new Set(E.log.fx || [])].join(" "));
  console.log("  rows:", [...d.querySelectorAll(".row")].map(r => r.dataset.v + " " + r.querySelector(".r-l small").textContent.trim()).join(" | "));
  // B: choose euros
  tap('[data-act="cfgopen"]'); await wait(40);
  const sel = d.querySelector("#homeCur"); sel.value = "EUR"; sel.dispatchEvent(new w.Event("change", { bubbles: true })); await wait(300);
  tap('[data-act="cfgclose"]'); await wait(40);
  console.log("B EUR:", sum().slice(0, 260));
  // hand check: NVDA 30 × price × 0.92 + VWCE 100 × price + HSBA 500 × price / 100 × 1.17
  const m = JSON.parse(E.files["/docs/Stockit/market.json"]);
  const expect = 30 * m.NVDA.price * 0.92 + 100 * m["VWCE.DE"].price + 500 * m["HSBA.L"].price / 100 * 1.17;
  console.log("  expected value €" + expect.toFixed(2), "| settings saved:", JSON.parse(E.files["/docs/Stockit/settings.json"]).homeCur);
  tap('.row[data-v="HSBA.L"]'); await wait(60);
  console.log("C HSBA.L holding:", d.querySelector("#detail .hold").textContent.replace(/\s+/g, " ").trim().slice(0, 260));
  tap('[data-act="close"]'); await wait(30);
  tap('[data-act="tab"][data-v="flash"]'); await wait(40);
  console.log("D flash NVDA today:", d.querySelector("#c-fl-NVDA .fl-m").textContent);
  // E: widget with money on
  tap('[data-act="cfgopen"]'); await wait(30); tap('[data-act="toggle"][data-v="widgetMoney"]'); await wait(60);
  E.finish(); await p;
  const snap = JSON.parse(E.files["/docs/Stockit-widget/widget.json"] || Object.values(E.files).find(v => /"movers"/.test(v)) || "{}");
  console.log("E widget value:", JSON.stringify(snap.value), "| day %:", snap.dayPct && snap.dayPct.toFixed(2));
  // F: dollars
  ({ E, p } = await run({ files: E.files, kc: E.kc })); await wait(300); w = E.getDom().window; d = w.document;
  tap('[data-act="cfgopen"]'); await wait(30);
  const s2 = d.querySelector("#homeCur"); s2.value = "USD"; s2.dispatchEvent(new w.Event("change", { bubbles: true })); await wait(300);
  tap('[data-act="cfgclose"]'); await wait(30);
  tap('[data-act="tab"][data-v="own"]'); await wait(40);
  console.log("F USD:", sum().slice(0, 120));
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
