import mongoose, { Schema, Document, Types } from "mongoose";
import { NotificationType } from "../../common/constants/notificationType";
import { NotificationChannel } from "../../common/constants/notificationChannel";
import { NotificationStatus } from "../../common/constants/notificationStatus";

export interface INotification extends Document {
  workspaceId: Types.ObjectId;
  module: "school" | "gym" | "barber";
  eventId: string; // unique key for idempotency, e.g. "fee:studentId:month"
  type: NotificationType;
  recipient: string; // name of person
  contact: string; // phone/email
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  read: boolean;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    module: {
      type: String,
      enum: ["school", "gym", "barber"],
      required: true,
    },
    eventId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    recipient: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      default: NotificationChannel.WHATSAPP,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
    },
    read: { type: Boolean, default: false },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

notificationSchema.index({ workspaceId: 1, status: 1 });
notificationSchema.index({ workspaceId: 1, module: 1 });
notificationSchema.index({ workspaceId: 1, read: 1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

