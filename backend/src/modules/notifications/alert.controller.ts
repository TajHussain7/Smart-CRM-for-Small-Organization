import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../common/utils/apiResponse";
import {
  getAlerts,
  getUnreadCount,
  markAlertRead,
  markAllAlertsRead,
  retryAlert,
} from "./alert.service";
import { NotificationStatus } from "../../common/constants/notificationStatus";

export const listAlerts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { module, status, read, page, limit } = req.query as Record<
      string,
      string | undefined
    >;

    const result = await getAlerts(workspaceId, {
      module: module as "school" | "gym" | "barber" | undefined,
      status: status as NotificationStatus | undefined,
      read: read !== undefined ? read === "true" : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return sendSuccess(res, 200, "Alerts fetched", result);
  } catch (err) {
    next(err);
  }
};

export const unreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const count = await getUnreadCount(workspaceId);
    return sendSuccess(res, 200, "Unread count fetched", { count });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const alert = await markAlertRead(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "Alert marked as read", alert);
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    await markAllAlertsRead(workspaceId);
    return sendSuccess(res, 200, "All alerts marked as read", null);
  } catch (err) {
    next(err);
  }
};

export const retryAlertById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const alert = await retryAlert(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "Alert retry initiated", alert);
  } catch (err) {
    next(err);
  }
};
