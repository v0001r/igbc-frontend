import {
  computeWaterEfficiencyAnnex,
  presetFieldNames,
  type WaterEfficiencyAnnexState,
  type WaterEfficiencyDynamicRow,
} from "@/annexure/annexWaterEfficiencyCalculations";
import {
  buildSavePayloadFromWaterEfficiency,
  hydrateWaterEfficiencyAnnex,
} from "@/annexure/annexWaterEfficiencyStorage";
import type { AnnexureSchemaDefinition, WaterEfficiencyPresetDef } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import { AnnexureWaterEfficiencyMultiTableRenderer } from "@/annexure/components/AnnexureWaterEfficiencyMultiTableRenderer";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { RatingDataIndex } from "@/lib/ratingDataIndex";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
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

function recalc(
  draft: WaterEfficiencyAnnexState,
  presets: WaterEfficiencyPresetDef[],
  occupancy: string,
): WaterEfficiencyAnnexState {
  return computeWaterEfficiencyAnnex(draft, presets, occupancy);
}

function PresetRow({
  preset,
  scalars,
  occupancy,
  onScalar,
}: {
  preset: WaterEfficiencyPresetDef;
  scalars: Record<string, string>;
  occupancy: string;
  onScalar: (param: string, value: string) => void;
}) {
  const fields = presetFieldNames(preset);
  const status = scalars[fields.status] ?? "";
  const occ = scalars[fields.occupancy] ?? occupancy;

  return (
    <tr className="border-b border-border text-center">
      <td className="sticky left-0 z-[1] border border-border bg-card px-2 py-1.5 text-sm">
        <span className="block text-left">{preset.fixtureType}</span>
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          value={scalars[preset.detailParam] ?? ""}
          onChange={(e) => onScalar(preset.detailParam, e.target.value)}
          placeholder="Fixture Detail"
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <select
          className={inputClass}
          value={status}
          onChange={(e) => onScalar(fields.status, e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={scalars[fields.duration] ?? ""} />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={scalars[fields.daily] ?? ""} />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={occ} />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={scalars[fields.base] ?? ""} />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={scalars[fields.unit] ?? ""} />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={scalars[fields.totalUse] ?? "0"} />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={scalars[fields.proposed] ?? ""}
          onChange={(e) => onScalar(fields.proposed, clampDecimal(e.target.value))}
          placeholder="Enter Value"
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={scalars[fields.proposedTotal] ?? "0"} />
      </td>
    </tr>
  );
}

function DynamicRow({
  row,
  rowIndex,
  occupancy,
  onChange,
  onRemove,
  canRemove,
}: {
  row: WaterEfficiencyDynamicRow;
  rowIndex: number;
  occupancy: string;
  onChange: (index: number, patch: Partial<WaterEfficiencyDynamicRow>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const occ = row.shower_occupancy || occupancy;
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
          value={occ}
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

export function AnnexureWaterEfficiencyRenderer({
  schema,
  tab,
  subtab,
  formState,
  globalExtras,
  saveHandleRef,
}: Props) {
  const layout = schema.waterEfficiencyLayout!;
  if (layout.multiTable) {
    return (
      <AnnexureWaterEfficiencyMultiTableRenderer
        schema={schema}
        tab={tab}
        subtab={subtab}
        formState={formState}
        saveHandleRef={saveHandleRef}
      />
    );
  }

  const presets = layout.presetRows;
  const minDynamic = layout.minDynamicRows ?? 1;
  const maxDynamic = layout.maxDynamicRows ?? 50;

  const occupancy = useMemo(() => {
    const idx = new RatingDataIndex(formState);
    const fromExtras = globalExtras?.occupancy?.trim();
    if (fromExtras) return fromExtras;
    return (
      idx.get("project_details", "project_details", "occupancy_green") ||
      idx.getRelated("occupancy_green", "project_details") ||
      idx.get("project_details", "project_details", "occupancy") ||
      idx.getRelated("occupancy", "project_details") ||
      "0"
    );
  }, [formState, globalExtras]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
        occupancy,
      ]),
    [formState.data, tab, subtab, occupancy],
  );

  const [draft, setDraft] = useState<WaterEfficiencyAnnexState>(() =>
    recalc(hydrateWaterEfficiencyAnnex(schema, formState, tab, subtab, occupancy), presets, occupancy),
  );

  useEffect(() => {
    setDraft(recalc(hydrateWaterEfficiencyAnnex(schema, formState, tab, subtab, occupancy), presets, occupancy));
  }, [dataSignature, schema, formState, tab, subtab, occupancy, presets]);

  const setScalar = useCallback(
    (param: string, value: string) => {
      setDraft((prev) => recalc({ ...prev, scalars: { ...prev.scalars, [param]: value } }, presets, occupancy));
    },
    [presets, occupancy],
  );

  const patchDynamic = useCallback(
    (index: number, patch: Partial<WaterEfficiencyDynamicRow>) => {
      setDraft((prev) => {
        const dynamicRows = prev.dynamicRows.map((r, i) => (i === index ? { ...r, ...patch } : r));
        return recalc({ ...prev, dynamicRows }, presets, occupancy);
      });
    },
    [presets, occupancy],
  );

  const addDynamicRow = useCallback(() => {
    setDraft((prev) => {
      if (prev.dynamicRows.length >= maxDynamic) return prev;
      const dynamicRows = [
        ...prev.dynamicRows,
        {
          fixture_type: "",
          shower: "",
          shower_status: "",
          shower_duration: "",
          shower_daily: "",
          shower_occupancy: occupancy,
          shower_base: "",
          shower_unit: "",
          shower_total_use: "0",
          shower_proposed: "",
          shower_proposed_total: "0",
        },
      ];
      return recalc({ ...prev, dynamicRows }, presets, occupancy);
    });
  }, [maxDynamic, presets, occupancy]);

  const removeDynamicRow = useCallback(
    (index: number) => {
      setDraft((prev) => {
        if (prev.dynamicRows.length <= minDynamic) return prev;
        const dynamicRows = prev.dynamicRows.filter((_, i) => i !== index);
        return recalc({ ...prev, dynamicRows }, presets, occupancy);
      });
    },
    [minDynamic, presets, occupancy],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromWaterEfficiency(schema, draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, schema, saveHandleRef]);

  const s = draft.scalars;

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="space-y-4 rounded-b-xl border border-border bg-card p-4 shadow-sm">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-md bg-[#467db5] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#3a5f99]"
        onClick={addDynamicRow}
        disabled={draft.dynamicRows.length >= maxDynamic}
      >
        <Plus className="h-4 w-4" />
        {layout.addRowLabel ?? "Add More"}
      </button>

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
                Daily Uses per Person/ Day
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2">
                Occupancy
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
                Baseline Flow (Rate / Capacity)
              </th>
              <th className="border border-border px-2 py-2">Total daily Water Use (in Litres)</th>
              <th className="border border-border px-2 py-2">Proposed Flow</th>
              <th className="border border-border px-2 py-2">Total daily Water Use (in Litres)</th>
            </tr>
          </thead>
          <tbody>
            {presets.map((p) => (
              <PresetRow
                key={p.id}
                preset={p}
                scalars={s}
                occupancy={occupancy}
                onScalar={setScalar}
              />
            ))}
            {draft.dynamicRows.map((row, i) => (
              <DynamicRow
                key={i}
                row={row}
                rowIndex={i}
                occupancy={occupancy}
                onChange={patchDynamic}
                onRemove={removeDynamicRow}
                canRemove={draft.dynamicRows.length > minDynamic}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full max-w-4xl border-collapse text-sm">
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
    </div>
  );
}

function SummaryPairRow({
  label,
  base,
  proposed,
}: {
  label: string;
  base: string;
  proposed: string;
}) {
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
