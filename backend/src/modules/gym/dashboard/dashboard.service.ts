import mongoose from "mongoose";
import { Member } from "../members/member.model";
import { TrainingSession } from "../sessions/session.model";
import { EXPIRING_SOON_THRESHOLD_DAYS } from "../../../common/constants/membershipStatus";

export const getGymDashboardSummary = async (workspaceId: string) => {
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const now = new Date();
  const soonThreshold = new Date(
    now.getTime() + EXPIRING_SOON_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  );

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  const [
    totalMembers,
    activeMembers,
    expiringSoon,
    expiredCount,
    sessionsToday,
    planBreakdown,
    recentMembers,
  ] = await Promise.all([
    Member.countDocuments({ workspaceId: workspaceObjectId }),
    Member.countDocuments({
      workspaceId: workspaceObjectId,
      expiryDate: { $gte: now },
    }),
    Member.countDocuments({
      workspaceId: workspaceObjectId,
      expiryDate: { $gte: now, $lte: soonThreshold },
    }),
    Member.countDocuments({
      workspaceId: workspaceObjectId,
      expiryDate: { $lt: now },
    }),
    TrainingSession.countDocuments({
      workspaceId: workspaceObjectId,
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
    }),
    Member.aggregate([
      { $match: { workspaceId: workspaceObjectId } },
      { $group: { _id: "$plan", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Member.find({ workspaceId: workspaceObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("membershipId name phone plan expiryDate createdAt"),
  ]);

  return {
    totalMembers,
    activeMembers,
    expiringSoon,
    expiredCount,
    sessionsToday,
    planBreakdown: planBreakdown.map((p) => ({
      plan: p._id,
      count: p.count,
    })),
    recentMembers,
  };
};

