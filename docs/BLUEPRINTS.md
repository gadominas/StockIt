# Blueprints

Stockit follows the shared blueprints in https://github.com/gadominas/app-blueprints from its first version.
The script's `BLUEPRINTS` block is the source of truth; this table mirrors it and adds deviations.

| Blueprint | Version | Since app version | Deviations |
| --- | --- | --- | --- |
| [in-app-updates](https://github.com/gadominas/app-blueprints/blob/in-app-updates-v1.0.0/blueprints/in-app-updates.md) | 1.0.0 | 1.0.0 | none (two-day snooze on **Later**, key `stockit-update-snooze`) |
| [settings](https://github.com/gadominas/app-blueprints/blob/settings-v1.0.0/blueprints/settings.md) | 1.0.0 | 1.0.0 | Each palette adds two Stockit colours, `up` and `down` (CSS `--up`, `--down`), for gains and losses; every other colour is a shared token. Settings load at the top of the script (no `loadSettings()`), before every branch, as in BlogPulse. One extra secret, an optional Finnhub key, follows Step 7 (own Keychain entry `STOCKIT_FINNHUB_KEY`, native secure prompt, the page sees only its last four characters) |
| [ai-configuration](https://github.com/gadominas/app-blueprints/blob/ai-configuration-v1.0.0/blueprints/ai-configuration.md) | 1.0.0 | 1.0.0 | `aiCall` takes an optional `images` argument for the screenshot import (base64 JPEG as an image block for Claude, an `image_url` for OpenAI); every request still goes through `aiCall` with a feature tag. One background job, the portfolio briefing, behind the **What AI does** switch |
| [launch-screen](https://github.com/gadominas/app-blueprints/blob/launch-screen-v1.0.0/blueprints/launch-screen.md) | 1.0.0 | 1.0.0 | The name uses the app's `--display` font (`--sp-font`); the trend-line class is `trendln` so no app class starts with `sp` |
| [widgets](https://github.com/gadominas/app-blueprints/blob/widgets-v1.0.0/blueprints/widgets.md) | 1.0.0 | 1.0.0 | The widget may reload prices itself when the snapshot is older than `widgetPriceAfterMin`, within `widgetBudget`, keeping the result in memory and saving only the widget snapshot (as BlogPulse does for blogs). Amounts of money stay out of the widget unless **Settings › Portfolio › Show portfolio value in the widget** is on |
| [ai-invitation](https://github.com/gadominas/app-blueprints/blob/ai-invitation-v1.2.1/blueprints/ai-invitation.md) | 1.2.1 | 1.13.3 | Reference implementation. `inviteIfDue` reaches the page with Stockit's `call("__aiInvite", AI_INVITE)` (its `js()`); `window.canInvite` holds the card back while privacy is on (demos) or Listen is playing |

## Recipes

Coding rules every app follows (https://github.com/gadominas/app-blueprints/tree/main/recipes). They describe how the code is written, not a feature, so they aren't listed in the script's `BLUEPRINTS` block or in Built with.

| Recipe | Version | Since app version | Deviations |
| --- | --- | --- | --- |
| [safe-startup](https://github.com/gadominas/app-blueprints/blob/safe-startup-v1.1.0/recipes/safe-startup.md) | 1.1.0 | 1.13.3 | none (reference implementation) |
