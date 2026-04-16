import { useState } from "react";
import DataTable from "../components/DataTable";
import ProjectCertificationView from "../components/ProjectCertificationView";
import TableRowActions from "../components/TableRowActions";

const certifications = [
  { certId: "IGBCGI250219", projectTitle: "Shayne Schumm", category: "Commercial", ratingSystem: "IGBC Green Factory Buildings", certType: "Certification", status: "Under Review" },
  { certId: "IGBCGI250225", projectTitle: "Green Office Tower", category: "Commercial", ratingSystem: "IGBC Green Interiors", certType: "Pre-Certification", status: "Approved" },
  { certId: "IGBCGI250230", projectTitle: "Eco Homes Phase 3", category: "Residential", ratingSystem: "IGBC Green Homes", certType: "Certification", status: "Issued" },
  { certId: "IGBCGI250236", projectTitle: "Solar Business Park", category: "SEZ", ratingSystem: "IGBC Green SEZ", certType: "Certification", status: "Under Review" },
  { certId: "IGBCGI250241", projectTitle: "Wind Valley Resort", category: "Hospitality", ratingSystem: "IGBC Green Homes", certType: "Pre-Certification", status: "Approved" },
];

const ProjectCertificationPage = () => {
  const [viewCert, setViewCert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  if (viewCert) {
    return <ProjectCertificationView onBack={() => setViewCert(null)} />;
  }

  const tabs = ["All Requests", "Under Review", "Approved", "Issued"];

  const columns = [
    { key: "certId", label: "Cert ID", sortable: true },
    { key: "projectTitle", label: "Project Title", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "ratingSystem", label: "Rating System" },
    { key: "certType", label: "Type" },
    { key: "status", label: "Status", render: (v: string) => {
      const cls = v === "Approved" || v === "Issued" ? "status-approved" : v === "Under Review" ? "status-pending" : "status-rejected";
      return <span className={`status-badge ${cls}`}>{v}</span>;
    }},
    { key: "actions", label: "Action", render: (_: any, row: any) => (
      <TableRowActions
        actions={[{ label: "View", onClick: () => setViewCert(row.certId), variant: "primary" }]}
      />
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-5 border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActiveTab(i)}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
              i === activeTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <DataTable columns={columns} data={certifications} title="Project Certifications" />
    </div>
  );
};

export default ProjectCertificationPage;
