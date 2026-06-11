import {
  clampNonRoofValueAtIndex,
  computeUrbanHeatNonRoofState,
  emptyUrbanHeatNonRoofRow,
  type UrbanHeatNonRoofRow,
  type UrbanHeatNonRoofState,
} from "@/annexure/annexUrbanHeatNonRoofCalculations";
import {
  buildSavePayloadFromUrbanHeatNonRoof,
  hydrateUrbanHeatNonRoofAnnex,
} from "@/annexure/annexUrbanHeatNonRoofStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { Plus } from "lucide-react";
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

function NumInput({
  value,
  onChange,
  readOnly,
  step = "0.01",
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  step?: string;
}) {
  if (readOnly) {
    return <input readOnly className={readonlyClass} value={value} />;
  }
  return (
    <input
      type="number"
      step={step}
      className={inputClass}
      value={value}
      onChange={(e) => onChange?.(clampDecimal(e.target.value))}
    />
  );
}

export function AnnexureUrbanHeatNonRoofRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.urbanHeatNonRoofLayout ?? {
    minRows: 5,
    maxRows: 50,
    table1TabLabel: "Non Roof - Table 1",
    table2TabLabel: "Non Roof - Table 2",
    totalNonSource: {
      tab: "project_details",
      subtab: "project_details",
      param: "non_total",
    },
  };
  const minRows = layout.minRows ?? 5;
  const maxRows = layout.maxRows ?? 50;
  const table1Label = layout.table1TabLabel ?? "Non Roof - Table 1";
  const table2Label = layout.table2TabLabel ?? "Non Roof - Table 2";

  const totalNonSignature = useMemo(() => {
    const src = layout.totalNonSource;
    const t = src?.tab ?? "project_details";
    const s = src?.subtab ?? "project_details";
    const p = src?.param ?? "non_total";
    return (formState.data ?? []).find((d) => d.tab === t && d.subtab === s && d.paramName === p)?.value ?? "";
  }, [formState.data, layout.totalNonSource]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
        totalNonSignature,
      ]),
    [formState.data, tab, subtab, totalNonSignature],
  );

  const [activeTab, setActiveTab] = useState<"table1" | "table2">("table1");
  const [draft, setDraft] = useState<UrbanHeatNonRoofState>(() =>
    hydrateUrbanHeatNonRoofAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateUrbanHeatNonRoofAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: UrbanHeatNonRoofState) => UrbanHeatNonRoofState) => {
    setDraft((prev) => computeUrbanHeatNonRoofState(fn(prev)));
  }, []);

  const updateRow = useCallback(
    (idx: number, patch: Partial<UrbanHeatNonRoofRow>) => {
      recalc((s) => ({
        ...s,
        rows: s.rows.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
      }));
    },
    [recalc],
  );

  const onNonRoofValueChange = useCallback(
    (idx: number, value: string) => {
      setDraft((prev) => {
        const result = clampNonRoofValueAtIndex(prev, idx, value);
        if (result.exceeded) {
          window.alert(`Total value cannot exceed ${result.allowed.toFixed(2)}`);
        }
        return result.state;
      });
    },
    [],
  );

  const onAddRow = useCallback(() => {
    recalc((s) => {
      if (s.rows.length >= maxRows) return s;
      return { ...s, rows: [...s.rows, emptyUrbanHeatNonRoofRow()] };
    });
  }, [maxRows, recalc]);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromUrbanHeatNonRoof(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(Number(ratingTypeId))) {
    return null;
  }

  const canAdd = draft.rows.length < maxRows;

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("table1")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "table1"
                ? "border-ocean text-ocean"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {table1Label}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("table2")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "table2"
                ? "border-ocean text-ocean"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {table2Label}
          </button>
        </div>

        {activeTab === "table1" ? (
          <Table1
            state={draft}
            minRows={minRows}
            canAdd={canAdd}
            onAddRow={onAddRow}
            onExemptedChange={(v) => recalc((s) => ({ ...s, covered_area_exempted: v }))}
            onZoneChange={(idx, v) => updateRow(idx, { non_roof_typo: v })}
            onAreaChange={onNonRoofValueChange}
          />
        ) : (
          <Table2 state={draft} onMitigationChange={updateRow} />
        )}
      </div>
    </div>
  );
}

