import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Award, ReceiptText, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  createCertificationApplicationStepOne,
  getCertificationApplicationStepOnePrefill,
  getCertificationApplicationStepTwoPrefill,
  updateCertificationApplicationStepTwo,
  updateCertificationApplicationStepThreePayment,
  type MyProjectListItem,
} from "@/lib/projectRegistration";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

const steps = [
  { id: 1, title: "Certification Type", icon: Award },
  { id: 2, title: "Invoice & Fee Summary", icon: ReceiptText },
  { id: 3, title: "Payment", icon: Wallet },
];

type LooseRecord = Record<string, unknown>;
type FeeSummary = {
  baseFee: number;
  expediteCharges: number;
  gstAmount: number;
  totalAmount: number;
};

function asRecord(value: unknown): LooseRecord | null {
  return value && typeof value === "object" ? (value as LooseRecord) : null;
}

function pickFirst(source: LooseRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

const ApplyCertification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<MyProjectListItem | null>(
    (location.state as { project?: MyProjectListItem } | null)?.project ?? null,
  );
  const [certStep, setCertStep] = useState(1);
  const [certType, setCertType] = useState("");
  const [expediteChoice, setExpediteChoice] = useState<"" | "yes" | "no">("");
  const [savingStepOne, setSavingStepOne] = useState(false);
  const [loadingStepTwoPrefill, setLoadingStepTwoPrefill] = useState(false);
  const [savingStepTwo, setSavingStepTwo] = useState(false);
  const [submittingStepThree, setSubmittingStepThree] = useState(false);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
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
  });
  const [paymentForm, setPaymentForm] = useState({
    paymentType: "Demand Draft",
    ddNumber: "",
    ifscCode: "",
    bankName: "",
    bankBranch: "",
    paymentAmount: "",
    paymentDate: "",
    paymentRemarks: "",
  });
  const [stepOneForm, setStepOneForm] = useState({
    noOfTowers: "",
    siteAreaSqm: "",
    siteAreaSqft: "",
    totalBuiltUpAreaSqm: "",
    totalBuiltUpAreaSqft: "",
  });

  useEffect(() => {
    const projectId = Number(id);
    if (!Number.isFinite(projectId)) {
      setLoading(false);
      return;
    }

    const loadProject = async () => {
      setLoading(true);
      try {
        const response = await getCertificationApplicationStepOnePrefill(projectId);
        const root = asRecord(response) ?? {};
        const payload = asRecord(root.data) ?? root;
        const stepOne = asRecord(payload.stepOne) ?? payload;
        const stepTwo = asRecord(payload.stepTwo) ?? payload;

        const resolvedProjectId =
          (pickFirst(payload, ["projectId", "id"]) as number | string | undefined) ??
          projectId;
        const resolvedProjectName = pickFirst(stepOne, ["projectName"]) as string | undefined;
        const resolvedCity = pickFirst(stepOne, ["city"]) as string | undefined;
        const resolvedState = pickFirst(stepOne, ["state"]) as string | undefined;

        setProject((prev) => ({
          ...(prev ?? { id: projectId }),
          id: Number(resolvedProjectId) || projectId,
          igbcProjectId:
            (pickFirst(payload, ["igbcProjectId", "igbcprojectid"]) as string | number | undefined) ??
            prev?.igbcProjectId,
          igbcprojectid:
            (pickFirst(payload, ["igbcprojectid", "igbcProjectId"]) as string | number | undefined) ??
            prev?.igbcprojectid,
          temporaryProjectId:
            (pickFirst(payload, ["temporaryProjectId"]) as string | undefined) ??
            prev?.temporaryProjectId,
          status: (pickFirst(payload, ["status"]) as string | undefined) ?? prev?.status,
          paymentStatus:
            (pickFirst(payload, ["paymentStatus"]) as string | undefined) ?? prev?.paymentStatus,
          certificateAppliedStatus:
            (pickFirst(payload, [
              "certificationApplicationStatus",
              "certificateAppliedStatus",
            ]) as string | boolean | undefined) ?? prev?.certificateAppliedStatus,
          ratingSystem:
            (pickFirst(stepOne, ["ratingSystem"]) as string | undefined) ?? prev?.ratingSystem,
          subRatingType:
            (pickFirst(stepOne, ["subRatingType"]) as string | undefined) ?? prev?.subRatingType,
          projectType:
            (pickFirst(stepOne, ["projectType"]) as string | undefined) ?? prev?.projectType,
          constructionType:
            (pickFirst(stepOne, ["constructionType"]) as string | undefined) ??
            prev?.constructionType,
          projectName: resolvedProjectName ?? prev?.projectName,
          city: resolvedCity ?? prev?.city,
          state: resolvedState ?? prev?.state,
        }));
        setStepOneForm((prev) => ({
          ...prev,
          noOfTowers:
            pickFirst(stepOne, ["numberOfBuildings", "noOfTowers"]) != null
              ? String(pickFirst(stepOne, ["numberOfBuildings", "noOfTowers"]))
              : prev.noOfTowers,
          siteAreaSqm:
            pickFirst(stepOne, ["siteAreaSqm"]) != null
              ? String(pickFirst(stepOne, ["siteAreaSqm"]))
              : prev.siteAreaSqm,
          siteAreaSqft:
            pickFirst(stepOne, ["siteAreaSqft"]) != null
              ? String(pickFirst(stepOne, ["siteAreaSqft"]))
              : prev.siteAreaSqft,
          totalBuiltUpAreaSqm:
            pickFirst(stepOne, ["totalBuiltUpAreaSqm", "totalBuiltUpArea"]) != null
              ? String(pickFirst(stepOne, ["totalBuiltUpAreaSqm", "totalBuiltUpArea"]))
              : prev.totalBuiltUpAreaSqm,
          totalBuiltUpAreaSqft:
            pickFirst(stepOne, ["totalBuiltUpAreaSqft"]) != null
              ? String(pickFirst(stepOne, ["totalBuiltUpAreaSqft"]))
              : prev.totalBuiltUpAreaSqft,
        }));
        const certificationTypeValue = pickFirst(stepOne, ["certificationType"]);
        if (certificationTypeValue === 1) {
          setCertType("Pre-Certification");
        } else if (certificationTypeValue === 2) {
          setCertType("Certification");
        }
        const expediteReviewValue = pickFirst(stepOne, ["expediteReview"]);
        if (expediteReviewValue === true) {
          setExpediteChoice("yes");
        } else if (expediteReviewValue === false) {
          setExpediteChoice("no");
        }
      } catch (error) {
        setProject(null);
        toast({
          title: "Unable to load project",
          description: error instanceof Error ? error.message : "Please retry.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [id, toast]);

  const projectDisplayId = String(
    project?.igbcprojectid ?? project?.igbcProjectId ?? project?.temporaryProjectId ?? project?.id ?? "-",
  );
  const expedite = expediteChoice === "yes";
  const displayedBaseFee = feeSummary?.baseFee ?? 236000;
  const displayedExpediteCharges = feeSummary?.expediteCharges ?? (expedite ? 50000 : 0);
  const gstPercent = 18;
  const displayedGstAmount = invoiceForm.isSez === "Yes" ? 0 : Number(((displayedBaseFee + displayedExpediteCharges) * gstPercent / 100).toFixed(2));
  const displayedTdsAmount = invoiceForm.deductTds === "Yes" ? Number((displayedBaseFee * 0.1).toFixed(2)) : 0;
  const displayedTotalAmount = Number((displayedBaseFee + displayedExpediteCharges + displayedGstAmount - displayedTdsAmount).toFixed(2));

  const updateStepOneField = (key: keyof typeof stepOneForm, value: string) => {
    setStepOneForm((prev) => ({ ...prev, [key]: value }));
  };
  const updateInvoiceField = (key: keyof typeof invoiceForm, value: string) => {
    setInvoiceForm((prev) => ({ ...prev, [key]: value }));
  };
  const updatePaymentField = (key: keyof typeof paymentForm, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setPaymentForm((prev) => ({
      ...prev,
      paymentAmount: displayedTotalAmount > 0 ? String(displayedTotalAmount) : "",
    }));
  }, [displayedTotalAmount]);

  useEffect(() => {
    if (certStep !== 2 || !project?.id) {
      return;
    }

    const loadStepTwoPrefill = async () => {
      setLoadingStepTwoPrefill(true);
      try {
        const response = await getCertificationApplicationStepTwoPrefill(project.id);
        const root = asRecord(response) ?? {};
        const payload = asRecord(root.data) ?? root;
        const stepTwo = asRecord(payload.stepTwo) ?? payload;
        setInvoiceForm((prev) => ({
          ...prev,
          invoiceOrg: String(pickFirst(stepTwo, ["organizationName"]) ?? prev.invoiceOrg),
          invoiceAddress: String(
            pickFirst(stepTwo, ["organizationAddress", "address"]) ?? prev.invoiceAddress,
          ),
          invoiceCity: String(pickFirst(stepTwo, ["organizationCity", "city"]) ?? prev.invoiceCity),
          invoiceState: String(
            pickFirst(stepTwo, ["organizationState", "state"]) ?? prev.invoiceState,
          ),
          invoicePincode: String(
            pickFirst(stepTwo, ["organizationPinCode", "pinCode"]) ?? prev.invoicePincode,
          ),
          pan: String(pickFirst(stepTwo, ["panNumber"]) ?? prev.pan),
          hasGst:
            pickFirst(stepTwo, ["hasGstNumber"]) === true
              ? "Yes"
              : pickFirst(stepTwo, ["hasGstNumber"]) === false
              ? "No"
              : prev.hasGst,
          gstNumber: String(pickFirst(stepTwo, ["gstNumber"]) ?? prev.gstNumber),
          isSez:
            pickFirst(stepTwo, ["sezSelected"]) === true
              ? "Yes"
              : pickFirst(stepTwo, ["sezSelected"]) === false
              ? "No"
              : prev.isSez,
          deductTds:
            pickFirst(stepTwo, ["tdsSelected"]) === true
              ? "Yes"
              : pickFirst(stepTwo, ["tdsSelected"]) === false
              ? "No"
              : prev.deductTds,
          couponCode: String(pickFirst(stepTwo, ["couponCode"]) ?? prev.couponCode),
        }));
        const toNumber = (value: unknown) => {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : 0;
        };
        const baseFee = toNumber(pickFirst(stepTwo, ["certificationFee", "baseFee"]));
        const gstAmount = toNumber(pickFirst(stepTwo, ["gstAmount"]));
        const tdsAmount = toNumber(pickFirst(stepTwo, ["tdsAmount"]));
        const totalAmount = toNumber(pickFirst(stepTwo, ["finalPayableAmount", "totalAmount"]));
        if (baseFee > 0 || gstAmount > 0 || tdsAmount > 0 || totalAmount > 0) {
          const expediteCharges = Math.max(0, totalAmount - baseFee - gstAmount + tdsAmount);
          setFeeSummary({
            baseFee,
            expediteCharges,
            gstAmount,
            totalAmount,
          });
        }
      } catch (error) {
        toast({
          title: "Unable to load step two prefill",
          description: error instanceof Error ? error.message : "Please retry.",
          variant: "destructive",
        });
      } finally {
        setLoadingStepTwoPrefill(false);
      }
    };

    void loadStepTwoPrefill();
  }, [certStep, project?.id, toast]);

  const handleStepOneContinue = async () => {
    if (!certType || !expediteChoice || !stepOneForm.noOfTowers.trim() || !stepOneForm.totalBuiltUpAreaSqm.trim()) {
      toast({
        title: "Please fill required fields",
        description: "Select certification type and expedite option, then fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!project?.id) {
      toast({
        title: "Project not found",
        description: "Unable to submit certification application.",
        variant: "destructive",
      });
      return;
    }

    setSavingStepOne(true);
    try {
      const response = await createCertificationApplicationStepOne({
        projectId: project.id,
        certificationType: certType === "Pre-Certification" ? 1 : certType === "Certification" ? 2 : undefined,
        expediteReview: expediteChoice === "yes",
      });
      const root = asRecord(response) ?? {};
      const payload = asRecord(root.data) ?? root;
      const stepOnePayload = asRecord(payload.stepOne) ?? payload;
      const returnedCertificationType = pickFirst(stepOnePayload, ["certificationType"]);
      if (returnedCertificationType === 1) {
        setCertType("Pre-Certification");
      } else if (returnedCertificationType === 2) {
        setCertType("Certification");
      }
      const returnedExpediteReview = pickFirst(stepOnePayload, ["expediteReview"]);
      if (returnedExpediteReview === true) {
        setExpediteChoice("yes");
      } else if (returnedExpediteReview === false) {
        setExpediteChoice("no");
      }
      const invoiceBreakdown =
        asRecord(payload.invoiceBreakdown) ??
        asRecord(payload.feeSummary) ??
        asRecord(payload.fees) ??
        payload;
      const baseFeeRaw = pickFirst(invoiceBreakdown, [
        "baseFee",
        "registrationFee",
        "certificationFee",
        "fee",
      ]);
      const expediteRaw = pickFirst(invoiceBreakdown, ["expediteCharges", "expediteFee"]);
      const gstRaw = pickFirst(invoiceBreakdown, ["gstAmount", "gst"]);
      const totalRaw = pickFirst(invoiceBreakdown, ["totalAmount", "totalPayable", "total"]);
      const toNumber = (value: unknown) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };
      const baseFee = toNumber(baseFeeRaw);
      const expediteCharges = toNumber(expediteRaw);
      const gstAmount = toNumber(gstRaw);
      const totalAmount = toNumber(totalRaw);

      if (baseFee > 0 || expediteCharges > 0 || gstAmount > 0 || totalAmount > 0) {
        setFeeSummary({
          baseFee,
          expediteCharges,
          gstAmount,
          totalAmount,
        });
      } else {
        setFeeSummary(null);
      }

      setProject((prev) =>
        prev
          ? {
              ...prev,
            }
          : prev,
      );
      setCertStep(2);
    } catch (error) {
      toast({
        title: "Unable to submit step one",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "destructive",
      });
    } finally {
      setSavingStepOne(false);
    }
  };

  const handleStepTwoContinue = async () => {
    if (!project?.id) {
      toast({
        title: "Project not found",
        description: "Unable to save invoice details.",
        variant: "destructive",
      });
      return;
    }

    if (
      !invoiceForm.invoiceOrg.trim() ||
      !invoiceForm.invoiceAddress.trim() ||
      !invoiceForm.invoiceCity.trim() ||
      !invoiceForm.invoiceState.trim() ||
      !invoiceForm.invoicePincode.trim() ||
      !invoiceForm.pan.trim()
    ) {
      toast({
        title: "Please fill required fields",
        description: "Organization and PAN details are required.",
        variant: "destructive",
      });
      return;
    }

    setSavingStepTwo(true);
    try {
      await updateCertificationApplicationStepTwo(project.id, {
        organizationName: invoiceForm.invoiceOrg.trim(),
        address: invoiceForm.invoiceAddress.trim(),
        city: invoiceForm.invoiceCity.trim(),
        state: invoiceForm.invoiceState.trim(),
        pinCode: invoiceForm.invoicePincode.trim(),
        panNumber: invoiceForm.pan.trim().toUpperCase(),
        hasGstNumber: invoiceForm.hasGst === "Yes",
        gstNumber:
          invoiceForm.hasGst === "Yes"
            ? invoiceForm.gstNumber.trim().toUpperCase() || undefined
            : undefined,
        sezSelected: invoiceForm.isSez === "Yes",
        tdsSelected: invoiceForm.deductTds === "Yes",
        couponCode: invoiceForm.couponCode.trim() || undefined,
      });
      setCertStep(3);
    } catch (error) {
      toast({
        title: "Unable to save step two",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "destructive",
      });
    } finally {
      setSavingStepTwo(false);
    }
  };

  const handleStepThreeSubmit = async () => {
    if (!project?.id) {
      toast({
        title: "Project not found",
        description: "Unable to submit payment details.",
        variant: "destructive",
      });
      return;
    }

    if (
      !paymentForm.ddNumber.trim() ||
      !paymentForm.ifscCode.trim() ||
      !paymentForm.bankName.trim() ||
      !paymentForm.bankBranch.trim() ||
      !paymentForm.paymentDate.trim()
    ) {
      toast({
        title: "Please fill required payment fields",
        description: "All required offline payment fields must be filled.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingStepThree(true);
    try {
      await updateCertificationApplicationStepThreePayment(project.id, {
        paymentMethod: "offline",
        paymentType: paymentForm.paymentType || "Demand Draft",
        transactionReference: paymentForm.ddNumber.trim(),
        ifscCode: paymentForm.ifscCode.trim(),
        bankName: paymentForm.bankName.trim(),
        branch: paymentForm.bankBranch.trim(),
        amount: Number(displayedTotalAmount.toFixed(2)),
        paymentDate: paymentForm.paymentDate,
        remarks: paymentForm.paymentRemarks.trim() || undefined,
      });
      setProject((prev) =>
        prev
          ? {
              ...prev,
              certificateAppliedStatus: "yes",
            }
          : prev,
      );
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Unable to submit payment",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "destructive",
      });
    } finally {
      setSubmittingStepThree(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Award className="h-4.5 w-4.5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Apply for Certification</h1>
            <p className="text-[12px] text-muted-foreground">Submit your approved project for IGBC certification</p>
          </div>
        </motion.div>

        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => s.id < certStep && setCertStep(s.id)}
                    disabled={s.id > certStep}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all sm:h-12 sm:w-12 ${
                      s.id < certStep
                        ? "bg-primary text-primary-foreground shadow-md"
                        : s.id === certStep
                        ? "bg-primary text-primary-foreground shadow-premium ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.id < certStep ? <Check className="h-5 w-5" /> : s.id}
                  </button>
                  <span className={`mt-2 hidden text-xs font-medium sm:block ${s.id <= certStep ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="mx-2 h-0.5 flex-1 rounded-full bg-muted sm:mx-3">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: s.id < certStep ? "100%" : "0%" }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm font-medium text-foreground sm:hidden">
            Step {certStep}: {steps[certStep - 1].title}
          </p>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
          {loading && <p className="text-sm text-muted-foreground">Loading project details...</p>}

          {!loading && !project && (
            <p className="text-sm text-muted-foreground">Project not found for certification.</p>
          )}

          {!loading && project && (
            <>
              <div className="rounded-xl bg-ghost p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Project:</span> <span className="font-medium text-foreground">{project.projectName ?? "-"}</span></div>
                  <div><span className="text-muted-foreground">ID:</span> <span className="font-mono font-medium text-foreground">{projectDisplayId}</span></div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {certStep === 1 && (
                  <motion.div key="cert-s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-6 space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Select Certification Type</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Choose the certification option for this approved project</p>
                      <div className="mt-4 flex gap-3">
                        {["Pre-Certification", "Certification"].map((t) => (
                          <button key={t} onClick={() => setCertType(t)} className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${certType === t ? "border-primary bg-primary-muted shadow-md" : "border-border hover:border-primary/30"}`}>
                            <p className="text-sm font-semibold text-foreground">{t}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{t === "Pre-Certification" ? "Preliminary review at design stage" : "Full certification after construction"}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-sm font-semibold text-foreground">Opting for Expedite Review? *</p>
                      <div className="mt-2 flex items-center gap-6 text-sm">
                        <label className="inline-flex items-center gap-2 text-foreground">
                          <input
                            type="radio"
                            name="expediteChoice"
                            checked={expediteChoice === "yes"}
                            onChange={() => setExpediteChoice("yes")}
                            className="h-4 w-4 border-input text-primary focus:ring-primary/30"
                          />
                          Yes
                        </label>
                        <label className="inline-flex items-center gap-2 text-foreground">
                          <input
                            type="radio"
                            name="expediteChoice"
                            checked={expediteChoice === "no"}
                            onChange={() => setExpediteChoice("no")}
                            className="h-4 w-4 border-input text-primary focus:ring-primary/30"
                          />
                          No
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <InputField
                        label="No. of Towers*"
                        value={stepOneForm.noOfTowers}
                        onChange={(v) => updateStepOneField("noOfTowers", v)}
                      />
                      <InputField
                        label="Site Area in sq.m"
                        value={stepOneForm.siteAreaSqm}
                        onChange={(v) => updateStepOneField("siteAreaSqm", v)}
                      />
                      <InputField
                        label="Site Area in sq.ft"
                        value={stepOneForm.siteAreaSqft}
                        onChange={(v) => updateStepOneField("siteAreaSqft", v)}
                      />
                      <InputField
                        label="Total Built-up area in sq.m *"
                        value={stepOneForm.totalBuiltUpAreaSqm}
                        onChange={(v) => updateStepOneField("totalBuiltUpAreaSqm", v)}
                      />
                      <InputField
                        label="Total Built-up area in sq.ft"
                        value={stepOneForm.totalBuiltUpAreaSqft}
                        onChange={(v) => updateStepOneField("totalBuiltUpAreaSqft", v)}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => navigate("/projects?tab=approved")} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
                      <button
                        onClick={() => void handleStepOneContinue()}
                        disabled={savingStepOne}
                        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingStepOne ? "Submitting..." : "Continue"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {certStep === 2 && (
                  <motion.div key="cert-s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-6 space-y-5">
                    {loadingStepTwoPrefill && (
                      <p className="text-sm text-muted-foreground">Loading invoice prefill...</p>
                    )}
                    <div className="grid gap-6 lg:grid-cols-5">
                      <div className="space-y-6 lg:col-span-3">
                        <div className="rounded-2xl border border-border p-6">
                          <h2 className="text-lg font-bold text-foreground">Organization Details</h2>
                          <p className="mt-1 text-sm text-muted-foreground">For invoice generation</p>
                          <div className="mt-4 space-y-4">
                            <InputField label="Organization Name *" value={invoiceForm.invoiceOrg} onChange={(v) => updateInvoiceField("invoiceOrg", v)} />
                            <InputField label="Address *" value={invoiceForm.invoiceAddress} onChange={(v) => updateInvoiceField("invoiceAddress", v)} />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <InputField label="City *" value={invoiceForm.invoiceCity} onChange={(v) => updateInvoiceField("invoiceCity", v)} />
                              <InputField label="State *" value={invoiceForm.invoiceState} onChange={(v) => updateInvoiceField("invoiceState", v)} />
                              <InputField label="PIN Code *" value={invoiceForm.invoicePincode} onChange={(v) => updateInvoiceField("invoicePincode", v)} />
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-border p-6">
                          <h2 className="text-lg font-bold text-foreground">Tax Information</h2>
                          <div className="mt-4 space-y-4">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">PAN Number *</label>
                              <input
                                value={invoiceForm.pan}
                                onChange={(e) => updateInvoiceField("pan", e.target.value.toUpperCase())}
                                placeholder="AAAAA1234A"
                                maxLength={10}
                                className="h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm uppercase focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">Has GST Number?</label>
                              <div className="flex gap-3">
                                {["Yes", "No"].map((v) => (
                                  <button
                                    key={v}
                                    onClick={() => updateInvoiceField("hasGst", v)}
                                    className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${invoiceForm.hasGst === v ? "border-primary bg-primary-muted" : "border-border text-muted-foreground"}`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {invoiceForm.hasGst === "Yes" && (
                              <InputField label="GST Number" value={invoiceForm.gstNumber} onChange={(v) => updateInvoiceField("gstNumber", v.toUpperCase())} />
                            )}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">SEZ Category?</label>
                                <div className="flex gap-3">
                                  {["Yes", "No"].map((v) => (
                                    <button key={v} onClick={() => updateInvoiceField("isSez", v)} className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${invoiceForm.isSez === v ? "border-primary bg-primary-muted" : "border-border text-muted-foreground"}`}>{v}</button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Deduct TDS 10%?</label>
                                <div className="flex gap-3">
                                  {["Yes", "No"].map((v) => (
                                    <button key={v} onClick={() => updateInvoiceField("deductTds", v)} className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${invoiceForm.deductTds === v ? "border-primary bg-primary-muted" : "border-border text-muted-foreground"}`}>{v}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <InputField label="Coupon Code" value={invoiceForm.couponCode} onChange={(v) => updateInvoiceField("couponCode", v)} />
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-2">
                        <div className="sticky top-24 rounded-2xl border border-border p-6">
                          <h3 className="text-lg font-bold text-foreground">Summary</h3>
                          <div className="mt-5 space-y-3 border-b border-border pb-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{certType} Fee</span>
                              <span className="font-mono font-semibold">Rs {displayedBaseFee.toLocaleString("en-IN")}</span>
                            </div>
                            {(expedite || displayedExpediteCharges > 0) && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Expedite Charges</span>
                                <span className="font-mono font-semibold">Rs {displayedExpediteCharges.toLocaleString("en-IN")}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">GST ({gstPercent}%)</span>
                              <span className="font-mono font-semibold">Rs {displayedGstAmount.toLocaleString("en-IN")}</span>
                            </div>
                            {invoiceForm.deductTds === "Yes" && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">TDS Deduction (10%)</span>
                                <span className="font-mono font-semibold text-destructive">- Rs {displayedTdsAmount.toLocaleString("en-IN")}</span>
                              </div>
                            )}
                          </div>
                          {invoiceForm.isSez === "Yes" && (
                            <p className="mt-2 text-xs text-primary">SEZ selected: GST set to 0.</p>
                          )}
                          <div className="mt-4 flex justify-between">
                            <span className="font-semibold text-foreground">Total Payable</span>
                            <span className="font-mono text-lg font-bold text-primary">Rs {displayedTotalAmount.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button onClick={() => setCertStep(1)} className="flex items-center gap-1 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"><ChevronLeft className="h-3 w-3" /> Back</button>
                      <button
                        onClick={() => void handleStepTwoContinue()}
                        disabled={savingStepTwo || loadingStepTwoPrefill}
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingStepTwo ? "Saving..." : "Continue"} <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {certStep === 3 && (
                  <motion.div key="cert-s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-6 space-y-5">
                    {!submitted ? (
                      <>
                        <div className="grid gap-6 lg:grid-cols-5">
                          <div className="lg:col-span-3 rounded-2xl border border-border p-6">
                            <h2 className="text-lg font-bold text-foreground">Offline Payment Details</h2>
                            <div className="mt-5 space-y-4">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Payment Type</label>
                                <select
                                  value={paymentForm.paymentType}
                                  onChange={(e) => updatePaymentField("paymentType", e.target.value)}
                                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <option>Demand Draft</option>
                                  <option>Cheque</option>
                                  <option>NEFT/RTGS</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <InputField label="DD/Cheque/UTR No. *" value={paymentForm.ddNumber} onChange={(v) => updatePaymentField("ddNumber", v)} />
                                <InputField label="IFSC Code *" value={paymentForm.ifscCode} onChange={(v) => updatePaymentField("ifscCode", v)} />
                              </div>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <InputField label="Bank Name *" value={paymentForm.bankName} onChange={(v) => updatePaymentField("bankName", v)} />
                                <InputField label="Branch *" value={paymentForm.bankBranch} onChange={(v) => updatePaymentField("bankBranch", v)} />
                              </div>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <ReadOnlyField label="Amount (Rs) *" value={paymentForm.paymentAmount} />
                                <InputField label="Payment Date *" value={paymentForm.paymentDate} onChange={(v) => updatePaymentField("paymentDate", v)} type="date" />
                              </div>
                              <InputField label="Remarks" value={paymentForm.paymentRemarks} onChange={(v) => updatePaymentField("paymentRemarks", v)} />
                            </div>
                          </div>
                          <div className="lg:col-span-2">
                            <div className="sticky top-24 rounded-2xl border border-border p-6">
                              <h3 className="text-lg font-bold text-foreground">Fee Breakup</h3>
                              <div className="mt-5 space-y-3 border-b border-border pb-4 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">{certType} Fee</span><span className="font-mono font-semibold">Rs {displayedBaseFee.toLocaleString("en-IN")}</span></div>
                                {(expedite || displayedExpediteCharges > 0) && <div className="flex justify-between"><span className="text-muted-foreground">Expedite Charges</span><span className="font-mono font-semibold">Rs {displayedExpediteCharges.toLocaleString("en-IN")}</span></div>}
                                <div className="flex justify-between"><span className="text-muted-foreground">GST ({gstPercent}%)</span><span className="font-mono font-semibold">Rs {displayedGstAmount.toLocaleString("en-IN")}</span></div>
                                {invoiceForm.deductTds === "Yes" && <div className="flex justify-between"><span className="text-muted-foreground">TDS Deduction (10%)</span><span className="font-mono font-semibold text-destructive">- Rs {displayedTdsAmount.toLocaleString("en-IN")}</span></div>}
                              </div>
                              <div className="mt-4 flex justify-between">
                                <span className="font-semibold text-foreground">Total Payable</span>
                                <span className="font-mono text-lg font-bold text-primary">Rs {displayedTotalAmount.toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <button onClick={() => setCertStep(2)} className="flex items-center gap-1 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"><ChevronLeft className="h-3 w-3" /> Back</button>
                          <button
                            onClick={() => void handleStepThreeSubmit()}
                            disabled={
                              submittingStepThree ||
                              !paymentForm.ddNumber.trim() ||
                              !paymentForm.ifscCode.trim() ||
                              !paymentForm.bankName.trim() ||
                              !paymentForm.bankBranch.trim() ||
                              !paymentForm.paymentDate.trim()
                            }
                            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {submittingStepThree ? "Submitting..." : "Submit Payment Details"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                          <Check className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-foreground">Application Submitted!</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Your {certType} application for <strong>{project.projectName ?? "-"}</strong> has been submitted.</p>
                        <button onClick={() => navigate("/projects?tab=approved")} className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Done</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        readOnly
        className="h-10 w-full rounded-lg border border-input bg-ghost px-3 text-sm text-muted-foreground"
      />
    </div>
  );
}

export default ApplyCertification;
