import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { GreenHomesRuntimeConfig, GreenHomesTab } from "@/lib/greenHomesConfig";
import { getSubtabsForTab } from "@/lib/greenHomesConfig";

type Props = {
  config: GreenHomesRuntimeConfig;
  currentTabSlug: string;
  currentSubSlug: string;
  onTabChange: (tabSlug: string) => void;
  onSubtabChange: (tabSlug: string, subSlug: string) => void;
};

export function DynamicTabs({
  config,
  currentTabSlug,
  currentSubSlug,
  onTabChange,
  onSubtabChange,
}: Props) {
  const [hoverTabSlug, setHoverTabSlug] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setHoverTabSlug(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const tabs: GreenHomesTab[] = Array.isArray(config.tabs) ? config.tabs : [];

  return (
    <div ref={wrapRef} className="relative border-b border-border bg-card">
      <div className="flex flex-wrap items-end gap-0 px-2 sm:px-4">
        {tabs.map((tab) => {
          const subtabs = getSubtabsForTab(config, tab.slug);
          const hasSub = subtabs.length > 0;
          const isActiveTab = tab.slug === currentTabSlug;
          const showMenu = hasSub && hoverTabSlug === tab.slug;
          const currentSubName = subtabs.find((s) => s.sub_slug === currentSubSlug)?.name;

          return (
            <div
              key={tab.slug}
              className="relative"
              onMouseEnter={() => {
                if (hasSub) setHoverTabSlug(tab.slug);
              }}
              onMouseLeave={() => setHoverTabSlug((prev) => (prev === tab.slug ? null : prev))}
            >
              <button
                type="button"
                className={`flex items-center gap-1 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                  isActiveTab
                    ? "border-ocean text-ocean"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  onTabChange(tab.slug);
                  const first = subtabs[0]?.sub_slug;
                  if (first) onSubtabChange(tab.slug, first);
                }}
                aria-expanded={showMenu}
                aria-haspopup={hasSub ? "menu" : undefined}
              >
                {tab.name}
                {hasSub ? <ChevronDown className="h-3.5 w-3.5 opacity-70" /> : null}
              </button>

              {showMenu ? (
                <div
                  className="absolute left-0 top-full z-50 mt-0 min-w-[16rem] rounded-md border border-border bg-card py-1 shadow-lg"
                  role="menu"
                >
                  {subtabs.map((s) => (
                    <button
                      key={s.sub_slug}
                      type="button"
                      role="menuitem"
                      className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-muted/80 ${
                        s.sub_slug === currentSubSlug && tab.slug === currentTabSlug
                          ? "font-semibold text-ocean"
                          : "text-foreground"
                      }`}
                      onClick={() => {
                        onSubtabChange(tab.slug, s.sub_slug);
                        setHoverTabSlug(null);
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              ) : null}

              {isActiveTab && currentSubName ? (
                <span className="sr-only">Current section: {currentSubName}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
