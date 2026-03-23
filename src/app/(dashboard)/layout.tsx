import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1">
        <div className="min-h-screen p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}