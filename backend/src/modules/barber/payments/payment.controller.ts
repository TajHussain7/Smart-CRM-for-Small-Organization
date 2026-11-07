import { Request, Response, NextFunction } from "express";
import { createPayment, getPayments } from "./payment.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const result = await createPayment({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Payment recorded", result);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const payments = await getPayments(workspaceId);
    return sendSuccess(res, 200, "Payments fetched", payments);
  } catch (error) {
    next(error);
  }
};
