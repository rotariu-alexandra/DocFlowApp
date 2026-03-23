"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";

type RequestItem = {
  _id: string;
  title: string;
  department: string;
  status: string;
  priority: string;
};

type DashboardData = {
  totalRequests: number;
  newRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  recentRequests: RequestItem[];
};

export default function HomePage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();

      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="p-4 text-gray-500 dark:text-gray-400">Loading dashboard...</p>;
  }

  if (!dashboardData) {
    return <p className="p-4 text-gray-500 dark:text-gray-400">No dashboard data available.</p>;
  }

  const stats = [
    { title: "Total Requests", value: dashboardData.totalRequests },
    { title: "New Requests", value: dashboardData.newRequests },
    { title: "Approved", value: dashboardData.approvedRequests },
    { title: "Rejected", value: dashboardData.rejectedRequests },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Monitorizează cererile și gestionează fluxul documentelor interne."
      />

      <div>
        <Link
          href="/create-request"
          className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Create Request
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.title}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-800 dark:text-gray-100">
              {stat.value}
            </h2>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Recent Requests
          </h2>
          <Link
            href="/requests"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="space-y-4">
          {dashboardData.recentRequests.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No recent requests found.
            </p>
          ) : (
            dashboardData.recentRequests.map((request) => (
              <div
                key={request._id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                      {request.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Department: {request.department}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={request.status} />
                    <PriorityBadge priority={request.priority} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}