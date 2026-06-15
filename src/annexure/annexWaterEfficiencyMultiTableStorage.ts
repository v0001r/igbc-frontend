import {
  computeWaterEfficiencyMultiAnnex,
  presetFieldNames,
  type WaterEfficiencyDynamicRow,
  type WaterEfficiencyMultiAnnexState,
  type WaterEfficiencyTableState,
} from "@/annexure/annexWaterEfficiencyCalculations";
import type { AnnexureSchemaDefinition, WaterEfficiencyPresetDef } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const DYNAMIC_ARRAY_PARAMS = [
  "fixture_type",
  "shower",
  "shower_status",
  "shower_duration",
  "shower_daily",
  "shower_occupancy",
  "shower_base",
  "shower_unit",
  "shower_total_use",
  "shower_proposed",
  "shower_proposed_total",
] as const;

const SUMMARY_SCALAR_PARAMS = [
  "flush_base_total",
  "flush_proposed_total",
  "fixture_base_total",
  "fixture_proposed_total",
  "annual_days",
  "annual_flush_base",
  "annual_flush_proposed",
  "annual_fixture_base",
  "annual_fixture_proposed",
  "total_volume_base",
  "total_volume_proposed",
  "saving_annual",
  "saving_percentage",
  "annex_mandatory",
] as const;

type DwellingMap = Record<string, string | string[]>;

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

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function presetScalarParams(presets: WaterEfficiencyPresetDef[]): string[] {
  const out: string[] = [];
  for (const p of presets) {
    const fields = presetFieldNames(p);
    out.push(p.detailParam);
    out.push(
      fields.status,
      fields.duration,
      fields.daily,
      fields.occupancy,
      fields.base,
      fields.unit,
      fields.totalUse,
      fields.proposed,
      fields.proposedTotal,
    );
  }
  return out;
}

function tableIndices(maps: DwellingMap[], minTables: number, countRaw?: string): number[] {
  const keys = new Set<number>();
  for (const m of maps) {
    for (const k of Object.keys(m)) {
      const n = parseInt(k, 10);
      if (Number.isFinite(n) && n > 0) keys.add(n);
    }
  }
  const fromCount = parseInt(countRaw ?? "", 10);
  if (Number.isFinite(fromCount) && fromCount > 0) {
    for (let i = 1; i <= fromCount; i++) keys.add(i);
  }
  if (!keys.size) keys.add(1);
  const sorted = [...keys].sort((a, b) => a - b);
  while (sorted.length < minTables) sorted.push(sorted.length + 1);
  return sorted;
}

function emptyDynamicRow(occupancy: string): WaterEfficiencyDynamicRow {
  return {
    fixture_type: "",
    shower: "",
    shower_status: "",
    shower_duration: "",
    shower_daily: "",
    shower_occupancy: occupancy,
    shower_base: "",
    shower_unit: "",
    shower_total_use: "0",
    shower_proposed: "",
    shower_proposed_total: "0",
  };
}

