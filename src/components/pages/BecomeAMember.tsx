import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { StepProgress } from "@/components/membership/StepProgress";
import { Step1Category } from "@/components/membership/Step1Category";
import { Step2Contacts } from "@/components/membership/Step2Contacts";
import { Step3Review } from "@/components/membership/Step3Review";
import { Step4Invoice } from "@/components/membership/Step4Invoice";
import { Step5Payment } from "@/components/membership/Step5Payment";
import { Leaf } from "lucide-react";

const BecomeAMember = () => {
  const [step, setStep] = useState(1);

  const [categoryData, setCategoryData] = useState({
    membershipType: "",
    category: "",
  });

  const [contactData, setContactData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    organization: "",
    designation: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

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

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1Category
            key="step1"
            data={categoryData}
            onUpdate={setCategoryData}
            onNext={() => goTo(2)}
          />
        )}
        {step === 2 && (
          <Step2Contacts
            key="step2"
            data={contactData}
            onUpdate={setContactData}
            onNext={() => goTo(3)}
            onBack={() => goTo(1)}
          />
        )}
        {step === 3 && (
          <Step3Review
            key="step3"
            categoryData={categoryData}
            contactData={contactData}
            onNext={() => goTo(4)}
            onBack={() => goTo(2)}
            onEditStep={goTo}
          />
        )}
        {step === 4 && (
          <Step4Invoice
            key="step4"
            categoryData={categoryData}
            contactData={contactData}
            onNext={() => goTo(5)}
            onBack={() => goTo(3)}
          />
        )}
        {step === 5 && (
          <Step5Payment
            key="step5"
            categoryData={categoryData}
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
