import mongoose, { Schema, Document, Types } from "mongoose";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";

export interface ITrainingSession extends Document {
  workspaceId: Types.ObjectId;
  memberId: Types.ObjectId;
  trainerId: Types.ObjectId;
  scheduledAt: Date;
  status: AppointmentStatus;
  notes?: string;
}

const trainingSessionSchema = new Schema<ITrainingSession>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

trainingSessionSchema.index({ workspaceId: 1, trainerId: 1, scheduledAt: 1 });

export const TrainingSession = mongoose.model<ITrainingSession>(
  "TrainingSession",
  trainingSessionSchema
);