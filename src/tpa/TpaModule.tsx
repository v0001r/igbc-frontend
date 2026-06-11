import "../admin/admin.css";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PortalLayout from "@/components/portal/PortalLayout";
import { resolveTpaActiveKey, tpaNavConfig, tpaPageTitles } from "@/components/portal/portalNavConfig";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import TpaDashboardPage from "./pages/TpaDashboardPage";
import TpaProjectViewPage from "./pages/TpaProjectViewPage";

export default function TpaModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  const activeKey = resolveTpaActiveKey(location.pathname);
  const title = tpaPageTitles[activeKey] ?? "TPA Dashboard";

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/tpa/login", { replace: true });
    }
  }, [navigate]);

  return (
    <PortalLayout
      config={tpaNavConfig}
      activeKey={activeKey === "project" ? "dashboard" : activeKey}
      title={title}
      userLabel={user?.displayName ?? "TPA"}
      loginPath="/tpa/login"
      collapsed={collapsed}
      onToggle={() => setCollapsed((v) => !v)}
      onNavigate={(path) => navigate(path)}
    >
      <Routes>
        <Route index element={<TpaDashboardPage />} />
        <Route path="projects/:id" element={<TpaProjectViewPage />} />
      </Routes>
    </PortalLayout>
  );
}
