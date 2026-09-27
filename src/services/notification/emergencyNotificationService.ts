import { AppState, AppStateStatus, Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRiskStore } from '../../state/useRiskStore';
import { smsService } from '../sms/smsService';

const BACKGROUND_ALERTS_KEY = '@oramet_background_alerts_log';

export interface BackgroundAlertLog {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

class EmergencyNotificationService {
  private isMonitoring = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private currentAppState: AppStateStatus = AppState.currentState;
  private lastAlertTimestamp = 0;

  /**
   * Initializes background monitoring and app state change listeners
   */
  public initialize() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Listen to foreground/background transitions
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      this.currentAppState = nextAppState;
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        this.startBackgroundWatchdog();
      } else if (nextAppState === 'active') {
        // App returned to foreground
        this.checkPendingBackgroundAlerts();
      }
    });

    // Start background watchdog immediately
    this.startBackgroundWatchdog();
  }

  /**
   * Runs the background watchdog timer that inspects telemetry thresholds
   */
  private startBackgroundWatchdog() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    // Monitor every 15 seconds
    this.monitorInterval = setInterval(() => {
      this.evaluateBackgroundHazards();
    }, 15000);
  }

  /**
   * Evaluates telemetry feeds even when the user is not actively on the screen
   */
  public async evaluateBackgroundHazards() {
    const riskState = useRiskStore.getState();
    const currentRisk = riskState.currentRisk;
    const multiSource = riskState.multiSource;
    const liveWeather = riskState.liveWeather;
    const district = riskState.activeDistrict || 'Joshimath';

    const now = Date.now();
    // Throttle duplicate background notifications to at least 45 seconds apart
    if (now - this.lastAlertTimestamp < 45000) return;

    let shouldAlert = false;
    let title = '';
    let body = '';
    let severity: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';

    // 1. Critical River / Surge Threshold
    if (multiSource.cwcLive && multiSource.cwcLive.isAboveDanger) {
      shouldAlert = true;
      severity = 'CRITICAL';
      title = `URGENT FLASH FLOOD ALERT: ${district.toUpperCase()}`;
      body = `River gauge level (${multiSource.cwcLive.currentWaterLevelMeters}m) exceeded danger mark (${multiSource.cwcLive.dangerLevelMeters}m). Evacuate to high ground immediately!`;
    }
    // 2. Extreme Cloudburst Precipitation Rate
    else if (liveWeather && liveWeather.precipitationMm >= 35) {
      shouldAlert = true;
      severity = 'HIGH';
      title = `HEAVY RAIN CLOUDBURST WARNING: ${district}`;
      body = `Rainfall accumulation is ${liveWeather.precipitationMm} mm/hr. Debris flow watch in effect for mountain roads.`;
    }
    // 3. Slope Instability Factor
    else if (multiSource.slope && multiSource.slope.factorOfSafety < 1.5) {
      shouldAlert = true;
      severity = 'HIGH';
      title = `SLOPE INSTABILITY ADVISORY: ${district}`;
      body = `GSI Inclinometer safety factor dropped to ${multiSource.slope.factorOfSafety}. Avoid hillslope footpaths.`;
    }

    if (shouldAlert) {
      this.lastAlertTimestamp = now;
      await this.dispatchBackgroundAlert(title, body, severity);
    }
  }

  /**
   * Dispatches the alert to the device: haptic pulse, sound vibration, and offline queue
   */
  public async dispatchBackgroundAlert(
    title: string,
    body: string,
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE'
  ) {
    // 1. High-priority haptic pulse pattern (short-long-short-long)
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 600, 250, 600, 250, 1000]);
      } else {
        Vibration.vibrate();
      }
    } catch (e) {
      // Audio/vibration fallback
    }

    // 2. Store in local background alert log
    const alertItem: BackgroundAlertLog = {
      id: 'bg_' + Date.now().toString(36),
      title,
      body,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      severity,
    };

    try {
      const existing = await AsyncStorage.getItem(BACKGROUND_ALERTS_KEY);
      const list: BackgroundAlertLog[] = existing ? JSON.parse(existing) : [];
      list.unshift(alertItem);
      await AsyncStorage.setItem(BACKGROUND_ALERTS_KEY, JSON.stringify(list.slice(0, 20)));
    } catch {
      // Storage fallback
    }

    // 3. If CRITICAL, auto-queue offline emergency SMS for 112 / rescue dispatch
    if (severity === 'CRITICAL') {
      await smsService.queueOfflineSMS('112', `[CRITICAL FLASH FLOOD DISPATCH · OraMet]\n${title}\n${body}`);
    }
  }

  /**
   * Retrieves pending background notifications
   */
  public async getRecentBackgroundAlerts(): Promise<BackgroundAlertLog[]> {
    try {
      const data = await AsyncStorage.getItem(BACKGROUND_ALERTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Checks pending background alerts when user brings app back to foreground
   */
  private async checkPendingBackgroundAlerts() {
    const list = await this.getRecentBackgroundAlerts();
    if (list.length > 0) {
      const latest = list[0];
      // Alert already recorded
    }
  }

  /**
   * Manual trigger for testing background notifications
   */
  public async triggerTestBackgroundAlert() {
    await this.dispatchBackgroundAlert(
      'TEST: SATELLITE FLASH FLOOD WARNING',
      'This is a verified test of the OraMet background early warning system. Alerts will notify you even when the app is minimized.',
      'CRITICAL'
    );
  }
}

export const emergencyNotificationService = new EmergencyNotificationService();
