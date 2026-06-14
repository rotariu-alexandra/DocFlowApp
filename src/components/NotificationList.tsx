"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NotificationItem = {
    _id: string; title: string; message: string;
    isRead: boolean; createdAt: string; link?: string;
};

const PAGE_SIZE = 7;

export default function NotificationList() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (data.success) setNotifications(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchNotifications();
        const iv = setInterval(fetchNotifications, 10000);
        return () => clearInterval(iv);
    }, []);

    const markAsRead = async (id: string) => {
        await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
        await fetchNotifications();
        window.dispatchEvent(new Event("notifications-updated"));
    };

    const markAllAsRead = async () => {
        await fetch("/api/notifications/read-all", { method: "PATCH" });
        await fetchNotifications();
        window.dispatchEvent(new Event("notifications-updated"));
    };

    if (loading) return <p style={{ fontSize: "13px", color: "var(--muted)" }}>Loading…</p>;

    const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
    const paginated = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                    {unreadCount > 0 && ` · ${unreadCount} unread`}
                </p>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="btn btn-link"
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* List */}
            {notifications.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)" }}>No notifications.</p>
            ) : (
                <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {paginated.map(n => (
                            <div key={n._id} style={{
                                padding: "12px 14px", borderRadius: "8px",
                                background: n.isRead ? "var(--muted-bg)" : "var(--card-bg)",
                                border: `0.5px solid ${n.isRead ? "var(--card-border)" : "var(--accent-blue)"}`,
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", margin: 0 }}>{n.title}</p>
                                        <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "3px", lineHeight: 1.5 }}>{n.message}</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                                            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                                                {new Date(n.createdAt).toLocaleString("en-GB")}
                                            </span>
                                            {n.link && (
                                                <Link href={n.link} style={{ fontSize: "11px", color: "var(--accent-blue)", textDecoration: "none" }}
                                                    onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = "underline")}
                                                    onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = "none")}
                                                >View request →</Link>
                                            )}
                                        </div>
                                    </div>
                                    {!n.isRead && (
                                        <button onClick={() => markAsRead(n._id)} className="btn btn-ghost" style={{ fontSize: "11px", padding: "3px 8px", flexShrink: 0 }}>
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", paddingTop: "4px" }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost" style={{ padding: "4px 10px" }}>
                                ←
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)} className={p === page ? "btn btn-blue" : "btn btn-ghost"} style={{ padding: "4px 10px", minWidth: "30px" }}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-ghost" style={{ padding: "4px 10px" }}>
                                →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
