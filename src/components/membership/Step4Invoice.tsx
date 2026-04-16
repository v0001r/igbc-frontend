import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Download, Receipt, IndianRupee } from "lucide-react";

interface Step4Props {
  categoryData: { membershipType: string; category: string };
  contactData: { firstName: string; lastName: string; email: string; organization: string };
  invoiceData?: { invoiceNumber?: string; membershipFee?: number; gstAmount?: number; totalPayable?: number } | null;
  onNext: () => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

const pricing: Record<string, { base: number; gst: number }> = {
  individual: { base: 5000, gst: 900 },
  professional: { base: 15000, gst: 2700 },
  corporate: { base: 50000, gst: 9000 },
  institutional: { base: 25000, gst: 4500 },
};

const typeLabel: Record<string, string> = {
  individual: "Individual Membership",
  professional: "Professional Membership",
  corporate: "Corporate Membership",
  institutional: "Institutional Membership",
};

export const Step4Invoice = ({
  categoryData,
  contactData,
  invoiceData,
  onNext,
  onBack,
  loading = false,
}: Step4Props) => {
  const fallback = pricing[categoryData.membershipType] || pricing.individual;
  const baseAmount = invoiceData?.membershipFee ?? fallback.base;
  const gstAmount = invoiceData?.gstAmount ?? fallback.gst;
  const total = invoiceData?.totalPayable ?? baseAmount + gstAmount;
  const invoiceNo = invoiceData?.invoiceNumber ?? `IGBC-PRO-${Date.now().toString().slice(-6)}`;

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
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-[11px] font-bold text-emerald-foreground">4</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald">Step 4 of 5</span>
        </div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Proforma Invoice</h2>
        <p className="mt-1 text-sm text-muted-foreground">Review your invoice details before payment</p>
      </div>

      {/* Invoice Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-card"
      >
        {/* Invoice Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald to-primary px-6 py-6 sm:px-8">
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-foreground/5" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-foreground/15 backdrop-blur-sm">
                <Receipt className="h-5 w-5 text-emerald-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-foreground/70">Proforma Invoice</p>
                <p className="font-mono text-base font-bold text-emerald-foreground">{invoiceNo}</p>
              </div>
            </div>
            <div className="text-right text-xs text-emerald-foreground/70">
              <p>Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              <p className="mt-0.5">Valid for 30 days</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="border-b border-border px-6 py-5 sm:px-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Bill To</p>
          <p className="text-sm font-bold text-foreground">{contactData.firstName} {contactData.lastName}</p>
          {contactData.organization && <p className="text-xs text-muted-foreground mt-0.5">{contactData.organization}</p>}
          <p className="text-xs text-muted-foreground">{contactData.email}</p>
        </div>

        {/* Line Items */}
        <div className="px-6 sm:px-8">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-border py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Description</span>
            <span>Amount</span>
          </div>

          {/* Item */}
          <div className="flex items-start justify-between py-4 border-b border-dashed border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">{typeLabel[categoryData.membershipType]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Category: {categoryData.category} · Annual Subscription</p>
            </div>
            <span className="font-mono text-sm font-bold text-foreground shrink-0 ml-4">₹{baseAmount.toLocaleString("en-IN")}</span>
          </div>

          {/* GST */}
          <div className="flex items-center justify-between py-3 text-sm">
            <span className="text-muted-foreground">GST @ 18%</span>
            <span className="font-mono text-muted-foreground">₹{gstAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Total */}
        <div className="mx-6 mb-6 sm:mx-8 rounded-xl bg-emerald/5 border border-emerald/15 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">Total Amount Payable</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Inclusive of all applicable taxes</p>
            </div>
            <div className="flex items-baseline gap-1">
              <IndianRupee className="h-5 w-5 text-emerald" strokeWidth={2.5} />
              <span className="font-mono text-3xl font-bold text-emerald">{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Download */}
      <div className="mt-5 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground shadow-card hover:shadow-card-hover transition-all"
        >
          <Download className="h-3.5 w-3.5" /> Download Invoice PDF
        </motion.button>
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
        <motion.button
          whileHover={{ scale: 1.03, x: 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => void onNext()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald px-7 py-3 text-sm font-semibold text-emerald-foreground shadow-premium transition-all"
        >
          {loading ? "Generating..." : "Proceed to Payment"} {!loading && <ArrowRight className="h-4 w-4" />}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
