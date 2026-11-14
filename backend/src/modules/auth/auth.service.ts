import { User } from "../users/user.model";
import { Workspace } from "../workspaces/workspace.model";
import { hashPassword, comparePassword } from "../../common/utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt";
import { UserRole } from "../../common/constants/roles";
import { ConflictError, UnauthorizedError } from "../../common/errors";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  businessName: string;
  schoolEnabled?: boolean;
  gymEnabled?: boolean;
  barberEnabled?: boolean;
}

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  const workspace = await Workspace.create({
    name: input.businessName,
    ownerName: input.name,
    ownerEmail: input.email.toLowerCase(),
    schoolEnabled: input.schoolEnabled ?? true,
    gymEnabled: input.gymEnabled ?? true,
    barberEnabled: input.barberEnabled ?? true,
  });

  const hashedPassword = await hashPassword(input.password);

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    password: hashedPassword,
    role: UserRole.ADMIN,
    workspaceId: workspace._id,
  });

  const payload = {
    userId: user._id.toString(),
    workspaceId: workspace._id.toString(),
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { user, workspace, accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const workspace = await Workspace.findById(user.workspaceId);
  if (!workspace) {
    throw new UnauthorizedError("Workspace not found");
  }

  const payload = {
    userId: user._id.toString(),
    workspaceId: user.workspaceId.toString(),
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { user, workspace, accessToken, refreshToken };
};

export const refreshAccessToken = (refreshToken: string) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({
      userId: decoded.userId,
      workspaceId: decoded.workspaceId,
      role: decoded.role,
      isDemo: decoded.isDemo,
    });
    return newAccessToken;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
};

export const loginDemoUser = async () => {
  // Find the designated demo workspace (by isDemo: true or fallback to name DEMO_WORKSPACE)
  let workspace = await Workspace.findOne({ isDemo: true });
  if (!workspace) {
    workspace = await Workspace.findOne({ name: /demo/i });
  }

  if (!workspace) {
    throw new UnauthorizedError("Demo Workspace is not initialized yet. Please seed demo data in MongoDB Atlas.");
  }

  // Find demo admin user or any user in that workspace
  let user = await User.findOne({ workspaceId: workspace._id, role: UserRole.ADMIN });
  if (!user) {
    user = await User.findOne({ workspaceId: workspace._id });
  }

  if (!user) {
    throw new UnauthorizedError("Demo Workspace administrator account not found.");
  }

  const payload = {
    userId: user._id.toString(),
    workspaceId: workspace._id.toString(),
    role: user.role,
    isDemo: true,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { user, workspace, accessToken, refreshToken };
};
