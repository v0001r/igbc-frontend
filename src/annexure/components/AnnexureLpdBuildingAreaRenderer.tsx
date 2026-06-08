import {
  computeLpdBuildingAreaState,
  emptyLpdFixtureSubRow,
  type LpdBuildingAreaRow,
  type LpdBuildingAreaState,
} from "@/annexure/annexLpdBuildingAreaCalculations";
import {
  buildSavePayloadFromLpdBuildingArea,
  hydrateLpdBuildingAreaAnnex,
  loadAreaSourceRows,
  typologyCatalogFromSchema,
} from "@/annexure/annexLpdBuildingAreaStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { RatingDataIndex } from "@/lib/ratingDataIndex";
import { Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";
const selectClass = inputClass;

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
  ratingTypeId: number;
  formState: CertificationFormResponse;
  globalExtras?: Record<string, string>;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

export function AnnexureLpdBuildingAreaRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  globalExtras,
  saveHandleRef,
}: Props) {
  const catalog = useMemo(() => typologyCatalogFromSchema(schema), [schema]);
  const typologyOptions = schema.lpdBuildingAreaLayout?.typologyOptions ?? {};

  const topologyType = useMemo(() => {
    const idx = new RatingDataIndex(formState);
    return (
      globalExtras?.topology_type?.trim() ||
      idx.get("project_details", "project_details", "topology_type") ||
      ""
    );
  }, [formState, globalExtras]);

  const sourceSignature = useMemo(() => JSON.stringify(loadAreaSourceRows(formState)), [formState]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
        sourceSignature,
        topologyType,
      ]),
    [formState.data, tab, subtab, sourceSignature, topologyType],
  );

  const [draft, setDraft] = useState<LpdBuildingAreaState>(() =>
    hydrateLpdBuildingAreaAnnex(schema, formState, tab, subtab, topologyType),
  );

  useEffect(() => {
    setDraft(hydrateLpdBuildingAreaAnnex(schema, formState, tab, subtab, topologyType));
  }, [schema, formState, tab, subtab, dataSignature, topologyType]);

  const recalc = useCallback(
    (fn: (s: LpdBuildingAreaState) => LpdBuildingAreaState) => {
      setDraft((prev) => computeLpdBuildingAreaState(fn(prev), catalog));
    },
    [catalog],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromLpdBuildingArea(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="border border-border px-2 py-2 w-10" />
                <th className="border border-border px-2 py-2">S.No</th>
                <th className="border border-border px-2 py-2 min-w-[180px]">Description of spaces</th>
                <th className="border border-border px-2 py-2">Carpet area (sq m)</th>
                <th colSpan={3} className="border border-border px-2 py-2">
                  Lighting fixtures
                </th>
                <th className="border border-border px-2 py-2">Total wattage</th>
              </tr>
              <tr className="bg-muted/60 text-center text-[11px] font-semibold text-muted-foreground">
                <th className="border border-border" colSpan={4} />
                <th className="border border-border px-2 py-1">Type</th>
                <th className="border border-border px-2 py-1">No. of fixtures</th>
                <th className="border border-border px-2 py-1">Wattage each</th>
                <th className="border border-border" />
              </tr>
            </thead>
            <tbody>
              {draft.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-border px-4 py-6 text-center text-muted-foreground">
                    No spaces found. Complete{" "}
                    <span className="font-medium">Cal Area Statement / Circulation / Sensors</span> first.
                  </td>
                </tr>
              ) : null}
              {draft.rows.map((row, idx) => (
                <LpdRowGroup
                  key={row.sourceIndex}
                  row={row}
                  rowIdx={idx}
                  displayNo={idx + 1}
                  onToggleExpand={() =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) => (i === idx ? { ...r, expanded: !r.expanded } : r)),
                    }))
                  }
                  onUpdateRow={(patch) =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
                    }))
                  }
                  onAddSubRow={() =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) =>
                        i === idx
                          ? { ...r, expanded: true, subRows: [...r.subRows, emptyLpdFixtureSubRow()] }
                          : r,
                      ),
                    }))
                  }
                  onRemoveSubRow={(subIdx) =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) =>
                        i === idx
                          ? {
                              ...r,
                              subRows: r.subRows.filter((_, si) => si !== subIdx),
                              expanded: r.subRows.length > 1,
                            }
                          : r,
                      ),
                    }))
                  }
                  onUpdateSubRow={(subIdx, patch) =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) =>
                        i === idx
                          ? {
                              ...r,
                              subRows: r.subRows.map((sub, si) =>
                                si === subIdx ? { ...sub, ...patch } : sub,
                              ),
                            }
                          : r,
                      ),
                    }))
                  }
                />
              ))}
            </tbody>
          </table>
        </div>

        <SummaryBlock
          state={draft}
          typologyOptions={typologyOptions}
          onTypologyChange={(slug) => recalc((s) => ({ ...s, building_typology_lpd: slug }))}
        />
      </div>
    </div>
  );
}

