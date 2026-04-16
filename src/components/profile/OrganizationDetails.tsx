import { FormField } from "./FormField";

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
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">Organization Details</h2>
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
