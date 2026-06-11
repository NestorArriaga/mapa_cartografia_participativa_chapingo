 
import { ParticipatorySubmission } from '../types/submissions';

const SENSITIVE_KEYWORDS = [
  'baño', 'internado', 'cuarto', 'casa', 'residencia', 
  'violación', 'abuso', 'asesinato', 'muerte', 'sangre'
];

/**
 * Moderation Service for evaluating participatory submissions.
 */
export const moderationService = {
  detectSubmissionSensitivity(submission: ParticipatorySubmission): string[] {
    const flags: string[] = [];
    const text = (submission.testimonyText || '').toLowerCase();
    
    // Check keywords
    for (const word of SENSITIVE_KEYWORDS) {
      if (text.includes(word)) {
        flags.push(`Keyword detected: ${word}`);
      }
    }

    // Exact coordinates check
    if (submission.geometrySuggestion?.precision === 'exact_not_public' && text.length > 0) {
      flags.push('Exact coordinates combined with testimony');
    }

    // Check pre-existing flags
    if (submission.sensitiveFlags && submission.sensitiveFlags.length > 0) {
      flags.push(...submission.sensitiveFlags);
    }

    return Array.from(new Set(flags));
  },

  classifySubmissionForReview(submission: ParticipatorySubmission): ParticipatorySubmission['status'] {
    const flags = this.detectSubmissionSensitivity(submission);
    if (flags.length > 0) {
      return 'under_review';
    }
    return 'submitted'; // Safe for now, pending admin manual or auto approval
  },

  canAggregatePublicly(submission: ParticipatorySubmission): boolean {
    const status = this.classifySubmissionForReview(submission);
    return status === 'submitted' || status === 'approved_public_aggregated';
  },

  getModerationReason(submission: ParticipatorySubmission): string {
    const flags = this.detectSubmissionSensitivity(submission);
    if (flags.length > 0) {
      return `Requires review due to: ${flags.join(', ')}`;
    }
    return 'Clean submission, ready for aggregation.';
  }
};
