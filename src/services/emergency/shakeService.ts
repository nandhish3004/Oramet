import { Platform, Vibration } from 'react-native';

type ShakeListener = () => void;

/**
 * Manual emergency-prompt demo only. No accelerometer subscription or automatic
 * shake detection is installed in the native app.
 */
class ShakeService {
  private listeners: ShakeListener[] = [];

  public addListener(callback: ShakeListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  /** Called by the explicit dashboard test button; it does not send an SOS. */
  public triggerEmergencyShake(): void {
    try {
      if (Platform.OS === 'android') Vibration.vibrate([0, 180, 100, 180]);
      else Vibration.vibrate();
    } catch {
      // Haptics may not be available on the device.
    }
    this.listeners.forEach((listener) => listener());
  }
}

export const shakeService = new ShakeService();
