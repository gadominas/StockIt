const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = []; process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let { E, p } = await run({}); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  const inp = (sel, v) => { const el = d.querySelector(sel); el.value = v; el.dispatchEvent(new w.Event("input", { bubbles: true })); };
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234";
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96\nAAPL 12 @ 168"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1300);
  console.log("A after refresh: suggestion runs", E.log.stratCalls || 0, "(due on first refresh)");
  tap('[data-act="tab"][data-v="ideas"]'); await wait(200);
  console.log("  opening Ideas again doesn't repeat it:", E.log.stratCalls);
  inp("#stratText", "When Nike recovers, sell it and buy a pharma company"); tap('[data-act="stratadd"]'); await wait(80);
  console.log("B suggestions:", d.querySelectorAll(".sg").length, "|", [...d.querySelectorAll(".sg .strat-t")].map(e => e.textContent.slice(0, 40)).join(" / "));
  console.log("  every:", d.querySelector("#stratEvery").value, "| ticker chips:", [...d.querySelectorAll(".sg-tk .chip")].map(c => c.textContent + ":" + c.dataset.act).join(" "));
  // keep one as is, edit one then keep, dismiss one
  tap('.sg [data-act="sgkeep"]'); await wait(80);
  tap('.sg [data-act="sgedit"]'); await wait(30);
  inp(".sg-in[data-f=\"text\"]", "I'll buy JNJ in two parts, in December and January."); inp(".sg-in[data-f=\"when\"]", "December and January");
  tap('.sg [data-act="sgkeep"]'); await wait(80);
  tap('.sg [data-act="sgdismiss"]'); await wait(80);
  const st = JSON.parse(E.files["/docs/Stockit/strategies.json"]);
  console.log("C strategies:", st.map(g => `${g.text.slice(0, 32)}… [${g.when}] ${g.from || ""}`).join(" | "), "| suggestions left:", d.querySelectorAll(".sg").length);
  // edit my own strategy
  console.log("  dbg before:", [...d.querySelectorAll('.strat > .strat-c [data-act="stratedit"]')].map(b => b.dataset.v).join(","), JSON.parse(E.files["/docs/Stockit/strategies.json"]).map(g => g.id).join(","));
  const first = d.querySelector('.strat > .strat-c [data-act="stratedit"]'); tap(first); await wait(30);
  inp("#stratEditText", "When Nike is back at my average price, sell it and buy Novo Nordisk"); inp("#stratEditWhen", "NKE at $80");
  tap('[data-act="stratsave"]'); await wait(80);
  console.log("  dbg cards:", [...d.querySelectorAll(".strat > .strat-c")].map(x => x.className + ":" + x.textContent.replace(/\s+/g, " ").slice(0, 70)).join(" || "));
  console.log("D edited:", JSON.parse(E.files["/docs/Stockit/strategies.json"]).find(g => g.editedAt).text, "| shown:", [...d.querySelectorAll(".strat > .strat-c small")].some(s2 => /changed/.test(s2.textContent)));
  // schedule: every 6 hours, then a stale suggestion refreshes when Ideas opens
  const sel = d.querySelector("#stratEvery"); sel.value = "6"; sel.dispatchEvent(new w.Event("change", { bubbles: true })); await wait(60);
  console.log("E saved every:", JSON.parse(E.files["/docs/Stockit/settings.json"]).cfg.stratEvery);
  E.finish(); await p;
  const ins = JSON.parse(E.files["/docs/Stockit/insights.json"]); ins.stratSuggest.at -= 7 * 3600e3; E.files["/docs/Stockit/insights.json"] = JSON.stringify(ins);
  const calls0 = E.log.stratCalls;
  ({ E, p } = await run({ files: E.files, kc: E.kc })); await wait(400); w = E.getDom().window; d = w.document;
  console.log("F stale after 7 h with every 6 h: refreshed on open:", (E.log.stratCalls || 0) > 0, "| prompt has my strategies and watchlist:", /When Nike is back/.test(E.log.stratPrompt || ""), /Watching:/.test(E.log.stratPrompt || ""));
  tap('[data-act="tab"][data-v="ideas"]'); await wait(60);
  console.log("  where it stands from suggestions:", (d.querySelector(".strat-ai") || {}).textContent);
  tap('[data-act="cfgopen"]'); await wait(30); tap('#cfgsheet [data-act="aiopen"]'); await wait(30);
  console.log("  AI sheet switch:", !!d.querySelector('#aisheet [data-v="aiStrat"]'), "|", d.querySelector('#aisheet [data-v="aiStrat"]').closest(".srow").querySelector("small").textContent);
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
