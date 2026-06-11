import { Users, CreditCard, FolderOpen, Award, TrendingUp, CalendarDays } from "lucide-react";
import KPICard from "../components/KPICard";
import DashboardCharts from "../components/DashboardCharts";
import DashboardTable from "../components/DashboardTable";
import RecentActivity from "../components/RecentActivity";
import NotificationsPanel from "../components/NotificationsPanel";
import DashboardFilters from "../components/DashboardFilters";

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <DashboardFilters />

      <section className="glass-section">
        <h2 className="glass-section-title mb-4">Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard title="Total Users" value="4,563" change={12.5} icon={Users} color="primary" sparkData={[30, 45, 38, 52, 48, 65, 58, 72, 68, 80, 75, 90]} />
        <KPICard title="Active Memberships" value="2,847" change={8.2} icon={CreditCard} color="success" sparkData={[20, 25, 30, 28, 35, 40, 38, 45, 42, 50, 48, 55]} />
        <KPICard title="Total Projects" value="355" change={5.4} icon={FolderOpen} color="info" sparkData={[50, 45, 48, 42, 55, 58, 62, 58, 65, 68, 66, 72]} />
        <KPICard title="Certifications" value="4,549" change={15.3} icon={Award} color="success" sparkData={[40, 55, 50, 65, 60, 75, 70, 85, 80, 90, 88, 95]} />
        <KPICard title="Revenue (₹L)" value="₹92.4L" change={22.1} icon={TrendingUp} color="primary" sparkData={[25, 35, 40, 50, 48, 60, 55, 70, 65, 80, 78, 92]} />
        <KPICard title="Upcoming Events" value="18" change={3.1} icon={CalendarDays} color="warning" sparkData={[10, 12, 8, 14, 16, 12, 18, 15, 17, 14, 16, 18]} />
        </div>
      </section>

      <section className="glass-section">
        <h2 className="glass-section-title mb-4">Analytics</h2>
        <DashboardCharts />
      </section>

      <section className="glass-section">
        <h2 className="glass-section-title mb-4">Recent Records</h2>
        <DashboardTable />
      </section>

      <section className="glass-section grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RecentActivity />
        <NotificationsPanel />
      </section>
    </div>
  );
};

export default DashboardPage;
