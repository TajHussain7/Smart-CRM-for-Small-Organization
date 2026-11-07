import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters"),
});