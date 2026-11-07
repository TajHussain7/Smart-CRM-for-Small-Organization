import mongoose, { Schema, Document, Types } from "mongoose";
import { PaymentMethod } from "../../../common/constants/paymentMethod";

export interface IFeePayment extends Document {
  workspaceId: Types.ObjectId;
  invoiceId: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  receiptNumber: string;
  paidAt: Date;
}

const feePaymentSchema = new Schema<IFeePayment>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: Object.values(PaymentMethod), required: true },
    receiptNumber: { type: String, required: true, unique: true },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FeePayment = mongoose.model<IFeePayment>("FeePayment", feePaymentSchema);