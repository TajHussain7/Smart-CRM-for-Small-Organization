import mongoose, { Schema, Document, Types } from "mongoose";
import { PaymentMethod } from "../../../common/constants/paymentMethod";

export interface IPayment extends Document {
  workspaceId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: Object.values(PaymentMethod), required: true },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

paymentSchema.index({ workspaceId: 1, paidAt: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);