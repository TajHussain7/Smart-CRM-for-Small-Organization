import mongoose, { Schema, Document, Types } from "mongoose";
import { InvoiceStatus } from "../../../common/constants/invoiceStatus";

export interface IInvoice extends Document {
  workspaceId: Types.ObjectId;
  studentId: Types.ObjectId;
  invoiceNumber: string;
  month: number;
  year: number;
  amountDue: number;
  amountPaid: number;
  status: InvoiceStatus;
  dueDate: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amountDue: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: Object.values(InvoiceStatus), default: InvoiceStatus.PENDING },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ workspaceId: 1, studentId: 1, month: 1, year: 1 }, { unique: true });

export const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);