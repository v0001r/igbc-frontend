import { FormField } from "./FormField";

export const PersonalDetails = () => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <h2 className="mb-6 text-base font-semibold text-foreground">Personal Information</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Salutation" defaultValue="Mr" type="select" options={["Mr", "Mrs", "Ms", "Dr"]} />
        <FormField label="First Name" defaultValue="Lavona" required />
        <FormField label="Middle Name" />
        <FormField label="Last Name" defaultValue="Davis" required />
        <FormField label="Display Name" defaultValue="Davis" />
        <FormField label="Email ID" defaultValue="brian.kassulke@hotmail.com" type="email" />
        <FormField label="Mobile No." defaultValue="9192001706" required />
        <FormField label="Telephone No." placeholder="022-123456" />
      </div>
    </div>
  );
};
