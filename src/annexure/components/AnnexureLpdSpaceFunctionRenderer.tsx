import {
  computeLpdSpaceFunctionState,
  type LpdSpaceFunctionRow,
  type LpdSpaceFunctionState,
} from "@/annexure/annexLpdSpaceFunctionCalculations";
import {
  buildSavePayloadFromLpdSpaceFunction,
  emptyLpdSpaceFunctionRow,
  hydrateLpdSpaceFunctionAnnex,
  spaceBaselineCatalogFromSchema,
} from "@/annexure/annexLpdSpaceFunctionStorage";
import { loadAreaSourceRows } from "@/annexure/annexConditionedSpacesStorage";
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

export function AnnexureLpdSpaceFunctionRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const catalog = useMemo(() => spaceBaselineCatalogFromSchema(schema), [schema]);
  const spaceTypeOptions = schema.lpdSpaceFunctionLayout?.spaceTypeOptions ?? {};
  const maxRows = schema.lpdSpaceFunctionLayout?.maxRows ?? 50;
  const addRowLabel = schema.lpdSpaceFunctionLayout?.addRowLabel ?? "Add More";

  const sourceSignature = useMemo(() => JSON.stringify(loadAreaSourceRows(formState)), [formState]);

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

  const [draft, setDraft] = useState<LpdSpaceFunctionState>(() =>
    hydrateLpdSpaceFunctionAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateLpdSpaceFunctionAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback(
    (fn: (s: LpdSpaceFunctionState) => LpdSpaceFunctionState) => {
      setDraft((prev) => computeLpdSpaceFunctionState(fn(prev), catalog));
    },
    [catalog],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromLpdSpaceFunction(draft),
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
              return { ...s, rows: [...s.rows, emptyLpdSpaceFunctionRow(nextId)] };
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
          <table className="w-full min-w-[1400px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="border border-border px-2 py-2 w-10">S.No</th>
                <th className="border border-border px-2 py-2 min-w-[160px]">Description of spaces</th>
                <th className="border border-border px-2 py-2 min-w-[160px]">Type of space</th>
                <th className="border border-border px-2 py-2">Carpet area (sq m)</th>
                <th colSpan={3} className="border border-border px-2 py-2">
                  Lighting fixtures
                </th>
                <th className="border border-border px-2 py-2">Total wattage</th>
                <th className="border border-border px-2 py-2">Design LPD (W/sq.m)</th>
                <th className="border border-border px-2 py-2">Baseline LPD (W/sq.m)</th>
                <th className="border border-border px-2 py-2">LPD reduction (%)</th>
                <th className="border border-border px-2 py-2 w-10" />
              </tr>
              <tr className="bg-muted/60 text-center text-[11px] font-semibold text-muted-foreground">
                <th className="border border-border" colSpan={4} />
                <th className="border border-border px-2 py-1">Type</th>
                <th className="border border-border px-2 py-1">No. of fixtures</th>
                <th className="border border-border px-2 py-1">Wattage each</th>
                <th className="border border-border" colSpan={5} />
              </tr>
            </thead>
            <tbody>
              {draft.rows.map((row, idx) => (
                <SpaceFunctionRow
                  key={row.rowId}
                  row={row}
                  displayNo={idx + 1}
                  spaceTypeOptions={spaceTypeOptions}
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
            </tbody>
          </table>
        </div>

        <SummaryBlock state={draft} />
      </div>
    </div>
  );
}

function SpaceFunctionRow({
  row,
  displayNo,
  spaceTypeOptions,
  onUpdate,
  onRemove,
  canRemove,
}: {
  row: LpdSpaceFunctionRow;
  displayNo: number;
  spaceTypeOptions: Record<string, string>;
  onUpdate: (patch: Partial<LpdSpaceFunctionRow>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <tr className="text-center">
      <td className="border border-border px-2 py-1 font-medium">{displayNo}</td>
      <td className="border border-border px-2 py-1">
        <input
          className={inputClass}
          value={row.reqularly_occupied_spaces}
          onChange={(e) => onUpdate({ reqularly_occupied_spaces: e.target.value })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <select
          className={selectClass}
          value={row.applicable_space_lpd}
          onChange={(e) => onUpdate({ applicable_space_lpd: e.target.value })}
        >
          {Object.entries(spaceTypeOptions).map(([v, label]) => (
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
          value={row.carpet_area_lpd}
          onChange={(e) => onUpdate({ carpet_area_lpd: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          className={inputClass}
          value={row.lighting_fixture_type}
          onChange={(e) => onUpdate({ lighting_fixture_type: e.target.value })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.no_of_lighting_fixture}
          onChange={(e) => onUpdate({ no_of_lighting_fixture: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.wattage_of_each_lighting_fixture}
          onChange={(e) => onUpdate({ wattage_of_each_lighting_fixture: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={row.total_wattage_lpd} />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={row.design_lpd_space} />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={row.baseline_space_lpd} />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={row.lpd_reduction_space} />
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

function SummaryBlock({ state }: { state: LpdSpaceFunctionState }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="border border-border px-3 py-2">Total carpet area (sq m)</td>
            <td className="border border-border px-3 py-2 w-48">
              <input readOnly className={readonlyClass} value={state.total_carpet_area_lpd} />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Amount of LPD reduction (W/sq.m)</td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={state.amount_lpd_reduction_space} />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-3 py-2">Percentage of LPD reduction (%)</td>
            <td className="border border-border px-3 py-2">
              <input readOnly className={readonlyClass} value={state.total_regularly_occupied_area} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
