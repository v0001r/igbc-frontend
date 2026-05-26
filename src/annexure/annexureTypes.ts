/**
 * Mirror of backend `annexure-schema.types.ts` — keep field shapes aligned.
 */

export type AnnexureRenderMode =
  | "table"
  | "comparison"
  | "dwelling"
  | "rainwater"
  | "waterEfficiency"
  | "waterBalance"
  | "wastewaterReuse"
  | "reference";

export type AnnexureDwellingFieldDef = {
  param: string;
  label: string;
  type: "text" | "number" | "select" | "readonly";
  step?: string;
  options?: Record<string, string>;
  computed?: boolean;
  section?: string;
  /** When `afterFenestration`, rendered below Wall and Fenestration table (totals / WWR). */
  placement?: "beforeFenestration" | "afterFenestration";
};

export type AnnexureDwellingOrientationColumnDef = {
  param: string;
  header: string;
  type: "text" | "number" | "select" | "readonly";
  step?: string;
  width?: string;
  options?: Record<string, string>;
  computed?: boolean;
};

export type AnnexureDwellingRowTableFooterCellDef = {
  kind: "empty" | "label" | "field";
  colspan?: number;
  text?: string;
  param?: string;
};

export type AnnexureDwellingRowTableFooterRowDef = {
  cells: AnnexureDwellingRowTableFooterCellDef[];
};

export type AnnexureDwellingLayoutDef = {
  /** `sections` = energy annex field blocks; `rowTable` = wide row grid per dwelling unit. */
  layoutMode?: "sections" | "rowTable";
  addTowerLabel?: string;
  addRowLabel?: string;
  defaultTowerCount?: number;
  minTowers?: number;
  maxTowers?: number;
  orientationRowCount?: number;
  minOrientationRows?: number;
  maxOrientationRows?: number;
  towerNameParam?: string;
  /** Optional text input in thead over last N compliance columns (ventilation annexes). */
  complianceHeaderParam?: string;
  complianceColumnCount?: number;
  rowTableFooter?: AnnexureDwellingRowTableFooterRowDef[];
  globalFields?: AnnexureDwellingFieldDef[];
  towerFields?: AnnexureDwellingFieldDef[];
  orientationColumns?: AnnexureDwellingOrientationColumnDef[];
};

export type AnnexureDwellingStoreDef = {
  towerScalarParams?: string[];
  orientationParams?: string[];
  towerStringParams?: string[];
  globalParams?: string[];
};

/** Pull row defaults from another annex (e.g. RHW 1.2 ← RHW 1.1). */
export type AnnexureSourceMappingDef = {
  target: string;
  source: string;
  readonly?: boolean;
  /** When true, use source value only if target has no saved value yet. */
  prefillOnly?: boolean;
};

export type AnnexureSourceAnnexDef = {
  tab?: string;
  subtab: string;
  mappings: AnnexureSourceMappingDef[];
};

/** One upstream ventilation annex row in RHW 2.4 summary (Laravel `summary_two_one_ventilation`). */
export type AnnexureVentilationSummarySourceDef = {
  /** Blade `type`: `one` | `two` | `three` | `four`. */
  id: string;
  label: string;
  /** Upstream annex subtab slug (e.g. `annex_ventilation_design_cfd`). */
  subtab: string;
  dwellingField: string;
  mandatoryField: string;
  creditField: string;
  /** `lt5` = show when floor count &lt; 5; `gte5` = 5+ floors; `always` = always. */
  floorFilter: "lt5" | "gte5" | "always";
};

export type AnnexureRainfallSectionDef = {
  fixedRowCount?: number;
  yearOptions?: Record<string, string>;
  monthOptions?: Record<string, string>;
};

export type AnnexureRainwaterLayoutDef = {
  rainfall: AnnexureRainfallSectionDef;
  caseOptions?: Record<string, string>;
  surfaceTable?: AnnexureTableDef;
  summary?: AnnexureSummaryRowDef[];
};

export type WaterEfficiencyPresetDef = {
  id: string;
  fixtureType: string;
  detailParam: string;
  prefix: string;
  category: "flush" | "flow";
  defaults: {
    duration?: string;
    daily?: string;
    base?: string;
    unit?: string;
  };
};

export type AnnexureWaterEfficiencyLayoutDef = {
  addRowLabel?: string;
  minDynamicRows?: number;
  maxDynamicRows?: number;
  presetRows: WaterEfficiencyPresetDef[];
};

export type WaterBalanceRowDef = {
  label: string;
  dailyParam: string;
  annualParam: string;
  editableDaily?: boolean;
  source?: "wcTwoFlush" | "wcTwoFlow";
};

export type WaterBalanceSectionDef = {
  id: string;
  title: string;
  totalDailyParam: string;
  totalAnnualParam: string;
  rows: WaterBalanceRowDef[];
};

export type AnnexureWaterBalanceLayoutDef = {
  annualDays?: number;
  consumptionFromAnnex?: {
    tab?: string;
    subtab?: string;
    flushDailyParam?: string;
    flowDailyParam?: string;
  };
  sections: WaterBalanceSectionDef[];
};

export type WastewaterReuseSectionDef = {
  title: string;
  rows: WaterBalanceRowDef[];
};

export type AnnexureWastewaterReuseLayoutDef = {
  annualDays?: number;
  wasteFromAnnex?: {
    tab?: string;
    subtab?: string;
    flushParam?: string;
    flowParam?: string;
  };
  stpCapacityParam?: string;
  stpCapacitySubtab?: string;
  reuseSection: WastewaterReuseSectionDef;
};

