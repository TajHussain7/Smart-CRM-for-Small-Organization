import mongoose, { Schema, Document, Types } from "mongoose";
import { UserRole } from "../../common/constants/roles";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  workspaceId: Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);