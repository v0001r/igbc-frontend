import {
  computeExistingOneSiteRenewableState,
  EXISTING_GRID_DEFAULT_ROW,
  EXISTING_OFFSITE_DEFAULT_ROW,
  EXISTING_ONSITE_DEFAULT_ROW,
  type ExistingOneSiteRenewableState,
} from "@/annexure/annexExistingOneSiteRenewableCalculations";
import {
  buildSavePayloadFromExistingOneSiteRenewable,
  hydrateExistingOneSiteRenewableAnnex,
} from "@/annexure/annexExistingOneSiteRenewableStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MutableRefObject } from "react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";
const cellBorder = "border border-border";

type TabKey = "onsite" | "offsite" | "grid";

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

export function AnnexureExistingOneSiteRenewableRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.existingOneSiteRenewableLayout ?? {};
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

  const [activeTab, setActiveTab] = useState<TabKey>("onsite");
  const [draft, setDraft] = useState<ExistingOneSiteRenewableState>(() =>
    hydrateExistingOneSiteRenewableAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateExistingOneSiteRenewableAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback(
    (fn: (s: ExistingOneSiteRenewableState) => ExistingOneSiteRenewableState) => {
      setDraft((prev) => computeExistingOneSiteRenewableState(fn(prev)));
    },
    [],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromExistingOneSiteRenewable(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "onsite", label: "Onsite Renewable Energy" },
    { key: "offsite", label: "Offsite Renewable Energy" },
    {
      key: "grid",
      label: "Electricity Grid (including offsite wheeling & excluding Onsite Consumption)",
    },
  ];

  const canAddOnsite = draft.onsiteRows.length < maxRows;
  const canAddOffsite = draft.offsiteRows.length < maxRows;
  const canAddGrid = draft.gridRows.length < maxRows;

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                activeTab === t.key
                  ? "border-b-2 border-ocean text-ocean"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "onsite" && (
          <EnergyTab
            addLabel={addRowLabel}
            canAdd={canAddOnsite}
            onAdd={() =>
              recalc((s) => ({
                ...s,
                onsiteRows: [...s.onsiteRows, { ...EXISTING_ONSITE_DEFAULT_ROW }],
              }))
            }
          >
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60 text-center text-xs font-semibold text-muted-foreground">
                  <th className={`${cellBorder} px-2 py-2 w-12`}>S.No</th>
                  <th className={`${cellBorder} px-2 py-2 min-w-[140px]`}>Month</th>
                  <th className={`${cellBorder} px-2 py-2`}>
                    Electricity Grid (excluding Onsite Consumption)
                  </th>
                  <th className={`${cellBorder} px-2 py-2`}>DG Set (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>If Any Energy source (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>Total Energy Consumption (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>Renewable Energy - Onsite (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {draft.onsiteRows.map((row, idx) => (
                  <tr key={idx} className="text-center">
                    <td className={`${cellBorder} px-2 py-1 font-medium`}>{idx + 1}</td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <input
                        type="month"
                        className={inputClass}
                        value={row.month}
                        onChange={(e) =>
                          recalc((s) => ({
                            ...s,
                            onsiteRows: s.onsiteRows.map((r, i) =>
                              i === idx ? { ...r, month: e.target.value } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.grid}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            onsiteRows: s.onsiteRows.map((r, i) =>
                              i === idx ? { ...r, grid: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.dg}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            onsiteRows: s.onsiteRows.map((r, i) =>
                              i === idx ? { ...r, dg: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.other}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            onsiteRows: s.onsiteRows.map((r, i) =>
                              i === idx ? { ...r, other: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput value={row.total} readOnly />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.renewableOnsite}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            onsiteRows: s.onsiteRows.map((r, i) =>
                              i === idx ? { ...r, renewableOnsite: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-medium text-center">
                  <td className={`${cellBorder} px-2 py-2`} colSpan={2}>
                    Total
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.total_existing_energy_consumption} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_onsite_renewable} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_offsite_renewable} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_energy} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_renewable_wheeling} readOnly />
                  </td>
                </tr>
                <tr className="text-center">
                  <td className={`${cellBorder} px-2 py-2 text-left`} colSpan={6}>
                    Percentage of energy consumption met through on-site renewable energy (%)
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.percentage_existing_energy_consumption} readOnly />
                  </td>
                </tr>
              </tbody>
            </table>
          </EnergyTab>
        )}

        {activeTab === "offsite" && (
          <EnergyTab
            addLabel={addRowLabel}
            canAdd={canAddOffsite}
            onAdd={() =>
              recalc((s) => ({
                ...s,
                offsiteRows: [...s.offsiteRows, { ...EXISTING_OFFSITE_DEFAULT_ROW }],
              }))
            }
          >
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60 text-center text-xs font-semibold text-muted-foreground">
                  <th className={`${cellBorder} px-2 py-2 w-12`}>S.No</th>
                  <th className={`${cellBorder} px-2 py-2 min-w-[140px]`}>Month</th>
                  <th className={`${cellBorder} px-2 py-2`}>
                    Electricity Grid (From energy bills excluding offsite) (kWh)
                  </th>
                  <th className={`${cellBorder} px-2 py-2`}>DG Set (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>If Any Energy source (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>Total Energy Consumption (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>
                    Renewable Energy Wheeling - Offsite (kWh)
                  </th>
                </tr>
              </thead>
              <tbody>
                {draft.offsiteRows.map((row, idx) => (
                  <tr key={idx} className="text-center">
                    <td className={`${cellBorder} px-2 py-1 font-medium`}>{idx + 1}</td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <input
                        type="month"
                        className={inputClass}
                        value={row.month}
                        onChange={(e) =>
                          recalc((s) => ({
                            ...s,
                            offsiteRows: s.offsiteRows.map((r, i) =>
                              i === idx ? { ...r, month: e.target.value } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.grid}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            offsiteRows: s.offsiteRows.map((r, i) =>
                              i === idx ? { ...r, grid: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.dg}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            offsiteRows: s.offsiteRows.map((r, i) =>
                              i === idx ? { ...r, dg: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.other}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            offsiteRows: s.offsiteRows.map((r, i) =>
                              i === idx ? { ...r, other: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput value={row.total} readOnly />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.wheelingOffsite}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            offsiteRows: s.offsiteRows.map((r, i) =>
                              i === idx ? { ...r, wheelingOffsite: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-medium text-center">
                  <td className={`${cellBorder} px-2 py-2`} colSpan={2}>
                    Total
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.total_existing_energy_consumption_offsite} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_onsite_renewable_offsite} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_offsite_renewable_offsite} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_energy_offsite} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_renewable_wheeling_offsite} readOnly />
                  </td>
                </tr>
                <tr className="text-center">
                  <td className={`${cellBorder} px-2 py-2 text-left`} colSpan={6}>
                    Percentage of energy consumption met through off-site renewable energy (%)
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput
                      value={draft.percentage_existing_energy_consumption_offsite}
                      readOnly
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </EnergyTab>
        )}

        {activeTab === "grid" && (
          <EnergyTab
            addLabel={addRowLabel}
            canAdd={canAddGrid}
            onAdd={() =>
              recalc((s) => ({
                ...s,
                gridRows: [...s.gridRows, { ...EXISTING_GRID_DEFAULT_ROW }],
              }))
            }
          >
            <table className="w-full min-w-[1300px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60 text-center text-xs font-semibold text-muted-foreground">
                  <th className={`${cellBorder} px-2 py-2 w-12`}>S.No</th>
                  <th className={`${cellBorder} px-2 py-2 min-w-[140px]`}>Month</th>
                  <th className={`${cellBorder} px-2 py-2`}>
                    Electricity Grid (From energy bills excluding offsite wheeling) (kWh)
                  </th>
                  <th className={`${cellBorder} px-2 py-2`}>DG Set (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>If Any Energy source (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>Total Energy Consumption (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>Renewable Energy - Onsite (kWh)</th>
                  <th className={`${cellBorder} px-2 py-2`}>
                    Renewable Energy Wheeling- Offsite (kWh)
                  </th>
                  <th className={`${cellBorder} px-2 py-2`}>Total Green Power (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {draft.gridRows.map((row, idx) => (
                  <tr key={idx} className="text-center">
                    <td className={`${cellBorder} px-2 py-1 font-medium`}>{idx + 1}</td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <input
                        type="month"
                        className={inputClass}
                        value={row.month}
                        onChange={(e) =>
                          recalc((s) => ({
                            ...s,
                            gridRows: s.gridRows.map((r, i) =>
                              i === idx ? { ...r, month: e.target.value } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.grid}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            gridRows: s.gridRows.map((r, i) =>
                              i === idx ? { ...r, grid: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.dg}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            gridRows: s.gridRows.map((r, i) =>
                              i === idx ? { ...r, dg: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.other}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            gridRows: s.gridRows.map((r, i) =>
                              i === idx ? { ...r, other: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput value={row.total} readOnly />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.renewableOnsite}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            gridRows: s.gridRows.map((r, i) =>
                              i === idx ? { ...r, renewableOnsite: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput
                        value={row.wheelingOffsite}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            gridRows: s.gridRows.map((r, i) =>
                              i === idx ? { ...r, wheelingOffsite: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={`${cellBorder} px-2 py-1`}>
                      <NumInput value={row.green} readOnly />
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-medium text-center">
                  <td className={`${cellBorder} px-2 py-2`} colSpan={2}>
                    Total
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.total_existing_energy_consumption_off_set} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_onsite_renewable_off_set} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_offsite_renewable_off_set} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_energy_off_set} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_on_site} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_renewable_wheeling_off_set} readOnly />
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput value={draft.existing_total_green} readOnly />
                  </td>
                </tr>
                <tr className="text-center">
                  <td className={`${cellBorder} px-2 py-2 text-left`} colSpan={8}>
                    Percentage of energy consumption met through Total (Onsite+ Offsite) renewable
                    energy (%)
                  </td>
                  <td className={`${cellBorder} px-2 py-2`}>
                    <NumInput
                      value={draft.percentage_existing_energy_consumption_off_set}
                      readOnly
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </EnergyTab>
        )}
      </div>
    </div>
  );
}

function EnergyTab({
  children,
  addLabel,
  canAdd,
  onAdd,
}: {
  children: ReactNode;
  addLabel: string;
  canAdd: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canAdd}
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean/90 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
