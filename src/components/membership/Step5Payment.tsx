import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Building, Smartphone, CheckCircle2, PartyPopper, Shield, Lock, Sparkles, Banknote, Download, FileText } from "lucide-react";

interface Step5Props {
  categoryData: { membershipType: string };
  applicationId: string;
  totalPayable?: number | null;
  invoiceNumber?: string;
  onBack: () => void;
  onSubmitPayment: (payload: {
    paymentMode: "online" | "offline";
    gateway: string;
    status: "success" | "failure";
    transactionId: string;
    paymentMethod: string;
    ddChequeUtrNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
    amount: number;
    paymentDate: string;
    remarks?: string;
  }) => Promise<void>;
}

const pricing: Record<string, number> = {
  individual: 5900,
  professional: 17700,
  corporate: 59000,
  institutional: 29500,
};

const onlinePaymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
  { id: "netbanking", label: "Net Banking", icon: Building, desc: "All major banks supported" },
];

export const Step5Payment = ({
  categoryData,
  applicationId,
  totalPayable,
  invoiceNumber,
  onBack,
  onSubmitPayment,
}: Step5Props) => {
  const [paymentMode, setPaymentMode] = useState<"online" | "offline">("online");
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const total = totalPayable ?? pricing[categoryData.membershipType] ?? pricing.individual;

  // Offline form
  const [offlineData, setOfflineData] = useState({
    ddNumber: "", ifscCode: "", bankName: "", bankBranch: "", date: "", remarks: "",
  });
  const updateOffline = (field: string, value: string) => setOfflineData((prev) => ({ ...prev, [field]: value }));

  const handlePay = async () => {
    setProcessing(true);
    try {
      await onSubmitPayment({
        paymentMode,
        gateway: paymentMode === "online" ? "razorpay" : "offline",
        status: "success",
        transactionId: `txn_${Date.now()}`,
        paymentMethod: paymentMode === "online" ? method : "offline_transfer",
        ddChequeUtrNumber: offlineData.ddNumber || undefined,
        ifscCode: offlineData.ifscCode || undefined,
        bankName: offlineData.bankName || undefined,
        branch: offlineData.bankBranch || undefined,
        amount: Number(total),
        paymentDate:
          paymentMode === "offline"
            ? offlineData.date || new Date().toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        remarks: offlineData.remarks || undefined,
      });
      setCompleted(true);
    } finally {
      setProcessing(false);
    }
  };

  // Success state
  if (completed) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="py-8">
        <div className="mx-auto max-w-lg text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }} className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-emerald/15">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-primary">
              <CheckCircle2 className="h-8 w-8 text-emerald-foreground" strokeWidth={2} />
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="mt-5 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <PartyPopper className="h-5 w-5 text-gold" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-foreground">
              {paymentMode === "online" ? "Welcome to IGBC!" : "Application Submitted!"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {paymentMode === "online"
                ? "Your membership is now active. A confirmation email with your membership ID has been sent."
                : "Your offline payment details have been submitted. Membership will be activated upon payment verification."
              }
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{paymentMode === "online" ? "Transaction ID" : "Reference"}</p>
                <p className="mt-1 font-mono text-sm font-bold text-foreground">{invoiceNumber ?? `TXN-${Date.now().toString().slice(-8)}`}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</p>
                <p className="mt-1 font-mono text-sm font-bold text-emerald">₹{total.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> {paymentMode === "online" ? "Confirmed" : "Pending Verification"}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</p>
                <p className="mt-1 text-sm text-foreground">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a href="/" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-8 py-3.5 text-sm font-semibold text-emerald-foreground shadow-premium">
              Go to Dashboard
            </motion.a>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-card hover:shadow-card-hover transition-all">
              Download Receipt
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-[11px] font-bold text-emerald-foreground">5</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald">Step 5 of 5</span>
        </div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Complete Payment</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose your payment mode and complete the process</p>
      </div>

      <div className="mx-auto max-w-xl space-y-6">
        {/* Amount Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-emerald to-primary p-6 text-center text-emerald-foreground shadow-premium">
          <p className="text-xs font-medium uppercase tracking-wider opacity-75">Total Amount</p>
          <p className="font-mono text-4xl font-bold mt-1">₹{total.toLocaleString("en-IN")}</p>
          <p className="text-[11px] opacity-60 mt-1">Inclusive of 18% GST</p>
        </motion.div>

        {/* Payment Mode Toggle */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Payment Mode</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "online" as const, label: "Online Payment", icon: CreditCard, desc: "Pay instantly via card, UPI or net banking" },
              { id: "offline" as const, label: "Offline Payment", icon: Banknote, desc: "Pay via DD/Cheque/NEFT and upload details" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPaymentMode(mode.id)}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                  paymentMode === mode.id ? "border-primary bg-primary-muted shadow-md" : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  paymentMode === mode.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <mode.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{mode.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{mode.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {paymentMode === "online" && (
            <motion.div key="online" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {/* Online Payment Methods */}
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Payment Method</p>
              <div className="space-y-2.5">
                {onlinePaymentMethods.map((pm, i) => {
                  const selected = method === pm.id;
                  return (
                    <motion.button key={pm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}
                      onClick={() => setMethod(pm.id)}
                      className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${selected ? "border-emerald bg-emerald/5 shadow-md" : "border-border bg-card hover:border-muted-foreground/20"}`}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selected ? "bg-emerald text-emerald-foreground" : "bg-muted text-muted-foreground"}`}>
                        <pm.icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{pm.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{pm.desc}</p>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-emerald bg-emerald" : "border-border"}`}>
                        {selected && <svg className="h-full w-full p-0.5 text-emerald-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Card / UPI / Net Banking forms */}
              {method === "card" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Amount</label>
                    <input
                      value={`Rs ${total.toLocaleString("en-IN")}`}
                      readOnly
                      className="mt-1.5 w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">Card Number</label>
                    <input placeholder="1234 5678 9012 3456" className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15 placeholder:text-muted-foreground/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-foreground">Expiry</label><input placeholder="MM/YY" className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15 placeholder:text-muted-foreground/50" /></div>
                    <div><label className="text-xs font-semibold text-foreground">CVV</label><input placeholder="•••" type="password" maxLength={4} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15 placeholder:text-muted-foreground/50" /></div>
                  </div>
                  <div><label className="text-xs font-semibold text-foreground">Name on Card</label><input placeholder="John Doe" className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15 placeholder:text-muted-foreground/50" /></div>
                </div>
              )}
              {method === "upi" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <label className="text-xs font-semibold text-foreground">Amount</label>
                  <input
                    value={`Rs ${total.toLocaleString("en-IN")}`}
                    readOnly
                    className="mt-1.5 mb-3 w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none"
                  />
                  <label className="text-xs font-semibold text-foreground">UPI ID</label>
                  <input placeholder="yourname@upi" className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15 placeholder:text-muted-foreground/50" />
                </div>
              )}
              {method === "netbanking" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <label className="text-xs font-semibold text-foreground">Amount</label>
                  <input
                    value={`Rs ${total.toLocaleString("en-IN")}`}
                    readOnly
                    className="mt-1.5 mb-3 w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none"
                  />
                  <label className="text-xs font-semibold text-foreground">Select Your Bank</label>
                  <select className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15">
                    <option value="">Choose a bank...</option>
                    <option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </motion.div>
          )}

          {paymentMode === "offline" && (
            <motion.div key="offline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {/* Bank Details */}
              <div className="rounded-2xl border border-primary/20 bg-primary-muted p-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Bank Details for NEFT / RTGS / Cheque</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-muted-foreground">Account Name</span><p className="font-medium text-foreground">CII – IGBC</p></div>
                  <div><span className="text-xs text-muted-foreground">Account No.</span><p className="font-mono font-medium text-foreground">0012345678901</p></div>
                  <div><span className="text-xs text-muted-foreground">IFSC Code</span><p className="font-mono font-medium text-foreground">SBIN0001234</p></div>
                  <div><span className="text-xs text-muted-foreground">Bank</span><p className="font-medium text-foreground">State Bank of India, Hyderabad</p></div>
                </div>
              </div>

              {/* Offline payment form */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Payment Details</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <OfflineInput label="DD / Cheque / UTR Number *" value={offlineData.ddNumber} onChange={(v) => updateOffline("ddNumber", v)} />
                  <OfflineInput label="IFSC Code" value={offlineData.ifscCode} onChange={(v) => updateOffline("ifscCode", v)} />
                  <OfflineInput label="Bank Name *" value={offlineData.bankName} onChange={(v) => updateOffline("bankName", v)} />
                  <OfflineInput label="Branch *" value={offlineData.bankBranch} onChange={(v) => updateOffline("bankBranch", v)} />
                  <OfflineInput label="Amount (Rs) *" value={total.toLocaleString("en-IN")} onChange={() => undefined} readOnly />
                  <OfflineInput label="Payment Date *" value={offlineData.date} onChange={(v) => updateOffline("date", v)} type="date" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Remarks</label>
                  <textarea value={offlineData.remarks} onChange={(e) => updateOffline("remarks", e.target.value)} placeholder="Any additional details..." rows={2} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50" />
                </div>
              </div>

              {/* Download Proforma */}
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition">
                <Download className="h-4 w-4 text-primary" /> Download Proforma Invoice
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> 256-bit SSL</span>
          <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> PCI DSS</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
          <motion.button whileHover={{ scale: 1.02, x: -2 }} whileTap={{ scale: 0.97 }} onClick={onBack} disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-ghost disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Back
          </motion.button>
          <motion.button whileHover={!processing ? { scale: 1.03 } : {}} whileTap={!processing ? { scale: 0.97 } : {}} onClick={() => void handlePay()} disabled={processing || !applicationId}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald px-8 py-3.5 text-sm font-bold text-emerald-foreground shadow-premium transition-all disabled:opacity-60">
            {processing ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-4 w-4 rounded-full border-2 border-emerald-foreground/30 border-t-emerald-foreground" />Processing...</>
            ) : (
              <><Lock className="h-4 w-4" />{paymentMode === "online" ? `Pay ₹${total.toLocaleString("en-IN")}` : "Submit Payment Details"}</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

function OfflineInput({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50 ${
          readOnly
            ? "bg-muted text-foreground"
            : "bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
        }`}
      />
    </div>
  );
}
