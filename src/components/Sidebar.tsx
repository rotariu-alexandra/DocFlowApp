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

interface SidebarInnerProps {
  onClose?: () => void;
}

function SidebarInner({ onClose }: SidebarInnerProps) {
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

  const linkStyle = (active: boolean) => ({
    display: "flex", alignItems: "center", gap: "9px",
    padding: "7px 10px", borderRadius: "8px",
    fontSize: "13px",
    color: active ? "var(--foreground)" : "var(--muted)",
    fontWeight: active ? 500 : 400,
    background: active ? "var(--muted-bg)" : "transparent",
    textDecoration: "none", transition: "background .12s, color .12s",
  } as React.CSSProperties);

  const handleLinkMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>, active: boolean) => {
    if (!active) {
      (e.currentTarget as HTMLElement).style.background = "var(--muted-bg)";
      (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
    }
  };
  const handleLinkMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>, active: boolean) => {
    if (!active) {
      (e.currentTarget as HTMLElement).style.background = "transparent";
      (e.currentTarget as HTMLElement).style.color = "var(--muted)";
    }
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: "10px", fontWeight: 500, color: "var(--muted)",
    letterSpacing: ".06em", textTransform: "uppercase", padding: "10px 8px 4px",
  };

  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        width: "220px", minWidth: "220px", height: "100%",
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
          {/* Close button — only visible in drawer mode */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close menu"
              style={{
                marginLeft: "auto", background: "none", border: "none",
                cursor: "pointer", color: "var(--muted)", fontSize: "18px",
                display: "flex", alignItems: "center", padding: "2px",
                borderRadius: "6px",
              }}
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={sectionLabel}>Main</div>

        {links.slice(0, 3).map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={linkStyle(isActive)}
              onMouseEnter={(e) => handleLinkMouseEnter(e, isActive)}
              onMouseLeave={(e) => handleLinkMouseLeave(e, isActive)}
              onClick={onClose}
            >
              <i className={`ti ${link.icon}`} style={{ fontSize: "16px", width: "16px" }} aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}

        {role && ["hr", "manager", "admin"].includes(role) && (
          <>
            <div style={{ ...sectionLabel, paddingTop: "12px" }}>Management</div>
            <Link
              href="/requests"
              style={linkStyle(pathname === "/requests")}
              onMouseEnter={(e) => handleLinkMouseEnter(e, pathname === "/requests")}
              onMouseLeave={(e) => handleLinkMouseLeave(e, pathname === "/requests")}
              onClick={onClose}
            >
              <i className="ti ti-list-details" style={{ fontSize: "16px", width: "16px" }} aria-hidden="true" />
              All requests
            </Link>
          </>
        )}

        <div style={{ ...sectionLabel, paddingTop: "12px" }}>Account</div>

        <Link
          href="/notifications"
          style={linkStyle(pathname === "/notifications")}
          onMouseEnter={(e) => handleLinkMouseEnter(e, pathname === "/notifications")}
          onMouseLeave={(e) => handleLinkMouseLeave(e, pathname === "/notifications")}
          onClick={onClose}
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
    </div>
  );
}

export default function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  // Close drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Fetch unread for topbar badge
  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.success) setUnreadCount((d.data as { isRead: boolean }[]).filter(n => !n.isRead).length);
      })
      .catch(() => { });
  }, [user?.id]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar-desktop" style={{ flexShrink: 0 }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          <SidebarInner />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            className="hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <i className="ti ti-menu-2" style={{ fontSize: "20px" }} aria-hidden="true" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "6px",
              background: "var(--foreground)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="ti ti-file-description" style={{ fontSize: "12px", color: "var(--background)" }} aria-hidden="true" />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>DocuFlow</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {unreadCount > 0 && (
            <span style={{ background: "#e24b4a", color: "#fff", fontSize: "10px", fontWeight: 500, padding: "2px 7px", borderRadius: "10px" }}>
              {unreadCount}
            </span>
          )}
          <UserButton />
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div className={`sidebar-drawer${drawerOpen ? " open" : ""}`}>
        <SidebarInner onClose={() => setDrawerOpen(false)} />
      </div>
    </>
  );
}
