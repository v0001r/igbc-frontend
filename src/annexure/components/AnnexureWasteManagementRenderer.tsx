import {
  computeWasteManagementState,
  materialLabelFromSource,
  type WasteManagementRow,
  type WasteManagementState,
} from "@/annexure/annexWasteManagementCalculations";
import {
  buildSavePayloadFromWasteManagement,
  hydrateWasteManagementAnnex,
  loadMaterialSources,
} from "@/annexure/annexWasteManagementStorage";
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

export function AnnexureWasteManagementRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.wasteManagementLayout!;
  const unitOptions = layout.unitOptions ?? { "": "Select Unit", kgs: "Weight (Kgs)", volume: "Volume (m³)" };
  const materialOptions = layout.materialOptions ?? { "": "Select" };
  const materialReadonly = layout.materialReadonly ?? false;

  const sourceSignature = useMemo(
    () => JSON.stringify(loadMaterialSources(formState, schema)),
    [formState, schema],
  );

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

  const [draft, setDraft] = useState<WasteManagementState>(() =>
    hydrateWasteManagementAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateWasteManagementAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: WasteManagementState) => WasteManagementState) => {
    setDraft((prev) => computeWasteManagementState(fn(prev)));
  }, []);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromWasteManagement(draft),
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
        <div className="max-w-xs">
          <select
            className={selectClass}
            value={draft.waste_unit}
            onChange={(e) => recalc((s) => ({ ...s, waste_unit: e.target.value }))}
          >
            {Object.entries(unitOptions).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60 text-center text-xs font-semibold uppercase text-muted-foreground">
                <th className="w-12 border border-border px-2 py-2">S.No</th>
                <th className="min-w-[180px] border border-border px-2 py-2">
                  Description of material
                </th>
                <th className="border border-border px-2 py-2">Generated</th>
                <th className="border border-border px-2 py-2">Reused on project site</th>
                <th className="border border-border px-2 py-2">Sent to recycle vendor</th>
                <th className="border border-border px-2 py-2">Donate to other project site</th>
                <th className="border border-border px-2 py-2">Sent to landfill</th>
              </tr>
            </thead>
            <tbody>
              {draft.rows.map((row, idx) => (
                <WasteRow
                  key={row.sourceIndex}
                  row={row}
                  displayNo={idx + 1}
                  materialOptions={materialOptions}
                  materialReadonly={materialReadonly}
                  onUpdate={(patch) =>
                    recalc((s) => ({
                      ...s,
                      rows: s.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
                    }))
                  }
                />
              ))}
              <TotalsRow state={draft} />
            </tbody>
          </table>
        </div>

        <div className="max-w-2xl">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="border border-border px-3 py-2">
                  Percentage of waste diverted away from landfill (%)
                </td>
                <td className="w-48 border border-border px-3 py-2">
                  <input
                    readOnly
                    className={readonlyClass}
                    value={draft.percentage_waste_diverted_landfill}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WasteRow({
  row,
  displayNo,
  materialOptions,
  materialReadonly,
  onUpdate,
}: {
  row: WasteManagementRow;
  displayNo: number;
  materialOptions: Record<string, string>;
  materialReadonly: boolean;
  onUpdate: (patch: Partial<WasteManagementRow>) => void;
}) {
  const selectValue = row.sub_category;
  const hasCustomValue = Boolean(selectValue && materialOptions[selectValue] === undefined);
  const showOtherSub = row.sub_category === "Other";

  const updateMaterial = (patch: Pick<WasteManagementRow, "sub_category" | "other_sub_catg">) => {
    const next = { ...row, ...patch };
    onUpdate({
      ...patch,
      material_description: materialLabelFromSource(next, materialOptions),
    });
  };

  return (
    <tr className="text-center">
      <td className="border border-border px-2 py-1 font-medium">{displayNo}</td>
      <td className="border border-border px-1 py-1 text-left">
        {materialReadonly ? (
          <input readOnly className={readonlyClass} value={row.material_description} />
        ) : (
          <>
            <select
              className={selectClass}
              value={selectValue}
              onChange={(e) =>
                updateMaterial({
                  sub_category: e.target.value,
                  other_sub_catg: e.target.value === "Other" ? row.other_sub_catg : "",
                })
              }
            >
              <option value="">Select</option>
              {Object.entries(materialOptions)
                .filter(([key]) => key !== "")
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              {hasCustomValue ? <option value={selectValue}>{selectValue}</option> : null}
            </select>
            {showOtherSub ? (
              <input
                className={`${inputClass} mt-1`}
                placeholder="Specify other"
                value={row.other_sub_catg}
                onChange={(e) =>
                  updateMaterial({ sub_category: row.sub_category, other_sub_catg: e.target.value })
                }
              />
            ) : null}
          </>
        )}
      </td>
      <NumCell value={row.generated} onChange={(v) => onUpdate({ generated: v })} />
      <NumCell value={row.generated_proj} onChange={(v) => onUpdate({ generated_proj: v })} />
      <NumCell value={row.reused} onChange={(v) => onUpdate({ reused: v })} />
      <NumCell value={row.recycle_used} onChange={(v) => onUpdate({ recycle_used: v })} />
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={row.sent_landfill} />
      </td>
    </tr>
  );
}

function NumCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <td className="border border-border px-1 py-1">
      <input
        type="number"
        step="0.01"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(clampDecimal(e.target.value))}
      />
    </td>
  );
}

function TotalsRow({ state }: { state: WasteManagementState }) {
  return (
    <tr className="bg-muted/30 font-medium text-center">
      <td className="border border-border px-2 py-2" colSpan={2}>
        Total
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={state.total_generated_waste} />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={state.total_reused_project} />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={state.total_reused_recycle_vendor} />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={state.total_reused_donated_proj} />
      </td>
      <td className="border border-border px-1 py-1">
        <input readOnly className={readonlyClass} value={state.total_sent_landfil} />
      </td>
    </tr>
  );
}
