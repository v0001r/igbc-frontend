import {
  climateZoneRowIndex,
  computeEpiCalculationState,
  EPI_CALCULATION_DEFAULT_ENERGY_ROW,
  type EpiCalculationLimitRow,
  type EpiCalculationState,
} from "@/annexure/annexEpiCalculationCalculations";
import {
  buildSavePayloadFromEpiCalculation,
  hydrateEpiCalculationAnnex,
} from "@/annexure/annexEpiCalculationStorage";
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
const selectClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";

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

function EpiLimitsTable({ row }: { row: EpiCalculationLimitRow | null }) {
  if (!row) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th colSpan={6} className="border border-border bg-muted/30 px-3 py-2 text-left font-semibold">
              Uniform Air conditioned AAhEPI Limits
            </th>
          </tr>
          <tr className="bg-muted/20">
            <th className="border border-border px-3 py-2 text-left font-medium">Climatic Zone</th>
            <th className="border border-border px-3 py-2 text-left font-medium">Mandatory</th>
            <th className="border border-border px-3 py-2 text-left font-medium">4 Credit Points</th>
            <th className="border border-border px-3 py-2 text-left font-medium">6 Credit Points</th>
            <th className="border border-border px-3 py-2 text-left font-medium">10 Credit Points</th>
            <th className="border border-border px-3 py-2 text-left font-medium">14 Credit Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={row.bpo} readOnly />
            </td>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={row.mandatory} readOnly />
            </td>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={row.cp4} readOnly />
            </td>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={row.cp6} readOnly />
            </td>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={row.cp10} readOnly />
            </td>
            <td className="border border-border px-2 py-1.5">
              <NumInput value={row.cp14} readOnly />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function AnnexureEpiCalculationRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.epiCalculationLayout ?? {};
  const maxEnergy = layout.maxEnergyRows ?? 50;

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<EpiCalculationState>(() =>
    hydrateEpiCalculationAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateEpiCalculationAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: EpiCalculationState) => EpiCalculationState) => {
    setDraft((prev) => computeEpiCalculationState(fn(prev)));
  }, []);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromEpiCalculation(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  const zoneRowIdx = climateZoneRowIndex(draft.cli_zone);
  const visibleEpiRow = zoneRowIdx >= 0 ? draft.epiLimits[zoneRowIdx] : null;

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full max-w-xl border-collapse text-sm">
            <tbody>
              <tr>
                <td className="border border-border px-3 py-2">Total Built up Area (sq.m)</td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput
                    value={draft.total_built_up_area}
                    onChange={(v) => recalc((s) => ({ ...s, total_built_up_area: v }))}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-3 py-2">Total Air Conditioned Area (sq.m)</td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput
                    value={draft.total_air_cond}
                    onChange={(v) => recalc((s) => ({ ...s, total_air_cond: v }))}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-3 py-2">Percentage of Air Conditioned Area</td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput value={draft.percentage_air_cond} readOnly />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-3 py-2">Operational hours</td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput value={draft.op_hr} onChange={(v) => recalc((s) => ({ ...s, op_hr: v }))} />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-3 py-2">Days of Operation in a week</td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput value={draft.day_hr} onChange={(v) => recalc((s) => ({ ...s, day_hr: v }))} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="max-w-md">
          <label className="mb-1 block text-sm font-medium">Climate Zone</label>
          <select
            className={selectClass}
            value={draft.cli_zone}
            onChange={(e) => recalc((s) => ({ ...s, cli_zone: e.target.value }))}
          >
            <option value="">Select Climatic Zone</option>
            <option value="composition">Composition</option>
            <option value="hot_dry">Hot and Dry</option>
            <option value="warm_humid">Warm and Humid</option>
            <option value="temperate">Temperate</option>
          </select>
        </div>

        {visibleEpiRow ? (
          <EpiLimitsTable row={visibleEpiRow} />
        ) : (
          <p className="text-sm text-muted-foreground">Select a climate zone to view AAhEPI limits.</p>
        )}

        <div className="space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-sm text-white hover:bg-ocean/90"
              onClick={() =>
                recalc((s) =>
                  s.energyRows.length >= maxEnergy
                    ? s
                    : { ...s, energyRows: [...s.energyRows, { ...EPI_CALCULATION_DEFAULT_ENERGY_ROW }] },
                )
              }
            >
              <Plus className="h-4 w-4" />
              Add More
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/30 text-center">
                  <th className="border border-border px-2 py-2">S.No</th>
                  <th className="border border-border px-2 py-2">Month</th>
                  <th className="border border-border px-2 py-2">
                    Electricity Grid (From energy bills excluding offsite wheeling) (kWh)
                  </th>
                  <th className="border border-border px-2 py-2">
                    Renewable Energy Consumption- Offsite (kWh)
                  </th>
                  <th className="border border-border px-2 py-2">DG Set (kWh)</th>
                  <th className="border border-border px-2 py-2">If Any Energy source (kWh)</th>
                  <th className="border border-border px-2 py-2">Total Energy Consumption (kWh)</th>
                  <th className="border border-border px-2 py-2">
                    Renewable Energy Wheeling- Offsite (kWh)
                  </th>
                  <th className="border border-border px-2 py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {draft.energyRows.map((row, i) => (
                  <tr key={i} className="text-center">
                    <td className="border border-border px-2 py-1.5">{i + 1}</td>
                    <td className="border border-border px-2 py-1.5">
                      <input
                        type="month"
                        className={inputClass}
                        value={row.month}
                        onChange={(e) =>
                          recalc((s) => ({
                            ...s,
                            energyRows: s.energyRows.map((r, idx) =>
                              idx === i ? { ...r, month: e.target.value } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.existing_energy_consumption}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            energyRows: s.energyRows.map((r, idx) =>
                              idx === i ? { ...r, existing_energy_consumption: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.existing_onoff_site}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            energyRows: s.energyRows.map((r, idx) =>
                              idx === i ? { ...r, existing_onoff_site: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.existing_on_site_renewable}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            energyRows: s.energyRows.map((r, idx) =>
                              idx === i ? { ...r, existing_on_site_renewable: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.existing_off_site_renewable}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            energyRows: s.energyRows.map((r, idx) =>
                              idx === i ? { ...r, existing_off_site_renewable: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput value={row.existing_total_consumption} readOnly />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.existing_renewable_wheeling}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            energyRows: s.energyRows.map((r, idx) =>
                              idx === i ? { ...r, existing_renewable_wheeling: v } : r,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-1 py-1.5">
                      <button
                        type="button"
                        className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                        disabled={draft.energyRows.length <= 1}
                        onClick={() =>
                          recalc((s) =>
                            s.energyRows.length <= 1
                              ? s
                              : { ...s, energyRows: s.energyRows.filter((_, idx) => idx !== i) },
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="border border-border px-3 py-2 font-medium">
                    Total
                  </td>
                  <td className="border border-border px-2 py-1.5">
                    <NumInput value={draft.total_existing_energy_consumption} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5">
                    <NumInput value={draft.existing_total_onoffsite} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5">
                    <NumInput value={draft.existing_total_onsite_renewable} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5">
                    <NumInput value={draft.existing_total_offsite_renewable} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5">
                    <NumInput value={draft.existing_total_energy} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5" colSpan={2}>
                    <NumInput value={draft.existing_total_renewable_wheeling} readOnly />
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="border border-border px-3 py-2 font-medium">
                    EPI Calculation
                  </td>
                  <td className="border border-border px-2 py-1.5" colSpan={3}>
                    <NumInput value={draft.percentage_existing_energy_consumption} readOnly />
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="border border-border px-3 py-2 font-medium">
                    AAhEPI Calculation (%)
                  </td>
                  <td className="border border-border px-2 py-1.5" colSpan={3}>
                    <NumInput value={draft.percentage_epi_cal} readOnly />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
