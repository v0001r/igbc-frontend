import {
  computeWaterEfficiencyAnnex,
  presetFieldNames,
  type WaterEfficiencyAnnexState,
  type WaterEfficiencyDynamicRow,
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

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map((x) => (x == null ? "" : String(x))) : [];
  } catch {
    return [];
  }
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

export function listWaterEfficiencyParams(schema: AnnexureSchemaDefinition): string[] {
  const presets = schema.waterEfficiencyLayout?.presetRows ?? [];
  return [
    ...presetScalarParams(presets),
    ...DYNAMIC_ARRAY_PARAMS,
    ...SUMMARY_SCALAR_PARAMS,
  ];
}

function emptyDynamicRow(): WaterEfficiencyDynamicRow {
  return {
    fixture_type: "",
    shower: "",
    shower_status: "",
    shower_duration: "",
    shower_daily: "",
    shower_occupancy: "",
    shower_base: "",
    shower_unit: "",
    shower_total_use: "0",
    shower_proposed: "",
    shower_proposed_total: "0",
  };
}

export function hydrateWaterEfficiencyAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  occupancy: string,
): WaterEfficiencyAnnexState {
  const presets = schema.waterEfficiencyLayout?.presetRows ?? [];
  const scalars: Record<string, string> = {};

  for (const p of presets) {
    const fields = presetFieldNames(p);
    scalars[p.detailParam] = getParam(form, tab, subtab, p.detailParam) ?? "";
    scalars[fields.status] = getParam(form, tab, subtab, fields.status) ?? "";
    scalars[fields.duration] =
      getParam(form, tab, subtab, fields.duration) ?? p.defaults.duration ?? "";
    scalars[fields.daily] = getParam(form, tab, subtab, fields.daily) ?? p.defaults.daily ?? "";
    scalars[fields.occupancy] =
      getParam(form, tab, subtab, fields.occupancy) ?? occupancy;
    scalars[fields.base] = getParam(form, tab, subtab, fields.base) ?? p.defaults.base ?? "";
    scalars[fields.unit] = getParam(form, tab, subtab, fields.unit) ?? p.defaults.unit ?? "";
    scalars[fields.totalUse] = getParam(form, tab, subtab, fields.totalUse) ?? "0";
    scalars[fields.proposed] = getParam(form, tab, subtab, fields.proposed) ?? "";
    scalars[fields.proposedTotal] =
      getParam(form, tab, subtab, fields.proposedTotal) ?? "0";
  }

  for (const key of SUMMARY_SCALAR_PARAMS) {
    const raw = getParam(form, tab, subtab, key);
    if (key === "annual_days") scalars[key] = raw ?? "365";
    else scalars[key] = raw ?? (key === "annex_mandatory" ? "Yes" : "0");
  }

  const arrays: Record<string, string[]> = {};
  for (const param of DYNAMIC_ARRAY_PARAMS) {
    arrays[param] = parseJsonArray(getParam(form, tab, subtab, param));
  }

  const rowLen = Math.max(
    arrays.fixture_type.length,
    arrays.shower.length,
    schema.waterEfficiencyLayout?.minDynamicRows ?? 1,
  );

  const dynamicRows: WaterEfficiencyDynamicRow[] = [];
  for (let i = 0; i < rowLen; i++) {
    dynamicRows.push({
      fixture_type: arrays.fixture_type[i] ?? "",
      shower: arrays.shower[i] ?? "",
      shower_status: arrays.shower_status[i] ?? "",
      shower_duration: arrays.shower_duration[i] ?? "",
      shower_daily: arrays.shower_daily[i] ?? "",
      shower_occupancy: arrays.shower_occupancy[i] ?? occupancy,
      shower_base: arrays.shower_base[i] ?? "",
      shower_unit: arrays.shower_unit[i] ?? "",
      shower_total_use: arrays.shower_total_use[i] ?? "0",
      shower_proposed: arrays.shower_proposed[i] ?? "",
      shower_proposed_total: arrays.shower_proposed_total[i] ?? "0",
    });
  }

  if (dynamicRows.length === 0) dynamicRows.push(emptyDynamicRow());

  return computeWaterEfficiencyAnnex({ scalars, dynamicRows }, presets, occupancy);
}

export function buildSavePayloadFromWaterEfficiency(
  schema: AnnexureSchemaDefinition,
  state: WaterEfficiencyAnnexState,
): { paramName: string; type: string; value: string }[] {
  const presets = schema.waterEfficiencyLayout?.presetRows ?? [];
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of presets) {
    const pf = presetFieldNames(p);
    fields.push({ paramName: p.detailParam, type: "t", value: state.scalars[p.detailParam] ?? "" });
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
      fields.push({ paramName: param, type: "t", value: state.scalars[param] ?? "" });
    }
  }

  for (const param of DYNAMIC_ARRAY_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: JSON.stringify(state.dynamicRows.map((r) => r[param] ?? "")),
    });
  }

  for (const key of SUMMARY_SCALAR_PARAMS) {
    fields.push({ paramName: key, type: "t", value: state.scalars[key] ?? "" });
  }

  return fields;
}
