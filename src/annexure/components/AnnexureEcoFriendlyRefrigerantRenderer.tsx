import {
  computeEcoRefrigerantMulti,
  computeEcoRefrigerantSingle,
  ECO_REFRIGERANT_EMPTY_COLUMN,
  type EcoRefrigerantAnnexState,
  type EcoRefrigerantColumn,
} from "@/annexure/annexEcoFriendlyRefrigerantCalculations";
import {
  applyEquipmentSelection,
  applyRefrigerantSelection,
  buildSavePayloadFromEcoFriendlyRefrigerant,
  equipmentOptionsFromSchema,
  hydrateEcoFriendlyRefrigerantAnnex,
  refrigerantOptionsFromSchema,
} from "@/annexure/annexEcoFriendlyRefrigerantStorage";
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
const selectClass = inputClass;
const cellBorder = "border border-border px-2 py-1.5 text-sm";

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
  if (readOnly) return <input readOnly className={readonlyClass} value={value} />;
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

type FieldRow = {
  label: string;
  key: keyof EcoRefrigerantColumn | "cal_refrigerant" | "cal_credit";
  editable?: boolean;
  summary?: boolean;
};

const SINGLE_ROWS: FieldRow[] = [
  { label: "Refrigerant type", key: "refrig_type", editable: true },
  { label: "Equipment type", key: "equipment_type", editable: true },
  { label: "Capacity, tons (Qunit)", key: "cap_tons", editable: true },
  { label: "Refrigerant charge, lb", key: "reg_charge", editable: true },
  { label: "Refrigerant charge, lb/ton (Rc)", key: "reg_charge_ton" },
  { label: "Leak rate, % of charge per year (Lr)", key: "leak_rate" },
  { label: "Equipment life (Life)", key: "equipment_life" },
  { label: "End-of-life refrigerant loss, % of charge (Mr)", key: "end_loss" },
  { label: "Global Warming Potential of Refrigerant (GWPr)", key: "golbal_refri" },
  { label: "Ozone Depletion Potential of Refrigerant (ODPr)", key: "ozone_refri" },
  { label: "Life-cycle Direct Global Warming Potential (LCGWP)", key: "life_cycle_golbal_refri" },
  { label: "Life-cycle Ozone Depletion Potential (LCODP)", key: "life_cycle_ozone_refri" },
  { label: "TSAC Factor", key: "tsac_factor" },
  { label: "TSAC Factor × Capacity", key: "tsac_factor_cap" },
  {
    label: "Combined contributions to ozone depletion and global warming potential",
    key: "tsac_factor",
    summary: true,
  },
  { label: "Meets the requirement", key: "cal_credit", summary: true },
];

