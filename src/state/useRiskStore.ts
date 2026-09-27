import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { multiSourceService, IntegratedDisasterSnapshot } from '../services/telemetry/multiSourceService';
import { deviceLocationService, DeviceLocation, LiveWeatherData } from '../services/location/DeviceLocationService';
import { databaseService } from '../services/database/DatabaseService';
import { useAlertStore } from './useAlertStore';
import { VillageWardItem } from '../components/VillageWardPickerModal';
import { classifyWeatherSeverity, shouldPersistWeatherAlert, WeatherSeverity } from '../services/telemetry/weatherAlertPolicy';

export type SeverityBand = WeatherSeverity;

export interface FactorTelemetry {
  name: string;
  value: number;
  unit: string;
  severity: SeverityBand;
  sourceBadge: string;
}

export interface TelemetrySnapshot {
  zoneId: string;
  compositeScore: number;
  severityLabel: SeverityBand;
  factors: FactorTelemetry[];
  explanation: string[];
  computedAt: string;
}

interface RiskStoreState {
  currentRisk: TelemetrySnapshot;
  multiSource: IntegratedDisasterSnapshot;
  userLocation: DeviceLocation | null;
  liveWeather: LiveWeatherData | null;
  isLiveGpsMode: boolean;
  activeDistrict: string;
  activeState: string;
  activeVillageWard: string | null;
  activePanchayat: string | null;
  isLoading: boolean;
  isConnected: boolean;
  lastSyncedAt: string;
  pollingTimerId: any | null;
  isAutoSimulating: boolean;
  secondsUntilNextSync: number;

  setConnected: (status: boolean) => void;
  setLiveGpsMode: (enabled: boolean) => void;
  setActiveLocation: (state: string, district: string) => void;
  setManualLocation: (lat: number, lng: number, cityName: string, stateName: string, isApproximate?: boolean) => Promise<void>;
  setVillageWard: (item: VillageWardItem) => Promise<void>;
  fetchRealLocationAndWeather: (forceRefresh?: boolean) => Promise<void>;
  fetchRiskData: (zoneId?: string) => Promise<void>;
  startLive1MinPolling: () => void;
  startLive30sPolling: () => void;
  stopPolling: () => void;
  toggleAutoSimulation: () => Promise<void>;
}

const CACHE_KEY = '@oramet_risk_snapshot';

