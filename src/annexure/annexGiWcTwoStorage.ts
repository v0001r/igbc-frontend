import {
  computeGiWcTwoAnnex,
  type GiWcTwoAnnexState,
  type GiWcTwoComputeContext,
  type GiWcTwoPartTimeRow,
} from "@/annexure/annexGiWcTwoCalculations";
import type { AnnexureSchemaDefinition, GiWcTwoPresetDef } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const SUMMARY_PARAMS = [
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

const FTE_PARAMS = [
  "permanent_no",
  "permanent_time",
  "permanent_fte",
  "part_time_fte",
  "transient_no",
  "transient_time",
  "transient_fte",
  "total_fte",
  "total_male_occupant",
  "total_female_occupant",
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

function presetParams(presets: GiWcTwoPresetDef[]): string[] {
  const out: string[] = [];
  for (const p of presets) {
    const prefix = p.prefix;
    out.push(
      p.occupantStatusParam,
      p.unitTypeParam,
      p.proposedUnitParam,
      `${prefix}_duration`,
      `${prefix}_daily`,
      `${prefix}_total_fte`,
      `${prefix}_base`,
      `${prefix}_unit`,
      `${prefix}_total_use`,
      `${prefix}_proposed`,
      `${prefix}_proposed_total`,
    );
  }
  return out;
}

export function hydrateGiWcTwoAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  ctx: GiWcTwoComputeContext,
): GiWcTwoAnnexState {
  const presets = schema.greenInteriorsWcTwoLayout?.presetRows ?? [];
  const scalars: Record<string, string> = {};

  for (const p of presets) {
    const prefix = p.prefix;
    scalars[p.occupantStatusParam] =
      getParam(form, tab, subtab, p.occupantStatusParam) ?? p.defaults.defaultOccupantStatus ?? "";
    scalars[p.unitTypeParam] = getParam(form, tab, subtab, p.unitTypeParam) ?? p.defaults.unit.toLowerCase();
    scalars[p.proposedUnitParam] =
      getParam(form, tab, subtab, p.proposedUnitParam) ?? p.defaults.unit.toLowerCase();
    scalars[`${prefix}_duration`] =
      getParam(form, tab, subtab, `${prefix}_duration`) ?? p.defaults.duration;
    scalars[`${prefix}_daily`] = getParam(form, tab, subtab, `${prefix}_daily`) ?? p.defaults.daily;
    scalars[`${prefix}_total_fte`] = getParam(form, tab, subtab, `${prefix}_total_fte`) ?? "";
    scalars[`${prefix}_base`] = getParam(form, tab, subtab, `${prefix}_base`) ?? "";
    scalars[`${prefix}_unit`] = getParam(form, tab, subtab, `${prefix}_unit`) ?? p.defaults.unit;
    scalars[`${prefix}_total_use`] = getParam(form, tab, subtab, `${prefix}_total_use`) ?? "0";
    scalars[`${prefix}_proposed`] = getParam(form, tab, subtab, `${prefix}_proposed`) ?? "";
    scalars[`${prefix}_proposed_total`] =
      getParam(form, tab, subtab, `${prefix}_proposed_total`) ?? "0";
  }

  for (const key of SUMMARY_PARAMS) {
    const raw = getParam(form, tab, subtab, key);
    if (key === "annual_days") {
      scalars[key] = raw ?? ctx.defaultAnnualDays ?? "365";
    } else {
      scalars[key] = raw ?? (key === "annex_mandatory" ? "Yes" : "0");
    }
  }

  const partNos = parseJsonArray(getParam(form, tab, subtab, "part_time_no"));
  const partTimes = parseJsonArray(getParam(form, tab, subtab, "part_time_emply"));
  const minRows = schema.greenInteriorsWcTwoLayout?.partTimeMinRows ?? 1;
  const rowLen = Math.max(partNos.length, partTimes.length, minRows);
  const partTimeRows: GiWcTwoPartTimeRow[] = [];
  for (let i = 0; i < rowLen; i++) {
    partTimeRows.push({
      part_time_no: partNos[i] ?? "",
      part_time_emply: partTimes[i] ?? "",
    });
  }

  const draft: GiWcTwoAnnexState = {
    permanent_no: getParam(form, tab, subtab, "permanent_no") ?? ctx.permanentNo,
    permanent_time: getParam(form, tab, subtab, "permanent_time") ?? "",
    permanent_fte: getParam(form, tab, subtab, "permanent_fte") ?? "",
    partTimeRows,
    part_time_fte: getParam(form, tab, subtab, "part_time_fte") ?? "",
    transient_no: getParam(form, tab, subtab, "transient_no") ?? ctx.transientNo,
    transient_time: getParam(form, tab, subtab, "transient_time") ?? "",
    transient_fte: getParam(form, tab, subtab, "transient_fte") ?? "",
    total_fte: getParam(form, tab, subtab, "total_fte") ?? "",
    total_male_occupant: getParam(form, tab, subtab, "total_male_occupant") ?? "",
    total_female_occupant: getParam(form, tab, subtab, "total_female_occupant") ?? "",
    scalars,
  };

  return computeGiWcTwoAnnex(draft, presets, ctx);
}

export function buildSavePayloadFromGiWcTwo(state: GiWcTwoAnnexState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  fields.push({ paramName: "permanent_no", type: "t", value: state.permanent_no });
  fields.push({ paramName: "permanent_time", type: "t", value: state.permanent_time });
  fields.push({ paramName: "permanent_fte", type: "t", value: state.permanent_fte });
  fields.push({ paramName: "part_time_fte", type: "t", value: state.part_time_fte });
  fields.push({ paramName: "transient_no", type: "t", value: state.transient_no });
  fields.push({ paramName: "transient_time", type: "t", value: state.transient_time });
  fields.push({ paramName: "transient_fte", type: "t", value: state.transient_fte });
  fields.push({ paramName: "total_fte", type: "t", value: state.total_fte });
  fields.push({ paramName: "total_male_occupant", type: "t", value: state.total_male_occupant });
  fields.push({ paramName: "total_female_occupant", type: "t", value: state.total_female_occupant });

  fields.push({
    paramName: "part_time_no",
    type: "t",
    value: JSON.stringify(state.partTimeRows.map((r) => r.part_time_no)),
  });
  fields.push({
    paramName: "part_time_emply",
    type: "t",
    value: JSON.stringify(state.partTimeRows.map((r) => r.part_time_emply)),
  });

  for (const [paramName, value] of Object.entries(state.scalars)) {
    fields.push({ paramName, type: "t", value: value ?? "" });
  }

  return fields;
}

export function listGiWcTwoParams(schema: AnnexureSchemaDefinition): string[] {
  const presets = schema.greenInteriorsWcTwoLayout?.presetRows ?? [];
  return [
    ...FTE_PARAMS,
    "part_time_no",
    "part_time_emply",
    ...presetParams(presets),
    ...SUMMARY_PARAMS,
  ];
}
