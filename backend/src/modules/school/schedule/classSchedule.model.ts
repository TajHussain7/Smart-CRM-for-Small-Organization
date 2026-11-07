import mongoose, { Schema, Document, Types } from "mongoose";
import { DayOfWeek } from "../../../common/constants/dayOfWeek";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section } from "../../../common/constants/section";

export interface IClassSchedule extends Document {
  workspaceId: Types.ObjectId;
  classLevel: ClassLevel;
  section: Section;
  subject: string;
  teacherId: Types.ObjectId;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

const classScheduleSchema = new Schema<IClassSchedule>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    classLevel: { type: String, enum: Object.values(ClassLevel), required: true },
    section: { type: String, enum: Object.values(Section), required: true },
    subject: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dayOfWeek: { type: String, enum: Object.values(DayOfWeek), required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

classScheduleSchema.index({ workspaceId: 1, teacherId: 1, dayOfWeek: 1 });
classScheduleSchema.index({ workspaceId: 1, classLevel: 1, section: 1, dayOfWeek: 1 });

export const ClassSchedule = mongoose.model<IClassSchedule>("ClassSchedule", classScheduleSchema);