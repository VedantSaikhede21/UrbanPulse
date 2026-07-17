import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { divIcon, LatLng } from 'leaflet';
import { Crosshair, Loader, MapPin } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocode, formatCoordinates } from '../../utils/location';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
}

const CUSTOM_MARKER = divIcon({
  className: 'custom-map-marker',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#C6F135;border:2px solid #161616;border-radius:50%;box-shadow:0 0 12px rgba(198,241,53,0.4);transform:translate(-50%,-100%);cursor:grab;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0d0d0d" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const DEFAULT_CENTER: [number, number] = [19.076, 72.8777];
const DEFAULT_ZOOM = 12;

function ClickHandler({ onMapClick }: { onMapClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      if (lat !== DEFAULT_CENTER[0] || lng !== DEFAULT_CENTER[1]) {
        map.setView([lat, lng], Math.max(map.getZoom(), 15));
      }
      return;
    }
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 1 });
  }, [lat, lng, map]);

  return null;
}

export const MapPicker: React.FC<MapPickerProps> = ({ value, onChange }) => {
  const { latitude: gpsLat, longitude: gpsLng, loading: gpsLoading, error: gpsError, requestLocation } = useGeolocation();
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  const lat = value?.latitude ?? DEFAULT_CENTER[0];
  const lng = value?.longitude ?? DEFAULT_CENTER[1];

  const resolveAddressAsync = useCallback(async (newLat: number, newLng: number) => {
    setResolvingAddress(true);
    const address = await reverseGeocode(newLat, newLng);
    setResolvingAddress(false);
    if (address) {
      onChange({ latitude: newLat, longitude: newLng, address });
    }
  }, [onChange]);

  const debouncedResolveAddress = useCallback((newLat: number, newLng: number) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      resolveAddressAsync(newLat, newLng);
    }, 500);
  }, [resolveAddressAsync]);

  const handleLocationUpdate = useCallback((newLat: number, newLng: number) => {
    onChange({ latitude: newLat, longitude: newLng });
    debouncedResolveAddress(newLat, newLng);
  }, [onChange, debouncedResolveAddress]);

  const handleMapClick = useCallback((latlng: LatLng) => {
    handleLocationUpdate(latlng.lat, latlng.lng);
  }, [handleLocationUpdate]);

  const handleGpsClick = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (gpsLat !== null && gpsLng !== null) {
      handleLocationUpdate(gpsLat, gpsLng);
    }
  }, [gpsLat, gpsLng, handleLocationUpdate]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="h-64 sm:h-80 rounded overflow-hidden border border-panel-border relative">
        <MapContainer
          center={[lat, lng]}
          zoom={DEFAULT_ZOOM}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ClickHandler onMapClick={handleMapClick} />
          <FlyToLocation lat={lat} lng={lng} />
          {value && (
            <Marker
              position={[lat, lng]}
              icon={CUSTOM_MARKER}
              draggable
              eventHandlers={{
                dragend(e) {
                  const pos = e.target.getLatLng();
                  handleLocationUpdate(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>

        <button
          type="button"
          onClick={handleGpsClick}
          disabled={gpsLoading}
          className="absolute top-3 right-3 z-[1000] bg-panel-card border border-panel-border hover:border-brand-lime/30 text-gray-300 hover:text-brand-lime rounded p-2 transition-colors disabled:opacity-50"
          title="Use current location"
        >
          {gpsLoading ? <Loader className="animate-spin" size={16} /> : <Crosshair size={16} />}
        </button>
      </div>

      <div className="flex items-start gap-2 text-xs font-mono text-gray-400">
        <MapPin size={14} className="mt-0.5 shrink-0 text-brand-lime" />
        <div className="space-y-0.5 min-w-0">
          {value ? (
            <>
              <p className="text-foreground truncate">
                {resolvingAddress ? 'Resolving address...' : (value.address || formatCoordinates(lat, lng))}
              </p>
              <p className="text-[10px]">{formatCoordinates(lat, lng)}</p>
            </>
          ) : (
            <p>Click the map or use GPS to select a location</p>
          )}
          {gpsError && <p className="text-status-escalated text-[10px]">{gpsError}</p>}
        </div>
      </div>
    </div>
  );
};
