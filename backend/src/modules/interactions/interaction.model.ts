import mongoose, { Schema, Document, Types } from "mongoose";
import { InteractionEventType } from "../../common/constants/interactionEventType";

export interface IInteraction extends Document {
  workspaceId: Types.ObjectId;
  module: "school" | "gym" | "barber" | "shared";
  eventType: InteractionEventType;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const interactionSchema = new Schema<IInteraction>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    module: {
      type: String,
      enum: ["school", "gym", "barber", "shared"],
      default: "shared",
    },
    eventType: {
      type: String,
      enum: Object.values(InteractionEventType),
      required: true,
    },
    entityType: { type: String, required: true },
    entityId: { type: String },
    description: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

interactionSchema.index({ workspaceId: 1, createdAt: -1 });
interactionSchema.index({ workspaceId: 1, entityId: 1 });
interactionSchema.index({ workspaceId: 1, module: 1 });

export const Interaction = mongoose.model<IInteraction>(
  "Interaction",
  interactionSchema
);

