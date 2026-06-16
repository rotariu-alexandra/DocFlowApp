import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout-root" style={{ display: "flex", minHeight: "100vh", flexDirection: "row" }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <div className="dashboard-main" style={{ padding: "28px 32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
