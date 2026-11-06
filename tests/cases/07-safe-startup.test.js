const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  // set up some stocks first
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => d.querySelector(sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  console.log("A empty first window:", !!E.log.blankFirst, "| booted:", w.__booted, "| placeholder gone:", !d.querySelector(".booting"));
  tap('[data-act="addopen"]'); await wait(30); d.querySelector("#paste").value = "NVDA 30 @ 96\nAAPL 12 @ 168\nKO\nMSFT 5\nASML\nJNJ\nPEP 3"; tap('[data-act="paste"]'); await wait(1200);
  E.finish(); await p;
  const files = E.files, before = files["/docs/Stockit/stocks.json"];
  console.log("  stocks saved:", JSON.parse(before).length);
  // B: reopen: data handed over in pieces (7 stocks → 2 parts)
  ({ E, p } = await run({ files, kc: E.kc })); await wait(300); w = E.getDom().window; d = w.document;
  console.log("B reopened rows:", d.querySelectorAll(".row").length, "| parts left:", w.__parts.length);
  E.finish(); await p;
  // C: iCloud never delivers stocks.json: the app still opens, says so, and saves nothing over it
  ({ E, p } = await run({ files, kc: E.kc, slowCloud: "stocks.json" })); await wait(400); w = E.getDom().window; d = w.document;
  console.log("C slow iCloud: booted:", w.__booted, "| toast:", (d.querySelector("#toast") || {}).textContent);
  E.finish(); await p;
  console.log("  stocks.json untouched:", E.files["/docs/Stockit/stocks.json"] === before);
  // D: widget run reads data itself
  ({ E, p } = await run({ files, kc: E.kc, widget: true, family: "medium" })); await p; await wait(50);
  console.log("D widget run: widgets", E.log.widgets.length, "| first row:", (JSON.stringify(E.log.widgets[0]).match(/"text":"([A-Z]{2,5})"[^]*?"text":"([+−-][0-9.]+%)"/) || []).slice(1).join(" "));
  // E: start-up log in Settings
  ({ E, p } = await run({ files, kc: E.kc })); await wait(300); w = E.getDom().window; d = w.document;
  tap('[data-act="cfgopen"]'); await wait(40); tap('[data-act="startlog"]'); await wait(80);
  console.log("E start-up log:\n" + d.querySelector("#startlog").textContent.split("\n").slice(-5).join("\n"));
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
