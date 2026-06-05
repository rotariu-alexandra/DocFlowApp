"use client";

import { useState } from "react";

export default function ExportPdfButton() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [loading, setLoading] = useState(false);

    const months = [
        "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
        "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
    ];
    const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

    const handleExport = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/reports/pdf?year=${year}&month=${month}`);
            if (!res.ok) { alert("Eroare la generarea raportului."); return; }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `raport-${year}-${String(month).padStart(2, "0")}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Eroare de conexiune.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            >
                {months.map((name, i) => (
                    <option key={i + 1} value={i + 1}>{name}</option>
                ))}
            </select>

            <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            >
                {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>

            <button
                onClick={handleExport}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Creating...
                    </>
                ) : (
                    <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export PDF
                    </>
                )}
            </button>
        </div>
    );
}
