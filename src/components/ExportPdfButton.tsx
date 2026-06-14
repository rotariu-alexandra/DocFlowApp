"use client";

import { useState } from "react";

export default function ExportPdfButton() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [loading, setLoading] = useState(false);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

    const handleExport = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/reports/pdf?year=${year}&month=${month}`);
            if (!res.ok) { alert("Error generating report."); return; }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `report-${year}-${String(month).padStart(2, "0")}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Connection error.");
        } finally {
            setLoading(false);
        }
    };

    const selectStyle: React.CSSProperties = {
        fontSize: "12px", padding: "5px 10px", borderRadius: "6px",
        border: "0.5px solid var(--card-border)",
        background: "var(--card-bg)", color: "var(--foreground)",
        outline: "none", cursor: "pointer",
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={selectStyle}>
                {months.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={selectStyle}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
                onClick={handleExport}
                disabled={loading}
                className="rounded-md border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[#e8d8c8] disabled:opacity-50"
            >
                {loading ? "Generating…" : "↓ Export PDF"}
            </button>
        </div>
    );
}
