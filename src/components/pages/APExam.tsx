import { useState, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { ExamStep1Registration } from "@/components/exam/ExamStep1Registration";
import { ExamStep2Review } from "@/components/exam/ExamStep2Review";
import { ExamStep3Payment } from "@/components/exam/ExamStep3Payment";
import { ExamStepProgress } from "@/components/exam/ExamStepProgress";
import { GraduationCap } from "lucide-react";
import {
  getApExamRegistrationByEmail,
  registerApExam,
  updateApExamRegistration,
} from "@/lib/apExam";
import { fetchMyProfile, getCurrentUser } from "@/lib/auth";

export interface ExamFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  qualification: string;
  experience: string;
  organization: string;
  designation: string;
  examDate: string;
  idProofType: string;
  idProofNumber: string;
  declarationChecked: boolean;
  experienceChecked: boolean;
}

const initialFormData: ExamFormData = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  qualification: "",
  experience: "",
  organization: "",
  designation: "",
  examDate: "",
  idProofType: "",
  idProofNumber: "",
  declarationChecked: false,
  experienceChecked: false,
};

const APExam = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ExamFormData>(initialFormData);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const hydrateFormAndCheckExisting = async () => {
      let resolvedEmail = "";
      const currentUser = getCurrentUser();
      if (currentUser) {
        resolvedEmail = currentUser.email ?? "";
        setFormData((prev) => ({
          ...prev,
          firstName: currentUser.firstName ?? prev.firstName,
          lastName: currentUser.lastName ?? prev.lastName,
          email: currentUser.email ?? prev.email,
          mobile: currentUser.mobile ?? prev.mobile,
          addressLine1: currentUser.addressLine1 ?? prev.addressLine1,
          addressLine2: currentUser.addressLine2 ?? prev.addressLine2,
          city: currentUser.city ?? prev.city,
          state: currentUser.state ?? prev.state,
          pincode: currentUser.pincode ?? prev.pincode,
          organization: currentUser.organizationName ?? prev.organization,
          designation: currentUser.designation ?? prev.designation,
          experience: currentUser.yearsOfExperience ?? prev.experience,
        }));
      }

      try {
        const profile = await fetchMyProfile();
        resolvedEmail = profile.email ?? resolvedEmail;
        setFormData((prev) => ({
          ...prev,
          firstName: profile.firstName ?? prev.firstName,
          lastName: profile.lastName ?? prev.lastName,
          email: profile.email ?? prev.email,
          mobile: profile.mobile ?? prev.mobile,
          addressLine1: profile.addressLine1 ?? prev.addressLine1,
          addressLine2: profile.addressLine2 ?? prev.addressLine2,
          city: profile.city ?? prev.city,
          state: profile.state ?? prev.state,
          pincode: profile.pincode ?? prev.pincode,
          organization: profile.organizationName ?? prev.organization,
          designation: profile.designation ?? prev.designation,
          experience: profile.yearsOfExperience ?? prev.experience,
        }));
      } catch {
        // Keep local values if profile fetch fails.
      }

      if (!resolvedEmail) {
        return;
      }

      try {
        const existingRegistration = await getApExamRegistrationByEmail(resolvedEmail);
        setRegistrationId(existingRegistration.registrationId);
        setFormData((prev) => ({
          ...prev,
          firstName: existingRegistration.personalInformation?.firstName ?? prev.firstName,
          lastName: existingRegistration.personalInformation?.lastName ?? prev.lastName,
          email: existingRegistration.personalInformation?.email ?? prev.email,
          mobile: existingRegistration.personalInformation?.mobileNumber ?? prev.mobile,
          addressLine1: existingRegistration.addressDetails?.addressLine1 ?? prev.addressLine1,
          addressLine2: existingRegistration.addressDetails?.addressLine2 ?? prev.addressLine2,
          city: existingRegistration.addressDetails?.city ?? prev.city,
          state: existingRegistration.addressDetails?.state ?? prev.state,
          pincode: existingRegistration.addressDetails?.pincode ?? prev.pincode,
          qualification:
            existingRegistration.educationalDetails?.highestQualification ?? prev.qualification,
          experience:
            existingRegistration.educationalDetails?.yearsOfExperience?.toString() ??
            prev.experience,
          organization: existingRegistration.organizationDetails?.organizationName ?? prev.organization,
          designation: existingRegistration.organizationDetails?.designation ?? prev.designation,
          examDate: existingRegistration.examSlotSelection?.examDate ?? prev.examDate,
        }));
        setCurrentStep(2);
      } catch {
        // If not found, continue new registration flow.
      }
    };

    void hydrateFormAndCheckExisting();
  }, []);

  const updateFormData = useCallback((updates: Partial<ExamFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const submitRegistration = useCallback(async () => {
    const payload = {
      personalInformation: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobile.trim(),
      },
      addressDetails: {
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      },
      educationalDetails: {
        highestQualification: formData.qualification.trim(),
        yearsOfExperience: Number(formData.experience),
      },
      organizationDetails:
        formData.organization.trim() || formData.designation.trim()
          ? {
              organizationName: formData.organization.trim() || undefined,
              designation: formData.designation.trim() || undefined,
            }
          : undefined,
      examSlotSelection: {
        examDate: formData.examDate,
      },
    };
    const response = registrationId
      ? await updateApExamRegistration(registrationId, payload)
      : await registerApExam(payload);

    setRegistrationId(response.registrationId);
    setSubmitError(null);
    goToStep(2);
  }, [formData, goToStep, registrationId]);

  return (
    <DashboardLayout>
      {/* Compact Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean/10">
          <GraduationCap className="h-4.5 w-4.5 text-ocean" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">IGBC AP Exam Registration</h1>
          <p className="text-[12px] text-muted-foreground">Complete the steps below to register</p>
        </div>
      </motion.div>

      <ExamStepProgress currentStep={currentStep} onStepClick={goToStep} />

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ExamStep1Registration
                formData={formData}
                updateFormData={updateFormData}
                onNext={submitRegistration}
                submitError={submitError}
                setSubmitError={setSubmitError}
              />
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ExamStep2Review
                formData={formData}
                onEdit={() => goToStep(1)}
                onNext={() => goToStep(3)}
              />
            </motion.div>
          )}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ExamStep3Payment
                formData={formData}
                onBack={() => goToStep(2)}
                registrationId={registrationId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default APExam;
