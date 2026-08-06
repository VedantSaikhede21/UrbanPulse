import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { AlertTriangle, Loader, MapPin } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { apiFetch } from '../../lib/api';

interface Ticket {
  id: string;
  category: string;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  description: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  reported: '#facc15',
  assigned: '#60a5fa',
  in_progress: '#fb923c',
  resolved: '#4ade80',
  verified: '#22c55e',
};

const STATUS_RADIUS: Record<string, number> = {
  reported: 10,
  assigned: 12,
  in_progress: 14,
  resolved: 8,
  verified: 6,
};

export const PublicMap: React.FC = () => {
  useDocumentTitle('Incident Map');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    apiFetch('/api/tickets')
      .then(async res => {
        if (!res.ok) throw new Error(`API error (${res.status})`);
        return res.json();
      })
      .then((data: Ticket[]) => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load incidents');
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const avgLat = tickets.length > 0
    ? tickets.reduce((s, t) => s + t.latitude, 0) / tickets.length
    : 12.97;
  const avgLng = tickets.length > 0
    ? tickets.reduce((s, t) => s + t.longitude, 0) / tickets.length
    : 77.59;

  const openCount = tickets.filter(t => !['resolved', 'verified'].includes(t.status)).length;

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div role="alert" className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load incident data</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5">{error}</p>
          <button type="button" aria-label="Retry loading incident data" onClick={loadData} className="px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">

      <div className="border-b border-panel-border pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Public Ward Health Map</h1>
        <p className="text-gray-500 text-xs mt-1">
          Geospatial view of all reported incidents across the municipality.
        </p>
      </div>

      {loading ? (
        <div role="status" className="flex items-center justify-center py-24">
          <Loader size={24} className="text-brand-lime animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-panel-card border border-panel-border rounded flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-full bg-gray-900/40 border border-gray-800/30 flex items-center justify-center mb-4">
            <MapPin size={24} className="text-gray-500" />
          </div>
          <h3 className="text-base font-semibold mb-1">No incidents reported</h3>
          <p className="text-sm text-gray-400 max-w-xs text-center">
            There are currently no incidents to display on the map.
          </p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="font-mono">{tickets.length} total incidents</span>
            <span className="font-mono text-yellow-400">{openCount} open</span>
            <span className="font-mono text-green-400">{tickets.length - openCount} resolved</span>
            <div className="flex items-center gap-3 ml-auto flex-wrap">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <span key={status} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {status.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Map */}
          <div role="region" aria-label="Incident map" className="h-[600px] w-full rounded-lg overflow-hidden border border-panel-border">
            <MapContainer
              center={[avgLat, avgLng]}
              zoom={13}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {tickets.map(t => (
                <CircleMarker
                  key={t.id}
                  center={[t.latitude, t.longitude]}
                  radius={STATUS_RADIUS[t.status] || 10}
                  pathOptions={{
                    color: STATUS_COLORS[t.status] || '#6b7280',
                    fillColor: STATUS_COLORS[t.status] || '#6b7280',
                    fillOpacity: 0.5,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold">{t.category}</p>
                      <p className="text-gray-500">{t.description?.slice(0, 100)}</p>
                      <p className="text-gray-400">
                        {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                      </p>
                      <p>
                        <span className="text-gray-400">Status: </span>
                        <span className={`font-mono font-bold ${
                          t.status === 'resolved' || t.status === 'verified' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">Severity: </span>
                        <span className="font-mono text-gray-300">{t.severity}</span>
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </>
      )}
    </div>
  );
};
