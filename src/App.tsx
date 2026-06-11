import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import Index from "./components/pages/Index.tsx";
import Profile from "./components/pages/Profile.tsx";
import Settings from "./components/pages/Settings.tsx";
import BecomeAMember from "./components/pages/BecomeAMember.tsx";
import MembershipDirectory from "./components/pages/MembershipDirectory.tsx";
import APExam from "./components/pages/APExam.tsx";
import MyExams from "./components/pages/MyExams.tsx";
import Projects from "./components/pages/Projects.tsx";
import RegisterProject from "./components/pages/RegisterProject.tsx";
import NestPlus from "./components/pages/NestPlus.tsx";
import MyMembership from "./components/pages/MyMembership.tsx";
import Login from "./components/pages/Login.tsx";
import RoleLogin from "./components/pages/RoleLogin.tsx";
import ChangePassword from "./components/pages/ChangePassword.tsx";
import ForgotPassword from "./components/pages/ForgotPassword.tsx";
import ResetPassword from "./components/pages/ResetPassword.tsx";
import Register from "./components/pages/Register.tsx";
import StaffModule from "./staff/StaffModule.tsx";
import TpaModule from "./tpa/TpaModule.tsx";
import ProjectDetail from "./components/pages/ProjectDetail.tsx";
import ApplyCertification from "./components/pages/ApplyCertification.tsx";
import NotFound from "./components/pages/NotFound.tsx";
import AdminModule from "./admin/AdminModule.tsx";

const queryClient = new QueryClient();

function homeForUser(user: ReturnType<typeof getCurrentUser>) {
  if (user?.userType === "a") return "/admin";
  if (user?.userType === "s") return "/staff";
  if (user?.userType === "T") return "/tpa";
  return "/home";
}

const RequireAuth = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const user = getCurrentUser();
  if (user?.userType !== "m") {
    return <Navigate to={homeForUser(user)} replace />;
  }
  return <Outlet />;
};

const RedirectIfAuth = () => {
  if (isAuthenticated()) {
    const user = getCurrentUser();
    return <Navigate to={homeForUser(user)} replace />;
  }
  return <Outlet />;
};

const RequireAdmin = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  const user = getCurrentUser();
  if (user?.userType !== "a") {
    return <Navigate to={homeForUser(user)} replace />;
  }
  return <Outlet />;
};

const RequireStaff = () => {
  if (!isAuthenticated()) return <Navigate to="/staff/login" replace />;
  const user = getCurrentUser();
  if (user?.userType !== "s") return <Navigate to={homeForUser(user)} replace />;
  return <Outlet />;
};

const RequireTpa = () => {
  if (!isAuthenticated()) return <Navigate to="/tpa/login" replace />;
  const user = getCurrentUser();
  if (user?.userType !== "T") return <Navigate to={homeForUser(user)} replace />;
  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<RedirectIfAuth />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<RoleLogin portal="admin" />} />
            <Route path="/staff/login" element={<RoleLogin portal="staff" />} />
            <Route path="/tpa/login" element={<RoleLogin portal="tpa" />} />
            <Route path="/client/login" element={<Navigate to="/login" replace />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/directory" element={<MembershipDirectory />} />
          <Route path="/change-password" element={<ChangePassword />} />

          <Route element={<RequireAuth />}>
            <Route path="/home" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/become-a-member" element={<BecomeAMember />} />
            <Route path="/my-membership" element={<MyMembership />} />
            <Route path="/ap-exam" element={<APExam />} />
            <Route path="/exams" element={<MyExams />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/apply-certification/:id" element={<ApplyCertification />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/register-project" element={<RegisterProject />} />
            <Route path="/nest-plus" element={<NestPlus />} />
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="/admin/*" element={<AdminModule />} />
          </Route>
          <Route element={<RequireStaff />}>
            <Route path="/staff/*" element={<StaffModule />} />
          </Route>
          <Route element={<RequireTpa />}>
            <Route path="/tpa/*" element={<TpaModule />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
