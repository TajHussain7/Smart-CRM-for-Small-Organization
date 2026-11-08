import { Payment } from "./payment.model";
import { Appointment } from "../appointments/appointment.model";
import { Client } from "../clients/client.model";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";
import { PaymentMethod } from "../../../common/constants/paymentMethod";
import { calculatePointsEarned } from "../../../common/constants/loyaltyConfig";
import { NotFoundError, ConflictError, BadRequestError } from "../../../common/errors";

interface CreatePaymentInput {
  workspaceId: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
}

export const createPayment = async (input: CreatePaymentInput) => {
  const appointment = await Appointment.findOne({
    _id: input.appointmentId,
    workspaceId: input.workspaceId,
  });
  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  if (appointment.status !== AppointmentStatus.IN_PROGRESS) {
    throw new BadRequestError(
      "Payment can only be recorded for an appointment that is IN_PROGRESS"
    );
  }

  const existingPayment = await Payment.findOne({ appointmentId: input.appointmentId });
  if (existingPayment) {
    throw new ConflictError("Payment already recorded for this appointment");
  }

  const payment = await Payment.create({
    workspaceId: input.workspaceId,
    appointmentId: input.appointmentId,
    amount: input.amount,
    method: input.method,
  });

  // Appointment ko COMPLETED mark karo
  appointment.status = AppointmentStatus.COMPLETED;
  await appointment.save();

  // Loyalty points add karo client ko
  const pointsEarned = calculatePointsEarned(input.amount);
  await Client.findByIdAndUpdate(appointment.clientId, { $inc: { loyaltyPoints: pointsEarned } });

  return { payment, pointsEarned };
};

export const getPayments = async (workspaceId: string) => {
  return Payment.find({ workspaceId })
    .populate({
      path: "appointmentId",
      populate: { path: "clientId", select: "name phone" },
    })
    .sort({ paidAt: -1 });
};

export const getDailyRevenue = async (workspaceId: string, date: Date) => {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const result = await Payment.aggregate([
    {
      $match: {
        workspaceId: new (require("mongoose").Types.ObjectId)(workspaceId),
        paidAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalPayments: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalRevenue: 0, totalPayments: 0 };
};