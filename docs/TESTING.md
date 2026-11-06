# Testing Stockit

Stockit is one Scriptable script, so it can't run in a normal test runner. The `tests/` folder runs the **real `Stockit.js`** in Node instead, with Scriptable's APIs replaced by stand-ins, and taps through the app the way a person would. The same setup takes the README's screenshots.

## Run the tests

```sh
cd tests
npm install          # jsdom; Playwright is optional, only for screenshots
node run.js          # all 28 scenarios, one line each (about 2½ minutes)
node run.js reader   # only those whose name contains "reader"
node run.js -v 25    # one scenario, printing everything it checks
```

A scenario **passes** when it finishes and reports no error from the script, from the page, or a crash. Every scenario also prints what it saw at each step (A, B, C…): read those lines with `-v` after a change, since most checks are things to look at (a value, a label, a prompt) rather than assertions.

Run them all before every release (see [RELEASING.md](RELEASING.md)); a release goes out only with 28 of 28 passing.

## How it works

**`tests/harness.js`** loads `Stockit.js` (or the file in `STOCKIT_SCRIPT`) into a Node `vm` with stand-ins for everything Scriptable provides:

| Scriptable | Stand-in |
|---|---|
| `WebView` | a [jsdom](https://github.com/jsdom/jsdom) page per `loadHTML`; `evaluateJavaScript` runs in it, and the page's `stockit://` bridge calls go back to the script, as on the phone |
| `Request` | answers from built-in fixtures, by URL: Yahoo Finance (prices, charts, search, quote summaries, news, consent pages), Google News (RSS, article pages, consent), publishers' pages, Jina Reader, StockTwits, Quiver Quantitative, the Claude and OpenAI APIs, GitHub (releases and updates). Nothing reaches the network |
| `FileManager` | files in memory (`E.files`), with options to simulate iCloud not delivering a file, a damaged file, or an empty first window |
| `Keychain` | in memory (`E.kc`); keys are fake |
| `Alert` | answers you queue with `E.log.pushAlert([...])` (text fields), `{ action: n }` (a button) or `{ cancel: true }` |
| `Speech`, `Notification`, `Safari`, `Photos`, `DocumentPicker`, `ListWidget`… | record what happened in `E.log` (spoken text, opened links, widget trees) |

`run(opts)` starts the script and returns `{ E, p }`: `E.getDom()` is the page (tap with `dispatchEvent(new MouseEvent("click"))`), `E.files` and `E.kc` the stored data, `E.log` what the script did (requests, alerts, toasts, AI request bodies, gauges fetched…), `E.finish()` closes the app, and `p` settles when the script ends. Useful options: `opts.checkPositions` (what the AI "reads" from broker screenshots), `opts.alertValues`, `opts.csv`, `opts.files` (start from saved data).

**The AI is simulated**: the Claude and OpenAI fixtures recognise each kind of prompt (briefing, story, ideas, TL;DR, strategies, portfolio check, assessment…) and answer with fixed JSON, and they keep the request so a test can check what Stockit sent (for example, that the assessment prompt carries the watchlist and the nine market gauges).

## The scenarios

| Test | Covers |
|---|---|
| 01 startup-and-basics | First start, adding stocks by pasting, refresh, rows, the stock page, the widget snapshot |
| 02 import-ai-widget-updates | CSV import, a screenshot import, switching AI provider when a key is missing, the empty widget, the update sheet and snoozing it |
| 03 flash-and-listening | The Flash tab, the TL;DR sheet, listening with the system voice, Google News headlines resolved to the publisher |
| 04 flash-folding | Folding Flash sections, staying folded, unfolding for a newer headline, fold all |
| 05 read-aloud-and-digest | The player, the AI digest prompt, Flash listening, TL;DR story paragraphs |
| 06 consent-and-stories | Tap targets, Yahoo's consent posts, the AI story panel |
| 07 safe-startup | The empty first window, reopening, a slow iCloud, the widget run, the start-up log |
| 08 market-hours | When each market opens and closes (weekends, Tokyo, US winter time, holidays from Yahoo) |
| 09 tabs-markets-strategies | Tabs, the Markets tab, market status on a stock, strategies in the ideas prompt |
| 10 home-currency | One currency for everything: automatic, EUR, pence (HSBA.L), today's change, the widget's value |
| 11 ideas | The Ideas tab: sections, folding, idea tiles, the loading sheet, adding an idea |
| 12 portfolio-check | Check against your broker: summary, fields, applying, removing |
| 13 suggested-strategies | Strategy suggestions: when they run, keep, dismiss, edit, how often |
| 14 privacy-mode | The eye: hidden amounts in rows, holdings, Flash and strategy text |
| 15 portfolio-check-values | The check prompt reads values and gains and ignores IBANs |
| 16 briefing-fold | The briefing folds after you leave the tab and stays folded until a new one |
| 17 session-gains | This session and the previous one, per stock and in total; markets not open yet; privacy |
| 18 reader-yahoo-consent | Reading Yahoo articles from Europe through the consent wall |
| 19 reader-original-and-retry | Original ↗ goes to the publisher; Try again refetches |
| 20 reader-google-news | Google News links through Google's consent, to the publisher or Jina Reader |
| 21 arrange-pin-highlight | Sorts, Arrange, dragging, pin to top, highlight, Mine order |
| 22 widget-pins | Stocks pinned to the widget; the compact cells, private amounts |
| 23 insider-trades | Quiver: no key, calls, the tile, Flash chip, insiders in the briefing prompt |
| 24 positions-several-markets | A second position in another currency: add, edit through Edit shares, remove |
| 25 cost-in-your-currency | A Canadian stock paid in euros: the gain matches the broker's; the check suggests the euro price |
| 26 ticker-links | NASDAQ:NRIX and $MSFT in an article open the stock above the reader |
| 27 at-a-glance | The At a glance grid: tiles, folding, opening a stock, privacy |
| 28 portfolio-assessment | The ✦ button, the prompt's contents, the report, Keep as a strategy, tickers |

## Add a test

Copy the closest scenario in `tests/cases/` to `NN-what-it-covers.test.js` and keep its shape: start with `run()`, tap through, print one line per step, and end with `console.log("errors:", …, "| JS errors:", E.log.jsErrors || "none")`, which is what `run.js` checks. If Stockit calls a new service, add its fixture to `harness.js` next to the others (match on the URL, answer with the smallest realistic JSON or HTML) and record what the test needs in `E.log`. For a new AI feature, answer its prompt in the AI fixture and save the prompt so the test can check it.

## Screenshots

```sh
cd tests
npm install playwright && npx playwright install chromium   # once
node screens/run.js       # PNGs in <tmp>/stockit-screens/shots, or $STOCKIT_SHOTS
```

`screens/snapshot.js` builds the sample portfolio with the harness (stocks, a briefing, ideas, strategies, insider trades, an assessment…) and saves the page; `render-widgets.js` draws the three widgets; `shots.js` and `more-shots.js` open the saved page in Chromium with Playwright, tap through and take the README's screenshots. Copy the ones that changed into `docs/screenshots/`.

## What it doesn't cover

Real network answers (Yahoo, Google and the AI change their pages and formats; check on the phone after such a change), how iOS draws widgets and native alerts, Shortcuts, Back Tap and the Action Button, and speed on a real phone. Those are checked on the iPhone before a release.
