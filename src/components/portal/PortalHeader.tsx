import { Bell, ChevronDown, LogOut, Search, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";

type Props = {
  title: string;
  userLabel: string;
  loginPath: string;
};

const PortalHeader = ({ title, userLabel, loginPath }: Props) => {
  const navigate = useNavigate();
  const [notifications] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate(loginPath, { replace: true });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="glass-header sticky top-0 z-40 flex h-12 items-center justify-between px-5">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-2.5">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="filter-input w-44 rounded-full py-1 pl-8 pr-3 text-[11px]"
          />
        </div>

        <button
          type="button"
          className="relative rounded-full p-1.5 transition-colors hover:bg-muted"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {notifications > 0 && (
            <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
              {notifications}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 rounded-lg border-l border-border py-1 pl-2.5 pr-1.5 transition-colors hover:bg-muted"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <User className="h-3 w-3 text-primary" />
            </div>
            <span className="hidden text-[11px] font-medium text-foreground sm:block">
              {userLabel}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {showUserMenu && (
            <div className="glass-panel absolute right-0 top-full z-50 mt-1 w-40 py-1">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-destructive transition-colors hover:bg-muted"
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

export default PortalHeader;
