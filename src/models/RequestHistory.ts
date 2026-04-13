import mongoose, { Schema, model, models } from "mongoose";

const RequestHistorySchema = new Schema(
    {
        requestId: {
            type: String,
            required: true,
        },

        action: {
            type: String,
            enum: ["created", "updated", "status_changed", "deleted"],
            required: true,
        },

        performedBy: {
            type: String,
            required: true,
        },

        performedByRole: {
            type: String,
            default: "employee",
        },

        details: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

const RequestHistory =
    models.RequestHistory || model("RequestHistory", RequestHistorySchema);

export default RequestHistory;