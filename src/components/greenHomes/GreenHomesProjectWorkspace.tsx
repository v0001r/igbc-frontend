import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CertificationChecklistView } from "@/components/greenHomes/CertificationChecklistView";
import {
  CertificationLeftNav,
  type WorkspaceView,
} from "@/components/greenHomes/CertificationLeftNav";
import { CertificationOverview } from "@/components/greenHomes/CertificationOverview";
import { CertificationSectionRouter } from "@/components/greenHomes/CertificationSectionRouter";
import {
  buildNonFileSaveFields,
  isFileFieldType,
  saveCertificationSection,
  uploadCertificationDocuments,
  type CertificationFormResponse,
} from "@/lib/certificationForm";
import {
  fetchCertificationWorkspace,
  type CertificationWorkspaceResponse,
} from "@/lib/certificationWorkspace";
import {
  buildCertificationChecklist,
} from "@/lib/certificationChecklist";
import {
  getFieldsForTabSubtab,
  getSubtabsForTab,
  type GreenHomesRuntimeConfig,
} from "@/lib/greenHomesConfig";
import { getFieldsHiddenByRules, getRulesForSection } from "@/lib/fieldRules";
import { fieldsControlledBy, isControlChecked, isFieldVisible } from "@/lib/fieldVisibility";
import { createFieldValueContext, resolveFieldValue, shouldPersistField } from "@/lib/ratingFieldValue";
import { ChevronLeft, FileBadge, Loader2 } from "lucide-react";

type Props = {
  projectId: string;
};

function initialTabSubtab(config: GreenHomesRuntimeConfig): { tab: string; sub: string } {
  const tabs = Array.isArray(config.tabs) ? config.tabs : [];
  const tab = tabs[0]?.slug ?? "project_details";
  const sub = getSubtabsForTab(config, tab)[0]?.sub_slug ?? "project_details";
  return { tab, sub };
}

