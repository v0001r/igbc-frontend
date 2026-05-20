/**
 * Rating config JSON and registry live on the backend (`igbc-backend/src/rating-config/`).
 * Use `fetchCertificationWorkspace` for tabs/fields; project DTO flags for gating.
 */

export type RatingConfigKey = string;

export function isCertificationWorkspaceUnlocked(status: string): boolean {
  return status === "approved" || status === "accepted";
}

export function projectHasRatingConfig(project: {
  hasConfig?: boolean;
  configKey?: string | null;
}): boolean {
  return Boolean(project.hasConfig && project.configKey);
}
