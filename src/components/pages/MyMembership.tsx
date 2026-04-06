import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  Crown,
  Download,
  FileText,
  BookOpen,
  Users,
  Mic2,
  BadgePercent,
  Sprout,
  Shield,
  CalendarDays,
  CreditCard,
  Building2,
  Copy,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

const membershipData = {
  id: "IGBCIM01260250",
  status: "Active",
  type: "Individual Membership",
  category: "Professional",
  organization: "B M ASSOCIATES",
  pan: "BQMPS4472B",
  gstNumber: "—",
  enrollmentDate: "15 Mar 2025",
  expiryDate: "14 Mar 2026",
  fee: 1500,
  gst: 270,
  total: 1770,
};

const benefits = [
  {
    icon: BookOpen,
    title: "Access to Information",
    description:
      "Green building resources, technical publications, and the latest industry research.",
    color: "bg-ocean/10 text-ocean",
  },
  {
    icon: Users,
    title: "Networking Platform",
    description:
      "Connect with industry pioneers, thought leaders, architects, and engineers.",
    color: "bg-primary-muted text-primary",
  },
  {
    icon: Mic2,
    title: "Advocacy & Influence",
    description:
      "Contribute to green building policy and shape best practices across India.",
    color: "bg-sage/20 text-sage-foreground",
  },
  {
    icon: BadgePercent,
    title: "Exclusive Discounts",
    description:
      "Special rates for IGBC conferences, training programs, events, and publications.",
    color: "bg-peach/20 text-peach-foreground",
  },
  {
    icon: Sprout,
    title: "Community Participation",
    description:
      "Join a community driving sustainable change, positioning India as a global leader.",
    color: "bg-emerald/10 text-emerald-foreground",
  },
  {
    icon: Shield,
    title: "Professional Recognition",
    description:
      "Be recognized as an IGBC member committed to sustainable building practices.",
    color: "bg-ocean/10 text-ocean",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function MyMembership() {
  const [showFeeBreakup, setShowFeeBreakup] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(membershipData.id);
    toast.success("Membership ID copied!");
  };

  const daysRemaining = 350;
  const totalDays = 365;
  const progressPct = Math.round(((totalDays - daysRemaining) / totalDays) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                My Membership
              </h1>
              <p className="text-sm text-muted-foreground">
                Indian Green Building Council (IGBC) — a part of CII
              </p>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0">
              <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
                Proforma Invoice
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
                <Download className="h-4 w-4" strokeWidth={1.5} />
                Certificate
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main 2-col grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Membership Details Card */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted">
                  <Crown className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Membership Details
                  </h2>
                  <p className="text-xs text-muted-foreground">Your current membership information</p>
                </div>
                <Badge
                  variant="outline"
                  className="ml-auto border-emerald/30 bg-emerald/10 text-emerald-foreground font-semibold text-xs px-3 py-1"
                >
                  ● Active
                </Badge>
              </div>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem label="Membership ID">
                  <span className="flex items-center gap-1.5 font-mono text-sm font-medium text-foreground">
                    {membershipData.id}
                    <button
                      onClick={copyId}
                      className="text-muted-foreground hover:text-primary transition"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </DetailItem>
                <DetailItem label="Type of Membership">
                  {membershipData.type}
                </DetailItem>
                <DetailItem label="Membership Category">
                  {membershipData.category}
                </DetailItem>
                <DetailItem label="Organization Name">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {membershipData.organization}
                  </span>
                </DetailItem>
                <DetailItem label="PAN">{membershipData.pan}</DetailItem>
                <DetailItem label="GST Number">{membershipData.gstNumber}</DetailItem>
              </div>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <h2 className="mb-1 text-base font-semibold text-foreground">
                Membership Benefits
              </h2>
              <p className="mb-5 text-xs text-muted-foreground">
                Key benefits included with your IGBC Individual Membership
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.04 }}
                    className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${b.color}`}
                    >
                      <b.icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        {b.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {b.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Important Notes */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <h2 className="mb-4 text-base font-semibold text-foreground">
                Important Information
              </h2>
              <div className="space-y-3">
                <NoteItem
                  icon={CalendarDays}
                  title="Membership Period"
                  text="Your membership is valid for one year from enrollment and can be renewed annually before expiry."
                />
                <NoteItem
                  icon={CreditCard}
                  title="Fee Structure"
                  text={`Annual fee of ₹${membershipData.fee.toLocaleString()} + 18% GST (₹${membershipData.gst}) = ₹${membershipData.total.toLocaleString()} inclusive.`}
                />
                <NoteItem
                  icon={Shield}
                  title="Renewal Policy"
                  text="Renew 30 days before expiry to ensure uninterrupted access to all membership benefits."
                />
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Status Card */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="sticky top-20 space-y-5"
            >
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Membership Period
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Enrolled</span>
                    <span className="font-medium text-foreground">
                      {membershipData.enrollmentDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium text-foreground">
                      {membershipData.expiryDate}
                    </span>
                  </div>
                </div>
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{daysRemaining} days remaining</span>
                  <span>{progressPct}% elapsed</span>
                </div>
                <div className="h-2 w-full rounded-full bg-primary-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-2 rounded-full bg-primary"
                  />
                </div>

                <Separator className="my-4" />

                {/* Fee Breakup */}
                <div>
                  <button
                    onClick={() => setShowFeeBreakup(!showFeeBreakup)}
                    className="flex w-full items-center justify-between text-sm font-medium text-primary hover:underline"
                  >
                    Fee Breakdown
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${showFeeBreakup ? "rotate-90" : ""}`}
                      strokeWidth={1.5}
                    />
                  </button>
                  {showFeeBreakup && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 space-y-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Membership Fee</span>
                        <span className="text-foreground">
                          ₹{membershipData.fee.toLocaleString("en-IN")}.00
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST @ 18%</span>
                        <span className="text-foreground">
                          ₹{membershipData.gst.toLocaleString("en-IN")}.00
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total Paid</span>
                        <span className="text-primary">
                          ₹{membershipData.total.toLocaleString("en-IN")}.00
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Separator className="my-4" />

                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                  Renew Membership
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Quick Links */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Download Certificate", icon: Download },
                    { label: "Proforma Invoice", icon: FileText },
                    { label: "Update Profile", icon: Users },
                    { label: "Membership Directory", icon: BookOpen },
                  ].map((link) => (
                    <button
                      key={link.label}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <link.icon className="h-4 w-4" strokeWidth={1.5} />
                      {link.label}
                      <ChevronRight className="ml-auto h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Help Tip */}
              <div className="rounded-2xl bg-primary-muted p-5">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" strokeWidth={1.5} />
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-primary">
                      Need Help?
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      For membership queries, contact IGBC support at{" "}
                      <span className="font-medium text-foreground">
                        igbc@cii.in
                      </span>{" "}
                      or call{" "}
                      <span className="font-medium text-foreground">
                        +91 40 4418 5111
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{children}</p>
    </div>
  );
}

function NoteItem({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-3.5 transition hover:bg-muted/50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-muted">
        <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
