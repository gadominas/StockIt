const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = [];
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234";
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96\nAAPL 12 @ 168\nVWCE.DE 40 @ 98"; tap('[data-act="paste"]'); await wait(800);
  tap('[data-act="addto"][data-v="watch"]'); await wait(10); d.querySelector("#paste").value = "KO\nASML"; tap('[data-act="paste"]'); await wait(600);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1300);
  console.log("A icon:", d.querySelector(".sum-icons").innerHTML.replace(/<svg[\s\S]*?<\/svg>/g, "svg").replace(/\s+/g, " ").slice(0, 300), "| card gone:", !d.querySelector(".as-card"));
  tap(".as-icon"); await wait(40);
  console.log("  sheet:", d.querySelector("#assesssheet").classList.contains("open"), "|", d.querySelector('#assesssheet [data-act="assess"]').textContent);
  { const o = w.onAssessProgress; w.onAssessProgress = (pp, t) => { console.log('  progress', Math.round(pp * 100) + '%', t); o(pp, t); }; }
  tap('#assesssheet [data-act="assess"]'); await wait(4000);
  let P = E.log.assessPrompt || ""; try { P = JSON.parse(P)[0].content; } catch (e) {}   // the request body's first message
  console.log("B prompt has: positions", /Positions, largest first:\n- NVDA/.test(P), "| weights", /of the portfolio/.test(P), "| sectors", /By sector:/.test(P), "| currencies", /By currency:/.test(P), "| watchlist KO", /Watchlist:\n- KO/.test(P), "| style", /Investing style:/.test(P), "| gauges", (P.match(/^- (S&P 500|Nasdaq|Euro Stoxx 50|DAX|VIX|US 10-year|Oil|Gold|Euro in dollars)/gm) || []).length, "| headlines", /This week's headlines/.test(P), "| gauges fetched", [...new Set(E.log.gauges)].length);
  const sh = d.querySelector("#assesssheet");
  console.log("C report:", sh.querySelector(".as-ring.big").textContent, "|", sh.querySelector(".as-h").textContent, "| sections:", [...sh.querySelectorAll(".sec")].map(h => h.textContent.trim()).join(" / "));
  console.log("  steps:", [...sh.querySelectorAll(".as-acts li")].map(l => l.querySelector("b").textContent + " [" + l.querySelector(".ck-b").textContent + "]").join(" | "));
  tap('#assesssheet [data-act="assesskeep"][data-v="1"]'); await wait(150);
  console.log("D kept:", JSON.parse(E.files["/docs/Stockit/strategies.json"]).map(g => g.text.slice(0, 40) + " (" + g.from + ")").join(" | "), "| button now:", sh.querySelectorAll(".as-acts li")[1].querySelector(".note") && sh.querySelectorAll(".as-acts li")[1].querySelector(".note").textContent);
  tap(sh.querySelector('.as-w .chip[data-v="KO"]')); await wait(400);
  console.log("E KO from the watchlist verdicts:", d.querySelector("#detail").classList.contains("open"), "above:", d.querySelector("#detail").classList.contains("over"));
  tap('#detail [data-act="close"]'); await wait(30); tap('[data-act="assessclose"]'); await wait(30);
  console.log("F icon now:", d.querySelector(".as-icon").outerHTML.slice(0, 160));
  E.finish(); await p;
  console.log("errors:", errors.length ? errors.join("; ") : "none", "| JS errors:", E.log.jsErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
