import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../common/utils/apiResponse";
import {
  createWorkspace,
  getMyWorkspace,
  updateWorkspace,
} from "./workspace.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { workspace, accessToken, refreshToken } = await createWorkspace({
      userId,
      ...req.body,
    });
    return sendSuccess(res, 201, "Workspace created successfully", {
      workspace,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getMine = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.userId;
    const workspace = await getMyWorkspace(workspaceId, userId);
    return sendSuccess(res, 200, "Workspace fetched successfully", workspace);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const workspace = await updateWorkspace(workspaceId, req.body);
    return sendSuccess(res, 200, "Workspace updated successfully", workspace);
  } catch (error) {
    next(error);
  }
};
