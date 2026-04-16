import { ArrowLeft, FileText, Building2, User, CreditCard, Leaf, Activity } from "lucide-react";
import TableRowActions from "./TableRowActions";

interface ProjectCertificationViewProps {
  onBack: () => void;
}

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="detail-label">{label}</p>
    <p className="detail-value">{value || "—"}</p>
  </div>
);

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="kpi-card !p-0 overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
      <Icon className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
      <h3 className="section-header !mb-0 !pb-0 !border-0">{title}</h3>
    </div>
    <div className="detail-grid px-5 py-4">{children}</div>
  </div>
);

const ProjectCertificationView = ({ onBack }: ProjectCertificationViewProps) => {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="action-btn action-btn-outline !px-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Certification — IGBCGI250219</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Shayne Schumm · Certification View</p>
          </div>
        </div>
        <TableRowActions
          actions={[
            { label: "Print", onClick: () => undefined, variant: "outline" },
            { label: "Export", onClick: () => undefined, variant: "outline" },
            { label: "Edit", onClick: () => undefined, variant: "primary" },
          ]}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="kpi-card">
          <h3 className="section-header">Project Details</h3>
          <div className="space-y-2.5">
            <DetailField label="Project ID" value="IGBCGI250219" />
            <DetailField label="Project Title" value="Shayne Schumm" />
            <DetailField label="Project Category" value="Commercial" />
            <DetailField label="Rating System" value="IGBC Green Factory Buildings" />
          </div>
        </div>
        <div className="kpi-card">
          <h3 className="section-header">Certification Details</h3>
          <div className="space-y-2.5">
            <DetailField label="Certification Type" value="Certification" />
            <DetailField label="Site Area" value="12 (Sq.M) or 129 (in Sq.Ft)" />
            <DetailField label="Total Built-up Area" value="14 (sq.m) or 151 (sq.ft)" />
            <DetailField label="No. of Buildings" value="4" />
          </div>
        </div>
        <div className="kpi-card">
          <h3 className="section-header">Membership Details</h3>
          <div className="space-y-2.5">
            <DetailField label="Is Parent Organization an IGBC Member?" value="No" />
          </div>
        </div>
      </div>

      {/* Project Details */}
      <Section title="Project Details" icon={Building2}>
        <DetailField label="Organization / Individual Name" value="Naveen Kumar" />
        <DetailField label="Address Line 1" value="Mind Space, HYD" />
        <DetailField label="City" value="Hyderabad" />
        <DetailField label="State / UT" value="Telangana" />
        <DetailField label="Country" value="India" />
        <DetailField label="Pincode" value="500081" />
      </Section>

      {/* Project Savings */}
      <Section title="Project Savings" icon={Leaf}>
        <DetailField label="Annual Water Savings (Liters)" value="—" />
        <DetailField label="Air-conditioning Savings (kWh)" value="—" />
        <DetailField label="LPD Savings (kWh)" value="—" />
        <DetailField label="Renewable Energy Savings (kWh)" value="—" />
      </Section>

      {/* Payment Details */}
      <div className="kpi-card !p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <CreditCard className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
          <h3 className="section-header !mb-0 !pb-0 !border-0">Payment Details</h3>
        </div>
        <div className="px-5 py-4 space-y-5">
          {/* Registration Fee */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">Registration Fee</p>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payment Type</th>
                    <th>Cheque Number</th>
                    <th>Bank</th>
                    <th>Branch</th>
                    <th>Date</th>
                    <th>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cheque</td>
                    <td>870304</td>
                    <td>ICICI Bank</td>
                    <td>SHILPA HILLS KONDAPUR</td>
                    <td>11 Sep 2025</td>
                    <td>₹5,900.00 (Incl. GST)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Certification Fee */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">Certification Fee</p>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payment Type</th>
                    <th>Cheque Number</th>
                    <th>Bank</th>
                    <th>Branch</th>
                    <th>Date</th>
                    <th>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cheque</td>
                    <td>029993</td>
                    <td>ICICI Bank</td>
                    <td>SHILPA HILLS KONDAPUR</td>
                    <td>11 Oct 2025</td>
                    <td>₹6,78,500.00 (Incl. GST)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="text-[11px] font-medium mt-2 hover:underline" style={{ color: "hsl(var(--primary))" }}>
              Fee Break-up →
            </button>
          </div>
        </div>
      </div>

      {/* Latest Activities */}
      <Section title="Latest Activities" icon={Activity}>
        <div className="col-span-full text-xs text-muted-foreground py-4 text-center">
          No recent activity for this project.
        </div>
      </Section>
    </div>
  );
};

export default ProjectCertificationView;
