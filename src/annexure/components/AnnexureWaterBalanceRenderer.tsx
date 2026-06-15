import type { WaterBalanceScalars } from "@/annexure/annexWaterBalanceCalculations";
import { computeWaterBalanceAnnex } from "@/annexure/annexWaterBalanceCalculations";
import {
  buildSavePayloadFromWaterBalance,
  hydrateWaterBalanceAnnex,
} from "@/annexure/annexWaterBalanceStorage";
import type {
  AnnexureSchemaDefinition,
  WaterBalanceRowDef,
  WaterBalanceSectionDef,
} from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
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
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

function BalanceSectionTable({
  section,
  scalars,
  onDailyChange,
  onAnnualChange,
}: {
  section: WaterBalanceSectionDef;
  scalars: WaterBalanceScalars;
  onDailyChange: (param: string, value: string) => void;
  onAnnualChange: (param: string, value: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th colSpan={3} className="px-3 py-2 text-center font-medium text-foreground">
              {section.title}
            </th>
          </tr>
          <tr className="border-b border-border bg-muted/30 text-center">
            <th className="border border-border px-3 py-2 text-left font-medium" />
            <th className="border border-border px-3 py-2 font-medium">Daily</th>
            <th className="border border-border px-3 py-2 font-medium">Annual</th>
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row) => (
            <BalanceDataRow
              key={row.dailyParam}
              row={row}
              scalars={scalars}
              onDailyChange={onDailyChange}
              onAnnualChange={onAnnualChange}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/20 font-medium">
            <td className="border border-border px-3 py-2">Total</td>
            <td className="border border-border px-2 py-1.5">
              <input className={readonlyClass} readOnly value={scalars[section.totalDailyParam] ?? ""} />
            </td>
            <td className="border border-border px-2 py-1.5">
              <input className={readonlyClass} readOnly value={scalars[section.totalAnnualParam] ?? "0"} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function BalanceDataRow({
  row,
  scalars,
  onDailyChange,
  onAnnualChange,
}: {
  row: WaterBalanceRowDef;
  scalars: WaterBalanceScalars;
  onDailyChange: (param: string, value: string) => void;
  onAnnualChange: (param: string, value: string) => void;
}) {
  const readonlyDaily = row.editableDaily === false || Boolean(row.source);
  const readonlyAnnual = !row.editableAnnual;
  return (
    <tr className="border-b border-border">
      <td className="border border-border px-3 py-2 text-left font-medium text-foreground">{row.label}</td>
      <td className="border border-border px-2 py-1.5">
        {readonlyDaily ? (
          <input className={readonlyClass} readOnly value={scalars[row.dailyParam] ?? ""} />
        ) : (
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={scalars[row.dailyParam] ?? ""}
            onChange={(e) => onDailyChange(row.dailyParam, clampDecimal(e.target.value))}
          />
        )}
      </td>
      <td className="border border-border px-2 py-1.5">
        {readonlyAnnual ? (
          <input className={readonlyClass} readOnly value={scalars[row.annualParam] ?? "0"} />
        ) : (
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={scalars[row.annualParam] ?? ""}
            onChange={(e) => onAnnualChange(row.annualParam, clampDecimal(e.target.value))}
          />
        )}
      </td>
    </tr>
  );
}

export function AnnexureWaterBalanceRenderer({ schema, tab, subtab, formState, saveHandleRef }: Props) {
  const layout = schema.waterBalanceLayout!;
  const src = layout.consumptionFromAnnex;
  const wcTwoTab = src?.tab ?? tab;
  const wcTwoSubtab = src?.subtab ?? "annex_wc_two";

  const wcTwoSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === wcTwoTab && d.subtab === wcTwoSubtab)
          .filter((d) =>
            [src?.flushDailyParam ?? "flush_proposed_total", src?.flowDailyParam ?? "fixture_proposed_total"].includes(
              d.paramName,
            ),
          )
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, wcTwoTab, wcTwoSubtab, src?.flushDailyParam, src?.flowDailyParam],
  );

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
        wcTwoSignature,
      ]),
    [formState.data, tab, subtab, wcTwoSignature],
  );

  const [draft, setDraft] = useState(() => hydrateWaterBalanceAnnex(schema, formState, tab, subtab));

  useEffect(() => {
    setDraft(hydrateWaterBalanceAnnex(schema, formState, tab, subtab));
  }, [dataSignature, schema, formState, tab, subtab]);

  const wcTwoDaily = useCallback(() => {
    const h = hydrateWaterBalanceAnnex(schema, formState, tab, subtab);
    return { flush: h.scalars.flush_daily ?? "", flow: h.scalars.flow_daily ?? "" };
  }, [schema, formState, tab, subtab]);

  const setDaily = useCallback(
    (param: string, value: string) => {
      setDraft((prev) => {
        const { flush, flow } = wcTwoDaily();
        return computeWaterBalanceAnnex({ ...prev.scalars, [param]: value }, layout, flush, flow);
      });
    },
    [layout, wcTwoDaily],
  );

  const setAnnual = useCallback(
    (param: string, value: string) => {
      setDraft((prev) => {
        const { flush, flow } = wcTwoDaily();
        return computeWaterBalanceAnnex({ ...prev.scalars, [param]: value }, layout, flush, flow);
      });
    },
    [layout, wcTwoDaily],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromWaterBalance(draft.scalars, schema),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft.scalars, schema, saveHandleRef]);

  const validityClass =
    draft.validity === "Valid"
      ? "rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white"
      : "rounded-md bg-destructive px-3 py-1 text-sm font-medium text-white";

  return (
    <div className="space-y-6">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="space-y-6 rounded-b-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-4 py-3">
        <h3 className="text-base font-semibold text-foreground">Water Balance Chart</h3>
        <span className={validityClass}>{draft.validity}</span>
      </div>

      {layout.sections.map((section) => (
        <BalanceSectionTable
          key={section.id}
          section={section}
          scalars={draft.scalars}
          onDailyChange={setDaily}
          onAnnualChange={setAnnual}
        />
      ))}
      </div>
    </div>
  );
}
