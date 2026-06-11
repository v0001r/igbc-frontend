import {
  computeUrbanHeatRoofState,
  type UrbanHeatRoofState,
} from "@/annexure/annexUrbanHeatRoofCalculations";
import {
  buildSavePayloadFromUrbanHeatRoof,
  hydrateUrbanHeatRoofAnnex,
} from "@/annexure/annexUrbanHeatRoofStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
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

function NumInput({
  value,
  onChange,
  readOnly,
  step = "0.01",
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  step?: string;
}) {
  if (readOnly) {
    return <input readOnly className={readonlyClass} value={value} />;
  }
  return (
    <input
      type="number"
      step={step}
      className={inputClass}
      value={value}
      onChange={(e) => onChange?.(clampDecimal(e.target.value))}
    />
  );
}

function MitigationRow({
  label,
  areaParam,
  factorParam,
  treatedParam,
  state,
  onChange,
}: {
  label: string;
  areaParam: keyof UrbanHeatRoofState;
  factorParam: keyof UrbanHeatRoofState;
  treatedParam: keyof UrbanHeatRoofState;
  state: UrbanHeatRoofState;
  onChange: (param: keyof UrbanHeatRoofState, value: string) => void;
}) {
  return (
    <tr>
      <td className="border border-border px-3 py-2 text-right">{label}</td>
      <td className="border border-border px-2 py-1.5">
        <NumInput value={state[areaParam]} onChange={(v) => onChange(areaParam, v)} />
      </td>
      <td className="border border-border px-2 py-1.5">
        <NumInput value={state[factorParam]} readOnly step="0.1" />
      </td>
      <td className="border border-border px-2 py-1.5">
        <NumInput value={state[treatedParam]} readOnly step="0.1" />
      </td>
    </tr>
  );
}

function ScalarRow({
  label,
  param,
  state,
  onChange,
  readOnly,
  header,
}: {
  label: string;
  param: keyof UrbanHeatRoofState;
  state: UrbanHeatRoofState;
  onChange?: (param: keyof UrbanHeatRoofState, value: string) => void;
  readOnly?: boolean;
  header?: boolean;
}) {
  const LabelCell = header ? "th" : "td";
  return (
    <tr>
      <LabelCell
        className={`border border-border px-3 py-2 ${header ? "bg-muted/40 text-center font-semibold" : "text-right"}`}
        colSpan={header ? 2 : 1}
      >
        {label}
      </LabelCell>
      {!header ? (
        <td className="border border-border px-2 py-1.5" colSpan={3}>
          <NumInput
            value={state[param]}
            readOnly={readOnly}
            onChange={onChange ? (v) => onChange(param, v) : undefined}
          />
        </td>
      ) : null}
    </tr>
  );
}

export function AnnexureUrbanHeatRoofRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<UrbanHeatRoofState>(() =>
    hydrateUrbanHeatRoofAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateUrbanHeatRoofAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: UrbanHeatRoofState) => UrbanHeatRoofState) => {
    setDraft((prev) => computeUrbanHeatRoofState(fn(prev)));
  }, []);

  const onChange = useCallback(
    (param: keyof UrbanHeatRoofState, value: string) => {
      recalc((s) => ({ ...s, [param]: value }));
    },
    [recalc],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromUrbanHeatRoof(draft),
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-amber-100/80 text-center">
                <th colSpan={4} className="border border-border px-3 py-2 font-semibold">
                  Urban Heat Island Mitigation: Exposed Roof Area (All calculations in sq.m.)
                </th>
              </tr>
              <tr>
                <th className="border border-border px-3 py-2 text-right font-medium">
                  Total Roof Area on Built Structure
                </th>
                <td className="border border-border px-2 py-1.5" colSpan={3}>
                  <NumInput
                    value={draft.working_days}
                    onChange={(v) => onChange("working_days", v)}
                    step="0.1"
                  />
                </td>
              </tr>
            </thead>
            <tbody>
              <ScalarRow
                label="Roof area covered with utilities/ solar PV (exempted)"
                param="roof_area"
                state={draft}
                onChange={onChange}
              />
              <ScalarRow
                label="Net exposed roof areas"
                param="exposed_ex"
                state={draft}
                readOnly
              />

              <tr>
                <td className="border border-border px-3 py-2 text-right font-medium">
                  Mitigation Measures for Built Structure
                </td>
                <td className="border border-border" />
                <td className="border border-border px-3 py-2 text-center font-medium">Area Factor</td>
                <td className="border border-border px-3 py-2 text-center font-medium">Treated Roof Area</td>
              </tr>
              <MitigationRow
                label="Roof area covered with SRI Coating"
                areaParam="non_value"
                factorParam="covered_sri"
                treatedParam="treated_roof_area"
                state={draft}
                onChange={onChange}
              />
              <MitigationRow
                label="Roof area covered with High SRI Tiles"
                areaParam="non_value_covered"
                factorParam="covered_sri_high"
                treatedParam="treated_roof_high"
                state={draft}
                onChange={onChange}
              />
              <MitigationRow
                label="Roof area covered with Vegetation"
                areaParam="non_value_vegetation"
                factorParam="covered_vegetation"
                treatedParam="vegetation_roof"
                state={draft}
                onChange={onChange}
              />
              <ScalarRow
                label="Total Treated Roof Area on Built Structure (Terrace area)"
                param="terrace_built"
                state={draft}
                readOnly
              />

              <ScalarRow
                label="Total exposed roof area on Basement & Podium"
                param="basement_podium"
                state={draft}
                onChange={onChange}
              />
              <ScalarRow
                label="Area covered with water body, driveways, pathways, roads, utilities, play areas etc., (exempted)"
                param="play_area_pathways"
                state={draft}
                onChange={onChange}
              />
              <ScalarRow
                label="Net exposed roof areas including exposed area on basement & podium"
                param="including_area"
                state={draft}
                readOnly
              />

              <tr>
                <td className="border border-border px-3 py-2 text-right font-medium">
                  Mitigation Measures for Basement & Podium
                </td>
                <td className="border border-border" />
                <td className="border border-border px-3 py-2 text-center font-medium">Area Factor</td>
                <td className="border border-border px-3 py-2 text-center font-medium">Treated Roof Area</td>
              </tr>
              <MitigationRow
                label="Roof area covered with SRI Coating"
                areaParam="non_value_mitigation"
                factorParam="mitigation_roof"
                treatedParam="mitigation_treated"
                state={draft}
                onChange={onChange}
              />
              <MitigationRow
                label="Roof area covered with High SRI Tiles"
                areaParam="non_value_covered_sri"
                factorParam="mitigation_high"
                treatedParam="mitigation_tiles"
                state={draft}
                onChange={onChange}
              />
              <MitigationRow
                label="Roof area covered with Vegetation"
                areaParam="non_value_roof"
                factorParam="area_roof_vegetation"
                treatedParam="covered_tiles"
                state={draft}
                onChange={onChange}
              />

              <tr>
                <th className="border border-border px-3 py-2 text-right font-medium">
                  Total Treated Roof Area on Basement & Podium
                </th>
                <th className="border border-border px-2 py-1.5" colSpan={3}>
                  <NumInput value={draft.roof_area_total} readOnly />
                </th>
              </tr>
              <tr>
                <th className="border border-border px-3 py-2 text-right font-medium">
                  Total Treated Roof Area including Built Structure, Basement & Podium
                </th>
                <th className="border border-border px-2 py-1.5" colSpan={3}>
                  <NumInput value={draft.buil_structure} readOnly />
                </th>
              </tr>

              <ScalarRow label="Total Net exposed Roof Area" param="roof_net_area" state={draft} readOnly />
              <ScalarRow
                label="Percentage of treated roof area to the total roof area"
                param="area_treated_percentage"
                state={draft}
                readOnly
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
