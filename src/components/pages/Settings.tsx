import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, Bell, Globe, CheckCircle2, AlertCircle } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("password");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "password", label: "Change Password", icon: Lock },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "language", label: "Language & Region", icon: Globe },
  ];

  const passwordStrength = () => {
    if (!newPassword) return { label: "", color: "", width: "0%" };
    if (newPassword.length < 6) return { label: "Weak", color: "bg-destructive", width: "25%" };
    if (newPassword.length < 10) return { label: "Fair", color: "bg-peach", width: "50%" };
    if (/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])/.test(newPassword))
      return { label: "Strong", color: "bg-primary", width: "100%" };
    return { label: "Good", color: "bg-sage", width: "75%" };
  };

  const strength = passwordStrength();
  const passwordsMatch = confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account security and preferences</p>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="flex flex-row gap-1 overflow-x-auto rounded-xl bg-card p-2 shadow-card lg:flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-muted text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === "password" && (
              <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted">
                    <Lock className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
                    <p className="text-xs text-muted-foreground">Update your password to keep your account secure</p>
                  </div>
                </div>

                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center gap-2 rounded-xl bg-primary-muted px-4 py-3 text-sm font-medium text-primary"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Password updated successfully!
                  </motion.div>
                )}

                <div className="space-y-5">
                  {/* Current Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Current Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="h-12 w-full rounded-lg bg-background px-4 pr-12 text-sm text-foreground ring-1 ring-input transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      New Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="h-12 w-full rounded-lg bg-background px-4 pr-12 text-sm text-foreground ring-1 ring-input transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-1 space-y-1.5">
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: strength.width }}
                            className={`h-full rounded-full ${strength.color}`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength: <span className="font-medium text-foreground">{strength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Confirm New Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className={`h-12 w-full rounded-lg bg-background px-4 pr-12 text-sm text-foreground ring-1 transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                          passwordsMismatch ? "ring-destructive focus:ring-destructive" : "ring-input focus:ring-primary"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordsMatch && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                    {passwordsMismatch && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" /> Passwords do not match
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <p className="mb-2 text-xs font-semibold text-foreground">Password Requirements:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {[
                        { text: "At least 8 characters", met: newPassword.length >= 8 },
                        { text: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
                        { text: "One number", met: /[0-9]/.test(newPassword) },
                        { text: "One special character (!@#$%)", met: /[!@#$%^&*]/.test(newPassword) },
                      ].map((req) => (
                        <li key={req.text} className={`flex items-center gap-2 ${req.met ? "text-primary" : ""}`}>
                          <CheckCircle2 className={`h-3 w-3 ${req.met ? "text-primary" : "text-muted-foreground/40"}`} />
                          {req.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                  <button className="rounded-xl border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!currentPassword || !passwordsMatch || saving}
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                <h2 className="mb-6 text-lg font-semibold text-foreground">Security Settings</h2>
                <div className="space-y-4">
                  {[
                    { title: "Two-Factor Authentication", desc: "Add an extra layer of security", enabled: false },
                    { title: "Login Alerts", desc: "Get notified of new sign-ins", enabled: true },
                    { title: "Session Management", desc: "View and manage active sessions", enabled: true },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between rounded-xl bg-background p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <ToggleSwitch defaultChecked={item.enabled} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                <h2 className="mb-6 text-lg font-semibold text-foreground">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { title: "Email Notifications", desc: "Receive updates via email", enabled: true },
                    { title: "SMS Notifications", desc: "Get text message alerts", enabled: false },
                    { title: "Exam Reminders", desc: "Reminders before exam dates", enabled: true },
                    { title: "Project Updates", desc: "Updates on your registered projects", enabled: true },
                    { title: "Membership Alerts", desc: "Renewal and membership updates", enabled: true },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between rounded-xl bg-background p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <ToggleSwitch defaultChecked={item.enabled} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "language" && (
              <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
                <h2 className="mb-6 text-lg font-semibold text-foreground">Language & Region</h2>
                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Language</label>
                    <select className="h-12 rounded-lg bg-background px-3 text-sm text-foreground ring-1 ring-input focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Tamil</option>
                      <option>Telugu</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time Zone</label>
                    <select className="h-12 rounded-lg bg-background px-3 text-sm text-foreground ring-1 ring-input focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>IST (UTC+5:30)</option>
                      <option>EST (UTC-5:00)</option>
                      <option>PST (UTC-8:00)</option>
                      <option>GMT (UTC+0:00)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date Format</label>
                    <select className="h-12 rounded-lg bg-background px-3 text-sm text-foreground ring-1 ring-input focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ToggleSwitch = ({ defaultChecked = false }: { defaultChecked?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 h-4 w-4 rounded-full bg-card shadow-sm"
      />
    </button>
  );
};

export default Settings;
