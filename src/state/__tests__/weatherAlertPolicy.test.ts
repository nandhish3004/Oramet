import { classifyWeatherSeverity, shouldPersistWeatherAlert } from '../../services/telemetry/weatherAlertPolicy';

describe('weather advisory policy', () => {
  it('does not score unavailable or malformed weather as low-risk', () => {
    expect(classifyWeatherSeverity(0, false)).toBe('UNKNOWN');
    expect(classifyWeatherSeverity(Number.NaN, true)).toBe('UNKNOWN');
  });

  it('uses the documented precipitation thresholds', () => {
    expect(classifyWeatherSeverity(4.9, true)).toBe('LOW');
    expect(classifyWeatherSeverity(5, true)).toBe('MODERATE');
    expect(classifyWeatherSeverity(24.9, true)).toBe('MODERATE');
    expect(classifyWeatherSeverity(25, true)).toBe('HIGH');
    expect(classifyWeatherSeverity(49.9, true)).toBe('HIGH');
    expect(classifyWeatherSeverity(50, true)).toBe('CRITICAL');
  });

  it('persists only moderate-or-higher alerts and applies a per-zone severity cooldown', () => {
    const zone = `weather-policy-test-${Date.now()}`;
    expect(shouldPersistWeatherAlert(zone, 'UNKNOWN')).toBe(false);
    expect(shouldPersistWeatherAlert(zone, 'LOW')).toBe(false);
    expect(shouldPersistWeatherAlert(zone, 'MODERATE')).toBe(true);
    expect(shouldPersistWeatherAlert(zone, 'MODERATE')).toBe(false);
    expect(shouldPersistWeatherAlert(zone, 'HIGH')).toBe(true);
  });
});
