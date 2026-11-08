import { Appointment } from "../appointments/appointment.model";
import { getDailyRevenue } from "../payments/payment.service";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";
import { Workspace } from "../../workspaces/workspace.model";
import mongoose from "mongoose";

export const getDashboardSummary = async (workspaceId: string) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const appointmentCount = await Appointment.countDocuments({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
    date: todayStr,
    status: { $ne: AppointmentStatus.CANCELLED },
  });

  const revenue = await getDailyRevenue(workspaceId, new Date());
  const workspace = await Workspace.findById(workspaceId);

  return {
    date: todayStr,
    todayAppointments: appointmentCount,
    todayRevenue: revenue.totalRevenue,
    todayCompletedPayments: revenue.totalPayments,
    workspaceName: workspace?.name || "Barber Shop",
  };
};
