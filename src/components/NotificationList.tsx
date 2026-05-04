"use client";

import { useEffect, useState } from "react";

type NotificationItem = {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
};

export default function NotificationList() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();

            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: "PATCH",
            });

            const data = await res.json();

            if (data.success) {
                await fetchNotifications();
                window.dispatchEvent(new Event("notifications-updated"));
            }
        } catch (error) {
            console.error("Mark as read error:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch(`/api/notifications/read-all`, {
                method: "PATCH",
            });

            const data = await res.json();

            if (data.success) {
                await fetchNotifications();
                window.dispatchEvent(new Event("notifications-updated"));
            }
        } catch (error) {
            console.error("Mark all as read error:", error);
        }
    };

    if (loading) {
        return <p className="text-gray-500 dark:text-gray-400">Loading...</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Mark all as read
                </button>
            </div>

            {notifications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No notifications</p>
            ) : (
                notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className={`rounded-xl border p-4 transition ${notification.isRead
                                ? "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800"
                                : "border-blue-200 bg-white dark:border-blue-900 dark:bg-gray-900"
                            }`}
                    >
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                            {notification.title}
                        </p>

                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {notification.message}
                        </p>

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>
                                {new Date(notification.createdAt).toLocaleString("ro-RO")}
                            </span>

                            {!notification.isRead && (
                                <button
                                    onClick={() => markAsRead(notification._id)}
                                    className="text-blue-600 hover:underline"
                                >
                                    Mark as read
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}