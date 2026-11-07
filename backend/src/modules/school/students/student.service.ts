import mongoose from "mongoose";
import { Student } from "./student.model";
import { Teacher } from "../teachers/teacher.model";
import { ClassLevel } from "../../../common/constants/classLevel";
import { Section } from "../../../common/constants/section";
import { ConflictError, NotFoundError } from "../../../common/errors";

interface CreateStudentInput {
  workspaceId: string;
  studentId: string;
  name: string;
  grade: string;
  classLevel: ClassLevel;
  section: Section;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  monthlyFee: number;
  feeStatus?: "Paid" | "Pending" | "Overdue";
  admissionDate?: Date;
  assignedTeacherId?: string;
  notes?: string;
}

interface UpdateStudentInput {
  name?: string;
  grade?: string;
  classLevel?: ClassLevel;
  section?: Section;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  monthlyFee?: number;
  feeStatus?: "Paid" | "Pending" | "Overdue";
  assignedTeacherId?: string;
  notes?: string;
}

interface GetStudentsFilters {
  grade?: string;
  classLevel?: ClassLevel;
  section?: Section;
  feeStatus?: "Paid" | "Pending" | "Overdue";
  search?: string;
}

export const createStudent = async (input: CreateStudentInput) => {
  const existing = await Student.findOne({
    workspaceId: input.workspaceId,
    studentId: input.studentId,
  });
  if (existing) {
    throw new ConflictError("A student with this Student ID already exists in this workspace");
  }

  if (input.assignedTeacherId) {
    const teacher = await Teacher.findOne({
      _id: input.assignedTeacherId,
      workspaceId: input.workspaceId,
    });
    if (!teacher) {
      throw new NotFoundError("Assigned teacher not found");
    }
  }

  return Student.create({
    ...input,
    guardianEmail: input.guardianEmail?.toLowerCase(),
  });
};

export const getStudents = async (
  workspaceId: string,
  filters: GetStudentsFilters = {}
) => {
  const query: Record<string, unknown> = { workspaceId };
  if (filters.grade) query.grade = filters.grade;
  if (filters.classLevel) query.classLevel = filters.classLevel;
  if (filters.section) query.section = filters.section;
  if (filters.feeStatus) query.feeStatus = filters.feeStatus;

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { studentId: { $regex: filters.search, $options: "i" } },
      { guardianName: { $regex: filters.search, $options: "i" } },
      { guardianPhone: { $regex: filters.search, $options: "i" } },
    ];
  }

  return Student.find(query)
    .populate("assignedTeacherId", "name email subject")
    .sort({ createdAt: -1 });
};

export const getStudentById = async (workspaceId: string, idOrStudentId: string) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(idOrStudentId);
  const query = isObjectId
    ? {
        workspaceId,
        $or: [{ _id: idOrStudentId }, { studentId: idOrStudentId }],
      }
    : { workspaceId, studentId: idOrStudentId };

  const student = await Student.findOne(query).populate(
    "assignedTeacherId",
    "name email subject"
  );

  if (!student) {
    throw new NotFoundError("Student not found");
  }
  return student;
};

export const updateStudent = async (
  workspaceId: string,
  id: string,
  updates: UpdateStudentInput
) => {
  if (updates.assignedTeacherId) {
    const teacher = await Teacher.findOne({
      _id: updates.assignedTeacherId,
      workspaceId,
    });
    if (!teacher) {
      throw new NotFoundError("Assigned teacher not found");
    }
  }

  if (updates.guardianEmail) {
    updates.guardianEmail = updates.guardianEmail.toLowerCase();
  }

  const student = await Student.findOneAndUpdate(
    { _id: id, workspaceId },
    updates,
    { new: true, runValidators: true }
  ).populate("assignedTeacherId", "name email subject");

  if (!student) {
    throw new NotFoundError("Student not found");
  }
  return student;
};

export const deleteStudent = async (workspaceId: string, id: string) => {
  const student = await Student.findOneAndDelete({ _id: id, workspaceId });
  if (!student) {
    throw new NotFoundError("Student not found");
  }
  return student;
};
