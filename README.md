# OraMet

> **Prototype for Smart India Hackathon (SIH 2026), Problem Statement #26192.** This repository is not an official NDRF, NDMA, IMD, CWC, GSI, ISRO, or government application.

## Safety and production status

**Do not use this prototype as the sole source for emergency, evacuation, or route decisions. It is not an operational early-warning or dispatch service.** It does not have an authorized government telemetry backend, verified shelter directory, emergency-service dispatch integration, or production identity provider configured.

The app currently has working prototype flows for local navigation, device location permission requests, weather lookups through Open-Meteo when reachable, local SQLite email accounts/alerts, and opening a prefilled SMS draft. Opening an SMS draft is not sending it: the user must review and tap **Send**. Emergency Guest access is available without an account.

Unsupported agency readings and lead-time estimates are now withheld rather than simulated in the app’s active risk flow. The CWC integration reports unavailable until an approved feed is configured. The manual SOS prompt and vibration controls are demos only; neither detects a shake automatically nor contacts emergency services.

## Product vision (not yet delivered)

OraMet is intended to help residents understand local weather hazards and find evacuation support. Production use would require approved and validated integrations for:

- Official IMD, CWC, GSI, NHAI, and other data feeds, including freshness, location coverage, fallback, and quality metadata.
- An authenticated backend and agency-authorized responder workflows.
- A maintained directory of authority-verified shelters and routes; mapped places alone are not proof that a site is safe or open.
- A compliant emergency notification and communications provider. An SMS composer, local queue, or test notification is not emergency dispatch.
- Field validation, security/privacy review, accessibility testing, and operational approval from the relevant authorities.

No API keys, provider credentials, or agency approvals are included in this repository. Do not add secrets to source control or chat.

## Run and build the Android prototype

1. Install Node.js and npm, Android Studio, the Android SDK and NDK versions requested by `android/build.gradle`, and JDK 17.
2. Install dependencies: `npm ci`.
3. Start Metro with `npm start`, then run the app on a connected Android device/emulator from another terminal with `npm run android`.

To create a bundled APK for device demos, run `npm run build:apk`. It builds the `staging` variant at `android/app/build/outputs/apk/staging/app-staging.apk`. This APK is signed with the development key and uses a separate `.staging` application ID; it is for testing only, not Play Store or public production distribution. `npm run build:debug` creates the Metro-dependent debug APK.

A distributable release requires your own secure Android signing key. Set `ORAMET_RELEASE_STORE_FILE` (absolute path), `ORAMET_RELEASE_STORE_PASSWORD`, `ORAMET_RELEASE_KEY_ALIAS`, and `ORAMET_RELEASE_KEY_PASSWORD` in the build environment, then run `npm run build:release-apk`. Do not commit the keystore or credentials. Release builds intentionally fail when signing is not configured.

Android builds require a working JDK and Android SDK/NDK installation; local SDK paths are machine-specific and are not committed. The app still requires an Android device/emulator for native location, SQLite, and SMS-composer behavior. An installable APK is not equivalent to a production-ready emergency app: the authorized telemetry, responder, shelter, authentication, and background notification integrations above are not configured.

## Checks

- TypeScript: `npx tsc --noEmit`
- Tests: `npm test -- --runInBand`
- Lint: `npm run lint`

## SIH submission artifacts

For an accurate description of this checkout, use `SIH_SUBMISSION_BRIEF.md`, `OraMet_SIH2026_Submission_Presentation.pdf`, and `OraMet_SIH2026_Submission_Dossier.pdf`. The older HydroSentinel-named PDF aliases have been regenerated with the current prototype description, but their filenames/branding may not match your registered SIH project name. Confirm the title and fill registered team details from the SIH portal before uploading.

## Technical stack

- React Native 0.74.x with TypeScript
- Zustand state management
- SQLite and AsyncStorage local persistence
- React Navigation
- Open-Meteo public weather API where network access is available
