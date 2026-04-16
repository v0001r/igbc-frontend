import { Bell, Search, User, ChevronDown, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";

interface AdminHeaderProps {
  title: string;
  onNavigate?: (key: string) => void;
}

const AdminHeader = ({ title, onNavigate }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const [notifications] = useState(5);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="h-12 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-5 sticky top-0 z-40"
      style={{ boxShadow: "0 1px 2px hsl(0 0% 0% / 0.03)" }}
    >
      <h1 className="text-[13px] font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-2.5">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="filter-input pl-8 pr-3 py-1 w-44 text-[11px] rounded-full"
          />
        </div>

        <button className="relative p-1.5 rounded-full transition-colors hover:bg-muted">
          <Bell className="w-4 h-4 text-muted-foreground" />
          {notifications > 0 && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 pl-2.5 border-l border-border hover:bg-muted rounded-lg py-1 px-1.5 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[11px] font-medium text-foreground hidden sm:block">Admin</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
              {[
                { label: "Profile", key: "profile" },
                { label: "Change Password", key: "change-password" },
                { label: "Settings", key: "settings" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => { onNavigate?.(item.key); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="my-1 border-t border-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-destructive hover:bg-muted transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
