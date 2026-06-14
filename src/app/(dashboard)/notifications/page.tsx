import PageHeader from "@/components/PageHeader";
import NotificationList from "@/components/NotificationList";

export default function NotificationsPage() {
    return (
        <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
            <PageHeader title="Notifications" description="Your activity feed" />
            <div className="card">
                <NotificationList />
            </div>
        </div>
    );
}
