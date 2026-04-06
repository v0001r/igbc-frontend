import { DashboardLayout } from "@/components/DashboardLayout";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MembershipCard } from "@/components/dashboard/MembershipCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SupportSection } from "@/components/dashboard/SupportSection";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <WelcomeHeader />
        <QuickActions />

        {/* Recent Activity + Membership side by side */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <RecentActivity />
          <MembershipCard />
        </div>

        <SupportSection />
        <UpcomingEvents />
      </div>
    </DashboardLayout>
  );
};

export default Index;
