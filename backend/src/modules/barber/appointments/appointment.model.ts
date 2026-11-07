import mongoose, { Schema, Document, Types } from "mongoose";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";

export interface IAppointment extends Document {
  workspaceId: Types.ObjectId;
  studentId: Types.ObjectId;
  assignedStaffId: Types.ObjectId;
  scheduledAt: Date;
  status: AppointmentStatus;
  notes?: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    assignedStaffId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.CONFIRMED,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

appointmentSchema.index({ workspaceId: 1, assignedStaffId: 1, scheduledAt: 1 });
appointmentSchema.index({ workspaceId: 1, studentId: 1 });

export const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);