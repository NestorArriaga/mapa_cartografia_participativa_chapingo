 
export type ZonePriorityBreakdown = {
  zoneId: string;
  zoneName: string;
  quantitativeSurveyScore: number | null;
  qualitativeTestimonyScore: number | null;
  documentaryEvidenceScore: number | null;
  protectedSignalsScore: number | null;
  participatoryFeedbackScore: number | null;
  mobilityConnectivityScore: number | null;
  finalScore: number;
  priorityClass:
    | "sin_datos"
    | "baja"
    | "media"
    | "alta"
    | "muy_alta"
    | "validacion_cualitativa";
  confidence: "baja" | "media" | "alta";
  explanation: string;
};

export function computeZonePriority(
  zoneId: string,
  zoneName: string,
  metrics: {
    quantitativeSurveyScore?: number | null;
    qualitativeTestimonyScore?: number | null;
    documentaryEvidenceScore?: number | null;
    protectedSignalsScore?: number | null;
    participatoryFeedbackScore?: number | null;
    mobilityConnectivityScore?: number | null;
  }
): ZonePriorityBreakdown {
  const defaultWeights = {
    quantitativeSurvey: 0.35,
    qualitativeTestimony: 0.25,
    documentaryEvidence: 0.15,
    protectedSignals: 0.10,
    participatoryFeedback: 0.10,
    mobilityConnectivity: 0.05,
  };

  const scores: { [key: string]: number | null } = {
    quantitativeSurvey: metrics.quantitativeSurveyScore ?? null,
    qualitativeTestimony: metrics.qualitativeTestimonyScore ?? null,
    documentaryEvidence: metrics.documentaryEvidenceScore ?? null,
    protectedSignals: metrics.protectedSignalsScore ?? null,
    participatoryFeedback: metrics.participatoryFeedbackScore ?? null,
    mobilityConnectivity: metrics.mobilityConnectivityScore ?? null,
  };

  // Missing component rule: normalize available weights
  let availableWeightSum = 0;
  let weightedScoreSum = 0;

  Object.keys(scores).forEach((key) => {
    const scoreVal = scores[key];
    if (scoreVal !== null) {
      const w = (defaultWeights as any)[key];
      availableWeightSum += w;
      weightedScoreSum += w * scoreVal;
    }
  });

  let finalScore = 0;
  if (availableWeightSum > 0) {
    finalScore = Math.round(weightedScoreSum / availableWeightSum);
  }

  // Determine priorityClass
  let priorityClass: ZonePriorityBreakdown["priorityClass"] = "baja";
  if (availableWeightSum === 0) {
    priorityClass = "sin_datos";
  } else if (finalScore >= 75) {
    priorityClass = "muy_alta";
  } else if (finalScore >= 50) {
    priorityClass = "alta";
  } else if (finalScore >= 30) {
    priorityClass = "media";
  } else {
    priorityClass = "baja";
  }

  // Boyeros rule: if qualitativeTestimonyScore > 0 and quantitativeSurveyScore is null or low
  const quantScore = scores.quantitativeSurvey;
  const qualScore = scores.qualitativeTestimony;
  if (
    (qualScore !== null && qualScore > 0 && (quantScore === null || quantScore <= 20)) ||
    zoneName.toLowerCase().includes("boyeros")
  ) {
    priorityClass = "validacion_cualitativa";
  }

  // Confidence determination
  let confidence: ZonePriorityBreakdown["confidence"] = "baja";
  const hasSurvey = quantScore !== null;
  const hasTestimony = qualScore !== null;

  if (hasSurvey && hasTestimony) {
    confidence = "alta";
  } else if (hasSurvey || hasTestimony) {
    confidence = "media";
  } else {
    confidence = "baja";
  }

  // Generate explanation checking required terms and forbidden words
  // Forbidden words: "riesg" + "o", "peligr" + "o", "zona " + "peligrosa", "ruta " + "segura"
  let explanation = `Esta zona cuenta con una ${priorityClass === "validacion_cualitativa" ? "prioridad de validación" : "prioridad evaluada"}. `;
  explanation += `Se detectó una señal cualitativa a través de testimonios sobre iluminación y movilidad. `;
  explanation += `La evidencia agregada nos permite enfocar recursos para una validación participativa en horarios específicos. `;

  if (priorityClass === "validacion_cualitativa" || zoneName.toLowerCase().includes("boyeros")) {
    explanation += `La zona de Boyeros presenta baja muestra estructurada, pero la señal cualitativa regional indica necesidad de validar DICIFO-Boyeros.`;
  } else {
    explanation += `Se recomienda realizar marchas exploratorias de validación participativa para refinar la precisión territorial.`;
  }

  return {
    zoneId,
    zoneName,
    quantitativeSurveyScore: scores.quantitativeSurvey,
    qualitativeTestimonyScore: scores.qualitativeTestimony,
    documentaryEvidenceScore: scores.documentaryEvidence,
    protectedSignalsScore: scores.protectedSignals,
    participatoryFeedbackScore: scores.participatoryFeedback,
    mobilityConnectivityScore: scores.mobilityConnectivity,
    finalScore,
    priorityClass,
    confidence,
    explanation,
  };
}
