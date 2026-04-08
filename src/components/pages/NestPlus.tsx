import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, Home, Star, ArrowRight, CheckCircle2, BarChart3, Shield, Award, Clock,
  ChevronRight, ChevronLeft, X, Check, Building2, Users, FileText, CreditCard, Upload
} from "lucide-react";

const programs = [
  {
    name: "IGBC NEST",
    tagline: "Net Zero Energy Sustainable Township",
    desc: "A rating program for residential societies promoting sustainable living at the township level.",
    features: ["Water conservation", "Energy efficiency", "Waste management", "Biodiversity", "Community engagement"],
    icon: Home,
    color: "text-primary",
    bg: "bg-primary-muted",
    projects: 45,
    fee: "₹3,50,000",
  },
  {
    name: "IGBC NEST+",
    tagline: "Enhanced Residential Rating",
    desc: "An advanced rating for individual homes and apartments within certified townships.",
    features: ["Indoor air quality", "Smart home integration", "Renewable energy", "Water recycling", "Health & wellness"],
    icon: Leaf,
    color: "text-sage",
    bg: "bg-sage/10",
    projects: 120,
    fee: "₹1,75,000",
  },
];

const ratingLevels = [
  { level: "Certified", points: "40-49", color: "bg-muted text-foreground" },
  { level: "Silver", points: "50-59", color: "bg-muted text-foreground" },
  { level: "Gold", points: "60-74", color: "bg-peach/20 text-peach-foreground" },
  { level: "Platinum", points: "75+", color: "bg-primary-muted text-primary" },
];

const benefits = [
  { icon: BarChart3, title: "Reduced Utility Bills", desc: "Save up to 30-40% on energy and water costs" },
  { icon: Shield, title: "Healthier Living", desc: "Better air quality and natural lighting" },
  { icon: Award, title: "Property Value", desc: "Green-certified homes have 5-10% higher resale value" },
  { icon: Star, title: "Recognition", desc: "IGBC certification recognized nationally and globally" },
];

const myRegistrations = [
  { id: "NEST-0451", name: "Emerald Valley Township", program: "NEST", status: "Gold", progress: 72, submitted: "Nov 2025", city: "Pune" },
  { id: "NEST+-0892", name: "My Apartment - Unit 4B", program: "NEST+", status: "In Review", progress: 45, submitted: "Feb 2026", city: "Mumbai" },
];

