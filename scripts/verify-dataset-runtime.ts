import * as fs from "fs";
import * as path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const DATA_DIR = path.join(PUBLIC_DIR, "data");
const SANITIZED_DIR = path.join(DATA_DIR, "sanitized");
const OUTPUT_REPORT_PATH = path.join(process.cwd(), "docs", "blank-screen-fix", "01_DATASET_RUNTIME_CHECK.md");

interface CheckResult {
  file: string;
  exists: boolean;
  sizeMb: number;
  validJson: boolean;
  isFeatureCollection: boolean;
  hasFeaturesArray: boolean;
  bboxValid: boolean;
  errors: string[];
}

function checkFile(filePath: string, publicPathPrefix: string): CheckResult {
  const result: CheckResult = {
    file: publicPathPrefix,
    exists: false,
    sizeMb: 0,
    validJson: false,
    isFeatureCollection: true, // assume true until proven otherwise
    hasFeaturesArray: true,
    bboxValid: true,
    errors: []
  };

  if (!fs.existsSync(filePath)) {
    result.errors.push("File does not exist.");
    return result;
  }

  result.exists = true;
  const stats = fs.statSync(filePath);
  result.sizeMb = stats.size / (1024 * 1024);

  if (result.sizeMb > 25) {
    result.errors.push(`File exceeds 25 MB limit (${result.sizeMb.toFixed(2)} MB).`);
  }

  try {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(rawContent);
    result.validJson = true;

    // Check if it's aggregated or single layer
    if (json.publicLayers) {
      // Aggregated format
      if (json.bbox) {
        if (!Array.isArray(json.bbox) || json.bbox.length !== 4) {
          result.bboxValid = false;
          result.errors.push("Invalid aggregated bbox format (must be array of 4 elements).");
        }
      }
      for (const layerKey of Object.keys(json.publicLayers)) {
        const layer = json.publicLayers[layerKey];
        if (layer.type !== "FeatureCollection") {
          result.isFeatureCollection = false;
          result.errors.push(`Layer "${layerKey}" type is not "FeatureCollection"`);
        }
        if (!Array.isArray(layer.features)) {
          result.hasFeaturesArray = false;
          result.errors.push(`Layer "${layerKey}" does not have a "features" array`);
        }
      }
    } else {
      // Single geojson format
      if (json.type !== "FeatureCollection") {
        result.isFeatureCollection = false;
        result.errors.push("Root type is not FeatureCollection.");
      }
      if (!Array.isArray(json.features)) {
        result.hasFeaturesArray = false;
        result.errors.push("Missing 'features' array.");
      }
    }
  } catch (err: any) {
    result.validJson = false;
    result.errors.push(`JSON parsing failed: ${err.message}`);
  }

  return result;
}

function runVerification() {
  const reports: CheckResult[] = [];

  // 1. check academic dataset
  reports.push(checkFile(path.join(DATA_DIR, "mapvivo.academic.dataset.json"), "/data/mapvivo.academic.dataset.json"));

  // 2. check public dataset
  reports.push(checkFile(path.join(DATA_DIR, "mapvivo.dataset.json"), "/data/mapvivo.dataset.json"));

  // 3. check sanitized files if any
  if (fs.existsSync(SANITIZED_DIR)) {
    const sanitizedFiles = fs.readdirSync(SANITIZED_DIR).filter(f => f.endsWith(".geojson"));
    for (const file of sanitizedFiles) {
      reports.push(checkFile(path.join(SANITIZED_DIR, file), `/data/sanitized/${file}`));
    }
  }

  // Generate Markdown
  let md = `# Dataset Runtime Verification Check

Generated at: ${new Date().toISOString()}

## Aggregated Datasets status
`;

  const agg = reports.filter(r => r.file.includes("mapvivo.academic.dataset.json") || r.file.includes("mapvivo.dataset.json"));
  for (const r of agg) {
    md += `### File: \`${r.file}\`
* **Exists:** ${r.exists ? "✅ Yes" : "❌ No"}
* **Size:** ${r.sizeMb.toFixed(4)} MB
* **Valid JSON:** ${r.exists ? (r.validJson ? "✅ Yes" : "❌ No") : "N/A"}
* **Layers Valid (FeatureCollection + features):** ${r.exists && r.validJson ? (r.isFeatureCollection && r.hasFeaturesArray ? "✅ Yes" : "❌ No") : "N/A"}
* **BBox Valid:** ${r.exists && r.validJson ? (r.bboxValid ? "✅ Yes" : "❌ No") : "N/A"}
* **Errors:**
${r.errors.length > 0 ? r.errors.map(e => `  - ${e}`).join("\n") : "  - *None*"}

`;
  }

  md += `## Sanitized Individual Layers status
`;

  const san = reports.filter(r => r.file.includes("/data/sanitized/"));
  if (san.length === 0) {
    md += `*No individual sanitized geojson layers found.*\n`;
  } else {
    md += `| File | Exists | Size (MB) | Valid JSON | GeoJSON Structure | Errors |\n`;
    md += `| --- | --- | --- | --- | --- | --- |\n`;
    for (const r of san) {
      const statusIcon = r.exists && r.validJson && r.isFeatureCollection && r.hasFeaturesArray ? "✅" : "❌";
      md += `| \`${r.file}\` | ${r.exists ? "Yes" : "No"} | ${r.sizeMb.toFixed(4)} | ${r.validJson ? "Yes" : "No"} | ${r.isFeatureCollection && r.hasFeaturesArray ? "FeatureCollection" : "Invalid"} | ${r.errors.join("; ") || "None"} |\n`;
    }
  }

  // Summary recommendation
  const primaryAcademic = reports.find(r => r.file === "/data/mapvivo.academic.dataset.json");
  const fallbackPublic = reports.find(r => r.file === "/data/mapvivo.dataset.json");
  
  let resolution = "";
  if (primaryAcademic && primaryAcademic.exists && primaryAcademic.validJson && primaryAcademic.errors.length === 0) {
    resolution = "Using **Academic Dataset** as primary data source. Integrity verified successfully.";
  } else if (fallbackPublic && fallbackPublic.exists && fallbackPublic.validJson && fallbackPublic.errors.length === 0) {
    resolution = "Using **Public Dataset** as primary source. Academic dataset is missing or invalid.";
  } else {
    resolution = "Aggregated files invalid or missing. Using **individual fallback sanitized layers** from `/data/sanitized/`.";
  }

  md += `
## Resolution and Recommendation
${resolution}
`;

  // Write report
  const dir = path.dirname(OUTPUT_REPORT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_REPORT_PATH, md, "utf-8");
  console.log(`Verification report written to: ${OUTPUT_REPORT_PATH}`);
}

runVerification();
