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
      <div className="space-y-8">
        <section className="glass-section">
          <WelcomeHeader />
        </section>

        <QuickActions />

        <section className="glass-section grid gap-6 lg:grid-cols-[1fr_340px]">
          <RecentActivity />
          <MembershipCard />
        </section>

        <SupportSection />
        <UpcomingEvents />
      </div>
    </DashboardLayout>
  );
};

export default Index;
