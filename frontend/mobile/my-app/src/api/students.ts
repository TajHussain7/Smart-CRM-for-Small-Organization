import { request } from './client';
export const classLevels: Record<string, string> = { 'Play Group': 'PLAY_GROUP', Nursery: 'NURSERY', '1st': 'ONE', '2nd': 'TWO', '3rd': 'THREE', '4th': 'FOUR', '5th': 'FIVE', '6th': 'SIX', '7th': 'SEVEN', '8th': 'EIGHT', '9th': 'NINE', '10th': 'TEN' };
export const studentGrades = Object.keys(classLevels);
export function studentClassLevel(grade: string) {
  if (!classLevels[grade]) throw new Error('This class is not supported by the backend. Select a supported class.');
  return classLevels[grade];
}
export type StudentRecord = { _id: string; studentId: string; name: string; grade: string; classLevel: string; section: string; guardianName: string; guardianPhone: string; guardianEmail?: string; monthlyFee: number; feeStatus: string; notes?: string; admissionDate?: string };
export type StudentInput = Omit<StudentRecord, '_id' | 'feeStatus'>;
export const listStudents = () => request<StudentRecord[]>('/school/students');
export const getStudent = (id: string) => request<StudentRecord>('/school/students/' + encodeURIComponent(id));
export const createStudent = (input: StudentInput) => request<StudentRecord>('/school/students', { method: 'POST', body: JSON.stringify(input) });
export const editStudent = (id: string, input: Partial<StudentInput>) => request<StudentRecord>('/school/students/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(input) });
export const deleteStudent = (id: string) => request<StudentRecord>('/school/students/' + encodeURIComponent(id), { method: 'DELETE' });
