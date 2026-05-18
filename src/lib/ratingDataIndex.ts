import type { CertificationFormResponse } from "@/lib/certificationForm";

/** Fast lookups over normalized certification form rows (Laravel `__get_rating_data` / relation helpers). */
export class RatingDataIndex {
  constructor(private readonly form: CertificationFormResponse) {}

  /** Value for exact tab + subtab + param. */
  get(tab: string, subtab: string, paramName: string): string {
    const row = this.form.data.find(
      (d) => d.tab === tab && d.subtab === subtab && d.paramName === paramName,
    );
    return row?.value ?? "";
  }

  /** First non-empty value for param anywhere in the project. */
  getParamAnywhere(paramName: string): string {
    const row = this.form.data.find((d) => d.paramName === paramName && (d.value ?? "").trim() !== "");
    return row?.value ?? "";
  }

  /**
   * Cross-tab param lookup (Laravel `__get_rating_relation_data`).
   * Prefers rows under `preferTab`, then any tab.
   */
  getRelated(paramName: string, preferTab?: string): string {
    if (!paramName) return "";
    if (preferTab) {
      const inTab = this.form.data.find(
        (d) => d.tab === preferTab && d.paramName === paramName && (d.value ?? "").trim() !== "",
      );
      if (inTab?.value != null) return inTab.value;
    }
    return this.getParamAnywhere(paramName);
  }

  /** Parse JSON array stored as string (annex-derived values in Laravel). */
  getRelatedFirst(paramName: string, preferTab?: string): string {
    const raw = this.getRelated(paramName, preferTab);
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) return String(parsed[0] ?? "");
    } catch {
      /* plain string */
    }
    return raw;
  }

  documentNames(tab: string, subtab: string, paramName: string): string {
    return this.form.documents
      .filter((d) => d.tab === tab && d.subtab === subtab && d.paramName === paramName)
      .map((d) => d.fileName)
      .join(", ");
  }
}
