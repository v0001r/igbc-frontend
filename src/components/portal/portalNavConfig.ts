import { FolderOpen, LayoutDashboard } from "lucide-react";
import type { PortalSidebarConfig } from "./portalTypes";

export const staffLeadNavConfig: PortalSidebarConfig = {
  brandTitle: "IGBC Lead",
  brandSubtitle: "Green Building Portal",
  dashboardItem: {
    key: "lead",
    label: "Dashboard",
    path: "/staff/lead",
    icon: LayoutDashboard,
  },
  sections: [
    {
      key: "workflow",
      label: "Workflow",
      children: [
        {
          key: "assignments",
          label: "My Assignments",
          path: "/staff/assignments",
          icon: FolderOpen,
        },
      ],
    },
  ],
};

export const staffNavConfig: PortalSidebarConfig = {
  brandTitle: "IGBC Staff",
  brandSubtitle: "Green Building Portal",
  dashboardItem: {
    key: "dashboard",
    label: "Dashboard",
    path: "/staff",
    icon: LayoutDashboard,
  },
  sections: [],
};

export const tpaNavConfig: PortalSidebarConfig = {
  brandTitle: "IGBC TPA",
  brandSubtitle: "Green Building Portal",
  dashboardItem: {
    key: "dashboard",
    label: "Dashboard",
    path: "/tpa",
    icon: LayoutDashboard,
  },
  sections: [],
};

export const staffPageTitles: Record<string, string> = {
  lead: "Lead Dashboard",
  assignments: "My Assignments",
  dashboard: "Staff Dashboard",
  project: "Project Review",
};

export const tpaPageTitles: Record<string, string> = {
  dashboard: "TPA Dashboard",
  project: "Project Review",
};

export function resolveStaffActiveKey(pathname: string, isLead: boolean): string {
  if (pathname.includes("/projects/")) return "project";
  if (pathname.startsWith("/staff/assignments")) return "assignments";
  if (pathname.startsWith("/staff/lead")) return "lead";
  return isLead ? "lead" : "dashboard";
}

export function resolveTpaActiveKey(pathname: string): string {
  if (pathname.includes("/projects/")) return "project";
  return "dashboard";
}
