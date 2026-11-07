import { useSyncExternalStore } from 'react'
import initialStudents from './students-data.json'

let students = initialStudents
const listeners = new Set()
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
const getSnapshot = () => students

export function useStudents() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
export function addStudent(student) {
  if (students.some(item => item.id.toLowerCase() === student.id.toLowerCase())) return false
  students = [...students, { ...student, tone: 'slate' }]
  listeners.forEach(listener => listener())
  return true
}

export const getStudent = id => students.find(student => student.id === id)
export function updateStudent(id, fields) {
  if (!getStudent(id)) return false
  students = students.map(student => student.id === id ? { ...student, ...fields, id } : student)
  listeners.forEach(listener => listener())
  return true
}
