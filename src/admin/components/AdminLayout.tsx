import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
  activeItem: string;
  onNavigate: (key: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  title: string;
}

const AdminLayout = ({ children, activeItem, onNavigate, collapsed, onToggle, title }: AdminLayoutProps) => {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(145deg, #F6FBF9 0%, #EEF7F4 100%)",
      }}
    >
      <AdminSidebar activeItem={activeItem} onNavigate={onNavigate} collapsed={collapsed} onToggle={onToggle} />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? 84 : 272 }}
      >
        <AdminHeader title={title} onNavigate={onNavigate} />
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
