import { ReactNode } from "react";
import PortalHeader from "./PortalHeader";
import PortalSidebar from "./PortalSidebar";
import type { PortalSidebarConfig } from "./portalTypes";

type Props = {
  children: ReactNode;
  config: PortalSidebarConfig;
  activeKey: string;
  title: string;
  userLabel: string;
  loginPath: string;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
};

const PortalLayout = ({
  children,
  config,
  activeKey,
  title,
  userLabel,
  loginPath,
  collapsed,
  onToggle,
  onNavigate,
}: Props) => {
  return (
    <div className="page-gradient-bg min-h-screen">
      <PortalSidebar
        config={config}
        activeKey={activeKey}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={onToggle}
      />
      <div className="transition-all duration-300" style={{ marginLeft: collapsed ? 84 : 272 }}>
        <PortalHeader title={title} userLabel={userLabel} loginPath={loginPath} />
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
};

export default PortalLayout;
