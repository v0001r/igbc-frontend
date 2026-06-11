import {
  computeExistingWaterEfficiencyState,
  emptyBuilding,
  emptyFixtureRow,
  rowFromLockedTemplate,
  type ExistingWaterEfficiencyBuilding,
  type ExistingWaterEfficiencyLockedRowDef,
  type ExistingWaterEfficiencyRow,
  type ExistingWaterEfficiencyState,
} from "@/annexure/annexExistingWaterEfficiencyCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

type DwellingMap = Record<string, string | string[]>;

const ROW_PARAMS = [
  "fixture_type",
  "fixture_detail",
  "duration",
  "daily_uses",
  "fte",
  "baseline_flow",
  "baseline_flow_proposed",
] as const;

const BUILDING_SCALAR_PARAMS = [
  "flush_base_total",
  "flush_proposed_total",
  "annual_days",
  "annual_water_flush",
  "fixture_flow_vol",
  "saving_percentage",
  "annex_mandatory",
] as const;

function parseMap(raw: string | undefined): DwellingMap {
  if (!raw?.trim()) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) return v as DwellingMap;
  } catch {
    /* plain string legacy */
  }
  return { "1": raw };
}

function sliceScalar(map: DwellingMap, tableIndex: number): string {
  const v = map[String(tableIndex)];
  if (Array.isArray(v)) return String(v[0] ?? "");
  return v != null ? String(v) : "";
}

function sliceArray(map: DwellingMap, tableIndex: number, len: number): string[] {
  const v = map[String(tableIndex)];
  const arr = Array.isArray(v) ? v.map((x) => String(x ?? "")) : [];
  while (arr.length < len) arr.push("");
  return arr.slice(0, len);
}

function towerKeys(maps: DwellingMap[]): number[] {
  const keys = new Set<number>();
  for (const m of maps) {
    for (const k of Object.keys(m)) {
      const n = parseInt(k, 10);
      if (Number.isFinite(n) && n > 0) keys.add(n);
    }
  }
  return keys.size ? [...keys].sort((a, b) => a - b) : [1];
}

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function resolveRowCount(
  maps: Record<string, DwellingMap>,
  tableIndex: number,
  lockedRows: ExistingWaterEfficiencyLockedRowDef[],
  minRows: number,
): number {
  let maxLen = Math.max(minRows, lockedRows.length || 1);
  for (const p of ROW_PARAMS) {
    const arr = sliceArray(maps[p] ?? {}, tableIndex, 0);
    if (arr.length > maxLen) maxLen = arr.length;
  }
  return maxLen;
}

function hydrateRow(
  maps: Record<string, DwellingMap>,
  tableIndex: number,
  rowIndex: number,
  lockedRows: ExistingWaterEfficiencyLockedRowDef[],
): ExistingWaterEfficiencyRow {
  const saved: ExistingWaterEfficiencyRow = {
    ...emptyFixtureRow(),
    fixture_type: sliceArray(maps.fixture_type ?? {}, tableIndex, rowIndex + 1)[rowIndex] ?? "",
    fixture_detail: sliceArray(maps.fixture_detail ?? {}, tableIndex, rowIndex + 1)[rowIndex] ?? "",
    duration: sliceArray(maps.duration ?? {}, tableIndex, rowIndex + 1)[rowIndex] ?? "",
    daily_uses: sliceArray(maps.daily_uses ?? {}, tableIndex, rowIndex + 1)[rowIndex] ?? "",
    fte: sliceArray(maps.fte ?? {}, tableIndex, rowIndex + 1)[rowIndex] ?? "",
    baseline_flow: sliceArray(maps.baseline_flow ?? {}, tableIndex, rowIndex + 1)[rowIndex] ?? "",
    baseline_flow_proposed:
      sliceArray(maps.baseline_flow_proposed ?? {}, tableIndex, rowIndex + 1)[rowIndex] ?? "",
  };

  if (rowIndex < lockedRows.length) {
    const template = lockedRows[rowIndex];
    const merged = rowFromLockedTemplate(template);
    return {
      ...merged,
      fixture_type: saved.fixture_type || merged.fixture_type,
      fixture_detail: saved.fixture_detail || merged.fixture_detail,
      duration: saved.duration || merged.duration,
      daily_uses: saved.daily_uses || merged.daily_uses,
      fte: saved.fte || merged.fte,
      baseline_flow: saved.baseline_flow || merged.baseline_flow,
      baseline_flow_proposed: saved.baseline_flow_proposed || merged.baseline_flow_proposed,
    };
  }

  return saved;
}

export function hydrateExistingWaterEfficiencyAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): ExistingWaterEfficiencyState {
  const layout = schema.existingWaterEfficiencyLayout ?? {};
  const lockedRows = layout.lockedRows ?? [];
  const minRows = layout.minRowsPerBuilding ?? 1;

  const maps: Record<string, DwellingMap> = {};
  for (const p of [...ROW_PARAMS, "dwelling_type", ...BUILDING_SCALAR_PARAMS]) {
    maps[p] = parseMap(getParam(form, tab, subtab, p));
  }

  const indices = towerKeys(Object.values(maps));
  const buildingCount = Math.max(layout.defaultBuildingCount ?? 1, indices.length);

  const buildings: ExistingWaterEfficiencyBuilding[] = [];
  for (let bi = 0; bi < buildingCount; bi++) {
    const tableIndex = indices[bi] ?? bi + 1;
    const rowCount = resolveRowCount(maps, tableIndex, lockedRows, minRows);
    const rows = Array.from({ length: rowCount }, (_, ri) =>
      hydrateRow(maps, tableIndex, ri, lockedRows),
    );

    buildings.push({
      tableIndex,
      dwelling_type: sliceScalar(maps.dwelling_type ?? {}, tableIndex),
      rows,
      flush_base_total: sliceScalar(maps.flush_base_total ?? {}, tableIndex),
      flush_proposed_total: sliceScalar(maps.flush_proposed_total ?? {}, tableIndex),
      annual_days: sliceScalar(maps.annual_days ?? {}, tableIndex) || "365",
      annual_water_flush: sliceScalar(maps.annual_water_flush ?? {}, tableIndex),
      fixture_flow_vol: sliceScalar(maps.fixture_flow_vol ?? {}, tableIndex),
      saving_percentage: sliceScalar(maps.saving_percentage ?? {}, tableIndex),
      annex_mandatory: sliceScalar(maps.annex_mandatory ?? {}, tableIndex),
    });
  }

  const draft: ExistingWaterEfficiencyState = {
    buildings: buildings.length ? buildings : [emptyBuilding(1, lockedRows)],
    overallsavedpercentage: getParam(form, tab, subtab, "overallsavedpercentage") ?? "0.00",
  };

  return computeExistingWaterEfficiencyState(draft);
}

function encodeTowerString(
  towers: ExistingWaterEfficiencyBuilding[],
  param: keyof ExistingWaterEfficiencyBuilding,
): string {
  const out: DwellingMap = {};
  for (const t of towers) {
    out[String(t.tableIndex)] = String(t[param] ?? "");
  }
  return JSON.stringify(out);
}

function encodeRowParam(
  towers: ExistingWaterEfficiencyBuilding[],
  param: (typeof ROW_PARAMS)[number],
): string {
  const out: DwellingMap = {};
  for (const t of towers) {
    out[String(t.tableIndex)] = t.rows.map((r) => String(r[param] ?? ""));
  }
  return JSON.stringify(out);
}

export function buildSavePayloadFromExistingWaterEfficiency(
  schema: AnnexureSchemaDefinition,
  state: ExistingWaterEfficiencyState,
): { paramName: string; type: string; value: string }[] {
  const layout = schema.existingWaterEfficiencyLayout ?? {};
  const fields: { paramName: string; type: string; value: string }[] = [];

  fields.push({
    paramName: "dwelling_type",
    type: "t",
    value: encodeTowerString(state.buildings, "dwelling_type"),
  });

  for (const param of ROW_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: encodeRowParam(state.buildings, param),
    });
  }

  for (const param of BUILDING_SCALAR_PARAMS) {
    if (param === "annex_mandatory" && layout.saveAnnexMandatory === false) continue;
    fields.push({
      paramName: param,
      type: "t",
      value: encodeTowerString(state.buildings, param),
    });
  }

  if (layout.saveOverallsavedpercentage !== false) {
    fields.push({
      paramName: "overallsavedpercentage",
      type: "t",
      value: state.overallsavedpercentage,
    });
  }

  return fields;
}
