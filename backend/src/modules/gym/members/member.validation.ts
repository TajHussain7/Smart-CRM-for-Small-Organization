import { z } from "zod";
import { MembershipPlan } from "../../../common/constants/membershipPlan";

export const createMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number is required"),
  plan: z.nativeEnum(MembershipPlan),
  assignedTrainerId: z.string().optional(),
  notes: z.string().optional(),
});