function hydrateTable(
  tableIndex: number,
  presets: WaterEfficiencyPresetDef[],
  maps: Record<string, DwellingMap>,
  tableNameParam: string,
  minDynamicRows: number,
  occupancyDefault: string,
): WaterEfficiencyTableState {
  const scalars: Record<string, string> = {};
  scalars[tableNameParam] = sliceScalar(maps[tableNameParam] ?? {}, tableIndex);

  for (const p of presets) {
    const fields = presetFieldNames(p);
    scalars[p.detailParam] = sliceScalar(maps[p.detailParam] ?? {}, tableIndex);
    scalars[fields.status] = sliceScalar(maps[fields.status] ?? {}, tableIndex);
    scalars[fields.duration] =
      sliceScalar(maps[fields.duration] ?? {}, tableIndex) || p.defaults.duration || "";
    scalars[fields.daily] = sliceScalar(maps[fields.daily] ?? {}, tableIndex) || p.defaults.daily || "";
    scalars[fields.occupancy] =
      sliceScalar(maps[fields.occupancy] ?? {}, tableIndex) || occupancyDefault;
    scalars[fields.base] = sliceScalar(maps[fields.base] ?? {}, tableIndex) || p.defaults.base || "";
    scalars[fields.unit] = sliceScalar(maps[fields.unit] ?? {}, tableIndex) || p.defaults.unit || "";
    scalars[fields.totalUse] = sliceScalar(maps[fields.totalUse] ?? {}, tableIndex) || "0";
    scalars[fields.proposed] = sliceScalar(maps[fields.proposed] ?? {}, tableIndex);
    scalars[fields.proposedTotal] = sliceScalar(maps[fields.proposedTotal] ?? {}, tableIndex) || "0";
  }

  for (const key of SUMMARY_SCALAR_PARAMS) {
    const raw = sliceScalar(maps[key] ?? {}, tableIndex);
    scalars[key] = key === "annual_days" ? raw || "365" : raw || (key === "annex_mandatory" ? "Yes" : "0");
  }

  const rowLen = Math.max(
    minDynamicRows,
    ...DYNAMIC_ARRAY_PARAMS.map((param) => {
      const v = maps[param]?.[String(tableIndex)];
      return Array.isArray(v) ? v.length : 0;
    }),
  );

  const dynamicRows: WaterEfficiencyDynamicRow[] = [];
  for (let i = 0; i < rowLen; i++) {
    dynamicRows.push({
      fixture_type: sliceArray(maps.fixture_type ?? {}, tableIndex, rowLen)[i] ?? "",
      shower: sliceArray(maps.shower ?? {}, tableIndex, rowLen)[i] ?? "",
      shower_status: sliceArray(maps.shower_status ?? {}, tableIndex, rowLen)[i] ?? "",
      shower_duration: sliceArray(maps.shower_duration ?? {}, tableIndex, rowLen)[i] ?? "",
      shower_daily: sliceArray(maps.shower_daily ?? {}, tableIndex, rowLen)[i] ?? "",
      shower_occupancy:
        sliceArray(maps.shower_occupancy ?? {}, tableIndex, rowLen)[i] || occupancyDefault,
      shower_base: sliceArray(maps.shower_base ?? {}, tableIndex, rowLen)[i] ?? "",
      shower_unit: sliceArray(maps.shower_unit ?? {}, tableIndex, rowLen)[i] ?? "",
      shower_total_use: sliceArray(maps.shower_total_use ?? {}, tableIndex, rowLen)[i] ?? "0",
      shower_proposed: sliceArray(maps.shower_proposed ?? {}, tableIndex, rowLen)[i] ?? "",
      shower_proposed_total: sliceArray(maps.shower_proposed_total ?? {}, tableIndex, rowLen)[i] ?? "0",
    });
  }
  if (dynamicRows.length === 0) dynamicRows.push(emptyDynamicRow(occupancyDefault));

  return { tableIndex, tableName: scalars[tableNameParam] ?? "", scalars, dynamicRows };
}

export function hydrateWaterEfficiencyMultiTable(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): WaterEfficiencyMultiAnnexState {
  const layout = schema.waterEfficiencyLayout!;
  const presets = layout.presetRows ?? [];
  const tableNameParam = layout.tableNameParam ?? "annex_table_name";
  const minTables = layout.minTables ?? 1;
  const minDynamicRows = layout.minDynamicRows ?? 1;
  const occupancyDefault = "0";

  const scalarParams = [
    tableNameParam,
    ...presetScalarParams(presets),
    ...SUMMARY_SCALAR_PARAMS,
  ];

  const maps: Record<string, DwellingMap> = {};
  for (const param of [...scalarParams, ...DYNAMIC_ARRAY_PARAMS]) {
    maps[param] = parseMap(getParam(form, tab, subtab, param));
  }

  const indices = tableIndices(
    Object.values(maps),
    minTables,
    getParam(form, tab, subtab, "annex_tbody_count"),
  );

  const tables = indices.map((tableIndex) =>
    hydrateTable(tableIndex, presets, maps, tableNameParam, minDynamicRows, occupancyDefault),
  );

  const agg = layout.aggregateParams ?? {};
  const draft: WaterEfficiencyMultiAnnexState = {
    tables,
    aggregates: {
      total_volume_base_tb: getParam(form, tab, subtab, agg.totalVolumeBase ?? "total_volume_base_tb") ?? "0",
      total_volume_proposed_tb:
        getParam(form, tab, subtab, agg.totalVolumeProposed ?? "total_volume_proposed_tb") ?? "0",
      saving_percentage_tb:
        getParam(form, tab, subtab, agg.savingPercentage ?? "saving_percentage_tb") ?? "0",
    },
  };

  return computeWaterEfficiencyMultiAnnex(draft, presets, occupancyDefault);
}

