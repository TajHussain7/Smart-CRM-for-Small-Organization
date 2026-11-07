import { Request, Response, NextFunction } from "express";
import { createStudent, getStudents, getStudentById } from "./student.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const student = await createStudent({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Student registered", student);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const students = await getStudents(workspaceId);
    return sendSuccess(res, 200, "Students fetched", students);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const studentId = req.params.id as string;
    const student = await getStudentById(workspaceId, studentId);
    return sendSuccess(res, 200, "Student fetched", student);
  } catch (error) {
    next(error);
  }
};