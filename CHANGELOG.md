# Changelog

All notable changes to Stockit. Generated from `releases.json`; edit that file, not this one.

## 1.27.0 (2026-11-06): Your portfolio, assessed

- ✦ **Portfolio assessment**: AI weighs every position, your plans and watchlist against the market's mood and world events.
- 🧭 **Next steps**: A short list of what to do, now, this month or this quarter; keep any as a strategy.
- 🌍 **Market and world**: Risk-on or risk-off from nine gauges, and what this week's headlines mean for your stocks.

**Changes**

- Portfolio › ✦ Portfolio assessment: a score out of 100, headline and summary, next steps, market mood, ratings for diversification, risk, quality and valuation, income, currencies and fit with your plans, world and market events, risks, potential gains and a verdict for each watchlist stock
- It reads each position's weight, sector, currency, gain, 1/6/12-month change, P/E, dividend, beta, analysts' target, trend, Stockit's view, insiders and the crowd; your style, strategies, themes, ideas and watchlist; nine market gauges (S&P 500, Nasdaq, Euro Stoxx 50, DAX, VIX, US 10-year yield, oil, gold, euro); and this week's headlines on markets, geopolitics, central banks and energy
- Each next step has its timing and stocks, and Keep as a strategy adds it to My strategies
- Sectors are looked up first for stocks that don't have one yet; a progress bar shows each step
- Token usage counts Portfolio assessments separately

## 1.26.0 (2026-11-06): Your portfolio at a glance

- 👀 **At a glance**: Every stock you own in a compact grid under your total: ticker, value and gain, eight stocks in two rows.

**Changes**

- Portfolio: At a glance, under the portfolio's value: each owned stock as a small tile, four to a row, biggest first (pinned ones first): the ticker, then its value and the gain or loss since you bought, in your currency
- Tap a tile for the stock's page; tap the At a glance line to fold or unfold it (remembered)
- Highlighted stocks keep their amber edge; in privacy mode the tiles show the gain as a percentage

## 1.25.0 (2026-11-06): Tickers you can tap

- 🔗 **Tap a ticker in an article**: Tickers quoted in an article open that stock's page, right above the article.

**Changes**

- In the reader, tickers written as EXCHANGE:TICKER (NASDAQ:NRIX, NYSE: LLY, LSE:BARC, XETRA:SAP, HKEX:700…) and cashtags like $TSLA are links
- A link opens the stock's page above the article, for any stock, on your lists or not; Add to watchlist or I own this are there, and closing it (Done or a pull down) returns to the article
- Exchanges outside the US are written the Yahoo Finance way (BARC.L, SAP.DE, 0700.HK), and share classes like BRK.B become BRK-B

## 1.24.1 (2026-11-05): Gains that match your broker

- 💶 **What you paid, in euros**: Enter a foreign stock's average price in the currency you paid, and its gain matches your broker's, currency move included.

**Changes**

- Edit shares asks for the currency of the average price; enter what you paid in euros for a Canadian, US or UK stock bought with euros
- A stock's page shows the price you paid in its own currency and, small, what that is in the stock's currency today
- For a foreign stock whose average price is in its own currency, the page explains why your broker may show a different gain, with a link to enter it in your currency
- Check my portfolio works out what you paid per share in your currency from your broker's value and gain, and applies it in that currency

**Fixes**

- A foreign stock bought with euros showed a different gain from the broker's (Fortis: €147 instead of €181), because the average price was in Canadian dollars and converted at today's rate, leaving out the Canadian dollar's rise since the purchase

## 1.24.0 (2026-11-05): One company, several markets

- 🌍 **Positions on several markets**: Hold the same company on another market or in another currency, under one stock, when Yahoo has no listing for it.

**Changes**

- A stock's page has + Add a position on another market or in another currency: shares, average price, its currency and where (for example Frankfurt)
- Your positions lists each one with its value and gain in its own currency; tap one to change or remove it, and Edit shares asks which one
- The stock's shares and average price add up all its positions (the average in the stock's own currency, at today's rates, updated with each refresh), so totals, the widget, the briefing and the portfolio check include them
- A position's currency gets its exchange rate when you add it

## 1.23.0 (2026-11-05): The month on the widget

- 📈 **Trend beside today**: Each widget ticker now shows its change over the last month, small, next to today's change.

**Changes**

- Widget: beside each ticker, in smaller type, its change over the last month (from the close about 30 days ago); today's change stays on the right
- Settings › Portfolio › Beside each widget ticker: 1 week, 2 weeks, 1 month (the default), 3 months or Off
- The medium and large widgets say what the small number is in their footer ("small: 1 month"); the large widget's list is titled with it too

## 1.22.0 (2026-11-05): What insiders are doing

- 🏛 **Insider trades**: With a Quiver key, see what officers, directors and big owners bought and sold (SEC Form 4).
- ✦ **Sharper views and ideas**: Stockit's view, AI stories and ideas now weigh insider buying, read against the price trend.
- 💡 **Ideas from insider buying**: Big open-market purchases across the market become idea candidates.

