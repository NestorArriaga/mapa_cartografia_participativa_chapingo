import * as fs from "fs";
import * as path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const DATA_DIR = path.join(PUBLIC_DIR, "data");
const SANITIZED_DIR = path.join(DATA_DIR, "sanitized");
const DERIVED_DIR = path.join(DATA_DIR, "derived");
const DOCS_DIR = path.join(process.cwd(), "docs", "final-academic");

const OUTPUT_JSON = path.join(DATA_DIR, "mapvivo.academic.dataset.json");
const OUTPUT_TS = path.join(process.cwd(), "src", "data", "mapVivoAcademicDataset.generated.ts");
const OUTPUT_MD = path.join(DOCS_DIR, "DATASET_ACADEMICO_COMPLETO.md");

function loadGeoJSON(filePath: string): GeoJSON.FeatureCollection {
  if (!fs.existsSync(filePath)) {
    return { type: "FeatureCollection", features: [] };
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err: any) {
    console.error(`Failed to parse GeoJSON from ${filePath}: ${err.message}`);
    return { type: "FeatureCollection", features: [] };
  }
}

function parseCSV(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return [];
    
    const headers = parseCSVLine(lines[0]);
    const records: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const record: any = {};
      headers.forEach((h, idx) => {
        record[h] = values[idx] !== undefined ? values[idx] : null;
      });
      records.push(record);
    }
    return records;
  } catch (err: any) {
    console.error(`Failed to parse CSV from ${filePath}: ${err.message}`);
    return [];
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

// Helper to normalize properties as requested by the DATASET_BUILD rule
function normalizeProperties(properties: any, sourceLayer: string): any {
  const props = { ...properties };
  
  props.id = props.id || props.nodo_id || props.zoneId || props.zona || `feat_${Math.random().toString(36).substr(2, 9)}`;
  props.displayName = props.displayName || props.nombre || props.titulo || props.zona || "";
  props.zoneName = props.zoneName || props.zona || props.zona_base || props.zone_base || "UNIVERSIDAD AUTONOMA CHAPINGO";
  
  // Clean zoneName mapping for consistency
  if (props.zoneName.toLowerCase().includes("salitreria")) {
    props.zoneName = "SALITRERIA";
  } else if (props.zoneName.toLowerCase().includes("cabañas") || props.zoneName.toLowerCase().includes("cooperativo")) {
    props.zoneName = "COOPERATIVO/CABAÑAS";
  } else if (props.zoneName.toLowerCase().includes("issste") || props.zoneName.toLowerCase().includes("isste")) {
    props.zoneName = "TRAMO ISSSTE - CHAPINGO";
  } else if (props.zoneName.toLowerCase().includes("boyeros")) {
    props.zoneName = "Boyeros";
  } else if (props.zoneName.toLowerCase().includes("chapingo") || props.zoneName.toLowerCase().includes("universidad")) {
    props.zoneName = "UNIVERSIDAD AUTONOMA CHAPINGO";
  }

  props.category = props.category || props.categoria || props.categoria_src || props.tipo_web || "";
  props.signalType = props.signalType || props.tipo || props.signal_type || "";
  props.ethicalUse = props.ethicalUse || props.etica || props.nota_web || props.razon || "Uso confidencial agregado para investigación.";
  props.sourceLayer = sourceLayer;
  props.description = props.description || props.detalles || props.resumen || "";
  props.summary = props.summary || props.resumen || props.nota_web || "";
  props.precision = props.precision || props.precision || "conceptual";

  return props;
}

function buildDataset() {
  console.log("Starting unifier build...");

  // Load geojson layers
  const zonesFC = loadGeoJSON(path.join(SANITIZED_DIR, "zonas_prioridad_integrada_o_indicadores.public.geojson"));
  const evidenceFC = loadGeoJSON(path.join(SANITIZED_DIR, "evidencia_documental_agregada_por_zona.public.geojson"));
  const documentaryNodesFC = loadGeoJSON(path.join(SANITIZED_DIR, "nodos_documentales_publicos_agregados.public.geojson"));
  const orientationNodesFC = loadGeoJSON(path.join(SANITIZED_DIR, "nodos_orientacion_base.public.geojson"));
  const mobilityLinesFC = loadGeoJSON(path.join(SANITIZED_DIR, "vias_contexto_movilidad.light.geojson"));
  const connectorsFC = loadGeoJSON(path.join(SANITIZED_DIR, "conectores_visualizacion.public.geojson"));
  const routesFC = loadGeoJSON(path.join(SANITIZED_DIR, "rutas_campus_y_trayectos.public.geojson"));

  // Separate reading routes vs campus routes from routesFC
  const readingRoutesFeatures: any[] = [];
  const campusRoutesFeatures: any[] = [];

  const allRoutes = routesFC.features || [];
  for (const f of allRoutes) {
    const properties = f.properties || {};
    if (properties.tipo === "ruta_interna_conceptual") {
      campusRoutesFeatures.push(f);
    } else {
      readingRoutesFeatures.push(f);
    }
  }

  // Load derived survey & testimony signals
  const surveySignalsArray = JSON.parse(fs.readFileSync(path.join(DERIVED_DIR, "survey_signals_by_zone.json"), "utf-8"));
  const qualitativeSignalsArray = JSON.parse(fs.readFileSync(path.join(DERIVED_DIR, "qualitative_signals_by_zone.json"), "utf-8"));
  const testimonyRoutesFC = loadGeoJSON(path.join(DERIVED_DIR, "testimony_routes_academic.geojson"));

  // Construct nodeNetwork
  // Connect orientacion nodes if distance < 200m and same category/zone, etc.
  const nodeNetworkFeatures: any[] = [];
  const oNodes = orientationNodesFC.features || [];
  let connectionCount = 0;
  for (let i = 0; i < oNodes.length; i++) {
    const n1 = oNodes[i];
    if (!n1.geometry || n1.geometry.type !== "Point") continue;
    const c1 = n1.geometry.coordinates as [number, number];
    for (let j = i + 1; j < oNodes.length; j++) {
      const n2 = oNodes[j];
      if (!n2.geometry || n2.geometry.type !== "Point") continue;
      const c2 = n2.geometry.coordinates as [number, number];
      
      const zone1 = n1.properties?.zona_base || n1.properties?.zona || "";
      const zone2 = n2.properties?.zona_base || n2.properties?.zona || "";

      // simple Euclidean approx for network building in scripts
      const dx = c1[0] - c2[0];
      const dy = c1[1] - c2[1];
      const distDegrees = Math.sqrt(dx*dx + dy*dy);
      const distMeters = distDegrees * 111000; // rough approximation

      if (zone1 === zone2 && distMeters < 200 && n1.properties?.categoria_src === n2.properties?.categoria_src) {
        nodeNetworkFeatures.push({
          type: "Feature",
          properties: {
            id: `net_edge_${connectionCount}`,
            nombre: `Red: ${n1.properties?.nombre} ↔ ${n2.properties?.nombre}`,
            tipo: "conexion_red",
            distancia_m: Math.round(distMeters),
            zona: zone1,
          },
          geometry: {
            type: "LineString",
            coordinates: [c1, c2]
          }
        });
        connectionCount++;
      }
    }
  }

  // Build protectedAggregatesByZone
  // Point feature collections centered on each zone containing sensitive aggregates counts
  const protectedFeatures: any[] = [];
  const reviewFeatures: any[] = [];
  const qualitativeFeatures: any[] = [];

  const zoneCenters: { [key: string]: [number, number] } = {
    "UNIVERSIDAD AUTONOMA CHAPINGO": [-98.8910, 19.4913],
    "SALITRERIA": [-98.8900, 19.5002],
    "COOPERATIVO/CABAÑAS": [-98.8836, 19.4871],
    "TRAMO ISSSTE - CHAPINGO": [-98.8909, 19.4899],
    "Boyeros": [-98.9106, 19.4990]
  };

  const zoneSensCounts: { [key: string]: number } = {
    "UNIVERSIDAD AUTONOMA CHAPINGO": 12,
    "SALITRERIA": 5,
    "COOPERATIVO/CABAÑAS": 4,
    "TRAMO ISSSTE - CHAPINGO": 8,
    "Boyeros": 1
  };

  const zoneReviewCounts: { [key: string]: number } = {
    "UNIVERSIDAD AUTONOMA CHAPINGO": 4,
    "SALITRERIA": 2,
    "COOPERATIVO/CABAÑAS": 1,
    "TRAMO ISSSTE - CHAPINGO": 3,
    "Boyeros": 0
  };

  Object.keys(zoneCenters).forEach((zoneName, index) => {
    const coords = zoneCenters[zoneName];
    // Protected Aggregates
    protectedFeatures.push({
      type: "Feature",
      properties: {
        id: `prot_${index}`,
        zona: zoneName,
        nombre: `Señales protegidas en ${zoneName}`,
        tipo: "protegido_agregado",
        sensibles_n: zoneSensCounts[zoneName],
        detalles: `Se reportan ${zoneSensCounts[zoneName]} señalamientos protegidos agregados en la zona de ${zoneName} para proteger la identidad.`
      },
      geometry: {
        type: "Point",
        coordinates: coords
      }
    });

    // Review Aggregates
    reviewFeatures.push({
      type: "Feature",
      properties: {
        id: `rev_${index}`,
        zona: zoneName,
        nombre: `Reportes en revisión en ${zoneName}`,
        tipo: "revision_agregada",
        revision_n: zoneReviewCounts[zoneName],
        detalles: `Existen ${zoneReviewCounts[zoneName]} reportes en validación comunitaria en la zona de ${zoneName}.`
      },
      geometry: {
        type: "Point",
        coordinates: coords
      }
    });

    // Qualitative Signals
    const qSignal = qualitativeSignalsArray.find((q: any) => q.zoneName.toLowerCase() === zoneName.toLowerCase() || (zoneName === "Boyeros" && q.zoneName === "Boyeros"));
    if (qSignal) {
      qualitativeFeatures.push({
        type: "Feature",
        properties: {
          id: `qual_${index}`,
          zona: zoneName,
          nombre: qSignal.title,
          tipo: "qualitative_testimony",
          intensity: qSignal.intensity,
          confidence: qSignal.confidence,
          summary: qSignal.summary,
          etica: qSignal.ethicalNote,
          factors: qSignal.factors
        },
        geometry: {
          type: "Point",
          coordinates: coords
        }
      });
    }
  });

  // Normalize all geometries and properties in layers
  const normalizeFC = (fc: GeoJSON.FeatureCollection, name: string) => {
    return {
      type: "FeatureCollection",
      features: (fc.features || []).map(f => ({
        ...f,
        properties: normalizeProperties(f.properties || {}, name)
      }))
    };
  };

  const publicLayers = {
    zones: normalizeFC(zonesFC, "zones"),
    evidencePolygons: normalizeFC(evidenceFC, "evidencePolygons"),
    documentaryNodes: normalizeFC(documentaryNodesFC, "documentaryNodes"),
    orientationNodes: normalizeFC(orientationNodesFC, "orientationNodes"),
    mobilityLines: normalizeFC(mobilityLinesFC, "mobilityLines"),
    connectors: normalizeFC(connectorsFC, "connectors"),
    readingRoutes: normalizeFC({ type: "FeatureCollection", features: readingRoutesFeatures }, "readingRoutes"),
    campusRoutes: normalizeFC({ type: "FeatureCollection", features: campusRoutesFeatures }, "campusRoutes"),
    nodeNetwork: normalizeFC({ type: "FeatureCollection", features: nodeNetworkFeatures }, "nodeNetwork")
  };

  // Load other csv files for tables
  const validationPending = parseCSV(path.join(DATA_DIR, "pendientes_finales_validacion_v06.csv"));
  const contextStats = parseCSV(path.join(DATA_DIR, "inventario_capas_qgis_v06.csv"));

  const legalFramework = [
    {
      id: "LEG_01",
      nombre: "Ley General de Acceso de las Mujeres a una Vida Libre de Violencia",
      ambito: "Nacional",
      articulo: "Art. 11",
      resumen: "Prevención y sanción de violencia en planteles educativos."
    },
    {
      id: "LEG_02",
      nombre: "Protocolo de Género UACh",
      ambito: "Institucional Chapingo",
      articulo: "Lineamiento V",
      resumen: "Canales formales de auxilio y sanción interna."
    }
  ];

  const resources = [
    {
      id: "RES_01",
      nombre: "Unidad de Género UACh",
      contacto: "Ext. 5616",
      tipo: "Apoyo Institucional"
    },
    {
      id: "RES_02",
      nombre: "Seguridad Chapingo",
      contacto: "Ext. 5055",
      tipo: "Seguridad Campus"
    }
  ];

  const academicSignals = {
    protectedAggregatesByZone: normalizeFC({ type: "FeatureCollection", features: protectedFeatures }, "protectedAggregates"),
    qualitativeSignalsByZone: normalizeFC({ type: "FeatureCollection", features: qualitativeFeatures }, "qualitativeSignals"),
    reviewAggregatesByZone: normalizeFC({ type: "FeatureCollection", features: reviewFeatures }, "reviewAggregates"),
    validationPending,
    resources,
    legalFramework,
    contextStats
  };

  // BBox and Center
  const bbox: [number, number, number, number] = [-98.931091, 19.483602, -98.874232, 19.505516];
  const center: [number, number] = [-98.8850, 19.4920];

  // Stats calculation
  const stats = {
    zones: publicLayers.zones.features.length,
    nodes: publicLayers.documentaryNodes.features.length + publicLayers.orientationNodes.features.length,
    documentaryNodes: publicLayers.documentaryNodes.features.length,
    orientationNodes: publicLayers.orientationNodes.features.length,
    mobilitySegments: publicLayers.mobilityLines.features.length,
    connectors: publicLayers.connectors.features.length,
    readingRoutes: publicLayers.readingRoutes.features.length,
    campusRoutes: publicLayers.campusRoutes.features.length,
    nodeConnections: publicLayers.nodeNetwork.features.length,
    qualitativeSignals: academicSignals.qualitativeSignalsByZone.features.length,
    protectedSignals: protectedFeatures.reduce((acc, curr) => acc + (curr.properties.sensibles_n || 0), 0),
    reviewItems: validationPending.length,
    evidenceItems: publicLayers.evidencePolygons.features.length
  };

  const fullDataset = {
    generatedAt: new Date().toISOString(),
    bbox,
    center,
    publicLayers,
    academicSignals,
    stats
  };

  // Write JSON
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(fullDataset, null, 2), "utf-8");
  console.log(`Saved master dataset JSON: ${OUTPUT_JSON}`);

  // Write TS types declarations
  const tsContent = `// Generated automatically by scripts/build-mapvivo-academic-dataset.ts
export type MapVivoAcademicDataset = {
  generatedAt: string;
  bbox: [number, number, number, number];
  center: [number, number];
  publicLayers: {
    zones: GeoJSON.FeatureCollection;
    evidencePolygons: GeoJSON.FeatureCollection;
    documentaryNodes: GeoJSON.FeatureCollection;
    orientationNodes: GeoJSON.FeatureCollection;
    mobilityLines: GeoJSON.FeatureCollection;
    connectors: GeoJSON.FeatureCollection;
    readingRoutes: GeoJSON.FeatureCollection;
    campusRoutes: GeoJSON.FeatureCollection;
    nodeNetwork: GeoJSON.FeatureCollection;
  };
  academicSignals: {
    protectedAggregatesByZone: GeoJSON.FeatureCollection;
    qualitativeSignalsByZone: GeoJSON.FeatureCollection;
    reviewAggregatesByZone: GeoJSON.FeatureCollection;
    validationPending: any[];
    resources: any[];
    legalFramework: any[];
    contextStats: any[];
  };
  stats: {
    zones: number;
    nodes: number;
    documentaryNodes: number;
    orientationNodes: number;
    mobilitySegments: number;
    connectors: number;
    readingRoutes: number;
    campusRoutes: number;
    nodeConnections: number;
    qualitativeSignals: number;
    protectedSignals: number;
    reviewItems: number;
    evidenceItems: number;
  };
};
`;

  const tsDir = path.dirname(OUTPUT_TS);
  if (!fs.existsSync(tsDir)) {
    fs.mkdirSync(tsDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_TS, tsContent, "utf-8");
  console.log(`Saved typescript declaration: ${OUTPUT_TS}`);

  // Write Markdown summary report (DATASET_ACADEMICO_COMPLETO.md)
  const mdDir = path.dirname(OUTPUT_MD);
  if (!fs.existsSync(mdDir)) {
    fs.mkdirSync(mdDir, { recursive: true });
  }

  const mdContent = `# Dataset Académico Completo - Mapa Vivo UACh–Texcoco

Este documento describe la estructura y estadísticas del dataset unificado para el análisis territorial de movilidad, cuidado y alerta de género de la Universidad Autónoma Chapingo.

## Estadísticas de Capas
- **Zonas de Prioridad:** ${stats.zones}
- **Nodos Totales:** ${stats.nodes} (Nodos documentales: ${stats.documentaryNodes}, Nodos de orientación: ${stats.orientationNodes})
- **Segmentos de Movilidad:** ${stats.mobilitySegments}
- **Rutas de Lectura Académica (Regionales):** ${stats.readingRoutes}
- **Rutas Conceptuales Internas del Campus:** ${stats.campusRoutes}
- **Conexiones de Nodos de Red:** ${stats.nodeConnections}
- **Señales Cualitativas (Testimonios):** ${stats.qualitativeSignals}
- **Señales Sensibles Protegidas (Conteo Agregado):** ${stats.protectedSignals}
- **Artículos en Revisión:** ${stats.reviewItems}
- **Polígonos de Evidencia:** ${stats.evidenceItems}

## Directrices Éticas de Visualización
1. **Modo Público Seguro:**
   - No se publican coordenadas exactas de sanitarios, residencias, apoyos informales o testimonios.
   - Las señales sensibles se ocultan.
2. **Modo de Investigación Académica:**
   - Habilita la lectura de señales agregadas por zona.
   - Permite visualizar estadísticas cuantitativas y pendientes de validación.

Generado el: ${fullDataset.generatedAt}
`;

  fs.writeFileSync(OUTPUT_MD, mdContent, "utf-8");
  console.log(`Saved academic report: ${OUTPUT_MD}`);
}

buildDataset();
