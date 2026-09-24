import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export interface HeatPoint {
  lat: number;
  lng: number;
  /** 0.0–1.0 weight; typically derived from ticket priority. */
  weight?: number;
}

export interface HeatmapLayerProps {
  points: HeatPoint[];
  /** Heat radius in pixels at the lowest zoom level. */
  radius?: number;
  /** 0.0–1.0 blur factor. */
  blur?: number;
  /** 0.0–1.0 maximum point intensity. */
  max?: number;
  /** Gradient stops as { 0.0: '#rrggbb', 0.5: '#rrggbb', 1: '#rrggbb' }. */
  gradient?: Record<number, string>;
  /** Hide the layer (e.g. while loading). */
  visible?: boolean;
}

/**
 * Thin react-leaflet wrapper around L.heatLayer. Re-renders the layer
 * when its inputs change; cleans up on unmount.
 *
 * Plugin attaches `L.heatLayer` as a side-effect import above; we do
 * NOT touch the leaflet.heat file directly.
 */
// ponytail: re-creates the layer when points/radius/blur/max/gradient change
// rather than mutating in place — leaflet.heat does not expose a typed
// setter for the gradient, so a full redraw is the smallest correct path.
export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  points,
  radius = 25,
  blur = 15,
  max = 1.0,
  gradient = { 0.2: '#1d4ed8', 0.4: '#22c55e', 0.7: '#facc15', 1.0: '#ef4444' },
  visible = true,
}) => {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!visible || points.length === 0) return;

    const tuples: [number, number, number][] = points.map(p => [p.lat, p.lng, p.weight ?? 0.5]);
    const layer = L.heatLayer(tuples, {
      radius,
      blur,
      max,
      gradient,
      maxZoom: 17,
    });
    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, points, radius, blur, max, visible]);

  return null;
};
