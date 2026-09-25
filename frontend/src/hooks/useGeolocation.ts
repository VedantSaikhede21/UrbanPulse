import { useState, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setState({ latitude: null, longitude: null, loading: false, error: 'Location access needs HTTPS or localhost. Open the app on 127.0.0.1 and try again.' });
      return;
    }
    if (!navigator.geolocation) {
      setState({ latitude: null, longitude: null, loading: false, error: 'Geolocation is not supported by your browser' });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      position => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      error => {
        let message = 'Unable to retrieve location';
        if (error.code === error.PERMISSION_DENIED) message = 'Location permission denied. Click the map to place a marker.';
        else if (error.code === error.TIMEOUT) message = 'Location request timed out. Try again.';
        setState({ latitude: null, longitude: null, loading: false, error: message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { ...state, requestLocation };
}
