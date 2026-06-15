import {
  computeEcoRefrigerantMulti,
  computeEcoRefrigerantSingle,
  createEmptyMultiState,
  ECO_REFRIGERANT_EMPTY_COLUMN,
  type EcoRefrigerantAnnexState,
  type EcoRefrigerantColumn,
  type RefrigerantCatalogEntry,
  type EquipmentLifeCatalogEntry,
} from "@/annexure/annexEcoFriendlyRefrigerantCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const COLUMN_PARAMS: (keyof EcoRefrigerantColumn)[] = [
  "refrig_type",
  "equipment_type",
  "cap_tons",
  "reg_charge",
  "reg_charge_ton",
  "leak_rate",
  "equipment_life",
  "end_loss",
  "golbal_refri",
  "ozone_refri",
  "life_cycle_golbal_refri",
  "life_cycle_ozone_refri",
  "tsac_factor",
  "tsac_factor_cap",
  "cap_tons2",
  "tsac_factor_cap2",
  "identical_units",
];

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map((x) => (x === null || x === undefined ? "" : String(x))) : [];
  } catch {
    return [];
  }
}

function getParam(formState: CertificationFormResponse, tab: string, subtab: string, param: string): string {
  return (
    (formState.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value ?? ""
  );
}

function columnFromArrays(arrays: Record<keyof EcoRefrigerantColumn, string[]>, index: number): EcoRefrigerantColumn {
  const col = { ...ECO_REFRIGERANT_EMPTY_COLUMN };
  for (const key of COLUMN_PARAMS) {
    col[key] = arrays[key][index] ?? "";
  }
  if (!col.identical_units) col.identical_units = "1";
  return col;
}

function inferMultiColumnCount(formState: CertificationFormResponse, tab: string, subtab: string): number {
  const lengths = [
    parseJsonArray(getParam(formState, tab, subtab, "identical_units")).length,
    parseJsonArray(getParam(formState, tab, subtab, "cap_tons")).length,
    parseJsonArray(getParam(formState, tab, subtab, "refrig_type")).length,
  ];
  const max = Math.max(0, ...lengths);
  return max > 1 ? max : 1;
}

export function hydrateEcoFriendlyRefrigerantAnnex(
  schema: AnnexureSchemaDefinition,
  formState: CertificationFormResponse,
  tab: string,
  subtab: string,
): EcoRefrigerantAnnexState {
  const layout = schema.ecoFriendlyRefrigerantLayout!;
  const defaultCols = layout.multiDefaultColumns ?? 1;
  const multiCount = Math.max(inferMultiColumnCount(formState, tab, subtab), defaultCols);

  const arrays = {} as Record<keyof EcoRefrigerantColumn, string[]>;
  for (const key of COLUMN_PARAMS) {
    arrays[key] = parseJsonArray(getParam(formState, tab, subtab, key));
  }

  const singleCol = columnFromArrays(arrays, 0);
  const singleBase = computeEcoRefrigerantSingle(singleCol, layout.complianceThreshold ?? 100);

  const multiColumns: EcoRefrigerantColumn[] = [];
  for (let i = 0; i < multiCount; i++) {
    multiColumns.push(columnFromArrays(arrays, i));
  }

  const multiBase = computeEcoRefrigerantMulti(
    {
      columns: multiColumns,
      qtotal_cap_tons: parseJsonArray(getParam(formState, tab, subtab, "qtotal_cap_tons"))[0] ?? "",
      tsac_factor_total: parseJsonArray(getParam(formState, tab, subtab, "tsac_factor_total"))[0] ?? "",
      cal_refrigerant: parseJsonArray(getParam(formState, tab, subtab, "cal_refrigerant"))[0] ?? "",
      cal_credit: parseJsonArray(getParam(formState, tab, subtab, "cal_credit"))[0] ?? "",
    },
    layout.complianceThreshold ?? 100,
  );

  return { single: singleBase, multi: multiBase };
}

function pushColumnArrays(
  out: { paramName: string; type: string; value: string }[],
  columns: EcoRefrigerantColumn[],
): void {
  for (const key of COLUMN_PARAMS) {
    out.push({
      paramName: key,
      type: "t",
      value: JSON.stringify(columns.map((c) => c[key] ?? "")),
    });
  }
}

export function buildSavePayloadFromEcoFriendlyRefrigerant(state: EcoRefrigerantAnnexState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const out: { paramName: string; type: string; value: string }[] = [];

  const mergedColumns = [...state.multi.columns];
  if (mergedColumns.length === 0) mergedColumns.push({ ...ECO_REFRIGERANT_EMPTY_COLUMN });
  mergedColumns[0] = { ...state.single };
  pushColumnArrays(out, mergedColumns);

  out.push(
    {
      paramName: "cal_refrigerant",
      type: "t",
      value: JSON.stringify([state.multi.cal_refrigerant || state.single.cal_refrigerant]),
    },
    {
      paramName: "cal_credit",
      type: "t",
      value: JSON.stringify([state.multi.cal_credit || state.single.cal_credit]),
    },
    {
      paramName: "qtotal_cap_tons",
      type: "t",
      value: JSON.stringify([state.multi.qtotal_cap_tons]),
    },
    {
      paramName: "tsac_factor_total",
      type: "t",
      value: JSON.stringify([state.multi.tsac_factor_total]),
    },
    {
      paramName: "cal_refrigerant_single",
      type: "t",
      value: state.single.cal_refrigerant,
    },
    {
      paramName: "cal_refrigerant_multiple",
      type: "t",
      value: JSON.stringify([state.multi.cal_refrigerant]),
    },
  );

  return out;
}

export function refrigerantOptionsFromSchema(
  schema: AnnexureSchemaDefinition,
): Record<string, RefrigerantCatalogEntry> {
  return schema.ecoFriendlyRefrigerantLayout?.refrigerantCatalog ?? {};
}

export function equipmentOptionsFromSchema(
  schema: AnnexureSchemaDefinition,
): Record<string, EquipmentLifeCatalogEntry> {
  return schema.ecoFriendlyRefrigerantLayout?.equipmentCatalog ?? {};
}

export function applyRefrigerantSelection(
  col: EcoRefrigerantColumn,
  slug: string,
  catalog: Record<string, { label: string; gwp?: number; odp?: number; leak_rate?: string; end_loss?: string }>,
): EcoRefrigerantColumn {
  const entry = catalog[slug];
  if (!entry) {
    return {
      ...col,
      refrig_type: slug,
      leak_rate: "",
      end_loss: "",
      golbal_refri: "",
      ozone_refri: "",
    };
  }
  return {
    ...col,
    refrig_type: slug,
    leak_rate: entry.leak_rate,
    end_loss: entry.end_loss,
    golbal_refri: String(entry.gwp),
    ozone_refri: String(entry.odp),
  };
}

export function applyEquipmentSelection(
  col: EcoRefrigerantColumn,
  slug: string,
  catalog: Record<string, { label: string; life?: number }>,
): EcoRefrigerantColumn {
  const entry = catalog[slug];
  return {
    ...col,
    equipment_type: slug,
    equipment_life: entry ? String(entry.life) : "",
  };
}

export function emptyMultiState(columnCount: number): EcoRefrigerantAnnexState["multi"] {
  return createEmptyMultiState(columnCount);
}
