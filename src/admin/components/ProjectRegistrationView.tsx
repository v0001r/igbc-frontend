import { ArrowLeft, Building2, CreditCard, FileText, MapPin, User } from "lucide-react";
import type { AdminProjectItem } from "../lib/adminApi";
import TableRowActions from "./TableRowActions";

interface ProjectRegistrationViewProps {
  project: AdminProjectItem;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  busy?: boolean;
}

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="detail-label">{label}</p>
    <p className="detail-value">{value || "—"}</p>
  </div>
);

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof FileText;
  children: React.ReactNode;
}) => (
  <div className="kpi-card overflow-hidden !p-0">
    <div
      className="flex items-center gap-2 border-b px-5 py-3"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <Icon className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
      <h3 className="section-header !mb-0 !border-0 !pb-0">{title}</h3>
    </div>
    <div className="detail-grid px-5 py-4">{children}</div>
  </div>
);

const statusClass = (status: string) => {
  if (status === "approved") return "status-approved";
  if (status === "rejected") return "status-rejected";
  return "status-pending";
};

const ProjectRegistrationView = ({
  project,
  onBack,
  onApprove,
  onReject,
  busy,
}: ProjectRegistrationViewProps) => {
  const canModerate =
    project.registrationStatus === "pending" || project.registrationStatus === "in-review";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="action-btn action-btn-outline !px-2">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Project Details — {project.projectCode}
            </h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{project.projectName}</p>
          </div>
        </div>
        <TableRowActions
          actions={[
            ...(canModerate
              ? [
                  {
                    label: "Approve registration",
                    onClick: onApprove,
                    variant: "success" as const,
                    disabled: busy,
                  },
                  {
                    label: "Reject",
                    onClick: onReject,
                    variant: "danger" as const,
                    disabled: busy,
                  },
                ]
              : []),
          ]}
        />
      </div>

      <div className="kpi-card flex flex-wrap items-center gap-4 !py-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Registration:</span>
          <span className={`status-badge ${statusClass(project.registrationStatus)}`}>
            {project.registrationStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Certification:</span>
          <span className={`status-badge ${statusClass(project.certificationStatus)}`}>
            {project.certificationStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Rating System:</span>
          <span className="text-xs font-medium text-foreground">{project.ratingTypeName}</span>
        </div>
        {project.hasConfig ? (
          <p className="text-[11px] text-muted-foreground">
            Approving registration also unlocks the certification workspace when a form config exists.
          </p>
        ) : null}
      </div>

      <Section title="Project Details" icon={FileText}>
        <DetailField label="Project Name" value={project.projectName} />
        <DetailField label="Project Category" value={project.category ?? ""} />
        <DetailField label="Type of Construction" value={project.constructionType ?? ""} />
        <DetailField label="City" value={project.city ?? ""} />
        <DetailField label="Rating System" value={project.ratingTypeName} />
      </Section>

      <Section title="Project Site Address" icon={MapPin}>
        <DetailField label="City" value={project.city ?? ""} />
      </Section>

      <Section title="Owner Details" icon={User}>
        <DetailField label="Owner Name" value={project.ownerName ?? ""} />
        <DetailField label="Mobile" value={project.ownerMobile ?? ""} />
        <DetailField label="Email" value={project.ownerEmail ?? ""} />
        <DetailField label="Organisation" value={project.ownerOrg ?? ""} />
      </Section>

      <Section title="Payment" icon={CreditCard}>
        <DetailField label="Payment Mode" value={project.paymentMode} />
      </Section>

      <Section title="Organisation" icon={Building2}>
        <DetailField label="Organisation" value={project.ownerOrg ?? ""} />
      </Section>
    </div>
  );
};

export default ProjectRegistrationView;
