```
┌───────────────┐            HTTP/Webhook           ┌─────────────────────────────┐
│  Telegram App │ ────────────────────────────────► │   Supabase Edge Function (Deno)    │
│  (you DM bot) │                                     │      (Deno)     │
└───────────────┘                                     │  • Gemini call  │
      ▲                 push notifications            │  • JSON output  │
      │                                               └──────┬──────────────────────┘
      │                                                        │
┌─────┴─────────┐                                            ▼
│ React Native  │◄────────────────────────────────────────────┘
│  Mobile App   │            Realtime + REST           ┌────────────────┐
│    (Expo)     │  (tasks & lists)                     │  Supabase DB   │
└───────────────┘                                       │  + Edge cron  │
                                                      └────────────────┘
```

1. **Supabase Edge Function (Deno)** receives Telegram webhooks, calls the Gemini 1.5 Pro free API with a _function-calling_ prompt, and inserts the structured JSON into Supabase.
2. **Supabase** (free tier Postgres + Realtime + Edge Functions) stores tasks and fires a nightly cron that sends Expo push notifications when something is due.
3. **React Native (Expo)** app subscribes to Supabase Realtime, shows lists/important/scheduled views, and stores an Expo push token in `device_tokens` so the backend can ping you.
4. **LLM strategy** – Gemini by default; if quota tightens, swap to a local Gemma 3 model running via Ollama.
