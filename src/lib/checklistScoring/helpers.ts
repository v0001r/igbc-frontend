import type { CertificationFormResponse } from "@/lib/certificationForm";
import { RatingDataIndex } from "@/lib/ratingDataIndex";

/** Shared lookups for Laravel-style checklist rules. */
export class ChecklistForm {
  readonly idx: RatingDataIndex;

  constructor(readonly form: CertificationFormResponse) {
    this.idx = new RatingDataIndex(form);
  }

  get(tab: string, subtab: string, param: string): string {
    return this.idx.get(tab, subtab, param);
  }

  num(tab: string, subtab: string, param: string): number {
    const n = parseFloat(this.get(tab, subtab, param));
    return Number.isFinite(n) ? n : NaN;
  }

  relatedNum(param: string, preferTab?: string): number {
    const n = parseFloat(this.idx.getRelated(param, preferTab));
    return Number.isFinite(n) ? n : NaN;
  }

  paramAnywhere(param: string): string {
    return this.idx.getParamAnywhere(param);
  }

  numAnywhere(param: string): number {
    const n = parseFloat(this.paramAnywhere(param));
    return Number.isFinite(n) ? n : NaN;
  }

  isYes(tab: string, subtab: string, param: string): boolean {
    const v = this.get(tab, subtab, param).trim().toLowerCase();
    return v === "1" || v === "yes" || v === "true";
  }

  isChecked(tab: string, subtab: string, param: string): boolean {
    return this.isYes(tab, subtab, param);
  }

  anyYes(tab: string, subtab: string, params: string[]): boolean {
    return params.some((p) => this.isYes(tab, subtab, p));
  }

  /** Count params with any non-empty value (Laravel row count). */
  countFilled(tab: string, subtab: string, params: string[]): number {
    let n = 0;
    for (const p of params) {
      if (this.get(tab, subtab, p).trim() !== "") n += 1;
    }
    return n;
  }

  /** Count params with value === 1. */
  countChecked(tab: string, subtab: string, params: string[]): number {
    return params.filter((p) => this.isYes(tab, subtab, p)).length;
  }

  existsChecked(tab: string, subtab: string, params: string[]): boolean {
    return this.anyYes(tab, subtab, params);
  }

  paramExists(tab: string, subtab: string, param: string): boolean {
    return this.form.data.some(
      (d) => d.tab === tab && d.subtab === subtab && d.paramName === param,
    );
  }

  /** First element of JSON array stored as string. */
  jsonFirst(tab: string, subtab: string, param: string): number {
    const raw = this.get(tab, subtab, param);
    if (!raw) return NaN;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const n = parseFloat(String(parsed[0]));
        return Number.isFinite(n) ? n : NaN;
      }
    } catch {
      /* plain number */
    }
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : NaN;
  }

  strEq(tab: string, subtab: string, param: string, expected: string): boolean {
    return this.get(tab, subtab, param).trim() === expected;
  }

  cap(score: number, max: number): number {
    return Math.min(Math.max(0, score), max);
  }

  tierHigh(
    value: number,
    bands: { min: number; points: number }[],
    useGreaterThan = false,
  ): number {
    if (!Number.isFinite(value)) return 0;
    const sorted = [...bands].sort((a, b) => b.min - a.min);
    for (const b of sorted) {
      if (useGreaterThan ? value > b.min : value >= b.min) return b.points;
    }
    return 0;
  }
}

export function resolveChecklistContext(form: CertificationFormResponse): import("./types").ChecklistScoringContext {
  const f = new ChecklistForm(form);
  const topology = f.num("project_details", "project_details", "topology_type");
  const subRating = f.num("project_details", "project_details", "sub_rating_type");
  return {
    topology: Number.isFinite(topology) ? topology : undefined,
    subRatingType: Number.isFinite(subRating) ? subRating : undefined,
  };
}

export function runRegistry(
  registry: import("./types").ChecklistScorerRegistry,
  form: CertificationFormResponse,
  tabSlug: string,
  subSlug: string,
  possiblePoints: number,
  ctx: import("./types").ChecklistScoringContext,
  special?: (key: string) => number | null,
): number | null {
  if (possiblePoints <= 0) return 0;
  const key = `${tabSlug}/${subSlug}`;
  if (special) {
    const s = special(key);
    if (s !== null) return Math.min(Math.max(0, s), possiblePoints);
  }
  const scorer = registry[key];
  if (!scorer) return null;
  const raw = scorer(form, tabSlug, subSlug, ctx);
  return Math.min(Math.max(0, raw), possiblePoints);
}
