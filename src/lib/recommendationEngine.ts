import { CareRecommendation, generateRecommendations as coreGen } from "../services/recommendationEngine";

export type { CareRecommendation };

export function generateRecommendations(metrics: any, nodes: any[], routes: any[]): CareRecommendation[] {
  // Translate metrics back to compatible props, passing node and route counts
  return coreGen(metrics, nodes?.length || 0, routes?.length || 0);
}
