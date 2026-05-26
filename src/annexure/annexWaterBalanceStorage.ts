import { computeWaterBalanceAnnex, type WaterBalanceScalars } from "@/annexure/annexWaterBalanceCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

export function listWaterBalanceParams(schema: AnnexureSchemaDefinition): string[] {
  const layout = schema.waterBalanceLayout;
  if (!layout) return [];
  const params: string[] = [];
  for (const section of layout.sections) {
    for (const row of section.rows) {
      params.push(row.dailyParam, row.annualParam);
    }
    params.push(section.totalDailyParam, section.totalAnnualParam);
  }
  return [...new Set(params)];
}

export function hydrateWaterBalanceAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): { scalars: WaterBalanceScalars; validity: "Valid" | "In-Valid" } {
  const layout = schema.waterBalanceLayout!;
  const params = listWaterBalanceParams(schema);
  const scalars: WaterBalanceScalars = {};
  for (const p of params) {
    scalars[p] = getParam(form, tab, subtab, p) ?? "";
  }

  const src = layout.consumptionFromAnnex;
  const wcTwoTab = src?.tab ?? tab;
  const wcTwoSubtab = src?.subtab ?? "annex_wc_two";
  const flushDaily =
    getParam(form, wcTwoTab, wcTwoSubtab, src?.flushDailyParam ?? "flush_proposed_total") ?? "";
  const flowDaily =
    getParam(form, wcTwoTab, wcTwoSubtab, src?.flowDailyParam ?? "fixture_proposed_total") ?? "";

  return computeWaterBalanceAnnex(scalars, layout, flushDaily, flowDaily);
}

export function buildSavePayloadFromWaterBalance(scalars: WaterBalanceScalars, schema: AnnexureSchemaDefinition) {
  return listWaterBalanceParams(schema).map((paramName) => ({
    paramName,
    type: "t",
    value: scalars[paramName] ?? "",
  }));
}
