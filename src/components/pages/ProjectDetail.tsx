import { useParams } from "react-router-dom";

const ProjectDetail = () => {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Project Detail</h1>
      <p className="text-muted-foreground">
        Project id: <span className="font-mono">{id ?? "unknown"}</span>
      </p>
      <div className="mt-6 rounded-md border bg-card p-4 text-sm">
        This page is a placeholder. If you already have a real project detail
        component, point the route to it instead.
      </div>
    </div>
  );
};

export default ProjectDetail;

