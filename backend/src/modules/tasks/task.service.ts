import { Task } from "./task.model";
import { User } from "../users/user.model";
import { TaskPriority } from "../../common/constants/taskPriority";
import { TaskStatus } from "../../common/constants/taskStatus";
import { NotFoundError, BadRequestError } from "../../common/errors";

interface CreateTaskInput {
  workspaceId: string;
  createdById: string;
  title: string;
  description?: string;
  assignedToId: string;
  priority?: TaskPriority;
  dueDate: string;
}

export const createTask = async (input: CreateTaskInput) => {
  const assignee = await User.findOne({ _id: input.assignedToId, workspaceId: input.workspaceId });
  if (!assignee) {
    throw new NotFoundError("Assigned user not found");
  }

  return Task.create({
    workspaceId: input.workspaceId,
    title: input.title,
    description: input.description,
    assignedToId: input.assignedToId,
    createdById: input.createdById,
    priority: input.priority || TaskPriority.MEDIUM,
    dueDate: new Date(input.dueDate),
  });
};

export const getTasks = async (workspaceId: string) => {
  return Task.find({ workspaceId })
    .populate("assignedToId", "name email")
    .populate("createdById", "name email")
    .sort({ dueDate: 1 });
};

export const getMyTasks = async (workspaceId: string, userId: string) => {
  return Task.find({ workspaceId, assignedToId: userId })
    .populate("createdById", "name email")
    .sort({ dueDate: 1 });
};

export const updateTaskStatus = async (
  workspaceId: string,
  taskId: string,
  newStatus: TaskStatus
) => {
  const task = await Task.findOne({ _id: taskId, workspaceId });
  if (!task) {
    throw new NotFoundError("Task not found");
  }

  if (task.status === TaskStatus.COMPLETED && newStatus !== TaskStatus.COMPLETED) {
    throw new BadRequestError("Cannot change status of an already completed task");
  }

  task.status = newStatus;
  if (newStatus === TaskStatus.COMPLETED) {
    task.completedAt = new Date();
  }
  await task.save();

  return task;
};