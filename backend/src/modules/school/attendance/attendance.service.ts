import { Attendance } from "./attendance.model";
import { Student } from "../students/student.model";
import { Notification } from "../../notifications/notification.model";
import { AttendanceStatus } from "../../../common/constants/attendanceStatus";
import { NotificationType } from "../../../common/constants/notificationType";
import { NotificationChannel } from "../../../common/constants/notificationChannel";
import { NotificationStatus } from "../../../common/constants/notificationStatus";
import { NotFoundError } from "../../../common/errors";

interface MarkAttendanceInput {
  workspaceId: string;
  markedById?: string;
  studentId: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  note?: string;
}

interface BulkMarkAttendanceInput {
  workspaceId: string;
  markedById?: string;
  date: string;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    note?: string;
  }>;
}

interface GetAttendanceFilters {
  studentId?: string;
  date?: string;
  status?: AttendanceStatus;
}

export const markAttendance = async (input: MarkAttendanceInput) => {
  const student = await Student.findOne({
    _id: input.studentId,
    workspaceId: input.workspaceId,
  });
  if (!student) {
    throw new NotFoundError("Student not found");
  }

  const attendance = await Attendance.findOneAndUpdate(
    {
      workspaceId: input.workspaceId,
      studentId: input.studentId,
      date: input.date,
    },
    {
      status: input.status,
      markedById: input.markedById,
      note: input.note,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("studentId", "name studentId grade classLevel section");

  // If student is absent, optionally queue alert for guardian
  if (input.status === AttendanceStatus.ABSENT && student.guardianPhone) {
    const eventId = `att-absent:${student._id.toString()}:${input.date}`;
    await Notification.findOneAndUpdate(
      { eventId },
      {
        workspaceId: input.workspaceId,
        module: "school",
        eventId,
        type: NotificationType.ATTENDANCE_ALERT,
        recipient: student.guardianName,
        contact: student.guardianPhone,
        message: `Dear ${student.guardianName}, your child ${student.name} was marked absent on ${input.date}. Please contact the school office if you have any questions.`,
        channel: NotificationChannel.WHATSAPP,
        status: NotificationStatus.PENDING,
      },
      { upsert: true, new: true }
    );
  }

  return attendance;
};

export const bulkMarkAttendance = async (input: BulkMarkAttendanceInput) => {
  const results = [];
  for (const record of input.records) {
    const item = await markAttendance({
      workspaceId: input.workspaceId,
      markedById: input.markedById,
      date: input.date,
      studentId: record.studentId,
      status: record.status,
      note: record.note,
    });
    results.push(item);
  }
  return results;
};

export const getAttendance = async (
  workspaceId: string,
  filters: GetAttendanceFilters = {}
) => {
  const query: Record<string, unknown> = { workspaceId };
  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.date) query.date = filters.date;
  if (filters.status) query.status = filters.status;

  return Attendance.find(query)
    .populate("studentId", "name studentId grade classLevel section guardianPhone")
    .populate("markedById", "name email")
    .sort({ date: -1 });
};

export const getAttendanceSummary = async (
  workspaceId: string,
  date: string
) => {
  const records = await Attendance.find({ workspaceId, date });
  const totalStudents = await Student.countDocuments({ workspaceId });

  const summary = {
    date,
    totalStudents,
    markedCount: records.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  };

  records.forEach((rec) => {
    if (rec.status === AttendanceStatus.PRESENT) summary.present++;
    else if (rec.status === AttendanceStatus.ABSENT) summary.absent++;
    else if (rec.status === AttendanceStatus.LATE) summary.late++;
    else if (rec.status === AttendanceStatus.EXCUSED) summary.excused++;
  });

  return summary;
};

export const updateAttendance = async (
  workspaceId: string,
  id: string,
  updates: { status?: AttendanceStatus; note?: string }
) => {
  const attendance = await Attendance.findOneAndUpdate(
    { _id: id, workspaceId },
    updates,
    { new: true }
  ).populate("studentId", "name studentId grade classLevel section");

  if (!attendance) {
    throw new NotFoundError("Attendance record not found");
  }
  return attendance;
};

