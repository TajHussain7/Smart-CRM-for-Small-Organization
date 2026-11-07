import { Request, Response, NextFunction } from "express";
import { getBarberReports, getBarberPaymentsCsv } from "./reports.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const getReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const data = await getBarberReports(workspaceId);
    return sendSuccess(res, 200, "Barber reports fetched successfully", data);
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
    const csv = await getBarberPaymentsCsv(workspaceId);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="barber-payments-${Date.now()}.csv"`
    );
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

