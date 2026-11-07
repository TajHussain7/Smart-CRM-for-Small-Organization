import { z } from "zod";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section } from "../../../common/constants/section";

export const createStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  guardianName: z.string().min(2, "Guardian name is required"),
  guardianPhone: z.string().min(10, "Guardian phone is required"),
  classLevel: z.nativeEnum(ClassLevel),
  section: z.nativeEnum(Section),
  monthlyFee: z.number().positive("Monthly fee must be greater than 0"),
  assignedTeacherId: z.string().optional(),
  notes: z.string().optional(),
});