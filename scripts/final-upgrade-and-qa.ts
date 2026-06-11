import { execSync } from 'child_process';
import path from 'path';

const PROJECT_DIR = '/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach';

function runStep(name: string, command: string) {
  console.log(`\n\n======================================================`);
  console.log(`🚀 EJECUTANDO: ${name}`);
  console.log(`======================================================`);
  try {
    execSync(command, { cwd: PROJECT_DIR, stdio: 'inherit' });
    console.log(`✅ ${name} completado.`);
  } catch (error) {
    console.error(`\n❌ ERROR EN: ${name}`);
    process.exit(1);
  }
}

async function run() {
  console.log('🌟 Iniciando QA ULTIMATE: Construcción y Validación Fase Final');

  runStep('1. Sanitización de Datos', 'npx tsx scripts/sanitize-v06-public-data.ts');
  runStep('2. Optimización Capa de Movilidad', 'npx tsx scripts/create-lightweight-mobility-layer.ts');
  runStep('3. Auditoría de Datos Mock', 'npx tsx scripts/audit-mock-data.ts');
  runStep('4. Gate de Ética', 'npx tsx scripts/final-ethics-gate.ts');
  runStep('5. Gate Técnico', 'npx tsx scripts/final-technical-gate.ts');
  runStep('6. Typecheck', 'npm run typecheck');
  runStep('7. Build de Producción', 'npm run build');

  console.log(`\n\n🎉 ¡QA ULTIMATE APROBADO EXITOSAMENTE! 🎉`);
  console.log(`La plataforma Mapa Vivo UACh-Texcoco ha pasado todas las validaciones éticas y técnicas y está lista para la demo pública.`);
}

run().catch(console.error);
