import { computeHvacWaterRequirementAnnex, readAnnexWcTwoTotals } from "@/annexure/annexHvacWaterRequirementCalculations";
import {
  buildSavePayloadFromHvacWaterRequirement,
  hydrateHvacWaterRequirementAnnex,
} from "@/annexure/annexHvacWaterRequirementStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { RatingDataIndex } from "@/lib/ratingDataIndex";
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

type CoolingRow = { label: string; param: string; unit: string; readonly?: boolean; editable?: boolean };

const COOLING_ROWS: CoolingRow[] = [
  { label: "Cooling Tower Capacity (TR)", param: "cooling_tower_capacity", unit: "TR", editable: true },
  { label: "Water Flow", param: "water_flow_input", unit: "USGPM", editable: true },
  { label: "Drift Loss (%) of Water flow", param: "drift_loss_input", unit: "%", editable: true },
  { label: "Drift Loss", param: "water_drift_input", unit: "USGPM", readonly: true },
  { label: "Evaporation Loss (%)", param: "evaporation_loss_input", unit: "%", editable: true },
  { label: "Evaporation Loss", param: "evaporation_input", unit: "USGPM", readonly: true },
  { label: "Blow Down Loss (%)", param: "blow_down_userinput", unit: "%", editable: true },
  { label: "Blow Down Loss", param: "blow_down_input", unit: "USGPM", readonly: true },
  { label: "Total Make up water required", param: "total_make_input", unit: "USGPM", readonly: true },
  { label: "Total Make up water required", param: "total_gal_input", unit: "US Gallons/Hr", readonly: true },
  { label: "Hours of operation per day", param: "operation_hours_input", unit: "hours", editable: true },
  { label: "Number of cooling towers", param: "water_towerinput", unit: "Nos.", editable: true },
  { label: "Total Make up water required", param: "up_input", unit: "US Gallons/day", readonly: true },
  { label: "Total Make up water required", param: "liter_input", unit: "Liters/day", readonly: true },
];

function BalanceRow({
  label,
  dailyParam,
  annualParam,
  scalars,
  dailyReadonly,
  onDailyChange,
}: {
  label: string;
  dailyParam: string;
  annualParam: string;
  scalars: Record<string, string>;
  dailyReadonly?: boolean;
  onDailyChange?: (param: string, value: string) => void;
}) {
  return (
    <tr className="border-b border-border">
      <td className="border border-border px-3 py-2">{label}</td>
      <td className="border border-border px-2 py-1.5">
        {dailyReadonly ? (
          <input className={readonlyClass} readOnly value={scalars[dailyParam] ?? ""} />
        ) : (
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={scalars[dailyParam] ?? ""}
            onChange={(e) => onDailyChange?.(dailyParam, clampDecimal(e.target.value))}
          />
        )}
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={scalars[annualParam] ?? ""} />
      </td>
    </tr>
  );
}

