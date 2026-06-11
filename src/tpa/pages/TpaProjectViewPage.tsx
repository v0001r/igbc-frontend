import { Link, useParams } from "react-router-dom";
import { CertificationReadOnlyWorkspace } from "@/components/greenHomes/CertificationReadOnlyWorkspace";

export default function TpaProjectViewPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>;
  }

  return (
    <div className="space-y-4">
      <Link to="/tpa" className="text-sm font-medium text-primary hover:underline">
        ← Back to dashboard
      </Link>
      <CertificationReadOnlyWorkspace projectId={id} />
    </div>
  );
}
