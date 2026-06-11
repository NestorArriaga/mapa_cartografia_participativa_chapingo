import * as fs from "fs";
import * as path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const SANITIZED_DIR = path.join(PUBLIC_DIR, "data", "sanitized");
const OUTPUT_FILE = path.join(SANITIZED_DIR, "rutas_campus_y_trayectos.public.geojson");

// Haversine distance formula
function getDistanceMeters(c1: [number, number], c2: [number, number]): number {
  const R = 6371000;
  const dLat = ((c2[1] - c1[1]) * Math.PI) / 180;
  const dLon = ((c2[0] - c1[0]) * Math.PI) / 180;
  const lat1 = (c1[1] * Math.PI) / 180;
  const lat2 = (c2[1] * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildRoutes() {
  const features: any[] = [];

  // 1. Regional / Territorial Routes
  const pointsMap: { [key: string]: [number, number] } = {
    campus_entrada: [-98.88502922307092, 19.49086685557748],
    salitreria: [-98.89007677841175, 19.50021316314282],
    cooperativo: [-98.88366572279531, 19.487188729788194],
    issste_chapingo: [-98.89090894982984, 19.489977538580987],
    boyeros: [-98.9106280898513, 19.499055255232797],
    dicifo: [-98.89360038863026, 19.4932945048691],
  };

  const territorialRoutes = [
    { from: "campus_entrada", to: "salitreria", name: "Campus ↔ Salitrería", id: "route_campus_salitreria", type: "trayecto_regional" },
    { from: "campus_entrada", to: "cooperativo", name: "Campus ↔ Cooperativo/Cabañas", id: "route_campus_cooperativo", type: "trayecto_regional" },
    { from: "campus_entrada", to: "issste_chapingo", name: "Campus ↔ ISSSTE–Chapingo", id: "route_campus_issste", type: "trayecto_regional" },
    { from: "campus_entrada", to: "boyeros", name: "Campus ↔ Boyeros", id: "route_campus_boyeros", type: "trayecto_regional" },
    { from: "dicifo", to: "boyeros", name: "DICIFO ↔ Boyeros", id: "route_dicifo_boyeros", type: "corredor_cualitativo_validacion" },
  ];

  for (const r of territorialRoutes) {
    const c1 = pointsMap[r.from];
    const c2 = pointsMap[r.to];
    const dist = getDistanceMeters(c1, c2);
    const timeMin = Math.round(dist / 80);

    features.push({
      type: "Feature",
      properties: {
        id: r.id,
        nombre: r.name,
        tipo: r.type,
        precision: "conceptual",
        distancia_m: Math.round(dist),
        tiempo_caminata_min: timeMin,
        categoria: r.type === "corredor_cualitativo_validacion" ? "corredor_cualitativo" : "trayecto_regional",
        etica: r.type === "corredor_cualitativo_validacion" 
          ? "Corredor cualitativo de validación. No es ruta segura ni ruta exacta."
          : "Trayecto regional conceptual para lectura académica de movilidad peri-campus. No es ruta segura.",
      },
      geometry: {
        type: "LineString",
        coordinates: [c1, c2],
      },
    });
  }

  // 2. Proximity-based Internal Campus Routes
  const orientationFile = path.join(SANITIZED_DIR, "nodos_orientacion_base.public.geojson");
  const campusNodes: { name: string; coords: [number, number] }[] = [];

  if (fs.existsSync(orientationFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(orientationFile, "utf-8"));
      const list = data.features || [];
      for (const feat of list) {
        if (
          feat?.geometry?.type === "Point" &&
          Array.isArray(feat.geometry.coordinates) &&
          feat.properties?.en_campus === "si"
        ) {
          campusNodes.push({
            name: feat.properties?.nombre || "Nodo Campus",
            coords: feat.geometry.coordinates as [number, number],
          });
        }
      }
    } catch (err: any) {
      console.error(`Error reading orientation nodes:`, err.message);
    }
  }

  console.log(`Filtered ${campusNodes.length} campus-specific nodes.`);

  let campusRouteCount = 0;
  const maxEdges = 80;

  for (let i = 0; i < campusNodes.length; i++) {
    if (campusRouteCount >= maxEdges) break;
    const n1 = campusNodes[i];

    // Find distances to all other campus nodes
    const neighbors: { index: number; dist: number }[] = [];
    for (let j = 0; j < campusNodes.length; j++) {
      if (i === j) continue;
      const n2 = campusNodes[j];
      const dist = getDistanceMeters(n1.coords, n2.coords);
      // max edge distance 250 meters
      if (dist > 5 && dist <= 250) {
        neighbors.push({ index: j, dist });
      }
    }

    // Sort neighbors by distance
    neighbors.sort((a, b) => a.dist - b.dist);

    // Connect to 2 nearest neighbors
    const connectionsLimit = Math.min(2, neighbors.length);
    for (let k = 0; k < connectionsLimit; k++) {
      if (campusRouteCount >= maxEdges) break;
      const neighbor = neighbors[k];
      const n2 = campusNodes[neighbor.index];

      // To avoid duplicate bidirectional edges, we can enforce a naming key check
      const idKey = `campus_route_${Math.min(i, neighbor.index)}_${Math.max(i, neighbor.index)}`;
      
      // Let's check if we already added this route (using a simple check)
      const exists = features.some(f => f.properties.id === idKey);
      if (exists) continue;

      features.push({
        type: "Feature",
        properties: {
          id: idKey,
          nombre: `Ruta Campus: ${n1.name} ↔ ${n2.name}`,
          tipo: "ruta_interna_conceptual",
          precision: "conceptual",
          distancia_m: Math.round(neighbor.dist),
          tiempo_caminata_min: Math.round(neighbor.dist / 80),
          categoria: "movilidad_campus",
          etica: "Ruta visual para lectura académica. No representa ruta segura ni recomendación de traslado.",
        },
        geometry: {
          type: "LineString",
          coordinates: [n1.coords, n2.coords],
        },
      });
      campusRouteCount++;
    }
  }

  const featureCollection = {
    type: "FeatureCollection",
    features,
  };

  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(featureCollection, null, 2), "utf-8");
  console.log(`Generated ${features.length} routes in: ${OUTPUT_FILE}`);
}

buildRoutes();
