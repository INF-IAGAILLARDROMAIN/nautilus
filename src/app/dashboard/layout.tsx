import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-64">{children}</div>
      <BottomNav />
    </>
  );
}
