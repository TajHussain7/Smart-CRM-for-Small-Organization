import { Member } from "./member.model";
import { User } from "../../users/user.model";
import { Notification } from "../../notifications/notification.model";
import {
  MembershipPlan,
  PLAN_DURATION_DAYS,
} from "../../../common/constants/membershipPlan";
import {
  MembershipStatus,
  getMembershipStatus,
} from "../../../common/constants/membershipStatus";
import { NotificationType } from "../../../common/constants/notificationType";
import { NotificationChannel } from "../../../common/constants/notificationChannel";
import { NotificationStatus } from "../../../common/constants/notificationStatus";
import { generateUniqueMembershipId } from "../../../common/utils/membershipId";
import { ConflictError, NotFoundError } from "../../../common/errors";

interface CreateMemberInput {
  workspaceId: string;
  name: string;
  phone: string;
  email?: string;
  plan: MembershipPlan;
  classes?: string[];
  assignedTrainerId?: string;
  notes?: string;
}

interface UpdateMemberInput {
  name?: string;
  phone?: string;
  email?: string;
  plan?: MembershipPlan;
  classes?: string[];
  assignedTrainerId?: string;
  notes?: string;
}

interface GetMembersFilters {
  plan?: MembershipPlan;
  status?: MembershipStatus;
  search?: string;
}

export const createMember = async (input: CreateMemberInput) => {
  const existing = await Member.findOne({
    workspaceId: input.workspaceId,
    phone: input.phone,
  });
  if (existing) {
    throw new ConflictError("A member with this phone number already exists");
  }

  if (input.assignedTrainerId) {
    const trainer = await User.findOne({
      _id: input.assignedTrainerId,
      workspaceId: input.workspaceId,
    });
    if (!trainer) {
      throw new NotFoundError("Trainer not found");
    }
  }

  const membershipId = await generateUniqueMembershipId(
    input.workspaceId,
    Member
  );

  const startDate = new Date();
  const durationDays = PLAN_DURATION_DAYS[input.plan];
  const expiryDate = new Date(
    startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
  );

  const member = await Member.create({
    workspaceId: input.workspaceId,
    membershipId,
    name: input.name,
    phone: input.phone,
    email: input.email?.toLowerCase(),
    plan: input.plan,
    startDate,
    expiryDate,
    classes: input.classes ?? [],
    assignedTrainerId: input.assignedTrainerId,
    notes: input.notes,
  });

  return {
    ...member.toObject(),
    status: getMembershipStatus(member.expiryDate),
  };
};

export const getMembers = async (
  workspaceId: string,
  filters: GetMembersFilters = {}
) => {
  const query: Record<string, unknown> = { workspaceId };
  if (filters.plan) query.plan = filters.plan;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
      { membershipId: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  const members = await Member.find(query)
    .populate("assignedTrainerId", "name email")
    .sort({ createdAt: -1 });

  const mapped = members.map((member) => ({
    ...member.toObject(),
    status: getMembershipStatus(member.expiryDate),
  }));

  if (filters.status) {
    return mapped.filter((m) => m.status === filters.status);
  }

  return mapped;
};

export const getMemberById = async (workspaceId: string, memberId: string) => {
  const member = await Member.findOne({ _id: memberId, workspaceId }).populate(
    "assignedTrainerId",
    "name email"
  );
  if (!member) {
    throw new NotFoundError("Member not found");
  }
  return {
    ...member.toObject(),
    status: getMembershipStatus(member.expiryDate),
  };
};

export const updateMember = async (
  workspaceId: string,
  memberId: string,
  updates: UpdateMemberInput
) => {
  if (updates.phone) {
    const existing = await Member.findOne({
      workspaceId,
      phone: updates.phone,
      _id: { $ne: memberId },
    });
    if (existing) {
      throw new ConflictError("A member with this phone number already exists");
    }
  }

  if (updates.assignedTrainerId) {
    const trainer = await User.findOne({
      _id: updates.assignedTrainerId,
      workspaceId,
    });
    if (!trainer) {
      throw new NotFoundError("Trainer not found");
    }
  }

  if (updates.email) {
    updates.email = updates.email.toLowerCase();
  }

  const member = await Member.findOneAndUpdate(
    { _id: memberId, workspaceId },
    updates,
    { new: true, runValidators: true }
  ).populate("assignedTrainerId", "name email");

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  return {
    ...member.toObject(),
    status: getMembershipStatus(member.expiryDate),
  };
};

export const renewMembership = async (
  workspaceId: string,
  memberId: string,
  plan: MembershipPlan
) => {
  const member = await Member.findOne({ _id: memberId, workspaceId });
  if (!member) {
    throw new NotFoundError("Member not found");
  }

  const now = new Date();
  const baseDate = member.expiryDate > now ? member.expiryDate : now;
  const durationDays = PLAN_DURATION_DAYS[plan];
  const newExpiryDate = new Date(
    baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000
  );

  member.plan = plan;
  member.expiryDate = newExpiryDate;
  await member.save();

  // Create notification for renewal
  const eventId = `renew:${member._id.toString()}:${newExpiryDate.getTime()}`;
  await Notification.findOneAndUpdate(
    { eventId },
    {
      workspaceId,
      module: "gym",
      eventId,
      type: NotificationType.MEMBERSHIP_REMINDER,
      recipient: member.name,
      contact: member.phone,
      message: `Dear ${member.name}, your gym membership (${plan}) has been successfully renewed until ${newExpiryDate.toISOString().split("T")[0]}.`,
      channel: NotificationChannel.WHATSAPP,
      status: NotificationStatus.PENDING,
    },
    { upsert: true, new: true }
  );

  return {
    ...member.toObject(),
    status: getMembershipStatus(member.expiryDate),
  };
};