export type AnnexureVentilationSummaryDef = {
  tab?: string;
  floorCountSubtab?: string;
  floorCountParam?: string;
  sources: AnnexureVentilationSummarySourceDef[];
};

export type AnnexureComparisonRowDef = {
  label: string;
  baseParam: string;
  designParam: string;
  groupLabel?: string;
  groupStart?: boolean;
};

export type AnnexureComparisonSectionDef = {
  title: string;
  rows: AnnexureComparisonRowDef[];
};

export type AnnexureComparisonLayoutDef = {
  columnHeaders?: [string, string, string];
  defaultRowCount?: number;
  sections: AnnexureComparisonSectionDef[];
};

export type AnnexureExpr =
  | { const: number | string }
  | { ref: string }
  | { op: "add" | "sub" | "mul" | "div"; args: AnnexureExpr[] }
  | { op: "neg"; arg: AnnexureExpr }
  | { op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte"; left: AnnexureExpr; right: AnnexureExpr }
  | { op: "and" | "or"; args: AnnexureExpr[] }
  | { op: "not"; arg: AnnexureExpr }
  | { op: "if"; cond: AnnexureExpr; then: AnnexureExpr; else: AnnexureExpr }
  | { op: "parseNum"; arg: AnnexureExpr }
  | { op: "isEmpty"; arg: AnnexureExpr }
  | { op: "sumRows"; field: string }
  | { op: "sumRowsInclude"; field: string; includeField: string; includeValues: (number | string)[] }
  | { op: "sumRowsExclude"; field: string; excludeField: string; excludeValues: (number | string)[] }
  | { op: "minRowsPositive"; field: string }
  | { op: "allRowsYes"; field: string }
  | { op: "mapGet"; mapKey: string; key: AnnexureExpr; default?: number | string }
  | { op: "formatNum"; arg: AnnexureExpr; decimals?: number }
  | { op: "min"; args: AnnexureExpr[] };

export type AnnexureColumnDef = {
  id: string;
  param: string;
  header: string;
  type: "text" | "number" | "select" | "readonly";
  width?: string;
  step?: string;
  options?: Record<string, string>;
  computed?: boolean;
  showWhen?: AnnexureExpr;
};

export type AnnexureTableHeaderCellDef = {
  text?: string;
  colspan?: number;
};

export type AnnexureTableDef = {
  title?: string;
  addRowLabel?: string;
  /** When false, row count is driven by `sourceAnnex` (no Add row). */
  allowAddRows?: boolean;
  defaultRowCount?: number;
  minRows?: number;
  maxRows?: number;
  stickyFirstColumns?: number;
  /** Extra thead rows above column headers (e.g. grouped "Quantity of Waste"). */
  headerRows?: AnnexureTableHeaderCellDef[][];
  columns: AnnexureColumnDef[];
};

export type AnnexureFooterCellDef = {
  kind: "label" | "field" | "spacer";
  colspan?: number;
  text?: string;
  param?: string;
  type?: "readonly";
  editable?: boolean;
  inputType?: "text" | "number";
  step?: string;
  aggregateOf?: string;
};

export type AnnexureFooterRowDef = {
  cells: AnnexureFooterCellDef[];
};

export type AnnexureSummaryRowDef = {
  label: string;
  param: string;
  type: "readonly";
};

export type AnnexureSummaryGroupDef = {
  title: string;
  rows: AnnexureSummaryRowDef[];
};

export type AnnexureRowStep = {
  set: string;
  expr: AnnexureExpr;
};

export type AnnexureScalarStep = {
  set: string;
  expr: AnnexureExpr;
};

export type AnnexureSchemaDefinition = {
  id: string;
  title: string;
  schemaVersion: number;
  ratingTypeIds?: number[] | null;
  renderMode?: AnnexureRenderMode;
  bladeInclude?: string | null;
  referenceFile?: string | null;
  referenceDescription?: string;
  baselineCatalogPath?: string;
  lookupMaps?: Record<string, Record<string, number | string>>;
  storageTable?: string;
  comparisonLayout?: AnnexureComparisonLayoutDef;
  comparisonParams?: string[];
  dwellingLayout?: AnnexureDwellingLayoutDef;
  dwellingStore?: AnnexureDwellingStoreDef;
  /** Per-row calculations inside each dwelling unit (orientation rows). */
  dwellingRowPipeline?: AnnexureRowStep[];
  /** Per-dwelling-unit footer totals (e.g. total floor area, percentage). */
  dwellingTowerPipeline?: AnnexureScalarStep[];
  sourceAnnex?: AnnexureSourceAnnexDef;
  ventilationSummary?: AnnexureVentilationSummaryDef;
  rainwaterLayout?: AnnexureRainwaterLayoutDef;
  waterEfficiencyLayout?: AnnexureWaterEfficiencyLayoutDef;
  waterBalanceLayout?: AnnexureWaterBalanceLayoutDef;
  wastewaterReuseLayout?: AnnexureWastewaterReuseLayoutDef;
  table?: AnnexureTableDef;
  footerRows?: AnnexureFooterRowDef[];
  summary?: AnnexureSummaryRowDef[];
  summaryGroups?: AnnexureSummaryGroupDef[];
  rowPipeline?: AnnexureRowStep[];
  scalarPipeline?: AnnexureScalarStep[];
  bundleStorageParam?: string;
  bundledRowParams?: string[];
  scalarParams?: string[];
};
