import { ArrowLeft, MapPin, User, Building2, FileText, CreditCard } from "lucide-react";
import TableRowActions from "./TableRowActions";

interface ProjectRegistrationViewProps {
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

const ProjectRegistrationView = ({ onBack }: ProjectRegistrationViewProps) => {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="action-btn action-btn-outline !px-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Project Details — IGBCNE260066</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Fuel Outlets 12 · Registration View</p>
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

      {/* Status Bar */}
      <div className="kpi-card !py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Status:</span>
          <span className="status-badge status-pending">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Rating System:</span>
          <span className="text-xs font-medium text-foreground">Nest</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Construction:</span>
          <span className="text-xs font-medium text-foreground">New / Upcoming</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">IGBC Coffee Table:</span>
          <span className="text-xs font-medium text-foreground">Yes</span>
        </div>
      </div>

      {/* Project Details */}
      <Section title="Project Details" icon={FileText}>
        <DetailField label="Project Name" value="Fuel Outlets 12" />
        <DetailField label="Project Category" value="Commercial" />
        <DetailField label="Type of Construction" value="New / Upcoming" />
        <DetailField label="Type of Project" value="Mixed Use" />
        <DetailField label="Rating System" value="Nest" />
        <DetailField label="IGBC Coffee Table" value="Yes" />
      </Section>

      {/* Site Address */}
      <Section title="Project Site Address" icon={MapPin}>
        <DetailField label="Address Line 1" value="21-22, PAHARPUR BUSINESS CENTRE" />
        <DetailField label="Address Line 2" value="" />
        <DetailField label="City" value="New Delhi" />
        <DetailField label="State / UT" value="Delhi" />
        <DetailField label="Country" value="India" />
        <DetailField label="Pincode" value="110019" />
        <DetailField label="Number of Buildings" value="8" />
        <DetailField label="Site Area (sq.m)" value="650" />
        <DetailField label="Site Area (sq.ft)" value="—" />
        <DetailField label="Total Built-up Area (sq.m)" value="30" />
        <DetailField label="Total Built-up Area (sq.ft)" value="—" />
      </Section>

      {/* Project Contacts */}
      <Section title="Project Contacts" icon={Building2}>
        <DetailField label="Is Parent Organization IGBC Member?" value="No" />
        <DetailField label="Organization / Individual Name" value="—" />
        <DetailField label="Address Line 1" value="—" />
        <DetailField label="Address Line 2" value="—" />
        <DetailField label="City" value="—" />
        <DetailField label="State / UT" value="—" />
        <DetailField label="Country" value="—" />
        <DetailField label="Pincode" value="—" />
      </Section>

      {/* Project Owner */}
      <Section title="Project Owner" icon={User}>
        <DetailField label="Name" value="Mr Yadav" />
        <DetailField label="Organization" value="Indian e-truck coalition" />
        <DetailField label="Designation" value="—" />
        <DetailField label="Mobile Number" value="9182374720" />
        <DetailField label="Email ID" value="bhushany@yopmail.com" />
      </Section>

      {/* Project Coordinator */}
      <Section title="Project Coordinator" icon={User}>
        <DetailField label="Name" value="Mr Lavona Davis" />
        <DetailField label="Organization" value="Indian e-truck coalition" />
        <DetailField label="Designation" value="—" />
        <DetailField label="Mobile Number" value="9192001706" />
        <DetailField label="Email ID" value="brian.kassulke@hotmail.com" />
      </Section>

      {/* Invoice Details */}
      <Section title="Invoice Details" icon={FileText}>
        <DetailField label="Organization" value="Indian e-truck coalition" />
        <DetailField label="Address Line 1" value="CII-Sohrabji Godrej Green Business Centre" />
        <DetailField label="Address Line 2" value="Survey No.64, Kothaguda Post, R R District" />
        <DetailField label="City" value="Hyderabad" />
        <DetailField label="State / UT" value="Telangana" />
        <DetailField label="Country" value="India" />
        <DetailField label="Pincode" value="500008" />
        <DetailField label="Having GST Number?" value="No" />
        <DetailField label="PAN Number" value="BHYPY3232W" />
        <DetailField label="Project Falling Under SEZ?" value="—" />
        <DetailField label="TDS @ 10%?" value="No" />
        <DetailField label="Required Advance Tax Invoice?" value="No" />
      </Section>

      {/* Payment Details */}
      <Section title="Payment Details" icon={CreditCard}>
        <DetailField label="Payment Type" value="Demand Draft" />
        <DetailField label="Demand Draft Number" value="938973" />
        <DetailField label="Bank" value="State Bank of India" />
        <DetailField label="Branch" value="NAVAL BASE" />
        <DetailField label="Date" value="09 Apr 2026" />
        <DetailField label="Amount Paid" value="₹5,900 (Inclusive of GST Tax)" />
      </Section>
    </div>
  );
};

export default ProjectRegistrationView;
