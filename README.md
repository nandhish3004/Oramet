# OraMet (NDRF Early Warning & Evacuation System)

> **Smart India Hackathon (SIH 2026) — Problem Statement #26192**  
> **Title**: *Flash Flood Prediction System for Hilly Regions using Multi-Source Data Theme*  
> **Organization**: *Ministry of Home Affairs*  
> **Department**: *National Disaster Response Force (NDRF), DM Division*  
> **Theme**: *Disaster Management*

---

## Overview

**OraMet** is an autonomous, hyper-local disaster intelligence mobile application engineered to predict flash floods and landslides across hilly regions in India with actionable lead times.

Unlike traditional district-wide forecasts, OraMet fuses multi-source environmental telemetry (IMD, NASA, ISRO, GSI, NHAI, CWC), runs a hydrological lag-time runoff model, and routes affected residents along flood-safe high-ground walking paths via Google Maps.

---

## Key Capabilities & Data Ingest

1. **Live 1-Minute IMD Portal Telemetry**:
   - Ingests real-time district and station precipitation data directly from the official **India Meteorological Department (IMD) Rainfall Information Portal** (`mausam.imd.gov.in`).
   - Computes actual rainfall, normal baseline, and percentage departures every 60 seconds.

2. **Government IoT Integration**:
   - **Automatic Weather Stations (AWS) & Automatic Rain Gauges (ARGs)**: Panchayat-level temperature, humidity, pressure, wind velocity, and rainfall intensity.
   - **NHAI Road Weather Information Systems (RWIS)**: Real-time road friction index ($\mu$), water film depth, and debris blockages along mountain highways (e.g. NH-58, NH-34).
   - **High Wind Speed Recorders (HWSR)** & Port boundary-layer tracking.

3. **Satellite Soil Moisture (NASA SMAP / ISRO MOSDAC)**:
   - Tracks surface and root-zone soil saturation percentages to identify when runoff absorption capacity is exhausted.

4. **Slope Stability & Landslide Inventory (GSI DEM)**:
   - Analyzes Digital Elevation Model slope angles ($>30^\circ$) and calculates the geotechnical Factor of Safety ($F_s$).

5. **Actionable Evacuation Lead-Time & Safe Navigation**:
   - Real-time time-to-peak runoff calculator estimating minutes until maximum flood crest.
   - One-tap direct walking navigation via **Google Maps** to certified high-ground NDRF relief shelters.

6. **Novel Resilience Triggers**:
   - **Shake-to-SOS**: Shake detection for emergency dispatch when touchscreens are wet or cold.
   - **Take & Report**: Citizen crowdsourced field observations (water depth, road washouts) to calibrate the AI model.
   - **Acoustic Rescue Siren / Whistle**: Emits a 3.5 kHz audio pulse pattern for search dogs and NDRF search parties.
   - **Dual-Channel Dispatch**: Transmits high-accuracy GPS coordinates via API when online, with automatic native SMS fallback to **Emergency 112**.

---

## Technical Stack

- **Framework**: React Native 0.74.1 with TypeScript
- **Design System**: Light Theme Slate/Oceanic Cerulean high-contrast tokens
- **Local Storage**: `react-native-sqlite-storage` (relational database for offline alerts, settings, users) & `@react-native-async-storage/async-storage`
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Geolocation & Network**: `@react-native-community/geolocation`, `@react-native-community/netinfo`
