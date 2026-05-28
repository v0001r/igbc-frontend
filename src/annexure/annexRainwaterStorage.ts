import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import type { RowRecord } from "@/annexure/annexureExprEval";

export type RainfallRowState = {
  years: string;
  peak_month: string;
  rainfall: string;
};

export type RainwaterAnnexState = {
  location: string;
  rainfallRows: RainfallRowState[];
  average: string;
  case: string;
  oneday: string;
  caseRange: string;
  surfaceRows: RowRecord[];
  total_rain: string;
  mandatory_harvesting: string;
  harvesting: string;
  requirment: string;
  avg_rainfall: string;
};

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

export function hydrateRainwaterAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  harvestingCapacity: string,
): RainwaterAnnexState {
  const fixed = schema.rainwaterLayout?.rainfall?.fixedRowCount ?? 5;
  const years = parseJsonArray(getParam(form, tab, subtab, "years"));
  const peakMonth = parseJsonArray(getParam(form, tab, subtab, "peak_month"));
  const rainfall = parseJsonArray(getParam(form, tab, subtab, "rainfall"));

  const rainfallRows: RainfallRowState[] = [];
  for (let i = 0; i < fixed; i++) {
    rainfallRows.push({
      years: years[i] ?? "",
      peak_month: peakMonth[i] ?? "",
      rainfall: rainfall[i] ?? "",
    });
  }

  const surfaceLen = Math.max(
    parseJsonArray(getParam(form, tab, subtab, "surface")).length,
    parseJsonArray(getParam(form, tab, subtab, "area")).length,
    schema.rainwaterLayout?.surfaceTable?.defaultRowCount ?? 6,
  );

  const surfaceRows: RowRecord[] = [];
  const surfaces = parseJsonArray(getParam(form, tab, subtab, "surface"));
  const runoffs = parseJsonArray(getParam(form, tab, subtab, "runoff"));
  const areas = parseJsonArray(getParam(form, tab, subtab, "area"));
  const imps = parseJsonArray(getParam(form, tab, subtab, "imprevious_area"));

  for (let i = 0; i < surfaceLen; i++) {
    surfaceRows.push({
      surface: surfaces[i] ?? "",
      runoff: runoffs[i] ?? "",
      area: areas[i] ?? "",
      imprevious_area: imps[i] ?? "0",
    });
  }

  return {
    location: getParam(form, tab, subtab, "location") ?? "",
    rainfallRows,
    average: getParam(form, tab, subtab, "average") ?? "",
    case: getParam(form, tab, subtab, "case") ?? "",
    oneday: getParam(form, tab, subtab, "oneday") ?? "",
    caseRange: "",
    surfaceRows,
    total_rain: getParam(form, tab, subtab, "total_rain") ?? "",
    mandatory_harvesting: getParam(form, tab, subtab, "mandatory_harvesting") ?? "",
    harvesting: harvestingCapacity,
    requirment: getParam(form, tab, subtab, "requirment") ?? "",
    avg_rainfall: getParam(form, tab, subtab, "avg_rainfall") ?? "",
  };
}

export function buildSavePayloadFromRainwater(
  state: RainwaterAnnexState,
): { paramName: string; type: string; value: string }[] {
  const fields: { paramName: string; type: string; value: string }[] = [
    { paramName: "location", type: "t", value: state.location },
    { paramName: "years", type: "t", value: JSON.stringify(state.rainfallRows.map((r) => r.years)) },
    { paramName: "peak_month", type: "t", value: JSON.stringify(state.rainfallRows.map((r) => r.peak_month)) },
    { paramName: "rainfall", type: "t", value: JSON.stringify(state.rainfallRows.map((r) => r.rainfall)) },
    { paramName: "average", type: "t", value: state.average },
    { paramName: "case", type: "t", value: state.case },
    { paramName: "oneday", type: "t", value: state.oneday },
    { paramName: "surface", type: "t", value: JSON.stringify(state.surfaceRows.map((r) => r.surface ?? "")) },
    { paramName: "runoff", type: "t", value: JSON.stringify(state.surfaceRows.map((r) => r.runoff ?? "")) },
    { paramName: "area", type: "t", value: JSON.stringify(state.surfaceRows.map((r) => r.area ?? "")) },
    {
      paramName: "imprevious_area",
      type: "t",
      value: JSON.stringify(state.surfaceRows.map((r) => r.imprevious_area ?? "")),
    },
    { paramName: "total_rain", type: "t", value: state.total_rain },
    { paramName: "mandatory_harvesting", type: "t", value: state.mandatory_harvesting },
    { paramName: "requirment", type: "t", value: state.requirment },
    { paramName: "avg_rainfall", type: "t", value: state.avg_rainfall },
  ];
  return fields;
}
