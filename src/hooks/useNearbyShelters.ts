import { useEffect, useState } from 'react';
import { evacuationService, SafeShelter } from '../services/evacuation/evacuationService';

interface NearbySheltersState {
  shelters: SafeShelter[];
  isLoading: boolean;
  error: string | null;
}

export function useNearbyShelters(
  latitude: number | undefined,
  longitude: number | undefined,
  enabled: boolean
): NearbySheltersState {
  const [state, setState] = useState<NearbySheltersState>({
    shelters: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    if (!enabled || latitude === undefined || longitude === undefined) {
      setState({ shelters: [], isLoading: false, error: null });
      return () => { active = false; };
    }

    setState({ shelters: [], isLoading: true, error: null });
    evacuationService.fetchNearbyShelters(latitude, longitude)
      .then((shelters) => {
        if (active) setState({ shelters, isLoading: false, error: null });
      })
      .catch(() => {
        if (active) {
          setState({
            shelters: [],
            isLoading: false,
            error: 'Nearby OpenStreetMap places could not be loaded. Check connection or call 112 for emergency help.',
          });
        }
      });

    return () => { active = false; };
  }, [latitude, longitude, enabled]);

  return state;
}
