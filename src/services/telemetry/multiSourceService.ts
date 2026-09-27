/**
 * Data boundary for disaster-specific agency integrations.
 *
 * OraMet currently has no authorized IMD, CWC, GSI, NHAI, ISRO/MOSDAC, or WMO
 * observation feeds configured. This service intentionally returns unavailable
 * states instead of deriving official-looking readings from weather heuristics.
 */

export interface AwsArgTelemetry {
  stationId: string;
  panchayatWard: string;
  precipitationIntensityMmHr: number;
  humidityPercent: number;
  barometricPressureHpa: number;
  windSpeedKmh: number;
  windDirection: string;
  source: 'IMD-AWS-ARG' | 'MoES-IITM' | 'UNAVAILABLE';
}

export interface NhaiRwisTelemetry {
  highwayId: string;
  chainageKm: string;
  roadSurfaceCondition: 'UNKNOWN' | 'DRY' | 'WET' | 'WATERLOGGED' | 'MUDSLIDE_BLOCKED' | 'DEBRIS_FALL';
  surfaceFrictionIndex: number | null;
  waterFilmDepthMm: number | null;
  visibilityMeters: number | null;
  status: 'UNKNOWN' | 'CLEAR' | 'CAUTION' | 'IMPASSABLE';
}

export interface SoilMoistureTelemetry {
  satelliteSource: 'NASA SMAP / ISRO MOSDAC (Live Satellite)' | 'UNAVAILABLE';
  surfaceSaturationPercent: number | null;
  rootZoneMoistureIndex: number | null;
  volumetricMoisture: number | null;
  runoffAbsorptionCapacity: 'UNKNOWN' | 'ADEQUATE' | 'CRITICAL' | 'SATURATED_100%';
}

export interface SlopeStabilityTelemetry {
  agency: 'Geological Survey of India (GSI)' | 'UNAVAILABLE';
  demElevationMeters: number | null;
  demSlopeAngleDeg: number | null;
  factorOfSafety: number | null;
  landslideVulnerabilityBand: 'UNKNOWN' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  historicalSlideEventCount: number | null;
}

export interface EvacuationLeadTime {
  minutesRemaining: number | null;
  estimatedPeakTime: string | null;
  urgencyLevel: 'UNAVAILABLE' | 'SAFE' | 'MONITOR' | 'PREPARE_EVACUATION' | 'IMMEDIATE_EVACUATION';
  recommendedAction: string;
  safeShelterName: string | null;
  safeShelterDistanceKm: number | null;
  safeShelterCoords: { lat: number; lng: number } | null;
}

export interface IntegratedDisasterSnapshot {
  compositeHazardIndex: number | null;
  hazardCategory: 'UNKNOWN' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  awsArg: AwsArgTelemetry;
  rwis: NhaiRwisTelemetry;
  soil: SoilMoistureTelemetry;
  slope: SlopeStabilityTelemetry;
  leadTime: EvacuationLeadTime;
  isRealSatelliteData: boolean;
  authorityFeedsConnected: boolean;
  cwcLive?: { currentWaterLevelMeters: number; isAboveDanger: boolean };
  computedAt: string;
}

function unavailableSnapshot(): IntegratedDisasterSnapshot {
  return {
    compositeHazardIndex: null,
    hazardCategory: 'UNKNOWN',
    awsArg: {
      stationId: 'Not connected',
      panchayatWard: 'Not connected',
      precipitationIntensityMmHr: 0,
      humidityPercent: 0,
      barometricPressureHpa: 0,
      windSpeedKmh: 0,
      windDirection: 'Unavailable',
      source: 'UNAVAILABLE',
    },
    rwis: {
      highwayId: 'Not connected',
      chainageKm: 'Unavailable',
      roadSurfaceCondition: 'UNKNOWN',
      surfaceFrictionIndex: null,
      waterFilmDepthMm: null,
      visibilityMeters: null,
      status: 'UNKNOWN',
    },
    soil: {
      satelliteSource: 'UNAVAILABLE',
      surfaceSaturationPercent: null,
      rootZoneMoistureIndex: null,
      volumetricMoisture: null,
      runoffAbsorptionCapacity: 'UNKNOWN',
    },
    slope: {
      agency: 'UNAVAILABLE',
      demElevationMeters: null,
      demSlopeAngleDeg: null,
      factorOfSafety: null,
      landslideVulnerabilityBand: 'UNKNOWN',
      historicalSlideEventCount: null,
    },
    leadTime: {
      minutesRemaining: null,
      estimatedPeakTime: null,
      urgencyLevel: 'UNAVAILABLE',
      recommendedAction: 'No validated river-gauge and catchment forecast feed is connected.',
      safeShelterName: null,
      safeShelterDistanceKm: null,
      safeShelterCoords: null,
    },
    isRealSatelliteData: false,
    authorityFeedsConnected: false,
    computedAt: new Date().toISOString(),
  };
}

export const multiSourceService = {
  /** No official lead-time forecast is calculated without validated inputs. */
  computeEvacuationLeadTime: (): EvacuationLeadTime => unavailableSnapshot().leadTime,

  /** Returns an explicit unavailable state until approved agency adapters exist. */
  fetchLiveIntegratedSnapshot: async (
    _lat?: number,
    _lng?: number,
    _liveRainfallMm?: number,
    _wardName?: string,
    _cityName?: string,
    _stateName?: string
  ): Promise<IntegratedDisasterSnapshot> => unavailableSnapshot(),

  getIntegratedSnapshot: (): IntegratedDisasterSnapshot => unavailableSnapshot(),
};
