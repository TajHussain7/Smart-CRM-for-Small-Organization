import { Member } from "./member.model";
import { User } from "../../users/user.model";
import { MembershipPlan, PLAN_DURATION_DAYS } from "../../../common/constants/membershipPlan";
import { ConflictError, NotFoundError } from "../../../common/errors";

interface CreateMemberInput {
  workspaceId: string;
  name: string;
  phone: string;
  plan: MembershipPlan;
  assignedTrainerId?: string;
  notes?: string;
}

export const createMember = async (input: CreateMemberInput) => {
  const existing = await Member.findOne({ workspaceId: input.workspaceId, phone: input.phone });
  if (existing) {
    throw new ConflictError("A member with this phone number already exists");
  }

  if (input.assignedTrainerId) {
    const trainer = await User.findOne({ _id: input.assignedTrainerId, workspaceId: input.workspaceId });
    if (!trainer) {
      throw new NotFoundError("Trainer not found");
    }
  }

  const startDate = new Date();
  const durationDays = PLAN_DURATION_DAYS[input.plan];
  const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  return Member.create({
    workspaceId: input.workspaceId,
    name: input.name,
    phone: input.phone,
    plan: input.plan,
    startDate,
    expiryDate,
    assignedTrainerId: input.assignedTrainerId,
    notes: input.notes,
  });
};

export const getMembers = async (workspaceId: string) => {
  return Member.find({ workspaceId }).populate("assignedTrainerId", "name email").sort({ createdAt: -1 });
};

export const getMemberById = async (workspaceId: string, memberId: string) => {
  const member = await Member.findOne({ _id: memberId, workspaceId }).populate(
    "assignedTrainerId",
    "name email"
  );
  if (!member) {
    throw new NotFoundError("Member not found");
  }
  return member;
};