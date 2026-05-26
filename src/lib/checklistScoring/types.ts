import type { CertificationFormResponse } from "@/lib/certificationForm";

export type ChecklistScoringContext = {
  /** Laravel certificate `topology_type` (Green Interiors typology). */
  topology?: number;
  /** Laravel `sub_rating_type` (e.g. New Buildings owner vs tenant). */
  subRatingType?: number;
};

export type ChecklistScorer = (
  form: CertificationFormResponse,
  tabSlug: string,
  subSlug: string,
  ctx: ChecklistScoringContext,
) => number;

export type ChecklistScorerRegistry = Record<string, ChecklistScorer>;
