import { FormField } from "./FormField";

export const AddressDetails = () => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <h2 className="mb-6 text-base font-semibold text-foreground">Address</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Country" defaultValue="India" required type="select" options={["India", "USA", "UK", "UAE"]} />
        <FormField label="State / UT" defaultValue="Andhra Pradesh" required type="select" options={["Andhra Pradesh", "Karnataka", "Tamil Nadu", "Telangana", "Maharashtra"]} />
        <FormField label="City" placeholder="Search for city" required />
        <FormField label="PIN Code" placeholder="" required />
        <div className="sm:col-span-2">
          <FormField label="Address Line 1" placeholder="Flat no - 101, ABC Apartment" required />
        </div>
        <div className="sm:col-span-2">
          <FormField label="Address Line 2" defaultValue="Madhapur" />
        </div>
      </div>
    </div>
  );
};
