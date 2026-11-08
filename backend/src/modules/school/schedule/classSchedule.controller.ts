import { Request, Response, NextFunction } from "express";
import { createSchedule, getSchedule, getScheduleByClass } from "./classSchedule.service";
import { sendSuccess } from "../../../common/utils/apiResponse";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section } from "../../../common/constants/section";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const schedule = await createSchedule({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Class scheduled", schedule);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const schedule = await getSchedule(workspaceId);
    return sendSuccess(res, 200, "Schedule fetched", schedule);
  } catch (error) {
    next(error);
  }
};

export const listByClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const classLevel = req.params.classLevel as ClassLevel;
    const section = req.params.section as Section;
    const schedule = await getScheduleByClass(workspaceId, classLevel, section);
    return sendSuccess(res, 200, "Class schedule fetched", schedule);
  } catch (error) {
    next(error);
  }
};