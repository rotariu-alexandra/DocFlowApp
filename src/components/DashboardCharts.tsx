"use client";

import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type DashboardChartsProps = {
    departmentStats: { department: string; count: number }[];
    statusStats: { status: string; count: number }[];
    dailyStats: { date: string; count: number }[];
};

export default function DashboardCharts({ dailyStats }: DashboardChartsProps) {
    const formatted = dailyStats.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        count: d.count,
    }));

    return (
        <div style={{
            background: "var(--card-bg)",
            border: "0.5px solid var(--card-border)",
            borderRadius: "10px",
            padding: "16px 20px",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", margin: 0 }}>Request activity</p>
                    <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Daily submissions — last 30 days</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#378ADD" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "var(--muted)" }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "var(--muted)" }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "var(--card-bg)",
                            border: "0.5px solid var(--card-border)",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "var(--foreground)",
                        }}
                        cursor={{ stroke: "var(--card-border)", strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#378ADD"
                        strokeWidth={1.5}
                        fill="url(#areaGrad)"
                        dot={false}
                        activeDot={{ r: 3, fill: "#378ADD" }}
                        name="Requests"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
