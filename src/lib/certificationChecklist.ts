import type { CertificationFormResponse } from "@/lib/certificationForm";
import {
  getFieldsForTabSubtab,
  getSubtabsForTab,
  type GreenHomesRuntimeConfig,
  type GreenHomesTab,
} from "@/lib/greenHomesConfig";
import { subtabCompletionPercent } from "@/lib/certificationProgress";

export type ChecklistCreditRow = {
  tabSlug: string;
  tabName: string;
  subSlug: string;
  creditName: string;
  possiblePoints: number;
  attemptedPoints: number;
  completionPercent: number | null;
  isAttempted: boolean;
};

export type ChecklistTabGroup = {
  tab: GreenHomesTab;
  rows: ChecklistCreditRow[];
  tabPossible: number;
  tabAttempted: number;
};

export type ChecklistSummary = {
  groups: ChecklistTabGroup[];
  totalPossible: number;
  totalAttempted: number;
};

function isChecklistSubtab(sub: { checklist?: boolean; points?: number }): boolean {
  if (sub.checklist === true) return true;
  return (sub.points ?? 0) > 0;
}

export function buildCertificationChecklist(
  config: GreenHomesRuntimeConfig,
  form: CertificationFormResponse,
): ChecklistSummary {
  const tabs = Array.isArray(config.tabs) ? config.tabs : [];
  const groups: ChecklistTabGroup[] = [];
  let totalPossible = 0;
  let totalAttempted = 0;

  for (const tab of tabs) {
    if (tab.checklist === false) continue;

    const subtabs = getSubtabsForTab(config, tab.slug).filter(isChecklistSubtab);
    if (subtabs.length === 0) continue;

    const rows: ChecklistCreditRow[] = [];
    let tabPossible = 0;
    let tabAttempted = 0;

    for (const sub of subtabs) {
      const possible = sub.points ?? 0;
      const pct = subtabCompletionPercent(config, form, tab.slug, sub);
      const complete = pct === 100;
      const attempted = complete ? possible : 0;

      rows.push({
        tabSlug: tab.slug,
        tabName: tab.name,
        subSlug: sub.sub_slug,
        creditName: sub.name,
        possiblePoints: possible,
        attemptedPoints: attempted,
        completionPercent: pct,
        isAttempted: complete || (pct != null && pct > 0),
      });

      tabPossible += possible;
      tabAttempted += attempted;
    }

    if (rows.length > 0) {
      groups.push({ tab, rows, tabPossible, tabAttempted });
      totalPossible += tabPossible;
      totalAttempted += tabAttempted;
    }
  }

  return { groups, totalPossible, totalAttempted };
}

/** Credits in the current tab for the right-hand timeline (checklist subtabs). */
export function creditsForTab(
  config: GreenHomesRuntimeConfig,
  form: CertificationFormResponse,
  tabSlug: string,
): ChecklistCreditRow[] {
  const tab = (config.tabs ?? []).find((t) => t.slug === tabSlug);
  if (!tab) return [];

  return getSubtabsForTab(config, tabSlug)
    .filter(isChecklistSubtab)
    .map((sub) => {
      const possible = sub.points ?? 0;
      const pct = subtabCompletionPercent(config, form, tabSlug, sub);
      const complete = pct === 100;
      return {
        tabSlug,
        tabName: tab.name,
        subSlug: sub.sub_slug,
        creditName: sub.name,
        possiblePoints: possible,
        attemptedPoints: complete ? possible : 0,
        completionPercent: pct,
        isAttempted: complete || (pct != null && pct > 0),
      };
    });
}

/** Read a param from project form data anywhere in the project. */
export function readFormParam(form: CertificationFormResponse, paramName: string): string {
  const row = form.data.find((d) => d.paramName === paramName && (d.value ?? "").trim());
  return row?.value?.trim() ?? "";
}

/** Field count for annex-only sections without checklist points. */
export function sectionHasContent(
  config: GreenHomesRuntimeConfig,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): boolean {
  const fields = getFieldsForTabSubtab(config, tab, subtab).filter((f) => f.name && f.type !== "hr");
  if (fields.length === 0) return false;
  const pct = subtabCompletionPercent(config, form, tab, { sub_slug: subtab, name: subtab });
  return pct != null && pct > 0;
}
