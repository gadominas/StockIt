<div align="center">

<img src="docs/logo.svg" width="112" alt="Stockit logo: a price line climbing through a faint chart frame to an emerald dot, with a blue average line underneath">

# Stockit

**Track. Read. Decide.**

Your stocks, the news around them and a plain-English story of what's going on.<br>Prices, key numbers explained, a Flash of top headlines with a TL;DR for each, and an optional AI briefing you can listen to.

An iPhone and iPad app for [Scriptable](https://scriptable.app). One file. No account, no server, no subscription.

[![Version](https://img.shields.io/badge/version-1.5.0-1d4ed8)](CHANGELOG.md)
[![Platform](https://img.shields.io/badge/iOS-Scriptable-0f172a)](https://apps.apple.com/app/scriptable/id1405459188)
[![AI](https://img.shields.io/badge/AI-Claude%20or%20OpenAI%2C%20optional-8b5cf6)](#ai-on-your-terms)
[![Not financial advice](https://img.shields.io/badge/not-financial%20advice-b91c1c)](#not-financial-advice)
[![License](https://img.shields.io/badge/license-MIT-15803d)](LICENSE)

<img src="docs/screenshots/01-portfolio.png" width="200" alt="Portfolio: value, today's change, gain since you bought, the AI briefing and your holdings">&nbsp;
<img src="docs/screenshots/launch.png" width="200" alt="Launch screen: the Stockit price line draws itself, then the tagline Track. Read. Decide.">&nbsp;
<img src="docs/screenshots/03-stock.png" width="200" alt="NVIDIA's page: price, one-year chart, your position and Stockit's view">&nbsp;
<img src="docs/screenshots/04-story.png" width="200" alt="The AI story for NVIDIA: what's happening, why buy, what could go wrong and what to watch">

<sub>Your portfolio with the daily briefing · the launch screen · a stock's page · the story behind a stock</sub>

</div>

> [!IMPORTANT]
> **Stockit is not a financial adviser, and nothing in it is financial advice.** Buy, hold and sell views are opinions an AI model writes from the prices, numbers and headlines shown in the app. They can be wrong, late or incomplete. Do your own research and talk to a licensed adviser before you invest. See [Not financial advice](#not-financial-advice).

> Screenshots show sample stocks, prices and headlines.

## Install in under a minute

You need an iPhone or iPad and the free **[Scriptable](https://apps.apple.com/app/scriptable/id1405459188)** app. Nothing else: no computer, no account, no sign-up.

1. Install **Scriptable** from the App Store and open it.
2. Tap **+**, paste the contents of [`Install Stockit.js`](Install%20Stockit.js), and tap **Run** (▶).
3. Tap **Open Stockit** and add your first stocks: search by name or ticker, paste a list like `AAPL 10 @ 150`, open a broker CSV, or use a screenshot.

That's it. From now on Stockit tells you when a new version is out and updates itself with one tap.

<details>
<summary><b>Prefer to install by hand?</b></summary>

- **Download the file:** save [`Stockit.js`](Stockit.js) to **iCloud Drive › Scriptable**. It appears in Scriptable automatically.
- **Copy and paste:** in Scriptable, tap **+**, paste the whole of `Stockit.js`, and name the script *Stockit*.

</details>

**Three optional extras, each takes a minute:**

- **Add AI:** open **Settings › AI settings**, tap **Add key**, and paste a [Claude](https://console.anthropic.com/settings/keys) or [OpenAI](https://platform.openai.com/api-keys) API key. This switches on the daily briefing, a story and a view per stock, ideas and screenshot import.
- **Add the widget:** see [Home-screen widget](#home-screen-widget).
- **Put Stockit on your Home Screen:** make a Shortcut with **Run Script › Stockit**, add it to the Home Screen, and use [`docs/icon-1024.png`](docs/icon-1024.png) as its icon.

## Why Stockit

Most stock apps show you a price and a wall of headlines. Stockit is made for a casual investor who wants to know, in a couple of minutes a day, **how their money did and why**.

- **It opens on your money.** Portfolio value, today's change and the gain since you bought, before anything else.
- **It explains instead of dumping data.** Tap any number, such as P/E or beta, to see what it means in plain words. The briefing and stories read like a short newspaper piece, with numbered links to the headlines they use.
- **News in a flash.** The Flash tab puts each stock next to its top three headlines. Tap one for a TL;DR and what it could mean for the stock, then open the source only if it's worth it.
- **Listen instead of reading.** Tap a stock in Flash and Stockit reads three of its articles in full and tells them as one story. Or have the briefing, a TL;DR or the whole Flash read aloud while you walk or drive.
- **One place for the news.** Yahoo Finance, the wider web through Google News, and the crowd's mood from StockTwits, for each stock you own or watch.
- **Bring your stocks in fast.** Paste a list, open your broker's CSV export, or take a screenshot of Apple's Stocks app; no typing ticker by ticker.
- **Yours.** No account, no tracking, no subscription. Your data stays in your iCloud Drive and AI runs on your own key, with every token counted.

## A quick tour

<p align="center">
  <img src="docs/screenshots/16-flash.png" width="250" alt="Flash: each stock with your shares, today's profit, view, analysts and crowd on the left, its top three headlines on the right">&nbsp;
  <img src="docs/screenshots/17-tldr.png" width="250" alt="A TL;DR of an NVIDIA headline: the gist, key points and what it could mean for NVDA">&nbsp;
  <img src="docs/screenshots/18-listen.png" width="250" alt="The TL;DR being read aloud, with the player bar at the bottom and Read the full article">
</p>
<p align="center"><sub><b>⚡ Flash</b>: every stock with its top headlines · <b>TL;DR</b> of any headline · <b>🔊 Listen</b>, then read the full article</sub></p>

<p align="center">
  <img src="docs/screenshots/02-briefing.png" width="250" alt="The full daily briefing, with what to keep an eye on and the count of buy, hold and sell views">&nbsp;
  <img src="docs/screenshots/05-numbers.png" width="250" alt="Key numbers for NVIDIA with P/E explained in plain words">&nbsp;
  <img src="docs/screenshots/06-headlines.png" width="250" alt="About the company and its latest headlines from Yahoo Finance and the web">
</p>
<p align="center"><sub><b>The daily briefing</b>, read in full · <b>Key numbers</b>, each explained on tap · <b>About and headlines</b> for every stock</sub></p>

<p align="center">
  <img src="docs/screenshots/07-watchlist.png" width="250" alt="Watchlist with one-month trend lines and a buy or sell view per stock">&nbsp;
  <img src="docs/screenshots/08-ideas.png" width="250" alt="AI ideas: Johnson &amp; Johnson as a defensive fit, with how it fits and its main risk">&nbsp;
  <img src="docs/screenshots/09-add.png" width="250" alt="Adding stocks: search, paste a list, open a CSV or import a screenshot">
</p>
<p align="center"><sub><b>Watchlist</b> with trend lines and views · <b>✦ Ideas</b> that fit your style · <b>Add stocks</b> by search, list, CSV or screenshot</sub></p>

<p align="center">
  <img src="docs/screenshots/10-settings.png" width="250" alt="Settings: colours, layout, text size, headline font, portfolio and news options">&nbsp;
  <img src="docs/screenshots/11-ai-settings.png" width="250" alt="AI settings: Claude and OpenAI keys, connection test and model picker">&nbsp;
  <img src="docs/screenshots/12-ai-usage.png" width="250" alt="Token usage per provider, feature, model and day, with a 14-day chart">
</p>
<p align="center"><sub><b>Settings</b>: every choice on screen · <b>AI settings</b>: your key, your model · <b>Token usage</b> per feature, model and day</sub></p>

<p align="center">
  <img src="docs/screenshots/15-portfolio-dark.png" width="250" alt="The portfolio in dark mode">&nbsp;
  <img src="docs/screenshots/14-sepia-compact.png" width="250" alt="The portfolio in the Sepia colours with the Compact layout">
</p>
<p align="center"><sub><b>Dark mode</b> follows your iPhone · <b>Sepia</b> is one of six palettes</sub></p>

## What you get

| | |
|---|---|
| 💼 **Portfolio and watchlist** | Two tabs: stocks you own, with shares and average price, and stocks you watch. Each row shows the price, today's change, a one-month trend line and Stockit's view. Sort by value, today's move, signal or A–Z. |
| 💰 **Your money at a glance** | Portfolio value, today's change and the gain since you bought, with the split across your biggest holdings. |
| 📊 **A page per stock** | 1D, 1W, 1M, 6M, 1Y and 5Y chart you can touch to see the price at any moment, whether its market is open, your position (value, today, since you bought), the price trend from the 50- and 200-day averages, and an About section. |
| 🔢 **Numbers, explained** | P/E, forward P/E, market cap, dividend yield, EPS, beta, analyst target, margins, growth, 52-week range and 1, 6 and 12-month performance. Tap any of them for a plain-words explanation. |
| 🕒 **Markets** | Every stock shows whether its market is open right now. The Markets tab lists the markets where your stocks trade, then 16 others, each with a countdown to its next open or close, its hours in local and your time, and the trading day's progress. |
| 🧭 **My strategies** | Write down your own plans in Ideas, such as "when Nike recovers, sell it and buy a pharma company", with an optional timing. ✦ Ideas serve them and say where each one stands; the briefing and stories take them into account. Retire a strategy when it's done. |
| ⚡ **Flash** | A tab with every stock on the left and its top three headlines on the right, owned stocks first. Beside the headlines: your shares, today's profit or loss, Stockit's view, the analysts' average rating and the crowd's mood. Fold a card once read; it opens again when new headlines arrive. |
| ✂️ **TL;DR of any headline** | Tap a headline, in Flash or on a stock's page, for a one-line gist, the key points and what it could mean for the stock, then **Read the full article** at the publisher. ✦ AI writes it when you have a key; without one, the key sentences are taken from the article itself. |
| 🎧 **Listen to a stock's news** | Tap a stock in Flash: Stockit reads three of its articles in full (skipping any it can't open) and ✦ AI tells them as one spoken story of 350 to 550 words, naming its sources, then what it could mean for the stock. The story then appears under the card with its sources. Without a key, each article's key sentences are read in turn. |
| 🔊 **Read aloud** | **Listen** to the briefing, a stock's story, any TL;DR or the whole Flash. Pause, skip or stop from the player at the bottom. Use your iPhone's own voices (free, offline) or a natural **✦ AI voice** from OpenAI. |
| 📰 **Headlines and the crowd** | Business news from Yahoo Finance, wider coverage from the web through Google News, and how StockTwits posts lean, bullish or bearish. Each source can be switched off. |
| ✦ **Daily briefing** | After a refresh, AI writes a short story of your portfolio today, what to keep an eye on, and a buy, hold or sell view with one line per stock. At most every 6 hours, or when your stocks change. |
| ✦ **A story per stock** | What the company does, what's happening now and why, whether the price looks cheap or expensive, why buy, what could go wrong and what to watch, with numbered links to its sources. |
| ✦ **Ideas** | New stocks worth a closer look, picked for your investing style (Cautious, Balanced or Adventurous) and your own themes, from what's trending and from good-value lists. One tap adds an idea to the watchlist. |
| 📥 **Bring them in fast** | Search by name or ticker, paste a list (`AAPL 10 @ 150`, `MSFT, NVDA`), open a broker CSV export, or ✦ read the tickers from a screenshot. |
| 🎨 **Make it yours** | Six colour themes plus Auto (follows light and dark mode), Comfortable, Compact or Tiny layouts, four text sizes, sans or serif headlines. |
| 🎬 **Launch screen** | Stockit opens on its logo for 2.4 seconds: the price line draws itself, then "Track. Read. Decide." Tap to skip; with Reduce Motion it appears without movement. It is the shared [launch-screen](https://github.com/gadominas/app-blueprints/blob/main/blueprints/launch-screen.md) blueprint, so all the apps start the same way. |
| 🤖 **AI settings** | Claude or OpenAI, any model your key can use, a connection test, and token usage by provider, feature, model and day. |
| ⚙️ **Every setting on screen** | Time limits, how often prices, company numbers and headlines reload, AI limits, idea themes and widget timing. No code editing. |
| 🧩 **Built with** | The last section of Settings lists the [shared blueprints](https://github.com/gadominas/app-blueprints) Stockit follows, each linked at the exact version used (see [docs/BLUEPRINTS.md](docs/BLUEPRINTS.md)). |
| 📲 **Widget** | Today's move for your portfolio and your biggest movers on the Home Screen, in the same frame and colours as the other apps' widgets. |
| ⬆️ **Updates itself** | When a new version is out, Stockit shows its three best features and installs it with one tap. |

## Charts you can touch

<img src="docs/screenshots/03-stock.png" width="250" align="right" alt="NVIDIA's one-day chart from yesterday's close, touched to show the price at 7:40 PM">

Every stock's page has a chart from **one day** to **five years**: 1D (every five minutes, against yesterday's close), 1W, 1M, 6M, 1Y and 5Y.

**Touch or drag across the chart** to see the price, the time or date and the change at that moment. The line and the price stay a moment after you let go. Vertical swipes still scroll the page.

<br clear="right">

## Markets: open or closed

<img src="docs/screenshots/22-markets.png" width="250" align="right" alt="Markets tab: New York closed with a countdown to opening, Vilnius and Oslo open with time left">

Every stock in Portfolio, Watchlist and Flash shows **Open** or **Closed** for its market, and its page says when it closes or opens, in your time.

The **Markets** tab shows the markets where your stocks trade first, then the other big ones: New York, Toronto, London, Frankfurt, Euronext, Zurich, Milan, Madrid, Stockholm, Copenhagen, Helsinki, Oslo, Warsaw, Vilnius · Riga · Tallinn, Tokyo, Hong Kong, Sydney and crypto. Each one says:

- **Open, Closed or Lunch break**, with a countdown: "Closes in 2 h 20 min" or "Opens in 4 h 50 min", and the time that is for you.
- Its hours in local time and in yours, and how far through the trading day it is.
- Which of your stocks trade there, with today's move (tap one to open it).

Hours follow each exchange's own time zone, so summer and winter time are right everywhere. For markets where you hold stocks, Yahoo's session times also catch public holidays.

<br clear="right">

## My strategies

<img src="docs/screenshots/23-strategies.png" width="250" align="right" alt="Ideas › My strategies: two active strategies with Where it stands notes, and a form to add one">

In **Ideas › My strategies**, write down your own plans and directions, in your own words, with an optional timing. For example:

- "When Nike recovers to my average price, sell it and buy a pharmaceutical company" (timing: "when NKE is back at $80").
- "Over the next six months, invest more in pharma companies that work closely with AI companies."

All your strategies are listed there. **Retire** one when it's done or no longer what you want; retired strategies stay under **Retired strategies**, where you can bring them back or delete them.

With an AI key, your active strategies come first when Stockit looks for ✦ ideas: ideas serve them, each says which strategy it is for, and every strategy gets a short **Where it stands**, such as how far a stock is from your average price. The daily briefing and stock stories take your strategies into account too.

<br clear="right">

## Flash news and TL;DRs

<img src="docs/screenshots/17-tldr.png" width="250" align="right" alt="A TL;DR of a headline with Listen and Read the full article">

Open the **Flash** tab for a two-minute scan of everything you own and watch: each stock on the left, its top headlines on the right (three by default, 1 to 5 in **Settings › Headlines**). Headlines that name the company and come from well-known sources rank first; quote and listing pages are left out.

The left column shows what matters for that stock at a glance:

- **Today's move** and, for stocks you own, **your shares** and **today's profit or loss** in the stock's currency.
- **Stockit's view:** ✦ buy, hold or sell from the AI, or the price trend without a key.
- **Analysts:** the average Wall Street rating from Yahoo Finance, from 1 (Strong Buy) to 5 (Sell).
- **Crowd:** how StockTwits posts lean, with a bullish-versus-bearish bar.

**🎧 Tap a stock** (its ticker, or **Listen** on the card) to hear the story of its news. Stockit opens the top three articles and reads them in full; if one can't be opened, it reads the next headline instead. ✦ AI then tells them as one story of a few minutes: what happened, each article's facts and numbers, how the pieces connect, where each fact comes from, and what it could mean for the stock. Tap the stock again to pause. **Listen** at the top does the same for every open card in turn. The player starts at once; the first story takes a few seconds while the articles are read, and the next one is prepared while you listen.

The story then appears under the card as **The story you heard**, with each source and whether it was read in full or only from its headline. **Details ›** opens the stock's page.

<p align="center"><img src="docs/screenshots/21-flash-story.png" width="250" alt="NVDA playing in Flash, with the story it is reading shown under the card"></p>
<p align="center"><sub><b>Tap a stock</b>: its three articles, told as one story, with the text under the card</sub></p>

Once you've read a card, tap **✓ Read — fold it**. It shrinks to one line and stays folded until a newer headline arrives; then it opens again, marked **New since you folded it**. **Fold all** and **Open all** are at the top, and **Listen** reads only the open cards.

<p align="center">
  <img src="docs/screenshots/16-flash.png" width="250" alt="Flash cards with shares, today's profit, view, analysts and crowd beside the headlines">&nbsp;
  <img src="docs/screenshots/20-flash-folded.png" width="250" alt="Flash with two cards folded to one line after reading">
</p>
<p align="center"><sub><b>Flash</b>: your stake, the view and the mood beside the news · <b>Folded</b> cards once read</sub></p>

Tap a headline to open its **TL;DR**:

- **The gist** in one sentence, **the story** in two or three paragraphs, the **key facts** and **what it could mean** for the stock.
- **✦ AI summary** when you have a key, labelled with the provider. Without a key, Stockit picks the key sentences from the article itself, labelled **no AI**.
- **Listen** reads it aloud. **Read the full article at …** opens the original at the publisher.
- **More about** the same stock is listed underneath, one tap away.

Google News links are followed to the publisher's own article. Some articles still can't be read from the phone (paywalls, cookie walls, pages that need JavaScript). The TL;DR then explains only the headline and summary, and says so. TL;DRs are kept on your phone, so opening one again is instant.

<br clear="right">

## Read aloud

<img src="docs/screenshots/19-listening.png" width="250" align="right" alt="Settings › Listening: choose iPhone voice or AI voice">

Tap **Listen** on the briefing, a stock's story, a TL;DR or the Flash tab. A player bar appears at the bottom with pause, next and stop; the item being read is marked in Flash.

Choose the voice in **Settings › Listening**:

- **iPhone voice:** free and offline. Filter female or male voices, set speed and pitch. For more natural voices, download an Enhanced or Premium voice in iOS Settings › Accessibility › Spoken Content › Voices.
- **✦ AI voice:** OpenAI's speech models, with a choice of voices and a style such as "calm newsreader". This needs an OpenAI key, even when Claude writes your briefing, because Claude's API has no speech output. Characters sent are counted under Token usage as *Read aloud*.

<br clear="right">

## Home-screen widget

<p align="center">
  <img src="docs/screenshots/widget-medium.png" width="338" alt="Medium widget: your portfolio's move today beside the three biggest movers with their views">&nbsp;&nbsp;
  <img src="docs/screenshots/widget-small.png" width="158" alt="Small widget: your portfolio's move today">
</p>
<p align="center">
  <img src="docs/screenshots/widget-large.png" width="338" alt="Large widget: the portfolio's move, the briefing headline and the biggest movers">
</p>
<p align="center"><sub><b>Medium</b>: today's move and the biggest movers · <b>Small</b>: today's move · <b>Large</b>: adds the ✦ briefing headline</sub></p>

1. Long-press your Home Screen, tap **Edit → Add Widget**, choose **Scriptable**, and pick a size.
2. Long-press the new widget, tap **Edit Widget**, and set **Script** to *Stockit*.

The widget shows the Stockit logo and name and your portfolio's move today (or your watchlist's, before you own anything). The medium widget lists your three biggest movers beside it, with their price and view; the large one adds the latest ✦ briefing headline and more rows. Tapping opens Stockit. The bottom line says when prices were loaded, and turns amber (**⟳ Updated …**) when that is older than 12 hours. Lock Screen widgets show today's move as text.

The widget **shows percentages only**, never amounts of money, because it sits on an unlocked Home Screen. Turn on **Settings › Portfolio › Show portfolio value in the widget** if you want the value too.

It reloads prices itself when they are older than 30 minutes, within 15 seconds, and otherwise shows what Stockit last saved; it never calls AI. Change these times in **Settings › Widget**.

## AI, on your terms

AI is optional. Without it, everything else works: prices, numbers and their explanations, headlines, the crowd's mood, and a price-trend view from the moving averages, labelled **no AI**.

- **Your key, your choice.** Add a Claude or OpenAI key in **Settings › AI settings**, tap **Load my models**, and pick any model your account can use. Switch providers any time.
- **You see the cost.** Token usage is counted per provider, feature, model and day, with a 14-day chart.
- **It only runs when it helps.** The briefing is one request after a refresh, at most every few hours. Stories, TL;DRs, ideas, AI voices and screenshot import run only when you tap them.
- **Your investing style.** **Settings › AI advice** sets Cautious, Balanced or Adventurous; it shapes the views and the ideas.
- **Clearly labelled.** Everything AI-written carries a **✦ AI** label and the name of the provider that wrote it, and every view says it is not financial advice.

API usage is billed by Anthropic or OpenAI, separately from any Claude or ChatGPT subscription. A daily briefing with a small model usually costs well under a cent.

## Using it

| To… | Do this |
|---|---|
| Add a stock | Tap **+**, choose **Portfolio** or **Watchlist**, search by name or ticker, then **Add** |
| Add many at once | Tap **+** and paste one per line (`AAPL 10 @ 150`), open a CSV, or **Choose photo** for a screenshot |
| See a stock's page | Tap its row |
| Understand a number | Tap the number on the stock's page |
| Read the briefing in full | Tap **Read the full briefing** |
| Get a stock's story and view | Open the stock and tap **Write the story** |
| Find new ideas | Open **✦ Ideas** and tap **Find new ideas**; **Add to watchlist** keeps one |
| Change shares or move a stock | Open the stock › **Manage** › **Edit shares**, **Move to watchlist** or **Remove** |
| See the price at any moment | Open a stock and touch or drag across its chart; **1D** and **1W** show the day and the week |
| See which markets are open | Look for **Open** or **Closed** under each stock, or open **Markets** |
| Add your own plan | **Ideas › My strategies**, write it, add a timing if you like, tap **Add strategy** |
| Put a plan aside | **Retire** on the strategy; bring it back from **Retired strategies** |
| Scan the news | Open **Flash** |
| Put a read card away | Tap **✓ Read — fold it**; tap the folded line to open it again. **Fold all** and **Open all** are at the top |
| Get the gist of a headline | Tap it, in Flash or on a stock's page, for its TL;DR |
| Read the whole article | In the TL;DR, tap **Read the full article at …** |
| Hear a stock's news as a story | Tap the stock in **Flash** (tap again to pause); **Listen** at the top plays every open card in turn |
| Read the story you heard | Open **The story you heard** under the card |
| Listen instead of reading | Tap **Listen** on the briefing, a story or a TL;DR. Pause, skip or stop from the player |
| Change the voice | **Settings › Listening**: **iPhone voice** or **✦ AI voice**, then **Test the voice** |
| Refresh prices and news | Tap refresh |
| Change anything else | Tap **Settings** |

## Updates and what's new

<img src="docs/screenshots/13-update.png" width="250" align="right" alt="The update sheet showing three new features">

Stockit checks this repository for a newer version each time it opens. If there is one, it shows the three best features and offers **Update now**. **Later**, or tapping outside, waits two days before offering it again. You can also check any time in **Settings › Updates**, or simply run the installer again.

See [CHANGELOG.md](CHANGELOG.md) for every release. Maintainers: release notes live in [`releases.json`](releases.json); see [docs/RELEASING.md](docs/RELEASING.md).

<br clear="right">

## Not financial advice

Stockit is a personal tool for following the stocks you care about. It is **not a financial adviser, broker or research service**, and nothing it shows is a recommendation to buy, sell or hold any security.

- **AI views are opinions.** The buy, hold and sell views, briefings, stories and ideas are written by an AI model from the prices, company numbers and headlines Stockit loaded. Models make mistakes, can misread a headline, and know nothing that isn't in that data.
- **Ideas need checking.** AI models have a knowledge cutoff, so read the latest news on any idea before you act.
- **Data can be late or wrong.** Prices, numbers and headlines come from free public sources and can be delayed, incomplete or incorrect.
- **You decide.** Investing carries risk, including the loss of what you put in. Do your own research and consider talking to a licensed financial adviser.

The software is provided "as is", without warranty of any kind; see the [LICENSE](LICENSE).

## Privacy and security

- **Everything runs on your phone.** There is no Stockit server and nothing is collected.
- **Your data** (stocks, shares, average prices, settings, loaded prices and headlines, AI texts) is stored as JSON in **iCloud Drive › Scriptable › Stockit**. The widget's snapshot stays on the device.
- **Your keys** (Claude, OpenAI and the optional Finnhub key) are stored in the iOS Keychain and only ever sent to the service they belong to.
- **What goes to the AI:** prices, company numbers and headlines, and for the briefing your portfolio's makeup (which stocks you own and how much of each), and your strategies, so it can talk about your money and your plans; for a TL;DR or a stock's news story, the articles' text. Only when a feature needs it, and only to the provider you chose. With ✦ AI voice, the text being read goes to OpenAI.
- **Network requests** go to Yahoo Finance, Google News and StockTwits for data, the publisher's page when you open a TL;DR, Finnhub if you add a key, your AI provider, and this repository for update checks.

## Where the data comes from

| Data | Source | Notes |
|---|---|---|
| Prices and history | Yahoo Finance | No key needed |
| Company numbers and analyst views | Yahoo Finance; optional [Finnhub](https://finnhub.io) key as a backup | Add the key in **Settings › News and signals** |
| Headlines | Yahoo Finance and Google News | Switch either off in Settings |
| Crowd mood | StockTwits | US tickers |

Yahoo Finance and StockTwits are used through their public web endpoints, which are not official APIs and can change without notice. When a source doesn't answer, Stockit keeps what it last loaded and tells you which stocks it couldn't update.

## How it works

Stockit asks the sources above for each stock you follow, stores the results on your phone, and shows them in a page rendered by Scriptable. The price trend comes from the 50- and 200-day moving averages; the AI features send a compact summary of the same data to Claude or OpenAI and ask for a JSON answer, which Stockit checks before showing. The widget is drawn natively by Scriptable from a snapshot the app saves.

Stockit follows five shared blueprints: in-app updates, settings, AI configuration, launch screen and widgets. **Settings › Built with** lists them with their versions; [docs/BLUEPRINTS.md](docs/BLUEPRINTS.md) adds the deviations.

## Troubleshooting

| Problem | Try this |
|---|---|
| Stockit opens to a blank or loading screen | Close it and open it again. If it keeps happening, open **Settings › Updates › Start-up log** and send what it shows |
| A market shows open on a public holiday | Holidays are known for markets where you hold stocks, after a refresh; other markets follow their regular weekly hours |
| A stock isn't found | Use its Yahoo Finance ticker, with the exchange suffix outside the US (`ASML.AS`, `VWCE.DE`) |
| "Updated; couldn't load …" | That source didn't answer. Tap refresh again in a minute; the last loaded data stays on screen |
| Company numbers are missing | Yahoo sometimes doesn't answer for these. Add a free Finnhub key in **Settings › News and signals** as a backup |
| A story says some articles were headline only | Those pages block reading from apps. Stockit already tried up to eight headlines; open the sources under **The story you heard** to read them yourself |
| A TL;DR says the article couldn't be read | The publisher blocks reading from apps (paywall or cookie wall). Tap **Read the full article** to read it at the source |
| The voice sounds robotic | Download an Enhanced or Premium voice in iOS Settings › Accessibility › Spoken Content › Voices, then pick it in **Settings › Listening**, or switch to **✦ AI voice** |
| The briefing, views or Ideas are missing | They appear once an AI key is saved in **Settings › AI settings** |
| "Key saved, but checking it failed" | The key was rejected or has no credit. Tap **Change key** and paste a valid one |
| The CSV import finds no stocks | The file needs a symbol or ticker column. Or paste the tickers instead |
| The widget shows **⟳ Updated …** in amber | Open Stockit once; the widget updates from it |
| An update says GitHub is serving the old version | Wait a few minutes after a release and tap **Try again** |

## Contributing

Issues and pull requests are welcome. Keep everything in a single Scriptable file, with no build step, and test on a real device. To release, follow [docs/RELEASING.md](docs/RELEASING.md).

## License

[MIT](LICENSE) © 2026 Gediminas Siutilas
