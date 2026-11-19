import { useStudents, getStudent, updateStudent } from './students-store';
export type ProfileFields = { name: string; grade: string; address: string; guardian: string; phone: string; email: string };
const details = new Map<string, Partial<ProfileFields>>();
export function getProfileSnapshot(id: string) {
  const student = getStudent(id);
  return student ? { student: { address: '', guardian: '', phone: '', email: '', ...details.get(id), ...student } } : null;
}
export function useProfile(id: string) { useStudents(); return getProfileSnapshot(id); }
export function updateProfile(id: string, fields: ProfileFields) {
  if (!getStudent(id) || !fields.name.trim() || !fields.grade.trim()) return false;
  details.set(id, fields);
  return updateStudent(id, { name: fields.name.trim(), grade: fields.grade.trim() });
}
