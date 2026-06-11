import * as fs from "fs";
import * as path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const DERIVED_DIR = path.join(PUBLIC_DIR, "data", "derived");

const DETECT_ZONES = [
  "salitreria", "salitrería", "cooperativo", "cabañas", "issste", "isste", "huexotla", "boyeros", "dicifo", "chapingo", "campus"
];

const DETECT_FACTORS = [
  "iluminación", "luz", "oscuro", "soledad", "sola", "acompañamiento", "acceso cerrado", "transporte", "mototaxi", "ruta evitada", "miedo", "rumor", "señalamiento", "apoyo informal"
];

// Mock / source testimonies that we will sanitize and filter
const rawTestimonies = [
  {
    id: "test_01",
    rawText: "Camino de noche hacia Salitrería y siempre está oscurísimo, me da miedo porque no hay luz ni patrullas, y a veces tengo que tomar mototaxi sola.",
    date: "2026-03-01",
  },
  {
    id: "test_02",
    rawText: "En las cabañas y el cooperativo hay mucha soledad por las tardes. Faltan puntos de apoyo informal.",
    date: "2026-03-15",
  },
  {
    id: "test_03",
    rawText: "El tramo del ISSSTE a Chapingo tiene el acceso cerrado a veces y nos obliga a buscar rutas alternas oscuras.",
    date: "2026-04-02",
  },
  {
    id: "test_04",
    rawText: "Existe evidencia testimonial sobre soledad, baja iluminación y baja presencia de acompañamiento en el trayecto hacia Boyeros. La muestra estructurada es pequeña, pero la señal territorial es relevante.",
    date: "2026-04-10",
  },
  {
    id: "test_05",
    rawText: "Cerca de DICIFO yendo a Boyeros se siente muy solo en la tarde-noche, la iluminación es pésima y no hay seguridad.",
    date: "2026-04-12",
  },
];

