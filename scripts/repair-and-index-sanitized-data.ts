import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public/data/sanitized');
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/data/sanitizedDataIndex.generated.ts');
const OUTPUT_JSON = path.resolve(PUBLIC_DIR, 'sanitized-data-index.json');
const REPORT_FILE = path.resolve(process.cwd(), 'docs/reparacion-total/01_INDICE_DATOS_SANITIZADOS.md');

type SanitizedLayerIndexItem = {
  id: string;
  displayName: string;
  fileName: string;
  publicPath: string;
  group: "territorial_reading" | "living_nodes" | "mobility" | "participation" | "documentation";
  geometryType: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon" | "Unknown";
  featureCount: number;
  bbox: [number, number, number, number] | null;
  sizeMB: number;
  visibleDefault: boolean;
  renderPriority: number;
  stylePreset: "zone_priority" | "documentary_nodes" | "orientation_nodes" | "mobility_lines" | "visual_connectors" | "evidence_polygons";
  ethicalVisibility: "public" | "public_aggregated";
  loadable: boolean;
  reasonIfNotLoadable?: string;
};

// Maps file names to human names and configurations
const CONFIG_MAP: Record<string, Partial<SanitizedLayerIndexItem>> = {
  'evidencia_documental_agregada_por_zona.public.geojson': {
    displayName: 'Evidencia agregada',
    group: 'documentation',
    stylePreset: 'evidence_polygons',
    visibleDefault: false,
    renderPriority: 2
  },
  'zonas_prioridad_integrada_o_indicadores.public.geojson': {
    displayName: 'Zonas de prioridad',
    group: 'territorial_reading',
    stylePreset: 'zone_priority',
    visibleDefault: true,
    renderPriority: 1
  },
  'nodos_documentales_publicos_agregados.public.geojson': {
    displayName: 'Nodos documentales',
    group: 'documentation',
    stylePreset: 'documentary_nodes',
    visibleDefault: false,
    renderPriority: 4
  },
  'nodos_orientacion_base.public.geojson': {
    displayName: 'Nodos de orientación',
    group: 'living_nodes',
    stylePreset: 'orientation_nodes',
    visibleDefault: true,
    renderPriority: 5
  },
  'conectores_visualizacion.public.geojson': {
    displayName: 'Conectores visuales',
    group: 'mobility',
    stylePreset: 'visual_connectors',
    visibleDefault: true,
    renderPriority: 6
  },
  'vias_contexto_movilidad.light.geojson': {
    displayName: 'Movilidad ligera',
    group: 'territorial_reading',
    stylePreset: 'mobility_lines',
    visibleDefault: true,
    renderPriority: 0
  },
  'trayectos_lectura.public.geojson': {
    displayName: 'Trayectos de lectura',
    group: 'mobility',
    stylePreset: 'mobility_lines',
    visibleDefault: true,
    renderPriority: 7
  }
};

function determineGeometryType(features: any[]): any {
  if (!features || features.length === 0) return 'Unknown';
  // Use first valid feature
  for (const f of features) {
    if (f.geometry && f.geometry.type) return f.geometry.type;
  }
  return 'Unknown';
}

