import { useSyncExternalStore } from 'react'
let students = []
const listeners = new Set()
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
const getSnapshot = () => students
const emit = () => listeners.forEach(listener => listener())
const normalize = student => ({ ...student, id: student.studentId || student.id || student._id, status: student.feeStatus || student.status || 'Pending', tone: 'slate' })
export function useStudents() { return useSyncExternalStore(subscribe, getSnapshot, getSnapshot) }
export function setStudents(list = []) { students = list.map(normalize); emit() }
export function addStudent(student) {
  const item = normalize(student)
  students = [item, ...students.filter(existing => existing.id !== item.id)]
  emit(); return true
}
export const getStudent = id => students.find(student => student.id === id || student._id === id)
export function updateStudent(id, fields) {
  if (!getStudent(id)) return false
  students = students.map(student => student.id === id || student._id === id ? normalize({ ...student, ...fields }) : student)
  emit(); return true
}
export function removeStudent(id) { students = students.filter(student => student.id !== id && student._id !== id); emit() }
