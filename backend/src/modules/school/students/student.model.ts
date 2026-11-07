import mongoose, { Schema, Document, Types } from "mongoose";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section }     from "../../../common/constants/section";

export interface IStudent extends Document {
  workspaceId:       Types.ObjectId;
  studentId:         string;         // "S102" — unique per workspace
  name:              string;
  grade:             string;         // "10th", "9th" (display-friendly)
  classLevel:        ClassLevel;
  section:           Section;
  guardianName:      string;
  guardianPhone:     string;
  guardianEmail?:    string;
  monthlyFee:        number;         // PKR
  feeStatus:         "Paid" | "Pending" | "Overdue";
  admissionDate:     Date;
  assignedTeacherId?: Types.ObjectId;
  notes?:            string;
}

const studentSchema = new Schema<IStudent>(
  {
    workspaceId:       { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    studentId:         { type: String, required: true, trim: true },
    name:              { type: String, required: true, trim: true },
    grade:             { type: String, required: true, trim: true },
    classLevel:        { type: String, enum: Object.values(ClassLevel), required: true },
    section:           { type: String, enum: Object.values(Section),    required: true },
    guardianName:      { type: String, required: true, trim: true },
    guardianPhone:     { type: String, required: true, trim: true },
    guardianEmail:     { type: String, trim: true, lowercase: true },
    monthlyFee:        { type: Number, required: true, min: 0 },
    feeStatus:         { type: String, enum: ["Paid", "Pending", "Overdue"], default: "Pending" },
    admissionDate:     { type: Date, default: Date.now },
    assignedTeacherId: { type: Schema.Types.ObjectId, ref: "Teacher" },
    notes:             { type: String, trim: true },
  },
  { timestamps: true }
);

studentSchema.index({ workspaceId: 1, studentId: 1 }, { unique: true });
studentSchema.index({ workspaceId: 1, guardianPhone: 1 });
studentSchema.index({ workspaceId: 1, classLevel: 1, section: 1 });
studentSchema.index({ workspaceId: 1, feeStatus: 1 });

export const Student = mongoose.model<IStudent>("Student", studentSchema);
