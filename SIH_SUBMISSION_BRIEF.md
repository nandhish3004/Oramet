# OraMet — SIH submission brief (prototype status)

> **This brief is the source of truth for the current prototype.** PDF exports are provided alongside it. Replace the bracketed team details and confirm that the project/app name matches your SIH registration before submitting.

## SIH details

- **Problem statement ID:** 26192
- **Problem statement:** Flash Flood Prediction System for Hilly Regions using Multi-Source Data Theme
- **Theme:** Disaster Management
- **Project/app name:** OraMet
- **Registered team name:** [FILL IN FROM SIH PORTAL]
- **Registered team ID:** [FILL IN FROM SIH PORTAL]
- **Institute:** [FILL IN]
- **Team members:** [FILL IN]

## Copy-ready project summary

OraMet is an Android-first prototype for local situational awareness during flood emergencies in hilly communities. It combines device-location context, current weather estimates from Open-Meteo when available, nearby mapped places from OpenStreetMap, basic emergency guidance, and a user-reviewed SMS draft addressed to India's 112 emergency number. It clearly distinguishes unavailable and approximate data from live observations, and does not present unvalidated flood predictions, shelters, or map directions as safe. Operational deployment would require authorized hazard feeds, verified shelter and road-status data, secure backend services, and agreements for emergency communications.

## What is implemented in this prototype

- React Native Android-first mobile app with location selection, location permission flow, local navigation, and offline local storage.
- Open-Meteo current-weather lookup when the public endpoint is reachable. Weather threshold labels are app heuristics only; they are **not** an IMD warning, river-gauge observation, flood forecast, or evacuation instruction.
- Nearby mapped-place lookup through OpenStreetMap/Overpass, with straight-line distance and an explicit notice that listings are not authority-verified, safe, or confirmed open.
- Generic directions handoff to a maps app with a warning that directions are not hazard-aware and may encounter closures or floodwater.
- Emergency contact action and a prefilled SMS composer. The user must review and tap Send; the app cannot confirm transmission or delivery.
- Local app data persistence. Prototype/sample alert rows are removed; weather advisories are only created from live weather responses at the configured app thresholds, with an in-process cooldown.
- Risk and data-availability screens that show **unavailable** instead of fabricating CWC/IMD/GSI/NHAI/ISRO readings or a flood-crest lead time.
- Manual vibration and SOS-prompt demos. Automatic accelerometer shake detection, audible rescue siren, background push delivery, and emergency-service dispatch are **not** implemented.

## Data and service boundaries

| Capability | Current status | Important limitation |
|---|---|---|
| Current weather | Open-Meteo public model, when reachable | Not an official warning or flood-risk forecast; model coverage and freshness can vary |
| Nearby places | OpenStreetMap/Overpass mapped results | Not an official shelter directory; places may be closed or unsuitable |
| River levels / flood crest | Not connected | No CWC gauge or validated catchment forecast feed; no lead-time prediction |
| Landslide / slope monitoring | Not connected | No operational GSI sensor or validated local susceptibility feed |
| Road closures / safe routes | Not connected | Directions are generic map directions, not evacuation routing |
| SMS | Opens a user-reviewed SMS draft | No automatic sending, delivery receipt, or 112/CAD integration |
| Push alerts | Not configured | No backend, push provider, or reliable background task |
| Authentication | No production identity provider configured | Do not describe demo/local flows as verified Google or phone authentication |
| Hosting/backend | Not configured | No production server or authority dashboard |

## 90-second live demo script

1. **Start:** “This is an Android-first prototype. We distinguish data we actually receive from feeds that are not connected.”
2. **Location:** Open the location selector. Explain that a selected city/village point is approximate; only precise device location is suitable for local searches or sharing.
3. **Weather:** If a live response is available, show the Open-Meteo weather estimate and its source label. If unavailable, show the unavailable state—do not describe it as clear or safe.
4. **Map:** Show nearby OpenStreetMap results and the “not authority-verified” disclosure. Open the directions warning; do not call it a safe evacuation route.
5. **Risk/data coverage:** Show that official IMD/CWC/GSI/NHAI/ISRO feeds and flood lead-time forecasts are not connected.
6. **SOS:** Open the SMS draft preview, then cancel without sending. Explain that the user must tap Send and that OraMet cannot confirm delivery. Mention that 112 can also be called directly.

## Suggested judge Q&A (accurate answers)

- **Does OraMet predict the time until a flood reaches a village?** No. A validated river-gauge and catchment forecast service is not connected, so the app deliberately withholds lead-time predictions.
- **Are the nearby results official shelters?** No. They are mapped OpenStreetMap places and may not be safe, open, or designated for evacuation.
- **Does the app send an SOS automatically?** No. It can prepare an SMS draft after a user action; the user reviews and sends it. No emergency-service dispatch integration is configured.
- **What makes it useful today?** It brings location context, available weather, mapped-place discovery, clear source status, and manual emergency actions into one Android prototype while avoiding false claims when critical feeds are absent.
- **What is needed for operational deployment?** Agency-approved IMD/CWC/GSI and road-closure feeds; verified shelter data; backend hosting, security and privacy review; approved SMS/push or ERSS integration; field validation; and operational agreements.

## Validation evidence

- `npx tsc --noEmit` — passed
- `npm test -- --runInBand` — passed (8 tests)
- `npm run lint` — passed
- `git diff --check` — passed
- Android Metro JavaScript bundle — passed
- Native Android Gradle build — **not run**: Java/JDK is not installed in the build environment. Do not claim a release APK was built or device-tested from this checkout.

## Before submission

- Fill in the registered team name, team ID, institute, and member names exactly as shown in the SIH portal.
- This checkout regenerates the old HydroSentinel-named PDF aliases with the current, corrected content, but the OraMet/HydroSentinel branding may not match your registered project name. Open the exact PDFs you plan to upload and check title/team metadata.
- If a video is required, record the actual running app and use the demo script above. Do not stage an alert or claim SMS delivery.
- Submit only artifacts allowed by your SIH portal and team coordinator; double-check the portal deadline/time zone.
