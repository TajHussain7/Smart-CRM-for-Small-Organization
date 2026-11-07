import { Request, Response, NextFunction } from "express";
import {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  renewMembership,
} from "./member.service";
import { sendSuccess } from "../../../common/utils/apiResponse";
import { MembershipPlan } from "../../../common/constants/membershipPlan";
import { MembershipStatus } from "../../../common/constants/membershipStatus";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const member = await createMember({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Member registered successfully", member);
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
    const { plan, status, search } = req.query as Record<
      string,
      string | undefined
    >;
    const members = await getMembers(workspaceId, {
      plan: plan as MembershipPlan | undefined,
      status: status as MembershipStatus | undefined,
      search,
    });
    return sendSuccess(res, 200, "Members fetched successfully", members);
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
    const memberId = req.params.id as string;
    const member = await getMemberById(workspaceId, memberId);
    return sendSuccess(res, 200, "Member fetched successfully", member);
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
    const memberId = req.params.id as string;
    const member = await updateMember(workspaceId, memberId, req.body);
    return sendSuccess(res, 200, "Member updated successfully", member);
  } catch (error) {
    next(error);
  }
};

export const renew = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const memberId = req.params.id as string;
    const member = await renewMembership(
      workspaceId,
      memberId,
      req.body.plan
    );
    return sendSuccess(res, 200, "Membership renewed successfully", member);
  } catch (error) {
    next(error);
  }
};
