import { useState } from "react";
import DataTable from "../components/DataTable";
import ProjectRegistrationView from "../components/ProjectRegistrationView";
import TableRowActions from "../components/TableRowActions";

const projects = [
  { projectId: "IGBCNE260066", projectName: "Hungerford House", ratingSystem: "IGBC Green Homes", ownerName: "Soubhagya Nirman LLP", ownerMobile: "9830022315", ownerEmail: "hmodi@sugamhomes.com", organisation: "Sugam Group", paymentMode: "offline", approvalStatus: "Pending" },
  { projectId: "IGBC260072", projectName: "Mahindra Codename M3.84SaiBaba", ratingSystem: "IGBC Green Homes", ownerName: "Girish Menon", ownerMobile: "9987559115", ownerEmail: "MENON.GIRISH@mahindra.com", organisation: "Mahindra Lifespace Developers", paymentMode: "offline", approvalStatus: "Pending" },
  { projectId: "IGBC260081", projectName: "VIP Guest house and Hostel building at MGIRI", ratingSystem: "IGBC Green Homes", ownerName: "SG Ganjale", ownerMobile: "9960300048", ownerEmail: "ganeshg@ganrajengineering.com", organisation: "Ganraj Engineering", paymentMode: "offline", approvalStatus: "Pending" },
  { projectId: "IGBC260089", projectName: "Ananta Green home", ratingSystem: "IGBC Green Homes", ownerName: "Rishi Todi", ownerMobile: "9831174533", ownerEmail: "rishi@nprgroup.in", organisation: "NPR Housing LLP", paymentMode: "offline", approvalStatus: "Pending" },
  { projectId: "IGBC260095", projectName: "Foresta Group Housing Project", ratingSystem: "IGBC Green Homes", ownerName: "FAISAL MUSHTAQ", ownerMobile: "9151114040", ownerEmail: "management1@inoneoak.com", organisation: "YCL INFRATECH PRIVATE LIMITED", paymentMode: "offline", approvalStatus: "Pending" },
  { projectId: "IGBC260102", projectName: "CII GBC New Test 2", ratingSystem: "IGBC Green Factory Buildings", ownerName: "Rishav Kumar", ownerMobile: "9424858879", ownerEmail: "rishav.kumar@cii.in", organisation: "CII IGBC", paymentMode: "offline", approvalStatus: "Pending" },
  { projectId: "IGBC260110", projectName: "SBI GHAZIPUR DAIRY FARM BRANCH NEW DELHI", ratingSystem: "IGBC Green Interiors", ownerName: "NAVIN KUMAR", ownerMobile: "9430966364", ownerEmail: "agmpre.lhodel@sbi.co.in", organisation: "STATE BANK OF INDIA", paymentMode: "offline", approvalStatus: "Approved" },
];

const ProjectsPage = () => {
  const [viewProject, setViewProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  if (viewProject) {
    return <ProjectRegistrationView onBack={() => setViewProject(null)} />;
  }

  const tabs = ["Submitted Projects", "Saved Projects", "Approved", "Rejected", "Bulk Import"];

  const columns = [
    { key: "projectName", label: "Project Details", sortable: true, render: (_: any, row: any) => (
      <div className="space-y-0.5">
        <p className="font-medium text-foreground text-xs">{row.projectName}</p>
        <p className="text-muted-foreground text-[11px]">{row.ratingSystem}</p>
      </div>
    )},
    { key: "ownerDetails", label: "Owner Details", render: (_: any, row: any) => (
      <div className="space-y-0.5">
        <p className="font-medium text-foreground text-xs">{row.ownerName}</p>
        <p className="text-muted-foreground text-[11px]">{row.ownerMobile}</p>
        <p className="text-muted-foreground text-[11px]">{row.ownerEmail}</p>
        <p className="text-muted-foreground text-[11px]">{row.organisation}</p>
      </div>
    )},
    { key: "paymentMode", label: "Payment", sortable: true },
    { key: "approvalStatus", label: "Status", render: (v: string) => (
      <span className={`status-badge ${v === "Approved" ? "status-approved" : "status-pending"}`}>{v}</span>
    )},
    { key: "actions", label: "Action", render: (_: any, row: any) => (
      <TableRowActions
        actions={[{ label: "View", onClick: () => setViewProject(row.projectId), variant: "primary" }]}
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
      <DataTable columns={columns} data={projects} title="Project Registrations" showEmail />
    </div>
  );
};

export default ProjectsPage;
