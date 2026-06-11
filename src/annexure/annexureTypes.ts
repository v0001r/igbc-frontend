/**
 * Mirror of backend `annexure-schema.types.ts` — keep field shapes aligned.
 */

export type AnnexureRenderMode =
  | "table"
  | "comparison"
  | "dwelling"
  | "rainwater"
  | "waterEfficiency"
  | "greenInteriorsWcTwo"
  | "conditionedSpaces"
  | "naturalVentilation"
  | "lpdBuildingAreaMethod"
  | "lpdSpaceFunctionMethod"
  | "onsiteRenewableEnergy"
  | "masterMaterial"
  | "acFreshAir"
  | "daylightNoise"
  | "occupantWellbeing"
  | "wasteManagement"
  | "waterBalance"
  | "wastewaterReuse"
  | "urbanHeatRoof"
  | "urbanHeatNonRoof"
  | "existingRainfall"
  | "existingWaterEfficiency"
  | "existingWaterConsumption"
  | "existingAlternativePerformance"
  | "eemr2Office"
  | "epiCalculation"
  | "epiLimitCalculation"
  | "existingSimulationMethod"
  | "existingOneSiteRenewable"
  | "existingSingleZoneSystem"
  | "existingOutdoorAirSystem"
  | "reference";

export type ExistingSingleZoneAreaDescriptionDef = {
  label: string;
  outdoor_air_rate: number | null;
  area_outdoor_rate: number;
};

export type ExistingSingleZoneLayoutDef = {
  minRows?: number;
  maxRows?: number;
  addRowLabel?: string;
  areaDescriptionOptions?: Record<string, ExistingSingleZoneAreaDescriptionDef>;
};

export type ExistingOneSiteRenewableLayoutDef = {
  minRows?: number;
  maxRows?: number;
  addRowLabel?: string;
};

export type ExistingSimulationMethodLayoutDef = {
  minHvacRows?: number;
  maxHvacRows?: number;
  minSimulationRows?: number;
  maxSimulationRows?: number;
};

export type EpiLimitCalculationLayoutDef = {
  minEnergyRows?: number;
  maxEnergyRows?: number;
};

export type EpiCalculationLayoutDef = {
  minEnergyRows?: number;
  maxEnergyRows?: number;
};

export type Eemr2OfficeLayoutDef = {
  minFloorRows?: number;
  maxFloorRows?: number;
  minEnergyRows?: number;
  maxEnergyRows?: number;
};

export type ExistingAlternativePerformanceLayoutDef = {
  addRowLabel?: string;
  minRows?: number;
  maxRows?: number;
};

export type ExistingWaterConsumptionLayoutDef = {
  addBuildingLabel?: string;
  defaultBuildingCount?: number;
  minBuildings?: number;
  maxBuildings?: number;
  minRowsPerBuilding?: number;
  maxRowsPerBuilding?: number;
};

export type ExistingWaterEfficiencyLockedRowDef = {
  fixture_type: string;
  fixture_detail: string;
  duration: string;
  daily_uses: string;
  fte: string;
  baseline_flow: string;
  baseline_flow_proposed: string;
  readonlyFields?: string[];
};

export type ExistingWaterEfficiencyLayoutDef = {
  addBuildingLabel?: string;
  defaultBuildingCount?: number;
  minBuildings?: number;
  maxBuildings?: number;
  minRowsPerBuilding?: number;
  maxRowsPerBuilding?: number;
  lockedRows?: ExistingWaterEfficiencyLockedRowDef[];
  /** When false, added rows keep duration/daily uses/baseline flow editable (WC CR 1 Option 1). */
  lockExtraRowCalcFields?: boolean;
  showMandatoryRequirement?: boolean;
  saveOverallsavedpercentage?: boolean;
  saveAnnexMandatory?: boolean;
  showBuildingIndexInHeader?: boolean;
  dailyUsesHeader?: string;
  flowRateHeader?: string;
};

export type ExistingRainfallLayoutDef = {
  rainfallRowCount?: number;
  surfaceRowCount?: number;
  yearOptions?: Record<string, string>;
  monthOptions?: Record<string, string>;
  surfaceOptions?: Record<string, string>;
};

