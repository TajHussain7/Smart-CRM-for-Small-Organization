# Smart CRM frontend integration

Web and mobile use the existing backend APIs. No backend changes are included.

## Configuration

Copy each app's `.env.example` to `.env.local`. Web uses `VITE_API_BASE_URL`; mobile uses `EXPO_PUBLIC_API_BASE_URL`. Both must include `/api/v1`. The current deployed web bundle points to the Render address in these examples. Set the same variables in Vercel and mobile build environments. Never add credentials to public environment variables.

## Supported workflows

Authentication and workspace registration; students and teachers; class timetables; individual and bulk attendance; monthly invoices, fee payments and PDF receipts; gym members, renewals, sessions and reports; barber clients, services, appointments, payments and reports; users, tasks, alerts, activity history and AI requests.

The old demo screens and in-memory stores have been replaced with API-backed record screens on both platforms. Empty responses display empty states. Failed requests display errors. Barber payments require an in-progress appointment. Trainers and barbers are selected from workspace users. Profile fields without backend support are not saved locally as if persisted.

## Shared contracts

Canonical transport, forms and action mapping live in `shared/`. Run `node frontend/shared/sync.mjs` from the repository root after editing them. Generated copies are checked in so each Vercel/Expo project builds independently.

## Validation

From repository root:

- `node --experimental-strip-types --test frontend/shared/integration.test.mjs`
- `node frontend/shared/sync.mjs --check`

Web: `npm run lint` and `npm run build`.
Mobile: `npx tsc --noEmit`, `npm run lint`, and `npx expo export --platform android --platform ios --output-dir dist-check`.

Live verification: login, root health, live-origin CORS and 23 authenticated read routes passed using the supplied test workspace. Production write flows and physical-device behavior still need end-to-end acceptance testing. Local browser preview was unavailable during verification. No test credentials are stored in source.
