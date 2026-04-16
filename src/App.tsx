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
import Register from "./components/pages/Register.tsx";
import ProjectDetail from "./components/pages/ProjectDetail.tsx";
import NotFound from "./components/pages/NotFound.tsx";
import AdminModule from "./admin/AdminModule.tsx";

const queryClient = new QueryClient();

const RequireAuth = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const user = getCurrentUser();
  if (user?.userType === "a") {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
};

const RedirectIfAuth = () => {
  if (isAuthenticated()) {
    const user = getCurrentUser();
    return <Navigate to={user?.userType === "a" ? "/admin" : "/home"} replace />;
  }
  return <Outlet />;
};

const RequireAdmin = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  const user = getCurrentUser();
  if (user?.userType !== "a") {
    return <Navigate to="/home" replace />;
  }
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
            <Route path="/admin/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route path="/directory" element={<MembershipDirectory />} />

          <Route element={<RequireAuth />}>
            <Route path="/home" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/become-a-member" element={<BecomeAMember />} />
            <Route path="/my-membership" element={<MyMembership />} />
            <Route path="/ap-exam" element={<APExam />} />
            <Route path="/exams" element={<MyExams />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/register-project" element={<RegisterProject />} />
            <Route path="/nest-plus" element={<NestPlus />} />
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="/admin/*" element={<AdminModule />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
