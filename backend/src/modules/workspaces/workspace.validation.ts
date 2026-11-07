import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").trim(),
  ownerName: z.string().trim().optional(),
  ownerEmail: z.string().email("Invalid email").trim().optional(),
  schoolEnabled: z.boolean().optional(),
  school: z.boolean().optional(),
  gymEnabled: z.boolean().optional(),
  gym: z.boolean().optional(),
  barberEnabled: z.boolean().optional(),
  barber: z.boolean().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).trim().optional(),
  ownerName: z.string().trim().optional(),
  ownerEmail: z.string().email("Invalid email").trim().optional(),
  schoolEnabled: z.boolean().optional(),
  school: z.boolean().optional(),
  gymEnabled: z.boolean().optional(),
  gym: z.boolean().optional(),
  barberEnabled: z.boolean().optional(),
  barber: z.boolean().optional(),
  schoolFeatures: z.array(z.string()).optional(),
  gymFeatures: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  barberFeatures: z.array(z.string()).optional(),
});
