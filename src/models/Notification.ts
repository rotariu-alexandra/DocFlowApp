import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: ["info", "success", "warning"],
            default: "info",
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        link: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Notification =
    models.Notification || model("Notification", NotificationSchema);

export default Notification;