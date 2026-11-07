import { Request, Response, NextFunction } from "express";
import { getInteractions } from "./interaction.service";
import { sendSuccess } from "../../common/utils/apiResponse";
import { InteractionEventType } from "../../common/constants/interactionEventType";

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { module, eventType, entityId, page, limit } = req.query as Record<
      string,
      string | undefined
    >;

    const result = await getInteractions(workspaceId, {
      module: module as "school" | "gym" | "barber" | "shared" | undefined,
      eventType: eventType as InteractionEventType | undefined,
      entityId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return sendSuccess(res, 200, "Interactions fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

