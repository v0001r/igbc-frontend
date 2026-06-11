import {
  computeExistingOneSiteRenewableState,
  createDefaultExistingOneSiteRenewableState,
  type ExistingOneSiteRenewableState,
} from "@/annexure/annexExistingOneSiteRenewableCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const FOOTER_SCALARS: (keyof ExistingOneSiteRenewableState)[] = [
  "total_existing_energy_consumption",
  "existing_total_onsite_renewable",
  "existing_total_offsite_renewable",
  "existing_total_energy",
  "existing_total_renewable_wheeling",
  "percentage_existing_energy_consumption",
  "total_existing_energy_consumption_offsite",
  "existing_total_onsite_renewable_offsite",
  "existing_total_offsite_renewable_offsite",
  "existing_total_energy_offsite",
  "existing_total_renewable_wheeling_offsite",
  "percentage_existing_energy_consumption_offsite",
  "total_existing_energy_consumption_off_set",
  "existing_total_onsite_renewable_off_set",
  "existing_total_offsite_renewable_off_set",
  "existing_total_energy_off_set",
  "existing_total_on_site",
  "existing_total_renewable_wheeling_off_set",
  "existing_total_green",
  "percentage_existing_energy_consumption_off_set",
];

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function parseArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) return v.map((x) => (x == null ? "" : String(x)));
  } catch {
    /* ignore */
  }
  return [];
}

function parseScalar(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) return v[0] != null ? String(v[0]) : "";
    return String(v);
  } catch {
    return raw;
  }
}

function saveArray(values: string[]): string {
  return JSON.stringify(values);
}

function saveScalar(value: string): string {
  return JSON.stringify([value]);
}

function hydrateRows(
  minRows: number,
  arrays: string[][],
): number {
  return Math.max(minRows, ...arrays.map((a) => a.length));
}

export function hydrateExistingOneSiteRenewableAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): ExistingOneSiteRenewableState {
  const layout = schema.existingOneSiteRenewableLayout ?? {};
  const minRows = layout.minRows ?? 5;
  const draft = createDefaultExistingOneSiteRenewableState(minRows);

  const onsiteMonths = parseArray(getParam(form, tab, subtab, "existing_month_year"));
  const onsiteGrid = parseArray(getParam(form, tab, subtab, "existing_energy_consumption"));
  const onsiteDg = parseArray(getParam(form, tab, subtab, "existing_on_site_renewable"));
  const onsiteOther = parseArray(getParam(form, tab, subtab, "existing_off_site_renewable"));
  const onsiteRenewable = parseArray(getParam(form, tab, subtab, "existing_renewable_wheeling"));
  const onsiteCount = hydrateRows(minRows, [
    onsiteMonths,
    onsiteGrid,
    onsiteDg,
    onsiteOther,
    onsiteRenewable,
  ]);
  draft.onsiteRows = Array.from({ length: onsiteCount }, (_, i) => ({
    month: onsiteMonths[i] ?? "",
    grid: onsiteGrid[i] ?? "",
    dg: onsiteDg[i] ?? "",
    other: onsiteOther[i] ?? "",
    total: "",
    renewableOnsite: onsiteRenewable[i] ?? "",
  }));

  const offsiteMonths = parseArray(getParam(form, tab, subtab, "existing_month_year_offsite"));
  const offsiteGrid = parseArray(getParam(form, tab, subtab, "existing_energy_consumption_offsite"));
  const offsiteDg = parseArray(getParam(form, tab, subtab, "existing_on_site_renewable_offsite"));
  const offsiteOther = parseArray(getParam(form, tab, subtab, "existing_off_site_renewable_offsite"));
  const offsiteWheeling = parseArray(getParam(form, tab, subtab, "existing_renewable_wheeling_offsite"));
  const offsiteCount = hydrateRows(minRows, [
    offsiteMonths,
    offsiteGrid,
    offsiteDg,
    offsiteOther,
    offsiteWheeling,
  ]);
  draft.offsiteRows = Array.from({ length: offsiteCount }, (_, i) => ({
    month: offsiteMonths[i] ?? "",
    grid: offsiteGrid[i] ?? "",
    dg: offsiteDg[i] ?? "",
    other: offsiteOther[i] ?? "",
    total: "",
    wheelingOffsite: offsiteWheeling[i] ?? "",
  }));

  const gridMonths = parseArray(getParam(form, tab, subtab, "existing_month_year_off_set"));
  const gridGrid = parseArray(getParam(form, tab, subtab, "existing_energy_consumption_off_set"));
  const gridDg = parseArray(getParam(form, tab, subtab, "existing_on_site_renewable_off_set"));
  const gridOther = parseArray(getParam(form, tab, subtab, "existing_off_site_renewable_off_set"));
  const gridOnsite = parseArray(getParam(form, tab, subtab, "existing_renewable_on_site"));
  const gridWheeling = parseArray(getParam(form, tab, subtab, "existing_renewable_wheeling_off_set"));
  const gridCount = hydrateRows(minRows, [
    gridMonths,
    gridGrid,
    gridDg,
    gridOther,
    gridOnsite,
    gridWheeling,
  ]);
  draft.gridRows = Array.from({ length: gridCount }, (_, i) => ({
    month: gridMonths[i] ?? "",
    grid: gridGrid[i] ?? "",
    dg: gridDg[i] ?? "",
    other: gridOther[i] ?? "",
    total: "",
    renewableOnsite: gridOnsite[i] ?? "",
    wheelingOffsite: gridWheeling[i] ?? "",
    green: "",
  }));

  return computeExistingOneSiteRenewableState(draft);
}

