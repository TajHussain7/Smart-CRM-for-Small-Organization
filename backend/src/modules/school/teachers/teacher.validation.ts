import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim(),
  subject: z.string().min(1, "Subject is required").trim(),
  phone: z.string().trim().optional(),
});

export const updateTeacherSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().optional(),
  subject: z.string().min(1).trim().optional(),
  phone: z.string().trim().optional(),
});

