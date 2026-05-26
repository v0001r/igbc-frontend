import type {
  AnnexureSchemaDefinition,
  AnnexureVentilationSummarySourceDef,
} from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import type { RowRecord } from "@/annexure/annexureExprEval";

type DwellingMap = Record<string, string | string[]>;

function getParamValue(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function parseDwellingMap(raw: string | undefined): DwellingMap {
  if (!raw?.trim()) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) return v as DwellingMap;
  } catch {
    /* legacy plain string */
  }
  return { "1": raw };
}

function mapToOrderedValues(map: DwellingMap): string[] {
  const keys = Object.keys(map)
    .map((k) => parseInt(k, 10))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  return keys.map((k) => {
    const v = map[String(k)];
    if (Array.isArray(v)) return String(v[0] ?? "");
    return v != null ? String(v) : "";
  });
}

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map((x) => (x === null || x === undefined ? "" : String(x))) : [];
  } catch {
    return [];
  }
}

function parseFloorCount(
  form: CertificationFormResponse,
  tab: string,
  summary: NonNullable<AnnexureSchemaDefinition["ventilationSummary"]>,
): number {
  const subtab = summary.floorCountSubtab ?? "ventilation_design_enhanced";
  const param = summary.floorCountParam ?? "no_of_floors";
  const raw = getParamValue(form, tab, subtab, param);
  const n = parseInt(String(raw ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

function sourceActive(source: AnnexureVentilationSummarySourceDef, floorCount: number): boolean {
  if (source.floorFilter === "always") return true;
  if (source.floorFilter === "lt5") return floorCount < 5;
  return floorCount >= 5;
}

function upstreamValues(
  form: CertificationFormResponse,
  tab: string,
  source: AnnexureVentilationSummarySourceDef,
  field: string,
): string[] {
  return mapToOrderedValues(parseDwellingMap(getParamValue(form, tab, source.subtab, field)));
}

/** Build combined summary rows from upstream ventilation annexes (CFD, air-conditioned, etc.). */
export function hydrateVentilationSummaryRows(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  summaryTab: string,
  summarySubtab: string,
): RowRecord[] {
  const summary = schema.ventilationSummary;
  if (!summary?.sources?.length) return [];

  const upstreamTab = summary.tab ?? summaryTab;
  const floorCount = parseFloorCount(form, upstreamTab, summary);
  const rows: RowRecord[] = [];

  for (const source of summary.sources) {
    if (!sourceActive(source, floorCount)) continue;

    const dwellingNames = upstreamValues(form, upstreamTab, source, source.dwellingField);
    const mandatory = upstreamValues(form, upstreamTab, source, source.mandatoryField);
    const credit = upstreamValues(form, upstreamTab, source, source.creditField);
    const savedUnits = parseJsonArray(
      getParamValue(form, summaryTab, summarySubtab, `dwelling_units_${source.id}`),
    );

    const n = Math.max(dwellingNames.length, mandatory.length, credit.length, savedUnits.length);
    if (n === 0) continue;

    for (let i = 0; i < n; i++) {
      const name = dwellingNames[i]?.trim() || "Dwelling Type";
      rows.push({
        source_id: source.id,
        data_source: source.label,
        dwelling_name: name,
        dwelling_units: savedUnits[i] ?? "",
        meet_or_exceed: mandatory[i] ?? "",
        meet_exceed: credit[i] ?? "",
      });
    }
  }

  return rows;
}

export function ventilationSummarySignature(
  form: CertificationFormResponse,
  schema: AnnexureSchemaDefinition,
  summaryTab: string,
): string {
  const summary = schema.ventilationSummary;
  if (!summary) return "";

  const upstreamTab = summary.tab ?? summaryTab;
  const parts: [string, string][] = [];

  const floorSubtab = summary.floorCountSubtab ?? "ventilation_design_enhanced";
  const floorParam = summary.floorCountParam ?? "no_of_floors";
  const floorRaw = getParamValue(form, upstreamTab, floorSubtab, floorParam);
  if (floorRaw != null) parts.push([`${floorSubtab}/${floorParam}`, floorRaw]);

  for (const source of summary.sources) {
    for (const field of [source.dwellingField, source.mandatoryField, source.creditField]) {
      const raw = getParamValue(form, upstreamTab, source.subtab, field);
      if (raw != null) parts.push([`${source.subtab}/${field}`, raw]);
    }
  }

  return JSON.stringify(parts.sort((a, b) => a[0].localeCompare(b[0])));
}

export function buildSavePayloadFromVentilationSummary(
  schema: AnnexureSchemaDefinition,
  rows: RowRecord[],
  scalar: Record<string, string>,
): { paramName: string; type: string; value: string }[] {
  const summary = schema.ventilationSummary;
  const fields: { paramName: string; type: string; value: string }[] = [];
  if (!summary) return fields;

  const bySource = new Map<string, RowRecord[]>();
  for (const row of rows) {
    const id = String(row.source_id ?? "");
    if (!id) continue;
    if (!bySource.has(id)) bySource.set(id, []);
    bySource.get(id)!.push(row);
  }

  for (const source of summary.sources) {
    const sourceRows = bySource.get(source.id) ?? [];
    fields.push({
      paramName: `dwelling_name_${source.id}`,
      type: "t",
      value: JSON.stringify(sourceRows.map((r) => r.dwelling_name ?? "")),
    });
    fields.push({
      paramName: `dwelling_units_${source.id}`,
      type: "t",
      value: JSON.stringify(sourceRows.map((r) => r.dwelling_units ?? "")),
    });
    fields.push({
      paramName: `meet_or_exceed_${source.id}`,
      type: "t",
      value: JSON.stringify(sourceRows.map((r) => r.meet_or_exceed ?? "")),
    });
    fields.push({
      paramName: `meet_exceed_${source.id}`,
      type: "t",
      value: JSON.stringify(sourceRows.map((r) => r.meet_exceed ?? "")),
    });
  }

  for (const p of schema.scalarParams ?? []) {
    fields.push({ paramName: p, type: "t", value: scalar[p] ?? "" });
  }

  return fields;
}
