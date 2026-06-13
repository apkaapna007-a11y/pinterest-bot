<p align="center">
  <strong>Pinterest Bot</strong>
</p>

<p align="center">
  A stealthy, modular Pinterest automation tool for organic growth and engagement.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen.svg">
  <img src="https://img.shields.io/badge/Playwright-Latest-blue.svg">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg">
</p>

---

## ⚠️ Important Disclaimer
Automating actions on Pinterest may violate their [Terms of Service](https://policy.pinterest.com/en/terms-of-service). Aggressive automation can lead to action blocks, shadowbanning, or permanent account suspension. **Use this tool responsibly, at your own risk, and strictly adhere to the built-in rate limits.**

---

## 🚀 Features
- **Stealth Mode**: Human-like scrolling, randomized delays, and WebDriver masking to evade basic bot detection.
- **Session Persistence**: Saves your login state after the first run, so you don't have to re-enter credentials (or 2FA) every time.
- **Configurable Actions**: Toggle following, liking, and saving (repinning) independently.
- **Safety Limits**: Hard caps on actions per session to protect your account health.
- **Modular Architecture**: Clean separation of authentication, actions, and logging for easy customization.

---

## 💻 Installation & Setup

### 1. Clone the Repository
```shell
git clone https://github.com/apkaapna007-a11y/pinterest-bot.git
cd pinterest-bot
```

### 2. Install Dependencies
```shell
npm install
npx playwright install chromium
```

### 3. Configure Environment
Copy the example environment file and fill in your details:
```shell
cp .env.example .env
```
Open `.env` and update:
- `PINTEREST_EMAIL` and `PINTEREST_PASSWORD`
- Adjust `MAX_LIKES_PER_SESSION`, `MAX_FOLLOWS_PER_SESSION`, etc., to conservative values.
- Set `HEADLESS=false` for the **very first run** to allow manual 2FA completion if your account requires it.

### 4. First Run (Authentication)
Run the bot with the browser visible:
```shell
npm start
```
*If prompted for 2FA, complete it in the visible browser window. The bot will automatically save the session for future headless runs.*

### 5. Subsequent Runs (Headless)
Once authenticated, you can set `HEADLESS=true` in your `.env` file and run the bot in the background:
```shell
npm start
```

---

## ⚙️ Configuration (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PINTEREST_EMAIL` | Your Pinterest account email | *Required* |
| `PINTEREST_PASSWORD` | Your Pinterest account password | *Required* |
| `ACTION_LIKE` | Enable auto-liking (`true`/`false`) | `true` |
| `ACTION_SAVE` | Enable auto-saving/repinning (`true`/`false`) | `true` |
| `ACTION_FOLLOW` | Enable auto-following (`true`/`false`) | `true` |
| `MAX_LIKES_PER_SESSION` | Max likes before stopping | `30` |
| `MAX_FOLLOWS_PER_SESSION` | Max follows before stopping | `15` |
| `MIN_DELAY_BETWEEN_ACTIONS` | Min delay between actions (ms) | `3000` |
| `MAX_DELAY_BETWEEN_ACTIONS` | Max delay between actions (ms) | `8000` |
| `HEADLESS` | Run without a visible browser window | `false` |

---

## 🛡️ Best Practices for Account Safety
1. **Start Small**: Begin with very low limits (e.g., 5 likes, 2 follows per session) and gradually increase over weeks.
2. **Use Proxies**: For advanced users, routing traffic through a residential proxy is highly recommended.
3. **Never Spam**: Do not use this on brand new accounts. Accounts with history and verified emails are more resilient.
4. **Monitor Your Account**: Regularly check your Pinterest notifications for any warnings from Pinterest.

---

## 🙋‍♂️ Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/apkaapna007-a11y/pinterest-bot/issues).

---

## 📜 License
This project is licensed under the MIT License.
