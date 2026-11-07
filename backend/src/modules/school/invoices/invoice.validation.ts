import { z } from "zod";
import { PaymentMethod } from "../../../common/constants/paymentMethod";

export const generateInvoicesSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.nativeEnum(PaymentMethod),
});