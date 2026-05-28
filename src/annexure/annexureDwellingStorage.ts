import type { AnnexureDwellingLayoutDef, AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import {
  applyLocationToGlobal,
  emptyTower,
  recalcAllTowers,
  recalcDwellingTower,
  type DwellingAnnexState,
  type DwellingGlobalState,
  type DwellingTowerState,
  type OrientationRow,
} from "@/annexure/annexureDwellingCalculations";

type DwellingMap = Record<string, string | string[]>;

function parseMap(raw: string | undefined): DwellingMap {
  if (!raw?.trim()) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) return v as DwellingMap;
  } catch {
    /* plain string legacy */
  }
  return { "1": raw };
}

function towerKeys(maps: DwellingMap[]): number[] {
  const keys = new Set<number>();
  for (const m of maps) {
    for (const k of Object.keys(m)) {
      const n = parseInt(k, 10);
      if (Number.isFinite(n) && n > 0) keys.add(n);
    }
  }
  return keys.size ? [...keys].sort((a, b) => a - b) : [1];
}

function sliceScalar(map: DwellingMap, tableIndex: number): string {
  const v = map[String(tableIndex)];
  if (Array.isArray(v)) return String(v[0] ?? "");
  return v != null ? String(v) : "";
}

function sliceArray(map: DwellingMap, tableIndex: number, len: number): string[] {
  const v = map[String(tableIndex)];
  const arr = Array.isArray(v) ? v.map((x) => String(x ?? "")) : [];
  while (arr.length < len) arr.push("");
  return arr.slice(0, len);
}

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function towerNameParam(layout: AnnexureDwellingLayoutDef): string {
  return layout.towerNameParam ?? "enegry_tower";
}

function resolveOrientationRowCount(
  layout: AnnexureDwellingLayoutDef,
  maps: Record<string, DwellingMap>,
  storeOrientationParams: string[],
): number {
  const base = layout.orientationRowCount ?? 5;
  let maxLen = base;
  for (const p of storeOrientationParams) {
    const m = maps[p];
    if (!m) continue;
    for (const k of Object.keys(m)) {
      const v = m[k];
      const len = Array.isArray(v) ? v.length : v ? 1 : 0;
      if (len > maxLen) maxLen = len;
    }
  }
  const cap = layout.maxOrientationRows ?? 50;
  const min = layout.minOrientationRows ?? 1;
  return Math.min(Math.max(maxLen, min), cap);
}

export function hydrateDwellingFromForm(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): DwellingAnnexState {
  const layout = schema.dwellingLayout!;
  const store = schema.dwellingStore!;
  const nameParam = towerNameParam(layout);
  const orientParams = store.orientationParams ?? [];

  const maps: Record<string, DwellingMap> = {};
  const allParams = [
    ...(store.towerStringParams ?? []),
    ...(store.towerScalarParams ?? []),
    ...orientParams,
  ];
  for (const p of allParams) {
    maps[p] = parseMap(getParam(form, tab, subtab, p));
  }

  const indices = towerKeys(Object.values(maps));
  const defaultCount = Math.max(layout.defaultTowerCount ?? 1, indices.length);
  const orientLen = resolveOrientationRowCount(layout, maps, orientParams);

  const towers: DwellingTowerState[] = [];
  for (let ti = 0; ti < defaultCount; ti++) {
    const tableIndex = indices[ti] ?? ti + 1;
    const tower = emptyTower(layout, tableIndex);
    tower[nameParam] = sliceScalar(maps[nameParam] ?? {}, tableIndex);
    for (const p of store.towerScalarParams ?? []) {
      tower[p] = sliceScalar(maps[p] ?? {}, tableIndex);
    }
    const orientations: OrientationRow[] = [];
    for (let oi = 0; oi < orientLen; oi++) {
      const row: OrientationRow = {};
      for (const c of layout.orientationColumns ?? []) {
        if (c.computed) {
          row[c.param] = "";
          continue;
        }
        const arr = sliceArray(maps[c.param] ?? {}, tableIndex, orientLen);
        row[c.param] = arr[oi] ?? "";
      }
      orientations.push(row);
    }
    tower.orientations = orientations;
    towers.push(recalcDwellingTower(tower, schema));
  }

  const global: DwellingGlobalState = {};
  if (layout.globalFields?.length) {
    const locRaw = getParam(form, tab, subtab, "location_select");
    let location_select = "";
    if (locRaw?.trim()) {
      try {
        const parsed = JSON.parse(locRaw) as unknown;
        if (typeof parsed === "string") location_select = parsed;
        else if (parsed && typeof parsed === "object") location_select = String((parsed as DwellingMap)["1"] ?? "");
      } catch {
        location_select = locRaw;
      }
    }
    global.location_select = location_select;
    global.latitude = getParam(form, tab, subtab, "latitude")?.replace(/^\[|\]$/g, "") ?? "";
    global.climatic_zone = sliceScalar(parseMap(getParam(form, tab, subtab, "climatic_zone")), 1);
  }

  const locations = schema.lookupMaps?.locations as unknown as
    | Record<string, { latitude: string; climatic_zone: string }>
    | undefined;

  return {
    global: layout.globalFields?.length
      ? applyLocationToGlobal(global, global.location_select ?? "", locations)
      : global,
    towers: recalcAllTowers(towers, schema),
  };
}

