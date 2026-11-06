const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234";
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96\nAAPL 12 @ 168\nKO"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  console.log("A tabs:", [...d.querySelectorAll("#tabs button")].map(b => b.textContent).join(" | "));
  console.log("  row badges:", [...d.querySelectorAll(".row .mk")].map(m => m.dataset.s + ":" + m.textContent).join(" "));
  tap('[data-act="tab"][data-v="markets"]'); await wait(50);
  console.log("B markets:", d.querySelector(".listbar").textContent.trim(), "| sections:", [...d.querySelectorAll("#main .sec")].map(h => h.textContent).join(" / "), "| cards:", d.querySelectorAll(".mkt").length, "| yours first:", d.querySelector(".mkt b").textContent);
  console.log("  first card:", d.querySelector(".mkt").textContent.replace(/\s+/g, " ").trim().slice(0, 200));
  // C: one day and one week charts, and touching the chart
  tap('[data-act="tab"][data-v="own"]'); await wait(30);
  tap('.row[data-v="NVDA"]'); await wait(60);
  console.log("C detail status:", d.querySelector("#detail .mk.long").textContent, "| ranges:", [...d.querySelectorAll("#detail .rng button")].map(b => b.textContent).join(" "));
  tap('#detail [data-act="range"][data-v="1d"]'); await wait(300);
  const fig = () => d.querySelector("#detail .chart");
  console.log("  1D:", fig() ? fig().querySelector("figcaption").textContent.replace(/\s+/g, " ") : d.querySelector("#detail .chart-wait, #detail .muted.pad").textContent);
  const svg = d.querySelector("#detail .chart svg");
  svg.dispatchEvent(new w.MouseEvent("pointerdown", { bubbles: true, clientX: 0 })); await wait(10);
  console.log("  touch: tip:", d.querySelector("#detail .xtip").hidden ? "hidden" : d.querySelector("#detail .xtip").textContent, "| crosshair shown:", d.querySelector("#detail .xh").style.display !== "none");
  d.dispatchEvent(new w.MouseEvent("pointerup", { bubbles: true })); await wait(10);
  tap('#detail [data-act="range"][data-v="5d"]'); await wait(300);
  console.log("  1W:", fig().querySelector("figcaption").textContent.replace(/\s+/g, " "), "| requests:", E.log.requests.filter(u => /range=(1d|5d)&interval=(5m|30m)/.test(u)).length);
  tap('[data-act="close"]'); await wait(30);
  // D: My strategies
  tap('[data-act="tab"][data-v="ideas"]'); await wait(40);
  d.querySelector("#stratText").value = "When Nike recovers, sell it and buy a pharmaceutical company"; d.querySelector("#stratText").dispatchEvent(new w.Event("input", { bubbles: true }));
  d.querySelector("#stratWhen").value = "when NKE is back at $80"; d.querySelector("#stratWhen").dispatchEvent(new w.Event("input", { bubbles: true }));
  tap('[data-act="stratadd"]'); await wait(80);
  d.querySelector("#stratText").value = "In six months, invest more in pharma companies working with AI companies"; d.querySelector("#stratText").dispatchEvent(new w.Event("input", { bubbles: true }));
  tap('[data-act="stratadd"]'); await wait(80);
  console.log("D strategies:", d.querySelectorAll(".strat-c").length, "|", [...d.querySelectorAll(".strat-t")].map(e => e.textContent.slice(0, 30)).join(" / "), "| saved:", JSON.parse(E.files["/docs/Stockit/strategies.json"]).length);
  tap('[data-act="ideas"]'); await wait(900);
  const pr = E.log.ideasPrompt || "";
  console.log("E ideas prompt: has strategies:", /own strategies/.test(pr), "| timing:", /timing: when NKE is back at \$80/.test(pr), "| positions:", (pr.match(/Positions: [^\n]+/) || [""])[0].slice(0, 90));
  console.log("  note on strategy:", (d.querySelector(".strat-ai") || {}).textContent, "| idea serves:", (d.querySelector(".serves") || {}).textContent);
  const second = [...d.querySelectorAll(".strat-c")].find(c => /six months/.test(c.textContent));
  tap(second.querySelector('[data-act="stratretire"]')); await wait(80);
  console.log("F after retire: active", d.querySelectorAll(".strat > .strat-c").length, "| retired summary:", d.querySelector(".strat-ret summary").textContent);
  const del = d.querySelector('.strat-ret [data-act="stratdelete"]');
  tap(del); await wait(20); console.log("  delete armed:", d.querySelector('.strat-ret [data-act="stratdelete"]').textContent);
  tap('.strat-ret [data-act="stratdelete"]'); await wait(80);
  console.log("  after delete:", JSON.parse(E.files["/docs/Stockit/strategies.json"]).map(g => g.status).join(","), "| retired list:", !!d.querySelector(".strat-ret"));
  // G: briefing and story prompts carry the strategies
  tap('[data-act="tab"][data-v="own"]'); await wait(30);
  if (d.querySelector(".brief.folded")) { tap(".brief-fold"); await wait(20); }
  tap('[data-act="briefing"]'); await wait(500);
  console.log("G briefing prompt has strategies:", E.log.aiBodies.some(b => JSON.stringify(b).includes("own strategies") && JSON.stringify(b).includes("briefing")));
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
