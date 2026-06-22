import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ClipboardList, FileBadge, LayoutGrid } from "lucide-react";
import type { GreenHomesRuntimeConfig, GreenHomesTab } from "@/lib/greenHomesConfig";
import { getSubtabsForTab } from "@/lib/greenHomesConfig";

export type WorkspaceView = "overview" | "checklist" | "certificate" | "section";

type Props = {
  config: GreenHomesRuntimeConfig;
  view: WorkspaceView;
  currentTabSlug: string;
  currentSubSlug: string;
  showCertificate?: boolean;
  onViewChange: (view: WorkspaceView) => void;
  onSectionSelect: (tabSlug: string, subSlug: string) => void;
};

const PRIMARY_VIEWS: { id: WorkspaceView; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "checklist", label: "Checklist", icon: ClipboardList },
  { id: "certificate", label: "View Certificate", icon: FileBadge },
];

export function CertificationLeftNav({
  config,
  view,
  currentTabSlug,
  currentSubSlug,
  showCertificate = true,
  onViewChange,
  onSectionSelect,
}: Props) {
  const tabs: GreenHomesTab[] = Array.isArray(config.tabs) ? config.tabs : [];
  const [expandedTabSlug, setExpandedTabSlug] = useState<string | null>(currentTabSlug);

  useEffect(() => {
    if (view === "section") {
      setExpandedTabSlug(currentTabSlug);
    }
  }, [currentTabSlug, view]);

  const toggleTab = (slug: string) => {
    setExpandedTabSlug((prev) => (prev === slug ? null : slug));
  };
  return (
    <aside className="flex w-full shrink-0 flex-col lg:sticky lg:top-20 lg:w-64 lg:self-start xl:w-72">
      <nav
        className="flex max-h-[min(70vh,720px)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        aria-label="Certification navigation"
      >
        <div className="border-b border-ocean/15 bg-ocean/[0.06] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ocean">Certification</p>
        </div>

        <ul className="py-2">
          {PRIMARY_VIEWS.filter((v) => v.id !== "certificate" || showCertificate).map(
            ({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onViewChange(id)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? "border-l-[3px] border-ocean bg-ocean/10 font-semibold text-ocean"
                      : "border-l-[3px] border-transparent text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              </li>
            );
          },
          )}
        </ul>

        <div className="border-t border-border px-4 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Rating sections
          </p>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">          {tabs.map((tab) => {
            const subtabs = getSubtabsForTab(config, tab.slug);
            const hasSub = subtabs.length > 0;
            const isOpen = expandedTabSlug === tab.slug;
            const isActiveTab = view === "section" && tab.slug === currentTabSlug;

            return (
              <li key={tab.slug} className="border-b border-border/60 last:border-0">
                <button
                  type="button"
                  onClick={() => {
                    if (hasSub) {
                      toggleTab(tab.slug);
                    } else {
                      onSectionSelect(tab.slug, tab.slug);
                    }
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                    isActiveTab ? "bg-ocean/5 font-medium text-ocean" : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  {hasSub ? (
                    isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )
                  ) : (
                    <span className="w-3.5" />
                  )}
                  <span className="line-clamp-2 flex-1">{tab.name}</span>
                </button>

                {hasSub && isOpen ? (
                  <ul className="pb-1 pl-6">
                    {subtabs.map((sub) => {
                      const active =
                        view === "section" &&
                        tab.slug === currentTabSlug &&
                        sub.sub_slug === currentSubSlug;
                      return (
                        <li key={sub.sub_slug}>
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedTabSlug(tab.slug);
                              onSectionSelect(tab.slug, sub.sub_slug);
                            }}
                            className={`block w-full rounded-md px-3 py-2 text-left text-xs leading-snug transition-colors ${
                              active
                                ? "bg-ocean/10 font-semibold text-ocean"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            {sub.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
