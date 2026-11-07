import mongoose, { Schema, Document, Types } from "mongoose";
import { AttendanceStatus } from "../../../common/constants/attendanceStatus";

export interface IAttendance extends Document {
  workspaceId: Types.ObjectId;
  studentId: Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  markedById?: Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    markedById: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// One record per student per day per workspace
attendanceSchema.index(
  { workspaceId: 1, studentId: 1, date: 1 },
  { unique: true }
);
attendanceSchema.index({ workspaceId: 1, date: 1 });

export const Attendance = mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);

