import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, ArrowRight, Check, X } from "lucide-react";
import { persistAuth, register as registerUser } from "@/lib/auth";

const salutations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Er."];
const states = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    salutation: "", firstName: "", middleName: "", lastName: "",
    displayName: "", email: "", confirmEmail: "", country: "India",
    state: "", mobile: "", telephone: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const passwordChecks = [
    { label: "At least 8 characters", valid: form.password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(form.password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(form.password) },
    { label: "One number", valid: /\d/.test(form.password) },
    { label: "One special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) },
  ];
  const passwordStrength = passwordChecks.filter((c) => c.valid).length;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.salutation) e.salutation = "Required";
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.displayName.trim()) e.displayName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (form.email !== form.confirmEmail) e.confirmEmail = "Emails do not match";
    if (!form.state) e.state = "Required";
    if (passwordStrength < 5) e.password = "Password too weak";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!agreed) e.terms = "You must accept terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await registerUser({
        salutation: form.salutation,
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim(),
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        state: form.state,
        mobile: form.mobile.trim() || undefined,
        telephone: form.telephone.trim() || undefined,
        password: form.password,
      });
      persistAuth(response);
      navigate("/home");
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err instanceof Error ? err.message : "Unable to register",
      }));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `h-11 w-full rounded-xl border bg-card px-4 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
      errors[field] ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Left Branding */}
      <div className="hidden w-[420px] flex-col justify-between bg-gradient-to-br from-primary to-primary/80 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-primary-foreground tracking-tight">IGBC</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight text-primary-foreground">
            Welcome to IGBC!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
            Register to access green building resources, IGBC certifications, AP exams, and connect with India's sustainability community.
          </p>
          <div className="mt-8 space-y-3">
            {["Access green building resources", "Register projects for certification", "Take the AP Exam", "Connect with 25,000+ members"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Check className="h-4 w-4 text-primary-foreground/60" /> {t}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/40">© 2026 IGBC. All rights reserved.</p>
      </div>

      {/* Right Form */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-background px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">IGBC</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your information to register with us.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {errors.submit && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errors.submit}
              </div>
            )}
            {/* Personal Details */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Personal Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Salutation *</label>
                  <select value={form.salutation} onChange={(e) => update("salutation", e.target.value)} className={inputCls("salutation")}>
                    <option value="">Select</option>
                    {salutations.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.salutation && <p className="mt-1 text-xs text-destructive">{errors.salutation}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">First Name *</label>
                  <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" className={inputCls("firstName")} />
                  {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Middle Name</label>
                  <input value={form.middleName} onChange={(e) => update("middleName", e.target.value)} placeholder="Robert" className={inputCls("middleName")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Last Name *</label>
                  <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe" className={inputCls("lastName")} />
                  {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Display Name *</label>
                  <input value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="John Doe" className={inputCls("displayName")} />
                  {errors.displayName && <p className="mt-1 text-xs text-destructive">{errors.displayName}</p>}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Contact Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Email ID *</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" className={inputCls("email")} />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Confirm Email *</label>
                  <input type="email" value={form.confirmEmail} onChange={(e) => update("confirmEmail", e.target.value)} placeholder="john@example.com" className={inputCls("confirmEmail")} />
                  {errors.confirmEmail && <p className="mt-1 text-xs text-destructive">{errors.confirmEmail}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Country *</label>
                  <input value={form.country} readOnly className="h-11 w-full rounded-xl border border-input bg-ghost px-4 text-sm text-muted-foreground shadow-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">State / UT *</label>
                  <select value={form.state} onChange={(e) => update("state", e.target.value)} className={inputCls("state")}>
                    <option value="">Select State</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Mobile No.</label>
                  <input value={form.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="+91-9087654321" className={inputCls("mobile")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Telephone No.</label>
                  <input value={form.telephone} onChange={(e) => update("telephone", e.target.value)} placeholder="022-12345678" className={inputCls("telephone")} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Set Password</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Create a strong password"
                      className={inputCls("password") + " pr-10"}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength
                              ? passwordStrength <= 2 ? "bg-destructive" : passwordStrength <= 3 ? "bg-warning" : "bg-primary"
                              : "bg-muted"
                          }`} />
                        ))}
                      </div>
                      <div className="mt-2 space-y-1">
                        {passwordChecks.map((c) => (
                          <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.valid ? "text-primary" : "text-muted-foreground"}`}>
                            {c.valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {c.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Confirm Password *</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                    className={inputCls("confirmPassword")}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => { setAgreed(!agreed); setErrors((p) => { const n = { ...p }; delete n.terms; return n; }); }}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  agreed ? "border-primary bg-primary" : errors.terms ? "border-destructive" : "border-input"
                }`}
              >
                {agreed && <Check className="h-3 w-3 text-primary-foreground" />}
              </button>
              <p className="text-sm text-muted-foreground">
                Yes, I have read and agree to abide by the{" "}
                <a href="#" className="font-medium text-primary hover:underline">Terms & Conditions</a> *
              </p>
            </div>
            {errors.terms && <p className="-mt-4 text-xs text-destructive">{errors.terms}</p>}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </motion.button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">Login</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
