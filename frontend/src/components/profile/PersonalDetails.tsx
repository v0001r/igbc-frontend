import { FormField } from "./FormField";

type PersonalProfileForm = {
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  displayName: string;
  email: string;
  mobile: string;
  telephone: string;
};

interface PersonalDetailsProps {
  values: PersonalProfileForm;
  onChange: (field: keyof PersonalProfileForm, value: string) => void;
  errors?: Partial<Record<keyof PersonalProfileForm, string>>;
}

export const PersonalDetails = ({ values, onChange, errors }: PersonalDetailsProps) => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <h2 className="mb-6 text-base font-semibold text-foreground">Personal Information</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Salutation" value={values.salutation} onChange={(v) => onChange("salutation", v)} type="select" options={["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Er."]} />
        <FormField label="First Name" value={values.firstName} onChange={(v) => onChange("firstName", v)} required error={errors?.firstName} fieldKey="firstName" />
        <FormField label="Middle Name" value={values.middleName} onChange={(v) => onChange("middleName", v)} />
        <FormField label="Last Name" value={values.lastName} onChange={(v) => onChange("lastName", v)} required error={errors?.lastName} fieldKey="lastName" />
        <FormField label="Display Name" value={values.displayName} onChange={(v) => onChange("displayName", v)} />
        <FormField label="Email ID" value={values.email} onChange={(v) => onChange("email", v)} type="email" />
        <FormField label="Mobile No." value={values.mobile} onChange={(v) => onChange("mobile", v)} required error={errors?.mobile} fieldKey="mobile" />
        <FormField label="Telephone No." value={values.telephone} onChange={(v) => onChange("telephone", v)} placeholder="022-123456" />
      </div>
    </div>
  );
};
