import {
  computeExistingSingleZoneState,
  EXISTING_SINGLE_ZONE_DEFAULT_ROW,
  type ExistingSingleZoneRow,
  type ExistingSingleZoneState,
} from "@/annexure/annexExistingSingleZoneCalculations";
import {
  areaDescriptionsFromSchema,
  buildSavePayloadFromExistingSingleZone,
  hydrateExistingSingleZoneAnnex,
  ventilationZoneLayout,
} from "@/annexure/annexExistingSingleZoneStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";
const cellBorder = "border border-border";

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
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  if (readOnly) {
    return <input readOnly className={readonlyClass} value={value} />;
  }
  return (
    <input
      type="number"
      step="0.01"
      className={inputClass}
      value={value}
      onChange={(e) => onChange?.(clampDecimal(e.target.value))}
    />
  );
}

export function AnnexureExistingSingleZoneRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = ventilationZoneLayout(schema);
  const maxRows = layout.maxRows ?? 50;
  const addRowLabel = layout.addRowLabel ?? "Add More";
  const areaDescriptions = useMemo(() => areaDescriptionsFromSchema(schema), [schema]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<ExistingSingleZoneState>(() =>
    hydrateExistingSingleZoneAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateExistingSingleZoneAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback(
    (fn: (s: ExistingSingleZoneState) => ExistingSingleZoneState) => {
      setDraft((prev) => computeExistingSingleZoneState(fn(prev), areaDescriptions));
    },
    [areaDescriptions],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromExistingSingleZone(draft, schema),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef, schema]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  const canAdd = draft.rows.length < maxRows;
  const areaOptions = Object.entries(areaDescriptions).sort((a, b) =>
    a[1].label.localeCompare(b[1].label),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
        <button
          type="button"
          disabled={!canAdd}
          onClick={() =>
            recalc((s) => ({
              ...s,
              rows: [...s.rows, { ...EXISTING_SINGLE_ZONE_DEFAULT_ROW }],
            }))
          }
          className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean/90 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {addRowLabel}
        </button>
      </div>

      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1800px] border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-muted/60 text-center font-semibold text-muted-foreground">
                <th className={`${cellBorder} px-2 py-2 w-12`}>S.No</th>
                <th className={`${cellBorder} px-2 py-2 min-w-[100px]`}>Zone</th>
                <th className={`${cellBorder} px-2 py-2 min-w-[200px]`}>Area Description</th>
                <th className={`${cellBorder} px-2 py-2 min-w-[120px]`}>
                  Outdoor Airflow Rate Required per Person cfm / person (Rp)
                </th>
                <th className={`${cellBorder} px-2 py-2 min-w-[100px]`}>Zone Population (Pz)</th>
                <th className={`${cellBorder} px-2 py-2 min-w-[120px]`}>
                  Outdoor Airflow Rate per Unit Area cfm / sq.ft (Ra)
                </th>
                <th className={`${cellBorder} px-2 py-2 min-w-[100px]`}>Area (sq ft) (Az)</th>
                <th className={`${cellBorder} px-2 py-2 min-w-[120px]`}>
                  Breathing Zone Outdoor Airflow (CFM) (Vbz)
                </th>
                <th className={`${cellBorder} px-2 py-2 min-w-[100px]`}>
                  Zone Air Distribution Effectiveness (Ez)
                </th>
                <th className={`${cellBorder} px-2 py-2 min-w-[120px]`}>
                  Zone Outdoor Airflow (cfm) (Voz = Vbz/Ez)
                </th>
                <th className={`${cellBorder} px-2 py-2 min-w-[110px]`}>
                  Outdoor Air Intake Flow (Vot = Voz)
                </th>
                <th className={`${cellBorder} px-2 py-2 min-w-[120px]`}>
                  20% Improvement over Minimum fresh air requirement
                </th>
                <th className={`${cellBorder} px-2 py-2 min-w-[120px]`}>
                  30% Improvement over Minimum fresh air requirement
                </th>
                <th className={`${cellBorder} px-2 py-2 min-w-[120px]`}>Outdoor Air Intake Flow</th>
                <th className={`${cellBorder} px-2 py-2 min-w-[120px]`}>
                  Percentage Increase Over Standard
                </th>
              </tr>
            </thead>
            <tbody>
              {draft.rows.map((row, idx) => (
                <ZoneRow
                  key={idx}
                  row={row}
                  idx={idx}
                  areaOptions={areaOptions}
                  onUpdate={(patch) =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
                    }))
                  }
                  onAreaDescriptionChange={(slug) =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) =>
                        i === idx ? { ...r, areaDescription: slug } : r,
                      ),
                    }))
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ZoneRow({
  row,
  idx,
  areaOptions,
  onUpdate,
  onAreaDescriptionChange,
}: {
  row: ExistingSingleZoneRow;
  idx: number;
  areaOptions: [string, { label: string }][];
  onUpdate: (patch: Partial<ExistingSingleZoneRow>) => void;
  onAreaDescriptionChange: (slug: string) => void;
}) {
  return (
    <tr className="text-center">
      <td className={`${cellBorder} px-2 py-1 font-medium`}>{idx + 1}</td>
      <td className={`${cellBorder} px-2 py-1`}>
        <input
          type="text"
          className={inputClass}
          value={row.zone}
          onChange={(e) => onUpdate({ zone: e.target.value })}
        />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <select
          className={inputClass}
          value={row.areaDescription}
          onChange={(e) => onAreaDescriptionChange(e.target.value)}
        >
          <option value="">Select</option>
          {areaOptions.map(([slug, def]) => (
            <option key={slug} value={slug}>
              {def.label}
            </option>
          ))}
        </select>
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.outdoorAirflowRate} readOnly />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.zonePopulation} onChange={(v) => onUpdate({ zonePopulation: v })} />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.outdoorFlowRateArea} readOnly />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.totalArea} onChange={(v) => onUpdate({ totalArea: v })} />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.breathingZoneOutdoor} readOnly />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.zoneAirDistribution} readOnly />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.zoneOutdoorAirFlow} readOnly />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.outdoorAirIntakeFlow} readOnly />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.minimumAirFresh} readOnly />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.minimumAirFreshOver} readOnly />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput
          value={row.flowOutdoorAirIntake}
          onChange={(v) => onUpdate({ flowOutdoorAirIntake: v })}
        />
      </td>
      <td className={`${cellBorder} px-2 py-1`}>
        <NumInput value={row.increaseOverStandard} readOnly />
      </td>
    </tr>
  );
}
