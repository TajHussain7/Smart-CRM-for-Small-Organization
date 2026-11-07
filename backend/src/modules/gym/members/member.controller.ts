import { Request, Response, NextFunction } from "express";
import { createMember, getMembers, getMemberById } from "./member.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const member = await createMember({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Member registered", member);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const members = await getMembers(workspaceId);
    return sendSuccess(res, 200, "Members fetched", members);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const memberId = req.params.id as string;
    const member = await getMemberById(workspaceId, memberId);
    return sendSuccess(res, 200, "Member fetched", member);
  } catch (error) {
    next(error);
  }
};