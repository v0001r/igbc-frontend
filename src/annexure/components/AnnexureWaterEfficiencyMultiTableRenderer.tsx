import {
  computeWaterEfficiencyMultiAnnex,
  presetFieldNames,
  type WaterEfficiencyDynamicRow,
  type WaterEfficiencyMultiAnnexState,
  type WaterEfficiencyTableState,
} from "@/annexure/annexWaterEfficiencyCalculations";
import {
  buildSavePayloadFromWaterEfficiencyMultiTable,
  hydrateWaterEfficiencyMultiTable,
} from "@/annexure/annexWaterEfficiencyMultiTableStorage";
import type { AnnexureSchemaDefinition, WaterEfficiencyPresetDef } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";
const btnPrimary =
  "inline-flex items-center gap-1 rounded-md bg-[#467db5] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#3a5f99] disabled:opacity-50";

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
  formState: CertificationFormResponse;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

function recalc(
  draft: WaterEfficiencyMultiAnnexState,
  presets: WaterEfficiencyPresetDef[],
): WaterEfficiencyMultiAnnexState {
  return computeWaterEfficiencyMultiAnnex(draft, presets, "0");
}

function PresetRow({
  preset,
  table,
  isFirstTable,
  lockFirstTablePresetFields,
  onScalar,
}: {
  preset: WaterEfficiencyPresetDef;
  table: WaterEfficiencyTableState;
  isFirstTable: boolean;
  lockFirstTablePresetFields: boolean;
  onScalar: (param: string, value: string) => void;
}) {
  const fields = presetFieldNames(preset);
  const s = table.scalars;
  const lock = lockFirstTablePresetFields && isFirstTable;

  return (
    <tr className="border-b border-border text-center">
      <td className="sticky left-0 z-[1] border border-border bg-card px-2 py-1.5 text-sm">
        <span className="block text-left">{preset.fixtureType}</span>
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          value={s[preset.detailParam] ?? ""}
          onChange={(e) => onScalar(preset.detailParam, e.target.value)}
          placeholder="Fixture Detail"
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <select
          className={inputClass}
          value={s[fields.status] ?? ""}
          onChange={(e) => onScalar(fields.status, e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </td>
      <td className="border border-border px-2 py-1.5">
        {lock ? (
          <input className={readonlyClass} readOnly value={s[fields.duration] ?? ""} />
        ) : (
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={s[fields.duration] ?? ""}
            onChange={(e) => onScalar(fields.duration, clampDecimal(e.target.value))}
          />
        )}
      </td>
      <td className="border border-border px-2 py-1.5">
        {lock ? (
          <input className={readonlyClass} readOnly value={s[fields.daily] ?? ""} />
        ) : (
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={s[fields.daily] ?? ""}
            onChange={(e) => onScalar(fields.daily, clampDecimal(e.target.value))}
          />
        )}
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={s[fields.occupancy] ?? ""}
          onChange={(e) => onScalar(fields.occupancy, clampDecimal(e.target.value))}
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        {lock ? (
          <input className={readonlyClass} readOnly value={s[fields.base] ?? ""} />
        ) : (
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={s[fields.base] ?? ""}
            onChange={(e) => onScalar(fields.base, clampDecimal(e.target.value))}
          />
        )}
      </td>
      <td className="border border-border px-2 py-1.5">
        {lock ? (
          <input className={readonlyClass} readOnly value={s[fields.unit] ?? ""} />
        ) : (
          <input
            className={inputClass}
            value={s[fields.unit] ?? ""}
            onChange={(e) => onScalar(fields.unit, e.target.value)}
          />
        )}
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={s[fields.totalUse] ?? "0"} />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={s[fields.proposed] ?? ""}
          onChange={(e) => onScalar(fields.proposed, clampDecimal(e.target.value))}
          placeholder="Enter Value"
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={s[fields.proposedTotal] ?? "0"} />
      </td>
    </tr>
  );
}

function DynamicRow({
  row,
  rowIndex,
  onChange,
  onRemove,
  canRemove,
}: {
  row: WaterEfficiencyDynamicRow;
  rowIndex: number;
  onChange: (index: number, patch: Partial<WaterEfficiencyDynamicRow>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  return (
    <tr className="border-b border-border text-center">
      <td className="sticky left-0 z-[1] border border-border bg-card px-2 py-1.5">
        <input
          className={inputClass}
          value={row.fixture_type}
          onChange={(e) => onChange(rowIndex, { fixture_type: e.target.value })}
          placeholder="Fixture Type"
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          value={row.shower}
          onChange={(e) => onChange(rowIndex, { shower: e.target.value })}
          placeholder="Fixture Detail"
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <select
          className={inputClass}
          value={row.shower_status}
          onChange={(e) => onChange(rowIndex, { shower_status: e.target.value })}
        >
          <option value="">Select Status</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={row.shower_duration}
          onChange={(e) => onChange(rowIndex, { shower_duration: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={row.shower_daily}
          onChange={(e) => onChange(rowIndex, { shower_daily: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={row.shower_occupancy}
          onChange={(e) => onChange(rowIndex, { shower_occupancy: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={row.shower_base}
          onChange={(e) => onChange(rowIndex, { shower_base: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          value={row.shower_unit}
          onChange={(e) => onChange(rowIndex, { shower_unit: e.target.value })}
          placeholder="LPF / LPM"
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={row.shower_total_use} />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={row.shower_proposed}
          onChange={(e) => onChange(rowIndex, { shower_proposed: clampDecimal(e.target.value) })}
          placeholder="Enter Value"
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <div className="flex items-center gap-1">
          <input className={readonlyClass} readOnly value={row.shower_proposed_total} />
          {canRemove ? (
            <button
              type="button"
              className="shrink-0 rounded p-1 text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(rowIndex)}
              aria-label="Remove row"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function SummaryPairRow({ label, base, proposed }: { label: string; base: string; proposed: string }) {
  return (
    <tr className="border-b border-border">
      <td className="px-3 py-2 text-right font-medium" colSpan={2}>
        {label}
      </td>
      <td className="px-2 py-1.5">
        <input className={readonlyClass} readOnly value={base} />
      </td>
      <td className="px-2 py-1.5">
        <input className={readonlyClass} readOnly value={proposed} />
      </td>
    </tr>
  );
}

function FixtureTable({
  table,
  tableIdx,
  presets,
  labels,
  lockFirstTablePresetFields,
  tableNameParam,
  minDynamic,
  maxDynamic,
  onTableChange,
  onRemoveTable,
  canRemoveTable,
}: {
  table: WaterEfficiencyTableState;
  tableIdx: number;
  presets: WaterEfficiencyPresetDef[];
  labels: NonNullable<AnnexureSchemaDefinition["waterEfficiencyLayout"]>["columnLabels"];
  lockFirstTablePresetFields: boolean;
  tableNameParam: string;
  minDynamic: number;
  maxDynamic: number;
  onTableChange: (tableIdx: number, next: WaterEfficiencyTableState) => void;
  onRemoveTable: (tableIdx: number) => void;
  canRemoveTable: boolean;
}) {
  const isFirstTable = tableIdx === 0;
  const s = table.scalars;

  const setScalar = (param: string, value: string) => {
    onTableChange(tableIdx, {
      ...table,
      scalars: { ...table.scalars, [param]: value },
    });
  };

  const patchDynamic = (index: number, patch: Partial<WaterEfficiencyDynamicRow>) => {
    const dynamicRows = table.dynamicRows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onTableChange(tableIdx, { ...table, dynamicRows });
  };

  const addDynamicRow = () => {
    if (table.dynamicRows.length >= maxDynamic) return;
    onTableChange(tableIdx, {
      ...table,
      dynamicRows: [
        ...table.dynamicRows,
        {
          fixture_type: "",
          shower: "",
          shower_status: "",
          shower_duration: "",
          shower_daily: "",
          shower_occupancy: "0",
          shower_base: "",
          shower_unit: "",
          shower_total_use: "0",
          shower_proposed: "",
          shower_proposed_total: "0",
        },
      ],
    });
  };

  const removeDynamicRow = (index: number) => {
    if (table.dynamicRows.length <= minDynamic) return;
    onTableChange(tableIdx, {
      ...table,
      dynamicRows: table.dynamicRows.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      {canRemoveTable ? (
        <button
          type="button"
          className="rounded-md border border-destructive/40 px-3 py-1 text-sm text-destructive hover:bg-destructive/10"
          onClick={() => onRemoveTable(tableIdx)}
        >
          Remove Table
        </button>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="min-w-[1200px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-center">
              <th rowSpan={2} className="sticky left-0 z-[2] border border-border bg-muted/40 px-2 py-2">
                Fixture Type
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                Fixture Detail
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                Status
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                Duration Per Use (in Minutes)
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                {labels?.dailyUses ?? "Daily Uses per Person/ Day"}
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                {labels?.occupancy ?? "Occupancy"}
              </th>
              <th colSpan={3} className="border border-border px-2 py-2">
                Base Case
              </th>
              <th colSpan={2} className="border border-border px-2 py-2">
                Proposed Case
              </th>
            </tr>
            <tr className="border-b border-border bg-muted/40 text-center">
              <th colSpan={2} className="border border-border px-2 py-2">
                {labels?.baseFlowHeader ?? "Baseline Flow (Rate / Capacity)"}
              </th>
              <th className="border border-border px-2 py-2">Total daily Water Use (in Litres)</th>
              <th className="border border-border px-2 py-2">
                {labels?.proposedFlowHeader ?? "Baseline Flow (Rate / Capacity)"}
              </th>
              <th className="border border-border px-2 py-2">Total daily Water Use (in Litres)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2} className="border border-border px-2 py-1.5">
                <input
                  className={inputClass}
                  value={s[tableNameParam] ?? ""}
                  onChange={(e) => setScalar(tableNameParam, e.target.value)}
                  placeholder="Enter table name"
                />
              </td>
              <td colSpan={9} className="border border-border" />
            </tr>
            {presets.map((p) => (
              <PresetRow
                key={p.id}
                preset={p}
                table={table}
                isFirstTable={isFirstTable}
                lockFirstTablePresetFields={lockFirstTablePresetFields}
                onScalar={setScalar}
              />
            ))}
            {table.dynamicRows.map((row, i) => (
              <DynamicRow
                key={i}
                row={row}
                rowIndex={i}
                onChange={patchDynamic}
                onRemove={removeDynamicRow}
                canRemove={table.dynamicRows.length > minDynamic}
              />
            ))}
            <tr>
              <td colSpan={11} className="border border-border px-2 py-2 text-left">
                <button type="button" className={btnPrimary} onClick={addDynamicRow}>
                  <Plus className="h-4 w-4" />
                  Add Row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full max-w-4xl border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th colSpan={2} />
              <th className="px-2 py-2 text-center">Base Case</th>
              <th className="px-2 py-2 text-center">Proposed Case</th>
            </tr>
          </thead>
          <tbody>
            <SummaryPairRow
              label="Daily volume from flush fixtures (Black water)"
              base={s.flush_base_total ?? "0"}
              proposed={s.flush_proposed_total ?? "0"}
            />
            <SummaryPairRow
              label="Daily volume from flow fixtures (Grey water)"
              base={s.fixture_base_total ?? "0"}
              proposed={s.fixture_proposed_total ?? "0"}
            />
            <tr className="border-b border-border">
              <td className="px-3 py-2 text-right font-medium" colSpan={2}>
                Annual Working Days
              </td>
              <td className="px-2 py-1.5">
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  value={s.annual_days ?? "365"}
                  onChange={(e) => setScalar("annual_days", clampDecimal(e.target.value))}
                />
              </td>
              <td className="px-2 py-2 text-muted-foreground">Days</td>
            </tr>
            <SummaryPairRow
              label="Annual volume from flush fixtures (Black water)"
              base={s.annual_flush_base ?? "0"}
              proposed={s.annual_flush_proposed ?? "0"}
            />
            <SummaryPairRow
              label="Annual volume from flow fixtures (Grey water)"
              base={s.annual_fixture_base ?? "0"}
              proposed={s.annual_fixture_proposed ?? "0"}
            />
            <SummaryPairRow
              label="Annual volume from flush & flow fixtures"
              base={s.total_volume_base ?? "0"}
              proposed={s.total_volume_proposed ?? "0"}
            />
            <tr className="border-b border-border">
              <td className="px-3 py-2 text-right font-medium" colSpan={2}>
                Percentage Savings (%)
              </td>
              <td className="px-2 py-1.5" colSpan={2}>
                <input className={readonlyClass} readOnly value={s.saving_percentage ?? "0"} />
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-3 py-2 text-right font-medium" colSpan={2}>
                Meets Mandatory Requirement
              </td>
              <td className="px-2 py-1.5" colSpan={2}>
                <input className={readonlyClass} readOnly value={s.annex_mandatory ?? "Yes"} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AnnexureWaterEfficiencyMultiTableRenderer({
  schema,
  tab,
  subtab,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.waterEfficiencyLayout!;
  const presets = layout.presetRows;
  const minDynamic = layout.minDynamicRows ?? 1;
  const maxDynamic = layout.maxDynamicRows ?? 50;
  const minTables = layout.minTables ?? 1;
  const maxTables = layout.maxTables ?? 20;
  const tableNameParam = layout.tableNameParam ?? "annex_table_name";
  const lockFirstTablePresetFields = layout.lockFirstTablePresetFields ?? true;
  const labels = layout.columnLabels;

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<WaterEfficiencyMultiAnnexState>(() =>
    recalc(hydrateWaterEfficiencyMultiTable(schema, formState, tab, subtab), presets),
  );

  useEffect(() => {
    setDraft(recalc(hydrateWaterEfficiencyMultiTable(schema, formState, tab, subtab), presets));
  }, [schema, formState, tab, subtab, dataSignature, presets]);

  const updateTable = useCallback(
    (tableIdx: number, next: WaterEfficiencyTableState) => {
      setDraft((prev) => {
        const tables = prev.tables.map((t, i) => (i === tableIdx ? next : t));
        return recalc({ ...prev, tables }, presets);
      });
    },
    [presets],
  );

  const addTable = useCallback(() => {
    setDraft((prev) => {
      if (prev.tables.length >= maxTables) return prev;
      const nextIndex =
        prev.tables.reduce((max, t) => Math.max(max, t.tableIndex), 0) + 1;
      const emptyScalars: Record<string, string> = { [tableNameParam]: "" };
      for (const p of presets) {
        const pf = presetFieldNames(p);
        emptyScalars[p.detailParam] = "";
        emptyScalars[pf.status] = "";
        emptyScalars[pf.duration] = p.defaults.duration ?? "";
        emptyScalars[pf.daily] = p.defaults.daily ?? "";
        emptyScalars[pf.occupancy] = "0";
        emptyScalars[pf.base] = p.defaults.base ?? "";
        emptyScalars[pf.unit] = p.defaults.unit ?? "";
        emptyScalars[pf.totalUse] = "0";
        emptyScalars[pf.proposed] = "";
        emptyScalars[pf.proposedTotal] = "0";
      }
      emptyScalars.annual_days = "365";
      const newTable: WaterEfficiencyTableState = {
        tableIndex: nextIndex,
        tableName: "",
        scalars: emptyScalars,
        dynamicRows: [
          {
            fixture_type: "",
            shower: "",
            shower_status: "",
            shower_duration: "",
            shower_daily: "",
            shower_occupancy: "0",
            shower_base: "",
            shower_unit: "",
            shower_total_use: "0",
            shower_proposed: "",
            shower_proposed_total: "0",
          },
        ],
      };
      return recalc({ ...prev, tables: [...prev.tables, newTable] }, presets);
    });
  }, [maxTables, presets, tableNameParam]);

  const removeTable = useCallback(
    (tableIdx: number) => {
      setDraft((prev) => {
        if (prev.tables.length <= minTables || tableIdx === 0) return prev;
        const tables = prev.tables.filter((_, i) => i !== tableIdx);
        return recalc({ ...prev, tables }, presets);
      });
    },
    [minTables, presets],
  );

  const addDynamicToFirst = useCallback(() => {
    const first = draft.tables[0];
    if (!first || first.dynamicRows.length >= maxDynamic) return;
    updateTable(0, {
      ...first,
      dynamicRows: [
        ...first.dynamicRows,
        {
          fixture_type: "",
          shower: "",
          shower_status: "",
          shower_duration: "",
          shower_daily: "",
          shower_occupancy: "0",
          shower_base: "",
          shower_unit: "",
          shower_total_use: "0",
          shower_proposed: "",
          shower_proposed_total: "0",
        },
      ],
    });
  }, [draft.tables, maxDynamic, updateTable]);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromWaterEfficiencyMultiTable(schema, draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, schema, saveHandleRef]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnPrimary}
          onClick={addDynamicToFirst}
          disabled={(draft.tables[0]?.dynamicRows.length ?? 0) >= maxDynamic}
        >
          <Plus className="h-4 w-4" />
          {layout.addRowLabel ?? "Add More"}
        </button>
        <button
          type="button"
          className={btnPrimary}
          onClick={addTable}
          disabled={draft.tables.length >= maxTables}
        >
          <Plus className="h-4 w-4" />
          {layout.addTableLabel ?? "Add Another Table"}
        </button>
      </div>

      {draft.tables.map((table, tableIdx) => (
        <FixtureTable
          key={table.tableIndex}
          table={table}
          tableIdx={tableIdx}
          presets={presets}
          labels={labels}
          lockFirstTablePresetFields={lockFirstTablePresetFields}
          tableNameParam={tableNameParam}
          minDynamic={minDynamic}
          maxDynamic={maxDynamic}
          onTableChange={updateTable}
          onRemoveTable={removeTable}
          canRemoveTable={tableIdx > 0}
        />
      ))}

      {draft.tables.length > 1 ? (
        <div className="rounded-md border border-border bg-muted/20 p-4 text-sm">
          <p className="mb-2 font-medium text-ocean">Combined totals (all tables)</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="text-muted-foreground">Total annual volume (base)</span>
              <input className={readonlyClass} readOnly value={draft.aggregates.total_volume_base_tb} />
            </label>
            <label className="block">
              <span className="text-muted-foreground">Total annual volume (proposed)</span>
              <input
                className={readonlyClass}
                readOnly
                value={draft.aggregates.total_volume_proposed_tb}
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground">Overall percentage savings (%)</span>
              <input className={readonlyClass} readOnly value={draft.aggregates.saving_percentage_tb} />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
