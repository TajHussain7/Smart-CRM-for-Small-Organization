import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required").trim(),
  durationMinutes: z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes"),
  priceInPaisas: z
    .number()
    .int()
    .min(0, "Price cannot be negative"),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).trim().optional(),
  durationMinutes: z.number().int().min(5).optional(),
  priceInPaisas: z.number().int().min(0).optional(),
});