export function buildSavePayloadFromExistingOneSiteRenewable(
  state: ExistingOneSiteRenewableState,
): { paramName: string; type: string; value: string }[] {
  const computed = computeExistingOneSiteRenewableState(state);

  const fields: { paramName: string; type: string; value: string }[] = [
    {
      paramName: "existing_month_year",
      type: "t",
      value: saveArray(computed.onsiteRows.map((r) => r.month)),
    },
    {
      paramName: "existing_energy_consumption",
      type: "t",
      value: saveArray(computed.onsiteRows.map((r) => r.grid)),
    },
    {
      paramName: "existing_on_site_renewable",
      type: "t",
      value: saveArray(computed.onsiteRows.map((r) => r.dg)),
    },
    {
      paramName: "existing_off_site_renewable",
      type: "t",
      value: saveArray(computed.onsiteRows.map((r) => r.other)),
    },
    {
      paramName: "existing_total_consumption",
      type: "t",
      value: saveArray(computed.onsiteRows.map((r) => r.total)),
    },
    {
      paramName: "existing_renewable_wheeling",
      type: "t",
      value: saveArray(computed.onsiteRows.map((r) => r.renewableOnsite)),
    },
    {
      paramName: "existing_month_year_offsite",
      type: "t",
      value: saveArray(computed.offsiteRows.map((r) => r.month)),
    },
    {
      paramName: "existing_energy_consumption_offsite",
      type: "t",
      value: saveArray(computed.offsiteRows.map((r) => r.grid)),
    },
    {
      paramName: "existing_on_site_renewable_offsite",
      type: "t",
      value: saveArray(computed.offsiteRows.map((r) => r.dg)),
    },
    {
      paramName: "existing_off_site_renewable_offsite",
      type: "t",
      value: saveArray(computed.offsiteRows.map((r) => r.other)),
    },
    {
      paramName: "existing_total_consumption_offsite",
      type: "t",
      value: saveArray(computed.offsiteRows.map((r) => r.total)),
    },
    {
      paramName: "existing_renewable_wheeling_offsite",
      type: "t",
      value: saveArray(computed.offsiteRows.map((r) => r.wheelingOffsite)),
    },
    {
      paramName: "existing_month_year_off_set",
      type: "t",
      value: saveArray(computed.gridRows.map((r) => r.month)),
    },
    {
      paramName: "existing_energy_consumption_off_set",
      type: "t",
      value: saveArray(computed.gridRows.map((r) => r.grid)),
    },
    {
      paramName: "existing_on_site_renewable_off_set",
      type: "t",
      value: saveArray(computed.gridRows.map((r) => r.dg)),
    },
    {
      paramName: "existing_off_site_renewable_off_set",
      type: "t",
      value: saveArray(computed.gridRows.map((r) => r.other)),
    },
    {
      paramName: "existing_total_consumption_off_set",
      type: "t",
      value: saveArray(computed.gridRows.map((r) => r.total)),
    },
    {
      paramName: "existing_renewable_on_site",
      type: "t",
      value: saveArray(computed.gridRows.map((r) => r.renewableOnsite)),
    },
    {
      paramName: "existing_renewable_wheeling_off_set",
      type: "t",
      value: saveArray(computed.gridRows.map((r) => r.wheelingOffsite)),
    },
    {
      paramName: "existing_green",
      type: "t",
      value: saveArray(computed.gridRows.map((r) => r.green)),
    },
  ];

  for (const key of FOOTER_SCALARS) {
    fields.push({
      paramName: key,
      type: "t",
      value: saveScalar(String(computed[key] ?? "")),
    });
  }

  return fields;
}