export const useRiskStore = create<RiskStoreState>((set, get) => {
  const initialSnapshot = multiSourceService.getIntegratedSnapshot();

  const defaultTelemetry: TelemetrySnapshot = {
    zoneId: 'zone_live_device_gps',
    compositeScore: 0,
    severityLabel: 'UNKNOWN',
    factors: [],
    explanation: [
      'Waiting for device location and a live weather response.',
      'No risk assessment is available yet. Check official local alerts.',
    ],
    computedAt: new Date().toISOString(),
  };

  return {
    currentRisk: defaultTelemetry,
    multiSource: initialSnapshot,
    userLocation: null,
    liveWeather: null,
    isLiveGpsMode: true,
    activeDistrict: 'Locating GPS...',
    activeState: 'India',
    activeVillageWard: null,
    activePanchayat: null,
    isLoading: false,
    isConnected: false,
    lastSyncedAt: new Date().toLocaleTimeString('en-IN', { hour12: false }),
    pollingTimerId: null,
    isAutoSimulating: false,
    secondsUntilNextSync: 30,

    setConnected: (status) => set({ isConnected: status }),

    setLiveGpsMode: (enabled) => {
      set({ isLiveGpsMode: enabled, activeVillageWard: null, activePanchayat: null });
      if (enabled) {
        get().fetchRealLocationAndWeather(true);
      } else {
        // Switch to Chamoli Simulation mode
        set({ activeState: 'Uttarakhand', activeDistrict: 'CHAMOLI' });
        get().fetchRiskData();
      }
    },

    setActiveLocation: (state, district) => {
      set({ activeState: state, activeDistrict: district, isLiveGpsMode: false, activeVillageWard: null, activePanchayat: null });
      get().fetchRiskData();
    },

    setVillageWard: async (item: VillageWardItem) => {
      set({
        isLoading: true,
        isLiveGpsMode: false,
        activeDistrict: item.district,
        activeState: item.state,
        activeVillageWard: item.villageOrWard,
        activePanchayat: item.panchayatOrTown,
      });
      await get().setManualLocation(item.lat, item.lng, item.district, item.state);
      set({
        activeDistrict: item.district,
        activeState: item.state,
        activeVillageWard: item.villageOrWard,
        activePanchayat: item.panchayatOrTown,
      });
    },

    setManualLocation: async (lat: number, lng: number, cityName: string, stateName: string, isApproximate: boolean = true) => {
      set({ isLoading: true, isLiveGpsMode: false, activeVillageWard: null, activePanchayat: null });
      try {
        const weather = await deviceLocationService.fetchLiveWeather(lat, lng);
        const loc: DeviceLocation = {
          latitude: lat,
          longitude: lng,
          city: cityName,
          district: cityName,
          state: stateName,
          country: 'India',
          formattedAddress: `${cityName}, ${stateName}`,
          isLiveGps: false,
          isApproximate,
        };

        if (isApproximate) {
          set({
            userLocation: loc,
            liveWeather: weather,
            activeDistrict: cityName,
            activeState: stateName,
            currentRisk: {
              zoneId: `zone_${cityName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
              compositeScore: 0,
              severityLabel: 'UNKNOWN',
              factors: [],
              explanation: [
                `Selected area near ${cityName}, ${stateName}.`,
                weather.isLive
                  ? `Open-Meteo has an area-level weather estimate (${weather.weatherDescription}); it is not a precise local hazard assessment.`
                  : 'Live weather data is unavailable. No risk assessment has been made.',
                'Select precise device GPS for local context and check official authority advisories.',
              ],
              computedAt: new Date().toISOString(),
            },
            multiSource: get().multiSource,
            isLoading: false,
          });
          return;
        }

        const precip = weather.isLive ? weather.precipitationMm : 0;
        const severity = classifyWeatherSeverity(precip, weather.isLive);
        const score = severity === 'CRITICAL' ? 88
          : severity === 'HIGH' ? 68
          : severity === 'MODERATE' ? 38
          : severity === 'LOW' ? 15
          : 0;

        const manualTelemetry: TelemetrySnapshot = {
          zoneId: `zone_${cityName.toLowerCase().replace(/\s+/g, '_')}`,
          compositeScore: score,
          severityLabel: severity,
          factors: weather.isLive ? [
            {
              name: 'Current Precipitation',
              value: precip,
              unit: 'mm',
              severity,
              sourceBadge: 'Open-Meteo weather model',
            },
            {
              name: 'Relative Humidity',
              value: weather.humidity,
              unit: '%',
              severity: weather.humidity > 80 ? 'HIGH' : 'LOW',
              sourceBadge: 'Open-Meteo weather model',
            },
            {
              name: 'Wind Velocity',
              value: weather.windSpeedKmh,
              unit: 'km/h',
              severity: weather.windSpeedKmh > 40 ? 'HIGH' : 'LOW',
              sourceBadge: 'Open-Meteo weather model',
            },
            {
              name: 'Surface Pressure',
              value: weather.surfacePressureHpa,
              unit: 'hPa',
              severity: 'LOW',
              sourceBadge: 'Open-Meteo weather model',
            },
          ] : [],
          explanation: [
            `Selected location: ${cityName}, ${stateName} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E).`,
            weather.isLive
              ? `Open-Meteo reports ${weather.temperature}°C, ${weather.weatherDescription}, and ${precip} mm precipitation. This is weather data, not an official hazard warning.`
              : 'Live weather data is unavailable. No risk assessment has been made; check local authority advisories.',
            weather.isLive && severity !== 'LOW'
              ? `Precipitation crossed an app threshold (${severity}); this is not an official warning.`
              : '',
          ].filter(Boolean),
          computedAt: new Date().toISOString(),
        };

        const multi = get().multiSource;

        const nowTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
        set({
          userLocation: loc,
          liveWeather: weather,
          activeDistrict: cityName,
          activeState: stateName,
          currentRisk: manualTelemetry,
          multiSource: multi,
          lastSyncedAt: nowTime,
          isLoading: false,
        });

        const alertZone = `zone_${cityName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        if (shouldPersistWeatherAlert(alertZone, severity)) {
          try {
            await databaseService.addAlert({
              id: `weather_${alertZone}_${Date.now()}`,
              zone_id: alertZone,
              severity,
              title: `Weather advisory for ${cityName}`,
              description: `Open-Meteo reports ${precip} mm current precipitation and ${weather.weatherDescription}. This is not an official warning; check local authority advisories.`,
            });
            useAlertStore.getState().fetchAlerts();
          } catch {}
        }
      } catch {
        set({ isLoading: false });
      }
    },

    fetchRealLocationAndWeather: async (forceRefresh: boolean = false) => {
      set({ isLoading: true });
      try {
        const loc = await deviceLocationService.getActualLocation(forceRefresh);
        const weather = await deviceLocationService.fetchLiveWeather(loc.latitude, loc.longitude);

        if (loc.isApproximate) {
          set({
            userLocation: loc,
            liveWeather: weather,
            activeDistrict: loc.city,
            activeState: loc.state,
            currentRisk: {
              zoneId: 'zone_approximate_location',
              compositeScore: 0,
              severityLabel: 'UNKNOWN',
              factors: [],
              explanation: ['Location is approximate; it is not suitable for local risk scoring.', 'No official hazard feed is connected. Choose a precise location and check local authority advisories.'],
              computedAt: new Date().toISOString(),
            },
            isLoading: false,
          });
          return;
        }

        const precip = weather.isLive ? weather.precipitationMm : 0;
        const severity = classifyWeatherSeverity(precip, weather.isLive);
        const score = severity === 'CRITICAL' ? 88
          : severity === 'HIGH' ? 68
          : severity === 'MODERATE' ? 38
          : severity === 'LOW' ? 12
          : 0;

        const multi = get().multiSource;

        const realTelemetry: TelemetrySnapshot = {
          zoneId: `zone_live_${loc.city.toLowerCase().replace(/\s+/g, '_')}`,
          compositeScore: score,
          severityLabel: severity,
          factors: weather.isLive ? [
            {
              name: 'Current Precipitation',
              value: precip,
              unit: 'mm',
              severity,
              sourceBadge: 'Open-Meteo weather model',
            },
            {
              name: 'Relative Humidity',
              value: weather.humidity,
              unit: '%',
              severity: weather.humidity > 80 ? 'HIGH' : weather.humidity > 60 ? 'MODERATE' : 'LOW',
              sourceBadge: 'Open-Meteo weather model',
            },
            {
              name: 'Wind Velocity',
              value: weather.windSpeedKmh,
              unit: 'km/h',
              severity: weather.windSpeedKmh > 50 ? 'HIGH' : weather.windSpeedKmh > 30 ? 'MODERATE' : 'LOW',
              sourceBadge: 'Open-Meteo weather model',
            },
            {
              name: 'Surface Pressure',
              value: weather.surfacePressureHpa,
              unit: 'hPa',
              severity: weather.surfacePressureHpa < 1000 ? 'HIGH' : 'LOW',
              sourceBadge: 'Open-Meteo weather model',
            },
          ] : [],
          explanation: [
            `GPS location: ${loc.formattedAddress}.`,
            weather.isLive
              ? `Open-Meteo reports ${weather.temperature}°C, ${weather.weatherDescription}, and ${precip} mm precipitation. This is weather data, not an official hazard warning.`
              : 'Live weather data is unavailable. No risk assessment has been made; check local authority advisories.',
            weather.isLive && severity !== 'LOW'
              ? `Precipitation crossed an app threshold (${severity}); this is not an official warning.`
              : '',
          ].filter(Boolean),
          computedAt: new Date().toISOString(),
        };

        const nowTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
        set({
          userLocation: loc,
          liveWeather: weather,
          activeDistrict: loc.city,
          activeState: loc.state,
          currentRisk: realTelemetry,
          multiSource: multi,
          lastSyncedAt: nowTime,
          isLoading: false,
        });

        const alertZone = `zone_${loc.city.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        if (shouldPersistWeatherAlert(alertZone, severity)) {
          try {
            await databaseService.addAlert({
              id: `weather_${alertZone}_${Date.now()}`,
              zone_id: alertZone,
              severity,
              title: `Weather advisory for ${loc.city}`,
              description: `Open-Meteo reports ${precip} mm current precipitation and ${weather.weatherDescription}. This is not an official warning; check local authority advisories.`,
            });
            useAlertStore.getState().fetchAlerts();
          } catch {}
        }
      } catch {
        set({ isLoading: false });
      }
    },

    fetchRiskData: async (_zoneId?: string) => {
      const state = get();
      if (state.isLiveGpsMode) {
        await get().fetchRealLocationAndWeather();
        return;
      }

      const location = state.userLocation;
      if (!location || location.isApproximate) {
        set({
          isLoading: false,
          currentRisk: {
            zoneId: 'zone_unavailable',
            compositeScore: 0,
            severityLabel: 'UNKNOWN',
            factors: [],
            explanation: ['Choose a location or grant precise location access.', 'No weather observation or risk assessment is available.'],
            computedAt: new Date().toISOString(),
          },
        });
        return;
      }

      await get().setManualLocation(
        location.latitude,
        location.longitude,
        state.activeDistrict || location.city,
        state.activeState || location.state,
        location.isApproximate
      );
    },

    startLive1MinPolling: () => {
      get().startLive30sPolling();
    },

    startLive30sPolling: () => {
      get().fetchRiskData();
      const existing = get().pollingTimerId;
      if (existing) clearInterval(existing);

      set({ secondsUntilNextSync: 30 });

      const timer = setInterval(() => {
        const { secondsUntilNextSync, isAutoSimulating } = get();
        if (secondsUntilNextSync <= 1) {
          set({ secondsUntilNextSync: 30 });
          if (!isAutoSimulating) {
            get().fetchRiskData();
          }
        } else {
          set({ secondsUntilNextSync: secondsUntilNextSync - 1 });
        }
      }, 1000);

      set({ pollingTimerId: timer });
    },

    stopPolling: () => {
      const existing = get().pollingTimerId;
      if (existing) {
        clearInterval(existing);
        set({ pollingTimerId: null });
      }
    },

    toggleAutoSimulation: async () => {
      // Synthetic hazard simulation was removed from production risk flows.
      set({ isAutoSimulating: false });
    },
  };
});