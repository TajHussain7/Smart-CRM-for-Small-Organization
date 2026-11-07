import { z } from "zod";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";

export const createAppointmentSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  barberId: z.string().min(1, "Barber ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
});
