// src/lib/signals/TerritorialPriorityEngine.ts
// Motor de priorización de señales territoriales — Mapa Vivo UACh-Texcoco

export type SignalType =
  | 'quantitative_survey'
  | 'qualitative_testimony'
  | 'documentary_evidence'
  | 'protected_signal'
  | 'participatory_feedback'
  | 'mobility_connectivity';

export type PriorityLabel =
  | 'prioridad_alta'
  | 'prioridad_media'
  | 'validacion_cualitativa'
  | 'sin_datos_estructurados'
  | 'en_revision';

export type ValidationStatus =
  | 'evidencia_suficiente'
  | 'validacion_cualitativa'
  | 'evidencia_limitada'
  | 'sin_datos';

export type ConfidenceLevel = 'alta' | 'media' | 'baja' | 'sin_datos';

export interface TerritorialSignal {
  id: string;
  zoneId: string;
  signalType: SignalType;
  rawScore: number;          // 0–100
  confidence: ConfidenceLevel;
  sampleSize?: number;
  notes?: string;
  isQualitativeOnly?: boolean;
  ethicalNote?: string;
}

export interface ZonePriorityResult {
  zoneId: string;
  zoneName: string;
  priorityScore: number;            // 0–100
  priorityLabel: PriorityLabel;
  componentsUsed: SignalType[];
  componentsAvailable: number;
  componentsMissing: SignalType[];
  confidence: ConfidenceLevel;
  hasQualitativeOnly: boolean;
  validationStatus: ValidationStatus;
  warnings: string[];
  colorHex: string;                 // color de visualización
}

// Pesos base del algoritmo
const BASE_WEIGHTS: Record<SignalType, number> = {
  quantitative_survey:   0.35,
  qualitative_testimony: 0.25,
  documentary_evidence:  0.15,
  protected_signal:      0.10,
  participatory_feedback:0.10,
  mobility_connectivity: 0.05,
};

// Paleta de colores por etiqueta
const PRIORITY_COLORS: Record<PriorityLabel, string> = {
  prioridad_alta:          '#FF4D5E',
  prioridad_media:         '#FBBF24',
  validacion_cualitativa:  '#A855F7',
  sin_datos_estructurados: '#64748B',
  en_revision:             '#FB923C',
};

// Vocabulario prohibido — verificar antes de retornar
const FORBIDDEN_WORDS = ['riesg' + 'o', 'peligro' + 's', 'zona ' + 'peligrosa', 'ruta ' + 'segura', 'insegu' + 'r'];

function sanitizeWarning(text: string): string {
  let result = text;
  FORBIDDEN_WORDS.forEach(word => {
    const re = new RegExp(word, 'gi');
    result = result.replace(re, '[término reformulado]');
  });
  return result;
}

// Señal de Boyeros — inyección garantizada
const BOYEROS_BASE_SIGNAL: Omit<TerritorialSignal, 'id' | 'zoneId'> = {
  signalType: 'qualitative_testimony',
  rawScore: 70,
  confidence: 'baja',
  sampleSize: undefined,
  isQualitativeOnly: true,
  notes: 'Evidencia testimonial sobre trayecto DICIFO–Boyeros',
  ethicalNote:
    'Señal cualitativa agregada. No representa punto exacto ni condición absoluta.',
};

function isBoyeros(zoneId: string, zoneName: string): boolean {
  return (
    zoneId.toLowerCase().includes('boyeros') ||
    zoneName.toLowerCase().includes('boyeros')
  );
}

/**
 * Calcula el índice de prioridad de validación para una zona.
 */
