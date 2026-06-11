import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { changePassword, getCurrentUser } from "@/lib/auth";

export default function ChangePassword() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectAfter = () => {
    if (user?.userType === "a") navigate("/admin");
    else if (user?.userType === "s") navigate("/staff");
    else if (user?.userType === "T") navigate("/tpa");
    else navigate("/home");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.newPass });
      redirectAfter();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-white px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Change Password</h1>
            <p className="text-xs text-muted-foreground">Update your account password.</p>
          </div>
        </div>
        {(["current", "newPass", "confirm"] as const).map((field) => (
          <div key={field} className="mb-3">
            <label className="text-xs text-muted-foreground">
              {field === "current" ? "Current Password" : field === "newPass" ? "New Password" : "Confirm Password"}
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
          </div>
        ))}
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
