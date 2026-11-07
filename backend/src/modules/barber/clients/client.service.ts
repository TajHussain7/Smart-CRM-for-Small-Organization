import { Client } from "./client.model";
import { ConflictError, NotFoundError } from "../../../common/errors";
import { getLoyaltyTier } from "../../../common/constants/loyaltyConfig";

interface CreateClientInput {
  workspaceId: string;
  name: string;
  phone: string;
  email: string;
  primaryServiceId?: string;
  loyaltyMember?: boolean;
  style?: string;
  preferences?: string[];
  notes?: string;
}

interface UpdateClientInput {
  name?: string;
  phone?: string;
  email?: string;
  primaryServiceId?: string;
  loyaltyMember?: boolean;
  loyaltyPoints?: number;
  style?: string;
  preferences?: string[];
  notes?: string;
}

interface GetClientsFilter {
  serviceId?: string;
  loyaltyMember?: boolean;
  search?: string;
}

export const createClient = async (input: CreateClientInput) => {
  const existingPhone = await Client.findOne({
    workspaceId: input.workspaceId,
    phone: input.phone,
  });
  if (existingPhone) {
    throw new ConflictError("A client with this phone number already exists");
  }

  const existingEmail = await Client.findOne({
    workspaceId: input.workspaceId,
    email: input.email.toLowerCase(),
  });
  if (existingEmail) {
    throw new ConflictError("A client with this email already exists");
  }

  return Client.create({
    ...input,
    email: input.email.toLowerCase(),
    loyaltyPoints: 0,
    loyaltyTier: "SILVER",
  });
};

export const getClients = async (
  workspaceId: string,
  filters: GetClientsFilter = {}
) => {
  const filter: Record<string, unknown> = { workspaceId };

  if (filters.serviceId) {
    filter.primaryServiceId = filters.serviceId;
  }
  if (filters.loyaltyMember !== undefined) {
    filter.loyaltyMember = filters.loyaltyMember;
  }
  if (filters.search) {
    filter.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  return Client.find(filter)
    .populate("primaryServiceId", "name durationMinutes priceInPaisas")
    .sort({ createdAt: -1 });
};

export const getClientById = async (workspaceId: string, clientId: string) => {
  const client = await Client.findOne({
    _id: clientId,
    workspaceId,
  }).populate("primaryServiceId", "name durationMinutes priceInPaisas");

  if (!client) throw new NotFoundError("Client not found");
  return client;
};

export const updateClient = async (
  workspaceId: string,
  clientId: string,
  updates: UpdateClientInput
) => {
  if (updates.phone) {
    const conflict = await Client.findOne({
      workspaceId,
      phone: updates.phone,
      _id: { $ne: clientId },
    });
    if (conflict) {
      throw new ConflictError("A client with this phone number already exists");
    }
  }

  if (updates.email) {
    const conflict = await Client.findOne({
      workspaceId,
      email: updates.email.toLowerCase(),
      _id: { $ne: clientId },
    });
    if (conflict) {
      throw new ConflictError("A client with this email already exists");
    }
    updates.email = updates.email.toLowerCase();
  }

  if (updates.loyaltyPoints !== undefined) {
    (updates as Record<string, unknown>).loyaltyTier = getLoyaltyTier(
      updates.loyaltyPoints
    );
  }

  const client = await Client.findOneAndUpdate(
    { _id: clientId, workspaceId },
    updates,
    { new: true, runValidators: true }
  ).populate("primaryServiceId", "name durationMinutes priceInPaisas");

  if (!client) throw new NotFoundError("Client not found");
  return client;
};
