import { z } from "zod";

export const createSessionSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  trainerId: z.string().min(1, "Trainer ID is required"),
  scheduledAt: z.string().datetime("Invalid date format, use ISO format"),
  notes: z.string().optional(),
});