**Changes**

- Settings › News and signals: Quiver key (kept in the Keychain) and an Insider trades switch; Settings › Insider trades: days counted (90), how often to check (12 h), what a big purchase is ($100,000)
- For each US stock, the last 90 days of Form 4 filings: open-market purchases and sales counted (with buyers, value, an executive or 10% owner, and how much the largest purchase grew that insider's stake); grants, option exercises, tax withholding and gifts listed but not counted
- Key numbers: Insiders, 90 days (Buying, Some buying, Selling, Quiet), with an explanation; a new Insider trades section lists the filings
- Stockit's view (AI or trend) adds what insiders did, read against the 200-day average: buying in an uptrend, buying into a decline, or selling
- Every AI briefing, story and view gets the insider facts with the research rule of thumb (purchases over sales, uptrend over decline)
- ✦ Ideas consider the latest big open-market purchases across the market, and each idea shows its insider activity
- Flash cards show Insiders buying or Insiders selling when it matters; ticker strings like (NASDAQ:AAPL) are cleaned; non-US listings are skipped
- A key without insider access (Quiver's Hobbyist plan) is reported in Settings

## 1.21.1 (2026-11-04): Built with Widgets 1.1.0


**Changes**

- Settings › Built with shows Widgets 1.1.0: Stockit's compact widget, widget pins and hiding amounts from Shortcuts are now part of the shared widgets blueprint

## 1.21.0 (2026-11-04): Your stocks on the widget

- ▦ **Pin stocks to the widget**: Choose up to 8 stocks from your portfolio or watchlist; with none chosen, your best performers today show.
- 🔢 **8 tickers at once**: The medium widget fits 8 tickers in two columns; small 4, large 8 with price and view.
- 🙈 **Hide amounts with Back Tap**: A double tap on the back of your iPhone hides amounts in Stockit and on the widget; a triple tap shows them.

**Changes**

- ▦ on each row in Arrange, and Show on the widget on a stock's page, pin a stock to the widget; pinned stocks show in your own order, the first 8
- With nothing pinned, the widget shows your best performers today from your portfolio, or from your watchlist when you own nothing
- Settings › Portfolio › Stocks on the widget lists the pinned stocks (tap one to take it off) and explains the hide and show shortcuts
- New compact widget: medium has a one-line summary and 8 tickers in two columns; small has today's move and 4 tickers; large has today's move, the ✦ headline and 8 stocks with price and ✦ view; exchange endings like .DE are left off the ticker
- Stockit takes hide, show or privacy toggle from Shortcuts' Run Script (and ?privacy=on or off in its link) without opening: privacy mode switches, the widget follows at its next refresh
- A widget whose parameter is private never shows amounts
- iPhone apps can't use the volume buttons, so Back Tap (or the Action Button) runs these shortcuts instead

## 1.20.3 (2026-11-04): A slight pull is enough

- 👇 **Shorter pull to close**: A slight pull or a short flick down now closes a stock's page.

**Changes**

- Pulling a stock's page (and the TL;DR, reader and portfolio check) down closes it after about 40 points instead of 130, or after a short flick; a tiny slow drag still springs back

## 1.20.2 (2026-11-04): Pull down to close

- 👇 **Pull down to close**: Slide a stock's page down to close it, like in Apple's Stocks app; no need to reach for Done.
- 📰 **Everywhere it fits**: The same works for a headline's TL;DR, the article reader and the portfolio check.

**Changes**

- A stock's page closes when you pull it down: from its header at any time, or from anywhere once it's scrolled to the top; a short or slow pull springs back, a long pull or a quick flick closes it
- A small grabber at the top of these pages shows they can be pulled
- The chart keeps its own touch (sliding along it still shows prices), and so do text fields and the range buttons
- The TL;DR sheet, the article reader and Check my portfolio close the same way

## 1.20.1 (2026-11-04): Opens on any iPhone

- 📱 **Opens on any iPhone**: Stockit opens on iPhones that aren't signed in to iCloud, every time.
- 📥 **Installs on new phones**: The installer works on a brand-new iPhone without iCloud too.
- 🛡 **Updates safely**: Updating can no longer stop on a phone without iCloud.

**Changes**

- iCloud is used only when Scriptable keeps its scripts in iCloud Drive; otherwise everything stays on the phone
- Settings › Built with lists Stability patterns 1.0.0, Settings 1.1.2 and In-app updates 1.0.1

**Fixes**

- On an iPhone not signed in to iCloud, Stockit or its installer could still stop with "iCloud is not supported"

## 1.20.0 (2026-11-02): Your order, your favourites

- ↕️ **Drag into your own order**: Arrange your portfolio and watchlist by dragging; long-press any stock to start.
- 📌 **Pin to the top**: Pinned stocks stay first, whichever way the list is sorted.
- ★ **Highlight**: Highlighted stocks get an amber edge and star, so they stand out.

**Changes**

- Portfolio and Watchlist: Arrange (next to the count, or long-press any stock) shows a ≡ handle on each row; drag it to move the stock, then Done
- A new Mine sort keeps your own order; arranging from another sort starts from the order on screen, so nothing jumps
- 📌 pins a stock to the top of its list in every sort (Mine, Value, Today, Signal, A–Z); ★ highlights it with an amber edge and star
- Pin to the top and Highlight are also on each stock's page, under Manage
- Your order, pins and highlights are saved with your stocks and kept in iCloud

## 1.19.5 (2026-11-03): Heard in silent mode

- 🔔 **Plays in silent mode**: Listening keeps playing with the Ring/Silent switch on.
- 📱 **Opens without iCloud**: Stockit now opens on iPhones that aren't signed in to iCloud.
- ⏹ **Stop means stop**: Stopping while an article loads no longer starts it a moment later.

**Changes**

- While reading aloud, Stockit tells iOS it's playing media, so voices play with the Ring/Silent switch on; other apps' music can play again when it stops
- Without iCloud, Stockit keeps its data on the phone (Files › On My iPhone › Scriptable)

**Fixes**

- Read aloud was silent with the Ring/Silent switch on
- On an iPhone not signed in to iCloud, Stockit stopped at once with "iCloud is not supported"
- Stopping an article while it was still loading started reading anyway when it arrived

## 1.19.4 (2026-11-02): Try again, for real

- 🔁 **Try again works**: The reader's Try again on an article that couldn't be read now reads it afresh.

**Changes**

- Read aloud blueprint 1.2.0: Stockit's way of getting pages (consent walls, Google News links, Jina Reader, What Stockit tried) is now the blueprint's Step 9; Settings › Built with shows read-aloud 1.2.0

**Fixes**

- Try again under an article that couldn't be read did nothing: it shared its name with the questions' Try again, which took the tap

## 1.19.3 (2026-11-02): Through Google's consent wall

- 🚪 **Google's consent, answered**: Stockit answers Google's consent page in Europe (Reject all) and follows Google News links to the publisher.
- 🔎 **The same story on Yahoo**: If a Google News link still can't be followed, Stockit finds the same story on Yahoo Finance by its headline.
- 🔑 **Jina Reader, clearer**: Its refusals now say why, and a free Jina key can be added if it asks for one.

**Changes**

- Google News links in Europe landed on Google's consent page (consent.google.com), so Stockit never learned where the article was; Stockit now answers that page with its own Reject all form and keeps the cookie Google sets
- When a Google News link still can't be followed, Stockit searches Yahoo Finance for the same headline and reads that copy (many stories, like Simply Wall St's, are on both); Open the article then goes there too
- Jina Reader isn't asked to open Google News links, which it refuses (the HTTP 403 in What Stockit tried)
- When Jina Reader refuses, What Stockit tried shows its reason
- Settings › News and signals › Jina Reader key (optional): add a free key from jina.ai if Jina Reader refuses without one; kept in the Keychain

**Fixes**

- Articles from Google News couldn't be read in Europe

## 1.19.2 (2026-11-02): Articles: see what happened

- 🔍 **What Stockit tried**: When an article can't be read, the reader lists each step it tried and what came back.
- 🔁 **Try again**: Retry an article right from the reader, without leaving it.
- ↗ **Straight to the publisher**: Open the article goes to the publisher's page, not a blank Google News page.

**Changes**

- The reader's can't-be-read screen has What Stockit tried: each page opened (with its HTTP status and size), the consent answer and the cookies Yahoo returned, how many words were found, and Jina Reader's answer; each failed article is also written to the start-up log
- Try again reads the article afresh, without anything remembered from the last attempt
- Open the article and Read the full article open the publisher's own page for Google News links, instead of Google's redirect page, which stays blank in the app (and shows a consent page in Europe)
- Google's consent wall in Europe is answered the way a browser would (reject all), so Google News links can be followed to the publisher
- Yahoo's consent form is found even when it's written differently (quotes, form order)

**Fixes**

- Google News links opened as a blank page

## 1.19.1 (2026-11-02): Articles open again

- 📰 **Yahoo articles read again**: In Europe, Yahoo's consent page stopped every article; Stockit now answers it properly.
- 🛟 **A way around blocked pages**: Pages that still won't open from your phone are read through Jina Reader.
- 🩺 **Easy to check**: Settings › Updates › Start-up log shows how each blocked article was handled.

**Changes**

- Yahoo's consent step in Europe used two things Scriptable doesn't have (URL and setTimeout), so it failed before it started and every Yahoo article showed as unreadable; it now uses plain code
- The consent answer now copies itself to Yahoo's sites the way Yahoo's own page does (copyConsent), and the cookies from both steps are kept
- Articles opening together wait for one consent answer instead of each sending their own
- When a page still can't be read from your phone (a consent page, a page built by scripts, an app block), the reader, TL;DRs and stories read it through Jina Reader (r.jina.ai), which sends back the article's text; only the article's public address is shared
- Settings › News and signals › Read blocked pages through Jina Reader turns that off; then a consent page is reported as one
- The start-up log records each consent answer and each article read through Jina Reader

**Fixes**

- Yahoo Finance articles couldn't be read in Europe (in the reader, TL;DRs, Listen and stories)

## 1.19.0 (2026-11-02): Today's session, and the one before

- ⏱ **This session, per stock**: Each position shows what it made or lost since its market's last close, in your currency.
- 🕰 **The session before**: Under it, smaller and dimmed: the result of the previous session.
- 🌍 **Market by market**: Before a market opens, its stocks say so instead of showing yesterday as today.

**Changes**

- Every owned stock shows This session (or Today, once its market has closed) with the money it made or lost and the percentage, in your currency
- Under it, in smaller dimmed text: Previous session with its money and percentage, worked out from the daily closes
- Before a stock's market opens, it shows Today: not traded yet, opens in …, and its last session's result as the previous session
- The portfolio summary adds up this session across your markets, says how many stocks haven't traded yet today, and shows the previous session dimmed; on days no market opens it says so
- Both hide in privacy mode

## 1.18.0 (2026-11-01): Read it here

- 📖 **Articles inside Stockit**: Read the full article opens its own text here, with the picture, author and reading time.
- ✦ **Ask about any article**: Ask AI answers questions about the article, with suggestions to start.
- 🎧 **Listen and follow along**: Listen in the reader lights up each sentence as it's read.

**Changes**

- Read aloud 1.1.0: the reader for news articles, with Listen, ✦ Ask AI and Original ↗; consent and sign-in pages say so and offer the original
- Article reads the same text the reader shows
- Settings › News and signals › Open articles in the reader (off: Safari)
- Anonymous usage (if on) also counts articles opened in the reader and questions asked, never the article or the question

## 1.17.0 (2026-10-31): Hear it, follow it

- 🎧 **Know what's playing**: The player names what it reads — story, TL;DR, full article or headlines — and shows the time left.
- 🖍️ **Follow along**: The sentence being read lights up in the briefing, a story or a TL;DR; Text shows it all as it's read.
- 📰 **Whole articles**: Article on any headline reads the original in full, starting at once.

**Changes**

- Read aloud (app-blueprints · read-aloud 1.0.0): the shared player with a mode label, progress bar, time left and tap-to-jump; Text opens the words being read, following the voice
- Buttons say what they read: Listen to the briefing, Listen to the story, Listen to TL;DR, Article and Headlines
- The current sentence is highlighted in the briefing, a stock's story and a TL;DR while it's read, and read sentences dim
- New: Article reads a headline's original article in full, falling back to the excerpt

## 1.16.0 (2026-10-31): Anonymous usage, if you agree

- 📊 **Help shape Stockit**: If you agree, Stockit sends anonymous counts of the features you use. Nothing else.
- 🔒 **Anonymous by design**: A random ID made on your phone, never your content, names or accounts.
- 🎛️ **Your choice, any time**: Settings › Privacy turns it on or off, and Send test shows what happened.

**Changes**

- Anonymous usage analytics (app-blueprints · usage-analytics 1.1.0): opt-in, anonymous counts to PostHog's US cloud, with a one-time question and Settings › Privacy (switch and Send test)
- Events: app_open (layout, theme, ai_key, privacy), stock_added (count), briefing_made, story_made, ideas_made (provider), portfolio_checked (source), strategy_saved (from), listened (kind, voice), app_updated
- Never sent: tickers, company names, prices, amounts, positions, strategies or screenshots

## 1.15.0 (2026-10-31): Clearer Settings

- 🗂️ **Sections you can see**: Each Settings section now sits in its own card, so you can tell where it starts and ends.
- 🔤 **Quieter headings**: Section names are small grey capitals, so they no longer look like settings.
- 🎨 **In every palette**: The cards follow your colours, text size and layout, light or dark.

**Changes**

- Settings (app-blueprints · settings 1.1.0): each section's rows sit in one card, with a thin border and a slightly lighter background, under a small muted uppercase heading
- The changed-count line and a section's explanation sit outside the cards; Built with is a card too

## 1.14.0 (2026-10-30): A tidier portfolio

- 🗞 **Briefing folds away**: Once you've moved on to another tab, the briefing shrinks to its headline; tap to open it.
- 💼 **Invested and gained**: Each stock shows what you put in and what you've gained or lost, in your currency.
- 👁 **Private too**: Both amounts hide with the eye, like the rest of your money.

**Changes**

- The ✦ AI briefing on the portfolio folds and unfolds by tapping its header (or its headline when folded); folded, it shows the headline and the buy, hold and sell counts
- After you leave the Portfolio tab, the briefing comes back folded and stays folded, even after reopening Stockit, until a new briefing arrives
- Each owned stock in the portfolio shows Invested (shares × average price) and the gain or loss with its percentage, in your currency; foreign stocks convert at today's rate
- Both hide in privacy mode

## 1.13.3 (2026-10-30): Safer with your data

- 🛟 **A damaged file can't stop you**: If a saved file can't be read, Stockit keeps a copy, starts it fresh and saves your changes again.
- 💬 **Told, not hidden**: A short note says when Stockit kept a copy of data it couldn't read.
- 🔑 **The right Add key**: Turn on AI now highlights Add key on the provider marked In use.

**Changes**

- Safe start-up 1.1.0: a file that arrived damaged is copied aside as `<name>.broken-<time>.json` and started from its default, so saving carries on; only a file iCloud didn't deliver is never written
- AI invitation 1.2.1: Turn on AI pulses Add key on the card of the provider in use (`.aicard.active`), not the first one in the sheet

**Fixes**

- One damaged data file stopped every later save of that file until it was fixed by hand
- Turn on AI pulsed the first Add key in AI settings instead of the provider in use

## 1.13.2 (2026-10-30): AI, from the start

- ✦ **From the first launch**: Without a key, the AI invitation now shows the first time you open Stockit.
- 🔑 **One tap to set it up**: Turn on AI opens AI settings with Add key highlighted.
- 🤫 **Still never pushy**: Later waits a few days, and Don't remind me again ends it for good.

**Changes**

- AI invitation 1.2.0: no first-day wait; it can show on the first launch, right after installing

## 1.13.1 (2026-10-30): No key, no AI

- 🔑 **The key decides**: Without a key AI is off, so the invitation can show again, even if you had a key before.
- ⚡ **Right after you remove it**: Remove your last key and the invitation can show the next time you open Stockit.
- 🤫 **Still never pushy**: Later waits a few days, and Don't remind me again still ends it for good.

**Changes**

- AI invitation 1.1.0: whether a key exists is the only test; a key you had before no longer turns the invitation off for good
- Removing the last key makes it eligible from the next launch, without the first-day wait

**Fixes**

- The invitation never appeared for anyone who had a key when 1.13.0 first ran, even after removing it

## 1.13.0 (2026-10-30): An invitation to AI

- ✦ **See what AI adds**: Now and then, without a key, Stockit shows what AI adds: the briefing, ideas and stories.
- 🔑 **Three steps to turn it on**: Turn on AI opens AI settings with Add key highlighted; the rest takes a minute.
- 🤫 **Never in the way**: Later waits a few days, Don't remind me ends it, and it never shows during a demo or Listen.

**Changes**

- AI invitation (app-blueprints · ai-invitation 1.0.1): an animated card on launch, only without an AI key, at most every 3 days (weekly after the fourth Later), never on the first day or with an update offer
- Turn on AI opens AI settings with the Add key button pulsing; Later, a tap outside, or Don't remind me again
- Never while privacy is on (the eye) or while Listen is reading aloud
- Adding a key ends the invitations for good

## 1.12.0 (2026-10-30): Checks that read your totals

- 🧮 **Shares from the totals**: When your bank shows only a price and a position's value, Stockit works out the shares.
- 💶 **Average price from the gain**: A value and its gain in the stock's currency give your average price too.
- ✓ **Honest matches**: A position with only a price is marked Price checked, not Matches.

**Changes**

- The portfolio check reads each position's total value and its currency, and the gain or loss shown (amount and percentage)
- Shares are worked out as value ÷ price when the screenshot doesn't show them, and compared with Stockit's; a value in another currency than the price goes through today's rate and is marked approximate
- Average price is worked out as (value − gain) ÷ shares when value, gain and stock share a currency; for foreign stocks it isn't, because brokers count the gain at the rates of the day you bought
- A new Position value line compares Stockit's value with your broker's, with the broker's gain beside it
- When a screenshot shows shares and a value that don't add up, the card says so
- Positions with only a price are marked ✓ Price checked instead of ✓ Matches
- Cash and bank accounts, account numbers (IBANs) and other personal identifiers on a screenshot are ignored

## 1.11.0 (2026-10-30): Privacy for demos

- 👁 **One tap to hide**: Tap the small eye by Updated to hide your amounts when you show Stockit to someone.
- •• **Your money, masked**: Portfolio value, gains, today's money, shares and average prices become ••••.
- 📈 **Still a full demo**: Prices, percentages, charts, news and ideas stay visible, so everything still works.

**Changes**

- A small eye button beside Updated, at the top left, turns privacy mode on and off; it turns blue while your amounts are hidden, and stays on until you tap it again
- Hidden: portfolio value, today's and since-you-bought amounts, each position's shares, value, today and gain, average prices, Flash cards' shares and today's money, and the portfolio check's amounts (editing waits until privacy is off)
- Amounts and share counts inside ✦ AI texts (briefing, stories) and in your strategies and their suggestions are masked too
- With privacy on, the widget shows percentages only, even when Show portfolio value in the widget is on
- Percentages, market prices, charts, headlines and ideas stay visible

## 1.10.0 (2026-10-30): Strategies, suggested and yours

- ✦ **Suggested strategies**: Fresh plans for your portfolio and watchlist, drawn from your strategies and today's prices.
- ✏️ **Keep, edit, refine**: Keep a suggestion as is or edit it first; every strategy of yours can be changed any time.
- ⏱ **Never stale**: Suggestions and Where it stands refresh every day, or every 6 h, 12 h or 2 days, as you choose.

**Changes**

- Ideas › My strategies › ✦ Suggested for you: 3 new strategies (1 to 5 in Settings › Strategy suggestions), written in the first person with a timing, the numbers behind them and the tickers involved (tap one to open it)
- Keep a suggestion as it is, Edit, then keep, or Dismiss it; kept ones are marked From a ✦ suggestion
- Every strategy has Edit: change its words and timing any time; edited ones show when they were changed
- Suggestions refresh on their own when they're older than you chose (every day by default; 6 h, 12 h, 2 days or only when you tap Refresh), when Stockit opens, after a refresh or when you open Ideas, so prices and exchange rates are current
- Each refresh also updates Where it stands for your own strategies, with when it was written
- AI settings › What AI does: a switch for Suggested strategies; token usage counts Strategy suggestions

**Fixes**

- The price-trend line under an idea's performance no longer sits against the box above it

## 1.9.0 (2026-10-30): A clearer portfolio check

- 🛡 **Always one tap away**: A ✓ icon on your portfolio opens the check; on your first launches a big button shows the way.
- 🖼 **See what you upload**: Your screenshots appear right away; remove one, add more, then Check, with a progress bar.
- 🚦 **Every stock marked**: Each result says Matches, Different, Price doesn't match, Not in Stockit or Not on your screenshots.

**Changes**

- The big Check against your broker button shows on the first three launches with owned stocks, then shrinks into a ✓ icon on the portfolio summary after six seconds; the icon stays there
- Screenshots are added one by one and shown at once as thumbnails, numbered, each with × to remove; Check stays off until there's at least one
- While checking, a progress bar with a percentage says what's happening (reading with ✦ AI, then checking each stock), and the screenshots show a scanning light
- Results are all open, with no folded lists: a summary with counts for each kind of result, the totals compared and the screenshots, then one card per stock, problems first and matches last
- Each card has a coloured badge and edge, and a Stockit-versus-broker comparison with ✓ or ≠ on every line
- Price doesn't match explains that, if the screenshot is recent, Stockit may hold the wrong shares or average price, or another listing of the company, and offers the shares and average price to correct
- New check starts over; Clear results forgets the screenshots

## 1.8.0 (2026-10-30): Check against your broker

- 📸 **Check with screenshots**: Snap your broker's portfolio; ✦ AI reads every position and Stockit compares it with yours.
- 🔎 **Every gap found**: Missing stocks, ones you no longer hold, different shares or average prices, and prices that don't match.
- ✋ **You decide**: Nothing changes on its own: apply, edit or ignore each suggestion.

**Changes**

- Portfolio › Check against your broker: choose one or more screenshots of your broker's or bank's app (up to 6, set in Settings › Portfolio check)
- ✦ AI reads each position as shown: ticker or name, shares, average price, current price, value and currency, plus the broker and total; numbers with decimal commas read right
- Stockit matches positions with your stocks by ticker, by ticker without its exchange suffix, or by company name
- Differs: shares, average price or price differ beyond your tolerance (1% and 5% by default); edit the suggested shares and average price, then Apply these or Keep Stockit's
- On your screenshots, not in Stockit: Add to portfolio with the shares and average price shown (converted to the stock's currency), or Find it when Yahoo doesn't know the name
- In Stockit, not on your screenshots: Remove (two taps), Move to watchlist or Keep
- A stock on your watchlist that the screenshot shows you own: Move to portfolio
- A price that's far off is explained: an older screenshot, another currency, or another listing of the same company
- The screenshot's total is compared with Stockit's; token usage counts Portfolio checks separately

## 1.7.0 (2026-10-30): Ideas you can judge

- 📊 **The numbers behind every idea**: P/E, dividend yield, market cap, 50- and 200-day averages, RSI, range and more on each idea.
- 🔍 **Look before you add**: Tap an idea to open its full stock page: chart, numbers, news and story, without adding it.
- 🗂 **A tidier Ideas tab**: My strategies, your themes and the ideas fold away, and your themes now live right there.

**Changes**

- Each ✦ idea shows P/E, forward P/E, dividend yield, market cap, 50-day and 200-day averages (with how far the price is from each), RSI over 14 days, beta, analyst target and rating, profit margin and revenue growth; tap any for what it means
- Each idea also shows its sector, exchange, 52-week range, 1-month, 6-month and 1-year performance, and its price trend
- Tap an idea (or See everything) to open its full stock page, the same as for your own stocks: charts from 1D to 5Y, numbers, headlines with TL;DRs, the ✦ story and whether its market is open; then Add to watchlist or I own this
- Ideas › Themes you like: add and remove themes right in the Ideas tab (they're no longer in Settings)
- My strategies, Themes you like and Stocks worth a closer look fold open and closed; Stockit remembers which you folded
- Stock pages gain 50-day average, 200-day average and RSI tiles

## 1.6.0 (2026-10-30): All your money, one currency

- 💶 **One currency for everything**: Stocks from every market add up in euros, dollars or the currency you choose.
- 🔁 **Today's rates**: Values, today's change and gains convert at the latest exchange rate, the currency's own move included.
- 📲 **In the widget too**: With amounts on, the widget shows your portfolio in the same currency.

**Changes**

- Settings › Portfolio › Show your money in: Auto (the currency most of your money is in), EUR, USD, GBP, CHF, SEK, NOK, DKK, PLN, JPY, CAD, AUD or HKD
- Portfolio value, today's change, gain since you bought and the split across holdings now add up every stock in that currency, instead of showing other currencies apart
- Exchange rates load from Yahoo Finance with your prices (kept for 30 minutes); a new stock's currency loads when you add it, and changing the currency converts at once
- Today's change in your currency includes the currency's move since yesterday; what you paid is converted at today's rate
- A stock's page shows its value, today and gain in your currency, with its own currency underneath; London prices in pence are converted too
- Rows and Flash cards show values and today's profit in your currency; sorting by value uses it
- The briefing and the widget use the same total

**Fixes**

- Changes in money show two decimals, even when they're under one unit

## 1.5.0 (2026-10-30): Your markets, your plans

- 👆 **Charts you can touch**: New 1D and 1W charts; touch or drag any chart to see the price at that moment.
- 🕒 **Markets open or closed**: Every stock shows if its market is open, and a Markets tab counts down to each open and close.
- 🧭 **My strategies**: Add your own plans in Ideas; ✦ ideas, the briefing and stories follow them. Retire them when done.

**Changes**

- Stock charts: new 1D (from yesterday's close) and 1W ranges beside 1M, 6M, 1Y and 5Y; a day and a week are at most five minutes old
- Touch or drag across any chart to see the price, the time or date and the change at that moment; it stays a moment after you let go
- Each stock shows whether its market is open now (Portfolio, Watchlist, Flash), and its page says when it closes or opens, in your time
- New Markets tab: the markets where your stocks trade first, then 16 others, each open or closed (or on lunch break) with a countdown to the next open or close, local and your-time hours, and the trading day's progress
- Holidays: for markets where you hold stocks, Yahoo's own session times are used on top of the regular hours
- Ideas › My strategies: write your own plans with an optional timing, see them all, retire them (and bring them back or delete them)
- ✦ Ideas serve your active strategies, say which strategy each idea is for, and add a short Where it stands for every strategy; the briefing and stock stories take your strategies into account too
- The Ideas tab shows without an AI key, for your strategies

**Fixes**

- All five tabs fit on one line

## 1.4.1 (2026-10-30): Opens every time

- ⚡ **No more blank screen**: Opening Stockit from the widget shows the app at once; your stocks load behind it.
- 👆 **Safe with quick taps**: Tapping the widget several times no longer stacks up copies of the app.
- 🩺 **Start-up log**: Settings › Updates shows what happened the last times Stockit opened.

**Changes**

- An empty dark window appears first and the page is built inside it while it's visible, so iOS always draws it (the fix BlogPulse 1.9.2 uses)
- Stocks, prices, AI texts and usage are read after the first screen is shown, in pieces, each with a time limit; "Loading your stocks…" shows meanwhile
- If iCloud is slow to hand over a file, Stockit opens with what it has, says so, and saves nothing over your data until you reopen it
- Refreshing prices starts 0.7 s after the first screen, the update check after 3.5 s and the widget icon after 6 s
- Only one Stockit window at a time: a new run waits at most 1.5 s for an older one, then opens anyway
- If opening ever stalls, the screen shows what Stockit was waiting for

**Fixes**

- Blank screen when opening Stockit from the widget

## 1.4.0 (2026-10-30): Tap a stock, hear its news

- 👆 **Tap a stock to listen**: Tap any stock in Flash and its news starts playing; tap again to pause.
- 📰 **Three articles, read in full**: Stockit reads three full articles per stock, skipping ones it can't open, and tells a 350–550 word story.
- 👀 **See what you heard**: The story appears under the card, with which articles were read in full.

**Changes**

- Tap a stock's name in Flash to hear the story of its news; tap it again to pause or resume. The speaker beside the ticker shows when it's preparing or playing; Details › opens the stock's page
- Stockit now reads three full articles for each story: when an article can't be opened (paywall, blocked page), it reads the next headline instead, from up to eight
- ✦ Stories go through each article's facts, numbers, names and reasons in 350 to 550 words; a story that comes back too short is asked for again
- The story you heard appears under the card, with its sources, how many words of each were read, and which were headline only
- Yahoo's cookie-consent page in Europe is answered once (as "Accept all") and its cookies kept, so Yahoo articles can be read
- Other recent headlines are given to the AI as context for the story

## 1.3.0 (2026-10-30): Hear the whole story

- 🎧 **Listen to a stock's news**: Its top three articles are read in full and told as one story, then what it could mean.
- 📰 **Fuller TL;DRs**: Every ✦ TL;DR now tells the story in a few paragraphs, with the key facts and figures.
- 🔗 **More articles readable**: Google News links now lead to the publisher's article, so far fewer TL;DRs stop at the headline.

**Changes**

- Listen on each Flash card: Stockit reads that stock's top articles in full and ✦ AI tells them as one spoken story of 250 to 400 words, naming its sources, then what it could mean for the stock
- Listen at the top of Flash plays the story of every open card in turn; the player starts at once and the next story is prepared while one is playing
- Without an AI key, Listen reads each article's key sentences in turn instead of just its headline
- ✦ TL;DRs now include the story in two or three paragraphs and 4 to 6 key facts, and Listen reads the story too; up to 12,000 characters of the article are sent (Settings › AI limits)
- Google News links are resolved to the publisher's own article before reading
- Articles are kept in memory while Stockit is open, so a TL;DR and a story about the same headlines load each page once
- Stories and TL;DRs written without AI are rewritten with AI once you add a key
- Token usage counts News stories to listen to separately

## 1.2.0 (2026-10-30): Flash, at a glance

- 💼 **Your stake beside the news**: Each Flash card now shows your shares, today's profit or loss and Stockit's view.
- 🧭 **Analysts and the crowd**: The average Wall Street rating and the StockTwits mood, right next to the headlines.
- ✓ **Fold what you've read**: Fold a card once read; it opens again by itself when new headlines arrive.

**Changes**

- Flash cards fill the left column: shares, today's profit or loss in your currency, the ✦ buy, hold or sell view (or the price trend without AI), the analysts' average rating and the crowd's mood
- ✓ Read — fold it: a read card shrinks to one line (ticker, today's move, view, when the newest headline arrived); it opens again, marked New, when a newer headline arrives
- Fold all and Open all at the top of Flash; Listen reads only the cards that are open
- Flash ranks headlines that name the company first and leaves out quote and listing pages (such as "stock price, news, quote and history" or bond-yield pages)

## 1.1.0 (2026-10-29): Flash news, read to you

- ⚡ **Flash news**: A new tab with each stock beside its top three headlines, ranked by recency and source.
- ✂️ **TL;DR of any headline**: Tap a headline for the gist and what it could mean for the stock, then open the source.
- 🔊 **Read aloud**: Listen to the briefing, stories, TL;DRs and Flash with iPhone or ✦ AI voices.

**Changes**

- New Flash tab: every stock on the left, its top headlines on the right (owned stocks first, biggest first); Settings › Headlines sets how many, 1 to 5
- Tap any headline, in Flash or on a stock's page, for a TL;DR: one-line gist, key points and what it could mean for the stock, then Read the full article at the publisher
- TL;DRs are written by ✦ AI when you have a key, or taken from the article itself without one; Google News links are followed to the publisher where the page names it
- Read aloud, as in BlogPulse: Listen on the briefing, each stock's story, every TL;DR and the whole Flash, with a player bar to pause, skip and stop
- Settings › Listening: iPhone voices (filter female or male, speed, pitch) or ✦ AI voices from OpenAI (voice, speech model, how it should sound, speed)
- Token usage counts Article TL;DRs and Read aloud (characters) separately
- Settings › AI limits: how much article text is sent for a TL;DR

**Fixes**

- Opinions and Written notes sit on their own line above the buttons, so they're no longer squeezed

## 1.0.0 (2026-10-29): Your stocks, explained

- 📈 **Portfolio at a glance**: Owned stocks and a watchlist with live prices, today's move and gains since you bought.
- ✦ **A daily briefing**: Claude or OpenAI turns prices and headlines into a plain-English story and a view per stock.
- 📥 **Bring them in fast**: Search, paste a list, open a broker CSV or snap a screenshot of Apple's Stocks app.

**Changes**

- Portfolio and Watchlist tabs: price, today's change, a one-month trend line and a buy, hold or sell view per stock; sort by value, today, signal or A–Z
- Portfolio value, today's change and gain since you bought, with the split across your biggest holdings
- Stock page: 1M, 6M, 1Y and 5Y chart, your position, key numbers (P/E, market cap, dividend, analyst target, margins, growth, 52-week range) with a plain-words explanation on tap
- Headlines from Yahoo Finance and Google News, and the crowd's mood from StockTwits (each can be switched off)
- ✦ Portfolio briefing, a story per stock (why buy, what could go wrong, what to watch) and new ideas, with your investing style: Cautious, Balanced or Adventurous
- Add stocks by search, a pasted list with shares and average price, a broker CSV, or ✦ a screenshot
- Optional Finnhub key as a backup source for company numbers
- Home Screen and Lock Screen widget in the shared frame; shows percentages only unless you turn on amounts
- Shared blueprints from day one: in-app updates, Settings, AI configuration, launch screen and widgets (Settings › Built with)
