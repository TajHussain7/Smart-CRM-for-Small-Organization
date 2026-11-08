import { Request, Response, NextFunction } from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} from "./appointment.service";
import { sendSuccess } from "../../../common/utils/apiResponse";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const appointment = await createAppointment({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Appointment created", appointment);
  } catch (error) {
    next(error);
  }
};

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { date, status, barberId } = req.query as Record<
      string,
      string | undefined
    >;
    const appointments = await getAppointments(workspaceId, {
      date,
      status: status as AppointmentStatus | undefined,
      barberId,
    });
    return sendSuccess(res, 200, "Appointments fetched", appointments);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const appointment = await getAppointmentById(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "Appointment fetched", appointment);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const appointment = await updateAppointmentStatus(
      workspaceId,
      req.params.id as string,
      req.body.status
    );
    return sendSuccess(res, 200, "Appointment status updated", appointment);
  } catch (error) {
    next(error);
  }
};
