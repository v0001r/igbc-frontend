import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Profile from "./pages/Profile.tsx";
import Settings from "./pages/Settings.tsx";
import BecomeAMember from "./pages/BecomeAMember.tsx";
import MembershipDirectory from "./pages/MembershipDirectory.tsx";
import APExam from "./pages/APExam.tsx";
import MyExams from "./pages/MyExams.tsx";
import Projects from "./pages/Projects.tsx";
import RegisterProject from "./pages/RegisterProject.tsx";
import NestPlus from "./pages/NestPlus.tsx";
import MyMembership from "./pages/MyMembership.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ProjectDetail from "./pages/ProjectDetail.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/become-a-member" element={<BecomeAMember />} />
          <Route path="/my-membership" element={<MyMembership />} />
          <Route path="/directory" element={<MembershipDirectory />} />
          <Route path="/ap-exam" element={<APExam />} />
          <Route path="/exams" element={<MyExams />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/register-project" element={<RegisterProject />} />
          <Route path="/nest-plus" element={<NestPlus />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
