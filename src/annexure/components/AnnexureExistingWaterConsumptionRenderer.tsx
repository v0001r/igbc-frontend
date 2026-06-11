import {
  computeExistingWaterConsumptionState,
  emptyWaterConsumptionBuilding,
  emptyWaterConsumptionRow,
  type ExistingWaterConsumptionState,
  type WaterConsumptionBuilding,
  type WaterConsumptionRow,
} from "@/annexure/annexExistingWaterConsumptionCalculations";
import {
  buildSavePayloadFromExistingWaterConsumption,
  hydrateExistingWaterConsumptionAnnex,
} from "@/annexure/annexExistingWaterConsumptionStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { Plus, X } from "lucide-react";
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

export function AnnexureExistingWaterConsumptionRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.existingWaterConsumptionLayout ?? {};
  const minRows = layout.minRowsPerBuilding ?? 5;
  const maxRows = layout.maxRowsPerBuilding ?? 50;
  const maxBuildings = layout.maxBuildings ?? 20;
  const minBuildings = layout.minBuildings ?? 1;
  const addBuildingLabel = layout.addBuildingLabel ?? "Add Building";

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<ExistingWaterConsumptionState>(() =>
    hydrateExistingWaterConsumptionAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateExistingWaterConsumptionAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: ExistingWaterConsumptionState) => ExistingWaterConsumptionState) => {
    setDraft((prev) => computeExistingWaterConsumptionState(fn(prev)));
  }, []);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromExistingWaterConsumption(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  const addBuilding = useCallback(() => {
    recalc((s) => {
      if (s.buildings.length >= maxBuildings) return s;
      const nextIndex = s.buildings.reduce((m, b) => Math.max(m, b.tableIndex), 0) + 1;
      return {
        ...s,
        buildings: [...s.buildings, emptyWaterConsumptionBuilding(nextIndex, minRows)],
      };
    });
  }, [maxBuildings, minRows, recalc]);

  const removeBuilding = useCallback(
    (tableIndex: number) => {
      recalc((s) => {
        if (s.buildings.length <= minBuildings) return s;
        return { ...s, buildings: s.buildings.filter((b) => b.tableIndex !== tableIndex) };
      });
    },
    [minBuildings, recalc],
  );

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(Number(ratingTypeId))) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={addBuilding}
            disabled={draft.buildings.length >= maxBuildings}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean-hover disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {addBuildingLabel}
          </button>
        </div>

        {draft.buildings.map((building) => (
          <BuildingTable
            key={building.tableIndex}
            building={building}
            canRemove={draft.buildings.length > minBuildings}
            maxRows={maxRows}
            onRemove={() => removeBuilding(building.tableIndex)}
            onChange={(updater) =>
              recalc((s) => ({
                ...s,
                buildings: s.buildings.map((b) =>
                  b.tableIndex === building.tableIndex ? updater(b) : b,
                ),
              }))
            }
          />
        ))}
      </div>
    </div>
  );
}

function BuildingTable({
  building,
  canRemove,
  maxRows,
  onRemove,
  onChange,
}: {
  building: WaterConsumptionBuilding;
  canRemove: boolean;
  maxRows: number;
  onRemove: () => void;
  onChange: (fn: (b: WaterConsumptionBuilding) => WaterConsumptionBuilding) => void;
}) {
  const addRow = () => {
    onChange((b) => {
      if (b.rows.length >= maxRows) return b;
      return { ...b, rows: [...b.rows, emptyWaterConsumptionRow()] };
    });
  };

  const patchRow = (rowIndex: number, patch: Partial<WaterConsumptionRow>) => {
    onChange((b) => ({
      ...b,
      rows: b.rows.map((row, i) => (i === rowIndex ? { ...row, ...patch } : row)),
    }));
  };

  return (
    <div className="relative overflow-x-auto rounded-xl border border-border bg-muted/10 p-4">
      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 z-10 rounded-full bg-destructive p-1 text-white shadow"
          title="Remove building"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2 pr-8">
        <button
          type="button"
          onClick={addRow}
          disabled={building.rows.length >= maxRows}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ocean px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean-hover disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Row
        </button>
      </div>

      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/40 text-center">
            <th colSpan={3} className="border border-border px-3 py-2 font-semibold">
              Building Name {building.tableIndex}
            </th>
            <th colSpan={2} className="border border-border px-2 py-1.5">
              <input
                className={inputClass}
                value={building.dwelling_type}
                onChange={(e) => onChange((b) => ({ ...b, dwelling_type: e.target.value }))}
                placeholder="Building name"
              />
            </th>
          </tr>
          <tr className="bg-muted/30 text-center text-xs font-medium">
            <th rowSpan={2} className="border border-border px-2 py-2 w-14">
              Month and Year
            </th>
            <th colSpan={2} className="border border-border px-2 py-2">
              Previous Year Water Consumption (in Litres)
            </th>
            <th colSpan={2} className="border border-border px-2 py-2">
              Current Year Water Consumption (in Litres)
            </th>
          </tr>
          <tr className="bg-muted/20 text-center text-xs font-medium">
            <th className="border border-border px-2 py-1.5">Date</th>
            <th className="border border-border px-2 py-1.5">Value</th>
            <th className="border border-border px-2 py-1.5">Date</th>
            <th className="border border-border px-2 py-1.5">Value</th>
          </tr>
        </thead>
        <tbody>
          {building.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="text-center">
              <td className="border border-border px-2 py-2 font-medium text-muted-foreground">
                {rowIndex + 1}
              </td>
              <td className="border border-border px-1 py-1">
                <input
                  type="date"
                  className={inputClass}
                  value={row.years_ex}
                  onChange={(e) => patchRow(rowIndex, { years_ex: e.target.value })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={row.rainfall_ex}
                  onChange={(e) => patchRow(rowIndex, { rainfall_ex: clampDecimal(e.target.value) })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <input
                  type="date"
                  className={inputClass}
                  value={row.ex_peak_month}
                  onChange={(e) => patchRow(rowIndex, { ex_peak_month: e.target.value })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={row.rainy_day}
                  onChange={(e) => patchRow(rowIndex, { rainy_day: clampDecimal(e.target.value) })}
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/20">
            <td colSpan={2} className="border border-border px-3 py-2 text-right text-sm font-medium">
              Total
            </td>
            <td className="border border-border px-2 py-1.5">
              <input readOnly className={readonlyClass} value={building.previous_year} />
            </td>
            <td className="border border-border px-3 py-2 text-right text-sm font-medium">
              Total
            </td>
            <td className="border border-border px-2 py-1.5">
              <input readOnly className={readonlyClass} value={building.current_year} />
            </td>
          </tr>
          <tr className="bg-muted/20">
            <td colSpan={4} className="border border-border px-3 py-2 text-right text-sm font-medium">
              Percentage reduction in water consumption
            </td>
            <td className="border border-border px-2 py-1.5">
              <input readOnly className={readonlyClass} value={building.percentage_current_pervious} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
