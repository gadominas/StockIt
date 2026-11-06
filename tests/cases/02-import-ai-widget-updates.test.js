const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  // A. CSV import (IBKR / Trading212 style headers, semicolons, decimal commas, duplicate rows averaged)
  const csv = 'Ticker;Name;No. of shares;Average price;Currency\nAAPL;Apple;5;140,00;USD\nAAPL;Apple;5;160,00;USD\nNVDA;Nvidia;"2";100;USD\nCASH;Cash;0;0;USD\n';
  let { E, p } = await run({ csv });
  await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => (typeof sel === "string" ? d.querySelector(sel) : sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  tap('[data-act="addopen"]'); await wait(30); tap('[data-act="csv"]'); await wait(700);
  console.log("A csv:", d.querySelector("#toast").textContent, "|", JSON.parse(E.files["/docs/Stockit/stocks.json"]).map(x => `${x.s}:${x.list}:${x.sh}@${x.cost}`).join(" "));
  // B. screenshot request: image block first, then text, with max_tokens
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-xxxxxxxxxxxxxxxx9999"; w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "state" }))); await wait(80);
  tap('[data-act="shot"]'); await wait(600);
  const img = E.log.aiBodies.find(b => Array.isArray(b.messages[0].content));
  console.log("B shot request:", img && img.messages[0].content.map(c => c.type).join("+"), "| media:", img && img.messages[0].content[0].source.media_type, "| max_tokens:", img && img.max_tokens);
  E.finish(); await p;

  // C. OpenAI path omits max_tokens
  ({ E, p } = await run({ kc: { STOCKIT_OPENAI_KEY: "sk-openai-zzzzzzzzzzzz1111" } }));
  await wait(200); w = E.getDom().window; d = w.document;
  console.log("C provider auto-switched to OpenAI:", d.querySelector("#tabs").textContent.includes("Ideas"));
  E.finish(); await p;

  // D. widget run with an existing store: no WebView, renders, uses snapshot
  const files = { "/docs/Stockit/stocks.json": JSON.stringify([{ s: "AAPL", list: "own", sh: 3 }, { s: "NVDA", list: "watch" }]), "/docs/Stockit/settings.json": JSON.stringify({ widgetMoney: true, lastRefresh: Date.now() - 3 * 3600e3 }) };
  for (const fam of ["small", "medium", "large", "accessoryInline", "accessoryCircular", "accessoryRectangular"]) {
    ({ E, p } = await run({ widget: true, family: fam, files: JSON.parse(JSON.stringify(files)) }));
    await p;
    const wg = E.log.widgets[0];
    const texts = []; (function walk(n) { if (!n) return; if (n.text != null) texts.push(n.text); (n.children || []).forEach(walk); })(wg);
    console.log(`D widget ${fam}:`, E.getDom() ? "WEBVIEW BUILT!" : "no webview", "|", texts.join(" ¦ ").slice(0, 150));
  }
  // E. widget with no stocks → empty state; widget with model throwing → still renders
  ({ E, p } = await run({ widget: true, family: "medium" })); await p;
  const t2 = []; (function walk(n) { if (!n) return; if (n.text != null) t2.push(n.text); (n.children || []).forEach(walk); })(E.log.widgets[0]);
  console.log("E empty widget:", t2.join(" ¦ "));

  // F. update offer: newer release → sheet with highlights; Later snoozes for 2 days
  ({ E, p } = await run({ releases: { script: "Stockit.js", releases: [{ version: "1.40.0", title: "Sharper signals", highlights: [{ icon: "📈", title: "One", text: "a" }, { icon: "🧭", title: "Two", text: "b" }, { icon: "✨", title: "Three", text: "<i>c</i>" }] }, { version: "1.0.0" }] } }));
  await wait(300); w = E.getDom().window; d = w.document;
  const upd = d.querySelector("#upd");
  console.log("F update sheet:", upd && upd.textContent.replace(/\s+/g, " ").slice(0, 120), "| escaped:", upd && upd.innerHTML.includes("&lt;i&gt;"));
  d.querySelector('[data-act="upd-now"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await wait(300);
  console.log("  after Update now:", d.querySelector("#upd .updmsg").textContent, "| wrote script:", (E.files["/docs/Stockit.js"] || "").slice(0, 26));
  E.finish(); await p;
  ({ E, p } = await run({ releases: { releases: [{ version: "1.40.0", highlights: [] }] } }));
  await wait(300); w = E.getDom().window; d = w.document;
  d.querySelector('[data-act="upd-later"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await wait(200);
  const snooze = E.kc["stockit-update-snooze"];
  console.log("  Later snooze hours:", snooze && ((+snooze - Date.now()) / 3600e3).toFixed(1));
  E.finish(); await p;
  console.log("JS errors:", E.log.jsErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
