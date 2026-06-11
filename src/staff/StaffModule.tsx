import "../admin/admin.css";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PortalLayout from "@/components/portal/PortalLayout";
import {
  resolveStaffActiveKey,
  staffLeadNavConfig,
  staffNavConfig,
  staffPageTitles,
} from "@/components/portal/portalNavConfig";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import LeadDashboardPage from "./pages/LeadDashboardPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffProjectViewPage from "./pages/StaffProjectViewPage";

export default function StaffModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const isLead = user?.isLead === true;
  const [collapsed, setCollapsed] = useState(false);

  const navConfig = isLead ? staffLeadNavConfig : staffNavConfig;
  const activeKey = resolveStaffActiveKey(location.pathname, isLead);
  const title = staffPageTitles[activeKey] ?? "Staff Dashboard";

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/staff/login", { replace: true });
    }
  }, [navigate]);

  return (
    <PortalLayout
      config={navConfig}
      activeKey={activeKey === "project" ? (isLead ? "lead" : "dashboard") : activeKey}
      title={title}
      userLabel={user?.displayName ?? "Staff"}
      loginPath="/staff/login"
      collapsed={collapsed}
      onToggle={() => setCollapsed((v) => !v)}
      onNavigate={(path) => navigate(path)}
    >
      <Routes>
        <Route
          index
          element={isLead ? <Navigate to="/staff/lead" replace /> : <StaffDashboardPage />}
        />
        <Route
          path="lead"
          element={isLead ? <LeadDashboardPage /> : <Navigate to="/staff" replace />}
        />
        <Route path="assignments" element={<StaffDashboardPage />} />
        <Route path="projects/:id" element={<StaffProjectViewPage isLead={isLead} />} />
      </Routes>
    </PortalLayout>
  );
}
