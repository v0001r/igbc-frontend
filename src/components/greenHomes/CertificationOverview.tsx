import type { ReactNode } from "react";
import type { CertificationWorkspaceResponse } from "@/lib/certificationWorkspace";
import { readFormParam } from "@/lib/certificationChecklist";
import { Building2, CreditCard, MapPin, User } from "lucide-react";

type Props = {
  workspace: CertificationWorkspaceResponse;
};

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-ocean/15 bg-ocean/[0.06] px-4 py-3">
        <span className="text-ocean">{icon}</span>
        <h3 className="text-sm font-semibold text-ocean">{title}</h3>
      </div>
      <dl className="divide-y divide-border/80 px-4 py-1">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr,1.2fr] gap-2 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

export function CertificationOverview({ workspace }: Props) {
  const { form } = workspace;
  const siteArea = readFormParam(form, "site_area");
  const builtUp = readFormParam(form, "built_up_area") || readFormParam(form, "total_built_up_area");
  const buildings = readFormParam(form, "no_of_buildings") || readFormParam(form, "no_of_towers");
  const city = readFormParam(form, "city") || readFormParam(form, "project_city");
  const org = readFormParam(form, "owner_org") || readFormParam(form, "organization_name");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{workspace.projectLabel}</p>
        <h1 className="mt-1 text-xl font-semibold text-foreground">Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard title="Project details" icon={<Building2 className="h-4 w-4" />}>
          <Row label="Project ID" value={workspace.projectCode} />
          <Row label="Title" value={workspace.projectName} />
          <Row label="Rating system" value={workspace.ratingLabel} />
          <Row label="Version" value={workspace.versionType} />
        </InfoCard>

        <InfoCard title="Certification details" icon={<CreditCard className="h-4 w-4" />}>
          <Row label="Type" value="Pre-Certification / Certification" />
          <Row label="Site area (sq.m)" value={siteArea} />
          <Row label="Total built-up area" value={builtUp} />
          <Row label="No. of buildings" value={buildings} />
        </InfoCard>

        <InfoCard title="Membership details" icon={<User className="h-4 w-4" />}>
          <Row label="IGBC member" value="—" />
          <Row label="Organization" value={org} />
        </InfoCard>
      </div>

      <InfoCard title="Project address" icon={<MapPin className="h-4 w-4" />}>
        <Row label="City" value={city} />
        <Row label="Status" value={workspace.ratingTypeName} />
      </InfoCard>

      <p className="text-xs text-muted-foreground">
        Complete each credit under <strong>Rating sections</strong> in the left menu. Progress updates
        automatically on the Checklist.
      </p>
    </div>
  );
}
