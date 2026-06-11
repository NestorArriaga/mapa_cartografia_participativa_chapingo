import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(PROJECT_ROOT, 'public', 'data');
const SRC_DATA_DIR = path.join(PROJECT_ROOT, 'src', 'data');
const MANIFEST_PATH = path.join(PUBLIC_DATA_DIR, 'layer-manifest.generated.json');

// Ensure output dirs
if (!fs.existsSync(SRC_DATA_DIR)) {
  fs.mkdirSync(SRC_DATA_DIR, { recursive: true });
}

// --- Helpers ---

function safeReadGeoJSON(fileName: string): any | null {
  const filePath = path.join(PUBLIC_DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Archivo no encontrado: ${fileName}`);
    return null;
  }
  const stat = fs.statSync(filePath);
  if (stat.size > 500_000_000) {
    console.warn(`⚠️  Archivo demasiado grande para leer: ${fileName} (${(stat.size / 1e9).toFixed(2)} GB)`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    console.warn(`⚠️  Error parseando: ${fileName}`);
    return null;
  }
}

function countFeatures(fileName: string): number {
  const gj = safeReadGeoJSON(fileName);
  if (!gj || !gj.features) return 0;
  return gj.features.length;
}

function countFilteredFeatures(fileName: string, excludeNivelUso: string): number {
  const gj = safeReadGeoJSON(fileName);
  if (!gj || !gj.features) return 0;
  return gj.features.filter(
    (f: any) => (f.properties?.nivel_uso || '') !== excludeNivelUso
  ).length;
}

// --- Types ---

interface LayerStats {
  generatedAt: string;
  zones: {
    total: number;
    source: string;
  };
  publicNodes: {
    total: number;
    source: string;
  };
  orientationNodes: {
    total: number;
    source: string;
  };
  connectors: {
    total: number;
    source: string;
  };
  evidence: {
    totalRaw: number;
    totalPublic: number;
    filtered: number;
    source: string;
    filterRule: string;
  };
  layers: {
    publicLayers: number;
    revisionLayers: number;
    sensitiveLayers: number;
    documentationLayers: number;
    totalRegistered: number;
  };
  submissions: {
    placeholder: string;
    note: string;
  };
}

// --- Main ---

console.log('=== GENERACIÓN DE ESTADÍSTICAS DE CAPAS ===\n');

// Count zones
const zonesFile = 'zonas_prioridad_integrada_o_indicadores_v06.geojson';
const zonesCount = countFeatures(zonesFile);
console.log(`🗺️  Zonas: ${zonesCount} (${zonesFile})`);

// Count public nodes
const publicNodesFile = 'nodos_documentales_publicos_agregados_v06.geojson';
const publicNodesCount = countFeatures(publicNodesFile);
console.log(`📍 Nodos públicos: ${publicNodesCount} (${publicNodesFile})`);

// Count orientation nodes
const orientationNodesFile = 'nodos_orientacion_base_v06.geojson';
const orientationNodesCount = countFeatures(orientationNodesFile);
console.log(`🧭 Nodos de orientación: ${orientationNodesCount} (${orientationNodesFile})`);

// Count connectors
const connectorsFile = 'conectores_visualizacion_v06.geojson';
const connectorsCount = countFeatures(connectorsFile);
console.log(`🔗 Conectores: ${connectorsCount} (${connectorsFile})`);

// Count evidence (filtered)
const evidenceFile = 'evidencia_documental_agregada_por_zona_v06.geojson';
const evidenceTotal = countFeatures(evidenceFile);
const evidencePublic = countFilteredFeatures(evidenceFile, '04_no_publicar_sensible');
const evidenceFiltered = evidenceTotal - evidencePublic;
console.log(`📊 Evidencia: ${evidenceTotal} total, ${evidencePublic} pública, ${evidenceFiltered} filtrada(s)`);

// Count layers from manifest
let publicLayers = 0;
let revisionLayers = 0;
let sensitiveLayers = 0;
let documentationLayers = 0;
let totalRegistered = 0;

if (fs.existsSync(MANIFEST_PATH)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const layers = manifest.layers || [];
    totalRegistered = layers.length;
    for (const layer of layers) {
      switch (layer.publicStatus) {
        case 'PUBLIC_CORE':
        case 'PUBLIC_NODES':
        case 'PUBLIC_MOBILITY_CONTEXT':
          publicLayers++;
          break;
        case 'REVISION_CONTROLLED':
          revisionLayers++;
          break;
        case 'SENSITIVE_NO_PUBLIC':
          sensitiveLayers++;
          break;
        case 'DOCUMENTATION':
        case 'STYLE_ONLY':
          documentationLayers++;
          break;
      }
    }
  } catch {
    console.warn('⚠️  No se pudo leer el manifiesto de capas');
  }
}

console.log(`\n📦 Capas registradas: ${totalRegistered}`);
console.log(`   Públicas: ${publicLayers} | Revisión: ${revisionLayers} | Sensibles: ${sensitiveLayers} | Documentación: ${documentationLayers}`);

// Build stats object
const stats: LayerStats = {
  generatedAt: new Date().toISOString(),
  zones: {
    total: zonesCount,
    source: zonesFile,
  },
  publicNodes: {
    total: publicNodesCount,
    source: publicNodesFile,
  },
  orientationNodes: {
    total: orientationNodesCount,
    source: orientationNodesFile,
  },
  connectors: {
    total: connectorsCount,
    source: connectorsFile,
  },
  evidence: {
    totalRaw: evidenceTotal,
    totalPublic: evidencePublic,
    filtered: evidenceFiltered,
    source: evidenceFile,
    filterRule: 'Excluir features donde nivel_uso === "04_no_publicar_sensible"',
  },
  layers: {
    publicLayers,
    revisionLayers,
    sensitiveLayers,
    documentationLayers,
    totalRegistered,
  },
  submissions: {
    placeholder: '(se lee de localStorage en runtime)',
    note: 'El conteo de envíos del formulario participativo se almacena en localStorage del navegador.',
  },
};

// Write TS module
const tsContent = `// GENERADO AUTOMÁTICAMENTE por scripts/generate-layer-stats.ts
// NO EDITAR MANUALMENTE — se regenera con: npm run qa:stats

export interface LayerStats {
  generatedAt: string;
  zones: { total: number; source: string };
  publicNodes: { total: number; source: string };
  orientationNodes: { total: number; source: string };
  connectors: { total: number; source: string };
  evidence: {
    totalRaw: number;
    totalPublic: number;
    filtered: number;
    source: string;
    filterRule: string;
  };
  layers: {
    publicLayers: number;
    revisionLayers: number;
    sensitiveLayers: number;
    documentationLayers: number;
    totalRegistered: number;
  };
  submissions: {
    placeholder: string;
    note: string;
  };
}

export const layerStats: LayerStats = ${JSON.stringify(stats, null, 2)};
`;

const tsPath = path.join(SRC_DATA_DIR, 'layerStats.generated.ts');
fs.writeFileSync(tsPath, tsContent, 'utf-8');
console.log(`\n📄 TS guardado: ${tsPath}`);

// Write JSON
const jsonPath = path.join(PUBLIC_DATA_DIR, 'layer-stats.generated.json');
fs.writeFileSync(jsonPath, JSON.stringify(stats, null, 2), 'utf-8');
console.log(`📄 JSON guardado: ${jsonPath}`);

console.log('\n✅ Estadísticas generadas correctamente.');
