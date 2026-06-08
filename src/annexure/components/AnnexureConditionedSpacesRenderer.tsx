import {
  buildSystemOptions,
  computeConditionedSpacesState,
  type ConditionedAreaRow,
  type ConditionedSpacesState,
  type ConditionedSystemRow,
} from "@/annexure/annexConditionedSpacesCalculations";
import {
  buildSavePayloadFromConditionedSpaces,
  emptyAreaSubRow,
  hydrateConditionedSpacesAnnex,
  loadAreaSourceRows,
} from "@/annexure/annexConditionedSpacesStorage";
import type { AnnexureSchemaDefinition, ConditionedSpacesLayoutDef } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
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
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

function formatSysLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AnnexureConditionedSpacesRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.conditionedSpacesLayout!;

  const sourceSignature = useMemo(() => {
    const sources = loadAreaSourceRows(formState);
    return JSON.stringify(sources);
  }, [formState]);

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
  const [draft, setDraft] = useState<ConditionedSpacesState>(() =>
    hydrateConditionedSpacesAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateConditionedSpacesAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: ConditionedSpacesState) => ConditionedSpacesState) => {
    setDraft((prev) => computeConditionedSpacesState(fn(prev)));
  }, []);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromConditionedSpaces(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  const systemOptions = buildSystemOptions(draft.systemRows);
  const systemsTab = layout.systemsTabLabel ?? "Air Condition system";
  const areaTab = layout.areaTabLabel ?? "Air Conditioned Area";
  const maxSystemRows = layout.systemMaxRows ?? 50;

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
            layout={layout}
            rows={draft.systemRows}
            maxRows={maxSystemRows}
            onRecalc={recalc}
          />
        ) : (
          <AreaTab
            layout={layout}
            rows={draft.areaRows}
            systemOptions={systemOptions}
            summary={{
              air_total_air_conditioned_area: draft.air_total_air_conditioned_area,
              air_efficiently_area: draft.air_efficiently_area,
              air_percentage_area: draft.air_percentage_area,
              air_meeting_gwp: draft.air_meeting_gwp,
            }}
            onRecalc={recalc}
          />
        )}
      </div>
    </div>
  );
}