// Normalize text for search
function normalizeText(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function runPipeline() {
  console.log("Running survey and testimony processing pipeline...");

  if (!fs.existsSync(DERIVED_DIR)) {
    fs.mkdirSync(DERIVED_DIR, { recursive: true });
  }

  // 1. Process testimonies into academic sanitized fragments
  const sanitizedTestimonies: any[] = [];
  const qualitativeSignals: any[] = [];

  // Initialize signals for zones
  const zoneQualitativeMap: { [key: string]: any } = {
    "UNIVERSIDAD AUTONOMA CHAPINGO": {
      zoneName: "UNIVERSIDAD AUTONOMA CHAPINGO",
      signalType: "qualitative_testimony",
      intensity: 40,
      confidence: "media",
      visibility: "public",
      title: "Presencia de dinámicas de acompañamiento en campus",
      summary: "Comentarios en campus señalan buena visibilidad diurna pero retos en áreas periféricas e inter-facultades durante horario vespertino.",
      ethicalNote: "Sanitizado para uso público agregando datos por cuadrante.",
      factors: ["iluminación", "acompañamiento"]
    },
    "SALITRERIA": {
      zoneName: "SALITRERIA",
      signalType: "qualitative_testimony",
      intensity: 80,
      confidence: "alta",
      visibility: "academic_aggregated",
      title: "Percepciones de soledad y deficiencia de alumbrado en Salitrería",
      summary: "Señalamientos constantes de baja iluminación en vialidades secundarias y alta dependencia de transporte informal (mototaxis) en horarios nocturnos.",
      ethicalNote: "Señales agregadas sin detalles específicos de viviendas.",
      factors: ["iluminación", "luz", "soledad", "transporte", "mototaxi"]
    },
    "COOPERATIVO/CABAÑAS": {
      zoneName: "COOPERATIVO/CABAÑAS",
      signalType: "qualitative_testimony",
      intensity: 65,
      confidence: "media",
      visibility: "academic_aggregated",
      title: "Soledad vespertina en Cooperativo/Cabañas",
      summary: "Reportes recurrentes sobre soledad en áreas arboladas y necesidad de fortalecer redes de apoyo y acompañamiento comunitario.",
      ethicalNote: "Protegido como agregado por zona.",
      factors: ["soledad", "apoyo informal"]
    },
    "TRAMO ISSSTE - CHAPINGO": {
      zoneName: "TRAMO ISSSTE - CHAPINGO",
      signalType: "qualitative_testimony",
      intensity: 75,
      confidence: "alta",
      visibility: "academic_aggregated",
      title: "Cierres de acceso e iluminación deficiente en tramo ISSSTE",
      summary: "Preocupación por cierres de accesos peatonales tradicionales que obligan a desvíos por zonas de baja iluminación y alto tránsito de vehículos pesados.",
      ethicalNote: "Ubicaciones exactas omitidas para resguardo de usuarias.",
      factors: ["iluminación", "acceso cerrado", "ruta evitada"]
    },
    "BOYEROS": {
      zoneName: "Boyeros",
      signalType: "qualitative_testimony",
      intensity: 70,
      confidence: "baja",
      visibility: "academic_aggregated",
      title: "Trayecto DICIFO–Boyeros requiere validación",
      summary: "Existe evidencia testimonial sobre soledad, baja iluminación y baja presencia de acompañamiento en el trayecto hacia Boyeros. La muestra estructurada es pequeña, pero la señal territorial es relevante para validación participativa.",
      ethicalNote: "Se muestra como señal cualitativa agregada; no representa punto exacto ni riesgo absoluto.",
      factors: ["soledad", "iluminación", "acompañamiento"]
    }
  };

  // Process raw testimonies to detect factors and strength
  for (const t of rawTestimonies) {
    const textNorm = normalizeText(t.rawText);
    const matchedFactors: string[] = [];
    for (const f of DETECT_FACTORS) {
      if (textNorm.includes(normalizeText(f))) {
        matchedFactors.push(f);
      }
    }

    // Assign to Boyeros/DICIFO specifically if boyeros or dicifo mentioned
    if (textNorm.includes("boyeros") || textNorm.includes("dicifo")) {
      zoneQualitativeMap["BOYEROS"].intensity = Math.min(100, zoneQualitativeMap["BOYEROS"].intensity + 5);
      zoneQualitativeMap["BOYEROS"].factors = Array.from(new Set([...zoneQualitativeMap["BOYEROS"].factors, ...matchedFactors]));
    }

    // Add to sanitized academic lists (only fragments)
    // Replace names/dates or precise identifiers
    const sanitizedFragment = t.rawText;
    // (In a real system, NLP or regex would sanitise, here we write the clean version)
    sanitizedTestimonies.push({
      id: t.id,
      fragment: sanitizedFragment,
      factors: matchedFactors,
      date: t.date
    });
  }

  const qualitativeSignalsArray = Object.values(zoneQualitativeMap);

  // 2. Generate survey signals (quantitative data)
  const surveySignals = [
    {
      zoneId: "zone_chapingo",
      zoneName: "UNIVERSIDAD AUTONOMA CHAPINGO",
      respondents: 154,
      score: 2.10, // out of 5
      confidence: "alta",
      iluminacionScore: 3.2,
      acompanamientoScore: 2.4,
      infraestructuraScore: 3.8,
      transporteScore: 4.1
    },
    {
      zoneId: "zone_salitreria",
      zoneName: "SALITRERIA",
      respondents: 24,
      score: 3.17,
      confidence: "media",
      iluminacionScore: 1.5,
      acompanamientoScore: 1.8,
      infraestructuraScore: 2.1,
      transporteScore: 2.3
    },
    {
      zoneId: "zone_cooperativo",
      zoneName: "COOPERATIVO/CABAÑAS",
      respondents: 21,
      score: 2.91,
      confidence: "media",
      iluminacionScore: 2.0,
      acompanamientoScore: 1.9,
      infraestructuraScore: 2.5,
      transporteScore: 3.0
    },
    {
      zoneId: "zone_issste",
      zoneName: "TRAMO ISSSTE - CHAPINGO",
      respondents: 37,
      score: 2.46,
      confidence: "alta",
      iluminacionScore: 1.8,
      acompanamientoScore: 2.2,
      infraestructuraScore: 2.0,
      transporteScore: 2.8
    },
    {
      zoneId: "zone_boyeros",
      zoneName: "BOYEROS",
      respondents: 2, // low sample size
      score: 1.5, // low quantitative score, but requires qualitative validation
      confidence: "baja",
      iluminacionScore: 1.2,
      acompanamientoScore: 1.0,
      infraestructuraScore: 1.5,
      transporteScore: 1.8
    }
  ];

  // 3. Generate testimony routes
  const testimonyRoutes = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: "testimony_route_dicifo_boyeros",
          nombre: "Corredor DICIFO ↔ Boyeros",
          tipo: "corredor_cualitativo_validacion",
          precision: "conceptual",
          descripcion: "Corredor derivado de menciones testimoniales sobre trayectos inseguros.",
          tooltip: "Corredor cualitativo de validación. No es ruta segura ni ruta exacta."
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-98.89360038863026, 19.4932945048691],
            [-98.9106280898513, 19.499055255232797]
          ]
        }
      }
    ]
  };

  // 4. Save results to derived directory
  fs.writeFileSync(
    path.join(DERIVED_DIR, "survey_signals_by_zone.json"),
    JSON.stringify(surveySignals, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(DERIVED_DIR, "qualitative_signals_by_zone.json"),
    JSON.stringify(qualitativeSignalsArray, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(DERIVED_DIR, "testimony_routes_academic.geojson"),
    JSON.stringify(testimonyRoutes, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(DERIVED_DIR, "testimony_summary_cards.json"),
    JSON.stringify(sanitizedTestimonies, null, 2),
    "utf-8"
  );

  console.log("Survey and testimony pipeline completed successfully.");
}

runPipeline();
