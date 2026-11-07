import { Teacher } from "./teacher.model";
import { ConflictError, NotFoundError } from "../../../common/errors";

interface CreateTeacherInput {
  workspaceId: string;
  name: string;
  email: string;
  subject: string;
  phone?: string;
}

interface UpdateTeacherInput {
  name?: string;
  email?: string;
  subject?: string;
  phone?: string;
}

export const createTeacher = async (input: CreateTeacherInput) => {
  const existing = await Teacher.findOne({
    workspaceId: input.workspaceId,
    email: input.email.toLowerCase(),
  });
  if (existing) {
    throw new ConflictError("A teacher with this email already exists");
  }

  return Teacher.create({
    ...input,
    email: input.email.toLowerCase(),
  });
};

export const getTeachers = async (
  workspaceId: string,
  search?: string
) => {
  const filter: Record<string, unknown> = { workspaceId };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
    ];
  }
  return Teacher.find(filter).sort({ name: 1 });
};

export const getTeacherById = async (
  workspaceId: string,
  teacherId: string
) => {
  const teacher = await Teacher.findOne({ _id: teacherId, workspaceId });
  if (!teacher) throw new NotFoundError("Teacher not found");
  return teacher;
};

export const updateTeacher = async (
  workspaceId: string,
  teacherId: string,
  updates: UpdateTeacherInput
) => {
  if (updates.email) {
    const conflict = await Teacher.findOne({
      workspaceId,
      email: updates.email.toLowerCase(),
      _id: { $ne: teacherId },
    });
    if (conflict) {
      throw new ConflictError("A teacher with this email already exists");
    }
    updates.email = updates.email.toLowerCase();
  }

  const teacher = await Teacher.findOneAndUpdate(
    { _id: teacherId, workspaceId },
    updates,
    { new: true, runValidators: true }
  );
  if (!teacher) throw new NotFoundError("Teacher not found");
  return teacher;
};

export const deleteTeacher = async (
  workspaceId: string,
  teacherId: string
) => {
  const teacher = await Teacher.findOneAndDelete({
    _id: teacherId,
    workspaceId,
  });
  if (!teacher) throw new NotFoundError("Teacher not found");
  return teacher;
};

