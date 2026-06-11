import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf, Mail } from "lucide-react";
import { forgotPassword } from "@/lib/auth";
import {
  parseForgotPortal,
  portalLoginPaths,
  type ForgotPasswordPortal,
} from "@/lib/passwordValidation";

const portalTitles: Record<ForgotPasswordPortal, string> = {
  client: "Reset your password",
  admin: "Admin password reset",
  staff: "Staff password reset",
  tpa: "TPA password reset",
};

const portalSubtitles: Record<ForgotPasswordPortal, string> = {
  client: "Enter your email and we'll send reset instructions.",
  admin: "Enter your admin email to receive a reset link.",
  staff: "Enter your staff email to receive a reset link.",
  tpa: "Enter your TPA email to receive a reset link.",
};

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const portal = parseForgotPortal(searchParams.get("from"));
  const loginPath = portalLoginPaths[portal];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isPortalLayout = portal !== "client";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await forgotPassword(email.trim());
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      <Link
        to={loginPath}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to login
      </Link>

      <h2 className="text-2xl font-bold text-foreground">{portalTitles[portal]}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{portalSubtitles[portal]}</p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground"
        >
          {success}
        </motion.div>
      )}

      {!success && (
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}

      {success && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to={loginPath} className="font-semibold text-primary hover:underline">
            Return to login
          </Link>
        </p>
      )}
    </>
  );

  if (isPortalLayout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-white px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel w-full max-w-md rounded-2xl border bg-white/80 p-8 shadow-xl backdrop-blur-md"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground">IGBC</span>
          </div>
          {formContent}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">IGBC</span>
        </div>
        {formContent}
      </motion.div>
    </div>
  );
}
