import {
  computeMasterMaterialState,
  type MasterMaterialRow,
  type MasterMaterialState,
} from "@/annexure/annexMasterMaterialCalculations";
import {
  buildSavePayloadFromMasterMaterial,
  emptyMasterMaterialRow,
  hydrateMasterMaterialAnnex,
} from "@/annexure/annexMasterMaterialStorage";
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
const yesNoOptions = { "": "Select", yes: "Yes", no: "No" };

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

export function AnnexureMasterMaterialRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.masterMaterialLayout!;
  const materialOptions = layout.materialOptions ?? {};
  const subCategories = layout.subCategories ?? {};
  const localDistanceMaxKm = layout.localDistanceMaxKm ?? 500;
  const maxRows = layout.maxRows ?? 50;
  const addRowLabel = layout.addRowLabel ?? "Add More";

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<MasterMaterialState>(() =>
    hydrateMasterMaterialAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateMasterMaterialAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback(
    (fn: (s: MasterMaterialState) => MasterMaterialState) => {
      setDraft((prev) => computeMasterMaterialState(fn(prev), localDistanceMaxKm));
    },
    [localDistanceMaxKm],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromMasterMaterial(draft),
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
              return { ...s, rows: [...s.rows, emptyMasterMaterialRow(nextId)] };
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
          <table className="w-full min-w-[2800px] border-collapse text-xs">
            <thead>
              <tr className="bg-muted/60 text-center font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="sticky left-0 z-10 border border-border bg-muted/60 px-2 py-2">S.No</th>
                <th className="sticky left-12 z-10 min-w-[140px] border border-border bg-muted/60 px-2 py-2">
                  Description
                </th>
                <th className="min-w-[120px] border border-border px-2 py-2">Sub-category</th>
                <th className="border border-border px-2 py-2">Qty</th>
                <th className="border border-border px-2 py-2">Unit</th>
                <th className="border border-border px-2 py-2">Rates</th>
                <th className="border border-border px-2 py-2">Total cost</th>
                <th className="min-w-[120px] border border-border px-2 py-2">Manufacturer</th>
                <th className="min-w-[120px] border border-border px-2 py-2">Mfg location</th>
                <th className="border border-border px-2 py-2">Distance (km)</th>
                <th className="border border-border px-2 py-2">Local cost</th>
                <th className="border border-border px-2 py-2">Salvaged</th>
                <th className="border border-border px-2 py-2">Salvaged cost</th>
                <th className="border border-border px-2 py-2">Reuse %</th>
                <th className="border border-border px-2 py-2">Reuse cost</th>
                <th className="border border-border px-2 py-2">Eco-label</th>
                <th className="border border-border px-2 py-2">Eco cost</th>
                <th className="border border-border px-2 py-2">Recycled %</th>
                <th className="border border-border px-2 py-2">Recycled cost</th>
                <th className="border border-border px-2 py-2">Renewable wood %</th>
                <th className="border border-border px-2 py-2">Composite wood %</th>
                <th className="border border-border px-2 py-2">Wood cost</th>
                <th className="border border-border px-2 py-2">Eco furniture</th>
                <th className="border border-border px-2 py-2">Furniture cost</th>
                <th className="border border-border px-2 py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {draft.rows.map((row, idx) => (
                <MaterialRow
                  key={row.rowId}
                  row={row}
                  displayNo={idx + 1}
                  materialOptions={materialOptions}
                  subCategories={subCategories}
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
              <TotalsRow state={draft} />
            </tbody>
          </table>
        </div>
        <SummaryBlock state={draft} />
      </div>
    </div>
  );
}

