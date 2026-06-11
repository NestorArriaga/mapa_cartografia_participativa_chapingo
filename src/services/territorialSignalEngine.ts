 
import { computeNodeIntelligence } from "./nodeIntelligenceEngine";

export type TerritorialSignal = {
  id: string;
  coords: [number, number];
  intensity: number;
  category: string;
  radius: number;
  color: string;
  isEmergent: boolean;
};

export function extractTerritorialSignals(nodesGeoJson: any): TerritorialSignal[] {
  if (!nodesGeoJson || !nodesGeoJson.features) return [];
  
  return nodesGeoJson.features.map((f: any) => {
    const profile = computeNodeIntelligence(f.properties);
    return {
      id: f.properties.id || f.properties.nodo_id || Math.random().toString(),
      coords: f.geometry.coordinates,
      intensity: f.properties.intensity || 1,
      category: profile.categoryLabel,
      radius: profile.auraIntensity * 100, // meters for spatial query mapping
      color: profile.auraColor,
      isEmergent: (f.properties.intensity || 0) > 3
    };
  });
}

export function getSignalsByZone(zoneName: string) {
  // Demo mock data based on zone
  if (!zoneName) return [];
  
  if (zoneName.toLowerCase().includes("boyeros")) {
    return [
      {
        id: "s1",
        title: "Poca Iluminación Nocturna",
        confidence: "alta",
        summary: "Múltiples testimonios de estudiantes indican que a partir de las 18:30 el sendero principal carece de luz.",
        ethicalNote: "Relatos directos de acoso han sido ocultados, solo se muestra el patrón ambiental.",
        source: "cualitativo"
      },
      {
        id: "s2",
        title: "Percepción de Aislamiento",
        confidence: "media",
        summary: "Ausencia de comercios o casas abiertas que ofrezcan apoyo informal en caso de emergencia.",
        ethicalNote: "Basado en entrevistas cualitativas agregadas.",
        source: "cualitativo"
      }
    ];
  }

  return [
    {
      id: "s_gen",
      title: "Señal Territorial Base",
      confidence: "media",
      summary: "Registros espaciales generales de la zona.",
      ethicalNote: "No contiene datos sensibles personales.",
      source: "documental"
    }
  ];
}
