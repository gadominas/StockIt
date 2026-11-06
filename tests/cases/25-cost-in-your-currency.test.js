const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = [];
  let positions = [];
  let { E, p } = await run({ checkPositions: () => positions }); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234";
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "set", k: "homeCur", v: "EUR" }))); await wait(50);
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "FTS.TO 28 @ 77.53"; tap('[data-act="paste"]'); await wait(800);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  const m = JSON.parse(E.files["/docs/Stockit/market.json"])["FTS.TO"], rate = 0.638;
  const valEUR = 28 * m.price * rate, brokerCost = 28 * 77.53 * 0.6224;   // bought when the Canadian dollar was weaker
  console.log("price CA$" + m.price.toFixed(2), "| value €" + valEUR.toFixed(2), "| broker's gain €" + (valEUR - brokerCost).toFixed(2), "(paid €" + brokerCost.toFixed(2) + ")");
  const line = () => d.querySelector('.row[data-v="FTS.TO"] .r-pl').textContent;
  console.log("A average in CAD:", line(), "| gain at today's rate €" + (valEUR - 28 * 77.53 * rate).toFixed(2));
  tap('.row[data-v="FTS.TO"]'); await wait(60);
  console.log("  hint:", (([...d.querySelectorAll("#detail .hold .note")].find(n => /broker also counts/.test(n.textContent))) || {}).textContent);
  // enter what was paid in euros
  E.log.pushAlert(["28", String((brokerCost / 28).toFixed(4)), "EUR"]);
  tap('#detail [data-act="holding"]'); await wait(300);
  const x = JSON.parse(E.files["/docs/Stockit/stocks.json"])[0];
  console.log("B stored:", JSON.stringify(x.lots), "| average in CAD at today's rate", x.cost);
  console.log("  page:", [...d.querySelectorAll("#detail .hold .note")].map(n => n.textContent.replace(/\s+/g, " ").trim()).join(" | "));
  tap('[data-act="close"]'); await wait(20);
  console.log("  row:", line());
  // C: the broker's screenshot (value and gain in EUR) suggests the euro price
  E.log.pushAlert(["28", "77.53", "CAD"]); tap('.row[data-v="FTS.TO"]'); await wait(40); tap('#detail [data-act="holding"]'); await wait(300); tap('[data-act="close"]'); await wait(20);
  positions = [{ symbol: "FTS", name: "FORTIS INC", price: m.price, currency: "CAD", value: +valEUR.toFixed(2), valueCurrency: "EUR", gain: +(valEUR - brokerCost).toFixed(2), gainCurrency: "EUR" }];
  tap(".sum .ck-icon"); await wait(30); tap('#checksheet [data-act="checkpick"]'); await wait(60); tap('#checksheet [data-act="checkrun"]'); await wait(1500);
  const card = d.querySelector("#checksheet .ck");
  console.log("C check:", card.querySelector(".ck-b").textContent, "|", [...card.querySelectorAll(".ck-r:not(.hd)")].map(r => r.textContent.replace(/\s+/g, " ").trim()).join(" / "));
  console.log("  fields:", [...card.querySelectorAll(".ck-f")].map(f => f.textContent.replace(/\s+/g, " ").trim() + "=" + f.querySelector("input").value).join(" "));
  tap(card.querySelector('[data-k="update"]')); await wait(300);
  console.log("  applied:", JSON.stringify(JSON.parse(E.files["/docs/Stockit/stocks.json"])[0].lots), "| row:", line());
  E.finish(); await p;
  console.log("errors:", errors.length ? errors.join("; ") : "none", "| JS errors:", E.log.jsErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
