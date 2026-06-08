import {
  computeOccupantWellbeingState,
  emptyOccupantWellbeingRow,
  type OccupantWellbeingRow,
  type OccupantWellbeingState,
} from "@/annexure/annexOccupantWellbeingCalculations";
import {
  buildSavePayloadFromOccupantWellbeing,
  hydrateOccupantWellbeingAnnex,
} from "@/annexure/annexOccupantWellbeingStorage";
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
  globalExtras?: Record<string, string>;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

export function AnnexureOccupantWellbeingRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  globalExtras,
  saveHandleRef,
}: Props) {
  const layout = schema.occupantWellbeingLayout!;
  const maxRows = layout.maxRows ?? 50;
  const addRowLabel = layout.addRowLabel ?? "Add More";
  const globalKey = layout.permanentOccupancyGlobalKey ?? "projects_details_permanent_occupancy";

  const permanentOccupancy = useMemo(() => {
    return (
      globalExtras?.[globalKey]?.trim() ||
      (formState.data ?? []).find(
        (d) =>
          d.tab === "project_details" &&
          d.subtab === "project_details" &&
          d.paramName === globalKey,
      )?.value ||
      ""
    );
  }, [formState.data, globalExtras, globalKey]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
        permanentOccupancy,
      ]),
    [formState.data, tab, subtab, permanentOccupancy],
  );

  const [draft, setDraft] = useState<OccupantWellbeingState>(() =>
    hydrateOccupantWellbeingAnnex(schema, formState, tab, subtab, { permanentOccupancy }),
  );

  useEffect(() => {
    setDraft(
      hydrateOccupantWellbeingAnnex(schema, formState, tab, subtab, { permanentOccupancy }),
    );
  }, [schema, formState, tab, subtab, dataSignature, permanentOccupancy]);

  const recalc = useCallback((fn: (s: OccupantWellbeingState) => OccupantWellbeingState) => {
    setDraft((prev) => computeOccupantWellbeingState(fn(prev)));
  }, []);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromOccupantWellbeing(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
        <button
          type="button"
          disabled={draft.rows.length >= maxRows}
          onClick={() =>
            recalc((s) => {
              const nextId = s.rows.length ? Math.max(...s.rows.map((r) => r.rowId)) + 1 : 1;
              return { ...s, rows: [...s.rows, emptyOccupantWellbeingRow(nextId)] };
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
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60 text-center text-xs font-semibold uppercase text-muted-foreground">
                <th className="w-12 border border-border px-2 py-2">S.No</th>
                <th className="min-w-[200px] border border-border px-2 py-2">
                  Occupant wellbeing facilities provided
                </th>
                <th className="border border-border px-2 py-2">
                  Number of occupants served by each facility
                </th>
                <th className="border border-border px-2 py-2">Number of facility</th>
                <th className="border border-border px-2 py-2">Total occupants</th>
                <th className="w-10 border border-border px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {draft.rows.map((row, idx) => (
                <WellbeingRow
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
                    recalc((s) => ({ ...s, rows: s.rows.filter((_, i) => i !== idx) }))
                  }
                  canRemove={draft.rows.length > 1}
                />
              ))}
            </tbody>
          </table>
        </div>

        <SummaryBlock state={draft} />
      </div>
    </div>
  );
}

function WellbeingRow({
  row,
  displayNo,
  onUpdate,
  onRemove,
  canRemove,
}: {
  row: OccupantWellbeingRow;
  displayNo: number;
  onUpdate: (patch: Partial<OccupantWellbeingRow>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <tr className="text-center">
      <td className="border border-border px-2 py-1 font-medium">{displayNo}</td>
      <td className="border border-border px-1 py-1">
        <input
          className={inputClass}
          value={row.wellbeign_facilities_provide}
          onChange={(e) => onUpdate({ wellbeign_facilities_provide: e.target.value })}
        />
      </td>
      <td className="border border-border px-1 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.wellbeing_served}
          onChange={(e) => onUpdate({ wellbeing_served: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-1 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.wellbeing_facility}
          onChange={(e) => onUpdate({ wellbeing_facility: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={row.wellbeing_total} />
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

function SummaryBlock({ state }: { state: OccupantWellbeingState }) {
  const items: { label: string; value: string }[] = [
    {
      label: "Total number occupants with access to occupant wellbeing facilities",
      value: state.total_occupant_access,
    },
    { label: "Permanent occupancy", value: state.total_permanent_occupancy },
    {
      label:
        "Percentage of occupants with access to recreational facilities at any given point of time (%)",
      value: state.total_recreational,
    },
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
