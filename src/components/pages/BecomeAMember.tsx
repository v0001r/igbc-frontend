import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { StepProgress } from "@/components/membership/StepProgress";
import { Step1Category } from "@/components/membership/Step1Category";
import { Step2Contacts } from "@/components/membership/Step2Contacts";
import { Step3Review } from "@/components/membership/Step3Review";
import { Step4Invoice } from "@/components/membership/Step4Invoice";
import { Step5Payment } from "@/components/membership/Step5Payment";
import { Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";
import {
  createMembershipApplication,
  generateMembershipProforma,
  getMembershipApplicationById,
  getMembershipMasters,
  getMembershipReview,
  updateMembershipContact,
  updateMembershipDetails,
  updateMembershipInvoice,
  updateMembershipPayment,
  type MembershipMastersResponse,
  type MembershipApplication,
} from "@/lib/membership";

const formatApplicationRef = (rawId?: string, createdAt?: string) => {
  if (!rawId) return "-";
  if (rawId.toUpperCase().startsWith("APP-")) return rawId;
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  const digits = rawId.replace(/\D/g, "");
  const serial = (digits ? Number(digits.slice(-4)) : 1).toString().padStart(4, "0");
  return `APP-${year}-${serial}`;
};

const BecomeAMember = () => {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [applicationId, setApplicationId] = useState("");
  const [masters, setMasters] = useState<MembershipMastersResponse>({
    membershipTypes: [],
    membershipCategories: [],
    membershipPlans: [],
  });
  const [invoiceData, setInvoiceData] = useState<MembershipApplication | null>(null);
  const [existingApplication, setExistingApplication] = useState<MembershipApplication | null>(null);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [savingStep1, setSavingStep1] = useState(false);
  const [savingStep2, setSavingStep2] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [savingStep4, setSavingStep4] = useState(false);
  const [savingStep5, setSavingStep5] = useState(false);
  const paidStatuses = useMemo(
    () => new Set(["paid", "payment_success", "success", "completed", "membership_active"]),
    [],
  );

  const [categoryData, setCategoryData] = useState({
    membershipTypeId: null as number | null,
    membershipCategoryId: null as number | null,
    membershipPlanId: null as number | null,
  });

  const [contactData, setContactData] = useState({
    showInDirectory: false,
    salutation: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobile: "",
    telephone: "",
    organization: "",
    designation: "",
    department: "",
    country: "India",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    pan: "",
    gst: "",
  });
  const storageKey = useMemo(
    () => (userId ? `igbc_membership_application_${userId}` : ""),
    [userId],
  );

  useEffect(() => {
    if (!storageKey) {
      return;
    }
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { applicationId?: string; step?: number };
      if (parsed.applicationId) {
        setApplicationId(parsed.applicationId);
      }
      if (parsed.step && parsed.step >= 1 && parsed.step <= 5) {
        setStep(parsed.step);
      }
    } catch {
      // Ignore invalid persisted state.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !applicationId) {
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify({ applicationId, step }));
  }, [applicationId, step, storageKey]);

  useEffect(() => {
    if (!applicationId) {
      return;
    }
    const loadExistingApplication = async () => {
      try {
        const app = await getMembershipApplicationById(applicationId);
        setExistingApplication(app);
      } catch {
        // ignore stale local application id
      }
    };
    void loadExistingApplication();
  }, [applicationId]);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const result = await getMembershipMasters();
        setMasters(result);
      } catch (error) {
        toast({
          title: "Unable to load membership master data",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        setLoadingMasters(false);
      }
    };
    void loadMasters();
  }, [toast]);

  const typeLabel = useMemo(() => {
    return masters.membershipTypes.find((item) => item.id === categoryData.membershipTypeId)?.name ?? "";
  }, [categoryData.membershipTypeId, masters.membershipTypes]);

  const categoryLabel = useMemo(() => {
    return masters.membershipCategories.find((item) => item.id === categoryData.membershipCategoryId)?.name ?? "";
  }, [categoryData.membershipCategoryId, masters.membershipCategories]);

  const selectedPlan = useMemo(() => {
    return masters.membershipPlans.find((item) => item.id === categoryData.membershipPlanId);
  }, [categoryData.membershipPlanId, masters.membershipPlans]);
  const isIndividualMembershipSelected = useMemo(() => {
    return typeLabel.toLowerCase().includes("individual");
  }, [typeLabel]);
  const existingStatus = existingApplication?.status?.toLowerCase() ?? "";
  const isApplicationPaid = paidStatuses.has(existingStatus);
  const existingMembershipFee = useMemo(() => {
    const app = existingApplication;
    if (!app) {
      return null;
    }
    const candidates = [
      app.amounts?.membershipFee,
      app.membershipFee,
      app.fee,
    ];
    const value = candidates.find((item) => typeof item === "number" && Number.isFinite(item));
    return typeof value === "number" ? value : null;
  }, [existingApplication]);
  const existingGstAmount = useMemo(() => {
    const app = existingApplication;
    if (!app) {
      return null;
    }
    const value = app.amounts?.gst;
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }, [existingApplication]);
  const existingTotalFee = useMemo(() => {
    const app = existingApplication;
    if (!app) {
      return null;
    }
    const candidates = [
      app.details?.amount,
      app.amounts?.total,
      app.totalFee,
      app.total_fee,
      app.amount,
    ];
    const value = candidates.find((item) => typeof item === "number" && Number.isFinite(item));
    return typeof value === "number" ? value : null;
  }, [existingApplication]);

  const persistStep1 = async () => {
    const hasStep1Selection =
      Boolean(categoryData.membershipTypeId) &&
      Boolean(categoryData.membershipCategoryId) &&
      (!isIndividualMembershipSelected || Boolean(categoryData.membershipPlanId));

    if (!hasStep1Selection) {
      toast({
        title: "Complete membership details",
        description: isIndividualMembershipSelected
          ? "Please select membership type, category and plan"
          : "Please select membership type and category",
        variant: "destructive",
      });
      return;
    }

    setSavingStep1(true);
    try {
      if (existingApplication?.status) {
        if (isApplicationPaid) {
          toast({
            title: "Membership already completed",
            description: "Payment is already successful for this application.",
          });
          return;
        }
        toast({
          title: "Application already exists",
          description: `Current status: ${existingApplication.status}`,
          variant: "destructive",
        });
        goTo(2);
        return;
      }

      if (!applicationId) {
        const created = await createMembershipApplication({
          ...(userId ? { userId } : {}),
          membershipTypeId: categoryData.membershipTypeId,
          membershipCategoryId: categoryData.membershipCategoryId,
          ...(isIndividualMembershipSelected && categoryData.membershipPlanId
            ? { membershipPlanId: categoryData.membershipPlanId }
            : {}),
        });
        setApplicationId(created.applicationId ?? created.id);
        setExistingApplication(created);
      } else {
        await updateMembershipDetails(applicationId, {
          ...(userId ? { userId } : {}),
          membershipTypeId: categoryData.membershipTypeId,
          membershipCategoryId: categoryData.membershipCategoryId,
          ...(isIndividualMembershipSelected && categoryData.membershipPlanId
            ? { membershipPlanId: categoryData.membershipPlanId }
            : {}),
        });
        const latest = await getMembershipApplicationById(applicationId);
        setExistingApplication(latest);
      }
      goTo(2);
    } catch (error) {
      toast({
        title: "Unable to save membership details",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSavingStep1(false);
    }
  };

  const persistStep2 = async (formData: typeof contactData) => {
    let currentApplicationId = applicationId;
    if (!currentApplicationId) {
      if (!categoryData.membershipTypeId || !categoryData.membershipCategoryId) {
        toast({
          title: "Membership details required",
          description: "Please choose membership type and category in step 1",
          variant: "destructive",
        });
        return;
      }
      try {
        const created = await createMembershipApplication({
          ...(userId ? { userId } : {}),
          membershipTypeId: categoryData.membershipTypeId,
          membershipCategoryId: categoryData.membershipCategoryId,
          ...(isIndividualMembershipSelected && categoryData.membershipPlanId
            ? { membershipPlanId: categoryData.membershipPlanId }
            : {}),
        });
        currentApplicationId = created.applicationId ?? created.id;
        setApplicationId(currentApplicationId);
      } catch (error) {
        toast({
          title: "Unable to create membership application",
          description: error instanceof Error ? error.message : "Please complete step 1 again",
          variant: "destructive",
        });
        return;
      }
    }

    setSavingStep2(true);
    try {
      const payload = {
        showInDirectory: formData.showInDirectory,
        salutation: formData.salutation.trim(),
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        organization: formData.organization.trim(),
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        addressLine1: formData.address.trim(),
        addressLine2: formData.addressLine2.trim(),
        pincode: formData.pincode.replace(/\D/g, "").slice(0, 6),
        mobile: formData.mobile.replace(/\D/g, ""),
        telephone: formData.telephone.replace(/\D/g, ""),
        email: formData.email.trim().toLowerCase(),
        pan: formData.pan.trim().toUpperCase(),
        gst: formData.gst.trim().toUpperCase(),
      };

      await updateMembershipContact(currentApplicationId, {
        ...payload,
      });
      setContactData((prev) => ({ ...prev, ...payload, address: payload.addressLine1 }));
      goTo(3);
    } catch (error) {
      toast({
        title: "Unable to save contact details",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSavingStep2(false);
    }
  };

  const loadStep3Review = async () => {
    if (!applicationId) {
      return;
    }
    setLoadingReview(true);
    try {
      await getMembershipReview(applicationId);
      goTo(4);
    } catch (error) {
      toast({
        title: "Unable to load review data",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingReview(false);
    }
  };

  const persistStep4 = async () => {
    if (!applicationId) {
      return;
    }
    setSavingStep4(true);
    try {
      await updateMembershipInvoice(applicationId, {
        organization: contactData.organization,
        country: "India",
        state: contactData.state,
        city: contactData.city,
        addressLine1: contactData.address,
        addressLine2: "",
        pincode: contactData.pincode,
        isSez: false,
        advanceTaxInvoice: false,
      });
      const proforma = await generateMembershipProforma(applicationId);
      setInvoiceData(proforma);
      goTo(5);
    } catch (error) {
      toast({
        title: "Unable to generate invoice",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSavingStep4(false);
    }
  };

  const submitStep5Payment = async (payload: {
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
  }) => {
    if (!applicationId) {
      return;
    }
    setSavingStep5(true);
    try {
      await updateMembershipPayment(applicationId, {
        ...payload,
      });
      const updated = await getMembershipApplicationById(applicationId);
      setInvoiceData(updated);
    } catch (error) {
      toast({
        title: "Unable to update payment",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSavingStep5(false);
    }
  };

  const goTo = (s: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(s);
  };

  return (
    <DashboardLayout>
      {/* Compact Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Leaf className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Become an IGBC Member</h1>
          <p className="text-[12px] text-muted-foreground">Join India's premier green building community</p>
        </div>
      </motion.div>

      {/* Step Progress */}
      <div className="mb-6">
        <StepProgress currentStep={step} onStepClick={goTo} />
      </div>

      {(isApplicationPaid || existingApplication?.status) && (
        <div className="mb-6 space-y-4">
          {isApplicationPaid && (
            <div className="rounded-xl border border-primary/20 bg-primary-muted p-4 text-sm shadow-card">
              <p className="font-semibold text-foreground">Membership Application Completed</p>
              <p className="mt-1 text-muted-foreground">
                Your membership payment is successful for application{" "}
                <span className="font-mono">
                  {formatApplicationRef(
                    existingApplication?.applicationId ?? existingApplication?.id,
                    (existingApplication as { createdAt?: string } | null)?.createdAt,
                  )}
                </span>.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="mb-4 text-sm font-semibold text-foreground">Application Details</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Application Number
                </p>
                <p className="mt-1 break-all font-mono text-sm text-foreground">
                  {formatApplicationRef(
                    existingApplication?.applicationId ?? existingApplication?.id,
                    (existingApplication as { createdAt?: string } | null)?.createdAt,
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-semibold text-primary">{existingApplication?.status ?? "-"}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Membership Fee</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {typeof existingMembershipFee === "number"
                    ? `Rs ${existingMembershipFee.toLocaleString("en-IN")}`
                    : "-"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">GST</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {typeof existingGstAmount === "number"
                    ? `Rs ${existingGstAmount.toLocaleString("en-IN")}`
                    : "-"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total Fee</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {typeof existingTotalFee === "number"
                    ? `Rs ${existingTotalFee.toLocaleString("en-IN")}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {!isApplicationPaid && step === 1 && (
          <Step1Category
            key="step1"
            data={categoryData}
            masters={masters}
            loading={loadingMasters || savingStep1}
            onUpdate={setCategoryData}
            onNext={persistStep1}
          />
        )}
        {!isApplicationPaid && step === 2 && (
          <Step2Contacts
            key="step2"
            data={contactData}
            onUpdate={setContactData}
            loading={savingStep2}
            onNext={persistStep2}
            onBack={() => goTo(1)}
          />
        )}
        {!isApplicationPaid && step === 3 && (
          <Step3Review
            key="step3"
            categoryData={{ membershipType: typeLabel, category: categoryLabel }}
            contactData={contactData}
            loading={loadingReview}
            onNext={loadStep3Review}
            onBack={() => goTo(2)}
            onEditStep={goTo}
          />
        )}
        {!isApplicationPaid && step === 4 && (
          <Step4Invoice
            key="step4"
            categoryData={{ membershipType: typeLabel, category: categoryLabel }}
            contactData={contactData}
            invoiceData={invoiceData}
            loading={savingStep4}
            onNext={persistStep4}
            onBack={() => goTo(3)}
          />
        )}
        {!isApplicationPaid && step === 5 && (
          <Step5Payment
            key="step5"
            categoryData={{ membershipType: typeLabel }}
            applicationId={applicationId}
            totalPayable={invoiceData?.totalPayable}
            invoiceNumber={invoiceData?.invoiceNumber}
            onSubmitPayment={submitStep5Payment}
            onBack={() => goTo(4)}
          />
        )}
      </AnimatePresence>

      {/* Trust bar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span>🔒 256-bit SSL Secured</span>
        <span>•</span>
        <span>🏛️ CII – IGBC Certified</span>
        <span>•</span>
        <span>📋 ISO 27001 Compliant</span>
      </div>
    </DashboardLayout>
  );
};

export default BecomeAMember;