function SystemsTab({
  layout,
  rows,
  maxRows,
  onRecalc,
}: {
  layout: ConditionedSpacesLayoutDef;
  rows: ConditionedSystemRow[];
  maxRows: number;
  onRecalc: (fn: (s: ConditionedSpacesState) => ConditionedSpacesState) => void;
}) {
  const acOpts = layout.acSystemOptions ?? {};
  const unitOpts = layout.efficiencyUnitOptions ?? {};
  const refOpts = layout.refrigerantOptions ?? {};

  const updateRow = (idx: number, patch: Partial<ConditionedSystemRow>) => {
    onRecalc((s) => ({
      ...s,
      systemRows: s.systemRows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          disabled={rows.length >= maxRows}
          onClick={() =>
            onRecalc((s) => ({
              ...s,
              systemRows: [
                ...s.systemRows,
                {
                  air_condition_sys: "",
                  other_space_condition: "",
                  air_qty: "",
                  air_capacity: "",
                  actual_efficiency_unit: "",
                  actual_efficiency_value: "",
                  regestration_type: "",
                  regestration_gwp: "",
                  baseline_unit: "",
                  baseline_value: "0",
                  meet_credit_comp: "No",
                },
              ],
            }))
          }
          className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-sm font-medium text-white hover:bg-ocean/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add More
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/60 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th rowSpan={2} className="border border-border px-2 py-2">
                S.No
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2 min-w-[200px]">
                Type of air conditioning system installed
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                Qty
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                Capacity (kWr)
              </th>
              <th colSpan={2} className="border border-border px-2 py-2">
                Actual Efficiency
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                Refrigerant Type
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                Refrigerant GWP
              </th>
              <th colSpan={2} className="border border-border px-2 py-2">
                Baseline Values
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                Meets the Credit Compliance
              </th>
            </tr>
            <tr className="bg-muted/60 text-center text-xs font-semibold text-muted-foreground">
              <th className="border border-border px-2 py-1">Unit</th>
              <th className="border border-border px-2 py-1">Value</th>
              <th className="border border-border px-2 py-1">Unit</th>
              <th className="border border-border px-2 py-1">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="text-center">
                <td className="border border-border px-2 py-1 font-medium">{idx + 1}</td>
                <td className="border border-border px-2 py-1">
                  <select
                    className={selectClass}
                    value={row.air_condition_sys}
                    onChange={(e) =>
                      updateRow(idx, {
                        air_condition_sys: e.target.value,
                        other_space_condition:
                          e.target.value === "other" ? row.other_space_condition : "",
                      })
                    }
                  >
                    {Object.entries(acOpts).map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-border px-2 py-1">
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={row.air_qty}
                    onChange={(e) => updateRow(idx, { air_qty: clampDecimal(e.target.value) })}
                  />
                </td>
                <td className="border border-border px-2 py-1">
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={row.air_capacity}
                    onChange={(e) => updateRow(idx, { air_capacity: clampDecimal(e.target.value) })}
                  />
                </td>
                <td className="border border-border px-2 py-1">
                  <select
                    className={selectClass}
                    value={row.actual_efficiency_unit}
                    onChange={(e) => updateRow(idx, { actual_efficiency_unit: e.target.value })}
                  >
                    {Object.entries(unitOpts).map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-border px-2 py-1">
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={row.actual_efficiency_value}
                    onChange={(e) =>
                      updateRow(idx, { actual_efficiency_value: clampDecimal(e.target.value) })
                    }
                  />
                </td>
                <td className="border border-border px-2 py-1">
                  <select
                    className={selectClass}
                    value={row.regestration_type}
                    onChange={(e) => updateRow(idx, { regestration_type: e.target.value })}
                  >
                    {Object.entries(refOpts).map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-border px-2 py-1">
                  <input readOnly className={readonlyClass} value={row.regestration_gwp} />
                </td>
                <td className="border border-border px-2 py-1">
                  <input readOnly className={readonlyClass} value={row.baseline_unit} />
                </td>
                <td className="border border-border px-2 py-1">
                  <input readOnly className={readonlyClass} value={row.baseline_value} />
                </td>
                <td className="border border-border px-2 py-1">
                  <input readOnly className={readonlyClass} value={row.meet_credit_comp} />
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
  layout,
  rows,
  systemOptions,
  summary,
  onRecalc,
}: {
  layout: ConditionedSpacesLayoutDef;
  rows: ConditionedAreaRow[];
  systemOptions: ReturnType<typeof buildSystemOptions>;
  summary: Pick<
    ConditionedSpacesState,
    | "air_total_air_conditioned_area"
    | "air_efficiently_area"
    | "air_percentage_area"
    | "air_meeting_gwp"
  >;
  onRecalc: (fn: (s: ConditionedSpacesState) => ConditionedSpacesState) => void;
}) {
  const scopeOpts = layout.scopeOptions ?? {};

  const updateRow = (idx: number, patch: Partial<ConditionedAreaRow>) => {
    onRecalc((s) => ({
      ...s,
      areaRows: s.areaRows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  };

  const toggleExpand = (idx: number) => {
    onRecalc((s) => ({
      ...s,
      areaRows: s.areaRows.map((r, i) => (i === idx ? { ...r, expanded: !r.expanded } : r)),
    }));
  };

  const addSubRow = (idx: number) => {
    onRecalc((s) => ({
      ...s,
      areaRows: s.areaRows.map((r, i) =>
        i === idx ? { ...r, expanded: true, subRows: [...r.subRows, emptyAreaSubRow()] } : r,
      ),
    }));
  };

  const removeSubRow = (rowIdx: number, subIdx: number) => {
    onRecalc((s) => ({
      ...s,
      areaRows: s.areaRows.map((r, i) =>
        i === rowIdx
          ? {
              ...r,
              subRows: r.subRows.filter((_, si) => si !== subIdx),
              expanded: r.subRows.length > 1,
            }
          : r,
      ),
    }));
  };

  const updateSubRow = (
    rowIdx: number,
    subIdx: number,
    patch: Partial<ConditionedAreaRow["subRows"][number]>,
  ) => {
    onRecalc((s) => ({
      ...s,
      areaRows: s.areaRows.map((r, i) =>
        i === rowIdx
          ? {
              ...r,
              subRows: r.subRows.map((sub, si) => (si === subIdx ? { ...sub, ...patch } : sub)),
            }
          : r,
      ),
    }));
  };

  let displayNo = 0;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/60 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="border border-border px-2 py-2 w-10" />
              <th className="border border-border px-2 py-2">S.No</th>
              <th className="border border-border px-2 py-2 min-w-[180px]">
                Type of Air conditioned space
              </th>
              <th className="border border-border px-2 py-2 min-w-[180px]">
                Type of air conditioner
              </th>
              <th className="border border-border px-2 py-2">Scope of air conditioner</th>
              <th className="border border-border px-2 py-2">Area of the space (sq ft)</th>
              <th className="border border-border px-2 py-2">Area Meeting the credit compliance</th>
              <th className="border border-border px-2 py-2">Refrigerant GWP</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="border border-border px-4 py-6 text-center text-muted-foreground">
                  No regularly occupied air conditioned spaces found. Complete{" "}
                  <span className="font-medium">Cal Area Statement / Circulation / Sensors</span> first.
                </td>
              </tr>
            ) : null}
            {rows.map((row, idx) => {
              displayNo += 1;
              return (
                <AreaRowGroup
                  key={row.sourceIndex}
                  row={row}
                  rowIdx={idx}
                  displayNo={displayNo}
                  scopeOpts={scopeOpts}
                  systemOptions={systemOptions}
                  onToggleExpand={() => toggleExpand(idx)}
                  onUpdateRow={(patch) => updateRow(idx, patch)}
                  onAddSubRow={() => addSubRow(idx)}
                  onRemoveSubRow={(subIdx) => removeSubRow(idx, subIdx)}
                  onUpdateSubRow={(subIdx, patch) => updateSubRow(idx, subIdx, patch)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <SummaryBlock summary={summary} />
    </div>
  );
}

function AreaRowGroup({
  row,
  rowIdx,
  displayNo,
  scopeOpts,
  systemOptions,
  onToggleExpand,
  onUpdateRow,
  onAddSubRow,
  onRemoveSubRow,
  onUpdateSubRow,
}: {
  row: ConditionedAreaRow;
  rowIdx: number;
  displayNo: number;
  scopeOpts: Record<string, string>;
  systemOptions: ReturnType<typeof buildSystemOptions>;
  onToggleExpand: () => void;
  onUpdateRow: (patch: Partial<ConditionedAreaRow>) => void;
  onAddSubRow: () => void;
  onRemoveSubRow: (subIdx: number) => void;
  onUpdateSubRow: (subIdx: number, patch: Partial<ConditionedAreaRow["subRows"][number]>) => void;
}) {
  return (
    <>
      <tr className="text-center">
        <td className="border border-border px-1 py-1">
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-sm hover:bg-muted"
            aria-label={row.expanded ? "Collapse sub rows" : "Expand sub rows"}
          >
            {row.expanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        </td>
        <td className="border border-border px-2 py-1 font-medium">{displayNo}</td>
        <td className="border border-border px-2 py-1">
          <input readOnly className={readonlyClass} value={row.reqularly_occupied_air_spaces} />
        </td>
        <td className="border border-border px-2 py-1">
          <select
            className={selectClass}
            value={row.air_condition_sys_type}
            onChange={(e) => onUpdateRow({ air_condition_sys_type: e.target.value })}
          >
            <option value="">Select</option>
            {systemOptions.map((opt) => (
              <option key={`${opt.value}-${opt.capacity}-${rowIdx}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </td>
        <td className="border border-border px-2 py-1">
          <select
            className={selectClass}
            value={row.scope_air_condition}
            onChange={(e) => onUpdateRow({ scope_air_condition: e.target.value })}
          >
            {Object.entries(scopeOpts).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </td>
        <td className="border border-border px-2 py-1">
          <input readOnly className={readonlyClass} value={row.area_space_air} />
        </td>
        <td className="border border-border px-2 py-1">
          <input readOnly className={readonlyClass} value={row.area_meet_credit} />
        </td>
        <td className="border border-border px-2 py-1">
          <input readOnly className={readonlyClass} value={row.air_regestration_gwp} />
        </td>
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
              <td className="border border-border" />
              <td className="border border-border px-2 py-1">
                <select
                  className={selectClass}
                  value={sub.air_condition_sys_type}
                  onChange={(e) =>
                    onUpdateSubRow(subIdx, { air_condition_sys_type: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  {systemOptions.map((opt) => (
                    <option key={`sub-${opt.value}-${subIdx}`} value={opt.value}>
                      {formatSysLabel(opt.value)}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border border-border px-2 py-1">
                <select
                  className={selectClass}
                  value={sub.scope_air_condition}
                  onChange={(e) =>
                    onUpdateSubRow(subIdx, { scope_air_condition: e.target.value })
                  }
                >
                  {Object.entries(scopeOpts).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border border-border" />
              <td className="border border-border" />
              <td className="border border-border px-2 py-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onRemoveSubRow(subIdx)}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-destructive/40 text-destructive hover:bg-destructive/10"
                    title="Remove sub row"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <input
                    readOnly
                    className={`${readonlyClass} flex-1`}
                    value={sub.air_regestration_gwp}
                    placeholder="GWP"
                  />
                </div>
              </td>
            </tr>
          ))
        : null}
    </>
  );
}

function SummaryBlock({
  summary,
}: {
  summary: Pick<
    ConditionedSpacesState,
    | "air_total_air_conditioned_area"
    | "air_efficiently_area"
    | "air_percentage_area"
    | "air_meeting_gwp"
  >;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <th colSpan={2} className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold">
              Efficient Space Conditioning (Conditioned Spaces)
            </th>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Total air conditioned area</td>
            <td className="border border-border px-3 py-2 w-40">
              <input readOnly className={readonlyClass} value={summary.air_total_air_conditioned_area} />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Total efficiently air conditioned area</td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={summary.air_efficiently_area} />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">
              Percentage of area efficiently air conditioned (%)
            </td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={summary.air_percentage_area} />
            </td>
          </tr>
          <tr>
            <th colSpan={2} className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold">
              Enhanced Eco-friendly Refrigerants
            </th>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Meeting the GWP Credit Requirement</td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={summary.air_meeting_gwp} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