export function AnnexureHvacWaterRequirementRenderer({
  schema,
  tab,
  subtab,
  formState,
  globalExtras,
  saveHandleRef,
}: Props) {
  const layout = schema.hvacWaterRequirementLayout!;
  const [activeTab, setActiveTab] = useState<"cooling" | "balance">("cooling");

  const stpCapacity = useMemo(() => {
    const idx = new RatingDataIndex(formState);
    const fromExtras = globalExtras?.capacity_of_stp?.trim();
    if (fromExtras) return fromExtras;
    const src = layout.stpCapacityFrom;
    return (
      idx.get(src?.tab ?? "project_details", src?.subtab ?? "water_conservation_details", src?.param ?? "capacity_of_stp") ||
      idx.getRelated("capacity_of_stp", "water_conservation") ||
      ""
    );
  }, [formState, globalExtras, layout.stpCapacityFrom]);

  const wcTwoSignature = useMemo(() => JSON.stringify(readAnnexWcTwoTotals(formState, layout)), [formState, layout]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
        stpCapacity,
        wcTwoSignature,
      ]),
    [formState.data, tab, subtab, stpCapacity, wcTwoSignature],
  );

  const [scalars, setScalars] = useState(() =>
    hydrateHvacWaterRequirementAnnex(schema, formState, tab, subtab, globalExtras),
  );

  useEffect(() => {
    setScalars(hydrateHvacWaterRequirementAnnex(schema, formState, tab, subtab, globalExtras));
  }, [dataSignature, schema, formState, tab, subtab, globalExtras]);

  const recalc = useCallback(
    (next: Record<string, string>) => {
      return computeHvacWaterRequirementAnnex({
        scalars: next,
        wcTwoTotals: readAnnexWcTwoTotals(formState, layout),
        stpCapacity,
        gallonsToLiters: layout.gallonsToLiters ?? 3.78,
      });
    },
    [formState, layout, stpCapacity],
  );

  const setScalar = useCallback(
    (param: string, value: string) => {
      setScalars((prev) => recalc({ ...prev, [param]: value }));
    },
    [recalc],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromHvacWaterRequirement(scalars),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [scalars, saveHandleRef]);

  const demandRows = layout.demandRows ?? [
    { label: "Flushing", dailyParam: "flusing_water", annualParam: "flusing_waste", dailyReadonly: true },
    { label: "Landscaping", dailyParam: "landscaping_water", annualParam: "landscaping_waste" },
    {
      label: "Cooling Tower Makeup",
      dailyParam: "cooling_tower_makeup",
      annualParam: "maleup_waste",
      dailyReadonly: true,
    },
    { label: "Others", dailyParam: "others_reuse_daily", annualParam: "others_reuse_annual" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "cooling"
              ? "border-destructive text-destructive"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("cooling")}
        >
          {layout.coolingTowerTabLabel ?? "Cooling Tower Makeup Water"}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "balance"
              ? "border-destructive text-destructive"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("balance")}
        >
          {layout.waterBalanceTabLabel ?? "Water Balance"}
        </button>
      </div>

      {activeTab === "cooling" ? (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-center">
                <th className="border border-border px-3 py-2">Description</th>
                <th className="border border-border px-3 py-2">Quantity</th>
                <th className="border border-border px-3 py-2">Units</th>
              </tr>
            </thead>
            <tbody>
              {COOLING_ROWS.map((row) => (
                <tr key={row.param} className="border-b border-border text-center">
                  <td className="border border-border px-3 py-2 text-left">{row.label}</td>
                  <td className="border border-border px-2 py-1.5">
                    {row.readonly || !row.editable ? (
                      <input className={readonlyClass} readOnly value={scalars[row.param] ?? ""} />
                    ) : (
                      <input
                        className={inputClass}
                        type="number"
                        step="0.01"
                        value={scalars[row.param] ?? ""}
                        onChange={(e) => setScalar(row.param, clampDecimal(e.target.value))}
                      />
                    )}
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th colSpan={3} className="px-3 py-2 text-center text-base font-medium">
                  STP Details
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-3 py-2">STP Capacity in KLD</td>
                <td colSpan={2} className="border border-border px-2 py-1.5">
                  <input className={readonlyClass} readOnly value={scalars.stp_cap ?? ""} />
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-3 py-2">Efficiency of STP (%)</td>
                <td colSpan={2} className="border border-border px-2 py-1.5">
                  <input
                    className={inputClass}
                    type="number"
                    step="0.01"
                    value={scalars.stp_effici ?? ""}
                    onChange={(e) => setScalar("stp_effici", clampDecimal(e.target.value))}
                  />
                </td>
              </tr>
              <tr>
                <th colSpan={3} className="border border-border bg-muted/30 px-3 py-2 text-center font-medium">
                  Treated Water Availability
                </th>
              </tr>
              <tr className="border-b border-border bg-muted/20 text-center font-medium">
                <td className="border border-border px-3 py-2" />
                <td className="border border-border px-3 py-2">Daily</td>
                <td className="border border-border px-3 py-2">Annual</td>
              </tr>
              <BalanceRow label="Waste Water Generated" dailyParam="waste_water" annualParam="generated_waste" scalars={scalars} dailyReadonly />
              <BalanceRow label="Treated Waste Water" dailyParam="treated_water" annualParam="treated_waste" scalars={scalars} dailyReadonly />
              <BalanceRow label="Stored Rainwater" dailyParam="stored_rainwater" annualParam="rain_waste" scalars={scalars} onDailyChange={setScalar} />
              <BalanceRow label="Total Water Available" dailyParam="totaL_water" annualParam="ava_total" scalars={scalars} dailyReadonly />
              <tr>
                <th colSpan={3} className="border border-border bg-muted/30 px-3 py-2 text-center font-medium">
                  Treated Water Demand
                </th>
              </tr>
              <tr className="border-b border-border bg-muted/20 text-center font-medium">
                <td className="border border-border px-3 py-2" />
                <td className="border border-border px-3 py-2">Daily</td>
                <td className="border border-border px-3 py-2">Annual</td>
              </tr>
              {demandRows.map((row) => (
                <BalanceRow
                  key={row.dailyParam}
                  label={row.label}
                  dailyParam={row.dailyParam}
                  annualParam={row.annualParam}
                  scalars={scalars}
                  dailyReadonly={row.dailyReadonly}
                  onDailyChange={setScalar}
                />
              ))}
              <BalanceRow label="Total Water Demand" dailyParam="total_water_demand" annualParam="total_demand" scalars={scalars} dailyReadonly />
              <tr className="border-t border-border">
                <td className="border border-border px-3 py-2 text-sm">
                  Percentage of water required for flushing, landscaping, cooling tower make-up catered through treated water
                </td>
                <td className="border border-border px-2 py-1.5">
                  <input className={readonlyClass} readOnly value={scalars.percentage_requ ?? "0"} />
                </td>
                <td className="border border-border px-2 py-1.5">
                  <input className={readonlyClass} readOnly value={scalars.percentage_annual ?? "0"} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
