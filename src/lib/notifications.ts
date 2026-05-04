import Notification from "@/models/Notification";

type CreateNotificationParams = {
    userId: string;
    title: string;
    message: string;
    type?: "info" | "success" | "warning";
    link?: string;
};

export async function createNotification({
    userId,
    title,
    message,
    type = "info",
    link = "",
}: CreateNotificationParams) {
    return Notification.create({
        userId,
        title,
        message,
        type,
        link,
    });
}