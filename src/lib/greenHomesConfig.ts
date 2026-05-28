/**
 * Types + resolvers for Green Homes (and similar) rating JSON exports.
 * Supports both:
 * - `subtabs` / `subtabs_by_tab` + flat `params[sub_slug]`
 * - nested `params[tabSlug][sub_slug]` when present
 */

export type GreenHomesTab = {
  name: string;
  slug: string;
  action?: string;
  checklist?: boolean;
  points?: number;
};

export type GreenHomesSubtab = {
  name: string;
  sub_slug: string;
  checklist?: boolean;
  required?: boolean;
  "pre-certificate"?: boolean;
  certificate?: boolean;
  points?: number;
};

export type GreenHomesFieldDef = {
  display_name?: string;
  name?: string;
  type?: string;
  readonly?: boolean;
  validation?: string;
  required?: boolean;
  valid_message?: string;
  "pre-certificate"?: boolean;
  certificate?: boolean;
  number?: string;
  options?: unknown;
  subtab?: string;
  related_to?: string;
  links?: unknown;
};

export type GreenHomesRuntimeConfig = {
  tabs: GreenHomesTab[];
  /** Preferred: tab slug → subtabs */
  subtabs_by_tab?: Record<string, GreenHomesSubtab[]>;
  /** Alias some exports may use */
  subtabs?: Record<string, GreenHomesSubtab[]>;
  params: Record<string, unknown>;
  optionMap?: Record<string, unknown>;
};

export function getSubtabsForTab(config: GreenHomesRuntimeConfig, tabSlug: string): GreenHomesSubtab[] {
  const map = config.subtabs_by_tab ?? config.subtabs ?? {};
  const list = map[tabSlug];
  return Array.isArray(list) ? list : [];
}

function isFieldRow(x: unknown): x is GreenHomesFieldDef {
  return x !== null && typeof x === "object" && "type" in (x as object);
}

function normalizeFieldList(raw: unknown): GreenHomesFieldDef[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isFieldRow) as GreenHomesFieldDef[];
}

/**
 * Resolves form fields for a tab + subtab without hardcoding structure:
 * 1) `params[tabSlug][subSlug]` if that value is an array or `{ params: [...] }`
 * 2) else `params[subSlug]` (flat slug index — common in exported JSON)
 */
export function getFieldsForTabSubtab(
  config: GreenHomesRuntimeConfig,
  tabSlug: string,
  subSlug: string
): GreenHomesFieldDef[] {
  const root = config.params ?? {};
  const byTab = root[tabSlug];
  if (byTab !== null && typeof byTab === "object" && !Array.isArray(byTab)) {
    const bySub = (byTab as Record<string, unknown>)[subSlug];
    if (Array.isArray(bySub)) return normalizeFieldList(bySub);
    if (bySub && typeof bySub === "object" && Array.isArray((bySub as { params?: unknown }).params)) {
      return normalizeFieldList((bySub as { params: unknown[] }).params);
    }
  }
  const flat = root[subSlug];
  if (Array.isArray(flat)) return normalizeFieldList(flat);
  if (flat && typeof flat === "object" && Array.isArray((flat as { params?: unknown }).params)) {
    return normalizeFieldList((flat as { params: unknown[] }).params);
  }
  return [];
}

export function fieldIsRequired(f: GreenHomesFieldDef): boolean {
  if (f.required === true) return true;
  if (typeof f.validation === "string" && f.validation.trim() === "required") return true;
  return false;
}

export const SUPPORTED_FIELD_TYPES = ["t", "n", "ta", "c", "r", "d", "u", "M", "hr"] as const;

export function isSupportedFieldType(type: string): boolean {
  return (SUPPORTED_FIELD_TYPES as readonly string[]).includes(type);
}

export type FieldOption = { value: string; label: string };

/** Resolve select/radio options from field.options (comma string or key→label map). */
export function resolveFieldOptions(field: GreenHomesFieldDef): FieldOption[] {
  const o = field.options;
  if (!o) return [];
  if (typeof o === "string") {
    return o
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({ value: label, label }));
  }
  if (typeof o === "object" && !Array.isArray(o)) {
    return Object.entries(o as Record<string, string>).map(([value, label]) => ({
      value,
      label: String(label),
    }));
  }
  return [];
}
