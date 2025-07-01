# Roadmap

The project evolves in several phases. Each phase groups related tasks from `tasks.md` and provides an estimate.

| Phase | Scope | Est. time |
| --- | --- | --- |
| **0 – Bootstrap** | Repo scaffolding, Supabase tables, edge function, Telegram webhook. | 3–4 h |
| **1 – MVP** | Gemini parsing, list views in Expo, push reminders. | Weekend |
| **2 – Quality of Life** | Recurring rules, snooze, offline cache, swipe to complete. | +1 week |
| **3 – Calendar Sync** | Google Calendar OAuth + AI slot suggestion. | +2 weeks |
| **4 – Voice & OCR** | Voice transcription and image OCR for task capture. | +1 week |
| **5 – Polish** | Web dashboard, dark mode, biometric lock. | ongoing |

## Detailed milestones

### Phase 0 – Bootstrap ✅
1. Initialize repository with README, docs and directories.
2. Define `task_lists`, `tasks` and `device_tokens` tables in `schema.sql`.
3. Implement `telegram_webhook` Supabase function to store incoming messages.
4. Add deployment instructions for setting up the webhook.

### Phase 1 – MVP
1. Parse messages with Gemini and store structured tasks.
2. Display tasks in the Expo app with realtime updates and a modern UI. ✅
3. Send push notifications when tasks are due.

### Phase 2 – Quality of Life
1. Support recurring tasks and snooze functionality.
2. Enable offline cache and add swipe-to-complete gestures.

### Phase 3 – Calendar Sync
1. OAuth flow for Google Calendar integration.
2. AI-assisted suggestions for scheduling.

### Phase 4 – Voice & OCR
1. Transcribe voice messages from Telegram.
2. Extract tasks from photos using OCR.

### Phase 5 – Polish
1. Build a web dashboard with dark mode.
2. Add biometric lock to the mobile app.
