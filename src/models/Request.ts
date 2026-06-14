import mongoose, { Schema, model, models } from "mongoose";

const AttachmentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RequestSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String, required: true },

    requestType: {
      type: String,
      enum: [
        "leave_request",
        "shift_change",
        "certificate",
        "equipment_request",
        "other",
      ],
      required: true,
      default: "other",
    },

    department: {
      type: String,
      enum: [
        "HR",
        "IT",
        "Finance",
        "Legal",
        "Operations",
        "Marketing",
        "Sales",
        "Admin",
        "Management",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["new", "in_progress", "pending_clarification", "approved", "rejected"],
      default: "new",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Request = models.Request || model("Request", RequestSchema);

export default Request;
