 
import { ZonePriorityBreakdown, computeZonePriority } from "./priorityModel";
import * as turf from "@turf/turf";

export type ProcessedSubmission = {
  id: string;
  timestamp: string;
  theme: string[];
  zoneId: string | null;
  zoneName: string;
  text: string;
  category: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  isSensitive: boolean;
};

export type CareRecommendation = {
  id: string;
  title: string;
  description: string;
  ethicalNote: string;
};


export function detectThemes(text: string): string[] {
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const detected: string[] = [];

  if (normalized.includes("iluminacion") || normalized.includes("luz") || normalized.includes("oscuro")) {
    detected.push("iluminacion");
  }
  if (normalized.includes("soledad") || normalized.includes("sola")) {
    detected.push("soledad");
  }
  if (normalized.includes("acompanamiento") || normalized.includes("apoyo")) {
    detected.push("acompanamiento");
  }
  if (normalized.includes("acceso cerrado") || normalized.includes("reja") || normalized.includes("puerta")) {
    detected.push("acceso_cerrado");
  }
  if (normalized.includes("transporte") || normalized.includes("mototaxi") || normalized.includes("camion")) {
    detected.push("transporte");
  }
  if (normalized.includes("evitada") || normalized.includes("evitar") || normalized.includes("miedo")) {
    detected.push("ruta_evitada");
  }
  if (normalized.includes("apoyo informal") || normalized.includes("tiendita") || normalized.includes("comercio")) {
    detected.push("punto_apoyo");
  }
  if (normalized.includes("mejora") || normalized.includes("sugerencia") || normalized.includes("recomienda")) {
    detected.push("mejora");
  }
  if (normalized.includes("testimonio") || normalized.includes("vivi") || normalized.includes("paso")) {
    detected.push("testimonio");
  }

  // fallback to testimony if nothing else detected
  if (detected.length === 0) {
    detected.push("testimonio");
  }
  return detected;
}

export function assignToZone(
  geometry: { type: "Point"; coordinates: [number, number] },
  selectedZone: string | null,
  zonesFeatureCollection: any
): string | null {
  if (!geometry || !geometry.coordinates) {
    return selectedZone;
  }
  
  const pt = turf.point(geometry.coordinates);
  const zones = zonesFeatureCollection?.features || [];

  for (const z of zones) {
    if (z.geometry) {
      try {
        if (z.geometry.type === "Polygon" || z.geometry.type === "MultiPolygon") {
          const poly = turf.polygon(z.geometry.coordinates);
          if (turf.booleanPointInPolygon(pt, poly)) {
            return z.properties?.zona || z.properties?.displayName || null;
          }
        }
      } catch (err) {
        // console.error("Error in point-in-polygon check", err);
      }
    }
  }

  return selectedZone;
}

export function processSubmission(input: {
  text: string;
  category: string;
  coordinates: [number, number];
  selectedZone: string | null;
  zonesFeatureCollection: any;
}): ProcessedSubmission {
  const text = input.text;
  const category = input.category;
  const geometry: { type: "Point"; coordinates: [number, number] } = {
    type: "Point",
    coordinates: input.coordinates,
  };

  // Detect sensitive content
  const normalized = text.toLowerCase();
  const isSensitive =
    normalized.includes("bano") ||
    normalized.includes("baño") ||
    normalized.includes("residencia") ||
    normalized.includes("cuarto") ||
    normalized.includes("casa") ||
    normalized.includes("habitacion") ||
    normalized.includes("habitación") ||
    normalized.includes("agresion") ||
    normalized.includes("agresión");

  const zoneName = assignToZone(geometry, input.selectedZone, input.zonesFeatureCollection) || "UNIVERSIDAD AUTONOMA CHAPINGO";
  const themesDetected = detectThemes(text);

  const processed: ProcessedSubmission = {
    id: `sub_${Date.now()}`,
    timestamp: new Date().toISOString(),
    theme: themesDetected,
    zoneId: zoneName,
    zoneName,
    text,
    category,
    geometry,
    isSensitive,
  };

  // Save to localStorage
  const saved = localStorage.getItem("ecoFemSubmissions");
  const submissions = saved ? JSON.parse(saved) : [];
  submissions.push(processed);
  localStorage.setItem("ecoFemSubmissions", JSON.stringify(submissions));

  return processed;
}

export function updateZoneSignals(_zoneId: string): void {
  // Can be used to trigger updates
}

export function recomputePriority(
  zoneName: string,
  baseSurveyScore: number | null,
  baseQualScore: number | null
): ZonePriorityBreakdown {
  // Retrieve submissions matching zone
  const saved = localStorage.getItem("ecoFemSubmissions");
  const submissions: ProcessedSubmission[] = saved ? JSON.parse(saved) : [];
  const zoneSubmissions = submissions.filter(s => s.zoneName.toLowerCase() === zoneName.toLowerCase());

  // Participatory score is calculated based on quantity of submissions
  const feedbackScore = Math.min(100, zoneSubmissions.length * 15);

  return computeZonePriority(zoneName, zoneName, {
    quantitativeSurveyScore: baseSurveyScore,
    qualitativeTestimonyScore: baseQualScore,
    documentaryEvidenceScore: zoneSubmissions.some(s => s.category === "documento") ? 60 : 20,
    protectedSignalsScore: zoneSubmissions.filter(s => s.isSensitive).length * 10,
    participatoryFeedbackScore: feedbackScore,
    mobilityConnectivityScore: 40,
  });
}

export function buildFeedbackRecommendation(zoneName: string): CareRecommendation[] {
  const saved = localStorage.getItem("ecoFemSubmissions");
  const submissions: ProcessedSubmission[] = saved ? JSON.parse(saved) : [];
  const zoneSubmissions = submissions.filter(s => s.zoneName.toLowerCase() === zoneName.toLowerCase());

  const recs: CareRecommendation[] = [];

  if (zoneSubmissions.length > 0) {
    recs.push({
      id: `rec_fb_1_${zoneName}`,
      title: "Ampliar validación comunitaria por aportaciones",
      description: `Se registran ${zoneSubmissions.length} reportes participativos sobre factores locales. Es crucial organizar recorridos grupales para contrastar estos señalamientos.`,
      ethicalNote: "Las aportaciones locales se mantienen agrupadas por privacidad.",
    });
  }

  return recs;
}
