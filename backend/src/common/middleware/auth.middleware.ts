import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../errors";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      workspaceId: decoded.workspaceId,
      role: decoded.role as any,
    };
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};