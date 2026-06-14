import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: "28px 32px", minHeight: "100vh" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
