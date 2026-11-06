// Market hours math, lifted from the page code and run at fixed moments.
const src = require("fs").readFileSync(process.env.STOCKIT_SCRIPT || require("path").join(__dirname, "..", "..", "Stockit.js"), "utf8");
const a = src.indexOf("  const MKTS = ["), b = src.indexOf("  function mkText(");
const code = src.slice(a, b) + "\nreturn { MK, mktOf, mktStatus, dur, sessions };";
const { MK, mktOf, mktStatus, dur } = new Function(code)();
const at = (iso, mk, tp) => { const st = mktStatus(MK[mk], tp, Date.parse(iso)), now = Date.parse(iso);
  return `${mk}: ${st.open ? "OPEN, closes in " + dur(st.closesAt - now) : st.lunch ? "LUNCH, reopens in " + dur(st.opensAt - now) : "closed, opens in " + dur(st.opensAt - now) + " (" + new Date(st.opensAt).toISOString().slice(0, 16) + "Z)"}`; };
const t = "2026-10-30T14:00:00Z";   // Friday: New York on summer time until 1 Nov, Europe on winter time since 25 Oct
console.log("Fri 14:00Z:", ["us", "xetra", "lse", "baltic", "tokyo", "sydney"].map(m => at(t, m)).join(" | "));
console.log("Sat 12:00Z:", ["us", "xetra"].map(m => at("2026-10-31T12:00:00Z", m)).join(" | "));
console.log("Mon 03:00Z (Tokyo noon):", at("2026-11-02T03:00:00Z", "tokyo"), "|", at("2026-11-02T03:00:00Z", "hongkong"));
console.log("Mon 14:00Z, NY on winter time now:", at("2026-11-02T14:00:00Z", "us"), "|", at("2026-11-02T14:30:00Z", "us"));
// Yahoo's next session later than the usual one: a holiday (Thanksgiving, Thu 26 Nov 2026)
const holiday = { start: Date.parse("2026-11-27T14:30:00Z"), end: Date.parse("2026-11-27T18:00:00Z") };
console.log("Thanksgiving 16:00Z with Yahoo's period:", at("2026-11-26T16:00:00Z", "us", holiday), "| without:", at("2026-11-26T16:00:00Z", "us"));
console.log("mktOf:", ["NVDA", "VOW3.DE", "SND.DE", "TEL1L.VS", "BTC-USD", "7203.T", "ASML.AS", "^GSPC"].map(s => s + "→" + (mktOf({ s }) || {}).id).join(" "));
