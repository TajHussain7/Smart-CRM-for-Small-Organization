import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITeacher extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

teacherSchema.index({ workspaceId: 1, email: 1 }, { unique: true });
teacherSchema.index({ workspaceId: 1 });

export const Teacher = mongoose.model<ITeacher>("Teacher", teacherSchema);

