const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "AAPL 12 @ 168\nNVDA 30 @ 96\nKO"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  tap('[data-act="tab"][data-v="flash"]'); await wait(80);
  const left = s => d.querySelector(`#c-fl-${s} .fl-l`).textContent.replace(/\s+/g, " ").trim();
  console.log("A NVDA left:", left("NVDA")); console.log("  KO left:", left("KO"));
  tap('#c-fl-NVDA [data-act="fold"]'); await wait(60);
  console.log("B folded:", d.querySelector("#c-fl-NVDA").classList.contains("folded"), "|", d.querySelector("#c-fl-NVDA").textContent.replace(/\s+/g, " ").trim(), "| saved:", JSON.stringify(JSON.parse(E.files["/docs/Stockit/settings.json"]).flashFold));
  console.log("  listbar:", d.querySelector(".listbar").textContent.replace(/\s+/g, " ").trim());
  // reopen the app: still folded
  E.finish(); await p;
  ({ E, p } = await run({ files: E.files, kc: E.kc })); await wait(250); w = E.getDom().window; d = w.document;
  tap('[data-act="tab"][data-v="flash"]'); await wait(80);
  console.log("C after reopen folded:", d.querySelector("#c-fl-NVDA").classList.contains("folded"));
  // a newer headline arrives: opens again, marked New
  E.finish(); await p;
  const st = JSON.parse(E.files["/docs/Stockit/settings.json"]); st.flashFold.NVDA -= 3600e3 * 5; E.files["/docs/Stockit/settings.json"] = JSON.stringify(st);
  ({ E, p } = await run({ files: E.files, kc: E.kc })); await wait(250); w = E.getDom().window; d = w.document;
  tap('[data-act="tab"][data-v="flash"]'); await wait(80);
  console.log("D newer headline -> open:", !d.querySelector("#c-fl-NVDA").classList.contains("folded"), "| new mark:", (d.querySelector("#c-fl-NVDA .fl-new") || {}).textContent);
  tap('[data-act="foldall"]'); await wait(60);
  console.log("E fold all:", d.querySelectorAll(".fl.folded").length, "of", d.querySelectorAll(".fl").length);
  tap('[data-act="unfoldall"]'); await wait(60);
  console.log("F open all:", d.querySelectorAll(".fl.folded").length, "folded");
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
