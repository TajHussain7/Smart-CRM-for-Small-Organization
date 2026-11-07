import { Request, Response, NextFunction } from "express";
import { createAppointment, getAppointments, getAppointmentById } from "./appointment.service";
import { sendSuccess } from "../../../common/utils/apiResponse";
import { updateAppointmentStatus } from "./appointment.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const appointment = await createAppointment({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Appointment created", appointment);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const appointments = await getAppointments(workspaceId);
    return sendSuccess(res, 200, "Appointments fetched", appointments);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const appointmentId = req.params.id as string;
    const appointment = await getAppointmentById(workspaceId, appointmentId);
    return sendSuccess(res, 200, "Appointment fetched", appointment);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const appointmentId = req.params.id as string;
    const appointment = await updateAppointmentStatus(workspaceId, appointmentId, req.body.status);
    return sendSuccess(res, 200, "Appointment status updated", appointment);
  } catch (error) {
    next(error);
  }
};