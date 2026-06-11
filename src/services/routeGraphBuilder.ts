 
import * as turf from "@turf/turf";

export type RouteGraphNode = {
  id: string;
  coords: [number, number];
  exposureScore: number;
  safetyScore: number;
};

export type RouteGraphEdge = {
  source: string;
  target: string;
  distance: number;
  weightDirect: number;
  weightBalanced: number;
  weightProtected: number;
};

export function buildRouteGraph(routesGeoJson: any) {
  // Simplified graph builder that takes the route lines, breaks them into segments and nodes
  const nodes: Record<string, RouteGraphNode> = {};
  const edges: RouteGraphEdge[] = [];

  if (!routesGeoJson || !routesGeoJson.features) return { nodes, edges };

  routesGeoJson.features.forEach((feature: any) => {
    if (feature.geometry.type === "LineString") {
      const coords = feature.geometry.coordinates;
      for (let i = 0; i < coords.length - 1; i++) {
        const p1 = coords[i];
        const p2 = coords[i + 1];
        
        const id1 = `${p1[0].toFixed(5)},${p1[1].toFixed(5)}`;
        const id2 = `${p2[0].toFixed(5)},${p2[1].toFixed(5)}`;

        if (!nodes[id1]) {
          nodes[id1] = { id: id1, coords: p1, exposureScore: Math.random(), safetyScore: Math.random() };
        }
        if (!nodes[id2]) {
          nodes[id2] = { id: id2, coords: p2, exposureScore: Math.random(), safetyScore: Math.random() };
        }

        const distance = turf.distance(turf.point(p1), turf.point(p2), { units: "meters" });
        
        edges.push({
          source: id1,
          target: id2,
          distance,
          weightDirect: distance,
          weightBalanced: distance * (1 + nodes[id1].exposureScore),
          weightProtected: distance * (1 + (nodes[id1].exposureScore * 2) - nodes[id1].safetyScore)
        });
      }
    }
  });

  return { nodes, edges };
}
