const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234";
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96\nAAPL 12 @ 168"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1000);
  tap('[data-act="tab"][data-v="ideas"]'); await wait(40);
  console.log("A sections:", [...d.querySelectorAll(".fold-sec > summary")].map(s => s.textContent.replace(/\s+/g, " ").trim()).join(" | "));
  // themes in the Ideas tab
  console.log("  themes:", [...d.querySelectorAll(".theme")].map(t => t.firstChild.textContent).join(" / "));
  d.querySelector("#themeIn").value = "Pharma with AI partnerships"; d.querySelector("#themeIn").dispatchEvent(new w.Event("input", { bubbles: true }));
  tap('[data-act="themeadd"]'); await wait(60);
  tap('.theme [data-act="themerm"][data-v="0"]'); await wait(60);
  console.log("  after add and remove:", [...d.querySelectorAll(".theme")].map(t => t.firstChild.textContent).join(" / "), "| saved:", JSON.stringify(JSON.parse(E.files["/docs/Stockit/settings.json"]).cfg.ideaThemes));
  tap('[data-act="cfgopen"]'); await wait(30);
  console.log("  in Settings:", /Themes for ideas are in the/.test(d.querySelector("#cfgsheet").textContent), "| field gone:", !d.querySelector('#cfgsheet [data-k="ideaThemes"]'));
  tap('#cfgsheet [data-act="gotab"]'); await wait(40);
  // fold a section; it stays folded
  const sec = d.querySelector('.fold-sec[data-fold="strat"]'); sec.open = false; sec.dispatchEvent(new w.Event("toggle")); await wait(40);
  console.log("B strat folded saved:", JSON.stringify(JSON.parse(E.files["/docs/Stockit/settings.json"]).ideasFold));
  // ideas with numbers
  tap('[data-act="ideas"]'); await wait(1200);
  const card = d.querySelector(".idea");
  console.log("C idea tiles:", [...card.querySelectorAll(".tile small")].map(s => s.textContent).join(", "));
  console.log("  values:", [...card.querySelectorAll(".tile b")].slice(0, 7).map(b => b.textContent.replace(/\s+/g, " ")).join(" | "), "| sector:", (card.querySelector(".cap") || {}).textContent, "| trend:", (card.querySelector(".chip[class*=t-]") || {}).textContent);
  tap(card.querySelector('[data-act="ideaexplain"][data-v$="|rsi"]')); await wait(20);
  console.log("  explain:", (d.querySelector(".idea .explain") || {}).textContent.slice(0, 60));
  console.log("  temp market entries left:", Object.keys(JSON.parse(E.files["/docs/Stockit/market.json"] || "{}")).join(","));
  // open an idea like a stock on your lists
  const card2 = d.querySelector(".idea"), sym = card2.querySelector(".idea-open").dataset.v;
  tap(card2.querySelector(".idea-open")); await wait(5);
  console.log("D loading sheet:", d.querySelector("#detail").classList.contains("open"), "|", (d.querySelector("#detail .booting") || {}).textContent);
  await wait(400);
  const det = d.querySelector("#detail");
  console.log("  page:", det.querySelector("h2").textContent, "| price:", (det.querySelector(".dprice") || {}).textContent, "| sections:", [...det.querySelectorAll(".sec")].map(h => h.textContent).join(" / "));
  console.log("  technical tiles:", [...det.querySelectorAll(".tile small")].map(s => s.textContent).filter(t => /average|RSI/.test(t)).join(", "), "| headlines:", det.querySelectorAll(".news").length);
  tap('#detail [data-act="addpreview"][data-v="watch"]'); await wait(400);
  console.log("E added:", JSON.parse(E.files["/docs/Stockit/stocks.json"]).map(x => x.s + ":" + x.list).join(" "), "| page now shows Manage:", [...d.querySelectorAll("#detail .sec")].map(h => h.textContent).includes("Manage"));
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
