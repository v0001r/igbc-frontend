/**
 * Rating config JSON and registry live on the backend (`igbc-backend/src/rating-config/`).
 * Use `fetchCertificationWorkspace` for tabs/fields; project DTO flags for gating.
 */

export type RatingConfigKey = string;

/** Mirrors `RATING_CONFIG_REGISTRY` labels on the backend. */
const REGISTRATION_RATING_CONFIGS: Array<{
  match: (name: string) => boolean;
  configKey: RatingConfigKey;
  versionType: string;
}> = [
  {
    match: (n) => n.includes("green homes"),
    configKey: "green_homes",
    versionType: "3",
  },
  {
    match: (n) => n.includes("green new building"),
    configKey: "green_new_buildings",
    versionType: "4",
  },
  {
    match: (n) => n.includes("green existing building"),
    configKey: "green_existing_buildings",
    versionType: "3",
  },
  {
    match: (n) =>
      n.includes("green factory") || n.includes("green factories"),
    configKey: "green_factories",
    versionType: "3",
  },
  {
    match: (n) => n.includes("green interior"),
    configKey: "green_interiors",
    versionType: "3",
  },
];

export function resolveRegistrationRatingConfig(ratingSystem: unknown): {
  configKey: RatingConfigKey;
  versionType: string;
} | null {
  if (typeof ratingSystem !== "string" || !ratingSystem.trim()) return null;
  const normalized = ratingSystem.trim().toLowerCase();
  for (const entry of REGISTRATION_RATING_CONFIGS) {
    if (entry.match(normalized)) {
      return { configKey: entry.configKey, versionType: entry.versionType };
    }
  }
  return null;
}

export function isRegistrationWorkspaceUnlocked(project: {
  status?: string | null;
  paymentStatus?: string | null;
}): boolean {
  const paid =
    project.paymentStatus === "paid" || project.paymentStatus === "approved";
  return project.status === "approved" && paid;
}

export function registrationHasRatingConfig(ratingSystem: unknown): boolean {
  return resolveRegistrationRatingConfig(ratingSystem) !== null;
}

export function isCertificationWorkspaceUnlocked(status: string): boolean {
  return status === "approved" || status === "accepted";
}

export function projectHasRatingConfig(project: {
  hasConfig?: boolean;
  configKey?: string | null;
}): boolean {
  return Boolean(project.hasConfig && project.configKey);
}
