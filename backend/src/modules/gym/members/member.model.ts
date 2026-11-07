import mongoose, { Schema, Document, Types } from "mongoose";
import { MembershipPlan } from "../../../common/constants/membershipPlan";

export interface IMember extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  phone: string;
  plan: MembershipPlan;
  startDate: Date;
  expiryDate: Date;
  assignedTrainerId?: Types.ObjectId;
  notes?: string;
}

const memberSchema = new Schema<IMember>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    plan: { type: String, enum: Object.values(MembershipPlan), required: true },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    assignedTrainerId: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

memberSchema.index({ workspaceId: 1, phone: 1 }, { unique: true });
memberSchema.index({ workspaceId: 1, expiryDate: 1 }); // "expiring soon" query fast karne ke liye

export const Member = mongoose.model<IMember>("Member", memberSchema);