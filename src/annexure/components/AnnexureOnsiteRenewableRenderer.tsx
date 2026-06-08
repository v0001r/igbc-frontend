import {
  computeOnsiteRenewableState,
  type OnsiteRenewableRow,
  type OnsiteRenewableState,
} from "@/annexure/annexOnsiteRenewableCalculations";
import {
  buildSavePayloadFromOnsiteRenewable,
  emptyOnsiteRenewableRow,
  hydrateOnsiteRenewableAnnex,
} from "@/annexure/annexOnsiteRenewableStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
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

function formatMonthLabel(value: string): string {
  if (!value) return "";
  const [y, m] = value.split("-");
  if (!y || !m) return value;
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function AnnexureOnsiteRenewableRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const maxRows = schema.onsiteRenewableLayout?.maxRows ?? 24;
  const addRowLabel = schema.onsiteRenewableLayout?.addRowLabel ?? "Add More";

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<OnsiteRenewableState>(() =>
    hydrateOnsiteRenewableAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateOnsiteRenewableAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: OnsiteRenewableState) => OnsiteRenewableState) => {
    setDraft((prev) => computeOnsiteRenewableState(fn(prev)));
  }, []);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromOnsiteRenewable(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  const canAdd = draft.rows.length < maxRows;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
        <button
          type="button"
          disabled={!canAdd}
          onClick={() =>
            recalc((s) => {
              const nextId = s.rows.length ? Math.max(...s.rows.map((r) => r.rowId)) + 1 : 1;
              return { ...s, rows: [...s.rows, emptyOnsiteRenewableRow(nextId)] };
            })
          }
          className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean/90 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {addRowLabel}
        </button>
      </div>

      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="border border-border px-2 py-2 w-12">S.No</th>
                <th className="border border-border px-2 py-2 min-w-[160px]">Month</th>
                <th className="border border-border px-2 py-2">
                  Energy consumption (as per bills) in kWh
                </th>
                <th className="border border-border px-2 py-2">
                  On-site renewable energy generation (kWh)
                </th>
                <th className="border border-border px-2 py-2">
                  Off-site renewable energy procured (kWh)
                </th>
                <th className="border border-border px-2 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {draft.rows.map((row, idx) => (
                <RenewableRow
                  key={row.rowId}
                  row={row}
                  displayNo={idx + 1}
                  onUpdate={(patch) =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
                    }))
                  }
                  onRemove={() =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.filter((_, i) => i !== idx),
                    }))
                  }
                  canRemove={draft.rows.length > 1}
                />
              ))}
              <tr className="bg-muted/30 font-medium text-center">
                <td className="border border-border px-2 py-2" colSpan={2}>
                  Total
                </td>
                <td className="border border-border px-2 py-2">
                  <input readOnly className={readonlyClass} value={draft.total_energy_consumption} />
                </td>
                <td className="border border-border px-2 py-2">
                  <input readOnly className={readonlyClass} value={draft.total_onsite_renewable} />
                </td>
                <td className="border border-border px-2 py-2">
                  <input readOnly className={readonlyClass} value={draft.total_offsite_renewable} />
                </td>
                <td className="border border-border" />
              </tr>
            </tbody>
          </table>
        </div>

        <SummaryBlock state={draft} />
      </div>
    </div>
  );
}

function RenewableRow({
  row,
  displayNo,
  onUpdate,
  onRemove,
  canRemove,
}: {
  row: OnsiteRenewableRow;
  displayNo: number;
  onUpdate: (patch: Partial<OnsiteRenewableRow>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <tr className="text-center">
      <td className="border border-border px-2 py-1 font-medium">{displayNo}</td>
      <td className="border border-border px-2 py-1">
        <input
          type="month"
          className={inputClass}
          value={row.month_year}
          title={formatMonthLabel(row.month_year)}
          onChange={(e) => onUpdate({ month_year: e.target.value })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.energy_consumption}
          onChange={(e) => onUpdate({ energy_consumption: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.on_site_renewable}
          onChange={(e) => onUpdate({ on_site_renewable: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.off_site_renewable}
          onChange={(e) => onUpdate({ off_site_renewable: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-1 py-1">
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </td>
    </tr>
  );
}

function SummaryBlock({ state }: { state: OnsiteRenewableState }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="border border-border px-3 py-2">
              Percentage of energy consumption met through on-site renewable energy (%)
            </td>
            <td className="border border-border px-3 py-2 w-48">
              <input readOnly className={readonlyClass} value={state.percentage_energy_consumption} />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">
              Percentage of energy consumption met through off-site renewable energy (%)
            </td>
            <td className="border border-border px-3 py-2">
              <input
                readOnly
                className={readonlyClass}
                value={state.percentage_energy_consumption_offsite}
              />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">
              Percentage of energy consumption met through on-site &amp; off-site renewable energy (%)
            </td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={state.percentage_offsite_onsite} />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Amount of Renewable enegry saving</td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={state.saving_reneweable_energy} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