function writeScalarMap(
  tables: WaterEfficiencyTableState[],
  param: string,
  pick: (table: WaterEfficiencyTableState) => string,
): string {
  const map: DwellingMap = {};
  for (const table of tables) {
    map[String(table.tableIndex)] = pick(table);
  }
  return JSON.stringify(map);
}

function writeArrayMap(
  tables: WaterEfficiencyTableState[],
  param: keyof WaterEfficiencyDynamicRow,
): string {
  const map: DwellingMap = {};
  for (const table of tables) {
    map[String(table.tableIndex)] = table.dynamicRows.map((r) => r[param] ?? "");
  }
  return JSON.stringify(map);
}

export function buildSavePayloadFromWaterEfficiencyMultiTable(
  schema: AnnexureSchemaDefinition,
  state: WaterEfficiencyMultiAnnexState,
): { paramName: string; type: string; value: string }[] {
  const layout = schema.waterEfficiencyLayout!;
  const presets = layout.presetRows ?? [];
  const tableNameParam = layout.tableNameParam ?? "annex_table_name";
  const agg = layout.aggregateParams ?? {};
  const fields: { paramName: string; type: string; value: string }[] = [];

  fields.push({
    paramName: "annex_tbody_count",
    type: "t",
    value: String(state.tables.length),
  });

  fields.push({
    paramName: tableNameParam,
    type: "t",
    value: writeScalarMap(state.tables, tableNameParam, (t) => t.scalars[tableNameParam] ?? ""),
  });

  for (const p of presets) {
    const pf = presetFieldNames(p);
    fields.push({
      paramName: p.detailParam,
      type: "t",
      value: writeScalarMap(state.tables, p.detailParam, (t) => t.scalars[p.detailParam] ?? ""),
    });
    for (const param of [
      pf.status,
      pf.duration,
      pf.daily,
      pf.occupancy,
      pf.base,
      pf.unit,
      pf.totalUse,
      pf.proposed,
      pf.proposedTotal,
    ]) {
      fields.push({
        paramName: param,
        type: "t",
        value: writeScalarMap(state.tables, param, (t) => t.scalars[param] ?? ""),
      });
    }
  }

  for (const param of DYNAMIC_ARRAY_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: writeArrayMap(state.tables, param),
    });
  }

  for (const key of SUMMARY_SCALAR_PARAMS) {
    fields.push({
      paramName: key,
      type: "t",
      value: writeScalarMap(state.tables, key, (t) => t.scalars[key] ?? ""),
    });
  }

  fields.push({
    paramName: agg.totalVolumeBase ?? "total_volume_base_tb",
    type: "t",
    value: state.aggregates.total_volume_base_tb,
  });
  fields.push({
    paramName: agg.totalVolumeProposed ?? "total_volume_proposed_tb",
    type: "t",
    value: state.aggregates.total_volume_proposed_tb,
  });
  fields.push({
    paramName: agg.savingPercentage ?? "saving_percentage_tb",
    type: "t",
    value: state.aggregates.saving_percentage_tb,
  });

  // Flat saving_percentage for checklist related_to on first table
  const firstSaving = state.tables[0]?.scalars.saving_percentage ?? state.aggregates.saving_percentage_tb;
  fields.push({ paramName: "saving_percentage", type: "t", value: firstSaving });

  return fields;
}
