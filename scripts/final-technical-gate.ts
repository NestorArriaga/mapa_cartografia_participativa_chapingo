import fs from 'fs';
import path from 'path';

const PROJECT_DIR = '/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach';

async function run() {
  console.log('--- Iniciando Gate Técnico Final ---');
  let errors = 0;

  function assertRule(condition: boolean, message: string) {
    if (!condition) {
      console.error(`❌ FALLO TÉCNICO: ${message}`);
      errors++;
    } else {
      console.log(`✅ ${message}`);
    }
  }

  // 1. Registry exists
  const registryPath = path.join(PROJECT_DIR, 'src', 'data', 'layerRegistry.sanitized.generated.ts');
  assertRule(fs.existsSync(registryPath), 'Registry sanitizado existe');

  // 2. Light mobility file exists
  const lightVias = path.join(PROJECT_DIR, 'public', 'data', 'sanitized', 'vias_contexto_movilidad.light.geojson');
  assertRule(fs.existsSync(lightVias), 'Capa de movilidad ligera existe');

  // 3. Components exist
  const requiredFiles = [
    'src/components/map/MapView.tsx',
    'src/components/map/DeckLayerRenderer.tsx',
    'src/components/panels/LeftControlPanel.tsx',
    'src/components/panels/RightDetailPanel.tsx',
    'src/stores/mapStore.ts',
    'src/stores/uiStore.ts',
    'src/stores/submissionStore.ts'
  ];

  for (const file of requiredFiles) {
    assertRule(fs.existsSync(path.join(PROJECT_DIR, file)), `Archivo requerido existe: ${file}`);
  }

  if (errors > 0) {
    console.error(`\n🚨 GATE TÉCNICO FALLIDO. ${errors} errores encontrados.`);
    process.exit(1);
  } else {
    console.log(`\n💻 GATE TÉCNICO APROBADO. La estructura del proyecto es correcta.`);
  }
}

run().catch(console.error);
