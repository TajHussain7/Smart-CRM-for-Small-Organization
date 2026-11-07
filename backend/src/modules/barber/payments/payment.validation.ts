import { z } from "zod";
import { PaymentMethod } from "../../../common/constants/paymentMethod";

export const createPaymentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.nativeEnum(PaymentMethod),
});