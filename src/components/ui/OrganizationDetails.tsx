import { FormField } from "./FormField";

export const OrganizationDetails = () => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">Organization Details</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Organization Name" placeholder="Search organization..." />
        <FormField label="Designation" placeholder="e.g. Senior Architect" />
        <FormField label="Department" placeholder="e.g. Design" />
        <FormField label="Years of Experience" placeholder="e.g. 10" />
        <FormField label="Employee ID" placeholder="Optional" />
        <FormField label="Organization Type" type="select" options={["Architecture Firm", "Construction", "Consulting", "Government", "Education", "Other"]} />
      </div>
    </div>
  );
};
