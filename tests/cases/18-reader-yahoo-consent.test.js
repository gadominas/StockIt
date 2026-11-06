const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
async function scenario(label, opts, setup) {
  const errors = [];
  let { E, p } = await run(opts); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => d.querySelector(sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  E.kc["STOCKIT_ANTHROPIC_KEY"] = "sk-ant-api03-ABCDEFGHIJKLMNOP1234";
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1000);
  if (setup) setup(E, w);
  const link = JSON.parse(E.files["/docs/Stockit/market.json"]).NVDA.news.find(n => n.l.includes("finance.yahoo.com")).l;
  const got = await new Promise(res => { w.onReader = (id, r) => res(r); w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "reader", id: "art-" + link }))); });
  console.log(`${label}: ${got.blocked ? "BLOCKED (" + got.blocked + ")" : got.words + " words" + (got.via ? " via " + got.via : " from the page")} | consent posts ${(E.log.consentPosts || []).length}, copyConsent ${E.log.copyConsent || 0}, Jina ${(E.log.jina || []).length}`);
  if (!got.blocked && got.via) console.log("   first blocks:", got.blocks.slice(0, 3).map(b => b.t + ": " + b.text.slice(0, 50)).join(" | "), "| nav skipped:", !got.blocks.some(b => /Home News Finance/.test(b.text)));
  // a TL;DR of the same headline
  const tl = await new Promise(res => { w.onTldr = (id, r) => res(r); w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "tldr", s: "NVDA", l: link, id: link }))); });
  console.log("   TL;DR:", tl.error ? "error " + tl.error : (tl.partial ? "headline only" : "from the article") + ", " + tl.kind);
  const log = FileManagerLog(E); if (log) console.log("   start-up log:", log);
  E.finish(); await p;
  console.log("   errors:", errors.length ? errors.join("; ") : "none", "| JS errors:", E.log.jsErrors || "none");
}
const FileManagerLog = E => { const k = Object.keys(E.files).find(f => f.endsWith("stockit-startup.log")); return k ? E.files[k].split("\n").filter(l => /Yahoo|Jina/.test(l)).join(" / ") : ""; };
(async () => {
  await scenario("A Europe, consent answered", { consent: true });
  await scenario("B Europe, Yahoo's cookies arrive on copyConsent only", { consent: true, consentCopy: true });
  await scenario("C Europe, consent can't be answered", { consent: true, consentCopy: true, consentStuck: true });
  await scenario("D same, Jina Reader off", { consent: true, consentCopy: true, consentStuck: true }, (E, w) => { w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "set", k: "readerProxy", v: false }))); });
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
