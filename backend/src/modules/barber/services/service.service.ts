import { BarberService } from "./service.model";
import { ConflictError, NotFoundError } from "../../../common/errors";

interface CreateServiceInput {
  workspaceId: string;
  name: string;
  durationMinutes: number;
  priceInPaisas: number;
}

interface UpdateServiceInput {
  name?: string;
  durationMinutes?: number;
  priceInPaisas?: number;
}

export const createService = async (input: CreateServiceInput) => {
  const existing = await BarberService.findOne({
    workspaceId: input.workspaceId,
    name: input.name,
  });
  if (existing) {
    throw new ConflictError("A service with this name already exists");
  }
  return BarberService.create(input);
};

export const getServices = async (workspaceId: string, activeOnly = true) => {
  const filter: Record<string, unknown> = { workspaceId };
  if (activeOnly) filter.isActive = true;
  return BarberService.find(filter).sort({ name: 1 });
};

export const getServiceById = async (
  workspaceId: string,
  serviceId: string
) => {
  const service = await BarberService.findOne({
    _id: serviceId,
    workspaceId,
  });
  if (!service) throw new NotFoundError("Service not found");
  return service;
};

export const updateService = async (
  workspaceId: string,
  serviceId: string,
  updates: UpdateServiceInput
) => {
  if (updates.name) {
    const conflict = await BarberService.findOne({
      workspaceId,
      name: updates.name,
      _id: { $ne: serviceId },
    });
    if (conflict) throw new ConflictError("A service with this name already exists");
  }

  const service = await BarberService.findOneAndUpdate(
    { _id: serviceId, workspaceId },
    updates,
    { new: true, runValidators: true }
  );
  if (!service) throw new NotFoundError("Service not found");
  return service;
};

export const deactivateService = async (
  workspaceId: string,
  serviceId: string
) => {
  const service = await BarberService.findOneAndUpdate(
    { _id: serviceId, workspaceId },
    { isActive: false },
    { new: true }
  );
  if (!service) throw new NotFoundError("Service not found");
  return service;
};

