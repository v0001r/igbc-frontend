export const ACTIVITY_TYPE_GROUPS = [
  {
    label: "Authentication",
    options: [{ value: "CLIENT_LOGIN", label: "Login" }],
  },
  {
    label: "Project registration",
    options: [
      { value: "PROJECT_CREATED", label: "Project created" },
      { value: "PROJECT_UPDATED", label: "Project updated" },
      { value: "PROJECT_REGISTRATION_SUBMITTED", label: "Registration submitted" },
      { value: "PROJECT_APPROVED", label: "Project approved" },
      { value: "PROJECT_REJECTED", label: "Project rejected" },
    ],
  },
  {
    label: "Certification",
    options: [
      { value: "CERT_APP_CREATED", label: "Application created" },
      { value: "CERT_APP_UPDATED", label: "Application updated" },
      { value: "CERT_APP_SUBMITTED", label: "Application submitted" },
      { value: "CERT_APP_APPROVED", label: "Application approved" },
      { value: "CERT_APP_REJECTED", label: "Application rejected" },
      { value: "FINAL_SUBMITTED", label: "Final submit" },
      { value: "FORM_DATA_SAVED", label: "Form saved" },
      { value: "DOCUMENT_UPLOADED", label: "Document uploaded" },
      { value: "DOCUMENT_REPLACED", label: "Document replaced" },
    ],
  },
  {
    label: "Workflow",
    options: [
      { value: "STAFF_ASSIGNED", label: "Staff assigned" },
      { value: "STAFF_REASSIGNED", label: "Staff reassigned" },
      { value: "TPA_ASSIGNED", label: "TPA assigned" },
      { value: "TPA_REASSIGNED", label: "TPA reassigned" },
    ],
  },
  {
    label: "Admin / users",
    options: [
      { value: "USER_CREATED", label: "User created" },
      { value: "USER_UPDATED", label: "User updated" },
      { value: "USER_ACTIVATED", label: "User activated" },
      { value: "USER_DEACTIVATED", label: "User deactivated" },
      { value: "PASSWORD_RESET", label: "Password reset" },
    ],
  },
] as const;

export const USER_ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "m", label: "Client" },
  { value: "a", label: "Admin" },
  { value: "s", label: "Staff" },
  { value: "T", label: "TPA" },
] as const;

export const MODULE_OPTIONS = [
  { value: "", label: "All modules" },
  { value: "registration", label: "Registration" },
  { value: "certification_application", label: "Certification application" },
  { value: "certification", label: "Certification workspace" },
  { value: "workflow", label: "Workflow" },
  { value: "admin", label: "Admin" },
  { value: "auth", label: "Authentication" },
] as const;

export function activityIconColor(type: string): string {
  if (type.includes("LOGIN")) return "#3B82F6";
  if (type.includes("FORM") || type.includes("DOCUMENT")) return "#1F7A63";
  if (type.includes("APPROVED") || type.includes("ASSIGNED")) return "#16A34A";
  if (type.includes("REJECTED") || type.includes("DEACTIVATED")) return "#DC2626";
  if (type.includes("USER") || type.includes("PASSWORD")) return "#7C3AED";
  if (type.includes("SUBMIT")) return "#D97706";
  return "#64748B";
}
