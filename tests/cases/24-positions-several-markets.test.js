const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = [];
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  const st = JSON.parse(E.files["/docs/Stockit/settings.json"] || "{}");
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96"; tap('[data-act="paste"]'); await wait(800);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  tap('.row[data-v="NVDA"]'); await wait(60);
  console.log("A link:", d.querySelector("#detail .lot-add").textContent.trim());
  // add a Frankfurt position in euros
  E.log.pushAlert(["10", "120,50", "eur", "Frankfurt"]);
  tap('#detail [data-act="lot"]'); await wait(300);
  let x = JSON.parse(E.files["/docs/Stockit/stocks.json"]).find(y => y.s === "NVDA");
  const m = JSON.parse(E.files["/docs/Stockit/market.json"]).NVDA, fx = JSON.parse(E.files["/docs/Stockit/fx.json"] || "{}");
  console.log("B lots:", JSON.stringify(x.lots.map(l => [l.sh, l.cost, l.cur, l.where])), "| total shares", x.sh, "| average (USD)", x.cost, "| rates", Object.keys(fx).join(","));
  const usdHome = fx.USDUSD ? 1 : null, eurUsd = fx.EURUSD ? fx.EURUSD.rate : null;
  console.log("  expected average:", eurUsd ? ((30 * 96 + 10 * 120.5 * eurUsd) / 40).toFixed(4) : "(rate?)");
  console.log("  page:", [...d.querySelectorAll("#detail .lot")].map(b => b.textContent.replace(/\s+/g, " ").trim()).join(" || "), "| rows sub:", (d.querySelector('.row[data-v="NVDA"] .r-l small') || {}).textContent);
  // edit the Frankfurt one through "Edit shares": pick it from the list, change shares
  E.log.pushAlert({ action: 1 }); E.log.pushAlert(["12", "120,50", "EUR", "Frankfurt"]);
  tap('#detail [data-act="holding"]'); await wait(300);
  x = JSON.parse(E.files["/docs/Stockit/stocks.json"]).find(y => y.s === "NVDA");
  console.log("C edited:", JSON.stringify(x.lots.map(l => [l.sh, l.where])), "| total", x.sh);
  // remove it
  const id = x.lots[1].id;
  E.log.pushAlert({ action: 1 });
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "lot", s: "NVDA", id }))); await wait(300);
  x = JSON.parse(E.files["/docs/Stockit/stocks.json"]).find(y => y.s === "NVDA");
  console.log("D removed:", JSON.stringify(x.lots || null), "| shares", x.sh, "| cost", x.cost);
  E.finish(); await p;
  console.log("errors:", errors.length ? errors.join("; ") : "none", "| JS errors:", E.log.jsErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
