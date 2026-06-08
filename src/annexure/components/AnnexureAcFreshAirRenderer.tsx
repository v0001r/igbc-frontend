import {
  buildFreshAirOptions,
  computeAcFreshAirState,
  emptyFreshAirAreaSubRow,
  emptyFreshAirSystemRow,
  type AcFreshAirState,
  type FreshAirAreaRow,
  type FreshAirSystemRow,
  type SpaceTypeDef,
} from "@/annexure/annexAcFreshAirCalculations";
import {
  buildSavePayloadFromAcFreshAir,
  hydrateAcFreshAirAnnex,
  loadAreaSourceRows,
} from "@/annexure/annexAcFreshAirStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { Minus, Plus, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
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
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

function spaceTypesFromSchema(schema: AnnexureSchemaDefinition): Record<string, SpaceTypeDef> {
  const raw = schema.acFreshAirLayout?.spaceTypeOptions ?? {};
  const out: Record<string, SpaceTypeDef> = {};
  for (const [key, def] of Object.entries(raw)) {
    out[key] = { label: def.label, baseline: def.baseline, outdoor: def.outdoor ?? null };
  }
  return out;
}

export function AnnexureAcFreshAirRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.acFreshAirLayout!;
  const spaceTypes = useMemo(() => spaceTypesFromSchema(schema), [schema]);
  const maxSystemRows = layout.systemMaxRows ?? 50;
  const systemsTab = layout.systemsTabLabel ?? "Fresh air system";
  const areaTab = layout.areaTabLabel ?? "Mechanically ventilated area";

  const sourceSignature = useMemo(() => JSON.stringify(loadAreaSourceRows(formState)), [formState]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
        sourceSignature,
      ]),
    [formState.data, tab, subtab, sourceSignature],
  );

  const [activeTab, setActiveTab] = useState<"systems" | "area">("systems");
  const [draft, setDraft] = useState<AcFreshAirState>(() =>
    hydrateAcFreshAirAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateAcFreshAirAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback(
    (fn: (s: AcFreshAirState) => AcFreshAirState) => {
      setDraft((prev) => computeAcFreshAirState(fn(prev), spaceTypes));
    },
    [spaceTypes],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromAcFreshAir(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  const freshAirOptions = buildFreshAirOptions(draft.systemRows);

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("systems")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "systems"
                ? "border-ocean text-ocean"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {systemsTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("area")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "area"
                ? "border-ocean text-ocean"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {areaTab}
          </button>
        </div>

        {activeTab === "systems" ? (
          <SystemsTab
            rows={draft.systemRows}
            maxRows={maxSystemRows}
            onUpdate={(idx, patch) =>
              recalc((s) => ({
                ...s,
                systemRows: s.systemRows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
              }))
            }
            onAdd={() =>
              recalc((s) => ({
                ...s,
                systemRows: [...s.systemRows, emptyFreshAirSystemRow()],
              }))
            }
          />
        ) : (
          <AreaTab
            rows={draft.areaRows}
            spaceTypes={spaceTypes}
            freshAirOptions={freshAirOptions}
            summary={draft}
            onUpdateRow={(idx, patch) =>
              recalc((s) => ({
                ...s,
                areaRows: s.areaRows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
              }))
            }
            onToggleExpand={(idx) =>
              recalc((s) => ({
                ...s,
                areaRows: s.areaRows.map((r, i) =>
                  i === idx
                    ? {
                        ...r,
                        expanded: !r.expanded,
                        subRows:
                          !r.expanded && !r.subRows.length
                            ? [emptyFreshAirAreaSubRow()]
                            : r.subRows,
                      }
                    : r,
                ),
              }))
            }
            onAddSubRow={(idx) =>
              recalc((s) => ({
                ...s,
                areaRows: s.areaRows.map((r, i) =>
                  i === idx
                    ? { ...r, expanded: true, subRows: [...r.subRows, emptyFreshAirAreaSubRow()] }
                    : r,
                ),
              }))
            }
            onUpdateSubRow={(rowIdx, subIdx, value) =>
              recalc((s) => ({
                ...s,
                areaRows: s.areaRows.map((r, i) =>
                  i === rowIdx
                    ? {
                        ...r,
                        subRows: r.subRows.map((sub, j) =>
                          j === subIdx ? { type_of_fresh_air: value } : sub,
                        ),
                      }
                    : r,
                ),
              }))
            }
            onRemoveSubRow={(rowIdx, subIdx) =>
              recalc((s) => ({
                ...s,
                areaRows: s.areaRows.map((r, i) =>
                  i === rowIdx
                    ? {
                        ...r,
                        subRows: r.subRows.filter((_, j) => j !== subIdx),
                        expanded: r.subRows.length > 1,
                      }
                    : r,
                ),
              }))
            }
          />
        )}
      </div>
    </div>
  );
}

function SystemsTab({
  rows,
  maxRows,
  onUpdate,
  onAdd,
}: {
  rows: FreshAirSystemRow[];
  maxRows: number;
  onUpdate: (idx: number, patch: Partial<FreshAirSystemRow>) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          disabled={rows.length >= maxRows}
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean/90 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add More
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/60 text-center text-xs font-semibold uppercase text-muted-foreground">
              <th className="border border-border px-2 py-2 w-12">S.No</th>
              <th className="border border-border px-2 py-2">Type of fresh air system</th>
              <th className="border border-border px-2 py-2">Capacity of fresh air system (CFM)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="text-center">
                <td className="border border-border px-2 py-1 font-medium">{idx + 1}</td>
                <td className="border border-border px-1 py-1">
                  <input
                    className={inputClass}
                    value={row.type_of_fresh_air_sys}
                    onChange={(e) => onUpdate(idx, { type_of_fresh_air_sys: e.target.value })}
                  />
                </td>
                <td className="border border-border px-1 py-1">
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={row.air_space_baseline_capacity}
                    onChange={(e) =>
                      onUpdate(idx, { air_space_baseline_capacity: clampDecimal(e.target.value) })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AreaTab({
  rows,
  spaceTypes,
  freshAirOptions,
  summary,
  onUpdateRow,
  onToggleExpand,
  onAddSubRow,
  onUpdateSubRow,
  onRemoveSubRow,
}: {
  rows: FreshAirAreaRow[];
  spaceTypes: Record<string, SpaceTypeDef>;
  freshAirOptions: { value: string; label: string }[];
  summary: AcFreshAirState;
  onUpdateRow: (idx: number, patch: Partial<FreshAirAreaRow>) => void;
  onToggleExpand: (idx: number) => void;
  onAddSubRow: (idx: number) => void;
  onUpdateSubRow: (rowIdx: number, subIdx: number, value: string) => void;
  onRemoveSubRow: (rowIdx: number, subIdx: number) => void;
}) {
  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No regularly occupied, air-conditioned spaces found in Cal Area Statement / Circulation /
        Sensors.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] border-collapse text-xs">
          <thead>
            <tr className="bg-muted/60 text-center font-semibold uppercase text-muted-foreground">
              <th className="sticky left-0 z-10 border border-border bg-muted/60 px-2 py-2">S.No</th>
              <th className="min-w-[140px] border border-border px-2 py-2">
                Regularly occupied spaces
              </th>
              <th className="border border-border px-2 py-2">Carpet area (sq ft)</th>
              <th className="min-w-[120px] border border-border px-2 py-2">Space type</th>
              <th className="min-w-[140px] border border-border px-2 py-2">Type of fresh air system</th>
              <th className="border border-border px-2 py-2">Outdoor air rate / unit area</th>
              <th className="border border-border px-2 py-2">Design occupancy</th>
              <th className="border border-border px-2 py-2">Outdoor air rate / person</th>
              <th className="border border-border px-2 py-2">Min ventilation (baseline) CFM</th>
              <th className="border border-border px-2 py-2">10% more than minimum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <Fragment key={row.sourceIndex}>
                <tr className="text-center">
                  <td className="sticky left-0 z-[1] border border-border bg-card px-2 py-1">
                    <span className="mr-1 font-medium">{row.sourceIndex}</span>
                    <button
                      type="button"
                      onClick={() => onToggleExpand(idx)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-xs hover:bg-muted"
                    >
                      {row.expanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </button>
                  </td>
                  <td className="border border-border px-1 py-1">
                    <input readOnly className={readonlyClass} value={row.reqularly_occupied_spaces} />
                  </td>
                  <td className="border border-border px-1 py-1">
                    <input readOnly className={readonlyClass} value={row.air_space_regular_occ} />
                  </td>
                  <td className="border border-border px-1 py-1">
                    <select
                      className={selectClass}
                      value={row.air_type_of_spaces}
                      onChange={(e) => onUpdateRow(idx, { air_type_of_spaces: e.target.value })}
                    >
                      <option value="">Type</option>
                      {Object.entries(spaceTypes).map(([val, def]) => (
                        <option key={val} value={val}>
                          {def.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-border px-1 py-1">
                    <select
                      className={selectClass}
                      value={row.type_of_fresh_air}
                      onChange={(e) => onUpdateRow(idx, { type_of_fresh_air: e.target.value })}
                    >
                      <option value="">Select</option>
                      {freshAirOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-border px-1 py-1">
                    <input readOnly className={readonlyClass} value={row.air_space_baseline_lpd} />
                  </td>
                  <td className="border border-border px-1 py-1">
                    <input
                      type="number"
                      step="0.01"
                      className={inputClass}
                      value={row.air_design_occupancy}
                      onChange={(e) =>
                        onUpdateRow(idx, { air_design_occupancy: clampDecimal(e.target.value) })
                      }
                    />
                  </td>
                  <td className="border border-border px-1 py-1">
                    <input readOnly className={readonlyClass} value={row.air_space_outdoor} />
                  </td>
                  <td className="border border-border px-1 py-1">
                    <input readOnly className={readonlyClass} value={row.air_space_minimum} />
                  </td>
                  <td className="border border-border px-1 py-1">
                    <input readOnly className={readonlyClass} value={row.air_space_ventilation} />
                  </td>
                </tr>
                {row.expanded ? (
                  <tr className="bg-muted/20">
                    <td className="border border-border" />
                    <td className="border border-border" colSpan={3} />
                    <td className="border border-border px-2 py-2 align-top" colSpan={2}>
                      <p className="mb-2 text-left text-xs font-medium">
                        Type of fresh air system <span className="text-destructive">*</span>
                      </p>
                      <div className="space-y-2">
                        {row.subRows.map((sub, subIdx) => (
                          <div key={subIdx} className="flex items-center gap-2">
                            <select
                              className={selectClass}
                              value={sub.type_of_fresh_air}
                              onChange={(e) => onUpdateSubRow(idx, subIdx, e.target.value)}
                            >
                              <option value="">Select</option>
                              {freshAirOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                            {subIdx > 0 ? (
                              <button
                                type="button"
                                onClick={() => onRemoveSubRow(idx, subIdx)}
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-destructive/40 text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => onAddSubRow(idx)}
                        className="mt-2 inline-flex items-center gap-1 rounded-md bg-ocean px-2 py-1 text-xs text-white hover:bg-ocean/90"
                      >
                        <Plus className="h-3 w-3" />
                        Add Air Type
                      </button>
                    </td>
                    <td className="border border-border" colSpan={4} />
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <SummaryTable summary={summary} />
    </div>
  );
}

function SummaryTable({ summary }: { summary: AcFreshAirState }) {
  const items = [
    { label: "Mandatory fresh-air requirement (CFM)", value: summary.air_fresh_mandatory_all },
    { label: "Fresh air ventilation provided in project (CFM)", value: summary.meets_ventilation_project },
    {
      label: "Percentage of fresh air supplied against the ASHRAE 62.1 baseline (%)",
      value: summary.total_meets_supplied_air,
    },
    { label: "Design occupancy", value: summary.meets_occupancy },
    { label: "Total regularly occupied area (sq ft)", value: summary.meets_regulary_area_space },
  ];

  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {items.map((item) => (
          <tr key={item.label}>
            <td className="border border-border px-3 py-2 text-right">{item.label}</td>
            <td className="w-48 border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={item.value} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
