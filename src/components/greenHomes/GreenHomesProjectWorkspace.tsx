import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CertificationSectionRouter } from "@/components/greenHomes/CertificationSectionRouter";
import { DynamicSidebar } from "@/components/greenHomes/DynamicSidebar";
import { DynamicTabs } from "@/components/greenHomes/DynamicTabs";
import {
  buildNonFileSaveFields,
  fetchCertificationForm,
  isFileFieldType,
  saveCertificationSection,
  uploadCertificationDocuments,
  type CertificationFormResponse,
} from "@/lib/certificationForm";
import {
  getFieldsForTabSubtab,
  getSubtabsForTab,
  type GreenHomesRuntimeConfig,
} from "@/lib/greenHomesConfig";
import {
  getRatingConfig,
  getRatingConfigEntry,
  type RatingConfigKey,
} from "@/lib/ratingConfigRegistry";
import { subtabCompletionPercent } from "@/lib/certificationProgress";
import { createFieldValueContext, resolveFieldValue, shouldPersistField } from "@/lib/ratingFieldValue";
import { ChevronLeft, Loader2 } from "lucide-react";

type Props = {
  projectId: string;
  projectLabel: string;
  ratingTypeName: string;
  versionType: string;
  ratingKey: RatingConfigKey;
  ratingTypeId: number;
};

function initialTabSubtab(config: GreenHomesRuntimeConfig): { tab: string; sub: string } {
  const tabs = Array.isArray(config.tabs) ? config.tabs : [];
  const tab = tabs[0]?.slug ?? "project_details";
  const sub = getSubtabsForTab(config, tab)[0]?.sub_slug ?? "project_details";
  return { tab, sub };
}

