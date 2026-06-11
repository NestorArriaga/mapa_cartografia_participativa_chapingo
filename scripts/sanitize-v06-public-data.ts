import fs from 'fs';
import path from 'path';

const V06_PACKAGE_DIR = '/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/chapingo_web_v06_final_nodos_integrados_20260610_123131';
const PROJECT_DIR = '/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach';
const SANITIZED_DIR = path.join(PROJECT_DIR, 'public', 'data', 'sanitized');
const DOCS_DIR = path.join(PROJECT_DIR, 'docs', 'fase-final');

const SENSITIVE_TERMS = [
  'internado', 'residencia', 'residencias', 'dormitorio', 'dormitorios',
  'baño', 'baños', 'cuarto', 'casa de compañera', 'compañera', 'vivienda',
  'apoyo informal', 'denuncia individual', 'testimonio crudo',
  'violación', 'abuso', 'teléfono', 'correo', 'matrícula'
];

interface Feature {
  type: string;
  properties: any;
  geometry: any;
}

interface ExcludedFeatureInfo {
  layerName: string;
  reason: string;
  matchedTerms: string[];
  propertiesSnapshot: any;
}

async function run() {
  console.log('--- Iniciando Sanitización de Datos (v06 -> sanitized) ---');

  if (!fs.existsSync(SANITIZED_DIR)) {
    fs.mkdirSync(SANITIZED_DIR, { recursive: true });
  }
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  const excludedFeatures: ExcludedFeatureInfo[] = [];
  const layerRegistryItems: any[] = [];

  const foldersToProcess = [
    '01_web_publico_core',
    '02_web_publico_nodos',
    '03_web_contexto_movilidad'
  ];

  for (const folder of foldersToProcess) {
    const folderPath = path.join(V06_PACKAGE_DIR, folder);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.geojson'));

    for (const file of files) {
      if (file === 'vias_contexto_movilidad_v06.geojson') {
        console.log(`\n[Skip] El archivo ${file} es demasiado grande (4.3 GB). Será procesado por create-lightweight-mobility-layer.ts`);
        // We still register it but mark as disabled
        layerRegistryItems.push({
          id: 'vias_contexto_movilidad_v06',
          name: 'Vías de contexto movilidad',
          group: folder,
          publicPath: '/data/sanitized/vias_contexto_movilidad.light.geojson',
          visibleDefault: false,
          canShowOnPublicMap: false,
          loadStrategy: 'disabled_too_large',
          geometryType: 'LineString',
          description: 'Capa original es de 4.3GB. Se usa versión ligera recortada por bounding box.'
        });
        continue;
      }

      console.log(`\nProcesando: ${file}`);
      const rawData = fs.readFileSync(path.join(folderPath, file), 'utf-8');
      let geojson;
      try {
        geojson = JSON.parse(rawData);
      } catch(e) {
        console.error(`Error parsing ${file}`);
        continue;
      }

      const features: Feature[] = geojson.features || [];
      const sanitizedFeatures: Feature[] = [];
      let removedCount = 0;

      for (const feature of features) {
        const props = feature.properties || {};
        let isSensitive = false;
        let reason = '';
        const matchedTerms: string[] = [];

        // 1. Check explicit flags
        const nivelUso = String(props.nivel_uso || '').toLowerCase();
        if (nivelUso.includes('04_no_publicar') || nivelUso.includes('sensible')) {
          isSensitive = true;
          reason = `nivel_uso contiene '${nivelUso}'`;
        } else if (String(props.publicable).toLowerCase() === 'false' || String(props.publicable) === '0') {
          isSensitive = true;
          reason = 'publicable = false';
        } else if (String(props.estado).toLowerCase() === 'sensible') {
          isSensitive = true;
          reason = 'estado = sensible';
        } else if (String(props.sensible).toLowerCase() === 'true' || props.sensible === true) {
          isSensitive = true;
          reason = 'sensible = true';
        }

        // 2. Check categories/types
        const cat = String(props.categoria || '').toLowerCase();
        const tipo = String(props.tipo || '').toLowerCase();
        if (cat === 'sensible' || cat === 'apoyo_informal' || tipo === 'sensible' || tipo === 'apoyo_informal') {
          isSensitive = true;
          reason = `categoría o tipo sensible ('${cat}', '${tipo}')`;
        }

        // 3. Regex SENSITIVE_TERMS matching in text fields
        const textToSearch = [
          String(props.nombre || ''),
          String(props.resumen || ''),
          String(props.popup || ''),
          String(props.nota || ''),
          String(props.titulo || '')
        ].join(' ').toLowerCase();

        for (const term of SENSITIVE_TERMS) {
          if (textToSearch.includes(term.toLowerCase())) {
            isSensitive = true;
            matchedTerms.push(term);
          }
        }

        if (isSensitive) {
          removedCount++;
          if (!reason && matchedTerms.length > 0) {
            reason = 'Términos sensibles encontrados en texto';
          }
          
          // Scrub coordinates before logging
          const safeProps = { ...props };
          delete safeProps.coords;
          
          excludedFeatures.push({
            layerName: file,
            reason,
            matchedTerms,
            propertiesSnapshot: safeProps
          });
        } else {
          sanitizedFeatures.push(feature);
        }
      }

      // Output sanitized geojson
      const sanitizedFilename = file.replace('_v06', '').replace('.geojson', '.public.geojson');
      const sanitizedPath = path.join(SANITIZED_DIR, sanitizedFilename);
      
      const sanitizedGeojson = {
        ...geojson,
        features: sanitizedFeatures
      };

      fs.writeFileSync(sanitizedPath, JSON.stringify(sanitizedGeojson, null, 2));
      console.log(`   -> Sanitizado: Conservadas ${sanitizedFeatures.length}, Eliminadas ${removedCount}. Archivo: ${sanitizedFilename}`);

      // Register the layer
      let geomType = 'Point';
      if (sanitizedFeatures.length > 0) {
        geomType = sanitizedFeatures[0].geometry?.type || 'Point';
      }

      layerRegistryItems.push({
        id: file.replace('.geojson', ''),
        name: file.replace('_v06.geojson', '').replace(/_/g, ' '),
        group: folder,
        publicPath: `/data/sanitized/${sanitizedFilename}`,
        visibleDefault: folder === '01_web_publico_core' || folder === '02_web_publico_nodos',
        canShowOnPublicMap: true,
        loadStrategy: 'immediate',
        geometryType: geomType,
        description: 'Sanitized public layer'
      });
    }
  }

  // --- Generate Reports ---
  const reportJsonPath = path.join(DOCS_DIR, 'sanitization-excluded-features.json');
  fs.writeFileSync(reportJsonPath, JSON.stringify(excludedFeatures, null, 2));

  const reportMdPath = path.join(DOCS_DIR, 'sanitization-excluded-features.md');
  const mdContent = [
    '# Reporte de Sanitización y Exclusión de Datos',
    `Generado: ${new Date().toISOString()}`,
    '',
    'Este documento detalla las features que fueron **excluidas** de los GeoJSON públicos durante el proceso automático de sanitización, cumpliendo con los protocolos éticos del proyecto.',
    '',
    `**Total de features excluidas:** ${excludedFeatures.length}`,
    '',
    '## Resumen por Capa',
    ...Object.entries(
      excludedFeatures.reduce((acc, curr) => {
        acc[curr.layerName] = (acc[curr.layerName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([layer, count]) => `- **${layer}**: ${count} features`),
    '',
    '## Detalles de Exclusión (Datos Seguros)',
    '*(Nota: Las coordenadas espaciales han sido eliminadas de este reporte)*',
    '',
    ...excludedFeatures.map((ex, i) => `
### Feature Excluida #${i + 1}
- **Capa origen:** ${ex.layerName}
- **Razón principal:** ${ex.reason}
- **Términos identificados:** ${ex.matchedTerms.join(', ') || 'N/A'}
- **Identificador (zona/node_id):** ${ex.propertiesSnapshot.zona || ex.propertiesSnapshot.node_id || 'N/A'}
- **Nivel de uso:** ${ex.propertiesSnapshot.nivel_uso || 'N/A'}
- **Categoría:** ${ex.propertiesSnapshot.categoria || 'N/A'}
`).slice(0, 100),
    excludedFeatures.length > 100 ? '\n*(Reporte truncado a 100 registros. Ver .json completo)*\n' : ''
  ].join('\n');

  fs.writeFileSync(reportMdPath, mdContent);
  console.log(`\nReporte de sanitización generado en: ${reportMdPath}`);

  // --- Generate Registry ---
  const registryTsPath = path.join(PROJECT_DIR, 'src', 'data', 'layerRegistry.sanitized.generated.ts');
  const tsContent = `// GENERATED FILE - DO NOT EDIT MANUALLY
// Created by scripts/sanitize-v06-public-data.ts

import { WebLayerRegistryItem } from '../types/layers';

export const layerRegistry: WebLayerRegistryItem[] = ${JSON.stringify(layerRegistryItems, null, 2)};
`;
  fs.writeFileSync(registryTsPath, tsContent);
  console.log(`Registry limpio generado en: ${registryTsPath}`);

  const manifestJsonPath = path.join(SANITIZED_DIR, 'layer-manifest.sanitized.json');
  fs.writeFileSync(manifestJsonPath, JSON.stringify(layerRegistryItems, null, 2));

  console.log('\n✅ Sanitización completada exitosamente.');
}

run().catch(console.error);
