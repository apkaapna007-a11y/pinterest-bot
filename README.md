<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen.svg?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Playwright-Latest-blue.svg?style=for-the-badge&logo=playwright" alt="Playwright">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License">
</p>

<h1 align="center">Pinterest Automation Bot</h1>

<p align="center">
  A stealthy, modular, and highly configurable Pinterest automation tool designed for organic growth, engagement, and audience building.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation--setup">Installation</a> •
  <a href="#%EF%B8%8F-configuration">Configuration</a> •
  <a href="#%EF%B8%8F-account-safety">Safety</a> •
  <a href="#-troubleshooting">Troubleshooting</a>
</p>

---

## ⚠️ Important Disclaimer
> Automating actions on Pinterest may violate their [Terms of Service](https://policy.pinterest.com/en/terms-of-service). Aggressive automation can lead to action blocks, shadowbanning, or permanent account suspension. **Use this tool responsibly, at your own risk, and strictly adhere to the built-in rate limits.** This tool is provided for educational purposes.

---

## 🚀 Features

- **🕵️ Stealth Mode**: Implements human-like scrolling, randomized action delays, and `navigator.webdriver` masking to evade basic bot detection mechanisms.
- **💾 Session Persistence**: Saves your authenticated browser state (including 2FA tokens) after the first run. No need to re-enter credentials or solve CAPTCHAs on subsequent runs.
- **🎯 Configurable Actions**: Independently toggle auto-following, auto-liking, and auto-saving (repinning) based on your growth strategy.
- **🛡️ Built-in Safety Limits**: Hard caps on actions per session (e.g., max 15 follows, 30 likes) to protect your account health and mimic organic user behavior.
- **🧩 Modular Architecture**: Clean separation of authentication (`auth.js`), engagement logic (`actions.js`), and logging (`logger.js`) for easy customization and extension.
- **📝 Detailed Logging**: Professional, timestamped console and file logging using `winston` to track bot activity and debug issues.

---

## 💻 Installation & Setup

### 1. Clone the Repository
```shell
git clone https://github.com/apkaapna007-a11y/pinterest-bot.git
cd pinterest-bot
```

### 2. Install Dependencies
Ensure you have Node.js v18 or higher installed.
```shell
npm install
npx playwright install chromium
```

### 3. Configure Environment
Copy the example environment file to create your local configuration:
```shell
cp .env.example .env
```
Open `.env` in your preferred text editor and update the following:
- `PINTEREST_EMAIL` and `PINTEREST_PASSWORD` with your actual credentials.
- Adjust `MAX_LIKES_PER_SESSION`, `MAX_FOLLOWS_PER_SESSION`, etc., to conservative values.
- **Crucial**: Set `HEADLESS=false` for the **very first run** to allow manual 2FA completion if your account requires it.

### 4. First Run (Authentication)
Run the bot with the browser visible:
```shell
npm start
```
*If Pinterest prompts for 2FA or a CAPTCHA, complete it in the visible browser window. The bot will automatically detect the successful login and save the session state to `src/session.json`.*

### 5. Subsequent Runs (Headless)
Once authenticated, you can safely set `HEADLESS=true` in your `.env` file to run the bot silently in the background:
```shell
npm start
```

---

## ⚙️ Configuration (.env)

| Variable | Description | Recommended Default |
|----------|-------------|---------------------|
| `PINTEREST_EMAIL` | Your Pinterest account email | *Required* |
| `PINTEREST_PASSWORD` | Your Pinterest account password | *Required* |
| `ACTION_LIKE` | Enable auto-liking (`true`/`false`) | `true` |
| `ACTION_SAVE` | Enable auto-saving/repinning (`true`/`false`) | `true` |
| `ACTION_FOLLOW` | Enable auto-following (`true`/`false`) | `true` |
| `MAX_LIKES_PER_SESSION` | Max likes before the bot stops | `20` |
| `MAX_SAVES_PER_SESSION` | Max saves before the bot stops | `15` |
| `MAX_FOLLOWS_PER_SESSION` | Max follows before the bot stops | `10` |
| `MIN_DELAY_BETWEEN_ACTIONS` | Min delay between actions (milliseconds) | `4000` |
| `MAX_DELAY_BETWEEN_ACTIONS` | Max delay between actions (milliseconds) | `9000` |
| `HEADLESS` | Run without a visible browser window | `false` *(true after 1st run)* |

---

## 🛡️ Best Practices for Account Safety

1. **Warm Up Your Account**: Do not use this on brand-new accounts. Accounts with a history of manual activity, verified emails, and a complete profile are significantly more resilient.
2. **Start Conservatively**: Begin with very low limits (e.g., 5 likes, 2 follows per session) and gradually increase them over several weeks.
3. **Use Proxies (Advanced)**: For maximum safety, route the browser traffic through a high-quality residential proxy to avoid IP-based flagging.
4. **Vary Your Schedule**: Do not run the bot at the exact same time every day. Human users are unpredictable; your bot should be too.
5. **Monitor Your Account**: Regularly check your Pinterest notifications and account status for any warnings from the platform. If you receive a warning, stop using the bot immediately.

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Missing PINTEREST_EMAIL or PASSWORD"** | Ensure you have renamed `.env.example` to `.env` and filled in the values without extra spaces or quotes. |
| **Bot gets stuck on login screen** | Pinterest may be showing a CAPTCHA or 2FA prompt. Set `HEADLESS=false`, run the bot, and complete the challenge manually. |
| **"Target closed" or "Navigation failed"** | Your internet connection may have dropped, or Pinterest temporarily blocked the request. The bot will log the error and exit gracefully. Check `bot.log` for details. |
| **Actions are not happening** | Pinterest frequently updates its UI. The bot relies on `data-test-id` attributes. If Pinterest changes these, the selectors in `src/actions.js` may need updating. |

---

## 🛠️ Extending the Bot

Want to add more features? The modular design makes it easy:
- **Keyword Search**: Modify `src/actions.js` to navigate to `https://www.pinterest.com/search/pins/?q=YOUR_KEYWORD` before starting the engagement loop.
- **AI Comments**: Integrate an LLM API (like OpenAI) in `src/actions.js` to generate unique, context-aware comments for pins.
- **Proxy Support**: Pass a `proxy: { server: 'http://myproxy:3128' }` object into the `browser.newContext()` call in `src/auth.js`.

---

## 🙋‍♂️ Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/apkaapna007-a11y/pinterest-bot/issues) or submit a Pull Request.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
