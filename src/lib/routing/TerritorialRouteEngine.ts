export type RouteProfile =
  | "trayecto_menor_exposicion"
  | "trayecto_balanceado"
  | "trayecto_directo";

export interface RouteRequest {
  origin: [number, number];          // [lng, lat]
  destination: [number, number];
  profile: RouteProfile;
  avoidHighPriorityZones?: boolean;
}

export interface RouteResult {
  profile: RouteProfile;
  profileLabel: string;
  geometry: GeoJSON.LineString;
  distanceMeters: number;
  estimatedWalkMinutes: number;
  zonesTraversed: string[];
  nodesNearby: string[];
  exposureIndex: number;             // 0–100
  ethicalDisclaimer: string;
  warnings: string[];
  passesThroughBoyeros: boolean;
}

// Helper: Haversine distance in meters
function getDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const R = 6371e3; // Earth radius
  const φ1 = (p1[1] * Math.PI) / 180;
  const φ2 = (p2[1] * Math.PI) / 180;
  const Δφ = ((p2[1] - p1[1]) * Math.PI) / 180;
  const Δλ = ((p2[0] - p1[0]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Boyeros coordinates aprox
const BOYEROS_CENTER: [number, number] = [-98.8890, 19.4990];
const BOYEROS_RADIUS_METERS = 800; // if route passes within 800m of Boyeros center

export function calculateTerritorialRoute(request: RouteRequest): RouteResult {
  const { origin, destination, profile } = request;
  
  const distance = getDistanceMeters(origin, destination);
  
  // Interpolate a conceptual straight line with some points
  const pointsCount = Math.max(2, Math.floor(distance / 100));
  const coordinates: [number, number][] = [];
  
  let passesThroughBoyeros = false;

  for (let i = 0; i <= pointsCount; i++) {
    const fraction = i / pointsCount;
    const lng = origin[0] + (destination[0] - origin[0]) * fraction;
    const lat = origin[1] + (destination[1] - origin[1]) * fraction;
    coordinates.push([lng, lat]);
    
    // Check if it crosses boyeros
    if (!passesThroughBoyeros) {
      if (getDistanceMeters([lng, lat], BOYEROS_CENTER) < BOYEROS_RADIUS_METERS) {
        passesThroughBoyeros = true;
      }
    }
  }

  const geometry: GeoJSON.LineString = {
    type: "LineString",
    coordinates
  };

  // Walk speed aprox 1.4 m/s (84 m/min)
  let estimatedWalkMinutes = Math.ceil(distance / 84);

  let profileLabel = "";
  let exposureIndex = 50;
  const warnings: string[] = [];

  const ethicalDisclaimer = "Este trayecto es una orientación aproximada. No garantiza condiciones de ningún tipo.";

  if (profile === "trayecto_directo") {
    profileLabel = "Trayecto directo";
    exposureIndex = 80;
    warnings.push("Este trayecto no evalúa condiciones territoriales. Úsalo con criterio propio.");
  } else if (profile === "trayecto_balanceado") {
    profileLabel = "Trayecto equilibrado";
    exposureIndex = 40;
    // Balanced routes usually take slightly longer due to avoiding extreme priority zones
    estimatedWalkMinutes = Math.ceil(estimatedWalkMinutes * 1.1);
  } else if (profile === "trayecto_menor_exposicion") {
    profileLabel = "Trayecto de menor exposición";
    exposureIndex = 20;
    // Exposure minimizing routes usually deviate significantly
    estimatedWalkMinutes = Math.ceil(estimatedWalkMinutes * 1.25);
  }

  if (passesThroughBoyeros) {
    warnings.push("Este trayecto cruza zona de validación cualitativa (Boyeros).");
  }

  return {
    profile,
    profileLabel,
    geometry,
    distanceMeters: Math.round(distance),
    estimatedWalkMinutes,
    zonesTraversed: ["conceptual_zone_1", ...(passesThroughBoyeros ? ["boyeros"] : [])],
    nodesNearby: ["nodo_orientacion_a", "nodo_recurso_b"],
    exposureIndex,
    ethicalDisclaimer,
    warnings,
    passesThroughBoyeros
  };
}
