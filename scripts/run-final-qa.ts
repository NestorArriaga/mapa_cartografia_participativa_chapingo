import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');

interface ScriptResult {
  name: string;
  script: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  error?: string;
}

const scripts = [
  { name: 'Auditoría de datos sensibles', script: 'tsx scripts/audit-sensitive-data.ts' },
  { name: 'Validación GeoJSON', script: 'tsx scripts/validate-geojson-layers.ts' },
  { name: 'Generación de estadísticas', script: 'tsx scripts/generate-layer-stats.ts' },
];

console.log('╔══════════════════════════════════════════╗');
console.log('║   QA FINAL — Mapa Vivo UACh-Texcoco     ║');
console.log('║   Fase 3 — Auditoría Completa            ║');
console.log('╚══════════════════════════════════════════╝\n');

const results: ScriptResult[] = [];
let hasFailures = false;

for (const { name, script } of scripts) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`▶ ${name}`);
  console.log(`  Comando: ${script}`);
  console.log(`${'─'.repeat(50)}\n`);

  const start = Date.now();
  try {
    execSync(script, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    const duration = Date.now() - start;
    results.push({ name, script, status: 'PASS', durationMs: duration });
    console.log(`\n✅ ${name} completado en ${duration}ms`);
  } catch (err: any) {
    const duration = Date.now() - start;
    const errorMsg = err.message?.substring(0, 200) || 'Error desconocido';
    results.push({ name, script, status: 'FAIL', durationMs: duration, error: errorMsg });
    hasFailures = true;
    console.log(`\n🚨 ${name} FALLÓ en ${duration}ms: ${errorMsg}`);
    console.log('   Continuando con los demás scripts...\n');
  }
}

// Summary
console.log('\n\n╔══════════════════════════════════════════╗');
console.log('║         RESUMEN DE QA FINAL              ║');
console.log('╚══════════════════════════════════════════╝\n');

for (const r of results) {
  const icon = r.status === 'PASS' ? '✅' : '🚨';
  console.log(`${icon} ${r.name} — ${r.status} (${r.durationMs}ms)`);
  if (r.error) {
    console.log(`   Error: ${r.error}`);
  }
}

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;

console.log(`\n📊 Resultado: ${passed} pasaron, ${failed} fallaron de ${results.length} total`);

if (hasFailures) {
  console.log('\n⚠️  Hay fallos en la auditoría. Revisar los reportes generados en docs/fase-3-final/');
  process.exit(1);
} else {
  console.log('\n✅ Todos los scripts de QA pasaron correctamente.');
}
