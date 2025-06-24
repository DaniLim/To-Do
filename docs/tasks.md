# Detailed task list

## Phase 0 – Bootstrap
- [x] **Bootstrap repository and configure Supabase tables**  
  Repo structure created and `schema/schema.sql` defines task, list and device token tables.
- [x] **Deploy Supabase edge function for Telegram webhook**  
  `supabase/functions/telegram_webhook/index.ts` stores incoming Telegram messages and responds.

## Phase 1 – MVP
- [x] **Connect Expo app to Supabase and display tasks**  
  `mobile/App.tsx` subscribes to the `tasks` table and renders a list of items.
- [ ] **Parse free-form text via Gemini to structured tasks**  
  Use Gemini function calling to extract title, due date and recurrence from messages.
- [ ] **Send push notifications for due tasks**  
  Schedule a cron job to trigger Expo push notifications when tasks are due.

## Phase 2 – Quality of Life
- [ ] **Implement recurring rules and snooze**  
  Allow repeating tasks and provide the ability to defer them temporarily.
- [ ] **Add offline cache and swipe to complete**  
  Persist tasks locally and support gesture-based completion in the app.

## Phase 3 – Calendar Sync
- [ ] **Integrate Google Calendar with OAuth and AI slot suggestion**  
  Authorize a calendar account and suggest event times based on availability.

## Phase 4 – Voice & OCR
- [ ] **Support voice messages via ASR**  
  Transcribe Telegram voice notes to create tasks automatically.
- [ ] **Add OCR for photo tasks**  
  Extract text from uploaded images and convert to tasks.

## Phase 5 – Polish
- [ ] **Build web dashboard and dark mode**  
  Provide a web interface with theme support for managing tasks.
- [ ] **Add biometric lock to mobile app**  
  Require fingerprint or face unlock before opening the app.
