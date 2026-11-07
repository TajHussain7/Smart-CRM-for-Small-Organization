import { Request, Response, NextFunction } from "express";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deactivateService,
} from "./service.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const service = await createService({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Service created", service);
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
    const activeOnly = req.query.all !== "true";
    const services = await getServices(workspaceId, activeOnly);
    return sendSuccess(res, 200, "Services fetched", services);
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
    const service = await getServiceById(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "Service fetched", service);
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
    const service = await updateService(
      workspaceId,
      req.params.id as string,
      req.body
    );
    return sendSuccess(res, 200, "Service updated", service);
  } catch (error) {
    next(error);
  }
};

export const deactivate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const service = await deactivateService(workspaceId, req.params.id as string);
    return sendSuccess(res, 200, "Service deactivated", service);
  } catch (error) {
    next(error);
  }
};
