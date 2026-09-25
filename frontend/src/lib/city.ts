/**
 * Single source of truth for where UrbanPulse operates.
 *
 * Every map, geocoded query and default coordinate in the app reads from here.
 * Previously these were duplicated as hard-coded Bengaluru coordinates
 * (12.97, 77.59) in five different files while the product copy consistently
 * described the city as Navi Mumbai — so the map silently opened on the wrong
 * city and the "near me" queries returned nothing.
 */
export const CITY_NAME = 'Navi Mumbai';

/** Civic body referenced across public copy. */
export const CITY_AUTHORITY = 'Navi Mumbai Municipal Corporation';

/** City centre, used as the fallback map view and for radius queries. */
export const CITY_CENTER: { readonly lat: number; readonly lng: number } = {
  lat: 19.033,
  lng: 73.0298,
};

/** Radius (metres) used for "issues near here" queries. */
export const CITY_RADIUS_METERS = 25_000;

export const CITY_TICKETS_NEAR_URL =
  `/api/tickets/near?latitude=${CITY_CENTER.lat}&longitude=${CITY_CENTER.lng}&radius_meters=${CITY_RADIUS_METERS}`;

/** "Ward 12, Navi Mumbai" style label used in illustrative feeds. */
export const CITY_WARD_LABEL = `Ward 12, ${CITY_NAME}`;
