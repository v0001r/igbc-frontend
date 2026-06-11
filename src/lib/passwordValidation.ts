export type PasswordCheck = {
  label: string;
  valid: boolean;
};

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    { label: "One special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordChecks(password).every((check) => check.valid);
}

export function passwordStrengthScore(password: string): number {
  return getPasswordChecks(password).filter((check) => check.valid).length;
}

export type ForgotPasswordPortal = "client" | "admin" | "staff" | "tpa";

export const portalLoginPaths: Record<ForgotPasswordPortal, string> = {
  client: "/login",
  admin: "/admin/login",
  staff: "/staff/login",
  tpa: "/tpa/login",
};

export const portalForgotPaths: Record<ForgotPasswordPortal, string> = {
  client: "/forgot-password?from=client",
  admin: "/forgot-password?from=admin",
  staff: "/forgot-password?from=staff",
  tpa: "/forgot-password?from=tpa",
};

export function parseForgotPortal(value: string | null): ForgotPasswordPortal {
  if (value === "admin" || value === "staff" || value === "tpa") return value;
  return "client";
}
