import { Request, Response, NextFunction } from "express";
import { getGymDashboardSummary } from "./dashboard.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const summary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const data = await getGymDashboardSummary(workspaceId);
    return sendSuccess(res, 200, "Gym dashboard summary fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

