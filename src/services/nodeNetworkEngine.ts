 
import * as turf from "@turf/turf";

export type NodeNetworkConnection = {
  fromNodeId: string;
  toNodeId: string;
  strength: number;
  relationType: "same_zone" | "nearby" | "same_category" | "route_relation" | "qualitative_relation" | "feedback_relation";
};

export function buildNodeNetworkCollection(
  nodes: any[],
  selectedNodeId?: string | null,
  activeRoutes?: any[],
  localFeedback?: any[]
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  if (!nodes || nodes.length === 0) {
    return { type: "FeatureCollection", features: [] };
  }

  // To avoid visual spaghetti and all nodes connected at once,
  // we primarily connect nodes that share strong relationships,
  // and if selectedNodeId is provided, we show its connections.
  for (let i = 0; i < nodes.length; i++) {
    const n1 = nodes[i];
    if (!n1.geometry || n1.geometry.type !== "Point") continue;

    // Limit connections to selected node or general high-strength ones to avoid spaghetti
    const isN1Selected = selectedNodeId && String(n1.properties?.id || n1.properties?.nodo_id) === String(selectedNodeId);

    for (let j = i + 1; j < nodes.length; j++) {
      const n2 = nodes[j];
      if (!n2.geometry || n2.geometry.type !== "Point") continue;

      const isN2Selected = selectedNodeId && String(n2.properties?.id || n2.properties?.nodo_id) === String(selectedNodeId);

      // If a node is selected, show its connections. Otherwise, only show strong connections
      if (selectedNodeId && !isN1Selected && !isN2Selected) {
        continue;
      }

      const p1 = turf.point(n1.geometry.coordinates);
      const p2 = turf.point(n2.geometry.coordinates);
      const dist = turf.distance(p1, p2, { units: "meters" });

      const zone1 = n1.properties?.zoneName || n1.properties?.zona || n1.properties?.zona_base || "";
      const zone2 = n2.properties?.zoneName || n2.properties?.zona || n2.properties?.zona_base || "";
      const cat1 = n1.properties?.category || n1.properties?.categoria || "";
      const cat2 = n2.properties?.category || n2.properties?.categoria || "";

      let shouldConnect = false;
      let strength = 0;
      let relationType: NodeNetworkConnection["relationType"] = "nearby";

      // Connect if same zone & distance under 200 meters
      if (zone1 && zone1 === zone2 && dist < 200) {
        shouldConnect = true;
        relationType = "same_zone";
        strength = Math.max(0.2, 1 - dist / 200);
      }
      // Connect if same category & distance under 200 meters
      else if (cat1 && cat1 === cat2 && dist < 200) {
        shouldConnect = true;
        relationType = "same_category";
        strength = Math.max(0.3, 1 - dist / 200);
      }
      // Connect if distance is very short (under 100 meters)
      else if (dist < 100) {
        shouldConnect = true;
        relationType = "nearby";
        strength = 1 - dist / 100;
      }

      // Check if related to route
      const name1 = (n1.properties?.displayName || n1.properties?.nombre || "").toLowerCase();
      const name2 = (n2.properties?.displayName || n2.properties?.nombre || "").toLowerCase();
      if (activeRoutes) {
        for (const r of activeRoutes) {
          const routeName = (r.properties?.nombre || "").toLowerCase();
          if (routeName.includes(name1) && routeName.includes(name2)) {
            shouldConnect = true;
            relationType = "route_relation";
            strength = Math.min(1.0, (strength || 0) + 0.4);
          }
        }
      }

      // Check relation to local feedback
      if (localFeedback) {
        const feedbackMatch = localFeedback.some(
          fb => fb.zoneName === zone1 && (fb.text.toLowerCase().includes(name1) || fb.text.toLowerCase().includes(name2))
        );
        if (feedbackMatch) {
          shouldConnect = true;
          relationType = "feedback_relation";
          strength = Math.min(1.0, (strength || 0) + 0.3);
        }
      }

      if (shouldConnect) {
        // Build soft arc coordinates by calculating midpoint and adding offset
        const mid = turf.midpoint(p1, p2);
        const bearing = turf.bearing(p1, p2);
        const perpendicularBearing = bearing + 90;
        
        // Offset proportional to distance
        const offsetDist = (dist / 1000) * 0.15; // in kilometers
        const arcCenter = turf.destination(mid, offsetDist, perpendicularBearing, { units: "kilometers" });

        // Build a 3-point LineString representing a soft arc
        const coordinates = [
          p1.geometry.coordinates,
          arcCenter.geometry.coordinates,
          p2.geometry.coordinates,
        ];

        features.push({
          type: "Feature",
          properties: {
            id: `edge_${n1.properties?.id || n1.properties?.nodo_id}_${n2.properties?.id || n2.properties?.nodo_id}`,
            fromNode: n1.properties?.displayName || n1.properties?.nombre,
            toNode: n2.properties?.displayName || n2.properties?.nombre,
            strength,
            relationType,
            distancia_m: Math.round(dist),
            opacity: strength, // opacity by strength
            color: relationType === "route_relation" ? "#F43F9D" : (relationType === "same_zone" ? "#D6A83A" : "#35D07F")
          },
          geometry: {
            type: "LineString",
            coordinates,
          },
        });
      }
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
}
