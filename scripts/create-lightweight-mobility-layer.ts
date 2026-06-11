import fs from 'fs';
import path from 'path';
import JSONStream from 'JSONStream';

const V06_PACKAGE_DIR = '/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/chapingo_web_v06_final_nodos_integrados_20260610_123131';
const INPUT_FILE = path.join(V06_PACKAGE_DIR, '03_web_contexto_movilidad', 'vias_contexto_movilidad_v06.geojson');
const PROJECT_DIR = '/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach';
const ZONES_FILE = path.join(PROJECT_DIR, 'public', 'data', 'sanitized', 'zonas_prioridad_integrada_o_indicadores.public.geojson');
const OUTPUT_FILE = path.join(PROJECT_DIR, 'public', 'data', 'sanitized', 'vias_contexto_movilidad.light.geojson');
const REPORT_FILE = path.join(PROJECT_DIR, 'docs', 'fase-final', 'mobility-layer-optimization.md');

// Calculate BBox of zones
function getZonesBbox(): [number, number, number, number] {
  if (!fs.existsSync(ZONES_FILE)) {
    console.error("No se encontró el archivo de zonas para calcular el BBox.");
    return [-98.9, 19.45, -98.85, 19.55]; 
  }
  const geojson = JSON.parse(fs.readFileSync(ZONES_FILE, 'utf-8'));
  let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
  
  for (const feature of geojson.features) {
    if (feature.geometry && feature.geometry.coordinates) {
      const coords = feature.geometry.type === 'Polygon' 
        ? feature.geometry.coordinates[0] 
        : feature.geometry.coordinates[0][0];
      
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }
  
  const padding = 0.02;
  return [minLng - padding, minLat - padding, maxLng + padding, maxLat + padding];
}

function intersects(feature: any, bbox: [number, number, number, number]): boolean {
  if (!feature.geometry || !feature.geometry.coordinates) return false;
  
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const coords = feature.geometry.type === 'LineString' 
    ? feature.geometry.coordinates 
    : feature.geometry.coordinates[0]; 
  
  for (const [lng, lat] of coords) {
    if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
      return true;
    }
  }
  return false;
}

async function run() {
  console.log('--- Iniciando optimización de capa de movilidad (4.3 GB) ---');
  
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Archivo original no encontrado: ${INPUT_FILE}`);
    return;
  }

  const stat = fs.statSync(INPUT_FILE);
  const sizeGB = (stat.size / (1024 * 1024 * 1024)).toFixed(2);
  console.log(`Tamaño archivo original: ${sizeGB} GB`);

  const bbox = getZonesBbox();
  console.log(`Bounding Box calculado (con padding): ${bbox.map(n => n.toFixed(4)).join(', ')}`);

  const outStream = fs.createWriteStream(OUTPUT_FILE);
  outStream.write('{"type":"FeatureCollection","features":[\n');

  let featuresProcessed = 0;
  let featuresKept = 0;
  let firstFeature = true;
  const MAX_FEATURES = 4000;

  const readStream = fs.createReadStream(INPUT_FILE);
  const parser = JSONStream.parse('features.*');

  readStream.pipe(parser);

  parser.on('data', (feature) => {
    featuresProcessed++;
    
    if (featuresProcessed % 100000 === 0) {
      console.log(`Procesadas: ${featuresProcessed} features... Guardadas: ${featuresKept}`);
    }

    if (featuresKept >= MAX_FEATURES) {
      readStream.destroy(); // Stop reading
      return;
    }

    if (intersects(feature, bbox)) {
      if (!firstFeature) {
        outStream.write(',\n');
      }
      outStream.write(JSON.stringify(feature));
      featuresKept++;
      firstFeature = false;
    }
  });

  parser.on('end', finish);
  readStream.on('close', finish);

  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    
    outStream.write('\n]}');
    outStream.end();
    
    console.log('\n✅ Optimización completada.');
    console.log(`Features revisadas: ${featuresProcessed}`);
    console.log(`Features conservadas: ${featuresKept}`);
    
    const finalStat = fs.statSync(OUTPUT_FILE);
    const finalSizeMB = (finalStat.size / (1024 * 1024)).toFixed(2);
    console.log(`Tamaño archivo final: ${finalSizeMB} MB`);

    const mdContent = `# Optimización de Capa Vial de Contexto

Este documento detalla el proceso de reducción de la capa vial para hacerla funcional en el navegador.

- **Archivo Original**: vias_contexto_movilidad_v06.geojson
- **Tamaño Original**: ${sizeGB} GB
- **Estado en Registry**: Marcado como \`disabled_too_large\`
- **Estrategia**: Filtrado en streaming (sin cargar en memoria) basado en el Bounding Box de las zonas de validación prioritarias (con padding de ~2km).

## Resultados

- **Archivo Resultante**: vias_contexto_movilidad.light.geojson
- **Límite de features establecido**: ${MAX_FEATURES}
- **Features revisadas en stream**: ${featuresProcessed}
- **Features conservadas**: ${featuresKept}
- **Tamaño final optimizado**: ${finalSizeMB} MB

Esta versión ligera puede cargarse de forma segura en el navegador sin bloquear el hilo principal.
`;
    
    fs.writeFileSync(REPORT_FILE, mdContent);
    console.log(`Reporte generado en: ${REPORT_FILE}`);
  }
}

run().catch(console.error);
