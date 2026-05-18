import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GreenHomesProjectWorkspace } from "@/components/greenHomes/GreenHomesProjectWorkspace";
import {
  hasConfigForVersion,
  isCertificationWorkspaceUnlocked,
  resolveRatingConfigKeyFromProject,
} from "@/lib/ratingConfigRegistry";
import { fetchProjectById, type ProjectDto } from "@/lib/projects";
import { Loader2 } from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Project not found");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProjectById(id);
        if (!cancelled) setProject(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load project");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div
          className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground"
        >
          <Loader2 className="h-5 w-5 animate-spin text-ocean" />
          Loading project…
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <p className="text-sm text-destructive">{error ?? "Project not found"}</p>
          <Link to="/projects" className="mt-4 inline-block text-sm font-medium text-ocean hover:underline">
            ← Back to My Projects
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const configKey = resolveRatingConfigKeyFromProject({
    ratingTypeId: project.ratingTypeId,
    configKey: project.configKey,
    ratingTypeName: project.ratingTypeName,
    abbreviation: project.ratingAbbreviation,
  });

  const certificationUnlocked = isCertificationWorkspaceUnlocked(project.certificationStatus);

  if (!certificationUnlocked) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {project.projectCode} / {project.projectName}
          </p>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <h1 className="text-lg font-semibold text-foreground">Waiting for admin approval</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The certification workspace for <strong>{project.ratingTypeName}</strong> opens after your
              pre-certification or certification application is approved by IGBC.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Current status: <span className="font-medium capitalize">{project.certificationStatus.replace(/_/g, " ")}</span>
            </p>
            <Link to="/projects" className="mt-6 inline-block text-sm font-medium text-ocean hover:underline">
              ← Back to My Projects
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const configReady = configKey && hasConfigForVersion(configKey, project.versionType);

  if (!project.hasConfig || !configKey || !configReady) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {project.projectCode} / {project.projectName}
          </p>
          <div
            className="rounded-2xl border border-border bg-card p-8 shadow-card"
          >
            <h1 className="text-lg font-semibold text-foreground">Configuration coming soon</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>{project.ratingTypeName}</strong> (rating type #{project.ratingTypeId}) is registered for
              this project (version {project.versionType}), but the dynamic form JSON has not been added to the portal yet.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Add a JSON export and register it in <code className="rounded bg-muted px-1">ratingConfigRegistry.ts</code>{" "}
              under <code className="rounded bg-muted px-1">configsByVersion["{project.versionType}"]</code>.
            </p>
            <Link to="/projects" className="mt-6 inline-block text-sm font-medium text-ocean hover:underline">
              ← Back to My Projects
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <GreenHomesProjectWorkspace
      projectId={project.id}
      projectLabel={`${project.projectCode} / ${project.projectName}`}
      ratingTypeName={project.ratingTypeName}
      versionType={project.versionType}
      ratingKey={configKey}
      ratingTypeId={project.ratingTypeId}
    />
  );
};

export default ProjectDetail;
