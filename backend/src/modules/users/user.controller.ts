import { Request, Response, NextFunction } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./user.service";
import { sendSuccess } from "../../common/utils/apiResponse";
import { UserRole } from "../../common/constants/roles";

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const role = req.query.role as UserRole | undefined;
    const users = await getUsers(workspaceId, role);
    return sendSuccess(res, 200, "Users fetched successfully", users);
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
    const user = await getUserById(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const user = await createUser({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "User created successfully", user);
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
    const user = await updateUser(workspaceId, req.params.id as string, req.body);
    return sendSuccess(res, 200, "User updated successfully", user);
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
    const user = await deleteUser(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "User deleted successfully", user);
  } catch (error) {
    next(error);
  }
};
