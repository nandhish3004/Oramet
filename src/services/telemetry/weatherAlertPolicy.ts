export type WeatherSeverity = 'UNKNOWN' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

const WEATHER_ALERT_COOLDOWN_MS = 30 * 60 * 1000;
const recentWeatherAlertAt = new Map<string, number>();

/** Heuristic bands apply only to a successfully parsed live weather response. */
export function classifyWeatherSeverity(precipitationMm: number, isLive: boolean): WeatherSeverity {
  if (!isLive || !Number.isFinite(precipitationMm)) return 'UNKNOWN';
  if (precipitationMm >= 50) return 'CRITICAL';
  if (precipitationMm >= 25) return 'HIGH';
  if (precipitationMm >= 5) return 'MODERATE';
  return 'LOW';
}

/**
 * Persist only a non-low weather advisory, at most once per location/severity
 * every 30 minutes. This is not an official warning and never sends SMS.
 */
export function shouldPersistWeatherAlert(zoneId: string, severity: WeatherSeverity): boolean {
  if (severity !== 'MODERATE' && severity !== 'HIGH' && severity !== 'CRITICAL') return false;
  const key = `${zoneId}:${severity}`;
  const now = Date.now();
  const lastRecordedAt = recentWeatherAlertAt.get(key) || 0;
  if (now - lastRecordedAt < WEATHER_ALERT_COOLDOWN_MS) return false;
  recentWeatherAlertAt.set(key, now);
  return true;
}
