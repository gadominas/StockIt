const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96\nVWCE.DE 40 @ 120"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  const line = s => { const r = d.querySelector(`.row[data-v="${s}"]`); return [...r.querySelectorAll(".r-day,.r-prev")].map(e => e.textContent.trim()).join(" | "); };
  const m = JSON.parse(E.files["/docs/Stockit/market.json"]), n = m.NVDA;
  const today = Math.floor(Date.now() / 864e5), before = n.pts.filter(q => q[0] < today);
  console.log("A NVDA:", line("NVDA"));
  console.log("  expected this session", (30 * (n.price - n.prev)).toFixed(2), "| previous", (30 * (before[before.length - 1][1] - before[before.length - 2][1])).toFixed(2));
  console.log("  VWCE.DE:", line("VWCE.DE"));
  console.log("  summary:", [...d.querySelectorAll(".sum-d,.sum-n,.sum-p")].map(e => e.textContent.trim()).join(" | "));
  // B: a market that hasn't opened today: its last trade was yesterday
  E.finish(); await p;
  const mk = JSON.parse(E.files["/docs/Stockit/market.json"]); mk["VWCE.DE"].mt = Date.now() - 26 * 3600e3; mk["VWCE.DE"].tp = null; E.files["/docs/Stockit/market.json"] = JSON.stringify(mk);
  const st = JSON.parse(E.files["/docs/Stockit/settings.json"]); st.refreshOnOpen = false; E.files["/docs/Stockit/settings.json"] = JSON.stringify(st);
  ({ E, p } = await run({ files: E.files, kc: E.kc })); await wait(300); w = E.getDom().window; d = w.document;
  const v = mk["VWCE.DE"];
  const realNow = w.Date.now; w.Date.now = () => Date.parse("2026-10-31T12:00:00Z");   // a Saturday: no market open
  tap('[data-act="tab"][data-v="watch"]'); await wait(20); tap('[data-act="tab"][data-v="own"]'); await wait(40);
  console.log("B VWCE.DE before its market opens:", line("VWCE.DE"), "| expected previous", (40 * (v.price - v.prev)).toFixed(2));
  console.log("  summary:", [...d.querySelectorAll(".sum-d,.sum-n,.sum-p")].map(e => e.textContent.trim()).join(" | "));
  w.Date.now = realNow;
  tap("#privbtn"); await wait(30);
  console.log("C private:", line("NVDA"), "|", d.querySelector(".sum-p").textContent);
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
