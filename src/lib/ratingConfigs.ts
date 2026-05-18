/**
 * @deprecated Import from `@/lib/ratingConfigRegistry` instead.
 * Re-exports for backward compatibility.
 */
export {
  getRatingConfig,
  resolveRatingConfigKeyFromProject as resolveRatingConfigKey,
  RATING_CONFIG_ENTRIES,
  isCertificationWorkspaceUnlocked,
  type RatingConfigKey,
  type RatingConfigEntry,
} from "@/lib/ratingConfigRegistry";

import { RATING_CONFIG_ENTRIES, type RatingConfigKey } from "@/lib/ratingConfigRegistry";

export const RATING_CONFIG_META = Object.fromEntries(
  RATING_CONFIG_ENTRIES.map((e) => [
    e.key,
    { label: e.label, registerId: e.registerId ?? e.key, configFile: `${e.key}.config.json` },
  ])
) as Record<RatingConfigKey, { label: string; registerId: string; configFile: string }>;

export const RATING_CONFIG_KEYS = RATING_CONFIG_ENTRIES.map((e) => e.key) as RatingConfigKey[];

export function getDefaultRatingConfigKey(): RatingConfigKey {
  return RATING_CONFIG_KEYS[0] ?? "green_homes";
}
