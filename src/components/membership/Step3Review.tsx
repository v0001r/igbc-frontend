import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Pencil, User, Building2, MapPin, Tag, Shield } from "lucide-react";

interface Step3Props {
  categoryData: { membershipType: string; category: string };
  contactData: {
    salutation: string; firstName: string; lastName: string;
    email: string; mobile: string; organization: string;
    designation: string; address: string; city: string;
    state: string; pincode: string;
  };
  onNext: () => void;
  onBack: () => void;
  onEditStep: (step: number) => void;
}

const typeLabels: Record<string, string> = {
  individual: "Individual Member",
  professional: "Professional Member",
  corporate: "Corporate Member",
  institutional: "Institutional Member",
};

const ReviewSection = ({
  icon: Icon,
  iconBg,
  title,
  onEdit,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
  >
    <div className="flex items-center justify-between border-b border-border px-6 py-3.5 bg-ghost/50">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-ocean hover:bg-ocean/5 transition-colors"
      >
        <Pencil className="h-3 w-3" /> Edit
      </button>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
    <p className="text-sm font-medium text-foreground truncate">{value || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
  </div>
);

export const Step3Review = ({ categoryData, contactData, onNext, onBack, onEditStep }: Step3Props) => {
  const fullName = [contactData.salutation, contactData.firstName, contactData.lastName].filter(Boolean).join(" ");
  const location = [contactData.city, contactData.state].filter(Boolean).join(", ");

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
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-[11px] font-bold text-emerald-foreground">3</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald">Step 3 of 5</span>
        </div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Review Your Application</h2>
        <p className="mt-1 text-sm text-muted-foreground">Please verify all details before generating your invoice</p>
      </div>

      <div className="space-y-5">
        <ReviewSection icon={Tag} iconBg="bg-primary/10 text-primary" title="Membership" onEdit={() => onEditStep(1)} delay={0}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Membership Type" value={typeLabels[categoryData.membershipType] || categoryData.membershipType} />
            <Field label="Category" value={categoryData.category} />
          </div>
        </ReviewSection>

        <ReviewSection icon={User} iconBg="bg-emerald/10 text-emerald" title="Personal Details" onEdit={() => onEditStep(2)} delay={0.08}>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Full Name" value={fullName} />
            <Field label="Email" value={contactData.email} />
            <Field label="Mobile" value={contactData.mobile} />
          </div>
        </ReviewSection>

        <ReviewSection icon={Building2} iconBg="bg-ocean/10 text-ocean" title="Organization" onEdit={() => onEditStep(2)} delay={0.16}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Organization" value={contactData.organization} />
            <Field label="Designation" value={contactData.designation} />
          </div>
        </ReviewSection>

        <ReviewSection icon={MapPin} iconBg="bg-accent/10 text-accent" title="Address" onEdit={() => onEditStep(2)} delay={0.24}>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Street Address" value={contactData.address} />
            <Field label="City / State" value={location} />
            <Field label="PIN Code" value={contactData.pincode} />
          </div>
        </ReviewSection>
      </div>

      {/* Confirmation banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary-muted px-5 py-4"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Everything looks good?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your data is encrypted and secure. Click edit above to make changes.</p>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
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
        <motion.button
          whileHover={{ scale: 1.03, x: 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald px-7 py-3 text-sm font-semibold text-emerald-foreground shadow-premium transition-all"
        >
          Generate Invoice <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
