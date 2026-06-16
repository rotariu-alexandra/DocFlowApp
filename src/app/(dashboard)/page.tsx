"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import DashboardCharts from "@/components/DashboardCharts";
import ExportPdfButton from "@/components/ExportPdfButton";
import { useUser } from "@clerk/nextjs";

type RequestItem = { _id: string; title: string; department: string; status: string; priority: string };
type DashboardData = {
  totalRequests: number; newRequests: number; inProgressRequests: number;
  approvedRequests: number; rejectedRequests: number;
  recentRequests: RequestItem[];
  departmentStats: { department: string; count: number }[];
  statusStats: { status: string; count: number }[];
  dailyStats: { date: string; count: number }[];
};

export default function HomePage() {
  const { user } = useUser();
  const role = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role.toLowerCase() : undefined;
  const canExport = role && ["hr", "manager", "admin"].includes(role);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { if (d.success) setData(d.data); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading…</div>;
  if (!data) return <div style={{ color: "var(--muted)", fontSize: "13px" }}>No data.</div>;

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const statCards = [
    { label: "Total", value: data.totalRequests, dot: "#639922" },
    { label: "New", value: data.newRequests, dot: "#378ADD" },
    { label: "In progress", value: data.inProgressRequests, dot: "#BA7517" },
    { label: "Approved", value: data.approvedRequests, dot: "#3B6D11" },
    { label: "Rejected", value: data.rejectedRequests, dot: "#A32D2D" },
  ];

  const maxDept = Math.max(...data.departmentStats.map(d => d.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <PageHeader title="Dashboard" description={today} />
        <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
          {canExport && <ExportPdfButton />}
          <Link href="/create-request" className="btn btn-blue" style={{ fontSize: "13px", padding: "7px 16px" }}>
            + New request
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot, flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>{s.label}</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 500, color: "var(--foreground)", marginTop: "6px", lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <DashboardCharts departmentStats={data.departmentStats} statusStats={data.statusStats} dailyStats={data.dailyStats} />

      {/* Bottom row: Recent Requests (left) + By Department (right) */}
      <div className="bottom-row-grid" style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "12px" }}>

        {/* Recent requests */}
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", margin: 0 }}>Recent requests</p>
            <Link href="/requests" className="btn btn-link"
              onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = "underline")}
              onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = "none")}
            >View all →</Link>
          </div>
          {data.recentRequests.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>No recent requests.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data.recentRequests.map((req, i) => (
                <div key={req._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 0", gap: "12px",
                  borderBottom: i < data.recentRequests.length - 1 ? "0.5px solid var(--card-border)" : "none",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Link href={`/requests/${req._id}`} style={{ textDecoration: "none" }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{req.title}</p>
                    </Link>
                    <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "1px" }}>{req.department}</p>
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                    <StatusBadge status={req.status} />
                    <PriorityBadge priority={req.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By department */}
        <div className="card" style={{ padding: "14px 16px" }}>
          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", margin: "0 0 12px" }}>By department</p>
          {data.departmentStats.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>No data.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {data.departmentStats.map(d => (
                <div key={d.department}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "12px", color: "var(--foreground)" }}>{d.department}</span>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>{d.count}</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "2px", background: "var(--muted-bg)" }}>
                    <div style={{ height: "100%", borderRadius: "2px", background: "var(--accent-blue)", width: `${Math.round((d.count / maxDept) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
