import { FormField } from "./FormField";

type AddressForm = {
  country: string;
  state: string;
  city: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
};

interface AddressDetailsProps {
  values: AddressForm;
  onChange: (field: keyof AddressForm, value: string) => void;
  errors?: Partial<Record<keyof AddressForm, string>>;
}

export const AddressDetails = ({ values, onChange, errors }: AddressDetailsProps) => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <h2 className="mb-6 text-base font-semibold text-foreground">Address</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Country" value={values.country} onChange={(v) => onChange("country", v)} required error={errors?.country} fieldKey="country" type="select" options={["India", "USA", "UK", "UAE"]} />
        <FormField label="State / UT" value={values.state} onChange={(v) => onChange("state", v)} required error={errors?.state} fieldKey="state" type="select" options={["Andhra Pradesh", "Karnataka", "Tamil Nadu", "Telangana", "Maharashtra"]} />
        <FormField label="City" value={values.city} onChange={(v) => onChange("city", v)} placeholder="Search for city" required error={errors?.city} fieldKey="city" />
        <FormField label="PIN Code" value={values.pincode} onChange={(v) => onChange("pincode", v)} placeholder="" required error={errors?.pincode} fieldKey="pincode" />
        <div className="sm:col-span-2">
          <FormField label="Address Line 1" value={values.addressLine1} onChange={(v) => onChange("addressLine1", v)} placeholder="Flat no - 101, ABC Apartment" required error={errors?.addressLine1} fieldKey="addressLine1" />
        </div>
        <div className="sm:col-span-2">
          <FormField label="Address Line 2" value={values.addressLine2} onChange={(v) => onChange("addressLine2", v)} />
        </div>
      </div>
    </div>
  );
};
