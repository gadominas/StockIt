#!/usr/bin/env node
// Builds the sample portfolio and takes the README screenshots (see docs/TESTING.md).
//   node tests/screens/run.js            → PNGs in $STOCKIT_SHOTS or <tmp>/stockit-screens/shots/
// Needs Playwright with Chromium: cd tests && npm i playwright && npx playwright install chromium
const { execFileSync } = require("child_process"), path = require("path");
// The broker-check screens reuse results that tests 12 and 15 save; run them first if they haven't been
const fs = require("fs"), os = require("os");
for (const [f, t] of [["stockit-check.json", "12-portfolio-check"], ["stockit-check2.json", "15-portfolio-check-values"]])
  if (!fs.existsSync(path.join(os.tmpdir(), f))) { console.log("› tests/cases/" + t); execFileSync(process.execPath, [path.join(__dirname, "..", "cases", t + ".test.js")], { stdio: "ignore", timeout: 300e3 }); }
for (const s of ["snapshot.js", "render-widgets.js", "shots.js", "more-shots.js"]) {
  console.log("› " + s);
  execFileSync(process.execPath, [path.join(__dirname, s)], { stdio: "inherit", timeout: 600e3 });
}
const TMP = process.env.STOCKIT_TMP || path.join(require("os").tmpdir(), "stockit-screens");
console.log("Screenshots in " + (process.env.STOCKIT_SHOTS || path.join(TMP, "shots")));