export function GreenHomesProjectWorkspace({ projectId }: Props) {
  const [workspace, setWorkspace] = useState<CertificationWorkspaceResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<WorkspaceView>("overview");
  const [currentTab, setCurrentTab] = useState("project_details");
  const [currentSubtab, setCurrentSubtab] = useState("project_details");
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const config = workspace?.config;
  const formState = workspace?.form ?? null;
  const annexureRoutes = workspace?.annexureRoutes ?? [];

  const setFormState = useCallback((form: CertificationFormResponse) => {
    setWorkspace((prev) => (prev ? { ...prev, form } : prev));
  }, []);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchCertificationWorkspace(projectId);
      setWorkspace(data);
      const { tab, sub } = initialTabSubtab(data.config);
      setCurrentTab(data.form.currentTab ?? tab);
      setCurrentSubtab(data.form.currentSubtab ?? sub);
      setLocalValues({});
      setPendingFiles({});
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load certification workspace");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!formState) return;
    setLocalValues({});
    setPendingFiles({});
  }, [currentTab, currentSubtab, formState]);

  const tabs = useMemo(
    () => (config && Array.isArray(config.tabs) ? config.tabs : []),
    [config],
  );
  const subtabs = useMemo(
    () => (config ? getSubtabsForTab(config, currentTab) : []),
    [config, currentTab],
  );
  const fields = useMemo(
    () => (config ? getFieldsForTabSubtab(config, currentTab, currentSubtab) : []),
    [config, currentTab, currentSubtab],
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

  const checklistSummary = useMemo(() => {
    if (!config || !formState) return null;
    return buildCertificationChecklist(config, formState);
  }, [config, formState]);

  const currentSubtabMeta = useMemo(
    () => subtabs.find((s) => s.sub_slug === currentSubtab),
    [subtabs, currentSubtab],
  );
  const formTitle = currentSubtabMeta?.name ?? "Section";

  const fieldNames = useMemo(
    () => fields.map((f) => f.name ?? "").filter(Boolean),
    [fields],
  );

  const onFieldChange = useCallback(
    (name: string, value: string) => {
      const field = fields.find((f) => f.name === name);
      if (field && isFileFieldType(field.type)) {
        const allowed = new Set(value.split(/,\s*/).filter(Boolean));
        setPendingFiles((prev) => ({
          ...prev,
          [name]: (prev[name] ?? []).filter((f) => allowed.has(f.name)),
        }));
      }

      const previousValues = { ...sectionValues };
      const nextValues = { ...sectionValues, [name]: value };
      const ruleSet = getRulesForSection(workspace?.fieldRules, currentTab, currentSubtab);
      const hiddenByRules = getFieldsHiddenByRules(
        ruleSet,
        fieldNames,
        previousValues,
        nextValues,
      );

      setLocalValues((prev) => {
        const next = { ...prev, [name]: value };
        const controller = fields.find((f) => f.name === name && f.type === "c");
        if (controller && !isControlChecked(value)) {
          for (const dep of fieldsControlledBy(name, fields)) {
            const depName = dep.name ?? "";
            if (depName) delete next[depName];
          }
        }
        for (const hidden of hiddenByRules) {
          delete next[hidden];
        }
        return next;
      });

      const controller = fields.find((f) => f.name === name && f.type === "c");
      const depsToClear =
        controller && !isControlChecked(value)
          ? fieldsControlledBy(name, fields).map((f) => f.name ?? "").filter(Boolean)
          : [];
      const allCleared = [...new Set([...depsToClear, ...hiddenByRules])];

      if (allCleared.length) {
        setPendingFiles((prev) => {
          const next = { ...prev };
          for (const depName of allCleared) {
            if (depName) delete next[depName];
          }
          return next;
        });
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          for (const depName of allCleared) {
            if (depName) delete next[depName];
          }
          return next;
        });
        if (controller && !isControlChecked(value)) {
          return;
        }
      }

      setErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
    [fields, fieldNames, sectionValues, workspace?.fieldRules, currentTab, currentSubtab],
  );

  const onFilesChange = useCallback((name: string, files: File[]) => {
    setPendingFiles((prev) => ({
      ...prev,
      [name]: [...(prev[name] ?? []), ...files],
    }));
    setLocalValues((prev) => {
      const existing = prev[name] ?? sectionValues[name] ?? "";
      const names = existing ? existing.split(/,\s*/).filter(Boolean) : [];
      const added = files.map((f) => f.name);
      return { ...prev, [name]: [...names, ...added].join(", ") };
    });
  }, [sectionValues]);

  const goToSection = useCallback((tabSlug: string, subSlug: string) => {
    setView("section");
    setCurrentTab(tabSlug);
    setCurrentSubtab(subSlug);
  }, []);

  const persistForm = useCallback(async () => {
    if (!formState) return;
    setSaving(true);
    try {
      const saveValues = { ...sectionValues, ...localValues };
      for (const field of fields) {
        const name = field.name ?? "";
        if (!name || !isFileFieldType(field.type)) continue;
        if (!isFieldVisible(field, saveValues)) continue;
        const allowedNames = new Set((saveValues[name] ?? "").split(/,\s*/).filter(Boolean));
        const files = (pendingFiles[name] ?? []).filter((f) => allowedNames.has(f.name));
        if (!files.length) continue;
        const updated = await uploadCertificationDocuments(projectId, {
          tab: currentTab,
          subtab: currentSubtab,
          paramName: name,
          files,
          replaceExisting: true,
        });
        setFormState(updated);
      }

      const saveCtx = createFieldValueContext(formState, currentTab, currentSubtab, {
        ...sectionValues,
        ...localValues,
      });
      const persistable = fields.filter(
        (f) => shouldPersistField(f, saveCtx) && isFieldVisible(f, saveValues),
      );
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
    formState,
    setFormState,
  ]);

  const canGoPrevious = useMemo(() => {
    const idx = subtabs.findIndex((s) => s.sub_slug === currentSubtab);
    if (idx > 0) return true;
    return tabs.findIndex((t) => t.slug === currentTab) > 0;
  }, [subtabs, currentSubtab, tabs, currentTab]);

  const goToPrevious = useCallback(() => {
    if (!config) return;
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
    if (!config) return;
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-ocean" />
          Loading certification workspace…
        </div>
      </DashboardLayout>
    );
  }

  if (loadError || !workspace || !config || !formState) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {loadError ?? "Could not load certification workspace"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <CertificationLeftNav
          config={config}
          view={view}
          currentTabSlug={currentTab}
          currentSubSlug={currentSubtab}
          onViewChange={setView}
          onSectionSelect={goToSection}
        />

        <div className="min-w-0 flex-1">
          {view === "overview" ? <CertificationOverview workspace={workspace} /> : null}

          {view === "checklist" && checklistSummary ? (
            <CertificationChecklistView
              summary={checklistSummary}
              onNavigateToCredit={goToSection}
            />
          ) : null}

          {view === "certificate" ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-8 py-16 text-center shadow-sm">
              <FileBadge className="mb-4 h-12 w-12 text-ocean/60" />
              <h2 className="text-lg font-semibold text-foreground">View Certificate</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Your certificate will appear here once the project is certified. Complete all credits
                from the checklist to proceed.
              </p>
            </div>
          ) : null}

          {view === "section" ? (
            <div className="space-y-4">
              <SectionHeader
                projectLabel={workspace.projectLabel}
                sectionTitle={formTitle}
              />

              {valueContext ? (
                <CertificationSectionRouter
                  projectId={projectId}
                  title={formTitle}
                  tab={currentTab}
                  subtab={currentSubtab}
                  versionType={workspace.versionType}
                  ratingTypeId={workspace.ratingTypeId}
                  annexureRoutes={annexureRoutes}
                  fieldRules={workspace.fieldRules ?? {}}
                  fields={fields}
                  formState={formState}
                  localValues={localValues}
                  errors={errors}
                  onChange={onFieldChange}
                  onFilesChange={onFilesChange}
                />
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  disabled={!canGoPrevious}
                  onClick={goToPrevious}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-ocean bg-transparent px-5 py-2.5 text-sm font-semibold text-ocean transition-colors hover:bg-ocean/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveAndContinue()}
                  className="rounded-lg bg-ocean px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-hover disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save & Continue →"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}

function SectionHeader({
  projectLabel,
  sectionTitle,
}: {
  projectLabel: string;
  sectionTitle: string;
}) {
  return (
    <div className="border-b border-border pb-3">
      <p className="text-sm text-muted-foreground">{projectLabel}</p>
      <h1 className="mt-1 text-lg font-semibold text-foreground">{sectionTitle}</h1>
    </div>
  );
}
