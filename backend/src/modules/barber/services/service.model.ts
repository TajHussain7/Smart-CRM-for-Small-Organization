import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBarberService extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  durationMinutes: number;
  priceInPaisas: number;   // PKR stored as paisas (like cents)
  bookingsCount: number;
  isActive: boolean;
}

const barberServiceSchema = new Schema<IBarberService>(
  {
    workspaceId:     { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name:            { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 5 },
    priceInPaisas:   { type: Number, required: true, min: 0 },
    bookingsCount:   { type: Number, default: 0, min: 0 },
    isActive:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

barberServiceSchema.index({ workspaceId: 1, isActive: 1 });
barberServiceSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

export const BarberService = mongoose.model<IBarberService>("BarberService", barberServiceSchema);

