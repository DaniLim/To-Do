# Mobile App

This folder contains the React Native app built with **Expo**. It connects to Supabase and receives realtime updates for tasks.

## Development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
# edit .env with your SPBASE_URL and SPBASE_ANON_KEY
```

3. Start the Expo dev server:

```bash
npx expo start
```

The app reads the Supabase URL and anon key from `app.config.js`, which loads them from `.env`.
