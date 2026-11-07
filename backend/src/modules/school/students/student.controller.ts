import { Request, Response, NextFunction } from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "./student.service";
import { sendSuccess } from "../../../common/utils/apiResponse";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section } from "../../../common/constants/section";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const student = await createStudent({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Student registered successfully", student);
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
    const { grade, classLevel, section, feeStatus, search } =
      req.query as Record<string, string | undefined>;

    const students = await getStudents(workspaceId, {
      grade,
      classLevel: classLevel as ClassLevel | undefined,
      section: section as Section | undefined,
      feeStatus: feeStatus as "Paid" | "Pending" | "Overdue" | undefined,
      search,
    });
    return sendSuccess(res, 200, "Students fetched successfully", students);
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
    const student = await getStudentById(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "Student fetched successfully", student);
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
    const student = await updateStudent(workspaceId, req.params.id as string, req.body);
    return sendSuccess(res, 200, "Student updated successfully", student);
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
    const student = await deleteStudent(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "Student deleted successfully", student);
  } catch (error) {
    next(error);
  }
};
