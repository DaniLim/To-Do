# Local Development Guide

This guide explains how to run the Telegram bot, Supabase functions and mobile app entirely on your machine.

## 1. Install prerequisites

- [Deno](https://deno.land/) >= 1.35
- [Python](https://www.python.org/) 3.11
- [Node.js](https://nodejs.org/) >= 18
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase`)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) (`npm install -g expo-cli`)

Docker is required if you want to start a local Postgres instance with `supabase start`.


## 2. Clone and set up the repository

```bash
git clone https://github.com/your-org/todo-ai-telegram.git
cd todo-ai-telegram
```

Create a Python virtual environment and install the backend requirements:

```bash
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

Install Node dependencies and the Expo tooling:

```bash
npm install
npm install -g expo-cli
```


## 3. Configure environment variables

Copy the example environment files and fill in your credentials:

```bash
cp infra/.env.example infra/.env
cp mobile/.env.example mobile/.env
# edit both files with your Supabase and Telegram keys
```

Link your local project to a Supabase instance:

```bash
supabase link --project-ref <your-project-ref>
```

Apply the database schema:

```bash
supabase db push
```


## 4. Run Supabase functions locally

The Telegram webhook can be served on your machine using the CLI. This watches the function file and reloads on changes.

```bash
supabase functions serve telegram_webhook --env-file infra/.env --no-verify-jwt
```

The command outputs a URL like `http://localhost:54321/functions/v1/telegram_webhook`. This will be used when registering the Telegram webhook.


## 5. Start the local backend

If you want to run the optional Python FastAPI server, start it with Uvicorn:

```bash
uvicorn backend.main:app --reload
```

It will read the same variables defined in `infra/.env`.


## 6. Register the Telegram webhook

While the function is running locally you can expose it via a tunnelling tool such as `ngrok` or use the local URL directly if Telegram can reach it. Replace `<FUNCTION_URL>` with the address printed by `supabase functions serve` (or your ngrok URL):

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "<FUNCTION_URL>",
    "secret_token": "'$TELEGRAM_SECRET_TOKEN'"
  }'
```


## 7. Launch the mobile app

Inside the `mobile` folder install dependencies and start the Expo dev server:

```bash
cd mobile
npm install
expo start
```

The app will read the Supabase URL and anon key from `mobile/.env`.


## 8. Run tests and linting

The repository includes simple checks that mirror the CI workflow:

```bash
# Backend
ruff backend
pytest

# Mobile
cd mobile && npx expo lint
```

