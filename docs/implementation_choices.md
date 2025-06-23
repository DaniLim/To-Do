| Concern | Choice | Rationale & free-tier limits |
|---------|--------|------------------------------|
| **LLM** | Gemini 1.5 Pro free tier (≈60 req/min, 128 k ctx) | $0 for a single-user bot. |
| **Fallback LLM** | Gemma 3 1B/4B local | Open weights, laptop-friendly. |
| **Bot framework** | `python-telegram-bot` (async) | Mature, first-class webhook support. |
| **Storage** | Supabase Postgres | 0 $ / <500 MB DB, instant REST & RLS. |
| **Mobile** | React Native + Expo | One codebase, OTA updates, push notifications. |
| **Notifications** | Expo Push + Telegram fallback | Native alerts + chat replies. |
| **Hosting** | Fly.io / Railway free | Runs FastAPI worker + cron; custom domain for webhook. |
