import { Link, useParams } from "react-router-dom";
import { CertificationReadOnlyWorkspace } from "@/components/greenHomes/CertificationReadOnlyWorkspace";

type Props = {
  isLead?: boolean;
};

export default function StaffProjectViewPage({ isLead = false }: Props) {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>;
  }

  const backTo = isLead ? "/staff/lead" : "/staff";

  return (
    <div className="space-y-4">
      <Link to={backTo} className="text-sm font-medium text-primary hover:underline">
        ← Back to dashboard
      </Link>
      <CertificationReadOnlyWorkspace projectId={id} />
    </div>
  );
}
