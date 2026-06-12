import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ChevronLeft, ChevronRight, Check, FileText, CreditCard, Users, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";
import {
  calculateProjectRegistrationFee,
  getProjectFeeRuleByRatingSystem,
  isValidProjectCouponCode,
  setProjectRegistrationFeeConfig,
} from "../../lib/projectRegistrationFee";
import {
  createProjectStepOne,
  getProjectCategoryRatingSystems,
  getProjectCategories,
  getProjectRegistrationFeeMasters,
  getProjectResume,
  type ProjectResumeStepOne,
  type ProjectCategoryRatingSystem,
  updateProjectStepTwoDetails,
  updateProjectStepThreeContacts,
  updateProjectRegistrationInvoice,
  updateProjectRegistrationPayment,
} from "@/lib/projectRegistration";

const steps = [
  { id: 1, title: "Project Category", icon: Building2 },
  { id: 2, title: "Project Details", icon: FileText },
  { id: 3, title: "Contacts", icon: Users },
  { id: 4, title: "Invoice", icon: ClipboardList },
  { id: 5, title: "Payment", icon: CreditCard },
];

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

const RegisterProject = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const userId = getCurrentUser()?.id;
  const [step, setStep] = useState(1);
  const [registrationId, setRegistrationId] = useState("");
  const [temporaryProjectId, setTemporaryProjectId] = useState("");
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [loadingResume, setLoadingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingResumeStepOne, setPendingResumeStepOne] = useState<ProjectResumeStepOne | null>(null);
  const [resumeBaseRegistrationFee, setResumeBaseRegistrationFee] = useState<number | null>(null);
  const [resumeFinalPayableAmount, setResumeFinalPayableAmount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    constructionType: "",
    ratingSystem: "",
    ratingSpecific: "",
    projectType: "",
    projectName: "",
    siteAddress: "",
    city: "",
    state: "",
    pincode: "",
    siteAreaSqm: "",
    siteAreaSqft: "",
    numBuildings: "1",
    builtUpAreaSqm: "",
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
    consultantFirstName: "",
    consultantLastName: "",
    consultantOrg: "",
    consultantMobile: "",
    consultantEmail: "",
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
    paymentType: "Demand Draft",
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
    if (field === "builtUpAreaSqm" && value) {
      setFormData((prev) => ({ ...prev, builtUpArea: (parseFloat(value) * 10.764).toFixed(0) }));
    }
    if (field === "builtUpArea" && value) {
      setFormData((prev) => ({ ...prev, builtUpAreaSqm: (parseFloat(value) / 10.764).toFixed(0) }));
    }
  };

  const goTo = (s: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(s);
  };

  const [submitted, setSubmitted] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; label: string; icon: string; desc: string }>>([]);
  const [ratingSystems, setRatingSystems] = useState<ProjectCategoryRatingSystem[]>([]);

  const fallbackCategories = [
    { id: "1", label: "Residential", icon: "🏠", desc: "Apartments, Villas, Townships" },
    { id: "2", label: "Commercial", icon: "🏢", desc: "Offices, IT Parks, Retail" },
    { id: "3", label: "Industrial", icon: "🏭", desc: "Factories, Warehouses" },
    { id: "4", label: "Educational", icon: "🎓", desc: "Schools, Universities" },
    { id: "5", label: "Health and Wellbeing", icon: "🏥", desc: "Hospitals, Clinics" },
    { id: "7", label: "Green Built Environment", icon: "🌿", desc: "Urban and campus environments" },
  ];

  const categoryMetaByName: Record<string, { icon: string; desc: string }> = {
    residential: { icon: "🏠", desc: "Apartments, Villas, Townships" },
    commercial: { icon: "🏢", desc: "Offices, IT Parks, Retail" },
    industrial: { icon: "🏭", desc: "Factories, Warehouses" },
    educational: { icon: "🎓", desc: "Schools, Universities" },
    "health and wellbeing": { icon: "🏥", desc: "Hospitals, Clinics" },
    "green built environment": { icon: "🌿", desc: "Urban and campus environments" },
  };

  useEffect(() => {
    const loadStep1Masters = async () => {
      setLoadingMasters(true);
      try {
        const categoryMasters = await getProjectCategories();
        const apiCategories = (categoryMasters.categories ?? [])
          .filter((item) => item?.id !== undefined && item?.name)
          .map((item) => {
            const normalized = String(item.name).trim().toLowerCase();
            const meta = categoryMetaByName[normalized] ?? { icon: "🏗️", desc: "Project category" };
            return {
              id: String(item.id),
              label: String(item.name),
              icon: meta.icon,
              desc: meta.desc,
            };
          });
        setCategories(apiCategories.length > 0 ? apiCategories : fallbackCategories);
      } catch (error) {
        setCategories(fallbackCategories);
        toast({
          title: "Unable to load project categories",
          description: error instanceof Error ? `${error.message}. Showing fallback categories.` : "Please retry.",
          variant: "destructive",
        });
      } finally {
        setLoadingMasters(false);
      }
    };
    void loadStep1Masters();
  }, [toast]);

  useEffect(() => {
    const loadFeeMasters = async () => {
      try {
        const feeMasters = await getProjectRegistrationFeeMasters();
        setProjectRegistrationFeeConfig(feeMasters);
      } catch (error) {
        toast({
          title: "Unable to load fee rules",
          description: error instanceof Error ? `${error.message}. Fee preview may be unavailable.` : "Please retry.",
          variant: "destructive",
        });
      }
    };
    void loadFeeMasters();
  }, [toast]);

  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return;
    }

    const loadResumeData = async () => {
      setLoadingResume(true);
      try {
        const response = await getProjectResume(projectId);
        setRegistrationId(String(response.projectId ?? projectId));
        setPendingResumeStepOne(response.stepOne ?? null);

        if (response.stepOne?.category !== undefined) {
          update("category", String(response.stepOne.category));
        }
        if (response.stepOne?.constructionType) {
          update("constructionType", response.stepOne.constructionType);
        }
        if (response.stepOne?.projectType) {
          update("projectType", response.stepOne.projectType);
        }
        const stepOneRegistrationFee = toFiniteNumber(
          (response.stepOne as Record<string, unknown> | undefined)?.registrationFee,
        );
        if (stepOneRegistrationFee !== null && stepOneRegistrationFee > 0) {
          setResumeBaseRegistrationFee(stepOneRegistrationFee);
        }

        const resumedFinalPayable = toFiniteNumber(
          (response as Record<string, unknown>).finalPayableAmount,
        );
        if (resumedFinalPayable !== null && resumedFinalPayable > 0) {
          setResumeFinalPayableAmount(resumedFinalPayable);
        }

        if (response.stepTwo) {
          update("projectName", response.stepTwo.projectName ?? "");
          update("siteAddress", response.stepTwo.address ?? "");
          update("city", response.stepTwo.city ?? "");
          update("state", response.stepTwo.state ?? "");
          update("pincode", response.stepTwo.pincode ?? "");
          update("siteAreaSqm", response.stepTwo.siteAreaSqm ? String(response.stepTwo.siteAreaSqm) : "");
          update("siteAreaSqft", response.stepTwo.siteAreaSqft ? String(response.stepTwo.siteAreaSqft) : "");
          update("numBuildings", response.stepTwo.numberOfBuildings ? String(response.stepTwo.numberOfBuildings) : "1");
          update("builtUpAreaSqm", response.stepTwo.totalBuiltUpAreaSqm ? String(response.stepTwo.totalBuiltUpAreaSqm) : "");
          update("builtUpArea", response.stepTwo.totalBuiltUpAreaSqft ? String(response.stepTwo.totalBuiltUpAreaSqft) : "");
          update("constructionStart", response.stepTwo.constructionStartDate ?? "");
          update("certificationTarget", response.stepTwo.targetCertificationDate ?? "");
        }

        const responseRecord = response as Record<string, unknown>;
        const rawStepThree =
          (responseRecord.stepThree as Record<string, unknown> | undefined) ??
          (responseRecord.projectContacts as Record<string, unknown> | undefined) ??
          (responseRecord.contacts as Record<string, unknown> | undefined) ??
          (responseRecord.step3 as Record<string, unknown> | undefined);
        const stepThreeFormData =
          rawStepThree && typeof rawStepThree.formData === "object"
            ? (rawStepThree.formData as Record<string, unknown>)
            : rawStepThree;

        if (stepThreeFormData && typeof stepThreeFormData === "object") {
          const contacts = stepThreeFormData as Record<string, unknown>;
          const parentOrganization = (contacts.parentOrganization ?? {}) as Record<string, unknown>;
          const projectOwner = (contacts.projectOwner ?? contacts.owner ?? {}) as Record<string, unknown>;
          const projectCoordinator = (contacts.projectCoordinator ?? contacts.coordinator ?? {}) as Record<string, unknown>;
          const architect = (contacts.architect ?? {}) as Record<string, unknown>;
          const consultant = (contacts.consultant ?? {}) as Record<string, unknown>;

          const isIgbcMemberValue =
            parentOrganization.isIgbcMember === true
              ? "Yes"
              : parentOrganization.isIgbcMember === false
              ? "No"
              : "";
          update("isIgbcMember", isIgbcMemberValue);
          update("parentOrgName", String(parentOrganization.organizationName ?? parentOrganization.name ?? ""));
          update("parentOrgAddress", String(parentOrganization.address ?? ""));
          update("parentOrgCity", String(parentOrganization.city ?? ""));
          update("parentOrgState", String(parentOrganization.state ?? ""));
          update("parentOrgPincode", String(parentOrganization.pincode ?? ""));

          update("ownerSalutation", String(projectOwner.salutation ?? ""));
          update("ownerFirstName", String(projectOwner.firstName ?? ""));
          update("ownerLastName", String(projectOwner.lastName ?? ""));
          update("ownerOrg", String(projectOwner.organization ?? ""));
          update("ownerDesignation", String(projectOwner.designation ?? ""));
          update("ownerMobile", String(projectOwner.mobile ?? ""));
          update("ownerEmail", String(projectOwner.email ?? ""));

          update("coordFirstName", String(projectCoordinator.firstName ?? ""));
          update("coordLastName", String(projectCoordinator.lastName ?? ""));
          update("coordOrg", String(projectCoordinator.organization ?? ""));
          update("coordDesignation", String(projectCoordinator.designation ?? ""));
          update("coordMobile", String(projectCoordinator.mobile ?? ""));
          update("coordEmail", String(projectCoordinator.email ?? ""));

          update("architectFirstName", String(architect.firstName ?? ""));
          update("architectLastName", String(architect.lastName ?? ""));
          update("architectOrg", String(architect.organization ?? ""));
          update("architectMobile", String(architect.mobile ?? ""));
          update("architectEmail", String(architect.email ?? ""));

          update("consultantFirstName", String(consultant.firstName ?? ""));
          update("consultantLastName", String(consultant.lastName ?? ""));
          update("consultantOrg", String(consultant.organization ?? ""));
          update("consultantMobile", String(consultant.mobile ?? ""));
          update("consultantEmail", String(consultant.email ?? ""));
        }

        const rawStepFour =
          (responseRecord.stepFour as Record<string, unknown> | undefined) ??
          (responseRecord.projectInvoice as Record<string, unknown> | undefined) ??
          (responseRecord.invoice as Record<string, unknown> | undefined) ??
          (responseRecord.step4 as Record<string, unknown> | undefined);

        if (rawStepFour && typeof rawStepFour === "object") {
          update("invoiceOrg", String(rawStepFour.organizationName ?? rawStepFour.organization ?? ""));
          update("invoiceAddress", String(rawStepFour.organizationAddress ?? rawStepFour.address ?? ""));
          update("invoiceCity", String(rawStepFour.city ?? ""));
          update("invoiceState", String(rawStepFour.state ?? ""));
          update("invoicePincode", String(rawStepFour.pincode ?? ""));
          update("pan", String(rawStepFour.panNumber ?? rawStepFour.pan ?? ""));
          update("hasGst", rawStepFour.hasGst === true ? "Yes" : rawStepFour.hasGst === false ? "No" : "");
          update("gstNumber", String(rawStepFour.gstNumber ?? ""));
          update("isSez", rawStepFour.sezSelected === true ? "Yes" : rawStepFour.sezSelected === false ? "No" : "");
          update("deductTds", rawStepFour.tdsSelected === true ? "Yes" : rawStepFour.tdsSelected === false ? "No" : "");
          update("couponCode", String(rawStepFour.couponCode ?? ""));
          const candidateFee =
            toFiniteNumber(rawStepFour.baseRegistrationFee) ??
            toFiniteNumber(rawStepFour.registrationFee);
          if (candidateFee !== null && candidateFee > 0) {
            setResumeBaseRegistrationFee(candidateFee);
          }

          const stepFourTotalPayable = toFiniteNumber(rawStepFour.totalPayable);
          if (stepFourTotalPayable !== null && stepFourTotalPayable > 0) {
            setResumeFinalPayableAmount(stepFourTotalPayable);
          }
        }

        const rawStepFive =
          (responseRecord.stepFive as Record<string, unknown> | undefined) ??
          (responseRecord.projectPayment as Record<string, unknown> | undefined) ??
          (responseRecord.payment as Record<string, unknown> | undefined) ??
          (responseRecord.step5 as Record<string, unknown> | undefined);

        if (rawStepFive && typeof rawStepFive === "object") {
          update("paymentMethod", String(rawStepFive.paymentMethod ?? "online"));
          update("paymentType", String(rawStepFive.paymentType ?? "Demand Draft"));
          update("ddNumber", String(rawStepFive.transactionReference ?? ""));
          update("ifscCode", String(rawStepFive.ifscCode ?? ""));
          update("bankName", String(rawStepFive.bankName ?? ""));
          update("bankBranch", String(rawStepFive.branch ?? ""));
          const resumedPaymentAmount = toFiniteNumber(rawStepFive.amount);
          if (resumedPaymentAmount !== null && resumedPaymentAmount > 0) {
            update("paymentAmount", String(resumedPaymentAmount));
          }
          update("paymentDate", String(rawStepFive.paymentDate ?? ""));
          update("paymentRemarks", String(rawStepFive.remarks ?? ""));
        }

        const statusValue = String(responseRecord.status ?? responseRecord.projectStatus ?? "").toLowerCase();
        const isAlreadySubmitted =
          statusValue === "submitted" ||
          (typeof response.completedSteps === "number" &&
            typeof response.totalSteps === "number" &&
            response.completedSteps >= response.totalSteps) ||
          (response.nextStep === null && Boolean(rawStepFive));

        if (isAlreadySubmitted) {
          setSubmitted(true);
        }

        const requestedStep = Number(searchParams.get("step"));
        const fallbackStep = typeof response.nextStep === "number" ? response.nextStep : 1;
        const initialStep = Number.isFinite(requestedStep) && requestedStep > 0 ? requestedStep : fallbackStep;
        setStep(Math.max(1, Math.min(5, initialStep)));

        if (response.message) {
          toast({
            title: "Project draft loaded",
            description: response.message,
          });
        }
      } catch (error) {
        toast({
          title: "Unable to resume project",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        setLoadingResume(false);
      }
    };

    void loadResumeData();
  }, [searchParams, toast]);

  const projectTypes: Record<string, string[]> = {
    "1": ["Apartments", "Villas", "Row Houses", "Plotted Development", "Townships"],
    "2": ["Offices", "Banks", "Hotels", "IT Parks", "Retail Malls", "Convention Centers"],
    "3": ["Factories", "Warehouses", "Data Centers", "Logistics Parks"],
    "4": ["Schools", "Universities", "Research Centers", "Training Institutes"],
    "5": ["Hospitals", "Multi-specialty Clinics", "Diagnostics Centers"],
    "7": ["Townships", "Mixed Use", "Campus Development", "Urban Infrastructure"],
  };
  const selectedRatingSystem = ratingSystems.find((item) => String(item.id) === formData.ratingSystem);
  const selectedRatingLabel = selectedRatingSystem?.ratingName ?? formData.ratingSystem;
  const selectedRatingSpecificRequired = (selectedRatingSystem?.specifics?.length ?? 0) > 0;
  const selectedCategory = categories.find((item) => item.id === formData.category);

  const selectedFeeRule = getProjectFeeRuleByRatingSystem(selectedRatingLabel);
  const isRatingConstructionCompatible = Boolean(
    !selectedFeeRule ||
      !formData.constructionType ||
      selectedFeeRule.compatibleConstructionTypes.includes(formData.constructionType),
  );
  const ratingSystemRegistrationFee = toFiniteNumber(selectedRatingSystem?.fees?.nonMember);
  const feePreview = calculateProjectRegistrationFee(selectedRatingLabel, {
    deductTds: formData.deductTds === "Yes",
    sezSelected: formData.isSez === "Yes",
  });
  const registrationFee =
    (resumeBaseRegistrationFee !== null && resumeBaseRegistrationFee > 0
      ? resumeBaseRegistrationFee
      : null) ??
    (ratingSystemRegistrationFee !== null && ratingSystemRegistrationFee > 0
      ? ratingSystemRegistrationFee
      : null) ??
    feePreview.registrationFee;
  const gstPercent = feePreview.gstPercent ?? 18;
  const gstAmount = formData.isSez === "Yes" ? 0 : Number(((registrationFee * gstPercent) / 100).toFixed(2));
  const tdsAmount = formData.deductTds === "Yes" ? Number((registrationFee * 0.1).toFixed(2)) : 0;
  const totalPayable = Math.max(0, Number((registrationFee + gstAmount - tdsAmount).toFixed(2)));
  const paymentPrefillAmount =
    resumeFinalPayableAmount !== null && resumeFinalPayableAmount > 0
      ? resumeFinalPayableAmount
      : totalPayable;

  useEffect(() => {
    const categoryId = Number(formData.category);
    if (!formData.category || Number.isNaN(categoryId)) {
      setRatingSystems([]);
      update("ratingSystem", "");
      update("ratingSpecific", "");
      return;
    }

    const loadRatingSystems = async () => {
      try {
        const response = await getProjectCategoryRatingSystems(categoryId);
        const systems = response.ratingSystems ?? [];
        setRatingSystems(systems);
        if (systems.length > 0) {
          setProjectRegistrationFeeConfig({
            feesByRatingSystem: Object.fromEntries(
              systems.map((item) => [
                item.ratingName,
                {
                  registrationFee: item.fees?.nonMember ?? 0,
                  gstPercent: 18,
                },
              ]),
            ),
          });
        }
      } catch (error) {
        setRatingSystems([]);
        toast({
          title: "Unable to load rating systems",
          description: error instanceof Error ? error.message : "Please retry.",
          variant: "destructive",
        });
      }
    };

    update("ratingSystem", "");
    update("ratingSpecific", "");
    void loadRatingSystems();
  }, [formData.category, toast]);

  useEffect(() => {
    if (!pendingResumeStepOne || ratingSystems.length === 0) {
      return;
    }

    const ratingValue = pendingResumeStepOne.ratingSystem;
    if (ratingValue) {
      const matched = ratingSystems.find(
        (item) =>
          String(item.id) === String(ratingValue) ||
          item.ratingName === ratingValue ||
          item.shortRatingName === ratingValue,
      );
      if (matched) {
        update("ratingSystem", String(matched.id));
      }
    }

    if (pendingResumeStepOne.subRatingType) {
      update("ratingSpecific", pendingResumeStepOne.subRatingType);
    }
    setPendingResumeStepOne(null);
  }, [pendingResumeStepOne, ratingSystems]);

  useEffect(() => {
    if (step !== 5 || formData.paymentAmount.trim()) {
      return;
    }
    if (paymentPrefillAmount > 0) {
      update("paymentAmount", String(paymentPrefillAmount));
    }
  }, [step, paymentPrefillAmount, formData.paymentAmount]);

  const ensureRegistration = async () => {
    if (registrationId) {
      return registrationId;
    }
    const created = await createProjectStepOne({
      category: Number(formData.category),
      ratingSystem: selectedRatingLabel,
      ratingTypeId: selectedRatingSystem?.id ?? (Number(formData.ratingSystem) || undefined),
      subRatingType: formData.ratingSpecific || undefined,
      projectType: formData.projectType,
      constructionType: formData.constructionType,
    });
    const id = String(created.id ?? "");
    if (!id) {
      throw new Error("Project could not be created");
    }
    setRegistrationId(id);
    setTemporaryProjectId(created.temporaryProjectId ?? `P00${id}`);
    return id;
  };

  const saveStep1 = async () => {
    if (
      !formData.category ||
      !formData.constructionType ||
      !formData.ratingSystem ||
      !formData.projectType
    ) {
      toast({
        title: "Complete project category details",
        description: "Category, construction type, rating system and project type are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const upserted = await createProjectStepOne({
        projectId: registrationId ? Number(registrationId) : undefined,
        temporaryProjectId: temporaryProjectId || undefined,
        category: Number(formData.category),
        ratingSystem: selectedRatingLabel,
        ratingTypeId: selectedRatingSystem?.id ?? (Number(formData.ratingSystem) || undefined),
        subRatingType: formData.ratingSpecific || undefined,
        projectType: formData.projectType,
        constructionType: formData.constructionType,
      });
      const id = String(upserted.id ?? "");
      if (!id) {
        throw new Error("Project could not be saved");
      }
      setRegistrationId(id);
      setTemporaryProjectId(upserted.temporaryProjectId ?? temporaryProjectId ?? `P00${id}`);
      const savedRegistrationFee = toFiniteNumber(
        (upserted as Record<string, unknown>).registrationFee ??
          (upserted.stepOne as Record<string, unknown> | undefined)?.registrationFee,
      );
      if (savedRegistrationFee !== null && savedRegistrationFee > 0) {
        setResumeBaseRegistrationFee(savedRegistrationFee);
      }
      goTo(2);
    } catch (error) {
      toast({
        title: "Unable to save step 1",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveStep2 = async () => {
    setSaving(true);
    try {
      const id = await ensureRegistration();
      await updateProjectStepTwoDetails(id, {
        projectName: formData.projectName.trim(),
        address: formData.siteAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        siteAreaSqm: Number(formData.siteAreaSqm || 0),
        siteAreaSqft: Number(formData.siteAreaSqft || 0),
        numberOfBuildings: Number(formData.numBuildings || 0),
        totalBuiltUpAreaSqm: Number(formData.builtUpAreaSqm || 0),
        totalBuiltUpAreaSqft: Number(formData.builtUpArea || 0),
        constructionStartDate: formData.constructionStart || undefined,
        targetCertificationDate: formData.certificationTarget || undefined,
      });
      goTo(3);
    } catch (error) {
      toast({
        title: "Unable to save project details",
        description: error instanceof Error ? error.message : "Please check the form and try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveStep3 = async () => {
    setSaving(true);
    try {
      const id = await ensureRegistration();
      await updateProjectStepThreeContacts(id, {
        formData: {
          parentOrganization: {
            isIgbcMember: formData.isIgbcMember === "Yes",
            organizationName: formData.parentOrgName.trim(),
            address: formData.parentOrgAddress.trim(),
            city: formData.parentOrgCity.trim(),
            state: formData.parentOrgState.trim(),
            pincode: formData.parentOrgPincode.trim(),
          },
          projectOwner: {
            salutation: formData.ownerSalutation,
            firstName: formData.ownerFirstName.trim(),
            lastName: formData.ownerLastName.trim(),
            organization: formData.ownerOrg.trim(),
            designation: formData.ownerDesignation.trim(),
            mobile: formData.ownerMobile.trim(),
            email: formData.ownerEmail.trim().toLowerCase(),
          },
          projectCoordinator: {
            firstName: formData.coordFirstName.trim(),
            lastName: formData.coordLastName.trim(),
            organization: formData.coordOrg.trim(),
            designation: formData.coordDesignation.trim(),
            mobile: formData.coordMobile.trim(),
            email: formData.coordEmail.trim().toLowerCase(),
          },
          architect: {
            firstName: formData.architectFirstName.trim(),
            lastName: formData.architectLastName.trim(),
            organization: formData.architectOrg.trim(),
            mobile: formData.architectMobile.trim(),
            email: formData.architectEmail.trim().toLowerCase(),
          },
          consultant: {
            firstName: formData.consultantFirstName.trim() || undefined,
            lastName: formData.consultantLastName.trim() || undefined,
            organization: formData.consultantOrg.trim() || undefined,
            mobile: formData.consultantMobile.trim() || undefined,
            email: formData.consultantEmail.trim().toLowerCase() || undefined,
          },
        },
      });
      goTo(4);
    } catch (error) {
      toast({
        title: "Unable to save contact details",
        description: error instanceof Error ? error.message : "Please verify the contacts and try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveStep4 = async () => {
    setSaving(true);
    try {
      const id = await ensureRegistration();
      const invoiceResponse = await updateProjectRegistrationInvoice(id, {
        organizationName: formData.invoiceOrg.trim(),
        organizationAddress: formData.invoiceAddress.trim(),
        city: formData.invoiceCity.trim(),
        state: formData.invoiceState.trim(),
        pincode: formData.invoicePincode.trim(),
        panNumber: formData.pan.trim().toUpperCase(),
        hasGst: formData.hasGst === "Yes",
        gstNumber: formData.gstNumber.trim().toUpperCase() || undefined,
        sezSelected: formData.isSez === "Yes",
        tdsSelected: formData.deductTds === "Yes",
        registrationFee,
        couponCode: formData.couponCode.trim() || undefined,
      });
      const savedInvoice = (invoiceResponse as Record<string, unknown>).invoice as
        | Record<string, unknown>
        | undefined;
      const savedRegistrationFee =
        toFiniteNumber(invoiceResponse.registrationFee) ??
        toFiniteNumber(savedInvoice?.registrationFee) ??
        toFiniteNumber(savedInvoice?.baseRegistrationFee);
      if (savedRegistrationFee !== null && savedRegistrationFee > 0) {
        setResumeBaseRegistrationFee(savedRegistrationFee);
      }
      const savedTotalPayable =
        toFiniteNumber(invoiceResponse.finalPayableAmount) ??
        toFiniteNumber(savedInvoice?.totalPayable);
      if (savedTotalPayable !== null && savedTotalPayable > 0) {
        setResumeFinalPayableAmount(savedTotalPayable);
        update("paymentAmount", String(savedTotalPayable));
      }
      goTo(5);
    } catch (error) {
      toast({
        title: "Unable to save invoice details",
        description: error instanceof Error ? error.message : "Please check PAN/GST/coupon details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const submitPaymentAndRegistration = async (paymentMode: "online" | "offline") => {
    setSaving(true);
    try {
      const id = await ensureRegistration();
      await updateProjectRegistrationPayment(id, {
        paymentMethod: paymentMode,
        gatewayResponse:
          paymentMode === "online"
            ? {
                transactionId: `TRX-${Date.now()}`,
                status: "success",
                amount: totalPayable,
                paymentDate: new Date().toISOString(),
              }
            : undefined,
        paymentType: paymentMode === "offline" ? formData.paymentType || "Demand Draft" : undefined,
        transactionReference: paymentMode === "offline" ? formData.ddNumber.trim() || undefined : undefined,
        ifscCode: paymentMode === "offline" ? formData.ifscCode.trim() || undefined : undefined,
        bankName: paymentMode === "offline" ? formData.bankName.trim() || undefined : undefined,
        branch: paymentMode === "offline" ? formData.bankBranch.trim() || undefined : undefined,
        amount: Number(formData.paymentAmount || totalPayable || 0),
        paymentDate: formData.paymentDate || new Date().toISOString().slice(0, 10),
        remarks: formData.paymentRemarks.trim() || undefined,
      });
      setSubmitted(true);
      toast({
        title: "Project submitted successfully",
        description: "Step 5 completed. Your project has been submitted for review.",
      });
    } catch (error) {
      toast({
        title: "Unable to complete payment/submit",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
            <p className="mt-1 font-mono text-sm text-primary">Project ID: {temporaryProjectId || registrationId || "Generated on submit"}</p>
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
                  {categories.length === 0 && !loadingMasters && (
                    <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                      No categories available.
                    </div>
                  )}
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          update("category", c.id);
                        }}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all hover:shadow-md ${
                          formData.category === c.id
                            ? "border-primary bg-primary-muted shadow-md"
                            : "border-border bg-card hover:border-primary/30"
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
                    {ratingSystems.length === 0 && (
                      <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                        No rating systems are mapped to this category yet. Please choose another category or contact support.
                      </div>
                    )}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {ratingSystems.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            update("ratingSystem", String(r.id));
                            update("ratingSpecific", "");
                          }}
                          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                            formData.ratingSystem === String(r.id) ? "border-primary bg-primary-muted" : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            formData.ratingSystem === String(r.id) ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}>
                            {formData.ratingSystem === String(r.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{r.ratingName}</p>
                            <p className="text-xs text-muted-foreground">{r.shortRatingName ? `Code: ${r.shortRatingName}` : "IGBC rating system"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {selectedRatingSpecificRequired && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-foreground">Select Specific</p>
                        <div className="flex flex-wrap gap-2">
                          {(selectedRatingSystem?.specifics ?? []).map((specific) => (
                            <button
                              key={specific}
                              type="button"
                              onClick={() => update("ratingSpecific", specific)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                formData.ratingSpecific === specific
                                  ? "border-primary bg-primary-muted text-foreground"
                                  : "border-border text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              {specific}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {!isRatingConstructionCompatible && (
                      <p className="mt-3 text-xs text-destructive">
                        Selected rating system is not compatible with the chosen construction type.
                      </p>
                    )}
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
                    onClick={() => void saveStep1()}
                    disabled={
                      loadingMasters ||
                      loadingResume ||
                      saving ||
                      !formData.category ||
                      !formData.constructionType ||
                      !formData.ratingSystem ||
                      !formData.projectType ||
                      !isRatingConstructionCompatible
                    }
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
                        value={formData.ratingSpecific ? `${selectedRatingLabel} - ${formData.ratingSpecific}` : selectedRatingLabel}
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
                      <InputField label="Buildup area in (S.Qm) *" value={formData.builtUpAreaSqm} onChange={(v) => update("builtUpAreaSqm", v)} type="number" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    onClick={() => void saveStep2()}
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
                  <p className="text-sm text-muted-foreground">Rating: <span className="font-medium text-foreground">{formData.ratingSpecific ? `${selectedRatingLabel} - ${formData.ratingSpecific}` : selectedRatingLabel}</span></p>
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
                  requiredFields={false}
                />

                <ContactCard
                  title="Consultant"
                  prefix="consultant"
                  formData={formData}
                  update={update}
                  requiredFields={false}
                />

                <div className="flex justify-between">
                  <button onClick={() => goTo(2)} className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <button onClick={() => void saveStep3()} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md">
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
                            <button
                              type="button"
                              onClick={() => {
                                const valid = isValidProjectCouponCode(formData.couponCode);
                                toast({
                                  title: valid ? "Coupon applied" : "Coupon check",
                                  description: valid
                                    ? "Coupon accepted from fee masters."
                                    : "Coupon will be validated on invoice save.",
                                  ...(valid ? {} : { variant: "destructive" as const }),
                                });
                              }}
                              className="rounded-lg bg-primary/10 px-5 text-sm font-semibold text-primary hover:bg-primary/20"
                            >
                              Apply
                            </button>
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
                          <span className="font-mono font-semibold text-foreground">
                            ₹{registrationFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">GST (18%)</span>
                          <span className="font-mono font-semibold text-foreground">
                            ₹{gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {formData.isSez === "Yes" && (
                          <p className="text-xs text-primary">SEZ selected: GST is not applied.</p>
                        )}
                        {formData.deductTds === "Yes" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">TDS Deduction (10%)</span>
                            <span className="font-mono font-semibold text-destructive">
                              -₹{tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between">
                        <span className="font-semibold text-foreground">Total Payable</span>
                        <span className="font-mono text-xl font-bold text-primary">
                          ₹{totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <button onClick={() => void saveStep4()} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md">
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
                      <h3 className="text-lg font-bold text-foreground">
                        Pay ₹{totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                      <p className="text-sm text-muted-foreground">You'll be redirected to our secure payment gateway</p>
                      <button
                        onClick={() => void submitPaymentAndRegistration("online")}
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
                        <select
                          value={formData.paymentType}
                          onChange={(e) => update("paymentType", e.target.value)}
                          className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
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
                     
                      <InputField
    label="Amount (₹) *"
    value={formData.paymentAmount}
    onChange={(v) => update("paymentAmount", v)}
    type="number"
    disabled={true} readOnly />                      {/* <InputField label="Amount (₹) *" value={formData.paymentAmount} onChange={(v) => update("paymentAmount", v)} type="number" readOnly /> */}
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
                      onClick={() => void submitPaymentAndRegistration("offline")}
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
const ContactCard = ({ title, prefix, formData, update, showSalutation, copyFrom, requiredFields = true }: {
  title: string;
  prefix: string;
  formData: Record<string, string>;
  update: (field: string, value: string) => void;
  showSalutation?: boolean;
  copyFrom?: () => void;
  requiredFields?: boolean;
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
        <InputField label={`First Name${requiredFields ? " *" : ""}`} value={formData[`${prefix}FirstName`] || ""} onChange={(v) => update(`${prefix}FirstName`, v)} />
        <InputField label={`Last Name${requiredFields ? " *" : ""}`} value={formData[`${prefix}LastName`] || ""} onChange={(v) => update(`${prefix}LastName`, v)} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField label="Organization" value={formData[`${prefix}Org`] || ""} onChange={(v) => update(`${prefix}Org`, v)} />
        {formData[`${prefix}Designation`] !== undefined && (
          <InputField label="Designation" value={formData[`${prefix}Designation`] || ""} onChange={(v) => update(`${prefix}Designation`, v)} />
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField label={`Mobile${requiredFields ? " *" : ""}`} value={formData[`${prefix}Mobile`] || ""} onChange={(v) => update(`${prefix}Mobile`, v)} placeholder="+91" />
        <InputField label={`Email${requiredFields ? " *" : ""}`} value={formData[`${prefix}Email`] || ""} onChange={(v) => update(`${prefix}Email`, v)} placeholder="name@domain.com" />
      </div>
    </div>
  </div>
);

export default RegisterProject;