const NestPlus = () => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [regProgram, setRegProgram] = useState("");
  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({
    projectName: "",
    projectAddress: "",
    city: "",
    state: "",
    pincode: "",
    totalUnits: "",
    totalArea: "",
    ownerName: "",
    ownerOrg: "",
    ownerMobile: "",
    ownerEmail: "",
    paymentMethod: "online",
  });

  const updateReg = (field: string, value: string) => setRegData((p) => ({ ...p, [field]: value }));

  const startRegistration = (program: string) => {
    setRegProgram(program);
    setRegStep(1);
    setShowRegister(true);
    setRegData({ projectName: "", projectAddress: "", city: "", state: "", pincode: "", totalUnits: "", totalArea: "", ownerName: "", ownerOrg: "", ownerMobile: "", ownerEmail: "", paymentMethod: "online" });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" strokeWidth={1.5} />
          <span className="rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold text-primary">RESIDENTIAL</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">NEST & NEST+ Programs</h1>
        <p className="mt-2 text-sm text-muted-foreground">Green rating programs for sustainable residential living</p>
      </motion.div>

      {/* Programs */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {programs.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ y: -3 }}
            onClick={() => setSelectedProgram(selectedProgram === p.name ? null : p.name)}
            className={`cursor-pointer rounded-2xl border-2 bg-card p-6 shadow-card transition-all ${
              selectedProgram === p.name ? "border-primary" : "border-transparent"
            }`}
          >
            <div className={`inline-flex rounded-xl ${p.bg} p-3`}>
              <p.icon className={`h-6 w-6 ${p.color}`} strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">{p.name}</h3>
            <p className="text-sm font-medium text-ocean">{p.tagline}</p>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>

            <ul className="mt-5 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={1.5} /> {f}
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-lg bg-ghost p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Registration Fee</span>
                <span className="font-mono text-sm font-bold text-foreground">{p.fee}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{p.projects} registered projects</span>
              <button
                onClick={(e) => { e.stopPropagation(); startRegistration(p.name); }}
                className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Register <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rating Levels */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">Rating Levels</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ratingLevels.map((r, i) => (
            <motion.div
              key={r.level}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center rounded-2xl bg-card p-5 text-center shadow-card"
            >
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.color}`}>{r.level}</span>
              <p className="mt-2 text-2xl font-bold text-foreground">{r.points}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">Why Go Green?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-2xl bg-card p-5 shadow-card">
              <b.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <h3 className="mt-3 text-sm font-semibold text-foreground">{b.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* My Registrations */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">My Registrations</h2>
        <div className="mt-4 space-y-3">
          {myRegistrations.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                  <h3 className="text-sm font-semibold text-foreground">{r.name}</h3>
                  <span className="rounded-full bg-primary-muted px-2 py-0.5 text-xs font-medium text-primary">{r.program}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.submitted}</span>
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {r.city}</span>
                  <span>Status: <strong className="text-foreground">{r.status}</strong></span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${r.progress}%` }} className="h-full rounded-full bg-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{r.progress}%</span>
                </div>
              </div>
              <button className="flex items-center gap-1 self-start rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">
                View Details <ChevronRight className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
            onClick={() => setShowRegister(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-premium sm:p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Register for {regProgram}</h2>
                  <p className="text-sm text-muted-foreground">Step {regStep} of 3</p>
                </div>
                <button onClick={() => setShowRegister(false)} className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>

              {/* Progress */}
              <div className="mt-4 flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= regStep ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>

              {/* Step 1: Project Details */}
              {regStep === 1 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Project Details</h3>
                  <RegInput label="Project / Township Name *" value={regData.projectName} onChange={(v) => updateReg("projectName", v)} />
                  <RegInput label="Address *" value={regData.projectAddress} onChange={(v) => updateReg("projectAddress", v)} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <RegInput label="City *" value={regData.city} onChange={(v) => updateReg("city", v)} />
                    <RegInput label="State *" value={regData.state} onChange={(v) => updateReg("state", v)} />
                    <RegInput label="PIN Code *" value={regData.pincode} onChange={(v) => updateReg("pincode", v)} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <RegInput label="Total Units / Dwellings *" value={regData.totalUnits} onChange={(v) => updateReg("totalUnits", v)} type="number" />
                    <RegInput label="Total Area (sq. ft) *" value={regData.totalArea} onChange={(v) => updateReg("totalArea", v)} type="number" />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => setRegStep(2)} disabled={!regData.projectName || !regData.city} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
                      Next <ChevronRight className="ml-1 inline h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Contact */}
              {regStep === 2 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
                  <RegInput label="Contact Person Name *" value={regData.ownerName} onChange={(v) => updateReg("ownerName", v)} />
                  <RegInput label="Organization *" value={regData.ownerOrg} onChange={(v) => updateReg("ownerOrg", v)} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <RegInput label="Mobile *" value={regData.ownerMobile} onChange={(v) => updateReg("ownerMobile", v)} placeholder="+91" />
                    <RegInput label="Email *" value={regData.ownerEmail} onChange={(v) => updateReg("ownerEmail", v)} placeholder="name@domain.com" />
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setRegStep(1)} className="flex items-center gap-1 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                      <ChevronLeft className="h-3 w-3" /> Back
                    </button>
                    <button onClick={() => setRegStep(3)} disabled={!regData.ownerName || !regData.ownerEmail} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
                      Review & Pay <ChevronRight className="ml-1 inline h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Pay */}
              {regStep === 3 && (
                <div className="mt-6 space-y-5">
                  <div className="rounded-xl bg-ghost p-4">
                    <h3 className="text-sm font-semibold text-foreground">Registration Summary</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Program:</span> <span className="font-medium">{regProgram}</span></div>
                      <div><span className="text-muted-foreground">Project:</span> <span className="font-medium">{regData.projectName}</span></div>
                      <div><span className="text-muted-foreground">City:</span> <span className="font-medium">{regData.city}</span></div>
                      <div><span className="text-muted-foreground">Contact:</span> <span className="font-medium">{regData.ownerName}</span></div>
                      <div><span className="text-muted-foreground">Units:</span> <span className="font-medium">{regData.totalUnits}</span></div>
                      <div><span className="text-muted-foreground">Area:</span> <span className="font-medium">{regData.totalArea} sq ft</span></div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground">Fee Breakdown</h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Registration Fee</span><span className="font-mono font-semibold">{programs.find(p => p.name === regProgram)?.fee}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span className="font-mono font-semibold">{regProgram === "IGBC NEST" ? "₹63,000" : "₹31,500"}</span></div>
                      <div className="flex justify-between border-t border-border pt-2 font-semibold">
                        <span>Total</span>
                        <span className="font-mono text-primary">{regProgram === "IGBC NEST" ? "₹4,13,000" : "₹2,06,500"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setRegStep(2)} className="flex items-center gap-1 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                      <ChevronLeft className="h-3 w-3" /> Back
                    </button>
                    <button
                      onClick={() => setRegStep(4)}
                      className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                    >
                      <CreditCard className="h-4 w-4" /> Pay & Submit
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {regStep === 4 && (
                <div className="mt-6 text-center py-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">Registration Successful!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your <strong>{regProgram}</strong> registration for <strong>{regData.projectName}</strong> has been submitted.
                  </p>
                  <p className="mt-1 font-mono text-sm text-primary">Registration ID: {regProgram === "IGBC NEST" ? "NEST" : "NEST+"}-{Math.floor(1000 + Math.random() * 9000)}</p>
                  <button onClick={() => setShowRegister(false)} className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

const RegInput = ({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  </div>
);

export default NestPlus;
