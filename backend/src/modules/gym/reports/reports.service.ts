import mongoose from "mongoose";
import { Member } from "../members/member.model";
import { TrainingSession } from "../sessions/session.model";

export const getGymReports = async (workspaceId: string) => {
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalMembers,
    newSignups30Days,
    activeMembers,
    planBreakdown,
    monthlySessions,
  ] = await Promise.all([
    Member.countDocuments({ workspaceId: workspaceObjectId }),
    Member.countDocuments({
      workspaceId: workspaceObjectId,
      createdAt: { $gte: thirtyDaysAgo },
    }),
    Member.countDocuments({
      workspaceId: workspaceObjectId,
      expiryDate: { $gte: now },
    }),
    Member.aggregate([
      { $match: { workspaceId: workspaceObjectId } },
      { $group: { _id: "$plan", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    TrainingSession.aggregate([
      { $match: { workspaceId: workspaceObjectId } },
      {
        $group: {
          _id: {
            year: { $year: "$scheduledAt" },
            month: { $month: "$scheduledAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]),
  ]);

  return {
    totalMembers,
    newSignups30Days,
    activeMembers,
    planBreakdown: planBreakdown.map((p) => ({ plan: p._id, count: p.count })),
    monthlySessions: monthlySessions.map((s) => ({
      year: s._id.year,
      month: s._id.month,
      sessions: s.count,
    })),
  };
};

export const getGymMembersCsv = async (workspaceId: string) => {
  const members = await Member.find({ workspaceId }).sort({ createdAt: -1 });

  const headers = [
    "Membership ID",
    "Name",
    "Phone",
    "Email",
    "Plan",
    "Start Date",
    "Expiry Date",
  ];

  const rows = members.map((m) => [
    `"${m.membershipId}"`,
    `"${m.name.replace(/"/g, '""')}"`,
    `"${m.phone}"`,
    `"${m.email ?? ""}"`,
    `"${m.plan}"`,
    `"${m.startDate.toISOString().split("T")[0]}"`,
    `"${m.expiryDate.toISOString().split("T")[0]}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
};