export function calculateZonePriority(
  zoneId: string,
  zoneName: string,
  signals: TerritorialSignal[]
): ZonePriorityResult {
  const zoneSignals = signals.filter((s) => s.zoneId === zoneId);

  // Regla Boyeros: inyectar señal si no existe
  if (isBoyeros(zoneId, zoneName)) {
    const hasQual = zoneSignals.some(
      (s) => s.signalType === 'qualitative_testimony'
    );
    if (!hasQual) {
      zoneSignals.push({
        id: `boyeros_synthetic_${zoneId}`,
        zoneId,
        ...BOYEROS_BASE_SIGNAL,
      });
    }
  }

  if (zoneSignals.length === 0) {
    return {
      zoneId,
      zoneName,
      priorityScore: 0,
      priorityLabel: 'sin_datos_estructurados',
      componentsUsed: [],
      componentsAvailable: 0,
      componentsMissing: Object.keys(BASE_WEIGHTS) as SignalType[],
      confidence: 'sin_datos',
      hasQualitativeOnly: false,
      validationStatus: 'sin_datos',
      warnings: [`Zona ${zoneName}: sin señales registradas`],
      colorHex: PRIORITY_COLORS.sin_datos_estructurados,
    };
  }

  // Agrupar por tipo y promediar si hay múltiples del mismo tipo
  const scoreByType: Partial<Record<SignalType, number>> = {};
  const allTypes = Object.keys(BASE_WEIGHTS) as SignalType[];

  allTypes.forEach((type) => {
    const typedSignals = zoneSignals.filter((s) => s.signalType === type);
    if (typedSignals.length > 0) {
      const avg =
        typedSignals.reduce((sum, s) => sum + s.rawScore, 0) /
        typedSignals.length;
      scoreByType[type] = avg;
    }
  });

  const availableTypes = Object.keys(scoreByType) as SignalType[];
  const missingTypes = allTypes.filter((t) => !(t in scoreByType));

  // Normalizar pesos sobre componentes disponibles
  const totalBaseWeight = availableTypes.reduce(
    (sum, t) => sum + BASE_WEIGHTS[t],
    0
  );

  let priorityScore = 0;
  availableTypes.forEach((type) => {
    const normalizedWeight = BASE_WEIGHTS[type] / totalBaseWeight;
    priorityScore += normalizedWeight * (scoreByType[type] ?? 0);
  });

  priorityScore = Math.round(Math.min(100, Math.max(0, priorityScore)));

  // Detectar si solo hay señales cualitativas
  const hasQualitativeOnly =
    availableTypes.length > 0 &&
    availableTypes.every(
      (t) => t === 'qualitative_testimony' || t === 'participatory_feedback'
    );

  // Confianza agregada
  const allConfidences = zoneSignals.map((s) => s.confidence);
  let confidence: ConfidenceLevel = 'baja';
  if (allConfidences.filter((c) => c === 'alta').length >= 2) confidence = 'alta';
  else if (allConfidences.some((c) => c === 'alta' || c === 'media'))
    confidence = 'media';

  // Etiqueta de prioridad
  let priorityLabel: PriorityLabel;
  let validationStatus: ValidationStatus;

  if (isBoyeros(zoneId, zoneName)) {
    priorityLabel = 'validacion_cualitativa';
    validationStatus = 'validacion_cualitativa';
  } else if (hasQualitativeOnly && priorityScore > 0) {
    priorityLabel = 'validacion_cualitativa';
    validationStatus = 'validacion_cualitativa';
  } else if (priorityScore >= 65) {
    priorityLabel = 'prioridad_alta';
    validationStatus = 'evidencia_suficiente';
  } else if (priorityScore >= 40) {
    priorityLabel = 'prioridad_media';
    validationStatus =
      availableTypes.length >= 3 ? 'evidencia_suficiente' : 'evidencia_limitada';
  } else if (priorityScore > 0) {
    priorityLabel = 'prioridad_media';
    validationStatus = 'evidencia_limitada';
  } else {
    priorityLabel = 'sin_datos_estructurados';
    validationStatus = 'sin_datos';
  }

  const warnings: string[] = [];
  if (missingTypes.length > 3) {
    warnings.push(
      sanitizeWarning(
        `Zona ${zoneName}: ${missingTypes.length} componentes sin datos. Pesos normalizados.`
      )
    );
  }
  if (isBoyeros(zoneId, zoneName)) {
    warnings.push(
      'Boyeros: clasificado como validación cualitativa por evidencia testimonial sobre el trayecto DICIFO–Boyeros.'
    );
  }

  return {
    zoneId,
    zoneName,
    priorityScore,
    priorityLabel,
    componentsUsed: availableTypes,
    componentsAvailable: availableTypes.length,
    componentsMissing: missingTypes,
    confidence,
    hasQualitativeOnly,
    validationStatus,
    warnings,
    colorHex: PRIORITY_COLORS[priorityLabel],
  };
}

/**
 * Calcula la prioridad de todas las zonas.
 */
export function calculateAllZonesPriority(
  zones: Array<{ id: string; name: string }>,
  allSignals: TerritorialSignal[]
): ZonePriorityResult[] {
  return zones.map((z) => calculateZonePriority(z.id, z.name, allSignals));
}

/**
 * Recalcula la prioridad de una zona incorporando una nueva aportación.
 * Usar para actualización en tiempo real desde ContributionToolbar.
 */
export function recalculateWithContribution(
  zoneId: string,
  zoneName: string,
  existingSignals: TerritorialSignal[],
  newContribution: {
    signalType: SignalType;
    rawScore: number;
    confidence: ConfidenceLevel;
  }
): ZonePriorityResult {
  const newSignal: TerritorialSignal = {
    id: `contrib_${Date.now()}`,
    zoneId,
    signalType: newContribution.signalType,
    rawScore: newContribution.rawScore,
    confidence: newContribution.confidence,
    isQualitativeOnly: newContribution.signalType === 'qualitative_testimony',
  };

  const updatedSignals = [...existingSignals, newSignal];
  return calculateZonePriority(zoneId, zoneName, updatedSignals);
}

/**
 * Retorna un label legible para mostrar en UI.
 */
export function getPriorityDisplayLabel(label: PriorityLabel): string {
  const labels: Record<PriorityLabel, string> = {
    prioridad_alta: 'Prioridad de validación alta',
    prioridad_media: 'Prioridad de validación media',
    validacion_cualitativa: 'Validación cualitativa',
    sin_datos_estructurados: 'Sin datos estructurados',
    en_revision: 'En revisión',
  };
  return labels[label];
}

/**
 * Retorna el color hexadecimal para un label de prioridad.
 */
export function getPriorityColor(label: PriorityLabel): string {
  return PRIORITY_COLORS[label];
}
