# Clearview

Expo Router app for a window washing business with:

- customer-facing landing, services, schedule, auth, and profile screens
- Firebase Auth and Firestore profile integration
- admin dashboard for services, discounts, bookings, and time slots
- Stripe Checkout and webhook scaffolding through Firebase Functions

## Run locally

```bash
npm install
npm run web
```

## Firebase Functions

Stripe checkout and webhook handling now live in `functions/`.

Typical setup:

```bash
cd functions
npm install
npm run build
```

Set Firebase Functions secrets before deploying:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

Then deploy:

```bash
firebase deploy --only functions
```

## Environment variables

These can stay in Expo public env vars for local development. The Firebase config currently falls
back to the values from your specification so the app is runnable immediately.

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
EXPO_PUBLIC_ADMIN_EMAILS=owner@example.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION=us-central1
EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR=false
EXPO_PUBLIC_FUNCTIONS_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FUNCTIONS_EMULATOR_PORT=5001
```

## Next implementation steps

1. Configure the deployed Stripe webhook endpoint in your Stripe dashboard.
2. Test the full checkout flow in Stripe test mode and confirm `orders` update on webhook receipt.
3. Add booking conflict checks so already-confirmed slots can’t be double-booked.
