import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { User, MapPin, GraduationCap, Building2, Calendar, ShieldCheck, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getSelectableApExamSlots } from "@/lib/apExam";
import type { ExamFormData } from "@/components/pages/APExam";

interface Props {
  formData: ExamFormData;
  updateFormData: (updates: Partial<ExamFormData>) => void;
  onNext: () => Promise<void>;
  submitError: string | null;
  setSubmitError: (error: string | null) => void;
  isRegistrationDisabled?: boolean;
}

const idProofTypes = ["Passport", "Aadhaar Card", "Driving License", "Voter ID", "PAN Card"];

const SectionHeader = ({ icon: Icon, title, collapsed, onToggle }: { icon: any; title: string; collapsed: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} className="flex w-full items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
  </button>
);

const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <label className="mb-1.5 block text-xs font-medium text-foreground">
    {label}
    {required && <span className="ml-0.5 text-destructive">*</span>}
  </label>
);

type Errors = Record<string, string>;

const ID_PROOF_REGEX: Record<string, RegExp> = {
  "Aadhaar Card": /^\d{4}\s?\d{4}\s?\d{4}$/,
  "PAN Card": /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  "Voter ID": /^[A-Z]{3}[0-9]{7}$/,
  "Driving License": /^[A-Z]{2}[0-9]{2}\s?[0-9]{4}\s?[0-9]{7}$/,
};

const ID_PROOF_ERROR_MESSAGES: Record<string, string> = {
  "Aadhaar Card": "Aadhaar must be 12 digits (123412341234 or 1234 1234 1234)",
  "PAN Card": "PAN must be in format: ABCDE1234F",
  "Voter ID": "Voter ID must be in format: ABC1234567",
  "Driving License": "Driving License must be in format: AP21 20210012345",
};

