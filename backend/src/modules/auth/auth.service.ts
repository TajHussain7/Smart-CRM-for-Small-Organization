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

  const payload = {
    userId: user._id.toString(),
    workspaceId: user.workspaceId.toString(),
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = (refreshToken: string) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({
      userId: decoded.userId,
      workspaceId: decoded.workspaceId,
      role: decoded.role,
    });
    return newAccessToken;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
};
