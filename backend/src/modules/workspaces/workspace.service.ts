import { Workspace } from "./workspace.model";
import { User } from "../users/user.model";
import { signAccessToken, signRefreshToken } from "../../common/utils/jwt";
import { ConflictError, NotFoundError } from "../../common/errors";

interface CreateWorkspaceInput {
  userId: string;
  name: string;
}

export const createWorkspace = async (input: CreateWorkspaceInput) => {
  const user = await User.findById(input.userId);

  if (user?.workspaceId) {
    throw new ConflictError("You already have a workspace");
  }

  const workspace = await Workspace.create({ name: input.name });

  await User.findByIdAndUpdate(input.userId, { workspaceId: workspace._id });

  const payload = {
    userId: input.userId,
    workspaceId: workspace._id.toString(),
    role: user!.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { workspace, accessToken, refreshToken };
};

export const getMyWorkspace = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user?.workspaceId) {
    throw new NotFoundError("No workspace found for this user");
  }

  const workspace = await Workspace.findById(user.workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }

  return workspace;
};