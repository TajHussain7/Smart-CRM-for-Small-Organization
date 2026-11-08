import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  ownerName: string;
  ownerEmail: string;
  schoolEnabled: boolean;
  gymEnabled: boolean;
  barberEnabled: boolean;
  schoolFeatures: string[];
  gymFeatures: string[];
  barberFeatures: string[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, default: "", trim: true },
    ownerEmail: { type: String, default: "", trim: true, lowercase: true },
    schoolEnabled: { type: Boolean, default: true },
    gymEnabled: { type: Boolean, default: true },
    barberEnabled: { type: Boolean, default: true },
    schoolFeatures: {
      type: [String],
      default: ["students", "teachers", "attendance", "invoices", "schedule", "reports"],
    },
    gymFeatures: {
      type: [String],
      default: ["members", "renewal", "training", "reports"],
    },
    barberFeatures: {
      type: [String],
      default: ["clients", "payments", "appointments", "services", "reports"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.gym = ret.gymEnabled;
        ret.barber = ret.barberEnabled;
        ret.school = ret.schoolEnabled;
        return ret;
      },
    },
  }
);

export const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);
