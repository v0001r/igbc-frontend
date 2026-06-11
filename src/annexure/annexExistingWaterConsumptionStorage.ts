import {
  computeExistingWaterConsumptionState,
  emptyWaterConsumptionBuilding,
  emptyWaterConsumptionRow,
  type ExistingWaterConsumptionState,
  type WaterConsumptionRow,
} from "@/annexure/annexExistingWaterConsumptionCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

type DwellingMap = Record<string, string | string[]>;

const ROW_PARAMS = ["years_ex", "rainfall_ex", "ex_peak_month", "rainy_day"] as const;

const BUILDING_SCALAR_PARAMS = [
  "previous_year",
  "current_year",
  "percentage_current_pervious",
] as const;

function parseMap(raw: string | undefined): DwellingMap {
  if (!raw?.trim()) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) return v as DwellingMap;
  } catch {
    /* legacy plain string */
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
  minRows: number,
): number {
  let maxLen = minRows;
  for (const p of ROW_PARAMS) {
    const arr = sliceArray(maps[p] ?? {}, tableIndex, 0);
    if (arr.length > maxLen) maxLen = arr.length;
  }
  return maxLen;
}

export function hydrateExistingWaterConsumptionAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): ExistingWaterConsumptionState {
  const layout = schema.existingWaterConsumptionLayout ?? {};
  const minRows = layout.minRowsPerBuilding ?? 5;

  const maps: Record<string, DwellingMap> = {};
  for (const p of [...ROW_PARAMS, "dwelling_type", ...BUILDING_SCALAR_PARAMS]) {
    maps[p] = parseMap(getParam(form, tab, subtab, p));
  }

  const indices = towerKeys(Object.values(maps));
  const buildingCount = Math.max(layout.defaultBuildingCount ?? 1, indices.length);

  const buildings = [];
  for (let bi = 0; bi < buildingCount; bi++) {
    const tableIndex = indices[bi] ?? bi + 1;
    const rowCount = resolveRowCount(maps, tableIndex, minRows);
    const rows: WaterConsumptionRow[] = Array.from({ length: rowCount }, (_, ri) => ({
      years_ex: sliceArray(maps.years_ex ?? {}, tableIndex, rowCount)[ri] ?? "",
      rainfall_ex: sliceArray(maps.rainfall_ex ?? {}, tableIndex, rowCount)[ri] ?? "",
      ex_peak_month: sliceArray(maps.ex_peak_month ?? {}, tableIndex, rowCount)[ri] ?? "",
      rainy_day: sliceArray(maps.rainy_day ?? {}, tableIndex, rowCount)[ri] ?? "",
    }));

    buildings.push({
      tableIndex,
      dwelling_type: sliceScalar(maps.dwelling_type ?? {}, tableIndex),
      rows,
      previous_year: sliceScalar(maps.previous_year ?? {}, tableIndex),
      current_year: sliceScalar(maps.current_year ?? {}, tableIndex),
      percentage_current_pervious: sliceScalar(maps.percentage_current_pervious ?? {}, tableIndex),
    });
  }

  const draft: ExistingWaterConsumptionState = {
    buildings: buildings.length ? buildings : [emptyWaterConsumptionBuilding(1, minRows)],
  };

  return computeExistingWaterConsumptionState(draft);
}

function encodeTowerString(
  buildings: ExistingWaterConsumptionState["buildings"],
  param: keyof (typeof buildings)[number],
): string {
  const out: DwellingMap = {};
  for (const b of buildings) {
    out[String(b.tableIndex)] = String(b[param] ?? "");
  }
  return JSON.stringify(out);
}

function encodeRowParam(
  buildings: ExistingWaterConsumptionState["buildings"],
  param: (typeof ROW_PARAMS)[number],
): string {
  const out: DwellingMap = {};
  for (const b of buildings) {
    out[String(b.tableIndex)] = b.rows.map((r) => String(r[param] ?? ""));
  }
  return JSON.stringify(out);
}

export function buildSavePayloadFromExistingWaterConsumption(
  state: ExistingWaterConsumptionState,
): { paramName: string; type: string; value: string }[] {
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
    fields.push({
      paramName: param,
      type: "t",
      value: encodeTowerString(state.buildings, param),
    });
  }

  return fields;
}
