# todo-ai-telegram

Telegram-driven to-do and calendar assistant powered by Gemini 1.5 Pro. Chat with the bot to capture tasks and schedule reminders that sync instantly to a React Native app via Supabase.

## Quick start
1. Install dependencies: Python 3.11, Node.js, Expo, Supabase CLI.
2. Copy `infra/.env.example` to `.env` and fill in values.
3. `supabase db push` – apply database schema.
4. Deploy the webhook:
   ```
   supabase functions deploy telegram_webhook \
     --project-ref <your-project-ref> \
     --env-file .env --no-verify-jwt
   ```
   This uploads the edge function so Telegram can reach your Supabase project.
5. Copy the function URL from the deploy output and set it as your bot's webhook:
   ```
   curl "https://api.telegram.org/bot$TELEGRAM_TOKEN/setWebhook?url=<FUNCTION_URL>"
   ```
6. `expo start` – run the mobile app.

See the [docs](docs/) directory for architecture, roadmap and more.

## Verify Phase 0 completion

Phase 0 is finished once incoming Telegram messages appear in the mobile app.
You can confirm the codebase status by opening `docs/roadmap.md` and
`docs/tasks.md`—both mark every Phase 0 item with a checkmark.
