import { TelemetrySnapshot } from '../../state/useRiskStore';

const BASE_URL = 'https://api.weatherguard.app/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) {
      return { status: res.status, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { status: res.status, data };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      status: 0,
      error: err.name === 'AbortError' ? 'Request timed out' : 'Network unreachable',
    };
  }
}

export const apiClient = {
  getRiskData: (zoneId: string) =>
    request<TelemetrySnapshot>(`/risk/current?zone_id=${encodeURIComponent(zoneId)}`),

  dispatchSos: (payload: { userId: string; latitude: number; longitude: number; method: 'app' | 'sms' }) =>
    request<{ eventId: string; status: string }>('/sos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};