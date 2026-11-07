import { Student } from "./student.model";
import { User } from "../../users/user.model";
import { NotFoundError } from "../../../common/errors";

interface CreateStudentInput {
  workspaceId: string;
  name: string;
  guardianName: string;
  guardianPhone: string;
  className: string;
  monthlyFee: number;
  assignedTeacherId?: string;
  notes?: string;
}

export const createStudent = async (input: CreateStudentInput) => {
  if (input.assignedTeacherId) {
    const teacher = await User.findOne({ _id: input.assignedTeacherId, workspaceId: input.workspaceId });
    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }
  }

  return Student.create(input);
};

export const getStudents = async (workspaceId: string) => {
  return Student.find({ workspaceId }).populate("assignedTeacherId", "name email").sort({ createdAt: -1 });
};

export const getStudentById = async (workspaceId: string, studentId: string) => {
  const student = await Student.findOne({ _id: studentId, workspaceId }).populate(
    "assignedTeacherId",
    "name email"
  );
  if (!student) {
    throw new NotFoundError("Student not found");
  }
  return student;
};