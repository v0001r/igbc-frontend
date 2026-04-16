import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, User, Building2, MapPin, AlertCircle } from "lucide-react";

interface ContactData {
  showInDirectory: boolean;
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  telephone: string;
  organization: string;
  designation: string;
  department: string;
  country: string;
  address: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  gst: string;
}

interface Step2Props {
  data: ContactData;
  onUpdate: (data: ContactData) => void;
  onNext: (data: ContactData) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  error = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const showError = touched && required && !value && error;

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTouched(true); }}
          className={`w-full rounded-xl border bg-card px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/50 ${
            showError
              ? "border-destructive ring-2 ring-destructive/15"
              : focused
              ? "border-emerald ring-2 ring-emerald/15 shadow-sm"
              : "border-border hover:border-muted-foreground/30"
          }`}
        />
        {showError && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </motion.div>
        )}
      </div>
      {showError && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-[11px] text-destructive font-medium">
          {error}
        </motion.p>
      )}
    </div>
  );
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-foreground">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 hover:border-muted-foreground/30 focus:border-emerald focus:ring-2 focus:ring-emerald/15"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];
const countries = ["India"];

const SectionCard = ({
  icon: Icon,
  iconBg,
  title,
  subtitle,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
  >
    <div className="flex items-center gap-3 border-b border-border px-6 py-4 bg-ghost/50">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

export const Step2Contacts = ({ data, onUpdate, onNext, onBack, loading = false }: Step2Props) => {
  const [form, setForm] = useState<ContactData>(data);
  const set = (key: keyof ContactData, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const setBool = (key: keyof ContactData, val: boolean) => setForm((p) => ({ ...p, [key]: val }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const pincodeValid = /^\d{6}$/.test(form.pincode.trim());
  const mobileValid = /^\d{10,15}$/.test(form.mobile.replace(/\D/g, ""));
  const telephoneValid = /^\d{6,15}$/.test(form.telephone.replace(/\D/g, ""));
  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.trim().toUpperCase());
  const gstValid =
    form.gst.trim() === "" || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(form.gst.trim().toUpperCase());
  const isValid = Boolean(
    form.salutation &&
      form.firstName &&
      form.lastName &&
      form.organization &&
      form.designation &&
      form.department &&
      form.state &&
      form.city &&
      form.address &&
      emailValid &&
      pincodeValid &&
      mobileValid &&
      telephoneValid &&
      panValid &&
      gstValid,
  );
  const filledCount = [
    form.salutation,
    form.firstName,
    form.middleName,
    form.lastName,
    form.email,
    form.mobile,
    form.telephone,
    form.organization,
    form.designation,
    form.department,
    form.country,
    form.address,
    form.addressLine2,
    form.city,
    form.state,
    form.pincode,
    form.pan,
    form.gst,
  ].filter(Boolean).length;
  const progress = Math.round((filledCount / 18) * 100);

  const handleNext = async () => {
    if (isValid) {
      onUpdate(form);
      await onNext(form);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-[11px] font-bold text-emerald-foreground">2</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald">Step 2 of 5</span>
        </div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Your Contact Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Fill in your personal and organization information</p>

        {/* Form progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
            <input
              type="checkbox"
              checked={form.showInDirectory}
              onChange={(e) => setBool("showInDirectory", e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Show primary contact in membership directory
          </label>
        </div>

        {/* Personal */}
        <SectionCard icon={User} iconBg="bg-emerald/10 text-emerald" title="Personal Details" subtitle="Your primary contact information" delay={0}>
          <div className="grid gap-4 sm:grid-cols-4">
            <SelectField label="Salutation" value={form.salutation} onChange={(v) => set("salutation", v)} options={["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."]} placeholder="Title" />
            <div className="sm:col-span-1">
              <InputField label="First Name" value={form.firstName} onChange={(v) => set("firstName", v)} required placeholder="John" error="First name is required" />
            </div>
            <div className="sm:col-span-1">
              <InputField label="Middle Name" value={form.middleName} onChange={(v) => set("middleName", v)} placeholder="Robert" />
            </div>
            <div className="sm:col-span-2">
              <InputField label="Last Name" value={form.lastName} onChange={(v) => set("lastName", v)} required placeholder="Doe" error="Last name is required" />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <InputField label="Email Address" value={form.email} onChange={(v) => set("email", v)} type="email" required placeholder="john@company.com" error="Email is required" />
            <InputField label="Mobile Number" value={form.mobile} onChange={(v) => set("mobile", v)} type="tel" required placeholder="+91 98765 43210" error="Mobile number is required" />
            <InputField label="Telephone Number" value={form.telephone} onChange={(v) => set("telephone", v)} type="tel" placeholder="040-12345678" />
          </div>
        </SectionCard>

        {/* Organization */}
        <SectionCard icon={Building2} iconBg="bg-ocean/10 text-ocean" title="Organization Details" subtitle="Your workplace information (optional)" delay={0.1}>
          <div className="grid gap-4 sm:grid-cols-3">
            <InputField label="Organization Name" value={form.organization} onChange={(v) => set("organization", v)} required placeholder="e.g., Tata Projects Ltd" />
            <InputField label="Designation" value={form.designation} onChange={(v) => set("designation", v)} required placeholder="e.g., Senior Architect" />
            <InputField label="Department" value={form.department} onChange={(v) => set("department", v)} required placeholder="e.g., Coordination" />
          </div>
        </SectionCard>

        {/* Address */}
        <SectionCard icon={MapPin} iconBg="bg-accent/10 text-accent" title="Communication Address" subtitle="Your mailing address for correspondence" delay={0.2}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Street Address" value={form.address} onChange={(v) => set("address", v)} required placeholder="e.g., 42, MG Road, Near Metro Station" />
              <InputField label="Address Line 2" value={form.addressLine2} onChange={(v) => set("addressLine2", v)} placeholder="Landmark / Area" />
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <SelectField label="Country" value={form.country} onChange={(v) => set("country", v)} options={countries} />
              <InputField label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="e.g., Hyderabad" />
              <SelectField label="State" value={form.state} onChange={(v) => set("state", v)} options={states} />
              <InputField label="PIN Code" value={form.pincode} onChange={(v) => set("pincode", v)} placeholder="e.g., 500001" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="PAN" value={form.pan} onChange={(v) => set("pan", v)} required placeholder="ABCDE1234F" />
              <InputField label="GST" value={form.gst} onChange={(v) => set("gst", v)} placeholder="22ABCDE1234F1Z5" />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card"
      >
        <motion.button
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-ghost"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          {!isValid && <AlertCircle className="h-3.5 w-3.5 text-gold" />}
          {isValid ? (
            <span className="text-primary font-medium">✓ All required fields filled</span>
          ) : (
            <span>Fill required fields to continue</span>
          )}
        </div>
        <motion.button
          whileHover={isValid ? { scale: 1.03, x: 3 } : {}}
          whileTap={isValid ? { scale: 0.97 } : {}}
          onClick={() => void handleNext()}
          disabled={!isValid || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald px-7 py-3 text-sm font-semibold text-emerald-foreground shadow-premium transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? "Saving..." : "Review"} {!loading && <ArrowRight className="h-4 w-4" />}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
