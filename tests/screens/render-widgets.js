const TMP = process.env.STOCKIT_TMP || require("path").join(require("os").tmpdir(), "stockit-screens");
const OUT = process.env.STOCKIT_SHOTS || require("path").join(TMP, "shots") + "/";
require("fs").mkdirSync(OUT, { recursive: true });
// Turns recorded Scriptable widget trees into HTML that mirrors Scriptable's layout, for README images.
const fs = require("fs");
const trees = JSON.parse(fs.readFileSync(TMP + "/widgets.json", "utf8"));
const icon = "data:image/png;base64," + fs.readFileSync(require("path").join(__dirname, "..", "..", "docs", "icon-1024.png")).toString("base64");
const SIZE = { small: [170, 170], medium: [364, 170], large: [364, 382] };
const rgba = c => { if (!c || !c.hex) return null; const h = c.hex.replace("#", ""); const n = parseInt(h.length === 3 ? h.split("").map(x => x + x).join("") : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${c.a == null ? 1 : c.a})`; };
const W = { bold: 700, semibold: 600, medium: 500, regular: 400 };
const weight = f => { const n = (f && f.name || "").toLowerCase(); return n.includes("semibold") ? 600 : n.includes("bold") ? 700 : n.includes("medium") ? 500 : 400; };
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
function node(n, parentVertical) {
  if (n.kind === "spacer") return n.n == null ? `<div style="flex:1 1 0"></div>` : `<div style="flex:none;${parentVertical ? "height" : "width"}:${n.n}px"></div>`;
  if (n.kind === "text") {
    const f = n.font || { size: 12 }, lines = n.lineLimit || 0;
    return `<div class="t${lines === 1 ? " fit" : ""}" data-fs="${f.size}" style="font-size:${f.size}px;font-weight:${weight(f)};color:${rgba(n.textColor) || "#fff"};${lines ? `-webkit-line-clamp:${lines};display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;` : ""}${lines === 1 ? "white-space:nowrap;text-overflow:ellipsis;display:block;overflow:hidden;" : ""}${n.center ? "text-align:center;" : ""}">${esc(n.text)}</div>`;
  }
  if (n.kind === "image") { const s = n.imageSize || { width: 20, height: 20 }; return `<img src="${icon}" style="flex:none;width:${s.width}px;height:${s.height}px;border-radius:${n.cornerRadius || 0}px">`; }
  const v = !!n.vertical, p = n.pad;
  const st = [`display:flex`, `flex-direction:${v ? "column" : "row"}`, `align-items:${n.align === "center" ? "center" : "flex-start"}`, `min-width:0`];
  if (n.spacing) st.push(`gap:${n.spacing}px`);
  if (p) st.push(`padding:${p[0]}px ${p[3]}px ${p[2]}px ${p[1]}px`);
  if (n.size && n.size.width) st.push(`width:${n.size.width}px;flex:none`);
  if (n.size && n.size.height) st.push(`height:${n.size.height}px`);
  if (n.backgroundColor) st.push(`background:${rgba(n.backgroundColor)}`);
  if (n.cornerRadius) st.push(`border-radius:${n.cornerRadius}px`);
  const flex = (n.children || []).some(c => c.kind === "spacer" && c.n == null);
  if (flex && !(n.size && n.size.width)) st.push(parentVertical ? (v ? "flex:1 1 auto;align-self:stretch" : "align-self:stretch") : (v ? "align-self:stretch;flex:1" : "flex:1 1 auto"));
  return `<div style="${st.join(";")}">${(n.children || []).map(c => node(c, v)).join("")}</div>`;
}
let html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:transparent;font-family:"Nunito","SF Pro Rounded",ui-rounded,system-ui,-apple-system,sans-serif}
.w{position:relative;border-radius:22px;overflow:hidden;display:flex;flex-direction:column;box-sizing:border-box}
.w>div{min-height:0}
.t{line-height:1.2;min-width:0;max-width:100%;box-sizing:border-box}
</style></head><body>`;
for (const [fam, t] of Object.entries(trees)) {
  const [w, h] = SIZE[fam], g = t.backgroundGradient;
  const bg = g && g.colors ? `linear-gradient(180deg,${g.colors.map(rgba).join(",")})` : rgba(t.backgroundColor) || "#0E1116";
  const p = t.pad || [14, 14, 14, 14];
  html += `<div id="${fam}" class="w" style="width:${w}px;height:${h}px;background:${bg};padding:${p[0]}px ${p[3]}px ${p[2]}px ${p[1]}px;margin:20px">${(t.children || []).map(c => node(c, true)).join("")}</div>`;
}
html += `<script>document.querySelectorAll(".fit").forEach(e => { let s = +e.dataset.fs; const min = s * 0.75; while (e.scrollWidth > e.clientWidth + 0.5 && s > min) { s -= 0.5; e.style.fontSize = s + "px"; } });</script>`;
fs.writeFileSync(TMP + "/widgets.html", html + "</body></html>");
console.log("ok");
