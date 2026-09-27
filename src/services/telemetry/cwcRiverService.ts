/**
 * CWC river gauge integration boundary.
 *
 * The public CWC website is not a documented, stable mobile API, and this app
 * currently has no authorized CWC feed or backend adapter configured. Do not
 * infer a river gauge level from rainfall or display fabricated station values
 * as official observations. Connect an approved feed here when credentials and
 * data-sharing approval are available.
 */

export interface CwcRiverTelemetry {
  agency: 'Central Water Commission (CWC)';
  riverBasin: string;
  riverName: string;
  gaugeStation: string;
  currentWaterLevelMeters: number;
  warningLevelMeters: number;
  dangerLevelMeters: number;
  highestFloodLevelMeters: number;
  trend: 'RISING_RAPIDLY' | 'RISING' | 'STEADY' | 'RECEDING';
  floodStatus: 'NORMAL' | 'ALERT' | 'DANGER' | 'EXTREME_FLOOD';
  dischargeCusecs: number;
  isAboveDanger: boolean;
  computedAt: string;
}

export const cwcRiverService = {
  /** Returns null until a verified, authorized CWC data source is configured. */
  fetchRiverHydrology: (
    _lat: number,
    _lng: number,
    _rainfallMm: number = 0
  ): CwcRiverTelemetry | null => null,
};
