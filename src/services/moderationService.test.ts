 
import { describe, it, expect } from 'vitest';
import { moderationService } from './moderationService';
import { ParticipatorySubmission } from '../types/submissions';

const makeSub = (text: string, precision?: 'zone' | 'exact_not_public'): ParticipatorySubmission => ({
  id: '1',
  createdAt: new Date().toISOString(),
  status: 'submitted',
  submissionType: 'alerta',
  testimonyText: text,
  perceivedFactors: [],
  improvementSuggestions: [],
  publicAggregationKey: 'agg_test',
  sensitiveFlags: [],
  geometrySuggestion: precision ? { type: 'Point', coordinates: [0,0], precision, privacyMode: 'requires_review' } : undefined
});

describe('Moderation Service', () => {
  it('detects sensitive keywords (baño)', () => {
    const sub = makeSub('En el baño principal ocurrió algo');
    expect(moderationService.detectSubmissionSensitivity(sub).length).toBeGreaterThan(0);
    expect(moderationService.classifySubmissionForReview(sub)).toBe('under_review');
    expect(moderationService.canAggregatePublicly(sub)).toBe(false);
  });

  it('flags exact coordinates with testimony', () => {
    const sub = makeSub('Un testimonio normal', 'exact_not_public');
    expect(moderationService.detectSubmissionSensitivity(sub).length).toBeGreaterThan(0);
    expect(moderationService.classifySubmissionForReview(sub)).toBe('under_review');
  });

  it('allows clean generic feedback for zone', () => {
    const sub = makeSub('Falta iluminación', 'zone');
    expect(moderationService.detectSubmissionSensitivity(sub).length).toBe(0);
    expect(moderationService.classifySubmissionForReview(sub)).toBe('submitted');
    expect(moderationService.canAggregatePublicly(sub)).toBe(true);
  });
});
