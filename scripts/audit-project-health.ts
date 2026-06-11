import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs', 'fase-3-final');

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// --- Types ---

interface HealthCheck {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string;
}

interface HealthReport {
  timestamp: string;
  overallStatus: 'PASS' | 'WARN' | 'FAIL';
  checks: HealthCheck[];
}

// --- Checks ---

function checkFileExists(filePath: string, description: string): HealthCheck {
  const exists = fs.existsSync(filePath);
  return {
    name: description,
    status: exists ? 'PASS' : 'FAIL',
    details: exists
      ? `Encontrado: ${path.basename(filePath)}`
      : `NO encontrado: ${filePath}`,
  };
}

function checkDirectoryNotEmpty(dirPath: string, description: string): HealthCheck {
  if (!fs.existsSync(dirPath)) {
    return { name: description, status: 'FAIL', details: `Directorio no existe: ${dirPath}` };
  }
  const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'));
  return {
    name: description,
    status: files.length > 0 ? 'PASS' : 'WARN',
    details: `${files.length} archivo(s) en ${path.basename(dirPath)}/`,
  };
}

function checkNoSensitiveFiles(): HealthCheck {
  const publicDataDir = path.join(PROJECT_ROOT, 'public', 'data');
  if (!fs.existsSync(publicDataDir)) {
    return { name: 'Sin archivos sensibles en public/data', status: 'PASS', details: 'Directorio no existe' };
  }
  const files = fs.readdirSync(publicDataDir);
  const sensitiveFiles = files.filter(f => {
    const lower = f.toLowerCase();
    return lower.includes('no_publicar') || lower.includes('_sensible_base');
  });
  return {
    name: 'Sin archivos sensibles en public/data',
    status: sensitiveFiles.length === 0 ? 'PASS' : 'FAIL',
    details: sensitiveFiles.length === 0
      ? 'No se encontraron archivos sensibles'
      : `ENCONTRADOS: ${sensitiveFiles.join(', ')}`,
  };
}

function checkPackageScripts(): HealthCheck {
  const pkgPath = path.join(PROJECT_ROOT, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const scripts = pkg.scripts || {};
    const requiredScripts = ['qa:sensitive', 'qa:geojson', 'qa:stats', 'qa:final', 'typecheck', 'build:data'];
    const missing = requiredScripts.filter(s => !scripts[s]);
    return {
      name: 'Scripts de QA en package.json',
      status: missing.length === 0 ? 'PASS' : 'WARN',
      details: missing.length === 0
        ? `Todos los ${requiredScripts.length} scripts de QA presentes`
        : `Faltan: ${missing.join(', ')}`,
    };
  } catch {
    return { name: 'Scripts de QA en package.json', status: 'FAIL', details: 'No se pudo leer package.json' };
  }
}

// --- Main ---

console.log('=== AUDITORÍA DE SALUD DEL PROYECTO ===\n');

const checks: HealthCheck[] = [];

// Critical files
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'package.json'), 'package.json existe'));
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'tsconfig.json'), 'tsconfig.json existe'));
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'vite.config.ts'), 'vite.config.ts existe'));
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'index.html'), 'index.html existe'));

// Source structure
checks.push(checkDirectoryNotEmpty(path.join(PROJECT_ROOT, 'src', 'components'), 'Componentes React'));
checks.push(checkDirectoryNotEmpty(path.join(PROJECT_ROOT, 'src', 'lib'), 'Módulos de utilidad'));
checks.push(checkDirectoryNotEmpty(path.join(PROJECT_ROOT, 'src', 'types'), 'Tipos TypeScript'));
checks.push(checkDirectoryNotEmpty(path.join(PROJECT_ROOT, 'src', 'stores'), 'Stores Zustand'));
checks.push(checkDirectoryNotEmpty(path.join(PROJECT_ROOT, 'src', 'data'), 'Datos generados'));

// Data files
checks.push(checkDirectoryNotEmpty(path.join(PROJECT_ROOT, 'public', 'data'), 'Datos públicos'));
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'public', 'data', 'layer-manifest.generated.json'), 'Manifiesto de capas'));

// Critical lib modules
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'src', 'lib', 'privacy.ts'), 'Módulo de privacidad'));
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'src', 'lib', 'copyGuard.ts'), 'Guardia terminológica'));
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'src', 'lib', 'featureFormatters.ts'), 'Formateadores'));
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'src', 'lib', 'performance.ts'), 'Módulo de rendimiento'));

// Security
checks.push(checkNoSensitiveFiles());
checks.push(checkPackageScripts());

// Scripts
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'scripts', 'audit-sensitive-data.ts'), 'Script auditoría sensible'));
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'scripts', 'validate-geojson-layers.ts'), 'Script validación GeoJSON'));
checks.push(checkFileExists(path.join(PROJECT_ROOT, 'scripts', 'generate-layer-stats.ts'), 'Script estadísticas'));

// Determine overall status
let overallStatus: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
for (const check of checks) {
  if (check.status === 'FAIL') overallStatus = 'FAIL';
  else if (check.status === 'WARN' && overallStatus !== 'FAIL') overallStatus = 'WARN';
}

const report: HealthReport = {
  timestamp: new Date().toISOString(),
  overallStatus,
  checks,
};

// Print results
for (const check of checks) {
  const icon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '🚨';
  console.log(`${icon} ${check.name}: ${check.details}`);
}

// Write report
const reportPath = path.join(DOCS_DIR, 'project-health-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
console.log(`\n📄 Reporte guardado: ${reportPath}`);

const statusIcon = overallStatus === 'PASS' ? '✅' : overallStatus === 'WARN' ? '⚠️' : '🚨';
console.log(`\n${statusIcon} Estado general del proyecto: ${overallStatus}`);
const passed = checks.filter(c => c.status === 'PASS').length;
const warned = checks.filter(c => c.status === 'WARN').length;
const failed = checks.filter(c => c.status === 'FAIL').length;
console.log(`   ${passed} pasaron, ${warned} advertencias, ${failed} fallos`);
