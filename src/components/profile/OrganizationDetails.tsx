import { FormField } from "./FormField";
import { Plus } from "lucide-react";

type OrganizationForm = {
  organizationName: string;
  designation: string;
  department: string;
  yearsOfExperience: string;
  employeeId: string;
  organizationType: string;
};

interface OrganizationDetailsProps {
  values: OrganizationForm;
  onChange: (field: keyof OrganizationForm, value: string) => void;
}

export const OrganizationDetails = ({ values, onChange }: OrganizationDetailsProps) => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Organization Details</h2>
        <button className="flex items-center gap-1.5 rounded-xl bg-primary-muted px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add Organization
        </button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Organization Name" value={values.organizationName} onChange={(v) => onChange("organizationName", v)} placeholder="Search organization..." />
        <FormField label="Designation" value={values.designation} onChange={(v) => onChange("designation", v)} placeholder="e.g. Senior Architect" />
        <FormField label="Department" value={values.department} onChange={(v) => onChange("department", v)} placeholder="e.g. Design" />
        <FormField label="Years of Experience" value={values.yearsOfExperience} onChange={(v) => onChange("yearsOfExperience", v)} placeholder="e.g. 10" />
        <FormField label="Employee ID" value={values.employeeId} onChange={(v) => onChange("employeeId", v)} placeholder="Optional" />
        <FormField label="Organization Type" value={values.organizationType} onChange={(v) => onChange("organizationType", v)} type="select" options={["Architecture Firm", "Construction", "Consulting", "Government", "Education", "Other"]} />
      </div>
    </div>
  );
};
