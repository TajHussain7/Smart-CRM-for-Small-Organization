import { Request, Response, NextFunction } from "express";
import {
  generateFollowUpRecommendation,
  generateOperationalSummary,
} from "./ai.service";
import { sendSuccess } from "../../common/utils/apiResponse";

export const followUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await generateFollowUpRecommendation(req.body);
    return sendSuccess(res, 200, "Follow-up recommendation generated", result);
  } catch (error) {
    next(error);
  }
};

export const operationalSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { moduleName, stats } = req.body;
    const result = await generateOperationalSummary(
      moduleName || "organization",
      stats || {}
    );
    return sendSuccess(res, 200, "Operational summary generated", result);
  } catch (error) {
    next(error);
  }
};

