import {
  computeNaturalVentilationState,
  displayBoolToken,
  type NaturalVentilationRow,
  type NaturalVentilationState,
} from "@/annexure/annexNaturalVentilationCalculations";
import {
  buildSavePayloadFromNaturalVentilation,
  hydrateNaturalVentilationAnnex,
  loadAreaSourceRows,
} from "@/annexure/annexNaturalVentilationStorage";
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

export function AnnexureNaturalVentilationRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
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

  const [draft, setDraft] = useState<NaturalVentilationState>(() =>
    hydrateNaturalVentilationAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateNaturalVentilationAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: NaturalVentilationState) => NaturalVentilationState) => {
    setDraft((prev) => computeNaturalVentilationState(fn(prev)));
  }, []);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromNaturalVentilation(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  const yesNoOpts = schema.naturalVentilationLayout?.yesNoOptions ?? { "": "Select", Yes: "Yes", No: "No" };

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th rowSpan={2} className="border border-border px-2 py-2">
                  S.No
                </th>
                <th rowSpan={2} className="border border-border px-2 py-2 min-w-[200px]">
                  Regularly occupied spaces
                </th>
                <th rowSpan={2} className="border border-border px-2 py-2 min-w-[120px]">
                  Carpet area (sq m)
                </th>
                <th rowSpan={2} className="border border-border px-2 py-2">
                  Openable window area (sq m)
                </th>
                <th rowSpan={2} className="border border-border px-2 py-2">
                  Openable door area (sq m)
                </th>
                <th rowSpan={2} className="border border-border px-2 py-2">
                  Total opening area (sq m)
                </th>
                <th rowSpan={2} className="border border-border px-2 py-2">
                  % opening to carpet (designed)
                </th>
                <th colSpan={3} className="border border-border px-2 py-2">
                  Fresh air natural ventilation
                </th>
                <th colSpan={2} className="border border-border px-2 py-2">
                  CO2 monitoring
                </th>
              </tr>
              <tr className="bg-muted/60 text-center text-[11px] font-semibold text-muted-foreground">
                <th className="border border-border px-2 py-1">Meets mandatory</th>
                <th className="border border-border px-2 py-1">Enhanced 1 pt</th>
                <th className="border border-border px-2 py-1">Enhanced 2 pt</th>
                <th className="border border-border px-2 py-1">Credit 1 pt</th>
                <th className="border border-border px-2 py-1">Enhanced 2 pt</th>
              </tr>
            </thead>
            <tbody>
              {draft.rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="border border-border px-4 py-6 text-center text-muted-foreground">
                    No regularly occupied non-air-conditioned spaces found. Complete{" "}
                    <span className="font-medium">Cal Area Statement / Circulation / Sensors</span> first.
                  </td>
                </tr>
              ) : null}
              {draft.rows.map((row, idx) => (
                <VentilationRow
                  key={row.sourceIndex}
                  row={row}
                  idx={idx}
                  yesNoOpts={yesNoOpts}
                  onUpdate={(patch) =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
                    }))
                  }
                />
              ))}
            </tbody>
          </table>
        </div>

        <SummarySections state={draft} />
      </div>
    </div>
  );
}

function VentilationRow({
  row,
  idx,
  yesNoOpts,
  onUpdate,
}: {
  row: NaturalVentilationRow;
  idx: number;
  yesNoOpts: Record<string, string>;
  onUpdate: (patch: Partial<NaturalVentilationRow>) => void;
}) {
  return (
    <tr className="text-center">
      <td className="border border-border px-2 py-1 font-medium">{idx + 1}</td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={row.reqularly_occupied_spaces} />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={row.carpet_area_non_ac} />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.openable_window_area}
          onChange={(e) => onUpdate({ openable_window_area: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.openable_door_area}
          onChange={(e) => onUpdate({ openable_door_area: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={row.total_openable_area} />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={row.percent_openable_area} />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={displayBoolToken(row.meets_mandatory)} />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={displayBoolToken(row.meets_point_one)} />
      </td>
      <td className="border border-border px-2 py-1">
        <input readOnly className={readonlyClass} value={displayBoolToken(row.meets_point_two)} />
      </td>
      <td className="border border-border px-2 py-1">
        <select
          className={selectClass}
          value={row.co2_meets_point_one}
          onChange={(e) => onUpdate({ co2_meets_point_one: e.target.value })}
        >
          {Object.entries(yesNoOpts).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-border px-2 py-1">
        <select
          className={selectClass}
          value={row.co2_meets_point_two}
          onChange={(e) => onUpdate({ co2_meets_point_two: e.target.value })}
        >
          {Object.entries(yesNoOpts).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="border border-border px-3 py-2">{label}</td>
      <td className="border border-border px-3 py-2 w-40">
        <input readOnly className={readonlyClass} value={value} />
      </td>
    </tr>
  );
}

function SummarySections({ state }: { state: NaturalVentilationState }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          <SummaryRow
            label="Total regularly occupied area with natural ventilation (sq m)"
            value={state.total_regularly_occupied_area_natural}
          />
          <SummaryRow label="Minimum percentage of opening" value={state.minimum_percentage_opening} />

          <tr>
            <th colSpan={2} className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold">
              Fresh Air Natural Ventilation
            </th>
          </tr>
          <SummaryRow
            label="Meets the mandatory fresh-air requirement for all naturally ventilated spaces"
            value={state.fresh_air_meet_space}
          />
          <SummaryRow
            label="Meets the Enhanced fresh-air requirement for all naturally ventilated spaces for 1 Point"
            value={state.fresh_air_meet_1_point}
          />
          <SummaryRow
            label="Meets the Enhanced fresh-air requirement for all naturally ventilated spaces for 2 Points"
            value={state.fresh_air_meet_2_point}
          />

          <tr>
            <th colSpan={2} className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold">
              Efficient space conditioning — Non Air-conditioned spaces
            </th>
          </tr>
          <SummaryRow label="Meets 6% opening area (1 points)" value={state.meets_6_percent_opening} />
          <SummaryRow label="Meets 7% opening area (2 points)" value={state.meets_7_percent_opening} />
          <SummaryRow label="Meets 8% opening area (3 points)" value={state.meets_8_percent_opening} />
          <SummaryRow label="Meets 9% opening area (4 points)" value={state.meets_9_percent_opening} />
          <SummaryRow label="Meets 10% opening area (5 points)" value={state.meets_10_percent_opening} />

          <tr>
            <th colSpan={2} className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold">
              CO2 Monitoring
            </th>
          </tr>
          <SummaryRow
            label="Meets the CO2 monitoring credit compliance for all naturally ventilated spaces for 1 Point"
            value={state.co2_meets_all_one_point}
          />
          <SummaryRow
            label="Meets the CO2 monitoring credit compliance for all naturally ventilated spaces for 2 Points"
            value={state.co2_meets_all_two_point}
          />
        </tbody>
      </table>
    </div>
  );
}