export const ExamStep1Registration = ({
  formData,
  updateFormData,
  onNext,
  submitError,
  setSubmitError,
  isRegistrationDisabled = false,
}: Props) => {
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<{ label: string; value: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const nextSixMonths = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const d = new Date(now.getFullYear(), now.getMonth() + index, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      setSlotsLoading(true);
      try {
        const slotLists = await Promise.all(
          nextSixMonths.map((item) => getSelectableApExamSlots(item.year, item.month)),
        );
        const now = new Date();
        const dateMap = new Map<string, { label: string; value: string }>();
        slotLists.forEach((slotList) => {
          slotList.selectableDates.forEach((dateString) => {
            const date = new Date(dateString);
            if (date > now) {
              dateMap.set(dateString, {
                value: dateString,
                label: date.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              });
            }
          });
        });
        setAvailableDates(
          Array.from(dateMap.values()).sort((a, b) => a.value.localeCompare(b.value)),
        );
      } catch {
        setErrors((prev) => ({ ...prev, examDate: "Unable to load exam slots" }));
      } finally {
        setSlotsLoading(false);
      }
    };

    void loadSlots();
  }, [nextSixMonths]);

  const toggleSection = (s: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const validateField = (field: string, value: string) => {
    const errs: Errors = { ...errors };
    switch (field) {
      case "firstName":
        errs.firstName = !value.trim()
          ? "First name is required"
          : /^[A-Za-z]+$/.test(value.trim())
          ? ""
          : "First name must contain only alphabets";
        break;
      case "lastName":
        errs.lastName = !value.trim()
          ? "Last name is required"
          : /^[A-Za-z]+$/.test(value.trim())
          ? ""
          : "Last name must contain only alphabets";
        break;
      case "email":
        errs.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format";
        break;
      case "mobile":
        errs.mobile = /^\d{10}$/.test(value) ? "" : "Enter a valid 10-digit number";
        break;
      case "pincode":
        errs.pincode = /^\d{6}$/.test(value) ? "" : "Enter a valid 6-digit pincode";
        break;
      case "addressLine1":
        errs.addressLine1 = value.trim() ? "" : "Address is required";
        break;
      case "city":
        errs.city = value.trim() ? "" : "City is required";
        break;
      case "state":
        errs.state = value.trim() ? "" : "State is required";
        break;
      case "idProofNumber":
        if (!value.trim()) {
          errs.idProofNumber = "ID number is required";
          break;
        }
        if (!formData.idProofType) {
          errs.idProofNumber = "Select ID proof type first";
          break;
        }
        if (formData.idProofType in ID_PROOF_REGEX) {
          const regex = ID_PROOF_REGEX[formData.idProofType];
          errs.idProofNumber = regex.test(value.trim())
            ? ""
            : ID_PROOF_ERROR_MESSAGES[formData.idProofType];
          break;
        }
        errs.idProofNumber = "";
        break;
      case "qualification":
        errs.qualification = value.trim() ? "" : "Qualification is required";
        break;
      case "experience":
        errs.experience =
          value.trim() &&
          /^\d+$/.test(value.trim()) &&
          !Number.isNaN(Number(value)) &&
          Number(value) >= 0
            ? ""
            : "Experience must be a whole number greater than or equal to 0";
        break;
      case "examDate":
        errs.examDate = value ? "" : "Select an exam date";
        break;
      case "idProofType":
        errs.idProofType = value ? "" : "Select ID proof type";
        break;
      case "declarationChecked":
        errs.declarationChecked = value ? "" : "You must accept the declaration";
        break;
      case "experienceChecked":
        errs.experienceChecked = value ? "" : "You must confirm experience";
        break;
    }
    setErrors(errs);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    validateField(field, (formData as any)[field] || "");
  };

  const handleChange = (field: string, value: string) => {
    const normalizedValue =
      field === "idProofNumber" &&
      ["PAN Card", "Voter ID", "Driving License"].includes(formData.idProofType)
        ? value.toUpperCase()
        : value;
    updateFormData({ [field]: normalizedValue });
    if (submitError) {
      setSubmitError(null);
    }
    if (touched.has(field)) validateField(field, normalizedValue);
  };

  const handleSelectChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
    setTouched((prev) => new Set(prev).add(field));
    validateField(field, value);
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleCheckChange = (field: "experienceChecked" | "declarationChecked", checked: boolean) => {
    updateFormData({ [field]: checked });
    setTouched((prev) => new Set(prev).add(field));
    validateField(field, checked ? "true" : "");
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateAll = () => {
    const errs: Errors = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    else if (!/^[A-Za-z]+$/.test(formData.firstName.trim())) {
      errs.firstName = "First name must contain only alphabets";
    }
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    else if (!/^[A-Za-z]+$/.test(formData.lastName.trim())) {
      errs.lastName = "Last name must contain only alphabets";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Invalid email format";
    if (!/^\d{10}$/.test(formData.mobile)) errs.mobile = "Enter a valid 10-digit number";
    if (!formData.addressLine1.trim()) errs.addressLine1 = "Address is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.state.trim()) errs.state = "State is required";
    if (!/^\d{6}$/.test(formData.pincode)) errs.pincode = "Enter a valid 6-digit pincode";
    if (!formData.qualification.trim()) errs.qualification = "Qualification is required";
    if (
      !formData.experience.trim() ||
      !/^\d+$/.test(formData.experience.trim()) ||
      Number.isNaN(Number(formData.experience)) ||
      Number(formData.experience) < 0
    ) {
      errs.experience = "Experience must be a whole number greater than or equal to 0";
    }
    if (!formData.examDate) errs.examDate = "Select an exam date";
    if (!formData.idProofType) errs.idProofType = "Select ID proof type";
    if (!formData.idProofNumber.trim()) {
      errs.idProofNumber = "ID number is required";
    } else if (formData.idProofType in ID_PROOF_REGEX) {
      const regex = ID_PROOF_REGEX[formData.idProofType];
      if (!regex.test(formData.idProofNumber.trim())) {
        errs.idProofNumber = ID_PROOF_ERROR_MESSAGES[formData.idProofType];
      }
    }
    if (!formData.declarationChecked) errs.declarationChecked = "You must accept the declaration";
    if (!formData.experienceChecked) errs.experienceChecked = "You must confirm experience";
    setErrors(errs);
    return Object.values(errs).every((e) => !e);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isRegistrationDisabled) return;
    setHasSubmitted(true);
    if (!validateAll()) return;
    setIsSubmitting(true);
    try {
      await onNext();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to register for exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (field: string) =>
    (touched.has(field) || hasSubmitted) && errors[field] ? (
      <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3 w-3" />
        {errors[field]}
      </p>
    ) : null;

  const examFee = 3000;

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Main Form */}
      <div className="space-y-4">
        {submitError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {submitError}
          </div>
        )}
        {/* Personal Information */}
        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          <div className="px-5">
            <SectionHeader
              icon={User}
              title="Personal Information"
              collapsed={collapsedSections.has("personal")}
              onToggle={() => toggleSection("personal")}
            />
          </div>
          {!collapsedSections.has("personal") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="border-t border-border px-5 pb-5 pt-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel label="First Name" required />
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    className="rounded-xl bg-ghost"
                  />
                  {fieldError("firstName")}
                </div>
                <div>
                  <FieldLabel label="Last Name" required />
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    className="rounded-xl bg-ghost"
                  />
                  {fieldError("lastName")}
                </div>
                <div>
                  <FieldLabel label="Email Address" required />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className="rounded-xl bg-ghost"
                  />
                  {fieldError("email")}
                </div>
                <div>
                  <FieldLabel label="Mobile Number" required />
                  <div className="flex gap-2">
                    <div className="flex h-10 items-center rounded-xl border border-input bg-ghost px-3 text-sm text-muted-foreground">
                      +91
                    </div>
                    <Input
                      value={formData.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onBlur={() => handleBlur("mobile")}
                      className="rounded-xl bg-ghost flex-1"
                      placeholder="10-digit number"
                    />
                  </div>
                  {fieldError("mobile")}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Address Details */}
        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          <div className="px-5">
            <SectionHeader
              icon={MapPin}
              title="Address Details"
              collapsed={collapsedSections.has("address")}
              onToggle={() => toggleSection("address")}
            />
          </div>
          {!collapsedSections.has("address") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="border-t border-border px-5 pb-5 pt-4"
            >
              <div className="grid gap-4">
                <div>
                  <FieldLabel label="Address Line 1" required />
                  <Input
                    value={formData.addressLine1}
                    onChange={(e) => handleChange("addressLine1", e.target.value)}
                    onBlur={() => handleBlur("addressLine1")}
                    className="rounded-xl bg-ghost"
                  />
                  {fieldError("addressLine1")}
                </div>
                <div>
                  <FieldLabel label="Address Line 2" />
                  <Input
                    value={formData.addressLine2}
                    onChange={(e) => handleChange("addressLine2", e.target.value)}
                    className="rounded-xl bg-ghost"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <FieldLabel label="City" required />
                    <Input
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      onBlur={() => handleBlur("city")}
                      className="rounded-xl bg-ghost"
                    />
                    {fieldError("city")}
                  </div>
                  <div>
                    <FieldLabel label="State" required />
                    <Input
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      onBlur={() => handleBlur("state")}
                      className="rounded-xl bg-ghost"
                    />
                    {fieldError("state")}
                  </div>
                  <div>
                    <FieldLabel label="Pincode" required />
                    <Input
                      value={formData.pincode}
                      onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onBlur={() => handleBlur("pincode")}
                      className="rounded-xl bg-ghost"
                      placeholder="6-digit"
                    />
                    {fieldError("pincode")}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Educational Details */}
        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          <div className="px-5">
            <SectionHeader
              icon={GraduationCap}
              title="Educational Details"
              collapsed={collapsedSections.has("education")}
              onToggle={() => toggleSection("education")}
            />
          </div>
          {!collapsedSections.has("education") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="border-t border-border px-5 pb-5 pt-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel label="Highest Qualification" />
                  <Select value={formData.qualification} onValueChange={(v) => handleSelectChange("qualification", v)}>
                    <SelectTrigger className="rounded-xl bg-ghost">
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {["B.Arch", "B.E. / B.Tech", "M.Arch", "M.E. / M.Tech", "MBA", "PhD", "Other"].map((q) => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.qualification && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.qualification}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel label="Years of Experience" />
                  <Input
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value.replace(/\D/g, ""))}
                    onBlur={() => handleBlur("experience")}
                    className="rounded-xl bg-ghost"
                    placeholder="e.g., 5"
                  />
                  {errors.experience && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.experience}
                    </p>
                  )}
                  {Number(formData.experience) < 2 && formData.experience && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-accent">
                      <Info className="h-3 w-3" />
                      Minimum 2 years of experience recommended
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Organization (Optional) */}
        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          <div className="px-5">
            <SectionHeader
              icon={Building2}
              title="Organization Information (Optional)"
              collapsed={collapsedSections.has("org")}
              onToggle={() => toggleSection("org")}
            />
          </div>
          {!collapsedSections.has("org") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="border-t border-border px-5 pb-5 pt-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel label="Organization Name" />
                  <Input
                    value={formData.organization}
                    onChange={(e) => handleChange("organization", e.target.value)}
                    className="rounded-xl bg-ghost"
                  />
                </div>
                <div>
                  <FieldLabel label="Designation" />
                  <Input
                    value={formData.designation}
                    onChange={(e) => handleChange("designation", e.target.value)}
                    className="rounded-xl bg-ghost"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Persistent Sidebar */}
      <div className="lg:sticky lg:top-24 space-y-4 h-fit">
        {/* Exam Slot */}
        <div className="rounded-2xl bg-card shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean/10">
              <Calendar className="h-4 w-4 text-ocean" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Exam Slot</h3>
          </div>
          <div>
            <FieldLabel label="Select Exam Date" required />
            <Select value={formData.examDate} onValueChange={(v) => handleSelectChange("examDate", v)}>
              <SelectTrigger className="rounded-xl bg-ghost">
                <SelectValue placeholder={slotsLoading ? "Loading dates..." : "Choose a date"} />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.examDate && (
              <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.examDate}
              </p>
            )}
            <div className="mt-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Time:</span> 11:00 AM (Fixed)
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Validity:</span> 1 year from exam date
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Only 1st & 3rd Saturdays available
              </p>
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="rounded-2xl bg-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Fee Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Exam Fee</span>
              <span className="font-mono">₹ {examFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="my-2 h-px bg-border" />
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total Payable</span>
              <span className="font-mono text-primary">₹ {examFee.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">* Fixed fee (no discounts or dynamic pricing)</p>
        </div>

        {/* Proof of Identity */}
        <div className="rounded-2xl bg-card shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <ShieldCheck className="h-4 w-4 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Proof of Identity</h3>
          </div>
          <div className="space-y-3">
            <div>
              <FieldLabel label="ID Proof Type" required />
              <Select
                value={formData.idProofType}
                onValueChange={(v) => {
                  handleSelectChange("idProofType", v);
                  if (formData.idProofNumber.trim()) {
                    validateField("idProofNumber", formData.idProofNumber);
                  }
                }}
              >
                <SelectTrigger className="rounded-xl bg-ghost">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {idProofTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idProofType && (
                <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.idProofType}
                </p>
              )}
            </div>
            <div>
              <FieldLabel label="Identification Number" required />
              <Input
                value={formData.idProofNumber}
                onChange={(e) => handleChange("idProofNumber", e.target.value)}
                onBlur={() => handleBlur("idProofNumber")}
                className="rounded-xl bg-ghost"
                placeholder="Enter ID number"
              />
              {fieldError("idProofNumber")}
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="rounded-2xl bg-card shadow-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Declaration</h3>
          <div className="flex items-start gap-3">
            <Checkbox
              id="exp"
              checked={formData.experienceChecked}
              onCheckedChange={(c) => handleCheckChange("experienceChecked", !!c)}
              className="mt-0.5"
            />
            <label htmlFor="exp" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I confirm that I have a minimum of 2 years of relevant work experience in the green building domain.
            </label>
          </div>
          {errors.experienceChecked && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.experienceChecked}
            </p>
          )}
          <div className="flex items-start gap-3">
            <Checkbox
              id="decl"
              checked={formData.declarationChecked}
              onCheckedChange={(c) => handleCheckChange("declarationChecked", !!c)}
              className="mt-0.5"
            />
            <label htmlFor="decl" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I declare that all information provided is accurate and complete. I understand that providing false information may result in cancellation of my registration.
            </label>
          </div>
          {errors.declarationChecked && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.declarationChecked}
            </p>
          )}
        </div>

        {/* Next Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isRegistrationDisabled}
          className="w-full rounded-xl h-12 text-sm font-semibold"
        >
          {isRegistrationDisabled
            ? "Registration Disabled (Already Paid)"
            : isSubmitting
              ? "Submitting..."
              : "Next: Review Details"}
        </Button>
      </div>
      </div>
    </form>
  );
};
