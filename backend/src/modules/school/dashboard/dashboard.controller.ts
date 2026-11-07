import { Request, Response, NextFunction } from "express";
import { getSchoolDashboardSummary } from "./dashboard.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const summary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const data = await getSchoolDashboardSummary(workspaceId);
    return sendSuccess(res, 200, "School dashboard summary fetched", data);
  } catch (error) {
    next(error);
  }
};
