import mongoose, { Schema, model, models } from "mongoose";

const RequestSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

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
      enum: ["HR", "IT", "Finance", "Admin", "Management"],
      required: true,
    },

    status: {
      type: String,
      enum: ["new", "in_progress", "approved", "rejected"],
      default: "new",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

const Request = models.Request || model("Request", RequestSchema);

export default Request;