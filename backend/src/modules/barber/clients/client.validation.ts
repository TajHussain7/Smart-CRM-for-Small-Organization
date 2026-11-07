import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  phone: z.string().min(10, "Phone number must be at least 10 characters").trim(),
  email: z.string().email("Invalid email address").trim(),
  primaryServiceId: z.string().optional(),
  loyaltyMember: z.boolean().optional(),
  style: z.string().optional(),
  preferences: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(2).trim().optional(),
  phone: z.string().min(10).trim().optional(),
  email: z.string().email().trim().optional(),
  primaryServiceId: z.string().optional(),
  loyaltyMember: z.boolean().optional(),
  loyaltyPoints: z.number().int().min(0).optional(),
  style: z.string().optional(),
  preferences: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
