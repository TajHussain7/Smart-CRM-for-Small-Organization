import { useSyncExternalStore } from 'react';
import type { StudentRecord } from '@/api/students';
import { onSessionChange } from '@/api/client';
export type Student = StudentRecord & { id: string; status: string; tone: string };
let students: Student[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const getSnapshot = () => students;
const emit = () => listeners.forEach(listener => listener());
const normalize = (student: StudentRecord): Student => ({ ...student, id: student.studentId, status: student.feeStatus, tone: 'slate' });
export function useStudents() { return useSyncExternalStore(subscribe, getSnapshot, getSnapshot); }
export function setStudents(records: StudentRecord[]) { students = records.map(normalize); emit(); }
export function addStudent(record: StudentRecord) { const student = normalize(record); students = [student, ...students.filter(item => item._id !== student._id)]; emit(); return true; }
export const getStudent = (id: string) => students.find(student => student.id === id || student._id === id);
export function updateStudent(id: string, fields: Partial<StudentRecord>) { const student = getStudent(id); if (!student) return false; addStudent({ ...student, ...fields }); return true; }
export function removeStudent(id: string) { students = students.filter(student => student.id !== id && student._id !== id); emit(); }
onSessionChange(() => setStudents([]));
