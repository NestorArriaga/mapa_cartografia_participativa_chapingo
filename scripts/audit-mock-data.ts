import fs from 'fs';
import path from 'path';

const PROJECT_DIR = '/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach';
const DIRS_TO_SCAN = ['src/components', 'src/lib', 'src/stores', 'src/data'];

const SUSPICIOUS_TERMS = [
  'mock', 'dummy', 'fake', 'lorem', 'sample', 'placeholder', 'hardcoded', 'TODO data', 'ejemplo'
];

interface MockDataFinding {
  file: string;
  lineNum: number;
  lineContent: string;
  matchedTerm: string;
}

function scanDirectory(dir: string, findings: MockDataFinding[]) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, findings);
    } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
      
      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        for (const term of SUSPICIOUS_TERMS) {
          if (lowerLine.includes(term.toLowerCase())) {
            findings.push({
              file: fullPath.replace(PROJECT_DIR, ''),
              lineNum: index + 1,
              lineContent: line.trim(),
              matchedTerm: term
            });
            break; // Move to next line
          }
        }
      });
    }
  }
}

function run() {
  console.log('--- Iniciando Auditoría de Datos Mock ---');
  const findings: MockDataFinding[] = [];

  for (const dir of DIRS_TO_SCAN) {
    scanDirectory(path.join(PROJECT_DIR, dir), findings);
  }

  const REPORT_FILE = path.join(PROJECT_DIR, 'docs', 'fase-final', 'mock-data-audit.md');
  const mdContent = `# Auditoría de Datos Mock y Hardcodeados

Generado: ${new Date().toISOString()}

Esta auditoría busca términos como ${SUSPICIOUS_TERMS.join(', ')} para asegurar que la aplicación utilice datos reales del paquete v06 en lugar de placeholders.

## Resultados

Se encontraron ${findings.length} coincidencias sospechosas.

${findings.length === 0 ? '> **¡Excelente! No se detectaron datos mock en el código fuente escaneado.**' : ''}

${findings.map(f => `### ${f.file}:${f.lineNum} (Match: "${f.matchedTerm}")
\`\`\`typescript
${f.lineContent}
\`\`\`
`).join('\n')}
`;

  fs.writeFileSync(REPORT_FILE, mdContent);
  console.log(`Auditoría completada. Se encontraron ${findings.length} coincidencias.`);
  console.log(`Reporte guardado en: ${REPORT_FILE}`);
}

run();
