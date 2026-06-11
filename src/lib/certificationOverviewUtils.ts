import type { CertificationFormResponse } from "@/lib/certificationForm";
import {
  getFieldsForTabSubtab,
  getSubtabsForTab,
  type GreenHomesRuntimeConfig,
} from "@/lib/greenHomesConfig";

export type OverviewActivity = {
  id: string;
  label: string;
  kind: "field" | "document";
  updatedAt: string;
};

function tabLabel(config: GreenHomesRuntimeConfig, tabSlug: string): string {
  const tab = config.tabs.find((t) => t.slug === tabSlug);
  return tab?.name ?? tabSlug.replace(/_/g, " ");
}

function subtabLabel(config: GreenHomesRuntimeConfig, tabSlug: string, subSlug: string): string {
  const sub = getSubtabsForTab(config, tabSlug).find((s) => s.sub_slug === subSlug);
  return sub?.name ?? subSlug.replace(/_/g, " ");
}

function fieldLabel(
  config: GreenHomesRuntimeConfig,
  tabSlug: string,
  subSlug: string,
  paramName: string,
): string {
  const fields = getFieldsForTabSubtab(config, tabSlug, subSlug);
  const field = fields.find((f) => f.name === paramName);
  return field?.display_name?.trim() || paramName.replace(/_/g, " ");
}

export function buildFieldLabelIndex(config: GreenHomesRuntimeConfig): Map<string, string> {
  const index = new Map<string, string>();
  for (const tab of config.tabs) {
    for (const sub of getSubtabsForTab(config, tab.slug)) {
      for (const field of getFieldsForTabSubtab(config, tab.slug, sub.sub_slug)) {
        if (!field.name) continue;
        const key = `${tab.slug}|${sub.sub_slug}|${field.name}`;
        index.set(key, field.display_name?.trim() || field.name);
      }
    }
  }
  return index;
}

export function buildOverviewActivities(
  config: GreenHomesRuntimeConfig,
  form: CertificationFormResponse,
  limit = 12,
): OverviewActivity[] {
  const items: OverviewActivity[] = [];

  for (const row of form.data) {
    const value = row.value?.trim();
    if (!value) continue;
    const field = fieldLabel(config, row.tab, row.subtab, row.paramName);
    const credit = subtabLabel(config, row.tab, row.subtab);
    const section = tabLabel(config, row.tab);
    items.push({
      id: `data-${row.id}`,
      kind: "field",
      label: `${field} of ${credit} credit in ${section} Added`,
      updatedAt: row.updatedAt ?? new Date(0).toISOString(),
    });
  }

  for (const doc of form.documents) {
    const field = fieldLabel(config, doc.tab, doc.subtab, doc.paramName);
    const credit = subtabLabel(config, doc.tab, doc.subtab);
    const section = tabLabel(config, doc.tab);
    items.push({
      id: `doc-${doc.id}`,
      kind: "document",
      label: `${field} of ${credit} credit in ${section} Document uploaded`,
      updatedAt: doc.updatedAt ?? new Date(0).toISOString(),
    });
  }

  return items
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

export function formatOverviewDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "—";
  const normalized = value.includes("/")
    ? value
        .split("/")
        .reverse()
        .join("-")
    : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatIndianCurrency(amount: unknown, inclusiveGst = true): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return inclusiveGst ? `${formatted} (Inclusive of GST Tax)` : formatted;
}

export function formatDualArea(sqm: unknown, sqft: unknown): string {
  const hasSqm = typeof sqm === "number" && Number.isFinite(sqm);
  const hasSqft = typeof sqft === "number" && Number.isFinite(sqft);
  if (!hasSqm && !hasSqft) return "—";
  const sqmText = hasSqm ? `${sqm} (Sq.M)` : "";
  const sqftText = hasSqft ? `${sqft} (In Sq.Ft)` : "";
  if (sqmText && sqftText) return `${sqmText} Or ${sqftText}`;
  return sqmText || sqftText;
}

export function formatBuiltUpArea(sqm: unknown, sqft: unknown): string {
  const hasSqm = typeof sqm === "number" && Number.isFinite(sqm);
  const hasSqft = typeof sqft === "number" && Number.isFinite(sqft);
  if (!hasSqm && !hasSqft) return "—";
  const sqmText = hasSqm ? `${sqm} (sq.m)` : "";
  const sqftText = hasSqft ? `${sqft} (sq.ft)` : "";
  if (sqmText && sqftText) return `${sqmText} or ${sqftText}`;
  return sqmText || sqftText;
}

export function readFormParamAliases(
  form: CertificationFormResponse,
  names: string[],
  tab?: string,
  subtab?: string,
): string {
  for (const name of names) {
    const row = form.data.find(
      (r) =>
        r.paramName === name &&
        r.value?.trim() &&
        (!tab || r.tab === tab) &&
        (!subtab || r.subtab === subtab),
    );
    if (row?.value?.trim()) return row.value.trim();
  }
  return "";
}

export function yesNoLabel(value: unknown): string {
  if (value === true || value === "true" || value === 1 || value === "1" || value === "yes") {
    return "Yes";
  }
  if (value === false || value === "false" || value === 0 || value === "0" || value === "no") {
    return "No";
  }
  if (typeof value === "string" && value.trim()) return value;
  return "—";
}
