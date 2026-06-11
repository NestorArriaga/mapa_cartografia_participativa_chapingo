 
export type ParticipatorySubmission = {
  id: string;
  type: string;
  zona: string;
  geometry?: any;
  comment?: string;
  proposal?: string;
  sensitivity: "public" | "protected";
  date: string;
  status: string;
};

export type LocalZoneFeedback = {
  zoneId: string;
  submissionsCount: number;
  lastSubmissionDate?: string;
  priorityScoreAdjustment: number;
};

export type RecalculatedZonePriority = {
  zoneId: string;
  originalScore: number;
  newScore: number;
  level: string;
};

const STORAGE_KEY = "mapvivo_participatory_submissions";

// Retrieves all local submissions
export function getLocalSubmissions(): ParticipatorySubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Saves a new local submission
export function saveLocalSubmission(input: {
  type: string;
  zona: string;
  comment?: string;
  proposal?: string;
  geometry?: any;
  sensitivity?: "public" | "protected";
}): ParticipatorySubmission {
  const submissions = getLocalSubmissions();
  
  const submission: ParticipatorySubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: input.type,
    zona: input.zona || "UNIVERSIDAD AUTONOMA CHAPINGO",
    geometry: input.geometry || null,
    comment: input.comment || "",
    proposal: input.proposal || "",
    sensitivity: input.sensitivity || "public",
    date: new Date().toISOString(),
    status: "local_recomputed"
  };

  submissions.push(submission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  return submission;
}

// Simple zone helper by proximity or name matching
export function assignSubmissionToZone(submission: ParticipatorySubmission, zones: any[]): string | null {
  if (submission.zona) {
    const matched = zones.find(z => 
      z.properties?.zona?.toLowerCase() === submission.zona.toLowerCase() ||
      z.properties?.zona_join?.toLowerCase() === submission.zona.toLowerCase()
    );
    return matched ? matched.properties.zona || matched.properties.zona_join : null;
  }
  return null;
}

// Compute zone specific adjustments
export function computeLocalZoneFeedback(zoneId: string, submissions: ParticipatorySubmission[]): LocalZoneFeedback {
  const zoneSubmissions = submissions.filter(s => s.zona?.toLowerCase() === zoneId.toLowerCase());
  
  // Each local submission increases priority score by 0.05 up to a maximum adjustment of +0.30
  const submissionsCount = zoneSubmissions.length;
  const priorityScoreAdjustment = Math.min(0.30, submissionsCount * 0.05);
  const lastSubmission = zoneSubmissions[zoneSubmissions.length - 1];

  return {
    zoneId,
    submissionsCount,
    lastSubmissionDate: lastSubmission ? lastSubmission.date : undefined,
    priorityScoreAdjustment
  };
}

// Recalculates zone priority score and text level
export function updateZonePriorityWithFeedback(zone: any, feedback: LocalZoneFeedback): RecalculatedZonePriority {
  const props = zone?.properties || zone || {};
  const originalScore = props.score_integrado || props.score_forms || 0;
  
  const newScore = Math.min(1.0, originalScore + feedback.priorityScoreAdjustment);
  
  let level = "baja";
  if (newScore > 0.8) {
    level = "critica";
  } else if (newScore > 0.6) {
    level = "alta";
  } else if (newScore > 0.4) {
    level = "media";
  }

  return {
    zoneId: props.zona || props.zona_join || "Unknown",
    originalScore,
    newScore,
    level
  };
}