function encodeTowerString(map: DwellingMap, towers: DwellingTowerState[], param: string): string {
  const out: DwellingMap = { ...map };
  for (const t of towers) {
    out[String(t.tableIndex)] = String(t[param] ?? "");
  }
  return JSON.stringify(out);
}

function encodeTowerScalar(map: DwellingMap, towers: DwellingTowerState[], param: string): string {
  const out: DwellingMap = { ...map };
  for (const t of towers) {
    const raw = t[param];
    out[String(t.tableIndex)] = Array.isArray(raw) ? raw.map(String) : [String(raw ?? "")];
  }
  return JSON.stringify(out);
}

function encodeOrientation(
  map: DwellingMap,
  towers: DwellingTowerState[],
  param: string,
): string {
  const out: DwellingMap = { ...map };
  for (const t of towers) {
    const arr = (t.orientations as OrientationRow[]).map((r) => String(r[param] ?? ""));
    out[String(t.tableIndex)] = arr;
  }
  return JSON.stringify(out);
}

export function buildSavePayloadFromDwelling(
  schema: AnnexureSchemaDefinition,
  state: DwellingAnnexState,
): { paramName: string; type: string; value: string }[] {
  const store = schema.dwellingStore!;
  const layout = schema.dwellingLayout!;
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of store.globalParams ?? []) {
    if (p === "location_select") {
      fields.push({ paramName: p, type: "t", value: state.global.location_select ?? "" });
    } else if (p === "latitude") {
      fields.push({ paramName: p, type: "t", value: state.global.latitude ?? "" });
    } else if (p === "climatic_zone") {
      fields.push({
        paramName: p,
        type: "t",
        value: JSON.stringify({ "1": state.global.climatic_zone ?? "" }),
      });
    }
  }

  for (const p of store.towerStringParams ?? []) {
    fields.push({
      paramName: p,
      type: "t",
      value: encodeTowerString({}, state.towers, p),
    });
  }
  for (const p of store.towerScalarParams ?? []) {
    if (layout.layoutMode === "rowTable") {
      const out: DwellingMap = {};
      for (const t of state.towers) {
        out[String(t.tableIndex)] = String(t[p] ?? "");
      }
      fields.push({ paramName: p, type: "t", value: JSON.stringify(out) });
    } else {
      fields.push({
        paramName: p,
        type: "t",
        value: encodeTowerScalar({}, state.towers, p),
      });
    }
  }
  const computedParams = new Set(
    (layout.orientationColumns ?? []).filter((c) => c.computed).map((c) => c.param),
  );
  for (const p of store.orientationParams ?? []) {
    if (computedParams.has(p)) continue;
    fields.push({
      paramName: p,
      type: "t",
      value: encodeOrientation({}, state.towers, p),
    });
  }

  return fields;
}
