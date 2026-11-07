import mongoose, { Schema, Document } from "mongoose";
export interface IWorkspace extends Document {
  name: string;
  createdAt: Date;
}
const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);