import { AppState, AppStateStatus, Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_ALERT_LOG_KEY = '@oramet_local_alert_log';

export interface BackgroundAlertLog {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

/**
 * Local prototype helper only. There is no Android notification channel, push
 * token, backend delivery service, or reliable background task configured.
 */
class EmergencyNotificationService {
  private currentAppState: AppStateStatus = AppState.currentState;
  private stateSubscription: { remove: () => void } | null = null;

  public initialize() {
    if (this.stateSubscription) return;
    this.stateSubscription = AppState.addEventListener('change', (state) => {
      this.currentAppState = state;
    });
  }

  /** Saves an in-app log entry and vibrates only while the app is foregrounded. */
  public async dispatchBackgroundAlert(
    title: string,
    body: string,
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE'
  ): Promise<void> {
    if (this.currentAppState === 'active') {
      try {
        if (Platform.OS === 'android') Vibration.vibrate([0, 250, 120, 250]);
        else Vibration.vibrate();
      } catch {
        // Haptics may be unavailable on a device or simulator.
      }
    }

    const alertItem: BackgroundAlertLog = {
      id: `local_${Date.now().toString(36)}`,
      title,
      body,
      timestamp: new Date().toISOString(),
      severity,
    };
    try {
      const raw = await AsyncStorage.getItem(LOCAL_ALERT_LOG_KEY);
      const existing: BackgroundAlertLog[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(LOCAL_ALERT_LOG_KEY, JSON.stringify([alertItem, ...existing].slice(0, 20)));
    } catch {
      // Local alert history is best-effort only.
    }
  }

  public async getRecentBackgroundAlerts(): Promise<BackgroundAlertLog[]> {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_ALERT_LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** Foreground haptics demo; it does not send a push notification. */
  public async triggerTestBackgroundAlert(): Promise<void> {
    await this.dispatchBackgroundAlert(
      'Test vibration',
      'Demo only. Vibration works while the app is open; background and push notifications are not configured.',
      'MODERATE'
    );
  }
}

export const emergencyNotificationService = new EmergencyNotificationService();
