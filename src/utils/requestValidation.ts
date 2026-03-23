import { z } from "zod";

export const requestSchema = z.object({
  title: z
    .string()
    .min(3, "Title must contain at least 3 characters")
    .max(100, "Title too long"),

  description: z
    .string()
    .min(10, "Description must contain at least 10 characters")
    .max(1000, "Description too long"),

  requestType: z.enum([
    "leave_request",
    "shift_change",
    "certificate",
    "equipment_request",
    "other",
  ]),

  department: z.enum(["HR", "IT", "Finance", "Admin", "Management"]),

  priority: z.enum(["low", "medium", "high"]).optional(),
});