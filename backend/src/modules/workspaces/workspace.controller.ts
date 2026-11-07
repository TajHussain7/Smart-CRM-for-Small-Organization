import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../common/utils/apiResponse";
import { createWorkspace, getMyWorkspace } from "./workspace.service";
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { workspace, accessToken, refreshToken } = await createWorkspace({
      userId,
      ...req.body,
    });
    return sendSuccess(res, 201, "Workspace created", {
      workspace,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};
export const getMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const workspace = await getMyWorkspace(userId);
    return sendSuccess(res, 200, "Workspace fetched", workspace);
  } catch (error) {
    next(error);
  }
};