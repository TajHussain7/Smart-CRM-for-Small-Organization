import { User } from "./user.model";
import { UserRole } from "../../common/constants/roles";
import { hashPassword } from "../../common/utils/password";
import { ConflictError, NotFoundError } from "../../common/errors";

interface CreateUserInput {
  workspaceId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
}

export const getUsers = async (workspaceId: string, role?: UserRole) => {
  const filter: Record<string, unknown> = { workspaceId };
  if (role) filter.role = role;
  return User.find(filter).select("-password").sort({ name: 1 });
};

export const getUserById = async (workspaceId: string, id: string) => {
  const user = await User.findOne({ _id: id, workspaceId }).select("-password");
  if (!user) throw new NotFoundError("User not found");
  return user;
};

export const createUser = async (input: CreateUserInput) => {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new ConflictError("Email already in use");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await User.create({
    workspaceId: input.workspaceId,
    name: input.name,
    email: input.email.toLowerCase(),
    password: hashedPassword,
    role: input.role,
  });

  return User.findById(user._id).select("-password");
};

export const updateUser = async (
  workspaceId: string,
  id: string,
  updates: UpdateUserInput
) => {
  if (updates.email) {
    const conflict = await User.findOne({
      email: updates.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (conflict) throw new ConflictError("Email already in use");
    updates.email = updates.email.toLowerCase();
  }

  const user = await User.findOneAndUpdate(
    { _id: id, workspaceId },
    updates,
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) throw new NotFoundError("User not found");
  return user;
};

export const deleteUser = async (workspaceId: string, id: string) => {
  const user = await User.findOneAndDelete({ _id: id, workspaceId });
  if (!user) throw new NotFoundError("User not found");
  return user;
};

