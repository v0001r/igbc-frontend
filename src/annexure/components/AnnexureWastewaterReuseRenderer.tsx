import { clampStpEfficiency, computeWastewaterReuseAnnex } from "@/annexure/annexWastewaterReuseCalculations";
import {
  buildSavePayloadFromWastewaterReuse,
  hydrateWastewaterReuseAnnex,
} from "@/annexure/annexWastewaterReuseStorage";
import type { AnnexureSchemaDefinition, WaterBalanceRowDef } from "@/annexure/annexureTypes";
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

function ReuseRow({
  row,
  scalars,
  onDailyChange,
}: {
  row: WaterBalanceRowDef;
  scalars: Record<string, string>;
  onDailyChange: (param: string, value: string) => void;
}) {
  return (
    <tr className="border-b border-border">
      <td className="border border-border px-3 py-2 text-left font-medium text-foreground">{row.label}</td>
      <td className="border border-border px-2 py-1.5">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={scalars[row.dailyParam] ?? ""}
          onChange={(e) => onDailyChange(row.dailyParam, clampDecimal(e.target.value))}
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <input className={readonlyClass} readOnly value={scalars[row.annualParam] ?? "0"} />
      </td>
    </tr>
  );
}

export function AnnexureWastewaterReuseRenderer({
  schema,
  tab,
  subtab,
  formState,
  globalExtras,
  saveHandleRef,
}: Props) {
  const layout = schema.wastewaterReuseLayout!;
  const reuseRows = layout.reuseSection.rows;

  const stpCapacity = useMemo(() => {
    const idx = new RatingDataIndex(formState);
    const fromExtras = globalExtras?.capacity_of_stp?.trim();
    if (fromExtras) return fromExtras;
    const sub = layout.stpCapacitySubtab ?? "water_conservation_details";
    const param = layout.stpCapacityParam ?? "capacity_of_stp";
    return (
      idx.get("project_details", sub, param) ||
      idx.getRelated(param, "water_conservation") ||
      ""
    );
  }, [formState, globalExtras, layout.stpCapacitySubtab, layout.stpCapacityParam]);

  const wcTwoSignature = useMemo(() => {
    const src = layout.wasteFromAnnex;
    const wcTab = src?.tab ?? tab;
    const wcSubtab = src?.subtab ?? "annex_wc_two";
    return JSON.stringify(
      (formState.data ?? [])
        .filter((d) => d.tab === wcTab && d.subtab === wcSubtab)
        .filter((d) =>
          [src?.flushParam ?? "flush_proposed_total", src?.flowParam ?? "fixture_proposed_total"].includes(
            d.paramName,
          ),
        )
        .map((d) => [d.paramName, d.value]),
    );
  }, [formState.data, tab, layout.wasteFromAnnex]);

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
    hydrateWastewaterReuseAnnex(schema, formState, tab, subtab, stpCapacity),
  );

  useEffect(() => {
    setScalars(hydrateWastewaterReuseAnnex(schema, formState, tab, subtab, stpCapacity));
  }, [dataSignature, schema, formState, tab, subtab, stpCapacity]);

  const recalc = useCallback(
    (next: Record<string, string>) => {
      const src = layout.wasteFromAnnex;
      const wcTab = src?.tab ?? tab;
      const wcSubtab = src?.subtab ?? "annex_wc_two";
      const get = (p: string) =>
        (formState.data ?? []).find((d) => d.tab === wcTab && d.subtab === wcSubtab && d.paramName === p)?.value ??
        "0";
      const flush = get(src?.flushParam ?? "flush_proposed_total");
      const flow = get(src?.flowParam ?? "fixture_proposed_total");
      const wasteGenerated = (parseFloat(flush) + parseFloat(flow)).toFixed(2);
      return computeWastewaterReuseAnnex({
        scalars: next,
        wasteGenerated,
        stpCapacity,
        reuseRows,
        annualDays: layout.annualDays ?? 365,
      });
    },
    [layout, formState.data, tab, stpCapacity, reuseRows],
  );

  const setScalar = useCallback(
    (param: string, value: string) => {
      setScalars((prev) => recalc({ ...prev, [param]: value }));
    },
    [recalc],
  );

  const setEfficiency = useCallback(
    (value: string) => {
      setScalars((prev) => recalc({ ...prev, stp_efficency: clampStpEfficiency(value) }));
    },
    [recalc],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromWastewaterReuse(scalars, schema),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [scalars, schema, saveHandleRef]);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th colSpan={2} className="px-3 py-2 text-center font-medium text-foreground">
                Waste Water Treatment & Reuse
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="border border-border px-3 py-2 font-medium">
                Total Waste Water Generated (Litres/Days)
              </td>
              <td className="border border-border px-2 py-1.5">
                <input className={readonlyClass} readOnly value={scalars.waste_water_generated ?? "0"} />
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-3 py-2 font-medium">STP Capacity in KLD</td>
              <td className="border border-border px-2 py-1.5">
                <input className={readonlyClass} readOnly value={scalars.stp_capacity ?? ""} />
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-3 py-2 font-medium">Efficiency of STP (%)</td>
              <td className="border border-border px-2 py-1.5">
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  value={scalars.stp_efficency ?? ""}
                  onChange={(e) => setEfficiency(e.target.value)}
                />
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-3 py-2 font-medium">
                Treated water Available for Reuse (Litres/Days)
              </td>
              <td className="border border-border px-2 py-1.5">
                <input className={readonlyClass} readOnly value={scalars.treated_daily_water ?? "0"} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th colSpan={3} className="px-3 py-2 text-center font-medium text-foreground">
                {layout.reuseSection.title}
              </th>
            </tr>
            <tr className="border-b border-border bg-muted/30 text-center">
              <th className="border border-border px-3 py-2" />
              <th className="border border-border px-3 py-2 font-medium">Daily</th>
              <th className="border border-border px-3 py-2 font-medium">Annual</th>
            </tr>
          </thead>
          <tbody>
            {reuseRows.map((row) => (
              <ReuseRow key={row.dailyParam} row={row} scalars={scalars} onDailyChange={setScalar} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/20 font-medium">
              <td className="border border-border px-3 py-2">Total</td>
              <td className="border border-border px-2 py-1.5">
                <input className={readonlyClass} readOnly value={scalars.reuse_daily_total ?? ""} />
              </td>
              <td className="border border-border px-2 py-1.5">
                <input className={readonlyClass} readOnly value={scalars.reuse_annual_total ?? "0"} />
              </td>
            </tr>
            <tr className="border-t border-border font-medium">
              <td colSpan={2} className="border border-border px-3 py-2 text-right">
                Percentage of Waste Water Treated (%)
              </td>
              <td className="border border-border px-2 py-1.5">
                <input className={readonlyClass} readOnly value={scalars.treated_water_percent ?? "0"} />
              </td>
            </tr>
            <tr className="border-t border-border font-medium">
              <td colSpan={2} className="border border-border px-3 py-2 text-right">
                Percentage of Treated Water Reuse in Project (%)
              </td>
              <td className="border border-border px-2 py-1.5">
                <input className={readonlyClass} readOnly value={scalars.reuse_water_percent ?? "0"} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
