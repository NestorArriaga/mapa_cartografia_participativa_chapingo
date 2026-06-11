import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Using commonjs/ESM interop. In vite env we can use this trick if type=module.
// As it's a script we run with ts-node or tsx, we can use __dirname if we configure it, or import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_PACKAGE_DIR = '/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/chapingo_web_v06_final_nodos_integrados_20260610_123131';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(PROJECT_ROOT, 'public', 'data');
const LAYER_REGISTRY_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'layerRegistry.generated.ts');
const MANIFEST_JSON_PATH = path.join(PUBLIC_DATA_DIR, 'layer-manifest.generated.json');

// Ensure output dirs exist
if (!fs.existsSync(PUBLIC_DATA_DIR)) {
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
}
const SRC_DATA_DIR = path.join(PROJECT_ROOT, 'src', 'data');
if (!fs.existsSync(SRC_DATA_DIR)) {
  fs.mkdirSync(SRC_DATA_DIR, { recursive: true });
}

import { WebLayerRegistryItem, LayerPublicStatus } from '../src/types/layers';

function getFileGeometryType(filePath: string): WebLayerRegistryItem["geometryType"] {
  // A crude approximation. In a real app we might parse the GeoJSON to find the actual geometry.
  // For now we'll guess "Unknown" and it can be updated if we read the file.
  if (filePath.endsWith('.csv')) return 'Table';
  if (filePath.endsWith('.json') || filePath.endsWith('.geojson')) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (content.features && content.features.length > 0 && content.features[0].geometry) {
        return content.features[0].geometry.type as any;
      }
    } catch(e) {
      // Ignore
    }
  }
  return 'Unknown';
}

function processDirectory() {
  const registry: WebLayerRegistryItem[] = [];
  
  const foldersToProcess = [
    { name: '01_web_publico_core', status: 'PUBLIC_CORE' as LayerPublicStatus, public: true },
    { name: '02_web_publico_nodos', status: 'PUBLIC_NODES' as LayerPublicStatus, public: true },
    { name: '03_web_contexto_movilidad', status: 'PUBLIC_MOBILITY_CONTEXT' as LayerPublicStatus, public: true },
    { name: '04_revision_controlada', status: 'REVISION_CONTROLLED' as LayerPublicStatus, public: false },
    { name: '05_no_publicar_sensible', status: 'SENSITIVE_NO_PUBLIC' as LayerPublicStatus, public: false },
    { name: '06_manifest_documentacion', status: 'DOCUMENTATION' as LayerPublicStatus, public: true },
    { name: '07_estilos_qgis_qml', status: 'STYLE_ONLY' as LayerPublicStatus, public: false }
  ];

  foldersToProcess.forEach(folder => {
    const dirPath = path.join(SOURCE_PACKAGE_DIR, folder.name);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      // Ignore hidden files like .DS_Store
      if (file.startsWith('.')) return;
      
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) return;

      const id = file.replace(/\.[^/.]+$/, ""); // remove extension
      const ext = path.extname(file).toLowerCase();
      
      let canShowOnPublicMap = false;
      let visibleDefault = false;
      let canUseInAdminPanel = false;
      let canUseForPopup = false;
      let canUseForMetrics = false;
      let ethicalRule = "";
      let publicPath: string | undefined = undefined;

      if (folder.name === '01_web_publico_core') {
        canShowOnPublicMap = true;
        visibleDefault = true;
        canUseInAdminPanel = true;
      } else if (folder.name === '02_web_publico_nodos') {
        canShowOnPublicMap = true;
        visibleDefault = true;
        canUseInAdminPanel = true;
      } else if (folder.name === '03_web_contexto_movilidad') {
        canShowOnPublicMap = true;
        visibleDefault = true;
        canUseInAdminPanel = true;
      } else if (folder.name === '04_revision_controlada') {
        canShowOnPublicMap = false;
        visibleDefault = false;
        canUseInAdminPanel = true;
      } else if (folder.name === '05_no_publicar_sensible') {
        canShowOnPublicMap = false;
        visibleDefault = false;
        canUseInAdminPanel = false;
        ethicalRule = "NO EXPONER EN MAPA PÚBLICO";
      } else if (folder.name === '06_manifest_documentacion') {
        canUseForPopup = true;
        canUseForMetrics = true;
      }

      if (folder.public && (ext === '.geojson' || ext === '.json' || ext === '.csv' || ext === '.md')) {
        // Copy safe files to public directory
        const destPath = path.join(PUBLIC_DATA_DIR, file);
        fs.copyFileSync(filePath, destPath);
        publicPath = `/data/${file}`;
      }

      const item: WebLayerRegistryItem = {
        id,
        name: id.replace(/_/g, ' '),
        fileName: file,
        sourcePath: filePath,
        publicPath,
        sourceFolder: folder.name,
        group: folder.name.replace(/^\d+_/, ''), // Remove prefix like "01_"
        geometryType: getFileGeometryType(filePath),
        publicStatus: folder.status,
        canShowOnPublicMap,
        canUseInAdminPanel,
        canUseForPopup,
        canUseForMetrics,
        visibleDefault,
        ethicalRule,
        description: `Capa generada desde ${folder.name}`
      };

      registry.push(item);
    });
  });

  // Write Registry TS
  const tsContent = `// GENERADO AUTOMÁTICAMENTE. NO EDITAR.
import { WebLayerRegistryItem } from '../types/layers';

export const layerRegistry: WebLayerRegistryItem[] = ${JSON.stringify(registry, null, 2)};
`;
  fs.writeFileSync(LAYER_REGISTRY_PATH, tsContent, 'utf-8');

  // Write Manifest JSON
  fs.writeFileSync(MANIFEST_JSON_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    layers: registry
  }, null, 2), 'utf-8');

  console.log(`✅ Escaneo completado. ${registry.length} capas registradas.`);
  console.log(`📁 Registros guardados en: ${LAYER_REGISTRY_PATH}`);
  console.log(`📁 Manifiesto guardado en: ${MANIFEST_JSON_PATH}`);
}

processDirectory();
