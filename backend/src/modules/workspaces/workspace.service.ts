import { Workspace } from "./workspace.model";
import { User } from "../users/user.model";
import { signAccessToken, signRefreshToken } from "../../common/utils/jwt";
import { ConflictError, NotFoundError } from "../../common/errors";

interface CreateWorkspaceInput {
  userId: string;
  name: string;
  ownerName?: string;
  ownerEmail?: string;
  schoolEnabled?: boolean;
  school?: boolean;
  gymEnabled?: boolean;
  gym?: boolean;
  barberEnabled?: boolean;
  barber?: boolean;
}

interface UpdateWorkspaceInput {
  name?: string;
  ownerName?: string;
  ownerEmail?: string;
  schoolEnabled?: boolean;
  school?: boolean;
  gymEnabled?: boolean;
  gym?: boolean;
  barberEnabled?: boolean;
  barber?: boolean;
  schoolFeatures?: string[];
  gymFeatures?: string[];
  features?: string[];
  barberFeatures?: string[];
}

export const createWorkspace = async (input: CreateWorkspaceInput) => {
  const user = await User.findById(input.userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.workspaceId) {
    throw new ConflictError("You already have a workspace");
  }

  const schoolEnabled = input.schoolEnabled ?? input.school ?? true;
  const gymEnabled = input.gymEnabled ?? input.gym ?? true;
  const barberEnabled = input.barberEnabled ?? input.barber ?? true;

  const workspace = await Workspace.create({
    name: input.name,
    ownerName: input.ownerName || user.name || "",
    ownerEmail: input.ownerEmail || user.email || "",
    schoolEnabled,
    gymEnabled,
    barberEnabled,
  });

  await User.findByIdAndUpdate(input.userId, { workspaceId: workspace._id });

  const payload = {
    userId: input.userId,
    workspaceId: workspace._id.toString(),
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { workspace, accessToken, refreshToken };
};

export const getMyWorkspace = async (workspaceId?: string, userId?: string) => {
  let targetId = workspaceId;

  if (!targetId && userId) {
    const user = await User.findById(userId);
    targetId = user?.workspaceId?.toString();
  }

  if (!targetId) {
    throw new NotFoundError("No workspace found for this user");
  }

  const workspace = await Workspace.findById(targetId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }

  return workspace;
};

export const updateWorkspace = async (
  workspaceId: string,
  updates: UpdateWorkspaceInput
) => {
  const updatePayload: Record<string, unknown> = { ...updates };

  if (updates.school !== undefined && updates.schoolEnabled === undefined) {
    updatePayload.schoolEnabled = updates.school;
  }
  if (updates.gym !== undefined && updates.gymEnabled === undefined) {
    updatePayload.gymEnabled = updates.gym;
  }
  if (updates.barber !== undefined && updates.barberEnabled === undefined) {
    updatePayload.barberEnabled = updates.barber;
  }
  if (updates.features && !updates.gymFeatures) {
    updatePayload.gymFeatures = updates.features;
  }
  if (updates.ownerEmail) {
    updatePayload.ownerEmail = updates.ownerEmail.toLowerCase();
  }

  const workspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    updatePayload,
    { new: true, runValidators: true }
  );

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }

  return workspace;
};
