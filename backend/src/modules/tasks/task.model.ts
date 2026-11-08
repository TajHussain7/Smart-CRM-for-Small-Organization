import mongoose, { Schema, Document, Types } from "mongoose";
import { TaskPriority } from "../../common/constants/taskPriority";
import { TaskStatus } from "../../common/constants/taskStatus";

export interface ITask extends Document {
  workspaceId: Types.ObjectId;
  title: string;
  description?: string;
  assignedToId: Types.ObjectId;
  createdById: Types.ObjectId;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  completedAt?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedToId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM },
    status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING },
    dueDate: { type: Date, required: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ workspaceId: 1, assignedToId: 1, status: 1 });
taskSchema.index({ workspaceId: 1, dueDate: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);