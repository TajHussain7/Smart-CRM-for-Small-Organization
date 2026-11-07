import { z } from "zod";
import { AttendanceStatus } from "../../../common/constants/attendanceStatus";

export const markAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  status: z.nativeEnum(AttendanceStatus),
  note: z.string().trim().optional(),
});

export const bulkMarkAttendanceSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  records: z
    .array(
      z.object({
        studentId: z.string().min(1, "Student ID is required"),
        status: z.nativeEnum(AttendanceStatus),
        note: z.string().trim().optional(),
      })
    )
    .min(1, "At least one attendance record is required"),
});

export const updateAttendanceSchema = z.object({
  status: z.nativeEnum(AttendanceStatus).optional(),
  note: z.string().trim().optional(),
});

