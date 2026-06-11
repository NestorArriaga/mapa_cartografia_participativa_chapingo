import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(PROJECT_ROOT, 'public', 'data');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs', 'fase-3-final');

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// --- Types ---

interface LayerValidation {
  fileName: string;
  fileSizeBytes: number;
  fileSizeHuman: string;
  isValidJson: boolean;
  jsonError?: string;
  isFeatureCollection: boolean;
  featureCount: number;
  geometryTypes: string[];
  emptyGeometries: number;
  propertyFields: string[];
  crs: string | null;
  crsIsValid: boolean;
  warnings: string[];
  status: 'PASS' | 'WARN' | 'FAIL' | 'SKIP';
}

interface ValidationReport {
  timestamp: string;
  overallStatus: 'PASS' | 'WARN' | 'FAIL';
  totalFiles: number;
  totalFeatures: number;
  layers: LayerValidation[];
}

// --- Helpers ---

function humanFileSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
  return `${bytes} B`;
}

const DANGEROUS_SIZE_BYTES = 100_000_000; // 100 MB
const UNPARSEABLE_SIZE_BYTES = 500_000_000; // 500 MB

// --- Validation ---

function validateLayer(filePath: string, fileName: string): LayerValidation {
  const stat = fs.statSync(filePath);
  const result: LayerValidation = {
    fileName,
    fileSizeBytes: stat.size,
    fileSizeHuman: humanFileSize(stat.size),
    isValidJson: false,
    isFeatureCollection: false,
    featureCount: 0,
    geometryTypes: [],
    emptyGeometries: 0,
    propertyFields: [],
    crs: null,
    crsIsValid: false,
    warnings: [],
    status: 'PASS',
  };

  // Check dangerously large files
  if (stat.size > UNPARSEABLE_SIZE_BYTES) {
    result.warnings.push(
      `PELIGRO: Archivo de ${result.fileSizeHuman}. Crasheará navegadores si se carga directamente. Requiere tiling o simplificación.`
    );
    result.status = 'FAIL';
    result.jsonError = 'Archivo demasiado grande para parsear en script';
    return result;
  }

  if (stat.size > DANGEROUS_SIZE_BYTES) {
    result.warnings.push(
      `Archivo grande (${result.fileSizeHuman}). Considerar lazy loading o tiling.`
    );
    if (result.status === 'PASS') result.status = 'WARN';
  }

  // Try parsing JSON
  let geojson: any;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    geojson = JSON.parse(raw);
    result.isValidJson = true;
  } catch (err: any) {
    result.isValidJson = false;
    result.jsonError = err.message?.substring(0, 200);
    result.status = 'FAIL';
    return result;
  }

  // Check FeatureCollection
  if (geojson.type !== 'FeatureCollection') {
    result.isFeatureCollection = false;
    result.warnings.push(`No es un FeatureCollection (type: ${geojson.type})`);
    result.status = 'WARN';
    return result;
  }
  result.isFeatureCollection = true;

  // CRS check
  if (geojson.crs) {
    const crsName = geojson.crs?.properties?.name || JSON.stringify(geojson.crs);
    result.crs = crsName;
    result.crsIsValid = crsName.includes('CRS84') || crsName.includes('4326');
    if (!result.crsIsValid) {
      result.warnings.push(`CRS no estándar: ${crsName}. Se espera EPSG:4326 / CRS84.`);
      if (result.status === 'PASS') result.status = 'WARN';
    }
  } else {
    // No CRS = assumed WGS84, which is fine per GeoJSON spec (RFC 7946)
    result.crs = 'No especificado (asume WGS84 por RFC 7946)';
    result.crsIsValid = true;
  }

  // Features
  const features = geojson.features || [];
  result.featureCount = features.length;

  if (features.length === 0) {
    result.warnings.push('El archivo no contiene features.');
    if (result.status === 'PASS') result.status = 'WARN';
    return result;
  }

  // Collect geometry types, property fields, and check for empty geometries
  const geometryTypeSet = new Set<string>();
  const propertyFieldSet = new Set<string>();

  for (const feature of features) {
    if (!feature.geometry || !feature.geometry.type) {
      result.emptyGeometries++;
    } else {
      geometryTypeSet.add(feature.geometry.type);
      if (
        !feature.geometry.coordinates ||
        (Array.isArray(feature.geometry.coordinates) && feature.geometry.coordinates.length === 0)
      ) {
        result.emptyGeometries++;
      }
    }

    if (feature.properties) {
      for (const key of Object.keys(feature.properties)) {
        propertyFieldSet.add(key);
      }
    }
  }

  result.geometryTypes = Array.from(geometryTypeSet).sort();
  result.propertyFields = Array.from(propertyFieldSet).sort();

  if (result.emptyGeometries > 0) {
    result.warnings.push(`${result.emptyGeometries} feature(s) con geometría vacía o nula.`);
    if (result.status === 'PASS') result.status = 'WARN';
  }

  return result;
}

// --- Main ---

console.log('=== VALIDACIÓN DE CAPAS GEOJSON ===\n');

const allFiles = fs.readdirSync(PUBLIC_DATA_DIR);
const geojsonFiles = allFiles.filter(f => f.endsWith('.geojson'));

const report: ValidationReport = {
  timestamp: new Date().toISOString(),
  overallStatus: 'PASS',
  totalFiles: geojsonFiles.length,
  totalFeatures: 0,
  layers: [],
};

for (const file of geojsonFiles) {
  console.log(`📋 Validando: ${file}`);
  const filePath = path.join(PUBLIC_DATA_DIR, file);
  const validation = validateLayer(filePath, file);
  report.layers.push(validation);
  report.totalFeatures += validation.featureCount;

  if (validation.status === 'FAIL') {
    report.overallStatus = 'FAIL';
  } else if (validation.status === 'WARN' && report.overallStatus !== 'FAIL') {
    report.overallStatus = 'WARN';
  }

  const icon = validation.status === 'PASS' ? '✅' : validation.status === 'WARN' ? '⚠️' : '🚨';
  console.log(`   ${icon} ${validation.status} — ${validation.featureCount} features, ${validation.fileSizeHuman}`);
  for (const w of validation.warnings) {
    console.log(`   ⚠️  ${w}`);
  }
}

// Write report
const reportPath = path.join(DOCS_DIR, 'geojson-validation-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
console.log(`\n📄 Reporte guardado: ${reportPath}`);

const statusIcon = report.overallStatus === 'PASS' ? '✅' : report.overallStatus === 'WARN' ? '⚠️' : '🚨';
console.log(`\n${statusIcon} Estado general: ${report.overallStatus}`);
console.log(`   Archivos: ${report.totalFiles} | Features: ${report.totalFeatures}`);
