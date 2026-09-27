/**
 * OraMet - Shake-to-Emergency Detection Service
 * Real-time accelerometer & agitation sensor for instant emergency SOS triggering.
 * Fully operable in zero-network, offline environments.
 */

import { Vibration, Platform } from 'react-native';
import { smsService } from '../sms/smsService';

type ShakeListener = () => void;

class ShakeService {
  private isListening = false;
  private listeners: ShakeListener[] = [];
  private lastX = 0;
  private lastY = 0;
  private lastZ = 0;
  private lastUpdate = 0;
  private shakeThreshold = 18; // Acceleration m/s^2 threshold
  private shakeCount = 0;
  private lastShakeTime = 0;
  private testAgitationTimer: any = null;

  constructor() {
    this.startListening();
  }

  public addListener(callback: ShakeListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Triggers the emergency SOS sequence:
   * 1. Vibrates device with high-frequency SOS tactile pattern (... --- ...)
   * 2. Fires all registered emergency listeners (navigates to SOS screen)
   */
  public triggerEmergencyShake(): void {
    try {
      // SOS vibration pattern in Morse code: 3 short, 3 long, 3 short
      Vibration.vibrate([0, 200, 100, 200, 100, 200, 300, 500, 100, 500, 100, 500, 300, 200, 100, 200, 100, 200]);
    } catch {
      // Fallback
    }

    this.listeners.forEach((callback) => {
      try {
        callback();
      } catch (e) {
        console.error('Error executing shake callback', e);
      }
    });
  }

  /**
   * Processes raw accelerometer readings
   */
  public processAcceleration(x: number, y: number, z: number): void {
    if (!this.isListening) return;

    const now = Date.now();
    if (now - this.lastUpdate > 100) {
      const diffTime = now - this.lastUpdate;
      this.lastUpdate = now;

      const speed = Math.abs(x + y + z - this.lastX - this.lastY - this.lastZ) / diffTime * 10000;

      if (speed > this.shakeThreshold) {
        if (now - this.lastShakeTime < 1500) {
          this.shakeCount += 1;
          if (this.shakeCount >= 2) {
            this.triggerEmergencyShake();
            this.shakeCount = 0;
          }
        } else {
          this.shakeCount = 1;
        }
        this.lastShakeTime = now;
      }

      this.lastX = x;
      this.lastY = y;
      this.lastZ = z;
    }
  }

  public startListening(): void {
    this.isListening = true;
  }

  public stopListening(): void {
    this.isListening = false;
  }

  public isEnabled(): boolean {
    return this.isListening;
  }
}

export const shakeService = new ShakeService();
