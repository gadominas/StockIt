const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
async function scenario(label, opts) {
  const errors = [];
  let { E, p } = await run(opts); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => d.querySelector(sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1000);
  const g = JSON.parse(E.files["/docs/Stockit/market.json"]).NVDA.news.find(n => n.l.includes("news.google"));
  const got = await new Promise(res => { w.onReader = (id, r) => res(r); w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "reader", id: "art-" + g.l }))); });
  console.log(`${label}: ${got.blocked ? "BLOCKED (" + got.blocked + ")" : got.words + " words" + (got.via ? " via " + got.via : "")} | Google consent shown ${E.log.googleConsentShown || 0}, answered ${(E.log.googleConsentPosts || []).length}${(E.log.googleConsentPosts || [])[0] ? " (" + E.log.googleConsentPosts[0].slice(0, 60) + ")" : ""}, title searches ${(E.log.titleSearch || []).length}, Jina ${(E.log.jina || []).length}`);
  const k = Object.keys(E.files).find(f => f.endsWith("stockit-startup.log"));
  console.log("   log:", (E.files[k] || "").split("\n").filter(l => /Google|Yahoo|Jina|not read/.test(l)).map(l => l.slice(10)).join(" / ").slice(0, 400));
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "open", orig: true, id: "art-" + g.l }))); await wait(200);
  console.log("   Original opens:", E.log.opened.slice(-1)[0]);
  E.finish(); await p;
  console.log("   errors:", errors.length ? errors.join("; ") : "none", "| JS errors:", E.log.jsErrors || "none");
}
(async () => {
  await scenario("A Google consent answered", { gconsent: true, consent: true });
  await scenario("B Google consent can't be answered: the same story on Yahoo", { gconsent: true, gstuck: true, consent: true });
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
