import mongoose, { Schema, Document, Types } from "mongoose";

export interface IClient extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  phone: string;
  loyaltyPoints: number;
  notes?: string;
}

const clientSchema = new Schema<IClient>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

clientSchema.index({ workspaceId: 1, phone: 1 }, { unique: true });

export const Client = mongoose.model<IClient>("Client", clientSchema);