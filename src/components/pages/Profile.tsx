import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalDetails } from "@/components/profile/PersonalDetails";
import { OrganizationDetails } from "@/components/profile/OrganizationDetails";
import { AddressDetails } from "@/components/profile/AddressDetails";
import { PreferencesSection } from "@/components/profile/PreferencesSection";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { motion } from "framer-motion";
import { fetchMyProfile, getCurrentUser, updateMyProfile } from "@/lib/auth";

const tabs = [
  { id: "personal", label: "Personal Details" },
  { id: "organization", label: "Organization Details" },
];

const requiredFields = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "mobile", label: "Mobile No." },
  { key: "country", label: "Country" },
  { key: "state", label: "State / UT" },
  { key: "city", label: "City" },
  { key: "pincode", label: "PIN Code" },
  { key: "addressLine1", label: "Address Line 1" },
] as const;
type RequiredFieldKey = (typeof requiredFields)[number]["key"];
const requiredFieldMessages: Record<RequiredFieldKey, string> = Object.fromEntries(
  requiredFields.map(({ key, label }) => [key, `${label} is required`]),
) as Record<RequiredFieldKey, string>;
const requiredFieldKeys = new Set(requiredFields.map(({ key }) => key));

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RequiredFieldKey, string>>>({});
  const [form, setForm] = useState({
    salutation: "",
    firstName: "",
    middleName: "",
    lastName: "",
    displayName: "",
    email: "",
    mobile: "",
    telephone: "",
    state: "",
    country: "India",
    city: "",
    pincode: "",
    addressLine1: "",
    addressLine2: "",
    organizationName: "",
    designation: "",
    department: "",
    yearsOfExperience: "",
    employeeId: "",
    organizationType: "",
    prefEmailNotifications: true,
    prefSmsAlerts: true,
    prefNewsletter: true,
    preferredLanguage: "English",
    prefShowProfilePublicly: true,
    prefShowEmailToMembers: true,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setForm({
        salutation: user.salutation ?? "",
        firstName: user.firstName ?? "",
        middleName: user.middleName ?? "",
        lastName: user.lastName ?? "",
        displayName: user.displayName ?? "",
        email: user.email ?? "",
        mobile: user.mobile ?? "",
        telephone: user.telephone ?? "",
        state: user.state ?? "",
        country: user.country ?? "India",
        city: user.city ?? "",
        pincode: user.pincode ?? "",
        addressLine1: user.addressLine1 ?? "",
        addressLine2: user.addressLine2 ?? "",
        organizationName: user.organizationName ?? "",
        designation: user.designation ?? "",
        department: user.department ?? "",
        yearsOfExperience: user.yearsOfExperience ?? "",
        employeeId: user.employeeId ?? "",
        organizationType: user.organizationType ?? "",
        prefEmailNotifications: user.prefEmailNotifications ?? true,
        prefSmsAlerts: user.prefSmsAlerts ?? true,
        prefNewsletter: user.prefNewsletter ?? true,
        preferredLanguage: user.preferredLanguage ?? "English",
        prefShowProfilePublicly: user.prefShowProfilePublicly ?? true,
        prefShowEmailToMembers: user.prefShowEmailToMembers ?? true,
      });
    }

    const loadProfile = async () => {
      try {
        const profile = await fetchMyProfile();
        setForm({
          salutation: profile.salutation ?? "",
          firstName: profile.firstName ?? "",
          middleName: profile.middleName ?? "",
          lastName: profile.lastName ?? "",
          displayName: profile.displayName ?? "",
          email: profile.email ?? "",
          mobile: profile.mobile ?? "",
          telephone: profile.telephone ?? "",
          state: profile.state ?? "",
          country: profile.country ?? "India",
          city: profile.city ?? "",
          pincode: profile.pincode ?? "",
          addressLine1: profile.addressLine1 ?? "",
          addressLine2: profile.addressLine2 ?? "",
          organizationName: profile.organizationName ?? "",
          designation: profile.designation ?? "",
          department: profile.department ?? "",
          yearsOfExperience: profile.yearsOfExperience ?? "",
          employeeId: profile.employeeId ?? "",
          organizationType: profile.organizationType ?? "",
          prefEmailNotifications: profile.prefEmailNotifications ?? true,
          prefSmsAlerts: profile.prefSmsAlerts ?? true,
          prefNewsletter: profile.prefNewsletter ?? true,
          preferredLanguage: profile.preferredLanguage ?? "English",
          prefShowProfilePublicly: profile.prefShowProfilePublicly ?? true,
          prefShowEmailToMembers: profile.prefShowEmailToMembers ?? true,
        });
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (requiredFieldKeys.has(field)) {
      setFieldErrors((prev) => {
        const key = field as RequiredFieldKey;
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (status) setStatus("");
  };

  const updateToggleField = (field: string, value: boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status) setStatus("");
  };

  const focusField = (field: RequiredFieldKey) => {
    const element = document.querySelector<HTMLElement>(`[data-field-key="${field}"]`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.focus();
  };

  const handleSave = async () => {
    const missingFields = requiredFields.filter(({ key }) => !form[key].trim());
    if (missingFields.length > 0) {
      setFieldErrors(
        Object.fromEntries(
          missingFields.map(({ key }) => [key, requiredFieldMessages[key]]),
        ) as Partial<Record<RequiredFieldKey, string>>,
      );
      setStatus(
        `Please fill all required fields: ${missingFields.map(({ label }) => label).join(", ")}`,
      );
      focusField(missingFields[0].key);
      return;
    }

    setFieldErrors({});
    setSaving(true);
    setStatus("");
    try {
      await updateMyProfile({
        salutation: form.salutation,
        firstName: form.firstName,
        middleName: form.middleName || undefined,
        lastName: form.lastName,
        displayName: form.displayName,
        state: form.state,
        country: form.country,
        mobile: form.mobile || undefined,
        telephone: form.telephone || undefined,
        city: form.city || undefined,
        pincode: form.pincode || undefined,
        addressLine1: form.addressLine1 || undefined,
        addressLine2: form.addressLine2 || undefined,
        organizationName: form.organizationName || undefined,
        designation: form.designation || undefined,
        department: form.department || undefined,
        yearsOfExperience: form.yearsOfExperience || undefined,
        employeeId: form.employeeId || undefined,
        organizationType: form.organizationType || undefined,
        prefEmailNotifications: form.prefEmailNotifications,
        prefSmsAlerts: form.prefSmsAlerts,
        prefNewsletter: form.prefNewsletter,
        preferredLanguage: form.preferredLanguage,
        prefShowProfilePublicly: form.prefShowProfilePublicly,
        prefShowEmailToMembers: form.prefShowEmailToMembers,
      });
      setStatus("Profile updated successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <ProfileHeader />

      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "personal" && (
              <div className="space-y-6">
                <PersonalDetails
                  values={{
                    salutation: form.salutation,
                    firstName: form.firstName,
                    middleName: form.middleName,
                    lastName: form.lastName,
                    displayName: form.displayName,
                    email: form.email,
                    mobile: form.mobile,
                    telephone: form.telephone,
                  }}
                  onChange={updateField}
                  errors={fieldErrors}
                />
                <AddressDetails
                  values={{
                    country: form.country,
                    state: form.state,
                    city: form.city,
                    pincode: form.pincode,
                    addressLine1: form.addressLine1,
                    addressLine2: form.addressLine2,
                  }}
                  onChange={updateField}
                  errors={fieldErrors}
                />
                <PreferencesSection
                  values={{
                    prefEmailNotifications: form.prefEmailNotifications,
                    prefSmsAlerts: form.prefSmsAlerts,
                    prefNewsletter: form.prefNewsletter,
                    preferredLanguage: form.preferredLanguage,
                    prefShowProfilePublicly: form.prefShowProfilePublicly,
                    prefShowEmailToMembers: form.prefShowEmailToMembers,
                  }}
                  onToggle={updateToggleField}
                  onLanguageChange={(value) => updateField("preferredLanguage", value)}
                />
              </div>
            )}
            {activeTab === "organization" && (
              <OrganizationDetails
                values={{
                  organizationName: form.organizationName,
                  designation: form.designation,
                  department: form.department,
                  yearsOfExperience: form.yearsOfExperience,
                  employeeId: form.employeeId,
                  organizationType: form.organizationType,
                }}
                onChange={updateField}
              />
            )}
          </motion.div>

          {/* Actions */}
          {status && (
            <p className="mt-6 text-sm text-muted-foreground">{status}</p>
          )}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                if (!loading) {
                  setStatus("");
                }
              }}
              className="rounded-xl border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ProfileSidebar />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
