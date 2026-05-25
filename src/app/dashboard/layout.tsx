import { BottomNav } from "@/components/bottom-nav";
import { AppelerMecanoFab } from "@/components/appeler-mecano-fab";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AppelerMecanoFab />
      <BottomNav />
    </>
  );
}
