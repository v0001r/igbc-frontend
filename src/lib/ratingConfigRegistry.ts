/**

 * Extensible rating config registry (rating_type + version_type).

 *

 * To add a new rating system:

 * 1. Export PHP trait → JSON per version (scripts/export-rating-configs.php)

 * 2. Import JSON and add `configsByVersion` below

 * 3. Set `configKey` and `version_type` on `rating_types` in DB/seed

 */

import type { GreenHomesRuntimeConfig } from "@/lib/greenHomesConfig";

import greenHomesConfig from "@/config/greenHomes/config.json";

import existingBuildingConfig from "@/config/greenHomes/existingBuilding.config.json";

import greenFactoriesConfig from "@/config/greenHomes/greenFactories.config.json";
import greenFactoriesV331Config from "@/config/greenHomes/greenFactories.v331.config.json";

import greenInteriorsConfig from "@/config/greenHomes/greenInteriors.config.json";

import newBuildingConfig from "@/config/greenHomes/newBuilding.config.json";



export type RatingConfigKey = string;

export type ConfigVersion = string;



export type RatingConfigEntry = {

  key: RatingConfigKey;

  label: string;

  registerId?: string;

  ratingTypeIds?: number[];

  abbreviations?: string[];

  /** JSON config per IGBC form version (3, 4, …) */

  configsByVersion: Record<ConfigVersion, GreenHomesRuntimeConfig>;

  defaultVersion: ConfigVersion;

};



const entries: RatingConfigEntry[] = [

  {

    key: "green_homes",

    label: "IGBC Green Homes",

    registerId: "green-homes",

    ratingTypeIds: [2],

    abbreviations: ["GH"],

    configsByVersion: { "3": greenHomesConfig as GreenHomesRuntimeConfig },

    defaultVersion: "3",

  },

  {

    key: "green_new_buildings",

    label: "IGBC Green New Buildings",

    registerId: "green-new",

    ratingTypeIds: [1],

    abbreviations: ["GNB"],

    configsByVersion: { "4": newBuildingConfig as GreenHomesRuntimeConfig },

    defaultVersion: "4",

  },

  {

    key: "green_existing_buildings",

    label: "IGBC Green Existing Buildings",

    registerId: "green-existing",

    ratingTypeIds: [4],

    abbreviations: ["EB"],

    configsByVersion: { "3": existingBuildingConfig as GreenHomesRuntimeConfig },

    defaultVersion: "3",

  },

  {

    key: "green_factories",

    label: "IGBC Green Factory Buildings",

    registerId: "green-factory",

    ratingTypeIds: [3],

    abbreviations: ["GFB"],

    configsByVersion: {
      "3": greenFactoriesConfig as GreenHomesRuntimeConfig,
      "3.3.1": greenFactoriesV331Config as GreenHomesRuntimeConfig,
    },

    defaultVersion: "3",

  },

  {

    key: "green_interiors",

    label: "IGBC Green Interiors",

    registerId: "green-interiors",

    ratingTypeIds: [5],

    abbreviations: ["GI"],

    configsByVersion: { "3": greenInteriorsConfig as GreenHomesRuntimeConfig },

    defaultVersion: "3",

  },

];



const byKey = new Map<string, RatingConfigEntry>();

const byRatingTypeId = new Map<number, RatingConfigEntry>();

const byAbbreviation = new Map<string, RatingConfigEntry>();



for (const entry of entries) {

  byKey.set(entry.key, entry);

  for (const id of entry.ratingTypeIds ?? []) {

    byRatingTypeId.set(id, entry);

  }

  for (const abbr of entry.abbreviations ?? []) {

    byAbbreviation.set(abbr.toUpperCase(), entry);

  }

}



export const RATING_CONFIG_ENTRIES = entries;



export function getRatingConfigEntry(key: RatingConfigKey): RatingConfigEntry | undefined {

  return byKey.get(key);

}



export function getRatingConfig(key: RatingConfigKey, versionType: ConfigVersion): GreenHomesRuntimeConfig {

  const entry = byKey.get(key);

  if (!entry) {

    throw new Error(`No config registered for key: ${key}`);

  }

  const config =

    entry.configsByVersion[versionType] ?? entry.configsByVersion[entry.defaultVersion];

  if (!config) {

    throw new Error(`No config for ${key} version ${versionType}`);

  }

  return config;

}



export function resolveRatingConfigKeyFromProject(input: {

  ratingTypeId?: number | null;

  configKey?: string | null;

  ratingTypeName?: string | null;

  abbreviation?: string | null;

}): RatingConfigKey | null {

  if (input.configKey && byKey.has(input.configKey)) {

    return input.configKey;

  }

  if (input.ratingTypeId != null && byRatingTypeId.has(input.ratingTypeId)) {

    return byRatingTypeId.get(input.ratingTypeId)!.key;

  }

  if (input.abbreviation) {

    const fromAbbr = byAbbreviation.get(input.abbreviation.toUpperCase());

    if (fromAbbr) return fromAbbr.key;

  }

  if (input.ratingTypeName) {

    const lower = input.ratingTypeName.toLowerCase();

    for (const entry of entries) {

      if (entry.label.toLowerCase() === lower) return entry.key;

    }

    for (const entry of entries) {

      if (lower.includes(entry.label.toLowerCase().replace("igbc ", ""))) return entry.key;

    }

  }

  return null;

}



export function hasConfigForVersion(key: RatingConfigKey, versionType: string): boolean {

  const entry = byKey.get(key);

  if (!entry) return false;

  return Boolean(entry.configsByVersion[versionType] ?? entry.configsByVersion[entry.defaultVersion]);

}



export function isCertificationWorkspaceUnlocked(status: string): boolean {

  return status === "approved" || status === "accepted";

}


