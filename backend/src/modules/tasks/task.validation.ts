import { z } from "zod";
import { TaskPriority } from "../../common/constants/taskPriority";
import { TaskStatus } from "../../common/constants/taskStatus";

export const createTaskSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  assignedToId: z.string().min(1, "Assigned user is required"),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime("Invalid date format, use ISO format"),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});