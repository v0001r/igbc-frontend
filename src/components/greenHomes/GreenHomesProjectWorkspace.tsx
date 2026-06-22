import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AnnexureRendererHandle } from "@/annexure/components/AnnexureRenderer";
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
import { RatingDataIndex } from "@/lib/ratingDataIndex";
import { finalSubmitProject } from "@/lib/certificationWorkflow";
import { ChevronLeft, Loader2 } from "lucide-react";
import { ProjectWorkflowTimeline } from "@/components/greenHomes/ProjectWorkflowTimeline";
import { ClientReportPanel } from "@/components/review/ClientReportPanel";
import { CertificateWorkflowPanel } from "@/components/review/CertificateWorkflowPanel";

type Props = {
  projectId: string;
  forceReadOnly?: boolean;
  /** When true, renders inside portal layout without client DashboardLayout wrapper. */
  embedded?: boolean;
  /** Hide View Certificate nav (e.g. TPA reviewers). */
  hideCertificateTab?: boolean;
  /** Rendered below the certification section (e.g. TPA review form). */
  renderAfterSection?: (tab: string, subtab: string) => ReactNode;
};

function WorkspaceShell({ embedded, children }: { embedded?: boolean; children: ReactNode }) {
  if (embedded) return <>{children}</>;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function initialTabSubtab(config: GreenHomesRuntimeConfig): { tab: string; sub: string } {
  const tabs = Array.isArray(config.tabs) ? config.tabs : [];
  const tab = tabs[0]?.slug ?? "project_details";
  const sub = getSubtabsForTab(config, tab)[0]?.sub_slug ?? "project_details";
  return { tab, sub };
}

export function GreenHomesProjectWorkspace({
  projectId,
  forceReadOnly = false,
  embedded = false,
  hideCertificateTab = false,
  renderAfterSection,
}: Props) {
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
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const annexSaveRef = useRef<AnnexureRendererHandle | null>(null);

  const readOnly = forceReadOnly || workspace?.readOnly === true;

  const pendingCredits = workspace?.pendingCredits ?? [];
  const sectionReadOnly =
    readOnly &&
    !pendingCredits.some((c) => c.tab === currentTab && c.subtab === currentSubtab);

  const showCertificateNav = workspace?.canViewCertificateTab === true && !hideCertificateTab;
  const showReportOnOverview =
    workspace?.isSubmitted === true && workspace?.clientReportStatus === "pending";

  useEffect(() => {
    if (view === "certificate" && workspace && !workspace.canViewCertificateTab) {
      setView("overview");
    }
  }, [view, workspace?.canViewCertificateTab]);

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
    if (!config || !formState || !workspace) return null;
    return buildCertificationChecklist(config, formState, workspace.ratingTypeId);
  }, [config, formState, workspace]);

  const canShowFinalSubmit =
    !readOnly && workspace?.canFinalSubmit !== false && !workspace?.isSubmitted;

  const currentSubtabMeta = useMemo(
    () => subtabs.find((s) => s.sub_slug === currentSubtab),
    [subtabs, currentSubtab],
  );
  const formTitle = currentSubtabMeta?.name ?? "Section";

  const annexGlobalExtras = useMemo(() => {
    if (!formState) return {};
    const idx = new RatingDataIndex(formState);
    return {
      site_area: idx.getRelated("site_area", "sustainable_design"),
      rainwater_harvesting_capacity:
        idx.get("project_details", "water_conservation_details", "rainwater_harvesting_capacity") ||
        idx.get("project_details", "project_details", "rainwater_harvesting_capacity") ||
        idx.getRelated("rainwater_harvesting_capacity", "water_conservation") ||
        idx.getRelated("rainwater_harvesting_capacity", "project_details"),
      occupancy:
        idx.get("project_details", "project_details", "occupancy_green") ||
        idx.getRelated("occupancy_green", "project_details") ||
        idx.get("project_details", "project_details", "occupancy") ||
        idx.getRelated("occupancy", "project_details"),
      projects_details_permanent_occupancy:
        idx.get("project_details", "project_details", "projects_details_permanent_occupancy") ||
        idx.getRelated("projects_details_permanent_occupancy", "project_details"),
      projects_details_floating_population:
        idx.get("project_details", "project_details", "projects_details_floating_population") ||
        idx.getRelated("projects_details_floating_population", "project_details"),
      topology_type:
        idx.get("project_details", "project_details", "topology_type") ||
        idx.getRelated("topology_type", "project_details"),
      annual_working_days:
        idx.get("project_details", "water_conservation_details", "annual_working_days") ||
        idx.getRelated("annual_working_days", "water_conservation"),
      capacity_of_stp:
        idx.get("project_details", "water_conservation_details", "capacity_of_stp") ||
        idx.getRelated("capacity_of_stp", "water_conservation"),
    };
  }, [formState]);

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

  const handleFinalSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await finalSubmitProject(projectId);
      setShowSubmitConfirm(false);
      await loadWorkspace();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Final submit failed");
    } finally {
      setSubmitting(false);
    }
  }, [projectId, loadWorkspace]);

  const persistForm = useCallback(async () => {
    if (!formState || sectionReadOnly) return;
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
      const annexPayload = annexSaveRef.current?.getSaveFields() ?? [];
      const payloadFields = [
        ...buildNonFileSaveFields(persistable, { ...sectionValues, ...localValues }),
        ...annexPayload,
      ];
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
    sectionReadOnly,
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
      <WorkspaceShell embedded={embedded}>
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-ocean" />
          Loading certification workspace…
        </div>
      </WorkspaceShell>
    );
  }

  if (loadError || !workspace || !config || !formState) {
    return (
      <WorkspaceShell embedded={embedded}>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {loadError ?? "Could not load certification workspace"}
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell embedded={embedded}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <CertificationLeftNav
          config={config}
          view={view}
          currentTabSlug={currentTab}
          currentSubSlug={currentSubtab}
          showCertificate={showCertificateNav}
          onViewChange={setView}
          onSectionSelect={goToSection}
        />

        <div className="min-w-0 flex-1">
          {canShowFinalSubmit ? (
            <div className="mb-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Final Submission</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submit your certification package when you are ready. After submission, the project becomes read-only.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(true)}
                  className="shrink-0 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                >
                  Final Submit
                </button>
              </div>
            </div>
          ) : null}

          {workspace.isSubmitted && !workspace.isPending ? (
            <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
              This project has been final submitted and is read-only.
            </div>
          ) : null}

          {workspace.isSubmitted && workspace.isPending ? (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-medium">Pending credits require updates</p>
              <p className="mt-1 text-xs">
                Only sections with pending points can be edited. Update those credits, then the
                coordinator will review again.
              </p>
              {pendingCredits.length > 0 ? (
                <ul className="mt-2 list-disc pl-5 text-xs">
                  {pendingCredits.map((c) => (
                    <li key={`${c.tab}-${c.subtab}`}>
                      <button
                        type="button"
                        className="text-primary underline"
                        onClick={() => goToSection(c.tab, c.subtab)}
                      >
                        {c.tab}/{c.subtab}
                      </button>{" "}
                      — {c.pendingPoints} pending
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {view === "overview" ? (
            <>
              <CertificationOverview projectId={projectId} workspace={workspace} />
              {showReportOnOverview ? (
                <div className="mt-4">
                  <ClientReportPanel projectId={projectId} onUpdated={() => void loadWorkspace()} />
                </div>
              ) : null}
              <div className="mt-4">
                <ProjectWorkflowTimeline projectId={projectId} />
              </div>
            </>
          ) : null}

          {view === "checklist" && checklistSummary ? (
            <CertificationChecklistView
              summary={checklistSummary}
              onNavigateToCredit={goToSection}
            />
          ) : null}

          {view === "certificate" ? (
            <CertificateWorkflowPanel
              projectId={projectId}
              onUpdated={() => void loadWorkspace()}
            />
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
                  ratingKey={workspace.ratingKey}
                  versionType={workspace.versionType}
                  ratingTypeId={workspace.ratingTypeId}
                  annexureRoutes={annexureRoutes}
                  annexureSchemas={workspace.annexureSchemas ?? {}}
                  fields={fields}
                  formState={formState}
                  localValues={localValues}
                  sectionValues={sectionValues}
                  annexGlobalExtras={annexGlobalExtras}
                  errors={errors}
                  fieldRules={workspace.fieldRules ?? {}}
                  onChange={onFieldChange}
                  onFilesChange={onFilesChange}
                  annexSaveRef={annexSaveRef}
                  readOnly={sectionReadOnly}
                />
              ) : null}

              {renderAfterSection?.(currentTab, currentSubtab)}

              {!sectionReadOnly ? (
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
              ) : null}
            </div>
          ) : null}

        </div>
      </div>

      {showSubmitConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Final Submission</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              After final submission, you will not be able to modify project information, config forms,
              annexures, uploads, or certification data.
            </p>
            {submitError ? (
              <p className="mt-3 text-sm text-destructive">{submitError}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm"
                onClick={() => setShowSubmitConfirm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                onClick={() => void handleFinalSubmit()}
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </WorkspaceShell>
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
