 
import * as turf from "@turf/turf";
import { Feature, LineString, Point, Polygon, MultiPolygon } from "geojson";

// Calculate zone centroid safely
export function getZoneCentroid(zoneFeature: any): [number, number] {
  try {
    if (!zoneFeature) return [-98.8816, 19.4950];
    const geom = zoneFeature.geometry;
    if (geom && (geom.type === "Polygon" || geom.type === "MultiPolygon")) {
      const center = turf.centroid(zoneFeature);
      return center.geometry.coordinates as [number, number];
    }
  } catch (err) {
    console.error("Error calculating centroid:", err);
  }
  return [-98.8816, 19.4950];
}

// Find nearest node feature in collection
export function getNearestNode(point: [number, number], nodes: any): Feature<Point> | null {
  try {
    if (!nodes || !nodes.features || nodes.features.length === 0) return null;
    const pt = turf.point(point);
    let nearest: any = null;
    let minDistance = Infinity;

    nodes.features.forEach((node: any) => {
      if (node.geometry && node.geometry.type === "Point") {
        const dist = turf.distance(pt, node);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = node;
        }
      }
    });

    return nearest;
  } catch (err) {
    console.error("Error finding nearest node:", err);
    return null;
  }
}

// Find nearest segment
export function getNearestMobilitySegment(point: [number, number], mobilityLines: any): Feature<LineString> | null {
  try {
    if (!mobilityLines || !mobilityLines.features || mobilityLines.features.length === 0) return null;
    const pt = turf.point(point);
    let nearest: any = null;
    let minDistance = Infinity;

    mobilityLines.features.forEach((line: any) => {
      if (line.geometry && line.geometry.type === "LineString") {
        const dist = turf.pointToLineDistance(pt, line);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = line;
        }
      }
    });

    return nearest;
  } catch (err) {
    console.error("Error finding nearest mobility segment:", err);
    return null;
  }
}

// Generate conceptual route feature linking start and end coordinates
export function createConceptualRoute(
  start: [number, number],
  end: [number, number],
  properties: any
): Feature<LineString> {
  const line = turf.lineString([start, end], {
    ...properties,
    tipo: properties.tipo || "ruta_interna_conceptual",
    precision: "conceptual",
    etica: "Ruta visual para lectura académica. No representa recomendación de traslado."
  });

  const distM = calculateDistanceMeters(line);
  line.properties!.distancia_m = Math.round(distM);
  line.properties!.tiempo_caminata_min = estimateWalkMinutes(distM);

  return line;
}

// Calculate distance in meters
export function calculateDistanceMeters(line: Feature<LineString>): number {
  try {
    const lengthKm = turf.length(line, { units: "kilometers" });
    return lengthKm * 1000;
  } catch (err) {
    return 0;
  }
}

// Estimate pedestrian minutes (assuming walking speed 80m/min)
export function estimateWalkMinutes(distanceMeters: number): number {
  return Math.max(1, Math.round(distanceMeters / 80));
}

// Interconnect nearest neighbors inside campus boundaries (restricted to max 250m distance)
export function createCampusNetworkRoutes(nodes: any, campusPolygon: any): any {
  const collection = {
    type: "FeatureCollection" as const,
    features: [] as any[]
  };

  try {
    if (!nodes || !nodes.features || !campusPolygon) return collection;

    // Filter nodes inside campus
    const campusPoly = turf.polygon(campusPolygon.geometry.coordinates);
    const insideNodes = nodes.features.filter((node: any) => {
      if (node.geometry && node.geometry.type === "Point") {
        return turf.booleanPointInPolygon(turf.point(node.geometry.coordinates), campusPoly);
      }
      return false;
    });

    let edgeCount = 0;
    for (let i = 0; i < insideNodes.length; i++) {
      for (let j = i + 1; j < insideNodes.length; j++) {
        if (edgeCount >= 80) break;

        const nodeA = insideNodes[i];
        const nodeB = insideNodes[j];
        const distKm = turf.distance(nodeA, nodeB);
        const distM = distKm * 1000;

        if (distM < 250) {
          const route = createConceptualRoute(
            nodeA.geometry.coordinates,
            nodeB.geometry.coordinates,
            {
              id: `campus_conn_${edgeCount}`,
              displayName: `Conector Interno ${edgeCount}`,
              categoria: "movilidad_campus",
              tipo: "ruta_interna_conceptual"
            }
          );
          collection.features.push(route);
          edgeCount++;
        }
      }
    }
  } catch (err) {
    console.error("Error creating campus network routes:", err);
  }

  return collection;
}

// Create route from clicked map vertices
export function createRouteFromUserVertices(vertices: [number, number][]): Feature<LineString> {
  const line = turf.lineString(vertices, {
    id: `user_drawn_${Date.now()}`,
    displayName: "Ruta Sugerida",
    categoria: "movilidad_sugerida",
    tipo: "ruta_interna_conceptual"
  });

  const distM = calculateDistanceMeters(line);
  line.properties!.distancia_m = Math.round(distM);
  line.properties!.tiempo_caminata_min = estimateWalkMinutes(distM);

  return line;
}
