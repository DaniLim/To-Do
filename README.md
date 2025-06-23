# todo-ai-telegram

Telegram-driven to-do and calendar assistant powered by Gemini 1.5 Pro. Chat with the bot to capture tasks and schedule reminders that sync instantly to a React Native app via Supabase.

## Quick start
1. Install dependencies: Python 3.11, Node.js, Expo, Supabase CLI.
2. Copy `infra/.env.example` to `.env` and fill in values. `SUPABASE_FUNCTION_JWT_SECRET` is used to sign requests to the edge function.
3. `supabase db push` – apply database schema.
4. `railway up` – deploy FastAPI worker.
5. `expo start` – run the mobile app.

See the [docs](docs/) directory for architecture, roadmap and more.
