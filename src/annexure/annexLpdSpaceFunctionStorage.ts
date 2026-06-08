import type { AreaSourceRow } from "@/annexure/annexConditionedSpacesCalculations";
import {
  computeLpdSpaceFunctionState,
  emptyLpdSpaceFunctionRow,
  filterLpdSpaceSourceRows,
  sqftToSqmLpd,
  type LpdSpaceBaselineEntry,
  type LpdSpaceFunctionRow,
  type LpdSpaceFunctionState,
} from "@/annexure/annexLpdSpaceFunctionCalculations";
import { loadAreaSourceRows } from "@/annexure/annexConditionedSpacesStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_PARAMS = [
  "reqularly_occupied_spaces",
  "applicable_space_lpd",
  "carpet_area_lpd",
  "lighting_fixture_type",
  "no_of_lighting_fixture",
  "wattage_of_each_lighting_fixture",
  "total_wattage_lpd",
  "design_lpd_space",
  "baseline_space_lpd",
  "lpd_reduction_space",
] as const;

const SUMMARY_PARAMS = [
  "total_carpet_area_lpd",
  "amount_lpd_reduction_space",
  "total_regularly_occupied_area",
] as const;

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map((x) => (x == null ? "" : String(x))) : [];
  } catch {
    return [];
  }
}

function parseSummaryScalar(raw: string | undefined, fallback = ""): string {
  const arr = parseJsonArray(raw);
  return arr[0] ?? fallback;
}

function rowFromArrays(
  rowId: number,
  sourceIndex: number | null,
  arrays: Record<(typeof ROW_PARAMS)[number], string[]>,
  idx: number,
  src?: AreaSourceRow,
): LpdSpaceFunctionRow {
  const pick = (p: (typeof ROW_PARAMS)[number]) => arrays[p][idx] ?? "";
  return {
    rowId,
    sourceIndex,
    reqularly_occupied_spaces:
      pick("reqularly_occupied_spaces") || src?.reqularly_occupied_spaces || "",
    applicable_space_lpd: pick("applicable_space_lpd"),
    carpet_area_lpd:
      pick("carpet_area_lpd") || (src ? sqftToSqmLpd(src.total_carpet_area_circulation) : ""),
    lighting_fixture_type: pick("lighting_fixture_type"),
    no_of_lighting_fixture: pick("no_of_lighting_fixture"),
    wattage_of_each_lighting_fixture: pick("wattage_of_each_lighting_fixture"),
    total_wattage_lpd: pick("total_wattage_lpd"),
    design_lpd_space: pick("design_lpd_space"),
    baseline_space_lpd: pick("baseline_space_lpd"),
    lpd_reduction_space: pick("lpd_reduction_space"),
  };
}

export function spaceBaselineCatalogFromSchema(
  schema: AnnexureSchemaDefinition,
): LpdSpaceBaselineEntry[] {
  const entries = schema.lpdSpaceFunctionLayout?.spaceBaselines ?? [];
  return entries.map((e) => ({ slug: e.slug, label: e.label, baseline: e.baseline }));
}

export function hydrateLpdSpaceFunctionAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): LpdSpaceFunctionState {
  const catalog = spaceBaselineCatalogFromSchema(schema);
  const minRows = schema.lpdSpaceFunctionLayout?.minRows ?? 5;
  const sources = filterLpdSpaceSourceRows(loadAreaSourceRows(form));

  const saved: Record<(typeof ROW_PARAMS)[number], string[]> = {} as Record<
    (typeof ROW_PARAMS)[number],
    string[]
  >;
  for (const p of ROW_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const savedLen = Math.max(...ROW_PARAMS.map((p) => saved[p].length), 0);
  const targetLen = Math.max(savedLen, sources.length, minRows);

  const rows: LpdSpaceFunctionRow[] = [];
  for (let i = 0; i < targetLen; i++) {
    const src = sources[i];
    rows.push(
      rowFromArrays(i + 1, src?.sourceIndex ?? null, saved, i, src),
    );
  }

  const draft: LpdSpaceFunctionState = {
    rows,
    total_carpet_area_lpd: parseSummaryScalar(getParam(form, tab, subtab, "total_carpet_area_lpd")),
    amount_lpd_reduction_space: parseSummaryScalar(
      getParam(form, tab, subtab, "amount_lpd_reduction_space"),
    ),
    total_regularly_occupied_area: parseSummaryScalar(
      getParam(form, tab, subtab, "total_regularly_occupied_area"),
    ),
  };

  return computeLpdSpaceFunctionState(draft, catalog);
}

export function buildSavePayloadFromLpdSpaceFunction(state: LpdSpaceFunctionState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of ROW_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(
        state.rows.map((r) => (r as unknown as Record<string, string>)[p] ?? ""),
      ),
    });
  }

  for (const p of SUMMARY_PARAMS) {
    const val = state[p as keyof LpdSpaceFunctionState] as string;
    fields.push({ paramName: p, type: "t", value: JSON.stringify([val]) });
  }

  return fields;
}

export { emptyLpdSpaceFunctionRow };
