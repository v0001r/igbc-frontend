import { useEffect, useState } from "react";
import { fetchLeadRegistrationView } from "@/lib/certificationWorkflow";

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value || "—"}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card p-4">
    <h3 className="mb-3 text-base font-semibold text-foreground">{title}</h3>
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
  </div>
);

function text(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "—";
}

type Props = {
  projectId: number;
};

export function LeadRegistrationOverview({ projectId }: Props) {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    void fetchLeadRegistrationView(projectId)
      .then((data) => setProject(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading project overview…</p>;
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }
  if (!project) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>;
  }

  const stepOne = (project.stepOne ?? {}) as Record<string, unknown>;
  const stepTwo = (project.stepTwo ?? {}) as Record<string, unknown>;
  const stepThree = (project.stepThree ?? {}) as Record<string, unknown>;
  const certApp = (project.certificationApplication ?? {}) as Record<string, unknown>;
  const projectOwner = (stepThree.projectOwner ?? stepThree.owner ?? {}) as Record<string, unknown>;
  const address = (stepTwo.address ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <Section title={`Project Details — ${text(project.igbcProjectId ?? project.temporaryProjectId)}`}>
        <DetailField label="Project Name" value={text(stepTwo.projectName)} />
        <DetailField label="Project Category" value={text(project.categoryName ?? stepOne.categoryName)} />
        <DetailField label="Type of Construction" value={text(stepOne.constructionType)} />
        <DetailField label="Type of Project" value={text(stepOne.projectType)} />
        <DetailField label="Rating System" value={text(stepOne.ratingSystem ?? project.ratingSystem)} />
        <DetailField label="Opted for Expedite Review" value={text(certApp.expediteReview)} />
      </Section>

      <Section title="Project Site Address">
        <DetailField label="Address Line 1" value={text(address.line1 ?? address.addressLine1 ?? stepTwo.address)} />
        <DetailField label="Address Line 2" value={text(address.line2 ?? address.addressLine2)} />
        <DetailField label="City" value={text(stepTwo.city)} />
        <DetailField label="State / UT" value={text(stepTwo.state)} />
        <DetailField label="Country" value={text(address.country ?? stepTwo.country)} />
      </Section>

      <Section title="Project Site Details">
        <DetailField label="Site Area (sq.m)" value={text(stepTwo.siteAreaSqm)} />
        <DetailField label="Site Area (sq.ft)" value={text(stepTwo.siteAreaSqft)} />
        <DetailField label="Total Built-up Area (sq.m)" value={text(stepTwo.totalBuiltUpAreaSqm)} />
        <DetailField label="Total Built-up Area (sq.ft)" value={text(stepTwo.totalBuiltUpAreaSqft)} />
        <DetailField label="Number of Buildings" value={text(stepTwo.numberOfBuildings)} />
      </Section>

      <Section title="Project Contacts">
        <DetailField label="Owner Name" value={text(projectOwner.name)} />
        <DetailField label="Owner Email" value={text(projectOwner.email)} />
        <DetailField label="Owner Mobile" value={text(projectOwner.mobile)} />
        <DetailField label="Organisation" value={text(projectOwner.organisation ?? projectOwner.organization)} />
      </Section>
    </div>
  );
}