function FixtureCells({
  type,
  qty,
  wattage,
  total,
  onType,
  onQty,
  onWattage,
}: {
  type: string;
  qty: string;
  wattage: string;
  total: string;
  onType: (v: string) => void;
  onQty: (v: string) => void;
  onWattage: (v: string) => void;
}) {
  return (
    <>
      <td className="border border-border px-2 py-1">
        <input className={inputClass} value={type} onChange={(e) => onType(e.target.value)} />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={qty}
          onChange={(e) => onQty(clampDecimal(e.target.value))}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={wattage}
          onChange={(e) => onWattage(clampDecimal(e.target.value))}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={total} />
      </td>
    </>
  );
}

function LpdRowGroup({
  row,
  displayNo,
  onToggleExpand,
  onUpdateRow,
  onAddSubRow,
  onRemoveSubRow,
  onUpdateSubRow,
}: {
  row: LpdBuildingAreaRow;
  rowIdx: number;
  displayNo: number;
  onToggleExpand: () => void;
  onUpdateRow: (patch: Partial<LpdBuildingAreaRow>) => void;
  onAddSubRow: () => void;
  onRemoveSubRow: (subIdx: number) => void;
  onUpdateSubRow: (subIdx: number, patch: Partial<LpdBuildingAreaRow["subRows"][number]>) => void;
}) {
  return (
    <>
      <tr className="text-center">
        <td className="border border-border px-1 py-1">
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background hover:bg-muted"
          >
            {row.expanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        </td>
        <td className="border border-border px-2 py-1 font-medium">{displayNo}</td>
        <td className="border border-border px-2 py-1">
          <input readOnly className={readonlyClass} value={row.reqularly_occupied_spaces} />
        </td>
        <td className="border border-border px-2 py-1">
          <input readOnly className={readonlyClass} value={row.carpet_area_lpd} />
        </td>
        <FixtureCells
          type={row.lighting_fixture_type}
          qty={row.no_of_lighting_fixture}
          wattage={row.wattage_of_each_lighting_fixture}
          total={row.total_wattage_lpd}
          onType={(v) => onUpdateRow({ lighting_fixture_type: v })}
          onQty={(v) => onUpdateRow({ no_of_lighting_fixture: v })}
          onWattage={(v) => onUpdateRow({ wattage_of_each_lighting_fixture: v })}
        />
      </tr>

      {row.expanded ? (
        <tr className="bg-muted/30">
          <td colSpan={8} className="border border-border px-3 py-2 text-right">
            <button
              type="button"
              onClick={onAddSubRow}
              className="inline-flex items-center gap-1 rounded-md bg-ocean px-2 py-1 text-xs font-medium text-white hover:bg-ocean/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Sub Row
            </button>
          </td>
        </tr>
      ) : null}

      {row.expanded
        ? row.subRows.map((sub, subIdx) => (
            <tr key={`${row.sourceIndex}-sub-${subIdx}`} className="bg-muted/20 text-center">
              <td className="border border-border" />
              <td className="border border-border text-muted-foreground text-xs">—</td>
              <td className="border border-border" colSpan={2} />
              <td className="border border-border px-2 py-1">
                <input
                  className={inputClass}
                  value={sub.lighting_fixture_type}
                  onChange={(e) =>
                    onUpdateSubRow(subIdx, { lighting_fixture_type: e.target.value })
                  }
                />
              </td>
              <td className="border border-border px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={sub.no_of_lighting_fixture}
                  onChange={(e) =>
                    onUpdateSubRow(subIdx, { no_of_lighting_fixture: clampDecimal(e.target.value) })
                  }
                />
              </td>
              <td className="border border-border px-2 py-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onRemoveSubRow(subIdx)}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    step="0.01"
                    className={`${inputClass} flex-1`}
                    value={sub.wattage_of_each_lighting_fixture}
                    onChange={(e) =>
                      onUpdateSubRow(subIdx, {
                        wattage_of_each_lighting_fixture: clampDecimal(e.target.value),
                      })
                    }
                  />
                </div>
              </td>
              <td className="border border-border px-2 py-1">
                <input readOnly className={readonlyClass} value={sub.total_wattage_lpd} />
              </td>
            </tr>
          ))
        : null}
    </>
  );
}

function SummaryBlock({
  state,
  typologyOptions,
  onTypologyChange,
}: {
  state: LpdBuildingAreaState;
  typologyOptions: Record<string, string>;
  onTypologyChange: (slug: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="border border-border px-3 py-2">Total carpet area (sq m)</td>
            <td className="border border-border px-3 py-2 w-48">
              <input readOnly className={readonlyClass} value={state.total_carpet_area_lpd} />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Total wattage (W)</td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={state.total_wattage_lpd_building} />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Design LPD (W/sq.m)</td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={state.design_lpd_building} />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Baseline LPD (W/sq.m)</td>
            <td className="border border-border px-3 py-2">
              <div className="flex gap-2">
                <select
                  className={selectClass}
                  value={state.building_typology_lpd}
                  onChange={(e) => onTypologyChange(e.target.value)}
                >
                  {Object.entries(typologyOptions).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
                <input readOnly className={`${readonlyClass} w-24`} value={state.baseline_lpd_building} />
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Percentage of LPD reduction (%)</td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={state.percentagelpd_reduction_building} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
