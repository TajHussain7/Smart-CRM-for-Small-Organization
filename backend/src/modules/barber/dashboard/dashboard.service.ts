import { Appointment } from "../appointments/appointment.model";
import { getDailyRevenue } from "../payments/payment.service";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";
import { Workspace } from "../../workspaces/workspace.model";
import mongoose from "mongoose";

export const getDashboardSummary = async (workspaceId: string) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const appointmentCount = await Appointment.countDocuments({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
    scheduledAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: AppointmentStatus.CANCELLED },
  });

  const revenue = await getDailyRevenue(workspaceId, new Date());
  const workspace = await Workspace.findById(workspaceId);

  return {
    date: startOfDay.toISOString().split("T")[0],
    todayAppointments: appointmentCount,
    todayRevenue: revenue.totalRevenue,
    todayCompletedPayments: revenue.totalPayments,
    workspaceName: workspace?.name || "Barber Shop",
  };
};