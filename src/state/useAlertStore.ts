import { create } from 'zustand';
import { databaseService } from '../services/database/DatabaseService';

export interface AlertItem {
  id: string;
  zone_id: string;
  severity: string;
  title: string;
  description: string;
  created_at: string;
  is_read: number;
}

interface AlertStoreState {
  alerts: AlertItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchAlerts: (zoneId?: string) => Promise<void>;
  markRead: (alertId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export const useAlertStore = create<AlertStoreState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,

  fetchAlerts: async (zoneId?: string) => {
    set({ isLoading: true });
    try {
      const alerts = await databaseService.getAlerts(zoneId);
      const unreadCount = await databaseService.getUnreadAlertCount();
      set({ alerts, unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (alertId: string) => {
    await databaseService.markAlertRead(alertId);
    const alerts = get().alerts.map((a) =>
      a.id === alertId ? { ...a, is_read: 1 } : a
    );
    const unreadCount = alerts.filter((a) => a.is_read === 0).length;
    set({ alerts, unreadCount });
  },

  refreshUnreadCount: async () => {
    const unreadCount = await databaseService.getUnreadAlertCount();
    set({ unreadCount });
  },
}));
