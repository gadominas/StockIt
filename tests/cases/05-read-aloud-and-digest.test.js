const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let { E, p } = await run({ speech: true }); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96\nAAPL 12 @ 168"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  tap('[data-act="tab"][data-v="flash"]'); await wait(80);
  // A: no AI key, iPhone voice: the articles' key sentences, read in full
  tap('#c-fl-NVDA [data-act="listenstock"]'); await wait(30);
  console.log("A player at once:", !d.querySelector("#player").hidden, "|", d.querySelector("#plSub").textContent);
  await wait(1500);
  const spoken = (E.log.webSpoken || []).join(" ");
  console.log("  spoken chars:", spoken.length, "| starts:", spoken.slice(0, 140));
  console.log("  Google links decoded:", E.log.gnDecoded || 0, "| article pages read:", E.log.requests.filter(u => u.includes("finance.yahoo.com/news/")).length);
  await wait(400); console.log("  player closed at the end:", d.querySelector("#player").hidden);
  // B: AI key: one ✦ story from all three articles
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234";
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "state" }))); await wait(120);
  E.log.webSpoken = [];
  // a new set of links makes a new story; use AAPL (no story cached yet)
  tap('#c-fl-AAPL [data-act="listenstock"]'); await wait(1500);
  const pr = E.log.digestPrompt || "";
  console.log("B digest prompt: articles", (pr.match(/Article \d:/g) || []).length, "| has article text:", /according to people familiar/.test(pr), "| chars", pr.length);
  console.log("  spoken:", (E.log.webSpoken || []).join(" ").slice(0, 160));
  await wait(600);
  // C: Flash Listen (all open cards) with AI: queue across stocks
  E.log.webSpoken = [];
  tap('[data-act="listenflash"]'); await wait(2500);
  console.log("C flash listen spoke:", (E.log.webSpoken || []).length, "pieces | first:", (E.log.webSpoken || [])[0]);
  // D: TL;DR now has a story
  tap('#c-fl-NVDA .fl-h'); await wait(600);
  console.log("D tldr story paragraphs:", d.querySelectorAll("#newssheet .tl-story p").length, "| usage:", Object.keys(JSON.parse(E.files["/docs/Stockit/usage.json"]).p.anthropic.features).join(","));
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
