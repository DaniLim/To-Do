# Todo-AI-Telegram

![Telegram](https://img.shields.io/badge/Telegram-Bot-blue) ![Supabase](https://img.shields.io/badge/Supabase-Edge%20Functions-green) ![React%20Native](https://img.shields.io/badge/React--Native-Mobile-yellow) ![Python](https://img.shields.io/badge/Python-3.11-blue) ![License](https://img.shields.io/badge/License-MIT-lightgrey)

A Telegram-driven to-do and calendar assistant powered by **Gemini 1.5 Pro**. Capture tasks and schedule reminders via chat, with seamless sync to a **React Native** app backed by **Supabase**.

---

## 🔖 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Telegram Webhook Setup](#-telegram-webhook-setup)
- [Mobile App](#-mobile-app)
- [Configuration & Deploy](#-configuration--deploy)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **Chat-driven tasks**: Add to-dos directly from Telegram messages.
- **AI-powered**: Leverage **Gemini 1.5 Pro** for natural language parsing and smart scheduling.
- **Real-time sync**: Tasks and reminders sync instantly to the **React Native** mobile app via **Supabase**.
- **Secure**: Validates Telegram webhooks and uses **Supabase Secrets** for credentials.
- **Extensible**: Easily add new commands or integrations.

---

## 🏛️ Architecture

1. **Telegram Bot**: Receives user messages.
2. **Supabase Edge Function** (`telegram_webhook`): Validates, stores tasks, triggers AI parsing or scheduling.
3. **Supabase Database**: Stores tasks, users, reminders.
4. **React Native App**: Displays tasks and calendars, allows local interaction.
5. **Gemini 1.5 Pro**: Parses natural text into structured tasks.

---

## 📋 Prerequisites

- **Deno** >= v1.35 (for local function serve)
- **Python** 3.11 (if running AI preprocessing locally)
- **Node.js** >= 18
- **Expo CLI** (for React Native development)
- **Supabase CLI**
- A Supabase project with service role key & functions enabled
- A Telegram bot token
- A **Gemini API key** (Google Generative AI)

---

## 🚀 Quick Start

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-org/todo-ai-telegram.git
   cd todo-ai-telegram
   ```

2. **Install dependencies**

   ```bash
   python -m venv venv && source venv/bin/activate
   npm install
   npm install -g expo-cli
   ```

3. **Configure environment**

   ```bash
   cp infra/.env.example infra/.env
   # Edit infra/.env with your credentials
   ```

4. **Initialize database**

   ```bash
   supabase db push
   ```

5. **Deploy Edge Function**

   ```bash
   # Store secrets in Supabase
   supabase secrets set --env-file infra/.env --project-ref <your-project-ref>

   # Deploy the Telegram webhook
   supabase functions deploy telegram_webhook \
     --project-ref <your-project-ref> \
     --no-verify-jwt
   ```

6. **Set Telegram webhook**

   ```bash
   # Serve locally (for testing) or use deployed URL
   supabase functions serve telegram_webhook --env-file infra/.env --no-verify-jwt
   # Then register the webhook with Telegram, including your secret token
   curl -X POST "https://api.telegram.org/bot$TELEGRAM_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "<FUNCTION_URL>",
       "secret_token": "'$TELEGRAM_SECRET_TOKEN'"
     }'
   ```

7. **Start the mobile app**

   ```bash
   cd mobile
   cp .env.example .env  # add SPBASE_URL and SPBASE_ANON_KEY
   expo start
   ```

---

## 🔧 Environment Variables

Located in `infra/.env` (backend) and `mobile/.env` (mobile app):

```dotenv
SPBASE_URL=
SPBASE_SERVICE_ROLE_KEY=
SPBASE_ANON_KEY=
TELEGRAM_TOKEN=
TELEGRAM_SECRET_TOKEN=
GEMINI_API_KEY=
```

> **Note**: Secrets should be pushed to Supabase using `supabase secrets set` before deployment.

---

## 🔗 Telegram Webhook Setup

Secure and validate incoming updates from Telegram by using a dedicated secret token.

1. **Define the webhook secret** in your `infra/.env`:

   ```dotenv
   TELEGRAM_SECRET_TOKEN=your-long-random-string
   ```

   Then push it to Supabase Secrets:

   ```bash
   supabase secrets set --env-file infra/.env --project-ref <your-project-ref>
   ```

2. **Deploy the Edge Function** (if not already deployed):

   ```bash
   supabase functions deploy telegram_webhook \
     --project-ref <your-project-ref> \
     --no-verify-jwt
   ```

3. **Register the webhook with Telegram**, passing your bot token and the secret token:

   ```bash
   curl -X POST "https://api.telegram.org/bot$TELEGRAM_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "<FUNCTION_URL>",
       "secret_token": "'$TELEGRAM_SECRET_TOKEN'"
     }'
   ```

   > Telegram will include `x-telegram-bot-api-secret-token: your-long-random-string` in each update request.

---

## 📱 Mobile App

- Built with **React Native** and **Expo**.
- Connects to Supabase for real-time data.
- Supports adding, editing, and completing tasks.
- Calendar view for reminders.

See [mobile/README.md](mobile/README.md) for details.

---

## ⚙️ Configuration & Deploy

- **Edge Function**: Lives under `supabase/functions/telegram_webhook/`.
- **Database Schema**: Defined in `schema/schema.sql`.

---

## 🤝 Contributing

Contributions are welcome! Please open issues or PRs in the [GitHub repo](https://github.com/your-org/todo-ai-telegram).

---

## 📄 License

Released under the MIT License. See [LICENSE](LICENSE) for details.
