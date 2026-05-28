import { evaluateExpr, formatAnnexNumber, type EvalCtx } from "@/annexure/annexureExprEval";
import type { AnnexureDwellingLayoutDef, AnnexureSchemaDefinition } from "@/annexure/annexureTypes";

export type OrientationRow = Record<string, string>;

export type DwellingTowerState = {
  tableIndex: number;
  [key: string]: string | number | OrientationRow[];
};

export type DwellingGlobalState = Record<string, string>;

export type DwellingAnnexState = {
  global: DwellingGlobalState;
  towers: DwellingTowerState[];
};

function num(s: string | undefined): number {
  const n = parseFloat(String(s ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmt2(n: number): string {
  return n.toFixed(2);
}

function applyComputedValue(v: string | number | boolean): string {
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return formatAnnexNumber(v);
  return String(v);
}

function towerNameParam(layout: AnnexureDwellingLayoutDef): string {
  return layout.towerNameParam ?? "enegry_tower";
}

export function emptyOrientationRow(layout: AnnexureDwellingLayoutDef): OrientationRow {
  const row: OrientationRow = {};
  for (const c of layout.orientationColumns ?? []) {
    if (!c.computed) row[c.param] = "";
  }
  return row;
}

function recalcEnergyEnvelopeTower(
  tower: DwellingTowerState,
  layout: AnnexureDwellingLayoutDef,
): DwellingTowerState {
  const orientations = (tower.orientations as OrientationRow[]).map((r) => ({ ...r }));
  let totalAll = 0;
  let totalGlass = 0;
  let totalWall = 0;

  for (const row of orientations) {
    const len = num(row.enevlope_length);
    const ht = num(row.enevlope_height);
    const glass = num(row.total_glass_area);
    const envelope = len * ht;
    row.total_envelope_area = fmt2(envelope);
    const wall = envelope - glass;
    row.total_wall_area = fmt2(wall);
    totalAll += envelope;
    totalGlass += glass;
    totalWall += wall;
  }

  return {
    ...tower,
    orientations,
    total_envelope: fmt2(totalAll),
    total_glass: fmt2(totalGlass),
    total_wall: fmt2(totalWall),
    wwr: totalAll > 0 ? fmt2(totalGlass / totalAll) : "0.00",
  };
}

function towerScalarRecord(tower: DwellingTowerState, scalarParams: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of scalarParams) {
    if (p === "orientations") continue;
    out[p] = String(tower[p] ?? "");
  }
  return out;
}

function runPipelineRows(
  rows: OrientationRow[],
  schema: AnnexureSchemaDefinition,
): OrientationRow[] {
  const pipeline = schema.dwellingRowPipeline ?? [];
  if (!pipeline.length) return rows;

  const lookupMaps = schema.lookupMaps as EvalCtx["lookupMaps"];
  const updated: OrientationRow[] = [];
  for (const rowIn of rows) {
    const row = { ...rowIn };
    for (const step of pipeline) {
      const ctx: EvalCtx = { row, rows: updated, scalar: {}, global: {}, lookupMaps };
      row[step.set] = applyComputedValue(evaluateExpr(step.expr, ctx));
    }
    updated.push(row);
  }
  return updated;
}

function runPipelineTowerScalars(
  orientations: OrientationRow[],
  scalar: Record<string, string>,
  schema: AnnexureSchemaDefinition,
): Record<string, string> {
  const pipeline = schema.dwellingTowerPipeline ?? [];
  if (!pipeline.length) return scalar;

  const lookupMaps = schema.lookupMaps as EvalCtx["lookupMaps"];
  const next = { ...scalar };
  for (const step of pipeline) {
    const ctx: EvalCtx = { row: {}, rows: orientations, scalar: next, global: {}, lookupMaps };
    next[step.set] = applyComputedValue(evaluateExpr(step.expr, ctx));
  }
  return next;
}

export function recalcDwellingTower(
  tower: DwellingTowerState,
  schema: AnnexureSchemaDefinition,
): DwellingTowerState {
  const layout = schema.dwellingLayout!;
  let orientations = (tower.orientations as OrientationRow[]).map((r) => ({ ...r }));

  if (schema.dwellingRowPipeline?.length) {
    orientations = runPipelineRows(orientations, schema);
  } else if (layout.layoutMode !== "rowTable") {
    return recalcEnergyEnvelopeTower(tower, layout);
  }

  let next: DwellingTowerState = { ...tower, orientations };

  const scalarParams = schema.dwellingStore?.towerScalarParams ?? [];
  if (schema.dwellingTowerPipeline?.length && scalarParams.length) {
    const scalar = runPipelineTowerScalars(orientations, towerScalarRecord(tower, scalarParams), schema);
    for (const p of scalarParams) {
      next[p] = scalar[p] ?? "";
    }
  } else if (!schema.dwellingRowPipeline?.length) {
    next = recalcEnergyEnvelopeTower(next, layout);
  }

  return next;
}

export function emptyTower(
  layout: AnnexureDwellingLayoutDef,
  tableIndex: number,
  schema?: AnnexureSchemaDefinition,
): DwellingTowerState {
  const n = layout.orientationRowCount ?? 5;
  const nameParam = towerNameParam(layout);
  const tower: DwellingTowerState = {
    tableIndex,
    [nameParam]: "",
    orientations: Array.from({ length: n }, () => emptyOrientationRow(layout)),
  };
  for (const f of layout.towerFields ?? []) {
    tower[f.param] = "";
  }
  const rowTableScalars =
    schema?.dwellingStore?.towerScalarParams ??
    (layout.layoutMode === "rowTable"
      ? ["total_floor_area", "total_complied_area", "percentage_home"]
      : []);
  for (const p of rowTableScalars) {
    if (p !== "orientations") tower[p] = "";
  }
  if (layout.complianceHeaderParam) {
    tower[layout.complianceHeaderParam] = "";
  }
  return schema ? recalcDwellingTower(tower, schema) : tower;
}

export function recalcAllTowers(
  towers: DwellingTowerState[],
  schema: AnnexureSchemaDefinition,
): DwellingTowerState[] {
  return towers.map((t) => recalcDwellingTower(t, schema));
}

export function applyLocationToGlobal(
  global: DwellingGlobalState,
  locationSlug: string,
  locations?: Record<string, { latitude: string; climatic_zone: string }>,
): DwellingGlobalState {
  if (!locationSlug || !locations?.[locationSlug]) {
    return { ...global, location_select: locationSlug, latitude: "", climatic_zone: "" };
  }
  const loc = locations[locationSlug];
  return {
    location_select: locationSlug,
    latitude: loc.latitude,
    climatic_zone: loc.climatic_zone,
  };
}
