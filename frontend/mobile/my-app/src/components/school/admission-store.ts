import { createStudent, studentClassLevel } from '@/api/students';
import { addStudent } from './students-store';
import { writeStudentNotes } from './student-notes';
export type Admission = { id?: string; name: string; grade: string; section?: string; monthlyFee: string; birthDate: string; gender: string; emergencyPhone: string; bloodGroup: string; guardian: string; email: string; phone: string; address: string };
export async function admitStudent(input: Admission) {
  const value = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value?.trim()])) as Admission;
  if (value.name.length < 2 || value.guardian.length < 2) throw new Error('Student and guardian names must contain at least 2 characters.');
  if (value.phone.length < 10) throw new Error('Enter a guardian phone number with at least 10 characters.');
  if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) throw new Error('Enter a valid guardian email.');
  if (!value.monthlyFee || !Number.isFinite(Number(value.monthlyFee)) || Number(value.monthlyFee) < 0) throw new Error('Enter a valid monthly fee (zero is allowed).');
  if (!value.section) throw new Error('Select a section.');
  const record = await createStudent({
    studentId: value.id || `S${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`.toUpperCase(),
    name: value.name, grade: value.grade, classLevel: studentClassLevel(value.grade),
    section: (value.section === 'B' || value.section.startsWith('Section B')) ? 'B' : 'A', guardianName: value.guardian, guardianPhone: value.phone,
    guardianEmail: value.email || undefined, monthlyFee: Number(value.monthlyFee),
    notes: writeStudentNotes({ address: value.address, birthDate: value.birthDate, gender: value.gender, bloodGroup: value.bloodGroup, emergencyPhone: value.emergencyPhone }),
  });
  addStudent(record);
  return record;
}
