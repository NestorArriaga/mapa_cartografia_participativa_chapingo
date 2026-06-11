import fs from 'fs';
import path from 'path';

const SANITIZED_DIR = path.resolve('public/data/sanitized');
const REPORT_MD_PATH = path.resolve('docs/emergency-render-fix/01_SANITIZED_DATA_INSPECTION.md');
const STATS_TS_PATH = path.resolve('src/data/sanitizedLayerStats.generated.ts');

function getBbox(features: any[]): [number, number, number, number] | undefined {
  if (features.length === 0) return undefined;
  let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
  for (const f of features) {
    if (!f.geometry || !f.geometry.coordinates) continue;
    
    // Simplistic bounding box for Points, LineStrings, and Polygons
    const processCoord = (coord: number[]) => {
      if (coord.length >= 2) {
        if (coord[0] < minLng) minLng = coord[0];
        if (coord[0] > maxLng) maxLng = coord[0];
        if (coord[1] < minLat) minLat = coord[1];
        if (coord[1] > maxLat) maxLat = coord[1];
      }
    };

    const processRecursive = (coords: any) => {
      if (!Array.isArray(coords)) return;
      if (coords.length >= 2 && typeof coords[0] === 'number') {
        processCoord(coords);
        return;
      }
      for (const sub of coords) {
        processRecursive(sub);
      }
    };

    processRecursive(f.geometry.coordinates);
  }
  
  if (minLng === 180) return undefined; // No valid coordinates found
  return [minLng, minLat, maxLng, maxLat];
}

async function main() {
  if (!fs.existsSync(SANITIZED_DIR)) {
    console.error(`Directory not found: ${SANITIZED_DIR}`);
    return;
  }

  const files = fs.readdirSync(SANITIZED_DIR).filter(f => f.endsWith('.geojson'));
  
  const stats = [];
  let mdContent = `# Inspección de Datos Sanitizados\n\n`;
  mdContent += `Generado el: ${new Date().toISOString()}\n\n`;
  mdContent += `| Archivo | Existe | Tamaño MB | Feature count | Geometry types | BBox | Campos principales | Renderizable |\n`;
  mdContent += `| ------- | -----: | --------: | ------------: | -------------- | ---- | ------------------ | ------------ |\n`;

  for (const file of files) {
    const filePath = path.join(SANITIZED_DIR, file);
    const sizeBytes = fs.statSync(filePath).size;
    const sizeMB = sizeBytes / (1024 * 1024);
    
    let isBlockedByEthics = false;
    const isBlockedBySize = sizeMB > 25;
    
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(`Error parsing ${file}:`, e);
      continue;
    }

    const features = data.features || [];
    const featureCount = features.length;
    
    const geomTypes = new Set<string>();
    const fields = new Set<string>();
    
    for (const f of features) {
      if (f.geometry?.type) geomTypes.add(f.geometry.type);
      if (f.properties) {
        Object.keys(f.properties).forEach(k => fields.add(k));
        
        // Ethical check
        const nivelUso = String(f.properties.nivel_uso ?? '').toLowerCase();
        if (nivelUso.includes('no_publicar') || nivelUso.includes('sensible')) {
          isBlockedByEthics = true;
        }
      }
    }

    const bbox = getBbox(features);
    
    const isRenderable = featureCount > 0 && !isBlockedBySize && !isBlockedByEthics;

    let renderableStatus = '✅ SÍ';
    if (featureCount === 0) renderableStatus = '❌ NO RENDERIZABLE';
    if (isBlockedBySize) renderableStatus = '❌ BLOQUEADO_POR_PESO';
    if (isBlockedByEthics) renderableStatus = '❌ BLOQUEADO_POR_ETICA';

    const bboxStr = bbox ? `[${bbox.map(n => n.toFixed(3)).join(', ')}]` : 'N/A';
    const topFields = Array.from(fields).slice(0, 5).join(', ');

    mdContent += `| ${file} | SÍ | ${sizeMB.toFixed(2)} | ${featureCount} | ${Array.from(geomTypes).join(', ')} | ${bboxStr} | ${topFields} | ${renderableStatus} |\n`;

    stats.push({
      id: file.replace('.geojson', '').replace('.public', '').replace('.light', ''),
      path: `/data/sanitized/${file}`,
      exists: true,
      sizeMB: parseFloat(sizeMB.toFixed(2)),
      featureCount,
      geometryTypes: Array.from(geomTypes),
      bbox,
      renderable: isRenderable
    });
  }

  fs.writeFileSync(REPORT_MD_PATH, mdContent);
  console.log(`Reporte guardado en: ${REPORT_MD_PATH}`);

  const tsContent = `// GENERATED FILE - DO NOT EDIT MANUALLY\nexport const sanitizedLayerStats = {\n  generatedAt: "${new Date().toISOString()}",\n  layers: ${JSON.stringify(stats, null, 2)}\n};\n`;
  fs.writeFileSync(STATS_TS_PATH, tsContent);
  console.log(`Stats guardados en: ${STATS_TS_PATH}`);
}

main().catch(console.error);
