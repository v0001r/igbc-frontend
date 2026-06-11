import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, Lock, Mail } from "lucide-react";
import { login, persistAuth } from "@/lib/auth";
import { portalForgotPaths } from "@/lib/passwordValidation";

type Portal = "member" | "admin" | "staff" | "tpa";

const portalConfig: Record<
  Portal,
  { title: string; subtitle: string; redirect: string; allowedTypes: Array<"m" | "a" | "s" | "T"> }
> = {
  member: {
    title: "Member Login",
    subtitle: "Access your IGBC member portal",
    redirect: "/home",
    allowedTypes: ["m"],
  },
  admin: {
    title: "Admin Login",
    subtitle: "IGBC administration panel",
    redirect: "/admin",
    allowedTypes: ["a"],
  },
  staff: {
    title: "IGBC Staff Login",
    subtitle: "Staff certification workspace",
    redirect: "/staff",
    allowedTypes: ["s"],
  },
  tpa: {
    title: "TPA Login",
    subtitle: "Third party assessor portal",
    redirect: "/tpa",
    allowedTypes: ["T"],
  },
};

type Props = {
  portal: Portal;
};

export default function RoleLogin({ portal }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const resetSuccess = (location.state as { resetSuccess?: string } | null)?.resetSuccess;
  const config = portalConfig[portal];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await login({ email, password });
      const userType = response.user.userType;
      if (!userType || !config.allowedTypes.includes(userType)) {
        setError("This account cannot access this portal.");
        return;
      }
      persistAuth(response);
      navigate(config.redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-2xl border bg-white/80 p-8 shadow-xl backdrop-blur-md"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{config.title}</h1>
            <p className="text-xs text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                className="w-full rounded-lg border bg-white/90 py-2.5 pl-10 pr-3 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Password</label>
              <Link
                to={portalForgotPaths[portal === "member" ? "client" : portal]}
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border bg-white/90 py-2.5 pl-10 pr-10 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {resetSuccess ? (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
              {resetSuccess}
            </p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {portal === "member" ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            No account? <Link to="/register" className="text-primary">Register</Link>
          </p>
        ) : null}
      </motion.div>
    </div>
  );
}
