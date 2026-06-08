import {
  computeDaylightNoiseState,
  type AcousticSpaceTypeDef,
  type DaylightNoiseRow,
  type DaylightNoiseState,
  type DaylightSpaceTypeDef,
} from "@/annexure/annexDaylightNoiseCalculations";
import {
  buildSavePayloadFromDaylightNoise,
  hydrateDaylightNoiseAnnex,
} from "@/annexure/annexDaylightNoiseStorage";
import { loadAreaSourceRows } from "@/annexure/annexConditionedSpacesStorage";
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

function catalogsFromSchema(schema: AnnexureSchemaDefinition): {
  daylightTypes: Record<string, DaylightSpaceTypeDef>;
  acousticTypes: Record<string, AcousticSpaceTypeDef>;
} {
  const daylightTypes: Record<string, DaylightSpaceTypeDef> = {};
  for (const [key, def] of Object.entries(schema.daylightNoiseLayout?.daylightSpaceTypes ?? {})) {
    daylightTypes[key] = { label: def.label, benchmarkLux: def.benchmarkLux };
  }
  const acousticTypes: Record<string, AcousticSpaceTypeDef> = {};
  for (const [key, def] of Object.entries(schema.daylightNoiseLayout?.acousticSpaceTypes ?? {})) {
    acousticTypes[key] = { label: def.label, baselineDb: def.baselineDb };
  }
  return { daylightTypes, acousticTypes };
}

export function AnnexureDaylightNoiseRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const { daylightTypes, acousticTypes } = useMemo(() => catalogsFromSchema(schema), [schema]);

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

  const [draft, setDraft] = useState<DaylightNoiseState>(() =>
    hydrateDaylightNoiseAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateDaylightNoiseAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback(
    (fn: (s: DaylightNoiseState) => DaylightNoiseState) => {
      setDraft((prev) => computeDaylightNoiseState(fn(prev), daylightTypes, acousticTypes));
    },
    [daylightTypes, acousticTypes],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromDaylightNoise(draft),
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
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        {draft.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No regularly occupied, air-conditioned spaces found in Cal Area Statement / Circulation /
            Sensors.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px] border-collapse text-xs">
              <thead>
                <tr className="bg-muted/60 text-center font-semibold uppercase text-muted-foreground">
                  <th className="sticky left-0 z-10 border border-border bg-muted/60 px-2 py-2" rowSpan={2}>
                    S.No
                  </th>
                  <th
                    className="sticky left-12 z-10 min-w-[160px] border border-border bg-muted/60 px-2 py-2"
                    rowSpan={2}
                  >
                    Description of spaces
                  </th>
                  <th className="border border-border px-2 py-2" rowSpan={2}>
                    Total carpet area (sq ft)
                  </th>
                  <th className="border border-border px-2 py-2" colSpan={5}>
                    Daylighting
                  </th>
                  <th className="border border-border px-2 py-2" colSpan={5}>
                    Material Acoustic performance - Noise Criteria
                  </th>
                  <th className="border border-border px-2 py-2" rowSpan={2}>
                    Outdoor view
                  </th>
                </tr>
                <tr className="bg-muted/60 text-center text-[10px] font-semibold uppercase text-muted-foreground">
                  <th className="min-w-[120px] border border-border px-2 py-2">Space type</th>
                  <th className="border border-border px-2 py-2">Benchmark lux</th>
                  <th className="border border-border px-2 py-2">Simulated lux</th>
                  <th className="border border-border px-2 py-2">Compliant area (sq ft)</th>
                  <th className="border border-border px-2 py-2">Meets compliance</th>
                  <th className="min-w-[100px] border border-border px-2 py-2">Space type</th>
                  <th className="border border-border px-2 py-2">Baseline max (dB)</th>
                  <th className="border border-border px-2 py-2">Measured (dB)</th>
                  <th className="border border-border px-2 py-2">Compliant area (sq ft)</th>
                  <th className="border border-border px-2 py-2">Meets compliance</th>
                </tr>
              </thead>
              <tbody>
                {draft.rows.map((row, idx) => (
                  <DataRow
                    key={row.sourceIndex}
                    row={row}
                    displayNo={idx + 1}
                    daylightTypes={daylightTypes}
                    acousticTypes={acousticTypes}
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
        )}

        <SummaryBlock state={draft} />
      </div>
    </div>
  );
}

function DataRow({
  row,
  displayNo,
  daylightTypes,
  acousticTypes,
  onUpdate,
}: {
  row: DaylightNoiseRow;
  displayNo: number;
  daylightTypes: Record<string, DaylightSpaceTypeDef>;
  acousticTypes: Record<string, AcousticSpaceTypeDef>;
  onUpdate: (patch: Partial<DaylightNoiseRow>) => void;
}) {
  return (
    <tr className="text-center">
      <td className="sticky left-0 z-[1] border border-border bg-card px-2 py-1 font-medium">
        {displayNo}
      </td>
      <td className="sticky left-12 z-[1] border border-border bg-card px-1 py-1 text-left">
        <input readOnly className={readonlyClass} value={row.reqularly_occupied_air_spaces} />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={row.air_space_regular_occ} />
      </td>
      <td className="border border-border px-1 py-1">
        <select
          className={selectClass}
          value={row.space_co2_noise}
          onChange={(e) => onUpdate({ space_co2_noise: e.target.value })}
        >
          <option value="">Select</option>
          {Object.entries(daylightTypes).map(([val, def]) => (
            <option key={val} value={val}>
              {def.label}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={row.space_co2_benchmark} />
      </td>
      <td className="border border-border px-1 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.space_co2_lux_level}
          onChange={(e) => onUpdate({ space_co2_lux_level: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={row.space_co2_compiant_area} />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={row.space_co2_compliant_boolean} />
      </td>
      <td className="border border-border px-1 py-1">
        <select
          className={selectClass}
          value={row.type_of_spaces_lpd}
          onChange={(e) => onUpdate({ type_of_spaces_lpd: e.target.value })}
        >
          <option value="">Type</option>
          {Object.entries(acousticTypes).map(([val, def]) => (
            <option key={val} value={val}>
              {def.label}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={row.baseline_lpd_datlight} />
      </td>
      <td className="border border-border px-1 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.space_co2_measure}
          onChange={(e) => onUpdate({ space_co2_measure: clampDecimal(e.target.value) })}
        />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={row.space_co2_measure_value} />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={row.space_co2_performance_value} />
      </td>
      <td className="border border-border px-1 py-1">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={row.space_co2_outdoor}
          onChange={(e) => onUpdate({ space_co2_outdoor: clampDecimal(e.target.value) })}
        />
      </td>
    </tr>
  );
}

function SummaryBlock({ state }: { state: DaylightNoiseState }) {
  const items: { label: string; value: string }[] = [
    { label: "Total regularly occupied area (sq ft)", value: state.total_carpet_area_daylight },
    {
      label: "Total area with adequate daylight (sq ft)",
      value: state.total_regularly_occupied_daylight,
    },
    {
      label: "Percentage of regularly occupied spaces with access to daylight (%)",
      value: state.base_total_consum_daylight,
    },
    {
      label: "Meets noise criteria requirements for all regularly occupied spaces",
      value: state.total_annual_boolean_daylight,
    },
    {
      label: "Total regularly occupied area with access to outdoor views",
      value: state.total_annual_outdoor_daylight,
    },
    {
      label: "Percentage of regularly occupied area with access to outdoor views",
      value: state.total_annual_occupied_daylight,
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
