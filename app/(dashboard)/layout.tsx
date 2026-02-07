import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-grid-gradient bg-grid-lines">
      <DashboardHeader />
      <main className="relative">{children}</main>
    </div>
  );
}