function MaterialRow({
  row,
  displayNo,
  materialOptions,
  subCategories,
  onUpdate,
  onRemove,
  canRemove,
}: {
  row: MasterMaterialRow;
  displayNo: number;
  materialOptions: Record<string, string>;
  subCategories: Record<string, string[]>;
  onUpdate: (patch: Partial<MasterMaterialRow>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const subOpts = subCategories[row.one_materials_master] ?? [];
  const showOtherMaterial = row.one_materials_master === "other";
  const showOtherSub = row.sub_category === "Other";

  return (
    <tr className="text-center">
      <td className="sticky left-0 z-[1] border border-border bg-card px-2 py-1 font-medium">
        {displayNo}
      </td>
      <td className="sticky left-12 z-[1] border border-border bg-card px-1 py-1">
        <select
          className={selectClass}
          value={row.one_materials_master}
          onChange={(e) =>
            onUpdate({ one_materials_master: e.target.value, sub_category: "", other_sub_catg: "" })
          }
        >
          {Object.entries(materialOptions).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
        {showOtherMaterial ? (
          <input
            className={`${inputClass} mt-1`}
            placeholder="Specify other"
            value={row.other_material_input}
            onChange={(e) => onUpdate({ other_material_input: e.target.value })}
          />
        ) : null}
      </td>
      <td className="border border-border px-1 py-1">
        <select
          className={selectClass}
          value={row.sub_category}
          onChange={(e) => onUpdate({ sub_category: e.target.value })}
        >
          <option value="">Select</option>
          {subOpts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {showOtherSub ? (
          <input
            className={`${inputClass} mt-1`}
            placeholder="Specify other"
            value={row.other_sub_catg}
            onChange={(e) => onUpdate({ other_sub_catg: e.target.value })}
          />
        ) : null}
      </td>
      <NumCell value={row.quantity} onChange={(v) => onUpdate({ quantity: v })} />
      <td className="border border-border px-1 py-1">
        <input className={inputClass} value={row.unit} onChange={(e) => onUpdate({ unit: e.target.value })} />
      </td>
      <NumCell value={row.rates} onChange={(v) => onUpdate({ rates: v })} />
      <ReadCell value={row.total_rates} />
      <td className="border border-border px-1 py-1">
        <input
          className={inputClass}
          value={row.manufacture_details}
          onChange={(e) => onUpdate({ manufacture_details: e.target.value })}
        />
      </td>
      <td className="border border-border px-1 py-1">
        <input
          className={inputClass}
          value={row.manufacture_location}
          onChange={(e) => onUpdate({ manufacture_location: e.target.value })}
        />
      </td>
      <NumCell value={row.distance} onChange={(v) => onUpdate({ distance: v })} />
      <ReadCell value={row.total_cost_material} />
      <SelectCell value={row.salvaged} options={yesNoOptions} onChange={(v) => onUpdate({ salvaged: v })} />
      <ReadCell value={row.salvaged_cost} />
      <NumCell value={row.reuse_material} onChange={(v) => onUpdate({ reuse_material: v })} />
      <ReadCell value={row.reuse_cost} />
      <SelectCell value={row.ecolablled} options={yesNoOptions} onChange={(v) => onUpdate({ ecolablled: v })} />
      <ReadCell value={row.ecolablled_cost} />
      <NumCell value={row.recycled} onChange={(v) => onUpdate({ recycled: v })} />
      <ReadCell value={row.recycled_cost} />
      <NumCell value={row.woodbased_material} onChange={(v) => onUpdate({ woodbased_material: v })} />
      <NumCell value={row.composite_wood} onChange={(v) => onUpdate({ composite_wood: v })} />
      <ReadCell value={row.woodbased_cost_rapid} />
      <SelectCell
        value={row.alternative_material}
        options={yesNoOptions}
        onChange={(v) => onUpdate({ alternative_material: v })}
      />
      <ReadCell value={row.alternative_material_cost} />
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

function ReadCell({ value }: { value: string }) {
  return (
    <td className="border border-border px-1 py-1">
      <input readOnly className={readonlyClass} value={value} />
    </td>
  );
}

function SelectCell({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <td className="border border-border px-1 py-1">
      <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(options).map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </td>
  );
}

function TotalsRow({ state }: { state: MasterMaterialState }) {
  return (
    <tr className="bg-muted/30 font-medium text-center">
      <td className="sticky left-0 border border-border bg-muted/30 px-2 py-2" colSpan={6}>
        Totals
      </td>
      <ReadCell value={state.total_material_cost} />
      <td className="border border-border" colSpan={3} />
      <ReadCell value={state.total_procured_cost} />
      <td className="border border-border" />
      <ReadCell value={state.total_salvage_cost} />
      <td className="border border-border" />
      <ReadCell value={state.total_resued_cost} />
      <td className="border border-border" />
      <ReadCell value={state.total_ecolabled_cost} />
      <td className="border border-border" />
      <ReadCell value={state.total_recycled_cost} />
      <td className="border border-border" colSpan={2} />
      <ReadCell value={state.total_renewable_cost} />
      <td className="border border-border" />
      <ReadCell value={state.total_alternative_cost} />
      <td className="border border-border" />
    </tr>
  );
}

function SummaryBlock({ state }: { state: MasterMaterialState }) {
  const items: { label: string; value: string }[] = [
    { label: "Percentage of local material procured / used (%)", value: state.local_percent },
    { label: "Percentage of recycled content materials procured / used (%)", value: state.recycled_percent },
    { label: "Number of type 1 eco-Labelled products procured", value: state.ecolablled_products },
    {
      label: "Percentage of Eco-Labelled Construction Materials procured / used (%)",
      value: state.ecolablled_material_percent,
    },
    { label: "Percentage of Salvaged Materials procured / used (%)", value: state.salvage_percent },
    { label: "Percentage of Reused Materials procured / used (%)", value: state.reused_percent },
    {
      label: "Percentage of Eco Friendly Wood Based Materials procured / used (%)",
      value: state.wood_percent,
    },
    {
      label: "Percentage of eco-certified interior furniture procured (%)",
      value: state.alternate_material_percent,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {items.map((item) => (
            <tr key={item.label}>
              <td className="border border-border px-3 py-2 text-right">{item.label}</td>
              <td className="border border-border px-3 py-2 w-48">
                <input readOnly className={readonlyClass} value={item.value} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
