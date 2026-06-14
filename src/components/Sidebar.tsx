"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton, useUser } from "@clerk/nextjs";

const getLinksByRole = (role: string | undefined) => {
  const base = [
    { href: "/", label: "Dashboard", icon: "ti-layout-dashboard" },
    { href: "/create-request", label: "Create request", icon: "ti-file-plus" },
    { href: "/my-requests", label: "My requests", icon: "ti-files" },
    { href: "/notifications", label: "Notifications", icon: "ti-bell", badge: true },
  ];

  if (role && ["hr", "manager", "admin"].includes(role)) {
    base.splice(3, 0, { href: "/requests", label: "All requests", icon: "ti-list-details" });
  }

  return base;
};

type NotificationItem = { _id: string; isRead: boolean };

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const role =
    typeof user?.publicMetadata?.role === "string"
      ? user.publicMetadata.role.toLowerCase()
      : undefined;

  const links = getLinksByRole(role);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setUnreadCount((data.data as NotificationItem[]).filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Fetch unread notifications error:", error);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchUnread();

    const eventSource = new EventSource("/api/notifications/stream");
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "notification") fetchUnread();
      } catch { /* ping */ }
    };
    eventSource.onerror = () => eventSource.close();

    const handler = () => fetchUnread();
    window.addEventListener("notifications-updated", handler);
    return () => {
      eventSource.close();
      window.removeEventListener("notifications-updated", handler);
    };
  }, [isLoaded, user?.id]);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside
      className="flex flex-col"
      style={{
        width: "220px",
        minWidth: "220px",
        minHeight: "100vh",
        background: "var(--sidebar-bg)",
        borderRight: "0.5px solid var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "0.5px solid var(--sidebar-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: "var(--foreground)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="ti ti-file-description" style={{ fontSize: "15px", color: "var(--background)" }} aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)", lineHeight: 1.2 }}>DocuFlow</div>
            <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "1px" }}>Document management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", padding: "10px 8px 4px" }}>
          Main
        </div>

        {links.slice(0, 3).map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex", alignItems: "center", gap: "9px",
                padding: "7px 10px", borderRadius: "8px",
                fontSize: "13px",
                color: isActive ? "var(--foreground)" : "var(--muted)",
                fontWeight: isActive ? 500 : 400,
                background: isActive ? "var(--muted-bg)" : "transparent",
                textDecoration: "none", transition: "background .12s, color .12s",
              }}
              onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "var(--muted-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; } }}
              onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; } }}
            >
              <i className={`ti ${link.icon}`} style={{ fontSize: "16px", width: "16px" }} aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}

        {role && ["hr", "manager", "admin"].includes(role) && (
          <>
            <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", padding: "12px 8px 4px" }}>
              Management
            </div>
            <Link
              href="/requests"
              style={{
                display: "flex", alignItems: "center", gap: "9px",
                padding: "7px 10px", borderRadius: "8px",
                fontSize: "13px",
                color: pathname === "/requests" ? "var(--foreground)" : "var(--muted)",
                fontWeight: pathname === "/requests" ? 500 : 400,
                background: pathname === "/requests" ? "var(--muted-bg)" : "transparent",
                textDecoration: "none", transition: "background .12s, color .12s",
              }}
              onMouseEnter={(e) => { if (pathname !== "/requests") { (e.currentTarget as HTMLElement).style.background = "var(--muted-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; } }}
              onMouseLeave={(e) => { if (pathname !== "/requests") { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; } }}
            >
              <i className="ti ti-list-details" style={{ fontSize: "16px", width: "16px" }} aria-hidden="true" />
              All requests
            </Link>
          </>
        )}

        <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", padding: "12px 8px 4px" }}>
          Account
        </div>

        <Link
          href="/notifications"
          style={{
            display: "flex", alignItems: "center", gap: "9px",
            padding: "7px 10px", borderRadius: "8px",
            fontSize: "13px",
            color: pathname === "/notifications" ? "var(--foreground)" : "var(--muted)",
            fontWeight: pathname === "/notifications" ? 500 : 400,
            background: pathname === "/notifications" ? "var(--muted-bg)" : "transparent",
            textDecoration: "none", transition: "background .12s, color .12s",
          }}
          onMouseEnter={(e) => { if (pathname !== "/notifications") { (e.currentTarget as HTMLElement).style.background = "var(--muted-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; } }}
          onMouseLeave={(e) => { if (pathname !== "/notifications") { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; } }}
        >
          <i className="ti ti-bell" style={{ fontSize: "16px", width: "16px" }} aria-hidden="true" />
          Notifications
          {unreadCount > 0 && (
            <span style={{ marginLeft: "auto", background: "#e24b4a", color: "#fff", fontSize: "10px", fontWeight: 500, padding: "1px 6px", borderRadius: "10px" }}>
              {unreadCount}
            </span>
          )}
        </Link>
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 8px 12px", borderTop: "0.5px solid var(--sidebar-border)" }}>
        <div style={{ padding: "4px 8px 8px" }}>
          <ThemeToggle />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px" }}>
          <div style={{ flexShrink: 0 }}>
            <UserButton />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.fullName || user?.primaryEmailAddress?.emailAddress || "User"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
              {role || "employee"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
