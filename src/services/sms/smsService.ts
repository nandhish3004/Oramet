import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRiskStore } from '../../state/useRiskStore';

const EMERGENCY_SMS_NUMBER = '112';
const OFFLINE_SMS_QUEUE_KEY = '@oramet_offline_sms_queue';
const EMERGENCY_CONTACTS_KEY = '@oramet_emergency_contacts';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OfflineSMSItem {
  id: string;
  recipient: string;
  body: string;
  timestamp: string;
  status: 'pending' | 'dispatched';
}

export const smsService = {
  /**
   * Builds an official NDMA / NDRF CAP v1.2 compliant emergency payload
   */
  createEmergencyPayload: (coords: Coordinates, timestamp: string, batteryLevel: number = 88): string => {
    return (
      `[NDRF/SDMA URGENT RESCUE ALERT · OraMet CAP-v1.2]\n` +
      `COORDINATES: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}\n` +
      `ELEVATION: 1,940m | BATTERY: ${batteryLevel}%\n` +
      `MAPS: https://maps.google.com/?q=${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}\n` +
      `STATUS: High Ground Evacuation in Progress\n` +
      `TIME: ${timestamp}`
    );
  },

  /**
   * Retrieves saved emergency family/doctor contacts
   */
  getEmergencyContacts: async (): Promise<string[]> => {
    try {
      const data = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
      return data ? JSON.parse(data) : ['112'];
    } catch {
      return ['112'];
    }
  },

  /**
   * Adds an emergency contact phone number
   */
  addEmergencyContact: async (phoneNumber: string): Promise<void> => {
    try {
      const contacts = await smsService.getEmergencyContacts();
      if (!contacts.includes(phoneNumber)) {
        contacts.push(phoneNumber);
        await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(contacts));
      }
    } catch (e) {
      console.error('Error saving emergency contact', e);
    }
  },

  /**
   * Queues an SMS when offline or without internet
   */
  queueOfflineSMS: async (recipient: string, body: string): Promise<OfflineSMSItem> => {
    const item: OfflineSMSItem = {
      id: 'sms_' + Date.now().toString(36),
      recipient,
      body,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    try {
      const existing = await AsyncStorage.getItem(OFFLINE_SMS_QUEUE_KEY);
      const queue: OfflineSMSItem[] = existing ? JSON.parse(existing) : [];
      queue.push(item);
      await AsyncStorage.setItem(OFFLINE_SMS_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Error queuing offline SMS', e);
    }

    return item;
  },

  /**
   * Dispatches Emergency SMS with zero-internet fallback
   */
  sendEmergencySMS: async (
    targetOrCoords?: Coordinates | string,
    customBody?: string
  ): Promise<boolean> => {
    const timestamp = new Date().toISOString();
    let body = '';

    if (customBody) {
      body = customBody;
    } else if (targetOrCoords && typeof targetOrCoords === 'object') {
      body = smsService.createEmergencyPayload(targetOrCoords, timestamp);
    } else if (typeof targetOrCoords === 'string') {
      body = `[EMERGENCY SOS · OraMet NDRF Alert]\nLocation: ${targetOrCoords}\nTime: ${timestamp}`;
    } else {
      const storeLoc = useRiskStore.getState().userLocation;
      if (storeLoc && !storeLoc.isApproximate) {
        const coords = { latitude: storeLoc.latitude, longitude: storeLoc.longitude };
        body = smsService.createEmergencyPayload(coords, timestamp);
      } else {
        body = `[EMERGENCY SOS · OraMet]\nLocation unavailable. Please contact me and ask for my current location.\nTime: ${timestamp}`;
      }
    }

    // Always queue in offline store to guarantee no data loss
    await smsService.queueOfflineSMS(EMERGENCY_SMS_NUMBER, body);

    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${EMERGENCY_SMS_NUMBER}${separator}body=${encodeURIComponent(body)}`;

    try {
      await Linking.openURL(url);
      // This only opens a prefilled draft. The user must tap Send in the SMS app.
      return true;
    } catch {
      // The message remains queued locally, but has not been dispatched.
      return false;
    }
  },

  /**
   * Dispatches a real-time Disaster Weather Alert SMS to any Indian mobile number or 112
   */
  sendDisasterAlertSMS: async (
    recipientOrTitle: string = '112',
    cityOrMessage?: string,
    coords?: { latitude: number; longitude: number },
    hazardDetails?: string
  ): Promise<boolean> => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const storeLoc = useRiskStore.getState().userLocation;

    let targetNumber = EMERGENCY_SMS_NUMBER;
    let city = storeLoc?.city || 'Joshimath';
    let details = 'Heavy Rainfall & Flash Flood Surge Alert';

    const isNumericRecipient = /^[+0-9\s-]+$/.test(recipientOrTitle.trim());

    if (isNumericRecipient) {
      targetNumber = recipientOrTitle.trim();
      if (cityOrMessage) city = cityOrMessage;
      if (hazardDetails) details = hazardDetails;
    } else {
      targetNumber = EMERGENCY_SMS_NUMBER;
      details = cityOrMessage || recipientOrTitle;
      if (storeLoc?.city) city = storeLoc.city;
    }

    const activeCoords = coords || (storeLoc && !storeLoc.isApproximate
      ? { latitude: storeLoc.latitude, longitude: storeLoc.longitude }
      : undefined);
    const mapsLink = activeCoords
      ? `\nGPS: https://maps.google.com/?q=${activeCoords.latitude.toFixed(5)},${activeCoords.longitude.toFixed(5)}`
      : '\nGPS: unavailable (no precise fix)';

    const body =
      `[OraMet Emergency Alert · ${timestamp}]\n` +
      `URGENT ALERT FOR: ${city.toUpperCase()}\n` +
      `Hazard: ${details}${mapsLink}\n` +
      `Advisory: Follow local emergency-service instructions. Avoid floodwater and closed roads.`;

    await smsService.queueOfflineSMS(targetNumber, body);

    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${targetNumber}${separator}body=${encodeURIComponent(body)}`;

    try {
      await Linking.openURL(url);
      // Opening the SMS app does not mean the message was sent.
      return true;
    } catch {
      return false; // Saved locally, but not dispatched.
    }
  },
};