const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = [];
  process.on("unhandledRejection", e => errors.push("UNHANDLED " + (e.stack || e)));
  let { E, p } = await run({});
  p.catch(e => errors.push("SCRIPT " + e.stack));
  await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "AAPL 12 @ 168\nNVDA 30 @ 96\nKO"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1200);
  console.log("tabs:", d.querySelector("#tabs").textContent);
  tap('[data-act="tab"][data-v="flash"]'); await wait(80);
  const rows = [...d.querySelectorAll(".fl")];
  console.log("A flash rows:", rows.map(r => r.querySelector(".fl-s b").textContent + "=" + r.querySelectorAll(".fl-h").length).join(" "), "| listbar:", d.querySelector(".listbar").textContent.trim().replace(/\s+/g, " "));
  console.log("  first NVDA headline:", d.querySelector('#c-fl-NVDA .fl-h b').textContent);
  // no key: extracted TL;DR
  tap('#c-fl-NVDA .fl-h'); await wait(40);
  console.log("B sheet open:", d.querySelector("#newssheet").classList.contains("open"), "| loading:", !!d.querySelector("#newssheet .tli-load"));
  await wait(500);
  const ns = () => d.querySelector("#newssheet");
  console.log("  no-AI tldr:", ns().querySelector(".tli-top") && ns().querySelector(".tli-top").textContent.trim(), "| lead:", (ns().querySelector(".tl-lead") || {}).textContent, "| points:", ns().querySelectorAll(".tl-pts li").length);
  console.log("  read full:", ns().querySelector(".primary.block").textContent, "->", ns().querySelector(".primary.block").dataset.v, "| more:", ns().querySelectorAll(".news").length);
  tap('#newssheet [data-act="listentldr"]'); await wait(200);
  console.log("C spoken (system voice fallback):", (E.log.spoken || []).map(t => t.slice(0, 80)).join(" | "));
  const ol = d.querySelector('#newssheet [data-act="openlink"]');   // with the reader on (the default) the sheet offers Read the full article instead
  if (ol) { tap(ol); await wait(80); console.log("  opened:", E.log.opened.slice(-1)[0]); } else console.log("  reads in Stockit's reader:", !!d.querySelector('#newssheet [data-act="rdopen"]'));
  tap('#newssheet [data-act="newsclose"]'); await wait(50);
  console.log("  closed:", !ns().classList.contains("open"), "| body locked:", d.body.classList.contains("locked"));
  // a Google News headline: resolved to the publisher
  const web = [...d.querySelectorAll(".fl-h")].find(b => b.dataset.v.includes("news.google.com"));
  if (web) { tap(web); await wait(500); console.log("D web headline resolved url:", ns().querySelector(".primary.block").dataset.v, "| kind:", ns().querySelector(".tli-top").textContent.trim()); tap('#newssheet [data-act="newsclose"]'); }
  // AI key: AI TL;DR and AI voice
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234"; E.kc["STOCKIT_OPENAI_KEY"] = "sk-proj-XYZ9876543210abcd";
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "state" }))); await wait(120);
  tap('#c-fl-AAPL .fl-h'); await wait(500);
  console.log("E AI tldr:", ns().querySelector(".tli-top").textContent.trim(), "|", ns().querySelector(".tl-lead").textContent, "| why:", (ns().querySelector(".tl-why") || {}).textContent);

  tap('#newssheet [data-act="newsclose"]');
  // settings: Listening section
  tap('[data-act="cfgopen"]'); await wait(80);
  const cfgText = d.querySelector("#cfgsheet").textContent;
  console.log("F settings has Listening:", /Listening/.test(cfgText), "| sections:", [...d.querySelectorAll("#cfgsheet .sec")].map(h => h.textContent).join(" / "));
  tap('[data-act="voiceset"][data-k="speechEngine"][data-v="ai"]'); await wait(80);
  console.log("  AI voice options:", !!d.querySelector(".ttsvoicesel"), d.querySelectorAll(".ttsvoicesel option").length, "voices | saved engine:", JSON.parse(E.files["/docs/Stockit/settings.json"]).speechEngine);
  tap('[data-act="cfgclose"]');
  const r = await new Promise(res => { w.__done = ((orig) => (req, ok, msg) => { res([ok, msg]); })(w.__done); w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "ttsaudio", text: "Hello there.", req: "rX" }))); });
  console.log("G ttsaudio:", r[0], String(r[1]).slice(0, 16));
  const u = JSON.parse(E.files["/docs/Stockit/usage.json"]);
  console.log("  usage features:", Object.keys(u.p.anthropic.features).join(","), "| speech chars:", u.p.openai && u.p.openai.features.speech && u.p.openai.features.speech.chars);
  // briefing listen button + flash listen
  tap('[data-act="tab"][data-v="flash"]'); await wait(50);
  console.log("H flash listen button:", !!d.querySelector('[data-act="listenflash"]'), "| tldr cache saved:", Object.keys(JSON.parse(E.files["/docs/Stockit/tldrs.json"])).length);
  E.finish(); await p;
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none", "| JS errors:", E.log.jsErrors || "none", "| console.error:", E.log.consoleErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
