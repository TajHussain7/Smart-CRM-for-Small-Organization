import { Interaction } from "./interaction.model";
import { InteractionEventType } from "../../common/constants/interactionEventType";

interface LogInteractionInput {
  workspaceId: string;
  module: "school" | "gym" | "barber" | "shared";
  eventType: InteractionEventType;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

interface GetInteractionsOptions {
  module?: "school" | "gym" | "barber" | "shared";
  eventType?: InteractionEventType;
  entityId?: string;
  page?: number;
  limit?: number;
}

export const logInteraction = async (input: LogInteractionInput) => {
  return Interaction.create(input);
};

export const getInteractions = async (
  workspaceId: string,
  options: GetInteractionsOptions = {}
) => {
  const { module, eventType, entityId, page = 1, limit = 20 } = options;

  const query: Record<string, unknown> = { workspaceId };
  if (module) query.module = module;
  if (eventType) query.eventType = eventType;
  if (entityId) query.entityId = entityId;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Interaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Interaction.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

