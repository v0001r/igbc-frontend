import type { CertificationFormResponse } from "@/lib/certificationForm";
import {
  getFieldsForTabSubtab,
  getSubtabsForTab,
  type GreenHomesRuntimeConfig,
  type GreenHomesSubtab,
  type GreenHomesTab,
} from "@/lib/greenHomesConfig";
import { subtabCompletionPercent } from "@/lib/certificationProgress";
import {
  computeChecklistAttempted,
  resolveChecklistContext,
} from "@/lib/checklistScoring";

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

function resolveAttemptedPoints(
  ratingTypeId: number,
  config: GreenHomesRuntimeConfig,
  form: CertificationFormResponse,
  tabSlug: string,
  sub: GreenHomesSubtab,
): number {
  const possible = sub.points ?? 0;
  const ctx = resolveChecklistContext(form);
  const fromRules = computeChecklistAttempted(
    ratingTypeId,
    form,
    tabSlug,
    sub.sub_slug,
    possible,
    ctx,
  );
  if (fromRules !== null) return fromRules;

  const pct = subtabCompletionPercent(config, form, tabSlug, sub);
  return pct === 100 ? possible : 0;
}

export function buildCertificationChecklist(
  config: GreenHomesRuntimeConfig,
  form: CertificationFormResponse,
  ratingTypeId: number,
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
      const attempted = resolveAttemptedPoints(ratingTypeId, config, form, tab.slug, sub);

      rows.push({
        tabSlug: tab.slug,
        tabName: tab.name,
        subSlug: sub.sub_slug,
        creditName: sub.name,
        possiblePoints: possible,
        attemptedPoints: attempted,
        completionPercent: pct,
        isAttempted: attempted > 0,
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
  ratingTypeId: number,
): ChecklistCreditRow[] {
  const tab = (config.tabs ?? []).find((t) => t.slug === tabSlug);
  if (!tab) return [];

  return getSubtabsForTab(config, tabSlug)
    .filter(isChecklistSubtab)
    .map((sub) => {
      const possible = sub.points ?? 0;
      const pct = subtabCompletionPercent(config, form, tabSlug, sub);
      const attempted = resolveAttemptedPoints(ratingTypeId, config, form, tabSlug, sub);
      return {
        tabSlug,
        tabName: tab.name,
        subSlug: sub.sub_slug,
        creditName: sub.name,
        possiblePoints: possible,
        attemptedPoints: attempted,
        completionPercent: pct,
        isAttempted: attempted > 0,
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
