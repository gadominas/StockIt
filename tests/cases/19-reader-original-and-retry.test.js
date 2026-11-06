const { run } = require("../harness");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const errors = [];
  let { E, p } = await run({ consent: true, consentCopy: true, consentStuck: true }); p.catch(e => errors.push("SCRIPT " + e.stack)); await wait(250);
  let w = E.getDom().window, d = w.document;
  const tap = sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel; if (!el) throw new Error("no element " + sel); el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
  tap('[data-act="addopen"]'); await wait(30);
  d.querySelector("#paste").value = "NVDA 30 @ 96"; tap('[data-act="paste"]'); await wait(900);
  tap('[data-act="addclose"]'); tap('[data-act="refresh"]'); await wait(1000);
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "set", k: "readerProxy", v: false }))); await wait(30);
  const news = JSON.parse(E.files["/docs/Stockit/market.json"]).NVDA.news, y = news.find(n => n.l.includes("finance.yahoo")), g = news.find(n => n.l.includes("news.google"));
  // open the Yahoo headline in the reader through the page's own flow
  tap('[data-act="tab"][data-v="flash"]'); await wait(30);
  tap(`.fl-h[data-v="${y.l}"]`); await wait(300); tap('[data-act="rdopen"]'); await wait(500);
  const blk = d.querySelector("#reader .rd-blocked");
  console.log("A reader:", blk ? blk.querySelector("b").textContent : "(not blocked)", "| buttons:", blk ? [...blk.querySelectorAll("button")].map(b => b.textContent).join(", ") : "", "| trace:", blk && blk.querySelector(".rd-trace") ? [...blk.querySelectorAll(".rd-trace li")].map(l => l.textContent).join(" → ") : "none");
  const before = (E.log.consentPosts || []).length + "/" + (E.log.copyConsent || 0);
  tap('#reader [data-act="rdrefetch"]'); await wait(20);
  console.log("  Try again shows loading:", !!d.querySelector("#reader .rd-wait")); await wait(500);
  console.log("  after Try again: reader", d.querySelector("#reader .rd-blocked") ? "blocked again (expected: still a consent wall)" : "read", "| consent tried again:", before, "→", (E.log.consentPosts || []).length + "/" + (E.log.copyConsent || 0));
  // Original for a Google News link opens the publisher
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "open", orig: true, id: "art-" + g.l }))); await wait(200);
  console.log("B Original for", g.l, "opened", E.log.opened.slice(-1)[0]);
  w.__nav("stockit://a?d=" + encodeURIComponent(JSON.stringify({ type: "openlink", v: g.l }))); await wait(200);
  console.log("  openlink:", E.log.opened.slice(-1)[0]);
  E.finish(); await p;
  console.log("errors:", errors.length ? errors.join("; ") : "none", "| JS errors:", E.log.jsErrors || "none");
  process.exit(0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
