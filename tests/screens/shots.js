const TMP = process.env.STOCKIT_TMP || require("path").join(require("os").tmpdir(), "stockit-screens");
const OUT = process.env.STOCKIT_SHOTS || require("path").join(TMP, "shots") + "/";
require("fs").mkdirSync(OUT, { recursive: true });
const { chromium } = require("playwright");
const rel = require("../../releases.json").releases[0];
const FONT = ":root{--sans:Inter,system-ui,sans-serif !important} html,body{font-family:Inter,system-ui,sans-serif}";
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const open = async (scheme = "light", skipSplash = true) => {
    const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
    await pg.goto("file://" + TMP + "/page.html"); await pg.addStyleTag({ content: FONT });
    if (skipSplash) { await pg.waitForTimeout(3100); }
    return pg;
  };
  const shot = (pg, n) => pg.screenshot({ path: OUT + n + ".png" });
  const tap = (pg, sel) => pg.click(sel);
  const scrollEl = (pg, sel, y) => pg.evaluate(([s, y]) => { const e = document.querySelector(s); e.scrollTo(0, typeof y === "number" ? y : e.querySelector(y).offsetTop - 70); }, [sel, y]);

  let pg = await open("light", false);
  await pg.waitForTimeout(1500); await shot(pg, "launch");
  await pg.waitForTimeout(1800); await shot(pg, "01-portfolio");
  await tap(pg, '[data-act="brieffull"]'); await pg.waitForTimeout(200);
  await pg.evaluate(() => { const e = document.querySelector('[data-act="brieffull"]'); window.scrollTo(0, (e.closest("section,article,div").offsetTop || 0) - 120); });
  await pg.waitForTimeout(150); await shot(pg, "02-briefing");
  await pg.close();

  pg = await open();
  await tap(pg, '.row[data-v="NVDA"]'); await pg.waitForTimeout(400); await shot(pg, "03-stock");
  await scrollEl(pg, "#detail", ".story"); await pg.waitForTimeout(200); await shot(pg, "04-story");
  await tap(pg, '#detail [data-act="explain"]'); await pg.waitForTimeout(200);
  await scrollEl(pg, "#detail", ".tiles"); await pg.waitForTimeout(200); await shot(pg, "05-numbers");
  await scrollEl(pg, "#detail", 99999); await pg.waitForTimeout(200); await shot(pg, "06-headlines");
  await tap(pg, '[data-act="close"]'); await pg.waitForTimeout(300);
  await tap(pg, '[data-act="tab"][data-v="watch"]'); await pg.waitForTimeout(250); await shot(pg, "07-watchlist");
  await tap(pg, '[data-act="tab"][data-v="ideas"]'); await pg.waitForTimeout(250); await shot(pg, "08-ideas");
  await tap(pg, '[data-act="tab"][data-v="own"]'); await pg.waitForTimeout(150);
  await tap(pg, '[data-act="addopen"]'); await pg.waitForTimeout(400);
  await pg.fill("#q", "coca cola"); await shot(pg, "09-add");
  await tap(pg, '[data-act="addclose"]'); await pg.waitForTimeout(300);
  await tap(pg, '[data-act="cfgopen"]'); await pg.waitForTimeout(400); await shot(pg, "10-settings");
  await tap(pg, '[data-act="aiopen"]'); await pg.waitForTimeout(400); await shot(pg, "11-ai-settings");
  await scrollEl(pg, "#aisheet", ".ucard"); await pg.waitForTimeout(200); await shot(pg, "12-ai-usage");
  await tap(pg, '[data-act="aiclose"]'); await pg.waitForTimeout(300);
  // Appearance: Sepia and Compact
  await tap(pg, '[data-act="look"][data-k="theme"][data-v="sepia"]'); await pg.waitForTimeout(100);
  await tap(pg, '[data-act="look"][data-k="density"][data-v="compact"]'); await pg.waitForTimeout(100);
  await tap(pg, '[data-act="cfgclose"]'); await pg.waitForTimeout(400); await shot(pg, "14-sepia-compact");
  await pg.close();

  pg = await open();
  await pg.evaluate(r => window.__showUpdate({ current: "0.9.0", latest: r.version, title: r.title, date: r.date, skipped: 1, highlights: r.highlights }), rel);
  await pg.waitForTimeout(500); await shot(pg, "13-update");
  await pg.close();

  pg = await open("dark"); await shot(pg, "15-portfolio-dark"); await pg.close();


  // Flash, TL;DR and read aloud
  pg = await open();
  await tap(pg, '[data-act="tab"][data-v="flash"]'); await pg.waitForTimeout(300); await shot(pg, "16-flash");
  const link = await pg.getAttribute('#c-fl-NVDA .fl-h', "data-v");
  await tap(pg, '#c-fl-NVDA .fl-h'); await pg.waitForTimeout(150);
  await pg.evaluate(l => window.onTldr(l, { kind: "ai", by: "anthropic", at: Date.now(), mins: 4, partial: false, url: l,
    lead: "NVIDIA has started mass-producing its next generation of AI chips, on schedule, as cloud companies keep raising what they plan to spend on data centres.",
    story: "NVIDIA says volume production of its next-generation chips began this month, the timeline it set out in the spring. The new chips are aimed at the data centres that train and run AI models, NVIDIA's biggest business by far.\n\nThe start comes as Microsoft, Amazon, Alphabet and Meta have all lifted their spending plans for next year, and suppliers say early orders already exceed what can be built this year.",
    points: ["Volume production of the new chips began this month, matching the timeline NVIDIA gave in the spring", "The biggest cloud companies have raised their spending plans for next year", "Early supply is limited, so most of this year's chips are already spoken for", "Rivals and in-house chips from big customers are the main competitive threat"],
    why: "If the new chips ship on time and in volume, sales can keep growing into next year; any delay or a cut in cloud spending would hit the outlook that today's share price already expects." }), link);
  await pg.waitForTimeout(400); await shot(pg, "17-tldr");
  await pg.evaluate(() => {   // show the reading-aloud bar as it looks while a TL;DR is read
    const pl = document.querySelector("#player"); pl.hidden = false; document.body.classList.add("playing");
    document.querySelector("#plTitle").textContent = "Nvidia's next-generation chips enter volume production";
    document.querySelector("#plSub").textContent = "TL;DR";
    document.querySelector("#plPause").innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
    document.querySelector("#newssheet").scrollTo(0, 260);
  });
  await pg.waitForTimeout(300); await shot(pg, "18-listen");
  await pg.evaluate(() => { document.querySelector("#player").hidden = true; document.body.classList.remove("playing"); });
  await tap(pg, '[data-act="newsclose"]'); await pg.waitForTimeout(300);
  await tap(pg, '[data-act="cfgopen"]'); await pg.waitForTimeout(400);
  await pg.evaluate(() => { const sh = document.querySelector("#cfgsheet"); const h = [...sh.querySelectorAll(".sec")].find(x => x.textContent === "Listening"); sh.scrollTo(0, h.offsetTop - 70); }); await pg.waitForTimeout(200); await shot(pg, "19-listening");
  await pg.close();
  // widgets
  pg = await b.newPage({ viewport: { width: 820, height: 1400 }, deviceScaleFactor: 3 });
  await pg.goto("file://" + TMP + "/widgets.html"); await pg.waitForTimeout(300);
  for (const f of ["small", "medium", "large"]) await (await pg.$("#" + f)).screenshot({ path: OUT + "widget-" + f + ".png", omitBackground: true });
  await b.close();
})().catch(e => { console.log("FAIL", e.message); process.exit(1); });
