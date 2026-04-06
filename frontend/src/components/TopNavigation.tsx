import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Mail, Menu, X, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, logout } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", path: "/home" },
  { label: "Profile", path: "/profile" },
  { label: "Exams", path: "/exams" },
  { label: "Projects", path: "/projects" },
  { label: "Directory", path: "/directory" },
  { label: "Nest+", path: "/nest-plus" },
];

export const TopNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const displayName =
    currentUser?.displayName?.trim() ||
    `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() ||
    "Member";
  const initial = displayName.charAt(0).toUpperCase() || "M";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-[10px] font-bold text-primary-foreground">IGBC</span>
            </div>
            <span className="hidden text-sm font-semibold text-foreground sm:block">
              IGBC Portal
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-1.5 text-[13px] font-medium transition-colors rounded-md ${
                    active
                      ? "text-primary bg-primary-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Mail className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Bell className="h-4 w-4" strokeWidth={1.5} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>

            {/* User Menu */}
            <div className="relative ml-1">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-muted"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {initial}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-[13px] font-medium leading-none text-foreground">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground">{currentUser?.userType === "a" ? "Admin" : currentUser?.userType === "s" ? "Staff" : currentUser?.userType === "T" ? "TPA" : "Client"}</p>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" strokeWidth={1.5} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 mt-1 w-44 rounded-lg border border-border bg-card p-1 shadow-card-hover"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-foreground hover:bg-muted"
                    >
                      <User className="h-3.5 w-3.5" strokeWidth={1.5} /> Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-foreground hover:bg-muted"
                    >
                      <Settings className="h-3.5 w-3.5" strokeWidth={1.5} /> Settings
                    </Link>
                    <div className="my-0.5 border-t" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-destructive hover:bg-destructive/5"
                    >
                      <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile toggle */}
            <button
              className="rounded-md p-2 text-muted-foreground md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t md:hidden"
          >
            <nav className="flex flex-col gap-0.5 p-3">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                      active
                        ? "bg-primary-muted text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="mt-2 flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/5"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sign out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
