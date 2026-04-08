import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ChevronLeft, ChevronRight, Check, FileText, CreditCard, Users, ClipboardList } from "lucide-react";

const steps = [
  { id: 1, title: "Project Category", icon: Building2 },
  { id: 2, title: "Project Details", icon: FileText },
  { id: 3, title: "Contacts", icon: Users },
  { id: 4, title: "Invoice", icon: ClipboardList },
  { id: 5, title: "Payment", icon: CreditCard },
];

const RegisterProject = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: "",
    constructionType: "",
    ratingSystem: "",
    projectType: "",
    projectName: "",
    siteAddress: "",
    city: "",
    state: "",
    pincode: "",
    siteAreaSqm: "",
    siteAreaSqft: "",
    numBuildings: "1",
    builtUpArea: "",
    constructionStart: "",
    certificationTarget: "",
    isIgbcMember: "",
    parentOrgName: "",
    parentOrgAddress: "",
    parentOrgCity: "",
    parentOrgState: "",
    parentOrgPincode: "",
    ownerSalutation: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerOrg: "",
    ownerDesignation: "",
    ownerMobile: "",
    ownerEmail: "",
    coordFirstName: "",
    coordLastName: "",
    coordOrg: "",
    coordDesignation: "",
    coordMobile: "",
    coordEmail: "",
    architectFirstName: "",
    architectLastName: "",
    architectOrg: "",
    architectMobile: "",
    architectEmail: "",
    invoiceOrg: "",
    invoiceAddress: "",
    invoiceCity: "",
    invoiceState: "",
    invoicePincode: "",
    pan: "",
    hasGst: "",
    gstNumber: "",
    isSez: "",
    deductTds: "",
    couponCode: "",
    paymentMethod: "online",
    ddNumber: "",
    ifscCode: "",
    bankName: "",
    bankBranch: "",
    paymentAmount: "",
    paymentDate: "",
    paymentRemarks: "",
  });

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "siteAreaSqm" && value) {
      setFormData((prev) => ({ ...prev, siteAreaSqft: (parseFloat(value) * 10.764).toFixed(0) }));
    }
    if (field === "siteAreaSqft" && value) {
      setFormData((prev) => ({ ...prev, siteAreaSqm: (parseFloat(value) / 10.764).toFixed(0) }));
    }
  };

  const goTo = (s: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(s);
  };

  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: "commercial", label: "Commercial", icon: "🏢", desc: "Offices, IT Parks, Retail" },
    { id: "residential", label: "Residential", icon: "🏠", desc: "Apartments, Villas, Townships" },
    { id: "industrial", label: "Industrial", icon: "🏭", desc: "Factories, Warehouses" },
    { id: "healthcare", label: "Healthcare", icon: "🏥", desc: "Hospitals, Clinics" },
    { id: "education", label: "Education", icon: "🎓", desc: "Schools, Universities" },
    { id: "hospitality", label: "Hospitality", icon: "🏨", desc: "Hotels, Resorts" },
  ];

  const ratingSystems = [
    { id: "green-new", label: "Green New Buildings", desc: "For new construction projects" },
    { id: "green-existing", label: "Green Existing Buildings", desc: "For operational buildings" },
    { id: "green-interiors", label: "Green Interiors", desc: "For interior fit-outs" },
    { id: "green-homes", label: "Green Homes", desc: "For residential buildings" },
    { id: "green-cities", label: "Green Cities", desc: "For urban development" },
    { id: "green-factory", label: "Green Factory Buildings", desc: "For manufacturing facilities" },
  ];

  const projectTypes: Record<string, string[]> = {
    commercial: ["Offices", "Banks", "Hotels", "IT Parks", "Retail Malls", "Convention Centers"],
    residential: ["Apartments", "Villas", "Row Houses", "Plotted Development", "Townships"],
    industrial: ["Factories", "Warehouses", "Data Centers", "Logistics Parks"],
    healthcare: ["Hospitals", "Multi-specialty Clinics", "Diagnostics Centers"],
    education: ["Schools", "Universities", "Research Centers", "Training Institutes"],
    hospitality: ["Hotels", "Resorts", "Service Apartments", "Banquet Halls"],
  };

  const registrationFee = formData.category === "residential" ? 29500 : formData.category === "commercial" ? 35400 : 25000;
  const gstAmount = registrationFee * 0.18;
  const totalAmount = registrationFee + gstAmount;

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-4.5 w-4.5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Register a Project</h1>
            <p className="text-[12px] text-muted-foreground">Submit your green building project for IGBC certification</p>
          </div>
        </motion.div>

        {/* Step Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => s.id < step && goTo(s.id)}
                    disabled={s.id > step}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all sm:h-12 sm:w-12 ${
                      s.id < step
                        ? "bg-primary text-primary-foreground shadow-md"
                        : s.id === step
                        ? "bg-primary text-primary-foreground shadow-premium ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.id < step ? <Check className="h-5 w-5" /> : s.id}
                  </button>
                  <span className={`mt-2 hidden text-xs font-medium sm:block ${s.id <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="mx-2 h-0.5 flex-1 rounded-full bg-muted sm:mx-3">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: s.id < step ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Mobile step label */}
          <p className="mt-3 text-center text-sm font-medium text-foreground sm:hidden">
            Step {step}: {steps[step - 1].title}
          </p>
        </div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-card p-10 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Project Registered Successfully!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your project <strong>{formData.projectName}</strong> has been submitted. You'll receive a confirmation email shortly.
            </p>
            <p className="mt-1 font-mono text-sm text-primary">Project ID: PRJ-{Math.floor(1000 + Math.random() * 9000)}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => window.location.href = "/projects"} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                View My Projects
              </button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Step 1: Category */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
                <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                  <h2 className="text-lg font-bold text-foreground">Select Project Category</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Choose the type that best describes your project</p>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => update("category", c.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all hover:shadow-md ${
                          formData.category === c.id ? "border-primary bg-primary-muted shadow-md" : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <span className="text-3xl">{c.icon}</span>
                        <span className="text-sm font-semibold text-foreground">{c.label}</span>
                        <span className="text-xs text-muted-foreground">{c.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.category && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                    <h2 className="text-lg font-bold text-foreground">Type of Construction</h2>
                    <div className="mt-4 flex gap-3">
                      {["New/Upcoming", "Existing"].map((t) => (
                        <button
                          key={t}
                          onClick={() => update("constructionType", t)}
                          className={`flex-1 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all ${
                            formData.constructionType === t ? "border-primary bg-primary-muted text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {t === "New/Upcoming" ? "🏗️" : "🏢"} {t}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {formData.constructionType && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                    <h2 className="text-lg font-bold text-foreground">Select Rating System</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Choose the IGBC rating system for your project</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {ratingSystems.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => update("ratingSystem", r.id)}
                          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                            formData.ratingSystem === r.id ? "border-primary bg-primary-muted" : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            formData.ratingSystem === r.id ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}>
                            {formData.ratingSystem === r.id && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{r.label}</p>
                            <p className="text-xs text-muted-foreground">{r.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {formData.ratingSystem && formData.category && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                    <h2 className="text-lg font-bold text-foreground">Type of Project</h2>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {(projectTypes[formData.category] || []).map((t) => (
                        <button
                          key={t}
                          onClick={() => update("projectType", t)}
                          className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                            formData.projectType === t ? "border-primary bg-primary-muted text-foreground" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => goTo(2)}
                    disabled={!formData.category || !formData.constructionType || !formData.ratingSystem}
                    className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Project Details */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                  <h2 className="text-lg font-bold text-foreground">Project Information</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Enter the core details of your project</p>
                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Rating Name</label>
                      <input
                        value={ratingSystems.find((r) => r.id === formData.ratingSystem)?.label || ""}
                        readOnly
                        className="h-11 w-full rounded-lg border border-input bg-ghost px-4 text-sm text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Project Name *</label>
                      <input
                        value={formData.projectName}
                        onChange={(e) => update("projectName", e.target.value)}
                        placeholder="Enter project name (exclude Ltd, Pvt Ltd)"
                        className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {formData.projectName && /\b(ltd|pvt|limited|private)\b/i.test(formData.projectName) && (
                        <p className="mt-1 text-xs text-destructive">Please exclude "Ltd", "Pvt Ltd" etc. from the project name</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                  <h2 className="text-lg font-bold text-foreground">Site Address</h2>
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Address *</label>
                      <textarea
                        value={formData.siteAddress}
                        onChange={(e) => update("siteAddress", e.target.value)}
                        placeholder="Full site address"
                        rows={2}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <InputField label="City *" value={formData.city} onChange={(v) => update("city", v)} />
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">State *</label>
                        <select
                          value={formData.state}
                          onChange={(e) => update("state", e.target.value)}
                          className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select State</option>
                          {["Andhra Pradesh", "Karnataka", "Kerala", "Maharashtra", "Tamil Nadu", "Telangana", "Delhi", "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <InputField label="PIN Code *" value={formData.pincode} onChange={(v) => update("pincode", v)} placeholder="6-digit PIN" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                  <h2 className="text-lg font-bold text-foreground">Site Area & Buildings</h2>
                  <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Site Area (sq. m) *</label>
                        <input
                          type="number"
                          value={formData.siteAreaSqm}
                          onChange={(e) => update("siteAreaSqm", e.target.value)}
                          placeholder="Area in sq. meters"
                          className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Site Area (sq. ft)</label>
                        <input
                          type="number"
                          value={formData.siteAreaSqft}
                          onChange={(e) => update("siteAreaSqft", e.target.value)}
                          placeholder="Auto-calculated"
                          className="h-11 w-full rounded-lg border border-input bg-ghost px-4 text-sm placeholder:text-muted-foreground"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Auto-converts from sq. m</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField label="Number of Buildings *" value={formData.numBuildings} onChange={(v) => update("numBuildings", v)} type="number" />
                      <InputField label="Total Built-up Area (sq. ft) *" value={formData.builtUpArea} onChange={(v) => update("builtUpArea", v)} type="number" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField label="Construction Start Date" value={formData.constructionStart} onChange={(v) => update("constructionStart", v)} type="date" />
                      <InputField label="Target Certification Date" value={formData.certificationTarget} onChange={(v) => update("certificationTarget", v)} type="date" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => goTo(1)} className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <button
                    onClick={() => goTo(3)}
                    disabled={!formData.projectName || !formData.siteAddress || !formData.city}
                    className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contacts */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">Parent Organization</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">Rating: <span className="font-medium text-foreground">{ratingSystems.find((r) => r.id === formData.ratingSystem)?.label}</span></p>
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Is your parent organization an IGBC Member?</label>
                      <div className="flex gap-3">
                        {["Yes", "No"].map((v) => (
                          <button
                            key={v}
                            onClick={() => update("isIgbcMember", v)}
                            className={`flex-1 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                              formData.isIgbcMember === v ? "border-primary bg-primary-muted text-foreground" : "border-border text-muted-foreground"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <InputField label="Organization Name *" value={formData.parentOrgName} onChange={(v) => update("parentOrgName", v)} />
                    <InputField label="Address" value={formData.parentOrgAddress} onChange={(v) => update("parentOrgAddress", v)} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <InputField label="City" value={formData.parentOrgCity} onChange={(v) => update("parentOrgCity", v)} />
                      <InputField label="State" value={formData.parentOrgState} onChange={(v) => update("parentOrgState", v)} />
                      <InputField label="PIN Code" value={formData.parentOrgPincode} onChange={(v) => update("parentOrgPincode", v)} />
                    </div>
                  </div>
                </div>

                <ContactCard
                  title="Project Owner"
                  prefix="owner"
                  formData={formData}
                  update={update}
                  showSalutation
                />

                <ContactCard
                  title="Project Coordinator"
                  prefix="coord"
                  formData={formData}
                  update={update}
                  copyFrom={() => {
                    update("coordFirstName", formData.ownerFirstName);
                    update("coordLastName", formData.ownerLastName);
                    update("coordOrg", formData.ownerOrg);
                    update("coordDesignation", formData.ownerDesignation);
                    update("coordMobile", formData.ownerMobile);
                    update("coordEmail", formData.ownerEmail);
                  }}
                />

                <ContactCard
                  title="Architect"
                  prefix="architect"
                  formData={formData}
                  update={update}
                />

                <div className="flex justify-between">
                  <button onClick={() => goTo(2)} className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <button onClick={() => goTo(4)} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md">
                    Save & Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Invoice */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-5">
                  <div className="space-y-6 lg:col-span-3">
                    <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                      <h2 className="text-lg font-bold text-foreground">Organization Details</h2>
                      <p className="mt-1 text-sm text-muted-foreground">For invoice generation</p>
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            update("invoiceOrg", formData.parentOrgName);
                            update("invoiceAddress", formData.parentOrgAddress);
                            update("invoiceCity", formData.parentOrgCity);
                            update("invoiceState", formData.parentOrgState);
                            update("invoicePincode", formData.parentOrgPincode);
                          }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          ↗ Use Parent Organization Address
                        </button>
                      </div>
                      <div className="mt-4 space-y-4">
                        <InputField label="Organization Name *" value={formData.invoiceOrg} onChange={(v) => update("invoiceOrg", v)} />
                        <InputField label="Address *" value={formData.invoiceAddress} onChange={(v) => update("invoiceAddress", v)} />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <InputField label="City *" value={formData.invoiceCity} onChange={(v) => update("invoiceCity", v)} />
                          <InputField label="State *" value={formData.invoiceState} onChange={(v) => update("invoiceState", v)} />
                          <InputField label="PIN Code *" value={formData.invoicePincode} onChange={(v) => update("invoicePincode", v)} />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                      <h2 className="text-lg font-bold text-foreground">Tax Information</h2>
                      <div className="mt-5 space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">PAN Number *</label>
                          <input
                            value={formData.pan}
                            onChange={(e) => update("pan", e.target.value.toUpperCase())}
                            placeholder="AAAAA1234A"
                            maxLength={10}
                            className="h-11 w-full rounded-lg border border-input bg-background px-4 font-mono text-sm uppercase placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          {formData.pan && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan) && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-primary"><Check className="h-3 w-3" /> Valid PAN</p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Has GST Number?</label>
                          <div className="flex gap-3">
                            {["Yes", "No"].map((v) => (
                              <button
                                key={v}
                                onClick={() => update("hasGst", v)}
                                className={`flex-1 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                                  formData.hasGst === v ? "border-primary bg-primary-muted" : "border-border text-muted-foreground"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                        {formData.hasGst === "Yes" && (
                          <InputField label="GST Number" value={formData.gstNumber} onChange={(v) => update("gstNumber", v)} placeholder="22AAAAA0000A1Z5" />
                        )}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">SEZ Category?</label>
                            <div className="flex gap-3">
                              {["Yes", "No"].map((v) => (
                                <button key={v} onClick={() => update("isSez", v)} className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${formData.isSez === v ? "border-primary bg-primary-muted" : "border-border text-muted-foreground"}`}>{v}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Deduct TDS 10%?</label>
                            <div className="flex gap-3">
                              {["Yes", "No"].map((v) => (
                                <button key={v} onClick={() => update("deductTds", v)} className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${formData.deductTds === v ? "border-primary bg-primary-muted" : "border-border text-muted-foreground"}`}>{v}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Coupon Code</label>
                          <div className="flex gap-2">
                            <input
                              value={formData.couponCode}
                              onChange={(e) => update("couponCode", e.target.value)}
                              placeholder="Enter code"
                              className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button className="rounded-lg bg-primary/10 px-5 text-sm font-semibold text-primary hover:bg-primary/20">Apply</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Summary Sidebar */}
                  <div className="lg:col-span-2">
                    <div className="sticky top-24 rounded-2xl bg-card p-6 shadow-card">
                      <h3 className="text-lg font-bold text-foreground">Invoice Summary</h3>
                      <div className="mt-5 space-y-3 border-b border-border pb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Registration Fee</span>
                          <span className="font-mono font-semibold text-foreground">₹{registrationFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">GST (18%)</span>
                          <span className="font-mono font-semibold text-foreground">₹{gstAmount.toLocaleString()}</span>
                        </div>
                        {formData.deductTds === "Yes" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">TDS Deduction (10%)</span>
                            <span className="font-mono font-semibold text-destructive">-₹{(registrationFee * 0.1).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between">
                        <span className="font-semibold text-foreground">Total Payable</span>
                        <span className="font-mono text-xl font-bold text-primary">
                          ₹{(formData.deductTds === "Yes" ? totalAmount - registrationFee * 0.1 : totalAmount).toLocaleString()}
                        </span>
                      </div>
                      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-foreground hover:bg-muted">
                        <FileText className="h-4 w-4" /> Download Proforma
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => goTo(3)} className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <button onClick={() => goTo(5)} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md">
                    Proceed to Payment <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Payment */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                  <h2 className="text-lg font-bold text-foreground">Payment Method</h2>
                  <div className="mt-5 flex gap-3">
                    {[
                      { id: "online", label: "Online Payment", desc: "UPI, Credit/Debit Card, Net Banking" },
                      { id: "offline", label: "Offline Payment", desc: "DD, Cheque, NEFT/RTGS" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => update("paymentMethod", m.id)}
                        className={`flex-1 rounded-xl border-2 p-5 text-left transition-all ${
                          formData.paymentMethod === m.id ? "border-primary bg-primary-muted" : "border-border"
                        }`}
                      >
                        <p className="text-sm font-semibold text-foreground">{m.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.paymentMethod === "online" && (
                  <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <CreditCard className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Pay ₹{(formData.deductTds === "Yes" ? totalAmount - registrationFee * 0.1 : totalAmount).toLocaleString()}</h3>
                      <p className="text-sm text-muted-foreground">You'll be redirected to our secure payment gateway</p>
                      <button
                        onClick={() => setSubmitted(true)}
                        className="mt-2 rounded-xl bg-primary px-10 py-3.5 text-sm font-semibold text-primary-foreground shadow-premium transition-all hover:shadow-lg"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "offline" && (
                  <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                    <h2 className="text-lg font-bold text-foreground">Offline Payment Details</h2>
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Payment Type</label>
                        <select className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option>Demand Draft</option>
                          <option>Cheque</option>
                          <option>NEFT/RTGS</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField label="DD/Cheque/UTR No. *" value={formData.ddNumber} onChange={(v) => update("ddNumber", v)} />
                        <InputField label="IFSC Code *" value={formData.ifscCode} onChange={(v) => update("ifscCode", v)} />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField label="Bank Name *" value={formData.bankName} onChange={(v) => update("bankName", v)} />
                        <InputField label="Branch *" value={formData.bankBranch} onChange={(v) => update("bankBranch", v)} />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField label="Amount (₹) *" value={formData.paymentAmount} onChange={(v) => update("paymentAmount", v)} type="number" />
                        <InputField label="Payment Date *" value={formData.paymentDate} onChange={(v) => update("paymentDate", v)} type="date" />
                      </div>
                      <InputField label="Remarks" value={formData.paymentRemarks} onChange={(v) => update("paymentRemarks", v)} placeholder="Any additional notes" />
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button onClick={() => goTo(4)} className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  {formData.paymentMethod === "offline" && (
                    <button
                      onClick={() => setSubmitted(true)}
                      className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md"
                    >
                      Submit Payment Details
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
};

/* Reusable Input Field */
const InputField = ({ label, value, onChange, placeholder, type = "text" }: {
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

/* Contact Card Component */
const ContactCard = ({ title, prefix, formData, update, showSalutation, copyFrom }: {
  title: string;
  prefix: string;
  formData: Record<string, string>;
  update: (field: string, value: string) => void;
  showSalutation?: boolean;
  copyFrom?: () => void;
}) => (
  <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {copyFrom && (
        <button onClick={copyFrom} className="text-xs font-medium text-primary hover:underline">
          ↗ Copy from Project Owner
        </button>
      )}
    </div>
    <div className="mt-5 space-y-4">
      {showSalutation && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Salutation</label>
          <select
            value={formData[`${prefix}Salutation`] || ""}
            onChange={(e) => update(`${prefix}Salutation`, e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select</option>
            {["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField label="First Name *" value={formData[`${prefix}FirstName`] || ""} onChange={(v) => update(`${prefix}FirstName`, v)} />
        <InputField label="Last Name *" value={formData[`${prefix}LastName`] || ""} onChange={(v) => update(`${prefix}LastName`, v)} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField label="Organization" value={formData[`${prefix}Org`] || ""} onChange={(v) => update(`${prefix}Org`, v)} />
        {formData[`${prefix}Designation`] !== undefined && (
          <InputField label="Designation" value={formData[`${prefix}Designation`] || ""} onChange={(v) => update(`${prefix}Designation`, v)} />
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField label="Mobile *" value={formData[`${prefix}Mobile`] || ""} onChange={(v) => update(`${prefix}Mobile`, v)} placeholder="+91" />
        <InputField label="Email *" value={formData[`${prefix}Email`] || ""} onChange={(v) => update(`${prefix}Email`, v)} placeholder="name@domain.com" />
      </div>
    </div>
  </div>
);

export default RegisterProject;
