import { TrainingSession } from "./session.model";
import { Member } from "../members/member.model";
import { User } from "../../users/user.model";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";
import { UserRole } from "../../../common/constants/roles";
import { ConflictError, NotFoundError, BadRequestError } from "../../../common/errors";

const SLOT_BUFFER_MINUTES = 45; // gym session thodi lambi hoti hai barber visit se

interface CreateSessionInput {
  workspaceId: string;
  memberId: string;
  trainerId: string;
  scheduledAt: string;
  notes?: string;
}

export const createSession = async (input: CreateSessionInput) => {
  const member = await Member.findOne({ _id: input.memberId, workspaceId: input.workspaceId });
  if (!member) {
    throw new NotFoundError("Member not found");
  }

  if (member.expiryDate < new Date()) {
    throw new BadRequestError("Cannot book a session — member's plan has expired");
  }

  const trainer = await User.findOne({ _id: input.trainerId, workspaceId: input.workspaceId });
  if (!trainer) {
    throw new NotFoundError("Trainer not found");
  }
  if (trainer.role !== UserRole.STAFF && trainer.role !== UserRole.ADMIN) {
    throw new BadRequestError("Assigned user is not a valid trainer");
  }

  const requestedTime = new Date(input.scheduledAt);
  const bufferStart = new Date(requestedTime.getTime() - SLOT_BUFFER_MINUTES * 60000);
  const bufferEnd = new Date(requestedTime.getTime() + SLOT_BUFFER_MINUTES * 60000);

  const conflict = await TrainingSession.findOne({
    workspaceId: input.workspaceId,
    trainerId: input.trainerId,
    status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] },
    scheduledAt: { $gte: bufferStart, $lte: bufferEnd },
  });

  if (conflict) {
    throw new ConflictError(
      `This trainer already has a session within ${SLOT_BUFFER_MINUTES} minutes of this time`
    );
  }

  return TrainingSession.create({
    workspaceId: input.workspaceId,
    memberId: input.memberId,
    trainerId: input.trainerId,
    scheduledAt: requestedTime,
    notes: input.notes,
  });
};

export const getSessions = async (workspaceId: string) => {
  return TrainingSession.find({ workspaceId })
    .populate("memberId", "name phone")
    .populate("trainerId", "name email")
    .sort({ scheduledAt: 1 });
};

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.CONFIRMED]: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.NO_SHOW, AppointmentStatus.CANCELLED],
  [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.NO_SHOW]: [],
  [AppointmentStatus.CANCELLED]: [],
};

export const updateSessionStatus = async (
  workspaceId: string,
  sessionId: string,
  newStatus: AppointmentStatus
) => {
  const session = await TrainingSession.findOne({ _id: sessionId, workspaceId });
  if (!session) {
    throw new NotFoundError("Session not found");
  }

  const allowedNext = VALID_TRANSITIONS[session.status];
  if (!allowedNext.includes(newStatus)) {
    throw new BadRequestError(`Cannot change status from ${session.status} to ${newStatus}`);
  }

  session.status = newStatus;
  await session.save();
  return session;
};