jest.mock('react-native-sqlite-storage', () => ({
  __esModule: true,
  default: { enablePromise: jest.fn() },
}));

import { useAuthStore } from '../useAuthStore';
import { cwcRiverService } from '../../services/telemetry/cwcRiverService';
import { evacuationService } from '../../services/evacuation/evacuationService';

describe('production safety boundaries', () => {
  it('does not fabricate an official CWC river-gauge reading when no feed is configured', () => {
    expect(cwcRiverService.fetchRiverHydrology(30.4, 79.3, 50)).toBeNull();
  });

  it('returns actual mapped OpenStreetMap places as unverified, not as certified shelters', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [{
          type: 'node',
          id: 42,
          lat: 13.0827,
          lon: 80.2707,
          tags: { name: 'Community Hall', emergency: 'assembly_point', capacity: '120' },
        }],
      }),
    } as Response);

    try {
      const places = await evacuationService.fetchNearbyShelters(13.0827, 80.2707);
      expect(places).toHaveLength(1);
      expect(places[0].name).toBe('Community Hall');
      expect(places[0].source).toBe('OpenStreetMap');
      expect(places[0].isAuthorityVerified).toBe(false);
      expect(places[0].distanceKm).toBe(0);
      expect(places[0].capacity).toBe(120);
    } finally {
      fetchMock.mockRestore();
    }
  });
});

describe('authentication providers without configured verification', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('does not authenticate a supplied Google email without OAuth', async () => {
    const success = await useAuthStore.getState().loginWithGoogle('citizen@example.com', 'Citizen');

    expect(success).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().error).toMatch(/Google sign-in is not configured/i);
  });

  it('does not accept an arbitrary OTP as phone verification', async () => {
    const success = await useAuthStore.getState().loginWithPhoneOtp('9876543210', '123456');

    expect(success).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().error).toMatch(/Phone verification is not configured/i);
  });

  it('does not grant responder access from unverified station details', async () => {
    const success = await useAuthStore.getState().loginWithStationId('NDRF-01', 'anything');

    expect(success).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().error).toMatch(/Responder verification is not configured/i);
  });
});
