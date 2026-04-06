import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, User, Building2, MapPin, AlertCircle } from "lucide-react";

interface ContactData {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  organization: string;
  designation: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Step2Props {
  data: ContactData;
  onUpdate: (data: ContactData) => void;
  onNext: () => void;
  onBack: () => void;
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

export const Step2Contacts = ({ data, onUpdate, onNext, onBack }: Step2Props) => {
  const [form, setForm] = useState<ContactData>(data);
  const set = (key: keyof ContactData, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const isValid = form.firstName && form.lastName && form.email && form.mobile;
  const filledCount = [form.firstName, form.lastName, form.email, form.mobile, form.organization, form.designation, form.address, form.city, form.state, form.pincode].filter(Boolean).length;
  const progress = Math.round((filledCount / 10) * 100);

  const handleNext = () => {
    if (isValid) {
      onUpdate(form);
      onNext();
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
        {/* Personal */}
        <SectionCard icon={User} iconBg="bg-emerald/10 text-emerald" title="Personal Details" subtitle="Your primary contact information" delay={0}>
          <div className="grid gap-4 sm:grid-cols-4">
            <SelectField label="Salutation" value={form.salutation} onChange={(v) => set("salutation", v)} options={["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."]} placeholder="Title" />
            <div className="sm:col-span-1">
              <InputField label="First Name" value={form.firstName} onChange={(v) => set("firstName", v)} required placeholder="John" error="First name is required" />
            </div>
            <div className="sm:col-span-2">
              <InputField label="Last Name" value={form.lastName} onChange={(v) => set("lastName", v)} required placeholder="Doe" error="Last name is required" />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InputField label="Email Address" value={form.email} onChange={(v) => set("email", v)} type="email" required placeholder="john@company.com" error="Email is required" />
            <InputField label="Mobile Number" value={form.mobile} onChange={(v) => set("mobile", v)} type="tel" required placeholder="+91 98765 43210" error="Mobile number is required" />
          </div>
        </SectionCard>

        {/* Organization */}
        <SectionCard icon={Building2} iconBg="bg-ocean/10 text-ocean" title="Organization Details" subtitle="Your workplace information (optional)" delay={0.1}>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Organization Name" value={form.organization} onChange={(v) => set("organization", v)} placeholder="e.g., Tata Projects Ltd" />
            <InputField label="Designation" value={form.designation} onChange={(v) => set("designation", v)} placeholder="e.g., Senior Architect" />
          </div>
        </SectionCard>

        {/* Address */}
        <SectionCard icon={MapPin} iconBg="bg-accent/10 text-accent" title="Communication Address" subtitle="Your mailing address for correspondence" delay={0.2}>
          <div className="space-y-4">
            <InputField label="Street Address" value={form.address} onChange={(v) => set("address", v)} placeholder="e.g., 42, MG Road, Near Metro Station" />
            <div className="grid gap-4 sm:grid-cols-3">
              <InputField label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="e.g., Hyderabad" />
              <SelectField label="State" value={form.state} onChange={(v) => set("state", v)} options={states} />
              <InputField label="PIN Code" value={form.pincode} onChange={(v) => set("pincode", v)} placeholder="e.g., 500001" />
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
          onClick={handleNext}
          disabled={!isValid}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald px-7 py-3 text-sm font-semibold text-emerald-foreground shadow-premium transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Review <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