function calculateBBox(features: any[]): [number, number, number, number] | null {
  if (!features || features.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  features.forEach(f => {
    if (!f.geometry) return;
    const coords = f.geometry.coordinates;
    const type = f.geometry.type;
    
    const updateBounds = (c: number[]) => {
      if (c[0] < minX) minX = c[0];
      if (c[1] < minY) minY = c[1];
      if (c[0] > maxX) maxX = c[0];
      if (c[1] > maxY) maxY = c[1];
    };

    if (type === 'Point') updateBounds(coords);
    if (type === 'LineString' || type === 'MultiPoint') coords.forEach(updateBounds);
    if (type === 'Polygon' || type === 'MultiLineString') coords.forEach((ring: any) => ring.forEach(updateBounds));
    if (type === 'MultiPolygon') coords.forEach((poly: any) => poly.forEach((ring: any) => ring.forEach(updateBounds)));
  });
  if (minX === Infinity) return null;
  return [minX, minY, maxX, maxY];
}

async function run() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`Dir no existe: ${PUBLIC_DIR}`);
    return;
  }

  const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.geojson'));
  const index: SanitizedLayerIndexItem[] = [];

  for (const file of files) {
    const filePath = path.join(PUBLIC_DIR, file);
    const stat = fs.statSync(filePath);
    const sizeMB = stat.size / (1024 * 1024);
    
    const conf = CONFIG_MAP[file] || {
      displayName: file.replace('.geojson', '').replace(/_v\d+/, '').replace(/_/g, ' '),
      group: 'documentation',
      stylePreset: 'documentary_nodes',
      visibleDefault: false,
      renderPriority: 10
    };

    let loadable = true;
    let reason = '';
    
    if (file.includes('05_no_publicar_sensible')) { loadable = false; reason = 'Archivo sensible'; }
    else if (file.includes('04_revision_controlada')) { loadable = false; reason = 'Archivo en revisión'; }
    else if (sizeMB > 25) { loadable = false; reason = 'Archivo mayor a 25MB'; }
    
    let featureCount = 0;
    let geometryType = 'Unknown';
    let bbox = null;

    if (loadable) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data.features) {
          featureCount = data.features.length;
          geometryType = determineGeometryType(data.features);
          bbox = calculateBBox(data.features);
          if (featureCount === 0) {
            loadable = false;
            reason = 'Archivo sin features';
          }
        } else {
          loadable = false;
          reason = 'No es un FeatureCollection válido';
        }
      } catch (e) {
        loadable = false;
        reason = 'JSON inválido';
      }
    }

    index.push({
      id: file.replace('.geojson', ''),
      fileName: file,
      displayName: conf.displayName as string,
      publicPath: `/data/sanitized/${file}`,
      group: conf.group as any,
      geometryType: geometryType as any,
      featureCount,
      bbox,
      sizeMB: Number(sizeMB.toFixed(2)),
      visibleDefault: conf.visibleDefault as boolean,
      renderPriority: conf.renderPriority as number,
      stylePreset: conf.stylePreset as any,
      ethicalVisibility: 'public',
      loadable,
      reasonIfNotLoadable: reason || undefined
    });
  }

  // Escribir TS
  fs.writeFileSync(OUTPUT_FILE, `// GENERADO AUTOMATICAMENTE
export type SanitizedLayerIndexItem = {
  id: string;
  displayName: string;
  fileName: string;
  publicPath: string;
  group: "territorial_reading" | "living_nodes" | "mobility" | "participation" | "documentation";
  geometryType: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon" | "Unknown";
  featureCount: number;
  bbox: [number, number, number, number] | null;
  sizeMB: number;
  visibleDefault: boolean;
  renderPriority: number;
  stylePreset: "zone_priority" | "documentary_nodes" | "orientation_nodes" | "mobility_lines" | "visual_connectors" | "evidence_polygons";
  ethicalVisibility: "public" | "public_aggregated";
  loadable: boolean;
  reasonIfNotLoadable?: string;
};

export const SANITIZED_DATA_INDEX: SanitizedLayerIndexItem[] = ${JSON.stringify(index, null, 2)};
`);

  // Escribir JSON
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(index, null, 2));

  // Generar reporte
  let md = `# Índice de Datos Sanitizados\n\n`;
  md += `| Capa | Archivo | Features | Geometría | Peso | BBox | Visible | Estado |\n`;
  md += `| ---- | ------- | -------: | --------- | ---: | ---- | ------- | ------ |\n`;
  
  index.sort((a, b) => a.renderPriority - b.renderPriority).forEach(i => {
    md += `| ${i.displayName} | \`${i.fileName}\` | ${i.featureCount} | ${i.geometryType} | ${i.sizeMB}MB | ${i.bbox ? 'OK' : 'N/A'} | ${i.visibleDefault} | ${i.loadable ? 'OK' : 'Bloqueado: ' + i.reasonIfNotLoadable} |\n`;
  });

  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, md);
  
  console.log('Indice generado exitosamente.');
}

run().catch(console.error);
