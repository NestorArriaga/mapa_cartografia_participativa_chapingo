 
import { useLiveMetricsStore } from '../stores/liveMetricsStore';

export function recomputeLiveMetrics(
  zones: any[],
  _nodes: any[],
  _routes: any[],
  submissions: any[]
) {
  const zoneMetrics: Record<string, any> = {};

  zones.forEach(zone => {
    const props = zone.properties || {};
    const zoneId = props.id_zona || zone.id;
    let submissionCount = 0;
    
    // Simplistic mock recomputation, in reality uses turf.booleanPointInPolygon or simple ID match
    submissions.forEach(sub => {
      if (sub.properties?.zoneId === zoneId) submissionCount++;
    });

    const baseScore = props.score_riesgo_percibido || 0;
    const computedScore = Math.min(1, baseScore + (submissionCount * 0.1));

    zoneMetrics[zoneId] = {
      id: zoneId,
      computedScore,
      submissionCount,
      baseScore
    };
  });

  useLiveMetricsStore.getState().setZoneMetrics(zoneMetrics);
  return zoneMetrics;
}
