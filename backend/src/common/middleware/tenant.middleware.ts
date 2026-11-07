import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors";

export const attachTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.workspaceId) {
    return next(new UnauthorizedError("Workspace context missing"));
  }
  next();
};