function Table1({
  state,
  minRows,
  canAdd,
  onAddRow,
  onExemptedChange,
  onZoneChange,
  onAreaChange,
}: {
  state: UrbanHeatNonRoofState;
  minRows: number;
  canAdd: boolean;
  onAddRow: () => void;
  onExemptedChange: (v: string) => void;
  onZoneChange: (idx: number, v: string) => void;
  onAreaChange: (idx: number, v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAddRow}
          disabled={!canAdd}
          className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-sm font-medium text-white hover:bg-ocean/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add More
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40 text-left">
              <th className="border border-border px-3 py-2 w-16">S.No</th>
              <th className="border border-border px-3 py-2 min-w-[160px]">Zone</th>
              <th className="border border-border px-3 py-2 min-w-[160px]">Area Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border px-3 py-2" colSpan={2}>
                Total Non-Roof Areas
              </td>
              <td className="border border-border px-2 py-1.5">
                <NumInput value={state.total_non} readOnly />
              </td>
            </tr>
            <tr>
              <td className="border border-border px-3 py-2" colSpan={2}>
                Non-roof area covered with utilities (exempted)
              </td>
              <td className="border border-border px-2 py-1.5">
                <NumInput value={state.covered_area_exempted} onChange={onExemptedChange} />
              </td>
            </tr>
            {state.rows.map((row, idx) => (
              <tr key={idx} className="text-center">
                <td className="border border-border px-3 py-2 font-medium">{idx + 1}</td>
                <td className="border border-border px-2 py-1.5">
                  <input
                    className={inputClass}
                    value={row.non_roof_typo}
                    onChange={(e) => onZoneChange(idx, e.target.value)}
                  />
                </td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput value={row.non_roof_values} onChange={(v) => onAreaChange(idx, v)} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/20 font-medium">
              <td className="border border-border px-3 py-2" colSpan={2}>
                Total Non-Roof Impervious Areas
              </td>
              <td className="border border-border px-2 py-1.5">
                <NumInput value={state.total_non_roof} readOnly />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {state.rows.length < minRows ? (
        <p className="text-xs text-muted-foreground">Minimum {minRows} rows are shown by default.</p>
      ) : null}
    </div>
  );
}

function Table2({
  state,
  onMitigationChange,
}: {
  state: UrbanHeatNonRoofState;
  onMitigationChange: (idx: number, patch: Partial<UrbanHeatNonRoofRow>) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/40 text-center text-xs">
            <th rowSpan={2} className="border border-border px-2 py-2">
              S.No
            </th>
            <th colSpan={4} className="border border-border px-2 py-2">
              Non-Roof Impervious Areas Considred for Mitigation Measures
            </th>
            <th colSpan={4} className="border border-border px-2 py-2">
              Tree Cover
            </th>
            <th colSpan={4} className="border border-border px-2 py-2">
              Grass Paver/ Open Grid
            </th>
            <th colSpan={4} className="border border-border px-2 py-2">
              Hardscape materials with SRI of atleast 29 (and not higher than 64)
            </th>
            <th rowSpan={2} className="border border-border px-2 py-2">
              Treated Roof Area
            </th>
          </tr>
          <tr className="bg-muted/30 text-center text-[11px]">
            <th colSpan={2} className="border border-border px-2 py-1">
              Zone
            </th>
            <th colSpan={2} className="border border-border px-2 py-1">
              Area
            </th>
            <th colSpan={2} className="border border-border px-2 py-1">
              Area Covered
            </th>
            <th colSpan={2} className="border border-border px-2 py-1">
              Area Factor
            </th>
            <th colSpan={2} className="border border-border px-2 py-1">
              Area Covered
            </th>
            <th colSpan={2} className="border border-border px-2 py-1">
              Area Factor
            </th>
            <th colSpan={2} className="border border-border px-2 py-1">
              Area Covered
            </th>
            <th colSpan={2} className="border border-border px-2 py-1">
              Area Factor
            </th>
          </tr>
        </thead>
        <tbody>
          {state.rows.map((row, idx) => (
            <tr key={idx} className="text-center">
              <td className="border border-border px-2 py-1 font-medium">{idx + 1}</td>
              <td colSpan={2} className="border border-border px-1 py-1">
                <input readOnly className={readonlyClass} value={row.non_roof_typo} />
              </td>
              <td colSpan={2} className="border border-border px-1 py-1">
                <NumInput value={row.non_roof_values} readOnly />
              </td>
              <td colSpan={2} className="border border-border px-1 py-1">
                <NumInput
                  value={row.area_covered}
                  onChange={(v) => onMitigationChange(idx, { area_covered: v })}
                />
              </td>
              <td colSpan={2} className="border border-border px-1 py-1">
                <NumInput value={row.area_factor} readOnly step="0.1" />
              </td>
              <td colSpan={2} className="border border-border px-1 py-1">
                <NumInput
                  value={row.open_area_covered}
                  onChange={(v) => onMitigationChange(idx, { open_area_covered: v })}
                />
              </td>
              <td colSpan={2} className="border border-border px-1 py-1">
                <NumInput value={row.open_area_factor} readOnly step="0.1" />
              </td>
              <td colSpan={2} className="border border-border px-1 py-1">
                <NumInput
                  value={row.handscape_area_covered}
                  onChange={(v) => onMitigationChange(idx, { handscape_area_covered: v })}
                />
              </td>
              <td colSpan={2} className="border border-border px-1 py-1">
                <NumInput value={row.handscape_area_factor} readOnly step="0.1" />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput value={row.treated_roof_area} readOnly step="0.1" />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/20 font-medium">
            <td colSpan={17} className="border border-border px-3 py-2 text-right">
              Total Treated Non-Roof Impervious Areas
            </td>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={state.total_treated_nonroof} readOnly />
            </td>
          </tr>
          <tr className="bg-muted/20 font-medium">
            <td colSpan={17} className="border border-border px-3 py-2 text-right">
              Percentage of total treated Non-Roof Impervious Areas
            </td>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={state.total_treated_percentage} readOnly />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
