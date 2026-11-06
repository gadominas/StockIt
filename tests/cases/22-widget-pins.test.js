const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = [];
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "AAPL 12 @ 168\nNVDA 30 @ 96\nMSFT 4 @ 410"; tap('[data-act="paste"]'); await wait(800);
  tap('[data-act="addto"][data-v="watch"]'); await wait(10);
  d.querySelector("#paste").value = "KO\nJNJ\nASML\nVWCE.DE\nHSBA.L"; tap('[data-act="paste"]'); await wait(800);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  const snap = () => JSON.parse(E.files[Object.keys(E.files).find(f => f.endsWith("Stockit-widget.json")) || Object.keys(E.files).find(f => /"movers"/.test(E.files[f]))]);
  let s = snap(); console.log("A no pins:", s.pick, s.movers.map(r => r.s + " " + r.chg.toFixed(2)).join(", "));
  // pin from Arrange (watchlist) and from a stock's page
  tap('[data-act="tab"][data-v="watch"]'); await wait(20); tap('[data-act="arrange"][data-v="1"]'); await wait(20);
  console.log("  arrange buttons per row:", [...d.querySelectorAll(".row.arr")][0].querySelectorAll(".arr-b").length, "|", d.querySelector(".arr-bar span").textContent);
  tap('.row.arr[data-v="KO"] [data-k="wpin"]'); await wait(30); tap('.row.arr[data-v="HSBA.L"] [data-k="wpin"]'); await wait(30);
  tap('[data-act="arrange"][data-v="0"]'); await wait(20);
  tap('[data-act="tab"][data-v="own"]'); await wait(20); tap('.row[data-v="MSFT"]'); await wait(50);
  console.log("  stock page:", [...d.querySelectorAll('#detail [data-act="mark"]')].map(b => b.textContent).join(" | "));
  { const o = w.__nav; w.__nav = u => { if (/mark/.test(decodeURIComponent(u))) console.log("  nav:", decodeURIComponent(u).slice(16, 120)); return o(u); }; }
  console.log("  wpin button:", d.querySelector('#detail [data-k="wpin"]').outerHTML.slice(0, 140));
  tap('#detail [data-k="wpin"]'); await wait(300); tap('[data-act="close"]'); await wait(20);
  s = snap(); console.log("B pinned:", s.pick, s.movers.map(r => r.s).join(", "), "| stocks.json:", JSON.parse(E.files["/docs/Stockit/stocks.json"]).filter(x => x.wpin).map(x => x.s).join(","), "| widget files:", Object.keys(E.files).filter(f => /widget/i.test(f)).join(","));
  tap('[data-act="cfgopen"]'); await wait(30);
  console.log("  settings:", d.querySelector("#cfgsheet .srow.col").textContent.replace(/\s+/g, " ").trim().slice(0, 200));
  tap('#cfgsheet .wchip[data-v="KO"]'); await wait(300);
  console.log("  after removing KO in Settings:", snap().movers.map(r => r.s).join(", "));
  E.finish(); await p;
  // C: Shortcuts: hide, then show; no window opens
  for (const prm of ["hide", "show", "privacy toggle"]) {
    const r = await run({ files: E.files, kc: E.kc, shortcutParameter: prm }); await r.p; await wait(50);
    console.log(`C "${prm}":`, "privacy", JSON.parse(r.E.files["/docs/Stockit/settings.json"]).privacy, "| widget snapshot private:", snap.call(null) && JSON.parse(r.E.files[Object.keys(r.E.files).find(f => /"movers"/.test(r.E.files[f]))]).private, "| output:", r.E.log.shortcutOutput, "| window opened:", !!(r.E.wv && r.E.wv() && r.E.wv().presentedAt));
    Object.assign(E.files, r.E.files);
  }
  const q = await run({ files: E.files, kc: E.kc, queryParameters: { privacy: "on" } }); await q.p; await wait(50); Object.assign(E.files, q.E.files);
  console.log("  URL ?privacy=on:", JSON.parse(E.files["/docs/Stockit/settings.json"]).privacy);
  // D: widgets
  const st = JSON.parse(E.files["/docs/Stockit/settings.json"]); st.widgetMoney = true; st.privacy = false; E.files["/docs/Stockit/settings.json"] = JSON.stringify(st);
  for (const [fam, prm] of [["medium", ""], ["medium", "private"], ["small", ""], ["large", ""]]) {
    const r = await run({ files: E.files, kc: E.kc, widget: true, family: fam, widgetParameter: prm }); await r.p; await wait(60);
    const texts = []; const walk = n => { if (!n) return; if (n.kind === "text" || n.text != null && typeof n.text === "string") texts.push(n.text); (n.children || n.items || []).forEach(walk); };
    walk(r.E.log.widgets[0]);
    console.log(`D ${fam}${prm ? " (" + prm + ")" : ""}:`, texts.join(" · ").slice(0, 240));
  }
  console.log("errors:", errors.length ? errors.join("; ") : "none", "| JS errors:", E.log.jsErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
