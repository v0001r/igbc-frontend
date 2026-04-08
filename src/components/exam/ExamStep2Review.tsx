import { motion } from "framer-motion";
import { User, MapPin, GraduationCap, Building2, Calendar, ShieldCheck, Pencil, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExamFormData } from "@/components/pages/APExam";

interface Props {
  formData: ExamFormData;
  onEdit: () => void;
  onNext: () => void;
}

const ReviewSection = ({
  icon: Icon,
  title,
  onEdit,
  children,
  delay = 0,
}: {
  icon: any;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-2xl bg-card shadow-card overflow-hidden"
  >
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-muted">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 text-xs font-medium text-ocean hover:underline"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
    </div>
    <div className="px-5 py-4">{children}</div>
  </motion.div>
);

const ReviewField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="mt-0.5 text-sm text-foreground">{value || "—"}</p>
  </div>
);

export const ExamStep2Review = ({ formData, onEdit, onNext }: Props) => {
  const examFee = 3000;

  const examDateLabel = formData.examDate
    ? new Date(formData.examDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Please verify all information before proceeding to payment.
            </p>
          </div>
        </motion.div>

        <ReviewSection icon={User} title="Personal Information" onEdit={onEdit} delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewField label="Full Name" value={`${formData.firstName} ${formData.lastName}`} />
            <ReviewField label="Email" value={formData.email} />
            <ReviewField label="Mobile" value={`+91 ${formData.mobile}`} />
          </div>
        </ReviewSection>

        <ReviewSection icon={MapPin} title="Address Details" onEdit={onEdit} delay={0.1}>
          <ReviewField
            label="Address"
            value={`${formData.addressLine1}${formData.addressLine2 ? ", " + formData.addressLine2 : ""}, ${formData.city}, ${formData.state} - ${formData.pincode}`}
          />
        </ReviewSection>

        <ReviewSection icon={GraduationCap} title="Educational Details" onEdit={onEdit} delay={0.15}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewField label="Qualification" value={formData.qualification} />
            <ReviewField label="Experience" value={`${formData.experience} years`} />
          </div>
        </ReviewSection>

        {(formData.organization || formData.designation) && (
          <ReviewSection icon={Building2} title="Organization" onEdit={onEdit} delay={0.2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewField label="Organization" value={formData.organization} />
              <ReviewField label="Designation" value={formData.designation} />
            </div>
          </ReviewSection>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:sticky lg:top-24 space-y-4 h-fit">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card shadow-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean/10">
              <Calendar className="h-4 w-4 text-ocean" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Exam Slot</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">{examDateLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium text-foreground">11:00 AM</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-card shadow-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <ShieldCheck className="h-4 w-4 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">ID Proof</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-foreground">{formData.idProofType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Number</span>
              <span className="font-mono font-medium text-foreground">{formData.idProofNumber}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card shadow-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">Fee Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Exam Fee</span>
              <span className="font-mono">₹ {examFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="my-2 h-px bg-border" />
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span className="font-mono text-primary">₹ {examFee.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border-2 border-primary/20 bg-primary-muted/50 p-4"
        >
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-foreground leading-relaxed">
              <p className="font-medium">Declarations confirmed</p>
              <p className="mt-1 text-muted-foreground">
                ✓ Minimum 2 years experience
                <br />
                ✓ Information accuracy declared
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onEdit} className="flex-1 rounded-xl h-12">
            Back to Edit
          </Button>
          <Button onClick={onNext} className="flex-1 rounded-xl h-12 text-sm font-semibold">
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};
