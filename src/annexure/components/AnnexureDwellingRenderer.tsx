import type {
  AnnexureDwellingFieldDef,
  AnnexureSchemaDefinition,
} from "@/annexure/annexureTypes";
import {
  applyLocationToGlobal,
  emptyOrientationRow,
  emptyTower,
  recalcDwellingTower,
  type DwellingAnnexState,
  type DwellingTowerState,
  type OrientationRow,
} from "@/annexure/annexureDwellingCalculations";
import {
  buildSavePayloadFromDwelling,
  hydrateDwellingFromForm,
} from "@/annexure/annexureDwellingStorage";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { JSX, MutableRefObject } from "react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
  ratingTypeId: number;
  formState: CertificationFormResponse;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

export function AnnexureDwellingRenderer({ schema, tab, subtab, ratingTypeId, formState, saveHandleRef }: Props) {
  const layout = schema.dwellingLayout!;
  const locations = schema.lookupMaps?.locations as unknown as
    | Record<string, { latitude: string; climatic_zone: string }>
    | undefined;

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value])
          .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
      ),
    [formState.data, tab, subtab],
  );

  const [state, setState] = useState<DwellingAnnexState>(() =>
    hydrateDwellingFromForm(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setState(hydrateDwellingFromForm(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const updateSave = useCallback(() => {
    saveHandleRef.current = {
      getSaveFields: () => buildSavePayloadFromDwelling(schema, state),
    };
  }, [schema, state, saveHandleRef]);

  useEffect(() => {
    updateSave();
    return () => {
      saveHandleRef.current = null;
    };
  }, [updateSave]);

  const setGlobal = useCallback(
    (patch: Partial<DwellingAnnexState["global"]>) => {
      setState((prev) => {
        let global = { ...prev.global, ...patch };
        if ("location_select" in patch) {
          global = applyLocationToGlobal(global, global.location_select, locations);
        }
        return { ...prev, global };
      });
    },
    [locations],
  );

  const updateTower = useCallback(
    (tableIndex: number, updater: (t: DwellingTowerState) => DwellingTowerState) => {
      setState((prev) => ({
        ...prev,
        towers: prev.towers.map((t) =>
          t.tableIndex === tableIndex ? recalcDwellingTower(updater(t), schema) : t,
        ),
      }));
    },
    [schema],
  );

  const addTower = useCallback(() => {
    setState((prev) => {
      const max = layout.maxTowers ?? 20;
      if (prev.towers.length >= max) return prev;
      const nextIndex =
        prev.towers.reduce((m, t) => Math.max(m, t.tableIndex), 0) + 1;
      return {
        ...prev,
        towers: [...prev.towers, emptyTower(layout, nextIndex, schema)],
      };
    });
  }, [layout, schema]);

  const removeTower = useCallback(
    (tableIndex: number) => {
      setState((prev) => {
        const min = layout.minTowers ?? 1;
        if (prev.towers.length <= min) return prev;
        return { ...prev, towers: prev.towers.filter((t) => t.tableIndex !== tableIndex) };
      });
    },
    [layout.minTowers],
  );

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={addTower}
            disabled={state.towers.length >= (layout.maxTowers ?? 20)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean-hover disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {layout.addTowerLabel ?? "Add Tower"}
          </button>
          <p className="text-xs text-muted-foreground">
            {state.towers.length} tower{state.towers.length !== 1 ? "s" : ""}
          </p>
        </div>

        {(layout.globalFields ?? []).length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <tbody>
              {(layout.globalFields ?? []).map((f) => (
                <tr key={f.param} className="border-b border-border/70">
                  <td className="w-1/2 px-3 py-2 font-medium">{f.label}</td>
                  <td className="px-3 py-2">
                    {f.type === "select" && f.options ? (
                      <select
                        className={inputClass}
                        value={state.global[f.param as keyof typeof state.global] ?? ""}
                        onChange={(e) => setGlobal({ [f.param]: e.target.value } as Partial<DwellingAnnexState["global"]>)}
                      >
                        {Object.entries(f.options).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className={readonlyClass}>
                        {state.global[f.param as keyof typeof state.global] ?? ""}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : null}

        {state.towers.map((tower) =>
          layout.layoutMode === "rowTable" ? (
            <RowTableTowerPanel
              key={tower.tableIndex}
              tower={tower}
              layout={layout}
              canRemove={state.towers.length > (layout.minTowers ?? 1)}
              onRemove={() => removeTower(tower.tableIndex)}
              onTowerChange={(updater) => updateTower(tower.tableIndex, updater)}
            />
          ) : (
            <TowerPanel
              key={tower.tableIndex}
              tower={tower}
              layout={layout}
              canRemove={state.towers.length > (layout.minTowers ?? 1)}
              onRemove={() => removeTower(tower.tableIndex)}
              onTowerChange={(updater) => updateTower(tower.tableIndex, updater)}
            />
          ),
        )}
      </div>
    </div>
  );
}

function RowTableTowerPanel({
  tower,
  layout,
  canRemove,
  onRemove,
  onTowerChange,
}: {
  tower: DwellingTowerState;
  layout: NonNullable<AnnexureSchemaDefinition["dwellingLayout"]>;
  canRemove: boolean;
  onRemove: () => void;
  onTowerChange: (fn: (t: DwellingTowerState) => DwellingTowerState) => void;
}) {
  const nameParam = layout.towerNameParam ?? "dwelling_type";
  const columns = layout.orientationColumns ?? [];
  const complianceN = layout.complianceColumnCount ?? 2;
  const complianceHeaderParam = layout.complianceHeaderParam;
  const dataColumns =
    complianceHeaderParam && columns.length > complianceN
      ? columns.slice(0, -complianceN)
      : columns;
  const complianceColumns =
    complianceHeaderParam && columns.length > complianceN ? columns.slice(-complianceN) : [];
  const orientations = tower.orientations as OrientationRow[];
  const minRows = layout.minOrientationRows ?? 1;
  const maxRows = layout.maxOrientationRows ?? 50;
  const customFooter = layout.rowTableFooter;

  const addRow = () => {
    onTowerChange((t) => {
      const rows = t.orientations as OrientationRow[];
      if (rows.length >= maxRows) return t;
      return { ...t, orientations: [...rows, emptyOrientationRow(layout)] };
    });
  };

  const renderHeaderRows = () => {
    if (layout.rowTableHeaderStyle === "fte") {
      const groups = layout.orientationColumnGroups ?? [];
      const groupedParams = new Set(groups.flatMap((g) => g.params));
      const beforeGroup = columns.filter((c) => {
        if (groupedParams.has(c.param)) return false;
        const firstGroupIdx = columns.findIndex((col) => groupedParams.has(col.param));
        return columns.indexOf(c) < firstGroupIdx;
      });
      const afterGroup = columns.filter((c) => {
        if (groupedParams.has(c.param)) return false;
        const lastGroupIdx = columns.reduce(
          (max, col, i) => (groupedParams.has(col.param) ? i : max),
          -1,
        );
        return columns.indexOf(c) > lastGroupIdx;
      });
      const groupColumns = groups.flatMap((g) =>
        g.params
          .map((p) => columns.find((c) => c.param === p))
          .filter((c): c is NonNullable<typeof c> => Boolean(c)),
      );
      const towerNameLabel =
        layout.towerNameLabel ?? "Building Name / Building Typology / Space Name";
      const nameColSpan = beforeGroup.length;

      return (
        <>
          <tr className="border-b border-border bg-ocean/10">
            <th
              rowSpan={3}
              className="sticky left-0 z-20 w-10 bg-ocean/10 px-2 py-2 text-center font-semibold text-ocean"
            >
              #
            </th>
            <th
              colSpan={nameColSpan}
              className="px-3 py-2 text-center text-sm font-semibold text-ocean"
            >
              {towerNameLabel}
            </th>
            <th colSpan={2} className="px-2 py-1.5">
              <input
                type="text"
                className={inputClass}
                placeholder="Building / typology / space name"
                value={String(tower[nameParam] ?? "")}
                onChange={(e) => onTowerChange((t) => ({ ...t, [nameParam]: e.target.value }))}
              />
            </th>
          </tr>
          <tr className="border-b border-border bg-ocean/10">
            {beforeGroup.map((c) => (
              <th
                key={c.param}
                rowSpan={2}
                className={`whitespace-nowrap px-2 py-2 text-center text-xs font-semibold text-ocean ${c.width ?? ""}`}
              >
                {c.header}
              </th>
            ))}
            {groups.map((g) => (
              <th
                key={g.label}
                colSpan={g.params.length}
                className="px-2 py-2 text-center text-xs font-semibold text-ocean"
              >
                {g.label}
              </th>
            ))}
            {afterGroup.map((c) => (
              <th
                key={c.param}
                rowSpan={2}
                className={`whitespace-nowrap px-2 py-2 text-center text-xs font-semibold text-ocean ${c.width ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
          <tr className="border-b border-border bg-ocean/10">
            {groupColumns.map((c) => (
              <th
                key={c.param}
                className={`whitespace-nowrap px-2 py-2 text-center text-xs font-medium text-ocean ${c.width ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </>
      );
    }

    if (complianceHeaderParam) {
      return (
        <>
          <tr className="border-b border-border bg-ocean/10">
            <th
              colSpan={dataColumns.length + complianceColumns.length + 1}
              className="px-3 py-2 text-center font-semibold text-ocean"
            >
              Dwelling Unit Type {tower.tableIndex}
            </th>
          </tr>
          <tr className="border-b border-border bg-ocean/10">
            <th
              rowSpan={2}
              className="sticky left-0 z-20 w-10 bg-ocean/10 px-2 py-2 text-center font-semibold text-ocean"
            >
              #
            </th>
            {dataColumns.map((c) => (
              <th
                key={c.param}
                rowSpan={2}
                className={`whitespace-nowrap px-2 py-2 text-left font-semibold text-ocean ${c.width ?? ""}`}
              >
                {c.header}
              </th>
            ))}
            <th colSpan={complianceColumns.length} className="px-2 py-2 text-center font-semibold text-ocean">
              <input
                type="text"
                className={`${inputClass} mx-auto max-w-xs`}
                value={String(tower[complianceHeaderParam] ?? "")}
                onChange={(e) =>
                  onTowerChange((t) => ({ ...t, [complianceHeaderParam]: e.target.value }))
                }
              />
            </th>
          </tr>
          <tr className="border-b border-border bg-ocean/10">
            {complianceColumns.map((c) => (
              <th
                key={c.param}
                className={`whitespace-nowrap px-2 py-2 text-left text-xs font-semibold text-ocean ${c.width ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </>
      );
    }

    return (
      <>
        <tr className="border-b border-border bg-ocean/10">
          <th colSpan={columns.length + 1} className="px-3 py-2 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold text-ocean">Dwelling Unit Type {tower.tableIndex}</span>
              <input
                type="text"
                className={`${inputClass} max-w-[200px]`}
                placeholder="e.g. 3BHK Type1"
                value={String(tower[nameParam] ?? "")}
                onChange={(e) =>
                  onTowerChange((t) => ({ ...t, [nameParam]: e.target.value }))
                }
              />
            </div>
          </th>
        </tr>
        <tr className="border-b border-border bg-ocean/10">
          <th className="sticky left-0 z-20 w-10 bg-ocean/10 px-2 py-2 text-center font-semibold text-ocean">
            #
          </th>
          {columns.map((c) => (
            <th
              key={c.param}
              className={`whitespace-nowrap px-2 py-2 text-left font-semibold text-ocean ${c.width ?? ""}`}
            >
              {c.header}
            </th>
          ))}
        </tr>
      </>
    );
  };

  const renderFooter = () => {
    if (customFooter?.length) {
      return (
        <tfoot className="border-t-2 border-border bg-muted/20">
          {customFooter.map((fr, fi) => (
            <tr key={fi}>
              {fr.cells.map((cell, j) => {
                if (cell.kind === "empty") {
                  return <td key={j} className="px-2 py-2" />;
                }
                if (cell.kind === "label") {
                  return (
                    <td
                      key={j}
                      colSpan={cell.colspan ?? 1}
                      className="px-3 py-2 text-right text-sm font-medium"
                    >
                      {cell.text}
                    </td>
                  );
                }
                return (
                  <td key={j} colSpan={cell.colspan ?? 1} className="px-2 py-2">
                    <div className={readonlyClass}>{String(tower[cell.param ?? ""] ?? "")}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tfoot>
      );
    }

    return (
      <tfoot className="border-t-2 border-border bg-muted/20">
        <tr>
          <td className="px-2 py-2" />
          <td colSpan={2} className="px-3 py-2 text-right font-medium">
            Total
          </td>
          <td className="px-2 py-2">
            <div className={readonlyClass}>{String(tower.total_floor_area ?? "")}</div>
          </td>
          <td colSpan={6} className="px-3 py-2 text-right font-medium">
            Total Complied Area
          </td>
          <td className="px-2 py-2">
            <div className={readonlyClass}>{String(tower.total_complied_area ?? "")}</div>
          </td>
        </tr>
        <tr>
          <td className="px-2 py-2" />
          <td colSpan={columns.length - 1} className="px-3 py-2 text-right font-medium">
            Percentage
          </td>
          <td className="px-2 py-2">
            <div className={readonlyClass}>{String(tower.percentage_home ?? "")}</div>
          </td>
        </tr>
      </tfoot>
    );
  };

  return (
    <div className="relative rounded-xl border border-border bg-muted/10 p-4">
      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white shadow"
          title="Remove dwelling unit"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 pr-8">
        {layout.rowTableHeaderStyle !== "fte" ? (
          <h4 className="text-sm font-semibold text-ocean">
            Dwelling Unit Type {tower.tableIndex}
          </h4>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={addRow}
          disabled={orientations.length >= maxRows}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ocean px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean-hover disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {layout.addRowLabel ?? "Add Row"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-max min-w-full border-collapse text-sm">
          <thead>{renderHeaderRows()}</thead>
          <tbody>
            {orientations.map((row, ri) => (
              <tr key={ri} className="border-b border-border/60 odd:bg-muted/15">
                <td className="sticky left-0 z-10 bg-card px-2 py-1 text-center text-muted-foreground">
                  {ri + 1}
                </td>
                {columns.map((c) => (
                  <td key={c.param} className={`px-2 py-1 align-middle ${c.width ?? ""}`}>
                    {c.type === "select" && c.options ? (
                      <select
                        className={inputClass}
                        value={row[c.param] ?? ""}
                        onChange={(e) =>
                          onTowerChange((t) => {
                            const next = (t.orientations as OrientationRow[]).map((r, i) =>
                              i === ri ? { ...r, [c.param]: e.target.value } : r,
                            );
                            return { ...t, orientations: next };
                          })
                        }
                      >
                        {Object.entries(c.options).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : c.computed || c.type === "readonly" ? (
                      <div className={readonlyClass}>{row[c.param] ?? ""}</div>
                    ) : (
                      <input
                        type={c.type === "number" ? "number" : "text"}
                        step={c.step ?? "0.01"}
                        className={inputClass}
                        value={row[c.param] ?? ""}
                        onChange={(e) => {
                          const v = c.step === "0.01" ? clampDecimal(e.target.value) : e.target.value;
                          onTowerChange((t) => {
                            const next = (t.orientations as OrientationRow[]).map((r, i) =>
                              i === ri ? { ...r, [c.param]: v } : r,
                            );
                            return { ...t, orientations: next };
                          });
                        }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {renderFooter()}
        </table>
      </div>
    </div>
  );
}

const SECTIONS_BEFORE_FENESTRATION = ["Wall Properties", "Glass Properties"] as const;
const SECTIONS_AFTER_FENESTRATION = ["Air Conditioning Details", "Roof Details"] as const;

function groupTowerFields(fields: AnnexureDwellingFieldDef[] | undefined) {
  const map = new Map<string, AnnexureDwellingFieldDef[]>();
  for (const f of fields ?? []) {
    if (f.placement === "afterFenestration") continue;
    const sec = f.section ?? "Details";
    if (!map.has(sec)) map.set(sec, []);
    map.get(sec)!.push(f);
  }
  return map;
}

function envelopeSummaryFields(fields: AnnexureDwellingFieldDef[] | undefined) {
  return (fields ?? []).filter((f) => f.placement === "afterFenestration");
}

function TowerPanel({
  tower,
  layout,
  canRemove,
  onRemove,
  onTowerChange,
}: {
  tower: DwellingTowerState;
  layout: NonNullable<AnnexureSchemaDefinition["dwellingLayout"]>;
  canRemove: boolean;
  onRemove: () => void;
  onTowerChange: (fn: (t: DwellingTowerState) => DwellingTowerState) => void;
}) {
  const fieldBySection = useMemo(() => groupTowerFields(layout.towerFields), [layout.towerFields]);
  const summaryFields = useMemo(
    () => envelopeSummaryFields(layout.towerFields),
    [layout.towerFields],
  );
  const orientations = tower.orientations as OrientationRow[];
  const columns = layout.orientationColumns ?? [];
  const colCount = Math.max(columns.length, 6);
  const labelColSpan = colCount - 1;

  const renderTowerInput = (f: AnnexureDwellingFieldDef) => {
    if (f.type === "select" && f.options) {
      return (
        <select
          className={inputClass}
          value={String(tower[f.param] ?? "")}
          onChange={(e) => onTowerChange((t) => ({ ...t, [f.param]: e.target.value }))}
        >
          {Object.entries(f.options).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      );
    }
    if (f.computed || f.type === "readonly") {
      return <div className={readonlyClass}>{String(tower[f.param] ?? "")}</div>;
    }
    return (
      <input
        type={f.type === "number" ? "number" : "text"}
        step={f.step ?? "0.01"}
        className={inputClass}
        value={String(tower[f.param] ?? "")}
        onChange={(e) => {
          const v = f.step === "0.01" ? clampDecimal(e.target.value) : e.target.value;
          onTowerChange((t) => ({ ...t, [f.param]: v }));
        }}
      />
    );
  };

  const renderSectionHeader = (title: string) => (
    <tr key={`hdr-${title}`} className="bg-muted/30">
      <td colSpan={colCount} className="px-3 py-2">
        <h5 className="text-sm font-semibold text-ocean">{title}</h5>
      </td>
    </tr>
  );

  const renderLabelRow = (f: AnnexureDwellingFieldDef) => (
    <tr key={f.param} className="border-b border-border/60">
      <td colSpan={labelColSpan} className="px-3 py-2 align-middle font-medium">
        {f.label}
      </td>
      <td className="px-3 py-2 align-middle">{renderTowerInput(f)}</td>
    </tr>
  );

  const renderSectionFields = (section: string, fields: AnnexureDwellingFieldDef[]): JSX.Element[] => {
    if (section === "Air Conditioning Details") {
      const rows: JSX.Element[] = [renderSectionHeader(section)];
      for (const f of fields) {
        if (f.param === "select_sys_isser") continue;
        if (f.param === "sys_applicable") {
          const metric = fields.find((x) => x.param === "select_sys_isser");
          rows.push(
            <tr key="sys_applicable" className="border-b border-border/60">
              <td colSpan={Math.max(labelColSpan - 1, 3)} className="px-3 py-2 align-middle font-medium">
                {f.label}
              </td>
              <td className="px-3 py-2 align-middle">{renderTowerInput(f)}</td>
              <td className="px-3 py-2 align-middle">
                {metric ? renderTowerInput(metric) : null}
              </td>
            </tr>,
          );
          continue;
        }
        rows.push(renderLabelRow(f));
      }
      return rows;
    }

    if (section === "Roof Details") {
      const rows: JSX.Element[] = [renderSectionHeader(section)];
      for (const f of fields) {
        if (f.param === "value_roof_unit_eng") continue;
        if (f.param === "value_roof_eng") {
          const unit = fields.find((x) => x.param === "value_roof_unit_eng");
          rows.push(
            <tr key="value_roof_eng" className="border-b border-border/60">
              <td colSpan={Math.max(labelColSpan - 1, 3)} className="px-3 py-2 align-middle font-medium">
                {f.label}
              </td>
              <td className="px-3 py-2 align-middle">{renderTowerInput(f)}</td>
              <td className="px-3 py-2 align-middle">
                {unit ? renderTowerInput(unit) : null}
              </td>
            </tr>,
          );
          continue;
        }
        rows.push(renderLabelRow(f));
      }
      return rows;
    }

    return [renderSectionHeader(section), ...fields.map((f) => renderLabelRow(f))];
  };

  return (
    <div className="relative rounded-xl border border-border bg-muted/10 p-4">
      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white shadow"
          title="Remove tower"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <tbody>
            <tr className="border-b border-border/60">
              <td colSpan={labelColSpan} className="px-3 py-2">
                <h5 className="text-sm font-semibold text-ocean">General Details</h5>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                    Tower
                  </span>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Tower name"
                    value={String(tower.enegry_tower ?? "")}
                    onChange={(e) => onTowerChange((t) => ({ ...t, enegry_tower: e.target.value }))}
                  />
                </div>
              </td>
            </tr>

            {SECTIONS_BEFORE_FENESTRATION.flatMap((sec) =>
              renderSectionFields(sec, fieldBySection.get(sec) ?? []),
            )}

            {renderSectionHeader("Envelope Details")}
            {renderSectionHeader("Wall and Fenestration Details")}
            <tr className="border-b border-border bg-ocean/10">
              {columns.map((c) => (
                <th key={c.param} className="whitespace-nowrap px-2 py-2 text-left font-semibold text-ocean">
                  {c.header}
                </th>
              ))}
            </tr>
            {orientations.map((row, ri) => (
              <tr key={ri} className="border-b border-border/60">
                {columns.map((c) => (
                  <td key={c.param} className="px-2 py-1 align-middle">
                    {c.type === "select" && c.options ? (
                      <select
                        className={inputClass}
                        value={row[c.param] ?? ""}
                        onChange={(e) =>
                          onTowerChange((t) => {
                            const next = (t.orientations as OrientationRow[]).map((r, i) =>
                              i === ri ? { ...r, [c.param]: e.target.value } : r,
                            );
                            return { ...t, orientations: next };
                          })
                        }
                      >
                        {Object.entries(c.options).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : c.computed || c.type === "readonly" ? (
                      <div className={readonlyClass}>{row[c.param] ?? ""}</div>
                    ) : (
                      <input
                        type="number"
                        step={c.step ?? "0.01"}
                        className={inputClass}
                        value={row[c.param] ?? ""}
                        onChange={(e) => {
                          const v = clampDecimal(e.target.value);
                          onTowerChange((t) => {
                            const next = (t.orientations as OrientationRow[]).map((r, i) =>
                              i === ri ? { ...r, [c.param]: v } : r,
                            );
                            return { ...t, orientations: next };
                          });
                        }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}

            <tr className="border-b border-border/60 bg-muted/20 font-medium">
              <td colSpan={Math.max(colCount - 3, 3)} className="px-3 py-2">
                Total
              </td>
              {(["total_envelope", "total_glass", "total_wall"] as const).map((param) => (
                  <td key={param} className="px-2 py-2">
                    <div className={readonlyClass}>{String(tower[param] ?? "")}</div>
                  </td>
                ))}
            </tr>
            <tr className="border-b border-border/60">
              <td colSpan={labelColSpan} className="px-3 py-2 font-medium">
                WWR
              </td>
              <td className="px-3 py-2">
                <div className={readonlyClass}>{String(tower.wwr ?? "")}</div>
              </td>
            </tr>

            {SECTIONS_AFTER_FENESTRATION.flatMap((sec) =>
              renderSectionFields(sec, fieldBySection.get(sec) ?? []),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
