import { z } from "zod";

export const requestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requestType: z.string(),
  department: z.string(),
  priority: z.string(),
});