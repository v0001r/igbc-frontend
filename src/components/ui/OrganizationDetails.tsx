import { FormField } from "./FormField";
import { Plus } from "lucide-react";

export const OrganizationDetails = () => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Organization Details</h2>
        <button className="flex items-center gap-1.5 rounded-xl bg-primary-muted px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add Organization
        </button>
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
