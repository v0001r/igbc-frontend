import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import { buildSavePayloadFromAnnex, hydrateScalarsFromForm, runAnnexureCalculations } from "@/annexure/annexureCalculationEngine";
import { hydrateRowsWithSourceAnnex, sourceAnnexSignature } from "@/annexure/annexureSourceHydrate";
import {
  buildSavePayloadFromVentilationSummary,
  hydrateVentilationSummaryRows,
  ventilationSummarySignature,
} from "@/annexure/annexureVentilationSummaryHydrate";
import type { RowRecord } from "@/annexure/annexureExprEval";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { DynamicTable } from "@/annexure/components/DynamicTable";
import { SummarySection } from "@/annexure/components/SummarySection";
import { AnnexureReferenceView } from "@/annexure/components/AnnexureReferenceView";
import { AnnexureComparisonTable } from "@/annexure/components/AnnexureComparisonTable";
import { AnnexureDwellingRenderer } from "@/annexure/components/AnnexureDwellingRenderer";
import { AnnexureRainwaterRenderer } from "@/annexure/components/AnnexureRainwaterRenderer";
import { AnnexureWaterEfficiencyRenderer } from "@/annexure/components/AnnexureWaterEfficiencyRenderer";
import { AnnexureWaterBalanceRenderer } from "@/annexure/components/AnnexureWaterBalanceRenderer";
import { AnnexureWastewaterReuseRenderer } from "@/annexure/components/AnnexureWastewaterReuseRenderer";
import {
  buildSavePayloadFromComparison,
  getComparisonLayout,
  hydrateComparisonFromForm,
} from "@/annexure/annexureComparisonStorage";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";

export type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
  ratingKey?: string;
  versionType?: string;
  ratingTypeId: number;
  formState: CertificationFormResponse;
  sectionValues: Record<string, string>;
  globalExtras?: Record<string, string>;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function emptyRow(schema: AnnexureSchemaDefinition): RowRecord {
  const r: RowRecord = {};
  for (const c of schema.table?.columns ?? []) {
    if (c.computed) continue;
    r[c.param] = "";
  }
  return r;
}

export function AnnexureRenderer(props: Props) {
  if (props.schema.renderMode === "comparison") {
    return <AnnexureComparisonRenderer {...props} />;
  }
  if (props.schema.renderMode === "dwelling") {
    return <AnnexureDwellingRenderer {...props} />;
  }
  if (props.schema.renderMode === "rainwater") {
    return <AnnexureRainwaterRenderer {...props} />;
  }
  if (props.schema.renderMode === "waterEfficiency") {
    return <AnnexureWaterEfficiencyRenderer {...props} />;
  }
  if (props.schema.renderMode === "waterBalance") {
    return <AnnexureWaterBalanceRenderer {...props} />;
  }
  if (props.schema.renderMode === "wastewaterReuse") {
    return <AnnexureWastewaterReuseRenderer {...props} />;
  }
  if (props.schema.renderMode === "reference") {
    return (
      <AnnexureReferenceView
        schema={props.schema}
        ratingTypeId={props.ratingTypeId}
        saveHandleRef={props.saveHandleRef}
        ratingKey={props.ratingKey}
        versionType={props.versionType}
        tab={props.tab}
        subtab={props.subtab}
      />
    );
  }
  return <AnnexureTableRenderer {...props} />;
}

function AnnexureComparisonRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = useMemo(() => getComparisonLayout(schema), [schema]);

  const getParam = useCallback(
    (param: string) =>
      (formState.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value ??
      undefined,
    [formState.data, tab, subtab],
  );

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value])
          .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
      ),
    [formState.data, tab, subtab],
  );

  const [values, setValues] = useState(() => hydrateComparisonFromForm(schema, getParam));

  useEffect(() => {
    setValues(hydrateComparisonFromForm(schema, getParam));
  }, [schema, dataSignature, getParam]);

  const onFieldChange = useCallback((param: string, value: string) => {
    setValues((prev) => ({ ...prev, [param]: value }));
  }, []);

  const updateSaveHandle = useCallback(() => {
    saveHandleRef.current = {
      getSaveFields: () => buildSavePayloadFromComparison(schema, values),
    };
  }, [schema, values, saveHandleRef]);

  useEffect(() => {
    updateSaveHandle();
    return () => {
      saveHandleRef.current = null;
    };
  }, [updateSaveHandle]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <AnnexureComparisonTable layout={layout} values={values} onChange={onFieldChange} />
      </div>
    </div>
  );
}

function AnnexureTableRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  sectionValues,
  globalExtras,
  saveHandleRef,
}: Props) {
  const getParam = useCallback(
    (param: string) =>
      (formState.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value ??
      undefined,
    [formState.data, tab, subtab],
  );

  const global = useMemo(
    () => ({ ...sectionValues, ...(globalExtras ?? {}) }),
    [sectionValues, globalExtras],
  );

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value])
          .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
        sourceAnnexSignature(formState, schema.sourceAnnex, tab),
        ventilationSummarySignature(formState, schema, tab),
      ]),
    [formState.data, tab, subtab, schema.sourceAnnex, schema.ventilationSummary],
  );

  const hydrateRows = useCallback(() => {
    if (schema.ventilationSummary) {
      return hydrateVentilationSummaryRows(schema, formState, tab, subtab);
    }
    return hydrateRowsWithSourceAnnex(schema, formState, tab, subtab, getParam);
  }, [schema, formState, tab, subtab, getParam]);

  const [draftRows, setDraftRows] = useState<RowRecord[]>(() => hydrateRows());

  useEffect(() => {
    setDraftRows(hydrateRows());
  }, [schema, dataSignature, hydrateRows]);

  const [draftScalars, setDraftScalars] = useState(() => hydrateScalarsFromForm(schema, getParam));

  useEffect(() => {
    setDraftScalars(hydrateScalarsFromForm(schema, getParam));
  }, [schema, dataSignature, getParam]);

  const computed = useMemo(
    () => runAnnexureCalculations(schema, draftRows, draftScalars, global),
    [schema, draftRows, draftScalars, global],
  );

  const { rows, scalar } = computed;

  const onFooterScalarChange = useCallback((param: string, value: string) => {
    setDraftScalars((prev) => ({ ...prev, [param]: value }));
  }, []);

  const updateSaveHandle = useCallback(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => {
        const latest = runAnnexureCalculations(schema, draftRows, draftScalars, global);
        return buildSavePayloadFromAnnex(schema, latest);
      },
    };
    saveHandleRef.current = handle;
  }, [schema, draftRows, draftScalars, global, saveHandleRef]);

  useEffect(() => {
    updateSaveHandle();
    return () => {
      saveHandleRef.current = null;
    };
  }, [updateSaveHandle]);

  const onRowChange = useCallback((rowIndex: number, param: string, value: string) => {
    setDraftRows((prev) => {
      const next = prev.map((r, i) => (i === rowIndex ? { ...r, [param]: value } : r));
      return next;
    });
  }, []);

  const onAddRow = useCallback(() => {
    setDraftRows((prev) => {
      if (schema.table?.maxRows && prev.length >= schema.table.maxRows) return prev;
      return [...prev, emptyRow(schema)];
    });
  }, [schema]);

  const onRemoveRow = useCallback(
    (rowIndex: number) => {
      setDraftRows((prev) => {
        const min = schema.table?.minRows ?? 1;
        if (prev.length <= min) return prev;
        return prev.filter((_, i) => i !== rowIndex);
      });
    },
    [schema.table?.minRows],
  );

  const evalCtx = useMemo(() => ({ rows, scalar, global }), [rows, scalar, global]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <DynamicTable
          columns={schema.table?.columns ?? []}
          rows={rows}
          stickyFirstColumns={schema.table?.stickyFirstColumns}
          addRowLabel={
            schema.ventilationSummary || schema.table?.allowAddRows === false
              ? undefined
              : schema.table?.addRowLabel
          }
          allowRemoveRows={!schema.ventilationSummary && schema.table?.allowAddRows !== false}
          minRows={schema.table?.minRows}
          maxRows={schema.table?.maxRows ?? 99}
          headerRows={schema.table?.headerRows}
          footerRows={schema.footerRows}
          footerScalar={scalar}
          onFooterScalarChange={onFooterScalarChange}
          evalCtx={evalCtx}
          onRowChange={onRowChange}
          onAddRow={onAddRow}
          onRemoveRow={onRemoveRow}
        />

        {schema.summaryGroups?.length
          ? schema.summaryGroups.map((group) => (
              <SummarySection key={group.title} title={group.title} rows={group.rows} values={scalar} />
            ))
          : null}
        {!schema.summaryGroups?.length && schema.summary?.length ? (
          <SummarySection rows={schema.summary} values={scalar} />
        ) : null}
      </div>
    </div>
  );
}

