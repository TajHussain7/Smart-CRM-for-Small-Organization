import { z } from "zod";
import { DayOfWeek } from "../../../common/constants/dayOfWeek";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section } from "../../../common/constants/section";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createScheduleSchema = z
  .object({
    classLevel: z.nativeEnum(ClassLevel),
    section: z.nativeEnum(Section),
    subject: z.string().min(1, "Subject is required"),
    teacherId: z.string().min(1, "Teacher ID is required"),
    dayOfWeek: z.nativeEnum(DayOfWeek),
    startTime: z.string().regex(timeRegex, "Invalid time format, use HH:mm"),
    endTime: z.string().regex(timeRegex, "Invalid time format, use HH:mm"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });