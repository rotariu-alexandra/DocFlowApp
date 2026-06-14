"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
    _id: string;
    action: "created" | "updated" | "status_changed" | "deleted";
    performedBy: string;
    performedByRole?: string;
    details?: { message?: string; from?: string; to?: string; title?: string };
    createdAt: string;
};

const ACTION_CONFIG: Record<string, { label: string; dot: string }> = {
    created: { label: "Request created", dot: "var(--accent-blue)" },
    updated: { label: "Request details updated", dot: "var(--accent-amber)" },
    status_changed: { label: "", dot: "var(--accent-green)" },
    deleted: { label: "Request deleted", dot: "var(--accent-red)" },
};

const ROLE_LABELS: Record<string, string> = {
    employee: "Employee", hr: "HR", manager: "Manager", admin: "Admin",
};

function getHistoryText(item: HistoryItem): string {
    if (item.action === "status_changed") {
        return `Status changed: "${item.details?.from}" → "${item.details?.to}"`;
    }
    return ACTION_CONFIG[item.action]?.label ?? "Action performed";
}

export default function RequestHistory({ requestId }: { requestId: string }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/requests/${requestId}/history`);
                const data = await res.json();
                if (data.success) setHistory(data.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [requestId]);

    return (
        <div className="card">
            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", marginBottom: "14px" }}>
                History
            </p>

            {loading ? (
                <p style={{ fontSize: "13px", color: "var(--muted)" }}>Loading…</p>
            ) : history.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)" }}>No history yet.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {history.map((item, i) => {
                        const cfg = ACTION_CONFIG[item.action] ?? { label: "Action", dot: "var(--muted)" };
                        return (
                            <div
                                key={item._id}
                                style={{
                                    display: "flex", gap: "12px", padding: "10px 0",
                                    borderBottom: i < history.length - 1 ? "0.5px solid var(--card-border)" : "none",
                                }}
                            >
                                {/* dot + vertical line */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3px", flexShrink: 0 }}>
                                    <span style={{
                                        width: "8px", height: "8px", borderRadius: "50%",
                                        background: cfg.dot, flexShrink: 0,
                                        display: "inline-block",
                                    }} />
                                    {i < history.length - 1 && (
                                        <span style={{ width: "1px", flex: 1, background: "var(--card-border)", marginTop: "4px" }} />
                                    )}
                                </div>

                                {/* content */}
                                <div style={{ flex: 1, minWidth: 0, paddingBottom: "4px" }}>
                                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", margin: 0 }}>
                                        {getHistoryText(item)}
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                                            {ROLE_LABELS[item.performedByRole ?? "employee"] ?? item.performedByRole}
                                        </span>
                                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>·</span>
                                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                                            {new Date(item.createdAt).toLocaleString("en-GB")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}