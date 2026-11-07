import { Appointment } from "./appointment.model";
import { Student } from "../../school/students/student.model";
import { User } from "../../users/user.model";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";
import { UserRole } from "../../../common/constants/roles";
import { ConflictError, NotFoundError, BadRequestError } from "../../../common/errors";

const SLOT_BUFFER_MINUTES = 30;
const STUDENT_FIELDS = "name classLevel section guardianName guardianPhone";

interface CreateAppointmentInput {
  workspaceId: string;
  studentId: string;
  assignedStaffId: string;
  scheduledAt: string;
  notes?: string;
}

export const createAppointment = async (input: CreateAppointmentInput) => {
  // Student isi school (workspace) ka hona chahiye
  const student = await Student.findOne({ _id: input.studentId, workspaceId: input.workspaceId });
  if (!student) {
    throw new NotFoundError("Student not found");
  }

  const staff = await User.findOne({ _id: input.assignedStaffId, workspaceId: input.workspaceId });
  if (!staff) {
    throw new NotFoundError("Staff member not found");
  }
  if (staff.role !== UserRole.STAFF && staff.role !== UserRole.ADMIN) {
    throw new BadRequestError("Assigned user is not a valid staff member");
  }

  const requestedTime = new Date(input.scheduledAt);
  const bufferStart = new Date(requestedTime.getTime() - SLOT_BUFFER_MINUTES * 60000);
  const bufferEnd = new Date(requestedTime.getTime() + SLOT_BUFFER_MINUTES * 60000);

  const conflict = await Appointment.findOne({
    workspaceId: input.workspaceId,
    assignedStaffId: input.assignedStaffId,
    status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] },
    scheduledAt: { $gte: bufferStart, $lte: bufferEnd },
  });

  if (conflict) {
    throw new ConflictError(
      `This staff member already has an appointment within ${SLOT_BUFFER_MINUTES} minutes of this time`
    );
  }

  return Appointment.create({
    workspaceId: input.workspaceId,
    studentId: input.studentId,
    assignedStaffId: input.assignedStaffId,
    scheduledAt: requestedTime,
    notes: input.notes,
  });
};

export const getAppointments = async (workspaceId: string) => {
  return Appointment.find({ workspaceId })
    .populate("studentId", STUDENT_FIELDS)
    .populate("assignedStaffId", "name email")
    .sort({ scheduledAt: 1 });
};

export const getAppointmentById = async (workspaceId: string, appointmentId: string) => {
  const appointment = await Appointment.findOne({ _id: appointmentId, workspaceId })
    .populate("studentId", STUDENT_FIELDS)
    .populate("assignedStaffId", "name email");
  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }
  return appointment;
};

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.CONFIRMED]: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.NO_SHOW, AppointmentStatus.CANCELLED],
  [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.NO_SHOW]: [],
  [AppointmentStatus.CANCELLED]: [],
};

export const updateAppointmentStatus = async (
  workspaceId: string,
  appointmentId: string,
  newStatus: AppointmentStatus
) => {
  const appointment = await Appointment.findOne({ _id: appointmentId, workspaceId });
  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  const allowedNext = VALID_TRANSITIONS[appointment.status];
  if (!allowedNext.includes(newStatus)) {
    throw new BadRequestError(`Cannot change status from ${appointment.status} to ${newStatus}`);
  }

  appointment.status = newStatus;
  await appointment.save();
  return appointment;
};