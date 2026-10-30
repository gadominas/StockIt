# Changelog

All notable changes to Stockit. Generated from `releases.json`; edit that file, not this one.

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
