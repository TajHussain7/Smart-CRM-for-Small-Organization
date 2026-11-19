import { useSyncExternalStore } from 'react';
import initialStudents from './students-data.json';

export type Student = { id: string; name: string; grade: string; status: string; tone: string };
let students: Student[] = initialStudents;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const getSnapshot = () => students;

export function useStudents() { return useSyncExternalStore(subscribe, getSnapshot, getSnapshot); }
export function addStudent(student: Omit<Student, 'tone'>) {
  if (students.some(item => item.id.toLowerCase() === student.id.toLowerCase())) return false;
  students = [...students, { ...student, tone: 'slate' }];
  listeners.forEach(listener => listener());
  return true;
}

export const getStudent = (id: string) => students.find(student => student.id === id);
export function updateStudent(id: string, fields: Partial<Omit<Student, 'id'>>) {
  if (!getStudent(id)) return false;
  students = students.map(student => student.id === id ? { ...student, ...fields, id } : student);
  listeners.forEach(listener => listener());
  return true;
}
