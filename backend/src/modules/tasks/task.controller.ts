import { Request, Response, NextFunction } from "express";
import { createTask, getTasks, getMyTasks, updateTaskStatus } from "./task.service";
import { sendSuccess } from "../../common/utils/apiResponse";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const createdById = req.user!.userId;
    const task = await createTask({ workspaceId, createdById, ...req.body });
    return sendSuccess(res, 201, "Task created", task);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const tasks = await getTasks(workspaceId);
    return sendSuccess(res, 200, "Tasks fetched", tasks);
  } catch (error) {
    next(error);
  }
};

export const listMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const userId = req.user!.userId;
    const tasks = await getMyTasks(workspaceId, userId);
    return sendSuccess(res, 200, "My tasks fetched", tasks);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const taskId = req.params.id as string;
    const task = await updateTaskStatus(workspaceId, taskId, req.body.status);
    return sendSuccess(res, 200, "Task status updated", task);
  } catch (error) {
    next(error);
  }
};