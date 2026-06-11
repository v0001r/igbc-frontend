import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import type { PortalSidebarConfig } from "./portalTypes";

type Props = {
  config: PortalSidebarConfig;
  activeKey: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  onToggle: () => void;
};

const PortalSidebar = ({ config, activeKey, onNavigate, collapsed, onToggle }: Props) => {
  const { brandTitle, brandSubtitle, dashboardItem, sections } = config;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.key, true])),
  );

  useEffect(() => {
    const matchedSection = sections.find((section) =>
      section.children.some((child) => child.key === activeKey),
    );
    if (matchedSection) {
      setExpandedSections((prev) => ({ ...prev, [matchedSection.key]: true }));
    }
  }, [activeKey, sections]);

  const isSectionActive = (sectionKey: string) =>
    sections
      .find((s) => s.key === sectionKey)
      ?.children.some((child) => child.key === activeKey) ?? false;

  const toggleSection = (key: string) => {
    if (collapsed) onToggle();
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navButtonStyle = (active: boolean) => ({
    background: active ? "#E6F4F1" : "transparent",
    color: active ? "#1F7A63" : "#64748B",
    boxShadow: active
      ? "inset 1px 1px 0 rgba(255,255,255,0.8), 0 10px 20px rgba(31,122,99,0.12)"
      : "2px 2px 8px rgba(15,23,42,0.04), -1px -1px 6px rgba(255,255,255,0.8)",
  });

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
        className="mx-3 mt-3 flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3"
        style={{
          background: "rgba(255, 255, 255, 0.62)",
          boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.9), 0 8px 18px rgba(31,122,99,0.08)",
          border: "1px solid rgba(226,232,240,0.7)",
        }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, #E6F4F1 0%, #F1F7F5 100%)" }}
        >
          <Leaf className="h-4.5 w-4.5" style={{ color: "#1F7A63" }} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-[22px] font-semibold tracking-tight" style={{ color: "#1E293B" }}>
              {brandTitle}
            </p>
            <p className="text-xs font-medium" style={{ color: "#64748B" }}>
              {brandSubtitle}
            </p>
          </div>
        )}
      </div>

      <div className="mx-4 mt-4 h-px shrink-0 bg-border/70" />

      <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-3" style={{ scrollbarWidth: "thin" }}>
        <button
          type="button"
          onClick={() => onNavigate(dashboardItem.path)}
          title={collapsed ? dashboardItem.label : undefined}
          className="group relative mx-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-300"
          style={navButtonStyle(activeKey === dashboardItem.key)}
        >
          {!collapsed && activeKey === dashboardItem.key && (
            <span
              className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full"
              style={{ background: "linear-gradient(180deg, #1F7A63 0%, #2FA58D 100%)" }}
            />
          )}
          <dashboardItem.icon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="truncate font-medium">{dashboardItem.label}</span>}
        </button>

        {sections.map((section) => {
          const expanded = expandedSections[section.key];
          const active = isSectionActive(section.key);

          return (
            <div key={section.key} className="mx-1">
              {!collapsed && (
                <button
                  type="button"
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
                    const itemActive = activeKey === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onNavigate(item.path)}
                        className="group relative flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-300"
                        style={navButtonStyle(itemActive)}
                      >
                        {itemActive && (
                          <span
                            className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full"
                            style={{ background: "linear-gradient(180deg, #1F7A63 0%, #2FA58D 100%)" }}
                          />
                        )}
                        <Icon className="h-4.5 w-4.5 shrink-0" />
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
        type="button"
        onClick={onToggle}
        className="mx-3 mb-3 flex shrink-0 items-center justify-center rounded-xl transition-all duration-200"
        style={{
          height: 40,
          border: "1px solid #E2E8F0",
          color: "#64748B",
          background: "rgba(255,255,255,0.68)",
        }}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
};

export default PortalSidebar;
