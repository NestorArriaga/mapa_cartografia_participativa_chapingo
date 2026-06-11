import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(PROJECT_ROOT, 'public', 'data');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs', 'fase-3-final');

// Ensure output dir
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// --- Configuration ---

const SENSITIVE_FOLDER_NAME = '05_no_publicar_sensible';

const SENSITIVE_NIVEL_USO_PATTERNS = [
  'no_publicar',
  'sensible',
];

const SENSITIVE_PROPERTY_NAMES = [
  'testimonio', 'relato', 'baño', 'bano', 'dormitorio',
  'cuarto', 'casa', 'teléfono', 'telefono', 'correo',
  'matrícula', 'matricula', 'nombre_victima', 'denuncia',
];

// --- Types ---

interface SensitiveFileFound {
  fileName: string;
  reason: string;
}

interface SensitiveFeatureFound {
  fileName: string;
  featureId: string;
  featureName: string;
  nivelUso: string;
  reason: string;
}

interface SensitivePropertyFound {
  fileName: string;
  featureId: string;
  propertyName: string;
  propertyValueSnippet: string;
}

interface AuditResult {
  timestamp: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  sensitiveFilesInPublic: SensitiveFileFound[];
  sensitiveFeaturesInPublic: SensitiveFeatureFound[];
  sensitivePropertiesFound: SensitivePropertyFound[];
  totalGeoJsonScanned: number;
  totalFeaturesScanned: number;
  summary: string;
}

// --- Main Audit ---

function runAudit(): AuditResult {
  const result: AuditResult = {
    timestamp: new Date().toISOString(),
    status: 'PASS',
    sensitiveFilesInPublic: [],
    sensitiveFeaturesInPublic: [],
    sensitivePropertiesFound: [],
    totalGeoJsonScanned: 0,
    totalFeaturesScanned: 0,
    summary: '',
  };

  // 1. Check for files from 05_no_publicar_sensible in public/data/
  console.log('🔍 Verificando archivos sensibles en public/data/ ...');
  const publicFiles = fs.readdirSync(PUBLIC_DATA_DIR);
  
  for (const file of publicFiles) {
    const lowerFile = file.toLowerCase();
    if (
      lowerFile.includes('no_publicar') ||
      lowerFile.includes('sensible') ||
      lowerFile.includes('_revision_sensible')
    ) {
      result.sensitiveFilesInPublic.push({
        fileName: file,
        reason: `Nombre de archivo contiene patrón sensible`,
      });
      result.status = 'FAIL';
    }
  }

  // 2. Scan all GeoJSON files in public/data/
  const geojsonFiles = publicFiles.filter(f => f.endsWith('.geojson'));
  result.totalGeoJsonScanned = geojsonFiles.length;

  for (const file of geojsonFiles) {
    const filePath = path.join(PUBLIC_DATA_DIR, file);
    const stat = fs.statSync(filePath);

    // Skip the 4.3GB vias file — too large to parse
    if (stat.size > 500_000_000) {
      console.log(`⚠️  Saltando ${file} (${(stat.size / 1e9).toFixed(2)} GB — demasiado grande para escanear)`);
      continue;
    }

    let geojson: any;
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      geojson = JSON.parse(raw);
    } catch {
      console.warn(`⚠️  No se pudo parsear ${file}`);
      continue;
    }

    if (!geojson.features || !Array.isArray(geojson.features)) continue;

    for (const feature of geojson.features) {
      result.totalFeaturesScanned++;
      const props = feature.properties || {};
      const featureId = props.id || props.ID || 'unknown';
      const featureName = props.nombre || props.name || '';

      // Check nivel_uso
      const nivelUso = (props.nivel_uso || '').toLowerCase();
      for (const pattern of SENSITIVE_NIVEL_USO_PATTERNS) {
        if (nivelUso.includes(pattern)) {
          result.sensitiveFeaturesInPublic.push({
            fileName: file,
            featureId,
            featureName,
            nivelUso: props.nivel_uso,
            reason: `nivel_uso contiene '${pattern}'`,
          });
          if (result.status !== 'FAIL') result.status = 'WARN';
          break;
        }
      }

      // Check for sensitive property names
      for (const propName of Object.keys(props)) {
        const lowerPropName = propName.toLowerCase();
        for (const sensitiveKey of SENSITIVE_PROPERTY_NAMES) {
          if (lowerPropName.includes(sensitiveKey)) {
            const value = String(props[propName] ?? '');
            result.sensitivePropertiesFound.push({
              fileName: file,
              featureId,
              propertyName: propName,
              propertyValueSnippet: value.substring(0, 80),
            });
            if (result.status !== 'FAIL') result.status = 'WARN';
          }
        }
      }
    }
  }

  // Build summary
  const issues = result.sensitiveFilesInPublic.length +
    result.sensitiveFeaturesInPublic.length +
    result.sensitivePropertiesFound.length;
  
  if (issues === 0) {
    result.summary = 'No se encontraron problemas de privacidad. Todos los datos públicos son seguros.';
  } else {
    const parts: string[] = [];
    if (result.sensitiveFilesInPublic.length > 0) {
      parts.push(`${result.sensitiveFilesInPublic.length} archivo(s) sensible(s) en public/data/`);
    }
    if (result.sensitiveFeaturesInPublic.length > 0) {
      parts.push(`${result.sensitiveFeaturesInPublic.length} feature(s) con nivel_uso sensible`);
    }
    if (result.sensitivePropertiesFound.length > 0) {
      parts.push(`${result.sensitivePropertiesFound.length} propiedad(es) sensible(s) detectada(s)`);
    }
    result.summary = `ATENCIÓN: ${parts.join('; ')}.`;
  }

  return result;
}