function SingleZoneTable({
  state,
  refrigerantOptions,
  equipmentOptions,
  onRefrigerantChange,
  onEquipmentChange,
  onFieldChange,
}: {
  state: EcoRefrigerantAnnexState["single"];
  refrigerantOptions: Record<string, { label: string }>;
  equipmentOptions: Record<string, { label: string }>;
  onRefrigerantChange: (slug: string) => void;
  onEquipmentChange: (slug: string) => void;
  onFieldChange: (key: keyof EcoRefrigerantColumn, value: string) => void;
}) {
  const summaryValue = (key: FieldRow["key"]) => {
    if (key === "cal_credit") return state.cal_credit;
    if (key === "tsac_factor_cap") return state.tsac_factor_cap2;
    return state[key as keyof EcoRefrigerantColumn] ?? "";
  };

  return (
    <table className="w-full min-w-[720px] border-collapse text-sm">
      <tbody>
        {SINGLE_ROWS.map((row) => (
          <tr key={row.label} className="border-b border-border">
            <td className={`${cellBorder} w-[42%] text-foreground`}>{row.label}</td>
            <td className={`${cellBorder} w-[33%]`}>
              {row.key === "refrig_type" ? (
                <select
                  className={selectClass}
                  value={state.refrig_type}
                  onChange={(e) => onRefrigerantChange(e.target.value)}
                >
                  <option value="">Select</option>
                  {Object.entries(refrigerantOptions).map(([slug, opt]) => (
                    <option key={slug} value={slug}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : row.key === "equipment_type" ? (
                <select
                  className={selectClass}
                  value={state.equipment_type}
                  onChange={(e) => onEquipmentChange(e.target.value)}
                >
                  <option value="">Select</option>
                  {Object.entries(equipmentOptions).map(([slug, opt]) => (
                    <option key={slug} value={slug}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : row.editable ? (
                <NumInput
                  value={state[row.key as keyof EcoRefrigerantColumn] ?? ""}
                  onChange={(v) => onFieldChange(row.key as keyof EcoRefrigerantColumn, v)}
                />
              ) : row.key === "cal_refrigerant" || row.key === "cal_credit" ? null : (
                <NumInput readOnly value={state[row.key as keyof EcoRefrigerantColumn] ?? ""} />
              )}
            </td>
            <td className={`${cellBorder} w-[25%] bg-muted/20`}>
              {row.summary ? (
                <span className="font-medium text-foreground">{summaryValue(row.key)}</span>
              ) : row.key === "cap_tons" ? (
                <NumInput readOnly value={state.cap_tons2} />
              ) : row.key === "tsac_factor_cap" ? (
                <NumInput readOnly value={state.tsac_factor_cap2} />
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MultiZoneTable({
  state,
  maxColumns,
  refrigerantOptions,
  equipmentOptions,
  onAddColumn,
  onRemoveColumn,
  onRefrigerantChange,
  onEquipmentChange,
  onFieldChange,
}: {
  state: EcoRefrigerantAnnexState["multi"];
  maxColumns: number;
  refrigerantOptions: Record<string, { label: string }>;
  equipmentOptions: Record<string, { label: string }>;
  onAddColumn: () => void;
  onRemoveColumn: (index: number) => void;
  onRefrigerantChange: (index: number, slug: string) => void;
  onEquipmentChange: (index: number, slug: string) => void;
  onFieldChange: (index: number, key: keyof EcoRefrigerantColumn, value: string) => void;
}) {
  const rowDefs: { label: string; key: keyof EcoRefrigerantColumn; editable?: boolean }[] = [
    { label: "Refrigerant type", key: "refrig_type", editable: true },
    { label: "Equipment type", key: "equipment_type", editable: true },
    { label: "Capacity, tons (Qunit)", key: "cap_tons", editable: true },
    { label: "Identical units", key: "identical_units", editable: true },
    { label: "Refrigerant charge, lb", key: "reg_charge", editable: true },
    { label: "Refrigerant charge, lb/ton (Rc)", key: "reg_charge_ton" },
    { label: "Leak rate, % (Lr)", key: "leak_rate" },
    { label: "Equipment life (Life)", key: "equipment_life" },
    { label: "End-of-life loss, % (Mr)", key: "end_loss" },
    { label: "GWPr", key: "golbal_refri" },
    { label: "ODPr", key: "ozone_refri" },
    { label: "LCGWP", key: "life_cycle_golbal_refri" },
    { label: "LCODP", key: "life_cycle_ozone_refri" },
    { label: "TSAC Factor", key: "tsac_factor" },
    { label: "TSAC Factor × Capacity", key: "tsac_factor_cap" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAddColumn}
          disabled={state.columns.length >= maxColumns}
          className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Column
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={`${cellBorder} bg-muted/30 text-left font-medium`}>Parameter</th>
              {state.columns.map((_, i) => (
                <th key={i} className={`${cellBorder} min-w-[140px] bg-muted/30 font-medium`}>
                  <div className="flex items-center justify-between gap-1">
                    <span>Unit {i + 1}</span>
                    {state.columns.length > 1 && (
                      <button type="button" onClick={() => onRemoveColumn(i)} className="text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowDefs.map((row) => (
              <tr key={row.key}>
                <td className={`${cellBorder} text-foreground`}>{row.label}</td>
                {state.columns.map((col, i) => (
                  <td key={i} className={cellBorder}>
                    {row.key === "refrig_type" ? (
                      <select
                        className={selectClass}
                        value={col.refrig_type}
                        onChange={(e) => onRefrigerantChange(i, e.target.value)}
                      >
                        <option value="">Select</option>
                        {Object.entries(refrigerantOptions).map(([slug, opt]) => (
                          <option key={slug} value={slug}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : row.key === "equipment_type" ? (
                      <select
                        className={selectClass}
                        value={col.equipment_type}
                        onChange={(e) => onEquipmentChange(i, e.target.value)}
                      >
                        <option value="">Select</option>
                        {Object.entries(equipmentOptions).map(([slug, opt]) => (
                          <option key={slug} value={slug}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : row.editable ? (
                      <NumInput
                        value={col[row.key]}
                        onChange={(v) => onFieldChange(i, row.key, v)}
                      />
                    ) : (
                      <NumInput readOnly value={col[row.key]} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className={`${cellBorder} font-medium`}>Q total (cap × charge)</td>
              <td className={cellBorder} colSpan={state.columns.length}>
                <NumInput readOnly value={state.qtotal_cap_tons} />
              </td>
            </tr>
            <tr>
              <td className={`${cellBorder} font-medium`}>TSAC factor total</td>
              <td className={cellBorder} colSpan={state.columns.length}>
                <NumInput readOnly value={state.tsac_factor_total} />
              </td>
            </tr>
            <tr>
              <td className={`${cellBorder} font-medium`}>Weighted refrigerant impact (cal_refrigerant)</td>
              <td className={cellBorder} colSpan={state.columns.length}>
                <NumInput readOnly value={state.cal_refrigerant} />
              </td>
            </tr>
            <tr>
              <td className={`${cellBorder} font-medium`}>Meets the requirement</td>
              <td className={cellBorder} colSpan={state.columns.length}>
                <input readOnly className={readonlyClass} value={state.cal_credit} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AnnexureEcoFriendlyRefrigerantRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.ecoFriendlyRefrigerantLayout!;
  const threshold = layout.complianceThreshold ?? 100;
  const maxColumns = layout.multiMaxColumns ?? 12;
  const refrigerantOptions = useMemo(() => refrigerantOptionsFromSchema(schema), [schema]);
  const equipmentOptions = useMemo(() => equipmentOptionsFromSchema(schema), [schema]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [activeTab, setActiveTab] = useState<"single" | "multi">("single");
  const [draft, setDraft] = useState<EcoRefrigerantAnnexState>(() =>
    hydrateEcoFriendlyRefrigerantAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateEcoFriendlyRefrigerantAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalcSingle = useCallback(
    (col: EcoRefrigerantColumn) => computeEcoRefrigerantSingle(col, threshold),
    [threshold],
  );

  const recalcMulti = useCallback(
    (multi: EcoRefrigerantAnnexState["multi"]) => computeEcoRefrigerantMulti(multi, threshold),
    [threshold],
  );

  const updateSingle = useCallback(
    (fn: (col: EcoRefrigerantColumn) => EcoRefrigerantColumn) => {
      setDraft((prev) => ({ ...prev, single: recalcSingle(fn(prev.single)) }));
    },
    [recalcSingle],
  );

  const updateMulti = useCallback(
    (fn: (multi: EcoRefrigerantAnnexState["multi"]) => EcoRefrigerantAnnexState["multi"]) => {
      setDraft((prev) => ({ ...prev, multi: recalcMulti(fn(prev.multi)) }));
    },
    [recalcMulti],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromEcoFriendlyRefrigerant(draft),
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
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`border-b-2 px-3 py-2 text-xs font-medium sm:text-sm ${
              activeTab === "single" ? "border-ocean text-ocean" : "border-transparent text-muted-foreground"
            }`}
          >
            {layout.singleTabLabel ?? "Single Zone System"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("multi")}
            className={`border-b-2 px-3 py-2 text-xs font-medium sm:text-sm ${
              activeTab === "multi" ? "border-ocean text-ocean" : "border-transparent text-muted-foreground"
            }`}
          >
            {layout.multipleTabLabel ?? "Multiple Zone System"}
          </button>
        </div>

        {activeTab === "single" ? (
          <SingleZoneTable
            state={draft.single}
            refrigerantOptions={refrigerantOptions}
            equipmentOptions={equipmentOptions}
            onRefrigerantChange={(slug) =>
              updateSingle((col) => applyRefrigerantSelection(col, slug, refrigerantOptions))
            }
            onEquipmentChange={(slug) =>
              updateSingle((col) => applyEquipmentSelection(col, slug, equipmentOptions))
            }
            onFieldChange={(key, value) => updateSingle((col) => ({ ...col, [key]: value }))}
          />
        ) : (
          <MultiZoneTable
            state={draft.multi}
            maxColumns={maxColumns}
            refrigerantOptions={refrigerantOptions}
            equipmentOptions={equipmentOptions}
            onAddColumn={() =>
              updateMulti((m) => ({
                ...m,
                columns: [...m.columns, { ...ECO_REFRIGERANT_EMPTY_COLUMN }],
              }))
            }
            onRemoveColumn={(index) =>
              updateMulti((m) => ({
                ...m,
                columns: m.columns.filter((_, i) => i !== index),
              }))
            }
            onRefrigerantChange={(index, slug) =>
              updateMulti((m) => ({
                ...m,
                columns: m.columns.map((col, i) =>
                  i === index ? applyRefrigerantSelection(col, slug, refrigerantOptions) : col,
                ),
              }))
            }
            onEquipmentChange={(index, slug) =>
              updateMulti((m) => ({
                ...m,
                columns: m.columns.map((col, i) =>
                  i === index ? applyEquipmentSelection(col, slug, equipmentOptions) : col,
                ),
              }))
            }
            onFieldChange={(index, key, value) =>
              updateMulti((m) => ({
                ...m,
                columns: m.columns.map((col, i) => (i === index ? { ...col, [key]: value } : col)),
              }))
            }
          />
        )}
      </div>
    </div>
  );
}
