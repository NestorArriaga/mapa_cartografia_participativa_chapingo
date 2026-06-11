 
/**
 * Data Access Policy
 * Determines how different geometries and features can be used by the system.
 */

export type DataExposureLevel = 
  | 'public_render'       // Exact rendering allowed publicly
  | 'protected_analysis'  // Rendering exact coords forbidden, but aggregation/computation allowed
  | 'admin_review'        // Only for dashboard / reviewers
  | 'blocked';            // Completely isolated or sensitive

export function classifyDataUse(item: any): DataExposureLevel {
  const props = item?.properties || item || {};
  
  // 1. Direct explicit blocks
  if (props.nivel_uso === '04_no_publicar_sensible') return 'blocked';
  if (props.nivel_uso === '03_publicar_sin_identificador') return 'protected_analysis';
  
  // 2. Sensitive keywords in properties
  const rawText = JSON.stringify(props).toLowerCase();
  const sensitiveKeywords = ['baño', 'cuarto', 'casa de compañera', 'internado', 'residencias de noche'];
  for (const keyword of sensitiveKeywords) {
    if (rawText.includes(keyword)) {
      return 'protected_analysis'; // Default to protected if sensitive keywords found
    }
  }

  // 3. User submissions from forms
  if (props.requires_review || props.source === 'participatory_form') {
    return 'protected_analysis';
  }

  // 4. Default public assumption for generic layers if sanitized
  return 'public_render';
}

export function canRenderPublicly(item: any): boolean {
  return classifyDataUse(item) === 'public_render';
}

export function canUseForAggregateAnalysis(item: any): boolean {
  const level = classifyDataUse(item);
  return level === 'public_render' || level === 'protected_analysis';
}

export function canShowInAdminReview(item: any): boolean {
  const level = classifyDataUse(item);
  return level !== 'blocked';
}

export function stripSensitiveGeometry(item: any): any {
  if (!item) return item;
  const clone = JSON.parse(JSON.stringify(item));
  if (!canRenderPublicly(clone)) {
    // Erase exact geometry
    if (clone.geometry) {
      clone.geometry = null;
    }
    // Flag it
    if (clone.properties) {
      clone.properties._stripped = true;
    }
  }
  return clone;
}
