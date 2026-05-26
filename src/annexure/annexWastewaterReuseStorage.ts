import { computeWastewaterReuseAnnex, type WastewaterReuseScalars } from "@/annexure/annexWastewaterReuseCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const TREATMENT_PARAMS = [
  "waste_water_generated",
  "stp_capacity",
  "stp_efficency",
  "treated_daily_water",
  "treated_water_percent",
  "reuse_water_percent",
] as const;

const REUSE_TOTAL_PARAMS = ["reuse_daily_total", "reuse_annual_total"] as const;

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

export function listWastewaterReuseParams(schema: AnnexureSchemaDefinition): string[] {
  const layout = schema.wastewaterReuseLayout;
  if (!layout) return [];
  const reuse = layout.reuseSection.rows.flatMap((r) => [r.dailyParam, r.annualParam]);
  return [...new Set([...TREATMENT_PARAMS, ...reuse, ...REUSE_TOTAL_PARAMS])];
}

export function hydrateWastewaterReuseAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  stpCapacityFromDetails: string,
): WastewaterReuseScalars {
  const layout = schema.wastewaterReuseLayout!;
  const params = listWastewaterReuseParams(schema);
  const scalars: WastewaterReuseScalars = {};
  for (const p of params) {
    scalars[p] = getParam(form, tab, subtab, p) ?? "";
  }

  const src = layout.wasteFromAnnex;
  const wcTab = src?.tab ?? tab;
  const wcSubtab = src?.subtab ?? "annex_wc_two";
  const flush = getParam(form, wcTab, wcSubtab, src?.flushParam ?? "flush_proposed_total") ?? "0";
  const flow = getParam(form, wcTab, wcSubtab, src?.flowParam ?? "fixture_proposed_total") ?? "0";
  const wasteGenerated = (parseFloat(flush) + parseFloat(flow)).toFixed(2);

  const stpCapacity = stpCapacityFromDetails || scalars.stp_capacity || "";

  return computeWastewaterReuseAnnex({
    scalars,
    wasteGenerated,
    stpCapacity,
    reuseRows: layout.reuseSection.rows,
    annualDays: layout.annualDays ?? 365,
  });
}

export function buildSavePayloadFromWastewaterReuse(
  scalars: WastewaterReuseScalars,
  schema: AnnexureSchemaDefinition,
) {
  return listWastewaterReuseParams(schema).map((paramName) => ({
    paramName,
    type: "t",
    value: scalars[paramName] ?? "",
  }));
}
