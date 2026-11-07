import { z } from "zod";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";

export const createAppointmentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  assignedStaffId: z.string().min(1, "Staff ID is required"),
  scheduledAt: z.string().datetime("Invalid date format, use ISO format"),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
});