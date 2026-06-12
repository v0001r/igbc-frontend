import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import DashboardPage from "./DashboardPage";
import MembershipsPage from "./MembershipsPage";
import CouponsPage from "./CouponsPage";
import APExamsPage from "./APExamsPage";
import EventsPage from "./EventsPage";
import SupportAssistancePage from "./SupportAssistancePage";
import ProjectsPage from "./ProjectsPage";
import ProjectCertificationPage from "./ProjectCertificationPage";
import ProfilePage from "./ProfilePage";
import ChangePasswordPage from "./ChangePasswordPage";
import UsersManagementPage from "./users/UsersManagementPage";
import AuditLogPage from "./AuditLogPage";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  memberships: "Memberships", "memberships-add": "Add Membership", "memberships-plans": "Membership Plans", "memberships-requests": "Membership Requests",
  coupons: "Coupons", "coupons-create": "Create Coupon", "coupons-usage": "Coupon Usage",
  "ap-exams": "AP Exams", "ap-exams-schedule": "Exam Schedule", "ap-exams-results": "Exam Results", "ap-exams-certifications": "Exam Certifications",
  "ap-associate": "AP Associate", "ap-associate-add": "Add Associate", "ap-associate-assign": "Assign Associate",
  "project-registration": "Project Registration", "project-registration-pending": "Pending Projects", "project-registration-approved": "Approved Projects", "project-registration-rejected": "Rejected Projects",
  "project-certification": "Project Certification", "project-certification-review": "Certification Review", "project-certification-approved": "Approved Certifications", "project-certification-issued": "Issued Certifications",
  "users-staff": "IGBC Staff", "users-tpa": "TPA Users",
  events: "Events", "events-create": "Create Event", "events-categories": "Event Categories",
  "support-assistance": "Support/Assistance",
  "audit-log": "Audit Log",
  "igbc-staff": "IGBC Staff", "igbc-staff-add": "Add Staff", "igbc-staff-roles": "Staff Roles",
  "event-registrations": "Event Registrations", "event-registrations-pending": "Pending Registrations", "event-registrations-confirmed": "Confirmed Registrations",
  profile: "Admin Profile",
  "change-password": "Change Password",
  settings: "Settings",
};

const adminPathByKey: Record<string, string> = {
  dashboard: "",
  memberships: "memberships",
  coupons: "coupons",
  "ap-exams": "ap-exams",
  "ap-associate": "ap-associate",
  "project-registration": "project-registration",
  "project-certification": "project-certification",
  "users-staff": "users/staff",
  "users-tpa": "users/tpa",
  events: "events",
  "support-assistance": "support-assistance",
  "audit-log": "audit-log",
  "igbc-staff": "igbc-staff",
  "event-registrations": "event-registrations",
  profile: "profile",
  "change-password": "change-password",
};

const keyByAdminPath: Record<string, string> = Object.entries(adminPathByKey).reduce(
  (acc, [key, path]) => {
    acc[path] = key;
    return acc;
  },
  {} as Record<string, string>,
);

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="kpi-card flex flex-col items-center justify-center py-16">
    <h2 className="text-sm font-semibold text-foreground mb-1">{title}</h2>
    <p className="text-xs text-muted-foreground">This section is under development.</p>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const activePath = location.pathname.replace(/^\/admin\/?/, "");
  const activeItem = useMemo(
    () => keyByAdminPath[activePath] ?? "dashboard",
    [activePath],
  );

  const handleNavigate = (key: string) => {
    const targetPath = adminPathByKey[key] ?? "";
    navigate(`/admin${targetPath ? `/${targetPath}` : ""}`);
  };

  const renderPage = () => {
    switch (activeItem) {
      case "dashboard": return <DashboardPage />;
      case "memberships": return <MembershipsPage />;
      case "coupons": return <CouponsPage />;
      case "ap-exams": return <APExamsPage />;
      case "events": return <EventsPage />;
      case "events-create": return <EventsPage />;
      case "support-assistance": return <SupportAssistancePage />;
      case "audit-log": return <AuditLogPage />;
      case "project-registration": return <ProjectsPage />;
      case "project-certification": return <ProjectCertificationPage />;
      case "profile": return <ProfilePage />;
      case "change-password": return <ChangePasswordPage />;
      case "users-staff":
        return <UsersManagementPage roleFilter="IGBC_STAFF" title="IGBC Staff" />;
      case "users-tpa":
        return <UsersManagementPage roleFilter="TPA" title="TPA Users" />;
      default: return <PlaceholderPage title={pageTitles[activeItem] || activeItem} />;
    }
  };

  return (
    <AdminLayout
      activeItem={activeItem}
      onNavigate={handleNavigate}
      collapsed={collapsed}
      onToggle={() => setCollapsed(!collapsed)}
      title={pageTitles[activeItem] || ""}
    >
      {renderPage()}
    </AdminLayout>
  );
};

export default Index;
