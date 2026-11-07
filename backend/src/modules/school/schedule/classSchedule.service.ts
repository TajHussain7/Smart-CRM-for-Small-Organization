import { ClassSchedule } from "./classSchedule.model";
import { User } from "../../users/user.model";
import { DayOfWeek } from "../../../common/constants/dayOfWeek";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section } from "../../../common/constants/section";
import { NotFoundError, ConflictError } from "../../../common/errors";

interface CreateScheduleInput {
  workspaceId: string;
  classLevel: ClassLevel;
  section: Section;
  subject: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

const timeRangesOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
  return startA < endB && startB < endA;
};

export const createSchedule = async (input: CreateScheduleInput) => {
  const teacher = await User.findOne({ _id: input.teacherId, workspaceId: input.workspaceId });
  if (!teacher) {
    throw new NotFoundError("Teacher not found");
  }

  const teacherConflicts = await ClassSchedule.find({
    workspaceId: input.workspaceId,
    teacherId: input.teacherId,
    dayOfWeek: input.dayOfWeek,
  });

  const hasTeacherConflict = teacherConflicts.some((existing) =>
    timeRangesOverlap(input.startTime, input.endTime, existing.startTime, existing.endTime)
  );

  if (hasTeacherConflict) {
    throw new ConflictError("Teacher already has a class scheduled at this time");
  }

  const classConflicts = await ClassSchedule.find({
    workspaceId: input.workspaceId,
    classLevel: input.classLevel,
    section: input.section,
    dayOfWeek: input.dayOfWeek,
  });

  const hasClassConflict = classConflicts.some((existing) =>
    timeRangesOverlap(input.startTime, input.endTime, existing.startTime, existing.endTime)
  );

  if (hasClassConflict) {
    throw new ConflictError("This class already has a subject scheduled at this time");
  }

  return ClassSchedule.create(input);
};

export const getSchedule = async (workspaceId: string) => {
  return ClassSchedule.find({ workspaceId })
    .populate("teacherId", "name email")
    .sort({ dayOfWeek: 1, startTime: 1 });
};

export const getScheduleByClass = async (
  workspaceId: string,
  classLevel: ClassLevel,
  section: Section
) => {
  return ClassSchedule.find({ workspaceId, classLevel, section })
    .populate("teacherId", "name email")
    .sort({ dayOfWeek: 1, startTime: 1 });
};