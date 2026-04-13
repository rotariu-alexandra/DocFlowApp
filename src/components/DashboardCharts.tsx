"use client";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LineChart,
    Line,
} from "recharts";

type DepartmentStatsItem = {
    department: string;
    count: number;
};

type StatusStatsItem = {
    status: string;
    count: number;
};

type DailyStatsItem = {
    date: string;
    count: number;
};

type DashboardChartsProps = {
    departmentStats: DepartmentStatsItem[];
    statusStats: StatusStatsItem[];
    dailyStats: DailyStatsItem[];
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function formatStatusLabel(status: string) {
    if (status === "new") return "New";
    if (status === "in_progress") return "In Progress";
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return status;
}

export default function DashboardCharts({
    departmentStats,
    statusStats,
    dailyStats,
}: DashboardChartsProps) {
    const formattedStatusStats = statusStats.map((item) => ({
        ...item,
        status: formatStatusLabel(item.status),
    }));

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
                <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Requests by Department
                </h2>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Requests" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
                <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Requests by Status
                </h2>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={formattedStatusStats}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                label
                            >
                                {formattedStatusStats.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900 xl:col-span-2">
                <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Requests in the Last 7 Days
                </h2>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                name="Requests"
                                stroke="#2563eb"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
}