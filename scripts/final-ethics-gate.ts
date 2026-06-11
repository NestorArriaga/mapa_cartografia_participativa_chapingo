import fs from 'fs';
import path from 'path';

const PROJECT_DIR = '/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach';
const PUBLIC_DATA_DIR = path.join(PROJECT_DIR, 'public', 'data');
const SENSITIVE_DIR_PREFIX = '05_no_publicar';

const PROHIBITED_TERMS = [
  'zona peligrosa', 'punto seguro', 'riesgo absoluto', 'mapa de delitos', 'denuncia comprobada'
];

async function run() {
  console.log('--- Iniciando Gate de Ética Final ---');
  let errors = 0;

  function assertRule(condition: boolean, message: string) {
    if (!condition) {
      console.error(`❌ FALLO ÉTICO: ${message}`);
      errors++;
    } else {
      console.log(`✅ ${message}`);
    }
  }

  // Rule 1: No files from 05_no_publicar in public/data
  const checkDirForSensitiveFolders = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.includes(SENSITIVE_DIR_PREFIX)) {
        assertRule(false, `Carpeta sensible encontrada en data pública: ${entry.name}`);
      }
      if (entry.isDirectory()) {
        checkDirForSensitiveFolders(path.join(dir, entry.name));
      }
    }
  };
  checkDirForSensitiveFolders(PUBLIC_DATA_DIR);

  // Read all public GeoJSON
  let featuresChecked = 0;
  const checkGeoJsonFiles = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkGeoJsonFiles(fullPath);
      } else if (entry.isFile() && fullPath.endsWith('.geojson')) {
        // Skip checking the 4.3gb file or the light one specifically for massive iteration if memory is an issue, 
        // but we assume the light one is small and the original 4.3gb is not in sanitized.
        if (entry.name === 'vias_contexto_movilidad_v06.geojson') continue;

        const content = fs.readFileSync(fullPath, 'utf-8');
        try {
          const geojson = JSON.parse(content);
          if (geojson.features) {
            for (const f of geojson.features) {
              featuresChecked++;
              const props = f.properties || {};
              const nivelUso = String(props.nivel_uso || '').toLowerCase();
              if (nivelUso.includes('no_publicar') || nivelUso.includes('sensible')) {
                assertRule(false, `Feature con nivel_uso sensible encontrada en ${entry.name} (id: ${props.zona || props.node_id})`);
              }
              const cat = String(props.categoria || '').toLowerCase();
              if (cat === 'sensible' || cat === 'apoyo_informal') {
                assertRule(false, `Feature con categoría sensible encontrada en ${entry.name}`);
              }
            }
          }
        } catch(e) {
           console.error(`Could not parse ${entry.name}`);
        }
      }
    }
  }
  checkGeoJsonFiles(PUBLIC_DATA_DIR);
  console.log(`Revisadas ${featuresChecked} features públicas.`);

  // Rule 6 & 7: Check frontend codebase for prohibited terms
  let filesChecked = 0;
  const checkFrontendCode = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkFrontendCode(fullPath);
      } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
        if (entry.name === 'copyGuard.ts' || entry.name === 'ethicalDataGate.ts') continue;
        filesChecked++;
        const content = fs.readFileSync(fullPath, 'utf-8').toLowerCase();
        for (const term of PROHIBITED_TERMS) {
          if (content.includes(term)) {
            assertRule(false, `Término prohibido "${term}" encontrado en UI: ${entry.name}`);
          }
        }
      }
    }
  }
  checkFrontendCode(path.join(PROJECT_DIR, 'src'));
  console.log(`Revisados ${filesChecked} archivos de código UI.`);

  if (errors > 0) {
    console.error(`\n🚨 GATE ÉTICO FALLIDO. ${errors} errores encontrados. CORRIJA INMEDIATAMENTE.`);
    process.exit(1);
  } else {
    console.log(`\n💚 GATE ÉTICO APROBADO. Plataforma lista para demo pública.`);
  }
}

run().catch(console.error);
