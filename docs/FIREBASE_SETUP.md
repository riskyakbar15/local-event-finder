# Firebase setup for Local Event Finder

This document explains how to provide Firebase credentials to the app during development and production.

Options

1. Local `.env` (development)

- Create a file named `.env` in the project root (do NOT commit it).
- Fill the variables listed in `.env.example`:

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

- Use a tool like `dotenv` or configure your bundler to expose these to `process.env` when running locally.

1. Expo `app.json` / `app.config.js` (recommended for Expo dev)

- In `app.json` add your secrets under `expo.extra`:

```json
{
  "expo": {
    "name": "local-event-finder",
    "slug": "local-event-finder",
    "extra": {
      "FIREBASE_API_KEY": "...",
      "FIREBASE_AUTH_DOMAIN": "...",
      "FIREBASE_PROJECT_ID": "...",
      "FIREBASE_STORAGE_BUCKET": "...",
      "FIREBASE_MESSAGING_SENDER_ID": "...",
      "FIREBASE_APP_ID": "..."
    }
  }
}
```

- These values will be available at runtime via `Constants.expoConfig.extra` and are used by `src/config/firebase.ts`.

1. EAS Secrets (production)

- Use `eas secret:create` to store secrets for your project and reference them in `app.config.js` or CI.

Runtime check

The app exports an `isFirebaseConfigured()` helper from `src/config/firebase.ts`. It returns `true` when the minimum set of keys are present.

Next steps

- After adding your credentials, run:

```bash
npm install
npm start
```

- Verify `isFirebaseConfigured()` returns `true` in the dev console or use the app and try signing in.

Security note

- Never commit your real credentials to version control. Use `.gitignore` to exclude `.env` and rely on environment management for CI/prod.
