/**
 * Certification form storage: rating_type + version_type + tab + subtab + param (field name).
 * Legacy helpers — certification values now live in `rating_data` / `rating_documents` tables.
 */

export type ProjectFormValues = Record<string, Record<string, Record<string, string>>>;

export type ProjectFormDataStore = {
  ratingTypeId: number;
  versionType: string;
  currentTab?: string;
  currentSubtab?: string;
  values: ProjectFormValues;
};

export const NEW_BUILDING_RATING_TYPE_ID = 1;

/** Auto version: all ratings use 3; Green New Buildings only uses 4. */
export function resolveAutoVersionType(input: {
  ratingTypeId?: number;
  configKey?: string | null;
}): string {
  if (
    input.ratingTypeId === NEW_BUILDING_RATING_TYPE_ID ||
    input.configKey === "green_new_buildings"
  ) {
    return "4";
  }
  return "3";
}

export function defaultVersionFromList(versionTypes: string[] | null | undefined): string {
  if (!versionTypes?.length) return "3";
  return versionTypes[versionTypes.length - 1]!;
}

export function normalizeProjectFormData(
  raw: unknown,
  ratingTypeId: number,
  versionType: string,
): ProjectFormDataStore {
  if (raw && typeof raw === "object" && "values" in (raw as object)) {
    const store = raw as ProjectFormDataStore;
    return {
      ratingTypeId: store.ratingTypeId ?? ratingTypeId,
      versionType: store.versionType ?? versionType,
      currentTab: store.currentTab,
      currentSubtab: store.currentSubtab,
      values: store.values ?? {},
    };
  }

  const legacy = (raw && typeof raw === "object" ? raw : {}) as Record<string, string>;
  const values: ProjectFormValues = {};
  for (const [param, value] of Object.entries(legacy)) {
    if (typeof value !== "string") continue;
    if (!values._legacy) values._legacy = {};
    if (!values._legacy._flat) values._legacy._flat = {};
    values._legacy._flat[param] = value;
  }
  return { ratingTypeId, versionType, values };
}

export function getFormParam(
  store: ProjectFormDataStore,
  tab: string,
  subtab: string,
  param: string,
): string {
  return store.values[tab]?.[subtab]?.[param] ?? store.values._legacy?._flat?.[param] ?? "";
}

export function setFormParam(
  store: ProjectFormDataStore,
  tab: string,
  subtab: string,
  param: string,
  value: string,
): ProjectFormDataStore {
  const values = { ...store.values };
  const tabBucket = { ...(values[tab] ?? {}) };
  const subBucket = { ...(tabBucket[subtab] ?? {}) };
  subBucket[param] = value;
  tabBucket[subtab] = subBucket;
  values[tab] = tabBucket;
  return { ...store, values };
}

export function buildFormPayload(
  store: ProjectFormDataStore,
  tab: string,
  subtab: string,
  partialValues: Record<string, string>,
): ProjectFormDataStore {
  let next = store;
  for (const [param, value] of Object.entries(partialValues)) {
    next = setFormParam(next, tab, subtab, param, value);
  }
  return {
    ...next,
    currentTab: tab,
    currentSubtab: subtab,
  };
}

export function valuesForSection(
  store: ProjectFormDataStore,
  tab: string,
  subtab: string,
  fieldNames: string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of fieldNames) {
    if (!name) continue;
    out[name] = getFormParam(store, tab, subtab, name);
  }
  return out;
}
