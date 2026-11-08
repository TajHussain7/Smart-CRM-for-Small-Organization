import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(2, "Business / Organization name is required").trim(),
  schoolEnabled: z.boolean().optional(),
  gymEnabled: z.boolean().optional(),
  barberEnabled: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(1, "Password is required"),
});
