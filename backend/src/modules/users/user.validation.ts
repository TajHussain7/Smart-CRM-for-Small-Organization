import { z } from "zod";
import { UserRole } from "../../common/constants/roles";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole).default(UserRole.STAFF),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

