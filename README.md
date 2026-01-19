# 🛡️ Discord Guild Shift

> **A professional, open-source automation system designed to manage community migrations between Discord servers.**

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/172272341?v=4" width="120" height="120" alt="Developer Profile" style="border-radius: 50%;">
  <br/>
  <h3>Developed by Rajnish Mehta</h3>
</div>

---

## 📖 Overview

**Discord Guild Shift** is a high-performance bot built to automate the transition of members from an **Old Server** to a **New Server**. 

When a user joins your new server, the bot instantly verifies if they are a member of the old server. Based on your configuration, it automatically syncs roles, logs the event, and optionally kicks them from the old server to ensure a clean migration.

## ✨ Key Features

* **⚡ Smart Detection**: Listens for joins in the `New Guild` and cross-references them with the `Old Guild`.
* **🎭 Role Assignment**: Automatically grants specific roles to verified migrants in the new server.
* **👢 Auto-Kick System**: (Configurable) Automatically kicks the user from the old server after they successfully join the new one.
* **🔒 Safety First**: Built with **Zod** for strict environment validation. The bot will not start if the configuration is invalid.
* **📝 Webhook Logging**: detailed logs of every migration event sent directly to a private Discord channel.
* **❤️ Keep-Alive**: Includes a built-in HTTP server to prevent the bot from sleeping on free hosting platforms.

---

## 🛠️ Tech Stack

* **Language:** ![TypeScript](https://img.shields.io/badge/TypeScript-ES2024%20%7C%20NodeNext-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
* **Library:** ![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord)
* **Validation:** ![Zod](https://img.shields.io/badge/Zod-Schema%20Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
* **Package Manager:** ![pnpm](https://img.shields.io/badge/pnpm-Package%20Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

---

## 🚀 Setup & Installation

### 1. Clone the Repository
Clone this repository

### 2. Install Dependencies
```bash
pnpm install --frozen-lockfile
```
### 3. Environment Configuration
Create a .env file in the root directory and add the following:
```ini
# Bot Token
TOKEN=your_bot_token

# Server IDs
OLD_GUILD=1080560914262139001 (old guild id)
NEW_GUILD=1005766057480421466 (new guild id)

# Role IDs to give in the New Guild (Comma separated)
ROLES=1462197920999673918 (if you want multiple then like this 1462197920999673918,1462197920999675253,146219792626262)

# Logging Webhook (Required for logs)
WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy

# Kick user from old guild? (true/false)
KICK_FROM_OLD=false
```
### 4. Build and Start
#### Build:
```bash
# Build the TypeScript code
pnpm run build
```
OR
```bash
# Build the TypeScript code
tsc
```
#### start:
```bash
# Start the bot
pnpm start
```

---

## 📜 Requirements
1. **Administrator Privileges:** The bot must have Administrator permissions in BOTH the Old and New guilds to fetch members and kick users. (if bot haven't administrative permission then system automatically crash)
2. **Role Hierarchy:** In the New Guild, ensure the Bot's role is higher than the roles it is trying to assign.


---

## 🤝 Contributing
Contributions are welcome!
1. [Fork the project](../../fork)
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Developed with ❤️ by [Rajnish](https://gh-perma.pages.dev/?id=172272341)
