import mongoose from "mongoose";
import { Payment } from "../payments/payment.model";
import { BarberService } from "../services/service.model";
import { Client } from "../clients/client.model";
import { Appointment } from "../appointments/appointment.model";
import { User } from "../../users/user.model";
import { BadRequestError } from "../../../common/errors";

export const getBarberReports = async (workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new BadRequestError("Invalid workspace ID");
  }

  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    todayRevenueResult,
    revenueTrend,
    topServices,
    loyaltyMembersCount,
    totalClients,
  ] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          workspaceId: workspaceObjectId,
          paidAt: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          workspaceId: workspaceObjectId,
          paidAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
          },
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    BarberService.find({ workspaceId: workspaceObjectId })
      .sort({ bookingsCount: -1 })
      .limit(5)
      .select("name durationMinutes priceInPaisas bookingsCount"),
    Client.countDocuments({
      workspaceId: workspaceObjectId,
      loyaltyMember: true,
    }),
    Client.countDocuments({ workspaceId: workspaceObjectId }),
  ]);

  return {
    todayRevenue: todayRevenueResult[0]?.totalRevenue ?? 0,
    todayTransactions: todayRevenueResult[0]?.count ?? 0,
    sevenDayRevenueTrend: revenueTrend.map((r) => ({
      date: r._id,
      revenue: r.revenue,
      transactions: r.transactions,
    })),
    topServices,
    loyaltyMembersCount,
    totalClients,
  };
};

export const getBarberPaymentsCsv = async (workspaceId: string) => {
  // Ensure Appointment and User models are registered for nested populate
  void Appointment;
  void User;

  const payments = await Payment.find({ workspaceId })
    .populate({
      path: "appointmentId",
      populate: [
        { path: "clientId", select: "name phone" },
        { path: "serviceId", select: "name priceInPaisas" },
        { path: "barberId", select: "name" },
      ],
    })
    .sort({ paidAt: -1 });

  const headers = [
    "Payment ID",
    "Client Name",
    "Client Phone",
    "Barber",
    "Service",
    "Amount",
    "Payment Method",
    "Paid At",
  ];

  const rows = payments.map((p) => {
    const appt = p.appointmentId as any;
    const clientName = appt?.clientId?.name ?? "N/A";
    const clientPhone = appt?.clientId?.phone ?? "N/A";
    const barberName = appt?.barberId?.name ?? "N/A";
    const serviceName = appt?.serviceId?.name ?? "N/A";

    return [
      `"${p._id}"`,
      `"${String(clientName).replace(/"/g, '""')}"`,
      `"${String(clientPhone).replace(/"/g, '""')}"`,
      `"${String(barberName).replace(/"/g, '""')}"`,
      `"${String(serviceName).replace(/"/g, '""')}"`,
      `"${p.amount}"`,
      `"${p.method}"`,
      `"${p.paidAt ? p.paidAt.toISOString() : ""}"`,
    ];
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
};
