import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { BadRequestError } from "../errors";

export const validate =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const issues = error?.issues || error?.errors || [];
      const message = issues[0]?.message || "Invalid input";
      next(new BadRequestError(message));
    }
  };