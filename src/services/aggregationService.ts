 
import { ParticipatorySubmission } from '../types/submissions';

/**
 * Calculates dynamic metadata based on local submissions.
 */
export const aggregationService = {
  getZoneCounts(submissions: ParticipatorySubmission[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const sub of submissions) {
      if (sub.zoneName) {
        counts[sub.zoneName] = (counts[sub.zoneName] || 0) + 1;
      }
    }
    return counts;
  },

  getTypeCounts(submissions: ParticipatorySubmission[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const sub of submissions) {
      if (sub.submissionType) {
        counts[sub.submissionType] = (counts[sub.submissionType] || 0) + 1;
      }
    }
    return counts;
  },

  getTopFactors(submissions: ParticipatorySubmission[], limit = 5): Array<{factor: string, count: number}> {
    const counts: Record<string, number> = {};
    for (const sub of submissions) {
      for (const factor of sub.perceivedFactors || []) {
        counts[factor] = (counts[factor] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([factor, count]) => ({ factor, count }));
  },

  getReviewStats(submissions: ParticipatorySubmission[]) {
    return {
      underReview: submissions.filter(s => s.status === 'under_review').length,
      sensitive: submissions.filter(s => s.status === 'rejected_sensitive').length,
      aggregatable: submissions.filter(s => s.status === 'submitted' || s.status === 'approved_public_aggregated').length,
      total: submissions.length
    };
  }
};
