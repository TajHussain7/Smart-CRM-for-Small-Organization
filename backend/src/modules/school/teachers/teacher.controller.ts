import { Request, Response, NextFunction } from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "./teacher.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const teacher = await createTeacher({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Teacher created successfully", teacher);
  } catch (error) {
    next(error);
  }
};

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const search = req.query.search as string | undefined;
    const teachers = await getTeachers(workspaceId, search);
    return sendSuccess(res, 200, "Teachers fetched successfully", teachers);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const teacher = await getTeacherById(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "Teacher fetched successfully", teacher);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const teacher = await updateTeacher(workspaceId, req.params.id as string, req.body);
    return sendSuccess(res, 200, "Teacher updated successfully", teacher);
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const teacher = await deleteTeacher(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "Teacher deleted successfully", teacher);
  } catch (error) {
    next(error);
  }
};
