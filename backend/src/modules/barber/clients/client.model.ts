import mongoose, { Schema, Document, Types } from "mongoose";

export interface IClient extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  primaryServiceId?: Types.ObjectId;
  loyaltyMember: boolean;
  loyaltyPoints: number;
  loyaltyTier: string;
  style?: string;
  preferences: string[];
  notes?: string;
  lastVisit?: Date;
  since: Date;
}

const clientSchema = new Schema<IClient>(
  {
    workspaceId:      { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name:             { type: String, required: true, trim: true },
    phone:            { type: String, required: true, trim: true },
    email:            { type: String, required: true, trim: true, lowercase: true },
    primaryServiceId: { type: Schema.Types.ObjectId, ref: "BarberService" },
    loyaltyMember:    { type: Boolean, default: false },
    loyaltyPoints:    { type: Number,  default: 0, min: 0 },
    loyaltyTier:      { type: String,  default: "SILVER" },
    style:            { type: String,  trim: true },
    preferences:      { type: [String], default: [] },
    notes:            { type: String,  trim: true },
    lastVisit:        { type: Date },
    since:            { type: Date, default: Date.now },
  },
  { timestamps: true }
);

clientSchema.index({ workspaceId: 1, phone: 1 }, { unique: true });
clientSchema.index({ workspaceId: 1, email: 1 }, { unique: true });
clientSchema.index({ workspaceId: 1, loyaltyMember: 1 });

export const Client = mongoose.model<IClient>("Client", clientSchema);