export function GreenHomesProjectWorkspace({
  projectId,
  projectLabel,
  ratingTypeName,
  versionType,
  ratingKey,
  ratingTypeId,
}: Props) {
  const config = useMemo(() => getRatingConfig(ratingKey, versionType), [ratingKey, versionType]);
  const ratingLabel = getRatingConfigEntry(ratingKey)?.label ?? ratingTypeName;

  const [formState, setFormState] = useState<CertificationFormResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(() => initialTabSubtab(config).tab);
  const [currentSubtab, setCurrentSubtab] = useState(() => initialTabSubtab(config).sub);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadForm = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchCertificationForm(projectId);
      setFormState(data);
      const { tab, sub } = initialTabSubtab(config);
      setCurrentTab(data.currentTab ?? tab);
      setCurrentSubtab(data.currentSubtab ?? sub);
      setLocalValues({});
      setPendingFiles({});
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load form data");
    } finally {
      setLoading(false);
    }
  }, [projectId, config]);

  useEffect(() => {
    void loadForm();
  }, [loadForm]);

  useEffect(() => {
    if (!formState) return;
    setLocalValues({});
    setPendingFiles({});
  }, [currentTab, currentSubtab, formState]);

  const tabs = useMemo(() => (Array.isArray(config.tabs) ? config.tabs : []), [config]);
  const subtabs = useMemo(() => getSubtabsForTab(config, currentTab), [config, currentTab]);
  const fields = useMemo(
    () => getFieldsForTabSubtab(config, currentTab, currentSubtab),
    [config, currentTab, currentSubtab]
  );

  const valueContext = useMemo(() => {
    if (!formState) return null;
    return createFieldValueContext(formState, currentTab, currentSubtab, localValues);
  }, [formState, currentTab, currentSubtab, localValues]);

  const sectionValues = useMemo(() => {
    if (!valueContext) return localValues;
    const out: Record<string, string> = {};
    for (const field of fields) {
      const name = field.name ?? "";
      if (!name) continue;
      out[name] = resolveFieldValue(field, valueContext).value;
    }
    return out;
  }, [valueContext, fields, localValues]);

  const subtabProgress = useMemo(() => {
    if (!formState) return undefined;
    return subtabs.map((s) => ({
      subSlug: s.sub_slug,
      percent: subtabCompletionPercent(config, formState, currentTab, s),
    }));
  }, [formState, config, currentTab, subtabs]);

  const currentSubtabMeta = useMemo(
    () => subtabs.find((s) => s.sub_slug === currentSubtab),
    [subtabs, currentSubtab]
  );
  const formTitle = currentSubtabMeta?.name ?? "Section";

  const onFieldChange = useCallback((name: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const onFilesChange = useCallback((name: string, files: File[]) => {
    setPendingFiles((prev) => ({ ...prev, [name]: files }));
    setLocalValues((prev) => ({
      ...prev,
      [name]: files.map((f) => f.name).join(", "),
    }));
  }, []);

  const handleTabChange = useCallback(
    (tabSlug: string) => {
      setCurrentTab(tabSlug);
      const first = getSubtabsForTab(config, tabSlug)[0]?.sub_slug;
      if (first) setCurrentSubtab(first);
    },
    [config]
  );

  const handleSubtabChange = useCallback((tabSlug: string, subSlug: string) => {
    setCurrentTab(tabSlug);
    setCurrentSubtab(subSlug);
  }, []);

  const persistForm = useCallback(async () => {
    setSaving(true);
    try {
      for (const field of fields) {
        const name = field.name ?? "";
        if (!name || !isFileFieldType(field.type)) continue;
        const files = pendingFiles[name];
        if (!files?.length) continue;
        const updated = await uploadCertificationDocuments(projectId, {
          tab: currentTab,
          subtab: currentSubtab,
          paramName: name,
          files,
          replaceExisting: true,
        });
        setFormState(updated);
      }

      const saveCtx = createFieldValueContext(formState!, currentTab, currentSubtab, {
        ...sectionValues,
        ...localValues,
      });
      const persistable = fields.filter((f) => shouldPersistField(f, saveCtx));
      const payloadFields = buildNonFileSaveFields(persistable, { ...sectionValues, ...localValues });
      const saved = await saveCertificationSection(projectId, {
        tab: currentTab,
        subtab: currentSubtab,
        currentTab,
        currentSubtab,
        fields: payloadFields,
      });
      setFormState(saved);
      setLocalValues({});
      setPendingFiles({});
    } finally {
      setSaving(false);
    }
  }, [
    projectId,
    fields,
    pendingFiles,
    currentTab,
    currentSubtab,
    sectionValues,
    localValues,
  ]);

  const canGoPrevious = useMemo(() => {
    const idx = subtabs.findIndex((s) => s.sub_slug === currentSubtab);
    if (idx > 0) return true;
    return tabs.findIndex((t) => t.slug === currentTab) > 0;
  }, [subtabs, currentSubtab, tabs, currentTab]);

  const goToPrevious = useCallback(() => {
    const idx = subtabs.findIndex((s) => s.sub_slug === currentSubtab);
    if (idx > 0) {
      setCurrentSubtab(subtabs[idx - 1].sub_slug);
      return;
    }
    const ti = tabs.findIndex((t) => t.slug === currentTab);
    if (ti > 0) {
      const prevTab = tabs[ti - 1].slug;
      setCurrentTab(prevTab);
      const ps = getSubtabsForTab(config, prevTab);
      if (ps.length > 0) setCurrentSubtab(ps[ps.length - 1].sub_slug);
    }
  }, [subtabs, currentSubtab, tabs, currentTab, config]);

  const saveAndContinue = useCallback(async () => {
    await persistForm();
    const idx = subtabs.findIndex((s) => s.sub_slug === currentSubtab);
    if (idx >= 0 && idx < subtabs.length - 1) {
      setCurrentSubtab(subtabs[idx + 1].sub_slug);
      return;
    }
    const ti = tabs.findIndex((t) => t.slug === currentTab);
    if (ti >= 0 && ti < tabs.length - 1) {
      const nextTab = tabs[ti + 1].slug;
      setCurrentTab(nextTab);
      const ns = getSubtabsForTab(config, nextTab);
      if (ns[0]?.sub_slug) setCurrentSubtab(ns[0].sub_slug);
    }
  }, [persistForm, subtabs, currentSubtab, tabs, currentTab, config]);

  const finalSubmit = useCallback(async () => {
    await persistForm();
  }, [persistForm]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-ocean" />
          Loading certification form…
        </div>
      </DashboardLayout>
    );
  }

  if (loadError || !formState) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {loadError ?? "Could not load form data"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <WorkspaceHeader projectLabel={projectLabel} ratingLabel={ratingLabel} />

        <DynamicTabs
          config={config}
          currentTabSlug={currentTab}
          currentSubSlug={currentSubtab}
          onTabChange={handleTabChange}
          onSubtabChange={handleSubtabChange}
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-4">
            {valueContext ? (
              <CertificationSectionRouter
                projectId={projectId}
                title={formTitle}
                tab={currentTab}
                subtab={currentSubtab}
                versionType={versionType}
                ratingTypeId={ratingTypeId}
                fields={fields}
                formState={formState}
                localValues={localValues}
                errors={errors}
                onChange={onFieldChange}
                onFilesChange={onFilesChange}
              />
            ) : null}

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                disabled={!canGoPrevious}
                onClick={goToPrevious}
                className="flex items-center gap-1.5 rounded-lg border-2 border-ocean bg-transparent px-6 py-2.5 text-sm font-semibold text-ocean shadow-sm transition-colors hover:bg-ocean/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveAndContinue()}
                className="flex items-center gap-1.5 rounded-lg border-2 border-ocean bg-transparent px-6 py-2.5 text-sm font-semibold text-ocean shadow-sm transition-colors hover:bg-ocean/10 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save & Continue →"}
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-72 lg:shrink-0">
            <button
              type="button"
              disabled={saving}
              onClick={() => void finalSubmit()}
              className="w-full rounded-lg border-2 border-ocean bg-transparent px-4 py-2.5 text-sm font-semibold text-ocean shadow-sm transition-colors hover:bg-ocean/10 disabled:opacity-50"
            >
              Final Submit
            </button>
            <DynamicSidebar
              subtabs={subtabs}
              currentSubSlug={currentSubtab}
              progressBySubSlug={subtabProgress}
              onSelectSubtab={(subSlug) => setCurrentSubtab(subSlug)}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function WorkspaceHeader({
  projectLabel,
  ratingLabel,
}: {
  projectLabel: string;
  ratingLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{projectLabel}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ocean">{ratingLabel}</p>
      </div>
    </div>
  );
}
