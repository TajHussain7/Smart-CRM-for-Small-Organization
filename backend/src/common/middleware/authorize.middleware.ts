import { Request, Response, NextFunction } from "express";
import { UserRole } from "../constants/roles";
import { ForbiddenError } from "../errors";

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ForbiddenError("You do not have permission to perform this action")
      );
    }
    next();
  };
};

