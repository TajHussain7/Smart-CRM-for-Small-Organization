import { Request, Response, NextFunction } from "express";
import { createSession, getSessions, updateSessionStatus } from "./session.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const session = await createSession({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Training session booked", session);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const sessions = await getSessions(workspaceId);
    return sendSuccess(res, 200, "Sessions fetched", sessions);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const sessionId = req.params.id as string;
    const session = await updateSessionStatus(workspaceId, sessionId, req.body.status);
    return sendSuccess(res, 200, "Session status updated", session);
  } catch (error) {
    next(error);
  }
};