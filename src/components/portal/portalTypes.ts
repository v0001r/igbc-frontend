import type { LucideIcon } from "lucide-react";

export type PortalNavItem = {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
};

export type PortalNavSection = {
  key: string;
  label: string;
  children: PortalNavItem[];
};

export type PortalSidebarConfig = {
  brandTitle: string;
  brandSubtitle: string;
  dashboardItem: PortalNavItem;
  sections: PortalNavSection[];
};
