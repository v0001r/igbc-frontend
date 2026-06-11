import {
  computeExistingRainfallState,
  type ExistingRainfallRow,
  type ExistingRainfallState,
  type ExistingSurfaceRow,
} from "@/annexure/annexExistingRainfallCalculations";
import {
  buildSavePayloadFromExistingRainfall,
  getRunoffCoefficients,
  hydrateExistingRainfallAnnex,
} from "@/annexure/annexExistingRainfallStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
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

export function AnnexureExistingRainfallRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.existingRainfallLayout ?? {};
  const yearOptions = layout.yearOptions ?? { "": "Select Year" };
  const monthOptions = layout.monthOptions ?? { "": "Select Month" };
  const surfaceOptions = layout.surfaceOptions ?? { "": "Select Surface Type" };
  const coeffs = useMemo(() => getRunoffCoefficients(schema), [schema]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<ExistingRainfallState>(() =>
    hydrateExistingRainfallAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateExistingRainfallAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback(
    (fn: (s: ExistingRainfallState) => ExistingRainfallState) => {
      setDraft((prev) => computeExistingRainfallState(fn(prev), coeffs));
    },
    [coeffs],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromExistingRainfall(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(Number(ratingTypeId))) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        <RainfallTable
          state={draft}
          yearOptions={yearOptions}
          monthOptions={monthOptions}
          onLocationChange={(v) => recalc((s) => ({ ...s, location_ex: v }))}
          onRainfallRowChange={(idx, patch) =>
            recalc((s) => ({
              ...s,
              rainfallRows: s.rainfallRows.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
            }))
          }
        />

        <SurfaceTable
          state={draft}
          surfaceOptions={surfaceOptions}
          onSurfaceRowChange={(idx, patch) =>
            recalc((s) => ({
              ...s,
              surfaceRows: s.surfaceRows.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
            }))
          }
        />

        <SummaryTable
          state={draft}
          onCapRechargeChange={(v) => recalc((s) => ({ ...s, cap_recharge: v }))}
          onCapReuseChange={(v) => recalc((s) => ({ ...s, cap_recharge_reuse: v }))}
        />
      </div>
    </div>
  );
}

function RainfallTable({
  state,
  yearOptions,
  monthOptions,
  onLocationChange,
  onRainfallRowChange,
}: {
  state: ExistingRainfallState;
  yearOptions: Record<string, string>;
  monthOptions: Record<string, string>;
  onLocationChange: (v: string) => void;
  onRainfallRowChange: (idx: number, patch: Partial<ExistingRainfallRow>) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/40 text-center">
            <th colSpan={6} className="border border-border px-3 py-2 font-semibold">
              Last 5 Year Rainfall Average
            </th>
          </tr>
          <tr className="bg-muted/30 text-center text-xs font-medium">
            <th className="border border-border px-2 py-2">location_ex</th>
            <th className="border border-border px-2 py-2">Past years_ex</th>
            <th className="border border-border px-2 py-2">Peak Month</th>
            <th className="border border-border px-2 py-2">Peak Monthly Rainfall</th>
            <th className="border border-border px-2 py-2">Number of rainy days</th>
            <th className="border border-border px-2 py-2">Rainfall in one day</th>
          </tr>
        </thead>
        <tbody>
          {state.rainfallRows.map((row, idx) => (
            <tr key={idx} className="text-center">
              {idx === 0 ? (
                <td className="border border-border px-2 py-1.5 align-top" rowSpan={state.rainfallRows.length}>
                  <input
                    className={inputClass}
                    placeholder="Project location_ex"
                    value={state.location_ex}
                    onChange={(e) => onLocationChange(e.target.value)}
                  />
                </td>
              ) : null}
              <td className="border border-border px-1 py-1">
                <select
                  className={selectClass}
                  value={row.years_ex}
                  onChange={(e) => onRainfallRowChange(idx, { years_ex: e.target.value })}
                >
                  {Object.entries(yearOptions).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border border-border px-1 py-1">
                <select
                  className={selectClass}
                  value={row.ex_peak_month}
                  onChange={(e) => onRainfallRowChange(idx, { ex_peak_month: e.target.value })}
                >
                  {Object.entries(monthOptions).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput
                  value={row.rainfall_ex}
                  onChange={(v) => onRainfallRowChange(idx, { rainfall_ex: v })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput
                  value={row.rainy_day}
                  onChange={(v) => onRainfallRowChange(idx, { rainy_day: v })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput value={row.rainfall_oneday} readOnly />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/20">
            <td colSpan={5} className="border border-border px-3 py-2 text-left">
              One day Normal Rainfall (Average rainfall obtained in last 5 years in mm)
            </td>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={state.average_ex} readOnly />
            </td>
          </tr>
          <tr className="bg-muted/20">
            <td colSpan={5} className="border border-border px-3 py-2 text-left">
              One day Normal Rainfall (Average rainfall obtained in last 5 years in m)
            </td>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={state.average_rainfall_m} readOnly step="0.0001" />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function SurfaceTable({
  state,
  surfaceOptions,
  onSurfaceRowChange,
}: {
  state: ExistingRainfallState;
  surfaceOptions: Record<string, string>;
  onSurfaceRowChange: (idx: number, patch: Partial<ExistingSurfaceRow>) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/40 text-center text-xs font-medium">
            <th className="border border-border px-2 py-2 w-14">S. NO</th>
            <th className="border border-border px-2 py-2 min-w-[220px]">Surface Type</th>
            <th className="border border-border px-2 py-2">Run-off coefficient</th>
            <th className="border border-border px-2 py-2">Area (Sq.m)</th>
            <th className="border border-border px-2 py-2">Impervious Area</th>
          </tr>
        </thead>
        <tbody>
          {state.surfaceRows.map((row, idx) => (
            <tr key={idx} className="text-center">
              <td className="border border-border px-2 py-2 font-medium">{idx + 1}</td>
              <td className="border border-border px-1 py-1">
                <select
                  className={selectClass}
                  value={row.surface}
                  onChange={(e) => onSurfaceRowChange(idx, { surface: e.target.value })}
                >
                  {Object.entries(surfaceOptions).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput value={row.runoff} readOnly />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput value={row.area} onChange={(v) => onSurfaceRowChange(idx, { area: v })} />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput value={row.imprevious_area} readOnly />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryTable({
  state,
  onCapRechargeChange,
  onCapReuseChange,
}: {
  state: ExistingRainfallState;
  onCapRechargeChange: (v: string) => void;
  onCapReuseChange: (v: string) => void;
}) {
  const rows: { label: string; value: string; editable?: boolean; onChange?: (v: string) => void; step?: string }[] =
    [
      { label: "Total rain water from roof and non-roof area (sq.m)", value: state.ex_total_rain },
      {
        label: "Required rainwater harvesting capacity for mandatory requirements (cu.m)",
        value: state.ex_mandatory_harvesting,
        step: "0.1",
      },
      {
        label: "Capacity of installed Rain water system for ground water recharge",
        value: state.cap_recharge,
        editable: true,
        onChange: onCapRechargeChange,
        step: "0.1",
      },
      {
        label: "Capacity of the installed Rainwater Harvesting system for reuse",
        value: state.cap_recharge_reuse,
        editable: true,
        onChange: onCapReuseChange,
        step: "0.1",
      },
      {
        label: "Proposed / Existing rainwater harvesting capacity (cu.m)",
        value: state.harvesting_existing,
      },
      { label: "Meets the mandatory requirement", value: state.requirment_ex },
      {
        label:
          "% of Average Peak One-Day Rainfall Considered for Existing Rainwater Harvesting Systems for Groundwater Recharge",
        value: state.ex_avg_rainfall,
      },
      {
        label:
          "% of Average Peak One-Day Rainfall Considered for Existing Rainwater Harvesting Systems for Reuse",
        value: state.ex_avg_rainfall_peak,
      },
    ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="border border-border px-3 py-2 text-left">{row.label}</td>
              <td className="w-48 border border-border px-2 py-1.5">
                {row.editable ? (
                  <NumInput value={row.value} onChange={row.onChange} step={row.step ?? "0.01"} />
                ) : (
                  <NumInput value={row.value} readOnly step={row.step ?? "0.01"} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
