import { Request, Response, NextFunction } from "express";
import { getDashboardSummary } from "./dashboard.service";
import { sendSuccess } from "../../../common/utils/apiResponse";
import { generateBarberDashboardPdf } from "../../../common/utils/pdf.service";

export const summary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const data = await getDashboardSummary(workspaceId);
    return sendSuccess(res, 200, "Dashboard summary fetched", data);
  } catch (error) {
    next(error);
  }
};

export const summaryPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const data = await getDashboardSummary(workspaceId);
    generateBarberDashboardPdf(res, data);
  } catch (error) {
    next(error);
  }
};