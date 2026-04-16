import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChangePasswordPage = () => {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showFields, setShowFields] = useState({ current: false, newPass: false, confirm: false });

  const toggleShow = (field: keyof typeof showFields) =>
    setShowFields((s) => ({ ...s, [field]: !s[field] }));

  const passwordStrength = (pw: string) => {
    if (pw.length < 6) return { label: "Weak", color: "hsl(var(--destructive))", pct: 25 };
    if (pw.length < 10) return { label: "Medium", color: "hsl(var(--warning))", pct: 55 };
    return { label: "Strong", color: "hsl(var(--success))", pct: 90 };
  };

  const strength = passwordStrength(form.newPass);
  const mismatch = form.confirm && form.newPass !== form.confirm;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="kpi-card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
            <p className="text-[11px] text-muted-foreground">Keep your account secure</p>
          </div>
        </div>

        {(["current", "newPass", "confirm"] as const).map((field) => (
          <div key={field}>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {field === "current" ? "Current Password" : field === "newPass" ? "New Password" : "Confirm Password"}
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type={showFields[field] ? "text" : "password"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="filter-input w-full pl-9 pr-10 py-2 text-[13px]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => toggleShow(field)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showFields[field] ? (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
            {field === "newPass" && form.newPass && (
              <div className="mt-2 space-y-1">
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${strength.pct}%`, background: strength.color }}
                  />
                </div>
                <p className="text-[10px] font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}
            {field === "confirm" && mismatch && (
              <p className="text-[11px] text-destructive mt-1">Passwords do not match</p>
            )}
          </div>
        ))}

        <Button size="sm" className="w-full gap-1.5 text-xs" disabled={!form.current || !form.newPass || mismatch}>
          <Lock className="w-3.5 h-3.5" /> Update Password
        </Button>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
