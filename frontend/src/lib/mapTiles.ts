const cartoApiKey = ((import.meta as any).env.VITE_CARTO_API_KEY as string | undefined)?.trim();

export const hasCartoBasemapKey = Boolean(cartoApiKey);

export const mapTileUrl = hasCartoBasemapKey
  ? `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${encodeURIComponent(cartoApiKey!)}`
  : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const mapTileAttribution = hasCartoBasemapKey
  ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions/">CARTO</a>'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const mapTileClassName = hasCartoBasemapKey ? '' : 'urbanpulse-osm-tiles';
