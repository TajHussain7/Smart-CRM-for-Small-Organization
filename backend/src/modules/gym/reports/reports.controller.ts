import { Request, Response, NextFunction } from "express";
import { getGymReports, getGymMembersCsv } from "./reports.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const getReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const data = await getGymReports(workspaceId);
    return sendSuccess(res, 200, "Gym reports fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const exportCsv = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const csv = await getGymMembersCsv(workspaceId);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gym-members-${Date.now()}.csv"`
    );
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

