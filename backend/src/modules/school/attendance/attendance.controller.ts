import { Request, Response, NextFunction } from "express";
import {
  markAttendance,
  bulkMarkAttendance,
  getAttendance,
  getAttendanceSummary,
  updateAttendance,
} from "./attendance.service";
import { sendSuccess } from "../../../common/utils/apiResponse";
import { AttendanceStatus } from "../../../common/constants/attendanceStatus";

export const mark = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const markedById = req.user?.userId;
    const attendance = await markAttendance({
      workspaceId,
      markedById,
      ...req.body,
    });
    return sendSuccess(res, 200, "Attendance marked successfully", attendance);
  } catch (error) {
    next(error);
  }
};

export const bulkMark = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const markedById = req.user?.userId;
    const results = await bulkMarkAttendance({
      workspaceId,
      markedById,
      ...req.body,
    });
    return sendSuccess(res, 200, "Attendance records marked successfully", results);
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
    const { studentId, date, status } = req.query as Record<
      string,
      string | undefined
    >;
    const records = await getAttendance(workspaceId, {
      studentId,
      date,
      status: status as AttendanceStatus | undefined,
    });
    return sendSuccess(res, 200, "Attendance records fetched successfully", records);
  } catch (error) {
    next(error);
  }
};

export const summary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const data = await getAttendanceSummary(workspaceId, date);
    return sendSuccess(res, 200, "Attendance summary fetched successfully", data);
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
    const attendance = await updateAttendance(
      workspaceId,
      req.params.id as string,
      req.body
    );
    return sendSuccess(res, 200, "Attendance record updated successfully", attendance);
  } catch (error) {
    next(error);
  }
};