// --- Generate Markdown Report ---

function generateMarkdown(result: AuditResult): string {
  const statusEmoji = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '🚨';
  
  let md = `# 02 — Auditoría Ética y de Privacidad\n\n`;
  md += `> Generado automáticamente: ${result.timestamp}\n\n`;
  md += `## Estado General: ${statusEmoji} ${result.status}\n\n`;
  md += `${result.summary}\n\n`;
  md += `---\n\n`;

  md += `## Métricas del Escaneo\n\n`;
  md += `| Métrica | Valor |\n`;
  md += `|---------|-------|\n`;
  md += `| Archivos GeoJSON escaneados | ${result.totalGeoJsonScanned} |\n`;
  md += `| Features escaneados | ${result.totalFeaturesScanned} |\n`;
  md += `| Archivos sensibles en public/ | ${result.sensitiveFilesInPublic.length} |\n`;
  md += `| Features con nivel_uso sensible | ${result.sensitiveFeaturesInPublic.length} |\n`;
  md += `| Propiedades sensibles detectadas | ${result.sensitivePropertiesFound.length} |\n\n`;

  if (result.sensitiveFilesInPublic.length > 0) {
    md += `## 🚨 Archivos Sensibles en public/data/\n\n`;
    md += `> [!CAUTION]\n`;
    md += `> Los siguientes archivos NO deben estar en public/data/.\n\n`;
    for (const f of result.sensitiveFilesInPublic) {
      md += `- **${f.fileName}**: ${f.reason}\n`;
    }
    md += `\n`;
  }

  if (result.sensitiveFeaturesInPublic.length > 0) {
    md += `## ⚠️ Features con nivel_uso Sensible\n\n`;
    md += `> [!WARNING]\n`;
    md += `> Estos features están en archivos públicos pero tienen nivel_uso que indica contenido sensible.\n`;
    md += `> El frontend DEBE filtrarlos al cargar.\n\n`;
    md += `| Archivo | Feature ID | Nombre | nivel_uso | Razón |\n`;
    md += `|---------|-----------|--------|-----------|-------|\n`;
    for (const f of result.sensitiveFeaturesInPublic) {
      md += `| ${f.fileName} | ${f.featureId} | ${f.featureName.substring(0, 40)} | ${f.nivelUso} | ${f.reason} |\n`;
    }
    md += `\n`;
  }

  if (result.sensitivePropertiesFound.length > 0) {
    md += `## ⚠️ Propiedades Sensibles Detectadas\n\n`;
    md += `> [!NOTE]\n`;
    md += `> Se detectaron propiedades que podrían contener información personal.\n`;
    md += `> Verificar que no se exponen en popups/tooltips.\n\n`;
    md += `| Archivo | Feature ID | Propiedad | Valor (primeros 80 chars) |\n`;
    md += `|---------|-----------|-----------|---------------------------|\n`;
    for (const p of result.sensitivePropertiesFound) {
      md += `| ${p.fileName} | ${p.featureId} | ${p.propertyName} | ${p.propertyValueSnippet} |\n`;
    }
    md += `\n`;
  }

  md += `## Reglas Éticas del Proyecto\n\n`;
  md += `1. **NUNCA** copiar archivos de \`05_no_publicar_sensible\` a \`public/data/\`\n`;
  md += `2. **FILTRAR** features con \`nivel_uso = "04_no_publicar_sensible"\` en el frontend\n`;
  md += `3. **NO EXPONER** propiedades como testimonio, relato, dormitorio, casa, teléfono en popups\n`;
  md += `4. **NO GEOLOCALIZAR** puntos exactos de víctimas\n`;
  md += `5. **USAR** solo datos agregados por zona para visualización pública\n`;
  md += `6. El archivo \`vias_contexto_movilidad_v06.geojson\` (4.3 GB) NO debe cargarse por defecto\n\n`;

  md += `---\n\n`;
  md += `*Script: scripts/audit-sensitive-data.ts*\n`;

  return md;
}

// --- Run ---

console.log('=== AUDITORÍA DE DATOS SENSIBLES ===\n');
const auditResult = runAudit();

// Write JSON
const jsonPath = path.join(DOCS_DIR, 'sensitive-data-audit.json');
fs.writeFileSync(jsonPath, JSON.stringify(auditResult, null, 2), 'utf-8');
console.log(`\n📄 JSON guardado: ${jsonPath}`);

// Write Markdown
const mdPath = path.join(DOCS_DIR, '02_AUDITORIA_ETICA_Y_PRIVACIDAD.md');
fs.writeFileSync(mdPath, generateMarkdown(auditResult), 'utf-8');
console.log(`📄 Markdown guardado: ${mdPath}`);

// Print summary
const statusIcon = auditResult.status === 'PASS' ? '✅' : auditResult.status === 'WARN' ? '⚠️' : '🚨';
console.log(`\n${statusIcon} Estado: ${auditResult.status}`);
console.log(auditResult.summary);

// Exit with error code if FAIL
if (auditResult.status === 'FAIL') {
  process.exit(1);
}
