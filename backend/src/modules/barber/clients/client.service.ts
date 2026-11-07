import { Client } from "./client.model";
import { ConflictError, NotFoundError } from "../../../common/errors";

interface CreateClientInput {
  workspaceId: string;
  name: string;
  phone: string;
  notes?: string;
}

export const createClient = async (input: CreateClientInput) => {
  const existing = await Client.findOne({
    workspaceId: input.workspaceId,
    phone: input.phone,
  });

  if (existing) {
    throw new ConflictError("A client with this phone number already exists");
  }

  return Client.create(input);
};

export const getClients = async (workspaceId: string) => {
  // ⚠️ CRITICAL: har query mein workspaceId filter hona zaroori hai
  return Client.find({ workspaceId }).sort({ createdAt: -1 });
};

export const getClientById = async (workspaceId: string, clientId: string) => {
  const client = await Client.findOne({ _id: clientId, workspaceId });
  if (!client) {
    throw new NotFoundError("Client not found");
  }
  return client;
};