import { z } from "zod";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section } from "../../../common/constants/section";

export const createStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required").trim(),
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  grade: z.string().min(1, "Grade is required").trim(),
  classLevel: z.nativeEnum(ClassLevel),
  section: z.nativeEnum(Section),
  guardianName: z.string().min(2, "Guardian name is required").trim(),
  guardianPhone: z.string().min(10, "Guardian phone is required").trim(),
  guardianEmail: z.string().email("Invalid guardian email").trim().optional(),
  monthlyFee: z.number().min(0, "Monthly fee cannot be negative"),
  feeStatus: z.enum(["Paid", "Pending", "Overdue"]).optional(),
  admissionDate: z.string().optional(),
  assignedTeacherId: z.string().optional(),
  notes: z.string().trim().optional(),
});

export const updateStudentSchema = z.object({
  name: z.string().min(2).trim().optional(),
  grade: z.string().min(1).trim().optional(),
  classLevel: z.nativeEnum(ClassLevel).optional(),
  section: z.nativeEnum(Section).optional(),
  guardianName: z.string().min(2).trim().optional(),
  guardianPhone: z.string().min(10).trim().optional(),
  guardianEmail: z.string().email().trim().optional(),
  monthlyFee: z.number().min(0).optional(),
  feeStatus: z.enum(["Paid", "Pending", "Overdue"]).optional(),
  admissionDate: z.string().optional(),
  assignedTeacherId: z.string().optional(),
  notes: z.string().trim().optional(),
});
