import { Request, Response, NextFunction } from "express";
import { createClient, getClients, getClientById } from "./client.service";
import { sendSuccess } from "../../../common/utils/apiResponse";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const client = await createClient({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Client created", client);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const clients = await getClients(workspaceId);
    return sendSuccess(res, 200, "Clients fetched", clients);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const client = await getClientById(workspaceId, req.params.id);
    return sendSuccess(res, 200, "Client fetched", client);
  } catch (error) {
    next(error);
  }
};