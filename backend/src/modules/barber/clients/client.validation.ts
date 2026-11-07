import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number is required"),
  notes: z.string().optional(),
});