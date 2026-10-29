# Changelog

All notable changes to Stockit. Generated from `releases.json`; edit that file, not this one.

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
