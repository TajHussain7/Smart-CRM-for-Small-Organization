import mongoose, { Schema, Document, Types } from "mongoose";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";

export interface IAppointment extends Document {
  workspaceId: Types.ObjectId;
  clientId: Types.ObjectId;
  serviceId: Types.ObjectId;
  barberId: Types.ObjectId;
  date: string;   // "YYYY-MM-DD"
  time: string;   // "HH:MM" (24h)
  status: AppointmentStatus;
  notes?: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    clientId:    { type: Schema.Types.ObjectId, ref: "Client",    required: true },
    serviceId:   { type: Schema.Types.ObjectId, ref: "BarberService", required: true },
    barberId:    { type: Schema.Types.ObjectId, ref: "User",      required: true },
    date:   { type: String, required: true },
    time:   { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.CONFIRMED,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

appointmentSchema.index({ workspaceId: 1, barberId: 1, date: 1, time: 1 });
appointmentSchema.index({ workspaceId: 1, clientId: 1 });
appointmentSchema.index({ workspaceId: 1, date: 1, status: 1 });

export const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);
