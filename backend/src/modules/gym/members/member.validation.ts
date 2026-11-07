import { z } from "zod";
import { MembershipPlan } from "../../../common/constants/membershipPlan";
import { MembershipStatus } from "../../../common/constants/membershipStatus";

export const createMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  phone: z.string().min(10, "Phone number is required").trim(),
  email: z.string().email("Invalid email address").trim().optional(),
  plan: z.nativeEnum(MembershipPlan),
  classes: z.array(z.string()).optional(),
  assignedTrainerId: z.string().optional(),
  notes: z.string().trim().optional(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(2).trim().optional(),
  phone: z.string().min(10).trim().optional(),
  email: z.string().email().trim().optional(),
  plan: z.nativeEnum(MembershipPlan).optional(),
  classes: z.array(z.string()).optional(),
  assignedTrainerId: z.string().optional(),
  notes: z.string().trim().optional(),
});

export const renewMemberSchema = z.object({
  plan: z.nativeEnum(MembershipPlan),
});
