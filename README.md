# Clearview

Expo Router app for a window washing business with:

- customer-facing landing, services, schedule, auth, and profile screens
- Firebase Auth and Firestore profile integration
- admin dashboard placeholders for services and transaction management
- Stripe checkout placeholder flow ready to replace with Firebase Functions

## Run locally

```bash
npm install
npm run web
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
```

## Next implementation steps

1. Create Firestore collections for `users`, `services`, `bookings`, and `orders`.
2. Add Firebase Functions for Stripe checkout session creation and webhook processing.
3. Replace the typed mock data in `data/mock-data.ts` with Firestore reads.
