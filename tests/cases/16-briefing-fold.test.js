const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234";
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96\nVWCE.DE 40 @ 120\nAAPL 12"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1300);
  const st = () => { const b = d.querySelector(".brief"); return b ? (b.classList.contains("folded") ? "folded" : "open") + (d.querySelector(".brief-s") ? " story:" + d.querySelectorAll(".brief-s p").length : "") : "none"; };
  console.log("A new briefing:", st());
  tap('[data-act="brieffull"]'); await wait(20); console.log("  full:", st());
  tap('[data-act="tab"][data-v="flash"]'); await wait(20); tap('[data-act="tab"][data-v="own"]'); await wait(20);
  console.log("B after visiting Flash:", st(), "| saved:", JSON.parse(E.files["/docs/Stockit/settings.json"]).briefSeen > 0);
  tap(".brief-fold"); await wait(20); console.log("C tap header:", st()); tap(".brief-fold"); await wait(20); console.log("  tap again:", st());
  E.finish(); await p;
  ({ E, p } = await run({ files: E.files, kc: E.kc })); await wait(300); w = E.getDom().window; d = w.document;
  console.log("D reopened, same briefing:", st());

  console.log("E rows:", [...d.querySelectorAll(".row")].map(r => r.dataset.v + ": " + ((r.querySelector(".r-pl") || {}).textContent || "(no line)")).join(" | "));
  tap("#privbtn"); await wait(30);
  console.log("F private:", [...d.querySelectorAll(".r-pl")].map(e => e.textContent).join(" | "));
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
