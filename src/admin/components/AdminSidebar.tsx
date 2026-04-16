import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CalendarDays,
  Building2,
  BadgeCheck,
  UserCog,
  Ticket,
  FolderPlus,
  ShieldCheck,
  Settings2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";

interface SubItem {
  label: string;
  key: string;
}

interface MenuItem {
  icon: any;
  label: string;
  key: string;
}

type MenuSection = {
  key: string;
  label: string;
  children: MenuItem[];
};

const dashboardItem: MenuItem = {
  icon: LayoutDashboard,
  label: "Dashboard",
  key: "dashboard",
};

const sections: MenuSection[] = [
  {
    key: "membership-offers",
    label: "Membership & Offers",
    children: [
      { icon: BadgeCheck, label: "Memberships", key: "memberships" },
      { icon: Ticket, label: "Coupons", key: "coupons" },
    ],
  },
  {
    key: "ap-module",
    label: "AP Module",
    children: [
      { icon: GraduationCap, label: "AP Exams", key: "ap-exams" },
      { icon: UserCog, label: "AP Associate", key: "ap-associate" },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    children: [
      { icon: FolderPlus, label: "Project Registration", key: "project-registration" },
      { icon: ShieldCheck, label: "Project Certification", key: "project-certification" },
    ],
  },
  {
    key: "users-events",
    label: "Users & Events",
    children: [
      { icon: Users, label: "Users", key: "users" },
      { icon: CalendarDays, label: "Events", key: "events" },
      { icon: Building2, label: "IGBC Staff", key: "igbc-staff" },
      { icon: Ticket, label: "Event Registrations", key: "event-registrations" },
    ],
  },
  {
    key: "settings-utility",
    label: "Settings / Utility",
    children: [{ icon: Settings2, label: "Support/Assistance", key: "support-assistance" }],
  },
];

interface AdminSidebarProps {
  activeItem: string;
  onNavigate: (key: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ activeItem, onNavigate, collapsed, onToggle }: AdminSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "membership-offers": true,
    "ap-module": true,
    projects: true,
    "users-events": true,
    "settings-utility": true,
  });

  useEffect(() => {
    const matchedSection = sections.find((section) =>
      section.children.some((child) => child.key === activeItem),
    );
    if (matchedSection) {
      setExpandedSections((prev) => ({ ...prev, [matchedSection.key]: true }));
    }
  }, [activeItem]);

  const isSectionActive = (section: MenuSection) =>
    section.children.some((child) => child.key === activeItem);

  const toggleSection = (key: string) => {
    if (collapsed) {
      onToggle();
    }
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className="fixed left-4 top-4 bottom-4 z-50 flex flex-col overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        width: collapsed ? 64 : 252,
        background:
          "linear-gradient(175deg, rgba(255,255,255,0.95) 0%, rgba(246,251,249,0.9) 100%)",
        border: "1px solid #E2E8F0",
        boxShadow:
          "12px 12px 26px rgba(15,23,42,0.08), -8px -8px 20px rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="mx-3 mt-3 flex items-center gap-3 rounded-2xl px-3 py-3 shrink-0"
        style={{
          background: "rgba(255, 255, 255, 0.62)",
          boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.9), 0 8px 18px rgba(31,122,99,0.08)",
          border: "1px solid rgba(226,232,240,0.7)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #E6F4F1 0%, #F1F7F5 100%)" }}
        >
          <Leaf className="w-4.5 h-4.5" style={{ color: "#1F7A63" }} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-[27px] font-semibold tracking-tight" style={{ color: "#1E293B" }}>
              IGBC Admin
            </p>
            <p className="text-xs font-medium" style={{ color: "#64748B" }}>
              Green Building Portal
            </p>
          </div>
        )}
      </div>

      <div className="mx-4 mt-4 h-px shrink-0 bg-border/70" />

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
        <button
          onClick={() => onNavigate(dashboardItem.key)}
          title={collapsed ? dashboardItem.label : undefined}
          className="group relative mx-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-300"
          style={{
            background: activeItem === dashboardItem.key ? "#E6F4F1" : "transparent",
            color: activeItem === dashboardItem.key ? "#1F7A63" : "#64748B",
            boxShadow:
              activeItem === dashboardItem.key
                ? "inset 1px 1px 0 rgba(255,255,255,0.8), 0 10px 20px rgba(31,122,99,0.12)"
                : "2px 2px 8px rgba(15,23,42,0.04), -1px -1px 6px rgba(255,255,255,0.8)",
            transform: collapsed ? undefined : "translateY(0px)",
          }}
          onMouseEnter={(e) => {
            if (activeItem !== dashboardItem.key) {
              e.currentTarget.style.background = "#F1F7F5";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeItem !== dashboardItem.key) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0px)";
            }
          }}
        >
          {!collapsed && activeItem === dashboardItem.key && (
            <span
              className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
              style={{ background: "linear-gradient(180deg, #1F7A63 0%, #2FA58D 100%)" }}
            />
          )}
          <dashboardItem.icon
            className="shrink-0 transition-transform duration-300 group-hover:scale-105"
            style={{ width: 18, height: 18 }}
          />
          {!collapsed && <span className="truncate font-medium">{dashboardItem.label}</span>}
        </button>

        {sections.map((section) => {
          const expanded = expandedSections[section.key];
          const active = isSectionActive(section);

          return (
            <div key={section.key} className="mx-1">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.key)}
                  className="mb-1 flex w-full items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors"
                  style={{ color: active ? "#1F7A63" : "#64748B" }}
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-300"
                    style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
              )}

              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{ maxHeight: collapsed ? 0 : expanded ? section.children.length * 46 : 0 }}
              >
                <div className="space-y-1 pl-1">
                  {section.children.map((item) => {
                    const Icon = item.icon;
                    const itemActive = activeItem === item.key;

                    return (
                      <button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        className="group relative flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-300"
                        style={{
                          background: itemActive ? "#E6F4F1" : "transparent",
                          color: itemActive ? "#1F7A63" : "#64748B",
                          boxShadow: itemActive
                            ? "inset 1px 1px 0 rgba(255,255,255,0.82), 0 10px 20px rgba(31,122,99,0.1)"
                            : "1px 1px 6px rgba(15,23,42,0.04), -1px -1px 5px rgba(255,255,255,0.72)",
                          transform: "translateY(0px)",
                        }}
                        onMouseEnter={(e) => {
                          if (!itemActive) {
                            e.currentTarget.style.background = "#F1F7F5";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.color = "#1F7A63";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!itemActive) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.transform = "translateY(0px)";
                            e.currentTarget.style.color = "#64748B";
                          }
                        }}
                      >
                        {itemActive && (
                          <span
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                            style={{ background: "linear-gradient(180deg, #1F7A63 0%, #2FA58D 100%)" }}
                          />
                        )}
                        <Icon className="h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:scale-105" />
                        <span className="truncate text-[13px] font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div
          className="mx-3 mb-3 rounded-2xl p-3"
          style={{
            background: "rgba(255,255,255,0.58)",
            border: "1px solid rgba(226,232,240,0.78)",
            boxShadow: "0 10px 20px rgba(47,165,141,0.12), inset 1px 1px 0 rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "#1F7A63" }}>
            🌿 Sustainability Insights
          </p>
          <p className="mt-1 text-xs" style={{ color: "#64748B" }}>
            120+ Projects Certified
          </p>
        </div>
      )}

      <button
        onClick={onToggle}
        className="mx-3 mb-3 flex items-center justify-center rounded-xl shrink-0 transition-all duration-200"
        style={{
          height: 40,
          border: "1px solid #E2E8F0",
          color: "#64748B",
          background: "rgba(255,255,255,0.68)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#F1F7F5";
          e.currentTarget.style.color = "#1F7A63";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.68)";
          e.currentTarget.style.color = "#64748B";
        }}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default AdminSidebar;
