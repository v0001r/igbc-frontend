import type { CertificationFormResponse } from "@/lib/certificationForm";
import { computeGreenHomesChecklistAttempted } from "@/lib/certificationChecklistScoring";
import { resolveChecklistContext } from "@/lib/checklistScoring/helpers";
import { computeRating1ChecklistAttempted } from "@/lib/checklistScoring/rating1";
import { computeRating3ChecklistAttempted } from "@/lib/checklistScoring/rating3";
import { computeRating4ChecklistAttempted } from "@/lib/checklistScoring/rating4";
import { computeRating5ChecklistAttempted } from "@/lib/checklistScoring/rating5";
import type { ChecklistScoringContext } from "@/lib/checklistScoring/types";

export type { ChecklistScoringContext } from "@/lib/checklistScoring/types";
export { resolveChecklistContext } from "@/lib/checklistScoring/helpers";

/**
 * Laravel `__get_checklist_calculation` for all rating types.
 * Returns `null` when no custom rule exists (caller falls back to form completion %).
 */
export function computeChecklistAttempted(
  ratingTypeId: number,
  form: CertificationFormResponse,
  tabSlug: string,
  subSlug: string,
  possiblePoints: number,
  ctx?: ChecklistScoringContext,
): number | null {
  const context = ctx ?? resolveChecklistContext(form);

  switch (ratingTypeId) {
    case 1:
      return computeRating1ChecklistAttempted(form, tabSlug, subSlug, possiblePoints, context);
    case 2:
      return computeGreenHomesChecklistAttempted(form, tabSlug, subSlug, possiblePoints);
    case 3:
      return computeRating3ChecklistAttempted(form, tabSlug, subSlug, possiblePoints, context);
    case 4:
      return computeRating4ChecklistAttempted(form, tabSlug, subSlug, possiblePoints, context);
    case 5:
      return computeRating5ChecklistAttempted(form, tabSlug, subSlug, possiblePoints, context);
    default:
      return null;
  }
}

/** @deprecated Use `computeChecklistAttempted(2, ...)`. */
export { computeGreenHomesChecklistAttempted } from "@/lib/certificationChecklistScoring";
