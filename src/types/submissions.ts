export type ParticipatorySubmission = {
  id: string;
  createdAt: string;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "approved_public_aggregated"
    | "rejected_sensitive";

  submissionType:
    | "alerta"
    | "evitacion"
    | "cambio_ruta"
    | "iluminacion"
    | "acceso_cerrado"
    | "acompanamiento"
    | "recurso_apoyo"
    | "testimonio"
    | "mejora";

  zoneId?: string;
  zoneName?: string;

  geometrySuggestion?: {
    type: "Point" | "LineString" | "Polygon";
    coordinates: unknown;
    precision: "zone" | "approximate" | "exact_not_public";
    privacyMode: "public_aggregated" | "requires_review" | "sensitive_no_public";
  };

  timePeriod?: "manana" | "tarde" | "noche" | "madrugada" | "no_recuerdo";
  companionship?: "sola" | "acompanada" | "grupo" | "prefiero_no_decir";
  mobilityMode?: "caminando" | "bicicleta" | "transporte_publico" | "mototaxi_taxi" | "auto" | "otro";
  frequency?: "una_vez" | "varias_veces" | "ocurre_seguido" | "no_aplica";

  perceivedFactors: string[];
  testimonyText?: string;
  improvementSuggestions: string[];

  sensitiveFlags: string[];
  publicAggregationKey: string;
  reviewNotes?: string;
};
