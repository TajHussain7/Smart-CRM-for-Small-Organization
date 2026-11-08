import { Appointment } from "./appointment.model";
import { Client } from "../clients/client.model";
import { BarberService } from "../services/service.model";
import { User } from "../../users/user.model";
import { Notification } from "../../notifications/notification.model";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";
import { NotificationType } from "../../../common/constants/notificationType";
import { NotificationChannel } from "../../../common/constants/notificationChannel";
import { NotificationStatus } from "../../../common/constants/notificationStatus";
import { ConflictError, NotFoundError, BadRequestError } from "../../../common/errors";

const CLIENT_FIELDS = "name phone email loyaltyMember loyaltyTier";
const SERVICE_FIELDS = "name durationMinutes priceInPaisas";
const BARBER_FIELDS = "name email";

interface CreateAppointmentInput {
  workspaceId: string;
  clientId: string;
  serviceId: string;
  barberId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  notes?: string;
}

interface GetAppointmentsFilter {
  date?: string;
  status?: AppointmentStatus;
  barberId?: string;
}

export const createAppointment = async (input: CreateAppointmentInput) => {
  // Validate client belongs to workspace
  const client = await Client.findOne({
    _id: input.clientId,
    workspaceId: input.workspaceId,
  });
  if (!client) throw new NotFoundError("Client not found");

  // Validate service is active
  const service = await BarberService.findOne({
    _id: input.serviceId,
    workspaceId: input.workspaceId,
    isActive: true,
  });
  if (!service) throw new NotFoundError("Service not found or inactive");

  // Validate barber belongs to workspace
  const barber = await User.findOne({
    _id: input.barberId,
    workspaceId: input.workspaceId,
  });
  if (!barber) throw new NotFoundError("Barber not found");

  // Check slot conflict: same barber, same date, same time
  const conflict = await Appointment.findOne({
    workspaceId: input.workspaceId,
    barberId: input.barberId,
    date: input.date,
    time: input.time,
    status: {
      $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS],
    },
  });

  if (conflict) {
    throw new ConflictError(
      "This barber already has an appointment at this time slot"
    );
  }

  const appointment = await Appointment.create({
    workspaceId: input.workspaceId,
    clientId: input.clientId,
    serviceId: input.serviceId,
    barberId: input.barberId,
    date: input.date,
    time: input.time,
    notes: input.notes,
  });

  // Increment bookings count on the service
  await BarberService.findByIdAndUpdate(service._id, {
    $inc: { bookingsCount: 1 },
  });

  // Queue reminder alert (idempotent via eventId)
  if (client.phone) {
    const eventId = `appt:${appointment._id.toString()}`;
    await Notification.findOneAndUpdate(
      { eventId },
      {
        workspaceId: input.workspaceId,
        module: "barber",
        eventId,
        type: NotificationType.APPOINTMENT_REMINDER,
        recipient: client.name,
        contact: client.phone,
        message: `Hi ${client.name}, your appointment for ${service.name} is scheduled on ${input.date} at ${input.time}. We look forward to seeing you!`,
        channel: NotificationChannel.WHATSAPP,
        status: NotificationStatus.PENDING,
      },
      { upsert: true, new: true }
    );
  }

  return appointment;
};

export const getAppointments = async (
  workspaceId: string,
  filters: GetAppointmentsFilter = {}
) => {
  const filter: Record<string, unknown> = { workspaceId };
  if (filters.date) filter.date = filters.date;
  if (filters.status) filter.status = filters.status;
  if (filters.barberId) filter.barberId = filters.barberId;

  return Appointment.find(filter)
    .populate("clientId", CLIENT_FIELDS)
    .populate("serviceId", SERVICE_FIELDS)
    .populate("barberId", BARBER_FIELDS)
    .sort({ date: 1, time: 1 });
};

export const getAppointmentById = async (
  workspaceId: string,
  appointmentId: string
) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    workspaceId,
  })
    .populate("clientId", CLIENT_FIELDS)
    .populate("serviceId", SERVICE_FIELDS)
    .populate("barberId", BARBER_FIELDS);

  if (!appointment) throw new NotFoundError("Appointment not found");
  return appointment;
};

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.NO_SHOW,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.IN_PROGRESS]: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.NO_SHOW]: [],
  [AppointmentStatus.CANCELLED]: [],
};

export const updateAppointmentStatus = async (
  workspaceId: string,
  appointmentId: string,
  newStatus: AppointmentStatus
) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    workspaceId,
  });
  if (!appointment) throw new NotFoundError("Appointment not found");

  const allowedNext = VALID_TRANSITIONS[appointment.status];
  if (!allowedNext.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot change status from ${appointment.status} to ${newStatus}`
    );
  }

  appointment.status = newStatus;
  await appointment.save();
  return appointment;
};
