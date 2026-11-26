import { editStudent, studentClassLevel } from '@/api/students';
import { useStudents, getStudent, addStudent } from './students-store';
import { readStudentNotes, writeStudentNotes } from './student-notes';
export type ProfileFields = { name: string; grade: string; section: string; monthlyFee: string; address: string; guardian: string; phone: string; email: string };
export function getProfileSnapshot(id: string) {
  const student = getStudent(id);
  return student ? { student: { ...student, ...readStudentNotes(student.notes), guardian: student.guardianName, phone: student.guardianPhone, email: student.guardianEmail || '' } } : null;
}
export function useProfile(id: string) { useStudents(); return getProfileSnapshot(id); }
export async function updateProfile(id: string, fields: ProfileFields) {
  const student = getStudent(id);
  if (!student) throw new Error('Student not found.');
  if (fields.name.length < 2 || fields.guardian.length < 2 || fields.phone.length < 10) throw new Error('Enter student and guardian names (2+ characters) and a guardian phone (10+ characters).');
  if (!fields.monthlyFee || !Number.isFinite(Number(fields.monthlyFee)) || Number(fields.monthlyFee) < 0) throw new Error('Enter a valid monthly fee.');
  if (student.guardianEmail && !fields.email) throw new Error('The backend does not support clearing a saved guardian email. Enter an email address.');
  const record = await editStudent(student._id, { name: fields.name, grade: fields.grade, classLevel: studentClassLevel(fields.grade), section: fields.section,
    monthlyFee: Number(fields.monthlyFee), guardianName: fields.guardian, guardianPhone: fields.phone, guardianEmail: fields.email || undefined,
    notes: writeStudentNotes({ ...readStudentNotes(student.notes), address: fields.address }),
  });
  addStudent(record);
  return record;
}