export type UrbanHeatRoofLayoutDef = Record<string, never>;

export type UrbanHeatNonRoofLayoutDef = {
  minRows?: number;
  maxRows?: number;
  table1TabLabel?: string;
  table2TabLabel?: string;
  totalNonSource?: {
    tab: string;
    subtab: string;
    param: string;
  };
};

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

export type AnnexureDwellingOrientationColumnGroupDef = {
  label: string;
  params: string[];
};

export type AnnexureDwellingLayoutDef = {
  /** `sections` = energy annex field blocks; `rowTable` = wide row grid per dwelling unit. */
  layoutMode?: "sections" | "rowTable";
  /** `fte` = building-name header row + grouped transient columns (existing buildings FTE annex). */
  rowTableHeaderStyle?: "default" | "fte";
  towerNameLabel?: string;
  orientationColumnGroups?: AnnexureDwellingOrientationColumnGroupDef[];
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
  hideCaseSelector?: boolean;
  defaultCase?: string;
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

export type GiWcTwoPresetDef = {
  id: string;
  fixtureType: string;
  prefix: string;
  occupantStatusParam: string;
  unitTypeParam: string;
  proposedUnitParam: string;
  category: "flush" | "flow";
  defaultFteKind: "division" | "total";
  defaults: {
    duration: string;
    daily: string;
    baseTopology1?: string;
    baseDefault: string;
    unit: string;
    defaultOccupantStatus?: string;
    readOnlyOccupantStatus?: boolean;
  };
};

export type GiWcTwoLayoutDef = {
  fteTabLabel?: string;
  fixturesTabLabel?: string;
  partTimeMinRows?: number;
  partTimeMaxRows?: number;
  presetRows: GiWcTwoPresetDef[];
};

export type ConditionedSpacesSourceAnnexDef = {
  tab?: string;
  subtab: string;
  occupancyField: string;
  occupancyValue: string;
  acField: string;
  acValue: string;
  spaceNameField: string;
  areaField: string;
};

export type ConditionedSpacesLayoutDef = {
  systemsTabLabel?: string;
  areaTabLabel?: string;
  systemMinRows?: number;
  systemMaxRows?: number;
  sourceAnnex?: ConditionedSpacesSourceAnnexDef;
  acSystemOptions?: Record<string, string>;
  efficiencyUnitOptions?: Record<string, string>;
  refrigerantOptions?: Record<string, string>;
  scopeOptions?: Record<string, string>;
};

export type NaturalVentilationSourceAnnexDef = ConditionedSpacesSourceAnnexDef;

export type NaturalVentilationLayoutDef = {
  sourceAnnex?: NaturalVentilationSourceAnnexDef;
  yesNoOptions?: Record<string, string>;
};

export type LpdBuildingAreaSourceAnnexDef = {
  tab?: string;
  subtab: string;
  spaceNameField: string;
  areaField: string;
};

export type LpdBuildingTypologyBaselineDef = {
  slug: string;
  label: string;
  baseline: number;
};

export type LpdBuildingAreaLayoutDef = {
  sourceAnnex?: LpdBuildingAreaSourceAnnexDef;
  typologyBaselines?: LpdBuildingTypologyBaselineDef[];
  typologyOptions?: Record<string, string>;
};

export type LpdSpaceFunctionSourceAnnexDef = LpdBuildingAreaSourceAnnexDef;

export type LpdSpaceBaselineDef = LpdBuildingTypologyBaselineDef;

export type LpdSpaceFunctionLayoutDef = {
  minRows?: number;
  maxRows?: number;
  addRowLabel?: string;
  sourceAnnex?: LpdSpaceFunctionSourceAnnexDef;
  spaceBaselines?: LpdSpaceBaselineDef[];
  spaceTypeOptions?: Record<string, string>;
};

export type OnsiteRenewableLayoutDef = {
  minRows?: number;
  maxRows?: number;
  addRowLabel?: string;
};

export type MasterMaterialLayoutDef = {
  minRows?: number;
  maxRows?: number;
  addRowLabel?: string;
  localDistanceMaxKm?: number;
  materialOptions?: Record<string, string>;
  subCategories?: Record<string, string[]>;
};

export type AcFreshAirSpaceTypeDef = {
  label: string;
  baseline: number;
  outdoor?: number | null;
};

export type AcFreshAirLayoutDef = {
  systemsTabLabel?: string;
  areaTabLabel?: string;
  systemMinRows?: number;
  systemMaxRows?: number;
  sourceAnnex?: ConditionedSpacesSourceAnnexDef;
  spaceTypeOptions?: Record<string, AcFreshAirSpaceTypeDef>;
};

export type DaylightSpaceTypeDef = {
  label: string;
  benchmarkLux: number;
};

export type AcousticSpaceTypeDef = {
  label: string;
  baselineDb: number;
};

export type DaylightNoiseLayoutDef = {
  sourceAnnex?: Omit<ConditionedSpacesSourceAnnexDef, "acField" | "acValue"> & {
    acField?: string;
    acValue?: string;
  };
  daylightSpaceTypes?: Record<string, DaylightSpaceTypeDef>;
  acousticSpaceTypes?: Record<string, AcousticSpaceTypeDef>;
};

export type OccupantWellbeingLayoutDef = {
  minRows?: number;
  maxRows?: number;
  addRowLabel?: string;
  permanentOccupancyGlobalKey?: string;
};

export type WasteManagementSourceAnnexDef = {
  tab?: string;
  subtab: string;
  materialField?: string;
  otherMaterialField?: string;
};

export type WasteManagementLayoutDef = {
  minRows?: number;
  sourceAnnex?: WasteManagementSourceAnnexDef;
  unitOptions?: Record<string, string>;
  materialOptions?: Record<string, string>;
  materialOptionsCatalogPath?: string;
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
  greenInteriorsWcTwoLayout?: GiWcTwoLayoutDef;
  conditionedSpacesLayout?: ConditionedSpacesLayoutDef;
  naturalVentilationLayout?: NaturalVentilationLayoutDef;
  lpdBuildingAreaLayout?: LpdBuildingAreaLayoutDef;
  lpdSpaceFunctionLayout?: LpdSpaceFunctionLayoutDef;
  onsiteRenewableLayout?: OnsiteRenewableLayoutDef;
  masterMaterialLayout?: MasterMaterialLayoutDef;
  acFreshAirLayout?: AcFreshAirLayoutDef;
  daylightNoiseLayout?: DaylightNoiseLayoutDef;
  occupantWellbeingLayout?: OccupantWellbeingLayoutDef;
  wasteManagementLayout?: WasteManagementLayoutDef;
  waterBalanceLayout?: AnnexureWaterBalanceLayoutDef;
  wastewaterReuseLayout?: AnnexureWastewaterReuseLayoutDef;
  urbanHeatRoofLayout?: UrbanHeatRoofLayoutDef;
  urbanHeatNonRoofLayout?: UrbanHeatNonRoofLayoutDef;
  existingRainfallLayout?: ExistingRainfallLayoutDef;
  existingWaterEfficiencyLayout?: ExistingWaterEfficiencyLayoutDef;
  existingWaterConsumptionLayout?: ExistingWaterConsumptionLayoutDef;
  existingAlternativePerformanceLayout?: ExistingAlternativePerformanceLayoutDef;
  eemr2OfficeLayout?: Eemr2OfficeLayoutDef;
  epiCalculationLayout?: EpiCalculationLayoutDef;
  epiLimitCalculationLayout?: EpiLimitCalculationLayoutDef;
  existingSimulationMethodLayout?: ExistingSimulationMethodLayoutDef;
  existingOneSiteRenewableLayout?: ExistingOneSiteRenewableLayoutDef;
  existingSingleZoneLayout?: ExistingSingleZoneLayoutDef;
  existingOutdoorAirSystemLayout?: ExistingSingleZoneLayoutDef;
  ventilationRatesCatalogPath?: string;
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
