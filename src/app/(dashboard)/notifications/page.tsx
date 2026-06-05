import PageHeader from "@/components/PageHeader";
import NotificationList from "@/components/NotificationList";

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Notifications"
                description="See all notifications"
            />

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
                <NotificationList />
            </div>
        </div>
    );
}