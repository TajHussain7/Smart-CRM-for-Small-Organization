import mongoose, { Schema, Document, Types } from "mongoose";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section } from "../../../common/constants/section";

export interface IStudent extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  guardianName: string;
  guardianPhone: string;
  classLevel: ClassLevel;
  section: Section;
  monthlyFee: number;
  assignedTeacherId?: Types.ObjectId;
  notes?: string;
}

const studentSchema = new Schema<IStudent>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true, trim: true },
    guardianName: { type: String, required: true, trim: true },
    guardianPhone: { type: String, required: true, trim: true },
    classLevel: { type: String, enum: Object.values(ClassLevel), required: true },
    section: { type: String, enum: Object.values(Section), required: true },
    monthlyFee: { type: Number, required: true, min: 0 },
    assignedTeacherId: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

studentSchema.index({ workspaceId: 1, guardianPhone: 1 });
studentSchema.index({ workspaceId: 1, classLevel: 1, section: 1 });

export const Student = mongoose.model<IStudent>("Student", studentSchema);