import {
  CLIMATE_ZONE_LABELS,
  computeEemr2OfficeState,
  EEMR2_OFFICE_DEFAULT_ENERGY_ROW,
  EEMR2_OFFICE_DEFAULT_FLOOR_ROW,
  officeTypeRowIndex,
  visibleEpiTableKey,
  type Eemr2OfficeEpiLimitRow,
  type Eemr2OfficeState,
} from "@/annexure/annexEemr2OfficeCalculations";
import {
  buildSavePayloadFromEemr2Office,
  hydrateEemr2OfficeAnnex,
} from "@/annexure/annexEemr2OfficeStorage";
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

function EpiLimitsTable({
  title,
  zoneLabel,
  row,
}: {
  title: string;
  zoneLabel: string;
  row: Eemr2OfficeEpiLimitRow | null;
}) {
  if (!row) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-center text-sm font-bold">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th colSpan={6} className="border border-border bg-muted/30 px-3 py-2 text-left font-semibold">
                {zoneLabel}
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
    </div>
  );
}

export function AnnexureEemr2OfficeRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.eemr2OfficeLayout ?? {};
  const maxFloors = layout.maxFloorRows ?? 50;
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

  const [draft, setDraft] = useState<Eemr2OfficeState>(() =>
    hydrateEemr2OfficeAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateEemr2OfficeAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: Eemr2OfficeState) => Eemr2OfficeState) => {
    setDraft((prev) => computeEemr2OfficeState(fn(prev)));
  }, []);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromEemr2Office(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  const zoneLabel = CLIMATE_ZONE_LABELS[draft.cli_zone_annexone] ?? "";
  const officeRowIdx = officeTypeRowIndex(draft.office_space_type);
  const showEpiTables = Boolean(draft.cli_zone_annexone && draft.office_space_type && officeRowIdx >= 0);

  const uniformTableKey = visibleEpiTableKey(draft.cli_zone_annexone, true);
  const nonUniformTableKey = visibleEpiTableKey(draft.cli_zone_annexone, false);
  const uniformRow =
    showEpiTables && uniformTableKey ? draft.epiLimits[uniformTableKey][officeRowIdx] : null;
  const nonUniformRow =
    showEpiTables && nonUniformTableKey ? draft.epiLimits[nonUniformTableKey][officeRowIdx] : null;

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        {/* Summary fields */}
        <div className="overflow-x-auto">
          <table className="w-full max-w-xl border-collapse text-sm">
            <tbody>
              <tr>
                <td className="border border-border px-3 py-2">Total Built up Area (sq.m)</td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput
                    value={draft.total_built_up_area_annexone}
                    onChange={(v) => recalc((s) => ({ ...s, total_built_up_area_annexone: v }))}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-3 py-2">Total Air Conditioned Area (sq.m)</td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput
                    value={draft.total_air_cond_annexone}
                    onChange={(v) => recalc((s) => ({ ...s, total_air_cond_annexone: v }))}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-3 py-2">Percentage of Air Conditioned Area</td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput value={draft.percentage_air_condition_annexone} readOnly />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-3 py-2">Operational hours</td>
                <td className="border border-border px-2 py-1.5">
                  <NumInput
                    value={draft.op_hr_annexone}
                    onChange={(v) => recalc((s) => ({ ...s, op_hr_annexone: v }))}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Floor table */}
        <div className="space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-sm text-white hover:bg-ocean/90"
              onClick={() =>
                recalc((s) =>
                  s.floors.length >= maxFloors
                    ? s
                    : { ...s, floors: [...s.floors, { ...EEMR2_OFFICE_DEFAULT_FLOOR_ROW }] },
                )
              }
            >
              <Plus className="h-4 w-4" />
              Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="border border-border px-2 py-2">Serial No.</th>
                  <th className="border border-border px-2 py-2">Floor Number</th>
                  <th className="border border-border px-2 py-2">Operating hrs</th>
                  <th className="border border-border px-2 py-2">Working Days in a week</th>
                  <th className="border border-border px-2 py-2">Area (sq.m)</th>
                  <th className="border border-border px-2 py-2">Conditioned Area (sq.m)</th>
                  <th className="border border-border px-2 py-2">Percentage of AC Area</th>
                  <th className="border border-border px-2 py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {draft.floors.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-border px-2 py-1.5 text-center">{i + 1}</td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.floor_no}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            floors: s.floors.map((r, idx) => (idx === i ? { ...r, floor_no: v } : r)),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.opera_hr}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            floors: s.floors.map((r, idx) => (idx === i ? { ...r, opera_hr: v } : r)),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.days_op_hr}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            floors: s.floors.map((r, idx) => (idx === i ? { ...r, days_op_hr: v } : r)),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.area_sqm}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            floors: s.floors.map((r, idx) => (idx === i ? { ...r, area_sqm: v } : r)),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput
                        value={row.cond_area}
                        onChange={(v) =>
                          recalc((s) => ({
                            ...s,
                            floors: s.floors.map((r, idx) => (idx === i ? { ...r, cond_area: v } : r)),
                          }))
                        }
                      />
                    </td>
                    <td className="border border-border px-2 py-1.5">
                      <NumInput value={row.percentage_air_cond} readOnly />
                    </td>
                    <td className="border border-border px-1 py-1.5 text-center">
                      <button
                        type="button"
                        className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                        disabled={draft.floors.length <= 1}
                        onClick={() =>
                          recalc((s) =>
                            s.floors.length <= 1
                              ? s
                              : { ...s, floors: s.floors.filter((_, idx) => idx !== i) },
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
                  <th colSpan={6} className="border border-border px-3 py-2 text-right font-medium">
                    Weighted Average Percentage AC Area
                  </th>
                  <td className="border border-border px-2 py-1.5" colSpan={2}>
                    <NumInput value={draft.percentage_ac_area} readOnly />
                  </td>
                </tr>
                <tr>
                  <th colSpan={6} className="border border-border px-3 py-2 text-right font-medium">
                    Correction Factor
                  </th>
                  <td className="border border-border px-2 py-1.5" colSpan={2}>
                    <NumInput value={draft.correction_factor} readOnly />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Climate / office selection */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Climate Zone</label>
            <select
              className={selectClass}
              value={draft.cli_zone_annexone}
              onChange={(e) => recalc((s) => ({ ...s, cli_zone_annexone: e.target.value }))}
            >
              <option value="">Select Climatic Zone</option>
              <option value="Composite">Composite</option>
              <option value="hot_dry">Hot and Dry</option>
              <option value="warm_humid">Warm and Humid</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Climate Zone</label>
            <select
              className={selectClass}
              value={draft.office_space_type}
              onChange={(e) => recalc((s) => ({ ...s, office_space_type: e.target.value }))}
            >
              <option value="">Select</option>
              <option value="large">Large</option>
              <option value="middle">Middle</option>
              <option value="small">Small</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Selection</label>
            <select
              className={selectClass}
              value={draft.cli_zone_annexone_value}
              onChange={(e) => recalc((s) => ({ ...s, cli_zone_annexone_value: e.target.value }))}
            >
              <option value="">Select</option>
              <option value=">30,000">&gt;30,000</option>
              <option value="10,000-30,000">10,000-30,000</option>
              <option value="<10000">Greater than 10000</option>
            </select>
          </div>
        </div>

        {/* EPI limit tables */}
        {showEpiTables ? (
          <div className="space-y-6">
            <EpiLimitsTable
              title="Uniform Air conditioned EPI Limits"
              zoneLabel={zoneLabel}
              row={uniformRow}
            />
            <EpiLimitsTable
              title="Non-Uniform Air conditioned EPI Limits"
              zoneLabel={zoneLabel}
              row={nonUniformRow}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select Climate Zone and office type to view EPI limit tables.
          </p>
        )}

        {/* Energy consumption table */}
        <div className="space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-sm text-white hover:bg-ocean/90"
              onClick={() =>
                recalc((s) =>
                  s.energyRows.length >= maxEnergy
                    ? s
                    : { ...s, energyRows: [...s.energyRows, { ...EEMR2_OFFICE_DEFAULT_ENERGY_ROW }] },
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
                    <NumInput value={draft.total_existing_energy_consumption_annexone} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5">
                    <NumInput value={draft.existing_total_onoffsite_annexone} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5">
                    <NumInput value={draft.existing_total_onsite_renewable_annexone} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5">
                    <NumInput value={draft.existing_total_offsite_renewable_annexone} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5">
                    <NumInput value={draft.existing_total_energy_annexone} readOnly />
                  </td>
                  <td className="border border-border px-2 py-1.5" colSpan={2}>
                    <NumInput value={draft.existing_total_renewable_wheeling_annexone} readOnly />
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="border border-border px-3 py-2 font-medium">
                    Uniform Air conditioned EPI
                  </td>
                  <td className="border border-border px-2 py-1.5" colSpan={3}>
                    <NumInput value={draft.percentage_existing_energy_consumption_annexone} readOnly />
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="border border-border px-3 py-2 font-medium">
                    Non-Uniform Air conditioned EPI
                  </td>
                  <td className="border border-border px-2 py-1.5" colSpan={3}>
                    <NumInput value={draft.non_uniform_air_conditioned} readOnly />
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
