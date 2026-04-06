import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Landmark, Smartphone, Wallet, Lock, CheckCircle2, Calendar,
  Download, Copy, ArrowRight, MapPin, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateApExamPayment } from "@/lib/apExam";
import type { ExamFormData } from "@/components/pages/APExam";

interface Props {
  formData: ExamFormData;
  onBack: () => void;
  registrationId: string | null;
}

const paymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "wallet", label: "Wallets", icon: Wallet },
];

export const ExamStep3Payment = ({ formData, onBack, registrationId }: Props) => {
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [examId, setExamId] = useState<string | null>(null);
  const { toast } = useToast();

  const examFee = 3000;

  const examDateLabel = formData.examDate
    ? new Date(formData.examDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const handlePay = async () => {
    if (!registrationId) {
      toast({
        title: "Registration incomplete",
        description: "Please complete and submit registration before payment.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await updateApExamPayment(registrationId, {
        status: "success",
        transactionId: `txn_${Date.now()}`,
      });
      setExamId(response.examId ?? null);
      setProcessing(false);
      setSuccess(true);
    } catch (error) {
      setProcessing(false);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Unable to complete payment",
        variant: "destructive",
      });
    }
  };

  const copyRegId = () => {
    if (!examId) return;
    navigator.clipboard.writeText(examId);
    toast({ title: "Copied!", description: "Exam ID copied to clipboard" });
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-muted"
        >
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your registration for the IGBC AP Exam is confirmed.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl bg-card shadow-card p-6 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Registration ID</p>
              <p className="text-lg font-bold font-mono text-primary">{examId ?? "—"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyRegId} className="rounded-lg gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>

          <div className="h-px bg-border my-4" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-ocean mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Exam Date & Time</p>
                <p className="text-sm font-medium text-foreground">{examDateLabel}</p>
                <p className="text-sm text-muted-foreground">11:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-accent mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="text-sm font-medium text-foreground">IGBC Testing Center</p>
                <p className="text-sm text-muted-foreground">{formData.city}, {formData.state}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Candidate</p>
                <p className="text-sm font-medium text-foreground">
                  {formData.firstName} {formData.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formData.idProofType}: {formData.idProofNumber}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="h-4 w-4 text-gold mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Amount Paid</p>
                <p className="text-sm font-bold font-mono text-foreground">
                  ₹ {examFee.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 space-y-3"
        >
          <div className="rounded-xl bg-primary-muted/50 border border-primary/20 p-4 text-left">
            <p className="text-sm font-medium text-foreground mb-2">What's Next?</p>
            <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
              <li>A confirmation email and SMS have been sent to {formData.email}</li>
              <li>Download your invoice and hall ticket below</li>
              <li>Please report to the exam center by 10:30 AM</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button variant="outline" className="flex-1 rounded-xl h-11 gap-2">
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl h-11 gap-2">
              <Download className="h-4 w-4" />
              Download Hall Ticket
            </Button>
          </div>

          <Button
            className="w-full rounded-xl h-12 gap-2 mt-2"
            onClick={() => (window.location.href = "/")}
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Payment Methods */}
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-semibold text-foreground mb-1">Select Payment Method</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            All transactions are secure and encrypted
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2">
          {paymentMethods.map((pm, i) => {
            const Icon = pm.icon;
            const active = method === pm.id;
            return (
              <motion.button
                key={pm.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setMethod(pm.id)}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                  active
                    ? "border-primary bg-primary-muted shadow-md"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    active ? "bg-primary text-primary-foreground" : "bg-ghost text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>
                  {pm.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Payment Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={method}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-card shadow-card p-5"
          >
            {method === "card" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Card Details</h3>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Card Number</label>
                  <Input placeholder="1234 5678 9012 3456" className="rounded-xl bg-ghost font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">Expiry</label>
                    <Input placeholder="MM / YY" className="rounded-xl bg-ghost font-mono" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">CVV</label>
                    <Input type="password" placeholder="•••" className="rounded-xl bg-ghost font-mono" maxLength={4} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Name on Card</label>
                  <Input placeholder="As printed on card" className="rounded-xl bg-ghost" />
                </div>
              </div>
            )}
            {method === "netbanking" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Net Banking</h3>
                <p className="text-xs text-muted-foreground">
                  You will be redirected to your bank's secure payment page.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "Other Bank"].map((bank) => (
                    <button
                      key={bank}
                      className="rounded-xl border border-border bg-ghost p-3 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-primary-muted transition-all"
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {method === "upi" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">UPI Payment</h3>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">UPI ID</label>
                  <Input placeholder="yourname@upi" className="rounded-xl bg-ghost" />
                </div>
                <p className="text-xs text-muted-foreground">
                  A payment request will be sent to your UPI app for approval.
                </p>
              </div>
            )}
            {method === "wallet" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Wallet Payment</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"].map((w) => (
                    <button
                      key={w}
                      className="rounded-xl border border-border bg-ghost p-3 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-primary-muted transition-all"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Application Summary Sidebar */}
      <div className="lg:sticky lg:top-24 space-y-4 h-fit">
        <div className="rounded-2xl bg-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Application Summary</h3>
          <p className="text-xs text-muted-foreground mb-4">Review submitted details before payment</p>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Candidate</p>
              <p className="mt-1 text-foreground font-medium">{formData.firstName} {formData.lastName}</p>
              <p className="text-muted-foreground">{formData.email}</p>
              <p className="text-muted-foreground">+91 {formData.mobile}</p>
            </div>

            <div className="h-px bg-border" />

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Address</p>
              <p className="mt-1 text-muted-foreground">
                {formData.addressLine1}
                {formData.addressLine2 ? `, ${formData.addressLine2}` : ""}
              </p>
              <p className="text-muted-foreground">
                {formData.city}, {formData.state} - {formData.pincode}
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-ocean" />
                <span className="text-muted-foreground">{examDateLabel} at 11:00 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">
                  {formData.idProofType} ({formData.idProofNumber})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Validity: 1 year from exam date</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">Total Payable</span>
              <span className="font-mono font-semibold text-primary">₹ {examFee.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 rounded-xl h-12">
            Back
          </Button>
          <Button
            onClick={() => void handlePay()}
            disabled={processing}
            className="flex-1 rounded-xl h-12 text-sm font-semibold gap-2"
          >
            {processing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent"
                />
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pay ₹ {examFee.toLocaleString("en-IN")}
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
          <Lock className="h-3 w-3" />
          Secured by 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
};
